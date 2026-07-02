import * as assert from "assert";

import {
  DEFAULT_EDITOR_SETTINGS,
  buildWebviewCsp,
  fromWebviewText,
  normaliseEditorSettings,
  resolveWebviewEditText,
  toWebviewPayload,
} from "../extension";

suite("GeoJSON Visual Editor", () => {
  test("uses an empty feature collection for blank documents", () => {
    const payload = toWebviewPayload("  ");

    assert.strictEqual(payload.error, undefined);
    assert.deepStrictEqual(JSON.parse(payload.text), {
      type: "FeatureCollection",
      features: [],
    });
  });

  test("preserves raw document text for the webview", () => {
    const rawText = '{"type":"FeatureCollection","features":[]}';
    const payload = toWebviewPayload(rawText);

    assert.strictEqual(payload.error, undefined);
    assert.strictEqual(payload.text, rawText);
  });

  test("passes invalid JSON through for webview-side reporting", () => {
    const payload = toWebviewPayload("{ invalid");

    assert.strictEqual(payload.error, undefined);
    assert.strictEqual(payload.text, "{ invalid");
  });

  test("normalises edited webview JSON before persisting", () => {
    const text = fromWebviewText('{"type":"FeatureCollection","features":[]}');

    assert.strictEqual(
      text,
      '{\n  "type": "FeatureCollection",\n  "features": []\n}',
    );
  });

  test("rejects invalid edited webview JSON before persisting", () => {
    assert.throws(() => fromWebviewText("{ invalid"), /expected|invalid/i);
  });

  test("passes preformatted webview edits through without re-formatting", () => {
    const preformatted = '{\n  "type": "FeatureCollection",\n  "features": []\n}';

    assert.strictEqual(resolveWebviewEditText(preformatted, true), preformatted);
  });

  test("re-formats webview edits that are not marked preformatted", () => {
    const text = resolveWebviewEditText(
      '{"type":"FeatureCollection","features":[]}',
      false,
    );

    assert.strictEqual(
      text,
      '{\n  "type": "FeatureCollection",\n  "features": []\n}',
    );
  });

  test("still validates webview edits that are not marked preformatted", () => {
    assert.throws(
      () => resolveWebviewEditText("{ invalid", false),
      /expected|invalid/i,
    );
  });

  test("allows Cartograph font loading in the webview CSP", () => {
    const csp = buildWebviewCsp("vscode-resource:", "nonce-value");

    assert.match(csp, /script-src 'nonce-nonce-value' https:\/\/unpkg.com/);
    assert.match(csp, /style-src .*https:\/\/fonts\.googleapis\.com/);
    assert.match(csp, /connect-src .*https:\/\/fonts\.gstatic\.com/);
    assert.match(csp, /font-src .*https:\/\/fonts\.gstatic\.com/);
  });

  test("normalises valid editor settings", () => {
    const settings = normaliseEditorSettings({
      uiScale: 1.25,
      defaultBasemap: "carto-voyager",
      defaultFillColor: "#abc",
      defaultStrokeColor: "",
      defaultLineWidth: 7.5,
      defaultStrokeWidth: 2.5,
      defaultLabelsEnabled: true,
      defaultLabelFontFamily: "Open Sans Bold",
      defaultLabelSize: 16,
      defaultCategoricalPalette: "pastel",
    });

    assert.deepStrictEqual(settings, {
      uiScale: 1.25,
      defaultBasemap: "carto-voyager",
      defaultFillColor: "#AABBCC",
      defaultStrokeColor: "",
      defaultLineWidth: 7.5,
      defaultStrokeWidth: 2.5,
      defaultLabelsEnabled: true,
      defaultLabelFontFamily: "Open Sans Bold",
      defaultLabelSize: 16,
      defaultCategoricalPalette: "pastel",
    });
  });

  test("falls back for invalid editor settings", () => {
    const settings = normaliseEditorSettings({
      uiScale: 2,
      defaultBasemap: "satellite",
      defaultFillColor: "blue",
      defaultStrokeColor: "none",
      defaultLineWidth: 0,
      defaultStrokeWidth: 99,
      defaultLabelsEnabled: "true",
      defaultLabelFontFamily: "Comic Sans MS",
      defaultLabelSize: 4,
    });

    assert.deepStrictEqual(settings, DEFAULT_EDITOR_SETTINGS);
  });
});
