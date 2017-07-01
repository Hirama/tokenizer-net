module.exports = function(app) {

  app.post('/contract', (req, res) => {
    res.send('Hello')
  });

};
