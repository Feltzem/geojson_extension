import * as vscode from "vscode";

const VIEW_TYPE = "geojsonVisualEditor";

const EMPTY_COLLECTION = { type: "FeatureCollection", features: [] };
const EMPTY_COLLECTION_JSON = JSON.stringify(EMPTY_COLLECTION, null, 2);
const BASEMAP_IDS = [
  "carto-positron",
  "carto-voyager",
  "carto-dark-matter",
] as const;
const LABEL_FONT_FAMILIES = [
  "Open Sans Regular",
  "Open Sans Semibold",
  "Open Sans Bold",
  "Arial Unicode MS Regular",
  "Arial Unicode MS Bold",
] as const;

const CATEGORICAL_PALETTES = ["bright", "modern", "pastel", "dark"] as const;

export type BasemapId = (typeof BASEMAP_IDS)[number];
export type LabelFontFamily = (typeof LABEL_FONT_FAMILIES)[number];
export type CategoricalPalette = (typeof CATEGORICAL_PALETTES)[number];

export interface EditorSettings {
  uiScale: number;
  defaultBasemap: BasemapId;
  defaultFillColor: string;
  defaultStrokeColor: string;
  defaultLineWidth: number;
  defaultStrokeWidth: number;
  defaultLabelsEnabled: boolean;
  defaultLabelFontFamily: LabelFontFamily;
  defaultLabelSize: number;
  defaultCategoricalPalette: CategoricalPalette;
}

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  uiScale: 1,
  defaultBasemap: "carto-positron",
  defaultFillColor: "#2563EB",
  defaultStrokeColor: "#F8FAFC",
  defaultLineWidth: 4,
  defaultStrokeWidth: 1.2,
  defaultLabelsEnabled: false,
  defaultLabelFontFamily: "Open Sans Semibold",
  defaultLabelSize: 12,
  defaultCategoricalPalette: "bright",
};

export function toWebviewPayload(rawText: string): {
  text: string;
  error?: string;
} {
  if (!rawText.trim().length) {
    return { text: EMPTY_COLLECTION_JSON };
  }
  return { text: rawText };
}

export function fromWebviewText(webviewText: string): string {
  try {
    const parsed = JSON.parse(webviewText);
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Edited GeoJSON has invalid syntax.",
    );
  }
}

/**
 * Text the webview marks as preformatted is fresh JSON.stringify(..., null, 2)
 * output, so it is valid and formatted by construction; skipping the
 * re-parse/re-format avoids blocking the extension host on large documents.
 */
export function resolveWebviewEditText(
  webviewText: string,
  preformatted: boolean,
): string {
  return preformatted ? webviewText : fromWebviewText(webviewText);
}

export function normaliseEditorSettings(
  rawSettings: Partial<Record<keyof EditorSettings, unknown>>,
): EditorSettings {
  return {
    uiScale: normaliseNumber(
      rawSettings.uiScale,
      1,
      1.5,
      DEFAULT_EDITOR_SETTINGS.uiScale,
    ),
    defaultBasemap: normaliseOption(
      rawSettings.defaultBasemap,
      BASEMAP_IDS,
      DEFAULT_EDITOR_SETTINGS.defaultBasemap,
    ),
    defaultFillColor: normaliseHexColour(
      rawSettings.defaultFillColor,
      DEFAULT_EDITOR_SETTINGS.defaultFillColor,
    ),
    defaultStrokeColor: normaliseHexColour(
      rawSettings.defaultStrokeColor,
      DEFAULT_EDITOR_SETTINGS.defaultStrokeColor,
      true,
    ),
    defaultLineWidth: normaliseNumber(
      rawSettings.defaultLineWidth,
      1,
      16,
      DEFAULT_EDITOR_SETTINGS.defaultLineWidth,
    ),
    defaultStrokeWidth: normaliseNumber(
      rawSettings.defaultStrokeWidth,
      0.5,
      12,
      DEFAULT_EDITOR_SETTINGS.defaultStrokeWidth,
    ),
    defaultLabelsEnabled:
      typeof rawSettings.defaultLabelsEnabled === "boolean"
        ? rawSettings.defaultLabelsEnabled
        : DEFAULT_EDITOR_SETTINGS.defaultLabelsEnabled,
    defaultLabelFontFamily: normaliseOption(
      rawSettings.defaultLabelFontFamily,
      LABEL_FONT_FAMILIES,
      DEFAULT_EDITOR_SETTINGS.defaultLabelFontFamily,
    ),
    defaultLabelSize: normaliseNumber(
      rawSettings.defaultLabelSize,
      8,
      24,
      DEFAULT_EDITOR_SETTINGS.defaultLabelSize,
    ),
    defaultCategoricalPalette: normaliseOption(
      rawSettings.defaultCategoricalPalette,
      CATEGORICAL_PALETTES,
      DEFAULT_EDITOR_SETTINGS.defaultCategoricalPalette,
    ),
  };
}

export function buildWebviewCsp(cspSource: string, nonce: string): string {
  return [
    `default-src 'none'`,
    `img-src ${cspSource} https://demotiles.maplibre.org https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com data: blob:`,
    `script-src 'nonce-${nonce}' https://unpkg.com`,
    `style-src ${cspSource} https://unpkg.com https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com https://fonts.googleapis.com 'unsafe-inline'`,
    `connect-src ${cspSource} https://demotiles.maplibre.org https://unpkg.com https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com https://fonts.googleapis.com https://fonts.gstatic.com`,
    `font-src ${cspSource} https://demotiles.maplibre.org https://unpkg.com https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com https://fonts.gstatic.com`,
    `worker-src blob:`,
  ].join("; ");
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(GeoJsonEditorProvider.register(context));

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "geojson-visual-editor.open",
      (uri?: vscode.Uri) => {
        if (!uri) {
          const active = vscode.window.activeTextEditor?.document.uri;
          if (!active) {
            void vscode.window.showInformationMessage(
              "Select a GeoJSON file to open in the visual editor.",
            );
            return;
          }
          uri = active;
        }

        void vscode.commands.executeCommand("vscode.openWith", uri, VIEW_TYPE);
      },
    ),
  );
}

class GeoJsonEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new GeoJsonEditorProvider(context);
    return vscode.window.registerCustomEditorProvider(VIEW_TYPE, provider, {
      supportsMultipleEditorsPerDocument: true,
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    });
  }

  private constructor(private readonly context: vscode.ExtensionContext) {}

  public resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
  ): void {
    const documentKey = document.uri.toString();
    const { webview } = webviewPanel;

    webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, "media"),
      ],
    };

    webview.html = this.getWebviewContent(webview);

    let lastSavedText = document.getText();

    const updateWebview = () => {
      const payload = this.toWebviewPayload(document.getText());
      void webview.postMessage({
        type: "update",
        text: payload.text,
        format: "geojson",
        error: payload.error ?? null,
        version: document.version,
        isDirty: document.isDirty,
      });
    };

    const updateWebviewSettings = () => {
      void webview.postMessage({
        type: "settings",
        settings: this.getEditorSettings(document.uri),
      });
    };

    const changeSubscription = vscode.workspace.onDidChangeTextDocument(
      (event) => {
        if (event.document.uri.toString() === documentKey) {
          updateWebview();
        }
      },
    );
    const saveSubscription = vscode.workspace.onDidSaveTextDocument(
      (savedDocument) => {
        if (savedDocument.uri.toString() === documentKey) {
          lastSavedText = savedDocument.getText();
          updateWebview();
        }
      },
    );
    const configurationSubscription =
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("geojsonVisualEditor", document.uri)) {
          updateWebviewSettings();
        }
      });

    webviewPanel.onDidDispose(() => {
      changeSubscription.dispose();
      saveSubscription.dispose();
      configurationSubscription.dispose();
    });

    webview.onDidReceiveMessage(async (message) => {
      const requestId =
        typeof message?.requestId === "string" ? message.requestId : null;
      switch (message?.type) {
        case "ready":
          updateWebviewSettings();
          updateWebview();
          break;
        case "edit":
          if (typeof message.text === "string") {
            try {
              await this.persistWebviewText(
                document,
                message.text,
                message.preformatted === true,
              );
              void webview.postMessage({
                type: "editResult",
                requestId,
                ok: true,
                reason:
                  typeof message.reason === "string" ? message.reason : null,
                version: document.version,
                isDirty: document.isDirty,
              });
            } catch (error) {
              const messageText =
                error instanceof Error ? error.message : String(error);
              void webview.postMessage({
                type: "editResult",
                requestId,
                ok: false,
                reason:
                  typeof message.reason === "string" ? message.reason : null,
                error: messageText,
                version: document.version,
                isDirty: document.isDirty,
              });
              void vscode.window.showErrorMessage(
                `Unable to apply changes: ${messageText}`,
              );
            }
          }
          break;
        case "revert":
          try {
            await this.replaceDocumentText(document, lastSavedText);
            void webview.postMessage({
              type: "revertResult",
              requestId,
              ok: true,
              version: document.version,
              isDirty: document.isDirty,
            });
          } catch (error) {
            const messageText =
              error instanceof Error ? error.message : String(error);
            void webview.postMessage({
              type: "revertResult",
              requestId,
              ok: false,
              error: messageText,
              version: document.version,
              isDirty: document.isDirty,
            });
            void vscode.window.showErrorMessage(
              `Unable to revert changes: ${messageText}`,
            );
          }
          break;
        default:
          break;
      }
    });
  }

  private async replaceDocumentText(
    document: vscode.TextDocument,
    newText: string,
  ): Promise<void> {
    const currentText = document.getText();
    if (currentText === newText) {
      return;
    }

    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(currentText.length),
    );

    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, fullRange, newText);
    const applied = await vscode.workspace.applyEdit(edit);
    if (!applied) {
      throw new Error("VS Code rejected the document edit.");
    }
  }

  private toWebviewPayload(rawText: string): { text: string; error?: string } {
    return toWebviewPayload(rawText);
  }

  private async persistWebviewText(
    document: vscode.TextDocument,
    webviewText: string,
    preformatted = false,
  ): Promise<void> {
    const converted = resolveWebviewEditText(webviewText, preformatted);
    await this.replaceDocumentText(document, converted);
  }

  private getEditorSettings(resource: vscode.Uri): EditorSettings {
    const config = vscode.workspace.getConfiguration(
      "geojsonVisualEditor",
      resource,
    );
    return normaliseEditorSettings({
      uiScale: config.get("uiScale"),
      defaultBasemap: config.get("defaultBasemap"),
      defaultFillColor: config.get("defaultFillColor"),
      defaultStrokeColor: config.get("defaultStrokeColor"),
      defaultLineWidth: config.get("defaultLineWidth"),
      defaultStrokeWidth: config.get("defaultStrokeWidth"),
      defaultLabelsEnabled: config.get("defaultLabelsEnabled"),
      defaultLabelFontFamily: config.get("defaultLabelFontFamily"),
      defaultLabelSize: config.get("defaultLabelSize"),
      defaultCategoricalPalette: config.get("defaultCategoricalPalette"),
    });
  }

  private getWebviewContent(webview: vscode.Webview): string {
    const utilsScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "media",
        "geojson-utils.js",
      ),
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "main.js"),
    );
    const stylesUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "main.css"),
    );
    const nonce = getNonce();

    const csp = buildWebviewCsp(webview.cspSource, nonce);

    return /* html */ `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="utf-8" />
			<meta http-equiv="Content-Security-Policy" content="${csp}" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=Commit+Mono:wght@400;500&family=Hanken+Grotesk:wght@400;500&display=swap" rel="stylesheet" />
			<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" />
			<link rel="stylesheet" href="${stylesUri}" />
			<title>GeoJSON Visual Editor</title>
		</head>
		<body>
			<div class="app">
        <div id="large-file-loading" class="large-file-loading hidden" role="status" aria-live="polite" aria-busy="true" aria-hidden="true">
          <div class="large-file-loading-panel">
            <div class="large-file-loading-kicker">Large document</div>
            <div class="large-file-loading-header">
              <h2 id="large-file-loading-title">Loading GeoJSON</h2>
              <span id="large-file-loading-percent">0%</span>
            </div>
            <div id="large-file-loading-step" class="large-file-loading-step">Preparing map workspace</div>
            <div class="large-file-loading-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Loading progress">
              <span id="large-file-loading-bar"></span>
            </div>
            <div id="large-file-loading-detail" class="large-file-loading-detail">Switching the raw editor to high-performance mode.</div>
          </div>
        </div>
        <div id="raw-data-popup" class="raw-data-popup hidden" role="status" aria-live="polite" aria-hidden="true">
          <div class="raw-data-popup-panel">
            <div class="raw-data-popup-copy">
              <strong id="raw-data-popup-title">Raw document data shown</strong>
              <span id="raw-data-popup-message">Showing the original text because the document cannot be safely formatted.</span>
            </div>
            <button id="raw-data-popup-close" type="button" class="raw-data-popup-close" aria-label="Dismiss raw document notice">Dismiss</button>
          </div>
        </div>
				<section class="map-panel" aria-label="Map preview">
          <div id="map"></div>
          <div id="graticule-overlay" class="graticule-overlay" aria-hidden="true"></div>
          <div class="map-overlay map-toolbar" aria-label="Map controls">
            <button id="map-zoom-in-btn" type="button" class="map-tool-button" title="Zoom in" aria-label="Zoom in">+</button>
            <button id="map-zoom-out-btn" type="button" class="map-tool-button" title="Zoom out" aria-label="Zoom out">-</button>
            <button id="map-fit-btn" type="button" class="map-tool-button map-tool-text" title="Fit map to all features" aria-label="Fit map to all features">Fit</button>
            <button id="edit-vertices-btn" type="button" class="map-tool-button map-tool-text" title="Edit selected feature vertices">Edit vertices</button>
            <button id="snap-vertices-btn" type="button" class="map-tool-button map-tool-text map-snap-toggle" title="Snap dragged vertices to nearby vertices" aria-label="Snap dragged vertices to nearby vertices" aria-pressed="true" hidden>Snap on</button>
          </div>
          <div class="map-overlay map-metrics document-metrics" aria-live="polite">
            <span id="feature-count-indicator" class="metric-pill">Features 0</span>
            <span id="file-size-indicator" class="metric-pill">Size 0 B</span>
          </div>
          <div id="coordinate-readout" class="map-overlay coordinate-readout" aria-live="polite">Lng 0.000000, Lat 0.000000</div>
          <div id="scale-readout" class="map-overlay scale-readout" aria-live="polite">
            <span id="scale-label">Scale 0 m</span>
            <span id="scale-bar" aria-hidden="true"></span>
          </div>
          <div id="loading-indicator" class="loading-indicator hidden" aria-live="polite">
            <span class="loading-text">Loading geometry</span>
          </div>
				</section>
				<section class="side-panel">
					<header class="panel-header">
						<h1>GeoJSON visual editor</h1>
            <label for="tooltip-toggle-input" class="header-toggle tooltip-toggle">
              <span class="tooltip-toggle-label">Hover tooltips</span>
              <span class="tooltip-toggle-control">
                <input id="tooltip-toggle-input" type="checkbox" checked />
                <span class="tooltip-toggle-state" aria-hidden="true"></span>
              </span>
            </label>
					</header>
          <div class="panel-tabs" role="tablist" aria-label="Editor mode">
            <button type="button" class="panel-tab is-active" role="tab" id="tab-edit" aria-selected="true" aria-controls="pane-edit" data-tab="edit">Edit</button>
            <button type="button" class="panel-tab" role="tab" id="tab-style" aria-selected="false" aria-controls="pane-style" data-tab="style">Style</button>
            <button type="button" class="panel-tab" role="tab" id="tab-data" aria-selected="false" aria-controls="pane-data" data-tab="data">Data</button>
          </div>
          <div class="tab-pane" id="pane-style" role="tabpanel" aria-labelledby="tab-style" data-tab="style">
          <section class="properties-group collapsible-section" aria-live="polite">
            <header class="group-header collapsible-header">
              <button type="button" class="collapsible-toggle" aria-expanded="true" aria-controls="basemap-content">
                <span class="caret" aria-hidden="true">▾</span>
                <span>Basemap</span>
              </button>
            </header>
            <div id="basemap-content" class="collapsible-content">
              <div class="control-group">
                <label for="basemap-select">Basemap style</label>
                <select id="basemap-select">
                  <option value="carto-positron">Carto positron</option>
                  <option value="carto-voyager">Carto voyager</option>
                  <option value="carto-dark-matter">Carto dark matter</option>
                </select>
              </div>
              <!-- Offline basemap option removed -->
            </div>
          </section>
          <section class="properties-group collapsible-section" aria-live="polite">
            <header class="group-header collapsible-header">
              <button type="button" class="collapsible-toggle" aria-expanded="true" aria-controls="geometry-styling-content">
                <span class="caret" aria-hidden="true">▾</span>
                <span>Geometry styling</span>
              </button>
            </header>
            <div id="geometry-styling-content" class="collapsible-content">
              <div class="style-row">
                <label for="fill-colour-input">Fill colour</label>
                <label class="color-field" for="fill-colour-input">
                  <input id="fill-colour-input" type="color" value="#2563eb" />
                  <span id="fill-colour-value" class="hex-readout">#2563EB</span>
                </label>
              </div>
              <div class="control-group">
                <label for="attribute-select">Colour features by attribute</label>
                <select id="attribute-select">
                  <option value="">None</option>
                </select>
              </div>
              <div class="control-group">
                <label for="attribute-colour-mode">Attribute colour mode</label>
                <select id="attribute-colour-mode">
                  <option value="categorical">Categorical</option>
                  <option value="gradient">Gradient (numeric fields)</option>
                </select>
              </div>
              <div id="categorical-controls" class="categorical-controls" aria-live="polite">
                <div class="control-group">
                  <label for="categorical-palette-select">Categorical palette</label>
                  <select id="categorical-palette-select">
                    <option value="bright">Bright</option>
                    <option value="modern">Modern</option>
                    <option value="pastel">Pastel</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                <details class="categorical-legend-details">
                  <summary>Value colours</summary>
                  <div id="categorical-legend" class="categorical-legend"></div>
                </details>
              </div>
              <div id="gradient-controls" class="gradient-controls hidden" aria-live="polite">
                <div class="control-group">
                  <label for="gradient-preset-select">Gradient preset</label>
                  <select id="gradient-preset-select">
                    <option value="custom">Custom</option>
                    <option value="magma">Magma</option>
                    <option value="viridis">Viridis</option>
                    <option value="white-dark-red">White to red</option>
                    <option value="white-black">White to black</option>
                    <option value="white-dark-blue">White to blue</option>
                  </select>
                </div>
                <div class="style-row">
                  <label for="gradient-start-colour">Gradient start colour</label>
                  <label class="color-field" for="gradient-start-colour">
                    <input id="gradient-start-colour" type="color" value="#0ea5e9" />
                    <span id="gradient-start-colour-value" class="hex-readout">#0EA5E9</span>
                  </label>
                </div>
                <div class="style-row">
                  <label for="gradient-middle-enabled" class="gradient-middle-toggle">
                    <input id="gradient-middle-enabled" type="checkbox" />
                    <span>Use middle colour</span>
                  </label>
                </div>
                <div class="style-row">
                  <label for="gradient-middle-colour">Gradient middle colour (optional)</label>
                  <label class="color-field" for="gradient-middle-colour">
                    <input id="gradient-middle-colour" type="color" value="#facc15" />
                    <span id="gradient-middle-colour-value" class="hex-readout">#FACC15</span>
                  </label>
                </div>
                <div class="style-row">
                  <label for="gradient-end-colour">Gradient end colour</label>
                  <label class="color-field" for="gradient-end-colour">
                    <input id="gradient-end-colour" type="color" value="#ef4444" />
                    <span id="gradient-end-colour-value" class="hex-readout">#EF4444</span>
                  </label>
                </div>
              </div>
              <div class="style-row style-row-inline">
                <div class="style-row-field">
                  <label for="stroke-colour-input">Stroke colour (optional)</label>
                  <label class="color-field" for="stroke-colour-input">
                    <input id="stroke-colour-input" type="color" value="#f8fafc" />
                    <span id="stroke-colour-value" class="hex-readout">#F8FAFC</span>
                  </label>
                </div>
                <button id="clear-stroke-btn" type="button" class="secondary-btn">Clear stroke</button>
              </div>
              <div class="control-group">
                <label for="line-width-input">Line width <span id="line-width-value">4.0</span></label>
                <input id="line-width-input" type="range" min="1" max="16" step="0.5" value="4" />
              </div>
              <div class="control-group">
                <label for="stroke-width-input">Stroke width <span id="stroke-width-value">1.2</span></label>
                <input id="stroke-width-input" type="range" min="0.5" max="12" step="0.5" value="1.2" />
              </div>
              <div class="opacity-controls">
                <div class="control-group">
                  <label for="opacity-attribute-select">Opacity by numeric field</label>
                  <select id="opacity-attribute-select">
                    <option value="">None</option>
                  </select>
                </div>
                <div class="control-group">
                  <label for="opacity-min-input">Min transparency <span id="opacity-min-value">10%</span></label>
                  <input id="opacity-min-input" type="range" min="0" max="100" step="1" value="10" />
                </div>
                <div class="control-group">
                  <label for="opacity-max-input">Max transparency <span id="opacity-max-value">80%</span></label>
                  <input id="opacity-max-input" type="range" min="0" max="100" step="1" value="80" />
                </div>
              </div>
            </div>
          </section>
          <section class="properties-group collapsible-section" aria-live="polite">
            <header class="group-header collapsible-header">
              <button type="button" class="collapsible-toggle" aria-expanded="true" aria-controls="labels-content">
                <span class="caret" aria-hidden="true">▾</span>
                <span>Labels</span>
              </button>
            </header>
            <div id="labels-content" class="collapsible-content">
              <label for="label-toggle-input" class="label-toggle-row">
                <span>Show labels</span>
                <input id="label-toggle-input" type="checkbox" />
              </label>
              <div class="control-group">
                <label for="label-field-select">Label field</label>
                <select id="label-field-select">
                  <option value="">Choose a field</option>
                </select>
              </div>
              <div class="label-preview" aria-live="polite">
                <span class="label-preview-chip" aria-hidden="true">Aa</span>
                <div class="label-preview-copy">
                  <strong id="label-preview-value">Choose label field</strong>
                  <span id="label-preview-meta">Choose a property to preview labels.</span>
                </div>
              </div>
            </div>
          </section>
          </div>
          <div class="tab-pane is-active" id="pane-edit" role="tabpanel" aria-labelledby="tab-edit" data-tab="edit">
          <section class="properties-group collapsible-section" aria-live="polite">
            <header class="group-header collapsible-header">
              <button type="button" class="collapsible-toggle" aria-expanded="true" aria-controls="new-features-content">
                <span class="caret" aria-hidden="true">▾</span>
                <span>New features</span>
              </button>
            </header>
            <div id="new-features-content" class="collapsible-content">
              <div class="feature-tools">
                <button id="add-point-btn" type="button">Add point</button>
                <button id="add-linestring-btn" type="button">Add line</button>
                <button id="add-polygon-btn" type="button">Add polygon</button>
              </div>
            </div>
          </section>
          <section class="properties-group collapsible-section" aria-live="polite">
            <header class="group-header collapsible-header">
              <button type="button" class="collapsible-toggle" aria-expanded="true" aria-controls="feature-properties-content">
                <span class="caret" aria-hidden="true">▾</span>
                <span>Feature properties</span>
              </button>
            </header>
            <div id="feature-properties-content" class="collapsible-content">
              <p id="selection-hint">Select a feature on the map to edit its properties</p>
              <div id="properties-container" class="properties-container" role="group" aria-describedby="selection-hint"></div>
              <div class="property-actions">
                <button id="add-property-btn" type="button">Add property</button>
                <button id="delete-feature-btn" type="button">Delete feature</button>
              </div>
            </div>
          </section>
          </div>
          <div class="tab-pane" id="pane-data" role="tabpanel" aria-labelledby="tab-data" data-tab="data">
          <section class="properties-group collapsible-section" aria-live="polite">
            <header class="group-header collapsible-header document-data-header">
              <button type="button" class="collapsible-toggle" aria-expanded="true" aria-controls="document-data-content">
                <span class="caret" aria-hidden="true">▾</span>
                <span>Document data</span>
              </button>
              <button id="raw-search-toggle-btn" type="button" class="section-tool-button" aria-expanded="false" aria-controls="raw-find-panel">Search</button>
            </header>
            <div id="document-data-content" class="collapsible-content">
              <div id="raw-find-panel" class="raw-find-panel" hidden>
                <div class="raw-find-fields">
                  <label class="raw-find-field" for="raw-find-input">
                    <span>Find</span>
                    <input id="raw-find-input" type="search" autocomplete="off" spellcheck="false" />
                  </label>
                  <label class="raw-find-field" for="raw-replace-input">
                    <span>Replace</span>
                    <input id="raw-replace-input" type="text" autocomplete="off" spellcheck="false" />
                  </label>
                </div>
                <div class="raw-find-controls">
                  <label class="raw-match-case-row" for="raw-match-case-input">
                    <input id="raw-match-case-input" type="checkbox" />
                    <span>Match case</span>
                  </label>
                  <span id="raw-find-count" class="raw-find-count" aria-live="polite">0 / 0</span>
                  <div class="raw-find-nav">
                    <button id="raw-find-prev-btn" type="button" class="secondary-btn" aria-label="Previous match">Previous</button>
                    <button id="raw-find-next-btn" type="button" class="secondary-btn" aria-label="Next match">Next</button>
                  </div>
                </div>
                <div class="raw-replace-actions">
                  <button id="raw-replace-first-btn" type="button" class="secondary-btn">Replace first</button>
                  <button id="raw-replace-all-btn" type="button" class="secondary-btn">Replace all</button>
                </div>
              </div>
              <div class="control-group">
                <label for="geojson-input" id="raw-label">Document data</label>
                <div class="json-editor" aria-label="Document data editor">
                  <div id="geojson-gutter" class="json-gutter" aria-hidden="true">1</div>
                  <pre id="geojson-highlight" aria-hidden="true"></pre>
                  <textarea id="geojson-input" spellcheck="false" wrap="off"></textarea>
                </div>
              </div>
              <div class="rounding-tools">
                <label for="round-decimals-input" class="rounding-title">Coordinate precision (decimal places)</label>
                <div class="control-group">
                  <input id="round-decimals-input" type="number" min="0" max="10" step="1" value="6" />
                </div>
                <button id="round-coordinates-btn" type="button" class="secondary-btn">Round coordinates</button>
              </div>
            </div>
          </section>
          </div>
          <footer class="panel-footer">
            <div class="actions">
              <button id="apply-btn" type="button">Apply raw edits</button>
              <div class="history-actions" aria-label="Edit history">
                <button id="undo-btn" type="button" class="secondary-btn">Undo</button>
                <button id="redo-btn" type="button" class="secondary-btn">Redo</button>
                <button id="revert-btn" type="button" class="secondary-btn">Revert</button>
              </div>
              <span id="dirty-state" class="dirty-state" aria-live="polite">Saved</span>
              <span id="status" role="status"></span>
            </div>
          </footer>
				</section>
			</div>
			<script nonce="${nonce}" src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
      <script nonce="${nonce}" src="${utilsScriptUri}"></script>
			<script nonce="${nonce}" src="${scriptUri}"></script>
		</body>
		</html>`;
  }
}

function getNonce(): string {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 32 }, () =>
    possible.charAt(Math.floor(Math.random() * possible.length)),
  ).join("");
}

function normaliseNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return fallback;
  }
  return parsed;
}

function normaliseOption<const T extends readonly string[]>(
  value: unknown,
  options: T,
  fallback: T[number],
): T[number] {
  return typeof value === "string" && options.includes(value)
    ? value
    : fallback;
}

function normaliseHexColour(
  value: unknown,
  fallback: string,
  allowEmpty = false,
): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  if (allowEmpty && !trimmed) {
    return "";
  }

  const shorthandMatch = /^#([0-9a-f]{3})$/i.exec(trimmed);
  if (shorthandMatch) {
    return shorthandMatch[1]
      .split("")
      .map((character) => character + character)
      .join("")
      .toUpperCase()
      .replace(/^/, "#");
  }

  return /^#[0-9a-f]{6}$/i.test(trimmed) ? trimmed.toUpperCase() : fallback;
}

export function deactivate(): void {}
