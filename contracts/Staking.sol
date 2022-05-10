// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;


import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Token.sol";

contract Staking {

  struct Stake {
    uint256 amount;
    uint256 sinceTimestamp;
    uint256 untilTimestamp;
  }

  uint256 constant public distributionPerSecond = 100; // 1/1000 % (100 = 0.1 %)
  int256 constant internal _tokenEthRatio = 2; // token price = 2x ETH price

  AggregatorV3Interface internal _ethUsdPriceFeed; 
  UniFiToken internal _unifiToken;  
  address[] public tokens;  
  mapping(address => mapping(address => Stake[])) public tokenStakes; // token -> user -> stakes
  
  /// Events
  
  event Staked(address sender, uint256 amount);
  event Unstaked(address sender, uint256 amount);
  event Claimed(address sender, uint256 amount);

  /// Constructor

  constructor(address ethUsdPriceFeedAddress_)  {
    _ethUsdPriceFeed = AggregatorV3Interface(ethUsdPriceFeedAddress_);
    // Creates the token with 0 supply
    _unifiToken = new UniFiToken(0);
  }

    // Returns ETH latest USD value
  function getEthUsdValue() public view returns (int) {
    (
      /*uint80 roundID*/,
      int price,
      /*uint startedAt*/,
      /*uint timeStamp*/,
      /*uint80 answeredInRound*/
    ) = _ethUsdPriceFeed.latestRoundData();
    return price;
  }
  
  /// Externals

  // stake an amount of token and returns the stake id
  function stake(address token_, uint256 amount_) external returns (uint256) {
    require(amount_ > 0, "Cannot stake 0 amount");
    addToken(token_);
    tokenStakes[token_][msg.sender].push(Stake(amount_, block.timestamp, 0));
    ERC20(token_).transferFrom(msg.sender, address(this), amount_);
    emit Staked(msg.sender, amount_);
    return tokenStakes[token_][msg.sender].length - 1;
  }

  function unstake(address token_, uint256 stakeId_) external {
    require(tokenStakes[token_][msg.sender][stakeId_].amount > 0, "Stake not found");
    require(tokenStakes[token_][msg.sender][stakeId_].untilTimestamp == 0, 'Already unstaked');
    // save how much we need to send
    uint amount = tokenStakes[token_][msg.sender][stakeId_].amount;
    // reset balance now
    tokenStakes[token_][msg.sender][stakeId_].amount = 0;
    // send rewards to user
    this.claim(token_, stakeId_);
    // send unstaked token to user
    IERC20(token_).transferFrom(address(this), msg.sender, amount);
    // event
    emit Unstaked(msg.sender, amount);
  }

  function claim(address token_, uint256 stakeId_) external {
    // how much rewards for the staked duration
    uint256 rewardsForDuration = (block.timestamp - tokenStakes[token_][msg.sender][stakeId_].sinceTimestamp) * distributionPerSecond / 100;
    // proportionnal to the user share of the protocol tvl
    uint256 rewardsAmount = rewardsForDuration * userShare(msg.sender, token_);
    // set new stake timestamp
    tokenStakes[token_][msg.sender][stakeId_].sinceTimestamp = block.timestamp;
    // send protocol token to user
    _unifiToken.mintTo(msg.sender, rewardsAmount);
    // event
    emit Claimed(msg.sender, rewardsAmount);
  }

  // token usd value
  function getTokenUsdValue(address token_) external view returns (uint) {
    return uint(_tokenEthRatio * this.getEthUsdValue());
  }

  // total contract token usd value
  function getTotalUsdValueLocked() external view returns (uint) {
    uint256 sum = 0;
    for(uint i = 0; i < tokens.length; i++) {
      sum += IERC20(tokens[i]).balanceOf(address(this)) * this.getTokenUsdValue(tokens[i]);
    }
    return sum;
  }

  // user staked usd value for a specific token
  function getUserTokenUsdValueLocked(address user_, address token_) external view returns (uint) {
    uint256 sum = 0;
    for(uint j = 0; j < tokenStakes[token_][user_].length; j++) {
      uint tokenBalance = tokenStakes[token_][user_][j].amount;
      if(tokenBalance > 0) {
        sum += this.getTokenUsdValue(token_) * tokenBalance;
      }        
    }
    return sum;
  }

  // user staked usd value for each of his token stake
  function getUserUsdValueLocked(address user_) external view returns (uint) {
    uint256 sum = 0;
    for(uint i = 0; i < tokens.length; i++) {
      for(uint j = 0; j < tokenStakes[tokens[i]][user_].length; j++) {
        uint tokenBalance = tokenStakes[tokens[i]][user_][j].amount;
        if(tokenBalance > 0) {
          sum += this.getTokenUsdValue(tokens[i]) * tokenBalance;
        }        
      }
    }
    return sum;
  }

  /// Internals

  // Add a managed token address to the internal list if not already existing
  function addToken(address token_) internal {
    bool add = true;
    for(uint i = 0; i < tokens.length; i++) {
      if(tokens[i] == token_) {
        add = false;
        break;
      }        
    }
    if(add)
      tokens.push(token_);
  }

  // compute the user stake share of the protocol
  function userShare(address user_, address token_) internal view returns (uint256) {
    return this.getUserTokenUsdValueLocked(user_, token_) / this.getTotalUsdValueLocked() * 100;
  }



}