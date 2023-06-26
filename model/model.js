const { Sequelize, DataTypes } = require("sequelize")
const db = require("./connection")


// 1. User
const User = db.define("user", {
    id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
    },
    name: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING
    },
    phone: {
        type: DataTypes.STRING
    },
    photo: {
        type: DataTypes.STRING,
        defaultValue: "img/default.png"
    },
    password: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: "user"
    },
    suspended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    code: {
        type: DataTypes.STRING
    }

})

// 2. Admin
const Admin = db.define("admin", {
    id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
    },
    name: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
    },
    password: {
        type: DataTypes.STRING,
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: "admin",
    },
    photo: {
        type: DataTypes.STRING,
        defaultValue: "img/default.png",
    },
});

// 3. News
const News = db.define("news", {
    id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
    },
    title: {
        type: DataTypes.STRING,
    },
    source: {
        type: DataTypes.STRING
    },
    image: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.TEXT
    },

})

//4. Games
const Games = db.define("games", {
    id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
    },
    title: {
        type: DataTypes.STRING,
    },
    image: {
        type: DataTypes.STRING
    },
})

//5. Videos
const Videos = db.define("videos", {
    id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
    },
    title: {
        type: DataTypes.STRING,
    },
    videoPath: {
        type: DataTypes.STRING
    },
})

// 6. schedule
const Schedule = db.define("schedule", {
    id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
    },
    title: {
        type: DataTypes.STRING,
    },
    gamesBetween: {
        type: DataTypes.STRING
    },
    date: {
        type: DataTypes.STRING
    },
    time: {
        type: DataTypes.TEXT
    },
})

//7. Photos
const Photos = db.define("photos", {
    id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
    },
    title: {
        type: DataTypes.STRING,
    },
    image: {
        type: DataTypes.STRING
    },
})

//8. Messages
const Messages = db.define("messages", {
    id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
    },
    name: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
    },
    phonenumber: {
        type: DataTypes.STRING,
    },
    message: {
        type: DataTypes.TEXT,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
});

// POSTS
// const Posts = db.define("posts",{
// })

//Associations
// Posts.belongsTo(User, {type: Sequelize.UUID} )


// db.sync({ alter: true })

module.exports = {
    User, Admin, Messages, News, Games, Videos, Schedule, Photos
}
