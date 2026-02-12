# Todi Viewer v14 Architecture

## Overview

Version 14 introduces a modular architecture with centralized state management and 3D map integration hooks.

## Module Structure

```
js/
├── viewer-state.js       - Centralized state management
├── labelfx-core.js       - Filter logic and match computation
├── labelfx-builder.js    - Builder UI and interactions
└── map-integration.js    - Event system for map communication
```

## Core Concepts

### ViewerState

The single source of truth for all viewer state:

```javascript
window.ViewerState = {
  sources: [],              // All panoramas/vistas
  currentIndex: 0,          // Active pano index
  labelFxSets: {},          // LabelFX sets
  activeLabelFxItemId: null,
  labelFxRuntime: {},       // Per-item runtime state
  builderOpen: false,
  builderHistory: [],       // Undo/redo stack
  selectedCandidateIndex: null,
  currentMarkers: []        // Visual subset
};
```

### Candidates vs Markers

- **Candidates**: Ground truth data from `source.candidates` array
- **Markers**: Visual subset rendered in 3D scene (filtered/visible)

LabelFX operates on candidates directly, not markers.

### LabelFX Runtime State

Each active LabelFX item has runtime state:

```javascript
ViewerState.labelFxRuntime[itemId] = {
  matchedIndices: [2, 5, 8, 11],  // Indices into source.candidates
  matchPtr: 0,                     // Current focus (0 = first match)
  previewSprite: null              // THREE.js sprite
};
```

## Key Functions

### Filter Application

```javascript
// 1. Compute matches
const matchedIndices = computeMatchedIndices(source.candidates, item.filter);

// 2. Store in runtime state
ViewerState.labelFxRuntime[itemId] = { matchedIndices, matchPtr: 0 };

// 3. Focus first match
focusMatchedCandidate(0);
```

### Candidate Navigation

```javascript
// Navigate through matched candidates only
cycleCandidateNav(+1);  // Next match
cycleCandidateNav(-1);  // Previous match

// Wrap-around behavior automatically handled
```

### Panorama Switching

```javascript
// When switching panoramas, matches are recomputed automatically
await setSourceByIndex(newIndex);
// → Loads new pano
// → Recomputes matchedIndices for active label
// → Focuses first match
// → Updates UI
```

## Map Integration

### Event System

```javascript
// Viewer emits events
ViewerEvents.addEventListener('candidateSelected', (e) => {
  const { candidateIndex, candidate, source } = e.detail;
  // Map: highlight landmark, pan to location
});

ViewerEvents.addEventListener('panoramaChanged', (e) => {
  const { source } = e.detail;
  // Map: update camera marker position
});

// Map emits events
window.dispatchEvent(new CustomEvent('mapLandmarkClicked', {
  detail: { landmarkId: 'LMID_032' }
}));
// → Viewer finds best pano and focuses landmark
```

### Focusing Landmark from Map

```javascript
// When map landmark is clicked
focusLandmarkFromMap('LMID_032');
// → Finds all panos that see this landmark
// → Picks best (highest visibility)
// → Switches to that pano
// → Focuses the landmark candidate
```

## Builder Features

### Auto-Start

When builder opens:
1. Creates default 16:9 card if none exists
2. Applies filter to find matches
3. Focuses first match
4. Shows preview

### Undo/Redo

```javascript
// Save state before changes
saveHistorySnapshot();

// Make changes...
updateLabelFxItem(itemId, { /* updates */ });

// User can undo/redo
undo();  // Restore previous state
redo();  // Restore next state
```

History is limited to 50 snapshots, with FIFO behavior.

### Dock Peek

Keyboard shortcuts while builder is open:
- **O**: Peek overlay dock
- **V**: Peek verifier dock
- **Esc**: Close all peeks

Peeks appear as overlays without closing the builder.

## API Reference

### State Access

```javascript
// Get current source
const source = currentSource();

// Get active LabelFX item
const item = getActiveLabelFxItem();

// Get runtime state for active item
const runtime = getActiveRuntime();
// → { matchedIndices, matchPtr, previewSprite }
```

### Filter Functions

```javascript
// Compute matched indices
const indices = computeMatchedIndices(candidates, filterConfig);

// Test single candidate
const matches = matchesFilter(candidate, filterConfig);
```

### Navigation

```javascript
// Apply filter (compute matches + focus first)
onApplyFilter();

// Navigate candidates
cycleCandidateNav(+1);  // Next
cycleCandidateNav(-1);  // Previous

// Focus specific match
focusMatchedCandidate(matchPtr);
```

### Builder Control

```javascript
// Open builder
openLabelFxBuilder();

// Close builder
closeLabelFxBuilder();

// Undo/redo
undo();
redo();
```

### Map Integration

```javascript
// Initialize map integration
initMapIntegration();

// Emit events
emitCandidateSelected(index, candidate, source);
emitPanoramaChanged(source);
emitLabelApplied(item, matches);

// Focus from map
focusLandmarkFromMap(landmarkId);
```

## Debugging

All state is exposed to window:

```javascript
// Inspect state
console.log(window.ViewerState);

// Check current source
console.log(window.ViewerState.sources[window.ViewerState.currentIndex]);

// Check active runtime
console.log(window.ViewerState.labelFxRuntime);

// Check focused candidate
console.log(window.__LFX_ACTIVE_CAND_IDX);
```

## Migration from v13

### Legacy Compatibility

v14 maintains compatibility with v13:

```javascript
// Legacy variables are synchronized
SOURCES === ViewerState.sources  // true
currentIndex === ViewerState.currentIndex  // true
currentMarkers === ViewerState.currentMarkers  // true

// Functions still accessible
window.currentSource()
window.computeMatchedIndices()
window.onApplyFilter()
```

### Key Changes

1. **State is centralized**: Use `ViewerState` instead of scattered globals
2. **Modules are imported**: ES6 imports at top of script
3. **Events are emitted**: Map integration via ViewerEvents
4. **Runtime state tracked**: matchedIndices stored per item

## Future Extensions

The v14 architecture enables:

- **MarkerFX Builder**: Similar modular structure for marker effects
- **3D Map Panel**: Full integration using ViewerEvents
- **Collaboration**: State can be serialized/synced
- **Analytics**: Events can be logged/tracked
- **Plugins**: Modular architecture allows extensions

## Performance Notes

- Filter computation is efficient (single pass through candidates)
- State updates are synchronous (no async state management overhead)
- Legacy sync helpers called only when needed
- Event system uses native EventTarget (minimal overhead)

## Testing

### Manual Testing

1. Open builder → verifies auto-start
2. Click Apply Filter → verifies match computation
3. Click Cand < / > → verifies navigation
4. Switch panoramas → verifies match recomputation
5. Press O/V/Esc → verifies dock peek
6. Make changes + Undo → verifies history

### Console Testing

```javascript
// Test filter
const src = ViewerState.sources[0];
const filter = { mode: 'includeOnly', rules: [
  { field: 'is_vis', operator: 'equals', value: 1 }
]};
const matches = computeMatchedIndices(src.candidates, filter);
console.log(`${matches.length} matches`);

// Test navigation
cycleCandidateNav(+1);
console.log('Focused:', window.__LFX_ACTIVE_CAND_IDX);

// Test events
ViewerEvents.addEventListener('candidateSelected', console.log);
```

---

**Version**: 14.0.0  
**Date**: 2026-02-12  
**Status**: Core refactor complete
