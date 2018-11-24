

<p align="center">
   <a href="https://www.npmjs.com/package/wx-unicom">
   		<img src="https://img.shields.io/npm/v/vue-unicom.svg?style=flat" alt="npm">
   </a>
   <a href="https://www.npmjs.com/package/wx-unicom">
   		<img src="https://img.shields.io/npm/dm/wx-unicom.svg?style=flat" alt="npm">
   </a>
</p>

## vue-unicom

wx-unicom是一个微信小程序的一个组件。解决了微信小程序中组件以及页面之间通讯的痛点。利用事件总线原理，实现了任意Component和Page之间的通讯。


## 更新日志
* 目的，提供微信小程序 全局的转发机制
* [2018-11-24] 发布1.0.0

## 功能

- 任意Component和Page之间的通讯
- 全局注册机制（重写Page和Component）
- 局部注册机制，需要在Page和Component钩子函数中初始化

## 获取wx-unicom
- npm install wx-unicom
- github下载zip包，找到unicom.js，直接通过require引入页面或者组件

## 全局注册机制
````javascript
// app.js中，如果不支持，直接下载下来引入
var unicom = require("wx-unicom");
// 下面这个函数将重写 Page 和 Component
// 注：全局机制注册后，所有局部注册将失效
unicom.rewrite();
````

## 局部注册
````javascript
// Page中注册
var unicom = require("wx-unicom");
Page({
    onLoad: function(){
        // 注册 this 到unicom
        // id 可选， 优先这里传入的ID
        unicom.pageInit(this, "id");
    }
})

// Component中使用behaviors来注册
Component({
    behaviors: [unicom.behavior]
})
````

## 关于设置页面id
````javascript
// 页面中
Page({
    unicomId: "id"
})
// 或者 局部注册中
// 注：如果使用 全局注册，局部注册将失效，只能通过上面方法来注册
Page({
    onLoad: function(){
        unicom.pageInit(this, "id");
    }
})

// 组件中的id
// 组件可以被多次创建，所以使用传参来设置id

````
> 如果同时使用了两种方式注册，如果局部注册生效，优先局部注册，否组会使用第一种

## 关于设置组件id
````html
<!-- 组件中的id -->
<!-- 组件可以被多次创建，所以使用传参来设置id -->
<compon unicom-id="id"></compon>
````

## 关于设置通讯方法
````javascript
// Page和Component 通用
Page|Component({
    unicom: {
        // 定义消息方法
        // arg1， arg2 是调用时传入
        message: function(arg1, arg2) {
            // 当前页面 unicom相关参数 请不要随意修改
            this.unicom
            // 生成的唯一id
            this.unicom.id
            // 传入的唯一id
            this.unicom.cusId
            // 调用我的最后发送者
            this.unicom.sender
            // 发送消息
            this.unicom.send
        }
    }
})
````


## 发送消息
````javascript
// Page和Component 通用
Page|Component({
    methods: {
        method1: function() {
            // 发送了message消息后，所有定义message消息的unicom都可以收到消息
            this.unicom.send("message", "arg1", "arg2")
        },
        method1: function() {
            // 将message消息发送给 id1，id2这两个有自定义id的组件或者页面
            this.unicom.send("message#id1,id2", "arg1", "arg2")
        }
    }
})

// 方法二 引入 unicom
var unicom = require("wx-unicom");
// 发送了message消息后，所有定义message消息的unicom都可以收到消息
unicom.send("message", "arg1", "arg2")
// 将message消息发送给 id1，id2这两个有自定义id的组件或者页面
unicom.send("message#id1,id2", "arg1", "arg2")
````
