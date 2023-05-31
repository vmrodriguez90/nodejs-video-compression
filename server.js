const { fork } = require("child_process");
let args = process.argv;
const path = require("path");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require("fs");
let arg = (args.slice(2));
let videoPath = arg[0].replace("path=",""); 
var fileList = [];
const batchSize = 5;

fs.readdir(videoPath, (err, files) => {
  if (err) {
    console.log("Error getting directory information.")
  } else {
    convertFilesInBatches(files, batchSize);
  }
});

// Function to convert a single file
function convertFile(inputFilePath, outputFilePath) {
 
}

// Function to convert files in batches
function convertFilesInBatches(fileList, batchSize) {
  const totalFiles = fileList.length;
  console.log("Total Files: ", totalFiles);
  let batchCount = Math.ceil(totalFiles / batchSize);

  // Helper function to process a single batch
  function processBatch(batch) {
    return new Promise((resolve, reject) => {
      const promises = batch.map(file => {
        const inputFilePath = file;
        let outputFilePath = 'converted\\' + file ;

        return new Promise((resolve, reject) => {
          console.log(inputFilePath);
          outputFilePath = outputFilePath.replace(".MTS",'.MP4');
          ffmpeg(videoPath + '\\' + inputFilePath)
          .fps(30)
          .addOptions(["-crf 28"])
          .on("end", () => {
            console.log(`File converted: ${inputFilePath} -> ${outputFilePath}`);
            fs.unlink(videoPath + '\\' + inputFilePath, (err) => {
              if (!err) {
                console.log(`File deleted: ${inputFilePath}`);
              }
            });
            resolve();
          })
          .on("error", (err) => {
            console.log('Error on converting the file', err);
            reject();
          })
          .save(videoPath + '\\' + outputFilePath);       
        });
      });

      Promise.all(promises)
        .then(resolve)
        .catch(reject);
    });
  }

  // Process each batch sequentially
  function processBatchesSequentially(batches) {
    if (batches.length === 0) {
      console.log('All batches processed.');
      return;
    }

    const batch = batches.shift();

    processBatch(batch)
      .then(() => {
        processBatchesSequentially(batches);
      })
      .catch(error => {
        console.error('Error processing batch:', error);
      });
  }

  // Create an array of file batches
  const fileBatches = [];
  for (let i = 0; i < batchCount; i++) {
    const startIdx = i * batchSize;
    const endIdx = Math.min(startIdx + batchSize, totalFiles);
    const batch = fileList.slice(startIdx, endIdx);
    fileBatches.push(batch);
  }

  // Process the batches sequentially
  processBatchesSequentially(fileBatches);
}

// Example usage

