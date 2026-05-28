"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const extension_1 = require("../extension");
suite("GeoJSON Visual Editor", () => {
    test("uses an empty feature collection for blank documents", () => {
        const payload = (0, extension_1.toWebviewPayload)("  ");
        assert.strictEqual(payload.error, undefined);
        assert.deepStrictEqual(JSON.parse(payload.text), {
            type: "FeatureCollection",
            features: [],
        });
    });
    test("preserves raw document text for the webview", () => {
        const rawText = '{"type":"FeatureCollection","features":[]}';
        const payload = (0, extension_1.toWebviewPayload)(rawText);
        assert.strictEqual(payload.error, undefined);
        assert.strictEqual(payload.text, rawText);
    });
    test("passes invalid JSON through for webview-side reporting", () => {
        const payload = (0, extension_1.toWebviewPayload)("{ invalid");
        assert.strictEqual(payload.error, undefined);
        assert.strictEqual(payload.text, "{ invalid");
    });
    test("normalises edited webview JSON before persisting", () => {
        const text = (0, extension_1.fromWebviewText)('{"type":"FeatureCollection","features":[]}');
        assert.strictEqual(text, '{\n  "type": "FeatureCollection",\n  "features": []\n}');
    });
    test("allows Cartograph font loading in the webview CSP", () => {
        const csp = (0, extension_1.buildWebviewCsp)("vscode-resource:", "nonce-value");
        assert.match(csp, /script-src 'nonce-nonce-value' https:\/\/unpkg.com/);
        assert.match(csp, /style-src .*https:\/\/fonts\.googleapis\.com/);
        assert.match(csp, /connect-src .*https:\/\/fonts\.gstatic\.com/);
        assert.match(csp, /font-src .*https:\/\/fonts\.gstatic\.com/);
    });
    test("normalises valid editor settings", () => {
        const settings = (0, extension_1.normaliseEditorSettings)({
            uiScale: 1.25,
            defaultBasemap: "carto-voyager",
            defaultFillColor: "#abc",
            defaultStrokeColor: "",
            defaultLineWidth: 7.5,
            defaultStrokeWidth: 2.5,
            defaultLabelsEnabled: true,
            defaultLabelFontFamily: "Open Sans Bold",
            defaultLabelSize: 16,
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
        });
    });
    test("falls back for invalid editor settings", () => {
        const settings = (0, extension_1.normaliseEditorSettings)({
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
        assert.deepStrictEqual(settings, extension_1.DEFAULT_EDITOR_SETTINGS);
    });
});
//# sourceMappingURL=extension.test.js.map