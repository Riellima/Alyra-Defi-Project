// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;


import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./Token.sol";

contract Staking {

  AggregatorV3Interface internal _ethUsdPriceFeed; 
  UniFiToken internal _unifiToken;
  
  constructor(address ethUsdPriceFeedAddress_)  {
    _ethUsdPriceFeed = AggregatorV3Interface(ethUsdPriceFeedAddress_);
    _unifiToken = new UniFiToken(0);
  }

  /**
   * Returns the latest price
   */
  function getLatestPrice() public view returns (int) {
    (
      /*uint80 roundID*/,
      int price,
      /*uint startedAt*/,
      /*uint timeStamp*/,
      /*uint80 answeredInRound*/
    ) = _ethUsdPriceFeed.latestRoundData();
      return price;
  }


  function deposit() public {

  }

  function withdraw() public {

  }

  function claim() public {

  }

  function getTotalValueLocked() public view {

  }

  function getUserValueLocked() public view {

  }

}