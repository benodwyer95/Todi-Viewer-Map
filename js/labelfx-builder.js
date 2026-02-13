/**
 * labelfx-builder.js
 * LabelFX Builder UI and interaction logic
 */

import {
  ViewerState,
  currentSource,
  getActiveLabelFxItem,
  getActiveRuntime,
  addLabelFxItem,
  updateLabelFxItem,
  generateUUID,
  createDefaultLayout
} from './viewer-state.js';

import {
  computeMatchedIndices,
  onApplyFilter
} from './labelfx-core.js';

// ========== BUILDER LIFECYCLE ==========

/**
 * Open LabelFX Builder with auto-initialization
 */
export function openLabelFxBuilder() {
  // Show builder overlay
  ViewerState.builderOpen = true;
  document.body.classList.add('lfxBuilderOpen');
  
  const overlay = document.getElementById('labelFxBuilderOverlay');
  if (overlay) {
    overlay.style.display = 'block';
  }
  
  // Collapse docks (peek mechanism allows temporary reopen)
  if (typeof window.collapseDocks === 'function') {
    window.collapseDocks();
  }
  
  // Auto-initialize if no active item
  if (!ViewerState.activeLabelFxItemId) {
    createDefaultLabelItem();
  }
  
  const item = getActiveLabelFxItem();
  if (item) {
    // Apply filter to find matches
    onApplyFilter();
    
    // Render initial preview
    if (typeof window.renderBuilderPreview === 'function') {
      window.renderBuilderPreview();
    }
  }
  
  // Initialize undo/redo stack
  saveHistorySnapshot();
  
  // Update UI
  updateBuilderUI();
  
  console.log('[LabelFX Builder] Opened');
}

/**
 * Close LabelFX Builder
 */
export function closeLabelFxBuilder() {
  ViewerState.builderOpen = false;
  document.body.classList.remove('lfxBuilderOpen');
  
  const overlay = document.getElementById('labelFxBuilderOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
  
  // Restore docks
  if (typeof window.restoreDocks === 'function') {
    window.restoreDocks();
  }
  
  console.log('[LabelFX Builder] Closed');
}

/**
 * Create default 16:9 label item
 */
export function createDefaultLabelItem() {
  const defaultItem = {
    id: generateUUID(),
    name: 'New Label',
    type: 'label',
    filter: { mode: 'all' },
    aspectRatio: '16:9',
    layout: createDefaultLayout(),
    lineHeight: 40,
    pillPosition: 'top-center',
    showLine: true,
    showDisplayShape: true
  };
  
  addLabelFxItem(defaultItem);
  ViewerState.activeLabelFxItemId = defaultItem.id;
  
  console.log('[LabelFX Builder] Created default item:', defaultItem.id);
}

// ========== UI UPDATES ==========

/**
 * Update builder UI components
 */
export function updateBuilderUI() {
  updateLabelFxHeader();
  updateBuilderTabs();
  updateUndoRedoButtons();
}

/**
 * Update LabelFX header with match info
 */
export function updateLabelFxHeader() {
  const runtime = getActiveRuntime();
  const item = getActiveLabelFxItem();
  
  const headerInfo = document.getElementById('lfxHeaderInfo');
  const candCounter = document.getElementById('lfxCandCounter');
  const matchInfo = document.getElementById('lfxMatchInfo');
  
  if (!runtime || !item) {
    if (headerInfo) headerInfo.textContent = 'No active label';
    if (candCounter) candCounter.textContent = '0 / 0';
    if (matchInfo) matchInfo.textContent = 'No matches';
    return;
  }
  
  const matchCount = runtime.matchedIndices.length;
  const currentMatch = runtime.matchPtr + 1;
  
  if (headerInfo) {
    headerInfo.textContent = `${item.name} • ${matchCount} matches`;
  }
  
  if (candCounter) {
    candCounter.textContent = `${currentMatch} / ${matchCount}`;
  }
  
  if (matchInfo) {
    const source = currentSource();
    if (source && matchCount > 0) {
      const candidateIndex = runtime.matchedIndices[runtime.matchPtr];
      const candidate = source.candidates[candidateIndex];
      const name = candidate?.dst_lm_name || candidate?.dst_id || 'Unknown';
      matchInfo.textContent = `${matchCount} matches / focused: "${name}"`;
    } else {
      matchInfo.textContent = `${matchCount} matches`;
    }
  }
}

/**
 * Update builder tab states
 */
function updateBuilderTabs() {
  // Implementation depends on specific tab system
  // Placeholder for now
}

// ========== UNDO/REDO SYSTEM ==========

/**
 * Save current item state to history
 */
export function saveHistorySnapshot() {
  const item = getActiveLabelFxItem();
  if (!item) return;
  
  // Deep clone current state
  const snapshot = JSON.parse(JSON.stringify(item));
  
  // Trim future history if we're not at the end
  ViewerState.builderHistory = ViewerState.builderHistory.slice(
    0,
    ViewerState.builderHistoryIndex + 1
  );
  
  // Add snapshot
  ViewerState.builderHistory.push(snapshot);
  ViewerState.builderHistoryIndex++;
  
  // Limit history size
  if (ViewerState.builderHistory.length > 50) {
    ViewerState.builderHistory.shift();
    ViewerState.builderHistoryIndex--;
  }
  
  updateUndoRedoButtons();
}

/**
 * Undo last change
 */
export function undo() {
  if (ViewerState.builderHistoryIndex <= 0) {
    console.log('[Undo] No more history to undo');
    return;
  }
  
  ViewerState.builderHistoryIndex--;
  const snapshot = ViewerState.builderHistory[ViewerState.builderHistoryIndex];
  
  restoreLabelFxItem(snapshot);
  
  if (typeof window.renderBuilderPreview === 'function') {
    window.renderBuilderPreview();
  }
  
  updateUndoRedoButtons();
  updateBuilderUI();
  
  console.log('[Undo] Restored state');
}

/**
 * Redo next change
 */
export function redo() {
  if (ViewerState.builderHistoryIndex >= ViewerState.builderHistory.length - 1) {
    console.log('[Redo] No more history to redo');
    return;
  }
  
  ViewerState.builderHistoryIndex++;
  const snapshot = ViewerState.builderHistory[ViewerState.builderHistoryIndex];
  
  restoreLabelFxItem(snapshot);
  
  if (typeof window.renderBuilderPreview === 'function') {
    window.renderBuilderPreview();
  }
  
  updateUndoRedoButtons();
  updateBuilderUI();
  
  console.log('[Redo] Restored state');
}

/**
 * Restore a LabelFX item from snapshot
 * @param {Object} snapshot - Item snapshot to restore
 */
function restoreLabelFxItem(snapshot) {
  if (!snapshot || !snapshot.id) return;
  
  // Update the item in state
  updateLabelFxItem(snapshot.id, snapshot);
}

/**
 * Update undo/redo button states
 */
export function updateUndoRedoButtons() {
  const undoBtn = document.getElementById('lfxUndoBtn');
  const redoBtn = document.getElementById('lfxRedoBtn');
  
  if (undoBtn) {
    undoBtn.disabled = ViewerState.builderHistoryIndex <= 0;
  }
  
  if (redoBtn) {
    redoBtn.disabled = ViewerState.builderHistoryIndex >= ViewerState.builderHistory.length - 1;
  }
}

// ========== LAYER ORDERING ==========

/**
 * Reorder layer in active item
 * @param {string} layerId - Layer ID to move
 * @param {number} newIndex - New index position
 */
export function reorderLayer(layerId, newIndex) {
  const item = getActiveLabelFxItem();
  if (!item || !item.layout || !item.layout.layers) return;
  
  const layers = item.layout.layers;
  const oldIndex = layers.findIndex(l => l.id === layerId);
  
  if (oldIndex === -1) return;
  
  // Move layer
  const [layer] = layers.splice(oldIndex, 1);
  layers.splice(newIndex, 0, layer);
  
  // Update zIndex values
  layers.forEach((l, i) => {
    l.zIndex = i;
  });
  
  saveHistorySnapshot();
  
  if (typeof window.renderBuilderPreview === 'function') {
    window.renderBuilderPreview();
  }
  
  console.log(`[ReorderLayer] Moved layer ${layerId} from ${oldIndex} to ${newIndex}`);
}

/**
 * Render label with proper layer ordering
 * @param {Object} config - Label configuration
 * @param {Object} candidate - Candidate object
 */
export function renderLabelWithLayers(config, candidate) {
  if (!config.layout || !config.layout.layers) {
    console.warn('[RenderLabelWithLayers] No layers defined');
    return;
  }
  
  const layers = [...config.layout.layers];
  
  // Sort layers by zIndex
  layers.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  
  // Render each layer
  layers.forEach(layer => {
    if (typeof window.createLayerSprite === 'function') {
      const sprite = window.createLayerSprite(layer, candidate);
      if (sprite) {
        sprite.renderOrder = 10000 + (layer.zIndex || 0);
        
        if (typeof window.labelGroup !== 'undefined' && window.labelGroup) {
          window.labelGroup.add(sprite);
        }
      }
    }
  });
}

// ========== DOCK PEEK MECHANISM ==========

/**
 * Toggle dock peek mode
 * @param {string} dockId - Dock ID ('overlay', 'verifier', etc.)
 */
export function toggleDockPeek(dockId) {
  const dock = document.getElementById(dockId + 'Dock');
  if (!dock) return;
  
  // Temporarily show dock without closing builder
  dock.classList.toggle('peek-mode');
  
  console.log(`[DockPeek] Toggled ${dockId} dock`);
}

/**
 * Close all dock peeks
 */
export function closeDockPeeks() {
  const docks = document.querySelectorAll('.peek-mode');
  docks.forEach(dock => {
    dock.classList.remove('peek-mode');
  });
  
  console.log('[DockPeek] Closed all peeks');
}

// ========== EVENT HANDLERS ==========

/**
 * Initialize builder event listeners
 */
export function initBuilderEventListeners() {
  // Apply Filter button
  const applyBtn = document.getElementById('lfxApplyFilterBtn');
  if (applyBtn) {
    applyBtn.addEventListener('click', onApplyFilter);
  }
  
  // Candidate navigation
  // NOTE: Event listeners are already attached in index_v14_REFACTORED.html
  // to prevent duplicate calls. If cycleCandidateNav is not available,
  // the HTML file will handle the navigation with fallback logic.
  const candPrevBtn = document.getElementById('lfxCandPrevBtn');
  const candNextBtn = document.getElementById('lfxCandNextBtn');
  
  // Check if listeners already attached (prevents double-click issue)
  if (candPrevBtn && !candPrevBtn.dataset.listenerAttached) {
    candPrevBtn.addEventListener('click', () => {
      if (typeof window.cycleCandidateNav === 'function') {
        window.cycleCandidateNav(-1);
      }
    });
    candPrevBtn.dataset.listenerAttached = 'true';
  }
  
  if (candNextBtn && !candNextBtn.dataset.listenerAttached) {
    candNextBtn.addEventListener('click', () => {
      if (typeof window.cycleCandidateNav === 'function') {
        window.cycleCandidateNav(1);
      }
    });
    candNextBtn.dataset.listenerAttached = 'true';
  }
  
  // Panorama navigation
  const panoPrevBtn = document.getElementById('lfxPanoPrevBtn');
  const panoNextBtn = document.getElementById('lfxPanoNextBtn');
  
  if (panoPrevBtn) {
    panoPrevBtn.addEventListener('click', () => {
      if (typeof window.prevSource === 'function') {
        window.prevSource();
      }
    });
  }
  
  if (panoNextBtn) {
    panoNextBtn.addEventListener('click', () => {
      if (typeof window.nextSource === 'function') {
        window.nextSource();
      }
    });
  }
  
  // Undo/Redo buttons
  const undoBtn = document.getElementById('lfxUndoBtn');
  const redoBtn = document.getElementById('lfxRedoBtn');
  
  if (undoBtn) {
    undoBtn.addEventListener('click', undo);
  }
  
  if (redoBtn) {
    redoBtn.addEventListener('click', redo);
  }
  
  // Close button
  const closeBtn = document.getElementById('lfxCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeLabelFxBuilder);
  }
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleBuilderKeydown);
  
  console.log('[LabelFX Builder] Event listeners initialized');
}

/**
 * Handle keyboard shortcuts in builder
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleBuilderKeydown(e) {
  if (!ViewerState.builderOpen) return;
  
  // "O" key: peek overlay dock
  if (e.key === 'o' || e.key === 'O') {
    toggleDockPeek('overlay');
    e.preventDefault();
  }
  
  // "V" key: peek verifier dock
  if (e.key === 'v' || e.key === 'V') {
    toggleDockPeek('verifier');
    e.preventDefault();
  }
  
  // "Esc" key: close all peeks
  if (e.key === 'Escape') {
    closeDockPeeks();
    e.preventDefault();
  }
  
  // Ctrl/Cmd + Z: Undo
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    undo();
    e.preventDefault();
  }
  
  // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
  if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
    redo();
    e.preventDefault();
  }
}

// ========== EXPORTS ==========

// Expose to window for non-module access
if (typeof window !== 'undefined') {
  window.openLabelFxBuilder = openLabelFxBuilder;
  window.closeLabelFxBuilder = closeLabelFxBuilder;
  window.createDefaultLabelItem = createDefaultLabelItem;
  window.updateLabelFxHeader = updateLabelFxHeader;
  window.saveHistorySnapshot = saveHistorySnapshot;
  window.undo = undo;
  window.redo = redo;
  window.updateUndoRedoButtons = updateUndoRedoButtons;
  window.reorderLayer = reorderLayer;
  window.renderLabelWithLayers = renderLabelWithLayers;
  window.toggleDockPeek = toggleDockPeek;
  window.closeDockPeeks = closeDockPeeks;
  window.initBuilderEventListeners = initBuilderEventListeners;
}
