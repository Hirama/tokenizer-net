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

  var key = "4c1784c029f7edff827ef9e99152342d9b0e7b5b7f264612fac49adad7a9573d";
  var address = "0x5f7ccb57801ebc0dfac05a997ceb7fbf68cdb56d";


  // sources
  var sourceSafeMath = fs.readFileSync('./contracts/zeppelin/SafeMath.sol').toString();
  var sourceOwnable = fs.readFileSync('./contracts/zeppelin/ownership/Ownable.sol').toString();
  var sourceERC20Basic = fs.readFileSync('./contracts/zeppelin/token/ERC20Basic.sol').toString();
  var sourceDealsHolder = fs.readFileSync('./contracts/DealsHolder.sol').toString();
  var sourceTokenizedDeal = fs.readFileSync('./contracts/TokenizedDeal.sol').toString();
  var sourceDeal = fs.readFileSync('./contracts/Deal.sol').toString();


  let sourceInput = {
    "SafeMath.sol" : sourceSafeMath,
    "Ownable.sol" : sourceOwnable,
    "ERC20Basic.sol" : sourceERC20Basic,
    "DealsHolder.sol" : sourceDealsHolder,
    "TokenizedDeal.sol" : sourceTokenizedDeal,
    "Deal.sol" : sourceDeal
  };

  // compiled file
  let outBytecode = solc.compile({sources: sourceInput}, 1);
  // console.log(JSON.stringify(outBytecode));
  // bytecode
  var bytecodeDealsHolder = outBytecode.contracts['DealsHolder.sol:DealsHolder'].bytecode;
  var bytecodeTokenizedDeal = outBytecode.contracts['TokenizedDeal.sol:TokenizedDeal'].bytecode;
  var bytecodeDeal = outBytecode.contracts['Deal.sol:Deal'].bytecode;
  // abi
  var interfaceDealsHolder = outBytecode.contracts['DealsHolder.sol:DealsHolder'].interface;
  var interfaceTokenizedDeal = outBytecode.contracts['TokenizedDeal.sol:TokenizedDeal'].interface;
  var interfaceDeal = outBytecode.contracts['Deal.sol:Deal'].interface;


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

  // Create core contract holder for system init and recieveng payment fees
  function createHolder(sendResult) {
    var rawTx = {
        nonce: web3.toHex(web3.eth.getTransactionCount(address)),
        gasLimit: web3.toHex(3000000),
        gasPrice: web3.toHex(20000000000),
        data: '0x' + bytecodeDealsHolder
    };
    sendRaw(rawTx, sendResult);
  }

  // Return amount of eth which is needed for transaction execution
  function amountOfWei(sendResult) {
    // creating TokenizedDeal = 1638906 gas
    // creating Deal = 508614 gas
    let gasPrice = 20000000000;
    let total = (gasPrice * (1700000 + 600000)) / 10**18;
    sendResult.send(JSON.stringify({ eth: total }));
  }

  // Check if landlord did payment of system-fee
  function checkFeePayment(sendResult, token, contractAddress) {
    // var txOptions = {
    //   nonce: web3.toHex(web3.eth.getTransactionCount(address)),
    //   gasLimit: web3.toHex(2000000),
    //   gasPrice: web3.toHex(20000000000),
    //   to: contractAddress
    // }
    //
    // var rawTx = txutils.functionTx(JSON.parse(interfaceDealsHolder), 'getDepositByToken', token, txOptions);
    // sendRaw(rawTx, sendResult);
    var contract = web3.eth.contract(JSON.parse(interfaceDealsHolder)).at(contractAddress);
    console.log(contract);
    contract.getDepositByToken(token, function(error, data) {
      sendResult.send(String(data));
    });

  }
  return {
      createHolder: createHolder,
      amountOfWei: amountOfWei,
      checkFeePayment: checkFeePayment
  };

}
