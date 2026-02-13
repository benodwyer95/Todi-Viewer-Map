/**
 * LabelPreview - Live label rendering and display system
 * 
 * Renders labels as THREE.js sprites positioned at candidate locations
 * Updates in real-time as builder settings change
 */

// Label Renderer - Creates canvas-based labels
class LabelRenderer {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: true });
  }

  /**
   * Render a label based on LabelFX configuration
   * @param {Object} labelConfig - Label configuration from builder
   * @param {Object} candidate - Candidate data
   * @returns {HTMLCanvasElement} - Rendered canvas
   */
  render(labelConfig, candidate) {
    // Default 16:9 aspect ratio, scalable size
    const width = 960;
    const height = 540;
    
    this.canvas.width = width;
    this.canvas.height = height;
    
    const ctx = this.ctx;
    ctx.clearRect(0, 0, width, height);
    
    // Get configuration from builder steps
    const bgColor = this.getBackgroundColor(labelConfig);
    const textColor = this.getTextColor(labelConfig);
    const textContent = this.getTextContent(labelConfig, candidate);
    const fontSize = this.getFontSize(labelConfig);
    const padding = 20;
    
    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    // Draw border/stroke if configured
    const strokeWidth = this.getStrokeWidth(labelConfig);
    if (strokeWidth > 0) {
      const strokeColor = this.getStrokeColor(labelConfig);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.strokeRect(strokeWidth / 2, strokeWidth / 2, 
                     width - strokeWidth, height - strokeWidth);
    }
    
    // Draw text content
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Handle multi-line text
    const lines = this.wrapText(ctx, textContent, width - padding * 2);
    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    let y = (height - totalHeight) / 2 + lineHeight / 2;
    
    lines.forEach(line => {
      ctx.fillText(line, width / 2, y);
      y += lineHeight;
    });
    
    return this.canvas;
  }

  /**
   * Get background color from label config
   */
  getBackgroundColor(labelConfig) {
    if (labelConfig && labelConfig.step6_colours && labelConfig.step6_colours.background) {
      return labelConfig.step6_colours.background;
    }
    return '#ffffff'; // Default white background
  }

  /**
   * Get text color from label config
   */
  getTextColor(labelConfig) {
    if (labelConfig && labelConfig.step6_colours && labelConfig.step6_colours.text) {
      return labelConfig.step6_colours.text;
    }
    return '#000000'; // Default black text
  }

  /**
   * Get stroke color from label config
   */
  getStrokeColor(labelConfig) {
    if (labelConfig && labelConfig.step7_stroke && labelConfig.step7_stroke.color) {
      return labelConfig.step7_stroke.color;
    }
    return '#000000';
  }

  /**
   * Get stroke width from label config
   */
  getStrokeWidth(labelConfig) {
    if (labelConfig && labelConfig.step7_stroke && labelConfig.step7_stroke.width) {
      return labelConfig.step7_stroke.width;
    }
    return 0;
  }

  /**
   * Get font size from label config
   */
  getFontSize(labelConfig) {
    if (labelConfig && labelConfig.step4_text && labelConfig.step4_text.fontSize) {
      return labelConfig.step4_text.fontSize;
    }
    return 48; // Default font size
  }

  /**
   * Get text content with field evaluation
   */
  getTextContent(labelConfig, candidate) {
    if (!labelConfig || !labelConfig.step4_text || !labelConfig.step4_text.columns) {
      // Default: show candidate name
      return candidate.dst_lm_name || candidate.dst_name || 'Label';
    }
    
    const columns = labelConfig.step4_text.columns;
    const lines = [];
    
    // Evaluate each column/row
    columns.forEach(col => {
      if (col.rows && Array.isArray(col.rows)) {
        col.rows.forEach(row => {
          const text = this.evaluateTextField(row, candidate);
          if (text) {
            lines.push(text);
          }
        });
      }
    });
    
    return lines.length > 0 ? lines.join('\n') : 
           (candidate.dst_lm_name || candidate.dst_name || 'Label');
  }

  /**
   * Evaluate text field with candidate data
   */
  evaluateTextField(textField, candidate) {
    if (!textField || !textField.content) {
      return '';
    }
    
    // Simple field substitution
    let text = textField.content;
    
    // Replace common field placeholders
    const replacements = {
      '{dst_lm_name}': candidate.dst_lm_name || '',
      '{dst_name}': candidate.dst_name || '',
      '{dist_m}': candidate.dist_m ? Math.round(candidate.dist_m) + 'm' : '',
      '{rel_bear}': candidate.rel_bear ? Math.round(candidate.rel_bear) + '°' : '',
    };
    
    Object.keys(replacements).forEach(key => {
      text = text.replace(new RegExp(key, 'g'), replacements[key]);
    });
    
    return text;
  }

  /**
   * Wrap text to fit within width
   */
  wrapText(ctx, text, maxWidth) {
    const lines = text.split('\n');
    const wrapped = [];
    
    lines.forEach(line => {
      const words = line.split(' ');
      let currentLine = '';
      
      words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine !== '') {
          wrapped.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      
      if (currentLine) {
        wrapped.push(currentLine);
      }
    });
    
    return wrapped;
  }
}

// Label Preview Manager - Manages sprites in 3D scene
class LabelPreviewManager {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = new LabelRenderer();
    this.activeSprites = new Map(); // candidateIndex -> sprite
    this.currentCandidate = null;
  }

  /**
   * Show label for a candidate
   */
  showLabel(candidate, candidateIndex, labelConfig) {
    // Validate parameters
    if (!candidate) {
      console.warn('[Label Preview] No candidate provided');
      this.hideAll();
      return;
    }
    
    if (!labelConfig) {
      console.warn('[Label Preview] No label config provided');
      this.hideAll();
      return;
    }
    
    // Check THREE.js availability
    if (!window.THREE) {
      console.error('[Label Preview] THREE.js not available');
      return;
    }
    
    // Clear existing sprites
    this.hideAll();
    
    try {
      // Render label canvas
      const canvas = this.renderer.render(labelConfig, candidate);
      
      // Create THREE.js sprite
      const texture = new window.THREE.CanvasTexture(canvas);
      texture.colorSpace = window.THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      
      const material = new window.THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true,
        depthTest: false,
        depthWrite: false
      });
      
      const sprite = new window.THREE.Sprite(material);
      sprite.renderOrder = 9998; // Below crosshair but above most things
      
      // Position sprite at candidate location
      this.positionSprite(sprite, candidate);
      
      // Add to scene
      this.scene.add(sprite);
      this.activeSprites.set(candidateIndex, sprite);
      this.currentCandidate = candidateIndex;
      
      console.log(`[Label Preview] Showing label for candidate ${candidateIndex}: ${candidate.dst_lm_name || candidate.dst_name || 'unnamed'}`);
      
    } catch (e) {
      console.error('[Label Preview] Error showing label:', e);
      if (e.stack) {
        console.error('[Label Preview] Stack trace:', e.stack);
      }
    }
  }

  /**
   * Position sprite at candidate's 3D location
   */
  positionSprite(sprite, candidate) {
    // Get yaw and pitch from candidate
    const yawDeg = candidate.baked_yaw_deg || candidate.rel_bear || 0;
    const pitchDeg = candidate.baked_pitch_deg || 0;
    
    // Convert to radians
    const yawRad = yawDeg * (Math.PI / 180);
    const pitchRad = pitchDeg * (Math.PI / 180);
    
    // Calculate position on sphere (distance from camera)
    const distance = 50; // Distance in 3D space
    
    const x = distance * Math.cos(pitchRad) * Math.sin(yawRad);
    const y = distance * Math.sin(pitchRad);
    const z = -distance * Math.cos(pitchRad) * Math.cos(yawRad);
    
    sprite.position.set(x, y, z);
    
    // Scale based on distance (16:9 aspect ratio)
    const worldWidth = 30; // Adjust for desired size
    const worldHeight = worldWidth * (9 / 16);
    sprite.scale.set(worldWidth, worldHeight, 1);
  }

  /**
   * Update label with new configuration
   */
  updateLabel(labelConfig) {
    if (this.currentCandidate !== null && this.activeSprites.has(this.currentCandidate)) {
      // Get current candidate data
      const source = window.currentSource ? window.currentSource() : null;
      if (source && source.candidates && source.candidates[this.currentCandidate]) {
        const candidate = source.candidates[this.currentCandidate];
        this.showLabel(candidate, this.currentCandidate, labelConfig);
      }
    }
  }

  /**
   * Hide all labels
   */
  hideAll() {
    this.activeSprites.forEach(sprite => {
      if (sprite.material && sprite.material.map) {
        sprite.material.map.dispose();
      }
      if (sprite.material) {
        sprite.material.dispose();
      }
      this.scene.remove(sprite);
    });
    this.activeSprites.clear();
    this.currentCandidate = null;
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.hideAll();
  }
}

// Export for use in main viewer
export { LabelRenderer, LabelPreviewManager };
