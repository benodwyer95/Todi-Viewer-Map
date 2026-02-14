# Interactive Label System - Complete Implementation

## Overview

This document describes the complete interactive label editing system with undo/redo and full LabelFX integration.

## Components

### 1. Label Interactive Manager (`js/label-interactive.js`)

**Purpose**: Handles mouse interaction with label sprites for selection and dragging.

**Features**:
- Click detection using THREE.js raycaster
- Drag to reposition labels in 3D space
- Visual feedback (cursor changes)
- Position updates saved to config
- History integration

**How It Works**:
1. Listens for mouse events on renderer.domElement
2. On click: Casts ray into scene to check label intersection
3. If hit: Marks label as selected
4. On drag: Calculates movement in 3D space
5. On release: Saves new position
6. Captures state in history for undo

**Key Methods**:
- `checkLabelIntersection()` - Raycasts to find label
- `onMouseDown()` - Starts drag operation
- `onMouseMove()` - Updates sprite position during drag
- `onMouseUp()` - Ends drag, saves position

### 2. Label History Manager (`js/label-history.js`)

**Purpose**: Manages undo/redo operations for label edits.

**Features**:
- History stack (50 operations max)
- State capture before each edit
- Undo/redo operations
- Button state management
- Stack info for debugging

**How It Works**:
1. Before any edit: `captureState()` called
2. State includes: candidate, config, position
3. State pushed to stack
4. Undo: Restore previous state from stack
5. Redo: Restore next state from stack
6. Buttons auto-enable/disable

**Key Methods**:
- `captureState(description)` - Saves current state
- `undo()` - Restores previous state
- `redo()` - Restores next state
- `canUndo()` / `canRedo()` - Check if operations possible
- `updateButtonStates()` - Updates UI buttons

### 3. Label Preview Manager Extensions

**New Methods Added**:

```javascript
getCurrentState() {
  // Returns: { candidate, candidateIndex, labelConfig, spritePosition }
}

restoreState(state) {
  // Restores label from history state
}

updateLabelPosition(position) {
  // Updates sprite position (called from interactive)
}

updateLabel(labelConfig) {
  // Re-renders label with new config (called from builder)
}
```

### 4. LabelFX Builder Integration

**Setup Functions**:

```javascript
setupUndoRedoButtons() {
  // Wires undo/redo buttons to history manager
}

setupLabelUpdateListeners(item, panel) {
  // Adds change listeners to all builder inputs
  // Debounces updates (300ms)
  // Captures state in history
  // Triggers label re-render
}
```

**What Gets Listened To**:
- All text inputs
- All number inputs
- All dropdowns/selects
- All checkboxes
- All color pickers
- Any input in the builder panel

**Update Flow**:
1. User changes input
2. Event fires → Debounced function called
3. After 300ms idle → Update triggered
4. History captures current state
5. Label re-renders with new config
6. Shows updated label in 3D view

## Usage

### Interactive Dragging

**How to Use**:
1. Label must be visible (apply filter)
2. Move mouse over label → Cursor changes to pointer
3. Click on label → Starts drag
4. Move mouse → Label follows
5. Release → Position saved

**Console Output**:
```
[Label Interactive] Label intersected
[Label Interactive] Started dragging label
[Label Interactive] Dragging to: Vector3(x, y, z)
[Label Interactive] Label position updated: {x, y, z}
[Label History] State captured: Drag label
```

### Undo/Redo

**How to Use**:
1. Make changes (drag label, edit builder)
2. Click Undo button (↶) → Restores previous
3. Click Redo button (↷) → Restores next
4. Buttons disabled when no history

**Console Output**:
```
[Label History] State captured: Builder change
[Label History] Can undo: true, Can redo: false
[Label History] Undo performed
[Label Preview] Restoring state for candidate: 0
```

### Live Builder Updates

**How to Use**:
1. Open Label Builder
2. Make any change to any step
3. After 300ms → Label updates automatically
4. No need to click Apply

**What Updates Live**:
- Step 3: Name
- Step 4: Text content
- Step 5: Aspect ratio
- Step 6: Colors (background, text, etc.)
- Step 7: Stroke width and color
- Step 8: Position
- All other inputs

**Console Output**:
```
[Label Update] Listeners attached to 15 inputs, 3 checkboxes, 5 color controls
[Label History] State captured: Builder change
[Label Preview] Updating label with new config
[Label Preview] Showing label for candidate 0: Montesanto
```

## Architecture

### Initialization Sequence

```javascript
// 1. Create Preview Manager
labelPreviewManager = new LabelPreviewManager(scene, camera);

// 2. Create Interactive Manager
labelInteractive = new LabelInteractiveManager(camera, domElement);
labelInteractive.setLabelPreviewManager(labelPreviewManager);

// 3. Create History Manager
labelHistory = new LabelHistory(50);
labelHistory.setLabelPreviewManager(labelPreviewManager);
labelInteractive.setLabelHistory(labelHistory);

// 4. Expose to window
window.labelPreviewManager = labelPreviewManager;
window.labelInteractive = labelInteractive;
window.labelHistory = labelHistory;
```

### Event Flow

**Drag Operation**:
```
User clicks label
  → Interactive detects click (raycaster)
  → History captures state
  → User drags
  → Interactive updates sprite position
  → User releases
  → Position saved to config
```

**Builder Change**:
```
User changes input
  → Change event fires
  → Debounced function called
  → After 300ms:
    → History captures state
    → Preview updates label
    → Label re-renders in 3D
```

**Undo/Redo**:
```
User clicks Undo
  → History gets previous state
  → Preview restores state
  → Label updates to previous config/position
  → Buttons update states
```

## Testing

### Test Interactive Dragging

```javascript
// Check if interactive working
window.labelInteractive

// Check current selection
window.labelInteractive.selectedSprite

// Check if dragging
window.labelInteractive.isDragging
```

### Test History

```javascript
// Check history stack
window.labelHistory.getStackInfo()

// Returns:
// {
//   stackSize: 5,
//   currentIndex: 2,
//   canUndo: true,
//   canRedo: true,
//   states: ['Drag label', 'Builder change', ...]
// }

// Manual undo/redo
window.labelHistory.undo()
window.labelHistory.redo()
```

### Test Label Updates

```javascript
// Check current label state
window.labelPreviewManager.getCurrentState()

// Returns:
// {
//   candidate: {...},
//   candidateIndex: 0,
//   labelConfig: {...},
//   spritePosition: {x, y, z}
// }

// Manual update
window.labelPreviewManager.updateLabel({
  textContent: 'Test Label',
  backgroundColor: '#ff0000'
})
```

## Performance

### Debouncing

All builder changes are debounced (300ms) to prevent excessive updates:
- User types in text field
- Each keystroke triggers change event
- Debounce waits 300ms after last keystroke
- Then single update triggered
- Label re-renders once

### State Capture

States are captured:
- Before drag operation
- After builder changes (debounced)
- Limited to 50 states max
- Oldest states removed when limit reached

### Sprite Management

Only one sprite active at a time:
- Previous sprite disposed on new label
- Textures properly cleaned up
- Material disposed
- No memory leaks

## Troubleshooting

### Interactive Not Working

**Check**:
```javascript
// Is interactive initialized?
window.labelInteractive

// Is preview manager set?
window.labelInteractive.labelPreviewManager

// Is there a current sprite?
window.labelPreviewManager.currentSprite
```

**Common Issues**:
- Label not visible (apply filter first)
- Canvas element not found
- THREE.js raycaster failing

### Undo/Redo Not Working

**Check**:
```javascript
// Is history initialized?
window.labelHistory

// Can undo?
window.labelHistory.canUndo()

// Check stack
window.labelHistory.getStackInfo()
```

**Common Issues**:
- No states captured yet
- Buttons not wired up
- Preview manager not set

### Live Updates Not Working

**Check**:
```javascript
// Are listeners attached?
// Check console for: [Label Update] Listeners attached...

// Try manual update
window.labelPreviewManager.updateLabel({textContent: 'Test'})
```

**Common Issues**:
- Inputs not found in panel
- Debounce timeout too long
- Preview manager not initialized

## Future Enhancements

### Potential Features

1. **Resize Handles**
   - Corner handles for resizing
   - Maintain aspect ratio option
   - Visual feedback during resize

2. **Column/Row Layout**
   - Multiple text boxes
   - Drag individual boxes
   - Arrows to navigate columns

3. **Layer Reordering**
   - Drag layers up/down
   - Z-index management
   - Visual layer list

4. **Advanced Interactions**
   - Rotate labels
   - Scale labels
   - Snap to grid
   - Alignment guides

5. **Keyboard Shortcuts**
   - Ctrl+Z for undo
   - Ctrl+Y for redo
   - Arrow keys to move
   - Delete to remove

## Summary

The interactive label system is now fully functional with:
- ✅ Click and drag labels
- ✅ Undo/redo operations
- ✅ Live builder updates
- ✅ History tracking
- ✅ Button management
- ✅ Comprehensive logging

All features are working and ready for use!
