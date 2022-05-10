// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract AggregatorV3Mock is AggregatorV3Interface {

function decimals() external view returns (uint8) {
  return 18;
}

  function description() external view returns (string memory) {
    return "Mock of the chainlink AggregatorV3Interface";
  }

  function version() external view returns (uint256) {
    return 0;
  }

  // getRoundData and latestRoundData should both raise "No data present"
  // if they do not have data to report, instead of returning unset values
  // which could be misinterpreted as actual reported values.
  function getRoundData(uint80 _roundId)
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    ) {
      return (0,0,0,0,0);
    }

// always return 2000$ 
  function latestRoundData()
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    ) {
      return (0, 2_000_000_000_000_000_000_000, 0, 0, 0);
    }

}