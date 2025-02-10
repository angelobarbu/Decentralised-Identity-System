#!/bin/bash

# Load environment variables from .ganache-env file
ENV_FILE=".env"

if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
else
    echo "Error: Environment file '$ENV_FILE' not found!"
    exit 1
fi

# Path to the Ganache database and mnemonic file
GANACHE_DB=".ganache-db"
MNEMONIC_FILE=".ganache-mnemonic.txt"

# Function to generate a new random mnemonic
generate_new_mnemonic() {
    if [ -z "$MNEMONIC_WORDS" ]; then
        echo "Error: MNEMONIC_WORDS variable is not set in '$ENV_FILE'."
        exit 1
    fi

    # Convert the space-separated words into an array
    IFS=' ' read -r -a words <<< "$MNEMONIC_WORDS"


    # Generate 12 random words using OpenSSL
    mnemonic=""
    for i in {1..12}; do
        mnemonic+="${words[RANDOM % ${#words[@]}]} "
    done
    echo "$mnemonic" | sed 's/ *$//'
}

# Function to setup Ganache for the first time
setup_ganache() {
    if [ -d "$GANACHE_DB" ]; then
        echo "Ganache is already set up. Run with 'reset' to regenerate accounts."
        exit 1
    fi

    # Generate and save a new mnemonic
    new_mnemonic=$(generate_new_mnemonic)
    echo "$new_mnemonic" > "$MNEMONIC_FILE"
    
    # Create the database directory
    mkdir -p "$GANACHE_DB"
    
    echo "Ganache setup complete."
    echo "Mnemonic saved to $MNEMONIC_FILE."
    echo "Mnemonic: $new_mnemonic"
}

# Function to reset Ganache
reset_ganache() {
    if [ ! -d "$GANACHE_DB" ]; then
        echo "No Ganache database found. Consider running 'setup' first."
        exit 1
    fi

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

        # Recreate the database directory
        mkdir -p "$GANACHE_DB"
    else
        echo "Reset canceled."
    fi
}

# Main script logic
case "$1" in
    setup)
        setup_ganache
        ;;
    reset)
        reset_ganache
        ;;
    *)
        echo "Usage: $0 {setup|reset}"
        exit 1
        ;;
esac