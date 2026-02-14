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
    // Try new format first (from config builder)
    if (labelConfig && labelConfig.colors && labelConfig.colors.background) {
      return labelConfig.colors.background;
    }
    // Try old format
    if (labelConfig && labelConfig.step6_colours && labelConfig.step6_colours.background) {
      return labelConfig.step6_colours.background;
    }
    // Try simple format
    if (labelConfig && labelConfig.backgroundColor) {
      return labelConfig.backgroundColor;
    }
    return '#ffffff'; // Default white background
  }

  /**
   * Get text color from label config
   */
  getTextColor(labelConfig) {
    // Try new format first (from config builder)
    if (labelConfig && labelConfig.colors && labelConfig.colors.text) {
      return labelConfig.colors.text;
    }
    // Try old format
    if (labelConfig && labelConfig.step6_colours && labelConfig.step6_colours.text) {
      return labelConfig.step6_colours.text;
    }
    // Try simple format
    if (labelConfig && labelConfig.textColor) {
      return labelConfig.textColor;
    }
    return '#000000'; // Default black text
  }

  /**
   * Get stroke color from label config
   */
  getStrokeColor(labelConfig) {
    // Try new format first
    if (labelConfig && labelConfig.layout && labelConfig.layout.outline && labelConfig.layout.outline.color) {
      return labelConfig.layout.outline.color;
    }
    // Try old format
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
    // Try new format first (from config builder)
    if (labelConfig && labelConfig.text && labelConfig.text.pills && Array.isArray(labelConfig.text.pills)) {
      const pills = labelConfig.text.pills;
      if (pills.length > 0) {
        // Use content from first pill (or combine multiple pills)
        const texts = pills.map(pill => pill.content || pill.rawContent || '').filter(t => t);
        if (texts.length > 0) {
          return texts.join(' ');
        }
      }
    }
    
    // Try old format (step4_text.columns)
    if (labelConfig && labelConfig.step4_text && labelConfig.step4_text.columns) {
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
      
      if (lines.length > 0) {
        return lines.join('\n');
      }
    }
    
    // Try textContent property (simple format)
    if (labelConfig && labelConfig.textContent) {
      return labelConfig.textContent;
    }
    
    // Default: show candidate name
    return candidate.dst_lm_name || candidate.dst_name || 'Label';
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
    this.currentSprite = null;
    this.currentCandidateIndex = null;
    this.currentLabelConfig = null;
  }

  /**
   * Show label for a candidate
   */
  showLabel(candidate, candidateIndex, labelConfig) {
    console.log('[Label Preview] showLabel called with candidate:', candidateIndex, candidate?.dst_lm_name || candidate?.dst_name);
    console.log('[Label Preview] labelConfig:', labelConfig);
    
    // Validate parameters
    if (!candidate) {
      console.warn('[Label Preview] No candidate provided');
      this.hideAll();
      return;
    }
    
    // Use default config if none provided
    if (!labelConfig || (typeof labelConfig === 'object' && Object.keys(labelConfig).length === 0)) {
      console.log('[Label Preview] Using default label config');
      labelConfig = {
        name: 'Default Label',
        textContent: candidate.dst_lm_name || candidate.dst_name || 'Unnamed',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        fontSize: 24,
        aspectRatio: 16/9
      };
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
      
      // Store candidate OBJECT (not index!) and related data
      this.currentCandidate = candidate;  // Store the actual candidate object
      this.currentCandidateIndex = candidateIndex;  // Store the index number
      this.currentSprite = sprite;
      this.currentLabelConfig = labelConfig;
      
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
    if (!this.currentCandidate || this.currentCandidateIndex === null) {
      console.warn('[Label Preview] Cannot update label - no current candidate stored');
      return;
    }
    
    console.log('[Label Preview] Updating label with new config');
    console.log('[Label Preview] Current candidate:', this.currentCandidateIndex, this.currentCandidate.dst_lm_name || this.currentCandidate.dst_name || 'unnamed');
    
    // Use the stored candidate object and index
    this.showLabel(this.currentCandidate, this.currentCandidateIndex, labelConfig);
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
    this.currentSprite = null;
    this.currentCandidateIndex = null;
    this.currentLabelConfig = null;
  }

  /**
   * Get current label state for undo/redo
   */
  getCurrentState() {
    if (!this.currentSprite || !this.currentCandidate) {
      return null;
    }
    
    return {
      candidate: this.currentCandidate,
      candidateIndex: this.currentCandidateIndex,
      labelConfig: this.currentLabelConfig,
      spritePosition: {
        x: this.currentSprite.position.x,
        y: this.currentSprite.position.y,
        z: this.currentSprite.position.z
      }
    };
  }
  
  /**
   * Restore label state for undo/redo
   */
  restoreState(state) {
    if (!state) {
      console.warn('[Label Preview] No state to restore');
      return;
    }
    
    console.log('[Label Preview] Restoring state for candidate:', state.candidateIndex);
    
    // Restore the label with saved state
    this.showLabel(state.candidate, state.candidateIndex, state.labelConfig);
    
    // Restore sprite position if it was moved
    if (state.spritePosition && this.currentSprite) {
      this.currentSprite.position.set(
        state.spritePosition.x,
        state.spritePosition.y,
        state.spritePosition.z
      );
    }
  }
  
  /**
   * Update label position (called from interactive dragging)
   */
  updateLabelPosition(position) {
    if (this.currentSprite) {
      this.currentSprite.position.set(position.x, position.y, position.z);
    }
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
