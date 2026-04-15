import {
  getMessages, addMessage, getMatchesForUser, getLastMessage,
  getUnreadCount, markRead, setTyping, isTyping, addReaction,
} from '@/lib/store';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const withId = searchParams.get('withId');

  if (userId && !withId) {
    const matches = getMatchesForUser(userId);
    const enriched = matches.map(m => ({
      ...m,
      lastMessage: getLastMessage(userId, m.id),
      unreadCount: getUnreadCount(userId, m.id),
    }));
    return Response.json({ matches: enriched });
  }

  if (!userId || !withId) {
    return Response.json({ error: 'userId and withId required' }, { status: 400 });
  }

  markRead(userId, withId);
  const messages = getMessages(userId, withId);
  const partnerTyping = isTyping(withId, userId);
  return Response.json({ messages, typing: partnerTyping });
}

export async function POST(req) {
  const body = await req.json();
  const { action } = body;

  if (action === 'typing') {
    const { fromId, toId, typing: isTypingNow } = body;
    if (fromId && toId) setTyping(fromId, toId, isTypingNow);
    return Response.json({ ok: true });
  }

  if (action === 'react') {
    const { messageId, userId, emoji } = body;
    if (!messageId || !userId || !emoji) {
      return Response.json({ error: 'messageId, userId, emoji required' }, { status: 400 });
    }
    const reactions = addReaction(messageId, userId, emoji);
    return Response.json({ reactions });
  }

  if (action === 'read') {
    const { userId, fromId } = body;
    if (userId && fromId) markRead(userId, fromId);
    return Response.json({ ok: true });
  }

  const { fromId, toId, text } = body;
  if (!fromId || !toId || !text?.trim()) {
    return Response.json({ error: 'fromId, toId, and text required' }, { status: 400 });
  }

  setTyping(fromId, toId, false);
  const msg = addMessage(fromId, toId, text.trim());
  return Response.json({ message: msg });
}
