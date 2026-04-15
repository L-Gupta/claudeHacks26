import { NextResponse } from 'next/server';
import { addUser, getDormUsers, getFloorUsers, getUser } from '@/lib/store';
import { suggestConnections } from '@/lib/claude';
import { knnRank } from '@/lib/knn';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const dorm = searchParams.get('dorm');
  const floor = searchParams.get('floor');
  const userId = searchParams.get('userId');

  if (!dorm) {
    return NextResponse.json({ error: 'dorm parameter required' }, { status: 400 });
  }

  let users = floor
    ? getFloorUsers(dorm, parseInt(floor))
    : getDormUsers(dorm);

  let suggestions = [];

  if (userId) {
    const currentUser = getUser(userId);
    if (currentUser) {
      const others = users.filter(u => u.id !== userId);
      if (others.length > 0) {
        const ranked = knnRank(currentUser.features || {}, others);
        try {
          suggestions = await suggestConnections(currentUser, ranked);
        } catch (err) {
          console.error('Suggestion generation error:', err);
        }
      }
    }
  }

  return NextResponse.json({ users, suggestions });
}

export async function POST(req) {
  try {
    const user = await req.json();
    if (!user.id || !user.dorm || !user.room) {
      return NextResponse.json({ error: 'Missing required fields: id, dorm, room' }, { status: 400 });
    }
    addUser(user);
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error('Add user error:', err);
    return NextResponse.json({ error: 'Failed to add user' }, { status: 500 });
  }
}
