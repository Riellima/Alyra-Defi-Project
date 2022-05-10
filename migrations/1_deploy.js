const Staking = artifacts.require("Staking");

module.exports = function (deployer) {
  deployer.deploy(Staking, "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e");
};
