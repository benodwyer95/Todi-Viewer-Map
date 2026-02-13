/**
 * Label History Manager
 * Manages undo/redo operations for label edits
 */

export class LabelHistory {
  constructor(maxStates = 50) {
    this.maxStates = maxStates;
    this.stack = [];
    this.currentIndex = -1;
    this.labelPreviewManager = null;
    
    console.log('[Label History] Manager initialized with max states:', maxStates);
  }
  
  setLabelPreviewManager(manager) {
    this.labelPreviewManager = manager;
  }
  
  captureState(description = 'Edit') {
    // Get current label state
    if (!this.labelPreviewManager) {
      console.warn('[Label History] No preview manager set');
      return;
    }
    
    const state = this.labelPreviewManager.getCurrentState();
    if (!state) {
      console.warn('[Label History] No state to capture');
      return;
    }
    
    // Remove any states after current index (when undoing then making new edit)
    if (this.currentIndex < this.stack.length - 1) {
      this.stack = this.stack.slice(0, this.currentIndex + 1);
    }
    
    // Add new state
    const stateEntry = {
      timestamp: Date.now(),
      description: description,
      state: JSON.parse(JSON.stringify(state)) // Deep clone
    };
    
    this.stack.push(stateEntry);
    
    // Limit stack size
    if (this.stack.length > this.maxStates) {
      this.stack.shift();
    } else {
      this.currentIndex++;
    }
    
    console.log('[Label History] State captured:', description, 'Stack size:', this.stack.length);
    this.updateButtonStates();
  }
  
  undo() {
    if (!this.canUndo()) {
      console.warn('[Label History] Cannot undo');
      return false;
    }
    
    this.currentIndex--;
    const state = this.stack[this.currentIndex].state;
    
    console.log('[Label History] Undo to state:', this.stack[this.currentIndex].description);
    
    if (this.labelPreviewManager) {
      this.labelPreviewManager.restoreState(state);
    }
    
    this.updateButtonStates();
    return true;
  }
  
  redo() {
    if (!this.canRedo()) {
      console.warn('[Label History] Cannot redo');
      return false;
    }
    
    this.currentIndex++;
    const state = this.stack[this.currentIndex].state;
    
    console.log('[Label History] Redo to state:', this.stack[this.currentIndex].description);
    
    if (this.labelPreviewManager) {
      this.labelPreviewManager.restoreState(state);
    }
    
    this.updateButtonStates();
    return true;
  }
  
  canUndo() {
    return this.currentIndex > 0;
  }
  
  canRedo() {
    return this.currentIndex < this.stack.length - 1;
  }
  
  clear() {
    this.stack = [];
    this.currentIndex = -1;
    console.log('[Label History] History cleared');
    this.updateButtonStates();
  }
  
  updateButtonStates() {
    // Update undo button
    const undoBtn = document.getElementById('lfxUndoBtn');
    if (undoBtn) {
      if (this.canUndo()) {
        undoBtn.disabled = false;
        undoBtn.style.opacity = '1';
      } else {
        undoBtn.disabled = true;
        undoBtn.style.opacity = '0.5';
      }
    }
    
    // Update redo button
    const redoBtn = document.getElementById('lfxRedoBtn');
    if (redoBtn) {
      if (this.canRedo()) {
        redoBtn.disabled = false;
        redoBtn.style.opacity = '1';
      } else {
        redoBtn.disabled = true;
        redoBtn.style.opacity = '0.5';
      }
    }
    
    console.log('[Label History] Button states updated - Can undo:', this.canUndo(), 'Can redo:', this.canRedo());
  }
  
  getStackInfo() {
    return {
      stackSize: this.stack.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      states: this.stack.map(s => s.description)
    };
  }
}

// Export for use as module
export default LabelHistory;
