const { sequelize } = require('../core/db')
const { Sequelize, Model } = require('sequelize')

const classicFields = {
    image: Sequelize.STRING,
    content: Sequelize.STRING,
    pubdate: Sequelize.DATEONLY,
    fav_nums: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    title: Sequelize.STRING,
    type: Sequelize.TINYINT
}

class Movie extends Model {

}

Movie.init(classicFields, {
    sequelize,
})

class Sentence extends Model {

}

Sentence.init(classicFields, {
    sequelize,
})

class Music extends Model {

}

Music.init(Object.assign({ url: Sequelize.STRING }, classicFields), {
    sequelize,
})

module.exports = {
    Music,
    Sentence,
    Movie
}