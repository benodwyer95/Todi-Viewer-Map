/**
 * LabelFX Configuration Builder
 * Reads all 11 builder steps and creates comprehensive label configuration
 */

export class LabelFXConfigBuilder {
  constructor() {
    console.log('[LabelFX Config] Builder initialized');
  }

  /**
   * Build complete label configuration from all builder steps
   * @param {HTMLElement} builderContainer - The builder DOM container
   * @param {Object} candidate - Current candidate data
   * @returns {Object} Complete label configuration
   */
  buildLabelConfig(builderContainer, candidate) {
    if (!builderContainer) {
      console.warn('[LabelFX Config] No builder container provided');
      return this.getDefaultConfig(candidate);
    }

    const config = {
      // Step 1: Type
      type: this.readTypeStep(builderContainer),
      
      // Step 2: Filter (handled separately, just note it exists)
      filter: 'handled_by_filter_system',
      
      // Step 3: Aspect
      aspect: this.readAspectStep(builderContainer),
      
      // Step 4: Layout
      layout: this.readLayoutStep(builderContainer),
      
      // Step 5: Text
      text: this.readTextStep(builderContainer, candidate),
      
      // Step 6: Line
      line: this.readLineStep(builderContainer),
      
      // Step 7: Shape
      shape: this.readShapeStep(builderContainer),
      
      // Step 8: Position
      position: this.readPositionStep(builderContainer),
      
      // Step 9: Colours
      colors: this.readColoursStep(builderContainer),
      
      // Step 10: Animation
      animation: this.readAnimationStep(builderContainer),
      
      // Step 11: Layers
      layers: this.readLayersStep(builderContainer),
      
      // Candidate data for field tokens
      candidate: candidate
    };

    console.log('[LabelFX Config] Built configuration:', config);
    return config;
  }

  /**
   * Step 1: Type - Define item type and scope
   */
  readTypeStep(container) {
    // Try to find type selector (label vs hover tip)
    const typeSelect = container.querySelector('#lfxType, [name="lfxType"], select[id*="type"]');
    const type = typeSelect?.value || 'label';
    
    // Try to find candidate type scope
    const scopeSelect = container.querySelector('#lfxCandidateType, [name="candidateType"]');
    const candidateType = scopeSelect?.value || 'all';
    
    return {
      itemType: type,
      candidateType: candidateType,
      scope: 'all' // Could be extended
    };
  }

  /**
   * Step 3: Aspect - Define aspect ratio
   */
  readAspectStep(container) {
    // Try to find aspect ratio selector
    const aspectSelect = container.querySelector('#lfxAspectRatio, [name="aspectRatio"], select[id*="aspect"]');
    const aspectValue = aspectSelect?.value || '16:9';
    
    // Parse aspect ratio
    let width = 960, height = 540; // Default 16:9
    
    if (aspectValue === '16:9') {
      width = 960; height = 540;
    } else if (aspectValue === '4:1') {
      width = 960; height = 240;
    } else if (aspectValue === '2.35:1') {
      width = 960; height = 408;
    } else if (aspectValue === '1:1') {
      width = 540; height = 540;
    } else if (aspectValue.includes(':')) {
      const [w, h] = aspectValue.split(':').map(Number);
      const scale = 960 / w;
      width = 960;
      height = Math.round(h * scale);
    }
    
    return {
      ratio: aspectValue,
      width: width,
      height: height
    };
  }

  /**
   * Step 4: Layout - Grid structure and styling
   */
  readLayoutStep(container) {
    // Find layout controls
    const rowsInput = container.querySelector('#lfxRows, [name="rows"], input[id*="rows"]');
    const colsInput = container.querySelector('#lfxColumns, [name="columns"], input[id*="columns"]');
    const gapInput = container.querySelector('#lfxGap, [name="gap"], input[id*="gap"]');
    const radiusInput = container.querySelector('#lfxCornerRadius, [name="cornerRadius"], input[id*="radius"]');
    
    // Background
    const bgModeSelect = container.querySelector('#lfxBgMode, [name="bgMode"]');
    const bgColorInput = container.querySelector('#lfxBgColor, [name="backgroundColor"], input[type="color"][id*="bg"]');
    
    // Texture
    const textureCheckbox = container.querySelector('#lfxTextureEnabled, [name="textureEnabled"]');
    const textureNameInput = container.querySelector('#lfxTextureName, [name="textureName"]');
    
    // Outline
    const outlineCheckbox = container.querySelector('#lfxOutlineEnabled, [name="outlineEnabled"]');
    const outlineColorInput = container.querySelector('#lfxOutlineColor, [name="outlineColor"], input[type="color"][id*="outline"]');
    const outlineWidthInput = container.querySelector('#lfxOutlineWidth, [name="outlineWidth"]');
    
    return {
      rows: parseInt(rowsInput?.value) || 1,
      columns: parseInt(colsInput?.value) || 3,
      gaps: {
        row: parseInt(gapInput?.value) || 10,
        col: parseInt(gapInput?.value) || 10
      },
      cornerRadius: parseInt(radiusInput?.value) || 8,
      background: {
        mode: bgModeSelect?.value || 'single',
        color: bgColorInput?.value || '#ffffff'
      },
      texture: {
        enabled: textureCheckbox?.checked || false,
        name: textureNameInput?.value || ''
      },
      outline: {
        enabled: outlineCheckbox?.checked !== false, // Default true
        color: outlineColorInput?.value || '#000000',
        width: parseInt(outlineWidthInput?.value) || 2
      }
    };
  }

  /**
   * Step 5: Text - Pill text content
   */
  readTextStep(container, candidate) {
    // Find text content inputs
    const textInputs = container.querySelectorAll('[name="pillText"], [id*="text"], .pill-text-input');
    const pills = [];
    
    if (textInputs.length > 0) {
      textInputs.forEach((input, index) => {
        const content = input.value || '';
        const alignment = input.dataset?.alignment || 'center';
        
        pills.push({
          index: index,
          content: this.parseFieldTokens(content, candidate),
          rawContent: content,
          alignment: alignment
        });
      });
    } else {
      // Default: show candidate name
      const defaultText = candidate?.dst_lm_name || candidate?.dst_name || 'Unnamed';
      pills.push({
        index: 0,
        content: defaultText,
        rawContent: '{dst_lm_name}',
        alignment: 'center'
      });
    }
    
    return {
      pills: pills
    };
  }

  /**
   * Parse field tokens like {dst_lm_name} with actual values
   */
  parseFieldTokens(text, candidate) {
    if (!text || !candidate) return text || '';
    
    let parsed = text;
    
    // Replace common field tokens
    const tokens = {
      '{dst_lm_name}': candidate.dst_lm_name || '',
      '{dst_name}': candidate.dst_name || '',
      '{dist_m}': candidate.dist_m ? `${Math.round(candidate.dist_m)}m` : '',
      '{rel_bear}': candidate.rel_bear ? `${Math.round(candidate.rel_bear)}°` : '',
      '{category}': candidate.category || '',
      '{type}': candidate.type || ''
    };
    
    Object.keys(tokens).forEach(token => {
      parsed = parsed.replace(new RegExp(token.replace(/[{}]/g, '\\$&'), 'g'), tokens[token]);
    });
    
    return parsed || text;
  }

  /**
   * Step 6: Line - Callout line from label to anchor
   */
  readLineStep(container) {
    const lineCheckbox = container.querySelector('#lfxLineEnabled, [name="lineEnabled"]');
    const lineStyleSelect = container.querySelector('#lfxLineStyle, [name="lineStyle"]');
    const lineThicknessInput = container.querySelector('#lfxLineThickness, [name="lineThickness"]');
    const lineColorInput = container.querySelector('#lfxLineColor, [name="lineColor"], input[type="color"][id*="line"]');
    const lineOpacityInput = container.querySelector('#lfxLineOpacity, [name="lineOpacity"]');
    
    return {
      enabled: lineCheckbox?.checked !== false, // Default true
      style: lineStyleSelect?.value || 'straight',
      thickness: parseInt(lineThicknessInput?.value) || 2,
      color: lineColorInput?.value || '#000000',
      opacity: parseFloat(lineOpacityInput?.value) || 1.0
    };
  }

  /**
   * Step 7: Shape - Marker at candidate point
   */
  readShapeStep(container) {
    const shapeTypeSelect = container.querySelector('#lfxShapeType, [name="shapeType"]');
    const shapeSizeInput = container.querySelector('#lfxShapeSize, [name="shapeSize"]');
    const shapeFillInput = container.querySelector('#lfxShapeFill, [name="shapeFill"], input[type="color"][id*="shape"]');
    const shapeStrokeInput = container.querySelector('#lfxShapeStroke, [name="shapeStroke"]');
    const shapeStrokeWidthInput = container.querySelector('#lfxShapeStrokeWidth, [name="shapeStrokeWidth"]');
    
    return {
      type: shapeTypeSelect?.value || 'circle',
      size: parseInt(shapeSizeInput?.value) || 10,
      fill: shapeFillInput?.value || '#ffffff',
      stroke: shapeStrokeInput?.value || '#000000',
      strokeWidth: parseInt(shapeStrokeWidthInput?.value) || 2
    };
  }

  /**
   * Step 8: Position - Label placement strategy
   */
  readPositionStep(container) {
    const strategySelect = container.querySelector('#lfxPositionStrategy, [name="positionStrategy"]');
    const offsetXInput = container.querySelector('#lfxOffsetX, [name="offsetX"]');
    const offsetYInput = container.querySelector('#lfxOffsetY, [name="offsetY"]');
    const distanceInput = container.querySelector('#lfxDistance, [name="distance"]');
    
    return {
      strategy: strategySelect?.value || 'auto',
      offset: {
        x: parseInt(offsetXInput?.value) || 0,
        y: parseInt(offsetYInput?.value) || 0
      },
      distance: parseInt(distanceInput?.value) || 100
    };
  }

  /**
   * Step 9: Colours - All color controls
   */
  readColoursStep(container) {
    // Find all color inputs
    const bgColorInput = container.querySelector('[name="backgroundColor"], input[type="color"][id*="background"]');
    const textColorInput = container.querySelector('[name="textColor"], input[type="color"][id*="text"]');
    const outlineColorInput = container.querySelector('[name="outlineColor"], input[type="color"][id*="outline"]');
    const lineColorInput = container.querySelector('[name="lineColor"], input[type="color"][id*="line"]');
    const shapeFillInput = container.querySelector('[name="shapeFill"], input[type="color"][id*="shape"]');
    
    return {
      background: bgColorInput?.value || '#ffffff',
      text: textColorInput?.value || '#000000',
      outline: outlineColorInput?.value || '#000000',
      line: lineColorInput?.value || '#000000',
      shapeFill: shapeFillInput?.value || '#ffffff',
      shapeStroke: '#000000'
    };
  }

  /**
   * Step 10: Animation - Motion and attention cues
   */
  readAnimationStep(container) {
    const onShowSelect = container.querySelector('#lfxAnimationOnShow, [name="animationOnShow"]');
    const onHoverSelect = container.querySelector('#lfxAnimationOnHover, [name="animationOnHover"]');
    const durationInput = container.querySelector('#lfxAnimationDuration, [name="animationDuration"]');
    
    return {
      onShow: onShowSelect?.value || 'fade',
      onHover: onHoverSelect?.value || 'highlight',
      duration: parseFloat(durationInput?.value) || 0.3,
      enabled: true
    };
  }

  /**
   * Step 11: Layers - Render order and z-index
   */
  readLayersStep(container) {
    const zIndexInput = container.querySelector('#lfxZIndex, [name="zIndex"]');
    const interactionCheckbox = container.querySelector('#lfxInteraction, [name="interaction"]');
    
    return {
      zIndex: parseInt(zIndexInput?.value) || 100,
      interceptClicks: interactionCheckbox?.checked !== false,
      renderOrder: 'label-above-pano'
    };
  }

  /**
   * Get default configuration when builder not available
   */
  getDefaultConfig(candidate) {
    return {
      type: { itemType: 'label', candidateType: 'all', scope: 'all' },
      aspect: { ratio: '16:9', width: 960, height: 540 },
      layout: {
        rows: 1,
        columns: 1,
        gaps: { row: 10, col: 10 },
        cornerRadius: 8,
        background: { mode: 'single', color: '#ffffff' },
        texture: { enabled: false },
        outline: { enabled: true, color: '#000000', width: 2 }
      },
      text: {
        pills: [{
          index: 0,
          content: candidate?.dst_lm_name || candidate?.dst_name || 'Unnamed',
          rawContent: '{dst_lm_name}',
          alignment: 'center'
        }]
      },
      line: { enabled: true, style: 'straight', thickness: 2, color: '#000000', opacity: 1.0 },
      shape: { type: 'circle', size: 10, fill: '#ffffff', stroke: '#000000', strokeWidth: 2 },
      position: { strategy: 'auto', offset: { x: 0, y: 0 }, distance: 100 },
      colors: {
        background: '#ffffff',
        text: '#000000',
        outline: '#000000',
        line: '#000000',
        shapeFill: '#ffffff',
        shapeStroke: '#000000'
      },
      animation: { onShow: 'fade', onHover: 'highlight', duration: 0.3, enabled: true },
      layers: { zIndex: 100, interceptClicks: true, renderOrder: 'label-above-pano' },
      candidate: candidate
    };
  }
}

// Export singleton instance
export const labelFXConfigBuilder = new LabelFXConfigBuilder();
