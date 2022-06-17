const express = require("express");
const users = require("./models/users");
let session = require("express-session");
var path = require("path");
const fileUpload = require("express-fileupload");
var dbmgr = require("./dbmgr");
var db = dbmgr.db;

const app = express();
const PORT = 3000;

// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  }),
);

var bodyParser = require("body-parser");
// const { redirect } = require("express/lib/response");
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(bodyParser.json());

const publicPath = path.resolve(__dirname, "../../");

app.use(express.static(publicPath));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  }),
);

function checkSession(request, response, next) {
  console.log(request.session.username);
  if (request.session.username) {
    console.log("Authentic User");
  } else {
    console.log("Not Authentic User");
    // var err = new Error("Trying Unauthorized Access");
    // response.redirect('login');
    // next(err);
  }
  next();
}
// app.use(checkSession)

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/index.html"), {
    msg: "User not found.",
    errMsg: true,
  });
});

app.post("/admin", (req, res) => {
  // console.log(req.body);
  let username = req.body.username;
  let password = req.body.password;
  let allUsers = users.getAllUsers();
  if (
    allUsers[0].users_name == username &&
    allUsers[0].users_password == password
  ) {
    req.session.username = username;
    console.log("Session set : " + req.session.username);
    res.redirect("/members");
  } else {
    res.redirect("/login");
  }
});

app.get("/dashboard", (req, res) => {
  var membership = db.prepare("SELECT * FROM membership").all();
  res.render("dashboard.ejs");
});

app.get("/members", (req, res) => {
  res.render("members.ejs");
});

app.get("/member/:mid", (req, res) => {
  var mid = req.params.mid;
  var mData = db
    .prepare("SELECT * FROM members WHERE member_id = '" + mid + "'")
    .all();
  var membership = db
    .prepare("SELECT * FROM membership WHERE mid = '" + mid + "'")
    .all();
  res.render("member.ejs", { mData: mData[0], membership: membership });
});

app.use("/memberAddForm", (req, res) => {
  res.render("memberAddForm.ejs");
});

app.use("/memberAddData", (req, res) => {
  let bd = req.body;

  if (req.files) {
    // console.log("File found")
    let mPhoto = req.files.member_photo;
    mPhoto.mv(path.join("./public/uploads", mPhoto.name));
    db.prepare(
      `INSERT INTO members (member_name, member_mobile, member_address, member_identity_no, member_photo, member_remark)
                    VALUES ('${bd.member_name}','${bd.member_mobile}','${bd.member_address}','${bd.member_identity_no}','${mPhoto.name}','${bd.member_remark}')`,
    ).run();
  } else {
    db.prepare(
      `INSERT INTO members (member_name, member_mobile, member_address, member_identity_no, member_remark)
                VALUES ('${bd.member_name}','${bd.member_mobile}','${bd.member_address}','${bd.member_identity_no}','${bd.member_remark}')`,
    ).run();
  }
  res.redirect("/members");
});

app.use("/memberEditForm/:mid", (req, res) => {
  var mid = req.params.mid;
  var mData = db
    .prepare("SELECT * FROM members WHERE member_id = '" + mid + "'")
    .all();
  res.render("memberEditForm.ejs", { mData: mData[0] });
});

app.use("/memberEditData", async (req, res) => {
  let bd = req.body;
  if (req.files) {
    // console.log("File found")
    let mPhoto = req.files.member_photo;
    mPhoto.mv(path.join("./public/uploads", mPhoto.name));

    db.prepare(
      `UPDATE members SET member_name ='${bd.member_name}', member_mobile='${bd.member_mobile}',
         member_address='${bd.member_address}', member_photo='${mPhoto.name}', member_identity_no='${bd.member_identity_no}', member_remark='${bd.member_remark}'
         WHERE member_id='${bd.member_id}'`,
    ).run();
  } else {
    // console.log("File Not found")
    db.prepare(
      `UPDATE members SET member_name ='${bd.member_name}', member_mobile='${bd.member_mobile}',
         member_address='${bd.member_address}', member_identity_no='${bd.member_identity_no}', member_remark='${bd.member_remark}'
         WHERE member_id='${bd.member_id}'`,
    ).run();
  }
  res.redirect("/member/" + bd.member_id);
});

app.use("/changeMemberStatus/:mid/:status", async (req, res) => {
  let newStatus = 1;
  // console.log(req.params.status)
  if (req.params.status == 1) newStatus = 0;
  let result = db
    .prepare(
      `UPDATE members SET member_status ='${newStatus}'
        WHERE member_id='${req.params.mid}'`,
    )
    .run();

  res.send(result);
});
// Membership Routes

app.use("/membershipAddForm/:mid", (req, res) => {
  res.render("membershipAddForm.ejs", { mid: req.params.mid });
});

app.use("/membershipAddData", (req, res) => {
  let bd = req.body;
  db.prepare(
    `INSERT INTO membership (mid, payment, payment_date, start_date, end_date) VALUES
                ('${bd.mid}','${bd.payment}','${bd.payment_date}','${bd.start_date}','${bd.end_date}')`,
  ).run();

  res.redirect("/member/" + bd.mid);
});

app.use("/membershipEditForm/:msid", (req, res) => {
  var msid = req.params.msid;
  var msData = db
    .prepare("SELECT * FROM membership WHERE sn = '" + msid + "'")
    .all();
  res.render("membershipEditForm.ejs", { msData: msData[0] });
});

app.use("/membershipEditData", (req, res) => {
  var bd = req.body;
  db.prepare(
    `UPDATE membership SET payment='${bd.payment}', payment_date='${bd.payment_date}',
     start_date='${bd.start_date}', end_date='${bd.end_date}' WHERE sn='${bd.sn}'`,
  ).run();

  res.redirect("/member/" + bd.mid);
});

app.post("/searchMember", (req, res) => {
  let bd = req.body;
  // console.log("Member Search Request "+bd);
  let sData = db
    .prepare("SELECT * FROM members WHERE member_name LIKE '%" + bd.name + "%'")
    .all();
  res.send(sData);
});

app.post("/finishedMembership", (req, res) => {
  // console.log("Pending Membership Request ");
  let sData = db
    .prepare(
      "SELECT * FROM members m LEFT JOIN (SELECT *,MAX(end_date)  FROM membership GROUP BY mid ) m2 ON m.member_id = m2.mid WHERE (end_date < date('now') OR payment_date IS NULL) AND member_status = 1;",
    )
    .all();
  res.send(sData);
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
