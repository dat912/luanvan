const express = require("express");
const router = express.Router();
const db = require("../config/db");

// API lấy thông tin user
router.get("/user/:id", (req, res) => {
  const userId = req.params.id;
  const query = "SELECT id, email, ten, phone FROM user WHERE id = ?";

  db.query(query, [userId], (err, result) => {
    if (err) {
      res
        .status(500)
        .json({ error: "Đã có lỗi xảy ra trong quá trình truy vấn" });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ message: "Không tìm thấy user" });
      return;
    }
    res.json(result[0]);
  });
});

// API cập nhật thông tin user
router.put("/userUpdate/:id", (req, res) => {
  const id = req.params.id;
  const { ten, phone, email } = req.body;

  const sql =
    "UPDATE user SET `ten` = ?, `phone` = ?, `email` = ? WHERE id = ?";
  db.query(sql, [ten, phone, email, id], (error, result) => {
    if (error) return res.json({ Status: false, Error: "Query Error" + error });
    return res.json({ Status: true, Result: result });
  });
});

// API lấy lịch đặt của user
router.get("/bookings/:userId", (req, res) => {
  const id = req.params.userId;

  // const query = 'SELECT chinhanh.tenchinhanh AS TenChiNhanh,dichvu.tendichvu AS TenDichVu,nhanvien.ten AS TenNhanVien,datlich.ngay AS Ngay,datlich.gio AS Gio,datlich.tongtien AS TongTien,trangthai.ten AS TenTrangThai FROM datlich JOIN chinhanh ON datlich.idchinhanh = chinhanh.id JOIN dichvu ON datlich.iddichvu = dichvu.id JOIN nhanvien ON datlich.idnhanvien = nhanvien.id JOIN trangthai ON datlich.idtrangthai = trangthai.id Where iduser=? ';
  const query = `
      SELECT 
          chinhanh.tenchinhanh AS TenChiNhanh,
          dichvu.tendichvu AS TenDichVu,
          nhanvien.ten AS TenNhanVien,
          datlich.ngay AS Ngay,
          datlich.gio AS Gio, 
          datlich.tongtien AS TongTien,
          trangthai.ten AS TenTrangThai
      FROM datlich
      JOIN chinhanh ON datlich.idchinhanh = chinhanh.id
      JOIN dichvu ON datlich.iddichvu = dichvu.id 
      JOIN nhanvien ON datlich.idnhanvien = nhanvien.id
      JOIN trangthai ON datlich.idtrangthai = trangthai.id
      WHERE iduser = ?
      ORDER BY datlich.ngay DESC, datlich.gio DESC`;
  db.query(query, [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

module.exports = router;
