import React from "react";
import { Sparkles } from "lucide-react";

interface QuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  isDark?: boolean;
}

export default function QuickPrompts({ onSelectPrompt, isDark = false }: QuickPromptsProps) {
  const prompts = [
    { text: "Just got off an exhausting call. Felt super overwhelmed and tired.", mood: "Tired" },
    { text: "My project finished on time today! Extremely happy and proud of myself.", mood: "Happy" },
    { text: "Stressed about a looming deadline tomorrow. Feel like I can't catch a break.", mood: "Stressed" },
    { text: "Feeling incredibly calm, listening to some slow cozy rain sounds.", mood: "Calm" },
    { text: "Woke up anxious today, my chest feels heavy and mind is racing.", mood: "Anxious" },
    { text: "So grateful for my health and warm breakfast this morning. Simple joys.", mood: "Grateful" },
  ];

  return (
    <div className="mt-4">
      <div className={`flex items-center gap-1.5 text-xs mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        <Sparkles size={12} className="text-amber-500" />
        <span>Need inspiration? Try clicking a prompt below:</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {prompts.map((p, idx) => (
          <button
            id={`btn-prompt-${idx}`}
            key={idx}
            onClick={() => onSelectPrompt(p.text)}
            className={`text-[11px] px-2.5 py-1 rounded-full transition-all text-left duration-150 cursor-pointer border ${
              isDark 
                ? "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/60 text-slate-300 hover:border-slate-600"
                : "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-600 hover:border-slate-200"
            }`}
          >
            {p.text}
          </button>
        ))}
      </div>
    </div>
  );
}
