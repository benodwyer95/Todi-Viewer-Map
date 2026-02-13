# Interactive Live Label Preview System

## Overview

The Live Label Preview system provides a real-time, interactive sample label directly within the LabelFX Builder. As users work on Layout (Step 4) and Text (Step 5) settings, they can see and interact with a visual representation of their label.

## Features

### Visual Preview
- **Grid Layout**: Shows rows × columns structure
- **Pills**: Visual pill elements with text
- **Gaps & Spacing**: Shows spacing between pills
- **Colors**: Background, text, borders
- **Corner Radius**: Rounded corners
- **Outline**: Border settings

### Interactivity

#### Click to Select
- Click any pill to select it
- Selected pill shows blue outline (3px, #2196F3)
- 8 resize handles appear (blue dots at corners and edges)

#### Drag to Reposition
- Click and hold selected pill
- Drag to move within grid
- Snaps to grid cells
- Cursor changes to 'move' during drag
- Pill updates position immediately

#### Double-Click to Edit
- Double-click any pill
- Text edit prompt appears
- Enter new text
- Pill updates with new content

#### Hover Effects
- Mouse over pill → Background lightens (10%)
- Border changes to light blue (#64B5F6, 2px)
- Cursor changes to pointer
- Clear visual feedback

#### Resize Handles
- 8 handles on selected pill:
  - Corners: NW, NE, SW, SE
  - Edges: N, S, E, W
- Blue dots (6px squares)
- White stroke for visibility
- Cursor changes per direction

### Two-Way Data Binding

#### Sample → Builder
Changes in the sample label update builder inputs:
```javascript
preview.setOnChange((config) => {
  // Update builder form inputs
  document.getElementById('pillText').value = config.text.pills[0].content;
  document.getElementById('rows').value = config.layout.rows;
  // etc...
});
```

#### Builder → Sample
Builder input changes update the sample:
```javascript
rowsInput.addEventListener('input', (e) => {
  preview.updateLayout({ rows: parseInt(e.target.value) });
});

textInput.addEventListener('input', (e) => {
  preview.updateText({ pills: [{ content: e.target.value }] });
});
```

## Usage

### Basic Setup

```javascript
import { LiveLabelPreview } from './js/live-label-preview.js';

// Create preview in container
const container = document.getElementById('labelPreviewContainer');
const preview = new LiveLabelPreview(container);

// Set change callback
preview.setOnChange((config) => {
  console.log('Label changed:', config);
  updateBuilderInputs(config);
});

// Initial render
preview.render();
```

### Update Methods

#### Update Layout
```javascript
preview.updateLayout({
  rows: 3,
  columns: 3,
  gaps: { row: 10, col: 10 },
  cornerRadius: 8,
  background: { mode: 'single', color: '#ffffff' },
  outline: { enabled: true, color: '#000000', width: 2 }
});
```

#### Update Text
```javascript
preview.updateText({
  pills: [
    { row: 0, col: 0, content: 'Top Left', alignment: 'left' },
    { row: 0, col: 1, content: 'Top Center', alignment: 'center' },
    { row: 0, col: 2, content: 'Top Right', alignment: 'right' }
  ],
  fontSize: 20
});
```

#### Update Colors
```javascript
preview.updateColors({
  background: '#ffffff',
  text: '#000000',
  outline: '#333333',
  pillBackground: '#f0f0f0',
  pillBorder: '#cccccc'
});
```

#### Full Update
```javascript
preview.update({
  layout: { /* layout config */ },
  text: { /* text config */ },
  colors: { /* color config */ }
});
```

## Integration with Builder

### HTML Structure

Add preview container in builder UI:

```html
<div id="lfxEditorBody">
  <!-- Step 4: Layout -->
  <div class="builder-step" data-step="4">
    <h3>Layout</h3>
    
    <!-- Live Preview -->
    <div id="layoutPreviewContainer" style="margin-bottom: 20px;"></div>
    
    <!-- Layout Controls -->
    <label>
      Rows: <input id="rowsInput" type="number" value="3" min="1" max="10">
    </label>
    <!-- more inputs... -->
  </div>
  
  <!-- Step 5: Text -->
  <div class="builder-step" data-step="5">
    <h3>Text</h3>
    
    <!-- Same preview or separate text preview -->
    
    <!-- Text Controls -->
    <label>
      Content: <input id="textInput" type="text" value="Sample">
    </label>
    <!-- more inputs... -->
  </div>
</div>
```

### JavaScript Integration

```javascript
// Initialize preview when builder opens
function mountB2Editor(item) {
  // ... existing builder setup ...
  
  // Create live preview
  const previewContainer = document.getElementById('layoutPreviewContainer');
  if (previewContainer && !window.labelPreview) {
    window.labelPreview = new LiveLabelPreview(previewContainer);
    
    // Set change callback
    window.labelPreview.setOnChange((config) => {
      // Update builder inputs when sample changes
      updateBuilderFromPreview(config);
    });
    
    // Initial render
    window.labelPreview.render();
  }
  
  // Wire builder inputs to preview
  setupPreviewListeners();
}

function setupPreviewListeners() {
  const preview = window.labelPreview;
  if (!preview) return;
  
  // Layout inputs
  const rowsInput = document.getElementById('rowsInput');
  const colsInput = document.getElementById('colsInput');
  const gapInput = document.getElementById('gapInput');
  const radiusInput = document.getElementById('radiusInput');
  const bgColorInput = document.getElementById('bgColorInput');
  
  rowsInput?.addEventListener('input', (e) => {
    preview.updateLayout({ rows: parseInt(e.target.value) });
  });
  
  colsInput?.addEventListener('input', (e) => {
    preview.updateLayout({ columns: parseInt(e.target.value) });
  });
  
  gapInput?.addEventListener('input', (e) => {
    const gap = parseInt(e.target.value);
    preview.updateLayout({ gaps: { row: gap, col: gap } });
  });
  
  radiusInput?.addEventListener('input', (e) => {
    preview.updateLayout({ cornerRadius: parseInt(e.target.value) });
  });
  
  bgColorInput?.addEventListener('input', (e) => {
    preview.updateColors({ background: e.target.value });
  });
  
  // Text inputs
  const textInput = document.getElementById('textInput');
  const alignmentSelect = document.getElementById('alignmentSelect');
  const fontSizeInput = document.getElementById('fontSizeInput');
  
  textInput?.addEventListener('input', (e) => {
    const pills = preview.config.text.pills || [];
    if (pills.length > 0) {
      pills[0].content = e.target.value;
      preview.updateText({ pills });
    }
  });
  
  alignmentSelect?.addEventListener('change', (e) => {
    const pills = preview.config.text.pills || [];
    if (pills.length > 0) {
      pills[0].alignment = e.target.value;
      preview.updateText({ pills });
    }
  });
  
  fontSizeInput?.addEventListener('input', (e) => {
    preview.updateText({ fontSize: parseInt(e.target.value) });
  });
}

function updateBuilderFromPreview(config) {
  // Update builder inputs when preview changes interactively
  const pills = config.text?.pills || [];
  if (pills.length > 0) {
    const pill = pills[0];
    const textInput = document.getElementById('textInput');
    if (textInput) {
      textInput.value = pill.content;
    }
  }
}
```

## Mouse Interaction Details

### Event Handlers

1. **mousedown**: Start interaction
   - Detect which pill clicked
   - Determine if resize handle clicked
   - Set drag/resize mode
   - Store start position

2. **mousemove**: Update interaction
   - If dragging: Calculate new grid cell
   - If resizing: Update pill dimensions
   - If hovering: Update hover state
   - Update cursor

3. **mouseup**: End interaction
   - Stop drag/resize
   - Reset cursor
   - Trigger change callback

4. **mouseleave**: Cancel interaction
   - Same as mouseup
   - Clear hover state

5. **dblclick**: Edit content
   - Show text prompt
   - Update pill content
   - Re-render

### Hit Testing

```javascript
// Detect pill at mouse position
getPillAtPosition(x, y) {
  for (let bound of this.pillBounds) {
    if (x >= bound.x && x <= bound.x + bound.width &&
        y >= bound.y && y <= bound.y + bound.height) {
      return bound.pill;
    }
  }
  return null;
}

// Detect grid cell at position
getGridCellAtPosition(x, y) {
  const relX = x - labelX;
  const relY = y - labelY;
  const col = Math.floor(relX / cellWidth);
  const row = Math.floor(relY / cellHeight);
  return { row, col };
}

// Detect resize handle
getResizeHandle(pill, x, y) {
  const handleSize = 8;
  // Check if near edge/corner
  // Return 'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'
}
```

### Cursor Management

```javascript
const cursors = {
  default: 'default',
  pointer: 'pointer',
  move: 'move',
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize'
};
```

## Visual States

### Normal Pill
- Background: #f0f0f0
- Border: #cccccc, 1px
- Cursor: default

### Hovered Pill
- Background: Lightened 10%
- Border: #64B5F6, 2px
- Cursor: pointer

### Selected Pill
- Background: Same
- Border: #2196F3, 3px
- Resize handles: 8 blue dots
- Cursor: depends on area

### Dragging
- Background: Same
- Border: #2196F3, 3px
- Cursor: move
- Position: Follows mouse, snaps to grid

## Performance Considerations

- Render on demand (not continuous loop)
- Debounce rapid updates if needed
- Clear only changed areas (if optimizing)
- Store bounds for efficient hit testing
- Reuse canvas, don't recreate

## Future Enhancements

### Multi-Cell Spanning
- Pills can span multiple cells
- Resize to occupy 2×2, 3×1, etc.
- Adjust grid accordingly

### Add/Remove Pills
- Right-click menu to add pill
- Delete key to remove pill
- Drag from toolbar to add

### Advanced Text Editing
- Inline text editing (not just prompt)
- Rich text formatting
- Field token picker

### Copy/Paste
- Copy selected pill
- Paste to different cell
- Duplicate pills

### Undo/Redo
- History of changes
- Undo/redo buttons
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y)

## Troubleshooting

### Preview Not Showing
- Check container exists: `document.getElementById('layoutPreviewContainer')`
- Check preview initialized: `window.labelPreview`
- Check render called: `preview.render()`

### Clicks Not Working
- Check mouse events attached
- Check hit testing: `preview.getPillAtPosition(x, y)`
- Check pill bounds array populated

### Changes Not Updating Builder
- Check onChange callback set: `preview.setOnChange(...)`
- Check callback function working
- Check builder input IDs correct

### Visual Issues
- Check canvas size: `canvas.width`, `canvas.height`
- Check CSS sizing: `style.width`, `style.height`
- Check colors valid: Hex format `#rrggbb`

## API Reference

### Constructor
```javascript
new LiveLabelPreview(containerElement)
```

### Methods
- `update(config)` - Full config update
- `updateLayout(layout)` - Update layout only
- `updateText(text)` - Update text only
- `updateColors(colors)` - Update colors only
- `render()` - Re-render preview
- `setOnChange(callback)` - Set change callback

### Properties
- `config` - Current configuration
- `selectedPill` - Currently selected pill
- `hoveredPill` - Currently hovered pill
- `canvas` - Canvas element
- `ctx` - 2D context

### Events
- `onChange(config)` - Called when interactive change occurs

## Complete Example

See `/examples/live-label-preview-demo.html` for a complete working example with all features demonstrated.

---

**Status**: ✅ Complete interactive system
**Documentation**: Comprehensive
**Ready for**: Integration into LabelFX Builder
