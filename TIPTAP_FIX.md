# Fix Tiptap Pro Installation Error

## Problem
```
ERR_PNPM_FETCH_404  GET https://registry.npmjs.org/@tiptap-pro/extension-ai-suggestion/-/extension-ai-suggestion-3.0.0-beta.39.tgz: Not Found - 404
```

The beta version `3.0.0-beta.39` of `@tiptap-pro/extension-ai-suggestion` is no longer available.

## Solutions

### Option 1: Update to Latest Stable Version (Recommended)

Run this command to update all Tiptap Pro packages to their latest versions:

```bash
pnpm update @tiptap-pro/extension-ai-suggestion --latest
```

### Option 2: Try a Different Beta Version

If you need a beta version, try the latest beta:

```bash
pnpm add @tiptap-pro/extension-ai-suggestion@latest
```

### Option 3: Manual Package.json Update

Edit `apps/web/package.json` and change the version:

**From:**
```json
"@tiptap-pro/extension-ai-suggestion": "3.0.0-beta.39"
```

**To one of these:**
```json
"@tiptap-pro/extension-ai-suggestion": "^3.2.1"  // Latest stable
```

OR

```json
"@tiptap-pro/extension-ai-suggestion": "latest"  // Always latest
```

Then run:
```bash
pnpm install
```

### Option 4: Update All Beta Packages

Update all problematic beta packages at once:

```bash
# Update to latest versions
pnpm update @tiptap-pro/extension-ai-agent --latest
pnpm update @tiptap-pro/extension-ai-changes --latest
pnpm update @tiptap-pro/extension-ai-suggestion --latest
pnpm update @tiptap-pro/extension-snapshot-compare --latest
```

### Option 5: Remove and Reinstall

If updates don't work, remove and reinstall:

```bash
# Remove lock file and node_modules
rm -rf node_modules pnpm-lock.yaml
rm -rf apps/web/node_modules

# Clear pnpm cache
pnpm store prune

# Reinstall
pnpm install
```

## Recommended Approach

1. **First, try Option 1** (update to latest):
   ```bash
   pnpm update @tiptap-pro/extension-ai-suggestion --latest
   ```

2. **If that fails, use Option 3** (manual update to stable version):
   - Edit `apps/web/package.json`
   - Change: `"@tiptap-pro/extension-ai-suggestion": "^3.2.1"`
   - Run: `pnpm install`

3. **If still failing, verify your Tiptap Pro credentials**:
   - Check `.npmrc` has the correct auth token
   - Verify your Tiptap Pro subscription is active
   - Token should look like: `//registry.tiptap.dev/:_authToken=YOUR_TOKEN`

## Why This Happened

Beta versions are temporary and may be:
- Removed after the stable release
- Superseded by newer beta versions
- Unpublished if they had critical bugs

Always prefer stable versions (`^3.x.x`) unless you specifically need beta features.

## Quick Fix Command

Try this one-liner:

```bash
pnpm remove @tiptap-pro/extension-ai-suggestion && pnpm add @tiptap-pro/extension-ai-suggestion@latest
```

## Verification

After fixing, verify the installation:

```bash
pnpm list @tiptap-pro/extension-ai-suggestion
```

Should show the installed version without errors.

## Long-term Solution

Consider pinning to stable versions in `package.json`:

```json
{
  "dependencies": {
    "@tiptap-pro/extension-ai-suggestion": "^3.2.1",
    "@tiptap-pro/extension-ai-agent": "^3.2.1",
    "@tiptap-pro/extension-ai-changes": "^3.2.1"
  }
}
```

This avoids beta version issues while still getting patch updates.
