# 微信支付 weixinpay-sdk

* 线上测试地址：<http://jiangck.com:10002>
* demo 使用方式：`npm i` 安装依赖环境，`node app.js` 启动项目，默认访问 10002 端口即可打开页面，异步通知需在公网环境测试

## 版本说明

* v1.0.1
  * 封装微信官方原生接口，可以使用 json 格式进行数据请求
  * 当前完成 Native 支付方式
  * 完成接口：统一下单、查询订单、关闭订单
  * 包含功能：验签方法，转换工具等。

## 安装

`npm i weixinpay-sdk`

## 使用示例

* 接口方法：
  * 统一下单：`unifiedorder`
  * 查询订单：`orderquery`
  * 关闭订单：`closeorder`

### 统一下单

```JavaScript
const WeiXinPay = require('weixinpay-sdk')
// 基础配置
// 特别说明：只要正确配置了商户 api 私密 key， SDK 会自动创建随机字符串和签名。
let config = {
  appid: '', // 公众账号 ID
  mch_id: '', // 商户号
  key: '' // 商户 api key
}
let wxPay = new WeiXinPay(config);
let order = Date.now();
let orderRes = await wxPay.exec('unifiedorder', {
  body: '支付测试', // 商品简单描述
  out_trade_no: order, // 商户订单号
  total_fee: 1, // 订单总金额，单位分
  spbill_create_ip: req.ip, // 客户端 Ip
  trade_type: 'NATIVE', // 交易类型 JSAPI | NATIVE | APP
  notify_url: 'http://domain.com/notify', // 交易成功后的异步通知地址
})
```

### 查询订单

```javascript
app.get('/queryorder', async (req, res) => {
  let order = req.query;
  let result = await wxPay.exec('orderquery', order);
  if (wxPay.checkSign(result)) {
    res.send(result);
  } else {
    res.send({
      msg: '查询失败！'
    });
  }
})
```

### 关闭订单

```javascript
app.get('/closeorder', async (req, res) => {
  let order = req.query;
  let result = await wxPay.exec('closeorder', order);
  if (wxPay.checkSign(result)) {
    if (result.return_msg === 'OK') {
      res.send({
        msg: '订单已关闭！'
      })
    } else {
      res.send({
        msg: result.return_msg
      })
    }
  } else {
    res.send({
      msg: result.return_msg
    });
  }
})
```

### 异步通知

```javascript
app.post('/notify', XmlBodyParser({
  trim: false,
  explicitArray: false
}), (req, res) => {
  let data = req.body.xml;
  if (wxPay.checkSign(data)) {
    // 验签成功
    // doWork...
    console.log('验签成功')
  } else {
    // 验签失败
    console.log('验签失败')
  }
  res.send(wxPay.notifyOK)
})
```
