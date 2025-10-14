# Tiptap AI Features Setup Guide

This guide will help you set up and configure the Tiptap Pro AI features in Writely v2.

## Prerequisites

1. **Tiptap Pro Account**: You need a Tiptap Pro Team plan subscription
2. **Tiptap Cloud Access**: AI features require access to Tiptap Cloud
3. **API Token**: You need to have your Tiptap Pro registry token configured (already done in `.npmrc`)

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Tiptap AI Configuration
NEXT_PUBLIC_TIPTAP_AI_APP_ID=your-tiptap-app-id

# Optional: If using custom LLM backend
NEXT_PUBLIC_AI_BACKEND_URL=your-custom-backend-url
OPENAI_API_KEY=your-openai-api-key
```

### Getting Your Tiptap App ID

1. Log in to [Tiptap Cloud](https://cloud.tiptap.dev/)
2. Navigate to your project dashboard
3. Go to Settings > API
4. Copy your App ID
5. Paste it as `NEXT_PUBLIC_TIPTAP_AI_APP_ID` in your `.env` file

## Installed AI Extensions

The following Tiptap Pro AI extensions have been installed:

### 1. **@tiptap-pro/extension-ai** (v3.3.0)
Core AI generation extension with streaming support.

**Features:**
- Pre-configured AI commands (improve, fix spelling, make shorter/longer, etc.)
- Real-time streaming of AI responses
- Custom prompt support
- Tone and language customization
- Works with OpenAI models (gpt-4o, gpt-4o-mini)

### 2. **@tiptap-pro/extension-ai-agent** (v3.0.0-beta.40)
AI agent for intelligent document editing.

**Features:**
- Read and understand document structure
- Make precise edits to documents
- Aware of custom elements
- Integration with external data sources
- RAG (Retrieval Augmented Generation) support

### 3. **@tiptap-pro/extension-ai-suggestion** (v3.0.0-beta.39)
AI-powered proofreading and suggestions.

**Features:**
- Real-time content analysis
- Style guide enforcement
- Grammar and spelling suggestions
- Readability improvements
- Accept/reject individual suggestions
- Custom rules support

### 4. **@tiptap-pro/extension-ai-changes** (v3.0.0-beta.36)
Track and review AI-generated changes.

**Features:**
- Highlight AI-generated changes
- Accept/reject individual changes
- Diff view for changes
- Rich text formatting support
- Bulk accept/reject actions

## Configuration Files

The following configuration files have been created:

### 1. AI Configuration (`apps/web/modules/shared/tiptap/config/ai-config.ts`)
Contains all AI extension configurations:
- AI extension options
- AI Agent settings
- AI Suggestion rules
- AI Changes tracking
- Model selection
- Tone and language presets
- Feature flags

### 2. AI Utilities (`apps/web/modules/shared/tiptap/lib/tiptap-ai-utils.ts`)
Helper functions for working with AI extensions:
- Execute AI commands
- Accept/reject AI content
- Manage suggestions and changes
- Format AI prompts
- Type guards for feature detection

### 3. AI Hooks (`apps/web/modules/shared/tiptap/hooks/use-ai-commands.ts`)
React hook for easy AI integration:
- Pre-configured commands
- Content management actions
- Suggestion management
- Change tracking
- Feature detection

## UI Components

The following UI components have been created for AI features:

### 1. AI Commands Menu (`ai-commands-menu.tsx`)
Interactive menu for AI commands with:
- Pre-built command buttons
- Tone selector
- Language selector
- Custom prompt input
- Accept/Reject/Stop actions

### 2. AI Suggestions Panel (`ai-suggestions-panel.tsx`)
Display and manage AI suggestions:
- List all suggestions
- Show suggestion details
- Accept/reject individual suggestions
- Category and type indicators

### 3. AI Changes Panel (`ai-changes-panel.tsx`)
Track and review AI changes:
- Display all AI changes
- Show additions/deletions/modifications
- Accept/reject individual changes
- Bulk accept/reject all changes
- Timestamp tracking

## Usage in Editor

The AI extensions are automatically integrated into your editor when you provide an AI token. Here's how they work:

### In `editor-provider.tsx`:

```tsx
import Ai from "@tiptap-pro/extension-ai";
import AiAgent from "@tiptap-pro/extension-ai-agent";
import AiSuggestion from "@tiptap-pro/extension-ai-suggestion";
import AiChanges from "@tiptap-pro/extension-ai-changes";

const editor = useEditor({
  extensions: [
    // ... other extensions
    ...(AI_FEATURES.textGeneration && aiToken
      ? [Ai.configure(getAiExtensionConfig(aiToken))]
      : []),
    ...(AI_FEATURES.aiAgent && aiToken
      ? [AiAgent.configure(getAiAgentConfig(aiToken))]
      : []),
    ...(AI_FEATURES.aiSuggestions && aiToken
      ? [AiSuggestion.configure(getAiSuggestionConfig(aiToken))]
      : []),
    ...(AI_FEATURES.trackChanges
      ? [AiChanges.configure(getAiChangesConfig())]
      : []),
  ],
});
```

## Using AI Commands

### Basic Commands

```tsx
import { useAiCommands } from "@shared/tiptap/hooks/use-ai-commands";

function MyComponent({ editor }) {
  const { commands, contentActions } = useAiCommands({ editor });

  // Improve selected text
  const handleImprove = () => {
    commands.improve({ tone: "professional" });
  };

  // Fix spelling and grammar
  const handleFix = () => {
    commands.fixSpelling();
  };

  // Custom prompt
  const handleCustom = () => {
    commands.customPrompt({
      text: "Rewrite this in a more engaging way",
      tone: "creative",
    });
  };

  // Accept AI changes
  const handleAccept = () => {
    contentActions.accept();
  };

  // Reject AI changes
  const handleReject = () => {
    contentActions.reject();
  };

  return (
    // Your UI
  );
}
```

### Working with Suggestions

```tsx
const { suggestionActions } = useAiCommands({ editor });

// Get all suggestions
const suggestions = suggestionActions.suggestions;

// Accept a suggestion
suggestionActions.acceptSuggestion(suggestionId);

// Reject a suggestion
suggestionActions.rejectSuggestion(suggestionId);
```

### Working with Changes

```tsx
const { changeActions } = useAiCommands({ editor });

// Get all changes
const changes = changeActions.changes;

// Accept a change
changeActions.acceptChange(changeId);

// Reject a change
changeActions.rejectChange(changeId);

// Accept all changes
changeActions.acceptAllChanges();

// Reject all changes
changeActions.rejectAllChanges();
```

## Feature Flags

Control which AI features are enabled in `ai-config.ts`:

```ts
export const AI_FEATURES = {
  textGeneration: true,     // Core AI generation
  aiAgent: true,            // AI Agent for document editing
  aiSuggestions: true,      // AI Suggestions for proofreading
  trackChanges: true,       // Track AI changes
  imageGeneration: false,   // Image generation (requires dall-e-3)
  customLLM: false,         // Custom LLM integration
} as const;
```

## Customization

### Custom AI Commands

Add custom commands in `ai-config.ts`:

```ts
export const getAiExtensionConfig = (aiToken: string | null) => {
  return {
    // ... existing config
    commands: [
      {
        name: "summarize",
        prompt: "Summarize this text in 2-3 sentences",
        label: "Summarize",
      },
      {
        name: "bulletPoints",
        prompt: "Convert this text into bullet points",
        label: "To Bullet Points",
      },
    ],
  };
};
```

### Custom Suggestion Rules

Add custom rules in `ai-config.ts`:

```ts
export const getAiSuggestionConfig = (aiToken: string | null) => {
  return {
    // ... existing config
    rules: [
      // ... existing rules
      {
        id: "brand-voice",
        name: "Brand Voice",
        description: "Ensure content matches our brand voice",
        enabled: true,
      },
    ],
  };
};
```

## Troubleshooting

### AI Features Not Working

1. **Check AI token**: Ensure `aiToken` is available in the editor provider
2. **Verify App ID**: Make sure `NEXT_PUBLIC_TIPTAP_AI_APP_ID` is set correctly
3. **Check console**: Look for error messages in browser console
4. **Verify subscription**: Ensure you have an active Tiptap Pro Team plan

### Suggestions Not Appearing

1. **Enable feature**: Check that `AI_FEATURES.aiSuggestions` is `true`
2. **Wait for analysis**: AI suggestions may take a few seconds to generate
3. **Check content**: Make sure there's content in the editor to analyze

### Changes Not Tracked

1. **Enable feature**: Check that `AI_FEATURES.trackChanges` is `true`
2. **Use AI commands**: Changes are only tracked when using AI commands
3. **Check extension**: Verify AiChanges extension is loaded

## Best Practices

1. **Use streaming**: Keep `stream: true` for better UX
2. **Provide context**: Use `getDocumentContext()` for better AI results
3. **Handle errors**: Always wrap AI commands in try-catch blocks
4. **Show loading states**: Use `isAiGenerating()` to show loading indicators
5. **Allow cancellation**: Provide stop/cancel buttons for long operations
6. **Review changes**: Always allow users to review and accept/reject AI changes

## Next Steps

1. Set up your Tiptap App ID in environment variables
2. Test AI commands in the editor
3. Customize AI commands and rules for your use case
4. Integrate AI suggestions panel into your UI
5. Add AI changes tracking to your workflow
6. Consider implementing custom LLM backend for advanced use cases

## Resources

- [Tiptap AI Documentation](https://tiptap.dev/docs/ai/introduction)
- [Tiptap Cloud Console](https://cloud.tiptap.dev/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [AI Toolkit Guide](https://tiptap.dev/docs/ai/ai-toolkit) (Team plan required)

## Support

For issues or questions:
1. Check Tiptap documentation
2. Review this setup guide
3. Check the CLAUDE.md file for project-specific instructions
4. Contact Tiptap support for subscription issues
