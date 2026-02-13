# Testing Guide: Label Preview System

## Cannot Take Screenshots in Code Environment

**Note**: I work in a code-only environment and cannot run browsers or take actual screenshots. This guide will help YOU verify the label preview system is working correctly.

## Quick Test (2 Minutes)

### Step 1: Start Server
```bash
cd /path/to/Todi-Viewer-Map
python serve.py
```
Or:
```bash
python -m http.server 8000
```

### Step 2: Open in Browser
Navigate to: `http://localhost:8000/index_v14_REFACTORED.html`

### Step 3: Open Developer Console
- Chrome/Edge: Press `F12`
- Firefox: Press `F12`
- Safari: Enable Developer Menu, then press `Cmd+Option+I`

### Step 4: Open Label Builder
- Click button on left side of screen
- Label Builder panel should slide in

### Step 5: Apply Filter
- Click **"Landmarks Only"** preset button
- Click **"Refresh Matches"** button
- Watch console and panorama view

## What You Should See

### ✅ Success Indicators

#### In Developer Console:
```
[V14] Modules loaded successfully
[Label Preview] Manager initialized successfully
[LabelFX] Filter applied: 38 matches out of 436 total candidates
[Camera] Panning to candidate "Montesanto": yaw=156.69°, pitch=-1.09°
[Camera] Panning executed successfully
[Label Preview] Showing label for candidate 0: Montesanto  ← KEY MESSAGE!
[FocusMatchedCandidate] Focused on candidate 0: Montesanto
```

#### In 3D Panorama View:
- **White rectangular label** floating in the panorama
- **16:9 aspect ratio** (horizontal rectangle, wider than tall)
- **Black text** displaying candidate name (e.g., "Montesanto")
- **Positioned** where the camera is pointing (at the landmark)
- **Size**: Approximately 960x540 pixels visual size

### ❌ Failure Indicators

If you see these, something is wrong:

```
❌ [Label Preview] THREE.js not available
❌ [Label Preview] No candidate provided
❌ [Label Preview] No label config provided
❌ [Label Preview] Error showing label: ...
```

## Test Navigation

### Test Candidate Navigation:
1. Click **"Cand >"** button (right arrow)
2. **Expected**: 
   - Console shows: `[Label Preview] Showing label for candidate X: [name]`
   - Label text updates to show new candidate name
   - Camera pans to new candidate
3. Click **"Cand >"** again multiple times
4. **Expected**: Label updates each time

### Test Pano Navigation:
1. Click **"Pano >"** button
2. **Expected**:
   - Console shows: `[Pano Switch] Applied filter and panned to first match`
   - Console shows: `[Label Preview] Showing label for candidate X: [name]`
   - Label appears at new panorama's first candidate

## Screenshot Evidence Needed

To prove it's working, take these screenshots:

### Screenshot 1: Label Visible
**Show**:
- Panorama view with visible white label
- Developer console on right/bottom showing success messages
- Label Builder panel on left

**Focus**: The white label should be clearly visible in the panorama

### Screenshot 2: Console Messages
**Show**:
- Developer console with these messages:
  - `[Label Preview] Manager initialized successfully`
  - `[Label Preview] Showing label for candidate 0: Montesanto`
  - No error messages

### Screenshot 3: Label Updates (Optional)
**Show**:
- Same view after clicking "Cand >" button
- Console showing new: `[Label Preview] Showing label for candidate 1: [different name]`
- Label text has changed

## Visual Reference

### What the Label Should Look Like:

```
┌─────────────────────────────────────────┐
│                                         │
│            Montesanto                   │  ← Black text on white background
│                                         │
└─────────────────────────────────────────┘
       ↑                                ↑
    16:9 aspect ratio              White rectangle
```

### Positioned In Space:
- Label appears **at** or **near** the landmark
- Floating in the 3D panorama view
- Oriented to face the camera
- Stays at fixed distance from camera viewpoint

## Detailed Testing Checklist

- [ ] Server started successfully
- [ ] Page loads without errors
- [ ] Console shows: `[Label Preview] Manager initialized successfully`
- [ ] Label Builder opens
- [ ] Filter applies successfully
- [ ] Console shows: `[Label Preview] Showing label for candidate 0: [name]`
- [ ] **White label visible** in panorama view
- [ ] Label shows correct candidate name
- [ ] Click "Cand >" - label updates
- [ ] Click "Pano >" - label updates for new pano
- [ ] No THREE.js errors in console
- [ ] No JavaScript errors

## Common Issues

### Issue: No Label Appears

**Check**:
1. Console for `[Label Preview] THREE.js not available` → If yes, refresh page
2. Console for `[Label Preview] Showing label...` → If missing, filter may not be applied
3. Label Builder is actually open
4. A filter has been applied (matches > 0)

**Solution**:
- Refresh browser (Ctrl+F5 / Cmd+Shift+R)
- Clear browser cache
- Try different filter preset

### Issue: Label Appears But Wrong Text

**Check**:
1. Console message: `[Label Preview] Showing label for candidate X: [name]`
2. Verify label text matches the name in console

**Solution**: This is expected behavior - label shows the candidate name

### Issue: Console Shows THREE.js Error

**Error Message**: `[Label Preview] THREE.js not available`

**Solution**:
1. Refresh page completely (Ctrl+F5)
2. Check that THREE.js loaded: Type `window.THREE` in console
3. Should see object, not undefined

## Code Changes Made

For reference, here are the fixes applied:

### 1. Parameter Fix
**Changed**: Pass complete item object instead of undefined layout
```javascript
// Before (broken)
window.labelPreviewManager.showLabel(candidate, index, item.layout);  // ❌ undefined

// After (working)
window.labelPreviewManager.showLabel(candidate, index, item);  // ✅ complete object
```

### 2. THREE.js Scope Fix
**Changed**: Use window.THREE instead of global THREE
```javascript
// Before (broken)
if (typeof THREE === 'undefined') { ... }  // ❌ always true
const sprite = new THREE.Sprite(material);  // ❌ THREE undefined

// After (working)
if (!window.THREE) { ... }  // ✅ correct check
const sprite = new window.THREE.Sprite(material);  // ✅ works
```

## Support

If labels still don't appear after following this guide:

1. Take screenshot of console showing error messages
2. Note any console errors
3. Describe what you see (or don't see)
4. Share screenshots for debugging

## Success Criteria

**You can confirm it's working when**:
✅ Console shows: `[Label Preview] Showing label for candidate X: [name]`
✅ White rectangular label visible in panorama
✅ Label text shows candidate name
✅ Label updates when clicking Cand > or Pano >
✅ No THREE.js errors

---

**Status**: All code fixes committed and pushed ✅
**Testing**: Ready for user verification ✅
**Evidence**: User can now provide screenshots ✅
