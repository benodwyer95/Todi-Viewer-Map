/**
 * LabelLayoutEngine - Flexbox/Grid-style layout system for labels
 * Handles main axis, cross axis, and baseline alignment
 */

class LabelLayoutEngine {
  constructor() {
    console.log('[Layout Engine] Initialized');
  }

  /**
   * Calculate layout for pills based on alignment properties
   * @param {Object} config - Layout configuration
   * @param {Array} pills - Array of pill objects
   * @param {Object} container - Container dimensions {width, height}
   * @returns {Array} Pills with calculated positions
   */
  calculateLayout(config, pills, container) {
    console.log('[Layout Engine] Calculating layout');
    console.log('[Layout Engine] Config:', config);
    console.log('[Layout Engine] Pills:', pills.length);
    console.log('[Layout Engine] Container:', container);

    const {
      rows = 3,
      columns = 3,
      mainAxisAlignment = 'center',
      crossAxisAlignment = 'center',
      gaps = { row: 10, col: 10 }
    } = config;

    // Calculate cell dimensions
    const cellWidth = (container.width - (gaps.col * (columns - 1))) / columns;
    const cellHeight = (container.height - (gaps.row * (rows - 1))) / rows;

    console.log('[Layout Engine] Cell size:', cellWidth, 'x', cellHeight);

    // Group pills by row
    const rowGroups = this.groupByRow(pills, rows);

    // Calculate positions for each row
    const positionedPills = [];
    
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      const rowPills = rowGroups[rowIndex] || [];
      const rowY = rowIndex * (cellHeight + gaps.row);

      // Apply main axis alignment (horizontal)
      const rowPositions = this.applyMainAxisAlignment(
        rowPills,
        mainAxisAlignment,
        cellWidth,
        gaps.col,
        container.width
      );

      // Apply cross axis alignment (vertical)
      const alignedPills = this.applyCrossAxisAlignment(
        rowPills,
        rowPositions,
        crossAxisAlignment,
        cellHeight,
        rowY
      );

      positionedPills.push(...alignedPills);
    }

    // Apply baseline alignment if specified
    if (crossAxisAlignment === 'baseline') {
      console.log('[Layout Engine] Applying baseline alignment');
      this.applyBaselineAlignment(positionedPills);
    }

    console.log('[Layout Engine] Layout calculated:', positionedPills.length, 'pills positioned');
    return positionedPills;
  }

  /**
   * Group pills by row
   */
  groupByRow(pills, rows) {
    const groups = {};
    for (let i = 0; i < rows; i++) {
      groups[i] = [];
    }

    pills.forEach(pill => {
      const row = pill.row || 0;
      if (groups[row]) {
        groups[row].push(pill);
      }
    });

    return groups;
  }

  /**
   * Apply main axis alignment (horizontal distribution)
   */
  applyMainAxisAlignment(pills, alignment, cellWidth, gap, containerWidth) {
    console.log('[Layout Engine] Main axis alignment:', alignment);

    const positions = [];
    const totalPills = pills.length;

    switch (alignment) {
      case 'start':
        // Left aligned
        pills.forEach((pill, i) => {
          positions.push({
            ...pill,
            x: i * (cellWidth + gap)
          });
        });
        break;

      case 'center':
        // Centered
        const totalWidth = (totalPills * cellWidth) + ((totalPills - 1) * gap);
        const startX = (containerWidth - totalWidth) / 2;
        pills.forEach((pill, i) => {
          positions.push({
            ...pill,
            x: startX + i * (cellWidth + gap)
          });
        });
        break;

      case 'end':
        // Right aligned
        const endTotalWidth = (totalPills * cellWidth) + ((totalPills - 1) * gap);
        const endStartX = containerWidth - endTotalWidth;
        pills.forEach((pill, i) => {
          positions.push({
            ...pill,
            x: endStartX + i * (cellWidth + gap)
          });
        });
        break;

      case 'space-between':
        // Even distribution, no edge gaps
        if (totalPills === 1) {
          positions.push({ ...pills[0], x: (containerWidth - cellWidth) / 2 });
        } else {
          const availableSpace = containerWidth - (totalPills * cellWidth);
          const spaceBetween = availableSpace / (totalPills - 1);
          pills.forEach((pill, i) => {
            positions.push({
              ...pill,
              x: i * (cellWidth + spaceBetween)
            });
          });
        }
        break;

      case 'space-around':
        // Even distribution, half gaps at edges
        const aroundSpace = (containerWidth - (totalPills * cellWidth)) / totalPills;
        pills.forEach((pill, i) => {
          positions.push({
            ...pill,
            x: (aroundSpace / 2) + i * (cellWidth + aroundSpace)
          });
        });
        break;

      case 'space-evenly':
        // Even distribution, equal gaps everywhere
        const evenlySpace = (containerWidth - (totalPills * cellWidth)) / (totalPills + 1);
        pills.forEach((pill, i) => {
          positions.push({
            ...pill,
            x: evenlySpace + i * (cellWidth + evenlySpace)
          });
        });
        break;

      default:
        // Default to center
        pills.forEach((pill, i) => {
          positions.push({
            ...pill,
            x: i * (cellWidth + gap)
          });
        });
    }

    return positions;
  }

  /**
   * Apply cross axis alignment (vertical alignment)
   */
  applyCrossAxisAlignment(pills, positions, alignment, cellHeight, rowY) {
    console.log('[Layout Engine] Cross axis alignment:', alignment);

    return positions.map(pill => {
      let y = rowY;

      switch (alignment) {
        case 'start':
          // Top aligned
          y = rowY;
          break;

        case 'center':
          // Middle aligned
          y = rowY + (cellHeight - (pill.height || 40)) / 2;
          break;

        case 'end':
          // Bottom aligned
          y = rowY + cellHeight - (pill.height || 40);
          break;

        case 'baseline':
          // Baseline aligned (will be adjusted later)
          y = rowY + cellHeight / 2;
          break;

        case 'stretch':
          // Stretch to fill
          y = rowY;
          pill.height = cellHeight;
          break;

        default:
          y = rowY;
      }

      return {
        ...pill,
        y,
        width: pill.width || cellHeight * 2,
        height: pill.height || 40
      };
    });
  }

  /**
   * Apply baseline alignment to pills
   * Aligns text baselines across all pills
   */
  applyBaselineAlignment(pills) {
    console.log('[Layout Engine] Calculating baseline positions');

    // Measure baseline for each pill
    pills.forEach(pill => {
      const fontSize = pill.fontSize || 20;
      // Estimate baseline offset (roughly 75% of font size from top)
      pill.baselineOffset = fontSize * 0.75;
      console.log(`[Layout Engine] Pill "${pill.content}" baseline: ${pill.baselineOffset}px`);
    });

    // Find the maximum baseline offset
    const maxBaseline = Math.max(...pills.map(p => p.baselineOffset || 0));
    console.log('[Layout Engine] Common baseline at:', maxBaseline);

    // Adjust all pills to align their baselines
    pills.forEach(pill => {
      const adjustment = maxBaseline - (pill.baselineOffset || 0);
      pill.y += adjustment;
      console.log(`[Layout Engine] Adjusted pill "${pill.content}" by ${adjustment}px`);
    });

    console.log('[Layout Engine] Baseline alignment complete');
  }

  /**
   * Calculate text metrics for baseline alignment
   */
  measureTextBaseline(text, fontSize, fontFamily = 'Arial') {
    // Create temporary canvas for measurement
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `${fontSize}px ${fontFamily}`;
    
    const metrics = ctx.measureText(text);
    
    return {
      width: metrics.width,
      ascent: metrics.actualBoundingBoxAscent || fontSize * 0.75,
      descent: metrics.actualBoundingBoxDescent || fontSize * 0.25,
      height: fontSize
    };
  }

  /**
   * Apply edge alignment (left, right, top, bottom)
   */
  applyEdgeAlignment(pills, edge) {
    console.log('[Layout Engine] Applying edge alignment:', edge);

    switch (edge) {
      case 'left':
        const minX = Math.min(...pills.map(p => p.x));
        pills.forEach(pill => pill.x = minX);
        break;

      case 'right':
        const maxX = Math.max(...pills.map(p => p.x + p.width));
        pills.forEach(pill => pill.x = maxX - pill.width);
        break;

      case 'top':
        const minY = Math.min(...pills.map(p => p.y));
        pills.forEach(pill => pill.y = minY);
        break;

      case 'bottom':
        const maxY = Math.max(...pills.map(p => p.y + p.height));
        pills.forEach(pill => pill.y = maxY - pill.height);
        break;
    }

    console.log('[Layout Engine] Edge alignment applied');
  }

  /**
   * Calculate equal height for pills in a row
   */
  equalizeRowHeights(pills) {
    const maxHeight = Math.max(...pills.map(p => p.height || 40));
    pills.forEach(pill => {
      pill.height = maxHeight;
    });
    console.log('[Layout Engine] Equalized heights to:', maxHeight);
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LabelLayoutEngine;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.LabelLayoutEngine = LabelLayoutEngine;
}

console.log('[Layout Engine] Module loaded');
