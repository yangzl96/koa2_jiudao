module.exports = {
    mode: 'dev',
    database: {
        dbName: 'jiudao',
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '123456'
    },
    security: {
        secretKey: 'abcdefg',
        expiresIn: 60 * 60 * 24
    },
    //小程序配置
    wx: {
        appID: 'wx60fd844699773e15',
        appSecret: '00ace027d1b3a9f7e33f6e263771e835',
        // 地址中的参数 用 %s 占位
        loginUrl: 'https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code'
    },
    yushu: {
        detailUrl: 'http://t.yushu.im/v2/bood/id/%s',
        keywordUrl: 'http://t.yushu.im/v2/bood/search?q=%s&count=%s&start=%s&summary=%s'
    }
}