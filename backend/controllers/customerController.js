/**
 * Customer Controller
 * Serves assigned customer data from static JSON.
 */

const path = require("path");
const fs = require("fs");

const customersPath = path.join(__dirname, "../data/customers.json");

const getCustomers = () => {
  return JSON.parse(fs.readFileSync(customersPath, "utf-8"));
};

/**
 * GET /api/customers
 * Query params: search, status
 */
const listCustomers = (req, res) => {
  try {
    let customers = getCustomers();
    const { search, status } = req.query;

    // Filter by status
    if (status && status !== "All") {
      customers = customers.filter(
        (c) => c.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Search by name or city
    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/customers/:id
 */
const getCustomerById = (req, res) => {
  try {
    const customers = getCustomers();
    const customer = customers.find((c) => c.id === req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/customers/:id/status
 */
const updateCustomerStatus = (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["New", "Active", "Matched", "On Hold", "Closed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const customers = getCustomers();
    const customerIndex = customers.findIndex((c) => c.id === req.params.id);

    if (customerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    customers[customerIndex].status = status;
    fs.writeFileSync(customersPath, JSON.stringify(customers, null, 2), "utf-8");

    res.json({
      success: true,
      message: `Customer status updated to ${status}`,
      data: customers[customerIndex],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { listCustomers, getCustomerById, updateCustomerStatus };
