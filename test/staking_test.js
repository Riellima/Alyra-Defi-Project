const Staking = artifacts.require("./Staking.sol");
const Oracle = artifacts.require("./AggregatorV3Mock.sol");
const MyGreatToken = artifacts.require("./TestToken.sol");
const ProtocolToken = artifacts.require("./UniFiToken.sol");

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time,         // Time manipulations
} = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

const defaultAmount = new BN(1000);
const zero = new BN(0);

contract("Staking", function (accounts) {
  const user1 = accounts[1];
  const user2 = accounts[2];

  // stake
  describe('stake', function () {
    let contractInstance;
    let myTokenInstance;
    let oracleMock;

    beforeEach(async function () {
      oracleMock = await Oracle.new();
      contractInstance = await Staking.new(oracleMock.address);
      myTokenInstance = await MyGreatToken.new(defaultAmount.mul(new BN(10)), { "from": user1 });
      await myTokenInstance.approve(contractInstance.address, constants.MAX_UINT256, { from: user1 }); // unlimited approve
    });

    it('should stake token and return stake id = 0', async function () {
      let stakeResult = await contractInstance.stake(myTokenInstance.address, defaultAmount, { from: user1 }); // stake
      let stakeEvent = stakeResult.logs[0].args;
      expect(stakeEvent.stakeId.eq(zero)).to.be.equal(true, "stakeid should be 0");
    });

    it('should stake token and return stake id = 2', async function () {
      let stakeResult = await contractInstance.stake(myTokenInstance.address, defaultAmount, { from: user1 }); // stake
      stakeResult = await contractInstance.stake(myTokenInstance.address, defaultAmount, { from: user1 }); // stake
      stakeResult = await contractInstance.stake(myTokenInstance.address, defaultAmount, { from: user1 }); // stake
      let stakeEvent = stakeResult.logs[0].args;

      expect(stakeEvent.stakeId.eq(new BN(2))).to.be.equal(true, "stakeid should be 2");
    });

    it('should stake token and emit event', async function () {
      let stakeResult = await contractInstance.stake(myTokenInstance.address, defaultAmount, { from: user1 });
      expectEvent(stakeResult, "Staked", { sender: user1, amount: defaultAmount, stakeId: zero });
    });
  });

  describe('claim', function () {
    let stakeId;
    let contractInstance;
    let myTokenInstance;
    let protocolToken;
    let distributionPerSecond;
    let t0;

    beforeEach(async function () {
      oracleMock = await Oracle.new(); // Create Oracle contract instance
      contractInstance = await Staking.new(oracleMock.address); // Create Staking contract instance

      distributionPerSecond = await contractInstance.distributionPerSecond.call();

      let protocolTokenAddress = await contractInstance.getProtocolTokenAddress.call(); // Get protocol token address
      protocolToken = await ProtocolToken.at(protocolTokenAddress); // Fetch protocol token contract instance

      myTokenInstance = await MyGreatToken.new(defaultAmount.mul(new BN(10)), { "from": user1 }); // Create a TestToken contract instance
      await myTokenInstance.approve(contractInstance.address, constants.MAX_UINT256, { from: user1 }); // unlimited approve

      let stakeResult = await contractInstance.stake(myTokenInstance.address, defaultAmount, { from: user1 }); // stake
      stakeId = stakeResult.logs[0].args.stakeId;
      t0 = (await web3.eth.getBlock('latest')).timestamp;
    });

    it('should claim protocol tokens right after staking', async function () {
      let claimResult = await contractInstance.claim(stakeId.toNumber(), { from: user1 });
      let t1 = (await web3.eth.getBlock(claimResult.receipt.blockNumber)).timestamp;

      let userStakeValue = await contractInstance.getStakeValue.call(user1, stakeId);
      // timeIncrease seconds * distributionPerSecond * stakeValue
      let expectedRewards = new BN((t1 - t0) * distributionPerSecond.toNumber()).mul(userStakeValue);
      let userProtocolTokenBalance = await protocolToken.balanceOf.call(user1);

      expect(userProtocolTokenBalance.eq(expectedRewards)).to.be.equal(true, "not the same amount of token on user than expected rewards");
    });

    it('should claim protocol tokens after some time', async function () {
      time.increase(1000); // Increase time by 1000 seconds

      let claimResult = await contractInstance.claim(stakeId.toNumber(), { from: user1 });
      let t1 = (await web3.eth.getBlock(claimResult.receipt.blockNumber)).timestamp;

      let userStakeValue = await contractInstance.getStakeValue.call(user1, stakeId);
      // timeIncrease seconds * distributionPerSecond * stakeValue
      let expectedRewards = new BN((t1 - t0) * distributionPerSecond.toNumber()).mul(userStakeValue);
      let userProtocolTokenBalance = await protocolToken.balanceOf.call(user1);

      expect(userProtocolTokenBalance.eq(expectedRewards)).to.be.equal(true, "not the same amount of token on user than expected rewards");
    });

    it('should claim tokens and emit event', async function () {
      time.increase(1000); // Increase time by 1000 seconds
      let claimResult = await contractInstance.claim(stakeId, { from: user1 });
      let t1 = (await web3.eth.getBlock(claimResult.receipt.blockNumber)).timestamp;

      let userStakeValue = await contractInstance.getStakeValue.call(user1, stakeId);
      // timeIncrease seconds * distributionPerSecond * stakeValue
      let expectedRewards = new BN((t1 - t0) * distributionPerSecond.toNumber()).mul(userStakeValue);

      expectEvent(claimResult, "Claimed", { sender: user1, amount: expectedRewards });
    });
  });

  describe('unstake', function () {
    let stakeId;
    let contractInstance;
    let myTokenInstance;

    beforeEach(async function () {
      oracleMock = await Oracle.new();
      contractInstance = await Staking.new(oracleMock.address);
      myTokenInstance = await MyGreatToken.new(defaultAmount, { "from": user1 });
      await myTokenInstance.approve(contractInstance.address, constants.MAX_UINT256, { from: user1 }); // unlimited approve

      let stakeResult = await contractInstance.stake(myTokenInstance.address, defaultAmount, { from: user1 }); // stake
      stakeId = stakeResult.logs[0].args.stakeId;
      console.log("stakeId is " + stakeId);
    });

    it('should unstake token and emit event', async function () {
      let unstakeResult = await contractInstance.unstake(stakeId, { from: user1 });
      expectEvent(unstakeResult, "Unstaked", { sender: user1, amount: defaultAmount });
    });
  });

  describe('getOraclePrice', function () {
    let contractInstance;

    before(async function () {
      oracleMock = await Oracle.new(); // Create Oracle contract instance
      contractInstance = await Staking.new(oracleMock.address); // Create Staking contract instance
    });

    it('should return the mock eth price', async function () {
      let ethUsdPrice = await contractInstance.getOraclePrice.call("ETHUSD");
      let expected = (new BN(2000)).mul(new BN(10).pow(new BN(18)));
      expect(ethUsdPrice.eq(expected)).to.be.equal(true, "mock ethusd value error");
    });
  });

  describe('getUserStakes', function () {
    let contractInstance;
    let myTokenInstance;
    let oracleMock;

    beforeEach(async function () {
      oracleMock = await Oracle.new();
      contractInstance = await Staking.new(oracleMock.address);
      myTokenInstance = await MyGreatToken.new(defaultAmount.mul(new BN(10)), { "from": user1 });
      await myTokenInstance.approve(contractInstance.address, constants.MAX_UINT256, { from: user1 }); // unlimited approve
      // Stake 2 times
      await contractInstance.stake(myTokenInstance.address, defaultAmount, { from: user1 }); // stake
      await contractInstance.stake(myTokenInstance.address, defaultAmount, { from: user1 }); // stake
    });

    it('should get a 2 items Stake array', async function () {
      let userStakes = await contractInstance.getUserStakes.call(user1);
      expect(userStakes.length).to.be.equal(2);

      expect(userStakes[0].tokenAddress).to.be.equal(myTokenInstance.address);
      expect(userStakes[0].amount).to.be.equal(defaultAmount.toString());
      //expect(userStakes[0].sinceTimestamp).to.be.equal((await time.latest()).toString());
      expect(userStakes[0].untilTimestamp).to.be.equal("0");
    });
  })

});
