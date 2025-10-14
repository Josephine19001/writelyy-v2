/**
 * AI Suggestions Panel
 *
 * Displays AI suggestions for improving the document
 */

"use client";

import * as React from "react";
import type { Editor } from "@tiptap/core";
import { useAiCommands } from "@shared/tiptap/hooks/use-ai-commands";
import { Button, ButtonGroup } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { Card } from "@shared/tiptap/components/tiptap-ui-primitive/card/card";
import { CheckAiIcon } from "@shared/tiptap/components/tiptap-icons/check-ai-icon";
import { RefreshAiIcon } from "@shared/tiptap/components/tiptap-icons/refresh-ai-icon";

export interface AiSuggestionsPanelProps {
  editor: Editor | null;
  className?: string;
}

export function AiSuggestionsPanel({ editor, className }: AiSuggestionsPanelProps) {
  const { suggestionActions, features } = useAiCommands({ editor });

  if (!features.hasAiSuggestion || !editor) {
    return null;
  }

  const { suggestions, acceptSuggestion, rejectSuggestion } = suggestionActions;

  if (suggestions.length === 0) {
    return (
      <Card className={className}>
        <div className="p-4 text-center text-gray-500">
          <p className="text-sm">No suggestions available</p>
          <p className="text-xs mt-1">AI will analyze your document for improvements</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-3">AI Suggestions</h3>
        <div className="space-y-3">
          {suggestions.map((suggestion: any) => (
            <div
              key={suggestion.id}
              className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-blue-600">
                      {suggestion.type || "Improvement"}
                    </span>
                    {suggestion.category && (
                      <span className="text-xs text-gray-500">
                        • {suggestion.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {suggestion.description || suggestion.message}
                  </p>
                  {suggestion.suggestion && (
                    <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                      <p className="text-sm text-green-800">{suggestion.suggestion}</p>
                    </div>
                  )}
                </div>
                <ButtonGroup>
                  <Button
                    data-style="ghost"
                    data-size="sm"
                    title="Accept suggestion"
                    onClick={() => acceptSuggestion(suggestion.id)}
                  >
                    <CheckAiIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    data-style="ghost"
                    data-size="sm"
                    title="Reject suggestion"
                    onClick={() => rejectSuggestion(suggestion.id)}
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
