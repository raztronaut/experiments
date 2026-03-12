import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { getExperiments } from "@/lib/experiments";

export const revalidate = 3600;

export async function GET() {
  try {
    const experiments = await getExperiments();
    return NextResponse.json(experiments);
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
