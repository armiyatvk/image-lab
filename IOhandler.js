const fs = require("node:fs/promises");
const { createReadStream, createWriteStream } = require("fs");
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
    await fs.mkdir(`${pathOut}`, { recursive: true });
    for await (const entry of zip) {
      if (entry.filename.endsWith('/')) {
        await fs.mkdir(`${pathOut}/${entry.filename}`);
      } else {
        const readStream = await entry.openReadStream();
        const writeStream = createWriteStream(
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

// unzip(pathIn, pathOut);

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = async (dir) => {
  try {
    const files = await fs.readdir(dir);
    const pngFiles = files.filter(file => file.endsWith('.png')).map(file => path.join(dir, file));
    // console.log(pngFiles);
    return pngFiles;
  } catch (error) {
    console.log(error);
  }
};
// const dirPath = path.join(__dirname, 'unzipped');
// console.log(readDir(dirPath));
// readDir(dirPath)
/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */


const grayScale = (pathIn, pathOut) => {
  // pathIn.forEach(imagePath => {
    // const image = path.join(__dirname, 'unzipped', imagePath)
    createReadStream(pathIn)
      .pipe(
        new PNG({
          filterType: 4,
        })
      )
      .on("parsed", function () {
        for (var y = 0; y < this.height; y++) {
          for (var x = 0; x < this.width; x++) {
            var idx = (this.width * y + x) << 2;

            const gray = 0.3 * this.data[idx] + 0.59 * this.data[idx + 1] + 0.11 * this.data[idx + 2];

          // Set RGB channels to the grayscale value
          this.data[idx] = gray; // Red channel
          this.data[idx + 1] = gray; // Green channel
          this.data[idx + 2] = gray; // Blue channel
          }
        }

        this.pack().pipe(createWriteStream(pathOut));
      });

};
// const pathProcessed = path.join(__dirname, "grayscaled")
// grayScale([ 'in.png', 'in1.png', 'in2.png' ], pathProcessed);



module.exports = {
  unzip,
  readDir,
  grayScale,
};
