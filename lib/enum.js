
function inThisType(val) {
    for (let key in this) {
        if (this[key] == val) {
            return true
        }
    }
    return false
}

const LoginType = { //登录方式
    USER_MINI_PROGRAM: 100,
    USER_MAIL: 101,
    USER_MOBILE: 102,
    inThisType
}

const ArtType = {
    MOVIE: 100,
    MUSIC: 200,
    SENTENCE: 300,
    BOOK: 400,
    inThisType
}

module.exports = {
    LoginType,
    ArtType
}