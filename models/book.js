const { sequelize } = require('../core/db')
const { Sequelize, Model } = require('sequelize')
const axios = require('axios')
const util = require('util')
const { Favor } = require('./favor')

class Book extends Model {
    constructor(id) {
        super()
        this.id = id
    }
    // 书籍详情
    async detail() {
        // util.format 给url传值 对应 %s
        const url = util.format(global.config.yushu.detailUrl, this.id)
        const detail = await axios.get(url)
        return detail.data
    }
    // 搜索书籍 summary获取概要即可
    static async searchFromYuShu(q, start, count, summary = 1) {
        const url = util.format(global.config.yushu.keywordUrl, encodeURI(q), start, count, summary)
        console.log(q, start, count)
        const search = await axios.get(url)
        return search.data
    }
    // 获取我喜欢的书籍数量
    static async getMyFavorBookCount(uid) {
        const count = await Favor.count({
            where: {
                type: 400,
                uid
            }
        })
        return count
    }
}

Book.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    fav_nums: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
}, {
    sequelize
})

module.exports = {
    Book
}