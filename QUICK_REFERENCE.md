# Quick Reference: Auto-Scroll and Label Appearance

## Auto-Scrolling - Quick Check

| Line | Status | Description |
|------|--------|-------------|
| 2447 | ✅ FIXED | `scrollIntoView` commented out - was causing unwanted scroll |
| 6019-6044 | ✅ GOOD | Scroll preservation in `renderMarkerFXList()` |
| 6889-6914 | ✅ GOOD | Scroll preservation in `renderLabelFXList()` |
| 4831 | ⚠️ INTENTIONAL | Rules panel scroll to bottom |

**Verdict:** No problematic auto-scrolling found. Main issue already fixed.

---

## Label Appearance - Quick Reference

### When Do Labels Appear?

```
User Action → Trigger → Function → Result
```

1. **Load Data** → `rebuildMarkersAndList()` → `applyAllLabelFX()` → Labels created
2. **Change Filters** → `rebuildMarkersAndList()` → `applyAllLabelFX()` → Labels recreated
3. **Add Label Config** → Multiple → `applyAllLabelFX()` → Labels updated
4. **Edit Label Config** → `renderLabelFXList()` + `applyAllLabelFX()` → Labels updated

### Core Functions

```javascript
// Primary entry point (line 8720)
applyAllLabelFX()
  ↓
// Applies config to markers (line 8735)
applyLabelConfigToMarkers(config)
  ↓
// Creates the actual label (called from above)
makeCalloutAnimated(marker, text, ...)
  ↓
// Controls visibility (line 3778)
updateCalloutsVisibility()
```

### Pre-Existing Control Elements

**Checkboxes:**
- `showLine` - Lines 7732, 8230 - Controls connector line
- `showDisplayShape` - Lines 7778, 8276 - Controls shape indicator

**Config Properties:**
```javascript
config.showLine         // Default: true
config.showDisplayShape // Default: true
```

---

## Locations to Check for Issues

If you're debugging label appearance problems:

1. **Line 3777** - `applyAllLabelFX()` call in `rebuildMarkersAndList()`
2. **Line 3778** - `updateCalloutsVisibility()` call
3. **Line 8720** - `applyAllLabelFX()` function definition
4. **Line 8735** - `applyLabelConfigToMarkers()` function
5. **Line 3231-3232** - Default `showLine` and `showDisplayShape` values

---

## All `applyAllLabelFX()` Call Sites

| Line | Context |
|------|---------|
| 3777 | Main rebuild after data load |
| 4564 | After initial setup |
| 6871 | After marker FX changes |
| 6878 | After property updates |
| 6966 | User adds row |
| 7036 | Config imported |
| 7088 | Text style changed |
| 7128 | Filter rule added |
| 7244 | Preview sample changed |
| 7293 | Label type removed |

---

## Files Modified in Recent Commits

```
84f2610 - Fix code review issues: fontWeight handling and validation
4d2a8b2 - Add per-pill text editing with collapsible UI
```

Both commits focused on UI improvements, not label appearance logic.

---

## Search Commands Used

```bash
# Find auto-scrolling
grep -n "scrollIntoView\|scroll\|scrollTop\|scrollTo" index.html

# Find label appearance
grep -n "applyAllLabelFX\|renderLabel\|makeLabel" index.html

# Find scene manipulation
grep -n "scene.add\|labelGroup" index.html

# Find visibility changes
grep -n "\.style\.display\|\.classList\.add" index.html
```

---

**Quick Summary:**
- ✅ Auto-scroll bug fixed
- ✅ Label system working as designed
- 📍 Multiple trigger points documented
- 📍 No critical issues found
