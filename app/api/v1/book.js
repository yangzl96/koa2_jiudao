const Router = require('koa-router')
const { Book } = require('../../../models/book')
const { PositiveIntegerValidator, SearchValidator, AddShortCommentValidator } = require('../../../validators/validators')
const { HotBook } = require('../../../models/hot-book')
const { Auth } = require('../../../middlewares/auth')
const { Favor } = require('../../../models/favor')
const { Comment } = require('../../../models/book-comment')
const { success } = require('../../../lib/help')
const router = new Router({
    prefix: '/v1/book'
})


// 图书的基础服务 由外部服务来提供
// 数据量太大，不存储在本地数据库，本地只存储图书的业务数据

router.get('/hot_list', async ctx => {
    const books = await HotBook.getAll()
    ctx.body = {
        books
    }
})

// 书籍详情
router.get('/:id/detail', async ctx => {
    const v = await new PositiveIntegerValidator().validate(ctx)
    const id = v.get('path.id')
    const book = await new Book(id)
    ctx.body = book.detail()
})

// 搜索
router.get('/search', async ctx => {
    const v = await new SearchValidator().validate(ctx)
    const search = await Book.searchFromYuShu(v.get('query.q'), v.get('query.start'), v.get('query.count'))
    ctx.body = search
})

// 喜欢的书籍数量
router.get('/favor/count', new Auth().m, async ctx => {
    const count = await Book.getMyFavorBookCount(ctx.auth.uid)
    ctx.body = {
        count
    }
})

// 获取每本书籍点赞的情况
router.get('/:book_id/favor', new Auth().m, async ctx => {
    const v = await new PositiveIntegerValidator().validate(ctx, {
        // 设置验证时候的别名
        id: 'book_id'
    })
    const favor = await Favor.getBookFavor(ctx.auth.uid, v.get('path.book_id'))
    ctx.body = favor
})

// 新增短评
router.post('/add/short_comment', new Auth().m, async ctx => {
    const v = await new AddShortCommentValidator().validate(ctx, {
        // 校验id号 别名
        id: 'book_id'
    })
    Comment.addComment(v.get('body.book_id'), v.get('body.content'))
    success()

})

// 获取短评
router.get('/:book_id/short_comment', new Auth().m, async ctx => {
    const v = await new PositiveIntegerValidator().validate(ctx, {
        // 设置验证时候的别名
        id: 'book_id'
    })
    const comment = await Comment.getComment(v.get('path.book_id'))
    ctx.body = comment
})

module.exports = router