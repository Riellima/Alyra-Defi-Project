// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;


import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Token.sol";

contract Staking {

  struct Stake {
    uint256 amount;
    uint256 sinceTimestamp;
    uint256 untilTimestamp;
  }

  uint256 constant public distributionPerSecond = 100; // 1/1000 % (100 = 0.1 %)
  uint8 constant internal _tokenEthRatio = 2; // token price = 2x ETH price

  AggregatorV3Interface internal _ethUsdPriceFeed; 
  UniFiToken internal _unifiToken;  
  address[] public tokens;  
  mapping(address => address => Stake[]) public tokenStakes; // token -> user -> stakes
  
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
  
  /// Externals

  function stake(address token_, uint256 amount_) external returns (uint256 stakeId) {
    require(amount_ > 0, "Cannot stake 0 amount");
    addToken(token_);
    tokenStakes[token_][msg.sender].push(Stake(amount_, block.timestamp, 0));
    IERC20(token_).transferFrom(msg.sender, address(this), amount_);
    emit Staked(msg.sender, amount_);
    return tokenStakes[token_][msg.sender].length - 1;
  }

  function unstake(address token_, uint256 stakeId_) external {
    require(tokenStakes[token_][msg.sender][stakeId_].balance > 0, "Stake not found");
    require(tokenStakes[token_][msg.sender][stakeId_].untilTimestamp == 0, 'Already unstaked');
    // reset balance now
    tokenStakes[token_][msg.sender][stakeId_].balance = 0;
    // send rewards to user
    claim(token_, stakeId_);
    // send unstaked token to user
    IERC20(token_).transferFrom(address(this), msg.sender, amount_);
    // event
    emit Unstaked(msg.sender, amount_);
  }


  // Returns ETH latest USD value
  function getEthUsdValue() external view returns (int) {
    (
      /*uint80 roundID*/,
      int price,
      /*uint startedAt*/,
      /*uint timeStamp*/,
      /*uint80 answeredInRound*/
    ) = _ethUsdPriceFeed.latestRoundData();
      return price;
  }

  function claim(address token_, uint256 stakeId_) external {
    // how much rewards for the staked duration
    uint256 rewardsForDuration = (block.timestamp - tokenStakes[token_][msg.sender][stakeId_].sinceTimestamp) * distributionPerSecond / 100
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
  function getTokenUsdValue(address token_) external view returns (int usdValue) {
    int ethUsd = getLatestPrice();
    return _tokenEthRatio * ethUsd;
  }

  // total contract token usd value
  function getTotalUsdValueLocked() external view returns (uint totalUsdValueLocked) {
    uint256 sum = 0;
    for(uint i = 0; i < tokens.length; i++) {
      sum += IERC20(tokens[i]).balanceOf(address(this)) * getTokenUsdValue(tokens[i]);
    }
    return sum;
  }

  // user staked usd value for a specific token
  function getUserTokenUsdValueLocked(address user_, address, token_) external view returns (uint userTokenUsdValueLocked) {
    uint256 sum = 0;
    for(uint j = 0; j < tokenStakes[token_][user_].length; j++) {
      uint tokenBalance = tokenStakes[token_][user_][j].balance;
      if(tokenBalance > 0) {
        sum += getTokenUsdValue(token_) * tokenBalance;
      }        
    }
    return sum;
  }

  // user staked usd value for each of his token stake
  function getUserUsdValueLocked(address user_) external view returns (uint userUsdValueLocked) {
    uint256 sum = 0;
    for(uint i = 0; i < tokens.length; i++) {
      for(uint j = 0; j < tokenStakes[tokens[i]][user_].length; j++) {
        uint tokenBalance = tokenStakes[tokens[i]][user_][j].balance;
        if(tokenBalance > 0) {
          sum += getTokenUsdValue(tokens[i]) * tokenBalance;
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
  function userShare(address user_, address token_) internal view returns (uint256 userShare) {
    return getUserTokenStakeUsdValue(user_, token_) / getTotalUsdValueLocked() * 100;
  }

}