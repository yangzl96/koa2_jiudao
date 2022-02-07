const { LinValidator, Rule } = require('../core/lin-validator-v2')
const { User } = require('../models/user')
const { LoginType, ArtType } = require('../lib/enum')

// 正整数
class PositiveIntegerValidator extends LinValidator {
    constructor() {
        super()
        this.id = [
            new Rule('isInt', '需要正整数', { min: 1 })
        ]
    }
}

// 注册验证
class RegisterValidator extends LinValidator {
    constructor() {
        super()
        this.email = [
            new Rule('isEmail', '不符合Email规范')
        ]
        this.password1 = [
            new Rule('isLength', '密码至少6个字符，至多32个字符', {
                min: 6,
                max: 32
            }),
            // 密码复杂度
            new Rule('matches', '密码长度必须在6~22位之间，包含字符、数字和 _ ', '^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]')
        ]
        this.password2 = this.password1
        this.nickname = [
            new Rule('isLength', '昵称不符合长度规范', {
                min: 4,
                max: 32
            })
        ]
    }
    // 自定义函数必须以validate开头
    validatePassword(vals) {
        const psw1 = vals.body.password1
        const psw2 = vals.body.password2
        if (psw1 !== psw2) {
            throw new Error('两个密码必须相等')
        }
    }
    // email不能重复
    // 考虑存在异步 使用lin-validator v2版本
    async validateEmail(vals) {
        const email = vals.body.email
        const user = await User.findOne({
            where: {
                email
            }
        })
        if (user) {
            throw new Error('email已存在')
        }
    }
}

// token验证
class TokenValidator extends LinValidator {
    constructor() {
        super()
        this.account = [
            new Rule('isLength', '不符合账号规则', {
                min: 4,
                max: 32
            })
        ]
        // secret 可传可不传
        this.secret = [
            // isOptional： 标记存在不传也没问题，传了就要按照isOptional后面的验证规则
            new Rule('isOptional'),
            new Rule('isLength', '至少6个字符', {
                min: 6,
                max: 128
            })
        ]
    }
    // 登录类型
    validateLoginType(vals) {
        if (!vals.body.type) {
            throw new Error('type是必填参数')
        }
        if (!LoginType.inThisType(vals.body.type)) {
            throw new Error('type参数不合法')
        }
    }
}

// 不允许为空
class NotEmptyValidator extends LinValidator {
    constructor() {
        super()
        this.token = [
            new Rule('isLength', '不允许为空', { min: 1 })
        ]
    }
}

function checkArtType(vals) {
    let type = vals.body.type || vals.path.type
    if (!type) {
        throw new Error('type是必填参数')
    }
    type = parseInt(type)
    if (!ArtType.inThisType(type)) {
        throw new Error('type参数不合法')
    }
}

class Checker {
    constructor(type) {
        this.enumType = type
    }
    check(vals) {
        let type = vals.body.type || vals.path.type
        if (!type) {
            throw new Error('type是必填参数')
        }
        type = parseInt(type)
        if (!this.enumType.inThisType(type)) {
            throw new Error('type参数不合法')
        }
    }
}


// 继承复用 PositiveIntegerValidator校验的是id 因为我们传了 第二个参数 { id: 'art_id' } 所以可以验证
class LikeValidator extends PositiveIntegerValidator {
    constructor() {
        super()
        // 解决方式一 使用类
        // const checker = new Checker(ArtType)
        // // 这里需要改变This指向
        // this.validateType = checker.check.bind(checker)
        // 方式二 再定义一个方法
        this.validateType = checkArtType
    }
}

class ClassicValidator extends LikeValidator {

}

// 搜索校验
class SearchValidator extends LinValidator {
    constructor() {
        super()
        this.q = [
            new Rule('isLength', '搜索关键词不能为空', {
                min: 1,
                max: 16
            })
        ]
        // 分页的值 校验 start:从多少条开始查 count:查多少条
        this.start = [
            new Rule('isInt', '不符合规范', {
                min: 0,
                max: 60000
            }),
            // 设置默认值
            new Rule('isOptional', '', 0)
        ]
        this.count = [
            new Rule('isInt', '不符合规范', {
                min: 1,
                max: 20
            }),
            // 设置默认值
            new Rule('isOptional', '', 20)
        ]
    }
}

// 短评检验
class AddShortCommentValidator extends PositiveIntegerValidator {
    constructor() {
        super()
        this.content = [
            new Rule('isLength', '必须在1到12个字符之间', {
                min: 1,
                max: 12
            })
        ]
    }
}

module.exports = {
    RegisterValidator,
    TokenValidator,
    NotEmptyValidator,
    PositiveIntegerValidator,
    LikeValidator,
    ClassicValidator,
    SearchValidator,
    AddShortCommentValidator
}