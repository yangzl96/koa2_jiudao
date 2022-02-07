const bcrypt = require('bcryptjs')
const { sequelize } = require('../core/db')
const { Sequelize, Model } = require('sequelize')

class User extends Model {
    static async verifyEmailPassword(email, plainPassword) {
        // 查询用户
        const user = await User.findOne({
            where: {
                email
            }
        })
        if (!user) {
            throw new global.errs.AuthFailed('账号不存在')
        }
        // 验证密码
        const correct = bcrypt.compareSync(plainPassword, user.password)
        if (!correct) {
            throw new global.errs.AuthFailed('密码不正确')
        }
        return user

    }

    static async getUserByOpenid(openid) {
        const user = await User.findOne({
            where: {
                openid
            }
        })
        return user
    }

    static async registerByOpenid(openid) {
        const user = await User.create({
            openid
        })
        return user
    }
}

User.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nickname: Sequelize.STRING,
    email: {
        type: Sequelize.STRING,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        set(val) {
            // 位数、成本
            const salt = bcrypt.genSaltSync(10)
            const psw = bcrypt.hashSync(val, salt)
            this.setDataValue('password', psw)
        }

    },
    openid: {
        type: Sequelize.STRING(64),
        unique: true
    }
}, {
    sequelize
})

module.exports = {
    User
}