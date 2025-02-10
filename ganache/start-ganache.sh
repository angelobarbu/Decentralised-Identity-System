#!/bin/bash

# Define database and mnemonic file paths
GANACHE_DB=".ganache-db"
MNEMONIC_FILE=".ganache-mnemonic.txt"

# Load the mnemonic if it exists; otherwise, use the default one
if [ -f "$MNEMONIC_FILE" ]; then
    mnemonic=$(cat "$MNEMONIC_FILE")
    ganache-cli --db "$GANACHE_DB" \
      --mnemonic "$mnemonic" \
      --port 8545 \
      --networkId 5777
else
    echo "Could not load mnemonic. No mnemonic file found."
fi

