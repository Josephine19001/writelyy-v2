/**
 * AI Commands Menu
 *
 * Provides a menu of AI commands for text improvement
 */

"use client";

import * as React from "react";
import type { Editor } from "@tiptap/core";
import { useAiCommands } from "@shared/tiptap/hooks/use-ai-commands";
import { Button, ButtonGroup } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { Card } from "@shared/tiptap/components/tiptap-ui-primitive/card/card";
import { AiSparklesIcon } from "@shared/tiptap/components/tiptap-icons/ai-sparkles-icon";
import { CheckAiIcon } from "@shared/tiptap/components/tiptap-icons/check-ai-icon";
import { RefreshAiIcon } from "@shared/tiptap/components/tiptap-icons/refresh-ai-icon";
import { StopCircle2Icon } from "@shared/tiptap/components/tiptap-icons/stop-circle-2-icon";

export interface AiCommandsMenuProps {
  editor: Editor | null;
  className?: string;
  onClose?: () => void;
}

interface AiCommand {
  id: string;
  label: string;
  description: string;
  icon?: React.ReactNode;
  action: () => void;
}

export function AiCommandsMenu({ editor, className, onClose }: AiCommandsMenuProps) {
  const { commands, contentActions, features, utils } = useAiCommands({ editor });
  const [selectedTone, setSelectedTone] = React.useState<string>("professional");
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("auto");
  const [customPrompt, setCustomPrompt] = React.useState<string>("");
  const [isGenerating, setIsGenerating] = React.useState(false);

  if (!features.hasAi || !editor) {
    return null;
  }

  const aiCommands: AiCommand[] = [
    {
      id: "improve",
      label: "Improve Writing",
      description: "Enhance clarity and quality",
      action: () => commands.improve({ tone: selectedTone }),
    },
    {
      id: "fixSpelling",
      label: "Fix Spelling & Grammar",
      description: "Correct errors",
      action: () => commands.fixSpelling(),
    },
    {
      id: "makeShorter",
      label: "Make Shorter",
      description: "Make it more concise",
      action: () => commands.makeShorter(),
    },
    {
      id: "makeLonger",
      label: "Make Longer",
      description: "Add more detail",
      action: () => commands.makeLonger(),
    },
    {
      id: "simplify",
      label: "Simplify",
      description: "Use simpler language",
      action: () => commands.simplify(),
    },
    {
      id: "changeTone",
      label: "Change Tone",
      description: `Change to ${selectedTone}`,
      action: () => commands.changeTone({ tone: selectedTone }),
    },
    {
      id: "translate",
      label: "Translate",
      description: `Translate to ${selectedLanguage}`,
      action: () => commands.translate({ language: selectedLanguage }),
    },
  ];

  const handleCommandClick = async (command: AiCommand) => {
    setIsGenerating(true);
    try {
      command.action();
    } catch (error) {
      console.error("AI command error:", error);
    }
    // Note: isGenerating will be managed by the AI extension state
  };

  const handleCustomPrompt = () => {
    if (!customPrompt.trim()) return;

    setIsGenerating(true);
    commands.customPrompt({
      text: customPrompt,
      tone: selectedTone,
    });
    setCustomPrompt("");
  };

  const handleAccept = () => {
    contentActions.accept();
    setIsGenerating(false);
    onClose?.();
  };

  const handleReject = () => {
    contentActions.reject();
    setIsGenerating(false);
    onClose?.();
  };

  const handleStop = () => {
    contentActions.stop();
    setIsGenerating(false);
  };

  return (
    <Card className={className}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AiSparklesIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold">AI Commands</h3>
          </div>
          {utils.selectedText && (
            <span className="text-xs text-gray-500">
              {utils.selectedText.length} chars selected
            </span>
          )}
        </div>

        {/* Tone Selector */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-700 block mb-1">Tone</label>
          <select
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="friendly">Friendly</option>
            <option value="formal">Formal</option>
            <option value="technical">Technical</option>
            <option value="creative">Creative</option>
            <option value="academic">Academic</option>
            <option value="persuasive">Persuasive</option>
          </select>
        </div>

        {/* Language Selector */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="auto">Auto-detect</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
          </select>
        </div>

        {/* AI Commands */}
        <div className="space-y-2 mb-4">
          {aiCommands.map((command) => (
            <button
              key={command.id}
              onClick={() => handleCommandClick(command)}
              disabled={isGenerating}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{command.label}</p>
                  <p className="text-xs text-gray-500">{command.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Custom Prompt */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Custom Prompt
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCustomPrompt();
                }
              }}
              placeholder="Ask AI anything..."
              className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
              disabled={isGenerating}
            />
            <Button
              data-size="sm"
              onClick={handleCustomPrompt}
              disabled={!customPrompt.trim() || isGenerating}
            >
              Send
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        {isGenerating ? (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
            <span className="text-sm text-blue-700">AI is working...</span>
            <Button data-style="ghost" data-size="sm" onClick={handleStop}>
              <StopCircle2Icon className="w-4 h-4" />
              Stop
            </Button>
          </div>
        ) : (
          <ButtonGroup className="w-full">
            <Button data-style="outline" onClick={handleAccept} className="flex-1">
              <CheckAiIcon className="w-4 h-4 mr-1" />
              Accept
            </Button>
            <Button data-style="outline" onClick={handleReject} className="flex-1">
              <RefreshAiIcon className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </ButtonGroup>
        )}
      </div>
    </Card>
  );
}
