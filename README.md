# Alyra-Defi-Project

## Functionnal specifications

- A Staking contract is used to stake any ERC20.
- Any staked ERC20 must be readable in a single unit of measure (ETH/DAI/USDC...) using Chainlink.
- If a token doesn't exist on Chainlink, hardcode a constant to compute it's price.
- The user that staked on the Staking contract will earn rewards with the protocol's ERC20.
- Those rewards are proportionnal to the user stake and the total value locked in the protocol.
- The user is able to claim those tokens and also withdraw its deposit.
- A frontend must be developed.

## Software draft

- deposit
- withdraw
- claim
- getTotalValueLocked
- getUserValueLocked