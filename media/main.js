(() => {
  const vscode = acquireVsCodeApi();
  const textArea = document.getElementById("geojson-input");
  const highlightLayer = document.getElementById("geojson-highlight");
  const jsonGutter = document.getElementById("geojson-gutter");
  const graticuleOverlay = document.getElementById("graticule-overlay");
  const coordinateReadout = document.getElementById("coordinate-readout");
  const scaleLabel = document.getElementById("scale-label");
  const scaleBar = document.getElementById("scale-bar");
  const mapToolbar = document.querySelector(".map-toolbar");
  const mapZoomInButton = document.getElementById("map-zoom-in-btn");
  const mapZoomOutButton = document.getElementById("map-zoom-out-btn");
  const mapFitButton = document.getElementById("map-fit-btn");
  const attributeSelect = document.getElementById("attribute-select");
  const labelToggleInput = document.getElementById("label-toggle-input");
  const labelFieldSelect = document.getElementById("label-field-select");
  const labelPreviewValue = document.getElementById("label-preview-value");
  const labelPreviewMeta = document.getElementById("label-preview-meta");
  const applyButton = document.getElementById("apply-btn");
  const statusNode = document.getElementById("status");
  const propertiesContainer = document.getElementById("properties-container");
  const jsonEditor = document.querySelector(".json-editor");
  const addPropertyButton = document.getElementById("add-property-btn");
  const editVerticesButton = document.getElementById("edit-vertices-btn");
  const snapVerticesButton = document.getElementById("snap-vertices-btn");
  const deleteFeatureButton = document.getElementById("delete-feature-btn");
  const addPointButton = document.getElementById("add-point-btn");
  const addLineButton = document.getElementById("add-linestring-btn");
  const addPolygonButton = document.getElementById("add-polygon-btn");
  const loadingIndicator = document.getElementById("loading-indicator");
  const largeFileLoading = document.getElementById("large-file-loading");
  const largeFileLoadingPercent = document.getElementById(
    "large-file-loading-percent",
  );
  const largeFileLoadingStep = document.getElementById(
    "large-file-loading-step",
  );
  const largeFileLoadingDetail = document.getElementById(
    "large-file-loading-detail",
  );
  const largeFileLoadingProgress = largeFileLoading?.querySelector(
    ".large-file-loading-progress",
  );
  const largeFileLoadingBar = document.getElementById(
    "large-file-loading-bar",
  );
  const rawDataPopup = document.getElementById("raw-data-popup");
  const rawDataPopupTitle = document.getElementById("raw-data-popup-title");
  const rawDataPopupMessage = document.getElementById(
    "raw-data-popup-message",
  );
  const rawDataPopupCloseButton = document.getElementById(
    "raw-data-popup-close",
  );
  const rawLabel = document.getElementById("raw-label");
  const rawSearchToggleButton = document.getElementById(
    "raw-search-toggle-btn",
  );
  const rawFindPanel = document.getElementById("raw-find-panel");
  const rawFindInput = document.getElementById("raw-find-input");
  const rawReplaceInput = document.getElementById("raw-replace-input");
  const rawMatchCaseInput = document.getElementById("raw-match-case-input");
  const rawFindPrevButton = document.getElementById("raw-find-prev-btn");
  const rawFindNextButton = document.getElementById("raw-find-next-btn");
  const rawReplaceFirstButton = document.getElementById(
    "raw-replace-first-btn",
  );
  const rawReplaceAllButton = document.getElementById("raw-replace-all-btn");
  const rawFindCount = document.getElementById("raw-find-count");
  const featureCountIndicator = document.getElementById(
    "feature-count-indicator",
  );
  const fileSizeIndicator = document.getElementById("file-size-indicator");
  const tooltipToggleInput = document.getElementById("tooltip-toggle-input");
  const basemapSelect = document.getElementById("basemap-select");
  const fillColourInput = document.getElementById("fill-colour-input");
  const fillColourValue = document.getElementById("fill-colour-value");
  const strokeColourInput = document.getElementById("stroke-colour-input");
  const strokeColourValue = document.getElementById("stroke-colour-value");
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
  const gradientStartColourValue = document.getElementById(
    "gradient-start-colour-value",
  );
  const gradientMiddleEnabledInput = document.getElementById(
    "gradient-middle-enabled",
  );
  const gradientMiddleColourInput = document.getElementById(
    "gradient-middle-colour",
  );
  const gradientMiddleColourValue = document.getElementById(
    "gradient-middle-colour-value",
  );
  const gradientEndColourInput = document.getElementById("gradient-end-colour");
  const gradientEndColourValue = document.getElementById(
    "gradient-end-colour-value",
  );
  const gradientPresetSelect = document.getElementById(
    "gradient-preset-select",
  );
  const categoricalControls = document.getElementById("categorical-controls");
  const categoricalPaletteSelect = document.getElementById(
    "categorical-palette-select",
  );
  const categoricalLegend = document.getElementById("categorical-legend");
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

  const categoricalPalettes = {
    bright: [
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
    ],
    modern: [
      "#2563eb",
      "#db2777",
      "#0891b2",
      "#65a30d",
      "#7c3aed",
      "#ea580c",
      "#0d9488",
      "#c026d3",
      "#4f46e5",
      "#ca8a04",
      "#0284c7",
      "#16a34a",
    ],
    pastel: [
      "#a5d8ff",
      "#ffc9c9",
      "#b2f2bb",
      "#ffec99",
      "#d0bfff",
      "#99e9f2",
      "#ffd8a8",
      "#fcc2d7",
      "#c3fae8",
      "#e9d8a6",
      "#bac8ff",
      "#eebefa",
    ],
    dark: [
      "#1e3a8a",
      "#831843",
      "#9a3412",
      "#14532d",
      "#581c87",
      "#134e4a",
      "#854d0e",
      "#7f1d1d",
      "#312e81",
      "#78350f",
      "#075985",
      "#064e3b",
    ],
  };

  function getActivePalette() {
    return (
      categoricalPalettes[styleState.categoricalPalette] ||
      categoricalPalettes.bright
    );
  }

  function getCategoricalOverrideBucket(palette, attribute, create) {
    const overrides = styleState.categoricalOverrides;
    let byAttribute = overrides[palette];
    if (!byAttribute) {
      if (!create) {
        return null;
      }
      byAttribute = {};
      overrides[palette] = byAttribute;
    }
    let byValue = byAttribute[attribute];
    if (!byValue) {
      if (!create) {
        return null;
      }
      byValue = {};
      byAttribute[attribute] = byValue;
    }
    return byValue;
  }

  function getCategoricalOverride(palette, attribute, value) {
    const bucket = getCategoricalOverrideBucket(palette, attribute, false);
    return bucket ? bucket[value] : undefined;
  }

  function setCategoricalOverride(palette, attribute, value, colour) {
    const bucket = getCategoricalOverrideBucket(palette, attribute, true);
    bucket[value] = colour;
  }

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
  const labelLayerIds = [
    "geojson-point-label",
    "geojson-line-label",
    "geojson-area-label",
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
  const labelFontFamilies = [
    "Open Sans Regular",
    "Open Sans Semibold",
    "Open Sans Bold",
    "Arial Unicode MS Regular",
    "Arial Unicode MS Bold",
  ];
  const largeRawEditorThresholds = {
    characters: 2_000_000,
    lines: 50_000,
  };
  const defaultEditorSettings = {
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
  const utils = window.geojsonEditorUtils;

  if (!utils) {
    throw new Error("geojson-utils.js failed to load.");
  }

  const {
    clampLatitude,
    clampNumber,
    coerceValue,
    collectFeatures,
    normaliseColour,
    normaliseGeoJson,
    normaliseLongitude,
    roundFeatureCollection,
    sanitizeProperties,
    serialiseValue,
  } = utils;

  let currentText = "";
  let currentGeoJson = null;
  let documentAnalysis = createEmptyDocumentAnalysis();
  let map;
  let mapReady = false;
  let pendingUpdate = null;
  let loadRequestId = 0;
  let selectedFeatureIndex = null;
  let pendingFocusKey = null;
  let mapHasData = false;
  let hasFitOnce = false;
  let isEditingVertices = false;
  let snapVerticesEnabled = true;
  let vertexMarkers = [];
  let draggedVertex = null;
  let loadingTimeout = null;
  let hoverPopup = null;
  let hoverTooltipsEnabled = Boolean(tooltipToggleInput?.checked ?? true);
  let coordinatePrecision = parsePrecision(roundDecimalsInput?.value);
  let selectedBasemap = defaultEditorSettings.defaultBasemap;
  let instrumentUpdateFrame = null;
  let themeUpdateFrame = null;
  let rawTextMeasureCanvas = null;
  let rawEditorLargeMode = false;
  let activeRawDataPopupReason = "";
  let dismissedRawDataPopupReason = "";
  let toolbarDragState = null;
  let categoricalSettingsInitialised = false;
  const maxVertexInsertDistancePx = 24;
  const maxVertexDeleteDistancePx = 16;
  const maxVertexSnapDistancePx = 14;

  const styleState = {
    fillColor: defaultEditorSettings.defaultFillColor,
    strokeColor: defaultEditorSettings.defaultStrokeColor,
    strokeEnabled: true,
    lineWidth: defaultEditorSettings.defaultLineWidth,
    strokeWidth: defaultEditorSettings.defaultStrokeWidth,
    attributeColourMode: "categorical",
    categoricalPalette: defaultEditorSettings.defaultCategoricalPalette,
    // Session-only overrides keyed by palette -> attribute -> value -> hex.
    categoricalOverrides: {},
    categoricalValues: [],
    gradientStartColor: "#0ea5e9",
    gradientMiddleEnabled: false,
    gradientMiddleColor: "#facc15",
    gradientEndColor: "#ef4444",
    gradientPreset: "custom",
    opacityAttribute: "",
    minTransparency: 10,
    maxTransparency: 80,
    labelsEnabled: defaultEditorSettings.defaultLabelsEnabled,
    labelField: "",
    labelFontFamily: defaultEditorSettings.defaultLabelFontFamily,
    labelSize: defaultEditorSettings.defaultLabelSize,
  };

  const rawFindState = {
    isOpen: false,
    query: "",
    replacement: "",
    matchCase: false,
    matches: [],
    activeIndex: -1,
  };
  const customSelects = new Map();

  document.addEventListener("DOMContentLoaded", () => {
    initialiseCustomSelects();
    initialiseMap();
    initialiseMapToolbar();
    initialiseThemeObserver();
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
      void loadTextIntoEditor(text, message.error);
      return;
    }

    if (message.type === "settings") {
      applyEditorSettings(message.settings);
      return;
    }
  });

  if (rawDataPopupCloseButton) {
    rawDataPopupCloseButton.addEventListener("click", () => {
      dismissedRawDataPopupReason = activeRawDataPopupReason;
      hideRawDataPopup();
    });
  }

  function initialiseCustomSelects() {
    document.querySelectorAll("select").forEach((select) => {
      enhanceNativeSelect(select);
    });

    document.addEventListener("click", (event) => {
      if (
        event.target instanceof Element &&
        event.target.closest(".cartograph-select")
      ) {
        return;
      }
      closeAllCustomSelects();
    });
  }

  function enhanceNativeSelect(select) {
    if (!select || customSelects.has(select)) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "cartograph-select";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "cartograph-select-button";
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");

    const valueNode = document.createElement("span");
    valueNode.className = "cartograph-select-value";

    const caret = document.createElement("span");
    caret.className = "cartograph-select-caret";
    caret.setAttribute("aria-hidden", "true");

    const menu = document.createElement("div");
    menu.className = "cartograph-select-menu";
    menu.setAttribute("role", "listbox");
    menu.hidden = true;

    const menuId = `${select.id || "cartograph-select"}-menu`;
    const buttonId = `${select.id || "cartograph-select"}-button`;
    menu.id = menuId;
    button.id = buttonId;
    button.setAttribute("aria-controls", menuId);

    const label = select.labels?.[0];
    if (label) {
      if (!label.id) {
        label.id = `${select.id || "cartograph-select"}-label`;
      }
      button.setAttribute("aria-labelledby", `${label.id} ${buttonId}`);
    }

    button.append(valueNode, caret);
    wrapper.append(button, menu);
    select.classList.add("native-select-hidden");
    select.insertAdjacentElement("afterend", wrapper);

    const observer = new MutationObserver(() => {
      syncCustomSelect(select);
    });
    observer.observe(select, {
      attributes: true,
      attributeFilter: ["disabled"],
      childList: true,
      subtree: true,
    });

    customSelects.set(select, { wrapper, button, valueNode, menu, observer });

    button.addEventListener("click", () => {
      toggleCustomSelect(select);
    });

    button.addEventListener("keydown", (event) => {
      handleCustomSelectButtonKeydown(event, select);
    });

    menu.addEventListener("keydown", (event) => {
      handleCustomSelectMenuKeydown(event, select);
    });

    select.addEventListener("change", () => {
      syncCustomSelect(select);
    });

    select.addEventListener("focus", () => {
      button.focus();
    });

    syncCustomSelect(select);
  }

  function syncAllCustomSelects() {
    customSelects.forEach((_, select) => {
      syncCustomSelect(select);
    });
  }

  function syncCustomSelect(select) {
    const state = customSelects.get(select);
    if (!state) {
      return;
    }

    const { wrapper, button, valueNode, menu } = state;
    const selectedOption = select.selectedOptions?.[0] || select.options[0];
    valueNode.textContent = selectedOption?.textContent || "";
    button.disabled = select.disabled;
    wrapper.classList.toggle("is-disabled", select.disabled);

    menu.innerHTML = "";
    Array.from(select.options).forEach((option, index) => {
      const optionButton = document.createElement("button");
      optionButton.type = "button";
      optionButton.className = "cartograph-select-option";
      optionButton.setAttribute("role", "option");
      optionButton.dataset.index = String(index);
      optionButton.textContent = option.textContent || "";
      optionButton.disabled = option.disabled;

      const isSelected = index === select.selectedIndex;
      optionButton.classList.toggle("is-selected", isSelected);
      optionButton.setAttribute("aria-selected", isSelected ? "true" : "false");

      optionButton.addEventListener("click", () => {
        chooseCustomSelectOption(select, index);
      });

      menu.appendChild(optionButton);
    });
  }

  function toggleCustomSelect(select, forceOpen) {
    const state = customSelects.get(select);
    if (!state || select.disabled) {
      return;
    }

    const shouldOpen =
      typeof forceOpen === "boolean"
        ? forceOpen
        : !state.wrapper.classList.contains("is-open");

    if (shouldOpen) {
      closeAllCustomSelects(select);
      syncCustomSelect(select);
    }

    state.wrapper.classList.toggle("is-open", shouldOpen);
    state.menu.hidden = !shouldOpen;
    state.button.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
  }

  function closeAllCustomSelects(exceptSelect = null) {
    customSelects.forEach((state, select) => {
      if (select === exceptSelect) {
        return;
      }
      state.wrapper.classList.remove("is-open");
      state.menu.hidden = true;
      state.button.setAttribute("aria-expanded", "false");
    });
  }

  function chooseCustomSelectOption(select, index) {
    const state = customSelects.get(select);
    if (!state || select.disabled || index < 0 || index >= select.options.length) {
      return;
    }

    const option = select.options[index];
    if (option.disabled) {
      return;
    }

    const didChange = select.selectedIndex !== index;
    select.selectedIndex = index;
    syncCustomSelect(select);
    toggleCustomSelect(select, false);
    state.button.focus();

    if (didChange) {
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function handleCustomSelectButtonKeydown(event, select) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleCustomSelect(select, true);
      focusCustomSelectOption(select, getEnabledCustomOptionIndex(select, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      toggleCustomSelect(select, true);
      focusCustomSelectOption(select, getEnabledCustomOptionIndex(select, -1));
    }
  }

  function handleCustomSelectMenuKeydown(event, select) {
    if (event.key === "Escape") {
      event.preventDefault();
      toggleCustomSelect(select, false);
      customSelects.get(select)?.button.focus();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const currentIndex = getFocusedCustomOptionIndex(select);
      focusCustomSelectOption(
        select,
        getEnabledCustomOptionIndex(select, direction, currentIndex),
      );
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      focusCustomSelectOption(
        select,
        getEnabledCustomOptionIndex(select, event.key === "Home" ? 1 : -1, event.key === "Home" ? -1 : select.options.length),
      );
    }
  }

  function getFocusedCustomOptionIndex(select) {
    const state = customSelects.get(select);
    if (!state || !(document.activeElement instanceof HTMLElement)) {
      return select.selectedIndex;
    }
    const optionButton = document.activeElement.closest(
      ".cartograph-select-option",
    );
    if (!optionButton || !state.menu.contains(optionButton)) {
      return select.selectedIndex;
    }
    return Number(optionButton.dataset.index || select.selectedIndex);
  }

  function getEnabledCustomOptionIndex(select, direction, fromIndex = select.selectedIndex) {
    if (!select.options.length) {
      return -1;
    }
    let index = fromIndex;
    for (let attempts = 0; attempts < select.options.length; attempts += 1) {
      index += direction;
      if (index < 0) {
        index = select.options.length - 1;
      } else if (index >= select.options.length) {
        index = 0;
      }
      if (!select.options[index].disabled) {
        return index;
      }
    }
    return select.selectedIndex;
  }

  function focusCustomSelectOption(select, index) {
    const state = customSelects.get(select);
    if (!state || index < 0) {
      return;
    }
    const optionButton = state.menu.querySelector(`[data-index="${index}"]`);
    if (optionButton instanceof HTMLElement) {
      optionButton.focus();
    }
  }

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
      setCurrentGeoJson(collection);
      setEditorText(serialised);
      updateMap(collection);
      populateAttributeOptions(collection);
      applyColouring(attributeSelect.value);
      applyLabels();
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

  if (rawSearchToggleButton) {
    rawSearchToggleButton.addEventListener("click", () => {
      setRawFindPanelOpen(!rawFindState.isOpen, {
        seedFromSelection: true,
        focusFindInput: true,
      });
    });
  }

  if (rawFindInput) {
    rawFindInput.addEventListener("input", () => {
      rawFindState.query = rawFindInput.value;
      refreshRawFindMatches({ activeFromSelection: true });
      updateJsonHighlight(currentText);
    });

    rawFindInput.addEventListener("keydown", handleRawFindInputKeydown);
  }

  if (rawReplaceInput) {
    rawReplaceInput.addEventListener("input", () => {
      rawFindState.replacement = rawReplaceInput.value;
    });

    rawReplaceInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        replaceActiveRawMatch();
      } else if (event.key === "Escape") {
        setRawFindPanelOpen(false, { focusEditor: true });
      }
    });
  }

  if (rawMatchCaseInput) {
    rawMatchCaseInput.addEventListener("change", () => {
      rawFindState.matchCase = rawMatchCaseInput.checked;
      refreshRawFindMatches({ activeFromSelection: true });
      updateJsonHighlight(currentText);
    });
  }

  if (rawFindPrevButton) {
    rawFindPrevButton.addEventListener("click", () => {
      moveRawFindMatch(-1);
    });
  }

  if (rawFindNextButton) {
    rawFindNextButton.addEventListener("click", () => {
      moveRawFindMatch(1);
    });
  }

  if (rawReplaceFirstButton) {
    rawReplaceFirstButton.addEventListener("click", () => {
      replaceActiveRawMatch();
    });
  }

  if (rawReplaceAllButton) {
    rawReplaceAllButton.addEventListener("click", () => {
      replaceAllRawMatches();
    });
  }

  if (labelToggleInput) {
    labelToggleInput.addEventListener("change", () => {
      styleState.labelsEnabled = labelToggleInput.checked;
      updateLabelControls();
      applyLabels();
    });
  }

  if (labelFieldSelect) {
    labelFieldSelect.addEventListener("change", () => {
      styleState.labelField = labelFieldSelect.value;
      updateLabelControls();
      applyLabels();
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

  categoricalPaletteSelect.addEventListener("change", () => {
    styleState.categoricalPalette = categoricalPaletteSelect.value;
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
  updateLabelControls();
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

  if (snapVerticesButton) {
    snapVerticesButton.addEventListener("click", () => {
      snapVerticesEnabled = !snapVerticesEnabled;
      updateMapToolbarState();
      if (isEditingVertices) {
        setStatus(
          snapVerticesEnabled
            ? "Vertex snapping enabled."
            : "Vertex snapping disabled.",
          "",
        );
      }
    });
  }

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
      attributionControl: true,
    });

    map.on("load", () => {
      mapReady = true;
      updateAddFeatureButtonsState();
      map.on("click", handleMapClick);
      map.on("contextmenu", handleMapContextMenu);
      map.on("mousemove", handleMapHover);
      map.on("move", scheduleInstrumentUpdate);
      map.on("zoom", scheduleInstrumentUpdate);
      map.on("resize", scheduleInstrumentUpdate);
      map.getCanvasContainer().addEventListener("mouseleave", () => {
        hideHoverTooltip();
        map.getCanvas().style.cursor = isEditingVertices ? "crosshair" : "";
      });
      if (pendingUpdate) {
        const { data, options } = pendingUpdate;
        pendingUpdate = null;
        updateMap(data, options);
      }
      applyColouring(attributeSelect.value);
      applyLabels();
      updateStyleControlAvailability(currentGeoJson || emptyCollection);
      updateDocumentMetrics();
      updateMapInstruments();
    });
  }

  function initialiseMapToolbar() {
    initialiseMapToolbarDrag();

    if (mapZoomInButton) {
      mapZoomInButton.addEventListener("click", () => {
        if (mapReady) {
          map.zoomIn({ duration: 180 });
        }
      });
    }

    if (mapZoomOutButton) {
      mapZoomOutButton.addEventListener("click", () => {
        if (mapReady) {
          map.zoomOut({ duration: 180 });
        }
      });
    }

    if (mapFitButton) {
      mapFitButton.addEventListener("click", () => {
        fitCurrentDataToMap();
      });
    }

    updateMapToolbarState();
  }

  function initialiseMapToolbarDrag() {
    if (!mapToolbar) {
      return;
    }

    mapToolbar.addEventListener("pointerdown", (event) => {
      if (
        event.button !== 0 ||
        !(event.target instanceof Element) ||
        event.target.closest("button")
      ) {
        return;
      }

      const container = mapToolbar.parentElement;
      if (!container) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const toolbarRect = mapToolbar.getBoundingClientRect();
      toolbarDragState = {
        pointerId: event.pointerId,
        offsetX: event.clientX - toolbarRect.left,
        offsetY: event.clientY - toolbarRect.top,
        maxLeft: Math.max(8, containerRect.width - toolbarRect.width - 8),
        maxTop: Math.max(8, containerRect.height - toolbarRect.height - 8),
        parentLeft: containerRect.left,
        parentTop: containerRect.top,
      };
      mapToolbar.classList.add("dragging");
      mapToolbar.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    mapToolbar.addEventListener("pointermove", (event) => {
      if (!toolbarDragState || toolbarDragState.pointerId !== event.pointerId) {
        return;
      }
      moveMapToolbar(event);
    });

    ["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) => {
      mapToolbar.addEventListener(eventName, endMapToolbarDrag);
    });
  }

  function moveMapToolbar(event) {
    const nextLeft = clampNumber(
      event.clientX - toolbarDragState.parentLeft - toolbarDragState.offsetX,
      8,
      toolbarDragState.maxLeft,
      12,
    );
    const nextTop = clampNumber(
      event.clientY - toolbarDragState.parentTop - toolbarDragState.offsetY,
      8,
      toolbarDragState.maxTop,
      12,
    );

    mapToolbar.style.left = `${nextLeft}px`;
    mapToolbar.style.top = `${nextTop}px`;
    mapToolbar.style.right = "auto";
    mapToolbar.style.bottom = "auto";
  }

  function endMapToolbarDrag() {
    if (!toolbarDragState || !mapToolbar) {
      return;
    }
    mapToolbar.classList.remove("dragging");
    toolbarDragState = null;
  }

  function initialiseThemeObserver() {
    if (typeof MutationObserver === "undefined") {
      return;
    }

    const observer = new MutationObserver(scheduleThemePaintUpdate);
    const options = {
      attributes: true,
      attributeFilter: ["class", "data-vscode-theme-kind", "style"],
    };

    [document.documentElement, document.body].forEach((target) => {
      if (target) {
        observer.observe(target, options);
      }
    });
  }

  function scheduleThemePaintUpdate() {
    if (themeUpdateFrame !== null) {
      return;
    }

    themeUpdateFrame = window.requestAnimationFrame(() => {
      themeUpdateFrame = null;
      reapplyCartographMapPaints();
      updateMapInstruments();
    });
  }

  function getCurrentBasemapStyle() {
    return basemapStyles[selectedBasemap] || basemapStyles["carto-positron"];
  }

  function applyEditorSettings(rawSettings) {
    const nextSettings = normaliseEditorSettings(rawSettings);
    const previousBasemap = selectedBasemap;

    selectedBasemap = nextSettings.defaultBasemap;
    styleState.fillColor = nextSettings.defaultFillColor;
    styleState.strokeColor =
      nextSettings.defaultStrokeColor || defaultEditorSettings.defaultStrokeColor;
    styleState.strokeEnabled = Boolean(nextSettings.defaultStrokeColor);
    styleState.lineWidth = nextSettings.defaultLineWidth;
    styleState.strokeWidth = nextSettings.defaultStrokeWidth;
    styleState.labelsEnabled = nextSettings.defaultLabelsEnabled;
    styleState.labelFontFamily = nextSettings.defaultLabelFontFamily;
    styleState.labelSize = nextSettings.defaultLabelSize;
    // Seed the palette from the default only on first load; later configuration
    // changes must not clobber the palette or custom colours the user picked
    // during this session.
    if (!categoricalSettingsInitialised) {
      styleState.categoricalPalette = nextSettings.defaultCategoricalPalette;
      categoricalSettingsInitialised = true;
    }

    applyUiScale(nextSettings.uiScale);

    if (basemapSelect) {
      basemapSelect.value = selectedBasemap;
      syncCustomSelect(basemapSelect);
    }

    syncStyleInputs();
    updateStyleControlAvailability(currentGeoJson || emptyCollection);
    updateAttributeColouringControls();
    updateOpacityControls();
    updateLabelControls();

    if (previousBasemap !== selectedBasemap && map) {
      applyBasemapStyle();
      return;
    }

    applyColouring(attributeSelect.value);
    applyLabelStyle();
    applyLabels();
    updateMapInstruments();
  }

  function normaliseEditorSettings(rawSettings) {
    const source =
      rawSettings && typeof rawSettings === "object" ? rawSettings : {};
    return {
      uiScale: normaliseSettingNumber(
        Number(source.uiScale),
        1,
        1.5,
        defaultEditorSettings.uiScale,
      ),
      defaultBasemap: Object.prototype.hasOwnProperty.call(
        basemapStyles,
        source.defaultBasemap,
      )
        ? source.defaultBasemap
        : defaultEditorSettings.defaultBasemap,
      defaultFillColor: normaliseColour(
        source.defaultFillColor,
        defaultEditorSettings.defaultFillColor,
      ),
      defaultStrokeColor: normaliseOptionalColour(
        source.defaultStrokeColor,
        defaultEditorSettings.defaultStrokeColor,
      ),
      defaultLineWidth: normaliseSettingNumber(
        Number(source.defaultLineWidth),
        1,
        16,
        defaultEditorSettings.defaultLineWidth,
      ),
      defaultStrokeWidth: normaliseSettingNumber(
        Number(source.defaultStrokeWidth),
        0.5,
        12,
        defaultEditorSettings.defaultStrokeWidth,
      ),
      defaultLabelsEnabled:
        typeof source.defaultLabelsEnabled === "boolean"
          ? source.defaultLabelsEnabled
          : defaultEditorSettings.defaultLabelsEnabled,
      defaultLabelFontFamily: labelFontFamilies.includes(
        source.defaultLabelFontFamily,
      )
        ? source.defaultLabelFontFamily
        : defaultEditorSettings.defaultLabelFontFamily,
      defaultLabelSize: normaliseSettingNumber(
        Number(source.defaultLabelSize),
        8,
        24,
        defaultEditorSettings.defaultLabelSize,
      ),
      defaultCategoricalPalette: Object.prototype.hasOwnProperty.call(
        categoricalPalettes,
        source.defaultCategoricalPalette,
      )
        ? source.defaultCategoricalPalette
        : defaultEditorSettings.defaultCategoricalPalette,
    };
  }

  function normaliseOptionalColour(value, fallback) {
    if (typeof value === "string" && !value.trim()) {
      return "";
    }
    return normaliseColour(value, fallback);
  }

  function normaliseSettingNumber(value, min, max, fallback) {
    if (!Number.isFinite(value) || value < min || value > max) {
      return fallback;
    }
    return value;
  }

  function applyUiScale(scale) {
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--carto-ui-scale", String(scale));
    rootStyle.setProperty("--carto-font-size-base", `${12 * scale}px`);
    rootStyle.setProperty("--carto-font-size-ui", `${11 * scale}px`);
    rootStyle.setProperty("--carto-font-size-readout", `${10 * scale}px`);
    rootStyle.setProperty("--carto-font-size-graticule", `${9 * scale}px`);
    rootStyle.setProperty("--carto-panel-width", `${320 * scale}px`);
    rootStyle.setProperty("--carto-control-height", `${28 * scale}px`);
    rootStyle.setProperty("--carto-control-padding-y", `${6 * scale}px`);
    rootStyle.setProperty("--carto-control-padding-x", `${8 * scale}px`);
    rootStyle.setProperty("--carto-panel-padding-y", `${10 * scale}px`);
    rootStyle.setProperty("--carto-panel-padding-x", `${14 * scale}px`);
    rootStyle.setProperty("--carto-panel-gap", `${7 * scale}px`);
    rootStyle.setProperty("--carto-map-inset", `${12 * scale}px`);
    rootStyle.setProperty("--carto-map-tool-size", `${26 * scale}px`);
    rootStyle.setProperty("--carto-map-tool-padding-x", `${8 * scale}px`);
    rootStyle.setProperty("--carto-overlay-padding-y", `${5 * scale}px`);
    rootStyle.setProperty("--carto-overlay-padding-x", `${8 * scale}px`);
    rootStyle.setProperty("--carto-scale-readout-width", `${84 * scale}px`);
    rootStyle.setProperty("--carto-scale-bar-width", `${60 * scale}px`);
    rootStyle.setProperty("--carto-json-gutter-width", `${24 * scale}px`);
    rootStyle.setProperty("--carto-json-min-height", `${220 * scale}px`);
    rootStyle.setProperty("--carto-json-max-height", `${340 * scale}px`);
    rootStyle.setProperty("--carto-graticule-padding-y", `${1 * scale}px`);
    rootStyle.setProperty("--carto-graticule-padding-x", `${3 * scale}px`);
    rootStyle.setProperty("--carto-toolbar-gap", `${4 * scale}px`);
    rootStyle.setProperty("--carto-toolbar-padding", `${4 * scale}px`);
    rootStyle.setProperty("--carto-metric-gap", `${6 * scale}px`);
    rootStyle.setProperty("--carto-metric-min-height", `${22 * scale}px`);
    rootStyle.setProperty("--carto-scale-bar-height", `${2 * scale}px`);
    rootStyle.setProperty("--carto-panel-header-gap", `${8 * scale}px`);
    rootStyle.setProperty(
      "--carto-panel-header-padding-y",
      `${12 * scale}px`,
    );

    if (map) {
      window.requestAnimationFrame(() => {
        map.resize();
        updateMapInstruments();
      });
    }
  }

  function getLabelFontStack() {
    const primary =
      styleState.labelFontFamily || defaultEditorSettings.defaultLabelFontFamily;
    const fallback =
      primary.includes("Bold") || primary.includes("Semibold")
        ? "Arial Unicode MS Bold"
        : "Arial Unicode MS Regular";
    return primary === fallback ? [primary] : [primary, fallback];
  }

  function getPointLabelSizeExpression() {
    return buildLabelSizeExpression([
      [3, -1],
      [9, 1],
      [13, 4],
    ]);
  }

  function getLineLabelSizeExpression() {
    return buildLabelSizeExpression([
      [4, -2],
      [9, 0],
      [12, 3],
    ]);
  }

  function getAreaLabelSizeExpression() {
    return buildLabelSizeExpression([
      [3, -1],
      [8, 1],
      [12, 5],
    ]);
  }

  function buildLabelSizeExpression(stops) {
    const expression = ["interpolate", ["linear"], ["zoom"]];
    stops.forEach(([zoom, offset]) => {
      expression.push(zoom, clampNumber(styleState.labelSize + offset, 6, 32, 12));
    });
    return expression;
  }

  function applyLabelStyle() {
    if (!mapReady || !map) {
      return;
    }

    const labelStyles = {
      "geojson-point-label": getPointLabelSizeExpression(),
      "geojson-line-label": getLineLabelSizeExpression(),
      "geojson-area-label": getAreaLabelSizeExpression(),
    };

    Object.entries(labelStyles).forEach(([layerId, textSize]) => {
      if (!map.getLayer(layerId)) {
        return;
      }
      map.setLayoutProperty(layerId, "text-font", getLabelFontStack());
      map.setLayoutProperty(layerId, "text-size", textSize);
    });
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
      applyLabels();
      updateStyleControlAvailability(data);
      updateDocumentMetrics();
      updateMapInstruments();
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

  function fitCurrentDataToMap() {
    if (!documentAnalysis.featureCount) {
      setStatus("No features available to fit.", "");
      return;
    }
    fitMapToAnalysedBounds();
  }

  function updateMapToolbarState() {
    const hasFeatures = documentAnalysis.featureCount > 0;
    if (mapZoomInButton) {
      mapZoomInButton.disabled = !mapReady;
    }
    if (mapZoomOutButton) {
      mapZoomOutButton.disabled = !mapReady;
    }
    if (mapFitButton) {
      mapFitButton.disabled = !mapReady || !hasFeatures;
    }
    if (editVerticesButton) {
      const hasSelection = Boolean(getSelectedFeature());
      editVerticesButton.disabled = !mapReady || !hasSelection;
      editVerticesButton.classList.toggle("active", isEditingVertices);
      editVerticesButton.setAttribute(
        "aria-pressed",
        isEditingVertices ? "true" : "false",
      );
      editVerticesButton.textContent = isEditingVertices
        ? "Stop editing"
        : "Edit vertices";
    }
    if (snapVerticesButton) {
      snapVerticesButton.hidden = !isEditingVertices;
      snapVerticesButton.disabled = !isEditingVertices;
      snapVerticesButton.classList.toggle("active", snapVerticesEnabled);
      snapVerticesButton.setAttribute(
        "aria-pressed",
        snapVerticesEnabled ? "true" : "false",
      );
      snapVerticesButton.textContent = snapVerticesEnabled
        ? "Snap on"
        : "Snap off";
    }
  }

  function scheduleInstrumentUpdate() {
    if (instrumentUpdateFrame !== null) {
      return;
    }
    instrumentUpdateFrame = window.requestAnimationFrame(() => {
      instrumentUpdateFrame = null;
      updateMapInstruments();
    });
  }

  function updateMapInstruments() {
    if (!mapReady || !map) {
      return;
    }
    updateCoordinateReadout(map.getCenter());
    updateScaleReadout();
    renderGraticule();
  }

  function updateCoordinateReadout(lngLat) {
    if (!coordinateReadout || !lngLat) {
      return;
    }
    const lng = normaliseLongitude(lngLat.lng).toFixed(6);
    const lat = clampLatitude(lngLat.lat).toFixed(6);
    coordinateReadout.textContent = `Lng ${lng}, Lat ${lat}`;
  }

  function updateScaleReadout() {
    if (!scaleLabel || !scaleBar || !map) {
      return;
    }
    const container = map.getContainer();
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) {
      return;
    }
    const barWidth = 60;
    const measurement = getScaleBarMeasurement(container, barWidth);
    const start = map.unproject(measurement.start);
    const end = map.unproject(measurement.end);
    const distance = getDistanceMeters(start, end);
    scaleLabel.textContent = formatDistance(distance);
    scaleBar.style.width = `${measurement.width}px`;
  }

  function getScaleBarMeasurement(container, fallbackWidth) {
    const containerRect = container.getBoundingClientRect();
    const barRect = scaleBar.getBoundingClientRect();
    const mapWidth = container.clientWidth;
    const mapHeight = container.clientHeight;

    if (
      containerRect.width > 0 &&
      containerRect.height > 0 &&
      barRect.width > 0 &&
      barRect.height > 0
    ) {
      const left = clampNumber(barRect.left - containerRect.left, 0, mapWidth, 0);
      const right = clampNumber(
        barRect.right - containerRect.left,
        0,
        mapWidth,
        fallbackWidth,
      );
      const y = clampNumber(
        barRect.top - containerRect.top + barRect.height / 2,
        0,
        mapHeight,
        Math.max(24, mapHeight - 24),
      );
      if (right > left) {
        return {
          start: [left, y],
          end: [right, y],
          width: right - left,
        };
      }
    }

    const right = Math.max(0, mapWidth - 20);
    const left = Math.max(0, right - fallbackWidth);
    const y = Math.max(24, mapHeight - 24);
    return {
      start: [left, y],
      end: [right, y],
      width: Math.max(1, right - left),
    };
  }

  function getDistanceMeters(start, end) {
    const radiusMeters = 6371008.8;
    const lat1 = toRadians(start.lat);
    const lat2 = toRadians(end.lat);
    const deltaLat = toRadians(end.lat - start.lat);
    const deltaLng = toRadians(end.lng - start.lng);
    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
    return radiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  function formatDistance(meters) {
    if (!Number.isFinite(meters) || meters <= 0) {
      return "0 m";
    }
    if (meters < 1000) {
      return `${Math.max(1, Math.round(meters))} m`;
    }
    if (meters < 100000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters / 1000)} km`;
  }

  function renderGraticule() {
    if (!graticuleOverlay || !map) {
      return;
    }
    const container = map.getContainer();
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) {
      return;
    }

    graticuleOverlay.innerHTML = "";
    const bounds = map.getBounds();
    const west = bounds.getWest();
    const east = bounds.getEast();
    const south = Math.max(-85, bounds.getSouth());
    const north = Math.min(85, bounds.getNorth());
    const lonStep = getNiceStep((east - west) / 5);
    const latStep = getNiceStep((north - south) / 5);

    appendMeridians(west, east, lonStep);
    appendParallels(south, north, latStep);
  }

  function getNiceStep(rawStep) {
    if (!Number.isFinite(rawStep) || rawStep <= 0) {
      return 1;
    }
    const magnitude = 10 ** Math.floor(Math.log10(rawStep));
    const normalised = rawStep / magnitude;
    const nice =
      normalised <= 1
        ? 1
        : normalised <= 2
          ? 2
          : normalised <= 5
            ? 5
            : 10;
    return nice * magnitude;
  }

  function appendMeridians(west, east, step) {
    const lat = map.getCenter().lat;
    const start = Math.ceil(west / step) * step;
    for (let lng = start; lng <= east; lng += step) {
      const point = map.project([lng, lat]);
      if (point.x < 0 || point.x > map.getContainer().clientWidth) {
        continue;
      }
      appendGraticuleLine("vertical", point.x);
      appendGraticuleLabel(formatCoordinate(lng, "lng"), point.x + 3, 6);
    }
  }

  function appendParallels(south, north, step) {
    const lng = map.getCenter().lng;
    const start = Math.ceil(south / step) * step;
    for (let lat = start; lat <= north; lat += step) {
      const point = map.project([lng, lat]);
      if (point.y < 0 || point.y > map.getContainer().clientHeight) {
        continue;
      }
      appendGraticuleLine("horizontal", point.y);
      appendGraticuleLabel(formatCoordinate(lat, "lat"), 6, point.y + 3);
    }
  }

  function appendGraticuleLine(axis, offset) {
    const line = document.createElement("span");
    line.className = `graticule-line ${axis}`;
    if (axis === "vertical") {
      line.style.left = `${offset}px`;
    } else {
      line.style.top = `${offset}px`;
    }
    graticuleOverlay.appendChild(line);
  }

  function appendGraticuleLabel(text, left, top) {
    const label = document.createElement("span");
    label.className = "graticule-label";
    label.textContent = text;
    label.style.left = `${left}px`;
    label.style.top = `${top}px`;
    graticuleOverlay.appendChild(label);
  }

  function formatCoordinate(value, axis) {
    const normalised =
      axis === "lng" ? normaliseLongitude(value) : clampLatitude(value);
    const suffix =
      axis === "lng"
        ? normalised < 0
          ? "W"
          : "E"
        : normalised < 0
          ? "S"
          : "N";
    return `${Math.abs(normalised).toFixed(2)}°${suffix}`;
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

    if (isEditingVertices) {
      handleVertexEditClick(event);
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

  function handleMapContextMenu(event) {
    if (!mapReady || !isEditingVertices) {
      return;
    }

    event.originalEvent?.preventDefault?.();

    if (isMarkerInteraction(event)) {
      return;
    }

    const feature = getSelectedFeature();
    if (!feature) {
      exitVertexEditMode();
      return;
    }

    deleteNearestVertex(feature, event.point);
  }

  function handleVertexEditClick(event) {
    const feature = getSelectedFeature();
    if (!feature) {
      exitVertexEditMode();
      return;
    }

    if (isMarkerInteraction(event)) {
      return;
    }

    addVertexAtPoint(feature, event.lngLat, event.point);
  }

  function handleMapHover(event) {
    updateCoordinateReadout(event.lngLat);

    if (!mapReady || !hoverTooltipsEnabled || isEditingVertices) {
      hideHoverTooltip();
      if (mapReady) {
        map.getCanvas().style.cursor = isEditingVertices ? "crosshair" : "";
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
    const tooltip = buildHoverTooltipHtml(features[0]);
    if (!tooltip || !tooltip.html) {
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

    hoverPopup.setLngLat(event.lngLat).setHTML(tooltip.html).addTo(map);

    const popupContainer = hoverPopup.getElement();
    if (popupContainer) {
      popupContainer.classList.toggle("feature-tooltip-popup--wide", tooltip.wide);
    }
  }

  function hideHoverTooltip() {
    if (!hoverPopup) {
      return;
    }
    hoverPopup.remove();
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
    updateMapToolbarState();
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
    updateMapToolbarState();
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
        "Select a feature on the map to edit its properties.";
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
      empty.textContent = "Add a property to annotate this feature.";
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
    setCurrentGeoJson(collection);
    const serialised = JSON.stringify(collection, null, 2);
    currentText = serialised;
    setEditorText(serialised);
    const { forceFit = false } = options;
    updateMap(collection, { forceFit });
    populateAttributeOptions(collection);
    updateStyleControlAvailability(collection);
    applyColouring(attributeSelect.value);
    applyLabels();
    updateAddFeatureButtonsState();
    const statusMessage = notice ? `${message} ${notice}` : message;
    setStatus(
      `${statusMessage.trim()} Apply changes to save to disk.`,
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

  function setCurrentGeoJson(collection, analysis = null) {
    currentGeoJson = collection;
    documentAnalysis = analysis || analyseFeatureCollection(collection);
  }

  async function loadTextIntoEditor(text, externalError = null) {
    const requestId = ++loadRequestId;
    const isLargeLoad = isLargeRawDocument(text);
    if (isLargeLoad) {
      hideMapLoading();
      showLargeFileLoading(
        3,
        "Preparing large-file workspace",
        `${formatBytes(text.length)} file detected. Enabling plain raw editor mode.`,
      );
      showRawDataPopup(
        "large-document",
        "Raw document data shown",
        `${formatBytes(text.length)} document detected. Formatting is skipped to keep editing responsive.`,
      );
    } else {
      hideLargeFileLoading();
      setLoading(true);
    }

    await nextAnimationFrame();
    if (requestId !== loadRequestId) {
      return;
    }

    if (isLargeLoad) {
      updateLargeFileLoading(
        12,
        "Preparing raw editor",
        "Keeping the document editable while skipping expensive syntax highlighting.",
      );
    }
    setEditorText(text);
    currentText = text;

    if (!text) {
      setCurrentGeoJson(null);
      clearSelection();
      updateMap(emptyCollection);
      populateAttributeOptions(emptyCollection);
      updateStyleControlAvailability(emptyCollection);
      hideRawDataPopup({ resetDismissed: true });
      clearStatus();
      setLoading(false);
      updateAddFeatureButtonsState();
      updateDocumentMetrics();
      return;
    }

    try {
      if (isLargeLoad) {
        updateLargeFileLoading(
          24,
          "Parsing GeoJSON",
          "Reading features and geometry from the document.",
        );
        await nextAnimationFrame();
      }
      const parsed = JSON.parse(text);
      const normalised = normaliseGeoJson(parsed);
      if (!normalised) {
        throw new Error("Unsupported GeoJSON structure.");
      }
      const { collection, notice } = enforceFormatConstraints(normalised);

      let analysis = null;
      if (isLargeLoad) {
        analysis = await analyseFeatureCollectionAsync(
          collection,
          ({ progress, processed, total }) => {
            updateLargeFileLoading(
              32 + progress * 0.34,
              "Scanning features",
              `Analysed ${processed.toLocaleString()} of ${total.toLocaleString()} features.`,
            );
          },
          () => requestId !== loadRequestId,
        );
        if (requestId !== loadRequestId) {
          return;
        }
      }

      if (!isLargeLoad) {
        const serialised = JSON.stringify(collection, null, 2);
        currentText = serialised;
        setEditorText(serialised);
        hideRawDataPopup({ resetDismissed: true });
      }

      setCurrentGeoJson(collection, analysis);
      const shouldForceFit = !hasFitOnce;
      if (isLargeLoad) {
        updateLargeFileLoading(
          72,
          "Rendering map layers",
          `${documentAnalysis.featureCount.toLocaleString()} features ready for MapLibre.`,
        );
        await nextAnimationFrame();
      }
      updateMap(collection, { forceFit: shouldForceFit });
      if (isLargeLoad) {
        updateLargeFileLoading(
          86,
          "Syncing controls",
          "Building attribute, label, and styling controls from the cached scan.",
        );
        await nextAnimationFrame();
      }
      populateAttributeOptions(collection);
      updateStyleControlAvailability(collection);
      applyColouring(attributeSelect.value);
      applyLabels();
      if (!getSelectedFeature()) {
        clearSelection();
      } else {
        refreshSelectionState();
      }
      if (externalError) {
        setStatus(externalError, "error");
      } else if (notice) {
        setStatus(notice, "");
      } else {
        clearStatus();
      }
      if (isLargeLoad) {
        updateLargeFileLoading(
          100,
          "Ready",
          `Loaded ${documentAnalysis.featureCount.toLocaleString()} features in large-file mode.`,
        );
        await nextAnimationFrame();
      }
      updateDocumentMetrics();
    } catch (error) {
      const errorMessage = formatError(error);
      setCurrentGeoJson(null);
      clearSelection();
      updateMap(emptyCollection);
      populateAttributeOptions(emptyCollection);
      updateStyleControlAvailability(emptyCollection);
      setStatus(errorMessage, "error");
      showRawDataPopup(
        "format-error",
        "Raw document data shown",
        "The document could not be formatted as supported GeoJSON, so the original text is shown for editing.",
      );
    } finally {
      if (requestId === loadRequestId) {
        if (isLargeLoad) {
          hideLargeFileLoading();
        } else {
          setLoading(false);
        }
        updateAddFeatureButtonsState();
        updateDocumentMetrics();
      }
    }
  }

  function nextAnimationFrame() {
    return new Promise((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });
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
    const { accent, accentSoft, elev, text, bg, mapBg } =
      getCartographMapTokens();
    map.getCanvas().style.backgroundColor = mapBg;

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
          "fill-color": accentSoft,
          "fill-opacity": 0.72,
        },
        filter: ["==", ["get", "__editorIndex"], -1],
      });

      map.addLayer({
        id: "geojson-highlight-line",
        type: "line",
        source: sourceId,
        paint: {
          "line-color": accent,
          "line-width": 4,
        },
        filter: ["==", ["get", "__editorIndex"], -1],
      });

      map.addLayer({
        id: "geojson-highlight-point",
        type: "circle",
        source: sourceId,
        paint: {
          "circle-radius": 8,
          "circle-color": elev,
          "circle-stroke-color": accent,
          "circle-stroke-width": 2,
        },
        filter: ["==", ["get", "__editorIndex"], -1],
      });

      map.addLayer({
        id: "geojson-point-label",
        type: "symbol",
        source: sourceId,
        layout: {
          "text-field": "",
          "text-font": getLabelFontStack(),
          "text-size": getPointLabelSizeExpression(),
          "text-letter-spacing": 0.02,
          "text-variable-anchor": ["top", "bottom", "left", "right"],
          "text-radial-offset": 0.75,
          "text-padding": 6,
          visibility: "none",
        },
        paint: {
          "text-color": text,
          "text-halo-color": bg,
          "text-halo-width": 2,
          "text-halo-blur": 0.8,
          "text-opacity": 0.96,
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
        id: "geojson-line-label",
        type: "symbol",
        source: sourceId,
        layout: {
          "symbol-placement": "line",
          "text-field": "",
          "text-font": getLabelFontStack(),
          "text-size": getLineLabelSizeExpression(),
          "text-letter-spacing": 0.06,
          "symbol-spacing": 420,
          "text-keep-upright": true,
          "text-padding": 4,
          visibility: "none",
        },
        paint: {
          "text-color": text,
          "text-halo-color": bg,
          "text-halo-width": 2,
          "text-halo-blur": 0.9,
          "text-opacity": 0.94,
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
        id: "geojson-area-label",
        type: "symbol",
        source: sourceId,
        layout: {
          "text-field": "",
          "text-font": getLabelFontStack(),
          "text-size": getAreaLabelSizeExpression(),
          "text-max-width": 9,
          "text-line-height": 1.1,
          "text-padding": 8,
          visibility: "none",
        },
        paint: {
          "text-color": text,
          "text-halo-color": bg,
          "text-halo-width": 2.25,
          "text-halo-blur": 1,
          "text-opacity": 0.96,
        },
        filter: [
          "match",
          ["geometry-type"],
          ["Polygon", "MultiPolygon"],
          true,
          false,
        ],
      });

      safeMoveLayer("geojson-highlight-fill", "geojson-outline");
      safeMoveLayer("geojson-highlight-line", "geojson-line");
      safeMoveLayer("geojson-highlight-point", "geojson-point");
    }

    const shouldFit = (!mapHasData && hasFeatures) || (forceFit && hasFeatures);
    if (shouldFit) {
      fitMapToAnalysedBounds();
      hasFitOnce = true;
    }

    mapHasData = hasFeatures;
    if (!hasFeatures) {
      hasFitOnce = false;
      hideHoverTooltip();
    }
    refreshSelectionHighlight();
    updateMapToolbarState();
    scheduleInstrumentUpdate();
  }

  function buildHoverTooltipHtml(renderedFeature) {
    if (!renderedFeature) {
      return { html: "", wide: false };
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
      return { html: '<div class="feature-tooltip-empty">No attributes</div>', wide: false };
    }

    // Approximate characters that fit on one line in the value cell at the
    // base popup width. When a value would wrap past this, the tooltip is
    // widened (~2x) so it wraps to fewer lines.
    const NARROW_VALUE_CHARS = 28;

    let wide = false;
    const rows = entries
      .map(([key, value]) => {
        const safeKey = escapeHtml(key);
        const rawValue = formatTooltipValue(value);
        if (rawValue.length > NARROW_VALUE_CHARS) {
          wide = true;
        }
        return `<tr><th>${safeKey}</th><td>${escapeHtml(rawValue)}</td></tr>`;
      })
      .join("");

    return {
      html: `<table class="feature-tooltip-table"><tbody>${rows}</tbody></table>`,
      wide,
    };
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

  function getCssToken(name, fallback) {
    const value = getComputedStyle(document.body || document.documentElement)
      .getPropertyValue(name)
      .trim();
    return value || fallback;
  }

  function getCartographMapTokens() {
    return {
      accent: getCssToken("--carto-accent", "#4ac9d0"),
      accentSoft: getCssToken("--carto-accent-soft", "#004245"),
      elev: getCssToken("--carto-elev", "#242d30"),
      text: getCssToken("--carto-text", "#e0eaed"),
      bg: getCssToken("--carto-bg", "#11191b"),
      mapBg: getCssToken("--carto-map-bg", "#111d20"),
    };
  }

  function reapplyCartographMapPaints() {
    if (!mapReady || !map) {
      return;
    }

    const { accent, accentSoft, elev, text, bg, mapBg } =
      getCartographMapTokens();
    map.getCanvas().style.backgroundColor = mapBg;
    applyPaint("geojson-highlight-fill", "fill-color", accentSoft);
    applyPaint("geojson-highlight-line", "line-color", accent);
    applyPaint("geojson-highlight-point", "circle-color", elev);
    applyPaint("geojson-highlight-point", "circle-stroke-color", accent);

    labelLayerIds.forEach((layerId) => {
      applyPaint(layerId, "text-color", text);
      applyPaint(layerId, "text-halo-color", bg);
    });
  }

  function createEmptyDocumentAnalysis() {
    return {
      featureCount: 0,
      bounds: null,
      attributes: new Set(),
      numericAttributes: new Set(),
      numericRanges: new Map(),
      hasLineGeometry: false,
      labelPreviewValues: new Map(),
    };
  }

  function analyseFeatureCollection(data) {
    const builder = createDocumentAnalysisBuilder(data);
    if (!builder) {
      return createEmptyDocumentAnalysis();
    }

    while (builder.index < builder.features.length) {
      processAnalysisFeature(builder, builder.features[builder.index]);
      builder.index += 1;
    }

    return finalizeDocumentAnalysis(builder);
  }

  async function analyseFeatureCollectionAsync(
    data,
    onProgress,
    shouldCancel,
  ) {
    const builder = createDocumentAnalysisBuilder(data);
    if (!builder) {
      return createEmptyDocumentAnalysis();
    }

    const total = builder.features.length;
    const chunkSize = Math.max(250, Math.ceil(Math.max(total, 1) / 40));

    while (builder.index < total) {
      if (shouldCancel?.()) {
        return null;
      }

      const endIndex = Math.min(total, builder.index + chunkSize);
      for (; builder.index < endIndex; builder.index += 1) {
        processAnalysisFeature(builder, builder.features[builder.index]);
      }

      onProgress?.({
        progress: total ? (builder.index / total) * 100 : 100,
        processed: builder.index,
        total,
      });

      await nextAnimationFrame();
    }

    return finalizeDocumentAnalysis(builder);
  }

  function createDocumentAnalysisBuilder(data) {
    const collection = normaliseGeoJson(data);
    if (!collection) {
      return null;
    }

    const features = Array.isArray(collection.features)
      ? collection.features
      : [];

    return {
      features,
      index: 0,
      analysis: {
        ...createEmptyDocumentAnalysis(),
        featureCount: features.length,
      },
      numericStats: new Map(),
      bounds: {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity,
      },
      hasBounds: false,
    };
  }

  function processAnalysisFeature(builder, feature) {
    const { analysis, numericStats, bounds } = builder;
    const geometry = feature?.geometry;
    if (geometry) {
      if (containsLineGeometryType(geometry)) {
        analysis.hasLineGeometry = true;
      }
      builder.hasBounds =
        extendBoundsForGeometry(geometry, bounds) || builder.hasBounds;
    }

    const properties =
      feature?.properties && typeof feature.properties === "object"
        ? feature.properties
        : {};

    for (const key of Object.keys(properties)) {
      if (key === "__editorIndex") {
        continue;
      }

      const value = properties[key];
      if (value === null || typeof value === "undefined") {
        continue;
      }

      const valueType = typeof value;
      if (
        valueType === "string" ||
        valueType === "number" ||
        valueType === "boolean"
      ) {
        analysis.attributes.add(key);
        if (!analysis.labelPreviewValues.has(key)) {
          const preview = formatTooltipValue(value).trim();
          if (preview.length) {
            analysis.labelPreviewValues.set(
              key,
              preview.length > 36 ? `${preview.slice(0, 33)}...` : preview,
            );
          }
        }
      }

      if (!numericStats.has(key)) {
        numericStats.set(key, {
          hasNumber: false,
          hasNonNumber: false,
          min: Infinity,
          max: -Infinity,
        });
      }

      const stats = numericStats.get(key);
      if (valueType === "number" && Number.isFinite(value)) {
        stats.hasNumber = true;
        stats.min = Math.min(stats.min, value);
        stats.max = Math.max(stats.max, value);
      } else {
        stats.hasNonNumber = true;
      }
    }
  }

  function finalizeDocumentAnalysis(builder) {
    const { analysis, numericStats, bounds } = builder;

    if (builder.hasBounds) {
      analysis.bounds = bounds;
    }

    for (const [key, stats] of numericStats.entries()) {
      if (stats.hasNumber && !stats.hasNonNumber) {
        analysis.numericAttributes.add(key);
        analysis.numericRanges.set(key, {
          min: stats.min,
          max: stats.max,
        });
      }
    }

    return analysis;
  }

  function containsLineGeometryType(geometry) {
    if (!geometry || typeof geometry !== "object") {
      return false;
    }

    if (geometry.type === "GeometryCollection") {
      return Array.isArray(geometry.geometries)
        ? geometry.geometries.some(containsLineGeometryType)
        : false;
    }

    return (
      geometry.type === "LineString" || geometry.type === "MultiLineString"
    );
  }

  function extendBoundsForGeometry(geometry, bounds) {
    if (!geometry || typeof geometry !== "object") {
      return false;
    }

    if (geometry.type === "GeometryCollection") {
      return Array.isArray(geometry.geometries)
        ? geometry.geometries.reduce(
            (hasBounds, child) =>
              extendBoundsForGeometry(child, bounds) || hasBounds,
            false,
          )
        : false;
    }

    let hasBounds = false;
    traverseCoordinatePairs(geometry.coordinates, (lon, lat) => {
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
        return;
      }
      bounds.minX = Math.min(bounds.minX, lon);
      bounds.minY = Math.min(bounds.minY, lat);
      bounds.maxX = Math.max(bounds.maxX, lon);
      bounds.maxY = Math.max(bounds.maxY, lat);
      hasBounds = true;
    });
    return hasBounds;
  }

  function traverseCoordinatePairs(value, visitor) {
    if (!Array.isArray(value)) {
      return;
    }

    if (typeof value[0] === "number" && typeof value[1] === "number") {
      visitor(value[0], value[1]);
      return;
    }

    for (const item of value) {
      traverseCoordinatePairs(item, visitor);
    }
  }

  function fitMapToAnalysedBounds() {
    const bounds = documentAnalysis.bounds;
    if (!bounds) {
      return;
    }

    const { minX, minY, maxX, maxY } = bounds;
    if (
      !Number.isFinite(minX) ||
      !Number.isFinite(minY) ||
      !Number.isFinite(maxX) ||
      !Number.isFinite(maxY)
    ) {
      return;
    }

    if (minX === maxX && minY === maxY) {
      map.easeTo({ center: [minX, minY], zoom: 12 });
      return;
    }

    map.fitBounds(
      [
        [minX, minY],
        [maxX, maxY],
      ],
      { padding: 32, duration: 500 },
    );
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
      geometry: feature.geometry || null,
      properties: {
        ...sanitizeProperties(feature.properties),
        __editorIndex: index,
      },
    }));

    return { type: "FeatureCollection", features: decorated };
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
    const attributes =
      data === currentGeoJson
        ? documentAnalysis.attributes
        : analyseFeatureCollection(data).attributes;

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

    populateLabelFieldOptions(attributes);
    populateOpacityAttributeOptions(data);

    updateAttributeColouringControls();
  }

  function populateLabelFieldOptions(attributes) {
    if (!labelFieldSelect) {
      return;
    }

    const currentSelection = styleState.labelField;
    labelFieldSelect.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Choose a field";
    labelFieldSelect.appendChild(defaultOption);

    for (const key of Array.from(attributes).sort()) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = key;
      labelFieldSelect.appendChild(option);
    }

    if (attributes.has(currentSelection)) {
      styleState.labelField = currentSelection;
    } else {
      styleState.labelField = "";
      if (currentSelection) {
        styleState.labelsEnabled = false;
      }
    }

    updateLabelControls();
  }

  function populateOpacityAttributeOptions(data) {
    const numericAttributes =
      data === currentGeoJson
        ? documentAnalysis.numericAttributes
        : analyseFeatureCollection(data).numericAttributes;

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

    const palette = getActivePalette();
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

    const paletteName = styleState.categoricalPalette;
    const colourForValue = (value, index) =>
      getCategoricalOverride(paletteName, attribute, value) ||
      palette[index % palette.length];

    const matchExpression = [
      "match",
      ["to-string", ["coalesce", ["get", attribute], ""]],
    ];
    values.forEach((value, index) => {
      matchExpression.push(value, colourForValue(value, index));
    });
    matchExpression.push(styleState.fillColor);

    styleState.categoricalValues = values;
    renderCategoricalLegend(values);

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
    styleState.categoricalValues = [];
    renderCategoricalLegend([]);
    applyPaint("geojson-fill", "fill-color", styleState.fillColor);
    applyPaint("geojson-line", "line-color", styleState.fillColor);
    applyPaint("geojson-point", "circle-color", styleState.fillColor);
    applyLineStyling();
    applyStrokeStyling();
    applyOpacityStyling();
  }

  const CATEGORICAL_LEGEND_LIMIT = 10;
  let legendSignature = null;

  function legendSwatchColour(palette, attribute, value, index) {
    const base = palette[index % palette.length];
    return normaliseColour(
      getCategoricalOverride(styleState.categoricalPalette, attribute, value) ||
        base,
      base,
    );
  }

  function renderCategoricalLegend(values) {
    if (!categoricalLegend) {
      return;
    }

    const palette = getActivePalette();
    const attribute = attributeSelect.value;
    const shown = values.slice(0, CATEGORICAL_LEGEND_LIMIT);
    const signature = JSON.stringify([
      styleState.categoricalPalette,
      attribute,
      shown,
      values.length,
    ]);

    // When the structure is unchanged (e.g. the user just edited one swatch),
    // update the existing inputs in place so an open native colour picker is
    // not torn down and dismissed.
    if (signature === legendSignature) {
      const swatches = categoricalLegend.querySelectorAll(".legend-swatch");
      shown.forEach((value, index) => {
        const swatch = swatches[index];
        if (swatch && document.activeElement !== swatch) {
          swatch.value = legendSwatchColour(palette, attribute, value, index);
        }
      });
      return;
    }

    legendSignature = signature;
    categoricalLegend.textContent = "";

    if (!shown.length) {
      const empty = document.createElement("p");
      empty.className = "legend-empty";
      empty.textContent =
        "Select a categorical attribute to see its colours here.";
      categoricalLegend.appendChild(empty);
      return;
    }

    shown.forEach((value, index) => {
      const row = document.createElement("label");
      row.className = "legend-row color-field";

      const swatch = document.createElement("input");
      swatch.type = "color";
      swatch.className = "legend-swatch";
      swatch.value = legendSwatchColour(palette, attribute, value, index);
      swatch.addEventListener("input", () => {
        setCategoricalOverride(
          styleState.categoricalPalette,
          attributeSelect.value,
          value,
          normaliseColour(swatch.value, swatch.value),
        );
        applyColouring(attributeSelect.value);
      });

      const label = document.createElement("span");
      label.className = "legend-label";
      label.textContent = value;
      label.title = value;

      row.appendChild(swatch);
      row.appendChild(label);
      categoricalLegend.appendChild(row);
    });

    if (values.length > CATEGORICAL_LEGEND_LIMIT) {
      const more = document.createElement("p");
      more.className = "legend-more";
      more.textContent = `+${values.length - CATEGORICAL_LEGEND_LIMIT} more value(s) coloured on the map`;
      categoricalLegend.appendChild(more);
    }
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

    const showCategoricalControls =
      hasAttribute && styleState.attributeColourMode === "categorical";
    categoricalControls.classList.toggle("hidden", !showCategoricalControls);
    categoricalPaletteSelect.disabled = !showCategoricalControls;
    categoricalPaletteSelect.value = styleState.categoricalPalette;
    syncCustomSelect(categoricalPaletteSelect);

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

  function updateLabelControls() {
    const hasFields = Boolean(
      labelFieldSelect && labelFieldSelect.options.length > 1,
    );
    const hasSelectedField = Boolean(styleState.labelField);

    if (labelFieldSelect) {
      labelFieldSelect.disabled = !hasFields;
      labelFieldSelect.value = styleState.labelField;
      if (!hasFields) {
        labelFieldSelect.setAttribute(
          "title",
          "Add a string, number, or boolean property to use as a label.",
        );
      } else {
        labelFieldSelect.removeAttribute("title");
      }
      syncCustomSelect(labelFieldSelect);
    }

    if (labelToggleInput) {
      labelToggleInput.disabled = !hasSelectedField;
      labelToggleInput.checked = hasSelectedField && styleState.labelsEnabled;
      if (!hasSelectedField) {
        labelToggleInput.setAttribute(
          "title",
          hasFields
            ? "Choose a label field first."
            : "Add a property to make label fields available.",
        );
      } else {
        labelToggleInput.removeAttribute("title");
      }
    }

    updateLabelPreview();
  }

  function updateLabelPreview() {
    if (!labelPreviewValue || !labelPreviewMeta) {
      return;
    }

    if (!styleState.labelField) {
      labelPreviewValue.textContent = "Choose label field";
      labelPreviewMeta.textContent = labelFieldSelect?.disabled
        ? "Add a property to make label fields available."
        : "Choose a property to preview labels.";
      return;
    }

    const previewValue = getLabelPreviewValue(styleState.labelField);
    if (!styleState.labelsEnabled) {
      labelPreviewValue.textContent = previewValue || styleState.labelField;
      labelPreviewMeta.textContent = `Enable labels to show "${styleState.labelField}" on the map.`;
      return;
    }

    labelPreviewValue.textContent = previewValue || styleState.labelField;
    labelPreviewMeta.textContent = `Showing "${styleState.labelField}" with map-aware placement.`;
  }

  function getLabelPreviewValue(field) {
    if (documentAnalysis.labelPreviewValues.has(field)) {
      return documentAnalysis.labelPreviewValues.get(field);
    }

    return "No label values yet";
  }

  function applyLabels() {
    updateLabelPreview();

    if (!mapReady) {
      return;
    }

    const shouldShow = Boolean(
      styleState.labelsEnabled && styleState.labelField,
    );
    const labelExpression = shouldShow
      ? ["to-string", ["coalesce", ["get", styleState.labelField], ""]]
      : "";

    labelLayerIds.forEach((layerId) => {
      if (!map.getLayer(layerId)) {
        return;
      }

      map.setLayoutProperty(
        layerId,
        "visibility",
        shouldShow ? "visible" : "none",
      );
      map.setLayoutProperty(layerId, "text-field", labelExpression);
    });
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
    return documentAnalysis.numericRanges.get(attribute) || null;
  }

  function containsLineGeometry(data) {
    return data === currentGeoJson
      ? documentAnalysis.hasLineGeometry
      : analyseFeatureCollection(data).hasLineGeometry;
  }

  function syncStyleInputs() {
    fillColourInput.value = styleState.fillColor;
    strokeColourInput.value = styleState.strokeColor;
    syncHexReadout(fillColourValue, styleState.fillColor);
    syncHexReadout(strokeColourValue, styleState.strokeColor);
    lineWidthInput.value = styleState.lineWidth.toFixed(1);
    strokeWidthInput.value = styleState.strokeWidth.toFixed(1);
    lineWidthValue.textContent = styleState.lineWidth.toFixed(1);
    strokeWidthValue.textContent = styleState.strokeWidth.toFixed(1);
    attributeColourModeSelect.value = styleState.attributeColourMode;
    gradientStartColourInput.value = styleState.gradientStartColor;
    gradientMiddleEnabledInput.checked = styleState.gradientMiddleEnabled;
    gradientMiddleColourInput.value = styleState.gradientMiddleColor;
    gradientEndColourInput.value = styleState.gradientEndColor;
    syncHexReadout(gradientStartColourValue, styleState.gradientStartColor);
    syncHexReadout(gradientMiddleColourValue, styleState.gradientMiddleColor);
    syncHexReadout(gradientEndColourValue, styleState.gradientEndColor);
    gradientPresetSelect.value = styleState.gradientPreset;
    opacityAttributeSelect.value = styleState.opacityAttribute;
    opacityMinInput.value = String(styleState.minTransparency);
    opacityMaxInput.value = String(styleState.maxTransparency);
    opacityMinValue.textContent = `${styleState.minTransparency}%`;
    opacityMaxValue.textContent = `${styleState.maxTransparency}%`;
    syncRangeInputProgress(lineWidthInput);
    syncRangeInputProgress(strokeWidthInput);
    syncRangeInputProgress(opacityMinInput);
    syncRangeInputProgress(opacityMaxInput);
    syncAllCustomSelects();
  }

  function syncRangeInputProgress(input) {
    if (!input) {
      return;
    }

    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const value = Number(input.value || min);
    const progress =
      max > min
        ? clampNumber(((value - min) / (max - min)) * 100, 0, 100, 0)
        : 0;
    input.style.setProperty("--range-progress", `${progress}%`);
  }

  function syncHexReadout(node, value) {
    if (!node) {
      return;
    }
    node.textContent = String(value || "").toUpperCase();
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

      setCurrentGeoJson(collection);
      currentText = serialised;
      setEditorText(serialised);
      updateMap(collection);
      populateAttributeOptions(collection);
      updateStyleControlAvailability(collection);
      applyColouring(attributeSelect.value);
      applyLabels();
      refreshSelectionState();
      updateDocumentMetrics();

      const suffix = coordinatePrecision === 1 ? "place" : "places";
      const statusMessage = notice
        ? `${notice} Coordinates rounded to ${coordinatePrecision} decimal ${suffix}.`
        : `Coordinates rounded to ${coordinatePrecision} decimal ${suffix}.`;
      setStatus(`${statusMessage} Apply changes to save to disk.`, "");
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

  function setRawFindPanelOpen(isOpen, options = {}) {
    rawFindState.isOpen = Boolean(isOpen);

    if (rawFindPanel) {
      rawFindPanel.hidden = !rawFindState.isOpen;
    }
    if (rawSearchToggleButton) {
      rawSearchToggleButton.setAttribute(
        "aria-expanded",
        rawFindState.isOpen ? "true" : "false",
      );
    }

    if (rawFindState.isOpen) {
      if (options.seedFromSelection) {
        seedRawFindFromSelection();
      }
      refreshRawFindMatches({ activeFromSelection: true });
      updateJsonHighlight(currentText);
      if (options.focusFindInput && rawFindInput) {
        rawFindInput.focus();
        rawFindInput.select();
      }
      return;
    }

    updateRawFindControls();
    updateJsonHighlight(currentText);
    if (options.focusEditor && textArea) {
      textArea.focus();
    }
  }

  function seedRawFindFromSelection() {
    if (!textArea || !rawFindInput) {
      return;
    }

    const selectedText = textArea.value.slice(
      textArea.selectionStart,
      textArea.selectionEnd,
    );
    if (!selectedText || selectedText.includes("\n")) {
      return;
    }

    rawFindInput.value = selectedText;
    rawFindState.query = selectedText;
  }

  function handleRawFindInputKeydown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      moveRawFindMatch(event.shiftKey ? -1 : 1);
    } else if (event.key === "Escape") {
      setRawFindPanelOpen(false, { focusEditor: true });
    }
  }

  function handleRawEditorFindShortcut(event) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {
      event.preventDefault();
      setRawFindPanelOpen(true, {
        seedFromSelection: true,
        focusFindInput: true,
      });
    }
  }

  function refreshRawFindMatches(options = {}) {
    const previousStart =
      rawFindState.matches[rawFindState.activeIndex]?.start ?? null;
    rawFindState.matches = findLiteralMatches(
      textArea?.value || "",
      rawFindState.query,
      rawFindState.matchCase,
    );

    if (!rawFindState.matches.length) {
      rawFindState.activeIndex = -1;
      updateRawFindControls();
      return;
    }

    if (options.activeFromSelection && textArea) {
      rawFindState.activeIndex = getRawMatchIndexAtOrAfter(
        textArea.selectionStart,
      );
    } else if (Number.isFinite(previousStart)) {
      rawFindState.activeIndex = getRawMatchIndexAtOrAfter(previousStart);
    } else if (
      rawFindState.activeIndex < 0 ||
      rawFindState.activeIndex >= rawFindState.matches.length
    ) {
      rawFindState.activeIndex = 0;
    }

    updateRawFindControls();
  }

  function findLiteralMatches(text, query, matchCase) {
    if (!query) {
      return [];
    }

    const source = String(text);
    const needle = matchCase ? query : query.toLowerCase();
    const haystack = matchCase ? source : source.toLowerCase();
    const matches = [];
    let index = haystack.indexOf(needle);

    while (index !== -1) {
      matches.push({
        start: index,
        end: index + query.length,
      });
      index = haystack.indexOf(needle, index + query.length);
    }

    return matches;
  }

  function getRawMatchIndexAtOrAfter(position) {
    const nextIndex = rawFindState.matches.findIndex(
      (match) => match.start >= position,
    );
    return nextIndex === -1 ? 0 : nextIndex;
  }

  function updateRawFindControls() {
    const hasQuery = Boolean(rawFindState.query);
    const hasMatches = rawFindState.matches.length > 0;

    if (rawFindCount) {
      rawFindCount.textContent = hasMatches
        ? `${rawFindState.activeIndex + 1} / ${rawFindState.matches.length}`
        : "0 / 0";
    }

    [
      rawFindPrevButton,
      rawFindNextButton,
      rawReplaceFirstButton,
      rawReplaceAllButton,
    ].forEach((button) => {
      if (button) {
        button.disabled = !hasQuery || !hasMatches;
      }
    });
  }

  function moveRawFindMatch(delta) {
    if (!rawFindState.matches.length) {
      updateRawFindControls();
      return;
    }

    rawFindState.activeIndex =
      (rawFindState.activeIndex + delta + rawFindState.matches.length) %
      rawFindState.matches.length;
    selectActiveRawFindMatch();
  }

  function selectActiveRawFindMatch() {
    const match = rawFindState.matches[rawFindState.activeIndex];
    if (!match || !textArea) {
      updateRawFindControls();
      return;
    }

    textArea.focus();
    textArea.setSelectionRange(match.start, match.end);
    scrollRawEditorToMatch(match);
    updateJsonHighlight(currentText);
    updateRawFindControls();
    window.requestAnimationFrame(syncJsonHighlightScroll);
  }

  function scrollRawEditorToMatch(match) {
    if (!textArea || !match) {
      return;
    }

    const metrics = getRawEditorMetrics();
    const textBeforeMatch = textArea.value.slice(0, match.start);
    const lineIndex = countLines(textBeforeMatch) - 1;
    const lineStartIndex = textBeforeMatch.lastIndexOf("\n") + 1;
    const columnText = textArea.value.slice(lineStartIndex, match.start);
    const matchText = textArea.value.slice(match.start, match.end);
    const targetTop = metrics.paddingTop + lineIndex * metrics.lineHeight;
    const targetBottom = targetTop + metrics.lineHeight;
    const targetLeft = metrics.paddingLeft + measureRawEditorText(columnText);
    const targetRight = targetLeft + measureRawEditorText(matchText);
    const verticalMargin = metrics.lineHeight * 2;
    const horizontalMargin = metrics.characterWidth * 4;
    const visibleTop = textArea.scrollTop;
    const visibleBottom = visibleTop + textArea.clientHeight;
    const visibleLeft = textArea.scrollLeft;
    const visibleRight = visibleLeft + textArea.clientWidth;

    if (targetTop < visibleTop + verticalMargin) {
      textArea.scrollTop = Math.max(0, targetTop - verticalMargin);
    } else if (targetBottom > visibleBottom - verticalMargin) {
      textArea.scrollTop = Math.max(
        0,
        targetBottom - textArea.clientHeight + verticalMargin,
      );
    }

    if (targetLeft < visibleLeft + horizontalMargin) {
      textArea.scrollLeft = Math.max(0, targetLeft - horizontalMargin);
    } else if (targetRight > visibleRight - horizontalMargin) {
      textArea.scrollLeft = Math.max(
        0,
        targetRight - textArea.clientWidth + horizontalMargin,
      );
    }

    syncJsonHighlightScroll();
  }

  function getRawEditorMetrics() {
    const style = window.getComputedStyle(textArea);
    const fontSize = parseFloat(style.fontSize) || 11;
    const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.55;
    return {
      characterWidth: measureRawEditorText("0") || fontSize * 0.62,
      lineHeight,
      paddingLeft: parseFloat(style.paddingLeft) || 0,
      paddingTop: parseFloat(style.paddingTop) || 0,
    };
  }

  function measureRawEditorText(value) {
    if (!rawTextMeasureCanvas) {
      rawTextMeasureCanvas = document.createElement("canvas");
    }
    const context = rawTextMeasureCanvas.getContext("2d");
    if (!context || !textArea) {
      return String(value).length * 7;
    }

    const style = window.getComputedStyle(textArea);
    context.font = [
      style.fontStyle,
      style.fontVariant,
      style.fontWeight,
      style.fontSize,
      style.fontFamily,
    ]
      .filter(Boolean)
      .join(" ");
    return context.measureText(String(value)).width;
  }

  function countLines(value) {
    if (!value) {
      return 1;
    }
    return String(value).split("\n").length;
  }

  function replaceActiveRawMatch() {
    if (!rawFindState.matches.length || !textArea) {
      return;
    }

    const match =
      rawFindState.matches[rawFindState.activeIndex] || rawFindState.matches[0];
    const nextText = replaceTextRange(
      textArea.value,
      match,
      rawFindState.replacement,
    );
    const nextSelectionStart = match.start;
    const nextSelectionEnd = match.start + rawFindState.replacement.length;

    updateRawEditorTextAfterReplace(
      nextText,
      nextSelectionStart,
      nextSelectionEnd,
    );
    setStatus("Replaced 1 match. Apply changes to save to disk.", "");
  }

  function replaceAllRawMatches() {
    if (!rawFindState.matches.length || !textArea) {
      return;
    }

    const matchCount = rawFindState.matches.length;
    let nextText = "";
    let cursor = 0;

    rawFindState.matches.forEach((match) => {
      nextText += textArea.value.slice(cursor, match.start);
      nextText += rawFindState.replacement;
      cursor = match.end;
    });
    nextText += textArea.value.slice(cursor);

    updateRawEditorTextAfterReplace(nextText, 0, 0);
    setStatus(
      `Replaced ${matchCount} ${matchCount === 1 ? "match" : "matches"}. Apply changes to save to disk.`,
      "",
    );
  }

  function replaceTextRange(text, match, replacement) {
    return `${text.slice(0, match.start)}${replacement}${text.slice(match.end)}`;
  }

  function updateRawEditorTextAfterReplace(
    nextText,
    selectionStart,
    selectionEnd,
  ) {
    currentText = nextText;
    textArea.value = nextText;
    textArea.setSelectionRange(selectionStart, selectionEnd);
    refreshRawFindMatches();
    scrollRawEditorToMatch({ start: selectionStart, end: selectionEnd });
    updateJsonHighlight(nextText);
    syncJsonHighlightScroll();
    updateDocumentMetrics();
  }

  function initialiseJsonEditorHighlighting() {
    if (!textArea) {
      return;
    }

    textArea.addEventListener("input", () => {
      currentText = textArea.value;
      refreshRawFindMatches();
      updateJsonHighlight(currentText);
      syncJsonHighlightScroll();
      updateDocumentMetrics();
    });

    textArea.addEventListener("scroll", () => {
      syncJsonHighlightScroll();
    });

    textArea.addEventListener("keydown", handleRawEditorFindShortcut);

    refreshRawFindMatches();
    updateJsonHighlight(textArea.value || "");
    syncJsonHighlightScroll();
  }

  function setEditorText(text) {
    textArea.value = text;
    refreshRawFindMatches();
    updateJsonHighlight(text);
    syncJsonHighlightScroll();
  }

  function syncJsonHighlightScroll() {
    if (!highlightLayer || !textArea) {
      return;
    }

    highlightLayer.scrollTop = textArea.scrollTop;
    highlightLayer.scrollLeft = textArea.scrollLeft;
    if (jsonGutter) {
      jsonGutter.scrollTop = textArea.scrollTop;
    }
  }

  function updateJsonHighlight(text) {
    const source = typeof text === "string" ? text : "";
    updateRawEditorMode(source);

    if (!highlightLayer) {
      return;
    }

    if (rawEditorLargeMode) {
      highlightLayer.textContent = "";
      updateJsonGutter(source);
      return;
    }

    highlightLayer.innerHTML = highlightJson(source);
    updateJsonGutter(source);
  }

  function updateRawEditorMode(text) {
    rawEditorLargeMode = isLargeRawDocument(text);
    if (jsonEditor) {
      jsonEditor.classList.toggle("plain-text", rawEditorLargeMode);
    }
  }

  function isLargeRawDocument(text) {
    const source = typeof text === "string" ? text : "";
    return (
      source.length > largeRawEditorThresholds.characters ||
      hasMoreThanLineThreshold(source, largeRawEditorThresholds.lines)
    );
  }

  function hasMoreThanLineThreshold(text, threshold) {
    let lines = 1;
    for (let index = 0; index < text.length; index += 1) {
      if (text.charCodeAt(index) === 10) {
        lines += 1;
        if (lines > threshold) {
          return true;
        }
      }
    }
    return false;
  }

  function highlightJson(text) {
    if (!text.length) {
      return " ";
    }

    const searchMatches = getSearchMatchesForHighlight();
    const tokenRegex =
      /"(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;

    let html = "";
    let lastIndex = 0;
    let match = tokenRegex.exec(text);

    while (match) {
      const token = match[0];
      const start = match.index;
      html += renderTextWithSearch(
        text.slice(lastIndex, start),
        "",
        lastIndex,
        searchMatches,
        true,
      );

      let className = "json-number";
      if (token.startsWith('"')) {
        className = token.endsWith(":") ? "json-key" : "json-string";
      } else if (token === "true" || token === "false") {
        className = "json-boolean";
      } else if (token === "null") {
        className = "json-null";
      }

      if (className === "json-key" && token.endsWith(":")) {
        html += renderTextWithSearch(
          token.slice(0, -1),
          className,
          start,
          searchMatches,
          false,
        );
        html += renderTextWithSearch(
          ":",
          "json-punctuation",
          start + token.length - 1,
          searchMatches,
          false,
        );
      } else {
        html += renderTextWithSearch(
          token,
          className,
          start,
          searchMatches,
          false,
        );
      }
      lastIndex = tokenRegex.lastIndex;
      match = tokenRegex.exec(text);
    }

    html += renderTextWithSearch(
      text.slice(lastIndex),
      "",
      lastIndex,
      searchMatches,
      true,
    );
    return html;
  }

  function getSearchMatchesForHighlight() {
    if (!rawFindState.isOpen || !rawFindState.query) {
      return [];
    }
    return rawFindState.matches;
  }

  function renderTextWithSearch(
    text,
    className,
    baseOffset,
    searchMatches,
    shouldHighlightPunctuation,
  ) {
    if (!text.length) {
      return "";
    }

    const segmentStart = baseOffset;
    const segmentEnd = baseOffset + text.length;
    const overlappingMatches = searchMatches.filter(
      (match) => match.end > segmentStart && match.start < segmentEnd,
    );

    if (!overlappingMatches.length) {
      return renderTextPiece(text, className, shouldHighlightPunctuation);
    }

    let html = "";
    let cursor = 0;
    overlappingMatches.forEach((match) => {
      const localStart = Math.max(0, match.start - baseOffset);
      const localEnd = Math.min(text.length, match.end - baseOffset);

      if (localStart > cursor) {
        html += renderTextPiece(
          text.slice(cursor, localStart),
          className,
          shouldHighlightPunctuation,
        );
      }

      const markClass =
        rawFindState.matches[rawFindState.activeIndex] === match
          ? "json-search-match active"
          : "json-search-match";
      html += `<mark class="${markClass}">${renderTextPiece(
        text.slice(localStart, localEnd),
        className,
        shouldHighlightPunctuation,
      )}</mark>`;
      cursor = localEnd;
    });

    if (cursor < text.length) {
      html += renderTextPiece(
        text.slice(cursor),
        className,
        shouldHighlightPunctuation,
      );
    }

    return html;
  }

  function renderTextPiece(text, className, shouldHighlightPunctuation) {
    if (!text.length) {
      return "";
    }

    if (className) {
      return `<span class="${className}">${escapeHtml(text)}</span>`;
    }

    if (!shouldHighlightPunctuation) {
      return escapeHtml(text);
    }

    let html = "";
    for (const char of String(text)) {
      if ("{}[],:".includes(char)) {
        html += `<span class="json-punctuation">${escapeHtml(char)}</span>`;
      } else {
        html += escapeHtml(char);
      }
    }
    return html;
  }

  function updateJsonGutter(text) {
    if (!jsonGutter) {
      return;
    }
    if (rawEditorLargeMode) {
      jsonGutter.textContent = "";
      return;
    }
    const lineCount = Math.max(1, String(text).split("\n").length);
    const lines = Array.from({ length: lineCount }, (_, index) =>
      String(index + 1),
    );
    jsonGutter.textContent = lines.join("\n");
  }

  function updateDocumentMetrics() {
    const featureCount = documentAnalysis.featureCount;
    const fileBytes = rawEditorLargeMode
      ? (currentText || "").length
      : getUtf8ByteLength(currentText || "");
    const featureLabel = `Features ${featureCount}`;
    const sizeLabel = `Size ${formatBytes(fileBytes)}`;

    if (featureCountIndicator) {
      featureCountIndicator.textContent = featureLabel;
    }
    if (fileSizeIndicator) {
      fileSizeIndicator.textContent = sizeLabel;
    }
    updateMapToolbarState();
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

  function showLargeFileLoading(progress, step, detail) {
    updateLargeFileLoading(progress, step, detail);
    if (!largeFileLoading) {
      return;
    }
    largeFileLoading.classList.remove("hidden");
    largeFileLoading.setAttribute("aria-hidden", "false");
    largeFileLoading.setAttribute("aria-busy", "true");
  }

  function hideLargeFileLoading() {
    if (!largeFileLoading) {
      return;
    }
    largeFileLoading.classList.add("hidden");
    largeFileLoading.setAttribute("aria-hidden", "true");
    largeFileLoading.removeAttribute("aria-busy");
  }

  function showRawDataPopup(reason, title, message) {
    activeRawDataPopupReason = reason;
    if (!rawDataPopup || dismissedRawDataPopupReason === reason) {
      return;
    }
    if (rawDataPopupTitle) {
      rawDataPopupTitle.textContent = title;
    }
    if (rawDataPopupMessage) {
      rawDataPopupMessage.textContent = message;
    }
    rawDataPopup.classList.remove("hidden");
    rawDataPopup.setAttribute("aria-hidden", "false");
  }

  function hideRawDataPopup(options = {}) {
    const { resetDismissed = false } = options;
    activeRawDataPopupReason = "";
    if (resetDismissed) {
      dismissedRawDataPopupReason = "";
    }
    if (!rawDataPopup) {
      return;
    }
    rawDataPopup.classList.add("hidden");
    rawDataPopup.setAttribute("aria-hidden", "true");
  }

  function updateLargeFileLoading(progress, step, detail) {
    const percent = Math.round(clampNumber(progress, 0, 100, 0));

    if (largeFileLoadingPercent) {
      largeFileLoadingPercent.textContent = `${percent}%`;
    }
    if (largeFileLoadingStep && step) {
      largeFileLoadingStep.textContent = step;
    }
    if (largeFileLoadingDetail && detail) {
      largeFileLoadingDetail.textContent = detail;
    }
    if (largeFileLoadingProgress) {
      largeFileLoadingProgress.setAttribute("aria-valuenow", String(percent));
    }
    if (largeFileLoadingBar) {
      largeFileLoadingBar.style.width = `${percent}%`;
    }
  }

  function hideMapLoading() {
    setLoading(false);
  }

  function setLoading(isLoading, options = {}) {
    if (!loadingIndicator) {
      return;
    }

    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }

    if (isLoading) {
      const showLoading = () => {
        loadingTimeout = null;
        loadingIndicator.classList.remove("hidden");
        loadingIndicator.setAttribute("aria-hidden", "false");
        loadingIndicator.setAttribute("aria-busy", "true");
      };

      if (options.immediate) {
        showLoading();
      } else {
        loadingTimeout = setTimeout(showLoading, 150);
      }
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
      return "Unknown GeoJSON error.";
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
      setCurrentGeoJson({ type: "FeatureCollection", features: [] });
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
    setStatus(getVertexEditInstructions(feature), "");
    if (mapReady) {
      map.getCanvas().style.cursor = "crosshair";
    }
    updateVertexMarkers(feature);
    renderPropertiesPanel(feature);
    updateMapToolbarState();
  }

  function exitVertexEditMode() {
    isEditingVertices = false;
    clearVertexMarkers();
    if (mapReady) {
      map.getCanvas().style.cursor = "";
    }
    setStatus("", "");
    const feature = getSelectedFeature();
    if (feature) {
      renderPropertiesPanel(feature);
    }
    updateMapToolbarState();
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
      const markerElement = document.createElement("div");
      markerElement.className = "vertex-marker";
      markerElement.tabIndex = 0;
      markerElement.setAttribute("role", "button");
      markerElement.setAttribute(
        "aria-label",
        `Vertex ${index + 1}. Drag to move. Right-click to delete.`,
      );
      const marker = new maplibregl.Marker({
        element: markerElement,
        draggable: true,
      })
        .setLngLat([coord[0], coord[1]])
        .addTo(map);

      marker.on("dragstart", () => {
        draggedVertex = {
          marker,
          index,
          feature,
          featureIndex: selectedFeatureIndex,
          originalCoord: [coord[0], coord[1]],
        };
        markerElement.classList.remove("snapping");
      });

      marker.on("drag", () => {
        if (draggedVertex) {
          const nextCoordinate = getDraggedVertexCoordinate(draggedVertex);
          updateGeometryCoordinate(
            draggedVertex.feature,
            draggedVertex.index,
            nextCoordinate,
          );

          // Update map geometry live while dragging.
          updateMap(currentGeoJson);
        }
      });

      marker.on("dragend", () => {
        if (draggedVertex) {
          const nextCoordinate = getDraggedVertexCoordinate(draggedVertex);
          draggedVertex.marker.setLngLat(nextCoordinate);
          updateGeometryCoordinate(
            draggedVertex.feature,
            draggedVertex.index,
            nextCoordinate,
          );
          commitGeometryChanges("Vertex moved.");
          markerElement.classList.remove("snapping");
          draggedVertex = null;
        }
      });

      markerElement.title = "Drag to move. Right-click to delete.";

      ["mouseup", "click", "dblclick"].forEach((eventName) => {
        markerElement.addEventListener(eventName, (vertexEvent) => {
          vertexEvent.stopPropagation();
        });
      });

      markerElement.addEventListener("contextmenu", (vertexEvent) => {
        vertexEvent.preventDefault();
        vertexEvent.stopPropagation();
        deleteVertexAtIndex(feature, index);
      });

      vertexMarkers.push(marker);
    });
  }

  function getVertexEditInstructions(feature) {
    const geometryType = feature?.geometry?.type;

    switch (geometryType) {
      case "Point":
        return "Drag the point marker to move it. Points do not support adding or deleting vertices.";
      case "MultiPoint":
        return "Drag points to move them. Click the map to add a point and right-click a point to delete it.";
      case "LineString":
      case "MultiLineString":
        return "Drag vertices to edit geometry. Click near a line segment to add a vertex and right-click a vertex to delete it.";
      case "Polygon":
      case "MultiPolygon":
        return "Drag vertices to edit geometry. Click near an edge to add a vertex and right-click a vertex to delete it.";
      default:
        return "Drag vertices to edit geometry. Click the map to add a vertex and right-click a vertex to delete it.";
    }
  }

  function isMarkerInteraction(event) {
    const target = event?.originalEvent?.target;
    return Boolean(
      target &&
      typeof target.closest === "function" &&
      target.closest(".maplibregl-marker"),
    );
  }

  function normaliseCoordinate(coordinate) {
    return [
      normaliseLongitude(coordinate?.[0]),
      clampLatitude(coordinate?.[1]),
    ];
  }

  function isCoordinatePair(coordinate) {
    return (
      Array.isArray(coordinate) &&
      Number.isFinite(Number(coordinate[0])) &&
      Number.isFinite(Number(coordinate[1]))
    );
  }

  function getEditableCoordinatePath(geometry) {
    if (!geometry || typeof geometry !== "object") {
      return null;
    }

    switch (geometry.type) {
      case "MultiPoint":
        return {
          path: geometry.coordinates,
          closed: false,
          minimumVertices: 1,
        };
      case "LineString":
        return {
          path: geometry.coordinates,
          closed: false,
          minimumVertices: 2,
        };
      case "Polygon":
        return geometry.coordinates[0]
          ? {
              path: geometry.coordinates[0],
              closed: true,
              minimumVertices: 3,
            }
          : null;
      case "MultiLineString":
        return geometry.coordinates[0]
          ? {
              path: geometry.coordinates[0],
              closed: false,
              minimumVertices: 2,
            }
          : null;
      case "MultiPolygon":
        return geometry.coordinates[0] && geometry.coordinates[0][0]
          ? {
              path: geometry.coordinates[0][0],
              closed: true,
              minimumVertices: 3,
            }
          : null;
      default:
        return null;
    }
  }

  function getEditableVertexCount(pathDetails) {
    if (!pathDetails || !Array.isArray(pathDetails.path)) {
      return 0;
    }

    return pathDetails.closed
      ? Math.max(0, pathDetails.path.length - 1)
      : pathDetails.path.length;
  }

  function findNearestVertexIndex(feature, point) {
    const coordinates = extractCoordinates(feature?.geometry);
    let nearestIndex = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    coordinates.forEach((coordinate, index) => {
      const projected = map.project([coordinate[0], coordinate[1]]);
      const distance = Math.hypot(projected.x - point.x, projected.y - point.y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    return Number.isInteger(nearestIndex)
      ? { index: nearestIndex, distance: nearestDistance }
      : null;
  }

  function getDraggedVertexCoordinate(dragContext) {
    const lngLat = dragContext.marker.getLngLat();
    const freeCoordinate = normaliseCoordinate([lngLat.lng, lngLat.lat]);
    const snapTarget = findNearestSnapVertex(freeCoordinate, dragContext);
    const markerElement = dragContext.marker.getElement();

    if (snapTarget) {
      markerElement?.classList.add("snapping");
      dragContext.marker.setLngLat(snapTarget.coordinate);
      return snapTarget.coordinate;
    }

    markerElement?.classList.remove("snapping");
    return freeCoordinate;
  }

  function findNearestSnapVertex(coordinate, dragContext) {
    if (!snapVerticesEnabled || !mapReady || !map || !currentGeoJson) {
      return null;
    }

    const targetPoint = map.project(coordinate);
    let nearest = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    collectSnapVertices().forEach((vertex) => {
      if (
        Number.isInteger(dragContext?.featureIndex) &&
        vertex.featureIndex === dragContext.featureIndex &&
        vertex.vertexIndex === dragContext.index
      ) {
        return;
      }

      const projected = map.project(vertex.coordinate);
      const distance = Math.hypot(
        projected.x - targetPoint.x,
        projected.y - targetPoint.y,
      );

      if (distance < nearestDistance) {
        nearest = vertex;
        nearestDistance = distance;
      }
    });

    if (!nearest || nearestDistance > maxVertexSnapDistancePx) {
      return null;
    }

    return {
      coordinate: [...nearest.coordinate],
      distance: nearestDistance,
    };
  }

  function collectSnapVertices() {
    const features = collectFeatures(currentGeoJson);
    const vertices = [];

    features.forEach((feature, featureIndex) => {
      extractCoordinates(feature?.geometry).forEach((coordinate, vertexIndex) => {
        if (!isCoordinatePair(coordinate)) {
          return;
        }
        vertices.push({
          featureIndex,
          vertexIndex,
          coordinate: normaliseCoordinate(coordinate),
        });
      });
    });

    return vertices;
  }

  function findNearestSegmentIndex(feature, point) {
    const geometry = feature?.geometry;
    const coordinates = extractCoordinates(geometry);
    if (!geometry || coordinates.length < 2) {
      return null;
    }

    const isClosed =
      geometry.type === "Polygon" || geometry.type === "MultiPolygon";
    const segmentCount = isClosed ? coordinates.length : coordinates.length - 1;
    let nearestIndex = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < segmentCount; index += 1) {
      const start = map.project([coordinates[index][0], coordinates[index][1]]);
      const endCoordinate = isClosed
        ? coordinates[(index + 1) % coordinates.length]
        : coordinates[index + 1];
      const end = map.project([endCoordinate[0], endCoordinate[1]]);
      const distance = getPointToSegmentDistance(point, start, end);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    }

    return Number.isInteger(nearestIndex)
      ? { index: nearestIndex, distance: nearestDistance }
      : null;
  }

  function getPointToSegmentDistance(point, start, end) {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const lengthSquared = deltaX * deltaX + deltaY * deltaY;

    if (!lengthSquared) {
      return Math.hypot(point.x - start.x, point.y - start.y);
    }

    const projection =
      ((point.x - start.x) * deltaX + (point.y - start.y) * deltaY) /
      lengthSquared;
    const clampedProjection = Math.max(0, Math.min(1, projection));
    const closestX = start.x + clampedProjection * deltaX;
    const closestY = start.y + clampedProjection * deltaY;

    return Math.hypot(point.x - closestX, point.y - closestY);
  }

  function addVertexAtPoint(feature, lngLat, point) {
    if (!feature?.geometry) {
      return false;
    }

    const geometryType = feature.geometry.type;
    const coordinate = normaliseCoordinate([lngLat.lng, lngLat.lat]);

    if (geometryType === "Point") {
      setStatus(getVertexEditInstructions(feature), "");
      return false;
    }

    if (geometryType === "MultiPoint") {
      feature.geometry.coordinates.push(coordinate);
      commitGeometryChanges("Vertex added.");
      return true;
    }

    const nearestSegment = findNearestSegmentIndex(feature, point);
    if (
      !nearestSegment ||
      nearestSegment.distance > maxVertexInsertDistancePx ||
      !insertGeometryCoordinate(feature, nearestSegment.index, coordinate)
    ) {
      setStatus(getVertexEditInstructions(feature), "");
      return false;
    }

    commitGeometryChanges("Vertex added.");
    return true;
  }

  function insertGeometryCoordinate(feature, segmentIndex, coordinate) {
    const pathDetails = getEditableCoordinatePath(feature?.geometry);
    if (!pathDetails || !Array.isArray(pathDetails.path)) {
      return false;
    }

    const vertexCount = getEditableVertexCount(pathDetails);
    if (!vertexCount) {
      return false;
    }

    const nextCoordinate = normaliseCoordinate(coordinate);
    const insertAt =
      pathDetails.closed && segmentIndex === vertexCount - 1
        ? pathDetails.path.length - 1
        : segmentIndex + 1;
    pathDetails.path.splice(insertAt, 0, nextCoordinate);

    if (pathDetails.closed && pathDetails.path.length > 1) {
      pathDetails.path[pathDetails.path.length - 1] = [...pathDetails.path[0]];
    }

    return true;
  }

  function deleteNearestVertex(feature, point) {
    const nearestVertex = findNearestVertexIndex(feature, point);
    if (!nearestVertex || nearestVertex.distance > maxVertexDeleteDistancePx) {
      setStatus("Right-click directly on a vertex to delete it.", "");
      return false;
    }

    return deleteVertexAtIndex(feature, nearestVertex.index);
  }

  function deleteVertexAtIndex(feature, index) {
    const result = deleteGeometryCoordinate(feature, index);
    if (!result.ok) {
      setStatus(result.message, result.type || "");
      return false;
    }

    commitGeometryChanges("Vertex deleted.");
    return true;
  }

  function deleteGeometryCoordinate(feature, index) {
    const geometry = feature?.geometry;
    if (!geometry) {
      return {
        ok: false,
        message: "Select a feature to edit vertices.",
        type: "",
      };
    }

    if (geometry.type === "Point") {
      return {
        ok: false,
        message:
          "Points keep a single coordinate. Drag the marker to reposition it instead.",
        type: "",
      };
    }

    const pathDetails = getEditableCoordinatePath(geometry);
    const vertexCount = getEditableVertexCount(pathDetails);
    if (!pathDetails || !Array.isArray(pathDetails.path)) {
      return {
        ok: false,
        message: "This geometry type does not support vertex deletion.",
        type: "error",
      };
    }

    if (index < 0 || index >= vertexCount) {
      return {
        ok: false,
        message: "Unable to determine which vertex to delete.",
        type: "error",
      };
    }

    if (vertexCount <= pathDetails.minimumVertices) {
      return {
        ok: false,
        message: getMinimumVertexMessage(
          geometry.type,
          pathDetails.minimumVertices,
        ),
        type: "",
      };
    }

    pathDetails.path.splice(index, 1);

    if (pathDetails.closed && pathDetails.path.length > 1) {
      pathDetails.path[pathDetails.path.length - 1] = [...pathDetails.path[0]];
    }

    return { ok: true };
  }

  function getMinimumVertexMessage(geometryType, minimumVertices) {
    switch (geometryType) {
      case "LineString":
      case "MultiLineString":
        return `Lines need at least ${minimumVertices} vertices.`;
      case "Polygon":
      case "MultiPolygon":
        return `Polygons need at least ${minimumVertices} vertices.`;
      case "MultiPoint":
        return "A multipoint feature needs at least one point.";
      default:
        return `This feature needs at least ${minimumVertices} vertices.`;
    }
  }

  function extractCoordinates(geometry) {
    const coordinates = [];

    switch (geometry.type) {
      case "Point":
        coordinates.push(geometry.coordinates);
        break;
      default: {
        const pathDetails = getEditableCoordinatePath(geometry);
        if (!pathDetails || !Array.isArray(pathDetails.path)) {
          break;
        }
        const vertexCount = getEditableVertexCount(pathDetails);
        for (let index = 0; index < vertexCount; index += 1) {
          coordinates.push(pathDetails.path[index]);
        }
        break;
      }
    }

    return coordinates;
  }

  function updateGeometryCoordinate(feature, index, newCoord) {
    if (!feature || !feature.geometry) {
      return;
    }

    const geometry = feature.geometry;
    const nextCoordinate = normaliseCoordinate(newCoord);

    switch (geometry.type) {
      case "Point":
        if (index === 0) {
          geometry.coordinates = nextCoordinate;
        }
        break;
      default: {
        const pathDetails = getEditableCoordinatePath(geometry);
        const vertexCount = getEditableVertexCount(pathDetails);
        if (!pathDetails || !Array.isArray(pathDetails.path)) {
          return;
        }

        if (index < 0 || index >= vertexCount) {
          return;
        }

        pathDetails.path[index] = nextCoordinate;
        if (pathDetails.closed && pathDetails.path.length > 1) {
          pathDetails.path[pathDetails.path.length - 1] = [
            ...pathDetails.path[0],
          ];
        }
        break;
      }
    }
  }

  function commitGeometryChanges(message, options = {}) {
    commitPropertyChanges(message, options);
  }
})();
