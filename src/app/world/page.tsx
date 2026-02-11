'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/stores/auth-store';
import { useGameStore } from '@/stores/game-store';
import { getPlayerColor, POLL_INTERVAL } from '@/lib/world-config';
import { PlayerState, ConversationMode, WorldState } from '@/types';
import HUD from '@/components/ui/HUD';
import ChatPanel from '@/components/ui/ChatPanel';
import MiniMap from '@/components/ui/MiniMap';
import MatchResult from '@/components/ui/MatchResult';
import TradeWindow from '@/components/ui/TradeWindow';
import PlayerCard from '@/components/ui/PlayerCard';

// Dynamic import for R3F (no SSR)
const VoxelWorld = dynamic(() => import('@/components/three/VoxelWorld'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center">
        <div className="inline-block w-16 h-16 bg-emerald-500 rounded-lg animate-spin mb-4" />
        <p className="text-white text-lg">Loading SecondCraft...</p>
      </div>
    </div>
  ),
});

const NEARBY_DISTANCE = 5;

export default function WorldPage() {
  const { user, setUser, isLoading } = useAuthStore();
  const {
    position,
    zone,
    remotePlayers,
    setRemotePlayers,
    setOnlineCount,
    nearbyPlayer,
    setNearbyPlayer,
    setHudMessage,
    activeConversation,
    setActiveConversation,
    showChat,
    setShowChat,
    setShowMatchResult,
    setShowTradeWindow,
  } = useGameStore();

  const [showPlayerCard, setShowPlayerCard] = useState(false);
  const pollRef = useRef<NodeJS.Timeout>(undefined);
  const a2aPollRef = useRef<NodeJS.Timeout>(undefined);
  const isPollingA2A = useRef(false);
  const npcTickRef = useRef<NodeJS.Timeout>(undefined);

  // Auth check
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          window.location.href = '/';
        }
      })
      .catch(() => {
        window.location.href = '/';
      });
  }, [setUser]);

  // Join world + trigger initial NPC tick
  useEffect(() => {
    if (!user) return;
    fetch('/api/world/join', { method: 'POST' }).catch(() => {});
    // Trigger initial NPC spawn
    fetch('/api/world/npc-tick', { method: 'POST' }).catch(() => {});

    // NPC tick every 10 seconds
    npcTickRef.current = setInterval(() => {
      fetch('/api/world/npc-tick', { method: 'POST' }).catch(() => {});
    }, 10000);

    // Leave on unload
    const handleUnload = () => {
      navigator.sendBeacon('/api/world/leave');
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      clearInterval(npcTickRef.current);
    };
  }, [user]);

  // Poll world state
  useEffect(() => {
    if (!user) return;

    const poll = async () => {
      try {
        const res = await fetch('/api/world/state');
        const data: WorldState = await res.json();
        setRemotePlayers(data.players);
        setOnlineCount(data.onlineCount);

        // Find nearest player
        const myPos = useGameStore.getState().position;
        let nearest: PlayerState | null = null;
        let nearestDist = NEARBY_DISTANCE;

        for (const p of Object.values(data.players)) {
          if (p.userId === user.userId || !p.isOnline) continue;
          const dx = p.position.x - myPos.x;
          const dz = p.position.z - myPos.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearest = p;
          }
        }
        setNearbyPlayer(nearest);
      } catch {}
    };

    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [user, setRemotePlayers, setOnlineCount, setNearbyPlayer]);

  // Position reporting
  const handlePositionChange = useCallback(
    async (x: number, y: number, z: number) => {
      try {
        await fetch('/api/world/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x, y, z }),
        });
      } catch {}
    },
    []
  );

  // E key for interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'E') {
        if (showChat) return;
        if (nearbyPlayer && !activeConversation) {
          setShowPlayerCard(true);
        }
      }
      if (e.key === 'Escape') {
        setShowPlayerCard(false);
        if (showChat && activeConversation?.status === 'completed') {
          setShowChat(false);
          setActiveConversation(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nearbyPlayer, activeConversation, showChat, setShowChat, setActiveConversation]);

  // Start A2A conversation
  const startConversation = useCallback(
    async (mode: ConversationMode) => {
      if (!nearbyPlayer) return;
      setShowPlayerCard(false);
      setShowChat(true);
      setHudMessage('Starting A2A conversation...');

      try {
        const res = await fetch('/api/a2a/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUserId: nearbyPlayer.userId,
            mode,
          }),
        });
        const data = await res.json();
        if (data.error) {
          setHudMessage(`Error: ${data.error}`);
          setTimeout(() => setHudMessage(''), 3000);
          return;
        }
        setActiveConversation(data.conversation);
        setHudMessage('');

        // Start polling for next rounds (5s interval, with concurrency guard)
        const pollA2A = async () => {
          if (isPollingA2A.current) return;
          isPollingA2A.current = true;

          const convState = useGameStore.getState().activeConversation;
          if (!convState || convState.status === 'completed' || convState.status === 'error') {
            clearInterval(a2aPollRef.current);
            isPollingA2A.current = false;
            if (convState?.status === 'completed') {
              if (convState.mode === 'dating') setShowMatchResult(true);
              if (convState.mode === 'trade') setShowTradeWindow(true);
            }
            return;
          }

          try {
            const nextRes = await fetch('/api/a2a/next', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ conversationId: convState.id }),
            });
            // Silently handle 504 and other errors
            if (nextRes.ok) {
              const nextData = await nextRes.json();
              if (nextData.conversation) {
                useGameStore.getState().setActiveConversation(nextData.conversation);
              }
            }
          } catch {
            // Silent retry on network errors - don't break the polling loop
          } finally {
            isPollingA2A.current = false;
          }
        };

        a2aPollRef.current = setInterval(pollA2A, 5000);
      } catch (err) {
        setHudMessage('Failed to start conversation');
        setTimeout(() => setHudMessage(''), 3000);
      }
    },
    [nearbyPlayer, setShowChat, setHudMessage, setActiveConversation, setShowMatchResult, setShowTradeWindow]
  );

  // Cleanup A2A polling
  useEffect(() => {
    return () => {
      if (a2aPollRef.current) clearInterval(a2aPollRef.current);
    };
  }, []);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white">Entering SecondCraft...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 3D World */}
      <VoxelWorld
        playerColor={getPlayerColor(user.userId)}
        playerName={user.name}
        onPositionChange={handlePositionChange}
      />

      {/* UI Overlays */}
      <HUD />
      <ChatPanel />
      <MiniMap />
      <MatchResult />
      <TradeWindow />

      {/* Player interaction card */}
      {showPlayerCard && nearbyPlayer && (
        <PlayerCard
          player={nearbyPlayer}
          currentZone={zone}
          onClose={() => setShowPlayerCard(false)}
          onChat={() => startConversation('chat')}
          onDate={() => startConversation('dating')}
          onTrade={() => startConversation('trade')}
        />
      )}
    </div>
  );
}
