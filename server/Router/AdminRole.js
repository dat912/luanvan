const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/getVaiTroAll", (req, res) => {
  const sql = "SELECT * FROM vaitro";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

router.post("/addVaiTro", (req, res) => {
  const { tenVaiTro } = req.body;
  const checkSql = "SELECT * FROM vaitro  WHERE tenVaiTro = ?";
  db.query(checkSql, [tenVaiTro], (err, results) => {
    if (err) {
      return res.json("Lỗi khi kiểm tra tên ");
    }
    if (results.length > 0) {
      return res.json("Tên vai trò đã tồn tại");
    }
    const insertSql = "INSERT INTO vaitro (`tenVaiTro`) VALUES (?)";
    const values = [tenVaiTro];
    db.query(insertSql, [values], (err, result) => {
      if (err) {
        return res.json("Không thêm được vai trò");
      }
      return res.json("Thêm vai trò thành công");
    });
  });
});

router.put("/editVaiTro/:id", (req, res) => {
  const id = req.params.id;
  const { tenVaiTro } = req.body;

  const checkSql = "SELECT * FROM vaitro  WHERE tenVaiTro = ?";
  db.query(checkSql, [tenVaiTro], (err, results) => {
    if (err) {
      return res.json("Lỗi khi kiểm tra tên ");
    }
    if (results.length > 0) {
      return res.json("Tên vai trò đã tồn tại");
    }
    const sql = "UPDATE vaitro SET `tenVaiTro` = ? WHERE id = ?";
    db.query(sql, [tenVaiTro, id], (err, result) => {
      if (err) {
        return res.json("Không update được  vai trò");
      }
      return res.json("Update  vai trò thành công");
    });
  });
});

router.delete("/deleteVaiTro/:id", (req, res) => {
  const id = req.params.id; // Lấy id từ URL

  const sql = "DELETE FROM vaitro WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Lỗi khi xoá vai trò:", err);
      return res.status(500).json({ message: "Lỗi khi xoá vai trò" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy vai trò" });
    }
    return res.status(200).json({ message: "Xoá vai trò thành công" });
  });
});

module.exports = router;
