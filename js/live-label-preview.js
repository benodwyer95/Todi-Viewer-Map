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
    
    if (this.container) {
      this.container.appendChild(this.canvas);
    }
    
    // Default config
    this.config = this.getDefaultConfig();
    
    console.log('[Live Label Preview] Initialized');
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
    
    // Draw each pill
    pills.forEach((pill, index) => {
      const row = pill.row || Math.floor(index / cols);
      const col = pill.col || (index % cols);
      
      if (row >= rows || col >= cols) return;
      
      const pillX = x + col * cellWidth + colGap;
      const pillY = y + row * cellHeight + rowGap;
      const pillWidth = cellWidth - colGap * 2;
      const pillHeight = cellHeight - rowGap * 2;
      
      this.drawPill(pillX, pillY, pillWidth, pillHeight, pill);
    });
  }

  /**
   * Draw a single pill
   */
  drawPill(x, y, width, height, pill) {
    const ctx = this.ctx;
    const colors = this.config.colors;
    const layout = this.config.layout;
    
    // Draw pill background
    ctx.fillStyle = pill.backgroundColor || colors.pillBackground || '#f0f0f0';
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
    ctx.strokeStyle = colors.pillBorder || '#cccccc';
    ctx.lineWidth = 1;
    ctx.stroke();
    
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
