# LabelFX Complete Testing Guide

## Quick Verification (10 minutes)

### 1. Check Data Loaded
```javascript
// In browser console
console.log(window.SOURCES);  // Should show array of panoramas
console.log(window.SOURCES.length);  // Should show count (e.g., 3)
console.log(window.SOURCES[0].id);  // Should show pano ID (e.g., "TPANO_1")
```

### 2. Check Dropdowns Populated
```javascript
// Check pano dropdown
const panoSel = document.getElementById('lfxPanoSelect');
console.log('Pano options:', panoSel?.options.length);  // Should be > 1

// Check landmark dropdown (when in specific landmark preset)
const lmSel = document.getElementById('lfxLandmarkSelect');
console.log('Landmark options:', lmSel?.options.length);  // Should be > 1
```

### 3. Check Functions Exist
```javascript
// Check camera panning
console.log(typeof window.setViewYawPitch);  // Should be "function"

// Check pano select
console.log(typeof window.populatePanoSelect);  // Should be "function"

// Check landmark dropdown
console.log(typeof window.populateLandmarkDropdown);  // Should be "function"
```

## Detailed Feature Testing

### Feature 1: UI Reorganization

**Steps**:
1. Open Label Builder
2. Go to Filter tab (step 2)
3. Check "Rules type" dropdown

**Expected**:
- ✅ Contains: "Preset", "Custom", "All Matches (No Filters Apply)"
- ✅ "All Matches" is at bottom

4. Check "Include / Exclude" dropdown

**Expected**:
- ✅ Contains only: "Include matches", "Exclude matches"
- ✅ NO "All" option here

5. Select "All Matches (No Filters Apply)" from Rules type
6. Click "Refresh Matches"

**Expected**:
- ✅ Shows all candidates
- ✅ Console: `[LabelFX] Filter applied: 436 matches out of 436 total candidates`
- ✅ Counter updates

**Success Criteria**:
- All matches option in correct location
- No filtering when selected
- UI is cleaner and more intuitive

---

### Feature 2: Pano Dropdown Population

**Steps**:
1. Load viewer and wait for data
2. Check console for: `✅ Successfully loaded data from: ...`
3. Open Label Builder
4. Look at pano dropdown (left of Pano < > buttons)

**Expected**:
- ✅ Dropdown shows pano IDs (TPANO_1, TPANO_57, etc.)
- ✅ Current pano is selected
- ✅ Console: `[Pano Dropdown] Populated with N panoramas`

5. Select different pano from dropdown

**Expected**:
- ✅ Viewer switches to that panorama
- ✅ Matches recompute for new pano
- ✅ Counter updates with new pano's match counts

**Success Criteria**:
- Dropdown populated on data load
- All pano IDs visible
- Selection works correctly

---

### Feature 3: Circular Pano Navigation

**Steps**:
1. Note current pano ID (e.g., TPANO_1)
2. Note total number of panos (e.g., 3)
3. Click "Pano <" button

**Expected**:
- ✅ Switches to LAST panorama (circular wrap)
- ✅ Dropdown updates to show new pano
- ✅ Console: `[Pano Nav] Previous: 0 → 2 (TPANO_57)`

4. Click "Pano >" button repeatedly

**Expected**:
- ✅ Cycles through all panoramas
- ✅ Wraps from last back to first
- ✅ Dropdown always shows current
- ✅ Matches recompute each time

**Test Edge Cases**:
- First pano → Previous → Last pano ✅
- Last pano → Next → First pano ✅
- Single pano dataset → stays on same pano ✅

**Console Output**:
```
[Pano Nav] Previous: 0 → 2 (TPANO_57)
[LabelFX] Filter applied: 15 matches out of 325 total candidates
[Builder Counter] Updated to: 1 / 15
```

**Success Criteria**:
- Circular navigation works in both directions
- Non-sequential IDs handled correctly
- UI updates consistently

---

### Feature 4: Landmark Dropdown

**Steps**:
1. Open Label Builder
2. Go to Filter tab
3. Select "Specific Landmark" preset
4. Look for landmark dropdown (multi-select, size=6)

**Expected**:
- ✅ Dropdown shows landmark names
- ✅ Names are alphabetically sorted
- ✅ Console: `[Landmark Dropdown] Populated with N unique landmarks`

5. Click on one landmark name

**Expected**:
- ✅ Landmark highlights
- ✅ Text input below updates with that name

6. Ctrl+click (or Cmd+click) on another landmark

**Expected**:
- ✅ Both landmarks selected
- ✅ Text input shows: "Landmark1, Landmark2"

7. Click "Refresh Matches"

**Expected**:
- ✅ Only matches selected landmarks
- ✅ Match count appropriate (usually 1-2)
- ✅ Console shows filtered results

**Alternative**: Type landmark name manually
- Text input still works for comma-separated names
- Can use dropdown OR text entry

**Success Criteria**:
- Dropdown shows all landmarks from all panos
- Alphabetical sorting works
- Multi-select functions correctly
- Filter matches only selected landmarks

---

### Feature 5: Camera Panning

**Setup**: Have panorama visible in viewer (not just builder)

**Test 5a: Pan on Filter Refresh**
1. Open Label Builder
2. Select filter with matches (e.g., "Landmarks Only")
3. Click "Refresh Matches"

**Expected**:
- ✅ Camera IMMEDIATELY pans to point at first matched candidate
- ✅ View changes smoothly
- ✅ Console: `[Camera] Panning to candidate: yaw=245.49°, pitch=-2.15°`
- ✅ Console: `[FocusMatchedCandidate] Focused on candidate 5: Nido Di Gufi`

**Test 5b: Pan on Candidate Navigation**
1. With matches visible
2. Click "Cand >" button

**Expected**:
- ✅ Camera pans to next candidate
- ✅ Smooth transition
- ✅ Console: `[CycleCandidateNav] Now at match 2 of 38`
- ✅ Console: `[Camera] Panning to candidate: yaw=189.32°, pitch=-1.87°`

3. Click "Cand <" button

**Expected**:
- ✅ Camera pans to previous candidate
- ✅ Wrap-around works at boundaries

**Test 5c: Pan on Pano Switch**
1. With matches visible
2. Click "Pano >" button

**Expected**:
- ✅ Switches to next panorama
- ✅ Matches recompute
- ✅ Camera pans to FIRST match in NEW pano
- ✅ Console: `[Pano Nav] Next: 0 → 1 (TPANO_57)`
- ✅ Console: `[Camera] Panning to candidate: yaw=123.45°, pitch=-3.21°`

**Test 5d: Pan on Builder Open**
1. Close builder if open
2. Create a label and save it
3. Close builder
4. Reopen builder
5. Select that label

**Expected**:
- ✅ Camera pans to first candidate of that label
- ✅ Immediate response

**Troubleshooting**:
If camera doesn't pan:
- Check console for: `[Camera]` messages
- If message appears but no panning: `setViewYawPitch` may not control camera
- If no message appears: function not being called
- Check console for errors

**Success Criteria**:
- Camera pans on all 5 trigger points
- Console logs confirm panning attempts
- Smooth animation (not instant jump)

---

### Feature 6: Counter Updates

**Already working from previous fixes**

**Verify**:
1. Apply filter with matches
2. Check counter shows: "12 / 38 / 15" format

**Expected**:
- First number = matches in previous pano
- Second number = matches in current pano
- Third number = matches in next pano

3. Navigate to different candidate
4. Counter format stays same (total counts don't change)
5. Switch panorama
6. Counter updates with new pano's counts

**Success Criteria**:
- Multi-pano counter working
- Updates on pano switch
- Format clear and consistent

---

## Integration Testing

### Workflow 1: Complete Filter Cycle

1. Load viewer with data
2. Wait for: `✅ Successfully loaded data from: ...`
3. Open Label Builder
4. Verify dropdowns populated (pano and landmark)
5. Select "All Matches (No Filters Apply)"
6. Refresh → Should show all candidates
7. Select "Specific Landmark"
8. Choose landmark from dropdown
9. Refresh → Should show only that landmark
10. Camera should pan to it
11. Click "Cand >" → Camera pans to next
12. Click "Pano >" → Switches pano, camera pans to first match
13. Click "Pano <" → Wraps to last pano

**Expected**:
- ✅ All steps work smoothly
- ✅ Console logs every action
- ✅ UI responds immediately
- ✅ No errors

### Workflow 2: Multi-Landmark Selection

1. Select "Specific Landmark" preset
2. Ctrl+click 3 landmarks in dropdown
3. Verify text input shows: "Landmark1, Landmark2, Landmark3"
4. Refresh
5. Verify: Only those 3 landmarks match
6. Navigate through matches with Cand < >
7. Camera should pan to each one

**Expected**:
- ✅ Multi-select works
- ✅ Filter matches all selected
- ✅ Navigation cycles through all matches
- ✅ Camera pans to each

### Workflow 3: Circular Navigation Edge Cases

**Test with 3 panoramas**:
1. Start at pano 0 (TPANO_1)
2. Pano < → Should go to pano 2 (last)
3. Pano < → Should go to pano 1
4. Pano < → Should go to pano 0 (wrap)
5. Pano > → Should go to pano 1
6. Pano > → Should go to pano 2
7. Pano > → Should go to pano 0 (wrap)

**Test with 1 panorama**:
1. Pano < → Stays on pano 0
2. Pano > → Stays on pano 0

**Expected**:
- ✅ Never goes below 0
- ✅ Never goes above max
- ✅ Wraps correctly
- ✅ Single pano handled gracefully

---

## Console Output Reference

### Successful Data Load
```
✅ Successfully loaded data from: ./data/candidates_sample.json
[Data] Loaded 3 panoramas with 436 total candidates
[Pano Dropdown] Populated with 3 panoramas
[Landmark Dropdown] Populated with 38 unique landmarks
```

### Successful Filter Application
```
[LabelFX] Manual refresh triggered
[LabelFX] Filter applied: 15 matches out of 436 total candidates
[Bridge] Synced 15 matches to ViewerState.labelFxRuntime["uuid-here"]
[Multi-Pano Matches] Prev: 10, Current: 15, Next: 12
[Builder Counter] Updated to: 1 / 15
[Camera] Panning to candidate: yaw=245.49°, pitch=-2.15°
[FocusMatchedCandidate] Focused on candidate 5: Nido Di Gufi
```

### Successful Candidate Navigation
```
[CycleCandidateNav] Now at match 2 of 15
[Camera] Panning to candidate: yaw=189.32°, pitch=-1.87°
[Builder Counter] Updated to: 2 / 15
```

### Successful Pano Navigation
```
[Pano Nav] Next: 0 → 1 (TPANO_57)
[LabelFX] Filter applied: 12 matches out of 325 total candidates
[Camera] Panning to candidate: yaw=123.45°, pitch=-3.21°
[Builder Counter] Updated to: 1 / 12
```

---

## Troubleshooting

### Problem: Pano Dropdown Empty

**Symptoms**: Dropdown shows only "Select Pano..."

**Checks**:
```javascript
console.log(window.SOURCES);  // Should show array
console.log(window.SOURCES?.length);  // Should be > 0
```

**Solutions**:
- If undefined: Data not loaded yet, wait for load message
- If empty array: JSON file has no sources
- If populated but dropdown empty: Call `populatePanoSelect()` manually
  ```javascript
  window.populatePanoSelect();
  ```

---

### Problem: Landmark Dropdown Empty

**Symptoms**: Dropdown shows only "Select landmarks..."

**Checks**:
```javascript
// Check if function exists
console.log(typeof window.populateLandmarkDropdown);

// Check candidates have landmark names
console.log(window.SOURCES[0]?.candidates[0]?.dst_lm_name);
```

**Solutions**:
- If no candidates: Data structure issue
- If candidates have no dst_lm_name: Expected for non-landmarks
- Call function manually:
  ```javascript
  window.populateLandmarkDropdown();
  ```

---

### Problem: Camera Doesn't Pan

**Symptoms**: Console shows panning message but view doesn't change

**Checks**:
```javascript
// Check function exists
console.log(typeof window.setViewYawPitch);  // Should be "function"

// Check camera controls
console.log(controls);  // Should show orbit controls
```

**Solutions**:
- If function doesn't exist: Main viewer may not have it implemented
- If controls locked: User interaction may be required
- If THREE.js not loaded: Check for errors earlier
- Try manual pan:
  ```javascript
  window.setViewYawPitch(0, 0, true);
  ```

---

### Problem: Circular Navigation Not Working

**Symptoms**: Pano < / > buttons don't wrap around

**Checks**:
```javascript
console.log(window.SOURCES.length);  // Should show total count
console.log(window.currentIndex);  // Should show current index
```

**Solutions**:
- Check console for "[Pano Nav]" messages
- If no messages: Event listeners not connected
- If error messages: Check SOURCES array exists
- Manually test:
  ```javascript
  window.setSourceByIndex(0);  // Go to first
  window.setSourceByIndex(window.SOURCES.length - 1);  // Go to last
  ```

---

## Debug Commands

### Check State
```javascript
// Full state dump
console.log({
  SOURCES: window.SOURCES,
  currentIndex: window.currentIndex,
  ViewerState: window.ViewerState,
  labelFxRuntime: window.ViewerState?.labelFxRuntime
});
```

### Force Updates
```javascript
// Repopulate dropdowns
window.populatePanoSelect();
window.populateLandmarkDropdown();

// Update counter
window.updateBuilderMatchCounter(1, 38, null);

// Force camera pan
window.setViewYawPitch(0, 0, true);
```

### Test Navigation
```javascript
// Go to specific pano
window.setSourceByIndex(0);  // First
window.setSourceByIndex(1);  // Second
window.setSourceByIndex(window.SOURCES.length - 1);  // Last

// Test candidate navigation
window.cycleCandidateNav(+1);  // Next
window.cycleCandidateNav(-1);  // Previous
```

---

## Success Checklist

All features working if you can check all these:

- [ ] Data loads successfully (console message)
- [ ] Pano dropdown shows all pano IDs
- [ ] Landmark dropdown shows sorted landmarks
- [ ] "All Matches" in Rules Types (not Include/Exclude)
- [ ] Selecting "All Matches" shows all candidates
- [ ] Pano < wraps from first to last
- [ ] Pano > wraps from last to first
- [ ] Dropdown updates on pano change
- [ ] Multi-select landmarks works
- [ ] Filter matches selected landmarks only
- [ ] Camera pans on filter refresh
- [ ] Camera pans on Cand < / > navigation
- [ ] Camera pans on pano switch
- [ ] Counter shows prev / current / next format
- [ ] Counter updates on all navigation
- [ ] Console logs all operations
- [ ] No JavaScript errors

---

## Next Steps

Once all tests pass:
1. ✅ Mark all features as working
2. ✅ Document any edge cases found
3. ✅ Report any unexpected behaviors
4. ✅ Ready for live preview implementation

If tests fail:
1. Note which specific test fails
2. Copy console output
3. Take screenshot of issue
4. Report with:
   - Browser/version
   - Data file used
   - Steps to reproduce
   - Console output
   - Screenshot
