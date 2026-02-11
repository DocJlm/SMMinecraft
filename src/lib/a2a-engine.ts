import { Conversation, ConversationMode, ConversationMessage } from '@/types';
import { kvGet, kvSet, KEYS } from './kv';
import { chatWithAI, refreshAccessToken } from './secondme';
import { StoredUser } from '@/types';

function getSystemPrompt(mode: ConversationMode, otherName: string): string {
  switch (mode) {
    case 'chat':
      return `You are in SecondCraft's Cafe chatting with ${otherName}. Have a friendly, natural conversation. Share your interests and learn about theirs. Keep replies under 100 words. Respond in the same language the other person uses.`;
    case 'dating':
      return `You are on a date with ${otherName} in SecondCraft's Dating Plaza. Learn about their interests, values, and personality. Be genuine and charming. This conversation will be scored for compatibility. Keep replies under 100 words. Respond in the same language the other person uses.`;
    case 'trade':
      return `You are negotiating a trade with ${otherName} in SecondCraft's Market. You want to get the best deal possible. Be persuasive but fair. Discuss item values and propose trades. Keep replies under 100 words. Respond in the same language the other person uses.`;
  }
}

async function getValidAccessToken(userId: string): Promise<string> {
  const userData = await kvGet<StoredUser>(KEYS.user(userId));
  if (!userData) throw new Error(`User ${userId} not found`);

  // Check if token expires within 60 seconds
  if (userData.tokens.expiresAt - Date.now() < 60_000) {
    try {
      const refreshed = await refreshAccessToken(userData.tokens.refreshToken);
      userData.tokens.accessToken = refreshed.accessToken;
      userData.tokens.refreshToken = refreshed.refreshToken || userData.tokens.refreshToken;
      userData.tokens.expiresAt = Date.now() + (refreshed.expiresIn || 3600) * 1000;
      await kvSet(KEYS.user(userId), userData, { ex: 86400 * 7 });
    } catch (err) {
      console.warn('Token refresh failed, using existing token:', err);
    }
  }

  return userData.tokens.accessToken;
}

export async function createConversation(
  playerAId: string,
  playerBId: string,
  mode: ConversationMode
): Promise<Conversation> {
  const userA = await kvGet<StoredUser>(KEYS.user(playerAId));
  const userB = await kvGet<StoredUser>(KEYS.user(playerBId));

  if (!userA || !userB) throw new Error('Both players must be logged in');

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const conversation: Conversation = {
    id,
    mode,
    status: 'pending',
    playerA: { userId: playerAId, name: userA.user.name, avatar: userA.user.avatar },
    playerB: { userId: playerBId, name: userB.user.name, avatar: userB.user.avatar },
    messages: [],
    currentRound: 0,
    maxRounds: mode === 'dating' ? 5 : mode === 'trade' ? 4 : 3,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await kvSet(KEYS.conversation(id), conversation, { ex: 3600 });
  return conversation;
}

export async function executeNextRound(conversationId: string): Promise<Conversation> {
  const conv = await kvGet<Conversation>(KEYS.conversation(conversationId));
  if (!conv) throw new Error('Conversation not found');
  if (conv.status === 'completed' || conv.status === 'error') return conv;

  const isPlayerATurn = conv.currentRound % 2 === 0;
  const currentSpeaker = isPlayerATurn ? conv.playerA : conv.playerB;
  const otherSpeaker = isPlayerATurn ? conv.playerB : conv.playerA;

  const accessToken = await getValidAccessToken(currentSpeaker.userId);
  const systemPrompt = getSystemPrompt(conv.mode, otherSpeaker.name);

  let messageToSend: string;

  if (conv.messages.length === 0) {
    // Mode-specific opening message
    switch (conv.mode) {
      case 'dating':
        messageToSend = `Hi! I'm ${otherSpeaker.name}. I noticed you across the plaza and wanted to say hello. What brings you here today?`;
        break;
      case 'trade':
        messageToSend = `Hey there! I'm ${otherSpeaker.name}. I heard you might have some interesting items to trade. What do you have in mind?`;
        break;
      default:
        messageToSend = `Hey! I'm ${otherSpeaker.name}. Just hanging out at the cafe. What's on your mind?`;
    }
  } else {
    const lastMessage = conv.messages[conv.messages.length - 1];
    messageToSend = lastMessage.content;
  }

  // Use per-player sessionId for context continuity
  const currentSessionId = isPlayerATurn ? conv.sessionIdA : conv.sessionIdB;

  try {
    conv.status = 'active';
    const result = await chatWithAI(
      accessToken,
      messageToSend,
      systemPrompt,
      currentSessionId
    );

    // Store returned sessionId for this player
    if (result.sessionId) {
      if (isPlayerATurn) {
        conv.sessionIdA = result.sessionId;
      } else {
        conv.sessionIdB = result.sessionId;
      }
    }

    const newMessage: ConversationMessage = {
      round: conv.currentRound,
      speaker: isPlayerATurn ? 'A' : 'B',
      speakerName: currentSpeaker.name,
      content: result.content,
      timestamp: Date.now(),
    };

    conv.messages.push(newMessage);
    conv.currentRound++;
    conv.updatedAt = Date.now();

    if (conv.currentRound >= conv.maxRounds * 2) {
      conv.status = 'completed';

      if (conv.mode === 'dating') {
        conv.result = {
          compatibilityScore: calculateCompatibility(conv.messages),
          summary: generateSummary(conv.messages),
        };
      } else if (conv.mode === 'trade') {
        conv.result = {
          tradeCompleted: true,
          tradeSummary: 'Trade negotiation completed!',
        };
      } else {
        conv.result = {
          summary: 'Chat completed!',
        };
      }

      // Increment global conversation counter
      await incrementConversationCount();
    }

    await kvSet(KEYS.conversation(conversationId), conv, { ex: 3600 });
    return conv;
  } catch (error) {
    conv.status = 'error';
    await kvSet(KEYS.conversation(conversationId), conv);
    throw error;
  }
}

async function incrementConversationCount() {
  try {
    const count = (await kvGet<number>('stats:conversations')) || 0;
    await kvSet('stats:conversations', count + 1);
  } catch {}
}

export async function getConversationCount(): Promise<number> {
  try {
    return (await kvGet<number>('stats:conversations')) || 0;
  } catch {
    return 0;
  }
}

function calculateCompatibility(messages: ConversationMessage[]): number {
  const totalWords = messages.reduce((sum, m) => sum + m.content.split(/\s+/).length, 0);
  const avgWords = totalWords / Math.max(messages.length, 1);
  const base = Math.min(85, 50 + avgWords * 0.5);
  const jitter = Math.random() * 20 - 10;
  return Math.max(30, Math.min(99, Math.round(base + jitter)));
}

function generateSummary(messages: ConversationMessage[]): string {
  if (messages.length < 2) return 'Too short to evaluate.';
  return `Completed ${messages.length} rounds of conversation. Both parties showed genuine interest in getting to know each other.`;
}
