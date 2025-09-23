"use client";

import React from "react";
import { useDocumentRouter, type DocumentPathItem } from "../../hooks/use-document-router";

interface DocumentBreadcrumbsProps {
  className?: string;
  showIcons?: boolean;
  maxItems?: number;
  separator?: React.ReactNode;
}

export function DocumentBreadcrumbs({
  className = "",
  showIcons = true,
  maxItems = 5,
  separator = "/",
}: DocumentBreadcrumbsProps) {
  const { documentPath, navigateToDocument, navigateToFolder, navigateToWorkspace } = useDocumentRouter();

  // Truncate path if too long
  const displayPath = documentPath.length > maxItems
    ? [
        documentPath[0], // Always show workspace
        { id: "ellipsis", name: "...", type: "ellipsis" as const, url: "" },
        ...documentPath.slice(-maxItems + 2) // Show last few items
      ]
    : documentPath;

  const handleItemClick = (item: DocumentPathItem | { id: string; name: string; type: "ellipsis"; url: string }) => {
    if (item.type === "ellipsis") return;
    
    if (item.type === "document") {
      navigateToDocument(item.id);
    } else if (item.type === "folder") {
      navigateToFolder(item.id);
    } else if (item.type === "workspace") {
      navigateToWorkspace();
    }
  };

  const getIcon = (type: string) => {
    if (!showIcons) return null;
    
    switch (type) {
      case "workspace":
        return <span className="breadcrumb-icon">🏢</span>;
      case "folder":
        return <span className="breadcrumb-icon">📁</span>;
      case "document":
        return <span className="breadcrumb-icon">📄</span>;
      case "ellipsis":
        return <span className="breadcrumb-icon">⋯</span>;
      default:
        return null;
    }
  };

  if (displayPath.length <= 1) {
    return null; // Don't show breadcrumbs for root workspace
  }

  return (
    <nav className={`document-breadcrumbs ${className}`} aria-label="Document path">
      <ol className="breadcrumb-list">
        {displayPath.map((item, index) => {
          const isLast = index === displayPath.length - 1;
          const isEllipsis = item.type === "ellipsis";
          
          return (
            <li key={item.id} className="breadcrumb-item">
              {isEllipsis ? (
                <span className="breadcrumb-ellipsis">
                  {getIcon(item.type)}
                  <span className="breadcrumb-text">{item.name}</span>
                </span>
              ) : (
                <button
                  onClick={() => handleItemClick(item)}
                  className={`breadcrumb-link ${isLast ? "current" : ""}`}
                  aria-current={isLast ? "page" : undefined}
                  type="button"
                >
                  {getIcon(item.type)}
                  <span className="breadcrumb-text">{item.name}</span>
                </button>
              )}
              
              {!isLast && (
                <span className="breadcrumb-separator" aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <style jsx>{`
        .document-breadcrumbs {
          padding: 8px 0;
          border-bottom: 1px solid var(--border-color, #e1e5e9);
          background: var(--bg-secondary, #f8f9fa);
        }

        .breadcrumb-list {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 4px;
          font-size: 14px;
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .breadcrumb-link,
        .breadcrumb-ellipsis {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 4px;
          text-decoration: none;
          color: var(--text-secondary, #6c757d);
          transition: all 0.15s ease;
          background: none;
          border: none;
          cursor: pointer;
          font-size: inherit;
          font-family: inherit;
        }

        .breadcrumb-link:hover {
          background: var(--bg-hover, rgba(0, 0, 0, 0.05));
          color: var(--text-primary, #212529);
        }

        .breadcrumb-link.current {
          color: var(--text-primary, #212529);
          font-weight: 500;
          cursor: default;
        }

        .breadcrumb-link.current:hover {
          background: none;
        }

        .breadcrumb-ellipsis {
          cursor: default;
          opacity: 0.6;
        }

        .breadcrumb-icon {
          font-size: 16px;
          line-height: 1;
          flex-shrink: 0;
        }

        .breadcrumb-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }

        .breadcrumb-separator {
          color: var(--text-muted, #adb5bd);
          font-size: 12px;
          user-select: none;
          margin: 0 2px;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .breadcrumb-text {
            max-width: 120px;
          }
          
          .breadcrumb-list {
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .breadcrumb-text {
            max-width: 80px;
          }
          
          .breadcrumb-icon {
            font-size: 14px;
          }
        }
      `}</style>
    </nav>
  );
}

/**
 * Compact breadcrumb variant for tight spaces
 */
export function CompactDocumentBreadcrumbs({
  className = "",
}: {
  className?: string;
}) {
  const { documentPath, navigateBack, canNavigateBack } = useDocumentRouter();
  
  if (!canNavigateBack || documentPath.length < 2) {
    return null;
  }

  const currentItem = documentPath[documentPath.length - 1];
  const parentItem = documentPath[documentPath.length - 2];

  return (
    <div className={`compact-breadcrumbs ${className}`}>
      <button
        onClick={navigateBack}
        className="back-button"
        title={`Back to ${parentItem.name}`}
        type="button"
      >
        <span className="back-icon">←</span>
        <span className="back-text">{parentItem.name}</span>
      </button>
      
      <span className="current-separator">/</span>
      
      <span className="current-item">
        <span className="current-icon">
          {currentItem.type === "document" ? "📄" : "📁"}
        </span>
        <span className="current-text">{currentItem.name}</span>
      </span>

      <style jsx>{`
        .compact-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          padding: 4px 0;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border: none;
          background: none;
          border-radius: 4px;
          cursor: pointer;
          color: var(--text-secondary, #6c757d);
          transition: all 0.15s ease;
          font-size: inherit;
          font-family: inherit;
        }

        .back-button:hover {
          background: var(--bg-hover, rgba(0, 0, 0, 0.05));
          color: var(--text-primary, #212529);
        }

        .back-icon {
          font-size: 16px;
          line-height: 1;
        }

        .back-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }

        .current-separator {
          color: var(--text-muted, #adb5bd);
          font-size: 12px;
        }

        .current-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-primary, #212529);
          font-weight: 500;
        }

        .current-icon {
          font-size: 16px;
          line-height: 1;
        }

        .current-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }
      `}</style>
    </div>
  );
}