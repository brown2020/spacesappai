# Implementation Plan

Batches ordered by priority and dependency. Each batch is self-contained and shippable.

---

## Batch 1: Document Search (`Cmd+K`)
**Spec items:** 1.1
**Priority:** P0 — Users can't find their documents. This blocks everything.

### What's changing
- New `SearchDialog.tsx` — command palette triggered by `Cmd+K` / `Ctrl+K`
- Client-side filtering of documents already loaded by `useUserDocuments` (no new Firestore queries)
- Results show page icon, title, role badge
- Keyboard navigation (arrow keys + Enter)
- Search button in sidebar header as alternate trigger

### Files affected
| File | Change |
|------|--------|
| `src/components/SearchDialog.tsx` | **New** — command palette component |
| `src/components/Header.tsx` | Add `Cmd+K` keyboard listener |
| `src/components/Sidebar.tsx` | Add search button at top |
| `src/components/index.ts` | Export new component |

### Data model changes
None.

### Dependencies
None — fully independent.

---

## Batch 2: Viewer Role + Title Server Action
**Spec items:** 1.4, 2.2
**Priority:** P0 — Viewer role is required before public sharing. Title server action is a small fix that touches the same files.

### What's changing
- Add `"viewer"` to `RoomRole` type
- Viewers see document read-only: editor is non-editable, title/icon inputs disabled, invite/delete buttons hidden
- Owner can invite as "Editor" or "Viewer" (dropdown in invite flow)
- Owner can change a user's role in the manage users list
- New `updateUserRole()` server action
- New `updateDocumentTitle()` server action replacing direct Firestore writes
- Liveblocks auth endpoint returns appropriate permissions based on role
- Update Firestore rules to recognize `"viewer"` role

### Files affected
| File | Change |
|------|--------|
| `src/types/index.ts` | Add `"viewer"` to `RoomRole` |
| `src/lib/documentActions.ts` | Add `updateUserRole()`, `updateDocumentTitle()` actions |
| `src/hooks/use-document-title.ts` | Call server action instead of direct Firestore write |
| `src/hooks/use-owner.ts` | Expose `role` value (not just `isOwner` boolean) |
| `src/components/InviteUser.tsx` | Add role selector dropdown |
| `src/components/ManageUsers.tsx` | Show role badges, add role change for owner |
| `src/components/Document.tsx` | Conditionally hide edit controls for viewers |
| `src/components/Editor.tsx` | Read-only mode when user is viewer |
| `src/app/api/auth-endpoint/route.ts` | Grant read-only Liveblocks access for viewers |
| `firestore.rules` | Add `"viewer"` to valid roles, tighten client write access |

### Data model changes
```
users/{uid}/rooms/{documentId}
  role: "owner" | "editor" | "viewer"    (added "viewer")
```

### Dependencies
None — foundational for Batch 3.

---

## Batch 3: Public Sharing + Share Menu
**Spec items:** 1.3, 2.1
**Priority:** P0/P1 — Public sharing is table stakes. Share menu consolidation is natural to build at the same time since they share the same UI.

### What's changing
- New unified `ShareMenu.tsx` replacing separate InviteUser + ManageUsers buttons
- Share menu sections: invite (with role picker), people with access (with role management), public link toggle
- New `togglePublishDocument()` server action (owner only)
- New `/doc/[id]/public/page.tsx` route — unauthenticated, server-rendered, read-only
- Public page fetches Yjs document content from Liveblocks, renders as static BlockNote HTML
- Copy public link button
- `isPublished` field on Firestore document
- When unpublished, public route shows 404

### Files affected
| File | Change |
|------|--------|
| `src/components/ShareMenu.tsx` | **New** — unified share dialog |
| `src/app/doc/[id]/public/page.tsx` | **New** — public read-only route |
| `src/lib/documentActions.ts` | Add `togglePublishDocument()` action |
| `src/components/Document.tsx` | Replace InviteUser + ManageUsers buttons with single Share button |
| `src/components/InviteUser.tsx` | Remove (functionality moved to ShareMenu) |
| `src/components/ManageUsers.tsx` | Remove (functionality moved to ShareMenu) |
| `src/types/index.ts` | Add `isPublished` to `SpaceDocument` |
| `firestore.rules` | Add `isPublished` field validation, public read rule |

### Data model changes
```
documents/{documentId}
  + isPublished: boolean           (default false)
```

### Dependencies
Depends on Batch 2 (viewer role) for the role picker in the share menu.

---

## Batch 4: Cover Images
**Spec items:** 1.2
**Priority:** P1 — High visual impact. Makes documents feel polished.

### What's changing
- New `DocumentCover.tsx` — full-width cover image above title
- "Add cover" hover button when no cover exists
- "Change cover" / "Remove cover" controls when cover exists
- Cover source: paste image URL in a small input popover
- New `updateDocumentCover()` server action
- `coverImage` field on Firestore document
- Cover renders on public page too

### Files affected
| File | Change |
|------|--------|
| `src/components/DocumentCover.tsx` | **New** — cover image display + controls |
| `src/components/Document.tsx` | Render DocumentCover above header |
| `src/lib/documentActions.ts` | Add `updateDocumentCover()` action |
| `src/types/index.ts` | Add `coverImage` to `SpaceDocument` |
| `src/app/doc/[id]/public/page.tsx` | Render cover on public page |
| `firestore.rules` | Add `coverImage` field validation |

### Data model changes
```
documents/{documentId}
  + coverImage?: string | null     (URL)
```

### Dependencies
None — fully independent. But naturally follows Batch 3 since public page should show covers.

---

## Batch 5: Page-Level Comments
**Spec items:** 1.5
**Priority:** P1 — Key collaboration feature.

### What's changing
- Comments button in document toolbar showing comment count badge
- Side panel slides in from right with comment list + input
- Comments stored in Firestore subcollection `documents/{docId}/comments/{commentId}`
- Real-time updates via `useCollection`
- Anyone with access can comment (owner, editor, viewer)
- Delete own comments; owner can delete any
- Server actions: `addComment()`, `deleteComment()`

### Files affected
| File | Change |
|------|--------|
| `src/components/Comments.tsx` | **New** — comment panel + list |
| `src/components/CommentInput.tsx` | **New** — comment input form |
| `src/components/Document.tsx` | Add comments button + panel toggle |
| `src/lib/documentActions.ts` | Add `addComment()`, `deleteComment()` actions |
| `src/types/index.ts` | Add `Comment` type |
| `src/hooks/use-comments.ts` | **New** — hook for real-time comment data |
| `firestore.rules` | Add comments subcollection rules |

### Data model changes
```
documents/{documentId}/comments/{commentId}
  ├── authorId: string
  ├── authorName: string
  ├── authorAvatar?: string
  ├── content: string
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp
```

### Dependencies
Depends on Batch 2 (viewer role) since viewers should be able to comment.

---

## Batch 6: Soft Delete (Trash)
**Spec items:** 2.3
**Priority:** P2 — Safety net for accidental deletion.

### What's changing
- `deleteDocument()` becomes soft delete: sets `deletedAt` timestamp instead of removing data
- New `restoreDocument()` action to clear `deletedAt`
- New `permanentlyDeleteDocument()` action (current hard delete logic)
- Sidebar shows "Trash" section at bottom with deleted documents
- Trash items have "Restore" and "Delete forever" buttons
- `useUserDocuments` filters out documents where parent doc has `deletedAt` set
- Need a way to check `deletedAt` — either read the document metadata in the hook, or add `deletedAt` to the room entry

### Files affected
| File | Change |
|------|--------|
| `src/lib/documentActions.ts` | Modify `deleteDocument()` to soft delete, add `restoreDocument()`, `permanentlyDeleteDocument()` |
| `src/components/Sidebar.tsx` | Add trash section with restore/delete-forever |
| `src/hooks/use-user-documents.ts` | Separate active vs. deleted documents |
| `src/types/index.ts` | Add `deletedAt` to `SpaceDocument` |
| `src/components/Document.tsx` | Show "This document is in trash" banner if deleted |
| `firestore.rules` | Allow `deletedAt` field |

### Data model changes
```
documents/{documentId}
  + deletedAt?: Timestamp | null
```

### Dependencies
None — independent of other batches.

---

## Batch 7: Document Linking in Editor
**Spec items:** 1.6
**Priority:** P2 — Connects documents into a knowledge graph.

### What's changing
- Custom BlockNote slash command `/link` that opens a document search popover
- Popover shows user's documents (same data source as search dialog / sidebar)
- Selecting a document inserts a styled inline link: `[icon Title](/doc/id)`
- Link is clickable and navigates to the target document
- Static link text (title at time of insertion, not dynamically updated)

### Files affected
| File | Change |
|------|--------|
| `src/components/Editor.tsx` | Register custom slash command, configure link insertion |

### Data model changes
None — links stored in Yjs document content.

### Dependencies
Batch 1 (search) — shares the document search/filter logic.

---

## Batch Summary

| Batch | Items | Priority | Depends On | Estimated Scope |
|-------|-------|----------|------------|-----------------|
| **1** | Search (`Cmd+K`) | P0 | — | Small (1 new component) |
| **2** | Viewer Role + Title Action | P0 | — | Medium (type changes + many component updates) |
| **3** | Public Sharing + Share Menu | P0/P1 | Batch 2 | Large (new route + new component + consolidation) |
| **4** | Cover Images | P1 | — | Small (1 new component + 1 action) |
| **5** | Comments | P1 | Batch 2 | Medium (new subcollection + 2 components + 2 actions) |
| **6** | Soft Delete (Trash) | P2 | — | Medium (action changes + sidebar update) |
| **7** | Document Linking | P2 | Batch 1 | Small (editor customization) |

**Recommended implementation order:** 1 → 2 → 3 → 4 → 5 → 6 → 7

---

## What to Tell Me

Review this plan and tell me which batches to implement. Options:

- **"All"** — I'll implement batches 1-7 in order
- **"Batches 1-3"** — I'll do the P0 items only
- **"Batches 1-5"** — I'll do P0 + P1
- **"Batch N"** — I'll do a specific batch
- Or any combination you want
