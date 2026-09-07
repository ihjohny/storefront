export interface ParsedSpecFilters {
  productClass?: string;
  specs: Record<string, string[]>;
}

export function parseSpecsFromUrlParams(
  searchParams:
    | URLSearchParams
    | Record<string, string | string[] | undefined>
    | null
    | undefined
): ParsedSpecFilters {
  const specs: Record<string, string[]> = {};
  let productClass: string | undefined;

  if (!searchParams) {
    return { productClass, specs };
  }

  const entries: Array<[string, string | string[] | undefined]> =
    searchParams instanceof URLSearchParams
      ? Array.from(searchParams.entries())
      : Object.entries(searchParams);

  for (const [rawKey, rawVal] of entries) {
    if (rawVal === undefined || rawVal === null) continue;

    const key = rawKey.trim();

    if (key === "class" || key === "productClass") {
      const v = Array.isArray(rawVal) ? rawVal[0] : rawVal;
      if (v && typeof v === "string" && v.trim()) {
        productClass = v.trim();
      }
      continue;
    }

    if (
      key === "specs" &&
      typeof rawVal === "object" &&
      rawVal !== null &&
      !Array.isArray(rawVal)
    ) {
      for (const [subKey, subVal] of Object.entries(
        rawVal as Record<string, unknown>
      )) {
        if (!subKey || subVal === undefined || subVal === null) continue;
        const pKey = subKey.trim();
        const items = Array.isArray(subVal) ? subVal : [subVal];
        for (const item of items) {
          if (typeof item === "string") {
            const splitVals = item.split(",").map((s) => s.trim()).filter(Boolean);
            if (splitVals.length > 0) {
              if (!specs[pKey]) specs[pKey] = [];
              for (const sv of splitVals) {
                if (!specs[pKey].includes(sv)) specs[pKey].push(sv);
              }
            }
          }
        }
      }
      continue;
    }

    let paramKey: string | null = null;
    const bracketMatch = key.match(/^specs\[([^\]]+)\](?:\[\])?$/);
    if (bracketMatch) {
      paramKey = bracketMatch[1].trim();
    } else if (key.startsWith("specs.")) {
      paramKey = key.slice(6).trim();
    }

    if (paramKey) {
      const items = Array.isArray(rawVal) ? rawVal : [rawVal];
      for (const item of items) {
        if (typeof item === "string") {
          const splitVals = item.split(",").map((s) => s.trim()).filter(Boolean);
          if (splitVals.length > 0) {
            if (!specs[paramKey]) specs[paramKey] = [];
            for (const sv of splitVals) {
              if (!specs[paramKey].includes(sv)) specs[paramKey].push(sv);
            }
          }
        }
      }
    }
  }

  return { productClass, specs };
}

export function toggleSpecOptionInParams(
  currentParams: URLSearchParams,
  paramKey: string,
  optionValue: string
): URLSearchParams {
  const params = new URLSearchParams(currentParams.toString());
  const { specs } = parseSpecsFromUrlParams(params);

  const existingValues = specs[paramKey] ? [...specs[paramKey]] : [];
  const index = existingValues.indexOf(optionValue);

  if (index > -1) {
    existingValues.splice(index, 1);
  } else {
    existingValues.push(optionValue);
  }

  // Clear existing matching keys (e.g. specs[key], specs.key)
  Array.from(params.keys()).forEach((k) => {
    if (
      k === `specs[${paramKey}]` ||
      k === `specs[${paramKey}][]` ||
      k === `specs.${paramKey}`
    ) {
      params.delete(k);
    }
  });

  if (existingValues.length > 0) {
    params.set(`specs[${paramKey}]`, existingValues.join(","));
  }

  params.delete("page");
  return params;
}

export function removeSpecOptionFromParams(
  currentParams: URLSearchParams,
  paramKey: string,
  optionValue?: string
): URLSearchParams {
  const params = new URLSearchParams(currentParams.toString());
  const { specs } = parseSpecsFromUrlParams(params);

  Array.from(params.keys()).forEach((k) => {
    if (
      k === `specs[${paramKey}]` ||
      k === `specs[${paramKey}][]` ||
      k === `specs.${paramKey}`
    ) {
      params.delete(k);
    }
  });

  if (optionValue && specs[paramKey]) {
    const remaining = specs[paramKey].filter((v) => v !== optionValue);
    if (remaining.length > 0) {
      params.set(`specs[${paramKey}]`, remaining.join(","));
    }
  }

  params.delete("page");
  return params;
}

export function setClassInParams(
  currentParams: URLSearchParams,
  classSlug: string | null
): URLSearchParams {
  const params = new URLSearchParams(currentParams.toString());

  params.delete("class");
  params.delete("productClass");

  // When class changes or is cleared, remove all spec filters
  Array.from(params.keys()).forEach((k) => {
    if (k.startsWith("specs[") || k.startsWith("specs.")) {
      params.delete(k);
    }
  });

  if (classSlug) {
    params.set("class", classSlug);
  }

  params.delete("page");
  return params;
}
