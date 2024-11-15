const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

router.get("/getEmployee", (req, res) => {
  const sql =
    "SELECT nhanvien.id AS employee_id, nhanvien.*,chinhanh.*,vaitro.* FROM nhanvien join chinhanh on nhanvien.idchinhanh = chinhanh.id join vaitro on nhanvien.id_vaitro = vaitro.id  ";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

router.get("/getVaiTroAll", (req, res) => {
  const sql = "SELECT * FROM vaitro";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

router.get("/getChiNhanhAll", (req, res) => {
  const sql = "SELECT * FROM chinhanh";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

// router.post("/addEmployee", (req, res) => {
//   const sql =
//     "INSERT INTO nhanvien ( `ten`, `email`, `password`, `phone`, `id_vaitro`,`idchinhanh`) VALUES (?)";
//   const values = [
//     req.body.ten,
//     req.body.email,
//     req.body.password,
//     req.body.phone,
//     req.body.id_vaitro,
//     req.body.idchinhanh,
//   ];
//   db.query(sql, [values], (err, result) => {
//     if (err) return res.json("khong lay duoc data");
//     return res.json(result);
//   });
// });

router.post("/addEmployee", (req, res) => {
  const { ten, email, password, phone, id_vaitro, idchinhanh } = req.body;

  // Kiểm tra xem email hoặc phone đã tồn tại chưa
  const checkSql = "SELECT * FROM nhanvien WHERE email = ? OR phone = ?";
  db.query(checkSql, [email, phone], (err, results) => {
    if (err) {
      return res.json("Lỗi kiểm tra email hoặc phone");
    }

    if (results.length > 0) {
      return res.json("Email hoặc phone đã tồn tại");
    }

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return res.json("Lỗi mã hóa mật khẩu");
      }

      const sql =
        "INSERT INTO nhanvien (`ten`, `email`, `password`, `phone`, `id_vaitro`, `idchinhanh`) VALUES (?)";
      const values = [ten, email, hash, phone, id_vaitro, idchinhanh];

      db.query(sql, [values], (err, result) => {
        if (err) {
          return res.json("Không thêm được nhân viên");
        }
        return res.json("Thêm nhân viên thành công");
      });
    });
  });
});

// API cập nhật thông tin nhanvien
router.put("/editEmployee/:id", (req, res) => {
  const id = req.params.id;
  const { ten, email, phone, id_vaitro, idchinhanh } = req.body;

  const sql =
    "UPDATE nhanvien SET `ten` = ?,`email` = ?, `phone` = ?, `id_vaitro`=?,`idchinhanh`=? WHERE id = ?";
  db.query(
    sql,
    [ten, email, phone, id_vaitro, idchinhanh, id],
    (error, result) => {
      if (error)
        return res.json({ Status: false, Error: "Query Error" + error });
      return res.json({ Status: true, Result: result });
    }
  );
});

router.delete("/deleteEmployee/:id", (req, res) => {
  const id = req.params.id; // Lấy id từ URL

  const sql = "DELETE FROM nhanvien WHERE id = ?";
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
