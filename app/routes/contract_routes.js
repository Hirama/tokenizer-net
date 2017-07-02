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




};
