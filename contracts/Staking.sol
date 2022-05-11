// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;


import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./UniFiToken.sol";

contract Staking {

  struct Stake {
    address tokenAddress;
    uint256 amount;
    uint256 sinceTimestamp;
    uint256 untilTimestamp;
  }

  // example: with ETH/USD chainlink price feed, tokenA is ETH and tokenB is USD
  struct PriceOracle {
    address aggregatorAddress;
    string tokenA;
    string tokenB;
  }

  uint256 constant public distributionPerSecond = 10;

  UniFiToken internal _unifiToken;  

  // User address => Stake struct array
  mapping(address => Stake[]) public tokenStakes; // user -> stakes

  /// We need to add price oracles that all have the same tokenB (ETHUSD, LINKUSD...)

  // the pair "ETHUSD" => PriceOracle struct
  mapping(string => PriceOracle) public priceOracles;
  // tokenA address => the pair "ETHUSD" for example
  mapping(address => string) public priceOracleKeys;

  /// Events
  
  event Staked(address sender, uint256 amount, uint256 stakeId);
  event Unstaked(address sender, uint256 amount);
  event Claimed(address sender, uint256 amount);

  /// Constructor

  constructor(address ethUsdPriceFeedAddress_)  {
    priceOracles["ETHUSD"] = PriceOracle(ethUsdPriceFeedAddress_, "ETH", "USD");
    priceOracleKeys[ethUsdPriceFeedAddress_] = "ETHUSD";
    // Creates the token with 0 supply
    _unifiToken = new UniFiToken(0);
  }

  /// Public methods

  // Return the current value of the user stake
  function getStakeValue(address user_, uint256 stakeId_) public view returns (uint) {
    Stake[] storage userTokenStakes = tokenStakes[user_];
    require(userTokenStakes.length > stakeId_, "getStakeValue incorrect stake id");

    Stake storage userTokenStake = userTokenStakes[stakeId_];
    string storage pair = priceOracleKeys[userTokenStake.tokenAddress];
    return userTokenStake.amount * this.getOraclePrice(pair);
  }

  // Returns the latest price of the chainlink oracle for a given pair
  // If no oracle found, return ETHUSD price
  function getOraclePrice(string memory pair_) public view returns (uint) {
    //require(priceOracles[pair_].aggregatorAddress != address(0), "price oracle not found");
    AggregatorV3Interface oracle;
    if(priceOracles[pair_].aggregatorAddress == address(0)) {
      oracle = AggregatorV3Interface(priceOracles["ETHUSD"].aggregatorAddress);
    } else {
      oracle = AggregatorV3Interface(priceOracles[pair_].aggregatorAddress);
    }
    (
      /*uint80 roundID*/,
      int price,
      /*uint startedAt*/,
      /*uint timeStamp*/,
      /*uint80 answeredInRound*/
    ) = oracle.latestRoundData();
    return uint(price);
  }

  // Send claimable rewards of user_ for its Stake defined by stakeId_
  // This function is only callable by the contract as we don't want anyone to 
  // be able to claim rewards for someone else but still public so that we can 
  // use it in claim and unstake functions 
  function _claim(address user_, uint256 stakeId_) public {
    require(msg.sender == address(this), "this method can only be called by the contract");
    Stake[] storage userTokenStakes = tokenStakes[user_];
    require(userTokenStakes.length > stakeId_, "_claim incorrect stake id");
    require(userTokenStakes[stakeId_].untilTimestamp == 0, '_claim: Already unstaked');

    uint256 rewardsAmount = this.getClaimable(user_, stakeId_);
    // set new stake timestamp
    userTokenStakes[stakeId_].sinceTimestamp = block.timestamp;
    // send protocol token to user
    _unifiToken.mintTo(user_, rewardsAmount);
    // event
    emit Claimed(user_, rewardsAmount);
  }
  
  /// External calls

  // stake an amount of token and returns the stake id
  function stake(address token_, uint256 amount_) external returns (uint256) {
    require(amount_ > 0, "Cannot stake 0 amount");

    Stake[] storage userTokenStakes = tokenStakes[msg.sender];

    userTokenStakes.push(Stake(token_, amount_, block.timestamp, 0));

    ERC20(token_).transferFrom(msg.sender, address(this), amount_);

    emit Staked(msg.sender, amount_, userTokenStakes.length - 1);
    return userTokenStakes.length - 1;
  }

  // Claim sender rewards for a Stake
  function claim(uint256 stakeId_) external {    
    this._claim(msg.sender, stakeId_);
  }

  function unstake(uint256 stakeId_) external {
    Stake[] storage userTokenStakes = tokenStakes[msg.sender];
    require(userTokenStakes.length > stakeId_, "unstake: incorrect stake id");
    // save how much we need to send
    uint amount = userTokenStakes[stakeId_].amount;

    require(amount > 0, "Stake not found");
    require(userTokenStakes[stakeId_].untilTimestamp == 0, 'unstake: Already unstaked');
    
    // send rewards to user
    this._claim(msg.sender, stakeId_);
    // set the timestamp user unstaked
    userTokenStakes[stakeId_].untilTimestamp = block.timestamp;
    // reset balance now
    userTokenStakes[stakeId_].amount = 0;
    // get the token we want to unstake
    address token = userTokenStakes[stakeId_].tokenAddress;
    // allow token to be sent
    ERC20(token).approve(msg.sender, amount);
    // send unstaked token to user
    ERC20(token).transferFrom(address(this), msg.sender, amount);
    // event
    emit Unstaked(msg.sender, amount);
  }

  // get the amount of claimable protocol token
  function getClaimable(address user_, uint256 stakeId_) public view returns(uint256) {
    Stake[] storage userTokenStakes = tokenStakes[user_];
    require(userTokenStakes.length > stakeId_, "getClaimable incorrect stake id");
    require(userTokenStakes[stakeId_].untilTimestamp == 0, 'Already unstaked');
    
    // how much rewards for the staked duration
    uint256 rewardsForDuration = (block.timestamp - userTokenStakes[stakeId_].sinceTimestamp) * distributionPerSecond;
    // proportionnal to stake value
    return rewardsForDuration * this.getStakeValue(user_, stakeId_);
  }

  /// External views

  // Return the protocol token address
  function getProtocolTokenAddress() external view returns (address) {
    return address(_unifiToken);
  }

  // Return the array of Stake struct for a user
  function getUserStakes(address user_) external view returns (Stake[] memory) {
    return tokenStakes[user_];
  }

  // Return the Stake struct for a user stakeId
  function getUserStake(address user_, uint256 stakeId_) external view returns (Stake memory) {
    return tokenStakes[user_][stakeId_];
  }
}