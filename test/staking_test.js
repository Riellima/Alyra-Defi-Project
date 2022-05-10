const Staking = artifacts.require("./Staking.sol");
const MyGreatToken = artifacts.require("./TestToken.sol");

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

contract("Staking", function (accounts) {
  const user1 = accounts[1];
  const user2 = accounts[2];

  // stake
  describe('stake', function () {
    let contractInstance;
    let myTokenInstance;

    before(async function () {
      contractInstance = await Staking.new("0x8A753747A1Fa494EC906cE90E9f37563A8AF630e");
      myTokenInstance = await MyGreatToken.new(0);
      myTokenInstance.mintTo(user1, 100000);
    });

    it('should stake token and return stake id', async function () {
      const amount = new BN(1000);
      console.log("approve contract to use an amount of testtoken from user1");
      await myTokenInstance.approve(contractInstance.address, amount, { from: user1 });
      console.log("stake an amount of testtoken");
      let stakeReceipt = await contractInstance.stake(myTokenInstance.address, amount, { from: user1 });
      console.log("expect event Staked");

      expectEvent(stakeReceipt, "Staked", { sender: user1, amount: amount });
    });
  })

  // // getVoter
  // describe('getVoter', function () {
  //   let votingInstance;
  //   let owner;

  //   // Create the voting contract and add user1 as voter
  //   before(async function () {
  //     votingInstance = await Voting.new();
  //     owner = await votingInstance.owner();
  //     await votingInstance.addVoter(user1, {from: owner});
  //   });

  //   it("should revert (caller is not a voter)", async function() {
  //     let getVoterPromise = votingInstance.getVoter.call(user1,{ from: user2 });
  //     expectRevert(getVoterPromise, "You're not a voter");
  //   });

  //   it("should return an empty value", async function() {
  //     let actual = await votingInstance.getVoter.call(user2, {from:user1});
  //     expect(actual.isRegistered).to.be.equal(false, "bad isRegistered state");
  //   });

  //   it("should return a registered voter", async function() {
  //     let actual = await votingInstance.getVoter.call(user1, {from:user1});
  //     expect(actual.isRegistered).to.be.equal(true, "bad isRegistered state");
  //   });
  // });

  // // getOneProposal
  // describe('getOneProposal', function () {
  //   let votingInstance;
  //   let owner;
  //   const proposalDescription = "My testing proposal";

  //   // Create the voting contract, add user1 as voter and add a proposal at index 0
  //   before(async function () {
  //     votingInstance = await Voting.new();
  //     owner = await votingInstance.owner();

  //     await votingInstance.addVoter(user1, {from: owner});
  //     await votingInstance.startProposalsRegistering({from: owner});
  //     await votingInstance.addProposal(proposalDescription, {from: user1});
  //   });

  //   it("should revert (caller is not a voter)", async function() {
  //     let getOneProposalPromise = votingInstance.getOneProposal.call(0,{ from: user2 });
  //     expectRevert(getOneProposalPromise, "You're not a voter");
  //   });

  //   it("should revert on non existent proposal", async function() {
  //     let getOneProposalPromise = votingInstance.getOneProposal.call(1, {from:user1});
  //     expectRevert.unspecified(getOneProposalPromise);
  //   });

  //   it("should return an existing proposal with the correct description", async function() {
  //     let actual = await votingInstance.getOneProposal.call(0, {from:user1});
  //     expect(actual.description).to.be.a('string').equal(proposalDescription);
  //   });

  //   it("should return an existing proposal with the correct voteCount", async function() {
  //     let actual = await votingInstance.getOneProposal.call(0, {from:user1});
  //     //expect(actual.voteCount).to.be.equal(0);
  //     assert.equal(actual.voteCount, 0, "voteCount not 0");
  //   });
  // });

  // // addVoter
  // describe('addVoter', function () {
  //   let votingInstance;
  //   let owner;

  //   // Create the voting contract
  //   before(async function () {
  //     votingInstance = await Voting.new();
  //     owner = await votingInstance.owner();
  //   });

  //   it("should add user1 as voter and emit event", async function() {
  //     let addVoterReceipt = await votingInstance.addVoter(user1, {from: owner});
  //     expectEvent(addVoterReceipt, "VoterRegistered", {voterAddress: user1});
  //   });

  //   it("should revert (voter already registered)", async function() {
  //     let addVoterPromise = votingInstance.addVoter(user1, {from: owner});
  //     expectRevert(addVoterPromise, "Already registered");
  //   });

  //   it("should revert (caller is not the owner)", async function() {
  //     let addVoterPromise = votingInstance.addVoter.call(user1,{ from: user2 });
  //     expectRevert(addVoterPromise, "Ownable: caller is not the owner");
  //   });

  //   it("should revert (workflowstatus not RegisteringVoters)", async function() {
  //     // change workflowstatus to trigger the revert
  //     votingInstance.startProposalsRegistering.call({from: owner});
  //     let addVoterPromise = votingInstance.addVoter(user1, {from: owner});
  //     expectRevert(addVoterPromise, "Already registered");
  //   });
  // });

  // // addProposal
  // describe('addProposal', function () {
  //   it("should add a new proposal", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     let proposalDescription = 'my first proposal';
  //     await votingInstance.addVoter(user1, {from: owner});
  //     await votingInstance.startProposalsRegistering({from: owner});
  //     // act
  //     await votingInstance.addProposal(proposalDescription, {from: user1});
  //     // test      
  //     let proposal = await votingInstance.getOneProposal.call(0, {from:user1});
  //     expect(proposal.description).to.be.a('string').equal(proposalDescription);
  //   });    

  //   it("should emit ProposalRegistered event", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     let proposalDescription = 'my first proposal';
  //     await votingInstance.addVoter(user1, {from: owner});
  //     await votingInstance.startProposalsRegistering({from: owner});
  //     // act
  //     let receipt = await votingInstance.addProposal(proposalDescription, {from: user1});
  //     // test
  //     expectEvent(receipt, "ProposalRegistered", { proposalId: new BN(0) });
  //   });

  //   it("should revert (workflowstatus not ProposalsRegistrationStarted)", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     let proposalDescription = 'my first proposal';
  //     await votingInstance.addVoter(user1, {from: owner});
  //     // act
  //     let promise = votingInstance.addProposal(proposalDescription, {from: user1});
  //     // test
  //     expectRevert(promise, "Proposals are not allowed yet");
  //   });

  //   it("should revert (empty proposal description string)", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     let proposalDescription = '';
  //     await votingInstance.addVoter(user1, {from: owner});
  //     await votingInstance.startProposalsRegistering({from: owner});
  //     // act
  //     let promise = votingInstance.addProposal(proposalDescription, {from: user1});
  //     // test
  //     expectRevert(promise, "Vous ne pouvez pas ne rien proposer");
  //   });
  // });

  // // setVote
  // describe('setVote', function () {
  //   it("should set vote", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     await votingInstance.addVoter(user1, {from: owner});
  //     await votingInstance.startProposalsRegistering({from: owner});      
  //     await votingInstance.addProposal('my first proposal', {from: user1});
  //     await votingInstance.endProposalsRegistering({from: owner});  
  //     await votingInstance.startVotingSession({from: owner});  
  //     // act
  //     await votingInstance.setVote(0, {from: user1});
  //     // test      
  //     let voter = await votingInstance.getVoter.call(user1, {from:user1});
  //     let proposal = await votingInstance.getOneProposal.call(0, {from:user1});
  //     expect(new BN(voter.votedProposalId)).to.be.bignumber.equal(new BN(0));
  //     assert.equal(voter.hasVoted, true, "The hasVoted property should be true");
  //     expect(new BN(proposal.voteCount)).to.be.bignumber.equal(new BN(1));
  //   }); 

  //   it("should emit Voted event", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     await votingInstance.addVoter(user1, {from: owner});
  //     await votingInstance.startProposalsRegistering({from: owner});      
  //     await votingInstance.addProposal('my first proposal', {from: user1});
  //     await votingInstance.endProposalsRegistering({from: owner});  
  //     await votingInstance.startVotingSession({from: owner});  
  //     // act
  //     let receipt = await votingInstance.setVote(0, {from: user1});
  //     // test
  //     expectEvent(receipt, "Voted", { 
  //       voter: user1, 
  //       proposalId: new BN(0)
  //     });
  //   });

  //   it("should revert (workflowstatus not VotingSessionStarted)", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     await votingInstance.addVoter(user1, {from: owner});
  //     await votingInstance.startProposalsRegistering({from: owner});      
  //     await votingInstance.addProposal('my first proposal', {from: user1});
  //     await votingInstance.endProposalsRegistering({from: owner});  
  //     // act      
  //     let promise = votingInstance.setVote(0, {from: user1});
  //     // test
  //     expectRevert(promise, "Voting session havent started yet");
  //   });

  //   it("should revert (voter already voted)", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     await votingInstance.addVoter(user1, {from: owner});
  //     await votingInstance.startProposalsRegistering({from: owner});      
  //     await votingInstance.addProposal('my first proposal', {from: user1});
  //     await votingInstance.endProposalsRegistering({from: owner});  
  //     await votingInstance.startVotingSession({from: owner}); 
  //     await votingInstance.setVote(0, {from: user1}); 
  //     // act      
  //     let promise = votingInstance.setVote(0, {from: user1});
  //     // test
  //     expectRevert(promise, "You have already voted");
  //   });


  //   it("should revert (proposal doesn't exist)", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     await votingInstance.addVoter(user1, {from: owner});
  //     await votingInstance.startProposalsRegistering({from: owner});      
  //     await votingInstance.endProposalsRegistering({from: owner});  
  //     await votingInstance.startVotingSession({from: owner}); 
  //     // act      
  //     let promise = votingInstance.setVote(0, {from: user1});
  //     // test
  //     expectRevert(promise, "Proposal not found");
  //   });
  // });

  // // startProposalsRegistering
  // describe('startProposalsRegistering', function () {
  //   it("should change workflow status to ProposalsRegistrationStarted", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     // act
  //     await votingInstance.startProposalsRegistering({from: owner});
  //     // test      
  //     let currentStatus = await votingInstance.workflowStatus();
  //     expect(currentStatus.toString()).to.equal(Voting.WorkflowStatus.ProposalsRegistrationStarted.toString());
  //   });

  //   it("should emit WorkflowStatusChange event", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     // act
  //     let receipt = await votingInstance.startProposalsRegistering({from: owner});
  //     // test
  //     expectEvent(receipt, "WorkflowStatusChange", { 
  //       previousStatus: Voting.WorkflowStatus.RegisteringVoters.toString(), 
  //       newStatus: Voting.WorkflowStatus.ProposalsRegistrationStarted.toString() 
  //     });
  //   });

  //   it("should revert (workflowstatus not RegisteringVoters)", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     await votingInstance.startProposalsRegistering({from: owner});
  //     // act      
  //     let promise = votingInstance.startProposalsRegistering({from: owner});
  //     // test
  //     expectRevert(promise, "Registering proposals cant be started now");
  //   });
  // });

  // // endProposalsRegistering
  // describe('endProposalsRegistering', function () {
  //   it("should change workflow status to ProposalsRegistrationEnded", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     await votingInstance.startProposalsRegistering({from: owner});
  //     // act
  //     await votingInstance.endProposalsRegistering({from: owner});
  //     // test      
  //     let currentStatus = await votingInstance.workflowStatus();
  //     expect(currentStatus.toString()).to.equal(Voting.WorkflowStatus.ProposalsRegistrationEnded.toString());
  //   });

  //   it("should emit WorkflowStatusChange event", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     await votingInstance.startProposalsRegistering({from: owner});
  //     // act
  //     let receipt = await votingInstance.endProposalsRegistering({from: owner}); 
  //     // test
  //     expectEvent(receipt, "WorkflowStatusChange", { 
  //       previousStatus: Voting.WorkflowStatus.ProposalsRegistrationStarted.toString(), 
  //       newStatus: Voting.WorkflowStatus.ProposalsRegistrationEnded.toString() 
  //     });
  //   });

  //   it("should revert (workflowstatus not RegisteringVoters)", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     // act
  //     let promise = votingInstance.endProposalsRegistering({from: owner});
  //     // test
  //     expectRevert(promise, "Registering proposals phase is not finished");
  //   });
  // });

  // // startVotingSession
  // describe('startVotingSession', function () {
  //   it("should change workflow status to VotingSessionStarted", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     await votingInstance.startProposalsRegistering({from: owner});
  //     await votingInstance.endProposalsRegistering({from: owner});
  //     // act
  //     await votingInstance.startVotingSession({from: owner});
  //     // test      
  //     let currentStatus = await votingInstance.workflowStatus();
  //     expect(currentStatus.toString()).to.equal(Voting.WorkflowStatus.VotingSessionStarted.toString());
  //   });

  //   it("should emit WorkflowStatusChange event", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     await votingInstance.startProposalsRegistering({from: owner});
  //     await votingInstance.endProposalsRegistering({from: owner});
  //     // act
  //     let receipt = await votingInstance.startVotingSession({from: owner});
  //     // test
  //     expectEvent(receipt, "WorkflowStatusChange", { 
  //       previousStatus: Voting.WorkflowStatus.ProposalsRegistrationEnded.toString(), 
  //       newStatus: Voting.WorkflowStatus.VotingSessionStarted.toString() 
  //     });
  //   });

  //   it("should revert (workflowstatus not ProposalsRegistrationEnded)", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     // act
  //     let promise = votingInstance.startVotingSession({from: owner});
  //     // test
  //     expectRevert(promise, "Registering proposals phase is not finished");
  //   });
  // });

  // // endVotingSession
  //   describe('endVotingSession', function () {
  //     it("should change workflow status to VotingSessionEnded", async function() {
  //       // prepare
  //       let votingInstance = await Voting.new();
  //       let owner = await votingInstance.owner();
  //       await votingInstance.startProposalsRegistering({from: owner});
  //       await votingInstance.endProposalsRegistering({from: owner});
  //       await votingInstance.startVotingSession({from: owner});
  //       // act
  //       await votingInstance.endVotingSession({from: owner});
  //       // test      
  //       let currentStatus = await votingInstance.workflowStatus();
  //       expect(currentStatus.toString()).to.equal(Voting.WorkflowStatus.VotingSessionEnded.toString());
  //     });

  //     it("should emit WorkflowStatusChange event", async function() {
  //       // prepare
  //       let votingInstance = await Voting.new();
  //       let owner = await votingInstance.owner();
  //       await votingInstance.startProposalsRegistering({from: owner});
  //       await votingInstance.endProposalsRegistering({from: owner});
  //       await votingInstance.startVotingSession({from: owner});
  //       // act
  //       let receipt = await votingInstance.endVotingSession({from: owner});
  //       // test
  //       expectEvent(receipt, "WorkflowStatusChange", { 
  //         previousStatus: Voting.WorkflowStatus.VotingSessionStarted.toString(), 
  //         newStatus: Voting.WorkflowStatus.VotingSessionEnded.toString() 
  //       });
  //     });

  //     it("should revert (workflowstatus not VotingSessionStarted)", async function() {
  //       // prepare
  //       let votingInstance = await Voting.new();
  //       let owner = await votingInstance.owner();
  //       // act
  //       let promise = votingInstance.endVotingSession({from: owner});
  //       // test
  //       expectRevert(promise, "Voting session havent started yet");
  //     });
  //   });

  // // tallyVotes
  // describe('tallyVotes', function () {
  //   it("should change workflow status to VotesTallied", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     await votingInstance.startProposalsRegistering({from: owner});
  //     await votingInstance.endProposalsRegistering({from: owner});
  //     await votingInstance.startVotingSession({from: owner});
  //     await votingInstance.endVotingSession({from: owner});
  //     // act
  //     await votingInstance.tallyVotes({from: owner});
  //     // test      
  //     let currentStatus = await votingInstance.workflowStatus();
  //     expect(currentStatus.toString()).to.equal(Voting.WorkflowStatus.VotesTallied.toString());
  //   });

  //   it("should emit WorkflowStatusChange event", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     await votingInstance.startProposalsRegistering({from: owner});
  //     await votingInstance.endProposalsRegistering({from: owner});
  //     await votingInstance.startVotingSession({from: owner});
  //     await votingInstance.endVotingSession({from: owner});
  //     // act
  //     let receipt = await votingInstance.tallyVotes({from: owner});
  //     // test
  //     expectEvent(receipt, "WorkflowStatusChange", { 
  //       previousStatus: Voting.WorkflowStatus.VotingSessionEnded.toString(), 
  //       newStatus: Voting.WorkflowStatus.VotesTallied.toString() 
  //     });
  //   });

  //   it("should revert (workflowstatus not VotingSessionEnded)", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     // act
  //     let promise = votingInstance.tallyVotes({from: owner});
  //     // test
  //     expectRevert(promise, "Current status is not voting session ended");
  //   });

  //   it("should find the winningProposalId", async function() {
  //     // prepare
  //     let votingInstance = await Voting.new();
  //     let owner = await votingInstance.owner();
  //     await votingInstance.addVoter(user1, {from: owner});
  //     await votingInstance.addVoter(user2, {from: owner});
  //     await votingInstance.startProposalsRegistering({from: owner});
  //     await votingInstance.addProposal('my first proposal', {from: user1})
  //     await votingInstance.addProposal('my second proposal', {from: user1})
  //     await votingInstance.endProposalsRegistering({from: owner});
  //     await votingInstance.startVotingSession({from: owner});
  //     await votingInstance.setVote(1, {from: user1});
  //     await votingInstance.setVote(1, {from: user2});
  //     await votingInstance.endVotingSession({from: owner});
  //     // act
  //     await votingInstance.tallyVotes({from: owner});
  //     // test      
  //     let winningProposalId = await votingInstance.winningProposalID();
  //     expect(new BN(winningProposalId)).to.be.bignumber.equal(new BN(1));
  //   });
  // });
});
