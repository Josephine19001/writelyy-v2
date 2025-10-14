"use client";

import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@shared/tiptap/components/tiptap-ui-primitive/popover";
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";
import type { Editor } from "@tiptap/react";
import * as React from "react";

const items = [
  {
    group: "Edit or review selection",
    commands: [
      {
        title: "Improve writing",
        command: "improve",
      },
      {
        title: "Fix grammar",
        command: "fix grammar",
      },
      {
        title: "Make shorter",
        command: "make shorter",
      },
      {
        title: "Make longer",
        command: "make longer",
      },
    ],
  },
  {
    group: "Use AI to do more",
    commands: [
      {
        title: "Continue writing",
        command: "continue writing",
      },
    ],
  },
];

export interface BkAiSelectorProps {
  editor?: Editor | null;
}

export function BkAiSelector({ editor: providedEditor }: BkAiSelectorProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = React.useState(false);

  const hasSelection = React.useMemo(() => {
    if (!editor) return false;
    const { from, to } = editor.state.selection;
    return from !== to;
  }, [editor]);

  const handleCommandClick = (command: string) => {
    if (!editor) return;
    (editor.commands as any).aiCompletion?.({ command });
    setIsOpen(false);
  };

  if (!editor || !hasSelection) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          role="button"
          tabIndex={-1}
          aria-label="AI Tools"
          tooltip="AI Tools"
        >
          <span>✨</span>
          <span className="ml-2">AI Tools</span>
          <span className="ml-2 text-xs">▼</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-56 p-1 shadow-xl">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col">
            <h6 className="text-muted-foreground font-medium text-xs p-2">
              {item.group}
            </h6>
            {item.commands.map((c, j) => (
              <div
                key={j}
                onClick={() => handleCommandClick(c.command)}
                className="flex items-center rounded-md hover:bg-accent px-2 py-1.5 text-sm cursor-pointer"
              >
                <span>{c.title}</span>
              </div>
            ))}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
