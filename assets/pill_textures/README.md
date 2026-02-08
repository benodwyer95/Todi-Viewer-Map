# Pill Texture Assets

This directory contains 18 texture PNG files for pill backgrounds.

## Required Files

Place the following texture files in this directory:

1. `White_Paper.png`
2. `Yellowed_Paper.png`
3. `Brown_Chiselled_Stone.png`
4. `Boxed_Paper_Design.png`
5. `White_Diagonal_Paper.png`
6. `Yellowed_Diagonal_Paper.png`
7. `Olive_White_Tiles.png`
8. `Peach_Tiles.png`
9. `Olive_Tiles.png`
10. `Red_Small_Tiles.png`
11. `Vertical_Green_Tiles.png`
12. `Light_Green_Tiles.png`
13. `Rock_Plaster.png`
14. `Slim_White_Bricks.png`
15. `Blue_Stone.png`
16. `Blue_Print_Grid.png`
17. `Folded_Grid.png`
18. `Protractor_Grid.png`

## Source Location

User's local texture files are located at:
`E:\Portent Maps\Italy\Todi\Viewer_Mergesandbox\Pill Textured PNGs`

Copy these files to this directory for the texture system to work properly.

## Usage

Textures are loaded and cached by the application on startup. They can be applied to individual pills with controls for:
- Opacity (0-100%)
- Scale (0.1-5.0)
- X/Y offset (-500 to +500 pixels)
- Fit mode (cover | contain | repeat | stretch)

Textures are clipped to the pill shape (rounded rectangle) for a seamless look.
