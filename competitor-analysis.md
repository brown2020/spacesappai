# Competitor Analysis: Notion.so

**Focus area:** Document creation, linking, and sharing.
We are not trying to replicate Notion's databases, kanban boards, timelines, or project management features. We're building a fast, simple, AI-powered collaborative document editor.

---

## 1. Core Value Prop

**What Notion solves for documents:** A single place to create, organize, link, and share documents with your team. Every document is a composable page of blocks. Documents link to each other. Sharing is granular — from private to fully public on the web.

**Why people use it for docs:** Flexibility. A blank page that can become anything — meeting notes, a spec, a wiki article, a personal journal. The block system means you're never fighting the editor. The linking system means documents form a connected knowledge graph rather than isolated files.

**Who we're competing for:** Individuals and small teams (2-20 people) who want a collaborative document editor that's simpler than Notion, faster than Google Docs, and has AI built in rather than bolted on.

---

## 2. Feature Breakdown

### A. Document Creation

#### Editor Core
| Feature | How Notion Does It |
|---------|-------------------|
| **Block-based editing** | Every element is a block. Text, headings (H1/H2/H3), lists (bulleted, numbered, to-do), toggles, callouts, quotes, dividers, code blocks. Blocks can be reordered by drag-and-drop, duplicated, deleted, and converted between types. |
| **`/` slash commands** | Type `/` anywhere to open a command palette listing every block type and action. Primary insertion mechanism. Keyboard-driven, searchable. |
| **Rich text** | Bold, italic, underline, strikethrough, inline code, colored text, background highlights, links, mentions. Applied via toolbar or keyboard shortcuts. |
| **Columns** | Drag a block next to another to create side-by-side columns. Flexible multi-column layouts. |
| **Toggle blocks** | Collapsible/expandable sections. Header stays visible, body toggles. Used for FAQs, progressive disclosure. |
| **Callout blocks** | Highlighted box with emoji icon. Used for tips, warnings, important notes. Visually distinct. |
| **Code blocks** | Syntax-highlighted code with language selector dropdown. |
| **Math/equations** | KaTeX rendering for inline and block math. |
| **Table of contents** | Auto-generated block that lists all headings on the page as clickable links. |
| **Simple tables** | Static table grid (non-database). Rows and columns with text content. |
| **Dividers** | Horizontal rule block for visual separation. |
| **Media blocks** | Images (upload, URL, Unsplash), videos, audio, file attachments, PDFs, web bookmarks. |
| **Embeds** | 500+ supported services. Figma, Miro, Loom, YouTube, Google Maps, CodePen, etc. |

#### Page Identity
| Feature | How Notion Does It |
|---------|-------------------|
| **Page icon** | Emoji or uploaded custom image. Appears at top of page and beside every link/mention of that page. Click to change. Random button for quick picks. |
| **Cover image** | Full-width banner at top of page. Choose from gallery, upload, paste URL, or Unsplash. Repositionable. |
| **Page title** | Large, prominent, editable inline. No separate "rename" action — you just type. |
| **Font & style** | Three font options (default, serif, mono). Small text toggle. Full-width toggle. |

#### Templates & Reuse
| Feature | How Notion Does It |
|---------|-------------------|
| **Template gallery** | 10,000+ community templates. Duplicate into your workspace as a starting point. |
| **Template buttons** | In-page buttons that create pre-filled content structures when clicked. |
| **Duplicate page** | One-click page duplication including all content and sub-pages. |

### B. Document Linking

| Feature | How Notion Does It |
|---------|-------------------|
| **@-mentions (pages)** | Type `@` + page name to create an inline link to another page. Shows icon and title. Updates dynamically if the target page is renamed. |
| **`[[` links** | Type `[[` + page name. Same as @-mention but alternate syntax. |
| **`+` links** | Type `+` + page name. Creates link AND adds the current page as a sub-page of the target. |
| **`/link` block** | Slash command to insert a full-width link block (not inline) pointing to another page. |
| **Backlinks** | Every page shows a "backlinks" section listing all other pages that reference it. Auto-generated, always up to date. Clickable. |
| **Block links** | Copy a link to any specific block within a page. Share as anchor URL. |
| **Dynamic titles** | If a linked page's title or icon changes, all links to it update automatically everywhere. |
| **Web links** | Paste a URL — option to display as plain link, bookmark card (with title/description/image), or embed. |
| **Breadcrumbs** | Full page hierarchy path at the top. Each segment is clickable for navigation. |

### C. Document Sharing & Collaboration

#### Sharing & Permissions
| Feature | How Notion Does It |
|---------|-------------------|
| **Invite by email** | Share menu → enter email → choose permission level. Works for workspace members and external guests. |
| **Permission levels** | Full access, can edit, can comment, can view. Per-page granularity. |
| **Guest access** | External collaborators who can access specific pages without a workspace account. Invited by email. |
| **Publish to web** | One toggle to make a page publicly accessible via URL. Anyone with the link can view. Optional: allow search engine indexing. |
| **Link sharing** | Copy page link to clipboard. Recipients need appropriate access to view. |
| **Inherited permissions** | Sub-pages inherit parent permissions by default. Can override per-page. |
| **Share menu** | Central hub showing who has access, their permission level, and options to modify or revoke. |

#### Real-Time Collaboration
| Feature | How Notion Does It |
|---------|-------------------|
| **Simultaneous editing** | Multiple users edit the same page at once. Changes merge in real-time. |
| **Presence indicators** | Avatars of active users shown at the top of the page. |
| **No live cursors** | Notably absent — you can't see where other users are typing. This is a known gap vs. Google Docs. |

#### Comments & Discussion
| Feature | How Notion Does It |
|---------|-------------------|
| **Page-level comments** | Discussion thread at the top of any page. General feedback about the whole document. |
| **Inline comments** | Select text or click a block → add a comment attached to that specific content. |
| **Threaded replies** | Each comment supports a reply thread. |
| **Resolve/unresolve** | Mark comments as resolved (✓). Filter to see resolved vs. open. |
| **@-mentions in comments** | Tag people in comments to notify them. |
| **Comment keyboard shortcut** | `Cmd+Shift+M` to comment on selection. |
| **Comments pane** | Side panel listing all comments. Click any to jump to its location. Filter by person, status. |
| **Unread indicator** | Red badge on the comments icon when there are unread comments. |

#### Version History
| Feature | How Notion Does It |
|---------|-------------------|
| **Page history** | Timestamped snapshots of page state. View diffs. Restore any version. |
| **Retention** | 7 days (free), 30 days (Plus), 90 days (Business), unlimited (Enterprise). |
| **Named versions** | No native support (common complaint). |

#### Notifications
| Feature | How Notion Does It |
|---------|-------------------|
| **In-app notifications** | Bell icon with feed of mentions, comments, page updates. |
| **Email notifications** | Configurable email digests. |
| **@-mention alerts** | Mentioned users get notified immediately (in-app + optional email). |

---

## 3. UX Strengths — What They Get Right

1. **The `/` command menu.** Universal entry point for every block type and action. Searchable, keyboard-driven. Power users never touch the toolbar. Muscle memory builds fast.

2. **Page identity is first-class.** Icon + cover + title make every page visually distinct. You recognize documents by their icon before reading the title. This matters in sidebars, search results, and links.

3. **Linking is effortless.** Three ways to link (`@`, `[[`, `+`) and they all auto-complete with search. Links stay current when pages are renamed. Backlinks are automatic. The result is a wiki-like knowledge graph that builds itself.

4. **Share menu is one place.** Invite people, manage permissions, publish to web, copy link — all in one popover. No hunting through settings.

5. **Comments are contextual.** Inline comments live right next to the content they reference. Resolved comments get out of the way but are recoverable. The comment pane gives an overview.

6. **Progressive disclosure.** A new user sees a blank page and a blinking cursor. The editor feels as simple as a notepad. Power features reveal themselves through `/` and hover menus only when needed.

7. **Everything is a page.** Mental model is dead simple. A new document is a new page. A sub-page is a child page. Links connect pages. No "files," no "folders" — just pages.

---

## 4. UX Weaknesses — What They Get Wrong (Our Opportunities)

1. **Performance is bad.** Pages load slowly, especially with lots of content. Sidebar navigation lags in large workspaces. Mobile is sluggish. This is the #1 user complaint and our biggest opportunity. Speed is a feature.

2. **No live cursors.** You can see who's on a page (avatars at top) but not where they're typing. Google Docs shows cursor positions in real-time. We already have this — we should make it prominent.

3. **Sharing is confusing for new users.** The distinction between workspace members, guests, and published pages isn't intuitive. Users struggle with "who can see what." We can make sharing simpler and more transparent.

4. **Overwhelming complexity.** Notion's block menu has 50+ options. Many users never find the features they need because they're buried. We can offer fewer, better blocks and surface them more clearly.

5. **No viewer-count or page analytics on lower tiers.** Free and Plus users can't see who viewed their shared documents. This is valuable signal — "Did my team actually read this?"

6. **Comments notification is weak.** Users in active workspaces get buried in notifications. There's no smart prioritization. We can do better with focused, relevant notifications.

7. **AI is paywalled.** AI features require the Business plan ($15/user/month). Small teams and individuals are priced out. We include AI at every tier.

8. **Offline is broken.** Web version has no offline. This is a long-standing complaint, though less relevant for our web-first approach.

9. **Export quality is poor.** Markdown export loses formatting. PDF export is ugly. Users who want to share documents outside Notion are frustrated.

---

## 5. Table Stakes — Must-Have for Document Creation, Linking & Sharing

To be taken seriously as a Notion competitor in the document space:

### Creation
- [ ] Block-based rich text editor with headings, lists, toggles, callouts, code blocks, quotes, dividers
- [ ] `/` slash command menu for block insertion
- [ ] Rich text formatting (bold, italic, strikethrough, inline code, links)
- [ ] Page icons (emoji picker)
- [ ] Cover images
- [ ] Drag-and-drop block reordering
- [ ] Image uploads/embedding
- [ ] Undo/redo
- [ ] Dark mode

### Linking
- [ ] `@`-mention or `[[` linking to other documents in the workspace
- [ ] Backlinks showing which documents reference the current one
- [ ] Breadcrumb navigation showing page hierarchy
- [ ] Full-text search across all documents

### Sharing
- [ ] Invite collaborators by email with role selection (owner/editor/viewer)
- [ ] Real-time co-editing with presence indicators
- [ ] Publish to web (public read-only link)
- [ ] Share menu showing who has access and their permission levels
- [ ] Comments (at minimum page-level)

---

## 6. Differentiators — Where We Can Win

### 1. Speed
Notion is notoriously slow. Every interaction in our app should feel instant — page creation, navigation, editing, sharing. This is our #1 differentiator and it compounds across every user session.

### 2. Live Cursors & Presence
We already have real-time cursor tracking. Notion doesn't. This makes collaboration feel alive and immediate. We should make it even better — show who's typing, what they're selecting, and where they are on the page.

### 3. AI Built In, Not Bolted On
AI should be woven into the document creation flow:
- AI writing assistance inline (not a separate dialog)
- Translate, summarize, Q&A directly in the editor
- AI available at every tier, not locked behind a $15/month paywall
- Multi-model choice (GPT-4, Claude, Gemini, Mistral, LLaMA)

### 4. Simple Sharing
Notion's sharing model is powerful but confusing. We can win with clarity:
- One clear share menu
- Obvious visual indicator of who can see a document
- Public sharing with one toggle
- No confusion between "workspace members" and "guests" — just "people with access"

### 5. Open Source
AGPL-3.0 means transparency, trust, and the ability to self-host. Notion is closed-source. In an era of privacy concerns, this matters to developers and privacy-conscious teams.

### 6. Document-Focused Simplicity
We're not trying to be a database, a project manager, a CRM, and a wiki. We're a document editor. This means less complexity, fewer things to configure, and a faster path to "I opened the app and started writing."

---

## Key Takeaway

The gap between us and Notion in the document space is fillable. Notion's document creation is excellent but bloated. Their linking is strong but simple to replicate. Their sharing is powerful but confusing. Their collaboration lacks live cursors. Their AI is paywalled.

**Our path:** Fill the table-stakes gaps (slash commands, better blocks, page covers, search, comments, public sharing), then differentiate on speed, live collaboration, AI-first design, and simplicity.
