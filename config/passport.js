const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcryptjs")

const { User, Admin } = require("../model/model")

module.exports = function (passport) {
    passport.use(
        "user-login",
        new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
            // Match our user
            User.findAll({ where: { email: email } })
                .then((users) => {
                    if (!users[0]) {
                        Admin.findAll({ where: { email: email } })
                            .then((admin) => {
                                if (!admin[0]) {
                                    var err = "no user";
                                    done(err)
                                } else {
                                    bcrypt.compare(password, admin[0].dataValues.password, (err, isMatch) => {
                                        if (err) console.log(err)
                                        if (isMatch) {
                                            return done(null, admin[0].dataValues)
                                        } else {
                                            var err = "password"
                                            done(err)
                                        }
                                    })
                                }
                            }).catch((err) => {
                                var err = "error"
                                done(err)
                            });
                    } else {
                        bcrypt.compare(password, users[0].dataValues.password, (err, isMatch) => {
                            if (err) console.log(err);
                            if (isMatch) {
                                return done(null, users[0].dataValues)
                            } else {
                                var err = "password"
                                done(err)
                            }
                        })
                    }
                })
                .catch((err) => {
                    done(err)
                });
        })
    );

    passport.serializeUser(function (user, done) {
        return done(null, user)
    })

    passport.deserializeUser(async function (user, done) {
        const vUser = await User.findByPk(user.id)
        const admin = await Admin.findByPk(user.id)
        try {
            if (vUser) return done(null, vUser)
            if (admin) return done(null, admin)

        } catch (error) {
            console.log(error);
        }
    })



}