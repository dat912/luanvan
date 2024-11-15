const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/getBookingAll", (req, res) => {
  // const query = 'SELECT chinhanh.tenchinhanh AS TenChiNhanh,dichvu.tendichvu AS TenDichVu,nhanvien.ten AS TenNhanVien,datlich.ngay AS Ngay,datlich.gio AS Gio,datlich.tongtien AS TongTien,trangthai.ten AS TenTrangThai FROM datlich JOIN chinhanh ON datlich.idchinhanh = chinhanh.id JOIN dichvu ON datlich.iddichvu = dichvu.id JOIN nhanvien ON datlich.idnhanvien = nhanvien.id JOIN trangthai ON datlich.idtrangthai = trangthai.id Where iduser=? ';
  const query = `
        SELECT 
            chinhanh.tenchinhanh AS TenChiNhanh,
            dichvu.tendichvu AS TenDichVu,
            nhanvien.ten AS TenNhanVien,
            datlich.ngay AS Ngay,
            datlich.gio AS Gio, 
            datlich.tongtien AS TongTien,
            trangthai.ten AS TenTrangThai,
            user.ten AS TenUser
        FROM datlich
        JOIN chinhanh ON datlich.idchinhanh = chinhanh.id
        JOIN dichvu ON datlich.iddichvu = dichvu.id 
        JOIN nhanvien ON datlich.idnhanvien = nhanvien.id
        JOIN trangthai ON datlich.idtrangthai = trangthai.id
        JOIN user ON datlich.iduser = user.id
        ORDER BY datlich.ngay DESC, datlich.gio DESC`;
  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

router.get("/getBookingsByStatus/:status", (req, res) => {
  const status = req.params.status;
  const query = `
      SELECT 
          datlich.id AS ID,
          chinhanh.tenchinhanh AS TenChiNhanh,
          dichvu.tendichvu AS TenDichVu,
          nhanvien.ten AS TenNhanVien,
          datlich.ngay AS Ngay,
          datlich.gio AS Gio, 
          datlich.tongtien AS TongTien,
          trangthai.ten AS TenTrangThai,
          user.ten AS TenUser
      FROM datlich
      JOIN chinhanh ON datlich.idchinhanh = chinhanh.id
      JOIN dichvu ON datlich.iddichvu = dichvu.id 
      JOIN nhanvien ON datlich.idnhanvien = nhanvien.id
      JOIN trangthai ON datlich.idtrangthai = trangthai.id
      JOIN user ON datlich.iduser = user.id
      WHERE trangthai.ten = ?
      ORDER BY datlich.ngay DESC, datlich.gio DESC`;

  db.query(query, [status], (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Update booking status
router.put("/updateBookingStatus", (req, res) => {
  const { bookingId, newStatus } = req.body;
  const query = `
      UPDATE datlich 
      SET idtrangthai = (SELECT id FROM trangthai WHERE ten = ?)
      WHERE id = ?`;

  db.query(query, [newStatus, bookingId], (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Status updated successfully" });
  });
});

// Update payment status
router.put("/updatePaymentStatus", (req, res) => {
  const { bookingId, paymentMethod } = req.body;
  const query = `
      UPDATE datlich 
      SET 
        idtrangthai = (SELECT id FROM trangthai WHERE ten = 'Đã hoàn thành'),
        phuongthucthanhtoan = ?
      WHERE id = ?`;

  db.query(query, [paymentMethod, bookingId], (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Payment processed successfully" });
  });
});

router.get("/getTongTien/:bookingId", (req, res) => {
  const bookingId = req.params.bookingId;

  const query = `
      SELECT tongtien 
      FROM datlich 
      WHERE id = ?`;

  db.query(query, [bookingId], (error, results) => {
    if (error) {
      console.error("Error fetching total amount:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({ tongTien: results[0].tongtien });
  });
});

router.put("/capnhat/:id", async (req, res) => {
  const id = req.params.id;
  const newStatus = 3;

  try {
    // Câu lệnh cập nhật SQL
    const result = await db.query(
      "UPDATE datlich SET idtrangthai = ? WHERE id = ?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy bản ghi với ID này." });
    }

    res.json({ message: "Cập nhật trạng thái thành công.", id: id });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    res.status(500).json({ error: "Lỗi hệ thống." });
  }
});

router.get("/getHoaDonBooking/:id", (req, res) => {
  // Đảm bảo rằng tham số URL có dấu ":" ở phía trước "id"
  const id = req.params.id; // Lấy id từ params
  const query = `
    SELECT 
      chinhanh.tenchinhanh AS TenChiNhanh,
      dichvu.tendichvu AS TenDichVu,
      nhanvien.ten AS TenNhanVien,
      datlich.ngay AS Ngay,
      datlich.gio AS Gio, 
      datlich.tongtien AS TongTien,
      trangthai.ten AS TenTrangThai,
      user.ten AS TenUser
    FROM datlich
    JOIN chinhanh ON datlich.idchinhanh = chinhanh.id
    JOIN dichvu ON datlich.iddichvu = dichvu.id 
    JOIN nhanvien ON datlich.idnhanvien = nhanvien.id
    JOIN trangthai ON datlich.idtrangthai = trangthai.id
    JOIN user ON datlich.iduser = user.id
    WHERE trangthai.id = 3 AND datlich.id = ?`; //

  // Thực hiện truy vấn với id được truyền vào
  db.query(query, [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results); // Trả kết quả dưới dạng JSON
  });
});

module.exports = router;
