const { sequelize } = require('../core/db')
const { Sequelize, Model, Op, CITEXT } = require('sequelize')
const { Art } = require('../models/arts')
// 业务表: 一个用户是否对某一个期刊点赞了
class Favor extends Model {
    // 点赞
    static async like(art_id, type, uid) {
        // 1.添加记录
        // 2. classic 中的 fav_nums + 1
        // 使用事务实现数据的一致性
        const favor = await Favor.findOne({
            where: {
                art_id,
                type,
                uid
            }
        })
        if (favor) {
            // 已经点过赞
            throw new global.errs.LikeError()
        }
        // 事务
        return sequelize.transaction(async t => {
            await Favor.create({
                art_id,
                type,
                uid
            }, { transaction: t })
            const art = await Art.getData(art_id, type, false)
            await art.increment('fav_nums', { by: 1, transaction: t })
        })
    }
    // 取消点赞
    static async dislike(art_id, type, uid) {
        const favor = await Favor.findOne({
            where: {
                art_id,
                type,
                uid
            }
        })
        if (!favor) {
            throw new global.errs.DislikeError()
        }
        return sequelize.transaction(async t => {
            // 查询出来的 favor 进行 destory 删出一条记录
            // 注意 transaction 的传递位置
            await favor.destroy({
                force: true, // 软删除
                transaction: t
            })
            const art = await Art.getData(art_id, type, false)
            await art.decrement('fav_nums', { by: 1, transaction: t })
        })
    }
    // 用户是否点赞
    static async userLikeIt(art_id, type, uid) {
        const favor = await Favor.findOne({
            where: {
                art_id,
                type,
                uid
            }
        })
        return !!favor;
    }
    // 用户点赞的期刊 不包含书籍type：400
    static async getMyClassicFavors(uid) {
        const arts = await Favor.findAll({
            where: {
                uid,
                type: {
                    [Op.not]: 400
                }
            }
        })
        if (!arts) {
            throw new global.errs.NotFound()
        }
        // console.log(arts);
        // return arts
        // 查询点赞列表的详情
        // 不要循环查询数据库 不可控
        // for(let art of atrs) {
        //     Art.getData()
        // }
        // 用到sequelize中的 in查询 直接查询一个数组
        return await Art.getList(arts)
    }
    // 获取每本书籍点赞的情况
    static async getBookFavor(uid, bookID) {
        // 该书籍的点赞数量
        const favorNums = await Favor.count({
            where: {
                art_id: bookID,
                type: 400
            }
        })
        // 查找我是否点赞该书籍
        const myFavor = await Favor.findOne({
            where: {
                uid,
                art_id: bookID,
                type: 400
            }
        })
        return {
            fav_nums: favorNums,
            like_status: myFavor ? 1 : 0
        }
    }
}

Favor.init({
    uid: Sequelize.INTEGER,
    art_id: Sequelize.INTEGER,
    type: Sequelize.INTEGER,
}, {
    sequelize
})

module.exports = {
    Favor
}