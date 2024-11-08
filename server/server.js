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

app.post("/signup", async (req, res) => {
  const sql =
    "INSERT INTO user (`email`,`ten`, `phone`, `password`) VALUES (?)";
  const password = req.body.password;

  console.log("1. Mật khẩu người dùng nhập khi đăng ký:", password);

  bcrypt.hash(password.toString(), 10, (err, hash) => {
    if (err) {
      console.error("2. Lỗi khi hash mật khẩu:", err);
      return res.json("Error hashing password");
    }

    console.log("3. Mật khẩu đã hash:", hash);

    const values = [req.body.email, req.body.ten, req.body.phone, hash];

    db.query(sql, [values], (err, result) => {
      if (err) {
        console.error("4. Lỗi khi insert vào database:", err);
        return res.json("Cannot insert data");
      }
      return res.json(result);
    });
  });
});

app.post("/login", async (req, res) => {
  const sql = "SELECT * FROM user WHERE `phone`= ? ";

  db.query(sql, [req.body.phone], (err, data) => {
    if (err) {
      console.error("Database query error:", err);
      return res.json("Error");
    }
    if (data.length > 0) {
      console.log("1. Mật khẩu người dùng nhập:", req.body.password);
      console.log("2. Mật khẩu đã hash trong DB:", data[0].password);

      bcrypt.compare(
        req.body.password.toString(),
        data[0].password,
        (err, response) => {
          console.log("3. Kết quả so sánh mật khẩu:", response);
          if (err) {
            console.error("4. Lỗi khi so sánh mật khẩu:", err);
            return res.json("Error");
          }
          if (response) {
            return res.json({
              success: true,
              ten: data[0].ten,
              id: data[0].id,
            });
          } else {
            return res.json({ success: false, message: "Sai mật khẩu" });
          }
        }
      );
    } else {
      return res.json("fail");
    }
  });
});

// app.post("/signup", async (req, res) => {
//     const { email, ten, phone, password } = req.body;

//     // Kiểm tra nếu email hoặc số điện thoại đã tồn tại
//     const checkSql = "SELECT * FROM khachhang WHERE email = ? OR phone = ?";
//     db.query(checkSql, [email, phone], async (err, result) => {
//         if (err) {
//             console.error("Lỗi khi kiểm tra thông tin người dùng:", err);
//             return res.json("Lỗi khi kiểm tra thông tin người dùng");
//         }

//         if (result.length > 0) {
//             // Nếu tồn tại, trả về thông báo
//             return res.json("Email hoặc số điện thoại đã tồn tại");
//         } else {
//             // Nếu không tồn tại, tiến hành đăng ký
//             try {
//                 // Mã hóa mật khẩu trước khi lưu
//                 const hashedPassword = await bcrypt.hash(password, 10);
//                 const insertSql = "INSERT INTO khachhang (`email`, `ten`, `phone`, `password`) VALUES (?)";
//                 const values = [email, ten, phone, hashedPassword];

//                 db.query(insertSql, [values], (err, result) => {
//                     if (err) {
//                         console.error("Không thể đăng ký người dùng mới:", err);
//                         return res.json("Không thể đăng ký người dùng mới");
//                     }
//                     return res.json("Đăng ký thành công");
//                 });
//             } catch (hashError) {
//                 console.error("Lỗi khi mã hóa mật khẩu:", hashError);
//                 return res.json("Lỗi khi mã hóa mật khẩu");
//             }
//         }
//     });
// });

// app.post('/login', (req, res) => {
//     const { phone, password } = req.body;
//     const sql = "SELECT * FROM khachhang WHERE phone = ? ";
//     db.query(sql, [phone], (err, data) => {
//         if (err) {
//             console.error("Lỗi truy vấn:", err);
//             return res.json("Error");
//         }

//         if (data) {
//             // In ra mật khẩu băm và mật khẩu nhập vào để kiểm tra
//             console.log("Mật khẩu nhập vào:", password);
//             console.log("Mật khẩu đã băm trong DB:", data[0].password);

//             // So sánh mật khẩu
//             bcrypt.compare(password, data[0].password, (err, result) => {
//                 if (err) {
//                     console.error("Lỗi so sánh mật khẩu:", err);
//                     return res.json("Error");
//                 }

//                 console.log("Kết quả so sánh mật khẩu:", result); // In ra kết quả so sánh

//                 if (!result) {
//                     return res.json({
//                         success: false,
//                         message: "Sai mật khẩu"
//                     });
//                 }
//                 return res.json({
//                     success: true,
//                     ten: data[0].ten
//                 });
//             });
//         } else {
//             return res.json({
//                 success: false,
//                 message: "Tài khoản không tồn tại"
//             });
//         }
//     });
// });

//adminpage

const Profile = require("./Router/Profile");
const Booking = require("./Router/Booking");
const AdminEmployee = require("./Router/AdminEmployee");
const AdminChiNhanh = require("./Router/AdminChiNhanh");
const AdminDichVu = require("./Router/AdminDichVu");
const AdminBookings = require("./Router/AdminBookings");
const Momo = require("./Router/Momo");
const Payment = require("./Router/Payment");

app.use("", Booking);
app.use("/api", Profile);
app.use("", AdminEmployee);
app.use("", AdminChiNhanh);
app.use("", AdminDichVu);
app.use("", AdminBookings);
app.use("", Momo);
//app.use("", Payment);

app.listen(8080, () => {
  console.log("listening" + 8080);
});
