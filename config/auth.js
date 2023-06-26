module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/register');
    },
    forwardAuthenticated: function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next()
        }
        res.redirect('/')
    },
    adminAuthenticated: function (req, res, next) {
        if (req.isAuthenticated() && req.user.name === "Admin") {
            return next()
        }
        res.redirect('/')
    }
}


