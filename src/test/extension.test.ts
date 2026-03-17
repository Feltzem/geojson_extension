import * as assert from "assert";
import * as vscode from "vscode";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Array does not include unknown values", () => {
    assert.ok(![1, 2, 3].includes(5));
    assert.ok(![1, 2, 3].includes(0));
  });
});
