#!/usr/bin/env bash
# Test script for page-service API endpoints
# Usage: ./scripts/test-page-service.sh <jwt_token> <workspace_id>

set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 <jwt_token> <workspace_id>"
  echo "Example: $0 'eyJhbGc...' '123e4567-e89b-12d3-a456-426614174000'"
  exit 1
fi

JWT_TOKEN="$1"
WORKSPACE_ID="$2"
API_URL="${API_URL:-http://localhost:4000/api/v1}"

echo "🧪 Testing Page Service API"
echo "API URL: $API_URL"
echo "Workspace ID: $WORKSPACE_ID"
echo ""

# Test 1: Create a root page
echo "📝 Test 1: Creating a root page..."
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/pages" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"workspace_id\": \"$WORKSPACE_ID\",
    \"title\": \"Test Page $(date +%s)\",
    \"icon\": \"📄\",
    \"content\": {
      \"blocks\": [
        {
          \"id\": \"block-1\",
          \"type\": \"heading\",
          \"content\": \"Welcome\",
          \"level\": 1,
          \"properties\": {}
        }
      ]
    }
  }")

PAGE_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PAGE_ID" ]; then
  echo "❌ Failed to create page"
  echo "$CREATE_RESPONSE"
  exit 1
fi

echo "✅ Created page with ID: $PAGE_ID"
echo ""

# Test 2: Get the page
echo "📖 Test 2: Getting the page..."
GET_RESPONSE=$(curl -s -X GET "$API_URL/pages/$PAGE_ID" \
  -H "Authorization: Bearer $JWT_TOKEN")

if echo "$GET_RESPONSE" | grep -q "$PAGE_ID"; then
  echo "✅ Successfully retrieved page"
else
  echo "❌ Failed to retrieve page"
  echo "$GET_RESPONSE"
fi
echo ""

# Test 3: Update the page
echo "✏️  Test 3: Updating the page..."
UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/pages/$PAGE_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Updated Test Page\",
    \"content\": {
      \"blocks\": [
        {
          \"id\": \"block-1\",
          \"type\": \"paragraph\",
          \"content\": \"Updated content\",
          \"properties\": {}
        }
      ]
    }
  }")

if echo "$UPDATE_RESPONSE" | grep -q "Updated Test Page"; then
  echo "✅ Successfully updated page"
else
  echo "❌ Failed to update page"
  echo "$UPDATE_RESPONSE"
fi
echo ""

# Test 4: Create a child page
echo "👶 Test 4: Creating a child page..."
CHILD_RESPONSE=$(curl -s -X POST "$API_URL/pages" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"workspace_id\": \"$WORKSPACE_ID\",
    \"parent_page_id\": \"$PAGE_ID\",
    \"title\": \"Child Page\",
    \"icon\": \"📝\"
  }")

CHILD_ID=$(echo "$CHILD_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$CHILD_ID" ]; then
  echo "✅ Created child page with ID: $CHILD_ID"
else
  echo "❌ Failed to create child page"
  echo "$CHILD_RESPONSE"
fi
echo ""

# Test 5: Get workspace pages (tree)
echo "🌲 Test 5: Getting workspace pages tree..."
TREE_RESPONSE=$(curl -s -X GET "$API_URL/workspaces/$WORKSPACE_ID/pages" \
  -H "Authorization: Bearer $JWT_TOKEN")

if echo "$TREE_RESPONSE" | grep -q "$PAGE_ID"; then
  echo "✅ Successfully retrieved workspace pages tree"
else
  echo "❌ Failed to retrieve workspace pages"
  echo "$TREE_RESPONSE"
fi
echo ""

# Test 6: Archive the page
echo "📦 Test 6: Archiving the page..."
ARCHIVE_RESPONSE=$(curl -s -X PATCH "$API_URL/pages/$PAGE_ID/archive" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"is_archived\": true}")

if echo "$ARCHIVE_RESPONSE" | grep -q '"is_archived":true'; then
  echo "✅ Successfully archived page"
else
  echo "❌ Failed to archive page"
  echo "$ARCHIVE_RESPONSE"
fi
echo ""

# Test 7: Unarchive the page
echo "📂 Test 7: Unarchiving the page..."
UNARCHIVE_RESPONSE=$(curl -s -X PATCH "$API_URL/pages/$PAGE_ID/archive" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"is_archived\": false}")

if echo "$UNARCHIVE_RESPONSE" | grep -q '"is_archived":false'; then
  echo "✅ Successfully unarchived page"
else
  echo "❌ Failed to unarchive page"
fi
echo ""

echo "🎉 All tests completed!"
echo ""
echo "Created pages:"
echo "  - Root page: $PAGE_ID"
echo "  - Child page: $CHILD_ID"
echo ""
echo "You can clean up by deleting these pages manually if needed."

