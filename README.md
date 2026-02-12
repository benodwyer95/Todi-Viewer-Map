# Todi Viewer Map v14

A panoramic viewer with 3D map integration for exploring landmark candidates in Todi, Italy.

## Features

- **v14 Refactored Architecture**: Modular ES6 modules for state management
- **LabelFX System**: Rule-based template system for labeling candidates
- **3D Map Integration**: Event-driven communication for map synchronization
- **State Management**: Centralized ViewerState with runtime tracking
- **Undo/Redo**: Full history system for builder changes

## Installation

### Prerequisites

- Node.js (for npm)
- Python 3 (for local server)

### Setup

1. **Clone the repository and switch to the v14 branch**
   ```bash
   git clone https://github.com/benodwyer95/Todi-Viewer-Map.git
   cd Todi-Viewer-Map
   git checkout copilot/refactor-state-management-3d-map
   ```

2. **Verify setup (recommended)**
   ```bash
   npm run verify
   # or: node verify-setup.cjs
   ```
   
   This checks if all required files are present.

3. **Install dependencies**
   ```bash
   npm install
   ```
   
   This installs Three.js and other required JavaScript libraries.

4. **Start the local server**
   ```bash
   python3 serve.py
   ```
   
   Or use npm script:
   ```bash
   npm run serve
   ```
   
   Or use http-server:
   ```bash
   npx http-server -p 8000
   ```

5. **Open in browser**
   Navigate to: `http://127.0.0.1:8000/index_v14_REFACTORED.html`

## Architecture

The v14 refactor introduces a modular architecture:

```
js/
├── viewer-state.js       - Centralized state management
├── labelfx-core.js       - Filter logic and match computation
├── labelfx-builder.js    - Builder UI and interactions
└── map-integration.js    - Event system for map communication
```

See `ARCHITECTURE_v14.md` for detailed documentation.

## Files

- `index_v14_REFACTORED.html` - Main v14 viewer (recommended)
- `index_FULL_FIXED_v13.html` - Legacy v13 viewer (backup)
- `serve.py` - Simple HTTP server for local development

## Development

### Running the Viewer

The viewer requires serving over HTTP (not file://) due to ES6 module imports and CORS restrictions.

```bash
# Start server
python3 serve.py

# Or with npm
npm run serve

# Access at
# http://127.0.0.1:8000/index_v14_REFACTORED.html
```

### Module Structure

All v14 modules use ES6 imports/exports and expose key functions to `window` for backward compatibility:

```javascript
// Import in HTML
import { ViewerState, currentSource } from './js/viewer-state.js';

// Access globally
window.ViewerState
window.currentSource()
```

## Troubleshooting

### Setup Verification

Run the verification script to check your environment:
```bash
npm run verify
# or: node verify-setup.cjs
```

This will check for:
- ✅ `js/` directory with all 4 module files
- ✅ `node_modules/` with Three.js installed
- ✅ Required HTML and configuration files

### 404 Errors for JS Modules

**Problem**: Browser console shows 404 errors for `viewer-state.js`, `labelfx-core.js`, etc.

**Symptoms**:
```
[Thu Feb 12 2026] "GET /js/viewer-state.js" Error (404): "Not found"
[Thu Feb 12 2026] "GET /js/labelfx-core.js" Error (404): "Not found"
```

**Root Cause**: Your local directory is missing the `js/` folder with the v14 modules.

**Solution**:
1. Verify you're on the correct branch:
   ```bash
   git branch
   # Should show: * copilot/refactor-state-management-3d-map
   ```

2. If on wrong branch, checkout the correct one:
   ```bash
   git checkout copilot/refactor-state-management-3d-map
   ```

3. Pull the latest changes:
   ```bash
   git pull origin copilot/refactor-state-management-3d-map
   ```

4. Verify the `js/` directory exists:
   ```bash
   ls js/
   # Should show: labelfx-builder.js  labelfx-core.js  map-integration.js  viewer-state.js
   ```

5. If files still missing, run the verification script:
   ```bash
   npm run verify
   ```

**Alternative**: Use the v13 viewer (doesn't require modules):
```
http://127.0.0.1:8000/index_FULL_FIXED_v13.html
```

### Missing node_modules

**Problem**: Three.js not found

**Solution**: 
```bash
npm install
```

The `node_modules` directory is excluded by `.gitignore` and must be installed locally.

### Panorama Not Visible

**Problem**: Docks cover the entire view, panorama not visible

**Solutions**:
1. **Reduce browser zoom**: If viewing at high zoom (>100%), reduce to 100%
2. **Collapse docks**: Click the collapse buttons (⟨ or ⟩) to hide panels
3. **Check dock widths**: Panorama should be visible in the center (440px space)
4. **Verify branch**: Make sure you're on `copilot/refactor-state-management-3d-map` branch with the layout fixes

### Server Not Starting

**Problem**: Server won't start on port 8000

**Solutions**:
```bash
# Check if port is in use
lsof -i :8000  # Unix/Mac
netstat -ano | findstr :8000  # Windows

# Try a different port
npx http-server -p 8080
python3 serve.py  # Uses port 8000 by default
```

Ensure Python 3 is installed:
```bash
python3 --version
```

### Cannot See Panorama Data

**Problem**: Viewer loads but shows "No sources found" or empty panorama

**Solution**: Ensure your data JSON file exists in the expected location:
- Check for `data/` directory with panorama data
- Verify JSON file path in the viewer HTML
- Check browser console for JSON loading errors

## Documentation

- `ARCHITECTURE_v14.md` - Complete architecture guide
- `package.json` - Dependencies and scripts
- Inline JSDoc comments in all modules

## License

See LICENSE file for details.
