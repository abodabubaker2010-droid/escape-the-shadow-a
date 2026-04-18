import { useLevels } from "@/hooks/use-levels";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Play, Trophy, Info, Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  const { data: levels, isLoading } = useLevels();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,_#4c1d95_0%,_#000000_100%)]" />
      
      <div className="relative z-10 w-full max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block p-4 rounded-full bg-destructive/10 mb-4 border border-destructive/20 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <Ghost className="w-16 h-16 text-destructive animate-pulse" />
          </div>
          <h1 className="text-6xl md:text-8xl font-display text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-lg">
            Escape the <span className="text-destructive">Shadow</span>
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto font-body">
            You are being followed. Every step you take, it repeats 2 seconds later.
            Don't let it touch you.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-xl bg-card/50 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {levels?.map((level) => (
              <motion.div key={level.id} variants={item}>
                <Link href={`/game/${level.id}`}>
                  <div className="group cursor-pointer">
                    <Card className="h-full bg-card/50 border-white/10 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-2xl font-display">
                          {level.name}
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-4 h-4 text-primary fill-primary" />
                          </div>
                        </CardTitle>
                        <CardDescription>
                          Level {level.order}
                        </CardDescription>
                      </CardHeader>
                      <div className="px-6 pb-6">
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-secondary w-0 group-hover:w-full transition-all duration-700 ease-out" />
                        </div>
                      </div>
                    </Card>
                  </div>
                </Link>
              </motion.div>
            ))}

            <motion.div variants={item}>
              <Card className="h-full bg-card/20 border-white/5 flex flex-col justify-center items-center p-6 text-center text-muted-foreground">
                <Info className="w-12 h-12 mb-4 opacity-50" />
                <h3 className="font-bold text-lg mb-2">How to Play</h3>
                <ul className="text-sm space-y-2">
                  <li>Use Arrow Keys or WASD to move</li>
                  <li>Stand on RED buttons to open GREEN doors</li>
                  <li>Yellow zones slow the shadow down</li>
                  <li>Reach the EXIT to survive</li>
                </ul>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
