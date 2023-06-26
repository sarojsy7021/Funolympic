const express = require("express")
const passport = require("passport")
const ejs = require("ejs")

const session = require("express-session")
var MySQLStore = require("express-mysql-session")(session)

const reload = require("reload")
require("./config/passport")(passport)
require("dotenv").config()

const app = express()

// Set up view engine
app.set("view engine", "ejs")

// body parser
app.use(express.json({ limit: "100mb" }))
app.use(express.urlencoded({ extended: true }))

var options = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.PASS,
    database: process.env.DATABASE
}

var sessionStore = new MySQLStore(options)

// express session
app.use(
    session({
        secret: "sportsx",
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 24 * 60000 * 30 }
    })
);

// Express bodyparser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + "/public"))
app.use(express.static(__dirname + "/assets"))
app.use("/uploads", express.static("uploads"))
app.use("/uploads", express.static(".uploads"))

// set up passport js
app.use(passport.initialize())
app.use(passport.session())

// Importing Necessary Routes
const indexRoute = require("./routes/index")
const adminRoute = require("./routes/adminDashboard")
const userRoute = require("./routes/userDashboard")

// Use routes
app.use("/", indexRoute)
app.use("/dashboard", adminRoute)
app.use("/dashboard", userRoute)

const port = process.env.PORT;

app.listen(port, () => {
    console.log("Server running on port", port);
})
