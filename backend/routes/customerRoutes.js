const express = require("express");
const router = express.Router();
const { listCustomers, getCustomerById, updateCustomerStatus } = require("../controllers/customerController");

router.get("/", listCustomers);
router.get("/:id", getCustomerById);
router.put("/:id/status", updateCustomerStatus);

module.exports = router;
