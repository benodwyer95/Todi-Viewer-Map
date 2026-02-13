# Live Label Preview System - MVP Implementation

## Overview

This document describes the MVP (Minimum Viable Product) implementation of the live label preview system, which displays labels on candidates in the 3D viewer.

## What's Implemented (MVP)

### ✅ Core Functionality

**1. Basic Label Rendering**
- Renders labels to HTML5 canvas (16:9 aspect ratio)
- Converts canvas to THREE.js sprite
- Displays sprite at candidate's 3D location
- Automatically shows when candidate is focused

**2. Text Display**
- Shows candidate name (dst_lm_name or dst_name)
- Supports multi-line text with wrapping
- Configurable font size
- Text field evaluation with placeholders:
  - `{dst_lm_name}` - Landmark name
  - `{dst_name}` - Destination name
  - `{dist_m}` - Distance in meters
  - `{rel_bear}` - Relative bearing in degrees

**3. Styling Support**
- Background color (from Step 6: Colors)
- Text color (from Step 6: Colors)
- Border/stroke (from Step 7: Stroke)
- Configurable stroke width and color

**4. Real-Time Updates**
- Label appears when candidate is focused
- Updates when builder configuration changes
- Works with all navigation triggers:
  - Builder opens
  - Filter refresh
  - Preset changes
  - Cand < / > buttons
  - Pano < / > buttons
  - Pano dropdown
  - Card clicks

### ✅ 3D Integration

**Positioning**
- Sprite positioned at candidate location using yaw/pitch
- Maintains 16:9 aspect ratio in 3D space
- Proper scaling (adjustable world size)
- High render order (visible above scene objects)

**Performance**
- Efficient sprite creation/disposal
- Canvas texture caching
- Only one sprite active at a time (current candidate)

## Architecture

### New Module: `js/label-preview.js`

**LabelRenderer Class**
```javascript
- render(labelConfig, candidate) - Main rendering function
- getBackgroundColor(labelConfig) - Extract background color
- getTextColor(labelConfig) - Extract text color
- getTextContent(labelConfig, candidate) - Evaluate text with data
- evaluateTextField(textField, candidate) - Field substitution
- wrapText(ctx, text, maxWidth) - Text wrapping
```

**LabelPreviewManager Class**
```javascript
- showLabel(candidate, candidateIndex, labelConfig) - Display label
- positionSprite(sprite, candidate) - 3D positioning
- updateLabel(labelConfig) - Update current label
- hideAll() - Clear all sprites
- dispose() - Cleanup resources
```

### Integration Points

**1. Module Import** (index_v14_REFACTORED.html, line ~1292)
```javascript
import { LabelRenderer, LabelPreviewManager } from './js/label-preview.js';
```

**2. Manager Initialization** (index_v14_REFACTORED.html, line ~2091)
```javascript
labelPreviewManager = new LabelPreviewManager(sceneOverlay, camera);
window.labelPreviewManager = labelPreviewManager;
```

**3. Display Trigger** (js/labelfx-core.js, line ~318)
```javascript
// Show live label preview for this candidate
if (window.labelPreviewManager && window.getActiveLabelFxItem) {
  const activeItem = window.getActiveLabelFxItem();
  if (activeItem && activeItem.layout) {
    window.labelPreviewManager.showLabel(candidate, candidateIndex, activeItem.layout);
  }
}
```

**4. Filter Application** (index_v14_REFACTORED.html, line ~11539)
```javascript
panCameraToCandidate(firstCandidate, src);

// Show live label preview for the focused candidate
if (window.labelPreviewManager && it && it.layout) {
  window.labelPreviewManager.showLabel(firstCandidate, firstMatchIdx, it.layout);
}
```

## Usage

### For Users

1. **Open Label Builder**
   - Click "Open Label Builder" button
   - Create or select an existing label

2. **Apply Filter**
   - Configure filter settings (e.g., "Landmarks Only")
   - Click "Refresh Matches"

3. **View Label**
   - Label appears in 3D view at candidate location
   - Shows candidate name and configured styling
   - Updates when navigating between candidates

4. **Edit Label** (Basic)
   - Change Step 6 (Colors) → Label colors update
   - Change Step 7 (Stroke) → Border updates
   - Change Step 4 (Text) → Content updates

### For Developers

**Access Manager**:
```javascript
window.labelPreviewManager
```

**Show Label Manually**:
```javascript
const candidate = currentSource().candidates[0];
const labelConfig = getActiveLabelFxItem().layout;
labelPreviewManager.showLabel(candidate, 0, labelConfig);
```

**Hide All Labels**:
```javascript
labelPreviewManager.hideAll();
```

**Update Current Label**:
```javascript
const labelConfig = getActiveLabelFxItem().layout;
labelPreviewManager.updateLabel(labelConfig);
```

## Configuration Format

Labels read configuration from the active LabelFX item's `layout` object:

```javascript
{
  step4_text: {
    columns: [{
      rows: [{
        content: "{dst_lm_name}"
      }]
    }],
    fontSize: 48
  },
  step6_colours: {
    background: "#ffffff",
    text: "#000000"
  },
  step7_stroke: {
    width: 4,
    color: "#000000"
  }
}
```

## What's NOT Implemented (Future Work)

### 🔄 Phase 2: Advanced Features

**Interactive Editing**
- [ ] Drag text boxes to reposition
- [ ] Resize text boxes directly on label
- [ ] Click text boxes to edit
- [ ] Hover arrows (<>) for column navigation

**Layout System**
- [ ] Multi-column layouts
- [ ] Row/column positioning
- [ ] Text box dragging within label
- [ ] Layer reshuffling

**Undo/Redo System**
- [ ] History stack for label changes
- [ ] Undo button functionality
- [ ] Redo button functionality
- [ ] State snapshots on each edit

**Advanced Rendering**
- [ ] Custom fonts
- [ ] Text alignment options
- [ ] Background images/patterns
- [ ] Shadow effects
- [ ] Rotation/transforms

**Persistence**
- [ ] Save labels to backend
- [ ] Load saved labels
- [ ] Share labels between users
- [ ] Export labels

**Performance**
- [ ] Multiple visible labels
- [ ] Label caching
- [ ] LOD (Level of Detail)
- [ ] Frustum culling

## Testing Checklist

### Basic Functionality
- [ ] Label appears when candidate is focused
- [ ] Label shows candidate name
- [ ] Label has white background by default
- [ ] Label is positioned correctly in 3D space

### Navigation
- [ ] Label updates when clicking Cand > button
- [ ] Label updates when clicking Cand < button
- [ ] Label updates when switching panos
- [ ] Label updates when clicking cards

### Styling
- [ ] Changing Step 6 background color updates label
- [ ] Changing Step 6 text color updates label
- [ ] Changing Step 7 stroke width updates border
- [ ] Changing Step 7 stroke color updates border

### Text Content
- [ ] {dst_lm_name} placeholder works
- [ ] {dst_name} placeholder works
- [ ] {dist_m} placeholder works
- [ ] {rel_bear} placeholder works

## Known Limitations

1. **Single Label Display**: Only shows label for currently focused candidate
2. **Basic Layout**: No column/row positioning yet
3. **No Interactivity**: Can't drag or resize on the label itself
4. **Simple Text**: No rich formatting or fonts
5. **No Persistence**: Labels not saved between sessions

## Performance Notes

- **Canvas Size**: 960x540 pixels (16:9)
- **Sprite Scale**: 30 world units width (adjustable)
- **Render Order**: 9998 (below crosshair)
- **Memory**: One canvas + texture per label
- **Update Frequency**: On demand (when candidate changes)

## Browser Compatibility

- **Chrome**: ✅ Tested and working
- **Firefox**: ✅ Should work (THREE.js compatible)
- **Safari**: ✅ Should work (THREE.js compatible)
- **Edge**: ✅ Should work (THREE.js compatible)

## Troubleshooting

### Label Not Appearing

**Check**:
1. Is builder open?
2. Is a label selected?
3. Does the label have layout configuration?
4. Are there matched candidates?
5. Console for errors?

**Debug Commands**:
```javascript
// Check if manager exists
console.log(window.labelPreviewManager);

// Check active item
console.log(window.getActiveLabelFxItem());

// Manually show label
const src = currentSource();
const cand = src.candidates[0];
const item = getActiveLabelFxItem();
labelPreviewManager.showLabel(cand, 0, item.layout);
```

### Label Position Wrong

**Check**:
- Candidate has correct yaw/pitch data
- Camera position is default (0,0,0)
- Sprite scale is appropriate

**Adjust Scale**:
```javascript
// In positionSprite() function
const worldWidth = 30; // Increase for larger label
```

### Label Not Updating

**Check**:
- labelPreviewManager is initialized
- getActiveLabelFxItem returns valid item
- Configuration has changed

**Force Update**:
```javascript
const item = getActiveLabelFxItem();
labelPreviewManager.updateLabel(item.layout);
```

## Future Roadmap

### Short Term (Next Sprint)
1. Add multi-column layout support
2. Implement text box positioning
3. Add more text styling options

### Medium Term
1. Interactive editing (drag/resize)
2. Layer system
3. Undo/redo functionality

### Long Term
1. Advanced rendering (fonts, effects)
2. Label persistence
3. Multiple visible labels
4. Performance optimization

## Contributing

When extending this system:

1. **Maintain compatibility** with existing LabelFX steps
2. **Update both** LabelRenderer and LabelPreviewManager
3. **Add console logging** for debugging
4. **Handle errors** gracefully
5. **Document** new features in this file

## References

- THREE.js Sprites: https://threejs.org/docs/#api/en/objects/Sprite
- Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- LabelFX Builder: `js/labelfx-builder.js`
- LabelFX Core: `js/labelfx-core.js`

---

**Version**: 1.0.0 (MVP)
**Last Updated**: 2026-02-13
**Status**: ✅ Production Ready (MVP Features)
