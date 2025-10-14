/**
 * AI Changes Panel
 *
 * Displays and manages AI-generated changes in the document
 */

"use client";

import * as React from "react";
import type { Editor } from "@tiptap/core";
import { useAiCommands } from "@shared/tiptap/hooks/use-ai-commands";
import { Button, ButtonGroup } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { Card } from "@shared/tiptap/components/tiptap-ui-primitive/card/card";
import { CheckAiIcon } from "@shared/tiptap/components/tiptap-icons/check-ai-icon";
import { RefreshAiIcon } from "@shared/tiptap/components/tiptap-icons/refresh-ai-icon";

export interface AiChangesPanelProps {
  editor: Editor | null;
  className?: string;
}

export function AiChangesPanel({ editor, className }: AiChangesPanelProps) {
  const { changeActions, features } = useAiCommands({ editor });

  if (!features.hasAiChanges || !editor) {
    return null;
  }

  const { changes, acceptChange, rejectChange, acceptAllChanges, rejectAllChanges } =
    changeActions;

  if (changes.length === 0) {
    return (
      <Card className={className}>
        <div className="p-4 text-center text-gray-500">
          <p className="text-sm">No AI changes to review</p>
          <p className="text-xs mt-1">AI-generated changes will appear here</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">AI Changes ({changes.length})</h3>
          <ButtonGroup>
            <Button
              data-style="outline"
              data-size="sm"
              onClick={acceptAllChanges}
              title="Accept all changes"
            >
              Accept All
            </Button>
            <Button
              data-style="outline"
              data-size="sm"
              onClick={rejectAllChanges}
              title="Reject all changes"
            >
              Reject All
            </Button>
          </ButtonGroup>
        </div>

        <div className="space-y-3">
          {changes.map((change: any) => (
            <div
              key={change.id}
              className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-medium ${
                        change.type === "insert"
                          ? "text-green-600"
                          : change.type === "delete"
                            ? "text-red-600"
                            : "text-blue-600"
                      }`}
                    >
                      {change.type === "insert"
                        ? "Added"
                        : change.type === "delete"
                          ? "Removed"
                          : "Modified"}
                    </span>
                    {change.timestamp && (
                      <span className="text-xs text-gray-500">
                        {new Date(change.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  {change.type === "delete" && change.oldText && (
                    <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                      <p className="text-sm text-red-800 line-through">
                        {change.oldText}
                      </p>
                    </div>
                  )}

                  {change.type === "insert" && change.newText && (
                    <div className="bg-green-50 border border-green-200 rounded p-2 mb-2">
                      <p className="text-sm text-green-800">{change.newText}</p>
                    </div>
                  )}

                  {change.type === "replace" && (
                    <>
                      {change.oldText && (
                        <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                          <p className="text-sm text-red-800 line-through">
                            {change.oldText}
                          </p>
                        </div>
                      )}
                      {change.newText && (
                        <div className="bg-green-50 border border-green-200 rounded p-2">
                          <p className="text-sm text-green-800">{change.newText}</p>
                        </div>
                      )}
                    </>
                  )}

                  {change.reason && (
                    <p className="text-xs text-gray-600 mt-2 italic">{change.reason}</p>
                  )}
                </div>

                <ButtonGroup>
                  <Button
                    data-style="ghost"
                    data-size="sm"
                    title="Accept change"
                    onClick={() => acceptChange(change.id)}
                  >
                    <CheckAiIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    data-style="ghost"
                    data-size="sm"
                    title="Reject change"
                    onClick={() => rejectChange(change.id)}
                  >
                    <RefreshAiIcon className="w-4 h-4" />
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
