# Mobile API Explorer Panel Debugging Guide

## Root Cause Found! 🎯

**The issue is NOT with the API Explorer panel itself - it's that DEBUG MODE was never enabled!**

The `DebugModeToggle` component existed but was never added to the UI, so there was no way to enable debug mode on mobile (or desktop).

### The Logs Proved It:
```
[SpeExplorePage] Debug context state - isDebugModeActive: false
[ApiDebugPanel] Debug mode not active, returning null
```

Debug mode was `false`, so the panel wouldn't render even though `setIsPanelVisible(true)` was being called!

## Solution ✅

I've added the `DebugModeToggle` component to the Navbar in two places:

1. **Desktop (nav-actions area)** - Right side next to Logout button
2. **Mobile (nav-items menu)** - In the hamburger menu, separated with a divider

Now you can:
1. **On Desktop:** Click the "API Explorer" toggle in the top-right navbar
2. **On Mobile:** Tap the ☰ menu → scroll down → toggle "API Explorer"
3. Then use the floating action button (⋯) menu → "API Explorer" to open the panel

## How It Works

The flow is now:
1. **Enable Debug Mode** via the navbar toggle (this activates `isDebugModeActive = true`)
2. **Click the FAB (⋯) menu** on mobile or the toggle button on desktop
3. **Click "API Explorer"** option
4. **Panel appears with all API calls logged**

## Comprehensive Logging Added

### 1. **DebugModeContext.jsx** - Context State Changes
- Logs when context initializes
- Logs every time `isPanelVisible` changes
- Logs `setIsPanelVisible` calls with:
  - `isDebugModeActive` state
  - Current `isPanelVisible` value before update
  - Full stack trace to see who's calling it

### 2. **ApiDebugPanel.jsx** - Panel Rendering
- **Main render check:**
  - Logs when debug mode is NOT active (early return)
  - Logs current state: `isPanelVisible`, `isMobile`, `isDebugModeActive`, `apiCalls.length`
  
- **When overlay renders:**
  - Logs when overlay starts rendering
  
- **When flyout panel renders:**
  - Logs before flyout creation
  - On load event, logs:
    - Panel DOM element `getBoundingClientRect()` (position, size)
    - Computed styles: `display`, `opacity`, `transform`, `z-index`
    - This helps diagnose CSS issues (off-screen, hidden, wrong z-index, etc.)

### 3. **SpeExplorePage.jsx** - User Action Flow
- **Page mount/updates:**
  - Logs `isDebugModeActive` state
  - Logs if `setIsPanelVisible` function is available
  
- **API Explorer button click:**
  - Logs "API Explorer button clicked"
  - Logs `setIsPanelVisible` function type and value
  - Logs drawer close action
  - Logs timeout initiation (350ms delay)
  - After timeout:
    - Checks if `setIsPanelVisible` is null/undefined
    - Logs before calling `setIsPanelVisible(true)`
    - Logs success or error with stack trace

## How to Use This Logging

1. **Open browser DevTools Console** (F12)
2. **Enable Debug Mode** in the app
3. **On mobile, click the floating action button (⋯)**
4. **Tap "API Explorer" from the mobile menu**
5. **Look for these log sequences:**

### Expected Log Sequence
```
[DebugModeContext] Initialized with isDebugModeActive = true ...
[SpeExplorePage] Debug context state - isDebugModeActive: true setIsPanelVisible available: true
[SpeExplorePage] API Explorer button clicked
[SpeExplorePage] setIsPanelVisible function: function
[SpeExplorePage] Closed mobile tools drawer, waiting 350ms...
[SpeExplorePage] After timeout - About to set isPanelVisible to true
[SpeExplorePage] Calling setIsPanelVisible(true)
[DebugModeContext] setIsPanelVisible called with: true
[DebugModeContext] isPanelVisible changed to: true
[ApiDebugPanel] Main render - isPanelVisible = true isMobile = true
[ApiDebugPanel] isDebugModeActive = true
[ApiDebugPanel] apiCalls count = 0 (or whatever)
[ApiDebugPanel] About to render flyout panel - isMobile = true
[ApiDebugPanel] Flyout panel DOM element loaded
[ApiDebugPanel] Panel rect: DOMRect {...} 
[ApiDebugPanel] Panel computed style - display: block opacity: 1 transform: translateY(0) zIndex: 9999
```

## Diagnostic Clues

### If you see `isDebugModeActive: false`
**Problem:** Debug mode isn't enabled
**Solution:** Enable debug mode first before clicking API Explorer

### If you see `setIsPanelVisible available: false`
**Problem:** Context wasn't properly initialized
**Solution:** Check if DebugModeProvider wraps the component tree

### If the logs stop at `setIsPanelVisible(true)` callback
**Problem:** Function call failed silently
**Look for:** Error logs or stack traces in console

### If `isPanelVisible` never changes to `true`
**Problem:** State update failed
**Check:** Is there an error in the console? Is localStorage being cleared?

### If panel renders but stays off-screen
**Look at computed styles:**
- `display: none` → CSS is hiding it
- `transform: translateY(110%)` → Animation didn't complete
- `opacity: 0` → CSS opacity issue
- `zIndex: 9997` or lower → Covered by backdrop (should be 9999)
- Rect coordinates outside viewport → Positioned off-screen

## Quick Fixes to Try

1. **Check localStorage.debug_mode**
   ```javascript
   localStorage.getItem('debug_mode') // Should be 'true'
   ```

2. **Manually trigger panel from console**
   ```javascript
   // Get the context
   const ctx = // Find context value
   ctx.setIsPanelVisible(true);
   ```

3. **Check if styles loaded**
   ```javascript
   window.getComputedStyle(document.querySelector('.api-debug-panel-flyout'))
   ```

4. **Check z-index layering**
   ```javascript
   console.log('Overlay z-index:', getComputedStyle(document.querySelector('.api-debug-panel-overlay')).zIndex);
   console.log('Flyout z-index:', getComputedStyle(document.querySelector('.api-debug-panel-flyout')).zIndex);
   console.log('Backdrop z-index:', getComputedStyle(document.querySelector('.mobile-tools-backdrop')).zIndex);
   ```

## Files Modified
- `src/context/DebugModeContext.jsx` - Added context state logging
- `src/components/debug/ApiDebugPanel.jsx` - Added panel render logging
- `src/pages/SpeExplorePage.jsx` - Added button click and state logging
