import { NextResponse } from "next/server";

// MVP stub — returns seed-data score for any date.
// Will be wired to Drizzle + scoreDay pipeline once auth + data layer is complete.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
  }

  // MVP: return static seed data
  return NextResponse.json({
    date,
    targets: { kcal: 2180, protein: 124, carbs: 270, fat: 72, fibre: 32 },
    totals: { kcal: 2114, protein: 121, carbs: 258, fat: 71, fibre: 34 },
    pral: -7.4,
    confidence: 0.84,
    hash: "3f9ca14b02e8d7f6a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718",
    evidencePackVersion: "1.0.0",
  });
}
