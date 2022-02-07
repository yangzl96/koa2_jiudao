const util = require('util')
const axios = require('axios')
const { User } = require('../models/user')
const { Auth } = require('../middlewares/auth')
const { generateToken } = require('../core/util')
class WXManager {
    static async codeToToken(code) {
        // code 前端获取
        // 用 code、appid、appsecret 去请求微信服务器 换取 openid
        const url = util.format(
            global.config.wx.loginUrl,
            global.config.wx.appID,
            global.config.wx.appSecret,
            code
        )
        const result = await axios.get(url)
        if (result.status !== 200) {
            throw new global.errs.AuthFailed('oppenid获取失败')
        }
        const errcode = result.data.errcode
        const errmsg = result.data.errmsg
        if (errcode) {
            throw new global.errs.AuthFailed('oppenid获取失败:' + errmsg)
        }
        // openid
        let user = await User.getUserByOpenid(result.data.openid)
        if (!user) { //没有就存入openid
            user = await User.registerByOpenid(result.data.openid)
        }
        return generateToken(user.id, Auth.USER)
    }
}

module.exports = {
    WXManager
}