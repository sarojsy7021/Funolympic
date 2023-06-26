const Router = require("express").Router();
const multer = require("multer");
const { Op, where, Sequelize } = require("sequelize");
const bcrypt = require("bcrypt");

const client = require("../config/mailer");
const { User, Admin } = require("../model/model");

var auth;
var data;

const authCheckUser = function (req, res, next) {
    if (req.isAuthenticated()) {
        auth = true;
        data = req.user;
        if (req.user.role == "user") return next();

    } else {
        auth = false;
        data = "";
        res.redirect("/login");
    }
};

Router.get("/user", async (req, res) => {
    res.render("pages/index", { data, auth, currentRoute: "" })
})




module.exports = Router