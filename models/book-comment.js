const { sequelize } = require('../core/db')
const { Sequelize, Model } = require('sequelize')

class Comment extends Model {
    // 新增评论
    static async addComment(bookID, content) {
        console.log(bookID);
        console.log(content);
        // 点赞 + 1 和 新增评论(相同的评论就 + 1)
        const comment = await Comment.findOne({
            where: {
                book_id: bookID,
                content
            }
        })
        if (!comment) { //不存在  则新增
            return await Comment.create({
                book_id: bookID,
                content,
                nums: 1
            })
        } else {
            return await comment.increment('nums', {
                by: 1
            })
        }
    }
    // 查询短评
    static async getComment(bookID) {
        const comments = await Comment.findAll({
            where: {
                book_id: bookID
            }
        })
        return comments
    }
    // 前面排除created_at updated_at 是通过查询的时候 使用全局的scope
    //  现在使用json序列化来处理 toJSON
    // let obj = {
    //     name:'1',
    //     toJSON: function() {
    //         return {
    //             age:12
    //         }
    //     }
    // }
    // stringify后 得到的是toJSON的结果
    // ctx.body 在返回的时候做了序列化操作 所以可以在返回一个模型数据的时候拿到json
    // 那么在基类上也就是Comment上定义toJSON 就可以控制模型在序列化时的返回值了
    // toJSON() { //不可接受参数
    //     return {
    //         comment: this.getDataValue('content'),
    //         nums: this.getDataValue('nums')
    //     }
    // }
}

// 对于返回一个数组类型的对象 需要排除对象中的字段
// Comment.prototype.exclude = ['book_id', 'id']

Comment.init({
    content: Sequelize.STRING,
    nums: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    book_id: Sequelize.INTEGER
}, {
    sequelize
})

module.exports = {
    Comment
}