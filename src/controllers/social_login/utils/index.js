const { projects } = require("../../../middlewares/authMiddlware");

const requestComingFrom = async (req, res) => {
  const apiKey = req.headers["api-key"];
  if (!apiKey) {
    return res.status(401).json({ message: "API key is required" });
  }
  const requestFrom = projects.find((proj) => proj.apiKey === apiKey);
  if (!requestFrom) {
    return res.status(403).json({ message: "Invalid API key" });
  }
  return requestFrom?.name;
};

module.exports = requestComingFrom;
