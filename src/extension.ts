import * as path from "path";
import * as vscode from "vscode";
import * as wellknown from "wellknown";

const VIEW_TYPE = "geojsonVisualEditor";

type DocumentFormat = "geojson" | "wkt";
type JsonObject = Record<string, unknown>;
type GeoJsonGeometryLike = {
  type: string;
  coordinates?: unknown;
  geometries?: unknown[];
};

const EMPTY_COLLECTION = { type: "FeatureCollection", features: [] };
const EMPTY_COLLECTION_JSON = JSON.stringify(EMPTY_COLLECTION, null, 2);

function isRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
}

function isGeometryLike(value: unknown): value is GeoJsonGeometryLike {
  if (!isRecord(value) || typeof value.type !== "string") {
    return false;
  }

  if ("coordinates" in value) {
    return true;
  }

  return (
    value.type === "GeometryCollection" &&
    Array.isArray((value as JsonObject).geometries)
  );
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
  private readonly formatMap = new Map<string, DocumentFormat>();

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

    const detectedFormat = this.detectDocumentFormat(document);
    this.formatMap.set(documentKey, detectedFormat);

    const updateWebview = () => {
      const format = this.getDocumentFormat(document);
      const payload = this.toWebviewPayload(document.getText(), format);
      void webview.postMessage({
        type: "update",
        text: payload.text,
        format,
        error: payload.error ?? null,
      });
    };

    const changeSubscription = vscode.workspace.onDidChangeTextDocument(
      (event) => {
        if (event.document.uri.toString() === documentKey) {
          updateWebview();
        }
      },
    );

    webviewPanel.onDidDispose(() => {
      changeSubscription.dispose();
      this.formatMap.delete(documentKey);
    });

    webview.onDidReceiveMessage(async (message) => {
      switch (message?.type) {
        case "ready":
          updateWebview();
          break;
        case "edit":
          if (typeof message.text === "string") {
            try {
              await this.persistWebviewText(document, message.text);
            } catch (error) {
              const messageText =
                error instanceof Error ? error.message : String(error);
              void vscode.window.showErrorMessage(
                `Unable to apply changes: ${messageText}`,
              );
            }
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
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(document.getText().length),
    );

    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, fullRange, newText);
    const applied = await vscode.workspace.applyEdit(edit);
    if (applied && document.isDirty) {
      await document.save();
    }
  }

  private getDocumentFormat(document: vscode.TextDocument): DocumentFormat {
    return (
      this.formatMap.get(document.uri.toString()) ??
      this.detectDocumentFormat(document)
    );
  }

  private detectDocumentFormat(document: vscode.TextDocument): DocumentFormat {
    const ext = path.extname(document.uri.fsPath).toLowerCase();
    return ext === ".wkt" ? "wkt" : "geojson";
  }

  private toWebviewPayload(
    rawText: string,
    format: DocumentFormat,
  ): { text: string; error?: string } {
    if (format === "wkt") {
      const trimmed = rawText.trim();
      if (!trimmed.length) {
        return { text: EMPTY_COLLECTION_JSON };
      }
      try {
        const geometry = wellknown.parse(trimmed);
        if (!geometry) {
          return {
            text: EMPTY_COLLECTION_JSON,
            error: "Unable to parse WKT geometry.",
          };
        }
        const collection = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry,
              properties: {},
            },
          ],
        };
        return { text: JSON.stringify(collection, null, 2) };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to parse WKT.";
        return {
          text: EMPTY_COLLECTION_JSON,
          error: message,
        };
      }
    }

    try {
      if (!rawText.trim().length) {
        return { text: EMPTY_COLLECTION_JSON };
      }
      const parsed = JSON.parse(rawText);
      return { text: JSON.stringify(parsed, null, 2) };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid GeoJSON document.";
      return {
        text: EMPTY_COLLECTION_JSON,
        error: message,
      };
    }
  }

  private async persistWebviewText(
    document: vscode.TextDocument,
    webviewText: string,
  ): Promise<void> {
    const format = this.getDocumentFormat(document);
    const converted = this.fromWebviewText(webviewText, format);
    await this.replaceDocumentText(document, converted);
  }

  private fromWebviewText(webviewText: string, format: DocumentFormat): string {
    if (format === "wkt") {
      let geometry: GeoJsonGeometryLike | null = null;
      try {
        const parsed: unknown = JSON.parse(webviewText);
        geometry = this.extractGeometry(parsed);
      } catch (error) {
        throw new Error(
          error instanceof Error
            ? error.message
            : "GeoJSON could not be parsed for WKT conversion.",
        );
      }

      if (!geometry) {
        return "";
      }

      try {
        return wellknown.stringify(geometry) ?? "";
      } catch (error) {
        throw new Error(
          error instanceof Error
            ? error.message
            : "Unable to convert geometry back to WKT.",
        );
      }
    }

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

  private extractGeometry(input: unknown): GeoJsonGeometryLike | null {
    if (!isRecord(input)) {
      return null;
    }

    if (input.type === "FeatureCollection" && Array.isArray(input.features)) {
      return this.extractGeometry(input.features[0]);
    }

    if (input.type === "Feature" && "geometry" in input) {
      return this.extractGeometry(input.geometry);
    }

    if (isGeometryLike(input)) {
      return input;
    }

    return null;
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

    const csp = [
      `default-src 'none'`,
      `img-src ${webview.cspSource} https://demotiles.maplibre.org https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com data: blob:`,
      `script-src 'nonce-${nonce}' https://unpkg.com`,
      `style-src ${webview.cspSource} https://unpkg.com https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com 'unsafe-inline'`,
      `connect-src ${webview.cspSource} https://demotiles.maplibre.org https://unpkg.com https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com`,
      `font-src ${webview.cspSource} https://demotiles.maplibre.org https://unpkg.com https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com`,
      `worker-src blob:`,
    ].join("; ");

    return /* html */ `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="utf-8" />
			<meta http-equiv="Content-Security-Policy" content="${csp}" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" />
			<link rel="stylesheet" href="${stylesUri}" />
			<title>GeoJSON Visual Editor</title>
		</head>
		<body>
			<div class="app">
				<section class="map-panel">
          <div id="map"></div>
          <div id="loading-indicator" class="loading-indicator hidden" aria-live="polite">
            <span class="loading-spinner" aria-hidden="true"></span>
            <span class="loading-text">Loading geometry...</span>
          </div>
				</section>
				<section class="side-panel">
					<header class="panel-header">
						<h1>GeoJSON Visual Editor</h1>
            <p class="subtitle">Inspect, style, and edit your spatial data.</p>
            <label for="tooltip-toggle-input" class="header-toggle">
              <input id="tooltip-toggle-input" type="checkbox" checked />
              <span>Show hover tooltips</span>
            </label>
					</header>
          <section class="properties-group collapsible-section" aria-live="polite">
            <header class="group-header collapsible-header">
              <button type="button" class="collapsible-toggle" aria-expanded="true" aria-controls="geometry-styling-content">
                <span class="caret" aria-hidden="true">▾</span>
                <span>Geometry Styling</span>
              </button>
            </header>
            <div id="geometry-styling-content" class="collapsible-content">
              <p>Set shared fill and optional stroke styling for the map preview.</p>
              <div class="style-row">
                <label for="fill-colour-input">Fill colour</label>
                <input id="fill-colour-input" type="color" value="#2563eb" />
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
              <div id="gradient-controls" class="gradient-controls hidden" aria-live="polite">
                <div class="control-group">
                  <label for="gradient-preset-select">Gradient preset</label>
                  <select id="gradient-preset-select">
                    <option value="custom">Custom</option>
                    <option value="magma">Magma</option>
                    <option value="viridis">Viridis</option>
                    <option value="white-dark-red">White to Red</option>
                    <option value="white-black">White to Black</option>
                    <option value="white-dark-blue">White to Blue</option>
                  </select>
                </div>
                <div class="style-row">
                  <label for="gradient-start-colour">Gradient start colour</label>
                  <input id="gradient-start-colour" type="color" value="#0ea5e9" />
                </div>
                <div class="style-row">
                  <label for="gradient-middle-enabled" class="gradient-middle-toggle">
                    <input id="gradient-middle-enabled" type="checkbox" />
                    <span>Use middle colour</span>
                  </label>
                </div>
                <div class="style-row">
                  <label for="gradient-middle-colour">Gradient middle colour (optional)</label>
                  <input id="gradient-middle-colour" type="color" value="#facc15" />
                </div>
                <div class="style-row">
                  <label for="gradient-end-colour">Gradient end colour</label>
                  <input id="gradient-end-colour" type="color" value="#ef4444" />
                </div>
              </div>
              <div class="style-row style-row-inline">
                <div class="style-row-field">
                  <label for="stroke-colour-input">Stroke colour (optional)</label>
                  <input id="stroke-colour-input" type="color" value="#f8fafc" />
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
              <button type="button" class="collapsible-toggle" aria-expanded="true" aria-controls="new-features-content">
                <span class="caret" aria-hidden="true">▾</span>
                <span>New Features</span>
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
                <span>Feature Properties</span>
              </button>
            </header>
            <div id="feature-properties-content" class="collapsible-content">
              <p id="selection-hint">Select a feature on the map to edit its attributes.</p>
              <div id="properties-container" class="properties-container" role="group" aria-describedby="selection-hint"></div>
              <div class="property-actions">
                <button id="add-property-btn" type="button">Add property</button>
                <button id="edit-vertices-btn" type="button">Edit vertices</button>
                <button id="delete-feature-btn" type="button">Delete feature</button>
              </div>
            </div>
          </section>
          <section class="properties-group collapsible-section" aria-live="polite">
            <header class="group-header collapsible-header">
              <button type="button" class="collapsible-toggle" aria-expanded="true" aria-controls="document-data-content">
                <span class="caret" aria-hidden="true">▾</span>
                <span>Document Data</span>
              </button>
            </header>
            <div id="document-data-content" class="collapsible-content">
              <div class="control-group">
                <label for="geojson-input" id="raw-label">Document data</label>
                <textarea id="geojson-input" spellcheck="false"></textarea>
              </div>
              <div class="actions">
                <button id="apply-btn" type="button">Apply Changes</button>
                <span id="status" role="status"></span>
              </div>
            </div>
          </section>
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

export function deactivate(): void {}
