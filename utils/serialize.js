// Utility to serialize any Date instances in objects/arrays into ISO strings
export const toISO = (data) => {
  if (data === null || data === undefined) return data;
  if (data instanceof Date) return data.toISOString();
  if (Array.isArray(data)) return data.map((v) => toISO(v));
  if (typeof data === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(data)) {
      out[k] = toISO(v);
    }
    return out;
  }
  return data;
};

// Format Date to YYYY-MM-DD
const dateOnly = (d) => {
  try {
    const iso = d.toISOString();
    return iso.slice(0, 10); // YYYY-MM-DD
  } catch {
    return d;
  }
};

// Serialize while converting all Dates to date-only (YYYY-MM-DD)
export const serializeResponse = (data) => {
  const walk = (val, keyHint = null) => {
    if (val === null || val === undefined) return val;
    if (val instanceof Date) {
      return dateOnly(val);
    }
    if (Array.isArray(val)) return val.map((item) => walk(item));
    if (typeof val === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(val)) {
        out[k] = walk(v, k);
      }
      return out;
    }
    return val;
  };
  return walk(data);
};
