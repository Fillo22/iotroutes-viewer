
const fs = require('fs-extra');
const path = require('path');
const { argv } = require('process');

const commandLineArgs = argv.slice(2);
let sourceDir = commandLineArgs[0];
const destDir = commandLineArgs[1]; // Update the destination directory

console.log('Copy task started...');

function copyDirectory(source, destination) {
    console.log('Copy directory...');
    console.log(`\tSource: ${source}`);
    console.log(`\tDestination: ${destination}`);
    // Ensure the destination directory exists
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
  
    // Read the contents of the source directory
    const files = fs.readdirSync(source);
  
    // Iterate through each file/directory in the source
    files.forEach((file) => {
      const sourcePath = path.join(source, file);
      const destPath = path.join(destination, file);
  
      // Check if the current item is a file or a directory
      if (fs.statSync(sourcePath).isDirectory()) {
        // Recursively copy the directory
        copyDirectory(sourcePath, destPath);
      } else {
        // Copy the file
        fs.copyFileSync(sourcePath, destPath);
        console.log(`\tCopied: ${file}`);
      }
    });
  }
  
  copyDirectory(sourceDir, destDir);

console.log('Copy task completed.');
