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

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */


const grayScale = (pathIn, pathOut) => {
    createReadStream(pathIn).on('error', reject)
      .pipe(
        new PNG({
          filterType: 4,
        })
      ).on('error', reject)
      .on("parsed", function () {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;

            const red = this.data[idx];
            const green = this.data[idx + 1];
            const blue =this.data[idx + 2];
            
            const gray = (red + green + blue) / 3;

            this.data[idx] = gray;
            this.data[idx + 1] = gray;
            this.data[idx + 2] = gray;
          }
        }

        this.pack().on('error', reject).pipe(createWriteStream(pathOut)).on('error', reject);
      });

};

const sepia = async (pathIn, pathOut) => {
  createReadStream(pathIn).on('error', reject)
      .pipe(new PNG({})).on('error', reject)
      .on("parsed", function () {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;

            const red = this.data[idx];
            const green = this.data[idx + 1];
            const blue =this.data[idx + 2];

            const sepiaRed = Math.min(255, 0.393 * red + 0.769 * green + 0.189 * blue);
            const sepiaGreen = Math.min(255, 0.349 * red + 0.686 * green + 0.168 * blue);
            const sepiaBlue = Math.min(255, 0.272 * red + 0.534 * green + 0.131 * blue);


            this.data[idx] = sepiaRed;
            this.data[idx + 1] = sepiaGreen;
            this.data[idx + 2] = sepiaBlue;
          }
        }

        this.pack().on('error', reject).pipe(createWriteStream(pathOut)).on('error', reject);
      })
}

const invert = async (pathIn, pathOut) => {
  createReadStream(pathIn).on('error', reject)
  .pipe(new PNG({})).on('error', reject)
  .on("parsed", function () {
    const idxShifter = (x, y) => (x + y * this.width) << 2;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
          const idx = idxShifter(x, y);

          const red = this.data[idx];
          const green = this.data[idx + 1];
          const blue =this.data[idx + 2];

          this.data[idx] = 255 - red;
          this.data[idx + 1] = 255 - green;
          this.data[idx + 2] = 255 - blue;

        }
      }

      this.pack().on('error', reject).pipe(createWriteStream(pathOut)).on('error', reject);
    })
}


const dithering = async (pathIn, pathOut) => {
  createReadStream(pathIn).on('error', reject)
  .pipe(new PNG({})).on('error', reject)
  .on("parsed", function () {
    const idxShifter = (x, y) => (x + y * this.width) << 2;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
          const idx = idxShifter(x, y);

          let oldR = this.data[idx];
          let oldG = this.data[idx + 1];
          let oldB = this.data[idx + 2];

          let newR = Math.round(2 * oldR / 255) * (255/2);
          let newG = Math.round(2 * oldG / 255) * (255/2);
          let newB = Math.round(2 * oldB / 255) * (255/2);
          let gray = (newR + newG + newB) / 3

          let quantErrR = oldR - newR;
          let quantErrG = oldG - newG;
          let quantErrB = oldB - newB;

          this.data[idx] = newR;
          this.data[idx + 1] = newG;
          this.data[idx + 2] = newB; 

          const distributeError = (xAdder, yAdder, ratio) => {
            const newX = x + xAdder;
            const newY = y + yAdder;
            const newIdx = idxShifter(newX, newY);

            this.data[newIdx] = Math.min(255, Math.max(0, this.data[newIdx] + quantErrR * ratio));
            this.data[newIdx + 1] = Math.min(255, Math.max(0, this.data[newIdx + 1] + quantErrG * ratio));
            this.data[newIdx + 2] = Math.min(255, Math.max(0, this.data[newIdx + 2] + quantErrB * ratio));
          };

          distributeError(1, 0, 7 / 16);
          distributeError(-1, 1, 3 / 16);
          distributeError(0, 1, 5 / 16);
          distributeError(1, 1, 1 / 16);

        }
      }
      this.pack().on('error', reject).pipe(createWriteStream(pathOut)).on('error', reject);
    })
}


module.exports = {
  unzip,
  readDir,
  grayScale,
  sepia,
  dithering,
  invert,
};

