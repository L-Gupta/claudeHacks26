import { NextResponse } from 'next/server';
import { analyzeProfile } from '@/lib/claude';

export async function POST(req) {
  try {
    const body = await req.json();
    const { transcript, major, year, hobbies } = body;
    const result = await analyzeProfile({ transcript, major, year, hobbies });
    return NextResponse.json(result);
  } catch (err) {
    console.error('Analyze error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
