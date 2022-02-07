const { sequelize } = require('../core/db')
const { Sequelize, Model, Op } = require('sequelize')
const { Favor } = require('./favor')

class HotBook extends Model {
    // 获取所有书籍
    static async getAll() {
        const books = await HotBook.findAll({
            order: [
                'index'
            ]
        })
        const ids = []
        books.forEach(book => {
            ids.push(book.id)
        })
        // 还需要图书的点赞数量
        // in 查询找到所有 favor表中 art_id 在ids 中的数据
        const favors = await Favor.findAll({
            where: {
                type: 400,
                art_id: {
                    [Op.in]: ids
                }
            },
            group: ['art_id'], //按照art_id分组 art_id1: [{},{}..], art_id2: [{},{}..]
            attributes: ['art_id', [Sequelize.fn('COUNT', '*'), 'count']]
        })
        console.log(favors)
        // { art_id: 2, count: 1 },
        // 遍历所有书籍加上 count 字段
        books.forEach(book => {
            HotBook._getEachBooksStatus(book, favors)
        })
        return books
    }
    static _getEachBooksStatus(book, favors) {
        let count = 0
        favors.forEach(favor => {
            // 点赞的总量art_id = 书籍的id时
            if (book.id === favor.art_id) {
                count = favor.get('count')
            }
        })
        book.setDataValue('count', count)
        return book
    }
}

HotBook.init({
    index: Sequelize.INTEGER,
    image: Sequelize.STRING,
    author: Sequelize.STRING,
    title: Sequelize.STRING,
}, {
    sequelize
})

module.exports = {
    HotBook
}