// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

interface ICrowdFundingFactory {
    function distributeTokens(address _to, uint256 _amount) external;
}

contract CrowdFundingCampaign is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    address public factoryAddress;
    // state of Compaign
    enum State {
        Funding,
        Successful,
        Failed,
        Withdrawn
    }

    // Contribution Record Structure
    struct ContributionRecord {
        address contributor;
        uint256 amount;
        uint256 timestamp;
    }

    // Data structure of Compaign
    struct Compaign {
        address creator;
        string title;
        string description;
        uint256 goal;
        uint256 deadline;
        uint256 totalRaised;
        State state;
        mapping(address => uint256) contribution;
    }

    // Data state
    Compaign compaign;
    bool isWithdrawn = false;
    uint256 public rewardRate;
    ContributionRecord[] public recentContributions;
    uint256 public constant MAX_RECENT_CONTRIBUTIONS = 20;

    function initialize(
        address creator,
        string memory title,
        string memory description,
        uint256 goal,
        uint256 durationSeconds,
        uint256 _tokensPerEth,
        address _factoryAddress
    ) public initializer {
        require(creator != address(0), "Invalid creator address");
        require(_factoryAddress != address(0), "Invalid factory address");

        __Ownable_init(creator);
        __ReentrancyGuard_init();

        compaign.creator = creator;
        compaign.title = title;
        compaign.description = description;
        compaign.goal = goal;
        compaign.deadline = block.timestamp + durationSeconds;
        compaign.totalRaised = 0;
        compaign.state = State.Funding;
        rewardRate = _tokensPerEth;
        factoryAddress = _factoryAddress;

        emit CampaignCreated(compaign.creator, title, goal, compaign.deadline);
    }

    // Events
    event CampaignCreated(
        address indexed creator,
        string title,
        uint256 goal,
        uint256 deadline
    );
    event Contributed(
        address indexed contributor,
        uint256 amount,
        uint256 newTotal,
        uint256 tokenReward
    );
    event Withdrawn(address indexed creator, uint256 amount);
    event Refunded(address indexed contributor, uint256 amount);
    event CampaignFinalized(State finalState, uint256 totalRaised);

    // Read only Functions
    function getCompaignDetails()
        external
        view
        returns (
            address creator,
            string memory title,
            string memory description,
            uint256 goal,
            uint256 deadline,
            uint256 totalRaised,
            State state,
            bool withdrawn,
            uint256 rewardPerEth
        )
    {
        creator = compaign.creator;
        title = compaign.title;
        description = compaign.description;
        goal = compaign.goal;
        deadline = compaign.deadline;
        totalRaised = compaign.totalRaised;
        state = compaign.state;
        withdrawn = isWithdrawn;
        rewardPerEth = rewardRate;
    }

    // get contribution of an address
    function getContributionOf(
        address contributor
    ) external view returns (uint256) {
        return compaign.contribution[contributor];
    }

    // Get recent contributions (returns array of contribution records)
    function getRecentContributions()
        external
        view
        returns (ContributionRecord[] memory)
    {
        return recentContributions;
    }

    // Get total number of contributors
    function getContributorsCount() external view returns (uint256) {
        return recentContributions.length;
    }

    // Contribute to campaign
    function contribute() external payable nonReentrant {
        require(
            msg.sender != compaign.creator,
            "creator has no rights to contribute in compaign"
        );
        require(
            compaign.state == State.Funding,
            "compaign is not under the state FUNDING"
        );
        require(block.timestamp < compaign.deadline, "deadline missed!");
        require(msg.value > 0, "Amount of contibution is zero!");
        compaign.contribution[msg.sender] += msg.value;
        compaign.totalRaised += msg.value;

        // Record contribution in recent contributions array
        _recordContribution(msg.sender, msg.value);

        // Token reward calculation
        uint256 tokenReward = (msg.value * rewardRate) / 1 ether;

        // Distribute reward tokens via factory
        ICrowdFundingFactory(factoryAddress).distributeTokens(
            msg.sender,
            tokenReward
        );

        // Check if goal reached
        if (compaign.totalRaised >= compaign.goal) {
            compaign.state = State.Successful;
        }

        emit Contributed(
            msg.sender,
            msg.value,
            compaign.totalRaised,
            tokenReward
        );
    }

    // Finalize campaign after deadline
    function finalize() external {
        require(
            block.timestamp >= compaign.deadline,
            "Campaign still in progress"
        );
        require(compaign.state == State.Funding, "Campaign already finalized");

        if (compaign.totalRaised >= compaign.goal) {
            compaign.state = State.Successful;
        } else {
            compaign.state = State.Failed;
        }

        emit CampaignFinalized(compaign.state, compaign.totalRaised);
    }

    // Withdraw funds (creator only)
    function withdraw() external nonReentrant onlyOwner {
        require(compaign.state == State.Successful, "Campaign not successful");
        require(!isWithdrawn, "Funds already withdrawn");
        require(compaign.totalRaised > 0, "No funds to withdraw");

        uint256 amount = compaign.totalRaised;
        isWithdrawn = true;
        compaign.state = State.Withdrawn;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    // Claim refund (failed campaigns only)
    function refund() external nonReentrant {
        require(compaign.state == State.Failed, "Campaign not failed");

        uint256 amount = compaign.contribution[msg.sender];
        require(amount > 0, "No contribution found");

        // Clear contribution before transfer (CEI pattern)
        compaign.contribution[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");

        emit Refunded(msg.sender, amount);
    }

    // Internal function to record contributions
    function _recordContribution(address contributor, uint256 amount) private {
        ContributionRecord memory newContribution = ContributionRecord({
            contributor: contributor,
            amount: amount,
            timestamp: block.timestamp
        });

        // If we've reached the max limit, remove the oldest contribution
        if (recentContributions.length >= MAX_RECENT_CONTRIBUTIONS) {
            // Shift array left to remove oldest (first) element
            for (uint256 i = 0; i < recentContributions.length - 1; i++) {
                recentContributions[i] = recentContributions[i + 1];
            }
            recentContributions.pop();
        }

        recentContributions.push(newContribution);
    }
}
