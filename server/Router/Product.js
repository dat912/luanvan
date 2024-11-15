const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/getAllProduct", (req, res) => {
  const sql = "SELECT * FROM product";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

module.exports = router;
