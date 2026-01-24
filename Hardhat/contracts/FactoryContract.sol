// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "./MasterContract.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CampaignProxyFactory {
    address public immutable implementation;
    address public adminAddress;
    IERC20 public token;
    address[] private campaigns; // List of deployed Campaign contracts
    mapping(address => address[]) campaignsOf;
    mapping(address => bool) public isClone;

    constructor(address _implementation, address _tokenAddress) {
        implementation = _implementation;
        token = IERC20(_tokenAddress);
        adminAddress = msg.sender;
    }

    event CampaignCreated(
        address indexed compaign,
        address indexed creator,
        uint256 goal,
        uint256 deadline
    );

    // create compaigns
    function createClone(
        uint256 goal,
        uint256 durationSeconds,
        uint256 tokensPerEth
    ) public {
        address newClone = Clones.clone(implementation);
        CrowdFundingMaster(newClone).initialize(
            msg.sender,
            goal,
            durationSeconds,
            tokensPerEth,
            address(this)
        );
        campaigns.push(address(newClone)); // add into List of deployed contracts
        campaignsOf[msg.sender].push(address(newClone)); // add into mapping of ownership
        isClone[address(newClone)] = true;
        emit CampaignCreated(
            address(newClone),
            msg.sender,
            goal,
            block.timestamp + durationSeconds
        ); // emit the event
    }

    function getAllCampaigns() public view returns (address[] memory) {
        return campaigns;
    }

    function getCampaignsOf(
        address creator
    ) public view returns (address[] memory) {
        return campaignsOf[creator];
    }

    function campaignsCount() public view returns (uint256) {
        return campaigns.length;
    }

    function getRecent(uint256 n) public view returns (address[] memory) {
        uint arrayLength = campaigns.length;
        uint startIndex = arrayLength - n;
        address[] memory result = new address[](n);
        uint count = 0;
        for (uint i = startIndex; i < arrayLength; i++) {
            result[count] = campaigns[i];
            count++;
        }
        return result;
    }
    function distributeTokens(address _to, uint256 _amount) public {
        require(isClone[msg.sender], "Only official clones can distribute");
        token.transferFrom(adminAddress, _to, _amount);
    }
}
