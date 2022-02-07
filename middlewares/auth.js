// 解析token 在postman中的Authorization type为 ： Basic Auth
// postman中的  Basic Auth ---- Username 参数传入一个token
const basicAuth = require('basic-auth')
const jwt = require('jsonwebtoken')

class Auth {
    constructor(level) {
        // 实例属性
        this.level = level || 1
        // 类常量 权限数字：越大权限越大
        Auth.USER = 8
        Auth.ADMIN = 16
        Auth.SUPER_ADMIN = 32
    }
    // 一个属性 m 验证token中间函数
    get m() {
        return async (ctx, next) => {
            const userToken = basicAuth(ctx.req)
            let errMsg = 'token不合法'
            // userToken: {
            //     name: token,
            //     pass: ''
            // }
            if (!userToken || !userToken.name) {
                throw new global.errs.Forbidden(errMsg)
            }
            try {
                var decode = jwt.verify(userToken.name, global.config.security.secretKey)
            } catch (error) {
                //token 不合法
                //token 过期
                if (error.name === 'TokenExpiredError') {
                    errMsg = 'token已过期'
                }
                throw new global.errs.Forbidden(errMsg)
            }
            // 权限控制 根据级别
            if (decode.scope < this.level) {
                errMsg = '权限不足'
                throw new global.errs.Forbidden(errMsg)
            }
            // token解析 数据存储
            ctx.auth = {
                uid: decode.uid,
                scope: decode.scope
            }
            await next()
        }
    }

    // token验证
    static verifyToken(token) {
        try {
            jwt.verify(token, global.config.security.secretKey)
            return true
        } catch (error) {
            return false
        }
    }
}

module.exports = {
    Auth
}