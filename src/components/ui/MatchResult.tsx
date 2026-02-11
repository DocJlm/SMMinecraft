'use client';
import { useState } from 'react';
import { useGameStore } from '@/stores/game-store';

export default function MatchResult() {
  const showMatchResult = useGameStore((s) => s.showMatchResult);
  const setShowMatchResult = useGameStore((s) => s.setShowMatchResult);
  const activeConversation = useGameStore((s) => s.activeConversation);
  const [copied, setCopied] = useState(false);

  if (!showMatchResult || !activeConversation?.result) return null;

  const { compatibilityScore, summary } = activeConversation.result;
  const { playerA, playerB } = activeConversation;

  const scoreColor = (compatibilityScore || 0) > 70 ? '#4ade80' :
                     (compatibilityScore || 0) > 40 ? '#fbbf24' : '#f87171';

  const handleShare = async () => {
    const text = `My AI avatar just went on a date in SecondCraft! ${playerA.name} x ${playerB.name} = ${compatibilityScore}% compatibility. Try it yourself:`;
    const url = typeof window !== 'undefined' ? window.location.origin : '';
    const shareText = `${text} ${url}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
      const input = document.createElement('textarea');
      input.value = shareText;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center z-30 bg-black/50">
      <div className="bg-gradient-to-br from-pink-900/90 to-purple-900/90 rounded-3xl p-8 backdrop-blur-xl border border-white/10 max-w-md w-full mx-4">
        <div className="text-center">
          <p className="text-4xl mb-2">💕</p>
          <h2 className="text-white text-2xl font-bold mb-1">Match Result</h2>
          <p className="text-white/60 text-sm mb-6">
            {playerA.name} x {playerB.name}
          </p>
        </div>

        <div className="text-center mb-6">
          <p className="text-6xl font-bold" style={{ color: scoreColor }}>
            {compatibilityScore}%
          </p>
          <p className="text-white/60 text-sm mt-2">Compatibility Score</p>
        </div>

        {summary && (
          <p className="text-white/80 text-sm text-center mb-6">{summary}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-medium transition"
          >
            {copied ? 'Copied!' : 'Share Result'}
          </button>
          <button
            onClick={() => setShowMatchResult(false)}
            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
