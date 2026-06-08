import { useState, useEffect } from "react";
import { X, Send, Loader, Sparkles, MapPin, Briefcase, GraduationCap, Mail, ArrowRight } from "lucide-react";
import { generateIntroEmail, sendMatch } from "../services/api";
import toast from "react-hot-toast";

/**
 * SendMatchModal — Modal to preview match info and send intro emails to BOTH parties.
 * Shows two email tabs: one to the customer, one to the match profile.
 */
export default function SendMatchModal({ isOpen, onClose, customer, match, onMatchSent }) {
  const [introEmail, setIntroEmail] = useState("");
  const [reverseIntroEmail, setReverseIntroEmail] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeEmailTab, setActiveEmailTab] = useState("customer");

  useEffect(() => {
    if (isOpen && customer && match) {
      setActiveEmailTab("customer");
      fetchIntroEmails();
    }
  }, [isOpen, customer?.id, match?.profile?.id]);

  const fetchIntroEmails = async () => {
    setLoadingEmail(true);
    try {
      const res = await generateIntroEmail(customer.id, match.profile.id);
      setIntroEmail(res.data.data.introEmail);
      setReverseIntroEmail(res.data.data.reverseIntroEmail || generateFallbackReverseEmail());
    } catch (error) {
      // Fallback emails
      setIntroEmail(
        `Dear ${customer.firstName},\n\nWe'd like to introduce you to ${match.profile.firstName} ${match.profile.lastName}, a ${match.profile.age}-year-old ${match.profile.designation} from ${match.profile.city}.\n\nWarm regards,\nTDC Matchmaking Team`
      );
      setReverseIntroEmail(generateFallbackReverseEmail());
    } finally {
      setLoadingEmail(false);
    }
  };

  const generateFallbackReverseEmail = () => {
    return `Dear ${match.profile.firstName},\n\nWe'd like to introduce you to ${customer.firstName} ${customer.lastName}, a ${customer.age}-year-old ${customer.designation} from ${customer.city}.\n\nWarm regards,\nTDC Matchmaking Team`;
  };

  const handleSend = async () => {
    setSending(true);
    try {
      await sendMatch(customer.id, match.profile.id, introEmail, reverseIntroEmail);
      toast.success(
        `Match emails sent to both ${customer.firstName} & ${match.profile.firstName}!`,
        {
          duration: 4000,
          style: {
            borderRadius: "8px",
            background: "#1e293b",
            color: "#f8fafc",
            fontSize: "14px",
          },
          iconTheme: { primary: "#6366f1", secondary: "#fff" },
        }
      );
      if (onMatchSent) {
        onMatchSent();
      }
      onClose();
    } catch (error) {
      toast.error("Failed to send match emails");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !match) return null;

  const profile = match.profile;

  const emailTabs = [
    {
      key: "customer",
      label: `To ${customer.firstName}`,
      sublabel: "Your customer",
      email: introEmail,
      setEmail: setIntroEmail,
    },
    {
      key: "match",
      label: `To ${profile.firstName}`,
      sublabel: "Suggested match",
      email: reverseIntroEmail,
      setEmail: setReverseIntroEmail,
    },
  ];

  const activeTab = emailTabs.find((t) => t.key === activeEmailTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-base font-bold text-slate-900">
            Send Match Suggestion
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Two-way notification banner */}
          <div className="bg-indigo-50 rounded-xl p-3.5 flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-indigo-700 font-medium">
              <Mail className="h-4 w-4 text-indigo-500" />
              <span>{customer.firstName}</span>
              <ArrowRight className="h-3 w-3 text-indigo-400" />
              <span>{profile.firstName}</span>
            </div>
            <span className="text-[11px] text-indigo-500 ml-auto">Both parties will be notified</span>
          </div>

          {/* Match profile card */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Suggested Match Profile
            </p>
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold ${
                  profile.gender === "Male"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-pink-100 text-pink-700"
                }`}
              >
                {profile.firstName[0]}{profile.lastName[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="text-xs text-slate-500">
                  {profile.age}y · {profile.gender} · {profile.religion}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-slate-400" />
                {profile.city}
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase className="h-3 w-3 text-slate-400" />
                {profile.designation}
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-3 w-3 text-slate-400" />
                {profile.degree}
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-indigo-500" />
                {match.score}% Compatible
              </div>
            </div>
          </div>

          {/* Email tabs — two recipients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">
                Introduction Emails
              </label>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-indigo-400" />
                AI Generated
              </span>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-3">
              {emailTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveEmailTab(tab.key)}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeEmailTab === tab.key
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <div>{tab.label}</div>
                  <div className={`text-[10px] mt-0.5 ${
                    activeEmailTab === tab.key ? "text-slate-500" : "text-slate-400"
                  }`}>
                    {tab.sublabel}
                  </div>
                </button>
              ))}
            </div>

            {/* Email content */}
            {loadingEmail ? (
              <div className="flex items-center justify-center py-8 bg-slate-50 rounded-lg">
                <Loader className="h-5 w-5 text-indigo-500 animate-spin" />
                <span className="ml-2 text-sm text-slate-500">
                  Generating personalized emails...
                </span>
              </div>
            ) : (
              <textarea
                value={activeTab.email}
                onChange={(e) => activeTab.setEmail(e.target.value)}
                rows={10}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors resize-none"
              />
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <p className="text-[11px] text-slate-400">
            2 emails will be sent
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || loadingEmail}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer ${
                sending || loadingEmail ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {sending ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send to Both
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
