const randomString = require('random-string');
const MD5 = require('md5')
const xmlParser = require('./lib/xmlparser')
/**
 * 
 * @param {*} obj 传入的对象
 * @return String 返回 xml 字符串
 */
function objToXmlString(obj) {
  let xmlreq = '';
  if (obj instanceof Object) {
    xmlreq = '<xml>';
    for (key in obj) {
      xmlreq += `<${key}>${obj[key]}</${key}>`
    }
    xmlreq += '</xml>'
  }
  return xmlreq;
}

/**
 * 
 * @param {String} xml 待转换的 xml 格式
 * @return {JSON} 返回 JSON 对象
 */
function xmlToJson(xml) {
  return xmlParser.parser(xml).xml
}

/**
 * 
 * @param Number: number 生成随机字符串的长度，默认为 8
 */
function getRandomString(number) {
  number = number | 16;
  return randomString({length:number})
}

/**
 * 
 * @param {*} reqData Object：请求参数集
 * @param {*} apiKey String：商户 API 私密 key 值
 * @param {*} filters Option | Array：要过滤的对象字段
 * @return 返回按照微信官网规定的计算 sign 值
 */
function createSign(reqData, apiKey, filters) {
  let propArr = [];
  for (key in reqData) {
    if(reqData[key])
      propArr.push(key);
  }
  if (filters && (filters instanceof Array)) {
    propArr = propArr.filter(elm => {
      return !filters.includes(elm);
    })
  }
  propArr.sort();
  let stringA = '';
  propArr.forEach(val => {
    stringA += `${val}=${reqData[val]}&`
  })
  stringA = stringA.slice(0, stringA.length - 1)
  let stringSignTemp = stringA + '&key=' + apiKey; // key 为商户平台设置的秘钥 key
  let sign = MD5(stringSignTemp).toUpperCase();
  return sign;
}

module.exports = {
  objToXmlString,
  xmlToJson,
  getRandomString,
  createSign,
}