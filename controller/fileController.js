/* eslint-disable no-restricted-syntax */
const { Form } = require('multiparty');
const MinIO = require('../services/MinIO');
const { Log, LoggingLevel } = require('../utils/logger');


function onPutError(err) {
  Log(LoggingLevel.Error, err.message, err);
}


const upload = (req, res) => {
  const { user } = req;
  const form = new Form();
  form.on('close', () => {
    Log(LoggingLevel.Info, 'parsing complete!');
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
      metadata['Content-Type'] = part.headers['content-type'];
      await MinIO().putObject(user.bucket, metadata.filename, part)
        .catch(onPutError);
      Log(LoggingLevel.Info, 'Successfully uploaded file!');
    }
  });
  form.parse(req);
};

const getBucketFiles = (req, res) => {
  const { dir } = req.query;
  const { bucket } = req.user;
  const stream = MinIO().listObjects(bucket, dir);
  const result = [];
  stream.on('data', (data) => {
    result.push(data);
  });
  stream.on('error', (err) => {
    res.send(err);
  });
  stream.on('end', () => {
    res.send({ result });
  });
};

const download = (req, res) => {
  const { file } = req.query;
  const { user } = req;
  MinIO().getObject(user.bucket, file)
    .then((stream) => {
      const filename = file.split('/').slice(-1).pop();
      res.setHeader('Content-disposition', `attachment; filename=${filename}`);
      return stream.pipe(res);
    })
    .catch((err) => {
      Log(LoggingLevel.Error, err.message, err);
      res.status(400).send({ message: 'Download Failed!' });
    });
};

const deleteFiles = (req, res) => {
  const { selected } = req.body;
  const { user } = req;
  MinIO().removeObjects(user.bucket, selected)
    .then(() => res.send(true))
    .catch(() => res.send(false));
};


module.exports = Object.freeze({
  upload,
  getBucketFiles,
  download,
  deleteFiles,
});
