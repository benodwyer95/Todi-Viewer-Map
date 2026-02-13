/**
 * Label Interactive Manager
 * Handles mouse interaction with label sprites for selection and dragging
 */

export class LabelInteractiveManager {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.raycaster = new window.THREE.Raycaster();
    this.mouse = new window.THREE.Vector2();
    
    this.selectedSprite = null;
    this.isDragging = false;
    this.dragStartMouse = new window.THREE.Vector2();
    this.dragStartPosition = new window.THREE.Vector3();
    
    this.labelPreviewManager = null;
    this.labelHistory = null;
    
    this.setupEventListeners();
    console.log('[Label Interactive] Manager initialized');
  }
  
  setLabelPreviewManager(manager) {
    this.labelPreviewManager = manager;
  }
  
  setLabelHistory(history) {
    this.labelHistory = history;
  }
  
  setupEventListeners() {
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false);
    this.domElement.addEventListener('click', this.onClick.bind(this), false);
    
    console.log('[Label Interactive] Event listeners attached');
  }
  
  updateMousePosition(event) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }
  
  onClick(event) {
    if (this.isDragging) {
      return; // Don't process click if we were dragging
    }
    
    this.updateMousePosition(event);
    this.checkLabelIntersection();
  }
  
  onMouseDown(event) {
    if (event.button !== 0) return; // Only left click
    
    this.updateMousePosition(event);
    
    // Check if clicking on a label
    const sprite = this.checkLabelIntersection();
    if (sprite) {
      event.preventDefault();
      event.stopPropagation();
      
      this.selectedSprite = sprite;
      this.isDragging = true;
      this.dragStartMouse.copy(this.mouse);
      this.dragStartPosition.copy(sprite.position);
      
      // Capture state for undo
      if (this.labelHistory) {
        this.labelHistory.captureState('Drag label');
      }
      
      console.log('[Label Interactive] Started dragging label');
      
      // Change cursor
      this.domElement.style.cursor = 'move';
    }
  }
  
  onMouseMove(event) {
    this.updateMousePosition(event);
    
    if (this.isDragging && this.selectedSprite) {
      event.preventDefault();
      
      // Calculate movement in screen space
      const deltaX = this.mouse.x - this.dragStartMouse.x;
      const deltaY = this.mouse.y - this.dragStartMouse.y;
      
      // Convert to world space movement
      // Scale factor based on distance from camera
      const distance = this.camera.position.distanceTo(this.selectedSprite.position);
      const scaleFactor = distance * 2; // Adjust this for sensitivity
      
      // Update sprite position
      this.selectedSprite.position.x = this.dragStartPosition.x + deltaX * scaleFactor;
      this.selectedSprite.position.y = this.dragStartPosition.y + deltaY * scaleFactor;
      
      console.log('[Label Interactive] Dragging to:', this.selectedSprite.position);
    } else {
      // Check for hover
      const sprite = this.checkLabelIntersection();
      if (sprite) {
        this.domElement.style.cursor = 'pointer';
      } else if (!this.isDragging) {
        this.domElement.style.cursor = 'default';
      }
    }
  }
  
  onMouseUp(event) {
    if (this.isDragging) {
      console.log('[Label Interactive] Finished dragging');
      
      // Save the new position to label config
      if (this.selectedSprite && this.labelPreviewManager) {
        const pos = this.selectedSprite.position;
        console.log('[Label Interactive] Label position updated:', {x: pos.x, y: pos.y, z: pos.z});
        
        // Trigger label config update through preview manager
        if (this.labelPreviewManager.updateLabelPosition) {
          this.labelPreviewManager.updateLabelPosition(pos);
        }
      }
      
      this.isDragging = false;
      this.domElement.style.cursor = 'default';
    }
  }
  
  checkLabelIntersection() {
    if (!this.labelPreviewManager || !this.labelPreviewManager.currentSprite) {
      if (this.isHovering) {
        this.isHovering = false;
        this.domElement.style.cursor = 'default';
      }
      return null;
    }
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Check intersection with current label sprite
    const sprite = this.labelPreviewManager.currentSprite;
    const intersects = this.raycaster.intersectObject(sprite, false);
    
    if (intersects.length > 0) {
      // Only log when hover state changes
      if (!this.isHovering) {
        console.log('[Label Interactive] Mouse entered label');
        this.isHovering = true;
        this.domElement.style.cursor = 'pointer';
      }
      this.selectedSprite = sprite;
      return sprite;
    } else {
      // Only log when leaving hover
      if (this.isHovering) {
        console.log('[Label Interactive] Mouse left label');
        this.isHovering = false;
        this.domElement.style.cursor = 'default';
      }
    }
    
    return null;
  }
  
  deselectLabel() {
    this.selectedSprite = null;
    this.isDragging = false;
    console.log('[Label Interactive] Label deselected');
  }
}

// Export for use as module
export default LabelInteractiveManager;
