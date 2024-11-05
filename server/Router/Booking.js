const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/getAll", (req, res) => {
  const sql = "SELECT * FROM khachhang";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

router.get("/getChiNhanhAll", (req, res) => {
  const sql = "SELECT * FROM chinhanh";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

router.get("/getDichvuAll", (req, res) => {
  const sql = "SELECT * FROM dichvu";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

router.get("/getNhanVienAll", (req, res) => {
  const sql = "SELECT * FROM nhanvien Where id_vaitro = 3";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

router.get("/getNhanVienAll/:idchinhanh", (req, res) => {
  const idchinhanh = req.params.idchinhanh;

  db.query(
    "SELECT * FROM nhanvien WHERE idchinhanh = ? and id_vaitro=3 ",
    [idchinhanh],
    (error, results) => {
      if (error) {
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.json(results);
      }
    }
  );
});

router.get("/getDatLichAll", (req, res) => {
  const sql = "SELECT * FROM datlich";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Err  inside server " });
    return res.json(result);
  });
});

router.post("/datlich", (req, res) => {
  const sql =
    "INSERT INTO datlich ( `gio`, `ngay`, `idchinhanh`, `iddichvu`, `idnhanvien`,`iduser`,`idtrangthai`, `tongtien`) VALUES (?)";
  const values = [
    req.body.gio,
    req.body.ngay,
    req.body.idchinhanh,
    req.body.iddichvu,
    req.body.idnhanvien,
    req.body.iduser,
    req.body.idtrangthai,
    req.body.tongtien,
  ];
  db.query(sql, [values], (err, result) => {
    if (err) return res.json("khong lay duoc data");
    return res.json(result);
  });
});

module.exports = router;
