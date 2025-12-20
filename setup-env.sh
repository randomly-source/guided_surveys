#!/bin/bash

# Setup script for environment variables

echo "🔧 Setting up environment variables..."

# Create .env.local for agent-app
cat > apps/agent-app/.env.local << 'EOF'
# Supabase Configuration
# Get these values from your Supabase project dashboard: https://app.supabase.com
# Go to Settings > API to find your URL and anon/public key

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Customer App URL (defaults to http://localhost:3001 if not set)
# NEXT_PUBLIC_CUSTOMER_APP_URL=http://localhost:3001
EOF

# Create .env.local for customer-app
cat > apps/customer-app/.env.local << 'EOF'
# Supabase Configuration
# Get these values from your Supabase project dashboard: https://app.supabase.com
# Go to Settings > API to find your URL and anon/public key

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOF

echo "✅ Created .env.local files in both apps"
echo ""
echo "📝 Next steps:"
echo "1. Get your Supabase credentials from https://app.supabase.com"
echo "2. Edit apps/agent-app/.env.local and add your SUPABASE_URL and SUPABASE_ANON_KEY"
echo "3. Edit apps/customer-app/.env.local and add your SUPABASE_URL and SUPABASE_ANON_KEY"
echo "4. See ENV_SETUP.md for database setup instructions"

