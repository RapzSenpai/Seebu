const { config } = require('dotenv');
const appJson = require('./app.json');

config();

module.exports = {
  expo: {
    ...appJson.expo,
  },
};
