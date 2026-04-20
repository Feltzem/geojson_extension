# Change Log

All notable changes to the "geojson-visual-editor" extension will be documented in this file.

## [0.0.1] - 2025-10-23

- Initial release with custom GeoJSON editor, MapLibre visualisation, and attribute-driven styling.

## [0.2.0] - 2026-03-17

- General code tidy up. Moved functions from `main.js` into new `geojson_utils.js`
- New styling options: Use a gradient for numeric attributes, add a stroke colour, control line and stroke thickness, apply opacity based on a numeric attribute
- Collapsible sections in the sidebar
- Tooltip on hover

## [0.3.0] - 2026-03-19

- File size and feature count indicator
- JSON syntax highlighting in the document data editor
- Now respects the current VS Code theme (not always dark)
- Basemap selector with three Carto styles: Positron, Voyager, Dark Matter
- Round latitude and longitude fields

## [0.4.0] - 2026-04-19

- Vertex editing enhancements: add and delete vertices while editing a selected feature. Left-click near a line segment or polygon edge to insert a vertex; right-click an existing vertex (or its marker) to delete it. Vertex markers remain draggable and the cursor switches to a crosshair while editing. Polygon rings are kept closed automatically and deletions that would produce invalid geometry are blocked.

## [0.5.0] - 2026-04-20

- Labeling: Add a Labels sidebar to toggle on/off map labels and select a feature property to use as the label text. Labels support points, lines and polygon centroids, use halo styling for contrast, and are sized responsively by zoom. The sidebar includes a small live preview and disables controls when no suitable property is available.
