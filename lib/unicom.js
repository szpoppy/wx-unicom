/**
 * require 引入 js <unicom>
 * 组件使用 这个命令 behaviors: [unicom.behavior],
 * 页面 在 onLoad 中，使用 函数 unicom.pageInit(this[, id]);  id为页面标识
 * 组件和页面中，都可以使用 unicom: {message: function(...args){}}来接受消息
 * 发送消息使用 unicom.send("message#id1,id2", ...args);  #后面的为组件或者页面id，发送到指定页面
 * + [2018-11-24] 可以重写Page和Component达到全局启用unicom
 */
// 自动生成unicomId起始数字
var indexStart = parseInt(String(new Date().getTime()).slice(-6));
// 全部组件对象集合
var compons = {};
var componsUnicom = {};

// 是否已经被重写
var isRewrite = false;

// 返回的
var unicom = {};

// 创建一个unicomId
function createId() {
    var id;
    do {
        indexStart += Math.round(Math.random() * 1000) + Math.round(Math.random() * 1000);
        id = "uni" + indexStart.toString(36);
    } while (compons[id])
    return id;
}

// 发送数据
var lastSender;

function sendOne(method, that, args) {
    if (!method || !that) {
        return;
    }
    let thatUnicom = that.unicom;
    var unicomMsg = componsUnicom[thatUnicom.id];
    if (!unicomMsg || !unicomMsg[method]) {
        return;
    }
    thatUnicom.sender = lastSender;
    var fn = unicomMsg[method];
    fn && fn.apply(that, args);
}

function sendData() {
    var args = Array.prototype.slice.call(arguments);
    var to = args.shift();
    var ids = "";
    var to = to.replace(/#([\w,]+)$/, function (s0, s1) {
        ids = s1;
        return "";
    });
    lastSender = this.$vm;
    if (ids) {
        ids.split(",").forEach(function (id) {
            // 指定ID
            sendOne(to, compons[id], args);
        })
        return;
    }
    // 广播
    for (var n in compons) {
        sendOne(to, compons[n], args);
    }
}

// 初始化 unicom
function initCompon(that, id, _id, methods) {
    if (id && compons[id]) {
        console.error("unicomId 冲突[" + id + "]");
        return false;
    }
    if (!id) {
        id = _id;
    }
    that.unicom = {
        $vm: that,
        // 自动以id
        cusId: id,
        // 生成的id
        id: _id,
        send: sendData,
        methods: methods
    };

    compons[id] = that;
    if (methods) {
        componsUnicom[_id] = methods;
    }
    return id;
}

// 将Page加入到 unicom
function pageInit(that, id) {
    var _id = createId();
    if (initCompon(that, id || that.unicomId, _id, that.unicom)) {
        var _onUnload = that.onUnload;
        that.onUnload = function () {
            // 销毁
            delete compons[id];
            delete componsUnicom[_id];
            delete this.unicom;
            _onUnload && _onUnload.apply(this, arguments);
        }
    }
}
unicom.pageInit = function (page, id) {
    if (isRewrite) {
        return;
    }
    pageInit(page, id);
}
// 发"送请求
unicom.send = sendData;

// 组件内 注册 unicom
function getBehavior() {
    var _id = createId();
    var id;
    return Behavior({
        properties: {
            unicomId: {
                type: String,
                value: ""
            }
        },
        definitionFilter: function (defFields) {
            componsUnicom[_id] = defFields.unicom;
        },
        lifetimes: {
            attached: function () {
                id = initCompon(this, this.properties.unicomId, _id);
            },
            detached: function () {
                delete compons[id];
                delete componsUnicom[_id];
                delete this.unicom;
            }
        }
    })
}
Object.defineProperty(unicom, "behavior", {
    get: function () {
        if (isRewrite) {
            // 已经被重写，不需要注册
            return Behavior({});
        }
        return getBehavior();
    }
});

// 这个函数是用来复写Page 和 Component的
// 使得每个Page和Component都存在 unicom
unicom.rewrite = function () {
    if (isRewrite) {
        // 防止重写多次
        return;
    }
    isRewrite = true;
    // 重写Page
    var _Page = Page;
    Page = function (options) {
        var _onLoad = options.onLoad;
        options.onLoad = function () {
            pageInit(this);
            if (_onLoad) {
                _onLoad.apply(this, arguments);
            }
        }
        return _Page.apply(this, arguments);
    }
    // 重写 Component
    var _Component = Component;
    Component = function (options) {
        if (!options.behaviors) {
            options.behaviors = [];
        }
        options.behaviors.push(getBehavior());
        return _Component.apply(this, arguments);
    }
}

unicom.$vm = unicom;

module.exports = unicom