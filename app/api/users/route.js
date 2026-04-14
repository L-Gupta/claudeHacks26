import { NextResponse } from 'next/server';
import { addUser, getDormUsers, getFloorUsers } from '@/lib/store';
import { suggestConnections } from '@/lib/claude';
import { knnRank } from '@/lib/knn';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const dorm = searchParams.get('dorm');
  const floor = searchParams.get('floor');
  const userId = searchParams.get('userId');

  let users = dorm ? getDormUsers(dorm) : [];
  if (floor) users = users.filter(u => u.floor === parseInt(floor));

  let suggestions = [];
  if (userId) {
    const currentUser = users.find(u => u.id === userId);
    const others = users.filter(u => u.id !== userId);
    if (currentUser && others.length > 0) {
      const ranked = knnRank(currentUser.features, others);
      suggestions = await suggestConnections(currentUser, ranked);
    }
  }

  return NextResponse.json({ users, suggestions });
}

export async function POST(req) {
  try {
    const user = await req.json();
    addUser(user);
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error('Add user error:', err);
    return NextResponse.json({ error: 'Failed to add user' }, { status: 500 });
  }
}
