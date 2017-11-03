import React, { Component } from 'react'
import VotingContract from '../build/contracts/Voting.json'
import getWeb3 from './utils/getWeb3'
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import {Card, CardBody, CardText, CardTitle,CardSubtitle, Col, Container, Input, Row} from 'reactstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/fontawesome-free-solid';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: null,
      fromAccount : null,
      candidates:{},
      votingContract:null,
      voteFor : null
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onCandidateChange = this.onCandidateChange.bind(this);
  }

  componentWillMount() {
   getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch((error) => {
      console.log('Error finding web3.' + error)
    })
  }

  instantiateContract() {
    /*
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */
    const that = this;
    
    const contract = require('truffle-contract')
    const votingContract = contract(VotingContract)
    votingContract.setProvider(this.state.web3.currentProvider)
  
    // Get accounts - set the fromAccount to the first one
    this.state.web3.eth.getAccounts((error, accounts) => 
    {
      that.setState({
        fromAccount : accounts[0],
        votingContract
      });
    });

    votingContract.deployed().then((instance) => {
        if(that.state.fromAccount === null) {
          console.log("FromAccount is null exiting");
          return;
        }

        // 1. get number of candidates
        instance.noOfCandidates.call(null, {from:that.state.fromAccount})
        .then(noOfCandidates => {
          for(var i = 0; i < noOfCandidates; i++){
            
            //2. get candidate Names from contract    
            instance.candidateList.call(i, {from:that.state.fromAccount})
            .then(candidateByte => {
            const candidateName = that.state.web3.toAscii(candidateByte);

            //3. get total number of votes
            instance.totalVotesFor.call(candidateName,{from:that.state.fromAccount})
            .then(result => {
              that.setState({
                candidates:{
                  ...that.state.candidates,
                  [candidateName] : result.c[0]
                }
               });
              });
            });
          }
        });
    });

    //set up listener to the event
    votingContract.deployed().then(instance => {
      var that = this;
      const vote = instance.Vote({fromBlock:"latest"});
      vote.watch((error,result) =>{

        // refresh the state with latest total count
        const candidate = that.state.web3.toAscii(result.args.candidate);
        that.setState({
          candidates:{
            ...this.state.candidates,
            [candidate]:result.args.totalVotes.c[0]
          }       
        });
        console.log(result);
      })

    })
  }

  handleSubmit(event){
    const that = this;
    event.preventDefault();
    
    //write to blockchain
    this.state.votingContract.deployed()
    .then(instance => {
      instance.voteForCandidate(that.state.voteFor, {from:that.state.fromAccount})
      .then(txnId =>{
        console.log(txnId);
      });
    })

  }

  onCandidateChange(event){
    this.setState({voteFor:event.target.value});
    this.handleSubmit(event);

  }
  // Add duration and reset voting after a particular number of blocks have been mined
  render() {
    return (
      <div className="App">
      <Container>
        <Row className="justify-content-sm-center">
          <h1 className="display-4 pb-4"> Blockchain Voting System </h1>
        </Row>
        <Row className="justify-content-sm-center">
          {
            Object.keys(this.state.candidates).map(candidateKey => {
            return (
              <Col sm={{ size: 3}} className="justify-content-sm-center" key={candidateKey}>
                  <Card  body className="text-center" >
                    <CardBody  >
                      <FontAwesomeIcon icon={faUser} size="5x" /> 
                      <CardTitle> {candidateKey} </CardTitle>
                      <CardSubtitle> Party </CardSubtitle>
                      <CardText> Total: {this.state.candidates[candidateKey]}</CardText>
                      <Input type="button" className="btn btn-primary" onClick={this.onCandidateChange} value={ candidateKey}> 
                      </Input>
                    </CardBody>
                  </Card>
              </Col>
              );
            })
          }  
        </Row>
        {/* <Row>
          <Col sm={{ size: 10, offset: 2 }}>
            <Button color="primary" onClick={this.handleSubmit}> Vote </Button>
          </Col>
        </Row> */}
        </Container>
      </div>        
    );
  }
}

export default App
