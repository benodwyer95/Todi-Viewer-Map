/**
 * map-integration.js
 * Event system for viewer ↔ map communication
 * 
 * This module provides the foundation for 3D map integration by exposing
 * an event-driven API for bidirectional communication.
 */

import {
  ViewerState,
  currentSource
} from './viewer-state.js';

// ========== EVENT SYSTEM ==========

/**
 * Event system for viewer ↔ map communication
 */
const ViewerEvents = new EventTarget();

// ========== VIEWER → MAP EVENTS ==========

/**
 * Emit candidate selected event
 * @param {number} candidateIndex - Index into candidates array
 * @param {Object} candidate - Candidate object
 * @param {Object} source - Source panorama
 */
export function emitCandidateSelected(candidateIndex, candidate, source) {
  const event = new CustomEvent('candidateSelected', {
    detail: {
      candidateIndex,
      candidate,
      source
    }
  });
  
  ViewerEvents.dispatchEvent(event);
  
  console.log('[Map Integration] Candidate selected:', candidate?.dst_lm_name || candidate?.dst_id);
}

/**
 * Emit panorama changed event
 * @param {Object} source - New source panorama
 */
export function emitPanoramaChanged(source) {
  const event = new CustomEvent('panoramaChanged', {
    detail: {
      source
    }
  });
  
  ViewerEvents.dispatchEvent(event);
  
  console.log('[Map Integration] Panorama changed:', source?.id);
}

/**
 * Emit label applied event
 * @param {Object} item - LabelFX item
 * @param {Array<number>} matches - Array of matched candidate indices
 */
export function emitLabelApplied(item, matches) {
  const event = new CustomEvent('labelApplied', {
    detail: {
      item,
      matches
    }
  });
  
  ViewerEvents.dispatchEvent(event);
  
  console.log('[Map Integration] Label applied:', item?.name, matches?.length, 'matches');
}

// ========== MAP → VIEWER EVENTS ==========

/**
 * Focus landmark from map click
 * @param {string} landmarkId - Landmark ID (dst_id or LMID_)
 */
export function focusLandmarkFromMap(landmarkId) {
  console.log('[Viewer] Map clicked landmark:', landmarkId);
  
  // 1. Find all panoramas that see this landmark
  const panoramasWithLandmark = ViewerState.sources.filter(source =>
    source.candidates && source.candidates.some(c => 
      c.dst_id === landmarkId || c.LMID_ === landmarkId
    )
  );
  
  if (!panoramasWithLandmark.length) {
    console.warn('[Viewer] No panoramas found for landmark:', landmarkId);
    return;
  }
  
  // 2. Pick best panorama (highest visibility, closest distance)
  const best = panoramasWithLandmark.sort((a, b) => {
    const candA = a.candidates.find(c => c.dst_id === landmarkId || c.LMID_ === landmarkId);
    const candB = b.candidates.find(c => c.dst_id === landmarkId || c.LMID_ === landmarkId);
    
    const visA = getCandidateVisPct(candA);
    const visB = getCandidateVisPct(candB);
    
    return visB - visA;
  })[0];
  
  // 3. Switch to that panorama
  const index = ViewerState.sources.indexOf(best);
  if (typeof window.setSourceByIndex === 'function') {
    window.setSourceByIndex(index);
  } else {
    ViewerState.currentIndex = index;
  }
  
  // 4. Focus the landmark candidate
  const candidate = best.candidates.find(c => c.dst_id === landmarkId || c.LMID_ === landmarkId);
  const candidateIndex = best.candidates.indexOf(candidate);
  
  ViewerState.selectedCandidateIndex = candidateIndex;
  
  if (typeof window.focusCandidate === 'function') {
    window.focusCandidate(candidateIndex);
  }
  
  // 5. Apply active label if exists
  if (ViewerState.activeLabelFxItemId && typeof window.renderPreview === 'function') {
    window.renderPreview();
  }
  
  console.log('[Viewer] Focused landmark:', landmarkId, 'in panorama:', best.id);
}

/**
 * Get candidate visibility percentage
 * @param {Object} candidate - Candidate object
 * @returns {number} - Visibility percentage (0-100)
 */
function getCandidateVisPct(candidate) {
  if (!candidate) return 0;
  
  if (typeof candidate.vis_pct === 'number') {
    return candidate.vis_pct;
  }
  
  if (typeof candidate.is_vis === 'number' && candidate.is_vis === 1) {
    return 100;
  }
  
  return 0;
}

// ========== EVENT LISTENER SETUP ==========

/**
 * Setup example event listeners for map integration
 * These demonstrate how a map module would listen to viewer events
 */
export function setupMapEventListeners() {
  // Map listens: highlight landmark, pan to location
  ViewerEvents.addEventListener('candidateSelected', (e) => {
    const { candidateIndex, candidate, source } = e.detail;
    // Map implementation would highlight the landmark here
    console.log('[Map Listener] Candidate selected:', candidate);
  });
  
  // Map listens: update camera position marker
  ViewerEvents.addEventListener('panoramaChanged', (e) => {
    const { source } = e.detail;
    // Map implementation would update camera marker here
    console.log('[Map Listener] Panorama changed:', source.id);
  });
  
  // Map listens: update label overlay on map
  ViewerEvents.addEventListener('labelApplied', (e) => {
    const { item, matches } = e.detail;
    // Map implementation would update labels here
    console.log('[Map Listener] Label applied:', item.name, matches.length);
  });
  
  console.log('[Map Integration] Event listeners setup complete');
}

/**
 * Setup listener for map landmark clicks
 * This demonstrates how viewer would listen to map events
 */
export function setupViewerEventListeners() {
  window.addEventListener('mapLandmarkClicked', (e) => {
    const { landmarkId } = e.detail;
    focusLandmarkFromMap(landmarkId);
  });
  
  console.log('[Map Integration] Viewer event listeners setup complete');
}

// ========== INITIALIZATION ==========

/**
 * Initialize map integration system
 */
export function initMapIntegration() {
  setupMapEventListeners();
  setupViewerEventListeners();
  
  console.log('[Map Integration] System initialized');
}

// ========== EXPORTS ==========

// Expose to window for map module access
if (typeof window !== 'undefined') {
  window.ViewerEvents = ViewerEvents;
  window.focusLandmarkFromMap = focusLandmarkFromMap;
  window.emitCandidateSelected = emitCandidateSelected;
  window.emitPanoramaChanged = emitPanoramaChanged;
  window.emitLabelApplied = emitLabelApplied;
  window.initMapIntegration = initMapIntegration;
}

export {
  ViewerEvents
};
