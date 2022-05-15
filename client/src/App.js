import React, { Component } from "react";
import Staking from "./contracts/Staking.json";
import getWeb3 from "./getWeb3";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import Content from "./components/Content";

import "./App.css";

class App extends Component {
    state = {web3: null, accounts: null, contract: null, tokens: null, tokensInv: null, balances: new Map(), stakes: [], selectedPage: "page-stake", protocolToken: ""};

    componentDidMount = async () => {
        try {

            /*let options = {
                fromBlock: 0,
                toBlock: 'latest'
            };*/

            const web3 = await getWeb3();
            const accounts = await web3.eth.getAccounts();
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = Staking.networks[networkId];
            const instance = new web3.eth.Contract(
                Staking.abi, 
                deployedNetwork && deployedNetwork.address,
            );

            /*instance.events.Staked(options)
            .on('data', event => console.log(event))
            .on('changed', changed => console.log(changed))
            .on('error', err => console.log(err))
            .on('connected', str => console.log(str));*/

            const protocolToken = await instance.methods.getProtocolTokenAddress().call();

            // Tokens available in the app (/!\ kovan addresses)
            const tokens = new Map([
                ["UNF", protocolToken],
                ["DAI", "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa"],
                ["LINK", "0xa36085F69e2889c224210F603D836748e7dC0088"]
            ]);
                
            const tokensInv = new Map([
                [protocolToken, "UNF"],
                ["0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa", "DAI"],
                ["0xa36085F69e2889c224210F603D836748e7dC0088", "LINK"]
            ]);
            
            this.setState({ web3, accounts, contract: instance, tokens,tokensInv, protocolToken});
            this.runGetBalances();
            this.runGetStakes();

        } catch (error) {
        alert(
            `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
        }
    };

    runStake = async (tokenName) => {

        const { accounts, contract, tokens} = this.state;
        const tokenAddress = tokens.get(tokenName);

        console.log('runStake **** tokenAddress = ', tokenAddress, ' name = ', tokenName);
        const inputId = "stake-" + tokenName;
        const amount = document.getElementById(inputId);
        console.log('amount = ', amount.value);


        await contract.methods.stake(tokenAddress, amount.value).send({ from: accounts[0] });
        amount.value = "";

        this.runGetStakes();
        this.runGetBalances();
    };

    runUnstake = async (stakeId) => {
        const {contract, accounts} = this.state;
        await contract.methods.unstake(stakeId).send({ from: accounts[0] });
    
        this.runGetStakes();
        this.runGetBalances();
    };

    runClaim = async (stakeId) => {
        const {contract, accounts} = this.state;
        await contract.methods.claim(stakeId).send({ from: accounts[0] });
    
        this.runGetStakes();
        this.runGetBalances();
    };

    runGetBalances = async () => {
        const {contract, accounts, tokens} = this.state;

        const balances = new Map();
        let tokenNamesIter = tokens.keys();
        const decimals = 18; //to replace with the real decimals

        for (let i=0; i<tokens.size; i++){
            let tokenName = tokenNamesIter.next().value;
            let balance = await contract.methods.getUserBalance(accounts[0], tokens.get(tokenName)).call();

            if (balance.length > 18){
                balance = balance.substring(0, balance.length - decimals) + "." + balance.substr(balance.length - decimals);
            }
            else{
                const n = "0.000000000000000000";
                balance = n.substring(0, decimals + 2 - balance.length) + balance;
            }
            balances.set(tokenName, balance);
        }

        this.setState({balances});
    };

    runGetStakes = async () => {
        const {contract, accounts} = this.state;
        const stakes = await contract.methods.getUserStakes(accounts[0]).call({ from: accounts[0] });
        console.log("Stakes : ", stakes);

        this.setState({stakes});
    }


    changePage = (pageId) => {
        document.getElementById("page-stake").classList.remove("active");
        document.getElementById("page-my-stakes").classList.remove("active");
        document.getElementById("page-about").classList.remove("active");

        document.getElementById(pageId).classList.add("active");

        this.setState({selectedPage: pageId});
    }


    render() {
        console.log("balances = ", this.state.balances);
        if (!this.state.web3) {
        return <div>Loading Web3, accounts, and contract...</div>;
        }

        return (
            <div className="App">
                <NavBar 
                    addr={this.state.accounts[0]}
                    changePage={this.changePage}
                />
                <Content
                    balances={this.state.balances}
                    tokens={this.state.tokens}
                    selectedPage={this.state.selectedPage}
                    stakes={this.state.stakes}
                    tokensInv={this.state.tokensInv}
                    
                    runStake={this.runStake} 
                    runUnstake={this.runUnstake}
                    runClaim={this.runClaim}
                    
                />
                <Footer/>
            </div>
        );
    }
}

export default App;