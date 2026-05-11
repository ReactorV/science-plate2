/**
 * On-demand FDC hydration — fetches a single food from FDC API
 * when a search miss occurs (no local match in canonical_food FTS5).
 */

const FDC_API_BASE = "https://api.nal.usda.gov/fdc/v1";

interface FdcSearchResult {
  fdcId: number;
  description: string;
  dataType: string;
  foodCategory?: string;
  score: number;
}

interface FdcSearchResponse {
  foods: FdcSearchResult[];
  totalHits: number;
}

export async function searchFdc(
  query: string,
  apiKey: string,
  options?: { limit?: number; dataTypes?: string[] },
): Promise<FdcSearchResult[]> {
  const limit = options?.limit ?? 10;
  const dataTypes = options?.dataTypes ?? ["Foundation", "SR Legacy"];

  const resp = await fetch(`${FDC_API_BASE}/foods/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({
      query,
      pageSize: limit,
      dataType: dataTypes,
    }),
  });

  if (!resp.ok) {
    throw new Error(`FDC search API error: ${resp.status}`);
  }

  const data: FdcSearchResponse = await resp.json();
  return data.foods ?? [];
}

export async function fetchFdcFood(fdcId: number, apiKey: string) {
  const resp = await fetch(`${FDC_API_BASE}/food/${fdcId}`, {
    headers: { "X-Api-Key": apiKey },
  });
  if (!resp.ok) throw new Error(`FDC detail API error: ${resp.status}`);
  return resp.json();
}
