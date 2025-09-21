'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'

interface SimpleTiptapEditorProps {
  placeholder?: string
  initialContent?: string
  onUpdate?: (content: string) => void
}

export function SimpleTiptapEditor({ 
  placeholder = "Start writing...", 
  initialContent = "",
  onUpdate 
}: SimpleTiptapEditorProps) {
  const [aiToken, setAiToken] = useState<string | null>(null)

  // Fetch AI token from our API
  useEffect(() => {
    async function fetchAiToken() {
      try {
        const response = await fetch('/api/tiptap/ai-token')
        const data = await response.json()
        if (data.token) {
          setAiToken(data.token)
        }
      } catch (error) {
        console.error('Failed to fetch AI token:', error)
      }
    }

    fetchAiToken()
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      // Add AI extension here when token is available
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor.getHTML())
      }
    },
  })

  if (!editor) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-gray-200 p-2 bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`px-3 py-1 rounded text-sm ${
                editor.isActive('bold') ? 'bg-blue-200' : 'bg-white'
              }`}
            >
              Bold
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`px-3 py-1 rounded text-sm ${
                editor.isActive('italic') ? 'bg-blue-200' : 'bg-white'
              }`}
            >
              Italic
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`px-3 py-1 rounded text-sm ${
                editor.isActive('heading', { level: 1 }) ? 'bg-blue-200' : 'bg-white'
              }`}
            >
              H1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`px-3 py-1 rounded text-sm ${
                editor.isActive('bulletList') ? 'bg-blue-200' : 'bg-white'
              }`}
            >
              List
            </button>
            {aiToken && (
              <span className="text-xs text-green-600 self-center">
                AI Ready
              </span>
            )}
          </div>
        </div>

        {/* Editor */}
        <EditorContent 
          editor={editor} 
          className="min-h-[300px]"
        />
      </div>
    </div>
  )
}