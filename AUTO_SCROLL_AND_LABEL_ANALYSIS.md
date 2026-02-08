# Auto-Scrolling and Label Appearance Analysis

## Overview
This document catalogs all instances of auto-scrolling behavior and pre-existing elements that cause labels to appear in the Todi-Viewer-Map application.

---

## 1. AUTO-SCROLLING INSTANCES

### 1.1 Fixed Auto-Scroll Bug ✅
**Location:** Line 2447  
**Status:** FIXED (commented out)

```javascript
// REMOVED: row.scrollIntoView({ block:'nearest' }); - Caused unwanted auto-scroll
```

**Context:**
- In the marker selection code
- Was causing unwanted page scrolling when clicking on markers in the candidate list
- Now safely commented out with clear documentation

---

### 1.2 Scroll Position Preservation (GOOD)
**Locations:** 
- Lines 6019-6044 in `renderMarkerFXList()`
- Lines 6889-6914 in `renderLabelFXList()`

**Status:** Working as intended - PREVENTS unwanted scrolling

```javascript
// Preserve scroll position to prevent auto-scroll bug (Issue #13)
const scrollParent = container.parentElement;
const scrollTop = scrollParent ? scrollParent.scrollTop : 0;

// ... UI rebuild code ...

// Restore scroll position after rebuilding UI (use requestAnimationFrame to ensure DOM is updated)
if (scrollParent) {
  requestAnimationFrame(() => {
    scrollParent.scrollTop = scrollTop;
  });
}
```

**Purpose:**
- Prevents page from jumping to top when UI is rebuilt
- Uses `requestAnimationFrame` to ensure DOM is fully updated before restoring scroll position
- Properly documented as fixing Issue #13

---

### 1.3 Rules Panel Auto-Scroll (Intentional)
**Location:** Line 4831

```javascript
if (rp) rp.scrollTop = rp.scrollHeight;
```

**Context:**
- In overlay rules panel display code
- Intentionally scrolls rules panel to bottom to show newest rules
- Limited scope - only affects rules panel, not main viewport
- **Status:** Not problematic - intentional UX behavior

---

### 1.4 CSS Scrollbar Styling (Visual Only)
**Location:** Lines 221-223

```css
#rulesPanel::-webkit-scrollbar{width:10px}
#rulesPanel::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:999px}
#rulesPanel::-webkit-scrollbar-track{background:rgba(255,255,255,.06);border-radius:999px}
```

**Status:** Cosmetic only - no behavioral impact

---

## 2. LABEL APPEARANCE TRIGGERS

### 2.1 Primary Label Creation Entry Point
**Location:** Line 3777

```javascript
applyAllLabelFX();
```

**Called from:** `rebuildMarkersAndList()` function

**When triggered:**
- Data source loaded/changed
- Filter settings changed (visibility, category, landmarks, distance, top N, min visibility)
- Debug mode toggled
- Any rebuild of marker list

---

### 2.2 Label System Core Functions

#### `applyAllLabelFX()` - Line 8720
```javascript
function applyAllLabelFX() {
  // Clear all existing callouts
  currentMarkers.forEach(m => {
    if (m.userData?.callout) {
      m.remove(m.userData.callout);
      m.userData.callout = null;
    }
  });

  // Apply each active label config
  activeLabels.forEach(config => {
    applyLabelConfigToMarkers(config);
  });
}
```

**What it does:**
1. Removes all existing label callouts from markers
2. Applies each active label configuration to all markers
3. Creates new callouts based on current configs

---

#### `applyLabelConfigToMarkers(config)` - Line 8735
```javascript
function applyLabelConfigToMarkers(config) {
  const markers = _getVerifierMarkers();
  
  markers.forEach(m => {
    const cand = m.userData?.cand;
    if (!cand) return;
    
    // If marker doesn't have a callout yet, create one with default config
    if (!m.userData?.callout) {
      const labelConfig = activeLabels.find(l => l.type === 'label');
      const hoverConfig = activeLabels.find(l => l.type === 'hover');
      const useConfig = labelConfig || hoverConfig;
      
      // Resolve line color and build callout
      const callout = makeCalloutAnimated(m, getLabelText(...), ...);
    }
  });
}
```

**What it does:**
- Iterates through all verifier markers
- Creates callout for each marker if it doesn't have one
- Uses active label/hover configurations

---

### 2.3 Label Visibility Control
**Location:** Line 3778

```javascript
updateCalloutsVisibility();
```

**Purpose:**
- Controls which labels are actually visible on screen
- Called after label creation
- Respects hover/selection states

---

### 2.4 Label Cleanup Function
**Location:** Lines 2382-2385

```javascript
function disposeLabels(){
  labelGroup.children.forEach(l=>disposeSprite(l));
  labelGroup.clear();
}
```

**Called from:** `rebuildMarkersAndList()` at line 3666

**Purpose:**
- Removes all labels before rebuilding
- Properly disposes of sprite resources
- Clears the label group

---

### 2.5 Label Rendering/Update Triggers

All locations where `renderLabelFXList()` and/or `applyAllLabelFX()` are called:

| Line(s) | Context | Trigger |
|---------|---------|---------|
| 4563-4564 | After data load | Initial setup |
| 6870-6871 | Marker FX changes | When marker effects change |
| 6877-6878 | Property updates | When label properties update |
| 6965-6966 | Add row button | User adds new row |
| 6984 | Remove row button | User removes row |
| 6997 | Add pill button | User adds pill to row |
| 7009 | Remove pill button | User removes pill |
| 7022 | Pill rule change | User changes field rule |
| 7036 | Import config | Config imported from clipboard |
| 7088 | Text style change | Per-pill text styling changed |
| 7127-7128 | Add filter rule | User adds filter rule |
| 7241-7244 | Preview sample change | Preview navigation |
| 7292-7293 | Remove label type | User removes label config |

---

### 2.6 Scene Graph Structure
**Location:** Lines 1886-1887

```javascript
const labelGroup = new THREE.Group();
sceneOverlay.add(labelGroup);
```

**Structure:**
- `sceneOverlay` - Main overlay scene
  - `labelGroup` - Container for all label sprites
    - Individual label callouts attached to markers

---

## 3. PRE-EXISTING ELEMENTS THAT CONTROL LABELS

### 3.1 Checkbox Controls for Label Components

#### Show Line Checkbox
**Locations:** Lines 7732, 8230

```javascript
<input type="checkbox" data-id="${label.id}" data-prop="showLine" ${label.showLine ? 'checked' : ''}>
```

**Controls:**
- Whether connector line appears between marker and label
- Default: true
- Appears in both Label and Hover mode configurations

---

#### Show Display Shape Checkbox
**Locations:** Lines 7778, 8276

```javascript
<input type="checkbox" data-id="${label.id}" data-prop="showDisplayShape" ${label.showDisplayShape ? 'checked' : ''}>
```

**Controls:**
- Whether shape indicator (circle/square/diamond/etc.) appears
- Default: true
- Configurable shape type, size, position, color

---

### 3.2 Label Configuration in Code
**Location:** Line 3231-3232

```javascript
const showLine = config?.showLine !== false; // default true
const showDisplayShape = config?.showDisplayShape !== false; // default true
```

**Behavior:**
- Labels appear with line and shape by default
- Can be disabled per label configuration
- Affects `makeCalloutAnimated()` function behavior

---

### 3.3 Type Selector UI Elements
**Locations:** Lines 6455-6468, 8846-8848

```javascript
if (typeSelector.style.display === 'none') {
  typeSelector.style.display = 'block';
  addBtn.style.display = 'none';
}
```

**Purpose:**
- Controls UI for adding new label/hover types
- Toggles between "Add" button and type dropdown
- Does NOT directly affect map labels

---

### 3.4 Modal and Editor Visibility
**Locations:** Lines 7050, 7267, 7283

```javascript
// Pill text editor toggle
editor.style.display = editor.style.display === 'none' ? 'block' : 'none';

// Modal show/hide
modal.style.display = 'flex';  // Show
modal.style.display = 'none';  // Hide
```

**Purpose:**
- Controls UI element visibility
- Per-pill text editor
- Configuration modals
- Does NOT directly affect map labels

---

## 4. LABEL RENDERING PIPELINE

### Complete Flow:
1. **Data Load** → `rebuildMarkersAndList()`
2. **Clear Old Labels** → `disposeLabels()`
3. **Create Markers** → Loop through filtered candidates
4. **Apply Label FX** → `applyAllLabelFX()`
5. **Create Callouts** → `applyLabelConfigToMarkers()`
6. **Build Callout** → `makeCalloutAnimated()`
7. **Update Visibility** → `updateCalloutsVisibility()`
8. **Render** → Three.js renders labels in scene

---

## 5. KEY FINDINGS

### Auto-Scrolling Status:
✅ **Main bug already fixed** (line 2447 commented out)  
✅ **Scroll preservation working correctly** (lines 6019-6044, 6889-6914)  
⚠️ **One intentional scroll** (rules panel, line 4831 - not problematic)  
✅ **No other scroll issues found**

### Label Appearance:
📍 **Primary trigger:** `applyAllLabelFX()` from `rebuildMarkersAndList()`  
📍 **Secondary triggers:** UI interactions that modify label configs  
📍 **Visibility control:** `updateCalloutsVisibility()` function  
📍 **Pre-existing toggles:** `showLine` and `showDisplayShape` checkboxes  

### Code Quality:
✅ Clear separation of concerns  
✅ Well-documented bug fixes  
✅ Proper resource cleanup  
✅ Consistent naming conventions  

---

## 6. RECOMMENDATIONS

**No critical issues found.** The codebase shows:
- Proper handling of scroll behavior
- Clear label lifecycle management
- Good documentation of previous fixes
- Appropriate use of requestAnimationFrame for DOM updates

**If issues persist:**
1. Check browser console for errors during label creation
2. Verify `updateCalloutsVisibility()` logic matches requirements
3. Review filter conditions in `getFilteredCandidates()`
4. Ensure Three.js scene rendering is performant

---

## 7. RELATED FUNCTIONS TO MONITOR

Functions that could affect label appearance:
- `makeCalloutAnimated()` - Creates the actual label callout
- `getLabelText()` - Determines label text content
- `renderLabelFromBuilder()` - Renders labels with builder config
- `updateCalloutsVisibility()` - Shows/hides labels
- `getFilteredCandidates()` - Determines which markers get labels

---

**Document Generated:** 2026-02-08  
**Code Version:** commit 84f2610
