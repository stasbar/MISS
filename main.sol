pragma solidity >=0.4.22 <0.6.0;

contract MyContract {
    bytes32[] public tokens;
    bytes32[] public verified;
    bytes32 public previousSpread;
    uint public expirationTime;
    uint public lastTimeAdded;
    // each new token has short living peroid, but it can be expanded when new tokens are generated
    mapping(bytes32 => uint) tokensExpirationTime;

    
    constructor() public {
        lastTimeAdded = 0;
        expirationTime = now + 1 minutes;
    }
    
    function spread() public returns(bytes32){
        require((now - lastTimeAdded) > 1 minutes);
        bytes memory combinedBytes = abi.encode(previousSpread, blockhash(block.number));
        bytes32 hashBytes = keccak256(combinedBytes);
        
        // update states
        lastTimeAdded = now;
        
        previousSpread = hashBytes;
        
        
        tokensExpirationTime[hashBytes] = now + 1 minutes;
        // TODO backpropagation time extensions
        expirationTime += 1 minutes; // Then this would not be necessary
        
        // add to lists
        tokens.push(hashBytes);
        
        return hashBytes;
    }
    
    function isTokenValid(bytes32 token) public view returns(bool) {
        return tokensExpirationTime[token] >= now;
    }
    
    function countSpreads() public view returns(uint) {
        return tokens.length;
    }
}
