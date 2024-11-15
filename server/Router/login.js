const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const db = require("../config/db");

router.post("/signup", async (req, res) => {
  const { email, ten, phone, password } = req.body;
  const checkSql = "SELECT * FROM user WHERE email = ? OR phone = ?";
  db.query(checkSql, [email, phone], (err, results) => {
    if (err) {
      return res.json("Error checking existing user");
    }

    if (results.length > 0) {
      return res.json("Email or phone already exists");
    }

    bcrypt.hash(password.toString(), 10, (err, hash) => {
      if (err) {
        return res.json("Error hashing password");
      }

      const sql =
        "INSERT INTO user (`email`, `ten`, `phone`, `password`) VALUES (?)";
      const values = [email, ten, phone, hash];

      db.query(sql, [values], (err, result) => {
        if (err) {
          return res.json("Cannot insert data");
        }
        return res.json(result);
      });
    });
  });
});

router.post("/login", async (req, res) => {
  const sql = "SELECT * FROM user WHERE `phone`= ? ";
  db.query(sql, [req.body.phone], (err, data) => {
    if (err) {
      console.error("Database query error:", err);
      return res.json("Error");
    }
    if (data.length > 0) {
      bcrypt.compare(
        req.body.password.toString(),
        data[0].password,
        (err, response) => {
          if (err) {
            return res.json("Error");
          }
          if (response) {
            return res.json({
              success: true,
              ten: data[0].ten,
              id: data[0].id,
              email: data[0].email,
            });
          } else {
            return res.json({ success: false, message: "Sai mật khẩu" });
          }
        }
      );
    } else {
      return res.json("fail");
    }
  });
});

module.exports = router;
