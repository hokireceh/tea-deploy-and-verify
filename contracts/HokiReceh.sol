// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HokiReceh {
    string private greeting;
    address public owner;

    constructor() {
        greeting = "Wassup from HokiReceh!";
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "[ACCESS DENIED] Kamu bukan owner, bro!");
        _;
    }

    function setGreeting(string memory _greeting) public onlyOwner {
        greeting = _greeting;
    }

    function greet() public view returns (string memory) {
        return string(
            abi.encodePacked(
                unicode"👋 ", 
                greeting,
                " - Signed by HokiReceh"
            )
        );
    }

    function whoami() public pure returns (string memory) {
        return unicode"💎 This is the legendary smart contract by HokiReceh 💎";
    }
}
