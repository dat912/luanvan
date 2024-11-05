const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/getDichVuAll", (req, res) => {
  const sql = "SELECT * FROM dichvu";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

router.post("/addDichVu", (req, res) => {
  const sql = "INSERT INTO dichvu ( `tendichvu`, `gia`) VALUES (?)";
  const values = [req.body.tendichvu, req.body.gia];
  db.query(sql, [values], (err, result) => {
    if (err) return res.json("khong lay duoc data");
    return res.json(result);
  });
});

// API cập nhật thông tin nhanvien
router.put("/editDichVu/:id", (req, res) => {
  const id = req.params.id;
  const { tendichvu, gia } = req.body;

  const sql = "UPDATE dichvu SET `tendichvu` = ?,`gia` = ? WHERE id = ?";
  db.query(sql, [tendichvu, gia, id], (error, result) => {
    if (error) return res.json({ Status: false, Error: "Query Error" + error });
    return res.json({ Status: true, Result: result });
  });
});

router.delete("/deleteDichVu/:id", (req, res) => {
  const id = req.params.id; // Lấy id từ URL

  const sql = "DELETE FROM dichvu WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Lỗi khi xoá chi nhánh:", err);
      return res.status(500).json({ message: "Lỗi khi xoá chi nhánh" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy chi nhánh" });
    }
    return res.status(200).json({ message: "Xoá chi nhánh thành công" });
  });
});

module.exports = router;
