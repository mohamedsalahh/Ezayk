const path = require('path');

exports.formatPath = (...paths) => {
  return path.join(require.main.filename, ...paths);
};

exports.formatLink = (...paths) => {
  return paths.reduce((url, path) => url + '/' + path);
};

exports.rootDir = path.dirname(require.main.filename);
