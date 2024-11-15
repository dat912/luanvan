const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/getProductAll", (req, res) => {
  // const sql =
  //   "SELECT product.ten AS product_name,product.img,product.gia,product.chitiet,category.ten AS category_name,product.category_id FROM product JOIN category ON product.category_id = category.id;";
  const sql = `
    SELECT 
      product.id,
      product.ten,
      product.img,
      product.gia,
      product.chitiet,
      category.ten AS category_name,
      product.category_id
    FROM 
      product
    JOIN 
      category ON product.category_id = category.id;
  `;
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

router.get("/getCategoryAll", (req, res) => {
  const sql = "SELECT * FROM category ";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

router.post("/addProduct", (req, res) => {
  const { ten, img, chitiet, gia, category_id } = req.body;
  const checkSql = "SELECT * FROM product  WHERE ten = ?";
  db.query(checkSql, [ten], (err, results) => {
    if (err) {
      return res.json("Lỗi khi kiểm tra tên ");
    }
    if (results.length > 0) {
      return res.json("Tên Product đã tồn tại");
    }
    const insertSql =
      "INSERT INTO product (`ten`, `img`, `chitiet`, `gia`, `category_id`) VALUES (?)";
    const values = [ten, img, chitiet, gia, category_id];
    db.query(insertSql, [values], (err, result) => {
      if (err) {
        return res.json("Không thêm được Product");
      }
      return res.json("Thêm Product thành công");
    });
  });
});

router.put("/editProduct/:id", (req, res) => {
  const id = req.params.id;
  const { ten, img, chitiet, gia, category_id } = req.body;

  const sql =
    "UPDATE product SET `ten` = ?, `img` = ?, `chitiet` = ?, `gia` = ?, `category_id` = ? WHERE id = ?";
  db.query(sql, [ten, img, chitiet, gia, category_id, id], (error, result) => {
    if (error) return res.json({ Status: false, Error: "Query Error" + error });
    return res.json({ Status: true, Result: result });
  });
});

// router.put("/editProduct/:id", (req, res) => {
//   const id = req.params.id;
//   const { ten, img, chitiet, gia, category_id } = req.body;

//   // Kiểm tra tên sản phẩm trùng lặp, bỏ qua sản phẩm hiện tại
//   const checkSql = "SELECT * FROM product WHERE ten = ?";
//   db.query(checkSql, [ten, id], (err, results) => {
//     if (err) {
//       return res.json("Lỗi khi kiểm tra tên");
//     }
//     if (results.length > 0) {
//       return res.json("Tên Product đã tồn tại");
//     }

//     // Cập nhật sản phẩm
//     const sql =
//       "UPDATE product SET `ten` = ?, `img` = ?, `chitiet` = ?, `gia` = ?, `category_id` = ? WHERE id = ?";
//     db.query(sql, [ten, img, chitiet, gia, category_id, id], (err, result) => {
//       if (err) {
//         return res.json("Không update được Product");
//       }
//       return res.json("Update Product thành công");
//     });
//   });
// });

router.delete("/deleteProduct/:id", (req, res) => {
  const id = req.params.id; // Lấy id từ URL

  const sql = "DELETE FROM product WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Lỗi khi xoá chi nhánh:", err);
      return res.status(500).json({ message: "Lỗi khi xoá Product" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy Product" });
    }
    return res.status(200).json({ message: "Xoá Product thành công" });
  });
});

module.exports = router;
