const express = require("express");
const router = express.Router();
const { getNotes, addNote } = require("../controllers/noteController");

router.get("/:id/notes", getNotes);
router.post("/:id/notes", addNote);

module.exports = router;
