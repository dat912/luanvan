const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "barber",
});

// app.post("/signup", async (req, res) => {
//   const { email, ten, phone, password } = req.body;
//   const checkSql = "SELECT * FROM user WHERE email = ? OR phone = ?";
//   db.query(checkSql, [email, phone], (err, results) => {
//     if (err) {
//       return res.json("Error checking existing user");
//     }

//     if (results.length > 0) {
//       return res.json("Email or phone already exists");
//     }

//     bcrypt.hash(password.toString(), 10, (err, hash) => {
//       if (err) {
//         return res.json("Error hashing password");
//       }

//       const sql =
//         "INSERT INTO user (`email`, `ten`, `phone`, `password`) VALUES (?)";
//       const values = [email, ten, phone, hash];

//       db.query(sql, [values], (err, result) => {
//         if (err) {
//           return res.json("Cannot insert data");
//         }
//         return res.json(result);
//       });
//     });
//   });
// });

// app.post("/login", async (req, res) => {
//   const sql = "SELECT * FROM user WHERE `phone`= ? ";
//   db.query(sql, [req.body.phone], (err, data) => {
//     if (err) {
//       console.error("Database query error:", err);
//       return res.json("Error");
//     }
//     if (data.length > 0) {
//       bcrypt.compare(
//         req.body.password.toString(),
//         data[0].password,
//         (err, response) => {
//           if (err) {
//             return res.json("Error");
//           }
//           if (response) {
//             return res.json({
//               success: true,
//               ten: data[0].ten,
//               id: data[0].id,
//             });
//           } else {
//             return res.json({ success: false, message: "Sai mật khẩu" });
//           }
//         }
//       );
//     } else {
//       return res.json("fail");
//     }
//   });
// });

//userpage

const Profile = require("./Router/Profile");
const Login = require("./Router/login");
const Product = require("./Router/Product");
const Hoadon = require("./Router/hoadon");

app.use("", Hoadon);
app.use("", Product);
app.use("", Login);
app.use("/api", Profile);
//adminpage
const AdminLogin = require("./Router/AdminLogin");
const Booking = require("./Router/Booking");
const AdminEmployee = require("./Router/AdminEmployee");
const AdminChiNhanh = require("./Router/AdminChiNhanh");
const AdminDichVu = require("./Router/AdminDichVu");
const AdminCategory = require("./Router/AdminCategory");
const AdminProduct = require("./Router/AdminProduct");
const AdminBookings = require("./Router/AdminBookings");
const AdminKhachHang = require("./Router/AdminKhachHang");
const AdminDonHang = require("./Router/AdminDonHang");
const Payment = require("./Router/Payment");
const Momo = require("./Router/Momo");
const ThongKe = require("./Router/AdminThongKe");

app.use("", ThongKe);
app.use("", Payment);
app.use("", AdminDonHang);
app.use("", AdminKhachHang);
app.use("", AdminProduct);
app.use("", AdminCategory);
app.use("", AdminLogin);
app.use("", Booking);
app.use("", AdminEmployee);
app.use("", AdminChiNhanh);
app.use("", AdminDichVu);
app.use("", AdminBookings);
app.use("", Momo);

app.listen(8080, () => {
  console.log("listening " + 8080);
});
