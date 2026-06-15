import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  Sparkles,
  Calendar,
  Send,
  Loader2,
  Check,
  CheckCircle,
  HelpCircle,
  Trash2,
  ChevronRight,
  TrendingUp,
  Flame,
  Heart,
  Smile,
  Info,
  Sun,
  Moon
} from "lucide-react";
import { MoodLog, MoodResult, MoodType } from "./types";
import BreathingAnchor from "./components/BreathingAnchor";
import TrendsPanel from "./components/TrendsPanel";
import QuickPrompts from "./components/QuickPrompts";
import InteractiveBackground from "./components/InteractiveBackground";

export default function App() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<MoodResult | null>(null);
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("empathetic_mood_theme");
    if (saved) return saved === "dark";
    // Check system preference
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Load logs on mount
  useEffect(() => {
    const saved = localStorage.getItem("empathetic_mood_logs");
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse mood logs", e);
      }
    }
  }, []);

  // Save logs on update
  const saveLogs = (updatedLogs: MoodLog[]) => {
    setLogs(updatedLogs);
    localStorage.setItem("empathetic_mood_logs", JSON.stringify(updatedLogs));
  };

  const toggleTheme = () => {
    const nextVal = !isDark;
    setIsDark(nextVal);
    localStorage.setItem("empathetic_mood_theme", nextVal ? "dark" : "light");
  };

  // Submits a feeling prompt to the server backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setCurrentResult(null);

    try {
      const response = await fetch("/api/mood/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText.trim() }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to analyze mood.");
      }

      const data: MoodResult = await response.json();
      setCurrentResult(data);

      // Save to logs
      const newLog: MoodLog = {
        ...data,
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        userInput: inputText.trim(),
        completedSelfCare: false,
      };

      saveLogs([newLog, ...logs]);
      setInputText(""); // Reset text field on success
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPrompt = (promptText: string) => {
    setInputText(promptText);
    setErrorMsg(null);
  };

  const toggleSelfCareCompletion = (logId: string) => {
    const updated = logs.map((l) => {
      if (l.id === logId) {
        return { ...l, completedSelfCare: !l.completedSelfCare };
      }
      return l;
    });
    saveLogs(updated);

    // If currentResult belongs to this item, sync state locally
    if (logs.length > 0 && logs[0].id === logId) {
      // Just visually flag it if the current active result fits
    }
  };

  const handleDeleteLog = (logId: string) => {
    const updated = logs.filter((l) => l.id !== logId);
    saveLogs(updated);
    if (currentResult && logs.length > 0 && logs[0].id === logId) {
      setCurrentResult(null);
    }
  };

  const handleClearAllLogs = () => {
    if (window.confirm("Are you sure you want to clear your reflection history?")) {
      saveLogs([]);
      setCurrentResult(null);
    }
  };

  // Returns beautiful fallback colors for backgrounds
  const getBannerColor = (mood: MoodType) => {
    switch (mood) {
      case "Happy":
        return "bg-amber-50 text-amber-900 border-amber-200";
      case "Sad":
        return "bg-blue-50 text-blue-900 border-blue-200";
      case "Stressed":
        return "bg-rose-50 text-rose-900 border-rose-200";
      case "Anxious":
        return "bg-purple-50 text-purple-900 border-purple-200";
      case "Excited":
        return "bg-pink-50 text-pink-900 border-pink-200";
      case "Frustrated":
        return "bg-orange-50 text-orange-900 border-orange-200";
      case "Calm":
        return "bg-emerald-50 text-emerald-900 border-emerald-200";
      case "Overwhelmed":
        return "bg-indigo-50 text-indigo-900 border-indigo-200";
      case "Grateful":
        return "bg-teal-50 text-teal-900 border-teal-200";
      case "Tired":
        return "bg-slate-50 text-slate-900 border-slate-200";
      default:
        return "bg-slate-50 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between relative overflow-hidden transition-colors duration-500 ${
      isDark ? "bg-[#0b0f19] text-slate-100" : "bg-[#fafbfc] text-slate-800"
    }`}>
      <InteractiveBackground isDark={isDark} />
      {/* Top Header / Status bar */}
      <header className={`border-b backdrop-blur-md sticky top-0 z-10 transition-all duration-300 ${
        isDark ? "border-slate-800/85 bg-[#0b0f19]/75" : "border-slate-100 bg-white/70"
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className={`font-display font-bold text-base leading-none transition-colors ${
                isDark ? "text-slate-100" : "text-slate-800"
              }`}>
                Empathetic Mood Assistant
              </h1>
              <p className={`text-[10px] mt-1 font-medium font-mono transition-colors ${
                isDark ? "text-slate-400" : "text-slate-400"
              }`}>
                AI Mood Analyzer & Self-Care Companion
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium transition-colors ${
              isDark ? "text-slate-400" : "text-slate-400"
            }`}>
              <Calendar size={13} />
              <span>{new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
            </div>
            <button
              id="btn-theme-toggle"
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all duration-300 cursor-pointer ${
                isDark 
                  ? "bg-slate-800/80 border-slate-700/60 text-amber-400 hover:bg-slate-700/80 hover:text-amber-300 shadow-sm" 
                  : "bg-slate-50 border-slate-200/80 text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300/80"
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Workspace (Left Column, col-span-2) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Direct Input Card */}
            <section className={`rounded-2xl border p-6 transition-all duration-300 backdrop-blur-md ${
              isDark 
                ? "bg-slate-950/40 border-slate-800/60 text-slate-100 shadow-xl" 
                : "bg-white/40 border-slate-200/50 shadow-xs text-slate-800"
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-1.5 rounded-lg ${isDark ? "bg-indigo-950 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
                  <Brain size={18} />
                </div>
                <div>
                  <h2 className={`font-display font-semibold text-sm transition-colors ${
                    isDark ? "text-slate-100" : "text-slate-800"
                  }`}>
                    How is your heart feeling today?
                  </h2>
                  <p className="text-xs text-slate-400">
                    Take as many words as you need. Share what is in your mind.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="relative">
                <textarea
                  id="mood-input-textarea"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="I am feeling a bit tired after work today, but I am proud of what I coded..."
                  className={`w-full min-h-[120px] rounded-xl border p-4 text-sm focus:outline-hidden transition-all resize-none ${
                    isDark 
                      ? "bg-slate-800/50 border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900/30 text-white placeholder-slate-500" 
                      : "bg-slate-50/50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/50 text-slate-800 placeholder-slate-400"
                  }`}
                  maxLength={1000}
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {inputText.length} / 1000 characters
                  </span>
                  <button
                    id="btn-analyze-mood"
                    type="submit"
                    disabled={isLoading || !inputText.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-45 disabled:pointer-events-none cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={13} />
                        Understanding...
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        Analyze Mood
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Quick Prompt Pills */}
              <QuickPrompts onSelectPrompt={handleSelectPrompt} isDark={isDark} />
            </section>

            {/* Error Message if present */}
            {errorMsg && (
              <div className={`border text-xs p-4 rounded-xl flex items-start gap-2.5 transition-all ${
                isDark 
                  ? "bg-red-950/40 border-red-900/40 text-red-300" 
                  : "bg-red-50 border-red-100 text-red-850"
              }`}>
                <Info size={16} className="text-red-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium font-display">Analysis Interrupted</p>
                  <p className="opacity-90">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Live Result Area */}
            <AnimatePresence mode="wait">
              {currentResult && (
                <motion.section
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  style={
                    isDark 
                      ? { 
                          backgroundColor: `${currentResult.color}1c`, 
                          borderColor: `${currentResult.color}35` 
                        } 
                      : { 
                          backgroundColor: currentResult.color ? `${currentResult.color}45` : "rgba(248, 250, 252, 0.45)",
                          borderColor: currentResult.color ? `${currentResult.color}70` : "rgba(226, 232, 240, 0.5)"
                        }
                  }
                  className={`rounded-2xl p-6 border backdrop-blur-md relative overflow-hidden transition-all duration-300 ${
                    isDark ? "shadow-2xl border-indigo-900/40" : "shadow-xs border-slate-205"
                  }`}
                >
                  <div className="absolute right-0 bottom-0 text-9xl opacity-8 pointer-events-none font-sans select-none translate-x-10 translate-y-10">
                    {currentResult.emoji}
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`text-4xl p-3 rounded-2xl shadow-xs ring-4 ${
                      isDark ? "bg-slate-900/80 ring-slate-800/50" : "bg-white/60 ring-white/30"
                    }`}>
                      {currentResult.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? "text-slate-400" : "opacity-60"}`}>
                          Detected Mood
                        </span>
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-705"}`}>Self-Care Active</span>
                      </div>
                      <h3 className={`font-display font-bold text-2xl mt-0.5 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                        {currentResult.mood}
                      </h3>
                      <p className={`text-sm italic font-display leading-relaxed mt-2 max-w-2xl ${
                        isDark ? "text-slate-200" : "text-slate-700"
                      }`}>
                        "{currentResult.insight}"
                      </p>
                    </div>
                  </div>

                  <div className={`mt-6 backdrop-blur-xs rounded-xl p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isDark ? "bg-slate-950/35 border-slate-800/40" : "bg-white/40 border-white/40"
                  }`}>
                    <div className="flex gap-2.5">
                      <div className={`p-1.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isDark ? "bg-slate-800 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                      }`}>
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <span className={`text-[10px] uppercase tracking-wider font-semibold block ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          Micro Self-Care Suggestion
                        </span>
                        <p className={`text-xs font-medium leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          {currentResult.suggestion}
                        </p>
                      </div>
                    </div>
                    <button
                      id="btn-quick-complete"
                      onClick={() => {
                        if (logs.length > 0) {
                          toggleSelfCareCompletion(logs[0].id);
                        }
                      }}
                      className={`text-xs px-3.5 py-1.5 rounded-lg font-medium inline-flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                        logs.length > 0 && logs[0].completedSelfCare
                          ? "bg-emerald-100 text-emerald-850 hover:bg-emerald-200"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                      }`}
                    >
                      {logs.length > 0 && logs[0].completedSelfCare ? (
                        <>
                          <Check size={13} strokeWidth={3} />
                          Completed!
                        </>
                      ) : (
                        <>Complete Action</>
                      )}
                    </button>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Historical Logs Timeline list */}
            <section className={`rounded-2xl border p-6 transition-all duration-300 backdrop-blur-md ${
              isDark 
                ? "bg-slate-950/40 border-slate-800/60 text-slate-100" 
                : "bg-white/40 border-slate-200/50 shadow-xs text-slate-800"
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-semibold text-sm">Tracked Reflection Logs</h3>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                    isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-500"
                  }`}>
                    {logs.length}
                  </span>
                </div>
              </div>

              {logs.length === 0 ? (
                <div className={`text-center py-12 border-2 border-dashed rounded-xl ${
                  isDark ? "border-slate-800" : "border-slate-105"
                }`}>
                  <span className="text-3xl block mb-2">📒</span>
                  <p className="text-xs text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                    No reflections recorded yet. Write how you're feeling to unlock your daily emotional diary.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                  {logs.map((log) => {
                    const localTime = new Date(log.timestamp).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const localDate = new Date(log.timestamp).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    });
                    return (
                      <div
                        key={log.id}
                        className={`group p-3.5 border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-xl ${
                          isDark 
                            ? "bg-slate-900/25 hover:bg-slate-900/40 border-slate-800/40" 
                            : "bg-slate-50/25 hover:bg-white/40 border-slate-200/45"
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span
                            style={isDark ? { backgroundColor: `${log.color}25` } : { backgroundColor: log.color ? `${log.color}45` : "rgba(241, 245, 249, 0.45)" }}
                            className="text-xl p-2 rounded-lg text-center shrink-0 w-10 h-10 flex items-center justify-center shadow-xs"
                          >
                            {log.emoji}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-display font-semibold text-xs ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                                {log.mood}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {localDate} • {localTime}
                              </span>
                            </div>
                            <p className={`text-xs mt-1 italic truncate max-w-md ${isDark ? "text-slate-300" : "text-slate-500"}`} title={log.userInput}>
                              "{log.userInput}"
                            </p>
                          </div>
                        </div>

                        {/* Log Action Button Strip */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            id={`btn-complete-log-${log.id}`}
                            onClick={() => toggleSelfCareCompletion(log.id)}
                            className={`p-1 px-2.5 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                              log.completedSelfCare
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : isDark
                                  ? "bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-850"
                                  : "bg-white hover:bg-slate-100 text-slate-500 border border-slate-100"
                            }`}
                          >
                            {log.completedSelfCare ? (
                              <>
                                <Check size={11} strokeWidth={3} /> Done
                              </>
                            ) : (
                              <>Self-Care</>
                            )}
                          </button>
                          <button
                            id={`btn-delete-log-${log.id}`}
                            onClick={() => handleDeleteLog(log.id)}
                            className={`p-1 px-2.5 rounded-lg transition-all cursor-pointer ${
                              isDark ? "text-slate-500 hover:text-red-440 hover:bg-slate-800" : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                            }`}
                            title="Delete log"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Supportive Mindfulness Utilities Side Panels (Right Column) */}
          <div className="flex flex-col gap-6">
            {/* Mindful Breathing Active Utility */}
            <BreathingAnchor isDark={isDark} />

            {/* Reflection Trends Stat Panel */}
            <TrendsPanel logs={logs} onClearLogs={handleClearAllLogs} isDark={isDark} />

            {/* Informational Guidelines Banner */}
            <div className={`rounded-2xl border p-5 transition-all duration-300 backdrop-blur-md ${
              isDark 
                ? "bg-slate-950/40 border-slate-800/60 text-slate-300" 
                : "bg-slate-50/40 border-slate-200/50 text-slate-600"
            }`}>
              <h4 className={`text-xs font-semibold flex items-center gap-1.5 mb-2 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                <Info size={14} className="text-indigo-500 shrink-0" />
                Empathetic Companionship
              </h4>
              <p className={`text-[11px] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-505"}`}>
                This companion listens without judgment. Your reflections are calculated private-first, held locally within your browser context, and combined securely with modern Gemini insights to design simple physical daily micro remedies.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Humble clean footer */}
      <footer className={`relative z-10 border-t py-4 text-center mt-12 transition-all duration-300 ${
        isDark ? "border-slate-800/80 bg-[#070a13]/80 text-slate-400" : "border-slate-100 bg-white text-slate-500"
      }`}>
        <p className="text-[10px] font-medium opacity-80">
          Empathy Mood assistant • Made for holistic self-care reflection and calm mindfulness guidelines.
        </p>
      </footer>
    </div>
  );
}
