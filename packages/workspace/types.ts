import type { Editor } from '@tiptap/react'
import type { ActiveWorkspace } from '@repo/auth'
import type { 
  Document, 
  Folder, 
  Source, 
  AiChat, 
  DocumentComment,
  DocumentShare,
  DocumentVersion
} from '@repo/database'

// Core workspace context types
export interface WorkspaceContextData {
  // Current workspace
  workspace: ActiveWorkspace | null
  
  // Document hierarchy
  folders: Folder[]
  documents: Document[]
  currentDocument?: Document
  
  // Sources (files, images, URLs)
  sources: Source[]
  
  // AI Integration
  activeChat?: AiChat
  isAiPanelOpen: boolean
  
  // Document Editor State
  editor?: Editor
  
  // Actions
  createDocument: (folderId?: string) => Promise<Document>
  updateDocument: (id: string, content: any) => Promise<void>
  uploadSource: (file: File) => Promise<Source>
  addUrlSource: (url: string) => Promise<Source>
  toggleAiPanel: () => void
  sendAiMessage: (message: string, context?: DocumentContext) => Promise<void>
}

// AI context for enhanced prompts
export interface DocumentContext {
  currentDocument?: Document
  relatedDocuments?: Document[]
  availableSources?: Source[]
  selectedText?: string
  cursorPosition?: number
}

// Tiptap AI integration types
export interface TiptapAIContext {
  // Enhanced with workspace context
  workspaceContext: WorkspaceAIContext
}

export interface WorkspaceAIContext {
  // Workspace knowledge
  currentWorkspace: ActiveWorkspace
  allDocuments: Document[]
  allSources: Source[]
  folderStructure: Folder[]
  
  // Current context
  currentDocument?: Document
  selectedText?: string
  cursorPosition?: number
  
  // AI capabilities
  generateWithContext: (prompt: string) => Promise<string>
  suggestFromSources: (query: string) => Promise<Source[]>
  crossReferenceDocuments: (content: string) => Promise<Document[]>
}

// Enhanced editor with workspace features
export interface WorkspaceEditor extends Editor {
  // Workspace-enhanced AI
  workspace: {
    searchSources: (query: string) => Source[]
    linkToDocument: (documentId: string) => void
    insertFromSource: (sourceId: string, selection?: string) => void
    generateWithWorkspaceContext: (prompt: string) => Promise<void>
  }
}

// AI Panel types
export interface AIPanelState {
  isOpen: boolean
  position: 'right' | 'bottom'
  width: number
}

export interface AIPanelContext {
  state: AIPanelState
  currentChat?: AiChat
  toggle: () => void
  sendMessage: (message: string, includeDocumentContext?: boolean) => Promise<void>
  
  // Quick actions
  summarizeDocument: () => void
  generateFromSources: (sources: Source[]) => void
  explainSelection: () => void
  suggestStructure: () => void
  findRelatedContent: () => void
}

// Source types
export type SourceType = 'pdf' | 'doc' | 'docx' | 'image' | 'url'

export interface SourceUploadOptions {
  type: SourceType
  file?: File
  url?: string
  name: string
  organizationId: string
}

export interface SourceMetadata {
  size?: number
  dimensions?: { width: number; height: number }
  pageCount?: number
  mimeType?: string
  extractedText?: string
}

// Document types
export interface DocumentCreateOptions {
  title: string
  folderId?: string
  organizationId: string
  isTemplate?: boolean
  initialContent?: any
}

export interface DocumentUpdateOptions {
  title?: string
  content?: any
  description?: string
  tags?: string[]
  folderId?: string
}

// Folder hierarchy types
export interface FolderTree extends Folder {
  subFolders: FolderTree[]
  documents: Document[]
}

// Search and filtering
export interface WorkspaceSearchOptions {
  query: string
  type?: 'documents' | 'sources' | 'all'
  folderId?: string
  tags?: string[]
}

export interface WorkspaceSearchResult {
  documents: Document[]
  sources: Source[]
  folders: Folder[]
}

// Collaboration types
export interface DocumentCollaboration {
  shares: DocumentShare[]
  comments: DocumentComment[]
  versions: DocumentVersion[]
  activeCollaborators: ActiveWorkspace['members']
}

// Permissions
export type DocumentPermission = 'view' | 'comment' | 'edit' | 'admin'

export interface WorkspacePermissions {
  canCreateDocuments: boolean
  canCreateFolders: boolean
  canUploadSources: boolean
  canInviteMembers: boolean
  canManageSettings: boolean
}