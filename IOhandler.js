const fs = require("fs");
const PNG = require("pngjs").PNG;
const path = require("path");
const yauzl = require('yauzl-promise'),
  {pipeline} = require('stream/promises');

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
const pathIn = path.join(__dirname, 'myfile.zip');
const pathOut = path.join(__dirname, 'unzipped');

const unzip = async (pathIn, pathOut) => {
  //study all these codes, as well as how FINALLY works...
  const zip = await yauzl.open(pathIn);
  try {
    for await (const entry of zip) {
      if (entry.filename.endsWith('/')) {
        await fs.promises.mkdir(`${pathOut}/${entry.filename}`, { recursive: true});
      } else {
        const readStream = await entry.openReadStream();
        await fs.promises.mkdir(`${pathOut}/${entry.filename.substring(0, entry.filename.lastIndexOf('/'))}`, { recursive: true });
        const writeStream = fs.createWriteStream(
          `${pathOut}/${entry.filename}`
        );
        await pipeline(readStream, writeStream);
      }
    }
  } finally {
    await zip.close();
    console.log('Extraction operation complete')
  }
};

unzip(pathIn, pathOut);

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = async (dir) => {
  await fs.readDir
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const grayScale = (pathIn, pathOut) => {};

module.exports = {
  unzip,
  readDir,
  grayScale,
};
