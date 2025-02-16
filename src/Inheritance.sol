// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LegacyWallet {
    struct Inheritance {
        address heir;
        uint256 amount;
        string heirName;
        uint256 lastActivity;
        bool isActive;
    }

    address public owner;
    uint256 public constant INHERITANCE_PERIOD = 365 days;
    mapping(address => Inheritance) public inheritances;

    event InheritanceSet(address indexed heir, uint256 amount, string heirName);
    event InheritanceClaimed(address indexed heir, uint256 amount);
    event ActivityUpdated(address indexed owner, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
        updateActivity();
    }

    function setInheritance(address _heir, uint256 _amount, string memory _heirName) external onlyOwner {
        require(_heir != address(0), "Invalid heir address");
        require(_amount > 0, "Amount must be greater than 0");
        require(bytes(_heirName).length > 0, "Heir name cannot be empty");
        require(_amount <= address(owner).balance, "Amount exceeds owner balance");
        
        inheritances[_heir] = Inheritance({
            heir: _heir,
            amount: _amount,
            heirName: _heirName,
            lastActivity: block.timestamp,
            isActive: true
        });

        emit InheritanceSet(_heir, _amount, _heirName);
    }

    function updateActivity() public {
        require(msg.sender == owner, "Only owner can update activity");
        inheritances[owner].lastActivity = block.timestamp;
        emit ActivityUpdated(owner, block.timestamp);
    }

    function claimInheritance() external {
        Inheritance storage inheritance = inheritances[msg.sender];
        
        require(inheritance.isActive, "No active inheritance found");
        require(inheritance.heir == msg.sender, "Not authorized to claim");
        require(
            block.timestamp >= inheritance.lastActivity + INHERITANCE_PERIOD,
            "Inheritance period not passed"
        );

        require(address(owner).balance >= inheritance.amount, "Insufficient owner balance");

        uint256 amount = inheritance.amount;
        inheritance.isActive = false;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit InheritanceClaimed(msg.sender, amount);
    }

    function getInheritanceDetails(address _heir) external view returns (
        address heir,
        uint256 amount,
        string memory heirName,
        uint256 lastActivity,
        bool isActive
    ) {
        Inheritance memory inheritance = inheritances[_heir];
        return (
            inheritance.heir,
            inheritance.amount,
            inheritance.heirName,
            inheritance.lastActivity,
            inheritance.isActive
        );
    }

    receive() external payable {}
}