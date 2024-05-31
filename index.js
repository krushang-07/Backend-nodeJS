//import express from "express";
const cookieParser = require("cookie-parser");
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const path = require("path");

//import mongoose from "mongoose";
const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017", {
    dbname: "backend",
  })
  .then(() => {
    console.log("db connected");
  })
  .catch((e) => {
    console.log(e);
  });

const userSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//authentication login logout
const isAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    const decoded = jwt.verify(token, "drhdrhsdgsedhsgsdgsg");

    //store  all user info for the access
    req.user = await User.findById(decoded.id);
    next();
  } else {
    res.redirect("/login");
  }
};

app.get("/", isAuthenticated, (req, res) => {
  res.render("home", { name: req.user.name });
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});
// app.get("/home", (req, res) => {
    
// });

//post req for login

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ password });
  if (!user) return res.redirect("/register");

  const token = jwt.sign({ id: user._id }, "drhdrhsdgsedhsgsdgsg");
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });

  res.redirect("/");
});

//post req for register
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  let user = await User.findOne({ email });
  if (user) {
    return res.redirect("/login");
  }

  user = await User.create({ name: name, email: email, password: password });

  const token = jwt.sign({ id: user._id }, "drhdrhsdgsedhsgsdgsg");

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });

  res.redirect("/");
});

app.get("/home", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

app.listen(5000, () => {
  console.log("sever created");
});

// //sample test
// app.get("/hyy", (req, res) => {
//   res.send("<h1>page not found</h1>");
// });

// app.get("/success", (req, res) => {
//   res.render("success");
// });

// app.post("/contact", async (req, res) => {
//   try {
//     const { name, emai } = req.body;
//     await message.create({ name: name, email: email });
//     res.redirect("/success");
//   } catch {
//     res.send("<h1>error</h1>");
//   }
// });
