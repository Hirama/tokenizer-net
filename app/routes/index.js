const noteRoutes = require('./contract_routes');
module.exports = function(app) {
  // path resolver
  noteRoutes(app);
};
