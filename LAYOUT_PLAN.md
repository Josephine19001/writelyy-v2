# Writely v2 Layout Plan

## 3-Panel VSCode-Inspired Layout

### Overall Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Left Sidebar    │     Editor (Middle)     │   AI Panel      │
│                 │                         │   (Right)       │
│                 │                         │                 │
│                 │                         │                 │
│                 │                         │                 │
│                 │                         │                 │
│                 │                         │                 │
│                 │                         │                 │
│                 │                         │                 │
└─────────────────────────────────────────────────────────────┘
    │          │                          │
  Resize     Resize                    Resize
  Handle     Handle                    Handle
```

## Left Sidebar (File Explorer)

### Layout Structure
```
┌─────────────────────┐
│ 🔍 📄 📁 👤        │  ← Top Icon Bar
├─────────────────────┤
│ [Workspace ▼]       │  ← Workspace Dropdown
├─────────────────────┤
│ 📁 Documents        │  ← Documents Section
│   ├── 📄 Doc 1      │
│   ├── 📄 Doc 2      │
│   └── 📁 Folder     │
│       ├── 📄 Doc 3  │
│       └── 📄 Doc 4  │
├─────────────────────┤
│ 🔗 Sources          │  ← Sources Section
│   ├── 🖼️ Image.png  │
│   ├── 📄 File.pdf   │
│   └── 🔗 Link       │
├─────────────────────┤
│ 🎨 Assets           │  ← Assets Timeline
│   └── Timeline with │
│       Unsplash      │
│       integration   │
└─────────────────────┘
```

### Components
- **Width**: Resizable, default ~280px, min 200px, max 400px
- **Top Icon Bar**:
  - 🔍 Search (tooltip: "Search workspace") - Opens search modal
  - 📄 New Document (tooltip: "New document") - Creates new document
  - 📁 New Folder (tooltip: "New folder") - Creates new folder
  - 👤 User Menu (tooltip: "User menu") - User dropdown menu
- **Workspace Dropdown**: Current workspace + "All Workspaces" option
- **Documents Section**: Hierarchical folder/file structure
- **Sources Section**: Images, PDFs, links (replaces notepads concept)
- **Assets Timeline**: Unsplash integration for image search and upload

## Middle Panel (Editor)

### Layout Structure
```
┌─────────────────────────────────────────┐
│ ⚡ 📝 🎨 📊 🔗 🖼️ 📋 ↩️ ↪️ 💾       │  ← Top Toolbar
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │  ← Block Structure
│  │ # Heading Block                 │    │    (Notion-inspired)
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Text block with content...      │    │
│  │ Users can drag and rearrange    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 📊 Table Block                  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🖼️ Image Block                  │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### Components
- **Width**: Flexible, takes remaining space between left and right panels
- **Top Toolbar**: Common tools and formatting options
  - ⚡ AI Assistant
  - 📝 Text formatting
  - 🎨 Styling options
  - 📊 Insert table
  - 🔗 Insert link
  - 🖼️ Insert image
  - 📋 Paste/clipboard
  - ↩️ Undo
  - ↪️ Redo
  - 💾 Save
- **Block-based Editor**: 
  - Notion-inspired draggable blocks
  - TipTap-powered rich text editing
  - Block types: headings, paragraphs, tables, images, code blocks, etc.
  - Drag handles for reordering blocks
  - Block-level formatting and styling

### Block Types
- Text blocks (paragraphs, headings, lists)
- Media blocks (images, videos, embeds)
- Data blocks (tables, databases)
- Code blocks (with syntax highlighting)
- AI blocks (AI-generated content)
- Custom blocks (callouts, quotes, etc.)

## Right Panel (AI Assistant)

### Layout Structure
```
┌─────────────────────┐
│ 🤖 AI Assistant     │  ← Panel Header
├─────────────────────┤
│                     │
│ Chat Interface      │  ← AI Chat
│                     │
│ ┌─────────────────┐ │
│ │ User: ...       │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ AI: ...         │ │
│ └─────────────────┘ │
│                     │
├─────────────────────┤
│ Document Analysis   │  ← Analysis Tools
│ • Grammar check     │
│ • Readability       │
│ • Suggestions       │
├─────────────────────┤
│ Quick Actions       │  ← AI Actions
│ • Summarize         │
│ • Expand            │
│ • Rewrite           │
│ • Translate         │
└─────────────────────┘
```

### Components
- **Width**: Resizable, default ~350px, min 300px, max 500px
- **AI Chat Interface**: Conversation with AI about document
- **Document Analysis**: Real-time analysis and suggestions
- **Quick Actions**: Common AI operations on selected text
- **Collapsible**: Can be hidden to give more space to editor

## Layout Features

### Resizable Panels
- All panels have drag handles for width adjustment
- Minimum and maximum width constraints
- State persistence across sessions

### Responsive Design
- Desktop: 3-panel layout
- Tablet: Collapsible panels, priority to editor
- Mobile: Tab-based navigation between panels

### State Management
- Remember panel sizes and collapsed states
- Workspace-specific layout preferences
- User customization settings

## Technical Implementation

### Technologies
- **TipTap**: Rich text editor with block extensions
- **React**: Component-based UI
- **Tailwind CSS**: Styling and responsive design
- **Lucide Icons**: Consistent iconography
- **React Query**: State management for data fetching
- **Unsplash API**: Asset integration

### Key Extensions
- Block-based editing (custom TipTap extension)
- Drag and drop for block reordering
- AI integration for content suggestions
- Collaborative editing capabilities
- Export/import functionality