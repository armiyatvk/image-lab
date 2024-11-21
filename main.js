const path = require('path');
const IOhandler = require('./IOhandler');
const readline = require('readline');
const zipFilePath = path.join(__dirname, 'myfile.zip');
const unzippedPath = path.join(__dirname, 'unzipped');
const processedPathGray = path.join(__dirname, 'grayscaled');
const processedPathSepia = path.join(__dirname, 'sepia');
const processedPathDither = path.join(__dirname, 'dithered');
const processedPathInvert = path.join(__dirname, 'inverted');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

const processImg = async () => {
    try {
        await IOhandler.unzip(zipFilePath, unzippedPath)
        const files = await IOhandler.readDir(unzippedPath);
        
        rl.question(`Choose your filter between these option: grayscale , sepia , dithering `, async (input) => {
            let newOutputPath;
            if (input === 'grayscale' || input === 'sepia' || input === 'dithering' || input === 'invert' || input === "1" || input === '2' || input === '3' || input === "4") {
                for (const file of files) {
                    if (input === 'grayscale' || input === '1') {
                        newOutputPath = path.join(processedPathGray, path.basename(file));
                        IOhandler.grayScale(file, newOutputPath);
                    } else if (input === 'sepia' || input === '2') {
                        newOutputPath = path.join(processedPathSepia, path.basename(file));
                        IOhandler.sepia(file, newOutputPath);
                    } else if (input === 'dithering' || input === '3') {
                        newOutputPath = path.join(processedPathDither, path.basename(file));
                        IOhandler.dithering(file, newOutputPath);
                    } else {
                        newOutputPath = path.join(processedPathInvert, path.basename(file));
                        IOhandler.invert(file, newOutputPath);
                    }
                    rl.close();
                }
                console.log('Process completed!')
            } else {
                console.log('You entered wrong input. Try again!');
                rl.close();
            }
        });
    } catch (error) {
        console.error(error);
        rl.close();
    }

}

processImg();
