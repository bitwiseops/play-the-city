import type { Interest, POI } from "@/types/index.js";

// ── Overpass API types ──

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

// ── Wikipedia API types ──

interface WikiPage {
  pageid: number;
  title: string;
  extract?: string;
  thumbnail?: { source: string };
  fullurl?: string;
}

interface WikiQueryResponse {
  query?: {
    pages?: Record<string, WikiPage>;
  };
}

// ── Category mapping from OSM tags to Interest ──

const CATEGORY_QUERIES: Record<Interest, string> = {
  arte: `node["tourism"="museum"](area);node["tourism"="gallery"](area);node["amenity"="theatre"](area);`,
  food: `node["amenity"="restaurant"](area);node["amenity"="cafe"](area);node["amenity"="bar"]["cuisine"](area);`,
  natura: `node["leisure"="park"](area);node["leisure"="garden"](area);node["natural"="peak"](area);`,
  storia: `node["historic"](area);node["tourism"="attraction"]["historic"](area);`,
  nightlife: `node["amenity"="nightclub"](area);node["amenity"="bar"](area);node["amenity"="pub"](area);`,
};

const OVERPASS_API = "https://overpass-api.de/api/interpreter";
const WIKIPEDIA_API = "https://{lang}.wikipedia.org/w/api.php";

const TARGET_PER_CATEGORY = 3;
const MIN_TOTAL = 10;
const MAX_TOTAL = 15;

// ── Overpass queries ──

function buildOverpassQuery(cityName: string, category: Interest): string {
  const inner = CATEGORY_QUERIES[category];
  return `
    [out:json][timeout:15];
    area["name"="${cityName}"]["boundary"="administrative"]->.searchArea;
    (
      ${inner}
    );
    out center 20;
  `;
}

async function queryOverpass(
  cityName: string,
  category: Interest,
): Promise<OverpassElement[]> {
  const query = buildOverpassQuery(cityName, category);
  const response = await fetch(OVERPASS_API, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    console.error(
      `Overpass query failed for ${category}: ${response.status}`,
    );
    return [];
  }

  const data = (await response.json()) as OverpassResponse;
  return data.elements.filter(
    (el) => el.tags?.name && (el.lat != null || el.center != null),
  );
}

// ── Wikipedia enrichment ──

function wikiApiUrl(lang: string): string {
  return WIKIPEDIA_API.replace("{lang}", lang);
}

async function fetchWikipediaInfo(
  name: string,
  lang: string,
): Promise<{ description: string; imageUrl?: string; source: string }> {
  const params = new URLSearchParams({
    action: "query",
    titles: name,
    prop: "extracts|pageimages|info",
    exintro: "1",
    explaintext: "1",
    pithumbsize: "300",
    inprop: "url",
    format: "json",
    origin: "*",
  });

  const url = `${wikiApiUrl(lang)}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { description: "", source: "" };
    }

    const data = (await response.json()) as WikiQueryResponse;
    const pages = data.query?.pages;
    if (!pages) {
      return { description: "", source: "" };
    }

    const page = Object.values(pages)[0];
    if (!page || page.pageid === undefined || page.pageid === -1) {
      return { description: "", source: "" };
    }

    return {
      description: page.extract ?? "",
      imageUrl: page.thumbnail?.source,
      source: page.fullurl ?? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(name)}`,
    };
  } catch {
    return { description: "", source: "" };
  }
}

// ── POI construction ──

function elementCoords(el: OverpassElement): { lat: number; lon: number } {
  if (el.lat != null && el.lon != null) {
    return { lat: el.lat, lon: el.lon };
  }
  if (el.center) {
    return { lat: el.center.lat, lon: el.center.lon };
  }
  return { lat: 0, lon: 0 };
}

function osmSourceUrl(el: OverpassElement): string {
  return `https://www.openstreetmap.org/${el.type}/${el.id}`;
}

async function buildPOI(
  el: OverpassElement,
  category: Interest,
  lang: string,
): Promise<POI> {
  const name = el.tags?.name ?? "Unknown";
  const coords = elementCoords(el);
  const wiki = await fetchWikipediaInfo(name, lang);

  return {
    id: `${el.type}-${el.id}`,
    name,
    description: wiki.description || el.tags?.description || name,
    category,
    latitude: coords.lat,
    longitude: coords.lon,
    source: wiki.source || osmSourceUrl(el),
    ...(wiki.imageUrl ? { imageUrl: wiki.imageUrl } : {}),
  };
}

// ── Main generator ──

export async function generateCityPOIs(
  cityName: string,
  lang: string,
): Promise<POI[]> {
  const categories: Interest[] = [
    "arte",
    "food",
    "natura",
    "storia",
    "nightlife",
  ];

  // Query all categories in parallel
  const categoryResults = await Promise.all(
    categories.map(async (category) => {
      const elements = await queryOverpass(cityName, category);
      return { category, elements };
    }),
  );

  // Select up to TARGET_PER_CATEGORY from each, shuffled for variety
  const selected: { element: OverpassElement; category: Interest }[] = [];

  for (const { category, elements } of categoryResults) {
    const shuffled = elements
      .slice()
      .sort(() => Math.random() - 0.5);
    const pick = shuffled.slice(0, TARGET_PER_CATEGORY);
    for (const element of pick) {
      selected.push({ element, category });
    }
  }

  // If we have fewer than MIN_TOTAL, fill from categories with extra results
  if (selected.length < MIN_TOTAL) {
    for (const { category, elements } of categoryResults) {
      const alreadySelected = new Set(
        selected
          .filter((s) => s.category === category)
          .map((s) => s.element.id),
      );
      const extras = elements.filter((el) => !alreadySelected.has(el.id));
      for (const element of extras) {
        if (selected.length >= MAX_TOTAL) break;
        selected.push({ element, category });
      }
      if (selected.length >= MIN_TOTAL) break;
    }
  }

  // Build POIs in parallel with Wikipedia enrichment
  const pois = await Promise.all(
    selected
      .slice(0, MAX_TOTAL)
      .map(({ element, category }) => buildPOI(element, category, lang)),
  );

  return pois;
}
