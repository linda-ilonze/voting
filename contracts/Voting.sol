pragma solidity ^0.4.11;
 
contract Voting {
    // voters address to votes recieved
    mapping(bytes32 => uint8) public votesReceived;
    
    bytes32[] public candidateList;
    event Vote(bytes32 candidate, uint8 totalVotes);
    
    function Voting(bytes32[] candidateNames) {
        candidateList = candidateNames;
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
} 