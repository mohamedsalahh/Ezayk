const fs = require('fs');

exports.isFileExist = async (filePath) => {
  try {
    if (!filePath) {
      return false;
    }

    await fs.promises.access(filePath, fs.constants.F_OK);

    return true;
  } catch (error) {
    return false;
  }
};

exports.deleteFile = async (filePath) => {
  if (await this.isFileExist(filePath)) {
    await fs.promises.unlink(filePath);
  }
};

exports.streamFile = async (filePath) => {
  const isFileExist = await this.isFileExist(filePath);

  if (!isFileExist) {
    return undefined;
  }

  return fs.createReadStream(filePath);
};
