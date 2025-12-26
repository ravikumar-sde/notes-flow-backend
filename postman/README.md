# NotesFlow Backend - Postman Collection

This Postman collection contains all API endpoints for the NotesFlow backend services.

## 📥 Import the Collection

1. Open Postman
2. Click **Import** button
3. Select `NotesFlowBackend.postman_collection.json`
4. The collection will be imported with all endpoints

## 🔧 Collection Variables

The collection uses the following variables that are automatically set:

| Variable | Description | Auto-set by |
|----------|-------------|-------------|
| `baseUrl` | API Gateway URL (default: http://localhost:4000) | Manual |
| `authToken` | JWT authentication token | Login request |
| `workspaceId` | Current workspace ID | Create Workspace request |
| `pageId` | Current page ID | Create Root Page request |
| `childPageId` | Child page ID | Create Child Page request |

## 🚀 Quick Start Workflow

### 1. Register & Login
```
1. Auth → Register (create a new user)
2. Auth → Login (get JWT token - auto-saved to authToken variable)
3. Auth → Me (verify authentication)
```

### 2. Create a Workspace
```
4. Workspaces → Create Workspace (auto-saves workspaceId)
5. Workspaces → List Workspaces (see all your workspaces)
```

### 3. Create Pages
```
6. Pages → Create Root Page (auto-saves pageId)
7. Pages → Create Child Page (creates a nested page, auto-saves childPageId)
8. Pages → Get Workspace Pages (Tree) (see the hierarchical structure)
```

### 4. Manage Pages
```
9. Pages → Get Page by ID (view a specific page)
10. Pages → Update Page (PUT) (full update)
11. Pages → Update Page (PATCH) (partial update)
12. Pages → Move Page (change parent or position)
13. Pages → Archive Page (soft delete)
14. Pages → Unarchive Page (restore)
15. Pages → Delete Page (permanent delete - owner only)
```

## 📋 Available Endpoints

### Health
- **GET** `/api/v1/health` - Check API Gateway health

### Auth
- **POST** `/api/v1/auth/register` - Register new user
- **POST** `/api/v1/auth/login` - Login and get JWT token
- **GET** `/api/v1/auth/me` - Get current user info

### Workspaces
- **POST** `/api/v1/workspaces` - Create workspace
- **GET** `/api/v1/workspaces` - List all workspaces
- **GET** `/api/v1/workspaces/:id` - Get workspace by ID
- **PUT** `/api/v1/workspaces/:id` - Update workspace (full)
- **PATCH** `/api/v1/workspaces/:id` - Update workspace (partial)
- **DELETE** `/api/v1/workspaces/:id` - Delete workspace

### Pages
- **POST** `/api/v1/pages` - Create a new page
- **GET** `/api/v1/pages/:id` - Get page by ID
- **GET** `/api/v1/pages/:id/children` - Get child pages
- **GET** `/api/v1/workspaces/:workspaceId/pages` - Get all workspace pages (tree)
- **PUT** `/api/v1/pages/:id` - Update page (full)
- **PATCH** `/api/v1/pages/:id` - Update page (partial)
- **PATCH** `/api/v1/pages/:id/move` - Move page to different parent
- **PATCH** `/api/v1/pages/:id/archive` - Archive/unarchive page
- **DELETE** `/api/v1/pages/:id` - Delete page permanently

## 🎯 Example: Complete Flow

Here's a complete example workflow:

```
1. Register → Creates user account
2. Login → Returns JWT token (auto-saved)
3. Create Workspace → Returns workspace (ID auto-saved)
4. Create Root Page → Creates "My First Page" (ID auto-saved)
5. Create Child Page → Creates nested page under root
6. Get Workspace Pages (Tree) → See hierarchical structure:
   {
     "pages": [
       {
         "id": "...",
         "title": "My First Page",
         "children": [
           {
             "id": "...",
             "title": "Child Page",
             "children": []
           }
         ]
       }
     ]
   }
7. Update Page → Change title and content
8. Move Page → Move child to root level
9. Archive Page → Soft delete
10. Unarchive Page → Restore
```

## 📝 Content Block Examples

Pages support various block types in the `content.blocks` array:

### Heading
```json
{
  "id": "block-1",
  "type": "heading",
  "content": "My Heading",
  "level": 1,
  "properties": {}
}
```

### Paragraph
```json
{
  "id": "block-2",
  "type": "paragraph",
  "content": "This is a paragraph of text.",
  "properties": {}
}
```

### Todo
```json
{
  "id": "block-3",
  "type": "todo",
  "content": "Complete this task",
  "properties": {
    "checked": false
  }
}
```

### Code
```json
{
  "id": "block-4",
  "type": "code",
  "content": "console.log('Hello!');",
  "properties": {
    "language": "javascript"
  }
}
```

### Bulleted List
```json
{
  "id": "block-5",
  "type": "bulleted_list",
  "content": "List item",
  "properties": {}
}
```

## 🔐 Authentication

All endpoints except `/health`, `/auth/register`, and `/auth/login` require authentication.

The JWT token is automatically included in requests via the `Authorization: Bearer {{authToken}}` header.

## 🐛 Troubleshooting

### "Unauthorized" errors
- Make sure you've logged in and the `authToken` variable is set
- Check if your token has expired (tokens expire after 7 days)
- Re-run the Login request to get a fresh token

### "Workspace not found" errors
- Ensure you've created a workspace first
- Check that the `workspaceId` variable is set correctly
- Verify you have access to the workspace

### "Page not found" errors
- Ensure the page exists and you have access
- Check that the `pageId` variable is set correctly
- Verify the page belongs to the workspace you have access to

## 💡 Tips

1. **Auto-save Variables**: The Login, Create Workspace, and Create Page requests automatically save IDs to collection variables
2. **Test Scripts**: Check the "Tests" tab in requests to see how variables are auto-saved
3. **Environment**: You can create different environments (dev, staging, prod) with different `baseUrl` values
4. **Folders**: Requests are organized by service (Auth, Workspaces, Pages)
5. **Order**: Run requests in order for the best experience (top to bottom)

## 📚 Additional Resources

- [API Documentation](../PAGES_QUICKSTART.md)
- [Implementation Summary](../IMPLEMENTATION_SUMMARY.md)
- [Page Service README](../services/page-service/README.md)

