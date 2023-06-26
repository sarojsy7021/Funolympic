require("dotenv").config();
const Router = require("express").Router();
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const multer = require("multer");
var slugify = require("slugify");
const bcrypt = require("bcrypt");

//Nodemailer Setup
const mailuser = process.env.MAILID;
const client = require("../config/mailer");
const { User, Admin } = require("../model/model");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

var auth;
var data;
const authCheck = function (req, res, next) {
    if (req.isAuthenticated()) {
        auth = true;
        data = req.user;
        next();
    } else {
        auth = false;
        data = "";
        res.redirect("/login");
    }
};

Router.get("/admin", authCheck, async (req, res) => {
    res.render('pages/index', { data, auth, currentRoute: "" })
})





module.exports = Router