import { MapPin, Briefcase, TrendingUp, Send, Sparkles } from "lucide-react";

/**
 * MatchCard — Individual match suggestion with score, tier, and actions.
 */

const TIER_STYLES = {
  "High Potential": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "Good Match": "bg-blue-50 text-blue-700 ring-blue-600/20",
  "Possible Match": "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Low Compatibility": "bg-slate-100 text-slate-500 ring-slate-400/20",
};

function ScoreBar({ score }) {
  let barColor = "bg-slate-300";
  if (score >= 75) barColor = "bg-emerald-500";
  else if (score >= 55) barColor = "bg-blue-500";
  else if (score >= 40) barColor = "bg-amber-500";

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-bold text-slate-700 tabular-nums w-10 text-right">
        {score}%
      </span>
    </div>
  );
}

export default function MatchCard({ match, onSendMatch, onGenerateAIExplanation, isGeneratingAI }) {
  const { profile, score, matchTier, aiExplanation, breakdown } = match;
  const tierStyle = TIER_STYLES[matchTier] || TIER_STYLES["Low Compatibility"];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between h-full">
      <div className="p-5 flex flex-col h-full justify-between">
        <div>
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div
                className={`h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  profile.gender === "Male"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-pink-50 text-pink-700"
                }`}
              >
                {profile.firstName[0]}{profile.lastName[0]}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 truncate">
                  {profile.firstName} {profile.lastName}
                </h4>
                <p className="text-xs text-slate-500">
                  {profile.age}y · {profile.gender} · {profile.maritalStatus}
                </p>
              </div>
            </div>
            {/* Tier badge */}
            <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${tierStyle}`}>
              {matchTier}
            </span>
          </div>

          {/* Score bar */}
          <div className="mb-3">
            <p className="text-xs text-slate-400 mb-1 font-medium">Compatibility Score</p>
            <ScoreBar score={score} />
          </div>

          {/* Key info pills */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-50 rounded-md px-2 py-1">
              <MapPin className="h-3 w-3 text-slate-400" />
              {profile.city}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-50 rounded-md px-2 py-1">
              <Briefcase className="h-3 w-3 text-slate-400" />
              {profile.designation}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-50 rounded-md px-2 py-1">
              <TrendingUp className="h-3 w-3 text-slate-400" />
              {profile.incomeFormatted}
            </span>
          </div>

          {/* AI explanation or On-demand button */}
          {aiExplanation ? (
            <div className="bg-indigo-50/50 rounded-lg p-3 mb-4 border border-indigo-100/40">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                  AI Insight
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {aiExplanation}
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <button
                onClick={() => onGenerateAIExplanation(profile.id, { score, matchTier })}
                disabled={isGeneratingAI}
                className={`w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100/80 border border-indigo-100/60 transition-colors cursor-pointer ${
                  isGeneratingAI ? "opacity-75 cursor-wait" : ""
                }`}
              >
                {isGeneratingAI ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Generating AI Insight...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Generate AI Insight</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Top factors */}
        {breakdown && breakdown.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Key Factors
            </p>
            <div className="space-y-1.5">
              {breakdown.slice(0, 4).map((factor, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{factor.factor}</span>
                  <span className={`font-medium ${
                    factor.score >= 75 ? "text-emerald-600" :
                    factor.score >= 50 ? "text-blue-600" :
                    factor.score >= 30 ? "text-amber-600" :
                    "text-slate-400"
                  }`}>
                    {factor.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Send Match button */}
        <button
          onClick={() => onSendMatch(match)}
          className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
          Send Match
        </button>
      </div>
    </div>
  );
}
