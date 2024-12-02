const axios = require("axios");
const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const db = require("../config/db");

// Định nghĩa các route
// router.post("/momo", async (req, res) => {
//   const { amount } = req.body;
//   var accessKey = "F8BBA842ECF85";
//   var secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
//   var orderInfo = "pay with MoMo";
//   var partnerCode = "MOMO";
//   var redirectUrl = "http://localhost:3000/booking";
//   var ipnUrl = "https://3627-1-53-0-35.ngrok-free.app/callback";
//   var requestType = "payWithMethod";

//   var orderId = partnerCode + new Date().getTime();
//   var requestId = orderId;
//   var extraData = "";

//   // Create raw signature
//   var rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

//   var signature = crypto
//     .createHmac("sha256", secretKey)
//     .update(rawSignature)
//     .digest("hex");

//   const requestBody = {
//     partnerCode: partnerCode,
//     partnerName: "Test",
//     storeId: "MomoTestStore",
//     requestId: requestId,
//     amount,
//     orderId: orderId,
//     orderInfo: orderInfo,
//     redirectUrl: redirectUrl,
//     ipnUrl: ipnUrl,
//     lang: "vi",
//     requestType: requestType,
//     autoCapture: true,
//     extraData: extraData,
//     orderGroupId: "",
//     signature: signature,
//   };

//   try {
//     const response = await axios.post(
//       "https://test-payment.momo.vn/v2/gateway/api/create",
//       requestBody,
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // Return result to client
//     res.json(response.data);
//   } catch (error) {
//     console.error(`Problem with request: ${error.message}`);
//     res.status(500).json({ error: error.message });
//   }
// });

// router.post("/callback", (req, res) => {
//   console.log(req.body);
//   try {
//     return res.status(200).json({ code: "0", data: req.body });
//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
router.post("/momo", async (req, res) => {
  const { amount, bookingId } = req.body;
  var accessKey = "F8BBA842ECF85";
  var secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  var orderInfo = "pay with MoMo";
  var partnerCode = "MOMO";
  var redirectUrl = "http://localhost:3000/booking"; //
  var ipnUrl = "https://674b-112-197-14-130.ngrok-free.app/callback"; // Update với domain thật của bạn
  var requestType = "payWithMethod";
  var orderId = partnerCode + new Date().getTime();
  var requestId = orderId;
  // Thêm bookingId vào extraData
  var extraData = Buffer.from(JSON.stringify({ bookingId })).toString("base64");

  var rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  var signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = {
    partnerCode: partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: "vi",
    requestType: requestType,
    autoCapture: true,
    extraData: extraData,
    orderGroupId: "",
    signature: signature,
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

async function updateBookingStatus(bookingId, newStatus) {
  try {
    // Thực hiện câu truy vấn để cập nhật trạng thái trong database
    const result = await db.query(
      "UPDATE datlich SET idtrangthai = ? WHERE id = ?",
      [newStatus, bookingId]
    );

    // Kiểm tra nếu không có bản ghi nào được cập nhật
    if (result.affectedRows === 0) {
      console.log(`Không tìm thấy đơn hàng với ID ${bookingId}`);
      return false;
    }

    console.log(
      `Đã cập nhật trạng thái của booking ID ${bookingId} thành công.`
    );
    return true;
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    throw error;
  }
}

// Callback handler cho IPN URL
router.post("/callback", async (req, res) => {
  console.log(req.body);
  try {
    const { resultCode, extraData } = req.body;
    const decodedExtraData = JSON.parse(
      Buffer.from(extraData, "base64").toString()
    );
    const { bookingId } = decodedExtraData;

    if (resultCode === 0) {
      // Thanh toán thành công
      await updateBookingStatus(bookingId, 3);
      res.status(200).json({ message: "OK" });
    } else {
      // Ghi log khi thanh toán thất bại
      console.log(
        `Payment failed for booking ${bookingId} with result code ${resultCode}`
      );
      res.status(200).json({ message: "Failed" });
    }
  } catch (error) {
    console.error("Callback processing error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
