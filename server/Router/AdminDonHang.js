const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/getHoaDonAll", (req, res) => {
  const query = `
    SELECT 
      donhang.id AS madonhang,
      donhang.method_id,
      
      product.ten AS tensanpham,
      chitietdonhang.soluong,
      chitietdonhang.gia,
      chitietdonhang.tongtien,
      user.ten AS tenuser,
      status.ten AS tentrangthai,
      payment_method.ten AS tenphuongthuc,
      donhang.diachi,
      donhang.created_at,
      donhang.tongtien AS tongtienhoadon
    FROM 
      donhang
    JOIN 
      chitietdonhang ON donhang.id = chitietdonhang.donhang_id
    JOIN 
      user ON donhang.user_id = user.id
    JOIN 
      status ON donhang.status_id = status.id
    JOIN 
      payment_method ON donhang.method_id = payment_method.id
    JOIN 
      product ON chitietdonhang.product_id = product.id`;

  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database error", details: error });
    }

    // Log toàn bộ kết quả để kiểm tra

    res.json(results);
  });
});

router.get("/getHoaDonByStatus/:status", (req, res) => {
  const status = req.params.status;
  const query = `
      SELECT 
    donhang.id AS madonhang,
    product.ten AS tensanpham,
    chitietdonhang.soluong,
    chitietdonhang.gia,
    chitietdonhang.tongtien,
    user.ten AS tenuser,
    status.ten AS tentrangthai,
    payment_method.ten AS tenphuongthuc,
    donhang.diachi,
    donhang.created_at,
    donhang.tongtien AS tongtienhoadon
FROM 
    donhang
JOIN 
    chitietdonhang ON donhang.id = chitietdonhang.donhang_id
JOIN 
    user ON donhang.user_id = user.id
JOIN 
    status ON donhang.status_id = status.id
JOIN 
      payment_method ON donhang.method_id = payment_method.id
JOIN 
    product ON chitietdonhang.product_id = product.id
    WHERE status.ten = ?`;

  db.query(query, [status], (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Update booking status
router.put("/updateHoaDonStatus", (req, res) => {
  const { hoadonId, newStatus } = req.body;
  const query = `
      UPDATE donhang 
      SET status_id = (SELECT id FROM status WHERE ten = ?)
      WHERE id = ?`;

  db.query(query, [newStatus, hoadonId], (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Status updated successfully" });
  });
});

// Update payment status

// router.get("/getHoaDonBooking/:id", (req, res) => {
//   const id = req.params.id;
//   const query = `
//     SELECT
//       chinhanh.tenchinhanh AS TenChiNhanh,
//       dichvu.tendichvu AS TenDichVu,
//       nhanvien.ten AS TenNhanVien,
//       datlich.ngay AS Ngay,
//       datlich.gio AS Gio,
//       datlich.tongtien AS TongTien,
//       trangthai.ten AS TenTrangThai,
//       user.ten AS TenUser
//     FROM datlich
//     JOIN chinhanh ON datlich.idchinhanh = chinhanh.id
//     JOIN dichvu ON datlich.iddichvu = dichvu.id
//     JOIN nhanvien ON datlich.idnhanvien = nhanvien.id
//     JOIN trangthai ON datlich.idtrangthai = trangthai.id
//     JOIN user ON datlich.iduser = user.id
//     WHERE trangthai.id = 3 AND datlich.id = ?`; //

//   // Thực hiện truy vấn với id được truyền vào
//   db.query(query, [id], (error, results) => {
//     if (error) {
//       return res.status(500).json({ error: "Database error" });
//     }
//     res.json(results); // Trả kết quả dưới dạng JSON
//   });
// });

module.exports = router;
