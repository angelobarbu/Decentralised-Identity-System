#!/bin/bash

# Define database path
GANACHE_DB=".ganache-db"

# Ensure the database directory exists
mkdir -p "$GANACHE_DB"

# Start ganache-cli with the persistent database and fixed mnemonic
ganache-cli --db "$GANACHE_DB" \
  --mnemonic "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat" \
  --chainId 1337 \
  --port 8545 \
  --networkId 5777

