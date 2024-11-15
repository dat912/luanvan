const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Endpoint tạo đơn hàng mới
router.post("/orders", (req, res) => {
  const { userId, address, items, totalPrice } = req.body;

  // Bắt đầu transaction
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: "Transaction error", details: err });
    }

    // Tạo đơn hàng mới trong bảng `donhang`
    const insertOrderQuery = `INSERT INTO donhang (user_id, status_id, tongtien, diachi) VALUES (?, ?, ?, ?)`;
    db.query(
      insertOrderQuery,
      [userId, 1, totalPrice, address],
      (err, orderResult) => {
        if (err) {
          return db.rollback(() => {
            res
              .status(500)
              .json({ error: "Error inserting order", details: err });
          });
        }

        const orderId = orderResult.insertId;

        // Thêm chi tiết đơn hàng vào bảng `chitietdonhang`
        const insertOrderDetailsQuery = `INSERT INTO chitietdonhang (donhang_id, product_id, soluong, gia, tongtien) VALUES ?`;

        const orderDetails = items.map((item) => [
          orderId,
          item.id,
          item.qty,
          item.gia,
          item.qty * item.gia,
        ]);

        db.query(
          insertOrderDetailsQuery,
          [orderDetails],
          (err, detailsResult) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({
                  error: "Error inserting order details",
                  details: err,
                });
              });
            }

            // Commit transaction
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ error: "Commit error", details: err });
                });
              }

              res.status(201).json({
                message: "Order created successfully",
                orderId,
              });
            });
          }
        );
      }
    );
  });
});

module.exports = router;
