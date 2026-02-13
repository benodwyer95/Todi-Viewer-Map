# Match Counter Fix - Testing Guide

## What Was Fixed

### Issue
The match counter in LabelFX Builder header was stuck at "0 / 0" even when the developer console showed matches were found (e.g., "38 matches out of 436 candidates").

### Root Causes
1. **Timing Issue**: Function was called before data loaded
2. **Missing Debug Info**: No logging to diagnose the problem
3. **No Multi-Panorama Support**: Only showed current panorama matches

### Solution Implemented
1. **Enhanced Debug Logging**: Every step is now logged to console
2. **Multi-Panorama Counting**: Shows matches in prev/current/next panoramas
3. **Better Error Handling**: Warns if DOM elements are missing
4. **Element Detection**: Verifies element exists before updating

## New Counter Format

### Single Panorama or Navigation
```
Format: "1 / 38"
Meaning: Match 1 of 38 in current panorama
```

### Multi-Panorama View (After Filter Refresh)
```
Format: "12 / 38 / 15"
Meaning: Previous pano has 12 matches | Current has 38 | Next has 15
Tooltip: Hover to see detailed explanation
```

## Testing Steps

### 1. Open Viewer with Console
```bash
# Start server
python3 serve.py
# or: npm run serve
# or: npx http-server -p 8000

# Open browser to:
http://127.0.0.1:8000/index_v14_REFACTORED.html

# Open DevTools Console (F12 or Ctrl+Shift+I)
```

### 2. Wait for Data to Load
Look for console message:
```
Loaded: TPANO_1 • markers: 436
```
This means panorama data is ready.

### 3. Open Label Builder
1. Click "Open Label Builder" button in top controls
2. Builder overlay appears
3. Navigate to "2. Filter" tab (should be active by default)

### 4. Apply Filter
1. Ensure "Landmarks Only" preset is selected
2. Click "🔄 Refresh Matches" button
3. **Watch console** for these messages:

**Expected Console Output:**
```
[LabelFX] Manual refresh triggered
[LabelFX] Filter applied: 38 matches out of 436 total candidates
[Bridge] Synced 38 matches to ViewerState.labelFxRuntime["uuid-here"]
[Builder Counter] Called with: current=1, totalCurrent=38, filterConfig=true
[Multi-Pano Matches] Prev: 0, Current: 38, Next: 0
[Builder Counter] Found counterEl: true
[Builder Counter] Updated counter to: "0 / 38 / 0"
```

### 5. Check UI Elements

**Header Counter** (bottom of builder):
- Location: Between "◀ Cand" and "Cand ▶" buttons
- Should show: "0 / 38 / 0" or similar (not "0 / 0")
- Opacity: Full (not dimmed)
- Hover: Tooltip explains the numbers

**Filter Section** (in Filter tab):
- Location: Below "🔄 Refresh Matches" button
- Should show: Green box with match details
- Example: "✓ **38 matches** found in current panorama • Previous pano: **0** • Next pano: **0** • Currently viewing match **1**"

### 6. Test Navigation
1. Click "Cand >" button (next candidate)
2. **Watch console**:
```
[CycleCandidateNav] Now at match 2 of 38
[Builder Counter] Called with: current=2, totalCurrent=38, filterConfig=true
[Multi-Pano Matches] Prev: 0, Current: 38, Next: 0
[Builder Counter] Updated counter to: "0 / 38 / 0"
```
3. **Check header counter**: Format stays "0 / 38 / 0" (multi-pano counts don't change on navigation)
4. **Check filter display**: "Currently viewing match **2**" updates

### 7. Test Different Presets
Try other filter presets:
- Amenity Only
- Leisure Only
- Place Only
- Named Places

Each should show different match counts.

## Troubleshooting

### Counter Still Shows "0 / 0"

**Check Console Logs:**

#### If you see: `[Builder Counter] Found counterEl: false`
**Problem**: DOM element not found
**Solutions**:
- Verify Label Builder is actually open (overlay visible)
- Check if element ID changed in HTML
- Inspect element with DevTools to confirm ID is "lfxCandCounter"

#### If you see: No `[Builder Counter]` logs at all
**Problem**: Function not being called
**Solutions**:
- Check if `[LabelFX] Filter applied:...` appears (filter working?)
- Check if `[Bridge] Synced...` appears (bridge working?)
- If neither appear, data may not be loaded

#### If you see: `[LabelFX] Data not loaded yet`
**Problem**: Panorama JSON hasn't loaded
**Solutions**:
- Wait longer for data to load
- Check browser Network tab for JSON request
- Verify `data/candidates_sample.json` exists
- Check console for "Loaded: TPANO_1" message

### Multi-Pano Counts All Show 0

**Check Console**: `[Multi-Pano Matches] Prev: 0, Current: 38, Next: 0`

**Possible Reasons**:
1. **Only one panorama**: If dataset has single pano, prev/next will be 0
2. **Edge panos**: If on first pano, prev=0. If on last, next=0
3. **Filter doesn't match**: Other panoramas may have no matches for this filter

**This is NORMAL** if:
- Testing with sample data (may have 1 pano)
- Current pano is first or last in sequence
- Filter is very specific (only matches in one pano)

### Function Calls But Counter Doesn't Update

**Check for JavaScript errors**:
```javascript
// Look for red errors in console
[Builder Counter] Update error: ...
```

**Common Issues**:
- Element removed from DOM after page load
- CSS is hiding the counter
- Element is in different scope/iframe

**Debug Commands** (run in browser console):
```javascript
// Check if element exists
document.getElementById('lfxCandCounter')
// Should return: <span id="lfxCandCounter">0 / 0</span>

// Check if function exists
window.updateBuilderMatchCounter
// Should return: ƒ updateBuilderMatchCounter(current, totalCurrent, filterConfig) {...}

// Manually call function
window.updateBuilderMatchCounter(5, 42, null)
// Counter should immediately update to "5 / 42"

// Check ViewerState
window.ViewerState.labelFxRuntime
// Should show object with match data
```

## Success Criteria

✅ **Counter Updates**: Shows actual match count, not "0 / 0"
✅ **Console Logging**: Clear logs at each step
✅ **Multi-Pano**: Shows prev/current/next when applicable
✅ **Navigation**: Counter updates on Cand < / > clicks
✅ **Filter Display**: Green box shows match details
✅ **Tooltip**: Hover on counter shows explanation

## What's Next

Once counter is working correctly, the next features to implement:
1. **Live Label Preview**: Render label sprite on panorama at candidate position
2. **Camera Panning**: Visual animation when navigating between candidates
3. **Preset Testing**: Comprehensive testing of all 6 filter presets
4. **WYSIWYG Editing**: Real-time label updates as you edit text/styling

## Need Help?

### Report Issues With:
1. Complete console output (copy/paste all logs)
2. Screenshot of Label Builder showing counter
3. Browser and version (Chrome 144, Firefox 123, etc.)
4. Dataset info (how many panoramas, candidates)
5. Filter preset being used

### Useful Console Commands

```javascript
// Dump all relevant state
console.log({
  SOURCES: window.SOURCES?.length,
  currentIndex: window.currentIndex,
  ViewerState: window.ViewerState,
  counterElement: document.getElementById('lfxCandCounter')?.textContent
});

// Force counter update (for testing)
window.updateBuilderMatchCounter(1, 38, null);

// Check if builder is open
document.getElementById('labelFxBuilderOverlay').style.display;
// Should be: "block" (if open) or "none" (if closed)
```

---

**Last Updated**: 2026-02-13
**Version**: v14 with Multi-Panorama Support
**Status**: Testing Required
