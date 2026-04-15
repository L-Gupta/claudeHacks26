import { getFloorStats } from '@/lib/store';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const dorm = searchParams.get('dorm');

  if (!dorm) {
    return Response.json({ error: 'dorm required' }, { status: 400 });
  }

  const stats = getFloorStats(dorm);
  return Response.json(stats);
}
