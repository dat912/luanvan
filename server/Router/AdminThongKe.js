const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/countProducts", (req, res) => {
  const sql = "SELECT COUNT(*) AS soluong FROM product";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

router.get("/countCategorys", (req, res) => {
  const sql = "SELECT COUNT(*) AS soluong FROM category";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

router.get("/countUsers", (req, res) => {
  const sql = "SELECT COUNT(*) AS soluong FROM user";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

router.get("/countNhanVien", (req, res) => {
  const sql = "SELECT COUNT(*) AS soluong FROM nhanvien";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

router.get("/tongTienDatLich", (req, res) => {
  const sql = "SELECT SUM(tongtien) AS total FROM datlich;";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

router.get("/tongTienDonHang", (req, res) => {
  const sql = "SELECT SUM(tongtien) AS total FROM donhang;";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

module.exports = router;
