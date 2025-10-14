# Tiptap AI - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Set Environment Variable

Add to `.env`:
```bash
NEXT_PUBLIC_TIPTAP_AI_APP_ID=your-app-id-here
```

Get your App ID from: https://cloud.tiptap.dev/

### Step 2: Use AI Commands

```tsx
import { useAiCommands } from '@shared/tiptap/hooks/use-ai-commands';

function MyEditor({ editor }) {
  const { commands } = useAiCommands({ editor });

  return (
    <button onClick={() => commands.improve({ tone: 'professional' })}>
      Improve Text
    </button>
  );
}
```

### Step 3: Add UI Components (Optional)

```tsx
import { AiCommandsMenu } from '@shared/tiptap/components/tiptap-ui/ai-commands/ai-commands-menu';

<AiCommandsMenu editor={editor} />
```

---

## 📝 Available Commands

```typescript
const { commands } = useAiCommands({ editor });

// Text Improvement
commands.improve({ tone: 'professional' });
commands.fixSpelling();
commands.makeShorter();
commands.makeLonger();
commands.simplify();
commands.emojify();

// Tone & Translation
commands.changeTone({ tone: 'casual' });
commands.translate({ language: 'es' });

// Custom
commands.customPrompt({ text: 'Your custom prompt here' });
```

---

## 🎨 Tone Options

- `professional`
- `casual`
- `friendly`
- `formal`
- `technical`
- `creative`
- `academic`
- `persuasive`

## 🌍 Language Options

- `en` - English
- `es` - Spanish
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- `zh` - Chinese
- `ja` - Japanese
- `ko` - Korean
- `ar` - Arabic

---

## 🎯 Quick Examples

### Improve Selected Text
```tsx
<button onClick={() => commands.improve()}>
  ✨ Improve
</button>
```

### Fix Spelling & Grammar
```tsx
<button onClick={() => commands.fixSpelling()}>
  ✓ Fix Errors
</button>
```

### Change Tone
```tsx
<select onChange={(e) => commands.changeTone({ tone: e.target.value })}>
  <option value="professional">Professional</option>
  <option value="casual">Casual</option>
  <option value="friendly">Friendly</option>
</select>
```

### Translate
```tsx
<button onClick={() => commands.translate({ language: 'es' })}>
  🌐 Translate to Spanish
</button>
```

### Custom AI Prompt
```tsx
<input
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      commands.customPrompt({ text: e.currentTarget.value });
    }
  }}
  placeholder="Ask AI anything..."
/>
```

---

## 🛠 Managing AI Content

```typescript
const { contentActions } = useAiCommands({ editor });

// Accept AI changes
contentActions.accept();

// Reject AI changes
contentActions.reject();

// Stop AI generation
contentActions.stop();
```

---

## 📊 Feature Detection

```typescript
const { features } = useAiCommands({ editor });

if (features.hasAi) {
  // Show AI commands
}

if (features.hasAiSuggestion) {
  // Show suggestions panel
}

if (features.hasAiChanges) {
  // Show changes panel
}
```

---

## 🔧 Configuration

Edit `apps/web/modules/shared/tiptap/config/ai-config.ts`:

```typescript
export const AI_FEATURES = {
  textGeneration: true,   // Enable/disable AI commands
  aiAgent: true,          // Enable/disable AI agent
  aiSuggestions: true,    // Enable/disable suggestions
  trackChanges: true,     // Enable/disable change tracking
};
```

---

## 📚 Full Documentation

- **Setup Guide**: [AI_SETUP.md](AI_SETUP.md)
- **Implementation Summary**: [TIPTAP_AI_INTEGRATION_SUMMARY.md](TIPTAP_AI_INTEGRATION_SUMMARY.md)
- **Tiptap Docs**: https://tiptap.dev/docs/ai/introduction

---

## ❓ Troubleshooting

**AI not working?**
1. Check `NEXT_PUBLIC_TIPTAP_AI_APP_ID` is set
2. Verify you have a Tiptap Pro Team plan
3. Check browser console for errors

**Need help?**
- Check [AI_SETUP.md](AI_SETUP.md) for detailed troubleshooting
- Review [Tiptap AI Documentation](https://tiptap.dev/docs/ai/introduction)
- Check Tiptap Discord community

---

## 🎉 You're Ready!

Start using AI features in your editor right now:

```tsx
import { useAiCommands } from '@shared/tiptap/hooks/use-ai-commands';

export function YourEditor({ editor }) {
  const { commands } = useAiCommands({ editor });

  return (
    <div>
      <button onClick={() => commands.improve()}>
        ✨ Improve with AI
      </button>
      <EditorContent editor={editor} />
    </div>
  );
}
```

Happy editing with AI! 🚀✨
