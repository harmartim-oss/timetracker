# Legal Research Bookmarks Feature

## Overview
The Legal Research Bookmarks feature allows users to save, organize, and manage legal research results by client and matter for easy reference and sharing.

## Features

### 1. Save Research Results
- Click the "Save" button on any legal research result
- Associate the result with a specific client and matter
- Add custom notes about why the resource is relevant
- Results are stored in browser localStorage for persistence

### 2. View Saved Bookmarks
- Access saved bookmarks through the "Saved Research" tab in the AI Assistant
- View all bookmarked resources with their metadata:
  - Client name
  - Matter description
  - Date saved
  - Custom notes
  - Full resource details (title, summary, citation, URL)

### 3. Organize by Client/Matter
- Bookmarks are tagged with client and matter information
- Easy filtering and organization for case-specific research
- Quick identification of resources saved for specific clients

### 4. Manage Bookmarks
- Delete bookmarks that are no longer needed
- View resource directly from the bookmark
- Notes field helps remember why a resource was saved

## Technical Implementation

### Storage
Bookmarks are stored in browser localStorage using the key `legal_research_bookmarks`. Each bookmark includes:
- Unique ID
- All original research result data (title, type, summary, citation, URL, etc.)
- Client name
- Matter name
- Custom notes
- Timestamp (savedAt)

### API Functions (geminiService.js)

#### `saveResearchBookmark(result, client, matter, notes)`
Saves a new research result as a bookmark.
- **Parameters:**
  - `result`: Research result object
  - `client`: Client name (optional)
  - `matter`: Matter description (optional)
  - `notes`: Custom notes (optional)
- **Returns:** Saved bookmark object or null

#### `getResearchBookmarks()`
Retrieves all saved bookmarks.
- **Returns:** Array of bookmark objects

#### `deleteResearchBookmark(bookmarkId)`
Deletes a bookmark by ID.
- **Parameters:**
  - `bookmarkId`: ID of bookmark to delete
- **Returns:** Boolean success status

#### `getBookmarksByClient(clientName)`
Retrieves bookmarks for a specific client.
- **Parameters:**
  - `clientName`: Name of client
- **Returns:** Array of matching bookmarks

#### `getBookmarksByMatter(matterName)`
Retrieves bookmarks for a specific matter.
- **Parameters:**
  - `matterName`: Name of matter
- **Returns:** Array of matching bookmarks

#### `updateResearchBookmark(bookmarkId, updates)`
Updates an existing bookmark.
- **Parameters:**
  - `bookmarkId`: ID of bookmark to update
  - `updates`: Object with fields to update
- **Returns:** Updated bookmark object or null

## Usage Examples

### Saving a Bookmark
1. Perform a legal research query
2. Browse the results
3. Click "Save" on any relevant result
4. Fill in the bookmark form:
   - Select or enter client name
   - Select or enter matter description
   - Add notes about relevance
5. Click "Save Bookmark"

### Viewing Bookmarks
1. Open AI Assistant
2. Click "Saved Research" tab
3. View all saved bookmarks with full details
4. Click "View Resource" to open the original source
5. Delete bookmarks using the trash icon

### Best Practices
- Always add notes to explain why a resource is relevant
- Associate bookmarks with the correct client and matter
- Regularly review and clean up old bookmarks
- Use descriptive matter names for easy searching

## Integration with Clients Feature
When clients are added through the Client Manager:
- The bookmark form shows a dropdown of existing clients
- Selecting a client shows associated matters in a dropdown
- This ensures consistency in naming and organization

## Future Enhancements
Potential improvements for future versions:
- Export bookmarks to PDF or Word
- Share bookmarks with colleagues
- Sync bookmarks across devices
- Advanced search within bookmarks
- Tags and categories
- Email bookmarks to clients
- Integration with document management systems
