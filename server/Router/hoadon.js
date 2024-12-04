const express = require("express");
const router = express.Router();
const db = require("../config/db");

const util = require("util");
const query = util.promisify(db.query).bind(db);

// Endpoint tạo đơn hàng mới
router.post("/orders", (req, res) => {
  const { userId, address, items, totalPrice } = req.body;

  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: "Transaction error", details: err });
    }

    const insertOrderQuery = `INSERT INTO donhang (user_id, status_id, tongtien, diachi,method_id) VALUES (?, ?, ?, ?, 2)`;
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
        const insertOrderDetailsQuery = `INSERT INTO chitietdonhang (donhang_id, product_id, soluong, gia, tongtien) VALUES ?`;
        const orderDetails = items.map((item) => [
          orderId,
          item.id,
          item.qty,
          item.gia,
          item.qty * item.gia,
        ]);

        db.query(insertOrderDetailsQuery, [orderDetails], (err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({
                error: "Error inserting order details",
                details: err,
              });
            });
          }

          // **Giảm số lượng sản phẩm trong kho**
          const updateProductPromises = items.map((item) => {
            const updateProductQuery = `UPDATE product SET soluong = soluong - ? WHERE id = ? AND soluong >= ?`;
            return query(updateProductQuery, [item.qty, item.id, item.qty]);
          });

          Promise.all(updateProductPromises)
            .then(() => {
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    res
                      .status(500)
                      .json({ error: "Commit error", details: err });
                  });
                }

                res.status(201).json({
                  message: "Order created successfully and stock updated",
                  orderId,
                });
              });
            })
            .catch((error) => {
              db.rollback(() => {
                res.status(500).json({
                  error: "Error updating stock",
                  details: error,
                });
              });
            });
        });
      }
    );
  });
});

module.exports = router;
