const axios = require('axios')
const wxpayTools = require('./utils.js')

const EXEC_TYPE = {
  'unifiedorder': 'https://api.mch.weixin.qq.com/pay/unifiedorder', // 统一下单
  'orderquery': 'https://api.mch.weixin.qq.com/pay/orderquery', // 查询订单
  'closeorder': 'https://api.mch.weixin.qq.com/pay/closeorder', // 关闭订单
}

let sendHttpRequest = axios.default.create();
// 拦截响应，直接获取 data
sendHttpRequest.interceptors.response.use(res => {
  return res.data;
})

/**
 * 本 sdk 自动依据 key 生成 sgin
 * 所以无需传入随机字符串 nonce_str 与 签名 sign
 * 其余参数参照官方文档上传即可
 */
class WeiXinPaySdk {

  /**
   * 
   * @param {
   * String:appid,   // 公众账号 ID
   * String:mch_id,  // 商户号
   * String:key,     // 商户平台设置的秘钥 key
   * } config 
   * @note config 填写指定参数，剩余参数参照官方文档填写即可
   */
  constructor(config) {
    this.key = config.key; // 商户私密 api key 切勿泄漏
    this.baseConfig = { // 公用属性
      appid: config.appid, // 公众号 id
      mch_id: config.mch_id, // 商户号
    }
    // 异步通知结果
    this.notifyOK = `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`
  }

  /**
   * @note 发送对应请求接口获取返回结果
   * @param {method} String 请求方法，对应 EXEC_TYPE
   * @param {postData} Object 请求参数
   * @returns {JSON} 返回请求结果
   */
  async exec(method, postData) {
    // 基础配置添加到请求数据中
    Object.assign(postData, this.baseConfig);
    // 添加随机字符串
    postData.nonce_str = wxpayTools.getRandomString(16);
    // 生成签名
    postData.sign = wxpayTools.createSign(postData, this.key);
    // 转换 xml 格式
    let resXml = wxpayTools.objToXmlString(postData);
    switch (method) {
      // 统一下单
      case 'unifiedorder': {
        let res = await sendHttpRequest.post(EXEC_TYPE[method], resXml)
        // 将结果转换为 JSON 对象
        res = wxpayTools.xmlToJson(res)
        return res;
      }
      case 'orderquery': {
        let res = await sendHttpRequest.post(EXEC_TYPE[method], resXml)
        // 将结果转换为 JSON 对象
        res = wxpayTools.xmlToJson(res)
        return res;
      }
      case 'closeorder': {
        let res = await sendHttpRequest.post(EXEC_TYPE[method], resXml)
        // 将结果转换为 JSON 对象
        res = wxpayTools.xmlToJson(res)
        return res;
      }
    }
    // 如果不存在，则返回错误代码
    return {
      code: 404,
      msg: '请求不存在！'
    }
  }

  /**
   * 
   * @param {JSON} reqData 支付成功后的异步通知请求参数
   * @return {Boolean} 返回验证是否成功
   */
  checkSign(reqData) {
    let {
      sign: reqSign
    } = reqData;
    let mySign = wxpayTools.createSign(reqData, this.key, ['sign']);
    if (mySign === reqSign) {
      return true;
    }
    return false
  }
}

module.exports = WeiXinPaySdk;