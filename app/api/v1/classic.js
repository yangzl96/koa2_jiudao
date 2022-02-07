const Router = require('koa-router')
const { Auth } = require('../../../middlewares/auth')
const { Art } = require('../../../models/arts')
const { Favor } = require('../../../models/favor')
const { Flow } = require('../../../models/flow')
const { HotBook } = require('../../../models/hot-book')
const { Book } = require('../../../models/book')
const { PositiveIntegerValidator, ClassicValidator } = require('../../../validators/validators')
const router = new Router({
    prefix: '/v1/classic'
})

// new Auth(9) 传权限级别
// 获取最新一期
router.get('/latest', new Auth().m, async (ctx, next) => {
    const flow = await Flow.findOne({
        order: [
            [
                'index', 'DESC'
            ]
        ]
    })
    const art = await Art.getData(flow.art_id, flow.type)
    const likestatus = await Favor.userLikeIt(
        flow.art_id, flow.type, ctx.auth.uid
    )
    // 模型属性修改 不建议
    // art.dataValues.index = flow.index
    // 使用内置语法
    art.setDataValue('index', flow.index)
    art.setDataValue('like_status', likestatus)
    await Book.create({
        id: 1,
    })
    // await HotBook.create({
    //     status: 1,
    //     index: 2,
    //     image: '图书图片2',
    //     author: '保罗2',
    //     title: '黑客2',
    //     created_at: '2021-06-03 17:02:14',
    //     updated_at: '2021-06-03 17:02:14'
    // })
    // await Favor.create({
    //     uid: 1,
    //     art_id: 2,
    //     type: 400,
    //     created_at: '2021-06-03 17:02:14',
    //     updated_at: '2021-06-03 17:02:14'
    // })
    // await Movie.create({
    //     image: 'tupian3',
    //     content: '内容3',
    //     pubdate: '2021-06-03',
    //     fav_nums: 130,
    //     title: '标题3',
    //     type: 100,
    //     created_at: '2021-06-03 17:02:14',
    //     updated_at: '2021-06-03 17:02:14'
    // })
    // await Flow.create({
    //     index: 9,
    //     art_id: 3,
    //     type: 100,
    //     created_at: '2021-06-03 17:02:14',
    //     updated_at: '2021-06-03 17:02:14'
    // })
    ctx.body = art
})
// 获取下一期
router.get('/:index/next', new Auth().m, async (ctx, next) => {
    const v = await new PositiveIntegerValidator().validate(ctx, {
        id: 'index'
    })
    const index = v.get('path.index')
    const flow = await Flow.findOne({
        where: {
            index: index + 1
        }
    })
    if (!flow) {
        throw new global.errs.NotFound()
    }
    const art = await Art.getData(flow.art_id, flow.type)
    const likestatus = await Favor.userLikeIt(flow.art_id, flow.type, ctx.auth.uid)
    art.setDataValue('like_status', likestatus)
    art.setDataValue('index', flow.index)
    ctx.body = art
})

// 获取上一期
router.get('/:index/previous', new Auth().m, async (ctx, next) => {

})

// 获取期刊点赞情况
router.get('/:type/:id/favor', new Auth().m, async ctx => {
    const v = await new ClassicValidator().validate(ctx)
    const id = v.get('path.id')
    const type = parseInt(v.get('path.type'))
    const artDetail = await new Art(id, type).getDetail(ctx.auth.uid)
    ctx.body = {
        fav_nums: artDetail.art.fav_nums,
        like_status: artDetail.like_status
    }
})

// 获取期刊详情
router.get('/:type/:id', new Auth().m, async ctx => {
    const v = await new ClassicValidator().validate(ctx)
    const id = v.get('path.id')
    const type = parseInt(v.get('path.type'))
    const artDetail = await new Art(id, type).getDetail(ctx.auth.uid)
    artDetail.art.setDataValue('like_status', artDetail.like_status)
    ctx.body = artDetail.art
})

// 查询某个用户的点赞期刊
router.get('/favor', new Auth().m, async ctx => {
    const uid = ctx.auth.uid
    ctx.body = await Favor.getMyClassicFavors(uid)
})

module.exports = router