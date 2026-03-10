import { NextResponse } from "next/server";
import { getExperiments } from "@/lib/experiments";

export const revalidate = 3600;

export async function GET() {
  const experiments = await getExperiments();
  return NextResponse.json(experiments);
}
