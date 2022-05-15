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
                            <li class="nav-item"><a class="nav-link active" href="/#" id="page-stake" onClick={()=>changePage("page-stake")}>Stake</a>
                            </li>

                            <li><a class="nav-link" href="/#" id="page-my-stakes" onClick={()=>changePage("page-my-stakes")} >My stakes</a>
                            </li>

                            <li> <a class="nav-link" href="/#" id="page-about" onClick={()=>changePage("page-about")} >About</a>
                            </li>
                        </ul>
                    </div>
                </nav> 
            </div>
        )
    }

}

