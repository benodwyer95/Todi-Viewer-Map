# Troubleshooting: 404 Errors for JS Modules

## Your Issue

You're seeing these errors in your http-server logs:
```
[Thu Feb 12 2026] "GET /js/viewer-state.js" Error (404): "Not found"
[Thu Feb 12 2026] "GET /js/labelfx-core.js" Error (404): "Not found"
[Thu Feb 12 2026] "GET /js/labelfx-builder.js" Error (404): "Not found"
[Thu Feb 12 2026] "GET /js/map-integration.js" Error (404): "Not found"
```

## Why This Is Happening

Your local directory `E:\Portent Maps\Italy\Todi\Viewer_Mergesandbox` is **missing the `js/` folder** with the v14 JavaScript modules.

The v14 refactor introduced a modular architecture with 4 separate JavaScript files:
- `js/viewer-state.js`
- `js/labelfx-core.js`
- `js/labelfx-builder.js`
- `js/map-integration.js`

These files were committed to the `copilot/refactor-state-management-3d-map` branch, but your local copy doesn't have them yet.

## How to Fix It

### Option 1: Update Your Local Copy (Recommended)

**Step 1:** Open a terminal in your directory
```bash
cd "E:\Portent Maps\Italy\Todi\Viewer_Mergesandbox"
```

**Step 2:** Check which branch you're on
```bash
git branch
```

**Step 3:** Switch to the correct branch (if needed)
```bash
git checkout copilot/refactor-state-management-3d-map
```

**Step 4:** Pull the latest changes
```bash
git pull origin copilot/refactor-state-management-3d-map
```

**Step 5:** Verify the files are now present
```bash
dir js
# Should show: labelfx-builder.js, labelfx-core.js, map-integration.js, viewer-state.js
```

**Step 6:** Install dependencies
```bash
npm install
```

**Step 7:** Verify setup is complete
```bash
npm run verify
```

You should see:
```
✅ SETUP COMPLETE - All required files found!
```

**Step 8:** Start the server
```bash
npx http-server -p 8000
```

**Step 9:** Open in browser
```
http://127.0.0.1:8000/index_v14_REFACTORED.html
```

### Option 2: Use the v13 Viewer (Works Immediately)

If you need to view panoramas right now without updating, use the v13 viewer which doesn't require the js/ modules:

```
http://127.0.0.1:8000/index_FULL_FIXED_v13.html
```

This should work with your current files.

### Option 3: Fresh Clone

If git pull doesn't work, you can clone a fresh copy:

```bash
cd "E:\Portent Maps\Italy\Todi"
git clone https://github.com/benodwyer95/Todi-Viewer-Map.git Viewer_v14
cd Viewer_v14
git checkout copilot/refactor-state-management-3d-map
npm install
npm run verify
npx http-server -p 8000
```

Then open: `http://127.0.0.1:8000/index_v14_REFACTORED.html`

## Verification Checklist

After following the steps above, verify:
- [ ] `js/` directory exists in your local folder
- [ ] `js/` contains 4 files: viewer-state.js, labelfx-core.js, labelfx-builder.js, map-integration.js
- [ ] `node_modules/` directory exists
- [ ] `npm run verify` shows "✅ SETUP COMPLETE"
- [ ] Server starts without errors
- [ ] No 404 errors in browser console
- [ ] Panorama viewer visible in center of screen

## Still Having Issues?

If you still can't see the panorama after fixing the 404 errors:

1. **Check dock widths**: The panorama should be visible in the center (440px space between the left and right docks)

2. **Try collapsing docks**: Click the collapse buttons (⟨ or ⟩) on the dock headers to hide panels and see more of the panorama

3. **Check browser zoom**: Make sure your browser zoom is at 100%

4. **Open browser console**: Press F12 and check for any error messages

5. **Verify data files**: Make sure you have panorama data (JSON files) in the expected location

## Quick Command Reference

```bash
# Verify setup
npm run verify

# Install dependencies
npm install

# Start server (choose one)
python3 serve.py          # Python server
npm run serve             # Python server via npm
npx http-server -p 8000   # Node http-server

# Check git status
git status
git branch
git log --oneline -5

# List js/ files
dir js          # Windows
ls js/          # Mac/Linux
```

## Optional Asset Warnings (Not Errors)

You may see console warnings about missing asset files:

### Pill Textures (Optional)

```
Failed to load resource: assets/pill_textures/White_Paper.png
Failed to load texture: White Paper
```

**What it is**: Optional background textures for label styling in LabelFX

**Impact**: None - viewer works normally with solid color labels

**Fix (optional)**: Add custom texture PNG files to `assets/pill_textures/`. See `assets/pill_textures/README.md` for details.

### Overlay Files (Optional)

```
Failed to load resource: images/Overlays/DJI_xxx_edges_colour.png
Overlay load failed: ./images/Overlays/...
```

**What it is**: Optional overlay images for panorama visualization

**Impact**: None - panoramas display normally without overlays

**Fix (optional)**: Add overlay images to `images/Overlays/` directory matching your panorama filenames.

### "No matches to navigate" (Expected)

```
[CycleCandidateNav] No matches to navigate
```

**What it is**: Normal message when no candidates match current filter

**Impact**: None - this is expected behavior when filters exclude all candidates

**Common causes**:
1. **Filters too restrictive**: Visibility, Category, or Distance filters exclude all candidates
2. **No data loaded**: Data file missing or empty
3. **Wrong panorama**: Current panorama has no candidates in dataset

**Fix**:
1. **Reset filters**: Set Visibility to "All", Category to "All", Distance to max
2. **Check data file**: See `DATA_GUIDE.md` for which file is loaded
3. **Try different panorama**: Use Pano < / > buttons to switch views
4. **Verify data**: Check `data/candidates_sample.json` has candidates for this panorama

**Not an error**: This is normal operation indicating filters are working correctly

### Data File Not Found

```
Error: Could not load candidate data from any location
```

**Problem**: Viewer cannot find panorama candidate data

**Solution**: See **DATA_GUIDE.md** for complete details on:
- Which files the viewer looks for
- Where to place your data files
- Expected JSON structure
- Sample vs production data

**Quick fix**:
1. Verify `data/candidates_sample.json` exists in repository
2. Check browser console for specific file paths tried
3. Ensure you're running from correct directory

### Wrong Data File Being Used

**Problem**: Confused about which candidates file is loaded

**Answer**: 
The viewer tries these files in order:
1. `./data/candidates_sample.json` (demo data, included)
2. `./pano_candidates_within2km_ALLTYPES__BAKED_OFFSETS.json` (your production data)
3. `./data/pano_candidates_within2km_ALLTYPES_BAKED_OFFSETS.json` (alternative)

**See**: `DATA_GUIDE.md` for complete explanation and configuration options

## Need More Help?

See the full troubleshooting guide in README.md or run:
```bash
npm run verify
```

This will give you specific instructions for any missing files or configuration issues.

## Related Documentation

- `DATA_GUIDE.md` - Complete guide to data files and structure
- `README.md` - General setup and usage
- `ARCHITECTURE_v14.md` - Technical architecture details
