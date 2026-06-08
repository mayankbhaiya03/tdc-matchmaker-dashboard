import { useState, useEffect } from "react";
import { MessageSquare, Plus, Phone, Video, FileText } from "lucide-react";
import { getNotes, addNote } from "../services/api";
import toast from "react-hot-toast";

/**
 * NotesSection — Per-customer notes for meetings, calls, and general observations.
 */

const NOTE_TYPES = [
  { value: "Meeting", icon: Video, label: "Meeting" },
  { value: "Call", icon: Phone, label: "Call" },
  { value: "General", icon: FileText, label: "General" },
];

const NOTE_TYPE_STYLES = {
  Meeting: "bg-purple-50 text-purple-700",
  Call: "bg-green-50 text-green-700",
  General: "bg-slate-50 text-slate-600",
};

export default function NotesSection({ customerId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [noteType, setNoteType] = useState("General");
  const [noteContent, setNoteContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customerId) fetchNotes();
  }, [customerId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await getNotes(customerId);
      setNotes(res.data.data);
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setSaving(true);
    try {
      await addNote(customerId, noteType, noteContent);
      toast.success("Note added", {
        style: { borderRadius: "8px", background: "#1e293b", color: "#f8fafc", fontSize: "14px" },
      });
      setNoteContent("");
      setShowForm(false);
      fetchNotes();
    } catch (error) {
      toast.error("Failed to add note");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">
            Notes ({notes.length})
          </h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Note
        </button>
      </div>

      {/* Add note form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
          {/* Type selector */}
          <div className="flex gap-2 mb-3">
            {NOTE_TYPES.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setNoteType(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  noteType === value
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Write your note here..."
            rows={3}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors resize-none mb-3"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setNoteContent(""); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !noteContent.trim()}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer ${
                saving || !noteContent.trim() ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {saving ? "Saving..." : "Save Note"}
            </button>
          </div>
        </form>
      )}

      {/* Notes list */}
      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="px-6 py-8 text-center text-sm text-slate-400">
            Loading notes...
          </div>
        ) : notes.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <MessageSquare className="h-8 w-8 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No notes yet</p>
            <p className="text-xs text-slate-300 mt-1">
              Add a note from a meeting or call
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="px-6 py-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
                    NOTE_TYPE_STYLES[note.type] || NOTE_TYPE_STYLES.General
                  }`}
                >
                  {note.type}
                </span>
                <span className="text-[11px] text-slate-400">
                  {formatDate(note.createdAt)}
                </span>
                <span className="text-[11px] text-slate-300">·</span>
                <span className="text-[11px] text-slate-400">{note.author}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
