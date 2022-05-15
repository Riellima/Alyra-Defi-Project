const Staking = artifacts.require("Staking");

module.exports = function (deployer) {
  deployer.deploy(Staking, "0x9326BFA02ADD2366b30bacB125260Af641031331"); //ETHUSDC Kovan
  //0x8A753747A1Fa494EC906cE90E9f37563A8AF630e //rinkeby
};