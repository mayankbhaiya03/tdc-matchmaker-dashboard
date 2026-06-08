import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Heart, Loader, AlertCircle, Sparkles
} from "lucide-react";
import { getCustomerById, getMatches, updateCustomerStatus, getMatchExplanation } from "../services/api";
import BioDataCard from "../components/BioDataCard";
import MatchCard from "../components/MatchCard";
import NotesSection from "../components/NotesSection";
import SendMatchModal from "../components/SendMatchModal";
import StatusBadge from "../components/StatusBadge";
import toast from "react-hot-toast";

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [generatingIds, setGeneratingIds] = useState(new Set());

  useEffect(() => {
    fetchCustomer();
    fetchMatches();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setLoadingCustomer(true);
      const res = await getCustomerById(id);
      setCustomer(res.data.data);
    } catch (error) {
      toast.error("Failed to load customer");
      navigate("/dashboard");
    } finally {
      setLoadingCustomer(false);
    }
  };

  const fetchMatches = async () => {
    try {
      setLoadingMatches(true);
      const res = await getMatches(id);
      setMatches(res.data.data);
    } catch (error) {
      console.error("Failed to load matches:", error);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await updateCustomerStatus(id, newStatus);
      setCustomer((prev) => ({ ...prev, status: newStatus }));
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleGenerateAIExplanation = async (matchProfileId, score) => {
    setGeneratingIds((prev) => {
      const next = new Set(prev);
      next.add(matchProfileId);
      return next;
    });

    try {
      const res = await getMatchExplanation(id, matchProfileId, score);
      const explanation = res.data.aiExplanation;

      setMatches((prevMatches) =>
        prevMatches.map((m) =>
          m.profile.id === matchProfileId
            ? { ...m, aiExplanation: explanation }
            : m
        )
      );
      toast.success("AI Insight generated!");
    } catch (error) {
      toast.error("Failed to generate AI Insight");
      console.error(error);
    } finally {
      setGeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(matchProfileId);
        return next;
      });
    }
  };

  const handleSendMatch = (match) => {
    setSelectedMatch(match);
    setShowSendModal(true);
  };

  if (loadingCustomer) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="h-6 w-6 text-indigo-500 animate-spin" />
        <span className="ml-3 text-sm text-slate-500">Loading profile...</span>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-10 w-10 text-slate-300 mb-3" />
        <p className="text-sm text-slate-500">Customer not found</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const tabs = [
    { key: "profile", label: "Profile" },
    { key: "matches", label: `Matches (${matches.length})` },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900">
                {customer.firstName} {customer.lastName}
              </h2>
              <StatusBadge status={customer.status} />
            </div>
            <p className="text-sm text-slate-500">
              {customer.age}y · {customer.gender} · {customer.city} · Assigned {customer.assignedDate}
            </p>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1 px-2.5 shadow-sm">
          <label htmlFor="status-select" className="text-xs font-semibold text-slate-500 hidden sm:inline">
            Stage:
          </label>
          <div className="relative">
            <select
              id="status-select"
              value={customer.status}
              disabled={updatingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`bg-transparent text-slate-800 text-xs font-semibold rounded-md border-0 pl-1 pr-6 py-1 focus:outline-none focus:ring-0 cursor-pointer appearance-none transition-all ${
                updatingStatus ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <option value="New">New</option>
              <option value="Active">Active</option>
              <option value="Matched">Matched</option>
              <option value="On Hold">On Hold</option>
              <option value="Closed">Closed</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-slate-400">
              {updatingStatus ? (
                <Loader className="h-3 w-3 animate-spin text-indigo-500" />
              ) : (
                <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "profile" && (
        <BioDataCard customer={customer} />
      )}

      {activeTab === "matches" && (
        <div>
          {/* Match summary */}
          <div className="mb-5 flex items-center gap-2">
            <Heart className="h-4 w-4 text-indigo-500" />
            <p className="text-sm text-slate-600">
              Showing top {matches.length} matches from the{" "}
              {customer.gender === "Male" ? "female" : "male"} matchmaking pool
            </p>
          </div>

          {loadingMatches ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="h-5 w-5 text-indigo-500 animate-spin" />
              <span className="ml-2 text-sm text-slate-500">
                Running matching algorithm...
              </span>
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <Heart className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No matches found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((match, index) => (
                <MatchCard
                  key={match.profile.id}
                  match={match}
                  onSendMatch={handleSendMatch}
                  onGenerateAIExplanation={handleGenerateAIExplanation}
                  isGeneratingAI={generatingIds.has(match.profile.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "notes" && (
        <NotesSection customerId={customer.id} />
      )}

      {/* Send Match Modal */}
      <SendMatchModal
        isOpen={showSendModal}
        onClose={() => {
          setShowSendModal(false);
          setSelectedMatch(null);
        }}
        customer={customer}
        match={selectedMatch}
        onMatchSent={fetchCustomer}
      />
    </div>
  );
}
