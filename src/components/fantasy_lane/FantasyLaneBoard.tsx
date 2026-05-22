import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { FantasyLaneRuntimeState } from '../../features/fantasy_lane/fantasyLaneTypes.ts';
import { getPhaseNarrativeTone } from './fantasyLaneUiMeta.ts';
import { drawFantasyLaneBattlefieldCanvas } from './render/fantasyLaneBattlefieldRenderer.ts';

interface FantasyLaneBoardProps {
  state: FantasyLaneRuntimeState;
  onToggleDamageNumbers?: () => void;
}

interface BattlefieldViewport {
  width: number;
  height: number;
  pixelRatio: number;
}

const TARGET_FPS = 12;

function resolvePixelRatio() {
  if (typeof window === 'undefined') return 1;
  return Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
}

export const FantasyLaneBoard: React.FC<FantasyLaneBoardProps> = ({ state, onToggleDamageNumbers }) => {
  const battlefieldRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const latestStateRef = useRef(state);
  const [viewport, setViewport] = useState<BattlefieldViewport>({
    width: 0,
    height: 0,
    pixelRatio: resolvePixelRatio(),
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [debugVisible, setDebugVisible] = useState(false);
  const [showDamageNumbers, setShowDamageNumbers] = useState(true);

  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPrefersReducedMotion(media.matches);
    sync();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', sync);
      return () => media.removeEventListener('change', sync);
    }

    media.addListener(sync);
    return () => media.removeListener(sync);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tagName = target.tagName.toLowerCase();
      return tagName === 'input' || tagName === 'textarea' || target.isContentEditable;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (event.key === '`' || event.key === 'F2') {
        event.preventDefault();
        setDebugVisible((current) => !current);
      }
      if (event.key === 'd' || event.key === 'D') {
        event.preventDefault();
        setShowDamageNumbers((current) => !current);
        onToggleDamageNumbers?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const battlefield = battlefieldRef.current;
    if (!battlefield) return;

    const syncSize = () => {
      const rect = battlefield.getBoundingClientRect();
      const nextViewport: BattlefieldViewport = {
        width: Math.max(1, Math.round(rect.width)),
        height: Math.max(1, Math.round(rect.height)),
        pixelRatio: resolvePixelRatio(),
      };
      setViewport((current) => {
        if (
          current.width === nextViewport.width &&
          current.height === nextViewport.height &&
          current.pixelRatio === nextViewport.pixelRatio
        ) {
          return current;
        }
        return nextViewport;
      });
    };

    syncSize();

    const resizeObserver = new ResizeObserver(syncSize);
    resizeObserver.observe(battlefield);
    window.addEventListener('resize', syncSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncSize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pixelWidth = Math.max(1, Math.round(viewport.width * viewport.pixelRatio));
    const pixelHeight = Math.max(1, Math.round(viewport.height * viewport.pixelRatio));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
  }, [viewport.height, viewport.pixelRatio, viewport.width]);

  const paint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    drawFantasyLaneBattlefieldCanvas(context, latestStateRef.current, viewport, { debug: debugVisible, showDamageNumbers });
  };

  useEffect(() => {
    paint();
  }, [debugVisible, showDamageNumbers, state, viewport.height, viewport.pixelRatio, viewport.width]);

  useEffect(() => {
    if (state.phase !== 'playing' || prefersReducedMotion) return;

    let rafId = 0;
    let lastPaint = 0;
    const frameDuration = 1000 / TARGET_FPS;

    const loop = (timestamp: number) => {
      if (timestamp - lastPaint >= frameDuration) {
        lastPaint = timestamp;
        paint();
      }
      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(rafId);
  }, [debugVisible, prefersReducedMotion, state.phase, viewport.height, viewport.pixelRatio, viewport.width]);

  const phaseTone = useMemo(() => getPhaseNarrativeTone(state.pressureLabel), [state.pressureLabel]);
  return (
    <div className="fantasy-lane-board-shell">
      <div
        ref={battlefieldRef}
        className={`fantasy-lane-battlefield fantasy-lane-battlefield--${phaseTone}${state.activeWarning ? ' is-alert' : ''}`}
        role="img"
        aria-label="奇幻战线主战场"
      >
        <div className="fantasy-lane-battlefield-zone fantasy-lane-battlefield-zone--player" />
        <div className="fantasy-lane-battlefield-zone fantasy-lane-battlefield-zone--enemy" />

        <div className="fantasy-lane-battlefield-render-layer" aria-hidden="true">
          <canvas ref={canvasRef} className="fantasy-lane-battlefield-canvas" />
        </div>

        <button
          type="button"
          className={`fantasy-lane-battlefield-debug-toggle${debugVisible ? ' is-active' : ''}`}
          onClick={() => setDebugVisible((current) => !current)}
          title="` / F2"
          aria-label="Toggle battlefield debug view"
        >
          DBG
        </button>

        <div className="fantasy-lane-battlefield-stage-banner">
          <strong>{state.phaseLabel}</strong>
        </div>

        <div className="fantasy-lane-battlefield-base fantasy-lane-battlefield-base--player">
          <strong>我方主堡</strong>
          <small>{Math.round(state.playerBaseHp)}</small>
        </div>

        <div className="fantasy-lane-battlefield-base fantasy-lane-battlefield-base--enemy">
          <strong>敌方主堡</strong>
          <small>{Math.round(state.enemyBaseHp)}</small>
        </div>
      </div>
    </div>
  );
};
