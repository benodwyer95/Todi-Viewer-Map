# Data File Guide for Todi Viewer

This guide explains the data files used by the Todi Panorama Viewer and how to configure them.

## Quick Answer: Which File Does the Code Use?

The viewer looks for data files in this **priority order**:

1. **`./data/candidates_sample.json`** ✅ (Included in repository - Demo data)
2. **`./pano_candidates_within2km_ALLTYPES__BAKED_OFFSETS.json`** (Your production data)
3. **`./data/pano_candidates_within2km_ALLTYPES_BAKED_OFFSETS.json`** (Alternative location)

**By default, the viewer uses the sample data** (`./data/candidates_sample.json`) which is included in the repository for demonstration purposes.

## Understanding "No Matches" Errors

If you see `[CycleCandidateNav] No matches to navigate`, it means:

1. **Data loaded successfully** but no candidates match the current filter criteria
2. **OR** the data file has no candidates for the current panorama
3. **This is NOT an error** - it's normal when filters exclude all candidates

## File Structure

### Expected JSON Format

Both the sample file and your production file should follow this structure:

```json
{
  "meta": {
    "notes": "Metadata about the data file"
  },
  "sources": [
    {
      "type": "pano",
      "id": "TPANO_1",
      "yaw_deg": 359.7,
      "sourcefile": "path/to/source/image.JPG",
      "image": "images/0001.JPG",
      "candidates": [
        {
          "dst_type": "landmark",
          "dst_id": "LMID_032",
          "azimuth": 245.19,
          "src_yaw": 359.7,
          "rel_bear": 245.49,
          "dist_m": 1692.39,
          "elev_ang_d": -0.104,
          "vis_pct": 85.46,
          "is_vis": 1,
          "LMID_": "LMID_032",
          "dst_lm_name": "Montesanto",
          "_landmark_cl": "building",
          "cand_key": "landmark:LMID_032"
        }
      ]
    }
  ]
}
```

### Key Fields Explained

**Source Level (Panorama):**
- `type`: Type of source (typically "pano")
- `id`: Unique identifier for the panorama
- `yaw_deg`: Camera yaw angle in degrees
- `sourcefile`: Original file path (for reference)
- `image`: Path to panorama image (relative to viewer)
- `candidates`: Array of visible landmarks/points

**Candidate Level (Landmarks):**
- `dst_type`: Type of destination (landmark, amenity, etc.)
- `dst_id`: Unique identifier for the landmark
- `dst_lm_name`: Human-readable name
- `azimuth`: Azimuth angle to landmark
- `rel_bear`: Relative bearing from camera
- `dist_m`: Distance in meters
- `elev_ang_d`: Elevation angle in degrees
- `vis_pct`: Visibility percentage (0-100)
- `is_vis`: Binary visibility flag (1 = visible, 0 = not visible)
- `_landmark_cl`: Landmark class/category

## Using Your Own Data

### Option 1: Replace Sample File (Recommended for Development)

1. Create your data file matching the structure above
2. Save it as `data/candidates_sample.json` (replaces the demo data)
3. The viewer will automatically use it

### Option 2: Add Production File (Recommended for Production)

1. Create your data file: `pano_candidates_within2km_ALLTYPES__BAKED_OFFSETS.json`
2. Place it in the **root directory** (same level as `index_v14_REFACTORED.html`)
3. The viewer will find it automatically

### Option 3: Custom Location

To use a custom location, modify the `DATA_PATHS` array in `index_v14_REFACTORED.html`:

```javascript
const DATA_PATHS = [
  './data/candidates_sample.json',
  './your-custom-path.json',                    // Add your custom path
  './pano_candidates_within2km_ALLTYPES__BAKED_OFFSETS.json'
];
```

## File Naming Convention

The production filename `pano_candidates_within2km_ALLTYPES__BAKED_OFFSETS.json` indicates:

- **pano_candidates**: Panorama candidate data
- **within2km**: Candidates within 2km radius
- **ALLTYPES**: All landmark/candidate types included
- **BAKED_OFFSETS**: Includes pre-computed offset corrections

Your file doesn't need to follow this exact naming if you place it in the `data/` directory as `candidates_sample.json`.

## Sample Data vs Production Data

### Sample Data (`data/candidates_sample.json`)
- ✅ **Included in repository**
- ✅ **Works out of the box**
- ✅ **Good for testing and development**
- ⚠️ Limited to demo panoramas
- File size: ~390KB (11,000+ lines)

### Production Data (Your File)
- ❌ **Not included in repository** (too large)
- ✅ **Your complete dataset**
- ✅ **All your panoramas and candidates**
- File size: Varies (typically several MB)

## Troubleshooting

### Error: "Could not load candidate data from any location"

**Problem**: No data file found in any expected location

**Solution**:
1. Check that `data/candidates_sample.json` exists
2. If using custom data, verify the filename and location
3. Check browser console for specific error messages

### Warning: "No matches to navigate"

**Problem**: Data loaded but no candidates match filters

**Solution**:
1. **Check your filters**: Visibility, Category, Landmarks, Distance settings
2. **Reset filters**: Set all to "All" or default values
3. **Verify data**: Open `data/candidates_sample.json` and check `candidates` array isn't empty
4. **Check panorama**: Switch to a different panorama that may have more candidates

### Console Shows: "JSON fetch failed: 404"

**Problem**: Specific file not found

**Solution**:
1. Check the file path in the error message
2. Verify the file exists at that location
3. Ensure filename spelling matches exactly (case-sensitive on some systems)

## Data Generation

If you need to create your own panorama candidate data:

1. **Format your data** to match the JSON structure above
2. **Calculate angles**: azimuth, relative bearing, elevation
3. **Compute visibility**: Use visibility percentage if available
4. **Save as JSON** with proper structure
5. **Test with sample**: Compare your structure to `candidates_sample.json`

## Integration with Viewer

The viewer loads data during initialization:

```javascript
// Code automatically tries multiple paths
async function init() {
  // Tries DATA_PATHS in order
  // First successful load wins
  // Clear error message if all fail
}
```

Once loaded, data is stored in:
- `DATA.sources` - Array of panorama sources
- `ViewerState.sources` - V14 state management
- `currentSource().candidates` - Candidates for active panorama

## Related Files

- **Images**: Place panorama images in `images/` directory
- **Overlays**: Optional overlay images in `images/Overlays/`
- **Offsets**: Export/import offset corrections as JSON

## Next Steps

1. ✅ Verify sample data loads: Open viewer and check console
2. ✅ Test with filters: Try different filter combinations
3. ✅ Add your data: Follow Option 1 or 2 above
4. ✅ Test your data: Verify panoramas load and candidates display

## Questions?

See also:
- `README.md` - General setup and usage
- `TROUBLESHOOTING.md` - Common issues and solutions
- `ARCHITECTURE_v14.md` - Technical architecture details
