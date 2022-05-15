import React from 'react';

export default class Content extends React.Component {

    render(){
        const balances = this.props.balances;
        const tokens = this.props.tokens;
        const runStake = this.props.runStake;
        const selectedPage = this.props.selectedPage;

        const stakes=this.props.stakes;
        const tokensInv=this.props.tokensInv;
        const runUnstake=this.props.runUnstake;
        const runClaim=this.props.runClaim;

        //build rows for the table in "Stake" tab
        let rowsStake = [];
        let tokenNamesIter = tokens.keys();
        for (let i=0; i<tokens.size; i++){
            let tokenName = tokenNamesIter.next().value;
            let inputId = "stake-"+tokenName;

            rowsStake.push(
                <tr class="bg-white rounded shadow-sm">
                    <td>{tokenName}</td>
                    <td>{balances.get(tokenName)}</td>
                    <td>
                        <div class="input-group">
                            <input type="text" class="form-control" id={inputId} />
                            <button class="input-group-append btn btn-primary m-1" onClick={()=>runStake(tokenName)}>Stake</button>
                        </div>
                    </td>
                </tr>
            )
        }

        //build rows for the table in "My stakes" tab
        let rowsUnstake = [];
        for (let i=0; i<stakes.length; i++){
            rowsUnstake.push(
                <tr class="bg-white rounded shadow-sm">
                    <td>{tokensInv.get(stakes[i].tokenAddress)}</td> 
                    <td>{stakes[i].amount}</td>
                    <td>
                        <div class="input-group">
                            <button class="btn btn-primary m-1" onClick={()=>runClaim(i)}>Claim reward</button>
                            <button class="btn btn-primary m-1" onClick={()=>runUnstake(i)}>Unstake</button>
                        </div>
                    </td>
                </tr>
            )
        }

        //Diplay page "Stake tokens"
        if (selectedPage === "page-stake"){
            return(
                <div className="Content">
                    <div class="container mt-3">  
                        <h1 class="m-5">Stake tokens</h1>         
                        <table class="table table-borderless">
                            <thead>
                                <tr>
                                    <th>Token</th>
                                    <th>Balance</th>
                                    <th>Amount to stake</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rowsStake}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        }

        //Diplay page "My tokens"
        else if (selectedPage === "page-my-stakes"){

            if (rowsUnstake.length === 0){
                return(
                    <div className="Content">
                        <div class="container mt-3">  
                            <h1 class="m-5">My stakes</h1> 
                            <p>You don't have any stakes yet.</p>
                        </div>
                    </div>
                )
            } 

            return(
                <div className="Content">
                    <div class="container mt-3">  
                        <h1 class="m-5">My stakes</h1> 
                        <table class="table table-borderless">
                            <thead>
                                <tr>
                                    <th>Token</th>
                                    <th>Amout staked</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rowsUnstake}                            
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        }

        //Diplay page "About"
        else {
            return (
                <div className="Content">
                    <div class="container mt-3">  
                        <h1 class="m-5">About</h1> 
                            <p>Staking Dapp by Clément M., Najib C. and Marielle D.</p>
                            <p>Stake your tokens and earn UniFi (UNF) tokens!</p>

                            <p></p>
                    </div>
                </div>
            )
        }
    }
}