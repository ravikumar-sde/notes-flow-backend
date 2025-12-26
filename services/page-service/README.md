# Page Service

The Page Service handles all page-related operations for the NotesFlow application, including creating, reading, updating, deleting, and organizing pages within workspaces.

## Features

- ✅ Create pages within workspaces
- ✅ Hierarchical page structure (parent-child relationships)
- ✅ Rich content storage (JSONB blocks)
- ✅ Page metadata (title, icon, cover image)
- ✅ Archive/unarchive pages
- ✅ Move pages between parents
- ✅ Permission-based access control
- ✅ Redis caching for performance
- ✅ NATS event publishing

## API Endpoints

### Pages

- `POST /pages` - Create a new page
- `GET /pages/:id` - Get a single page
- `GET /pages/:id/children` - Get child pages
- `PUT /pages/:id` - Update a page
- `PATCH /pages/:id` - Partially update a page
- `PATCH /pages/:id/move` - Move a page to a different parent
- `PATCH /pages/:id/archive` - Archive/unarchive a page
- `DELETE /pages/:id` - Delete a page permanently

### Workspace Pages

- `GET /workspaces/:workspaceId/pages` - Get all pages in a workspace (tree structure)

## Environment Variables

```env
PORT=4003
DATABASE_URL=postgres://notesflow:notesflow@localhost:5432/notesflow
REDIS_URL=redis://localhost:6379/0
NATS_URL=nats://localhost:4222
PAGE_CACHE_TTL_SECONDS=600
CORS_ORIGIN=*
NODE_ENV=development
```

## Running the Service

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm install --production
npm start
```

### Run Migrations
```bash
npm run migrate
```

## Database Schema

### Pages Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| workspace_id | UUID | Foreign key to workspaces |
| parent_page_id | UUID | Foreign key to pages (nullable) |
| title | TEXT | Page title |
| content | JSONB | Page content (blocks) |
| icon | TEXT | Emoji or image URL |
| cover_image | TEXT | Cover image URL |
| is_archived | BOOLEAN | Archive status |
| position | INTEGER | Order within parent |
| created_by | UUID | User who created the page |
| last_edited_by | UUID | User who last edited |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## Content Structure

Pages store content as JSONB blocks:

```json
{
  "blocks": [
    {
      "id": "block-uuid-1",
      "type": "heading",
      "content": "My Heading",
      "level": 1,
      "properties": {}
    },
    {
      "id": "block-uuid-2",
      "type": "paragraph",
      "content": "This is a paragraph",
      "properties": {}
    }
  ]
}
```

## Permissions

- **Owner**: Full access (create, read, update, delete, archive)
- **Admin**: Full access (create, read, update, delete, archive)
- **Member**: Can create, read, update pages
- **Viewer**: Read-only access

## Events Published

- `page.created` - When a page is created
- `page.updated` - When a page is updated
- `page.deleted` - When a page is deleted
- `page.archived` - When a page is archived/unarchived
- `page.moved` - When a page is moved to a different parent

## Caching Strategy

- Page data cached by ID
- Workspace pages cached by workspace ID
- Child pages cached by parent page ID
- Cache invalidation on create, update, delete, move, archive operations

