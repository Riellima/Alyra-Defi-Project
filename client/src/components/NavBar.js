import React from 'react';

export default class NavBar extends React.Component {

    render(){
        const changePage = this.props.changePage;
        const addr = this.props.addr;

        return(
            <div className="NavBar">
                <div class="p-3 bg-dark text-white text-center">
                    <h1>Staking DApp </h1>
                        <p>Wallet: {addr}</p>
                </div>

                <nav class="navbar navbar-expand-sm navbar-dark bg-primary ">
                    <div class="navbar-collapse collapse justify-content-center" >
                        <ul class="navbar-nav">
                            <li class="nav-item"><button class="nav-link active" id="page-stake" onClick={()=>changePage("page-stake")}>Stake</button>
                            </li>

                            <li><button class="nav-link" id="page-my-stakes" onClick={()=>changePage("page-my-stakes")} >My stakes</button>
                            </li>

                            <li> <button class="nav-link" id="page-about" onClick={()=>changePage("page-about")} >About</button>
                            </li>
                        </ul>
                    </div>
                </nav> 
            </div>
        )
    }
}
