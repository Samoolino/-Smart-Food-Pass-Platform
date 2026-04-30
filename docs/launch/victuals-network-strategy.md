# VICTUALS Network Strategy

VICTUALS should not continue with Mumbai as the forward deployment target.

## Current recommended path

| Stage | Network | Purpose |
| --- | --- | --- |
| Local | Local Foundry or Hardhat chain | Fast contract testing and deployment checks. |
| Testnet | Polygon Amoy | Public test deployment and app/service integration. |
| Candidate mainnet | Polygon PoS mainnet or another selected EVM mainnet | Pilot deployment after tests and review. |

## Polygon reference values

| Network | Chain ID | Use |
| --- | --- | --- |
| Polygon Amoy | `80002` | Testnet candidate. |
| Polygon PoS mainnet | `137` | Mainnet candidate. |

## Configuration rule

Contracts and apps should not hardcode a single network. Use environment-configured values for:

- network name
- chain id
- RPC URL
- explorer URL
- admin address
- multisig address
- deployment address records

## Mainnet selection criteria

Before production launch, compare candidate networks by:

- gas cost
- reliability
- wallet support
- explorer verification support
- merchant/user accessibility
- ecosystem maturity
- operational support

## Deployment sequence

1. Run contract tests locally.
2. Deploy locally.
3. Deploy to public testnet.
4. Connect service mocks and app mocks to testnet contract addresses.
5. Run the full lifecycle integration flow.
6. Select pilot mainnet.
7. Deploy pilot contracts.
8. Save addresses in versioned deployment records.
