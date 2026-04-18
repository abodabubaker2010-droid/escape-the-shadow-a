import { useParams } from "wouter";
import { useLevel } from "@/hooks/use-levels";
import { useCreateScore } from "@/hooks/use-scores";
import { GameCanvas } from "@/components/GameCanvas";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LevelData } from "@shared/schema";

export default function Game() {
  const { id } = useParams();
  const levelId = Number(id);
  const { data: level, isLoading, error } = useLevel(levelId);
  const createScore = useCreateScore();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-primary">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-mono text-lg animate-pulse">LOADING WORLD...</p>
      </div>
    );
  }

  if (error || !level) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-destructive">
        <h2 className="text-4xl font-display mb-4">Level Not Found</h2>
        <Link href="/">
          <Button variant="outline">Back to Safety</Button>
        </Link>
      </div>
    );
  }

  const levelData = level.data as unknown as LevelData;

  const handleVictory = (timeSeconds: number) => {
    // In a real app we'd ask for name or use auth
    // Here we just save "Anonymous" for simplicity
    createScore.mutate({
      levelId: levelId,
      playerName: "Shadow Runner",
      timeSeconds: Math.floor(timeSeconds),
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" className="text-muted-foreground hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Exit Level
          </Button>
        </Link>
        <h2 className="text-2xl font-display text-white">{level.name}</h2>
        <div className="w-24" /> {/* Spacer for centering */}
      </div>

      <GameCanvas 
        levelId={levelId}
        levelData={levelData}
        onVictory={handleVictory}
      />
    </div>
  );
}
