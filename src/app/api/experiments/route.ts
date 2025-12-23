import { getExperiments } from '@/lib/experiments';
import { NextResponse } from 'next/server';

export async function GET() {
    const experiments = await getExperiments();
    return NextResponse.json(experiments);
}
