import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GameCanvas from '../components/GameCanvas';
import type { GameState } from '../game/types';
import { LEVELS } from '../game/config';

gsap.registerPlugin(ScrollTrigger);

export default function Game() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showLevelSelect, setShowLevelSelect] = useState(false);

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            end: 'top 30%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleStateChange = useCallback((state: GameState) => {
    setGameState(state);
  }, []);

  const handleScoreChange = useCallback((s: number, hs: number) => {
    setScore(s);
    setHighScore(hs);
  }, []);

  const handleLevelChange = useCallback((lvl: number) => {
    setCurrentLevel(lvl);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="game"
      style={{
        background: '#000000',
        padding: '100px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            fontWeight: 400,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.42)',
            margin: '0 0 16px 0',
          }}
        >
          INTERACTIVE SIMULATION
        </p>
        <h2
          style={{
            fontFamily: "'Geist Pixel', monospace",
            fontSize: 'clamp(32px, 4vw, 56px)',
            fontWeight: 400,
            lineHeight: 0.96,
            color: '#fff',
            textTransform: 'uppercase',
            margin: '0 0 12px 0',
            letterSpacing: '0.015em',
          }}
        >
          LUNAR DEFENDER
        </h2>
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '13px',
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.56)',
            margin: 0,
            maxWidth: '500px',
          }}
        >
          A 10-level ASCII space shooter. Pilot your craft through asteroid fields and enemy squadrons. Defeat the Lunar Core.
        </p>
      </div>

      {/* Game Container */}
      <div
        ref={contentRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          width: '100%',
          maxWidth: '500px',
        }}
      >
        {/* Score HUD */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            color: 'rgba(255,255,255,0.5)',
            padding: '0 8px',
          }}
        >
          <span>
            {gameState === 'PLAYING' && `SCORE: ${String(score).padStart(6, '0')}`}
            {gameState === 'MENU' && 'READY'}
            {(gameState === 'PAUSED' || gameState === 'GAME_OVER' || gameState === 'LEVEL_END') && `LAST: ${String(score).padStart(6, '0')}`}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>
            {gameState === 'PLAYING' ? `LEVEL ${currentLevel}` : 'STANDBY'}
          </span>
          <span>
            HI: {String(highScore).padStart(6, '0')}
          </span>
        </div>

        {/* Canvas */}
        <GameCanvas
          onStateChange={handleStateChange}
          onScoreChange={handleScoreChange}
          onLevelChange={handleLevelChange}
        />

        {/* Controls Info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: 'rgba(255,255,255,0.35)',
            flexWrap: 'wrap',
          }}
        >
          <span>WASD / ARROWS: MOVE</span>
          <span>AUTO-FIRE</span>
          <span>P: PAUSE</span>
          <span>MOUSE / TOUCH: AIM</span>
        </div>

        {/* Level Select */}
        <div style={{ width: '100%', marginTop: '8px' }}>
          <button
            onClick={() => setShowLevelSelect(!showLevelSelect)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '8px 16px',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.4)';
              (e.target as HTMLElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)';
              (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.5)';
            }}
          >
            {showLevelSelect ? 'HIDE LEVEL SELECT' : 'SELECT LEVEL'}
          </button>

          {showLevelSelect && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px',
                marginTop: '12px',
                padding: '12px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              {LEVELS.map((level) => {
                const save = JSON.parse(localStorage.getItem('lunar_defender_save') || '{}');
                const maxLevel = save.maxLevel || 1;
                const stars = save.stars?.[String(level.id)] || 0;
                const unlocked = level.id <= maxLevel;

                return (
                  <button
                    key={level.id}
                    onClick={() => {
                      if (unlocked) {
                        window.dispatchEvent(new CustomEvent('startLevel', { detail: level.id }));
                        setShowLevelSelect(false);
                      }
                    }}
                    style={{
                      background: unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.01)',
                      border: `1px solid ${unlocked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}`,
                      color: unlocked ? '#fff' : '#333',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '14px',
                      padding: '12px 4px',
                      cursor: unlocked ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    onMouseEnter={(e) => {
                      if (unlocked) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.01)';
                      (e.currentTarget as HTMLElement).style.borderColor = unlocked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)';
                    }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{level.id}</span>
                    <span style={{ fontSize: '8px', letterSpacing: '0.05em' }}>
                      {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
