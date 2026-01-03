"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const handleTimerComplete = (currentBreakStatus: boolean) => {
    setIsActive(false);
    const nextIsBreak = !currentBreakStatus;
    setIsBreak(nextIsBreak);
    setMinutes(nextIsBreak ? 5 : 25);
    setSeconds(0);

    // Clear or update storage for next state (paused at start of next cycle)
    localStorage.removeItem("pomodoro-state");
  };

  // Initialization check
  useEffect(() => {
    const obtenerEstado = async () => {
      const saved = localStorage.getItem("pomodoro-state");
      if (saved) {
        try {
          const state = JSON.parse(saved);
          setIsBreak(state.isBreak);
          setIsActive(state.isActive);
          setMinutes(state.minutes);
          setSeconds(state.seconds);
        } catch (e) {
          console.error("Error loading timer", e);
        }
      }

      if (saved) {
        try {
          const state = JSON.parse(saved);
          setIsBreak(state.isBreak);

          if (state.isActive && state.endTime) {
            const now = Date.now();
            const remaining = Math.ceil((state.endTime - now) / 1000);

            if (remaining > 0) {
              setMinutes(Math.floor(remaining / 60));
              setSeconds(remaining % 60);
              setIsActive(true);
            } else {
              // Finished while away
              handleTimerComplete(state.isBreak);
            }
          } else if (state.remainingSeconds) {
            // Paused state
            setMinutes(Math.floor(state.remainingSeconds / 60));
            setSeconds(state.remainingSeconds % 60);
            setIsActive(false);
          }
        } catch (e) {
          console.error("Error loading timer", e);
        }
      }
    };
    obtenerEstado();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        // Sync with localStorage target time for accuracy/background support
        const saved = localStorage.getItem("pomodoro-state");
        if (saved) {
          const state = JSON.parse(saved);
          if (state.endTime) {
            const now = Date.now();
            const diff = Math.ceil((state.endTime - now) / 1000);

            if (diff <= 0) {
              handleTimerComplete(isBreak);
            } else {
              setMinutes(Math.floor(diff / 60));
              setSeconds(diff % 60);
            }
            return;
          }
        }

        // Fallback or just regular tick if no storage (shouldn't happen with new logic)
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          handleTimerComplete(isBreak);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, isBreak]);

  const toggleTimer = () => {
    const newActive = !isActive;
    setIsActive(newActive);

    if (newActive) {
      // START
      const totalSeconds = minutes * 60 + seconds;
      const endTime = Date.now() + totalSeconds * 1000;
      localStorage.setItem(
        "pomodoro-state",
        JSON.stringify({
          isActive: true,
          isBreak,
          endTime,
        })
      );
    } else {
      // PAUSE
      const totalSeconds = minutes * 60 + seconds;
      localStorage.setItem(
        "pomodoro-state",
        JSON.stringify({
          isActive: false,
          isBreak,
          remainingSeconds: totalSeconds,
        })
      );
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
    localStorage.removeItem("pomodoro-state");
  };

  const progress = isBreak
    ? (((5 - minutes) * 60 - seconds) / (5 * 60)) * 100
    : (((25 - minutes) * 60 - seconds) / (25 * 60)) * 100;

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="p-4 pb-2 items-center">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-sidebar-foreground/50 flex items-center gap-2">
          {isBreak ? (
            <Coffee className="w-3 h-3 text-green-500" />
          ) : (
            <Brain className="w-3 h-3 text-primary" />
          )}
          {isBreak ? "Descanso" : "Pomodoro"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="text-7xl md:text-8xl font-mono font-black text-center text-foreground tracking-tighter drop-shadow-sm">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
        <Progress value={progress} className="h-2 bg-muted overflow-hidden" />
        <div className="flex justify-center gap-6 pt-4">
          <Button
            size="lg"
            variant={isActive ? "outline" : "default"}
            onClick={toggleTimer}
            className={`h-16 w-16 rounded-full shadow-xl transition-all duration-300 ${
              isActive ? "hover:bg-destructive/10" : "hover:scale-105"
            }`}
          >
            {isActive ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={resetTimer}
            className="h-16 w-16 rounded-full hover:bg-muted/50 transition-all"
          >
            <RotateCcw className="h-8 w-8 text-muted-foreground" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
