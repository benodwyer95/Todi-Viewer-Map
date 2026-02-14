# Files to Download

## Complete List of Updated/Created Files

This document lists **all files** that have been created or modified in this branch.

### Branch Information

**Branch Name**: `copilot/refactor-state-management-3d-map`

**GitHub URL**: `https://github.com/benodwyer95/Todi-Viewer-Map/tree/copilot/refactor-state-management-3d-map`

---

## Essential JavaScript Files (Must Download)

These files contain the core functionality:

### 1. Main Application
- **`index_v14_REFACTORED.html`** - Main HTML file with all integrations

### 2. Label System (Core)
- **`js/label-preview.js`** (702 lines) - 3D label rendering, THREE.js integration
- **`js/labelfx-core.js`** - Core LabelFX functionality (modified)
- **`js/labelfx-config-builder.js`** (376 lines) - Config building from all builder steps

### 3. Interactive Sample Label
- **`js/live-label-preview.js`** (702 lines) - Interactive sample label preview in builder
- **`js/label-interactive.js`** (164 lines) - Click, drag, edit functionality
- **`js/label-history.js`** (151 lines) - Undo/redo system

### 4. Layout & Alignment
- **`js/label-layout-engine.js`** (343 lines) - Flexbox/grid-style alignment system
  - Main axis alignment (6 options)
  - Cross axis alignment (5 options)
  - Baseline alignment
  - Distribution algorithms

### 5. Existing Files (Modified)
- **`js/labelfx-builder.js`** - Builder UI functionality
- **`js/map-integration.js`** - Map integration
- **`js/viewer-state.js`** - State management

---

## How to Download

### Option 1: Clone the Branch (Recommended)

```bash
git clone https://github.com/benodwyer95/Todi-Viewer-Map.git
cd Todi-Viewer-Map
git checkout copilot/refactor-state-management-3d-map
```

### Option 2: Download Individual Files from GitHub

1. Go to: https://github.com/benodwyer95/Todi-Viewer-Map
2. Switch to branch: `copilot/refactor-state-management-3d-map`
3. Navigate to each file and download:
   - Click on file
   - Click "Raw" button
   - Save file (Ctrl+S or Cmd+S)

### Option 3: Download as ZIP

1. Go to: https://github.com/benodwyer95/Todi-Viewer-Map/tree/copilot/refactor-state-management-3d-map
2. Click green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file

---

## File Organization

After downloading, your directory structure should be:

```
Todi-Viewer-Map/
├── index_v14_REFACTORED.html
├── js/
│   ├── label-preview.js
│   ├── live-label-preview.js
│   ├── label-interactive.js
│   ├── label-history.js
│   ├── labelfx-config-builder.js
│   ├── label-layout-engine.js
│   ├── labelfx-core.js
│   ├── labelfx-builder.js
│   ├── map-integration.js
│   └── viewer-state.js
├── assets/
├── data/
├── images/
└── ... (other files)
```

---

## What Each File Does

### `index_v14_REFACTORED.html`
- Main HTML file
- Imports all modules
- Sets up viewer
- Initializes all systems

### `js/label-preview.js`
- Renders labels to canvas
- Creates THREE.js sprites
- Positions labels in 3D space
- Updates on candidate navigation
- Handles field tokens ({dst_lm_name}, etc.)

### `js/live-label-preview.js`
- Interactive sample label in builder
- Visual preview of layout
- Click, drag, edit pills
- Real-time updates as settings change
- Shows grid, gaps, alignment

### `js/label-interactive.js`
- Mouse event handling
- Click detection (raycasting)
- Drag to reposition
- Visual feedback (hover, selection)
- Cursor changes

### `js/label-history.js`
- Undo/redo functionality
- History stack (50 operations)
- State capture
- Button management
- Stack navigation

### `js/labelfx-config-builder.js`
- Reads values from all 11 builder steps
- Builds comprehensive label configuration
- Validates settings
- Maps UI to config object

### `js/label-layout-engine.js`
- Flexbox/grid-style layout calculations
- Main axis alignment (horizontal distribution)
- Cross axis alignment (vertical alignment)
- Baseline alignment algorithm
- Distribution (space-between, space-around, space-evenly)
- Gap handling

### `js/labelfx-core.js`
- Core LabelFX functionality
- Filter application
- Candidate navigation
- Camera panning
- Label update triggers

### `js/labelfx-builder.js`
- Builder UI
- Step navigation
- Input handling
- Event listeners

### `js/map-integration.js`
- Map integration
- Panorama switching
- Coordinate system

### `js/viewer-state.js`
- Global state management
- LabelFX items storage
- Runtime data

---

## Documentation Files (Optional but Helpful)

- **`INTERACTIVE_LABEL_SYSTEM.md`** - Interactive system guide
- **`LIVE_LABEL_PREVIEW_GUIDE.md`** - Sample preview guide
- **`LABEL_PREVIEW_MVP.md`** - MVP overview
- **`LABEL_NAVIGATION_FIXED_FINAL.md`** - Navigation fixes
- **`LABEL_PREVIEW_FIXED.md`** - THREE.js fixes
- Plus 10+ other documentation files

---

## Quick Verification

After downloading, verify files exist:

```bash
# Check JavaScript files
ls -l js/label-preview.js
ls -l js/live-label-preview.js
ls -l js/label-interactive.js
ls -l js/label-history.js
ls -l js/labelfx-config-builder.js
ls -l js/label-layout-engine.js

# Check main HTML
ls -l index_v14_REFACTORED.html
```

All should exist and have non-zero file sizes.

---

## Testing After Download

1. **Start Server**:
   ```bash
   python serve.py
   # or
   python -m http.server 8000
   ```

2. **Open in Browser**:
   ```
   http://localhost:8000/index_v14_REFACTORED.html
   ```

3. **Verify Label System**:
   - Open Label Builder
   - Apply filter (e.g., "Landmarks Only")
   - See label appear in panorama view
   - See sample label in builder
   - Click Cand > to navigate
   - Labels should update

4. **Check Console**:
   - Press F12
   - Look for initialization messages:
     ```
     [Label Preview] Manager initialized successfully
     [Layout Engine] Module loaded
     [Live Label Preview] Initialized
     ```

---

## Troubleshooting

### If files are missing:
- Ensure you're on the correct branch: `copilot/refactor-state-management-3d-map`
- Re-download from GitHub
- Check file paths match exactly

### If nothing works:
- Check browser console for errors (F12)
- Verify all JavaScript files loaded
- Ensure server is running
- Try hard refresh (Ctrl+Shift+R)

---

## Total Code Statistics

- **JavaScript Files**: 9 files
- **Total Lines**: ~2,500 lines
- **Documentation**: 15+ files
- **Features**: Complete label system with alignment

---

## Summary

**Minimum Required Files** (7):
1. index_v14_REFACTORED.html
2. js/label-preview.js
3. js/live-label-preview.js
4. js/label-interactive.js
5. js/labelfx-config-builder.js
6. js/label-layout-engine.js
7. js/labelfx-core.js

**Full System** (all 10 JS files + HTML)

**With Documentation** (all files in branch)

---

Last Updated: 2026-02-13
Branch: copilot/refactor-state-management-3d-map
