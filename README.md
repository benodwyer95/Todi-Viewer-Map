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

1. **Clone the repository**
   ```bash
   git clone https://github.com/benodwyer95/Todi-Viewer-Map.git
   cd Todi-Viewer-Map
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   This installs Three.js and other required JavaScript libraries.

3. **Start the local server**
   ```bash
   python3 serve.py
   ```
   
   Or use npm script:
   ```bash
   npm run serve
   ```

4. **Open in browser**
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

### 404 Errors for JS Modules

**Problem**: Browser console shows 404 errors for `viewer-state.js`, `labelfx-core.js`, etc.

**Solution**: Run `npm install` to install dependencies, especially Three.js:
```bash
npm install
```

### Missing node_modules

The `node_modules` directory is excluded by `.gitignore` and must be installed locally:
```bash
npm install
```

### Server Not Starting

Ensure Python 3 is installed and port 8000 is available:
```bash
python3 --version
python3 serve.py
```

## Documentation

- `ARCHITECTURE_v14.md` - Complete architecture guide
- `package.json` - Dependencies and scripts
- Inline JSDoc comments in all modules

## License

See LICENSE file for details.
