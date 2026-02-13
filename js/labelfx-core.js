/**
 * labelfx-core.js
 * Core LabelFX functionality: filtering, matching, and rendering
 */

import {
  ViewerState,
  currentSource,
  getActiveLabelFxItem,
  getActiveRuntime,
  getLabelFxItem,
  generateUUID
} from './viewer-state.js';

// ========== FILTER LOGIC ==========

/**
 * Apply filter rules to candidates and return matched indices
 * @param {Array} candidates - Array from currentSource().candidates
 * @param {Object} filterConfig - Filter configuration from LabelFX item
 * @returns {Array<number>} - Indices of matched candidates
 */
export function computeMatchedIndices(candidates, filterConfig) {
  if (!candidates || !Array.isArray(candidates)) {
    return [];
  }
  
  if (!filterConfig || filterConfig.mode === 'all') {
    return candidates.map((_, i) => i);
  }
  
  const matched = [];
  candidates.forEach((cand, idx) => {
    const matches = matchesFilter(cand, filterConfig);
    
    if (filterConfig.mode === 'includeOnly' && matches) {
      matched.push(idx);
    } else if (filterConfig.mode === 'exclude' && !matches) {
      matched.push(idx);
    }
  });
  
  return matched;
}

/**
 * Test if a candidate matches filter rules
 * @param {Object} candidate - Candidate object
 * @param {Object} filterConfig - Filter configuration
 * @returns {boolean} - True if candidate matches
 */
export function matchesFilter(candidate, filterConfig) {
  if (!filterConfig.rules || filterConfig.rules.length === 0) {
    return true;
  }
  
  const combine = filterConfig.combine || 'or';
  
  if (combine === 'and') {
    return filterConfig.rules.every(rule => matchesRule(candidate, rule));
  } else {
    return filterConfig.rules.some(rule => matchesRule(candidate, rule));
  }
}

/**
 * Test if a candidate matches a single rule
 * @param {Object} candidate - Candidate object
 * @param {Object} rule - Rule configuration
 * @returns {boolean} - True if rule matches
 */
function matchesRule(candidate, rule) {
  const { field, operator, value, caseSensitive } = rule;
  
  // Get field value from candidate
  let fieldValue = getNestedValue(candidate, field);
  
  // Handle null/undefined
  if (fieldValue === null || fieldValue === undefined) {
    if (operator === 'exists') return false;
    if (operator === 'notExists') return true;
    if (operator === 'isEmpty') return true;
    return false;
  }
  
  // Convert to string for string operations
  let fieldStr = String(fieldValue);
  let valueStr = String(value);
  
  if (!caseSensitive) {
    fieldStr = fieldStr.toLowerCase();
    valueStr = valueStr.toLowerCase();
  }
  
  // Apply operator
  switch (operator) {
    case 'equals':
      return fieldStr === valueStr;
    
    case 'notEquals':
      return fieldStr !== valueStr;
    
    case 'contains':
      return fieldStr.includes(valueStr);
    
    case 'notContains':
      return !fieldStr.includes(valueStr);
    
    case 'startsWith':
      return fieldStr.startsWith(valueStr);
    
    case 'endsWith':
      return fieldStr.endsWith(valueStr);
    
    case 'regex':
      try {
        const flags = caseSensitive ? '' : 'i';
        const regex = new RegExp(valueStr, flags);
        return regex.test(fieldStr);
      } catch {
        return false;
      }
    
    case 'gt':
      return Number(fieldValue) > Number(value);
    
    case 'gte':
      return Number(fieldValue) >= Number(value);
    
    case 'lt':
      return Number(fieldValue) < Number(value);
    
    case 'lte':
      return Number(fieldValue) <= Number(value);
    
    case 'exists':
      return fieldValue !== null && fieldValue !== undefined;
    
    case 'notExists':
      return fieldValue === null || fieldValue === undefined;
    
    case 'isEmpty':
      return !fieldValue || String(fieldValue).trim() === '';
    
    case 'notEmpty':
      return fieldValue && String(fieldValue).trim() !== '';
    
    default:
      return false;
  }
}

/**
 * Get nested value from object using dot notation
 * @param {Object} obj - Object to query
 * @param {string} path - Dot-separated path (e.g., "user.name")
 * @returns {*} - Value at path
 */
function getNestedValue(obj, path) {
  if (!path) return obj;
  
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
}

// ========== APPLY FILTER ==========

/**
 * Handler for "Apply Filter" button in LabelFX Builder
 * This is the critical state transition
 */
export function onApplyFilter() {
  const item = getActiveLabelFxItem();
  if (!item) {
    console.warn('[ApplyFilter] No active LabelFX item');
    return;
  }
  
  const source = currentSource();
  if (!source || !source.candidates) {
    console.warn('[ApplyFilter] No source or candidates available');
    return;
  }
  
  // 1. Compute matches
  const matchedIndices = computeMatchedIndices(source.candidates, item.filter);
  
  // 2. Store runtime state
  ViewerState.labelFxRuntime[item.id] = {
    matchedIndices,
    matchPtr: 0,
    previewSprite: null
  };
  
  // 3. Update header UI
  if (typeof window.updateLabelFxHeader === 'function') {
    window.updateLabelFxHeader();
  }
  
  // 4. Focus first match if exists
  if (matchedIndices.length > 0) {
    focusMatchedCandidate(0);
    if (typeof window.renderPreview === 'function') {
      window.renderPreview();
    }
  } else {
    alert('No matches found for current filter');
  }
  
  console.log(`[ApplyFilter] ${matchedIndices.length} matches found for "${item.name}"`);
  
  return matchedIndices.length;
}

// ========== CANDIDATE NAVIGATION ==========

/**
 * Navigate to next/previous matched candidate
 * Called by Cand < / > buttons
 * @param {number} direction - 1 for next, -1 for previous
 */
export function cycleCandidateNav(direction) {
  const runtime = getActiveRuntime();
  if (!runtime || !runtime.matchedIndices || runtime.matchedIndices.length === 0) {
    console.warn('[CycleCandidateNav] No matches to navigate');
    return;
  }
  
  const newPtr = runtime.matchPtr + direction;
  
  // Wrap around
  if (newPtr < 0) {
    runtime.matchPtr = runtime.matchedIndices.length - 1;
  } else if (newPtr >= runtime.matchedIndices.length) {
    runtime.matchPtr = 0;
  } else {
    runtime.matchPtr = newPtr;
  }
  
  focusMatchedCandidate(runtime.matchPtr);
  
  if (typeof window.updateLabelFxHeader === 'function') {
    window.updateLabelFxHeader();
  }
  
  // Update builder match counter UI (pass item for multi-pano calculation)
  if (typeof window.updateBuilderMatchCounter === 'function') {
    const item = getActiveLabelFxItem();
    window.updateBuilderMatchCounter(runtime.matchPtr + 1, runtime.matchedIndices.length, item);
  }
  
  console.log(`[CycleCandidateNav] Now at match ${runtime.matchPtr + 1} of ${runtime.matchedIndices.length}`);
}

/**
 * Focus camera on matched candidate by index into matchedIndices
 * @param {number} matchPtr - Index into matchedIndices array
 */
export function focusMatchedCandidate(matchPtr) {
  const runtime = getActiveRuntime();
  if (!runtime || !runtime.matchedIndices) {
    console.warn('[FocusMatchedCandidate] No runtime state');
    return;
  }
  
  const candidateIndex = runtime.matchedIndices[matchPtr];
  const source = currentSource();
  if (!source) return;
  
  const candidate = source.candidates[candidateIndex];
  if (!candidate) {
    console.warn('[FocusMatchedCandidate] Candidate not found at index', candidateIndex);
    return;
  }
  
  // Calculate yaw/pitch for candidate
  const yawDeg = calculateYaw(candidate, source);
  const pitchDeg = calculatePitch(candidate, source);
  
  // Pan camera (if function exists)
  if (typeof window.setViewYawPitch === 'function') {
    window.setViewYawPitch(
      THREE.MathUtils.degToRad(yawDeg),
      THREE.MathUtils.degToRad(pitchDeg),
      true // smooth
    );
  }
  
  // Highlight selection
  ViewerState.selectedCandidateIndex = candidateIndex;
  
  // Expose for debugging
  window.__LFX_ACTIVE_CAND_IDX = candidateIndex;
  
  if (typeof window.highlightCandidate === 'function') {
    window.highlightCandidate(candidateIndex);
  }
  
  // Update preview label
  if (typeof window.updatePreviewLabel === 'function') {
    window.updatePreviewLabel(candidate);
  }
  
  console.log(`[FocusMatchedCandidate] Focused on candidate ${candidateIndex}:`, candidate.dst_lm_name || candidate.dst_id);
}

/**
 * Calculate yaw for a candidate
 * @param {Object} candidate - Candidate object
 * @param {Object} source - Source panorama
 * @returns {number} - Yaw in degrees
 */
function calculateYaw(candidate, source) {
  // Use baked yaw if available, otherwise calculate from rel_bear
  if (typeof candidate.baked_yaw_deg === 'number') {
    return candidate.baked_yaw_deg;
  }
  
  if (typeof candidate.rel_bear === 'number') {
    const srcYaw = source.yaw_deg || 0;
    return (candidate.rel_bear + srcYaw) % 360;
  }
  
  return 0;
}

/**
 * Calculate pitch for a candidate
 * @param {Object} candidate - Candidate object
 * @param {Object} source - Source panorama
 * @returns {number} - Pitch in degrees
 */
function calculatePitch(candidate, source) {
  // Use baked pitch if available, otherwise calculate from elev_ang_d
  if (typeof candidate.baked_pitch_deg === 'number') {
    return candidate.baked_pitch_deg;
  }
  
  if (typeof candidate.elev_ang_d === 'number') {
    return candidate.elev_ang_d;
  }
  
  return 0;
}

// ========== EXPORTS ==========

// Expose to window for non-module access
if (typeof window !== 'undefined') {
  window.computeMatchedIndices = computeMatchedIndices;
  window.matchesFilter = matchesFilter;
  window.onApplyFilter = onApplyFilter;
  window.cycleCandidateNav = cycleCandidateNav;
  window.focusMatchedCandidate = focusMatchedCandidate;
}
