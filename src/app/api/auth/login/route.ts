import { NextResponse } from 'next/server';
import { getOAuthUrl } from '@/lib/auth';

export async function GET() {
  const state = Math.random().toString(36).slice(2);
  const url = getOAuthUrl(state);
  return NextResponse.json({ url });
}
