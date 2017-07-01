module.exports = function() {
  var Web3 = require('web3');
  var solc = require('solc');
  var util = require('ethereumjs-util');
  var tx = require('ethereumjs-tx');
  var lightwallet = require('eth-lightwallet');
  var txutils = lightwallet.txutils;
  var fs = require('file-system');
  var web3 = new Web3(
      new Web3.providers.HttpProvider('http://localhost:8545')
  );

  var key = "345982b296713a858366e0270d266bee2d499e2677dae8ffc3cd107e2b4bc105";
  var address = "0x76202effa6b22d5653bb8db52a09fe059bfdc19e";

  // TODO read source code from fs
  var sourceHolder = fs.readFileSync('./contracts/DealsHolder.sol').toString();
  var sourceOwnable = fs.readFileSync('./contracts/zeppelin/ownership/Ownable.sol').toString();

  let sourceInput = {
    "zeppelin/ownership/Ownable.sol" : sourceOwnable,
    "DealsHolder.sol" : sourceHolder

  };

  console.log(sourceInput);

  // compiled file
  let outBytecode = solc.compile({sources: sourceInput}, 1);
  console.log(JSON.stringify(outBytecode));
  // bytecode
  var bytecodeHolder = outBytecode.contracts['DealsHolder.sol:DealsHolder'].bytecode;
  // abi
  var interfaceHolder = outBytecode.contracts['DealsHolder.sol:DealsHolder'].interface;


  function sendRaw(rawTx, sendResult) {
      var privateKey = new Buffer(key, 'hex');
      var transaction = new tx(rawTx);
      transaction.sign(privateKey);
      var serializedTx = transaction.serialize().toString('hex');
      web3.eth.sendRawTransaction(
      '0x' + serializedTx, function(err, result) {
          if(err) {
              sendResult.send(err);
          } else {
              let receipt = web3.eth.getTransactionReceipt(result);
              sendResult.send(receipt.contractAddress);
          }
      });
  }

  function createHolder(sendResult) {
    var rawTx = {
        nonce: web3.toHex(web3.eth.getTransactionCount(address)),
        gasLimit: web3.toHex(900000),
        gasPrice: web3.toHex(20000000000),
        data: '0x' + bytecodeHolder
    };

    sendRaw(rawTx, sendResult);
  }


  return {
      createHolder: createHolder
  };

}
