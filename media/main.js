(() => {
  const vscode = acquireVsCodeApi();
  const textArea = document.getElementById("geojson-input");
  const highlightLayer = document.getElementById("geojson-highlight");
  const attributeSelect = document.getElementById("attribute-select");
  const applyButton = document.getElementById("apply-btn");
  const statusNode = document.getElementById("status");
  const propertiesContainer = document.getElementById("properties-container");
  const addPropertyButton = document.getElementById("add-property-btn");
  const editVerticesButton = document.getElementById("edit-vertices-btn");
  const deleteFeatureButton = document.getElementById("delete-feature-btn");
  const addPointButton = document.getElementById("add-point-btn");
  const addLineButton = document.getElementById("add-linestring-btn");
  const addPolygonButton = document.getElementById("add-polygon-btn");
  const loadingIndicator = document.getElementById("loading-indicator");
  const rawLabel = document.getElementById("raw-label");
  const subtitle = document.querySelector(".subtitle");
  const featureCountIndicator = document.getElementById(
    "feature-count-indicator",
  );
  const fileSizeIndicator = document.getElementById("file-size-indicator");
  const tooltipToggleInput = document.getElementById("tooltip-toggle-input");
  const basemapSelect = document.getElementById("basemap-select");
  const fillColourInput = document.getElementById("fill-colour-input");
  const strokeColourInput = document.getElementById("stroke-colour-input");
  const clearStrokeButton = document.getElementById("clear-stroke-btn");
  const lineWidthInput = document.getElementById("line-width-input");
  const lineWidthValue = document.getElementById("line-width-value");
  const strokeWidthInput = document.getElementById("stroke-width-input");
  const strokeWidthValue = document.getElementById("stroke-width-value");
  const attributeColourModeSelect = document.getElementById(
    "attribute-colour-mode",
  );
  const gradientControls = document.getElementById("gradient-controls");
  const gradientStartColourInput = document.getElementById(
    "gradient-start-colour",
  );
  const gradientMiddleEnabledInput = document.getElementById(
    "gradient-middle-enabled",
  );
  const gradientMiddleColourInput = document.getElementById(
    "gradient-middle-colour",
  );
  const gradientEndColourInput = document.getElementById("gradient-end-colour");
  const gradientPresetSelect = document.getElementById(
    "gradient-preset-select",
  );
  const opacityAttributeSelect = document.getElementById(
    "opacity-attribute-select",
  );
  const opacityMinInput = document.getElementById("opacity-min-input");
  const opacityMaxInput = document.getElementById("opacity-max-input");
  const opacityMinValue = document.getElementById("opacity-min-value");
  const opacityMaxValue = document.getElementById("opacity-max-value");
  const roundDecimalsInput = document.getElementById("round-decimals-input");
  const roundCoordinatesButton = document.getElementById(
    "round-coordinates-btn",
  );
  const collapsibleToggles = document.querySelectorAll(".collapsible-toggle");

  const palette = [
    "#3b82f6",
    "#ec4899",
    "#f97316",
    "#22c55e",
    "#a855f7",
    "#14b8a6",
    "#facc15",
    "#ef4444",
    "#6366f1",
    "#f59e0b",
    "#0ea5e9",
    "#10b981",
  ];

  const gradientPresets = {
    magma: {
      start: "#000004",
      middle: "#b53679",
      end: "#fcfdbf",
      hasMiddle: true,
    },
    viridis: {
      start: "#440154",
      middle: "#21908c",
      end: "#fde725",
      hasMiddle: true,
    },
    "white-dark-red": {
      start: "#ffffff",
      end: "#BA1717",
      hasMiddle: false,
    },
    "white-black": {
      start: "#ffffff",
      end: "#000000",
      hasMiddle: false,
    },
    "white-dark-blue": {
      start: "#ffffff",
      end: "#08306b",
      hasMiddle: false,
    },
  };

  const clickableLayers = [
    "geojson-fill",
    "geojson-outline",
    "geojson-line",
    "geojson-point",
  ];
  const emptyCollection = { type: "FeatureCollection", features: [] };
  const basemapStyles = {
    "carto-positron":
      "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    "carto-voyager":
      "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
    "carto-dark-matter":
      "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  };
  const utils = window.geojsonEditorUtils;

  if (!utils) {
    throw new Error("geojson-utils.js failed to load.");
  }

  const {
    clampLatitude,
    clampNumber,
    coerceValue,
    collectFeatures,
    fitToDataBounds,
    normaliseColour,
    normaliseGeoJson,
    normaliseLongitude,
    roundFeatureCollection,
    sanitizeProperties,
    serialiseValue,
  } = utils;

  let currentText = "";
  let currentGeoJson = null;
  let map;
  let mapReady = false;
  let pendingUpdate = null;
  let selectedFeatureIndex = null;
  let pendingFocusKey = null;
  let mapHasData = false;
  let hasFitOnce = false;
  let isEditingVertices = false;
  let vertexMarkers = [];
  let draggedVertex = null;
  let loadingTimeout = null;
  let hoverPopup = null;
  let hoverTooltipsEnabled = Boolean(tooltipToggleInput?.checked ?? true);
  let coordinatePrecision = parsePrecision(roundDecimalsInput?.value);
  let selectedBasemap = basemapSelect?.value || "carto-positron";
  let toolbarMetricsNode = null;

  const styleState = {
    fillColor: "#2563eb",
    strokeColor: "#f8fafc",
    strokeEnabled: true,
    lineWidth: 4,
    strokeWidth: 1.2,
    attributeColourMode: "categorical",
    gradientStartColor: "#0ea5e9",
    gradientMiddleEnabled: false,
    gradientMiddleColor: "#facc15",
    gradientEndColor: "#ef4444",
    gradientPreset: "custom",
    opacityAttribute: "",
    minTransparency: 10,
    maxTransparency: 80,
  };

  document.addEventListener("DOMContentLoaded", () => {
    initialiseMap();
    initialiseJsonEditorHighlighting();
    updateDocumentMetrics();
    vscode.postMessage({ type: "ready" });
  });

  window.addEventListener("message", (event) => {
    const message = event.data;
    if (!message || typeof message !== "object") {
      return;
    }

    if (message.type === "update") {
      const text = typeof message.text === "string" ? message.text : "";
      if (text !== currentText) {
        currentText = text;
      }
      loadTextIntoEditor(text);
      if (message.error) {
        setStatus(message.error, "error");
      }
      return;
    }
  });

  applyButton.addEventListener("click", () => {
    const nextText = textArea.value;
    if (!nextText || !nextText.trim().length) {
      setStatus("GeoJSON cannot be empty.", "error");
      return;
    }

    try {
      const parsed = JSON.parse(nextText);
      const normalised = normaliseGeoJson(parsed);
      if (!normalised) {
        throw new Error("Unsupported GeoJSON structure.");
      }
      const rounded = roundFeatureCollection(normalised, coordinatePrecision);
      const { collection, notice } = enforceFormatConstraints(rounded);
      const serialised = JSON.stringify(collection, null, 2);
      currentText = serialised;
      currentGeoJson = collection;
      setEditorText(serialised);
      updateMap(collection);
      populateAttributeOptions(collection);
      applyColouring(attributeSelect.value);
      refreshSelectionState();
      updateAddFeatureButtonsState();
      setStatus("Changes applied locally. Saving...", "");
      vscode.postMessage({ type: "edit", text: serialised });
      const successMessage = notice
        ? `Saved to workspace. ${notice}`
        : "Saved to workspace.";
      setStatus(successMessage.trim(), "success");
      updateDocumentMetrics();
    } catch (error) {
      setStatus(formatError(error), "error");
    }
  });

  if (basemapSelect) {
    basemapSelect.addEventListener("change", () => {
      selectedBasemap = basemapSelect.value;
      applyBasemapStyle();
    });
  }

  // offline basemap control removed

  if (roundDecimalsInput) {
    roundDecimalsInput.addEventListener("change", () => {
      coordinatePrecision = parsePrecision(roundDecimalsInput.value);
      roundDecimalsInput.value = String(coordinatePrecision);
    });
  }

  if (roundCoordinatesButton) {
    roundCoordinatesButton.addEventListener("click", () => {
      roundCurrentCoordinates();
    });
  }

  attributeSelect.addEventListener("change", () => {
    updateAttributeColouringControls();
    applyColouring(attributeSelect.value);
  });

  attributeColourModeSelect.addEventListener("change", () => {
    styleState.attributeColourMode = attributeColourModeSelect.value;
    updateAttributeColouringControls();
    applyColouring(attributeSelect.value);
  });

  gradientPresetSelect.addEventListener("change", () => {
    const presetKey = gradientPresetSelect.value;
    styleState.gradientPreset = presetKey;
    if (presetKey !== "custom") {
      applyGradientPreset(presetKey);
    }
    updateAttributeColouringControls();
    syncStyleInputs();
    applyColouring(attributeSelect.value);
  });

  gradientStartColourInput.addEventListener("input", () => {
    styleState.gradientStartColor = normaliseColour(
      gradientStartColourInput.value,
      styleState.gradientStartColor,
    );
    styleState.gradientPreset = "custom";
    syncStyleInputs();
    applyColouring(attributeSelect.value);
  });

  gradientMiddleEnabledInput.addEventListener("change", () => {
    styleState.gradientMiddleEnabled = gradientMiddleEnabledInput.checked;
    styleState.gradientPreset = "custom";
    updateAttributeColouringControls();
    applyColouring(attributeSelect.value);
  });

  gradientMiddleColourInput.addEventListener("input", () => {
    styleState.gradientMiddleColor = normaliseColour(
      gradientMiddleColourInput.value,
      styleState.gradientMiddleColor,
    );
    styleState.gradientPreset = "custom";
    syncStyleInputs();
    applyColouring(attributeSelect.value);
  });

  gradientEndColourInput.addEventListener("input", () => {
    styleState.gradientEndColor = normaliseColour(
      gradientEndColourInput.value,
      styleState.gradientEndColor,
    );
    styleState.gradientPreset = "custom";
    syncStyleInputs();
    applyColouring(attributeSelect.value);
  });

  opacityAttributeSelect.addEventListener("change", () => {
    styleState.opacityAttribute = opacityAttributeSelect.value;
    updateOpacityControls();
    applyColouring(attributeSelect.value);
  });

  opacityMinInput.addEventListener("input", () => {
    const nextMin = clampNumber(Number(opacityMinInput.value), 0, 100, 10);
    styleState.minTransparency = Math.min(nextMin, styleState.maxTransparency);
    if (styleState.minTransparency !== nextMin) {
      opacityMinInput.value = String(styleState.minTransparency);
    }
    syncStyleInputs();
    applyColouring(attributeSelect.value);
  });

  opacityMaxInput.addEventListener("input", () => {
    const nextMax = clampNumber(Number(opacityMaxInput.value), 0, 100, 80);
    styleState.maxTransparency = Math.max(nextMax, styleState.minTransparency);
    if (styleState.maxTransparency !== nextMax) {
      opacityMaxInput.value = String(styleState.maxTransparency);
    }
    syncStyleInputs();
    applyColouring(attributeSelect.value);
  });

  fillColourInput.addEventListener("input", () => {
    styleState.fillColor = normaliseColour(fillColourInput.value, "#2563eb");
    syncStyleInputs();
    applyColouring(attributeSelect.value);
  });

  strokeColourInput.addEventListener("input", () => {
    styleState.strokeColor = normaliseColour(
      strokeColourInput.value,
      styleState.strokeColor,
    );
    styleState.strokeEnabled = true;
    syncStyleInputs();
    applyColouring(attributeSelect.value);
  });

  clearStrokeButton.addEventListener("click", () => {
    styleState.strokeEnabled = false;
    syncStyleInputs();
    applyColouring(attributeSelect.value);
  });

  lineWidthInput.addEventListener("input", () => {
    styleState.lineWidth = clampNumber(Number(lineWidthInput.value), 1, 16, 4);
    syncStyleInputs();
    applyColouring(attributeSelect.value);
  });

  strokeWidthInput.addEventListener("input", () => {
    styleState.strokeWidth = clampNumber(
      Number(strokeWidthInput.value),
      0.5,
      12,
      1.2,
    );
    syncStyleInputs();
    applyColouring(attributeSelect.value);
  });

  if (tooltipToggleInput) {
    tooltipToggleInput.addEventListener("change", () => {
      hoverTooltipsEnabled = tooltipToggleInput.checked;
      if (!hoverTooltipsEnabled) {
        hideHoverTooltip();
        if (mapReady) {
          map.getCanvas().style.cursor = "";
        }
      }
    });
  }

  syncStyleInputs();
  updateStyleControlAvailability(emptyCollection);
  updateAttributeColouringControls();
  updateOpacityControls();
  initialiseCollapsibleSections();

  addPropertyButton.addEventListener("click", () => {
    const feature = getSelectedFeature();
    if (!feature) {
      setStatus("Select a feature on the map to add properties.", "");
      return;
    }

    const properties = ensureProperties(feature);
    const newKey = generateUniqueKey(properties);
    properties[newKey] = "";
    pendingFocusKey = newKey;
    commitPropertyChanges("Property added.");
  });

  editVerticesButton.addEventListener("click", () => {
    const feature = getSelectedFeature();
    if (!feature) {
      setStatus("Select a feature on the map to edit vertices.", "");
      return;
    }

    if (isEditingVertices) {
      exitVertexEditMode();
    } else {
      enterVertexEditMode(feature);
    }
  });

  if (deleteFeatureButton) {
    deleteFeatureButton.addEventListener("click", () => {
      deleteSelectedFeature();
    });
  }

  const addFeatureButtons = [
    { element: addPointButton, type: "Point" },
    { element: addLineButton, type: "LineString" },
    { element: addPolygonButton, type: "Polygon" },
  ];

  addFeatureButtons.forEach(({ element, type }) => {
    if (!element) {
      return;
    }
    element.addEventListener("click", () => addFeatureOfType(type));
  });

  updateDocumentFormatUI();
  updateBasemapControlsState();

  function initialiseCollapsibleSections() {
    collapsibleToggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const section = toggle.closest(".collapsible-section");
        if (!section) {
          return;
        }
        const willExpand = section.classList.contains("collapsed");
        section.classList.toggle("collapsed", !willExpand);
        toggle.setAttribute("aria-expanded", willExpand ? "true" : "false");
      });
    });
  }

  function initialiseMap() {
    map = new maplibregl.Map({
      container: "map",
      style: getCurrentBasemapStyle(),
      center: [0, 0],
      zoom: 1,
    });

    map.addControl(new maplibregl.NavigationControl());
    map.addControl(createDocumentMetricsControl(), "top-left");
    map.addControl(createFitToFeaturesControl(), "top-right");

    map.on("load", () => {
      mapReady = true;
      updateAddFeatureButtonsState();
      map.on("click", handleMapClick);
      map.on("mousemove", handleMapHover);
      map.getCanvasContainer().addEventListener("mouseleave", () => {
        hideHoverTooltip();
        map.getCanvas().style.cursor = "";
      });
      if (pendingUpdate) {
        const { data, options } = pendingUpdate;
        pendingUpdate = null;
        updateMap(data, options);
      }
      updateDocumentMetrics();
    });
  }

  function getCurrentBasemapStyle() {
    return basemapStyles[selectedBasemap] || basemapStyles["carto-positron"];
  }

  function applyBasemapStyle() {
    if (!map) {
      return;
    }

    setLoading(true);
    mapReady = false;
    let settled = false;
    let timeoutHandle = null;

    const cleanup = () => {
      map.off("style.load", onReady);
      map.off("idle", onReady);
      map.off("error", onError);
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }
    };

    const onReady = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      mapReady = true;
      const data = currentGeoJson || emptyCollection;
      updateMap(data);
      applyColouring(attributeSelect.value);
      updateStyleControlAvailability(data);
      updateDocumentMetrics();
      setLoading(false);
    };

    const onError = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      mapReady = Boolean(map?.isStyleLoaded?.());
      setLoading(false);
      setStatus("Unable to load selected basemap.", "error");
    };

    map.on("style.load", onReady);
    map.on("idle", onReady);
    map.on("error", onError);

    timeoutHandle = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      mapReady = Boolean(map?.isStyleLoaded?.());
      setLoading(false);
      setStatus("Basemap change timed out.", "error");
    }, 10000);

    try {
      map.setStyle(getCurrentBasemapStyle());
    } catch (error) {
      onError();
    }
  }

  function createDocumentMetricsControl() {
    return {
      onAdd() {
        const container = document.createElement("div");
        container.className =
          "maplibregl-ctrl maplibregl-ctrl-group toolbar-metrics-control";

        const node = document.createElement("div");
        node.className = "toolbar-metrics-label";
        node.textContent = "Features: 0 | Size: 0 B";

        container.appendChild(node);
        toolbarMetricsNode = node;
        return container;
      },
      onRemove() {
        toolbarMetricsNode = null;
      },
    };
  }

  function updateBasemapControlsState() {
    if (!basemapSelect) {
      return;
    }
    // offline basemap feature removed; nothing to update here
  }

  function handleMapClick(event) {
    if (!mapReady) {
      return;
    }

    // Don't handle feature selection if we're editing vertices
    if (isEditingVertices) {
      return;
    }

    const features = map.queryRenderedFeatures(event.point, {
      layers: clickableLayers,
    });
    if (!features.length) {
      clearSelection();
      return;
    }

    const target = features[0];
    const index = target?.properties
      ? target.properties.__editorIndex
      : undefined;
    if (Number.isInteger(index)) {
      selectFeature(Number(index));
    } else {
      clearSelection();
    }
  }

  function handleMapHover(event) {
    if (!mapReady || !hoverTooltipsEnabled || isEditingVertices) {
      hideHoverTooltip();
      if (mapReady) {
        map.getCanvas().style.cursor = "";
      }
      return;
    }

    const features = map.queryRenderedFeatures(event.point, {
      layers: clickableLayers,
    });

    if (!features.length) {
      hideHoverTooltip();
      map.getCanvas().style.cursor = "";
      return;
    }

    map.getCanvas().style.cursor = "pointer";
    const tooltipHtml = buildHoverTooltipHtml(features[0]);
    if (!tooltipHtml) {
      hideHoverTooltip();
      return;
    }

    if (!hoverPopup) {
      hoverPopup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: "feature-tooltip-popup",
        offset: 12,
      });
    }

    hoverPopup.setLngLat(event.lngLat).setHTML(tooltipHtml).addTo(map);
  }

  function hideHoverTooltip() {
    if (!hoverPopup) {
      return;
    }
    hoverPopup.remove();
  }

  function createFitToFeaturesControl() {
    return {
      onAdd() {
        const container = document.createElement("div");
        container.className =
          "maplibregl-ctrl maplibregl-ctrl-group fit-features-control";

        const button = document.createElement("button");
        button.type = "button";
        button.className = "fit-features-button";
        button.textContent = "<>";
        button.setAttribute("title", "Fit map to all features");
        button.setAttribute("aria-label", "Fit map to all features");
        button.addEventListener("click", () => {
          if (!currentGeoJson || !collectFeatures(currentGeoJson).length) {
            setStatus("No features available to fit.", "");
            return;
          }
          fitToDataBounds(map, currentGeoJson);
        });

        container.appendChild(button);
        this._container = container;
        return container;
      },
      onRemove() {
        this._container?.remove();
      },
    };
  }

  function selectFeature(index) {
    if (
      !currentGeoJson ||
      !currentGeoJson.features ||
      !currentGeoJson.features[index]
    ) {
      clearSelection();
      return;
    }

    selectedFeatureIndex = index;
    refreshSelectionState();
  }

  function clearSelection() {
    selectedFeatureIndex = null;
    exitVertexEditMode();
    refreshSelectionState();
  }

  function refreshSelectionState() {
    const feature = getSelectedFeature();
    renderPropertiesPanel(feature);
    refreshSelectionHighlight();
    if (isEditingVertices && feature) {
      updateVertexMarkers(feature);
    }
  }

  function updateAddFeatureButtonsState() {
    const shouldDisable = !mapReady;

    addFeatureButtons.forEach(({ element }) => {
      if (!element) {
        return;
      }
      element.disabled = shouldDisable;
      element.removeAttribute("title");
      element.removeAttribute("aria-disabled");
    });
  }

  function renderPropertiesPanel(feature) {
    propertiesContainer.innerHTML = "";
    updateAddFeatureButtonsState();

    if (!feature) {
      addPropertyButton.disabled = true;
      addPropertyButton.setAttribute("aria-disabled", "true");
      addPropertyButton.setAttribute(
        "title",
        "Select a feature to add properties.",
      );
      editVerticesButton.disabled = true;
      if (deleteFeatureButton) {
        deleteFeatureButton.disabled = true;
      }
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent =
        "Pick a feature on the map to view and edit its properties.";
      propertiesContainer.appendChild(empty);
      return;
    }

    editVerticesButton.disabled = false;
    if (deleteFeatureButton) {
      deleteFeatureButton.disabled = false;
    }
    editVerticesButton.textContent = isEditingVertices
      ? "Stop editing"
      : "Edit vertices";

    addPropertyButton.disabled = false;
    addPropertyButton.removeAttribute("aria-disabled");
    addPropertyButton.removeAttribute("title");

    const properties = sanitizeProperties(feature.properties);
    const entries = Object.entries(properties);
    if (!entries.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No properties yet. Add one to get started.";
      propertiesContainer.appendChild(empty);
    }

    for (const [key, value] of entries) {
      const row = createPropertyRow(key, value);
      propertiesContainer.appendChild(row);
    }

    if (pendingFocusKey) {
      const focusInput = propertiesContainer.querySelector(
        `[data-key="${pendingFocusKey}"] input.property-key`,
      );
      if (focusInput) {
        focusInput.focus();
      }
      pendingFocusKey = null;
    }
  }

  function createPropertyRow(key, value) {
    const row = document.createElement("div");
    row.className = "property-row";
    row.dataset.key = key;

    const keyInput = document.createElement("input");
    keyInput.className = "property-key";
    keyInput.value = key;
    keyInput.placeholder = "property name";

    const valueInput = document.createElement("input");
    valueInput.className = "property-value";
    valueInput.value = serialiseValue(value);
    valueInput.placeholder = "value";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "property-remove";
    removeButton.innerHTML = "&times;";
    removeButton.setAttribute("aria-label", "Remove property");
    removeButton.setAttribute("title", "Remove property");

    keyInput.addEventListener("change", () => renameProperty(row, keyInput));
    valueInput.addEventListener("change", () =>
      updatePropertyValue(row, valueInput),
    );
    removeButton.addEventListener("click", () => removeProperty(row));

    row.appendChild(keyInput);
    row.appendChild(valueInput);
    row.appendChild(removeButton);
    return row;
  }

  function renameProperty(row, input) {
    const feature = getSelectedFeature();
    if (!feature) {
      return;
    }

    const properties = ensureProperties(feature);
    const oldKey = row.dataset.key || "";
    const newKey = input.value.trim();
    if (!newKey.length) {
      setStatus("Property name cannot be empty.", "error");
      input.value = oldKey;
      return;
    }

    if (newKey === oldKey) {
      return;
    }

    if (Object.prototype.hasOwnProperty.call(properties, newKey)) {
      setStatus(`A property named "${newKey}" already exists.`, "error");
      input.value = oldKey;
      return;
    }

    const value = properties[oldKey];
    delete properties[oldKey];
    properties[newKey] = value;
    row.dataset.key = newKey;
    pendingFocusKey = newKey;
    commitPropertyChanges("Property renamed.");
  }

  function updatePropertyValue(row, input) {
    const feature = getSelectedFeature();
    if (!feature) {
      return;
    }

    const key = row.dataset.key;
    if (!key) {
      return;
    }

    const properties = ensureProperties(feature);
    properties[key] = coerceValue(input.value);
    commitPropertyChanges("Property updated.");
  }

  function removeProperty(row) {
    const feature = getSelectedFeature();
    if (!feature) {
      return;
    }

    const key = row.dataset.key;
    if (!key) {
      return;
    }

    const properties = ensureProperties(feature);
    delete properties[key];
    commitPropertyChanges("Property removed.");
  }

  function commitPropertyChanges(message, options = {}) {
    if (!currentGeoJson) {
      return;
    }

    const rounded = roundFeatureCollection(currentGeoJson, coordinatePrecision);
    const { collection, notice } = enforceFormatConstraints(rounded);
    currentGeoJson = collection;
    const serialised = JSON.stringify(collection, null, 2);
    currentText = serialised;
    setEditorText(serialised);
    const { forceFit = false } = options;
    updateMap(collection, { forceFit });
    populateAttributeOptions(collection);
    updateStyleControlAvailability(collection);
    applyColouring(attributeSelect.value);
    updateAddFeatureButtonsState();
    const statusMessage = notice ? `${message} ${notice}` : message;
    setStatus(
      `${statusMessage.trim()} Click Apply Changes to save to disk.`,
      "",
    );
    refreshSelectionState();
    updateDocumentMetrics();
  }

  function ensureProperties(feature) {
    if (!feature.properties || typeof feature.properties !== "object") {
      feature.properties = {};
    }
    return feature.properties;
  }

  function generateUniqueKey(properties) {
    const keys = new Set(Object.keys(sanitizeProperties(properties)));
    const base = "new_property";
    let candidate = base;
    let counter = 1;
    while (keys.has(candidate)) {
      candidate = `${base}_${counter}`;
      counter += 1;
    }
    return candidate;
  }

  function getSelectedFeature() {
    if (!currentGeoJson || !Array.isArray(currentGeoJson.features)) {
      return null;
    }
    if (!Number.isInteger(selectedFeatureIndex)) {
      return null;
    }
    const feature = currentGeoJson.features[selectedFeatureIndex] || null;
    if (feature) {
      ensureProperties(feature);
    }
    return feature;
  }

  function loadTextIntoEditor(text) {
    setLoading(true);
    setEditorText(text);
    currentText = text;
    if (!text) {
      currentGeoJson = null;
      clearSelection();
      updateMap(emptyCollection);
      populateAttributeOptions(emptyCollection);
      updateStyleControlAvailability(emptyCollection);
      clearStatus();
      setLoading(false);
      updateAddFeatureButtonsState();
      updateDocumentMetrics();
      return;
    }

    try {
      const parsed = JSON.parse(text);
      const normalised = normaliseGeoJson(parsed);
      if (!normalised) {
        throw new Error("Unsupported GeoJSON structure.");
      }
      const rounded = roundFeatureCollection(normalised, coordinatePrecision);
      const { collection, notice } = enforceFormatConstraints(rounded);
      const serialised = JSON.stringify(collection, null, 2);
      currentGeoJson = collection;
      currentText = serialised;
      setEditorText(serialised);
      const shouldForceFit = !hasFitOnce;
      updateMap(collection, { forceFit: shouldForceFit });
      populateAttributeOptions(collection);
      updateStyleControlAvailability(collection);
      applyColouring(attributeSelect.value);
      if (!getSelectedFeature()) {
        clearSelection();
      } else {
        refreshSelectionState();
      }
      if (notice) {
        setStatus(notice, "");
      } else {
        clearStatus();
      }
      updateDocumentMetrics();
    } catch (error) {
      setStatus(formatError(error), "error");
    } finally {
      setLoading(false);
      updateAddFeatureButtonsState();
      updateDocumentMetrics();
    }
  }

  function updateMap(data, options = {}) {
    const { forceFit = false } = options;
    if (!mapReady) {
      pendingUpdate = { data, options: { forceFit } };
      return;
    }

    const sourceId = "geojson-data";
    const prepared = prepareMapData(data) || emptyCollection;
    const hasFeatures = prepared.features.length > 0;

    if (map.getSource(sourceId)) {
      const source = map.getSource(sourceId);
      if (source && "setData" in source) {
        source.setData(prepared);
      }
    } else {
      map.addSource(sourceId, {
        type: "geojson",
        data: prepared,
      });

      map.addLayer({
        id: "geojson-fill",
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": styleState.fillColor,
          "fill-opacity": 0.55,
        },
        filter: ["==", ["geometry-type"], "Polygon"],
      });

      map.addLayer({
        id: "geojson-outline",
        type: "line",
        source: sourceId,
        paint: {
          "line-color": styleState.strokeColor,
          "line-width": styleState.strokeEnabled ? styleState.strokeWidth : 0,
        },
        filter: ["==", ["geometry-type"], "Polygon"],
      });

      map.addLayer({
        id: "geojson-line",
        type: "line",
        source: sourceId,
        paint: {
          "line-color": styleState.fillColor,
          "line-width": styleState.lineWidth,
          "line-opacity": 1,
        },
        filter: [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false,
        ],
      });

      map.addLayer({
        id: "geojson-point",
        type: "circle",
        source: sourceId,
        paint: {
          "circle-radius": 6,
          "circle-color": styleState.fillColor,
          "circle-stroke-color": styleState.strokeColor,
          "circle-stroke-width": styleState.strokeEnabled
            ? styleState.strokeWidth
            : 0,
          "circle-opacity": 1,
        },
        filter: [
          "match",
          ["geometry-type"],
          ["Point", "MultiPoint"],
          true,
          false,
        ],
      });

      map.addLayer({
        id: "geojson-highlight-fill",
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": "#fde68a",
          "fill-opacity": 0.6,
        },
        filter: ["==", ["get", "__editorIndex"], -1],
      });

      map.addLayer({
        id: "geojson-highlight-line",
        type: "line",
        source: sourceId,
        paint: {
          "line-color": "#fde68a",
          "line-width": 6,
        },
        filter: ["==", ["get", "__editorIndex"], -1],
      });

      map.addLayer({
        id: "geojson-highlight-point",
        type: "circle",
        source: sourceId,
        paint: {
          "circle-radius": 8,
          "circle-color": "#fde68a",
          "circle-stroke-color": "#facc15",
          "circle-stroke-width": 2,
        },
        filter: ["==", ["get", "__editorIndex"], -1],
      });

      safeMoveLayer("geojson-highlight-fill", "geojson-outline");
      safeMoveLayer("geojson-highlight-line", "geojson-line");
      safeMoveLayer("geojson-highlight-point", "geojson-point");
    }

    const shouldFit = (!mapHasData && hasFeatures) || (forceFit && hasFeatures);
    if (shouldFit) {
      fitToDataBounds(map, prepared);
      hasFitOnce = true;
    }

    mapHasData = hasFeatures;
    if (!hasFeatures) {
      hasFitOnce = false;
      hideHoverTooltip();
    }
    refreshSelectionHighlight();
  }

  function buildHoverTooltipHtml(renderedFeature) {
    if (!renderedFeature) {
      return "";
    }

    let properties = {};
    const indexValue = renderedFeature.properties
      ? Number(renderedFeature.properties.__editorIndex)
      : NaN;

    if (
      Number.isInteger(indexValue) &&
      currentGeoJson &&
      Array.isArray(currentGeoJson.features) &&
      currentGeoJson.features[indexValue]
    ) {
      properties = sanitizeProperties(
        currentGeoJson.features[indexValue].properties,
      );
    } else {
      properties = sanitizeProperties(renderedFeature.properties);
    }

    const entries = Object.entries(properties);
    if (!entries.length) {
      return '<div class="feature-tooltip-empty">No attributes</div>';
    }

    const rows = entries
      .map(([key, value]) => {
        const safeKey = escapeHtml(key);
        const safeValue = escapeHtml(formatTooltipValue(value));
        return `<tr><th>${safeKey}</th><td>${safeValue}</td></tr>`;
      })
      .join("");

    return `<table class="feature-tooltip-table"><tbody>${rows}</tbody></table>`;
  }

  function formatTooltipValue(value) {
    if (value === null || typeof value === "undefined") {
      return "";
    }
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch (error) {
        return String(value);
      }
    }
    return String(value);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function prepareMapData(data) {
    const collection = normaliseGeoJson(data);
    if (!collection) {
      return null;
    }

    const features = Array.isArray(collection.features)
      ? collection.features
      : [];
    const decorated = features.map((feature, index) => ({
      type: "Feature",
      geometry: feature.geometry ? cloneGeometry(feature.geometry) : null,
      properties: {
        ...sanitizeProperties(feature.properties),
        __editorIndex: index,
      },
    }));

    return { type: "FeatureCollection", features: decorated };
  }

  function cloneGeometry(geometry) {
    return geometry ? JSON.parse(JSON.stringify(geometry)) : null;
  }

  function refreshSelectionHighlight() {
    if (!mapReady) {
      return;
    }

    const index = Number.isInteger(selectedFeatureIndex)
      ? Number(selectedFeatureIndex)
      : -1;
    setHighlightFilter("geojson-highlight-fill", index);
    setHighlightFilter("geojson-highlight-line", index);
    setHighlightFilter("geojson-highlight-point", index);
  }

  function setHighlightFilter(layerId, index) {
    if (!map.getLayer(layerId)) {
      return;
    }
    const filter =
      index >= 0
        ? ["==", ["get", "__editorIndex"], index]
        : ["==", ["get", "__editorIndex"], -1];
    map.setFilter(layerId, filter);
  }

  function safeMoveLayer(layerId, beforeId) {
    try {
      if (map.getLayer(layerId) && map.getLayer(beforeId)) {
        map.moveLayer(layerId, beforeId);
      }
    } catch (error) {
      // Ignore move errors; layer ordering is cosmetic.
    }
  }

  function populateAttributeOptions(data) {
    const features = collectFeatures(data);
    const attributes = new Set();

    for (const feature of features) {
      const properties = sanitizeProperties(feature.properties);
      for (const key of Object.keys(properties)) {
        const value = properties[key];
        if (value === null) {
          continue;
        }
        const valueType = typeof value;
        if (
          valueType === "string" ||
          valueType === "number" ||
          valueType === "boolean"
        ) {
          attributes.add(key);
        }
      }
    }

    const currentSelection = attributeSelect.value;
    attributeSelect.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "None";
    attributeSelect.appendChild(defaultOption);

    for (const key of Array.from(attributes).sort()) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = key;
      attributeSelect.appendChild(option);
    }

    if (attributes.has(currentSelection)) {
      attributeSelect.value = currentSelection;
    } else {
      attributeSelect.value = "";
    }

    populateOpacityAttributeOptions(features);

    updateAttributeColouringControls();
  }

  function populateOpacityAttributeOptions(features) {
    const numericAttributes = new Set();
    const attributeStats = new Map();

    for (const feature of features) {
      const properties = sanitizeProperties(feature.properties);
      for (const [key, rawValue] of Object.entries(properties)) {
        if (rawValue === null || typeof rawValue === "undefined") {
          continue;
        }
        if (!attributeStats.has(key)) {
          attributeStats.set(key, { hasNumber: false, hasNonNumber: false });
        }
        const stats = attributeStats.get(key);
        if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
          stats.hasNumber = true;
        } else {
          stats.hasNonNumber = true;
        }
      }
    }

    for (const [key, stats] of attributeStats.entries()) {
      if (stats.hasNumber && !stats.hasNonNumber) {
        numericAttributes.add(key);
      }
    }

    const currentSelection = styleState.opacityAttribute;
    opacityAttributeSelect.innerHTML = "";
    const noneOption = document.createElement("option");
    noneOption.value = "";
    noneOption.textContent = "None";
    opacityAttributeSelect.appendChild(noneOption);

    for (const key of Array.from(numericAttributes).sort()) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = key;
      opacityAttributeSelect.appendChild(option);
    }

    if (numericAttributes.has(currentSelection)) {
      styleState.opacityAttribute = currentSelection;
    } else {
      styleState.opacityAttribute = "";
    }

    updateOpacityControls();
  }

  function applyColouring(attribute) {
    if (!mapReady) {
      return;
    }

    const sourceId = "geojson-data";
    if (!map.getSource(sourceId)) {
      return;
    }

    if (!attribute) {
      resetColours();
      return;
    }

    const numericRange = getNumericAttributeRange(attribute);
    if (
      styleState.attributeColourMode === "gradient" &&
      numericRange &&
      Number.isFinite(numericRange.min) &&
      Number.isFinite(numericRange.max)
    ) {
      applyGradientColouring(attribute, numericRange);
      applyLineStyling();
      applyStrokeStyling();
      applyOpacityStyling();
      return;
    }

    const features = collectFeatures(currentGeoJson);
    const seen = new Set();
    const values = [];

    for (const feature of features) {
      const props = sanitizeProperties(feature.properties);
      if (!(attribute in props)) {
        continue;
      }
      const raw = props[attribute];
      if (raw === null || typeof raw === "object") {
        continue;
      }
      const value = String(raw);
      if (!seen.has(value)) {
        seen.add(value);
        values.push(value);
      }
      if (values.length >= palette.length * 3) {
        break;
      }
    }

    if (!values.length) {
      resetColours();
      return;
    }

    const matchExpression = [
      "match",
      ["to-string", ["coalesce", ["get", attribute], ""]],
    ];
    values.forEach((value, index) => {
      matchExpression.push(value, palette[index % palette.length]);
    });
    matchExpression.push(styleState.fillColor);

    applyPaint("geojson-fill", "fill-color", matchExpression);
    applyPaint("geojson-line", "line-color", matchExpression);
    applyPaint("geojson-point", "circle-color", matchExpression);
    applyLineStyling();
    applyStrokeStyling();
    applyOpacityStyling();
  }

  function applyGradientColouring(attribute, numericRange) {
    const { min, max } = numericRange;
    if (min === max) {
      applyPaint("geojson-fill", "fill-color", styleState.gradientEndColor);
      applyPaint("geojson-line", "line-color", styleState.gradientEndColor);
      applyPaint("geojson-point", "circle-color", styleState.gradientEndColor);
      return;
    }

    const valueExpression = ["to-number", ["get", attribute], min];
    let gradientExpression;

    if (styleState.gradientMiddleEnabled) {
      const mid = min + (max - min) / 2;
      gradientExpression = [
        "interpolate",
        ["linear"],
        valueExpression,
        min,
        styleState.gradientStartColor,
        mid,
        styleState.gradientMiddleColor,
        max,
        styleState.gradientEndColor,
      ];
    } else {
      gradientExpression = [
        "interpolate",
        ["linear"],
        valueExpression,
        min,
        styleState.gradientStartColor,
        max,
        styleState.gradientEndColor,
      ];
    }

    applyPaint("geojson-fill", "fill-color", gradientExpression);
    applyPaint("geojson-line", "line-color", gradientExpression);
    applyPaint("geojson-point", "circle-color", gradientExpression);
  }

  function resetColours() {
    applyPaint("geojson-fill", "fill-color", styleState.fillColor);
    applyPaint("geojson-line", "line-color", styleState.fillColor);
    applyPaint("geojson-point", "circle-color", styleState.fillColor);
    applyLineStyling();
    applyStrokeStyling();
    applyOpacityStyling();
  }

  function applyOpacityStyling() {
    const attribute = styleState.opacityAttribute;
    const range = getNumericAttributeRange(attribute);
    if (!attribute || !range) {
      applyPaint("geojson-fill", "fill-opacity", 0.55);
      applyPaint("geojson-line", "line-opacity", 1);
      applyPaint("geojson-point", "circle-opacity", 1);
      return;
    }

    // Higher values should be less transparent (more opaque) than lower values.
    const lowValueOpacity = 1 - styleState.maxTransparency / 100;
    const highValueOpacity = 1 - styleState.minTransparency / 100;
    const opacityExpression = buildOpacityExpression(
      attribute,
      range,
      lowValueOpacity,
      highValueOpacity,
    );

    applyPaint("geojson-fill", "fill-opacity", opacityExpression);
    applyPaint("geojson-line", "line-opacity", opacityExpression);
    applyPaint("geojson-point", "circle-opacity", opacityExpression);
  }

  function buildOpacityExpression(
    attribute,
    range,
    lowValueOpacity,
    highValueOpacity,
  ) {
    const { min, max } = range;
    if (min === max) {
      return highValueOpacity;
    }

    return [
      "interpolate",
      ["linear"],
      ["to-number", ["get", attribute], min],
      min,
      lowValueOpacity,
      max,
      highValueOpacity,
    ];
  }

  function applyLineStyling() {
    applyPaint("geojson-line", "line-width", styleState.lineWidth);
  }

  function applyStrokeStyling() {
    const strokeWidth = styleState.strokeEnabled ? styleState.strokeWidth : 0;
    applyPaint("geojson-outline", "line-color", styleState.strokeColor);
    applyPaint("geojson-outline", "line-width", strokeWidth);
    applyPaint("geojson-point", "circle-stroke-color", styleState.strokeColor);
    applyPaint("geojson-point", "circle-stroke-width", strokeWidth);
  }

  function updateStyleControlAvailability(data) {
    const hasLineGeometry = containsLineGeometry(data);
    const lineDisabled = !hasLineGeometry;
    lineWidthInput.disabled = lineDisabled;
    if (lineDisabled) {
      lineWidthInput.setAttribute(
        "title",
        "Line width is only available when line geometries are present.",
      );
    } else {
      lineWidthInput.removeAttribute("title");
    }

    const strokeDisabled = !styleState.strokeEnabled;
    strokeWidthInput.disabled = strokeDisabled;
    clearStrokeButton.disabled = strokeDisabled;
    if (strokeDisabled) {
      strokeWidthInput.setAttribute(
        "title",
        "Choose a stroke colour to enable stroke width.",
      );
    } else {
      strokeWidthInput.removeAttribute("title");
    }

    syncStyleInputs();
  }

  function updateAttributeColouringControls() {
    const attribute = attributeSelect.value;
    const hasAttribute = Boolean(attribute);
    const numericRange = hasAttribute
      ? getNumericAttributeRange(attribute)
      : null;
    const isNumericAttribute = Boolean(numericRange);

    const gradientOption = attributeColourModeSelect.querySelector(
      'option[value="gradient"]',
    );
    if (gradientOption) {
      gradientOption.disabled = !isNumericAttribute;
    }

    if (!hasAttribute) {
      styleState.attributeColourMode = "categorical";
    } else if (
      !isNumericAttribute &&
      styleState.attributeColourMode === "gradient"
    ) {
      styleState.attributeColourMode = "categorical";
    }

    attributeColourModeSelect.disabled = !hasAttribute;
    attributeColourModeSelect.value = styleState.attributeColourMode;

    fillColourInput.disabled = hasAttribute;
    if (hasAttribute) {
      fillColourInput.setAttribute(
        "title",
        "Fill colour is controlled by the selected attribute. Choose None to set a single fill colour.",
      );
    } else {
      fillColourInput.removeAttribute("title");
    }

    const showGradientControls =
      hasAttribute &&
      isNumericAttribute &&
      styleState.attributeColourMode === "gradient";
    gradientControls.classList.toggle("hidden", !showGradientControls);

    gradientStartColourInput.disabled = !showGradientControls;
    gradientMiddleEnabledInput.disabled = !showGradientControls;
    gradientMiddleColourInput.disabled =
      !showGradientControls || !styleState.gradientMiddleEnabled;
    gradientEndColourInput.disabled = !showGradientControls;
    gradientPresetSelect.disabled = !showGradientControls;

    syncStyleInputs();
  }

  function updateOpacityControls() {
    const hasOpacityAttribute = Boolean(styleState.opacityAttribute);
    opacityAttributeSelect.value = styleState.opacityAttribute;

    opacityMinInput.disabled = !hasOpacityAttribute;
    opacityMaxInput.disabled = !hasOpacityAttribute;

    if (!hasOpacityAttribute) {
      opacityMinInput.setAttribute(
        "title",
        "Choose a numeric field to control transparency.",
      );
      opacityMaxInput.setAttribute(
        "title",
        "Choose a numeric field to control transparency.",
      );
    } else {
      opacityMinInput.removeAttribute("title");
      opacityMaxInput.removeAttribute("title");
    }

    syncStyleInputs();
  }

  function applyGradientPreset(presetKey) {
    const preset = gradientPresets[presetKey];
    if (!preset) {
      return;
    }

    styleState.gradientStartColor = preset.start;
    styleState.gradientEndColor = preset.end;
    styleState.gradientMiddleEnabled = Boolean(preset.hasMiddle);
    if (preset.hasMiddle && preset.middle) {
      styleState.gradientMiddleColor = preset.middle;
    }
  }

  function getNumericAttributeRange(attribute) {
    if (!attribute) {
      return null;
    }

    const features = collectFeatures(currentGeoJson);
    let min = Infinity;
    let max = -Infinity;
    let hasNumber = false;

    for (const feature of features) {
      const props = sanitizeProperties(feature.properties);
      if (!(attribute in props)) {
        continue;
      }

      const value = props[attribute];
      if (value === null || typeof value === "undefined") {
        continue;
      }

      if (typeof value !== "number" || !Number.isFinite(value)) {
        return null;
      }

      hasNumber = true;
      min = Math.min(min, value);
      max = Math.max(max, value);
    }

    if (!hasNumber) {
      return null;
    }

    return { min, max };
  }

  function containsLineGeometry(data) {
    const features = collectFeatures(data);
    return features.some((feature) => {
      const geometryType = feature?.geometry?.type;
      return (
        geometryType === "LineString" || geometryType === "MultiLineString"
      );
    });
  }

  function syncStyleInputs() {
    fillColourInput.value = styleState.fillColor;
    strokeColourInput.value = styleState.strokeColor;
    lineWidthInput.value = styleState.lineWidth.toFixed(1);
    strokeWidthInput.value = styleState.strokeWidth.toFixed(1);
    lineWidthValue.textContent = styleState.lineWidth.toFixed(1);
    strokeWidthValue.textContent = styleState.strokeWidth.toFixed(1);
    attributeColourModeSelect.value = styleState.attributeColourMode;
    gradientStartColourInput.value = styleState.gradientStartColor;
    gradientMiddleEnabledInput.checked = styleState.gradientMiddleEnabled;
    gradientMiddleColourInput.value = styleState.gradientMiddleColor;
    gradientEndColourInput.value = styleState.gradientEndColor;
    gradientPresetSelect.value = styleState.gradientPreset;
    opacityAttributeSelect.value = styleState.opacityAttribute;
    opacityMinInput.value = String(styleState.minTransparency);
    opacityMaxInput.value = String(styleState.maxTransparency);
    opacityMinValue.textContent = `${styleState.minTransparency}%`;
    opacityMaxValue.textContent = `${styleState.maxTransparency}%`;
  }

  function applyPaint(layerId, property, value) {
    if (!mapReady || !map.getLayer(layerId)) {
      return;
    }
    map.setPaintProperty(layerId, property, value);
  }

  function enforceFormatConstraints(collection) {
    if (!collection || collection.type !== "FeatureCollection") {
      return {
        collection: { type: "FeatureCollection", features: [] },
        notice: "",
      };
    }

    const features = Array.isArray(collection.features)
      ? collection.features.filter(
          (feature) => feature && typeof feature === "object",
        )
      : [];

    return {
      collection: {
        type: "FeatureCollection",
        features,
      },
      notice: "",
    };
  }

  function roundCurrentCoordinates() {
    const nextText = textArea.value;
    if (!nextText || !nextText.trim().length) {
      setStatus("GeoJSON cannot be empty.", "error");
      return;
    }

    coordinatePrecision = parsePrecision(roundDecimalsInput?.value);
    if (roundDecimalsInput) {
      roundDecimalsInput.value = String(coordinatePrecision);
    }

    try {
      const parsed = JSON.parse(nextText);
      const normalised = normaliseGeoJson(parsed);
      if (!normalised) {
        throw new Error("Unsupported GeoJSON structure.");
      }

      const rounded = roundFeatureCollection(normalised, coordinatePrecision);
      const { collection, notice } = enforceFormatConstraints(rounded);
      const serialised = JSON.stringify(collection, null, 2);

      currentGeoJson = collection;
      currentText = serialised;
      setEditorText(serialised);
      updateMap(collection);
      populateAttributeOptions(collection);
      updateStyleControlAvailability(collection);
      applyColouring(attributeSelect.value);
      refreshSelectionState();
      updateDocumentMetrics();

      const suffix = coordinatePrecision === 1 ? "place" : "places";
      const statusMessage = notice
        ? `${notice} Coordinates rounded to ${coordinatePrecision} decimal ${suffix}.`
        : `Coordinates rounded to ${coordinatePrecision} decimal ${suffix}.`;
      setStatus(`${statusMessage} Click Apply Changes to save to disk.`, "");
    } catch (error) {
      setStatus(formatError(error), "error");
    }
  }

  function parsePrecision(value) {
    const parsed = Number.parseInt(String(value ?? "6"), 10);
    if (!Number.isFinite(parsed)) {
      return 6;
    }
    return Math.max(0, Math.min(10, parsed));
  }

  function initialiseJsonEditorHighlighting() {
    if (!textArea) {
      return;
    }

    textArea.addEventListener("input", () => {
      currentText = textArea.value;
      updateJsonHighlight(currentText);
      syncJsonHighlightScroll();
      updateDocumentMetrics();
    });

    textArea.addEventListener("scroll", () => {
      syncJsonHighlightScroll();
    });

    updateJsonHighlight(textArea.value || "");
    syncJsonHighlightScroll();
  }

  function setEditorText(text) {
    textArea.value = text;
    updateJsonHighlight(text);
    syncJsonHighlightScroll();
  }

  function syncJsonHighlightScroll() {
    if (!highlightLayer || !textArea) {
      return;
    }

    highlightLayer.scrollTop = textArea.scrollTop;
    highlightLayer.scrollLeft = textArea.scrollLeft;
  }

  function updateJsonHighlight(text) {
    if (!highlightLayer) {
      return;
    }

    const source = typeof text === "string" ? text : "";
    highlightLayer.innerHTML = highlightJson(source);
  }

  function highlightJson(text) {
    if (!text.length) {
      return " ";
    }

    const tokenRegex =
      /"(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;

    let html = "";
    let lastIndex = 0;
    let match = tokenRegex.exec(text);

    while (match) {
      const token = match[0];
      const start = match.index;
      html += escapeHtml(text.slice(lastIndex, start));

      let className = "json-number";
      if (token.startsWith('"')) {
        className = token.endsWith(":") ? "json-key" : "json-string";
      } else if (token === "true" || token === "false") {
        className = "json-boolean";
      } else if (token === "null") {
        className = "json-null";
      }

      html += `<span class="${className}">${escapeHtml(token)}</span>`;
      lastIndex = tokenRegex.lastIndex;
      match = tokenRegex.exec(text);
    }

    html += escapeHtml(text.slice(lastIndex));
    return html;
  }

  function updateDocumentMetrics() {
    const featureCount = collectFeatures(currentGeoJson).length;
    const fileBytes = getUtf8ByteLength(currentText || "");
    const featureLabel = `Features: ${featureCount}`;
    const sizeLabel = `Size: ${formatBytes(fileBytes)}`;

    if (featureCountIndicator) {
      featureCountIndicator.textContent = featureLabel;
    }
    if (fileSizeIndicator) {
      fileSizeIndicator.textContent = sizeLabel;
    }
    if (toolbarMetricsNode) {
      toolbarMetricsNode.textContent = `${featureLabel} | ${sizeLabel}`;
    }
  }

  function getUtf8ByteLength(value) {
    try {
      return new TextEncoder().encode(value).length;
    } catch (error) {
      return value.length;
    }
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) {
      return "0 B";
    }
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function setLoading(isLoading) {
    if (!loadingIndicator) {
      return;
    }

    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }

    if (isLoading) {
      loadingTimeout = setTimeout(() => {
        loadingTimeout = null;
        loadingIndicator.classList.remove("hidden");
        loadingIndicator.setAttribute("aria-hidden", "false");
        loadingIndicator.setAttribute("aria-busy", "true");
      }, 150);
    } else {
      loadingIndicator.classList.add("hidden");
      loadingIndicator.setAttribute("aria-hidden", "true");
      loadingIndicator.removeAttribute("aria-busy");
    }
  }

  function updateDocumentFormatUI() {
    if (rawLabel) {
      rawLabel.textContent = "Document data";
    }

    if (subtitle) {
      subtitle.textContent = "Inspect, style, and edit your spatial data.";
    }

    textArea.removeAttribute("title");

    updateAddFeatureButtonsState();
  }

  function setStatus(message, type) {
    statusNode.textContent = message || "";
    statusNode.classList.remove("error", "success");
    if (type === "error") {
      statusNode.classList.add("error");
    } else if (type === "success") {
      statusNode.classList.add("success");
    }
  }

  function clearStatus() {
    setStatus("", "");
  }

  function formatError(error) {
    if (!error) {
      return "Unknown error";
    }
    if (typeof error === "string") {
      return error;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "Unable to parse GeoJSON.";
  }

  function addFeatureOfType(type) {
    if (!mapReady) {
      setStatus("Map is not ready yet. Try again in a moment.", "error");
      return;
    }

    const geometry = createGeometryForType(type, map.getCenter());
    if (!geometry) {
      setStatus(`Unable to create a ${type}.`, "error");
      return;
    }

    if (!currentGeoJson || !Array.isArray(currentGeoJson.features)) {
      currentGeoJson = { type: "FeatureCollection", features: [] };
    }

    const newFeature = {
      type: "Feature",
      geometry,
      properties: {},
    };

    currentGeoJson.features.push(newFeature);
    selectedFeatureIndex = currentGeoJson.features.length - 1;
    exitVertexEditMode();
    commitPropertyChanges(`${type} added.`, { forceFit: true });
  }

  function deleteSelectedFeature() {
    if (!currentGeoJson || !Array.isArray(currentGeoJson.features)) {
      setStatus("No features available to delete.", "");
      return;
    }

    if (!Number.isInteger(selectedFeatureIndex)) {
      setStatus("Select a feature to delete.", "");
      return;
    }

    const index = Number(selectedFeatureIndex);
    if (index < 0 || index >= currentGeoJson.features.length) {
      setStatus("Unable to determine which feature to delete.", "error");
      return;
    }

    currentGeoJson.features.splice(index, 1);
    exitVertexEditMode();

    if (!currentGeoJson.features.length) {
      selectedFeatureIndex = null;
    } else {
      selectedFeatureIndex = Math.max(
        0,
        Math.min(index, currentGeoJson.features.length - 1),
      );
    }

    commitPropertyChanges("Feature deleted.", { forceFit: true });
  }

  function createGeometryForType(type, center) {
    const fallback = { lng: 0, lat: 0 };
    const target = center || fallback;
    const lng = normaliseLongitude(target.lng ?? fallback.lng);
    const lat = clampLatitude(target.lat ?? fallback.lat);
    const deltaLng = 0.01;
    const deltaLat = 0.01;

    switch (type) {
      case "Point":
        return { type: "Point", coordinates: [lng, lat] };
      case "LineString":
        return {
          type: "LineString",
          coordinates: [
            [lng - deltaLng, lat],
            [lng + deltaLng, lat],
          ].map(([x, y]) => [normaliseLongitude(x), clampLatitude(y)]),
        };
      case "Polygon": {
        const ring = [
          [lng - deltaLng, lat - deltaLat],
          [lng + deltaLng, lat - deltaLat],
          [lng + deltaLng, lat + deltaLat],
          [lng - deltaLng, lat + deltaLat],
        ].map(([x, y]) => [normaliseLongitude(x), clampLatitude(y)]);
        ring.push([...ring[0]]);
        return { type: "Polygon", coordinates: [ring] };
      }
      default:
        return null;
    }
  }

  function enterVertexEditMode(feature) {
    if (!feature || !feature.geometry) {
      return;
    }

    isEditingVertices = true;
    setStatus(
      "Drag vertices to edit geometry. Click Stop editing when done.",
      "",
    );
    updateVertexMarkers(feature);
    renderPropertiesPanel(feature);
  }

  function exitVertexEditMode() {
    isEditingVertices = false;
    clearVertexMarkers();
    setStatus("", "");
    const feature = getSelectedFeature();
    if (feature) {
      renderPropertiesPanel(feature);
    }
  }

  function clearVertexMarkers() {
    vertexMarkers.forEach((marker) => marker.remove());
    vertexMarkers = [];
  }

  function updateVertexMarkers(feature) {
    clearVertexMarkers();

    if (!feature || !feature.geometry) {
      return;
    }

    const geometry = feature.geometry;
    const coordinates = extractCoordinates(geometry);

    coordinates.forEach((coord, index) => {
      const marker = new maplibregl.Marker({
        color: "#ef4444",
        scale: 0.8,
        draggable: true,
      })
        .setLngLat([coord[0], coord[1]])
        .addTo(map);

      marker.on("dragstart", () => {
        draggedVertex = {
          marker,
          index,
          feature,
          originalCoord: [coord[0], coord[1]],
        };
      });

      marker.on("drag", () => {
        if (draggedVertex) {
          const lngLat = draggedVertex.marker.getLngLat();
          updateGeometryCoordinate(draggedVertex.feature, draggedVertex.index, [
            lngLat.lng,
            lngLat.lat,
          ]);

          // Update map geometry live while dragging.
          updateMap(currentGeoJson);
        }
      });

      marker.on("dragend", () => {
        if (draggedVertex) {
          const lngLat = draggedVertex.marker.getLngLat();
          updateGeometryCoordinate(draggedVertex.feature, draggedVertex.index, [
            lngLat.lng,
            lngLat.lat,
          ]);
          commitGeometryChanges("Vertex moved.");
          draggedVertex = null;
        }
      });

      vertexMarkers.push(marker);
    });
  }

  function extractCoordinates(geometry) {
    const coordinates = [];

    switch (geometry.type) {
      case "Point":
        coordinates.push(geometry.coordinates);
        break;
      case "LineString":
        geometry.coordinates.forEach((coord) => coordinates.push(coord));
        break;
      case "Polygon":
        // Only edit exterior ring for simplicity
        if (geometry.coordinates[0]) {
          geometry.coordinates[0].forEach((coord) => coordinates.push(coord));
        }
        break;
      case "MultiPoint":
        geometry.coordinates.forEach((coord) => coordinates.push(coord));
        break;
      case "MultiLineString":
        // Only edit first line for simplicity
        if (geometry.coordinates[0]) {
          geometry.coordinates[0].forEach((coord) => coordinates.push(coord));
        }
        break;
      case "MultiPolygon":
        // Only edit first polygon's exterior ring for simplicity
        if (geometry.coordinates[0] && geometry.coordinates[0][0]) {
          geometry.coordinates[0][0].forEach((coord) =>
            coordinates.push(coord),
          );
        }
        break;
    }

    return coordinates;
  }

  function updateGeometryCoordinate(feature, index, newCoord) {
    if (!feature || !feature.geometry) {
      return;
    }

    const geometry = feature.geometry;

    switch (geometry.type) {
      case "Point":
        if (index === 0) {
          geometry.coordinates = newCoord;
        }
        break;
      case "LineString":
        if (geometry.coordinates[index]) {
          geometry.coordinates[index] = newCoord;
        }
        break;
      case "Polygon":
        if (geometry.coordinates[0] && geometry.coordinates[0][index]) {
          geometry.coordinates[0][index] = newCoord;
          // For polygons, if we're updating the first coordinate, also update the last to keep it closed
          if (index === 0 && geometry.coordinates[0].length > 3) {
            geometry.coordinates[0][geometry.coordinates[0].length - 1] =
              newCoord;
          }
        }
        break;
      case "MultiPoint":
        if (geometry.coordinates[index]) {
          geometry.coordinates[index] = newCoord;
        }
        break;
      case "MultiLineString":
        if (geometry.coordinates[0] && geometry.coordinates[0][index]) {
          geometry.coordinates[0][index] = newCoord;
        }
        break;
      case "MultiPolygon":
        if (
          geometry.coordinates[0] &&
          geometry.coordinates[0][0] &&
          geometry.coordinates[0][0][index]
        ) {
          geometry.coordinates[0][0][index] = newCoord;
          // For polygons, if we're updating the first coordinate, also update the last to keep it closed
          if (index === 0 && geometry.coordinates[0][0].length > 3) {
            geometry.coordinates[0][0][geometry.coordinates[0][0].length - 1] =
              newCoord;
          }
        }
        break;
    }
  }

  function commitGeometryChanges(message, options = {}) {
    commitPropertyChanges(message, options);
  }
})();
