/**
 * Live Label Preview for Builder
 * Shows a sample label that updates in real-time as settings change
 */

export class LiveLabelPreview {
  constructor(containerElement) {
    this.container = containerElement;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Default dimensions
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.canvas.style.width = '100%';
    this.canvas.style.height = 'auto';
    this.canvas.style.border = '1px solid #ccc';
    this.canvas.style.borderRadius = '4px';
    this.canvas.style.backgroundColor = '#f5f5f5';
    this.canvas.style.cursor = 'default';
    
    if (this.container) {
      this.container.appendChild(this.canvas);
    }
    
    // Default config
    this.config = this.getDefaultConfig();
    
    // Interactive state
    this.selectedPill = null;
    this.hoveredPill = null;
    this.dragging = false;
    this.resizing = false;
    this.resizeHandle = null; // 'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'
    this.dragStart = { x: 0, y: 0 };
    this.pillBounds = []; // Store pill positions for hit testing
    
    // Change callback
    this.onChange = null;
    
    // Setup mouse events
    this.setupMouseEvents();
    
    console.log('[Live Label Preview] Initialized with interactivity');
  }
  
  /**
   * Setup mouse event handlers for interactivity
   */
  setupMouseEvents() {
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.canvas.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
    this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
  }
  
  /**
   * Handle mouse down - start dragging or resizing
   */
  handleMouseDown(e) {
    const pos = this.getMousePos(e);
    const pill = this.getPillAtPosition(pos.x, pos.y);
    
    if (pill) {
      this.selectedPill = pill;
      const handle = this.getResizeHandle(pill, pos.x, pos.y);
      
      if (handle) {
        this.resizing = true;
        this.resizeHandle = handle;
        this.canvas.style.cursor = this.getResizeCursor(handle);
      } else {
        this.dragging = true;
        this.canvas.style.cursor = 'move';
      }
      
      this.dragStart = { x: pos.x, y: pos.y };
      this.render();
      
      console.log('[Live Label Preview] Selected pill:', pill);
    }
  }
  
  /**
   * Handle mouse move - update drag/resize or hover
   */
  handleMouseMove(e) {
    const pos = this.getMousePos(e);
    
    if (this.dragging && this.selectedPill) {
      // Update pill position
      const dx = pos.x - this.dragStart.x;
      const dy = pos.y - this.dragStart.y;
      
      // Calculate new grid cell
      const newCell = this.getGridCellAtPosition(pos.x, pos.y);
      if (newCell && (newCell.row !== this.selectedPill.row || newCell.col !== this.selectedPill.col)) {
        this.selectedPill.row = newCell.row;
        this.selectedPill.col = newCell.col;
        this.render();
        this.notifyChange();
      }
    } else if (this.resizing && this.selectedPill) {
      // Resizing not yet implemented for grid-based layout
      // Would need to support spanning multiple cells
    } else {
      // Update hover state
      const pill = this.getPillAtPosition(pos.x, pos.y);
      if (pill !== this.hoveredPill) {
        this.hoveredPill = pill;
        this.render();
      }
      
      // Update cursor
      if (pill) {
        const handle = this.getResizeHandle(pill, pos.x, pos.y);
        this.canvas.style.cursor = handle ? this.getResizeCursor(handle) : 'pointer';
      } else {
        this.canvas.style.cursor = 'default';
      }
    }
  }
  
  /**
   * Handle mouse up - end dragging or resizing
   */
  handleMouseUp(e) {
    if (this.dragging || this.resizing) {
      this.dragging = false;
      this.resizing = false;
      this.resizeHandle = null;
      this.canvas.style.cursor = 'default';
      console.log('[Live Label Preview] Drag/resize ended');
    }
  }
  
  /**
   * Handle mouse leave - cancel drag/resize
   */
  handleMouseLeave(e) {
    this.handleMouseUp(e);
    this.hoveredPill = null;
    this.render();
  }
  
  /**
   * Handle double click - edit text
   */
  handleDoubleClick(e) {
    const pos = this.getMousePos(e);
    const pill = this.getPillAtPosition(pos.x, pos.y);
    
    if (pill) {
      const newText = prompt('Edit text:', pill.content);
      if (newText !== null) {
        pill.content = newText;
        this.render();
        this.notifyChange();
        console.log('[Live Label Preview] Text updated:', newText);
      }
    }
  }
  
  /**
   * Get mouse position relative to canvas
   */
  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }
  
  /**
   * Get pill at mouse position
   */
  getPillAtPosition(x, y) {
    for (let i = this.pillBounds.length - 1; i >= 0; i--) {
      const bound = this.pillBounds[i];
      if (x >= bound.x && x <= bound.x + bound.width &&
          y >= bound.y && y <= bound.y + bound.height) {
        return bound.pill;
      }
    }
    return null;
  }
  
  /**
   * Get grid cell at position
   */
  getGridCellAtPosition(x, y) {
    const labelWidth = 600;
    const labelHeight = 400;
    const labelX = (this.canvas.width - labelWidth) / 2;
    const labelY = (this.canvas.height - labelHeight) / 2;
    
    const relX = x - labelX;
    const relY = y - labelY;
    
    if (relX < 0 || relX > labelWidth || relY < 0 || relY > labelHeight) {
      return null;
    }
    
    const rows = this.config.layout.rows || 1;
    const cols = this.config.layout.columns || 1;
    const cellWidth = labelWidth / cols;
    const cellHeight = labelHeight / rows;
    
    const col = Math.floor(relX / cellWidth);
    const row = Math.floor(relY / cellHeight);
    
    return { row: Math.min(row, rows - 1), col: Math.min(col, cols - 1) };
  }
  
  /**
   * Get resize handle at position
   */
  getResizeHandle(pill, x, y) {
    const bound = this.pillBounds.find(b => b.pill === pill);
    if (!bound) return null;
    
    const handleSize = 8;
    const edges = {
      n: Math.abs(y - bound.y) < handleSize,
      s: Math.abs(y - (bound.y + bound.height)) < handleSize,
      w: Math.abs(x - bound.x) < handleSize,
      e: Math.abs(x - (bound.x + bound.width)) < handleSize
    };
    
    if (edges.n && edges.w) return 'nw';
    if (edges.n && edges.e) return 'ne';
    if (edges.s && edges.w) return 'sw';
    if (edges.s && edges.e) return 'se';
    if (edges.n) return 'n';
    if (edges.s) return 's';
    if (edges.w) return 'w';
    if (edges.e) return 'e';
    
    return null;
  }
  
  /**
   * Get cursor for resize handle
   */
  getResizeCursor(handle) {
    const cursors = {
      n: 'ns-resize',
      s: 'ns-resize',
      e: 'ew-resize',
      w: 'ew-resize',
      ne: 'nesw-resize',
      sw: 'nesw-resize',
      nw: 'nwse-resize',
      se: 'nwse-resize'
    };
    return cursors[handle] || 'default';
  }
  
  /**
   * Notify change callback
   */
  notifyChange() {
    if (this.onChange) {
      this.onChange(this.config);
    }
  }
  
  /**
   * Set change callback
   */
  setOnChange(callback) {
    this.onChange = callback;
  }

  /**
   * Update the preview with new configuration
   */
  update(config) {
    this.config = { ...this.config, ...config };
    this.render();
  }

  /**
   * Update layout settings
   */
  updateLayout(layout) {
    this.config.layout = { ...this.config.layout, ...layout };
    this.render();
  }

  /**
   * Update text settings
   */
  updateText(text) {
    this.config.text = { ...this.config.text, ...text };
    this.render();
  }

  /**
   * Update colors
   */
  updateColors(colors) {
    this.config.colors = { ...this.config.colors, ...colors };
    this.render();
  }

  /**
   * Render the sample label
   */
  render() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background pattern
    this.drawBackground();
    
    // Calculate label dimensions and position
    const labelWidth = 600;
    const labelHeight = 400;
    const x = (canvas.width - labelWidth) / 2;
    const y = (canvas.height - labelHeight) / 2;
    
    // Draw label background
    this.drawLabelBackground(x, y, labelWidth, labelHeight);
    
    // Draw grid/layout
    this.drawGrid(x, y, labelWidth, labelHeight);
    
    // Draw pills with text
    this.drawPills(x, y, labelWidth, labelHeight);
    
    console.log('[Live Label Preview] Rendered');
  }

  /**
   * Draw canvas background
   */
  drawBackground() {
    const ctx = this.ctx;
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid pattern
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    const gridSize = 20;
    
    for (let x = 0; x < this.canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < this.canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }
  }

  /**
   * Draw label background
   */
  drawLabelBackground(x, y, width, height) {
    const ctx = this.ctx;
    const layout = this.config.layout;
    const colors = this.config.colors;
    
    // Apply corner radius
    const radius = layout.cornerRadius || 8;
    
    // Draw rounded rectangle
    ctx.fillStyle = colors.background || '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    
    // Draw outline if enabled
    if (layout.outline && layout.outline.enabled) {
      ctx.strokeStyle = layout.outline.color || colors.outline || '#000000';
      ctx.lineWidth = layout.outline.width || 2;
      ctx.stroke();
    }
  }

  /**
   * Draw grid layout guide
   */
  drawGrid(x, y, width, height) {
    const ctx = this.ctx;
    const layout = this.config.layout;
    const rows = layout.rows || 1;
    const cols = layout.columns || 1;
    
    // Draw grid lines (subtle)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let i = 1; i < cols; i++) {
      const lineX = x + (width / cols) * i;
      ctx.beginPath();
      ctx.moveTo(lineX, y);
      ctx.lineTo(lineX, y + height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 1; i < rows; i++) {
      const lineY = y + (height / rows) * i;
      ctx.beginPath();
      ctx.moveTo(x, lineY);
      ctx.lineTo(x + width, lineY);
      ctx.stroke();
    }
  }

  /**
   * Draw pills with text
   */
  drawPills(x, y, width, height) {
    const ctx = this.ctx;
    const layout = this.config.layout;
    const text = this.config.text;
    const colors = this.config.colors;
    
    const rows = layout.rows || 1;
    const cols = layout.columns || 1;
    const rowGap = layout.gaps?.row || 10;
    const colGap = layout.gaps?.col || 10;
    
    const cellWidth = width / cols;
    const cellHeight = height / rows;
    
    const pills = text.pills || [];
    
    // If no pills defined, create default
    if (pills.length === 0) {
      pills.push({
        row: 0,
        col: 0,
        content: 'Sample Text',
        alignment: 'center'
      });
    }
    
    // Clear pill bounds for hit testing
    this.pillBounds = [];
    
    // Draw each pill
    pills.forEach((pill, index) => {
      const row = pill.row || Math.floor(index / cols);
      const col = pill.col || (index % cols);
      
      if (row >= rows || col >= cols) return;
      
      const pillX = x + col * cellWidth + colGap;
      const pillY = y + row * cellHeight + rowGap;
      const pillWidth = cellWidth - colGap * 2;
      const pillHeight = cellHeight - rowGap * 2;
      
      // Store bounds for hit testing
      this.pillBounds.push({
        x: pillX,
        y: pillY,
        width: pillWidth,
        height: pillHeight,
        pill: pill
      });
      
      // Determine if this pill is selected or hovered
      const isSelected = this.selectedPill === pill;
      const isHovered = this.hoveredPill === pill;
      
      this.drawPill(pillX, pillY, pillWidth, pillHeight, pill, isSelected, isHovered);
    });
  }

  /**
   * Draw a single pill
   */
  drawPill(x, y, width, height, pill, isSelected, isHovered) {
    const ctx = this.ctx;
    const colors = this.config.colors;
    const layout = this.config.layout;
    
    // Adjust colors for hover/selection
    let bgColor = pill.backgroundColor || colors.pillBackground || '#f0f0f0';
    let borderColor = colors.pillBorder || '#cccccc';
    let borderWidth = 1;
    
    if (isSelected) {
      borderColor = '#2196F3'; // Blue selection
      borderWidth = 3;
    } else if (isHovered) {
      bgColor = this.lightenColor(bgColor, 0.1);
      borderColor = '#64B5F6'; // Light blue hover
      borderWidth = 2;
    }
    
    // Draw pill background
    ctx.fillStyle = bgColor;
    const radius = (layout.cornerRadius || 8) / 2;
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    
    // Draw pill border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.stroke();
    
    // Draw resize handles if selected
    if (isSelected) {
      this.drawResizeHandles(x, y, width, height);
    }
    
    // Draw text
    const content = pill.content || 'Text';
    const fontSize = this.config.text.fontSize || 20;
    const alignment = pill.alignment || 'center';
    
    ctx.fillStyle = colors.text || '#000000';
    ctx.font = `${fontSize}px Arial`;
    ctx.textBaseline = 'middle';
    
    let textX;
    if (alignment === 'left') {
      ctx.textAlign = 'left';
      textX = x + 10;
    } else if (alignment === 'right') {
      ctx.textAlign = 'right';
      textX = x + width - 10;
    } else {
      ctx.textAlign = 'center';
      textX = x + width / 2;
    }
    
    const textY = y + height / 2;
    
    // Wrap text if needed
    const maxWidth = width - 20;
    const lines = this.wrapText(ctx, content, maxWidth);
    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    let currentY = textY - totalHeight / 2 + lineHeight / 2;
    
    lines.forEach(line => {
      ctx.fillText(line, textX, currentY);
      currentY += lineHeight;
    });
  }
  
  /**
   * Draw resize handles on selected pill
   */
  drawResizeHandles(x, y, width, height) {
    const ctx = this.ctx;
    const handleSize = 6;
    const handleColor = '#2196F3';
    
    const handles = [
      { x: x, y: y }, // nw
      { x: x + width / 2, y: y }, // n
      { x: x + width, y: y }, // ne
      { x: x, y: y + height / 2 }, // w
      { x: x + width, y: y + height / 2 }, // e
      { x: x, y: y + height }, // sw
      { x: x + width / 2, y: y + height }, // s
      { x: x + width, y: y + height } // se
    ];
    
    handles.forEach(handle => {
      ctx.fillStyle = handleColor;
      ctx.fillRect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize
      );
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize
      );
    });
  }
  
  /**
   * Lighten a color by a percentage
   */
  lightenColor(color, percent) {
    // Simple color lightening - convert hex to RGB, lighten, convert back
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const newR = Math.min(255, Math.round(r + (255 - r) * percent));
    const newG = Math.min(255, Math.round(g + (255 - g) * percent));
    const newB = Math.min(255, Math.round(b + (255 - b) * percent));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  /**
   * Wrap text to fit width
   */
  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.length > 0 ? lines : [text];
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      layout: {
        rows: 3,
        columns: 3,
        gaps: { row: 10, col: 10 },
        cornerRadius: 8,
        background: { mode: 'single', color: '#ffffff' },
        outline: { enabled: true, color: '#000000', width: 2 }
      },
      text: {
        pills: [
          { row: 0, col: 1, content: 'Sample Text', alignment: 'center' }
        ],
        fontSize: 20
      },
      colors: {
        background: '#ffffff',
        text: '#000000',
        outline: '#000000',
        pillBackground: '#f0f0f0',
        pillBorder: '#cccccc'
      }
    };
  }
}

export function createLiveLabelPreview(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('[Live Label Preview] Container not found:', containerId);
    return null;
  }
  return new LiveLabelPreview(container);
}
