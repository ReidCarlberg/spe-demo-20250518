# API Explorer - Always On Architecture

## Overview
Debug mode is now **always active**. The API Explorer is always available via the floating action button (FAB). There's no need to toggle debug mode on or off.

## Changes Made

### 1. DebugModeContext.jsx
- `isDebugModeActive` is now always `true`
- Removed localStorage persistence (no more saving debug_mode state)
- Removed `toggleDebugMode` function from context
- API interception is always setup on app load
- Keyboard shortcut (Alt+D) still works to toggle the panel visibility

### 2. Navbar.jsx
- Removed `DebugModeToggle` component import
- Removed toggle from nav-actions (desktop)
- Removed toggle from mobile menu

### 3. DebugModeToggle.jsx
- Component is now a no-op (returns null)
- Kept for backward compatibility but not used
- Can be deleted if no other code references it

### 4. ApiDebugPanel.jsx
- Removed debug mode active check (always renders if panel is visible)
- Simplified logging (removed "debug mode not active" checks)

## How It Works Now

1. **On App Load:**
   - API debugging is automatically enabled
   - All API calls are captured
   - No user action needed

2. **Using the API Explorer:**
   - Desktop: Floating action button (⋯) → "API Explorer"
   - Mobile: Floating action button (⋯) → "API Explorer" → panel slides in from bottom
   - Alt+D keyboard shortcut: Toggles panel visibility

3. **No Toggle Needed:**
   - Users can't disable API tracking
   - It's always collecting API calls
   - Panel can be opened/closed but API collection continues

## Benefits

✅ **Simpler UX** - No confusing toggle needed  
✅ **Always Available** - No need to remember to enable it  
✅ **Consistent State** - No localStorage inconsistencies  
✅ **Performance** - Light overhead, always-on tracking is cheap  
✅ **Debugging** - Always have API history when you need it  

## Data Persistence

- API calls are stored in memory only
- Limited to 50 most recent calls
- Cleared when page refreshes
- No localStorage persistence needed

## Keyboard Shortcuts

- **Alt+D**: Toggle API Explorer panel visibility

## For Developers

If you need to toggle debug mode in the future, you'll need to:
1. Add `toggleDebugMode` back to context
2. Update `isDebugModeActive` to use `useState` with a setter
3. Re-add DebugModeToggle to the Navbar UI

But this is not necessary for the current use case - always-on is the right approach.
