pragma solidity ^0.4.11;
 
contract Voting {
    
    address alarm; //set by another mechanism
    uint targetBlock;
    
    // voters address to votes recieved
    mapping(bytes32 => uint8) public votesReceived;
    
    bytes32[] public candidateList;
    event Vote(bytes32 candidate, uint8 totalVotes);
    event WinnerAnnouncement(bytes32 winner, uint8 votes);
    
    function Voting(bytes32[] candidateNames) {
        candidateList = candidateNames;
        beginVoting(); // set the clock when contract is deployed.
    }
    
    function totalVotesFor(bytes32 candidate) returns(uint8) {
        if (validCandidate(candidate) == false) 
            revert();

        return votesReceived[candidate];
    }
    
    function voteForCandidate(bytes32 candidate) {
        if (validCandidate(candidate) == false) 
        revert();
        
        votesReceived[candidate] += 1;
        uint8 votes = votesReceived[candidate];
        Vote(candidate,votes);
    }
    
    function validCandidate(bytes32 candidate) returns (bool) {
        for (uint i = 0; i < candidateList.length ; i++) {
            if (candidateList[i] == candidate) {
                return true;
            }
        }
        return false;
    }  
    
    function addCandidate(bytes32 candidateName) {
        candidateList.push(candidateName);
    }

    function noOfCandidates() returns(uint) {
        return candidateList.length;
    }  
    
    function beginVoting() {
        // start the clock
        
        //TODO, cannot vote until clock is started
        bytes4 sig = bytes4(sha3("pickWinner()"));
        
        bytes32 dataHash = sha3();
        //Approximately 24 hours from now
        targetBlock = block.number + 5760;
        
        //grace period
        uint8 gracePeriod = 255;
        
        //schedule the call to pickWinner using the criteria
        alarm.call(0x1145a20f, address(this), sig,dataHash,targetBlock,gracePeriod );
    
    }
    
    function pickWinner() public {
        uint8 highestVote = 0;
        bytes32  currentWinner = "";
        for (uint i = 0; i < candidateList.length; i++) {
            uint8 votes = votesReceived[candidateList[i]]; 
            if (votes > highestVote) {
                highestVote = votes;
                currentWinner = candidateList[i];
            }
        }
        
        if (currentWinner != "" ) {
            //Announce winner
            WinnerAnnouncement(currentWinner,highestVote);
        }
    }
    
    function getTimerCountdown() public returns(uint256) {
        
       return targetBlock - block.number;
    }
} 