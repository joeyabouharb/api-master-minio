const { Router } = require('express');
const fileController = require('../controller/fileController');
const { authNeeded } = require('../utils/jwt');

const fileRoute = Router();

fileRoute.route('/upload')
  .post(authNeeded, fileController.upload);

fileRoute.route('/download')
  .get(authNeeded, fileController.download);

fileRoute.route('/delete')
  .post(authNeeded, fileController.deleteFiles);

fileRoute.route('/')
  .get(authNeeded, fileController.getBucketFiles);

module.exports = Object.freeze(fileRoute);
