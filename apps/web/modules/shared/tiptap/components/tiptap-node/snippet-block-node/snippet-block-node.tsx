"use client";

import React, { useState, useEffect } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import type { Snippet } from "./snippet-block-node-extension";

// Sample snippets - in real app, these would come from props/context/API
const sampleSnippets: Snippet[] = [
  {
    id: "1",
    title: "Vision Statement",
    content: "We're building the workspace where writing thinks with you.",
    category: "Company",
    tags: ["vision", "mission"],
  },
  {
    id: "2", 
    title: "Founder Bio",
    content: "Josephine, ex-SWE at Ikea, co-founder of Loyatii (#6 app in Finland).",
    category: "Personal",
    tags: ["bio", "founder"],
  },
  {
    id: "3",
    title: "Traction Data",
    content: "30 locations signed, invited to WWDC25, top 6 app in Finland.",
    category: "Business",
    tags: ["traction", "metrics"],
  },
  {
    id: "4",
    title: "Pitch Email Template",
    content: `Hi [Investor Name],

I'm Josephine, co-founder of Writelyy (previously built Loyatii, #6 app in Finland). 
Writelyy is an AI-native workspace where writing is built from reusable snippets, 
expanded into drafts, and guided by memory of your voice and knowledge.

In just 3 months, we signed 30 locations in Helsinki, hit top 6 in Finland, 
and were invited to WWDC25. 

I'd love to share how we're transforming how teams write. 
Are you open to a quick call next week?

Best,  
Josephine`,
    category: "Templates",
    tags: ["email", "pitch", "investors"],
  },
];

export const SnippetBlockNode: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const { snippetId, placeholder, content, title } = node.attrs as {
    snippetId: string | null;
    placeholder: string;
    content: string;
    title: string;
  };
  const [isSelecting, setIsSelecting] = useState(!snippetId);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSnippets, setFilteredSnippets] = useState(sampleSnippets);

  useEffect(() => {
    if (searchQuery) {
      const filtered = sampleSnippets.filter(snippet =>
        snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredSnippets(filtered);
    } else {
      setFilteredSnippets(sampleSnippets);
    }
  }, [searchQuery]);

  const handleSnippetSelect = (snippet: Snippet) => {
    updateAttributes({
      snippetId: snippet.id,
      content: snippet.content,
      title: snippet.title,
    });
    setIsSelecting(false);
  };

  const handleEdit = () => {
    setIsSelecting(true);
  };

  const handleCreateNew = () => {
    const newTitle = prompt("Snippet title:");
    if (!newTitle) return;
    
    const newContent = prompt("Snippet content:");
    if (!newContent) return;

    const newSnippet: Snippet = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      category: "Custom",
      tags: [],
    };

    // In a real app, you'd save this to the backend
    sampleSnippets.push(newSnippet);
    handleSnippetSelect(newSnippet);
  };

  if (isSelecting) {
    return (
      <NodeViewWrapper
        className={`snippet-block-wrapper selecting ${selected ? "ProseMirror-selectednode" : ""}`}
      >
        <div className="snippet-selector">
          <div className="snippet-header">
            <input
              type="text"
              placeholder="Search snippets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="snippet-search"
              autoFocus
            />
            <button onClick={handleCreateNew} className="create-snippet-btn">
              + New Snippet
            </button>
          </div>
          
          <div className="snippet-list">
            {filteredSnippets.map((snippet) => (
              <div
                key={snippet.id}
                className="snippet-item"
                onClick={() => handleSnippetSelect(snippet)}
              >
                <div className="snippet-item-title">{snippet.title}</div>
                <div className="snippet-item-preview">
                  {snippet.content.slice(0, 100)}
                  {snippet.content.length > 100 ? "..." : ""}
                </div>
                <div className="snippet-item-meta">
                  <span className="snippet-category">{snippet.category}</span>
                  {snippet.tags && snippet.tags.length > 0 && (
                    <div className="snippet-tags">
                      {snippet.tags.map(tag => (
                        <span key={tag} className="snippet-tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {filteredSnippets.length === 0 && (
            <div className="no-snippets">
              No snippets found. <button onClick={handleCreateNew}>Create one?</button>
            </div>
          )}
        </div>

        <style jsx>{`
          .snippet-block-wrapper {
            margin: 1rem 0;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            background: #f9fafb;
          }
          
          .snippet-block-wrapper.ProseMirror-selectednode {
            border-color: #3b82f6;
          }
          
          .snippet-header {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
          }
          
          .snippet-search {
            flex: 1;
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.875rem;
          }
          
          .create-snippet-btn {
            padding: 0.5rem 1rem;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.875rem;
          }
          
          .snippet-list {
            max-height: 300px;
            overflow-y: auto;
          }
          
          .snippet-item {
            padding: 1rem;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            margin-bottom: 0.5rem;
            cursor: pointer;
            background: white;
            transition: all 0.2s;
          }
          
          .snippet-item:hover {
            border-color: #3b82f6;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .snippet-item-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #111827;
          }
          
          .snippet-item-preview {
            color: #6b7280;
            font-size: 0.875rem;
            line-height: 1.4;
            margin-bottom: 0.5rem;
          }
          
          .snippet-item-meta {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.75rem;
          }
          
          .snippet-category {
            background: #f3f4f6;
            color: #374151;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
          }
          
          .snippet-tags {
            display: flex;
            gap: 0.25rem;
          }
          
          .snippet-tag {
            color: #3b82f6;
          }
          
          .no-snippets {
            text-align: center;
            padding: 2rem;
            color: #6b7280;
          }
          
          .no-snippets button {
            color: #3b82f6;
            background: none;
            border: none;
            cursor: pointer;
            text-decoration: underline;
          }
        `}</style>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper
      className={`snippet-block-wrapper ${selected ? "ProseMirror-selectednode" : ""}`}
    >
      <div className="snippet-display">
        <div className="snippet-content">
          <div className="snippet-title-bar">
            <span className="snippet-title">📄 {title}</span>
            {selected && (
              <button onClick={handleEdit} className="edit-snippet-btn">
                Change
              </button>
            )}
          </div>
          <div className="snippet-text">
            {content.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .snippet-block-wrapper {
          margin: 1rem 0;
          border: 2px solid transparent;
          border-radius: 8px;
          background: #f8fafc;
          transition: all 0.2s;
        }
        
        .snippet-block-wrapper.ProseMirror-selectednode {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        
        .snippet-display {
          padding: 1rem;
        }
        
        .snippet-title-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .snippet-title {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }
        
        .edit-snippet-btn {
          padding: 0.25rem 0.75rem;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
        }
        
        .edit-snippet-btn:hover {
          background: #e5e7eb;
        }
        
        .snippet-text {
          color: #111827;
          line-height: 1.5;
        }
        
        .snippet-text p {
          margin: 0 0 0.5rem 0;
        }
        
        .snippet-text p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </NodeViewWrapper>
  );
};