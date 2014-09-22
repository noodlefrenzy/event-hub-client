var tokenGen = require('./lib/saToken.js'),
    client = require('./lib/restClient.js');

module.exports.createToken = tokenGen.create;

module.exports.restClient = client.create;
