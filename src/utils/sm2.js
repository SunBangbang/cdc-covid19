let sm2Utils = {}

// sm2Utils.generate = () =>{
//     let sm2 = require('sm-crypto').sm2;
//     return sm2.generateKeyPairHex();
// }

sm2Utils.encrypt = (input,publicKey) => {
    let sm2 = require('sm-crypto').sm2;
    const cipherMode = 1 // 1 - C1C3C2，0 - C1C2C3，默认为1

     // 加密结果
    return sm2.doEncrypt(input, publicKey, cipherMode);
}

sm2Utils.decrypt = (input,privateKey) => {
    let sm2 = require('sm-crypto').sm2;
    const cipherMode = 1 // 1 - C1C3C2，0 - C1C2C3，默认为1

     // 加密结果
    return sm2.doDecrypt(input, privateKey, cipherMode);
}

export default sm2Utils;
