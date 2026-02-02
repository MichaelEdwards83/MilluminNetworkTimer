#!/bin/bash
cd "$(dirname "$0")"

echo "---------------------------------------------------"
echo "  STARTING MILLUMIN WEB TIMER"
echo "---------------------------------------------------"

# Check if Node is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js could not be found."
    echo "   Please install Node.js from https://nodejs.org/"
    exit
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies (first run only)..."
    npm install
fi

# Start Server
echo "🚀 Starting Server..."
node server.js
