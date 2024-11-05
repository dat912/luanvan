const crypto = require("crypto");
const https = require("https");
const axios = require("axios");
const express = require("express");
const router = express.Router();

router.post("/payment", async (req, res) => {
  const {
    partnerCode,
    accessKey,
    secretKey,
    orderId,
    orderInfo,
    amount,
    ipnUrl,
    redirectUrl,
    extraData,
  } = req.body;

  // Create raw signature
  var rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  var signature = crypto
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
    extraData,
    requestType,
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
        timeout: 5000,
      }
    );
    const jsonResult = response.data;

    if (jsonResult.payUrl) {
      res.status(200).json({ payUrl: jsonResult.payUrl });
    } else {
      res.status(400).json({ error: "Payment URL not found in the response." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/callback", (req, res) => {
  console.log(req.body);
  try {
    return res.status(200).json({ code: "0", data: req.body });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/momo-callback", async (req, res) => {
  try {
    const { resultCode, orderId, amount, extraData } = req.body;

    if (resultCode === "0") {
      // Thanh toán thành công
      const bookingId = extraData;

      // Cập nhật trạng thái booking
      await db.query("UPDATE bookings SET status = ? WHERE id = ?", [
        "Đã hoàn thành",
        bookingId,
      ]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Momo callback error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// test momo:
// NGUYEN VAN A
// 9704 0000 0000 0018
// 03/07
// OTP

// test vnpay:
// (vnp_TmnCode): CGXZLS0Z
// (vnp_HashSecret): XNBCJFAKAZQSGTARRLGCHVZWCIOIGSHN
// Ngân hàng: NCB
// Số thẻ: 9704198526191432198
// Tên chủ thẻ:NGUYEN VAN A
// Ngày phát hành:07/15
// Mật khẩu OTP:123456

module.exports = router;
