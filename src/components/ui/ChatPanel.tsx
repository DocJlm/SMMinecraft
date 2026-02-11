'use client';
import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/game-store';

export default function ChatPanel() {
  const showChat = useGameStore((s) => s.showChat);
  const setShowChat = useGameStore((s) => s.setShowChat);
  const activeConversation = useGameStore((s) => s.activeConversation);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  if (!showChat || !activeConversation) return null;

  const conv = activeConversation;
  const modeEmoji = conv.mode === 'dating' ? '💕' : conv.mode === 'trade' ? '🏪' : '☕';
  const modeLabel = conv.mode === 'dating' ? 'Dating' : conv.mode === 'trade' ? 'Trade' : 'Chat';

  return (
    <div className="pointer-events-auto absolute right-4 top-20 bottom-20 w-96 flex flex-col rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 z-20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-xl">{modeEmoji}</span>
          <div className="flex items-center gap-2">
            <AvatarCircle src={conv.playerA.avatar} name={conv.playerA.name} size={28} />
            <span className="text-white/40 text-xs">x</span>
            <AvatarCircle src={conv.playerB.avatar} name={conv.playerB.name} size={28} />
          </div>
          <div>
            <p className="text-white font-bold text-sm">
              {conv.playerA.name} x {conv.playerB.name}
            </p>
            <p className="text-white/50 text-xs">
              {modeLabel} | Round {Math.ceil((conv.messages.length) / 2)}/{conv.maxRounds}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={conv.status} />
          <button
            onClick={() => setShowChat(false)}
            className="text-white/50 hover:text-white text-lg"
          >
            x
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-scroll">
        {conv.messages.map((msg, i) => {
          const isA = msg.speaker === 'A';
          const avatar = isA ? conv.playerA.avatar : conv.playerB.avatar;
          return (
            <div
              key={i}
              className={`flex gap-2 ${isA ? 'flex-row' : 'flex-row-reverse'}`}
            >
              <div className="flex-shrink-0 mt-1">
                <AvatarCircle src={avatar} name={msg.speakerName} size={32} />
              </div>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isA
                    ? 'bg-blue-500/30 text-blue-100 rounded-tl-sm'
                    : 'bg-purple-500/30 text-purple-100 rounded-tr-sm'
                }`}
              >
                <p className="text-xs font-bold mb-1 opacity-70">{msg.speakerName}</p>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          );
        })}
        {conv.status === 'active' && (
          <div className="flex justify-center">
            <div className="text-white/50 text-sm animate-pulse">
              AI is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Result */}
      {conv.status === 'completed' && conv.result && (
        <div className="px-4 py-3 border-t border-white/10 bg-white/5">
          {conv.result.compatibilityScore !== undefined && (
            <div className="text-center">
              <p className="text-white/70 text-xs">Compatibility Score</p>
              <p className="text-3xl font-bold mt-1" style={{
                color: conv.result.compatibilityScore > 70 ? '#4ade80' :
                       conv.result.compatibilityScore > 40 ? '#fbbf24' : '#f87171'
              }}>
                {conv.result.compatibilityScore}%
              </p>
            </div>
          )}
          {conv.result.tradeSummary && (
            <p className="text-green-300 text-sm text-center">{conv.result.tradeSummary}</p>
          )}
          {conv.result.summary && !conv.result.compatibilityScore && (
            <p className="text-white/60 text-sm text-center">{conv.result.summary}</p>
          )}
        </div>
      )}

      {conv.status === 'error' && (
        <div className="px-4 py-3 border-t border-red-500/20 bg-red-500/10">
          <p className="text-red-300 text-sm text-center">Conversation error. The AI may be unavailable.</p>
        </div>
      )}
    </div>
  );
}

function AvatarCircle({ src, name, size }: { src?: string; name: string; size: number }) {
  const initial = name.charAt(0).toUpperCase();
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const bg = colors[Math.abs(hash) % colors.length];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        onError={(e) => {
          // Fallback to initial on error
          (e.target as HTMLImageElement).style.display = 'none';
          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold"
      style={{ width: size, height: size, backgroundColor: bg, fontSize: size * 0.45 }}
    >
      {initial}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500',
    active: 'bg-green-500',
    completed: 'bg-blue-500',
    error: 'bg-red-500',
  };
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${colors[status] || 'bg-gray-500'} animate-pulse`} />
  );
}
