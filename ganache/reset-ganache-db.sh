#!/bin/bash

# Path to the Ganache database and mnemonic file
GANACHE_DB=".ganache-db"
MNEMONIC_FILE=".ganache-mnemonic.txt"

# Function to generate a new random mnemonic
generate_new_mnemonic() {
    # Generate 12 random words using OpenSSL
    words=(apple banana cherry date eagle falcon grape honey ice jelly kite lemon mango nut olive pear queen rose star tiger umbrella violet whale xray yellow zebra)
    mnemonic=""
    for i in {1..12}; do
        mnemonic+="${words[RANDOM % ${#words[@]}]} "
    done
    echo "$mnemonic" | sed 's/ *$//'
}

# Check if the database exists
if [ -d "$GANACHE_DB" ]; then
    # Confirm deletion
    read -p "Are you sure you want to COMPLETELY delete the Ganache database and generate NEW accounts? (y/n): " confirm
    if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
        # Stop Ganache if it's running
        pkill -f ganache-cli 2>/dev/null

        # Delete the database
        rm -rf "$GANACHE_DB"
        echo "Ganache database deleted successfully."

        # Generate a new mnemonic
        new_mnemonic=$(generate_new_mnemonic)
        echo "$new_mnemonic" > "$MNEMONIC_FILE"
        echo "New mnemonic generated and saved to $MNEMONIC_FILE."
        echo "Mnemonic: $new_mnemonic"
    else
        echo "Deletion canceled."
    fi
else
    echo "No Ganache database found at $GANACHE_DB."
fi
