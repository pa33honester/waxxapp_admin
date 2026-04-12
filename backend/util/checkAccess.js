const config = require("../config");

module.exports = () => {
  return (req, res, next) => {
    const token = req.headers.key || req.body.key || req.query.key;

    if (token) {
      if (token == config.secretKey) {
        next();
      } else {
        return res.status(401).json({ status: false, error: "Unauthorized Access" });
      }
    } else {
      return res.status(401).json({ status: false, error: "Unauthorized Access" });
    }
  };
};
