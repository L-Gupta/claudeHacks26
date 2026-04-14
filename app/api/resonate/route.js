import { NextResponse } from 'next/server';
import { addResonation, isMockUser, getUser } from '@/lib/store';
import { suggestMeetup } from '@/lib/claude';

export async function POST(req) {
  try {
    const { fromId, toId } = await req.json();

    if (isMockUser(toId)) {
      addResonation(fromId, toId);
      addResonation(toId, fromId);

      const fromUser = getUser(fromId);
      const toUser = getUser(toId);
      const suggestion = await suggestMeetup(fromUser || {}, toUser || {});

      return NextResponse.json({
        match: true,
        matchedUser: toUser,
        suggestion,
        autoResonated: true,
      });
    }

    const result = addResonation(fromId, toId);

    if (result.match) {
      const fromUser = getUser(fromId);
      const suggestion = await suggestMeetup(fromUser || {}, result.matchedUser || {});
      return NextResponse.json({
        match: true,
        matchedUser: result.matchedUser,
        suggestion,
      });
    }

    return NextResponse.json({ match: false });
  } catch (err) {
    console.error('Resonate error:', err);
    return NextResponse.json({ error: 'Resonate failed' }, { status: 500 });
  }
}
