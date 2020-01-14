const express = require('express');
// 引入 SDK
const WeiXinPay = require('../weixinpay-sdk')
/* 由于微信支付的数据均以 XML 格式传输，
  当异步通知时需要使用中间件用来将返回结果转换成 JSON
  然后进一步才能使用验签方法
*/
const XmlBodyParser = require('express-xml-bodyparser');

let app = express();

// 我的配置
let config = {
  appid: '', // 公众账号 ID
  mch_id: '', // 商户号
  key: '' // 商户 api key
}

let wxPay = new WeiXinPay(config);

app.use('/', express.static('./public'))

// 请求生成订单，以下为测试数据。
app.get('/getwxorder', async (req, res) => {
  // 使用 sdk 请求创建订单
  let order = Date.now();
  let orderRes = await wxPay.exec('unifiedorder', {
    body: '支付测试', // 商品简单描述
    out_trade_no: order, // 商户订单号
    total_fee: 1, // 订单总金额，单位分
    spbill_create_ip: req.ip, // 客户端 Ip
    trade_type: 'NATIVE', // 交易类型 JSAPI | NATIVE | APP
    notify_url: 'http://domain.com/notify', // 交易成功后的异步通知地址
  })
  /* 从微信官方文档中可以看到请求结果中有用的就是一个支付二维码，没有订单号相关参数
     如果我们想在客户端上让用户去查询的话那么需要使用订单查询接口，选择微信订单号或
     者商户订单号，微信订单号在交易成功后会返回，因此我们目前仅能将商户号返回，所以
     当前示例采用时间戳为商户号放回给客户端
  */
  orderRes.order = order;
  res.send(orderRes);
})

// 使用中间件来将异步通知的结果转换为 JSON 数据，由于该异步通知 SDK 不可控，所以请自行按照需求设置
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

// 关闭订单接口有蜜汁问题，待讨论
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


app.listen(10002, () => {
  console.log('server start with 10002...');
})