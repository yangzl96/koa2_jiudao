// music sentence book movic 合称为 art 
const { parse } = require('basic-auth')
const { Op } = require('sequelize')
const { flatten } = require('lodash')
const { Movie, Music, Sentence } = require('./classic')
class Art {

    constructor(art_id, type) {
        this.art_id = art_id
        this.type = type
    }

    async getDetail(uid) {
        // 在使用时导入 避免循环引用
        const { Favor } = require('./favor')
        const art = await Art.getData(this.art_id, this.type)
        if (!art) {
            throw new global.errs.NotFound()
        }
        const like_status = await Favor.userLikeIt(this.art_id, this.type, uid)
        return {
            art,
            like_status
        }
    }

    static async getData(art_id, type, useScope = true) {
        let art = null
        const finder = {
            where: {
                id: art_id
            }
        }
        const scope = useScope ? 'bh' : null
        switch (type) {
            case 100:
                art = await Movie.scope(scope).findOne(finder)
                break;
            case 200:
                art = await Music.scope(scope).findOne(finder)

                break;
            case 300:
                art = await Sentence.scope(scope).findOne(finder)

                break;
            case 400:

                break;

            default:
                break;
        }
        return art
    }
    // 获取多个实体详情
    static async getList(artInfoList) {
        // [ids] art有3种类型 3次in查询
        // 三种类型的type
        const artInfoObj = {
            100: [],
            200: [],
            300: []
        }
        for (let artInfo of artInfoList) {
            // 将对应type的art_id放入对应数组中去
            artInfoObj[artInfo.type].push(artInfo.art_id)
        }
        const arts = []
        for (let key in artInfoObj) {
            const ids = artInfoObj[key]
            if (ids.length === 0) {
                continue
            }
            key = parseInt(key)
            arts.push(await Art._getListByType(ids, key))
        }
        // 数组扁平化
        return flatten(arts)
    }
    static async _getListByType(ids, type) {
        let arts = null
        const finder = {
            where: {
                id: { //in 查询
                    [Op.in]: ids //接受一个数组
                }
            }
        }
        const scope = 'bh'
        switch (type) {
            case 100:
                arts = await Movie.scope(scope).findAll(finder)
                break;
            case 200:
                arts = await Music.scope(scope).findAll(finder)
                break;
            case 300:
                arts = await Sentence.scope(scope).findAll(finder)
                break;
            case 400:
                break;
            default:
                break;
        }
        return arts
    }
}

module.exports = {
    Art
}