(() => {
  function sanitizeProperties(properties) {
    const source =
      properties && typeof properties === "object" ? properties : {};
    const result = {};
    for (const key of Object.keys(source)) {
      if (key === "__editorIndex") {
        continue;
      }
      result[key] = source[key];
    }
    return result;
  }

  function normaliseColour(value, fallback) {
    if (typeof value !== "string") {
      return fallback;
    }
    const trimmed = value.trim();
    return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed : fallback;
  }

  function clampNumber(value, min, max, fallback) {
    if (!Number.isFinite(value)) {
      return fallback;
    }
    return Math.max(min, Math.min(max, value));
  }

  function collectFeatures(data) {
    if (!data) {
      return [];
    }

    if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
      return data.features;
    }

    if (data.type === "Feature" && data.geometry) {
      return [data];
    }

    if (data.type && data.coordinates) {
      return [{ type: "Feature", geometry: data, properties: {} }];
    }

    return [];
  }

  function normaliseGeoJson(data) {
    if (!data || typeof data !== "object") {
      return null;
    }

    if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
      return data;
    }

    if (data.type === "Feature" && data.geometry) {
      return { type: "FeatureCollection", features: [data] };
    }

    if (data.type && data.coordinates) {
      return {
        type: "FeatureCollection",
        features: [{ type: "Feature", geometry: data, properties: {} }],
      };
    }

    return null;
  }

  function fitToDataBounds(map, data) {
    const bounds = computeBounds(data);
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

  function computeBounds(data) {
    const features = collectFeatures(data);
    if (!features.length) {
      return null;
    }

    const bounds = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    };

    for (const feature of features) {
      const geometry = feature.geometry;
      if (!geometry) {
        continue;
      }
      traverseCoordinates(geometry.coordinates, (lon, lat) => {
        if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
          return;
        }
        bounds.minX = Math.min(bounds.minX, lon);
        bounds.minY = Math.min(bounds.minY, lat);
        bounds.maxX = Math.max(bounds.maxX, lon);
        bounds.maxY = Math.max(bounds.maxY, lat);
      });
    }

    if (!Number.isFinite(bounds.minX) || !Number.isFinite(bounds.minY)) {
      return null;
    }

    return bounds;
  }

  function traverseCoordinates(value, visitor) {
    if (!Array.isArray(value)) {
      return;
    }

    if (typeof value[0] === "number" && typeof value[1] === "number") {
      visitor(value[0], value[1]);
      return;
    }

    for (const coord of value) {
      traverseCoordinates(coord, visitor);
    }
  }

  function serialiseValue(value) {
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

  function coerceValue(raw) {
    const text = raw.trim();
    if (!text.length) {
      return "";
    }

    if (text === "true") {
      return true;
    }
    if (text === "false") {
      return false;
    }

    const number = Number(text);
    if (!Number.isNaN(number) && text === number.toString()) {
      return number;
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      return text;
    }
  }

  function roundFeatureCollection(collection, precision = 6) {
    if (!collection || collection.type !== "FeatureCollection") {
      return { type: "FeatureCollection", features: [] };
    }

    const safePrecision = normalisePrecision(precision);

    const features = Array.isArray(collection.features)
      ? collection.features
      : [];

    const roundedFeatures = features
      .map((feature) => {
        if (!feature || typeof feature !== "object") {
          return null;
        }
        const geometry = feature.geometry
          ? roundGeometry(feature.geometry, safePrecision)
          : null;
        const roundedFeature = {
          type: "Feature",
          geometry,
          properties: sanitizeProperties(feature.properties),
        };
        if (Object.prototype.hasOwnProperty.call(feature, "id")) {
          roundedFeature.id = feature.id;
        }
        if (Array.isArray(feature.bbox)) {
          roundedFeature.bbox = roundBoundingBox(feature.bbox, safePrecision);
        }
        return roundedFeature;
      })
      .filter(Boolean);

    return {
      type: "FeatureCollection",
      features: roundedFeatures,
    };
  }

  function roundGeometry(geometry, precision) {
    if (!geometry || typeof geometry !== "object") {
      return null;
    }

    if (geometry.type === "GeometryCollection") {
      const geometries = Array.isArray(geometry.geometries)
        ? geometry.geometries
            .map((child) => roundGeometry(child, precision))
            .filter(Boolean)
        : [];
      const rounded = {
        type: "GeometryCollection",
        geometries,
      };
      if (Array.isArray(geometry.bbox)) {
        rounded.bbox = roundBoundingBox(geometry.bbox, precision);
      }
      return rounded;
    }

    if (!geometry.type) {
      return null;
    }

    const roundedGeometry = {
      type: geometry.type,
      coordinates: roundCoordinates(geometry.coordinates, precision),
    };

    if (Array.isArray(geometry.bbox)) {
      roundedGeometry.bbox = roundBoundingBox(geometry.bbox, precision);
    }

    return roundedGeometry;
  }

  function roundCoordinates(value, precision) {
    if (!Array.isArray(value)) {
      return value;
    }

    if (
      value.length >= 2 &&
      typeof value[0] === "number" &&
      typeof value[1] === "number"
    ) {
      return roundCoordinateTuple(value, precision);
    }

    return value.map((item) => roundCoordinates(item, precision));
  }

  function roundCoordinateTuple(tuple, precision) {
    if (!Array.isArray(tuple)) {
      return tuple;
    }

    const result = [];
    const lon = roundNumber(normaliseLongitude(Number(tuple[0])), precision);
    const lat = roundNumber(clampLatitude(Number(tuple[1])), precision);
    result.push(lon, lat);

    for (let index = 2; index < tuple.length; index += 1) {
      const value = tuple[index];
      result.push(
        Number.isFinite(value) ? roundNumber(Number(value), precision) : value,
      );
    }

    return result;
  }

  function roundBoundingBox(bbox, precision) {
    if (!Array.isArray(bbox)) {
      return bbox;
    }
    return bbox.map((value, index) => {
      if (!Number.isFinite(value)) {
        return value;
      }
      if (index % 2 === 0) {
        return roundNumber(normaliseLongitude(value), precision);
      }
      return roundNumber(clampLatitude(value), precision);
    });
  }

  function normalisePrecision(value) {
    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed)) {
      return 6;
    }
    return Math.max(0, Math.min(10, parsed));
  }

  function roundNumber(value, precision = 6) {
    if (!Number.isFinite(value)) {
      return 0;
    }
    const factor = 10 ** precision;
    return Math.round(value * factor) / factor;
  }

  function normaliseLongitude(value) {
    if (!Number.isFinite(value)) {
      return 0;
    }
    let result = value;
    while (result < -180) {
      result += 360;
    }
    while (result > 180) {
      result -= 360;
    }
    return result;
  }

  function clampLatitude(value) {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.max(-85, Math.min(85, value));
  }

  window.geojsonEditorUtils = {
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
  };
})();
