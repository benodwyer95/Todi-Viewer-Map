# LabelFX Troubleshooting Guide

## Issue: "Cannot see candidates matching in LabelFX" (0 / 0 shown)

### Quick Fix

If you see **"0 / 0"** in the LabelFX Builder match counter:

1. **Wait** for the Verifier to show "Loaded: TPANO_1 • markers: 25" (or similar)
2. Go to **"2 Filter"** tab in the builder
3. Click **"🔄 Refresh Matches"** button
4. Matches should now appear!

### Why This Happens

The LabelFX Builder can open **before** the panorama data finishes loading:

```
Timeline:
0s  - Page loads (HTML/CSS/JS ready)
0s  - User clicks "Open Label Builder" ← Opens immediately
1s  - JSON data starts loading in background
2s  - Data finishes loading ← Too late!
```

**Result**: Builder checks for candidates when `SOURCES = []` (empty), showing "0 / 0".

### Solution: Check for Data First

**Option 1: Wait for Data (Recommended)**
1. Open the viewer
2. **Wait** for left dock to show candidate list (you'll see: "Loaded: TPANO_1 • markers: 25")
3. Now open Label Builder → matches will appear immediately

**Option 2: Use Refresh Button**
1. Open Label Builder (even if data not loaded yet)
2. You'll see: "⏳ Waiting for panorama data to load..."
3. Wait ~2 seconds for data to load
4. Click "🔄 Refresh Matches" button in Filter step
5. Matches appear!

**Option 3: Console Command**
```javascript
// In browser console (F12):
__lfxForceRefresh()
// Returns: true if successful, false if no active item
```

### Understanding Match Counter States

The match counter shows different messages based on data state:

| Message | Meaning | Action |
|---------|---------|--------|
| **"⏳ Waiting for panorama data..."** | No SOURCES loaded yet | Wait or click refresh after data loads |
| **"(no candidates loaded)"** | SOURCES loaded but no candidates array | Check data file format |
| **"(0 matches)"** | Filter excludes all candidates | Change filter preset or rules |
| **"— / 12 / —"** | Normal operation | 12 matches in current pano |

### Filter Presets and Matching

Different presets match different candidates:

| Preset | Matches | Example |
|--------|---------|---------|
| **Landmarks Only** | `dst_lm_name` not empty | "Duomo", "Chiesa Di San Nicolò" |
| **Amenity Only** | `dst_type = "amenity"` | Parking, restaurants |
| **Leisure Only** | `dst_type = "leisure"` | Parks, sports facilities |
| **Place Only** | `dst_type = "place"` | Town squares, neighborhoods |
| **Named Places** | Has `dst_lm_name` OR `dst_name` | Any named location |
| **Visibility Threshold** | `vis_pct` in range | Visible candidates only |

**Example**: If you select "Landmarks Only" but your data only has amenities and places, you'll see "0 matches" because no candidates have landmark names.

### Checking Your Data

**In browser console:**
```javascript
// Check if data is loaded
console.log('SOURCES:', SOURCES?.length);  // Should be > 0
console.log('Candidates:', SOURCES?.[0]?.candidates?.length);  // Should be > 0

// Check what types you have
const types = SOURCES?.[0]?.candidates.map(c => c.dst_type);
console.log('Available types:', [...new Set(types)]);

// Check landmark names
const landmarks = SOURCES?.[0]?.candidates
  .filter(c => c.dst_lm_name)
  .map(c => c.dst_lm_name);
console.log('Landmarks:', landmarks.length, landmarks);
```

### Common Issues

#### Issue 1: "Always shows 0 / 0"
**Cause**: Data file not loading
**Fix**:
1. Check console for errors: `Failed to load JSON`
2. Verify file exists: `data/candidates_sample.json` or your custom path
3. Check file format: Must be valid JSON array

#### Issue 2: "Shows matches in Verifier but 0 in LabelFX"
**Cause**: Filter preset doesn't match your data
**Fix**:
1. Go to Filter step
2. Change "Rules type" to "Preset"
3. Try different presets (Landmarks, Amenity, etc.)
4. Or change to "All (no filter)" to see all candidates

#### Issue 3: "Refresh button doesn't work"
**Cause**: Active filter excludes all candidates
**Fix**:
1. Change filter mode to "All (no filter)"
2. Click Refresh
3. Should now show all candidates
4. Then refine your filter

### Advanced: Custom Filters

If presets don't match your needs:

1. Select "Rules type" = "Custom"
2. Click "+ Add Rule"
3. Configure:
   - **Field**: `vis_pct`, `dist_m`, `dst_type`, etc.
   - **Operator**: equals, greater than, contains, etc.
   - **Value**: Your threshold/match value
4. Click "🔄 Refresh Matches"

**Example custom filter**:
- Field: `vis_pct`
- Operator: `>=`
- Value: `50`
- Result: Only candidates with 50%+ visibility

### Debug Checklist

If matches still don't appear:

- [ ] Verifier shows "Loaded: TPANO_1 • markers: XX"
- [ ] Console shows `SOURCES.length > 0`
- [ ] Console shows `SOURCES[0].candidates.length > 0`
- [ ] Filter preset matches data types in console
- [ ] Clicked "🔄 Refresh Matches" button
- [ ] No console errors (F12 → Console tab)

### Getting Help

If issue persists:

1. Open browser console (F12)
2. Run diagnostics:
```javascript
console.log('=== LabelFX Diagnostics ===');
console.log('SOURCES loaded:', !!SOURCES);
console.log('Source count:', SOURCES?.length);
console.log('Current index:', currentIndex);
console.log('Candidates:', SOURCES?.[currentIndex]?.candidates?.length);
console.log('Active item:', window.__lfxEditingItem?.name);
console.log('Match HTML:', window.__lfxHeaderMatchHtml);
```
3. Copy output and report with screenshot

---

**Last Updated**: 2026-02-13  
**Related Files**: `index_v14_REFACTORED.html`, `DATA_GUIDE.md`
