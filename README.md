# GeoJSON Visual Editor

GeoJSON Visual Editor adds a custom map-first editor for spatial files in VS Code. It supports GeoJSON documents with live map preview, feature editing tools, and raw text editing in one view.

## Supported Files

- `*.geojson`

The custom editor is registered as the default editor for supported GeoJSON files.

## Current Functionality

### Visual editing and map inspection

- Interactive map preview.
- Built-in pan/zoom controls and a fit-to-features button.
- Feature hover tooltips that can be toggled on or off.
- Live document metrics: feature count and file size.
- Basemap switcher with Carto styles:
  - Positron
  - Voyager
  - Dark Matter

### Geometry styling

- Global styling controls for:
  - Fill color
  - Optional stroke color and stroke width
  - Line width
- Color by attribute (categorical mode).
- Numeric gradient styling with presets and custom gradients.
- Opacity by numeric field using configurable min/max transparency.

### Feature and property editing

- Add new features from the sidebar:
  - Point
  - LineString
  - Polygon
- Select features directly on the map.
- Delete selected features.
- Edit feature properties:
  - Add property
  - Rename keys
  - Update values (with basic type coercion)
  - Remove property
- Vertex editing mode for selected geometries (drag markers to update coordinates).

### Raw data editing

- Embedded raw document editor with JSON syntax highlighting.
- Coordinate rounding tool (0-10 decimal places).
- Apply workflow validates/normalizes data, updates the map, and saves back to disk.
- Invalid JSON/GeoJSON input is surfaced with clear error messages.

![Capture](https://github.com/user-attachments/assets/9294b15f-382a-4bae-b54a-f8c0e5f3814f)

## Commands

| Command                                                                 | Description                                                 |
| ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| `GeoJSON: Open in GeoJSON Visual Editor` (`geojson-visual-editor.open`) | Opens the selected `*.geojson` file with the custom editor. |

## Usage

1. Open a `.geojson` file from the Explorer. You can also run **GeoJSON: Open in GeoJSON Visual Editor**.
2. Inspect and navigate data on the map.
3. Use **Geometry Styling** to tune colors, stroke, gradients, and transparency.
4. Optionally add/remove features, edit vertices, and update properties in the sidebar.
5. Edit raw document data directly if needed.
6. Click **Apply Changes** to save updates to disk.

## Requirements

An internet connection is required for remote basemap/style assets:

- `https://basemaps.cartocdn.com`
- `https://unpkg.com`

## Known Limitations

- Very large datasets can impact webview and map rendering performance.
- Vertex editing currently focuses on common geometry paths (for multi-geometries, editing is limited to the first editable branch).

## Development

1. Run `npm install`.
2. Run `npm run watch` for incremental TypeScript builds.
3. Use the **Run Extension** launch configuration to debug in the Extension Host.

## Release Notes

See `CHANGELOG.md` for version history.
