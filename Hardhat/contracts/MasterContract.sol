// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
interface ICampaignProxyFactory {
    function distributeTokens(address _to, uint256 _amount) external;
}
contract CrowdFundingMaster is Initializable, OwnableUpgradeable {
    address public factoryAddress;
    // state of Compaign
    enum State {
        Funding,
        Successful,
        Failed,
        Withdrawn
    }

    // Data structure of Compaign
    struct Compaign {
        address creator;
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

    function initialize(
        address creator,
        uint256 goal,
        uint256 durationSeconds,
        uint256 _tokensPerEth,
        address _factoryAddress
    ) public initializer {
        __Ownable_init(creator);
        compaign.creator = creator;
        compaign.goal = goal;
        compaign.deadline = block.timestamp + durationSeconds;
        compaign.totalRaised = 0;
        compaign.state = State.Funding;
        rewardRate = _tokensPerEth;
        factoryAddress = _factoryAddress;

        emit CampaignCreated(compaign.creator, goal, compaign.deadline);
    }

    // events
    event CampaignCreated(
        address indexed creator,
        uint256 goal,
        uint256 deadline
    ); // when compaign created
    event Contributed(
        address indexed contributor,
        uint256 amount,
        uint256 newTotal
    ); // when someone contribute
    event Withdrawn(address indexed creator, uint256 amount);
    event Refund(address indexed banker, uint256 amount);

    // Read only Functions
    function getCompaignDetails()
        external
        view
        returns (
            address creator,
            uint256 goal,
            uint256 deadline,
            uint256 totalRaised,
            State state,
            bool withdrawn,
            uint256 rewardPerEth
        )
    {
        creator = compaign.creator;
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

    // Helpful getter Functions
    function getCreator() external view returns (address) {
        return compaign.creator;
    }
    function getGoal() external view returns (uint256) {
        return compaign.goal;
    }

    function getDeadline() external view returns (uint256) {
        return compaign.deadline;
    }

    function getTotalRaised() external view returns (uint256) {
        return compaign.totalRaised;
    }
    function getState() external view returns (State) {
        return compaign.state;
    }
    // Campaign status helper functions
    function isSuccessful() external view returns (bool) {
        return compaign.state == State.Successful;
    }
    function isFailed() external view returns (bool) {
        return compaign.state == State.Failed;
    }
    function isActive() external view returns (bool) {
        return
            block.timestamp < compaign.deadline &&
            compaign.state == State.Funding;
    }
    function hasEnded() external view returns (bool) {
        return block.timestamp >= compaign.deadline;
    }

    function getRecommendedAllowance() external view returns (uint256) {
        // Goal in ETH * tokens per ETH
        return (compaign.goal * rewardRate) / 1 ether;
    }

    // Contribute Anyone
    function contribute() public payable {
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

        // token reward calculation
        uint256 tokenReward = ((msg.value * 10 ** 18) * (rewardRate)) / 1 ether;
        // Factory Function call here to distribute Token
        ICampaignProxyFactory(factoryAddress).distributeTokens(
            msg.sender,
            tokenReward
        );
        bool isSuccess = compaign.totalRaised >= compaign.goal;
        if (isSuccess) compaign.state = State.Successful;
        emit Contributed(msg.sender, msg.value, compaign.totalRaised); // mit the event
    }

    // Finalize the state of contract
    function finalize() public {
        require(
            block.timestamp > compaign.deadline,
            "compaign is still in progress!"
        );
        if (compaign.totalRaised >= compaign.goal)
            compaign.state = State.Successful;
        else compaign.state = State.Failed;
    }

    // Withdrawal function
    function withdraw() public payable {
        require(
            msg.sender == compaign.creator,
            "only owner has right to this action!"
        );
        require(
            compaign.state == State.Successful,
            "compaign is not yet successful"
        );
        require(
            compaign.totalRaised > 0 && !isWithdrawn,
            "Withdrawn is not possible!"
        );
        isWithdrawn = true;
        compaign.state = State.Withdrawn;
        (bool success, ) = msg.sender.call{value: compaign.totalRaised}("");
        require(success, "ETH withdrawal failed!");
        emit Withdrawn(msg.sender, compaign.totalRaised);
    }

    // Refund
    function refund() public payable {
        require(compaign.state == State.Failed, "compaign state is not fail");
        require(
            compaign.contribution[msg.sender] > 0,
            "you are not contributor for compaign"
        );

        uint256 amount = compaign.contribution[msg.sender];
        compaign.contribution[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Error occured!");
        emit Refund(msg.sender, amount);
    }
}
