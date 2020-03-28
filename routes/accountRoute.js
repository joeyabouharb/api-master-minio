const { Router } = require('express');
const accountController = require('../controller/accountController');

const accountRouter = Router();

accountRouter.route('/')
  .get(accountController.login)
  .post(accountController.register)
  .delete()
  .patch();

module.exports = Object.freeze(accountRouter);
