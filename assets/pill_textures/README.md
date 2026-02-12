# Pill Textures

This directory contains optional background textures for label pills in the LabelFX system.

## Purpose

These textures provide visual styling options for labels displayed in the panorama viewer. They are purely cosmetic and not required for core functionality.

## Status

Currently, these texture files are **optional and not included** in the repository to keep it lightweight. The viewer will function normally without them, falling back to solid color backgrounds.

## Expected Files

The following texture files can be added to enhance label styling:

- `White_Paper.png`
- `Yellowed_Paper.png`
- `Brown_Chiselled_Stone.png`
- `Boxed_Paper_Design.png`
- `White_Diagonal_Paper.png`
- `Yellowed_Diagonal_Paper.png`
- `Olive_White_Tiles.png`
- `Peach_Tiles.png`
- `Olive_Tiles.png`
- `Red_Small_Tiles.png`
- `Vertical_Green_Tiles.png`
- `Light_Green_Tiles.png`
- `Rock_Plaster.png`
- `Slim_White_Bricks.png`
- `Blue_Stone.png`
- `Blue_Print_Grid.png`
- `Folded_Grid.png`
- `Protractor_Grid.png`

## Adding Textures

To add custom textures:

1. Create PNG images (recommended size: 512x512 pixels or larger)
2. Place them in this directory with the exact filenames listed above
3. The viewer will automatically detect and load them on startup

## Format

- **Format**: PNG with transparency support
- **Size**: Any size (will be scaled to fit labels)
- **Type**: Tileable patterns work best for seamless appearance

## Fallback Behavior

When textures are missing, the viewer will:
- Log a warning to the console (for debugging)
- Continue normal operation
- Use solid color backgrounds for labels instead

This is expected behavior and does not indicate an error.
