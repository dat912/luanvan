const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/getChiNhanhAll", (req, res) => {
  const sql = "SELECT * FROM chinhanh";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

router.get("/getCountNhanVien", (req, res) => {
  const sql = `
    SELECT 
      c.id, 
      c.tenchinhanh, 
      c.diachi, 
      COUNT(n.id) AS soluong 
    FROM 
      chinhanh c
    LEFT JOIN 
      nhanvien n 
    ON 
      c.id = n.idchinhanh
    GROUP BY 
      c.id, c.tenchinhanh, c.diachi
  `;
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Error inside server" });
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

router.post("/addChiNhanh", (req, res) => {
  const { tenchinhanh, diachi } = req.body;
  const checkSql = "SELECT * FROM chinhanh WHERE tenchinhanh = ?";
  db.query(checkSql, [tenchinhanh], (err, results) => {
    if (err) {
      return res.json("Lỗi khi kiểm tra tên chi nhánh");
    }
    if (results.length > 0) {
      return res.json("Tên chi nhánh đã tồn tại");
    }
    const insertSql =
      "INSERT INTO chinhanh (`tenchinhanh`, `diachi`) VALUES (?)";
    const values = [tenchinhanh, diachi];
    db.query(insertSql, [values], (err, result) => {
      if (err) {
        return res.json("Không thêm được chi nhánh");
      }
      return res.json("Thêm chi nhánh thành công");
    });
  });
});

// API cập nhật thông tin nhanvien
router.put("/editChiNhanh/:id", (req, res) => {
  const id = req.params.id;
  const { tenchinhanh, diachi } = req.body;

  const sql = "UPDATE chinhanh SET `tenchinhanh` = ?,`diachi` = ? WHERE id = ?";
  db.query(sql, [tenchinhanh, diachi, id], (error, result) => {
    if (error) return res.json({ Status: false, Error: "Query Error" + error });
    return res.json({ Status: true, Result: result });
  });
});

router.delete("/deleteChiNhanh/:id", (req, res) => {
  const id = req.params.id; // Lấy id từ URL

  const sql = "DELETE FROM chinhanh WHERE id = ?";
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
