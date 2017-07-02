const ethereum = require('../ethereum/eth-context');

module.exports = function(app) {
  const eth = ethereum();

  // Depoly holder contract
  app.post('/createholder', (req, res) => {
    eth.createHolder(res);
  });

  // Return amount of eth which is needed to pay
  app.get('/amountofwei', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    eth.amountOfWei(res);
  });

  // Return amount of payment from landlord
  app.post('/checkfeepayment', (req, res) => {
    let token = req.body.token;
    let contractAddress = req.body.contractAddress;
    eth.checkFeePayment(res, token, contractAddress);
  });

  // address _landlord, uint _amountOfPayment, uint _nights, uint _tokenPrice
  app.post('/createtokendeal', (req, res) => {
    let landlord = req.body.landlord;
    let fullpayment = req.body.fullpayment;
    let nights = req.body.nights;
    let tokenPrice = req.body.tokenPrice;
    eth.createtokendeal(res,landlord, fullpayment, nights, tokenPrice)
  });

};
