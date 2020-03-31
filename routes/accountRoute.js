const { Router } = require('express');
const accountController = require('../controller/accountController');

const accountRouter = Router();

accountRouter.route('/')
  .delete()
  .patch();

accountRouter.route('/register')
  .post(accountController.register);

accountRouter.route('/login')
  .post(accountController.login);

module.exports = Object.freeze(accountRouter);
