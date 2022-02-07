const { Sequelize, Model } = require('sequelize')
const { unset, clone, isArray } = require('lodash')
const {
    dbName,
    host,
    port,
    user,
    password
} = require('../config/config').database

const sequelize = new Sequelize(dbName, user, password, {
    dialect: 'mysql',
    host,
    port,
    timezone: '+08:00', // 北京时间
    define: {
        // create_time && update_time
        timestamps: true,
        // delete_time
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        underscored: true,
        // 全局的scopes
        scopes: {
            bh: { //自定义属性
                attributes: {
                    // 需要的地方使用 将排除这三个字段
                    exclude: ['updated_at', 'deleted_at', 'created_at']
                }
            }
        }
    }
})

sequelize.sync({ force: false })

// 在返回数据的时候做拦截
// 前面的scope 和 在类上定义toJSON 都是用来解决除去非必要参数的 但是缺点就是每个类上都要去定义
// 所以直接找到基类Model，在上面去定义
// 也就是拦截器
Model.prototype.toJSON = function () {
    let data = clone(this.dataValues)

    // this.exclude 每个模型在返回数据的时候都会  只要定义了exclude就能使用到
    if (isArray(this.exclude)) {
        this.exclude.forEach((value) => {
            unset(data, value)
        })
    }
    // 使用时
    // 比如返回的数据是art是个json
    // Art.exlcude('index', 'like_status')
    return data
}

module.exports = {
    sequelize
}