// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./NewMasterContract.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CrowdFundingFactory is Ownable {
    address public immutable implementation;
    IERC20 public token;

    address[] private campaigns;
    mapping(address => address[]) private campaignsOf;
    mapping(address => bool) public isValidCampaign;

    // Constants for validation
    uint256 public constant MIN_DURATION = 1 days;
    uint256 public constant MAX_DURATION = 365 days;
    uint256 public constant MAX_TITLE_LENGTH = 100;
    uint256 public constant MAX_DESCRIPTION_LENGTH = 1000;

    constructor(
        address _implementation,
        address _tokenAddress
    ) Ownable(msg.sender) {
        require(
            _implementation != address(0),
            "Invalid implementation address"
        );
        require(_tokenAddress != address(0), "Invalid token address");

        implementation = _implementation;
        token = IERC20(_tokenAddress);
    }

    // Events
    event CampaignCreated(
        address indexed campaignAddress,
        address indexed creator,
        string title,
        uint256 goal,
        uint256 deadline,
        uint256 tokensPerEth
    );
    event TokenUpdated(address indexed oldToken, address indexed newToken);

    function createCampaign(
        string memory title,
        string memory description,
        uint256 goal,
        uint256 durationSeconds,
        uint256 tokensPerEth
    ) external returns (address campaignAddress) {
        // Validate string inputs
        require(bytes(title).length > 0, "Title cannot be empty");
        require(
            bytes(title).length <= MAX_TITLE_LENGTH,
            "Title exceeds max length"
        );
        require(bytes(description).length > 0, "Description cannot be empty");
        require(
            bytes(description).length <= MAX_DESCRIPTION_LENGTH,
            "Description exceeds max length"
        );

        // Validate numeric inputs
        require(goal > 0, "Goal must be greater than 0");
        require(
            durationSeconds >= MIN_DURATION,
            "Duration too short (min 1 day)"
        );
        require(
            durationSeconds <= MAX_DURATION,
            "Duration too long (max 365 days)"
        );
        require(tokensPerEth > 0, "Tokens per ETH must be greater than 0");

        // Clone the implementation contract
        campaignAddress = Clones.clone(implementation);

        // Initialize the new campaign
        CrowdFundingCampaign(campaignAddress).initialize(
            msg.sender,
            title,
            description,
            goal,
            durationSeconds,
            tokensPerEth,
            address(this)
        );

        // Update state
        campaigns.push(campaignAddress);
        campaignsOf[msg.sender].push(campaignAddress);
        isValidCampaign[campaignAddress] = true;

        emit CampaignCreated(
            campaignAddress,
            msg.sender,
            title,
            goal,
            block.timestamp + durationSeconds,
            tokensPerEth
        );

        return campaignAddress;
    }

    function getAllCampaigns() external view returns (address[] memory) {
        return campaigns;
    }

    function getCampaignsOf(
        address creator
    ) external view returns (address[] memory) {
        return campaignsOf[creator];
    }

    function getCampaignsCount() external view returns (uint256) {
        return campaigns.length;
    }

    function getRecentCampaigns(
        uint256 n
    ) external view returns (address[] memory) {
        require(n > 0, "Must request at least 1 campaign");

        uint256 totalCampaigns = campaigns.length;
        if (totalCampaigns == 0) {
            return new address[](0);
        }

        uint256 resultSize = n > totalCampaigns ? totalCampaigns : n;
        uint256 startIndex = totalCampaigns - resultSize;

        address[] memory result = new address[](resultSize);
        for (uint256 i = 0; i < resultSize; i++) {
            result[i] = campaigns[startIndex + i];
        }

        return result;
    }

    function distributeTokens(address _to, uint256 _amount) external {
        require(
            isValidCampaign[msg.sender],
            "Only valid campaigns can distribute tokens"
        );
        require(_to != address(0), "Invalid recipient address");
        require(_amount > 0, "Amount must be greater than 0");

        require(
            token.transferFrom(owner(), _to, _amount),
            "Token transfer failed"
        );
    }

    function updateToken(address _newToken) external onlyOwner {
        require(_newToken != address(0), "Invalid token address");

        address oldToken = address(token);
        token = IERC20(_newToken);

        emit TokenUpdated(oldToken, _newToken);
    }
}
