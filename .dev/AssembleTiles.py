import os
import re
from PIL import Image
from PIL import ImageFile
import math
import sys 

# Allow loading large images by increasing the limit
Image.MAX_IMAGE_PIXELS = None
ImageFile.LOAD_TRUNCATED_IMAGES = True

def cut_image_to_tiles(image, output_dir, zoom_level, tile_size=256):
    """
    Cuts an image into tiles for a specific zoom level and saves them in z/x/y.png format.

    :param image: PIL Image object to be tiled.
    :param output_dir: Base output directory for tiles.
    :param zoom_level: Current zoom level for the tiles.
    :param tile_size: Size of each tile in pixels (default: 256).
    """
    image_width, image_height = image.size

    # Calculate the number of tiles in x and y directions
    tiles_x = math.ceil(image_width / tile_size)
    tiles_y = math.ceil(image_height / tile_size)

    # Create directory for the current zoom level
    zoom_dir = os.path.join(output_dir, str(zoom_level))
    os.makedirs(zoom_dir, exist_ok=True)

    # Generate tiles and save them
    for x in range(tiles_x):
        for y in range(tiles_y):
            # Calculate the coordinates for cropping
            left = x * tile_size
            upper = y * tile_size
            right = min((x + 1) * tile_size, image_width)
            lower = min((y + 1) * tile_size, image_height)

            # Crop the tile
            tile = image.crop((left, upper, right, lower))

            # Create subdirectory for x
            x_dir = os.path.join(zoom_dir, str(x))
            os.makedirs(x_dir, exist_ok=True)

            # Save tile as y.png
            tile_path = os.path.join(x_dir, f"{y}.png")
            tile.save(tile_path, format="PNG", optimize=True, compress_level=9)
            tile.close()

    print(f"Tiles for zoom level {zoom_level} saved to {zoom_dir}")

def generate_tiles_for_zoom_levels(image_path, output_dir, max_zoom=9, min_zoom=0, tile_size=256):
    """
    Generates tiles for all zoom levels from max_zoom down to min_zoom.

    :param image_path: Path to the original high-resolution image.
    :param output_dir: Base output directory for all zoom level tiles.
    :param max_zoom: Maximum zoom level (highest resolution).
    :param min_zoom: Minimum zoom level (lowest resolution).
    :param tile_size: Size of each tile in pixels (default: 256).
    """
    # Open the original image
    image = Image.open(image_path)
    base_width, base_height = image.size

    for zoom in range(max_zoom, min_zoom - 1, -1):
        # For each zoom level, generate tiles
        print(f"Processing zoom level {zoom}...")

        if zoom < max_zoom:
            # Scale down the image by 10% for each lower zoom level
            scale_factor = 2 ** (max_zoom - zoom)
            new_width =int( max(1, base_width // scale_factor))
            new_height = int(max(1, base_height // scale_factor))
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)

        cut_image_to_tiles(image, x, zoom, tile_size)


def resize_to_target_width(image, target_width):
    """Resize the image to a target width while maintaining aspect ratio."""
    print(f"Resize the image to a target width {target_width}...")
    original_width, original_height = image.size
    scale_factor = target_width / original_width
    target_height = int(original_height * scale_factor)
    resized_image = image.resize((target_width, target_height), Image.Resampling.LANCZOS)
    print(f"Done the image to a target width {target_width}...")
    return resized_image

heroes_image = r"D:\tools\Output\heroes.png"
# Directory containing the PNG tiles
tiles_dir = r"D:\tools\Output\Exports\AOC\Content\UI\MinimapImageTiles\Verra_World_Master"
# Pattern to extract x and y from filenames
filename_pattern = re.compile(r"TUI_s250000_x(-?\d+)_y(-?\d+)\.png")

# Create a dictionary for tile positions and file paths
tiles = {}

# Read and process each file in the directory
for file_name in os.listdir(tiles_dir):
    match = filename_pattern.match(file_name)
    if match:
        x, y = map(int, match.groups())
        file_path = os.path.join(tiles_dir, file_name)
        tiles[(x, y)] = file_path

# Determine the bounds of the assembled image
x_coords = [pos[0] for pos in tiles.keys()]
y_coords = [pos[1] for pos in tiles.keys()]
min_x, max_x = min(x_coords), max(x_coords)
min_y, max_y = min(y_coords), max(y_coords)

print(f"minX {min_x} and maxX {max_x}")
print(f"minY {min_y} and maxY {max_y}")

# Open a sample tile to get the tile dimensions
sample_tile = Image.open(next(iter(tiles.values())))
tile_width, tile_height = sample_tile.size
print(f"sample_tile.size= {sample_tile.size}")
# Calculate the size of the assembled image
assembled_width  =-(min_x) * tile_width
assembled_height =(max_y) * tile_height
print(f"assembled ({assembled_width} , {assembled_height})")
# Create a blank image for the assembled map
assembled_image = Image.new("RGBA", (assembled_width, assembled_height))


# Paste each tile into the correct position after rotating it
for (x, y), file_path in tiles.items():
    if os.path.exists(file_path):
        tile_image = Image.open(file_path)
        #print(f"Processing {file_path}")
        #print(f"x={x},y={y}")
        # Rotate the tile 90 degrees clockwise
        tile_image = tile_image.rotate(-90)  # Negative angle for clockwise rotation
        # Calculate paste position
        paste_x = assembled_width+(x) * tile_width
        paste_y = y* tile_height  # Flip Y to match the correct coordinate system
        #print(f"paste_x {paste_x} and paste_y {paste_y}")
        assembled_image.paste(tile_image, (paste_x, paste_y,paste_x+512,paste_y+512))

output_path = r"D:\tools\Output\TUI_s250000.png"
print(f"Saving assembled image to {output_path}")
assembled_image.save(output_path,format="PNG", optimize=True, compress_level=9)
print(f"Saved assembled image to {output_path}")
assembled_image.close()

# Pattern to extract x and y from filenames
filename_pattern = re.compile(r"TUI_s50000_x(-?\d+)_y(-?\d+)\.png")

# Create a dictionary for tile positions and file paths
tiles = {}

# Read and process each file in the directory
for file_name in os.listdir(tiles_dir):
    match = filename_pattern.match(file_name)
    if match:
        x, y = map(int, match.groups())
        file_path = os.path.join(tiles_dir, file_name)
        tiles[(x, y)] = file_path

# Determine the bounds of the assembled image
x_coords = [pos[0] for pos in tiles.keys()]
y_coords = [pos[1] for pos in tiles.keys()]
min_x, max_x = min(x_coords), max(x_coords)
min_y, max_y = min(y_coords), max(y_coords)

print(f"minX {min_x} and maxX {max_x}")
print(f"minY {min_y} and maxY {max_y}")

# Open a sample tile to get the tile dimensions
sample_tile = Image.open(next(iter(tiles.values())))
tile_width, tile_height = sample_tile.size
print(f"sample_tile.size= {sample_tile.size}")
# Calculate the size of the assembled image
assembled_width  =-(min_x) * tile_width
assembled_height =(max_y) * tile_height
print(f"assembled ({assembled_width} , {assembled_height})")
# Create a blank image for the assembled map
assembled_image = Image.new("RGBA", (assembled_width, assembled_height))


# Paste each tile into the correct position after rotating it
for (x, y), file_path in tiles.items():
    if os.path.exists(file_path):
        tile_image = Image.open(file_path)
        #print(f"Processing {file_path}")
        #print(f"x={x},y={y}")
        # Rotate the tile 90 degrees clockwise
        tile_image = tile_image.rotate(-90)  # Negative angle for clockwise rotation
        # Calculate paste position
        paste_x = assembled_width+(x) * tile_width
        paste_y = y* tile_height  # Flip Y to match the correct coordinate system
        #print(f"paste_x {paste_x} and paste_y {paste_y}")
        assembled_image.paste(tile_image, (paste_x, paste_y,paste_x+512,paste_y+512))

output_path = r"D:\tools\Output\TUI_s50000.png"
print(f"Saving assembled image to {output_path}")
assembled_image.save(output_path,format="PNG", optimize=True, compress_level=9)
print(f"Saved assembled image to {output_path}")

sys.exit("Exiting the program")

world_image = Image.open(heroes_image)
widthT, hightT= world_image.size
assembled_image = resize_to_target_width(assembled_image, int(widthT))
#widthT = assembled_image.size

world_image.paste(assembled_image,(0, 0))
output_path = r"D:\tools\Output\Assembled_Image.png"
world_image.save(output_path,format="PNG", optimize=True, compress_level=9)

world_image= resize_to_target_width(world_image,widthT*2)
# Save the assembled image
#output_path = r"D:\tools\Output\Assembled_Image1.png"
#assembled_image.save(output_path)
print(f"Saving assembled image to {output_path}")
world_image.save(output_path,format="PNG", optimize=True, compress_level=9)
assembled_image.close()
world_image.close()
print(f"Image assembled and saved to {output_path}")
large_image_path = output_path
output_directory = r"D:\tools\tiles\SynologyDrive"
generate_tiles_for_zoom_levels(large_image_path, output_directory, max_zoom=9, min_zoom=0)
print(f"Script Complete")

