#!/bin/bash

echo "🚀 Starting Live Survey Prototype..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start agent app in background
echo "📱 Starting Agent App on port 3000..."
cd "$SCRIPT_DIR/apps/agent-app" && npm run dev > /dev/null 2>&1 &
AGENT_PID=$!

# Wait a moment for agent to start
sleep 2

# Start customer app in background
echo "👤 Starting Customer App on port 3001..."
cd "$SCRIPT_DIR/apps/customer-app" && npm run dev > /dev/null 2>&1 &
CUSTOMER_PID=$!

echo ""
echo "✅ Both apps are running!"
echo ""
echo "🔗 Agent Console:    http://localhost:3000?session=ddce5223-0102-4235-bf55-ccd1bac5be29"
echo "🔗 Customer Survey:  http://localhost:3001?session=ddce5223-0102-4235-bf55-ccd1bac5be29"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $AGENT_PID $CUSTOMER_PID 2>/dev/null
    exit
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait $AGENT_PID $CUSTOMER_PID