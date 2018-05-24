//app.js
const event = require('./utils/event.js')
App({
  onLaunch: function () {
    // 获取sessionid
    var sessionid = wx.getStorageSync('sessionid') || null
    var accountStatus = wx.getStorageSync('accountStatus') || null
    this.globalData.sessionid = sessionid
    this.globalData.accountStatus = accountStatus
    var me = this


    wx.checkSession({
      success: function(){
        //session_key 未过期，并且在本生命周期一直有效
      },
      fail: function(){
        // session_key 已经失效，需要重新执行登录流程
        wx.login({
          success: function(res) {
            if (res.code) {
              // 发送 res.code 到后台换取 openId, sessionKey, unionId
              wx.request({
                url: me.globalData.url + '/wechat/jscode2session', //仅为示例，并非真实的接口地址
                data: {
                    code: res.code
                  },
                  header: {
                    'content-type': 'application/json' // 默认值
                  },
                  success: function(response) {
                    console.log(response.data)
                    me.globalData.sessionid = response.data.sessionid
                    me.globalData.accountStatus = response.data.accountStatus
                    wx.setStorageSync('sessionid', me.globalData.sessionid)
                    wx.setStorageSync('accountStatus', me.globalData.accountStatus)
                    event.emit('request:sessionid:ok')
                  }
              })
            } else {
              console.log('登录失败！' + res.errMsg)
            }
          }
        });

      }
    })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              console.log(res.userInfo)

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    url: 'http://localhost:8080/erp',
    userInfo: null,
    sessionid: null,
    accountStatus: null
  }
})
