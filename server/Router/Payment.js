const crypto = require("crypto");
const https = require("https");
const axios = require("axios");
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const util = require("util");
const query = util.promisify(db.query).bind(db);

// const createOrder = (userId, address, items, totalPrice) => {
//   return new Promise((resolve, reject) => {
//     db.beginTransaction((err) => {
//       if (err) {
//         return reject(err);
//       }

//       const insertOrderQuery = `INSERT INTO donhang (user_id, status_id, tongtien, diachi) VALUES (?, ?, ?, ?)`;
//       db.query(
//         insertOrderQuery,
//         [userId, 1, totalPrice, address],
//         (err, orderResult) => {
//           if (err) {
//             return db.rollback(() => reject(err));
//           }

//           const orderId = orderResult.insertId;
//           const insertOrderDetailsQuery = `INSERT INTO chitietdonhang (donhang_id, product_id, soluong, gia, tongtien) VALUES ?`;

//           const orderDetails = items.map((item) => [
//             orderId,
//             item.id,
//             item.qty,
//             item.gia,
//             item.qty * item.gia,
//           ]);

//           db.query(
//             insertOrderDetailsQuery,
//             [orderDetails],
//             (err, detailsResult) => {
//               if (err) {
//                 return db.rollback(() => reject(err));
//               }

//               db.commit((err) => {
//                 if (err) {
//                   return db.rollback(() => reject(err));
//                 }
//                 resolve(orderId);
//               });
//             }
//           );
//         }
//       );
//     });
//   });
// };

const createOrder = (userId, address, items, totalPrice) => {
  return new Promise((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) {
        return reject(err);
      }

      const insertOrderQuery = `INSERT INTO donhang (user_id, status_id, tongtien, diachi,method_id) VALUES (?, ?, ?, ?,1)`;
      db.query(
        insertOrderQuery,
        [userId, 1, totalPrice, address],
        (err, orderResult) => {
          if (err) {
            return db.rollback(() => reject(err));
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
              return db.rollback(() => reject(err));
            }

            // Giảm số lượng sản phẩm trong kho
            const updateProductPromises = items.map((item) => {
              const updateProductQuery = `UPDATE product SET soluong = soluong - ? WHERE id = ? AND soluong >= ?`;
              return query(updateProductQuery, [item.qty, item.id, item.qty]);
            });

            Promise.all(updateProductPromises)
              .then(() => {
                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => reject(err));
                  }
                  resolve(orderId);
                });
              })
              .catch((error) => {
                db.rollback(() => {
                  reject(error);
                });
              });
          });
        }
      );
    });
  });
};

router.post("/paymentmomo", async (req, res) => {
  const { amount, userId, address, cartItems, totalPrice } = req.body;

  // Mã hóa thông tin đơn hàng để gửi qua extraData
  const orderData = {
    userId,
    address,
    items: cartItems,
    totalPrice,
  };

  const accessKey = "F8BBA842ECF85";
  const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  const orderInfo = "pay with MoMo";
  const partnerCode = "MOMO";
  const redirectUrl = "http://localhost:3000/san-pham";
  const ipnUrl = "https://414b-113-22-219-26.ngrok-free.app/momo-callback";
  const requestType = "payWithMethod";
  const orderId = partnerCode + new Date().getTime();
  const requestId = orderId;

  // Mã hóa base64 thông tin đơn hàng
  const extraData = Buffer.from(JSON.stringify(orderData)).toString("base64");

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = {
    partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang: "vi",
    requestType,
    autoCapture: true,
    extraData,
    orderGroupId: "",
    signature,
  };

  try {
    const response = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Payment request error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/momo-callback", async (req, res) => {
  try {
    console.log("Callback data:", req.body);
    const { resultCode, extraData } = req.body;

    if (resultCode === 0) {
      try {
        // Giải mã thông tin đơn hàng từ extraData
        const orderData = JSON.parse(
          Buffer.from(extraData, "base64").toString()
        );

        const orderId = await createOrder(
          orderData.userId,
          orderData.address,
          orderData.items,
          orderData.totalPrice
        );

        return res.status(200).json({
          message: "Thanh toán thành công và đơn hàng đã được tạo.",
          orderId: orderId,
          paymentStatus: "SUCCESS",
        });
      } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({
          message: "Có lỗi xảy ra khi tạo đơn hàng sau thanh toán.",
          error: error.message,
        });
      }
    } else {
      console.log("Payment failed with resultCode:", resultCode);
      return res.status(400).json({
        message: `Thanh toán không thành công. Mã lỗi: ${resultCode}`,
      });
    }
  } catch (error) {
    console.error("Callback processing error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

module.exports = router;
