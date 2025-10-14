"use client";

import { AiSparklesIcon } from "@shared/tiptap/components/tiptap-icons/ai-sparkles-icon";
import { CheckAiIcon } from "@shared/tiptap/components/tiptap-icons/check-ai-icon";
import { TextExtendIcon } from "@shared/tiptap/components/tiptap-icons/text-extend-icon";
import { TextReduceIcon } from "@shared/tiptap/components/tiptap-icons/text-reduce-icon";
import { Simplify2Icon } from "@shared/tiptap/components/tiptap-icons/simplify-2-icon";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/tiptap/components/tiptap-ui-primitive/dropdown-menu";
import { Card, CardBody } from "@shared/tiptap/components/tiptap-ui-primitive/card";
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";
import type { Editor } from "@tiptap/react";
import * as React from "react";

interface CustomAiButtonProps {
  editor?: Editor | null;
}

const AI_COMMANDS = [
  {
    icon: CheckAiIcon,
    label: "Improve writing",
    command: "improve",
  },
  {
    icon: CheckAiIcon,
    label: "Fix grammar",
    command: "fix grammar",
  },
  {
    icon: TextExtendIcon,
    label: "Make longer",
    command: "make longer",
  },
  {
    icon: TextReduceIcon,
    label: "Make shorter",
    command: "make shorter",
  },
  {
    icon: Simplify2Icon,
    label: "Simplify",
    command: "simplify",
  },
];

export function CustomAiButton({ editor: providedEditor }: CustomAiButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = React.useState(false);

  const hasSelection = React.useMemo(() => {
    if (!editor) return false;
    const { from, to } = editor.state.selection;
    return from !== to;
  }, [editor]);

  const handleCommand = React.useCallback(
    (command: string) => {
      if (!editor) return;

      (editor.commands as any).customAiComplete?.({ command });
      setIsOpen(false);
    },
    [editor]
  );

  if (!editor || !hasSelection) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          role="button"
          tabIndex={-1}
          aria-label="AI Improve"
          tooltip="AI Improve"
        >
          <AiSparklesIcon className="tiptap-button-icon" />
          <span className="tiptap-button-text">Improve</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" portal={true}>
        <Card>
          <CardBody>
            {AI_COMMANDS.map((item, index) => (
              <DropdownMenuItem key={index} asChild>
                <Button
                  type="button"
                  data-style="ghost"
                  onClick={() => handleCommand(item.command)}
                >
                  <item.icon className="tiptap-button-icon" />
                  <span className="tiptap-button-text">{item.label}</span>
                </Button>
              </DropdownMenuItem>
            ))}
          </CardBody>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
