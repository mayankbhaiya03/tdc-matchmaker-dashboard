/**
 * Note Controller
 * Manages per-customer notes (meeting notes, call notes, general).
 * Persists to notes.json file.
 */

const path = require("path");
const fs = require("fs");

const notesPath = path.join(__dirname, "../data/notes.json");

const loadNotes = () => {
  try {
    return JSON.parse(fs.readFileSync(notesPath, "utf-8"));
  } catch {
    return {};
  }
};

const saveNotes = (notes) => {
  fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2), "utf-8");
};

/**
 * GET /api/customers/:id/notes
 */
const getNotes = (req, res) => {
  try {
    const notes = loadNotes();
    const customerNotes = notes[req.params.id] || [];

    // Sort newest first
    const sorted = [...customerNotes].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
      success: true,
      count: sorted.length,
      data: sorted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/customers/:id/notes
 * Body: { type: "Meeting"|"Call"|"General", content: string }
 */
const addNote = (req, res) => {
  try {
    const { type, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note content is required",
      });
    }

    const validTypes = ["Meeting", "Call", "General"];
    const noteType = validTypes.includes(type) ? type : "General";

    const notes = loadNotes();
    const customerId = req.params.id;

    if (!notes[customerId]) {
      notes[customerId] = [];
    }

    const newNote = {
      id: `NOTE-${Date.now()}`,
      type: noteType,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      author: "TDC Admin",
    };

    notes[customerId].push(newNote);
    saveNotes(notes);

    res.status(201).json({
      success: true,
      message: "Note added successfully",
      data: newNote,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getNotes, addNote };
