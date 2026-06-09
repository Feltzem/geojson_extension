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

## [0.6.0] - 2026-05-08

- UI redesign: Refresh the custom editor with a new cartographic visual style, updated typography, polished map overlays and controls, and a cleaner side-panel/document editor layout that better fits VS Code themes.
- Document editor: Add find and replace tools to the raw JSON editor, including previous/next match navigation, match counts, optional case-sensitive search, replace-first and replace-all actions, keyboard shortcut support, and selection-aware search seeding.

## [0.6.2] - 2026-05-19

- Settings: Add VS Code user/workspace settings for the visual editor UI scale, default basemap, default fill and stroke colours, default line and stroke widths, and default map label font/size.
- Settings now apply when opening a GeoJSON file and update live in open editors when changed through VS Code Settings or `settings.json`, while keeping `.geojson` files free of editor preference metadata.

## [0.6.3] - 2026-05-28

- Performance: Improve large GeoJSON loading by preserving raw text for large files, skipping expensive full-document syntax highlighting and gutter generation, caching feature analysis, and avoiding unnecessary geometry cloning.
- Loading: Add a polished large-document loading screen with staged progress while parsing, scanning features, rendering map layers, and syncing editor controls.
- Document editor: Keep pretty-printed JSON formatting and syntax highlighting for smaller files while using a fast plain-text editor mode for large documents.
- Development: Package VSIX builds into an ignored `dist/` folder.

## [0.7.0] - 2026-06-09

- Tooltips: Dynamically widen the feature hover tooltip when a property value is long enough to wrap, expanding the popup to roughly double width before continuing to wrap so long values stay readable.
- Categorical colour palettes: When colouring by a field, choose from four preset colour palettes, with the option to customise each category's colour individually
