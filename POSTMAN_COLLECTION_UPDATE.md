# Postman Collection Update Summary

## ✅ What Was Updated

The Postman collection (`postman/NotesFlowBackend.postman_collection.json`) has been updated with comprehensive Page Service endpoints.

## 📊 Collection Structure

### Before Update
```
NotesFlow Backend Collection
├── Health (1 endpoint)
├── Auth (3 endpoints)
└── Workspaces (6 endpoints)

Total: 10 endpoints
```

### After Update
```
NotesFlow Backend Collection
├── Health (1 endpoint)
├── Auth (3 endpoints)
├── Workspaces (6 endpoints)
└── Pages (11 endpoints) ← NEW!

Total: 21 endpoints
```

## 🆕 New Variables Added

| Variable | Purpose | Auto-set |
|----------|---------|----------|
| `pageId` | Stores the current page ID | ✅ Yes (Create Root Page) |
| `childPageId` | Stores child page ID | ✅ Yes (Create Child Page) |

## 📋 New Page Endpoints (11 total)

### 1. **Create Root Page** (POST)
- **Endpoint**: `/api/v1/pages`
- **Purpose**: Create a new page at the root level of a workspace
- **Auto-saves**: `pageId` variable
- **Sample Content**: Includes heading, paragraph, and todo blocks

### 2. **Create Child Page** (POST)
- **Endpoint**: `/api/v1/pages`
- **Purpose**: Create a nested page under a parent
- **Auto-saves**: `childPageId` variable
- **Uses**: `pageId` as parent

### 3. **Get Page by ID** (GET)
- **Endpoint**: `/api/v1/pages/{{pageId}}`
- **Purpose**: Retrieve a specific page with full content
- **Returns**: Page data with content blocks

### 4. **Get Child Pages** (GET)
- **Endpoint**: `/api/v1/pages/{{pageId}}/children`
- **Purpose**: Get all direct children of a page
- **Returns**: Array of child pages

### 5. **Get Workspace Pages (Tree)** (GET)
- **Endpoint**: `/api/v1/workspaces/{{workspaceId}}/pages`
- **Purpose**: Get all pages in hierarchical tree structure
- **Returns**: Nested tree of all workspace pages

### 6. **Update Page (PUT)** (PUT)
- **Endpoint**: `/api/v1/pages/{{pageId}}`
- **Purpose**: Full update of page (title, icon, content)
- **Sample**: Includes heading, paragraph, and code blocks

### 7. **Update Page (PATCH)** (PATCH)
- **Endpoint**: `/api/v1/pages/{{pageId}}`
- **Purpose**: Partial update (e.g., just title)
- **Sample**: Updates only the title field

### 8. **Move Page** (PATCH)
- **Endpoint**: `/api/v1/pages/{{childPageId}}/move`
- **Purpose**: Move page to different parent or position
- **Sample**: Moves child page to root level

### 9. **Archive Page** (PATCH)
- **Endpoint**: `/api/v1/pages/{{pageId}}/archive`
- **Purpose**: Soft delete (archive) a page
- **Body**: `{"is_archived": true}`

### 10. **Unarchive Page** (PATCH)
- **Endpoint**: `/api/v1/pages/{{pageId}}/archive`
- **Purpose**: Restore an archived page
- **Body**: `{"is_archived": false}`

### 11. **Delete Page** (DELETE)
- **Endpoint**: `/api/v1/pages/{{pageId}}`
- **Purpose**: Permanently delete a page (owner only)
- **Returns**: 204 No Content on success

## 🎯 Sample Content Blocks

The collection includes examples of various block types:

### Heading Block
```json
{
  "id": "block-1",
  "type": "heading",
  "content": "Welcome to my page",
  "level": 1,
  "properties": {}
}
```

### Paragraph Block
```json
{
  "id": "block-2",
  "type": "paragraph",
  "content": "This is my first page in NotesFlow!",
  "properties": {}
}
```

### Todo Block
```json
{
  "id": "block-3",
  "type": "todo",
  "content": "Complete the setup",
  "properties": {
    "checked": false
  }
}
```

### Code Block
```json
{
  "id": "block-3",
  "type": "code",
  "content": "console.log('Hello, NotesFlow!');",
  "properties": {
    "language": "javascript"
  }
}
```

## 🔄 Auto-Save Test Scripts

The following requests include test scripts that automatically save response data to variables:

1. **Login** → Saves `authToken`
2. **Create Workspace** → Saves `workspaceId`
3. **Create Root Page** → Saves `pageId`
4. **Create Child Page** → Saves `childPageId`

This allows you to run requests sequentially without manually copying IDs!

## 🚀 Quick Test Workflow

Run these requests in order to test the complete flow:

```
1. Auth → Register
2. Auth → Login (saves authToken)
3. Workspaces → Create Workspace (saves workspaceId)
4. Pages → Create Root Page (saves pageId)
5. Pages → Create Child Page (saves childPageId)
6. Pages → Get Workspace Pages (Tree) (see the hierarchy)
7. Pages → Update Page (PUT) (modify content)
8. Pages → Move Page (move child to root)
9. Pages → Archive Page (soft delete)
10. Pages → Unarchive Page (restore)
```

## 📁 Files Updated

1. **`postman/NotesFlowBackend.postman_collection.json`**
   - Added 2 new collection variables
   - Added 11 new page endpoints
   - Added test scripts for auto-saving IDs
   - Validated JSON structure ✅

2. **`postman/README.md`** (NEW)
   - Complete guide for using the collection
   - Endpoint reference
   - Content block examples
   - Troubleshooting tips

## ✨ Features

- ✅ **Auto-save Variables**: IDs automatically saved to collection variables
- ✅ **Rich Examples**: Realistic content with multiple block types
- ✅ **Complete Coverage**: All 11 page endpoints included
- ✅ **Organized Structure**: Grouped by functionality
- ✅ **Ready to Use**: Import and start testing immediately
- ✅ **Valid JSON**: Validated and properly formatted

## 📖 Documentation

- **Collection Guide**: `postman/README.md`
- **API Quick Start**: `PAGES_QUICKSTART.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`

## 🎉 Result

The Postman collection is now **complete** with all NotesFlow backend endpoints:
- ✅ Health checks
- ✅ Authentication
- ✅ Workspace management
- ✅ **Page management (NEW!)**

You can now test the entire NotesFlow API from Postman! 🚀

