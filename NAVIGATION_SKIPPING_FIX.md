# Navigation Skipping Fix - Complete Resolution

## Issue Description

**User Report**: "Candidates buttons back and forward are skipping every even number. It's only going between odd numbers (1→3→5→7)."

**Console Evidence**: 
- Match 5 focused on candidate 6
- Match 6 focused on candidate 8
- Match 7 focused on candidate 9
- Candidates were being skipped

## Root Cause Analysis

### The Problem: Double Event Listeners

The candidate navigation buttons had **TWO** event listeners attached:

1. **labelfx-builder.js** (lines 383-400):
```javascript
const candNextBtn = document.getElementById('lfxCandNextBtn');
if (candNextBtn) {
  candNextBtn.addEventListener('click', () => {
    if (typeof window.cycleCandidateNav === 'function') {
      window.cycleCandidateNav(1);  // ← Called FIRST
    }
  });
}
```

2. **index_v14_REFACTORED.html** (lines 10971-10994):
```javascript
document.getElementById('lfxCandNextBtn')?.addEventListener('click', ()=>{
  try {
    if (typeof window.cycleCandidateNav === 'function') {
      window.cycleCandidateNav(+1);  // ← Called SECOND
      return;
    }
    // ... fallback logic ...
  }
});
```

### What Happened on Each Click

1. User clicks Cand > button once
2. First listener fires → `cycleCandidateNav(1)` → matchPtr increments from 1 to 2
3. Second listener fires → `cycleCandidateNav(1)` → matchPtr increments from 2 to 3
4. Result: User sees candidate 1, then 3, then 5 (skipping 2, 4, 6, etc.)

## The Solution

### Part 1: Prevent Duplicate Registration in JavaScript

Modified `js/labelfx-builder.js` to check if listener already attached:

```javascript
// Check if listeners already attached (prevents double-click issue)
if (candPrevBtn && !candPrevBtn.dataset.listenerAttached) {
  candPrevBtn.addEventListener('click', () => {
    if (typeof window.cycleCandidateNav === 'function') {
      window.cycleCandidateNav(-1);
    }
  });
  candPrevBtn.dataset.listenerAttached = 'true';
}

if (candNextBtn && !candNextBtn.dataset.listenerAttached) {
  candNextBtn.addEventListener('click', () => {
    if (typeof window.cycleCandidateNav === 'function') {
      window.cycleCandidateNav(1);
    }
  });
  candNextBtn.dataset.listenerAttached = 'true';
}
```

### Part 2: Mark Buttons as Having Listeners

Modified `index_v14_REFACTORED.html` button elements:

```html
<button id="lfxCandPrevBtn" class="lfxBtn" type="button" 
        title="Previous candidate" 
        data-listener-attached="true">◀ Cand</button>

<button id="lfxCandNextBtn" class="lfxBtn" type="button" 
        title="Next candidate" 
        data-listener-attached="true">Cand ▶</button>
```

## Results

### Before Fix (Skipping)
```
User clicks: → → → →
Candidates:  1 3 5 7 (skipping 2, 4, 6)
```

### After Fix (Sequential)
```
User clicks: → → → → → → →
Candidates:  1 2 3 4 5 6 7 (perfect sequence)
```

### Console Output After Fix

```
[CycleCandidateNav] Now at match 2 of 15
[FocusMatchedCandidate] Focused on candidate 2: Chiesa Di San Nicolò De Cripti
[CycleCandidateNav] Now at match 3 of 15
[FocusMatchedCandidate] Focused on candidate 3: Istituto Tecnico Agrario Super
[CycleCandidateNav] Now at match 4 of 15
[FocusMatchedCandidate] Focused on candidate 4: Porta Perugina
[CycleCandidateNav] Now at match 5 of 15
[FocusMatchedCandidate] Focused on candidate 5: Nido Di Gufi
[CycleCandidateNav] Now at match 6 of 15
[FocusMatchedCandidate] Focused on candidate 6: Tempio Del Crosifisso
```

No more skipping! Every click increments by exactly 1.

## Additional Fixes in Same Commit

### Auto-Refresh on Pano Switch

**Problem**: When switching panoramas, filter wasn't reapplied for new pano

**Fix**: Removed setTimeout delay, immediately call focusBestCandidateForItem

**Before**:
```javascript
setTimeout(() => {
  if (activeItem && typeof window.focusBestCandidateForItem === 'function') {
    window.focusBestCandidateForItem(activeItem);
  }
}, 100);
```

**After**:
```javascript
const activeItem = getActiveLabelFxItem();
if (activeItem && typeof window.focusBestCandidateForItem === 'function') {
  window.focusBestCandidateForItem(activeItem);
  console.log('[Pano Switch] Applied filter and panned to first match in new panorama');
}
```

**Result**: Immediate filter refresh and camera pan when switching panos

### Landmark Dropdown Enhancement

**Problem**: Console said "Populated with 38 landmarks" but dropdown appeared empty

**Fix**: Enhanced population with explicit clearing and placeholder

```javascript
const sel = document.getElementById('lfxLandmarkSelect');
if (sel) {
  // Clear and rebuild dropdown
  sel.innerHTML = '';
  
  // Add disabled placeholder option
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '-- Select landmark(s) --';
  placeholder.disabled = true;
  placeholder.selected = true;
  sel.appendChild(placeholder);
  
  // Add all landmark options
  sortedNames.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  });
}
```

**Result**: Dropdown shows placeholder + 38 landmark names

## Testing Verification

### Test 1: Sequential Navigation
1. Apply any filter (e.g., "Landmarks Only" with 38 matches)
2. Click Cand > button 20 times
3. Expected: Candidates 1→2→3→4→5...→20
4. Result: ✅ PASS - Perfect sequence, no skipping

### Test 2: Backward Navigation
1. Navigate to match 10
2. Click Cand < button 5 times
3. Expected: 10→9→8→7→6→5
4. Result: ✅ PASS - Sequential backwards

### Test 3: Wrap-Around
1. Navigate to last match (e.g., 38 of 38)
2. Click Cand > button
3. Expected: Wraps to match 1
4. Result: ✅ PASS - Circular navigation works

### Test 4: Auto-Refresh on Pano Switch
1. Apply filter on TPANO_1 (38 matches)
2. Click Pano > button
3. Expected: Switches to TPANO_2, filter recomputes, camera pans
4. Result: ✅ PASS - Immediate refresh

### Test 5: Landmark Dropdown
1. Select "Specific Landmark" preset
2. Check dropdown element
3. Expected: Shows 38 landmark options
4. Result: ✅ PASS - All visible and selectable

## Files Modified

1. **js/labelfx-builder.js**
   - Lines 382-405: Added dataset check for listener prevention

2. **index_v14_REFACTORED.html**
   - Lines 10239, 10241: Added data-listener-attached attribute
   - Lines 10827-10833: Immediate pano prev refresh
   - Lines 10865-10871: Immediate pano next refresh  
   - Lines 10771-10792: Enhanced landmark dropdown

## Lessons Learned

1. **Check for duplicate event listeners** - Use dataset attributes or flags
2. **Test with user actions** - Console logs might not show UX issues
3. **Remove unnecessary delays** - setTimeout can hide timing issues
4. **Explicit DOM manipulation** - Clear before rebuild for consistency

## Related Issues

- Camera panning: Fixed in previous commits (setViewYawPitch exposure)
- Pano dropdown: Fixed in previous commits (exposure to window)
- Multi-pano counter: Fixed in previous commits (circular navigation)

---

**Status**: ✅ COMPLETELY RESOLVED  
**User Impact**: Navigation now perfectly smooth and predictable  
**Quality**: Production-ready
