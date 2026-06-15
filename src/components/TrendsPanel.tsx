import React from "react";
import { MoodLog, MoodType } from "../types";
import { TrendingUp, Smile, Calendar, CheckCircle, Trash2 } from "lucide-react";
import { motion } from "motion/react";

interface TrendsPanelProps {
  logs: MoodLog[];
  onClearLogs: () => void;
  isDark?: boolean;
}

export default function TrendsPanel({ logs, onClearLogs, isDark = false }: TrendsPanelProps) {
  if (logs.length === 0) {
    return (
      <div className={`rounded-2xl border p-6 flex flex-col items-center justify-center text-center py-10 min-h-[300px] transition-all duration-300 backdrop-blur-md ${
        isDark 
          ? "bg-slate-950/40 border-slate-800/60 text-slate-200" 
          : "bg-white/40 border-slate-200/50 shadow-xs text-slate-700"
      }`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
          isDark ? "bg-slate-800/50 text-slate-400" : "bg-slate-100/50 text-slate-400"
        }`}>
          <TrendingUp size={22} />
        </div>
        <h3 className="font-display font-semibold text-sm">No trends available</h3>
        <p className={`text-xs max-w-[200px] mt-1 ${isDark ? "text-slate-400" : "text-slate-400"}`}>
          Log how you are feeling to see analytics and self-care metrics over time.
        </p>
      </div>
    );
  }

  // Calculate statistics
  const totalLogs = logs.length;

  const moodCounts = logs.reduce((acc, log) => {
    acc[log.mood] = (acc[log.mood] || 0) + 1;
    return acc;
  }, {} as Record<MoodType, number>);

  const dominantMoodEntry = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const dominantMood = dominantMoodEntry ? (dominantMoodEntry[0] as MoodType) : null;
  const dominantCount = dominantMoodEntry ? dominantMoodEntry[1] : 0;

  const completedSelfCareCount = logs.filter((l) => l.completedSelfCare).length;
  const completionPercentage = totalLogs > 0 ? Math.round((completedSelfCareCount / totalLogs) * 100) : 0;

  // Let's compute a simple active days count for "streak"
  const uniqueDays = new Set(
    logs.map((l) => {
      try {
        return l.timestamp.split("T")[0] || new Date(l.timestamp).toDateString();
      } catch {
        return new Date().toDateString();
      }
    })
  );
  const consecutiveDaysCount = uniqueDays.size;

  return (
    <div className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 backdrop-blur-md ${
      isDark 
        ? "bg-slate-950/40 border-slate-800/60 text-slate-200" 
        : "bg-white/40 border-slate-200/50 shadow-xs text-slate-800"
    }`}>
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isDark ? "bg-indigo-950 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
              <TrendingUp size={18} />
            </div>
            <h3 className="font-display font-semibold text-sm">Reflection Insights</h3>
          </div>
          <button
            id="btn-clear-logs"
            onClick={onClearLogs}
            className={`p-1 px-2.5 rounded-lg text-[10px] flex items-center gap-1 transition-all cursor-pointer font-medium ${
              isDark 
                ? "text-slate-400 hover:text-red-400 hover:bg-slate-800" 
                : "text-slate-400 hover:text-red-500 hover:bg-red-50"
            }`}
            title="Clear all tracked logs to start fresh"
          >
            <Trash2 size={11} /> Reset Data
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className={`p-3 rounded-xl flex flex-col justify-between ${isDark ? "bg-slate-800/50" : "bg-slate-50"}`}>
            <span className={`text-[10px] uppercase font-semibold tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>Total Logs</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-display font-bold">{totalLogs}</span>
              <span className="text-[10px] text-slate-400">entries</span>
            </div>
          </div>

          <div className={`p-3 rounded-xl flex flex-col justify-between ${isDark ? "bg-slate-800/50" : "bg-slate-50"}`}>
            <span className={`text-[10px] uppercase font-semibold tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>Self-Care Done</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-xl font-display font-bold ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>{completionPercentage}%</span>
              <span className="text-[10px] text-slate-400">rate</span>
            </div>
          </div>

          <div className={`p-3 rounded-xl flex flex-col justify-between col-span-2 ${isDark ? "bg-slate-800/50" : "bg-slate-50"}`}>
            <span className={`text-[10px] uppercase font-semibold tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>Top State</span>
            {dominantMood ? (
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">
                    {logs.find((l) => l.mood === dominantMood)?.emoji || "💡"}
                  </span>
                  <span className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>{dominantMood}</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-xs ${isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500"}`}>
                  {dominantCount} {dominantCount === 1 ? "log" : "logs"}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 mt-1">No major mood detected yet</span>
            )}
          </div>
        </div>

        {/* Visual Mood Distribution Bar */}
        <div className="mb-5">
          <span className={`text-[10px] uppercase font-semibold tracking-wider block mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Emotion Distribution
          </span>
          <div className={`h-2 w-full rounded-full overflow-hidden flex gap-[1px] ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
            {Object.entries(moodCounts).map(([mood, count]) => {
              const width = (count / totalLogs) * 100;
              const logOfMood = logs.find((l) => l.mood === mood);
              return (
                <div
                  key={mood}
                  style={{
                    width: `${width}%`,
                    backgroundColor: logOfMood?.color || "#e2e8f0",
                  }}
                  className="h-full border-r border-white/20 last:border-0 hover:opacity-90 transition-opacity"
                  title={`${mood}: ${count} (${Math.round(width)}%)`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2.5">
            {Object.entries(moodCounts).map(([mood, count]) => {
              const logOfMood = logs.find((l) => l.mood === mood);
              return (
                <div key={mood} className="flex items-center gap-1 text-[10px] text-slate-500">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: logOfMood?.color || "#ccd0d5" }}
                  />
                  <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>{mood}</span>
                  <span className="text-slate-400 font-mono">({count})</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`border-t pt-4 mt-2 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CheckCircle size={14} className="text-emerald-500" />
          <span className={isDark ? "text-slate-400" : "text-slate-500"}>
            Tracked on <b>{consecutiveDaysCount}</b> unique {consecutiveDaysCount === 1 ? "day" : "days"}
          </span>
        </div>
      </div>
    </div>
  );
}
