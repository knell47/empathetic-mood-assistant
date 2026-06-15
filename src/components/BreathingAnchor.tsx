import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wind, Play, Square, RefreshCw } from "lucide-react";

type BreathPhase = "Inhale" | "Hold" | "Exhale" | "Ready";

interface BreathingAnchorProps {
  isDark?: boolean;
}

export default function BreathingAnchor({ isDark = false }: BreathingAnchorProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("Ready");
  const [timeLeft, setTimeLeft] = useState(4);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isActive) {
      setPhase("Ready");
      return;
    }

    if (phase === "Ready") {
      setPhase("Inhale");
      setTimeLeft(4);
      return;
    }

    timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Transition phase
          if (phase === "Inhale") {
            setPhase("Hold");
            return 4; // Hold for 4s
          } else if (phase === "Hold") {
            setPhase("Exhale");
            return 4; // Exhale for 4s
          } else {
            setPhase("Inhale");
            return 4; // Inhale for 4s
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase]);

  const toggleBreathing = () => {
    setIsActive(!isActive);
  };

  const getPhaseColor = () => {
    switch (phase) {
      case "Inhale":
        return isDark
          ? "bg-teal-500/15 border-teal-400 text-teal-300"
          : "bg-teal-400/20 border-teal-500 text-teal-700";
      case "Hold":
        return isDark
          ? "bg-amber-500/15 border-amber-400 text-amber-300"
          : "bg-amber-400/20 border-amber-500 text-amber-700";
      case "Exhale":
        return isDark
          ? "bg-sky-500/15 border-sky-400 text-sky-300"
          : "bg-sky-400/20 border-sky-500 text-sky-700";
      default:
        return isDark
          ? "bg-slate-800/60 border-slate-700 text-slate-400"
          : "bg-slate-100 border-slate-300 text-slate-500";
    }
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case "Inhale":
        return "Breathe in slowly through your nose...";
      case "Hold":
        return "Gently hold your breath...";
      case "Exhale":
        return "Release slowly through your mouth...";
      default:
        return "Find a comfortable position and click start.";
    }
  };

  return (
    <div className={`rounded-2xl border p-6 flex flex-col items-center justify-between transition-all duration-300 backdrop-blur-md ${
      isDark 
        ? "bg-slate-950/40 border-slate-800/60 text-slate-200" 
        : "bg-white/40 border-slate-200/50 shadow-xs text-slate-800"
    }`}>
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isDark ? "bg-teal-950 text-teal-400" : "bg-teal-50 text-teal-600"}`}>
            <Wind size={18} />
          </div>
          <h3 className="font-display font-semibold text-sm">Mindful Breath Anchor</h3>
        </div>
        {isActive && (
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full animate-pulse ${
            isDark ? "bg-teal-950 text-teal-400" : "bg-teal-50 text-teal-700"
          }`}>
            Active
          </span>
        )}
      </div>

      {/* Visual Breathing Circle */}
      <div className="my-6 relative flex items-center justify-center w-40 h-40">
        <AnimatePresence mode="wait">
          {/* Outer ripples */}
          {isActive && (
            <motion.div
              key={`ripple-${phase}`}
              className={`absolute inset-0 rounded-full border ${
                isDark ? "border-teal-500/25" : "border-teal-200/50"
              }`}
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{
                scale: phase === "Inhale" ? 1.3 : phase === "Hold" ? 1.3 : 0.8,
                opacity: phase === "Exhale" ? 0 : 0.6,
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>

        {/* Core dynamic circle */}
        <motion.div
          animate={{
            scale: phase === "Inhale" ? 1.25 : phase === "Hold" ? 1.25 : 0.85,
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className={`w-28 h-28 rounded-full border-2 flex flex-col items-center justify-center transition-colors duration-500 shadow-sm ${getPhaseColor()}`}
        >
          <span className="font-display font-bold text-lg leading-none">
            {isActive ? timeLeft : "🧘"}
          </span>
          <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80 mt-1">
            {isActive ? phase : "Ready"}
          </span>
        </motion.div>
      </div>

      <p className={`text-xs text-center min-h-[32px] max-w-[200px] balance leading-relaxed mb-4 ${
        isDark ? "text-slate-400" : "text-slate-500"
      }`}>
        {getPhaseInstruction()}
      </p>

      {/* Controls */}
      <button
        id="btn-toggle-breathing"
        onClick={toggleBreathing}
        className={`w-full py-2 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
          isActive
            ? isDark 
              ? "bg-slate-800 hover:bg-slate-705 text-slate-300"
              : "bg-slate-100 hover:bg-slate-250 text-slate-600"
            : "bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
        }`}
      >
        {isActive ? (
          <>
            <Square size={13} fill="currentColor" /> Stop Exercise
          </>
        ) : (
          <>
            <Play size={13} fill="currentColor" /> Start 4-4-4 Box Breathing
          </>
        )}
      </button>
    </div>
  );
}
