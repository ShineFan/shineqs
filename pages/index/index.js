//index.js
//获取应用实例
const app = getApp()
var QRCode = require('../../utils/weapp-qrcode.js')
const event = require('../../utils/event.js')
var qrcode

Page({
  data: {
    sessionid: null,
    accountStatus: null,
    phoneNumber: null,
    password: null,
    name: null,
    captcha: null,
    canGetSmsCaptcha: true,
    requestResCode: 200,
    requestResMsg: null,
    requestSuccess: true,
    showQrCode: false,
    inited: false
  },
  generateQrCode: function() {
    //生成二维码
    qrcode = new QRCode('canvas', {
      //text: 'http://www.github.com',
      text: this.data.sessionid,
      width: 150,
      height: 150,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    })
  },
  onLoad: function () {
    event.on('request:sessionid:ok',this, this.onRequestSessionOk)
    event.emit('request:sessionid:ok')
  },
  onRequestSessionOk: function(e){
    if (app.globalData.sessionid) {
      this.setData({
        sessionid: app.globalData.sessionid,
        accountStatus: app.globalData.accountStatus,
        inited: true
      })

      if(app.globalData.accountStatus == '启用') {
        this.generateQrCode()
      }
    }
  },
  changeName: function(e) {
    this.setData({
      name: e.detail.value
    })
  },
  changePhoneNumber: function(e) {
    this.setData({
      phoneNumber: e.detail.value
    })
  },
  changePassword: function(e) {
    this.setData({
      password: e.detail.value
    })
  },
  changeCaptcha: function(e) {
    this.setData({
      captcha:  e.detail.value
    })
  },
  getSmsCode: function(e){
    var phoneNumber = this.data.phoneNumber
    var me = this
    //validate
    wx.request({
      url: app.globalData.url + '/getSmsCode/restful', //仅为示例，并非真实的接口地址
      method: 'POST',
      data: {
        mobile: phoneNumber,
        captchaType: 4
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: function(response) {
        console.log(response.data)
        me.canGetSmsCaptcha = false
      }
    })
  },
  activeAccount: function(e) {
    var me = this
    wx.request({
      url: app.globalData.url + '/wechat/account/active', //仅为示例，并非真实的接口地址
      method: 'POST',
      data: {
        name: me.data.name,
        phoneNumber: me.data.phoneNumber,
        password: me.data.password,
        captcha: me.data.captcha,
        sessionid: app.globalData.sessionid
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: function(response) {
        me.setData({
          requestResCode: response.data.resCode,
          requestSuccess: response.data.success,
          requestResMsg: response.data.resMsg,
        })
        if(response.data.success) {
          me.generateQrCode()
          wx.setStorageSync('accountStatus', response.data.accountStatus)
          app.globalData.accountStatus = response.data.accountStatus
          me.setData({
            accountStatus: response.data.accountStatus,
            showQrCode: true
          })
        }
      }
    })
  },
  checkShowQRcode: function(e) {
    var me = this
    wx.request({
      url: app.globalData.url + '/wechat/account/checkShowQRcode', //仅为示例，并非真实的接口地址
      method: 'POST',
      data: {
        password: me.data.password,
        sessionid: app.globalData.sessionid
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: function(response) {
        console.log(response.data)
        me.setData({
          requestResCode: response.data.resCode,
          requestSuccess: response.data.success,
          requestResMsg: response.data.resMsg,
          showQrCode: false
        })
        if(response.data.success) {
          me.generateQrCode()
          me.setData({
            showQrCode: true
          })

        }
      }
    })
  }
})
