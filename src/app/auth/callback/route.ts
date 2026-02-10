import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getUserInfo, getUserShades } from '@/lib/secondme';
import { setSessionCookie } from '@/lib/auth';
import { kvSet, KEYS } from '@/lib/kv';
import { StoredUser } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error) {
    return NextResponse.redirect(`${appUrl}/?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/?error=no_code`);
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    const userInfo = await getUserInfo(tokenData.accessToken);

    let shades: unknown[] = [];
    try {
      shades = await getUserShades(tokenData.accessToken);
    } catch {}

    const storedUser: StoredUser = {
      user: userInfo,
      tokens: {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt: Date.now() + tokenData.expiresIn * 1000,
        scope: tokenData.scope || [],
      },
      shades: shades as StoredUser['shades'],
      joinedAt: Date.now(),
    };

    await kvSet(KEYS.user(userInfo.userId), storedUser, { ex: 86400 * 7 });
    await setSessionCookie(userInfo.userId);

    return NextResponse.redirect(`${appUrl}/world`);
  } catch (err: unknown) {
    console.error('OAuth callback error:', err);
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.redirect(`${appUrl}/?error=auth_failed&message=${encodeURIComponent(message)}`);
  }
}
