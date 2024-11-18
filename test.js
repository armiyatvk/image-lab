const fs = require('fs/promises');
const yauzl = require('yauzl-promise');
const path = require('path');

/**
 * Function to unzip a zip file
 * @param {string} pathIn - The path to the zip file
 * @param {string} pathOut - The directory to unzip the contents to
 */
const unzip = async (pathIn, pathOut) => {
  try {
    // Open the zip file
    const zip = await yauzl.open(pathIn);

    // Ensure the output directory exists
    await fs.mkdir(pathOut, { recursive: true });

    for await (const entry of zip) {
      // Handle directories (skip them)
      if (entry.filename.endsWith('/')) {
        await fs.mkdir(path.join(pathOut, entry.filename), { recursive: true });
      } else {
        // Handle files
        const readStream = await entry.openReadStream();
        const writeStream = fsc.createWriteStream(path.join(pathOut, entry.filename));
        await readStream.pipe(writeStream);
      }
    }

    console.log("Extraction operation complete");
  } catch (error) {
    console.error('Error during extraction:', error);
  }
};
/**
 * Function to read all PNG files in a directory
 * @param {string} dir - The directory to scan
 * @return {Array} - Array of file paths for PNG files
 */
const readDir = async (dir) => {
    try {
      const files = await fs.readdir(dir);
      return files.filter(file => file.endsWith('.png')).map(file => path.join(dir, file));
    } catch (error) {
      console.error('Error reading directory:', error);
      return [];
    }
  };
  const { PNG } = require('pngjs');
const fsc = require('fs');

/**
 * Function to apply grayscale to a PNG image
 * @param {string} pathIn - Path to the input PNG image
 * @param {string} pathOut - Path to save the grayscaled image
 */
const grayScale = (pathIn, pathOut) => {
  fsc.createReadStream(pathIn)
    .pipe(new PNG())
    .on('parsed', function () {
      // Loop through each pixel and adjust RGB values
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const idx = (this.width * y + x) << 2; // Calculate the index in the pixel array

          // Calculate the grayscale value (average of RGB channels)
          const gray = 0.3 * this.data[idx] + 0.59 * this.data[idx + 1] + 0.11 * this.data[idx + 2];

          // Set RGB channels to the grayscale value
          this.data[idx] = gray; // Red channel
          this.data[idx + 1] = gray; // Green channel
          this.data[idx + 2] = gray; // Blue channel
        }
      }

      // Save the modified image to the output directory
      this.pack().pipe(fsc.createWriteStream(pathOut));
    });
};

module.exports = {
    unzip,
    readDir,
    grayScale,
}
