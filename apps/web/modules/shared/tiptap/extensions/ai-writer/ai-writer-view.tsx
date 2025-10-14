"use client";

import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import type { NodeViewProps } from "@tiptap/core";
import { NodeViewWrapper, useEditorState } from "@tiptap/react";
import * as React from "react";

const AiWriterView = ({ editor, node, getPos }: NodeViewProps) => {
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);

  const { message, status, error } = useEditorState({
    editor: editor,
    selector: (instance) => {
      const storage = instance.editor.storage.customAi;
      return {
        status: storage?.status,
        message: storage?.message,
        error: storage?.error,
      };
    },
  });

  React.useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => {
      window.cancelAnimationFrame(id);
    };
  }, []);

  const insert = () => {
    if (!message) {
      return;
    }

    const from = getPos();
    if (from === undefined) {
      return;
    }
    const to = from + node.nodeSize;

    editor.chain().focus().insertContentAt({ from, to }, message).run();
  };

  const remove = () => {
    const from = getPos();
    if (from === undefined) {
      return;
    }
    const to = from + node.nodeSize;
    editor.chain().focus().deleteRange({ from, to }).run();
  };

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  return (
    <NodeViewWrapper>
      <div className="flex flex-col py-4 px-5 rounded-md border bg-white dark:bg-gray-800 shadow-sm">
        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error.message}
          </div>
        )}

        {!error && !!message && (
          <>
            <label className="mb-1 font-medium text-sm">Preview</label>
            <div className="max-h-80 overflow-auto mb-4 p-3 rounded bg-gray-50 dark:bg-gray-900 prose prose-sm dark:prose-invert max-w-full">
              <div dangerouslySetInnerHTML={{ __html: message }} />
            </div>
          </>
        )}

        <form
          onSubmit={(evt) => {
            evt.preventDefault();
            const prompt = inputRef.current?.value;

            if (!prompt?.trim()) {
              return;
            }

            (editor.commands as any).customAiPrompt?.({
              prompt: prompt,
              command: "prompt",
              insert: false,
            });
          }}
        >
          <label className="block mb-2 font-medium text-sm">Prompt</label>
          <textarea
            ref={inputRef}
            name="prompt"
            placeholder="Enter your prompt (e.g., Write a paragraph about...)"
            className="w-full min-h-24 p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 resize-y"
            autoFocus
          />
          <div className="flex items-center mt-4 gap-2">
            <Button
              type="button"
              data-style="ghost"
              disabled={isLoading}
              onClick={remove}
              className="text-red-600"
            >
              Remove
            </Button>
            <div className="flex-1" />
            {isSuccess && (
              <Button
                type="button"
                data-style="ghost"
                disabled={isLoading}
                onClick={insert}
              >
                ✓ Insert
              </Button>
            )}
            <Button type="submit" disabled={isLoading} data-style="primary">
              {isLoading ? "Generating..." : "Generate"}
            </Button>
          </div>
        </form>
      </div>
    </NodeViewWrapper>
  );
};

export default AiWriterView;
