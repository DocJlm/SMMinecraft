import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { kvGet, KEYS } from '@/lib/kv';
import { StoredUser } from '@/types';
import { calculateShadeCompatibility } from '@/lib/matching';

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { targetUserId } = await request.json();

  const userA = await kvGet<StoredUser>(KEYS.user(userId));
  const userB = await kvGet<StoredUser>(KEYS.user(targetUserId));

  if (!userA || !userB) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const result = calculateShadeCompatibility(
    userA.shades || [],
    userB.shades || []
  );

  return NextResponse.json({
    compatibility: result.score,
    commonInterests: result.commonInterests,
    userA: { name: userA.user.name, avatar: userA.user.avatar },
    userB: { name: userB.user.name, avatar: userB.user.avatar },
  });
}
