const ethereum = require('ethereum/eth-context');

module.exports = function(app) {
  const eth = ethereum();


  // Depoly holder contract
  app.post('/createholder', (req, res) => {
    eth.createHolder(res);
  });


};
