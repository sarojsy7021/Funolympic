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
Router.get("/forgot-password", forwardAuthenticated, authCheck, async (req, res) => {
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
Router.get("/contact", authCheck, (req, res) => {
    res.render("pages/contact", { auth, data, currentRoute: '' });
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
Router.get("/messages", authCheckAdmin, async (req, res) => {
    const msg = await Messages.findAll({ order: [['createdAt', 'DESC']] })
    res.render("dashboard/admin/messages", { auth, data, msg });
});
Router.get("/moreAnalytics", authCheckAdmin, async (req, res) => {
    const u = await User.count()
    const g = await Games.count()
    const sch = await Schedule.count()
    res.render("dashboard/admin/moreAnalytics", { auth, data, u, g, sch });
});
Router.get('/delUser/:id', authCheckAdmin, async (req, res) => {
    const userId = req.params.id

    User.destroy({ where: { id: userId } })
        .then((user) => {
            if (user) {
                var data = {
                    title: 'success'
                }
                return res.redirect('/manageUsers')
            }
            else {
                console.log("error");
            }
        })
        .catch(err => {
            console.log('Error:', err);
            return res.redirect('/mamageUsers')
        })

})

Router.post('/messages', async (req, res) => {
    try {
        const { email, fullname, address, message } = req.body;
        await Messages.create({
            name: fullname,
            email,
            message,
            address
        });
        var data = {
            title: 'success'
        };
        return res.json(data);
    } catch (error) {
        var data = {
            title: 'error',
            message: 'An error occurred while processing the request.'
        };
        return res.status(500).json(data);
    }
});

Router.post('/forgot-password', forwardAuthenticated, authCheck, async (req, res) => {
    var email = req.body.email

    const user = await User.findOne({ where: { email: email } })
    if (!user) {
        var data = {
            title: "no user"
        }
        return res.json(data)
    }

    var code = randomstring.generate(6)

    const sendEmail = {
        from: mailuser,
        to: user.email,
        subject: `Fun Olympics : Verification Code`,
        html: `
  <body style="padding: 0;margin: 0;box-sizing: border-box;font-family: &quot;Poppins&quot;, sans-serif;">
      <div>
          <table
              style="background: #f5f6f9;font-size: 14px;line-height: 22px;font-weight: 400;color: #56666D;width: 100%;text-align: center;padding-top: 30px;">
              <tr>
                  <td>
                      <table style="width: 96%;max-width: 620px;margin: 0 auto;background: #ffffff;padding: 40px;">
                          <tbody>
                              <tr>
                                  <td style="padding: 20px 0;">
                                      <a href="#" style="color: #C7271E;word-break: break-all;">
                                          <img class="logo-svg"
                                              src="https://www.procon.org/wp-content/uploads/olympic-rings-1-1024x680.jpeg"
                                              alt="" style="height: 40px;width: auto;">
                                      </a>
                                  </td>
                              </tr>
                              <tr>
                                  <td>
                                      <h2
                                          style="font-size: 18px;color: #0E9E49;font-weight: 600;margin: 0;line-height: 1.4;">
                                          New Message received</h2>
                                  </td>
                              </tr>
                              <tr>
                                  <td>
                                      <p>Hello, ${user.name}</p>
                                      <p>This is your verification code: ${code}.</p>
                                      
                                  </td>
                              </tr>
                              <tr>
                                  <td>
                                      <p style="margin-top: 40px;font-size: 12px;">If this message doesnot concern you then please kindely contact us.</p>
                                      <p style="margin: 0;font-size: 12px;line-height: 22px;color: #56666D;">This is
                                          an
                                          automatically generated email please do not
                                          reply to this
                                          email. If you face any issues, please contact us at support@funolympics.io
                                      </p>
                                  </td>
                              </tr>
                          </tbody>
                      </table>
                      <table style="width: 100%;max-width: 620px;margin: 0 auto;">
                          <tbody>
                              <tr>
                                  <td>
                                      <p style="font-size: 13px;margin-top: 30px;">
                                          Copyright
                                          © 2023 Fun Olympics. All rights
                                          reserved. <br>
                                      </p>
                                      <p>
                                          This email was sent to you as a registered member of
                                          <a href="https://marketplace.voicelife.io" style="color: #0E9E49;word-break: break-all;">Fun Olmpics</a>
                                      </p>
                                  </td>
                              </tr>
                          </tbody>
                      </table>
                  </td>
              </tr>
          </table>
      </div>
  </body>
  `,
    };
    client.sendMail(sendEmail, (err, info) => {
        if (err) {
            var data = {
                title: 'error'
            }
            return res.json('error')
        }
    });

    User.update({ code }, { where: { id: user.id } }).then(upUser => {
        if (upUser) {
            var data = {
                title: "success",
            };
            return res.json(data);
        } else {
            var data = {
                title: "error",
                type: type,
            };
            return res.json(data);
        }
    })
})

Router.get("/verify", forwardAuthenticated, authCheck, async (req, res) => {
    if (!req.query.email) {
        return res.send('invalid page');
    }
    const user = await User.findOne({ where: { email: req.query.email } })
    if (!user) {
        return res.send('Unauthorized!!!');
    }
    res.render("pages/verify.ejs", { auth, data, user, currentRoute: '' });
});

Router.post('/verify', forwardAuthenticated, async (req, res) => {
    const { email, code } = req.body

    var user = await User.findOne({ where: { email: email } })
    if (!user) {
        var data = {
            title: "error"
        }
        return res.json(data)
    }

    if (code != user.code) {
        var data = {
            title: "wrong code",
        }
        return res.json(data)
    }

    var data = {
        title: "success",
        redirect: `/reset?email=${user.email}&code=${user.code}`
    }
    return res.json(data)
})

Router.get("/reset", forwardAuthenticated, authCheck, async (req, res) => {

    let { email, code } = req.query;
    var user = await User.findOne({ where: { email } })
    if (!user) {
        return res.send('Unauthorized')
    }
    if (user.code != code) {
        return res.send('Unauthorized')
    }
    res.render('pages/reset.ejs', { auth, data, user, currentRoute: '' })
})

Router.post('/reset-password', forwardAuthenticated, async (req, res) => {
    let { pass, email } = req.body
    var salt = bcrypt.genSaltSync(10)
    const hash = await bcrypt.hash(pass, salt)

    var user = await User.findOne({ where: { email } })
    if (!user) {
        var data = {
            title: "error"
        }
        return res.json(data)
    }
    User.update({ password: hash, code: '' }, { where: { id: user.id } }).then((updatedUser) => {
        if (updatedUser) {
            var data = {
                title: 'success'
            }
            res.json(data)
        }
    }).catch(err => {
        var data = {
            title: 'error'
        }
        return res.json(data)
    })
})

Router.get("/user-suspend/:id", authCheckAdmin, async (req, res, next) => {

    User.findByPk(req.params.id)
        .then((user) => {
            if (user) {
                return User.update({
                    suspended: true
                }, { where: { id: user.id } })
                    .then(() => {
                        res.redirect("/manageUsers")
                    })
            } else {
                res.send(" Unknown Page")
            }
        })
        .catch(err => {
            console.log(err);
        })
})

//User unsuspend
Router.get("/user-unsuspend/:id", async (req, res, next) => {
    User.findByPk(req.params.id)
        .then((user) => {
            if (user) {
                return User.update(
                    { suspended: false },
                    { where: { id: user.id } },
                ).then(() => {
                    res.redirect("/manageUsers")
                });
            } else {
                res.send("This is a unknown page");
            }
        })
        .catch((err) => {
            console.log(err);
        });
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