/* eslint-disable no-restricted-syntax */
const { Form } = require('multiparty');
const MinIO = require('../services/MinIO');
const { Log, LoggingLevel } = require('../utils/logger');

function onPutError(err) {
  Log(LoggingLevel, err.message, err);
}


const upload = (req, res) => {
  const form = new Form();
  form.on('close', () => {
    Log(LoggingLevel.Error, 'parsing complete!');
    res.send(true);
  });
  form.on('error', (err) => {
    Log(LoggingLevel.Error, err.message, err);
    res.send(false);
  });
  form.on('part', async (part) => {
    part.on('error', (err) => {
      Log(LoggingLevel.Error, err.message, err);
      res.send(false);
    });
    const metadata = { filename: '', 'Content-Type': '' };
    if (part.filename) {
      metadata.filename = part.filename;
      metadata['Content-Type'] = metadata.headers['Content-Type'];
      await MinIO().putObject('hello', metadata.filename, part, { ...metadata })
        .catch(onPutError);
      Log(LoggingLevel.Info, 'Successfully uploaded file!');
    }
  });
  form.parse(req);
};

const getBucketFiles = (req, res) => {

};

const download = (req, res) => {

};

module.exports = Object.freeze({
  upload,
  getBucketFiles,
  download,
});
