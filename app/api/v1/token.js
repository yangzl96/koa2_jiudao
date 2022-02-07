const Router = require('koa-router')
const { TokenValidator, NotEmptyValidator } = require('../../../validators/validators')
const { LoginType } = require('../../../lib/enum')
const { User } = require('../../../models/user')
const { Auth } = require('../../../middlewares/auth')
const { generateToken } = require('../../../core/util')
const { WXManager } = require('../../../services/wx')

const router = new Router({
    prefix: '/v1/token'
})

// 获取token
router.post('/', async (ctx) => {
    const v = await new TokenValidator().validate(ctx)
    let token
    switch (v.get('body.type')) {
        case LoginType.USER_MAIL:
            token = await emailLogin(v.get('body.account'), v.get('body.secret'))
            break;
        case LoginType.USER_MINI_PROGRAM:
            token = await WXManager.codeToToken(v.get('body.account'))
            break;
        case LoginType.ADMIN_EMAIL:
            break;
        default:
            throw new global.errs.ParameterException('没有相应的处理函数')
    }
    ctx.body = {
        token
    }
})

// 验证token
router.post('/verify', async (ctx, next) => {
    const v = await new NotEmptyValidator().validate(ctx)
    const result = Auth.verifyToken(v.get('body.token'))
    ctx.body = {
        result
    }
})

async function emailLogin(account, secret) {
    const user = await User.verifyEmailPassword(account, secret)
    // generateToken id scope: 用户分类、令牌权限
    return token = generateToken(user.id, Auth.USER)
}

module.exports = router