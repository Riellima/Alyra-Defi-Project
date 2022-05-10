// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract TestToken is ERC20, Ownable {

  constructor(uint256 initialSupply_) ERC20("MyGreatToken", "MGT") {
    _mint(msg.sender, initialSupply_);    
  }

  function mintTo(address to_, uint256 amount_) public onlyOwner {
    _mint(to_, amount_);
  }
}