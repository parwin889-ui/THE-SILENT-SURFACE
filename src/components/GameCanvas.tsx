import { useEffect, useRef, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/config';
import type { GameState } from '../game/types';

interface GameCanvasProps {
  onStateChange?: (state: GameState) => void;
  onScoreChange?: (score: number, highScore: number) => void;
  onLevelChange?: (level: number) => void;
}

export default function GameCanvas({ onStateChange, onScoreChange, onLevelChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Initialize engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas);
    engine.onStateChange = onStateChange;
    engine.onScoreChange = onScoreChange;
    engine.onLevelChange = onLevelChange;
    engineRef.current = engine;

    // Start with menu
    engine.running = true;
    engine.lastTime = performance.now();
    engine.loop(engine.lastTime);

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [onStateChange, onScoreChange, onLevelChange]);

  // Custom level select event
  useEffect(() => {
    const handleStartLevel = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const engine = engineRef.current;
      if (engine && typeof detail === 'number') {
        engine.startLevel(detail);
      }
    };
    window.addEventListener('startLevel', handleStartLevel);
    return () => window.removeEventListener('startLevel', handleStartLevel);
  }, []);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'Escape') {
        if (engine.state === 'GAME_OVER') engine.backToMenu();
        else if (engine.state === 'LEVEL_END') engine.backToMenu();
        else if (engine.state === 'PLAYING') engine.pause();
        else if (engine.state === 'PAUSED') engine.resume();
        return;
      }

      engine.setInput(e.key, true);

      // Enter to start from menu
      if (e.key === 'Enter' && engine.state === 'MENU') {
        engine.startLevel(1);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engineRef.current?.setInput(e.key, false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse/Touch input for gameplay
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const engine = engineRef.current;
    if (!engine || engine.state !== 'PLAYING') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = GAME_WIDTH / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    engine.setTouch(x, null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    engineRef.current?.setTouch(null, null);
  }, []);

  const handleClick = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.state === 'GAME_OVER') {
      engine.startLevel(engine.gameData.level);
    } else if (engine.state === 'LEVEL_END') {
      if (engine.gameData.level < 10) {
        engine.startLevel(engine.gameData.level + 1);
      } else {
        engine.backToMenu();
      }
    }
  }, []);

  const handleTouch = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const engine = engineRef.current;
    if (!engine || engine.state !== 'PLAYING') return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = GAME_WIDTH / rect.width;
    const touch = e.touches[0];
    if (touch) {
      const x = (touch.clientX - rect.left) * scaleX;
      engine.setTouch(x, null);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    engineRef.current?.setTouch(null, null);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
      onTouchEnd={handleTouchEnd}
      style={{
        display: 'block',
        width: '100%',
        maxWidth: `${GAME_WIDTH}px`,
        height: 'auto',
        aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}`,
        imageRendering: 'pixelated',
        cursor: 'crosshair',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    />
  );
}
