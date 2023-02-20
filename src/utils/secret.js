import CryptoJS from "crypto-js"

const key = CryptoJS.enc.Utf8.parse("202107231646ABCD") //十六位十六进制数作为密钥
const iv = CryptoJS.enc.Utf8.parse("ABCD202107231646") //十六位十六进制数作为密钥偏移量

/**
 * 解密方法
 * @param cipherText
 * @returns {string}
 * @constructor
 */
export function decrypt(cipherText) {
  const encryptedHexStr = CryptoJS.enc.Hex.parse(cipherText)
  const srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr)
  const decrypt = CryptoJS.AES.decrypt(srcs, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
  return decryptedStr.toString()
}

/**
 * 加密方法
 * @param plainText
 * @returns {string}
 * @constructor
 */
export function encrypt(plainText) {
  let encrypted = ""
  if (typeof plainText == "string") {
    const srcs = CryptoJS.enc.Utf8.parse(plainText)
    encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
  } else if (typeof plainText == "object") {
    //对象格式的转成json字符串
    const data = JSON.stringify(plainText)
    const srcs = CryptoJS.enc.Utf8.parse(data)
    encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
  }
  return encrypted.ciphertext.toString()
}
