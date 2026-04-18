import { useEffect, useRef, useState } from "react";
import { GameEngine } from "@/lib/game/engine";
import { LevelData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, RotateCcw, Home, Loader2, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

interface GameCanvasProps {
  levelData: LevelData;
  levelId: number;
  onVictory: (time: number) => void;
}

export function GameCanvas({ levelData, levelId, onVictory }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'dead' | 'won'>('playing');
  const [time, setTime] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    
    const engine = new GameEngine(
      canvas,
      levelData,
      () => setGameState('dead'),
      (finalTime) => {
        setGameState('won');
        onVictory(finalTime);
      }
    );

    engineRef.current = engine;

    // Game Loop
    let animationId: number;
    const loop = () => {
      engine.update();
      engine.render();
      if (engine.state.gameStatus === 'playing') {
        setTime(Math.floor(engine.state.currentTime / 1000));
        animationId = requestAnimationFrame(loop);
      }
    };
    
    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      engine.cleanup();
    };
  }, [levelData, levelId]); // Reset when level changes

  const handleRestart = () => {
    setGameState('playing');
    setTime(0);
    // Force re-mount of effect by recreating engine manually or rely on parent key change
    // Here we'll just reload the page/component or assume parent handles restart by unmounting
    window.location.reload(); 
  };

  const handleTouchStart = (dir: 'left' | 'right' | 'up') => {
    engineRef.current?.setMobileInput(dir, true);
  };

  const handleTouchEnd = (dir: 'left' | 'right' | 'up') => {
    engineRef.current?.setMobileInput(dir, false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
      {/* HUD */}
      <div className="flex justify-between w-full mb-4 px-4 py-2 bg-card/80 backdrop-blur border border-white/10 rounded-lg">
        <div className="font-mono text-xl text-primary font-bold">
          TIME: <span className="text-white">{time}s</span>
        </div>
        <div className="font-display text-xl text-destructive animate-pulse">
          SHADOW DELAY: 2.0s
        </div>
      </div>

      <div className="relative game-container scanlines bg-black w-full overflow-hidden touch-none">
        <canvas 
          ref={canvasRef}
          width={800}
          height={600}
          className="block w-full h-auto aspect-[4/3]"
        />

        {/* Overlays */}
        <AnimatePresence>
          {gameState === 'dead' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50"
            >
              <Card className="p-8 border-destructive/50 bg-black text-center max-w-md w-full mx-4">
                <h2 className="text-4xl font-display text-destructive mb-2">CAUGHT!</h2>
                <p className="text-muted-foreground mb-6">The shadow consumed you.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={handleRestart} variant="default" className="bg-white text-black hover:bg-gray-200 w-full sm:w-auto">
                    <RotateCcw className="mr-2 h-4 w-4" /> Try Again
                  </Button>
                  <Link href="/">
                    <Button variant="outline" className="border-white/20 hover:bg-white/10 w-full sm:w-auto">
                      <Home className="mr-2 h-4 w-4" /> Menu
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          )}

          {gameState === 'won' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50"
            >
              <Card className="p-8 border-primary/50 bg-black text-center max-w-md w-full mx-4">
                <h2 className="text-4xl font-display text-primary mb-2">ESCAPED!</h2>
                <p className="text-muted-foreground mb-6">You outran your darker self.</p>
                <div className="text-2xl font-mono mb-8">Time: {time}s</div>
                
                <div className="flex gap-4 justify-center">
                  <Link href="/" className="w-full">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full">
                      Next Level <Play className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Controls - Moved Below Canvas */}
      {isMobile && gameState === 'playing' && (
        <div className="w-full py-8 px-4 flex justify-between items-center bg-card/20 backdrop-blur-sm border-t border-white/5 select-none">
          {/* Movement Controls */}
          <div className="flex gap-6">
            <Button
              size="icon"
              variant="outline"
              className="w-20 h-20 rounded-2xl bg-white/10 border-white/20 active:bg-white/30 transition-colors"
              onTouchStart={() => handleTouchStart('left')}
              onTouchEnd={() => handleTouchEnd('left')}
              onMouseDown={() => handleTouchStart('left')}
              onMouseUp={() => handleTouchEnd('left')}
            >
              <ArrowLeft className="w-10 h-10" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="w-20 h-20 rounded-2xl bg-white/10 border-white/20 active:bg-white/30 transition-colors"
              onTouchStart={() => handleTouchStart('right')}
              onTouchEnd={() => handleTouchEnd('right')}
              onMouseDown={() => handleTouchStart('right')}
              onMouseUp={() => handleTouchEnd('right')}
            >
              <ArrowRight className="w-10 h-10" />
            </Button>
          </div>
          
          {/* Jump Control */}
          <div>
            <Button
              size="icon"
              variant="outline"
              className="w-24 h-24 rounded-2xl bg-primary/20 border-primary/40 active:bg-primary/40 transition-colors"
              onTouchStart={() => handleTouchStart('up')}
              onTouchEnd={() => handleTouchEnd('up')}
              onMouseDown={() => handleTouchStart('up')}
              onMouseUp={() => handleTouchEnd('up')}
            >
              <ArrowUp className="w-12 h-12" />
            </Button>
          </div>
        </div>
      )}
      
      {!isMobile && (
        <div className="mt-4 text-muted-foreground text-sm font-mono text-center">
          ARROWS / WASD to Move • SPACE to Jump • Avoid the Red Shadow
        </div>
      )}
    </div>
  );
}
