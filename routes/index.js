const Router = require("express").Router()
const bcrypt = require("bcryptjs")
const passport = require("passport")
const { Sequelize, Op } = require("sequelize")

var randomstring = require("randomstring")
const { User, Admin, Messages, News, Photos, Schedule, Videos, Games } = require("../model/model")

const {
    ensureAuthenticated,
    forwardAuthenticated,
    adminAuthenticated,
} = require("../config/auth");

const client = require("../config/mailer")
const multer = require("multer")
const mailuser = process.env.MAILID;

var auth;
var data;

const authCheck = function (req, res, next) {
    if (req.isAuthenticated()) {
        auth = true;
        data = req.user;
    } else {
        auth = false;
        data = ""
    }
    next()
}

const authCheckUser = function (req, res, next) {
    if (req.isAuthenticated()) {
        auth = true;
        data = req.user;
        if (req.user.role == "user" || "admin") return next();

    } else {
        auth = false;
        var data = "no";
        res.render("pages/login", { data, auth, currentRoute: "" });
    }
};

const authCheckAdmin = function (req, res, next) {
    if (req.isAuthenticated()) {
        auth = true;
        data = req.user;
        if (req.user.role == "admin") return next();

    } else {
        auth = false;
        var data = "no";
        res.render("pages/login", { data, auth, currentRoute: "" });
    }
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });


Router.get("/", authCheck, async (req, res) => {
    res.render('pages/index', { data, auth, currentRoute: "" })
})
Router.get("/forgot-password", authCheck, async (req, res) => {
    res.render('pages/forgot-password', { data, auth, currentRoute: "" })
})

Router.get("/login", forwardAuthenticated, authCheck, async (req, res) => {
    res.render('pages/login', { data, auth, currentRoute: 'login', })
})

Router.get("/register", forwardAuthenticated, authCheck, async (req, res) => {
    res.render('pages/register', { data, auth, currentRoute: 'register', })
})

Router.get("/news", authCheckUser, async (req, res) => {
    const news = await News.findAll({ order: [['createdAt', 'DESC']] })
    res.render("pages/news", { auth, data, news });
});
Router.get("/games", authCheckUser, async (req, res) => {
    const games = await Games.findAll({ order: [['createdAt', 'DESC']] })
    res.render("pages/games", { auth, data, games });
});
Router.get("/channel", authCheckUser, async (req, res) => {
    const videos = await Videos.findAll({ order: [['createdAt', 'DESC']] })
    res.render("pages/channel", { auth, data, videos });
});
Router.get("/schedule", authCheckUser, async (req, res) => {
    const sch = await Schedule.findAll({ order: [['createdAt', 'DESC']] })
    res.render("pages/schedule", { auth, data, sch });
});
Router.get("/gallery", authCheckUser, async (req, res) => {
    const photos = await Photos.findAll({ order: [['createdAt', 'DESC']] })
    res.render("pages/gallery", { auth, data, photos });
});
Router.get("/contact", authCheckUser, (req, res) => {
    res.render("pages/contact", { auth, data });
});
Router.get("/view-profile", authCheckUser, (req, res) => {
    res.render("pages/view-profile", { auth, data });
});

// For Admin
Router.get("/addPhotos", authCheckAdmin, (req, res) => {
    res.render("dashboard/admin/addPhotos", { auth, data });
});
Router.get("/addNews", authCheckAdmin, (req, res) => {
    res.render("dashboard/admin/addNews", { auth, data, });
});
Router.get("/addSchedule", authCheckAdmin, (req, res) => {
    res.render("dashboard/admin/addSchedule", { auth, data, });
});
Router.get("/addVideos", authCheckAdmin, (req, res) => {
    res.render("dashboard/admin/addVideos", { auth, data, });
});
Router.get("/addGames", authCheckAdmin, (req, res) => {
    res.render("dashboard/admin/addGames", { auth, data, });
});
Router.get("/addUser", authCheckAdmin, (req, res) => {
    res.render("dashboard/admin/addUser", { auth, data, });
});
Router.get("/manageUsers", authCheckAdmin, async (req, res) => {
    const users = await User.findAll({ order: [['createdAt', 'DESC']] })
    res.render("dashboard/admin/manageUsers", { auth, data, users });
});
Router.get("/moreAnalytics", authCheckAdmin, async (req, res) => {
    const u = await User.count()
    const g = await Games.count()
    const sch = await Schedule.count()
    res.render("dashboard/admin/moreAnalytics", { auth, data, u, g, sch });
});


Router.post('/view-profile', upload.fields([{}]), authCheckUser, async (req, res) => {

    const { companyName, email, phone } = req.body

    User.update({
        name: companyName, email: email, phone: phone
    },
        { where: { id: req.user.id } })
        .then(() => {
            return res.json("success")
        })
        .catch((err) => {
            return res.json("error")
        })

})

Router.post('/addUser', authCheckAdmin, async (req, res) => {
    const { name, email, phone, password } = req.body

    var salt = bcrypt.genSaltSync(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    await User.create({
        name, email, phone, password: hashedPassword
    })
    return res.json("success")

})

Router.post("/addPhotos", upload.fields([{ name: "photoFile" }]), authCheckAdmin, async (req, res) => {
    const { photoTitle, photoFile } = req.body;

    let imgPath;
    if (req.files.photoFile) {
        imgPath = req.files.photoFile[0].path;
    }

    Photos.create({
        title: photoTitle, image: imgPath
    })
        .then(() => {
            return res.json("success");
        })
        .catch((err) => {
            return res.json("error");
        });
});

Router.post("/addGames", upload.fields([{ name: "photoFile" }]), authCheckAdmin, async (req, res) => {
    const { photoTitle, photoFile } = req.body;

    let imgPath;
    if (req.files.photoFile) {
        imgPath = req.files.photoFile[0].path;
    }

    Games.create({
        title: photoTitle, image: imgPath
    })
        .then(() => {
            return res.json("success");
        })
        .catch((err) => {
            return res.json("error");
        });
});

Router.post("/addVideos", upload.fields([{ name: "photoFile" }]), authCheckAdmin, async (req, res) => {
    const { photoTitle, photoFile } = req.body;
    let imgPath;
    if (req.files.photoFile) {
        imgPath = req.files.photoFile[0].path;
    }

    Videos.create({
        title: photoTitle, videoPath: imgPath
    })
        .then(() => {
            return res.json("success");
        })
        .catch((err) => {
            return res.json("error");
        });
});

Router.post("/addNews", upload.fields([{ name: "photoFile" }]), authCheckAdmin, async (req, res) => {
    const { newsTitle, source, desc, photoFile } = req.body;

    let imgPath;
    if (req.files.photoFile) {
        imgPath = req.files.photoFile[0].path;
    }

    News.create({
        title: newsTitle, source, image: imgPath, description: desc,
    })
        .then(() => {
            return res.json("success");
        })
        .catch((err) => {
            return res.json("error");
        });
},
);
Router.post("/addSchedule", upload.fields([{}]), authCheckAdmin, async (req, res) => {
    const { Title, gb, date, time } = req.body;

    Schedule.create({
        title: Title, gamesBetween: gb, date, time
    })
        .then(() => {
            return res.json("success");
        })
        .catch((err) => {
            return res.json("error");
        });
},
);







Router.post("/contact", async (req, res) => {
    const { email, name, phonenumber, message } = req.body;

    await Messages.create({
        name, email, phonenumber, message
    })
})

Router.post("/register", async (req, res) => {
    var {
        name,
        email,
        phone,
        password,
    } = req.body

    var user = await User.findOne({ where: { email: email } })

    if (user) {
        var data = {
            title: "user exists",
        }
        return res.json(data)
    }

    var salt = bcrypt.genSaltSync(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    await User.create({
        name, email, phone, password: hashedPassword,
    })

    var data = {
        title: "success",
    }
    return res.json(data)
})

Router.post("/login", (req, res, next) => {
    passport.authenticate("user-login", (err, user, info) => {
        if (err === "no user") {
            var data = {
                title: "no user",
            }
            return res.json(data)
        }
        if (err === "password") {
            var data = {
                title: "password"
            }
            return res.json(data)
        }
        if (!user) {
            var data = {
                title: "no user"
            }
            return res.json(data)
        }
        if (user.suspended == true) {
            var data = {
                title: "suspended"
            }
            return res.json(data)
        }

        // Login user for session
        req.logIn(user, (err) => {
            if (err) {
                var data = {
                    title: "error"
                }
                return res.json(data)
            }
            if (user.role == "admin") {
                var data = {
                    title: "admin",
                    user: user
                }
                return res.json(data)
            }
            var data = {
                title: "user",
                user: user
            }
            res.json(data)
        })
    })(req, res, next)
})

//Logout
Router.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/login");
    });
});







module.exports = Router