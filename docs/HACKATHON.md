# Hackathon Instructions

## Tools

### ARC-cli (arc-canteen)
The ARC-cli is used to track project progress and submit updates to Arc. 

**Full Guide:** See [ARC CLI Guide](./ARC_CLI_GUIDE.md) for detailed commands.

**Installation:**
```bash
uv tool install git+https://github.com/the-canteen-dev/ARC-cli
```

**Common Commands:**
- `arc-canteen status`: Show your dashboard.
- `arc-canteen login`: Authenticate with GitHub.
- `arc-canteen update-traction`: Submit traction updates.
- `arc-canteen update-product`: Submit product updates.
- `arc-canteen context`: Get developer docs and sample codebases.

## RPC Configuration

Saved to `~/.arc-canteen/env` (export RPC=…)

For this shell:
  `source ~/.arc-canteen/env`

For every new shell — add one line to `~/.bashrc` or `~/.zshrc`:
  `[ -f ~/.arc-canteen/env ] && . ~/.arc-canteen/env`
  # or: `arc-canteen shell-init >> ~/.bashrc`

Then `$RPC` is set. Try it:
  `cast block-number --rpc-url $RPC`              # foundry
  `cast chain-id      --rpc-url $RPC`

In code:
  `http(process.env.RPC)`                                                # viem
  `new JsonRpcProvider(process.env.RPC)`                                 # ethers v6
  `Web3(Web3.HTTPProvider(os.environ['RPC']))`                           # web3.py

Run `arc-canteen status` to see your dashboard, or `arc-canteen --help` to explore commands.

## Workflow
- Use `dev_joe` branch for feature development.
