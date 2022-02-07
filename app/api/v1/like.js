const Router = require('koa-router')
const { Auth } = require('../../../middlewares/auth')
const { Favor } = require('../../../models/favor')
const { LikeValidator } = require('../../../validators/validators')
const { success } = require('../../../lib/help')

const router = new Router({
    prefix: '/v1/like'
})

// 点赞 
router.post('/', new Auth().m, async (ctx, next) => {
    // { id: 'art_id' } 设置别名
    const v = await new LikeValidator().validate(ctx, { id: 'art_id' })
    // uid 不显式传递，会被伪造 前端不要传了
    await Favor.like(v.get('body.art_id'), v.get('body.type'), ctx.auth.uid)
    success()
})

// 取消点赞
router.post('/cancel', new Auth().m, async (ctx, next) => {
    const v = await new LikeValidator().validate(ctx, { id: 'art_id' })
    await Favor.dislike(v.get('body.art_id'), v.get('body.type'), ctx.auth.uid)
    success()
})

module.exports = router