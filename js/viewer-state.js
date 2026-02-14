/**
 * viewer-state.js
 * Centralized state management for Todi Viewer v14
 * 
 * This module provides the single source of truth for all viewer state.
 * Separates data truth (candidates) from visual subset (markers).
 */

// ========== STATE MODEL ==========
const ViewerState = {
  // Data
  sources: [],          // All panos/vistas
  currentIndex: 0,      // Active pano index
  
  // LabelFX
  labelFxSets: {},      // { setId: { name, items: [...] } }
  activeLabelFxSetId: null,
  activeLabelFxItemId: null,
  
  // Per-item runtime state
  labelFxRuntime: {
    // [itemId]: {
    //   matchedIndices: [],   // Indices into currentSource().candidates
    //   matchPtr: 0,          // Current focused match index
    //   previewSprite: null   // THREE.js sprite for preview
    // }
  },
  
  // Builder state
  builderOpen: false,
  builderHistory: [],   // Undo/redo stack
  builderHistoryIndex: -1,
  
  // Selection/hover
  selectedCandidateIndex: null,  // Index into currentSource().candidates
  hoveredCandidateIndex: null,
  
  // Legacy compatibility
  currentMarkers: []    // Visual subset for rendering
};

// ========== HELPER FUNCTIONS ==========

/**
 * Get current source (panorama/vista)
 * @returns {Object|null} Current source object
 */
function currentSource() {
  return ViewerState.sources[ViewerState.currentIndex] || null;
}

/**
 * Get active LabelFX item
 * @returns {Object|null} Active LabelFX item
 */
function getActiveLabelFxItem() {
  if (!ViewerState.activeLabelFxItemId) return null;
  
  const setId = ViewerState.activeLabelFxSetId;
  if (!setId || !ViewerState.labelFxSets[setId]) return null;
  
  const set = ViewerState.labelFxSets[setId];
  return set.items.find(item => item.id === ViewerState.activeLabelFxItemId) || null;
}

/**
 * Get runtime state for active LabelFX item
 * @returns {Object|null} Runtime state object
 */
function getActiveRuntime() {
  const itemId = ViewerState.activeLabelFxItemId;
  if (!itemId) return null;
  
  return ViewerState.labelFxRuntime[itemId] || null;
}

/**
 * Get LabelFX item by ID
 * @param {string} itemId - Item ID
 * @returns {Object|null} LabelFX item
 */
function getLabelFxItem(itemId) {
  for (const setId in ViewerState.labelFxSets) {
    const set = ViewerState.labelFxSets[setId];
    const item = set.items.find(i => i.id === itemId);
    if (item) return item;
  }
  return null;
}

/**
 * Add a new LabelFX item to a set
 * @param {Object} item - LabelFX item to add
 * @param {string} setId - Set ID (optional, uses active set)
 */
function addLabelFxItem(item, setId = null) {
  setId = setId || ViewerState.activeLabelFxSetId || 'default';
  
  if (!ViewerState.labelFxSets[setId]) {
    ViewerState.labelFxSets[setId] = {
      name: 'Default Set',
      items: []
    };
  }
  
  ViewerState.labelFxSets[setId].items.push(item);
}

/**
 * Remove a LabelFX item
 * @param {string} itemId - Item ID to remove
 */
function removeLabelFxItem(itemId) {
  for (const setId in ViewerState.labelFxSets) {
    const set = ViewerState.labelFxSets[setId];
    const index = set.items.findIndex(i => i.id === itemId);
    if (index !== -1) {
      set.items.splice(index, 1);
      
      // Clean up runtime state
      delete ViewerState.labelFxRuntime[itemId];
      
      // Clear active if this was active
      if (ViewerState.activeLabelFxItemId === itemId) {
        ViewerState.activeLabelFxItemId = null;
      }
      
      return true;
    }
  }
  return false;
}

/**
 * Update a LabelFX item
 * @param {string} itemId - Item ID
 * @param {Object} updates - Properties to update
 */
function updateLabelFxItem(itemId, updates) {
  const item = getLabelFxItem(itemId);
  if (!item) return false;
  
  Object.assign(item, updates);
  return true;
}

/**
 * Generate a UUID for new items
 * @returns {string} UUID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Create default layout structure
 * @returns {Object} Default layout configuration
 */
function createDefaultLayout() {
  return {
    rows: [
      {
        id: generateUUID(),
        pills: [
          {
            id: generateUUID(),
            rule: 'candidateName',
            textStyle: {
              fontSize: 14,
              fontWeight: 900
            }
          }
        ]
      }
    ],
    globalStyle: {
      pillColor: 'rgba(0,0,0,0.75)',
      strokeColor: '#ffffff',
      strokeWidth: 2.5,
      textColor: '#ffffff',
      paddingTop: 12,
      paddingRight: 18,
      paddingBottom: 12,
      paddingLeft: 18
    }
  };
}

// ========== EXPORTS ==========

// Expose state and functions to window for debugging and module access
if (typeof window !== 'undefined') {
  window.ViewerState = ViewerState;
  window.currentSource = currentSource;
  window.getActiveLabelFxItem = getActiveLabelFxItem;
  window.getActiveRuntime = getActiveRuntime;
  window.getLabelFxItem = getLabelFxItem;
  window.addLabelFxItem = addLabelFxItem;
  window.removeLabelFxItem = removeLabelFxItem;
  window.updateLabelFxItem = updateLabelFxItem;
  window.generateUUID = generateUUID;
  window.createDefaultLayout = createDefaultLayout;
}

// ES6 module export
export {
  ViewerState,
  currentSource,
  getActiveLabelFxItem,
  getActiveRuntime,
  getLabelFxItem,
  addLabelFxItem,
  removeLabelFxItem,
  updateLabelFxItem,
  generateUUID,
  createDefaultLayout
};
