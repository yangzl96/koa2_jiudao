const { sequelize } = require('../core/db')
const { Sequelize, Model } = require('sequelize')

class Flow extends Model {

}

Flow.init({
    index: Sequelize.INTEGER,
    art_id: Sequelize.INTEGER,
    type: Sequelize.INTEGER

    // art_id + type 就可以定位某一个表中的一条数据
    // type: 100 Movie
    // type: 200 Music
    // type: 300 Sentence

}, {
    sequelize,
})

module.exports = {
    Flow
}