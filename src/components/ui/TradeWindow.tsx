'use client';
import { useGameStore } from '@/stores/game-store';

export default function TradeWindow() {
  const showTradeWindow = useGameStore((s) => s.showTradeWindow);
  const setShowTradeWindow = useGameStore((s) => s.setShowTradeWindow);
  const activeConversation = useGameStore((s) => s.activeConversation);

  if (!showTradeWindow || !activeConversation) return null;

  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center z-30 bg-black/50">
      <div className="bg-gradient-to-br from-amber-900/90 to-orange-900/90 rounded-3xl p-8 backdrop-blur-xl border border-white/10 max-w-md w-full mx-4">
        <div className="text-center">
          <p className="text-4xl mb-2">🏪</p>
          <h2 className="text-white text-2xl font-bold mb-1">Trade Complete</h2>
          <p className="text-white/60 text-sm mb-6">
            {activeConversation.playerA.name} x {activeConversation.playerB.name}
          </p>
        </div>

        {activeConversation.result?.tradeSummary && (
          <p className="text-white/80 text-sm text-center mb-6">
            {activeConversation.result.tradeSummary}
          </p>
        )}

        <button
          onClick={() => setShowTradeWindow(false)}
          className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
