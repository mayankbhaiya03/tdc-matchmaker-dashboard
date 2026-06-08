import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, Shield, Sparkles } from "lucide-react";
import { getAIStatus } from "../services/api";

/**
 * DashboardLayout — Shared layout for all authenticated pages.
 * Top navigation bar with logo, title, and sign-out.
 */
export default function DashboardLayout() {
  const navigate = useNavigate();
  const [aiMode, setAiMode] = useState("loading"); // "loading", "gemini", "mock"
  const [aiMessage, setAiMessage] = useState("");

  const handleSignOut = () => {
    navigate("/");
  };

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await getAIStatus();
        setAiMode(res.data.data.mode);
        setAiMessage(res.data.data.status);
      } catch (err) {
        setAiMode("mock");
        setAiMessage("Could not contact status API");
      }
    }
    checkStatus();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Logo + Title */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-indigo-600">
                <Shield className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-slate-900 leading-tight">
                  TDC Matchmaker
                </h1>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Internal Dashboard
                </p>
              </div>
            </div>

            {/* Right: AI Status & Sign Out */}
            <div className="flex items-center gap-3">
              {aiMode === "gemini" ? (
                <div
                  title={aiMessage}
                  className="flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 shadow-sm cursor-help"
                >
                  <Sparkles className="h-3 w-3 text-indigo-500 animate-pulse" />
                  <span>Gemini AI Active</span>
                </div>
              ) : aiMode === "mock" ? (
                <div
                  title={aiMessage}
                  className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 shadow-sm cursor-help"
                >
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>Mock Mode</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-pulse" />
                  <span>Checking AI...</span>
                </div>
              )}

              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
