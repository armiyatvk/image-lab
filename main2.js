const path = require('path');
const IOhandler = require('./test');

// Paths for the zip file, unzipped folder, and processed images
const zipFilePath = path.join(__dirname, 'myfile.zip');
const unzippedPath = path.join(__dirname, 'unzipped');
const processedPath = path.join(__dirname, 'grayscaled');

// Step 1: Unzip the file
IOhandler.unzip(zipFilePath, unzippedPath)
  .then(() => {
    // Step 2: Read the directory for PNG files
    return IOhandler.readDir(unzippedPath);
  })
  .then((files) => {
    // Step 3: Apply grayscale to each PNG file
    files.forEach((file) => {
      const outputFile = path.join(processedPath, path.basename(file)); // Use the same name for the output file
      IOhandler.grayScale(file, outputFile);
    });
  })
  .catch((err) => {
    console.error('Error in processing:', err);
  });
