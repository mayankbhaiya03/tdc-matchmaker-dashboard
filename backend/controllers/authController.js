/**
 * Auth Controller
 * Handles login with hardcoded credentials.
 */

const VALID_USERNAME = "admin";
const VALID_PASSWORD = "admin123";

const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    return res.json({
      success: true,
      message: "Login successful",
      user: {
        username: VALID_USERNAME,
        role: "matchmaker",
        name: "TDC Admin",
      },
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid username or password",
  });
};

module.exports = { login };
