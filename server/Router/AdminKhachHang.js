const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

router.get("/getKhachHangAll", (req, res) => {
  const sql = "SELECT * FROM user";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

// router.post("/addUser", (req, res) => {
//   const { ten, email, password, phone } = req.body;

//   // Kiểm tra xem email hoặc phone đã tồn tại chưa
//   const checkSql = "SELECT * FROM user WHERE email = ? OR phone = ?";
//   db.query(checkSql, [email, phone], (err, results) => {
//     if (err) {
//       return res.json("Lỗi kiểm tra email hoặc phone");
//     }

//     if (results.length > 0) {
//       return res.json("Email hoặc phone đã tồn tại");
//     }

//     bcrypt.hash(password, 10, (err, hash) => {
//       if (err) {
//         return res.json("Lỗi mã hóa mật khẩu");
//       }

//       const sql =
//         "INSERT INTO nhanvien (`ten`, `email`, `password`, `phone`) VALUES (?)";
//       const values = [ten, email, hash, phone];

//       db.query(sql, [values], (err, result) => {
//         if (err) {
//           return res.json("Không thêm được nhân viên");
//         }
//         return res.json("Thêm nhân viên thành công");
//       });
//     });
//   });
// });

router.post("/addUser", async (req, res) => {
  const { email, ten, phone, password } = req.body;
  const checkSql = "SELECT * FROM user WHERE email = ? OR phone = ?";
  db.query(checkSql, [email, phone], (err, results) => {
    if (err) {
      return res.json("Lỗi kiểm tra email hoặc phone");
    }

    if (results.length > 0) {
      return res.json("Email hoặc phone đã tồn tại");
    }

    bcrypt.hash(password.toString(), 10, (err, hash) => {
      if (err) {
        return res.json("Lỗi mã hóa mật khẩu");
      }

      const sql =
        "INSERT INTO user (`email`, `ten`, `phone`, `password`) VALUES (?)";
      const values = [email, ten, phone, hash];

      db.query(sql, [values], (err, result) => {
        if (err) {
          return res.json("Không thêm được");
        }
        return res.json("Thêm thành công");
      });
    });
  });
});

// API cập nhật thông tin nhanvien
router.put("/editUser/:id", (req, res) => {
  const id = req.params.id;
  const { ten, email, phone } = req.body;

  const sql = "UPDATE user SET `ten` = ?,`email` = ?, `phone` = ? WHERE id = ?";
  db.query(sql, [ten, email, phone, id], (error, result) => {
    if (error) return res.json({ Status: false, Error: "Query Error" + error });
    return res.json({ Status: true, Result: result });
  });
});

router.delete("/deleteUser/:id", (req, res) => {
  const id = req.params.id; // Lấy id từ URL

  const sql = "DELETE FROM user WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Lỗi khi xoá nhân viên:", err);
      return res.status(500).json({ message: "Lỗi khi xoá nhân viên" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }
    return res.status(200).json({ message: "Xoá nhân viên thành công" });
  });
});

module.exports = router;
