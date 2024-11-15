const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/getCategoryAll", (req, res) => {
  const sql = "SELECT * FROM category";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

// router.post("/addChiNhanh", (req, res) => {
//   const sql = "INSERT INTO chinhanh ( `tenchinhanh`, `diachi`) VALUES (?)";
//   const values = [req.body.tenchinhanh, req.body.diachi];
//   db.query(sql, [values], (err, result) => {
//     if (err) return res.json("khong lay duoc data");
//     return res.json(result);
//   });
// });

router.post("/addCategory", (req, res) => {
  const { ten } = req.body;
  const checkSql = "SELECT * FROM category  WHERE ten = ?";
  db.query(checkSql, [ten], (err, results) => {
    if (err) {
      return res.json("Lỗi khi kiểm tra tên ");
    }
    if (results.length > 0) {
      return res.json("Tên category đã tồn tại");
    }
    const insertSql = "INSERT INTO category (`ten`) VALUES (?)";
    const values = [ten];
    db.query(insertSql, [values], (err, result) => {
      if (err) {
        return res.json("Không thêm được category");
      }
      return res.json("Thêm category thành công");
    });
  });
});

// API cập nhật thông tin nhanvien
router.put("/editCategory/:id", (req, res) => {
  const id = req.params.id;
  const { ten } = req.body;

  //   const sql = "UPDATE category SET `ten` = ? WHERE id = ?";
  //   db.query(sql, [ten, id], (error, result) => {
  //     if (error) return res.json({ Status: false, Error: "Query Error" + error });
  //     return res.json({ Status: true, Result: result });
  //   });

  const checkSql = "SELECT * FROM category  WHERE ten = ?";
  db.query(checkSql, [ten], (err, results) => {
    if (err) {
      return res.json("Lỗi khi kiểm tra tên ");
    }
    if (results.length > 0) {
      return res.json("Tên category đã tồn tại");
    }
    const sql = "UPDATE category SET `ten` = ? WHERE id = ?";
    db.query(sql, [ten, id], (err, result) => {
      if (err) {
        return res.json("Không update được category");
      }
      return res.json("Update category thành công");
    });
  });
});

router.delete("/deleteCategory/:id", (req, res) => {
  const id = req.params.id; // Lấy id từ URL

  const sql = "DELETE FROM category WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Lỗi khi xoá chi nhánh:", err);
      return res.status(500).json({ message: "Lỗi khi xoá category" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy category" });
    }
    return res.status(200).json({ message: "Xoá category thành công" });
  });
});

module.exports = router;
