const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/getAllProduct", (req, res) => {
  const sql = "SELECT * FROM product";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});
//tất cả loại sp
router.get("/categories", (req, res) => {
  const sql = "SELECT * FROM category";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn danh mục:", err.message);
      res.status(500).send("Lỗi server.");
    } else {
      res.json(results);
    }
  });
});
//sp dua theo id loai
router.get("/products", (req, res) => {
  const { category_id } = req.query;

  const sql = category_id
    ? "SELECT * FROM product WHERE category_id = ?"
    : "SELECT * FROM product";

  db.query(sql, [category_id], (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn sản phẩm:", err.message);
      res.status(500).send("Lỗi server.");
    } else {
      res.json(results);
    }
  });
});

// số lượng không thể vượt sl tối đa
router.get("/api/product/:productId", (req, res) => {
  const productId = req.params.productId; // Lấy productId từ tham số URL

  // Truy vấn SQL để lấy thông tin sản phẩm theo productId
  const query = `SELECT * FROM product WHERE id = ?`;

  db.query(query, [productId], (err, result) => {
    if (err) {
      console.error("Lỗi khi truy vấn dữ liệu:", err);
      res.status(500).json({ error: "Đã có lỗi xảy ra" });
      return;
    }

    if (result.length > 0) {
      // Trả về thông tin sản phẩm
      res.status(200).json(result[0]);
    } else {
      res.status(404).json({ error: "Sản phẩm không tồn tại" });
    }
  });
});

module.exports = router;
