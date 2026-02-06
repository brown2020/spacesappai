# spec.md — Spaces Improvement Spec

> Bridges from CLAUDE.md (what we have) to competitor-analysis.md (what we need).
> Focused on: **document creation, linking, and sharing.**

---

## 1. Table Stakes Gaps

Things Notion has that we're missing and must add to be competitive.

---

### 1.1 Document Search

**What we have:** Nothing. No way to find a document except scrolling the sidebar.

**What Notion does:** Full-text search across all pages. Filter by date, type, team. Recent pages. Keyboard shortcut (`Cmd+K`).

**What we'll build:**
- `Cmd+K` / `Ctrl+K` opens a search dialog (command palette style)
- Searches document **titles** across all documents the user has access to (owner + editor)
- Results show: page icon, title, role badge, last updated time
- Click a result → navigate to that document
- Debounced input, instant results (client-side filtering from already-loaded sidebar data for speed; no new Firestore queries needed since `useUserDocuments` already fetches all user documents)
- Empty state: "No documents found"
- Keyboard navigation: arrow keys + Enter to select

**Files affected:** New `SearchDialog.tsx` component, update `Header.tsx` to add trigger, update `Sidebar.tsx` to add search button

**Data model changes:** None — we already have all document titles loaded in the sidebar via `useUserDocuments`

---

### 1.2 Cover Images

**What we have:** Page icons (emoji) only. No visual banner.

**What Notion does:** Full-width cover image at the top of every page. Choose from gallery, upload, paste URL, or Unsplash. Repositionable.

**What we'll build:**
- Optional cover image displayed as a full-width banner above the document title
- "Add cover" button appears on hover above the title area (like Notion)
- Cover source: paste an image URL. (No upload or Unsplash integration for v1 — keep it simple)
- "Change cover" and "Remove cover" buttons when a cover exists
- Cover stored as a `coverImage: string | null` field on the Firestore document
- Server action `updateDocumentCover(roomId, url)` with auth + access verification
- Cover displays in a fixed-height container with `object-cover` for consistent appearance

**Files affected:** Update `Document.tsx` to render cover, new `DocumentCover.tsx` component, update `documentActions.ts` with new server action, update Firestore rules for `coverImage` field, update `SpaceDocument` type

**Data model changes:**
```
documents/{documentId}
  + coverImage?: string | null     (URL)
```

---

### 1.3 Public Sharing (Publish to Web)

**What we have:** Documents are only accessible to invited users (owner + editors). No way to share a read-only link.

**What Notion does:** "Publish" tab in share menu. One toggle makes the page publicly accessible via URL. Anyone with the link can view.

**What we'll build:**
- New "Share" button in the document header (next to Invite/Delete)
- Opens a share popover/dialog with two sections:
  1. **People with access** — existing user list (currently in ManageUsers)
  2. **Public access** — toggle switch: "Publish to web"
- When published:
  - Document is accessible at `/doc/[id]/public` (new route) without authentication
  - The page renders the document content read-only (no editor, no toolbar, no cursor tracking)
  - Shows: cover image, icon, title, rendered BlockNote content
  - Shows a "Built with Spaces" footer with link to home
- When unpublished: the public route returns 404
- `isPublished: boolean` field on the Firestore document (default `false`)
- Server action `togglePublishDocument(roomId, publish: boolean)` — owner only
- Public route fetches document content from Liveblocks Yjs storage via the server (Admin/Node SDK), renders it as static HTML
- Copy link button for the public URL

**Files affected:** New `ShareDialog.tsx` component, new `src/app/doc/[id]/public/page.tsx` route, update `documentActions.ts`, update `Document.tsx` header, update types, update Firestore rules

**Data model changes:**
```
documents/{documentId}
  + isPublished: boolean           (default false)
```

---

### 1.4 Viewer Role

**What we have:** Two roles: owner and editor. Everyone who has access can edit.

**What Notion does:** Four levels: full access, can edit, can comment, can view.

**What we'll build:**
- Add `"viewer"` to the `RoomRole` type: `"owner" | "editor" | "viewer"`
- Viewers can:
  - See the document (read-only BlockNote view)
  - See the sidebar entry
  - See other users' avatars and cursors
- Viewers cannot:
  - Edit document content
  - Change title or icon
  - Invite or remove users
  - Delete the document
- When inviting a user, the owner chooses "Editor" or "Viewer" from a dropdown
- In ManageUsers, show the role badge and allow owner to change roles
- Liveblocks auth endpoint grants read-only access for viewers
- Editor toolbar and edit controls hidden for viewers

**Files affected:** Update `InviteUser.tsx` (role picker), update `ManageUsers.tsx` (role display + change), update `Editor.tsx` (read-only mode), update `Document.tsx` (hide edit controls), update `auth-endpoint/route.ts` (Liveblocks permissions), update types, update Firestore rules, update `documentActions.ts` (new `updateUserRole` action)

**Data model changes:**
```
users/{uid}/rooms/{documentId}
  role: "owner" | "editor" | "viewer"    (was: "owner" | "editor")
```

---

### 1.5 Page-Level Comments

**What we have:** Nothing. No way to leave feedback on a document.

**What Notion does:** Page-level discussion thread + inline comments on specific blocks. Threaded replies. Resolve/unresolve. @-mentions.

**What we'll build (v1 — page-level only, no inline):**
- Comments button in the document toolbar (shows count badge)
- Opens a comments side panel (slide-in from right)
- Anyone with access (owner, editor, viewer) can add comments
- Each comment shows: author name, avatar, timestamp, message text
- Comments are stored in a Firestore subcollection: `documents/{docId}/comments/{commentId}`
- Real-time updates via `useCollection` (react-firebase-hooks)
- Delete own comments. Owner can delete any comment
- Sorted by newest first
- Empty state: "No comments yet. Start a discussion."

**Not in v1:** Inline/block-level comments, threaded replies, resolve/unresolve, @-mentions, notifications

**Files affected:** New `Comments.tsx` component, new `CommentInput.tsx`, update `Document.tsx` (add comments button + panel), new server actions in `documentActions.ts` (`addComment`, `deleteComment`), update types, update Firestore rules

**Data model changes:**
```
documents/{documentId}/comments/{commentId}
  ├── authorId: string
  ├── authorName: string
  ├── authorAvatar?: string
  ├── content: string
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp
```

---

### 1.6 Document Search / Linking Within the Editor

**What we have:** No way to reference another document from within a document.

**What Notion does:** Type `@` or `[[` to search and insert an inline link to another page. Dynamic titles. Backlinks.

**What we'll build (v1 — link insertion only):**
- In the BlockNote editor, add a custom slash command: `/link`
- Triggers a search popover showing the user's documents (same data as sidebar)
- User selects a document → inserts an inline link with the document's icon and title
- The link navigates to `/doc/[id]` when clicked
- Link text is the document title at the time of insertion (not dynamically updated in v1)

**Not in v1:** `@` or `[[` trigger syntax, dynamic title updates, backlinks, block-level links

**Files affected:** Update `Editor.tsx` to register custom slash command, new inline content type or BlockNote link configuration

**Data model changes:** None — links are stored in Yjs document content

---

## 2. Improvement Opportunities

Things we both have, but Notion does better.

---

### 2.1 Share Menu Consolidation

**What we have:** Three separate buttons/dialogs: "Invite" (InviteUser), "Users (N)" (ManageUsers), and "Delete" (DeleteDocument). Scattered across the document header.

**What Notion does:** One "Share" button that opens a unified popover: invite, manage access, publish to web, copy link — all in one place.

**What we'll build:**
- Consolidate into a single **"Share" button** that opens a unified dialog/popover
- Sections:
  1. **Invite** — email input + role selector (editor/viewer) + send button
  2. **People with access** — list of users, their roles, remove/change role options
  3. **Public link** — publish toggle + copy URL button
- Remove the separate InviteUser, ManageUsers components as standalone buttons
- Keep DeleteDocument as a separate action (destructive actions shouldn't live in the share menu)

**Files affected:** New `ShareMenu.tsx` (consolidates InviteUser + ManageUsers + public sharing), update `Document.tsx` header layout

---

### 2.2 Title Editing via Server Action

**What we have:** `use-document-title` writes directly to Firestore via the client SDK, bypassing server-side validation.

**What Notion does:** N/A (implementation detail), but the pattern should be: all writes go through validated server actions.

**What we'll build:**
- New server action `updateDocumentTitle(roomId, title)` in `documentActions.ts`
- Verifies auth + room access (any role except viewer can update)
- Validates title (non-empty, <= 500 chars)
- Uses `FieldValue.serverTimestamp()` for `updatedAt`
- Update `use-document-title` hook to call the server action instead of direct Firestore write
- Keep optimistic updates for instant UI feedback

**Files affected:** Update `documentActions.ts`, update `use-document-title.ts`, update Firestore rules (can tighten client-side write access)

---

### 2.3 Soft Delete (Trash)

**What we have:** Delete is permanent and immediate. No recovery.

**What Notion does:** Soft delete to trash. 30-day retention. Restore option.

**What we'll build:**
- Instead of permanent deletion, set `deletedAt: Timestamp` on the document
- Deleted documents disappear from the sidebar but are not removed from Firestore
- New "Trash" section at the bottom of the sidebar
- Trash shows deleted documents with "Restore" and "Delete forever" options
- Auto-purge: a note in the UI says "Documents in trash are permanently deleted after 30 days" (actual auto-purge can be a Cloud Function later; for now, manual)
- "Delete forever" does the current permanent deletion

**Files affected:** Update `deleteDocument()` action (soft delete), new `restoreDocument()` and `permanentlyDeleteDocument()` actions, update `Sidebar.tsx` (trash section), update `useUserDocuments` (filter out deleted), update types

**Data model changes:**
```
documents/{documentId}
  + deletedAt?: Timestamp | null
```

---

## 3. Differentiators

Things we can do that Notion doesn't, or ways we can be meaningfully better.

---

### 3.1 Live Cursors (Already Have — Polish)

**What we have:** Live cursor tracking with name tags and colors. Notion doesn't have this.

**What we'll improve:**
- This already works well. No changes needed in this spec cycle.
- Future: show who's actively typing (typing indicator), selection highlighting.

---

### 3.2 AI at Every Tier

**What we have:** AI translation and Q&A available to all users. Notion locks AI behind $15/month Business plan.

**What we'll improve:**
- No changes needed for this spec. Already a differentiator.
- Future: inline AI assistance within the editor (not just modal dialogs).

---

### 3.3 Open Source

**What we have:** AGPL-3.0 license. Full source available.

**What we'll improve:**
- No code changes. This is a positioning differentiator.

---

## 4. Not Doing

Things Notion has that we're intentionally skipping and why.

| Feature | Why We're Skipping It |
|---------|----------------------|
| **Databases / Kanban / Calendar / Timeline** | Not our product. We're a document editor, not a project management tool. This is Notion's complexity moat and also their bloat. |
| **Template gallery** | Premature. Need more block types and features first. Templates are a growth/content play, not a core feature. |
| **Inline comments** | Complex to build well (anchoring comments to specific text ranges in a CRDT-based editor). Page-level comments first, inline later. |
| **Threaded comment replies** | Over-engineering for v1. Flat comments are fine to start. |
| **@-mention notifications** | Requires a notification system. Too much infrastructure for this cycle. |
| **Email notifications** | Same — requires notification infrastructure + email service. |
| **Page version history** | Liveblocks has Yjs history but exposing it as a user-facing feature requires significant UI work. Later. |
| **Columns / multi-column layout** | BlockNote may support this eventually. Not worth custom work now. |
| **File attachments / uploads** | Requires Firebase Storage or similar. Out of scope for document creation focus. |
| **Embeds (500+ services)** | BlockNote supports some embeds out of the box. Not worth custom embed system. |
| **Custom fonts / page styling** | Nice-to-have, not table stakes. |
| **Dynamic link titles (auto-update)** | Requires Yjs content indexing + update propagation. Complex for marginal benefit. v2. |
| **Backlinks** | Requires indexing which documents link to which. Doable but not critical for v1 linking. |
| **Offline support** | Web-first. Notion's offline is broken too. Not a competitive disadvantage. |
| **Desktop/mobile native apps** | Web app only for now. Responsive design covers mobile. |

---

## Implementation Priority

Ordered by impact and dependency:

| Priority | Item | Rationale |
|----------|------|-----------|
| **P0** | 1.1 Document Search | Foundational UX. Users can't find their docs. Blocks adoption. |
| **P0** | 1.4 Viewer Role | Required for public sharing to make sense. Must exist before 1.3. |
| **P0** | 1.3 Public Sharing | Table stakes for document sharing. High-visibility feature. |
| **P1** | 2.1 Share Menu Consolidation | Groups invite, manage, and publish into one clean UI. Depends on 1.3 + 1.4. |
| **P1** | 1.2 Cover Images | High-impact visual feature. Makes documents feel polished. |
| **P1** | 2.2 Title via Server Action | Security/consistency fix. Small effort. |
| **P1** | 1.5 Page-Level Comments | Key collaboration feature. Independent of other work. |
| **P2** | 2.3 Soft Delete (Trash) | Safety net. Users fear permanent deletion. |
| **P2** | 1.6 Document Linking | Connects the knowledge graph. Depends on search data being available. |
