# GeoJSON Visual Editor

GeoJSON Visual Editor lets you open `.geojson` files inside VS Code with a purpose-built custom editor. Inspect your spatial data on a map, edit it, and colour features by an attribute.

## Features

- Custom editor that becomes the default experience for `*.geojson` files in VS Code.
- Split layout pairing an interactive map with a raw GeoJSON text editor.
- Automatic geometry styling for points, lines, polygons, and their multi-geometry variants.
- Attribute-driven styling: pick a property and the map automatically colours features with a unique palette.
- Global styling controls for fill colour, optional stroke colour, line width, and stroke width.
- Fit-to-data navigation to keep the map focused on your dataset.
- Context-menu command **Open in GeoJSON Visual Editor** available from the Explorer.

## Usage

1. Right-click any GeoJSON file in the Explorer and choose **Open in GeoJSON Visual Editor** (or double-click after the first use).
2. Use the map to visually inspect your features. Navigation controls let you pan and zoom.
3. Use the Geometry styling section to set a shared fill colour, optional stroke colour, line width (for line data), and stroke width.
4. Select an attribute in the sidebar to colour features by that property.
5. Review or adjust the raw GeoJSON in the built-in editor. Click **Apply Changes** to validate and save back to disk.

If the JSON is invalid a clear error message is shown and the existing file contents remain untouched.

## Requirements

An active internet connection is required for the default MapLibre basemap (`https://demotiles.maplibre.org`).

## Commands

| Command                                                                 | Description                                         |
| ----------------------------------------------------------------------- | --------------------------------------------------- |
| `GeoJSON: Open in GeoJSON Visual Editor` (`geojson-visual-editor.open`) | Opens the selected resource with the custom editor. |

## Known Limitations

- Very large datasets may impact webview performance.

## Development

Run `npm install` followed by `npm run watch` to compile TypeScript while developing. Use the **Run Extension** launch configuration to debug the extension inside the VS Code Extension Host.

## Release Notes

See `CHANGELOG.md` for the full history.
