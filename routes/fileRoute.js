const { Router } = require('express');
const fileController = require('../controller/fileController');

const fileRoute = Router();

fileRoute.route('/upload')
  .post(fileController.upload);

module.exports = Object.freeze(fileRoute);
