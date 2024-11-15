const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = "your_secret_key";
const axios = require("axios");
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// API Đăng nhập
router.post("/loginAdmin", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM nhanvien WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi khi kiểm tra email" });
    }

    if (results.length === 0) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không chính xác" });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: "Lỗi khi xác thực mật khẩu" });
      }

      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Email hoặc mật khẩu không chính xác" });
      }
      let role;
      if (user.id_vaitro === 1) {
        role = "admin";
      } else if (user.id_vaitro === 2) {
        role = "quanly";
      } else {
        return res.status(403).json({ message: "Bạn không có quyền truy cập" });
      }
      // Tạo token JWT với role
      const token = jwt.sign(
        { id: user.id, email: user.email, role: role },
        secretKey,
        { expiresIn: "1h" } // Token hết hạn sau 1 giờ
      );

      // Trả về token và role của người dùng
      return res.json({
        message: "Đăng nhập thành công",
        token: token,
        role: role,
      });
    });
  });
});

module.exports = router;
