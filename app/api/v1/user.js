const Router = require('koa-router')
const { RegisterValidator } = require('../../../validators/validators')
const { User } = require('../../../models/user')
const { success } = require('../../../lib/help')

const router = new Router({
    prefix: '/v1/user'
})


// 注册
router.post('/register', async (ctx) => {
    console.log(ctx.request.body)
    const v = await new RegisterValidator().validate(ctx)
  
    const user = {
        email: v.get('body.email'),
        password: v.get('body.password2'),
        nickname: v.get('body.nickname')
    }
    await User.create(user)
    success()
})

module.exports = router

