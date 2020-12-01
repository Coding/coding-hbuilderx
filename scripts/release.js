const fs = require('fs').promises;
const oldFS = require('fs');
const path = require('path');
const childProcess = require('child_process');

const ROOT = path.resolve(__dirname, '../');
const TEMP_PATH = path.resolve(ROOT, './temp');
const OUT_PATH = path.resolve(ROOT, './out');
const TEMP_OUT_PATH = path.resolve(TEMP_PATH, './out');
const TEMP_NODE_MODULES = path.resolve(TEMP_PATH, './node_modules');
const NODE_MODULES = path.resolve(ROOT, './node_modules');

const copy = async (source, destination) => {
  let paths = await fs.readdir(source);
  paths.forEach(async (path) => {
    const _source = source + '/' + path;
    const _destination = destination + '/' + path;
    try {
      const stats = await fs.stat(_source);
      if (stats.isFile()) {
        const readable = oldFS.createReadStream(_source);
        const writable = oldFS.createWriteStream(_destination);
        readable.pipe(writable);
      } else if (stats.isDirectory()) {
        checkDirectory(_source, _destination, copy);
      }
    } catch {

    }
  });
}

const checkDirectory = async (source, destination, callback) => {
  try {
    const res = await fs.stat(destination);
    callback(source, destination);
  } catch {
    const res = await fs.mkdir(destination);
    callback(source, destination);
  }
};

const release = async () => {
  try {
    await fs.stat(TEMP_PATH);
  } catch {
    await fs.mkdir(TEMP_PATH);
  }

  try {
    await fs.stat(TEMP_OUT_PATH);
  } catch {
    await fs.mkdir(TEMP_OUT_PATH);
  }

  try {
    await fs.stat(TEMP_NODE_MODULES);
  } catch {
    await fs.mkdir(TEMP_NODE_MODULES);
  }

  childProcess.execSync('yarn');
  childProcess.execSync('yarn build');
  console.warn('yarn build complete')

  await copy(OUT_PATH, TEMP_PATH + '/out');
  await fs.copyFile(path.resolve(ROOT, './package.json'), path.resolve(TEMP_PATH, './package.json'));
  await fs.copyFile(path.resolve(ROOT, './LICENSE'), path.resolve(TEMP_PATH, './LICENSE'));

  childProcess.execSync('yarn --prod=true');
  await copy(NODE_MODULES, TEMP_PATH + '/node_modules');

  childProcess.execSync(`rm -rf ${path.resolve(TEMP_NODE_MODULES, './@babel')}`);
  childProcess.execSync(`rm -rf ${path.resolve(TEMP_NODE_MODULES, './@emotion')}`);
  childProcess.execSync(`rm -rf ${path.resolve(TEMP_NODE_MODULES, './csstype')}`);
  childProcess.execSync(`rm -rf ${path.resolve(TEMP_NODE_MODULES, './babel-plugin-emotion')}`);
  childProcess.execSync(`rm -rf ${path.resolve(TEMP_NODE_MODULES, './babel-plugin-macros')}`);
  childProcess.execSync(`rm -rf ${path.resolve(TEMP_NODE_MODULES, './babel-plugin-syntax-jsx')}`);
};

release();
