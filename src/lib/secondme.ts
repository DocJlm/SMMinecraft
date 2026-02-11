const BASE_URL = 'https://app.mindos.com/gate/lab';

export async function getUserInfo(accessToken: string) {
  const res = await fetch(`${BASE_URL}/api/secondme/user/info`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(data.message || 'Failed to get user info');
  return data.data;
}

export async function getUserShades(accessToken: string) {
  const res = await fetch(`${BASE_URL}/api/secondme/user/shades`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(data.message || 'Failed to get shades');
  return data.data?.shades || [];
}

export async function exchangeCodeForToken(code: string) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.SECONDME_REDIRECT_URI!,
    client_id: process.env.SECONDME_CLIENT_ID!,
    client_secret: process.env.SECONDME_CLIENT_SECRET!,
  });

  const res = await fetch(`${BASE_URL}/api/oauth/token/code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(data.message || 'Token exchange failed');
  return data.data;
}

export async function refreshAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.SECONDME_CLIENT_ID!,
    client_secret: process.env.SECONDME_CLIENT_SECRET!,
  });

  const res = await fetch(`${BASE_URL}/api/oauth/token/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(data.message || 'Token refresh failed');
  return data.data;
}

// Chat with a user's AI avatar via SSE - collect full response
// Includes 8s timeout (Vercel functions have 10s limit) and 1 retry
export async function chatWithAI(
  accessToken: string,
  message: string,
  systemPrompt?: string,
  sessionId?: string
): Promise<{ content: string; sessionId: string }> {
  const doRequest = async (): Promise<{ content: string; sessionId: string }> => {
    const body: Record<string, unknown> = { message };
    if (systemPrompt) body.systemPrompt = systemPrompt;
    if (sessionId) body.sessionId = sessionId;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(`${BASE_URL}/api/secondme/chat/stream`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Chat API error: ${res.status}`);
      }

      let content = '';
      let newSessionId = sessionId || '';

      const text = await res.text();
      const lines = text.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('event: session')) {
          const nextLine = lines[i + 1];
          if (nextLine?.startsWith('data: ')) {
            try {
              const sessionData = JSON.parse(nextLine.slice(6));
              newSessionId = sessionData.sessionId || newSessionId;
            } catch {}
          }
        } else if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) content += delta;
          } catch {}
        }
      }

      // Fallback if SSE returned empty content
      if (!content.trim()) {
        content = "Hmm, I'm gathering my thoughts... What were you saying?";
      }

      return { content, sessionId: newSessionId };
    } finally {
      clearTimeout(timeout);
    }
  };

  // Try once, retry once on failure
  try {
    return await doRequest();
  } catch (error) {
    console.warn('chatWithAI first attempt failed, retrying:', error);
    try {
      return await doRequest();
    } catch (retryError) {
      console.error('chatWithAI retry also failed:', retryError);
      // Return fallback instead of throwing to keep conversation alive
      return {
        content: "I got a bit distracted... Could you repeat that?",
        sessionId: sessionId || '',
      };
    }
  }
}

export async function generateTTS(accessToken: string, text: string, emotion?: string) {
  const res = await fetch(`${BASE_URL}/api/secondme/tts/generate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, emotion: emotion || 'fluent' }),
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(data.message || 'TTS failed');
  return data.data;
}
