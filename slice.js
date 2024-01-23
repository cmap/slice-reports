const FILE_CONSTANTS = require("./file_constants");
const fs = require('fs');
const path = require("path")
const fsPromises = fs.promises;
const {
    glob
} = require('glob')
const csv = require('csv');
const readline = require('readline')

const processLineByLine = async function (file, list_to_include) {
    let outputFileName = file.replace(FILE_CONSTANTS.SOURCE_DATA_DIR, FILE_CONSTANTS.DESTINATION_DATA_DIR);
    outputFileName = outputFileName.replace(FILE_CONSTANTS.OLD_PROJECT_PREFIX, FILE_CONSTANTS.NEW_PROJECT_PREFIX);
    fs.rmSync(outputFileName, {force: true})
    const fileStream = fs.createReadStream(file);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    try {
        // Note: we use the crlfDelay option to recognize all instances of CR LF
        // ('\r\n') in input.txt as a single line break.
        let t = 0;
        for await (const line of rl) {
            if (t === 0) {
                fs.appendFileSync(outputFileName, line + "\n");
            } else {
                // Each line in input.txt will be successively available here as `line`.
                const found = list_to_include.filter(item => line.includes(item));
                if (found.length > 0) {
                    fs.appendFileSync(outputFileName, line + "\n");
                }
            }
            ++t;
        }
    } finally {
        console.log("Finished Processing", file)
        rl.close();
        fileStream.close();
    }
};
const copySingleFile = async function (source, destination, file) {
    let outputFileName = file.replace(source, destination);
    outputFileName = outputFileName.replace(FILE_CONSTANTS.OLD_PROJECT_PREFIX, FILE_CONSTANTS.NEW_PROJECT_PREFIX);
    fs.rmSync(outputFileName, {force: true})
    await fsPromises.copyFile(file, outputFileName)
};
const copyAllFiles = async function (source, destination, csvFiles) {
    for await (let csvFile of csvFiles) {
        await copySingleFile(source, destination, csvFile)
    }
};

const processAllByRows = async function (csvFiles, elements_to_include) {
    for (let csvFile of csvFiles) {
        await processLineByLine(csvFile, elements_to_include);
    }
    return "done";
};
const processAllByColumn = async function (csvFiles) {
    for (let csvFile of csvFiles) {
        await processByColumn(csvFile);
    }
    return "done";
};
const cleanUp = async function () {
    try {
        const folderToZip = (FILE_CONSTANTS.DESTINATION_DATA_DIR + "/" +
            FILE_CONSTANTS.NEW_PROJECT_PREFIX).slice(0, -1);
        if (fs.existsSync(folderToZip)) {
            fs.rmSync(folderToZip, {recursive: true});
        }
    } catch (err) {
        console.log("error", err)
    }
};
const processByColumn = async function (file) {
    let transformedPath = file.replace(FILE_CONSTANTS.SOURCE_DATA_DIR, FILE_CONSTANTS.DESTINATION_DATA_DIR);
    transformedPath = transformedPath.replace(FILE_CONSTANTS.OLD_PROJECT_PREFIX, FILE_CONSTANTS.NEW_PROJECT_PREFIX);
    fs.rmSync(transformedPath, {force: true})
    const rs = fs.createReadStream(file);
    const ws = fs.createWriteStream(transformedPath)
    await rs
        .pipe(csv.parse({delimiter: ',', columns: true}))
        .pipe(csv.transform((input) => {
            const keys = Object.keys(input);
            for (let key of keys) {
                if (!FILE_CONSTANTS.matcher(key)) {
                    delete input[key]
                }
            }
            return input;
        }))
        .pipe(csv.stringify({header: true}))
        .pipe(ws)
        .on('finish', () => {
            console.log('finished processing....', file);
            ws.end()
        })
        .on('error', (err) => {
            console.log('error.....', err);
            ws.end()
        });
};
const createFile = async function (file, content) {
    await fsPromises.writeFile(file, content);
};
/**
 *
 */
const copyHomeFiles = async function () {
    const path = require("path")
    const timestamp = new Date().toUTCString('en-us', {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
    });
    const srcParentDir = path.dirname(FILE_CONSTANTS.SOURCE_DATA_DIR).split(path.sep)[0];
    const destParentDir = path.dirname(FILE_CONSTANTS.DESTINATION_DATA_DIR).split(path.sep)[0];

    const promises = [
        fsPromises.copyFile(srcParentDir + "/index.html", destParentDir + "/index.html"),
        createFile(destParentDir + "/timestamp.txt", timestamp)
    ];
    await Promise.all(promises)
};
const copyDirectory = function (source, destination) {
    // Create the destination directory if it doesn't exist
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, {recursive: true});
    }

    // Get a list of all files and subdirectories in the source directory
    const files = fs.readdirSync(source);

    // Iterate over each file/directory
    files.forEach((file) => {
        const sourcePath = path.join(source, file);
        const destPath = path.join(destination, file);

        // Check if the item is a directory
        if (fs.statSync(sourcePath).isDirectory()) {
            // Recursively copy the subdirectory
            copyDirectory(sourcePath, destPath);
        } else {
            // Copy the file
            fs.copyFileSync(sourcePath, destPath);
        }
    });
}
const copyPertDirectory = async function(){
    for(let pert_plate of FILE_CONSTANTS.PERT_PLATES) {
        for (let pert_id of FILE_CONSTANTS.PERT_IDS) {
            //check if the source exists
            const srcFolder = FILE_CONSTANTS.SOURCE_DIR + "/" + pert_plate + "/" + pert_id;
            const destFolder = FILE_CONSTANTS.DESTINATION_DIR + "/" + pert_plate + "/" + pert_id;
            if (fs.existsSync(destFolder)) {
                fs.rmSync(destFolder, {recursive: true});
            }
            if (fs.existsSync(srcFolder)) {
                copyDirectory(srcFolder, destFolder);
            }
        }
    }
};
const zipFiles = async function () {
    const zipper = require('zip-local');
    const zipFileName = FILE_CONSTANTS.DESTINATION_DATA_DIR + "/" + (FILE_CONSTANTS.NEW_PROJECT_PREFIX.slice(0, -1)) + ".zip"
    const filesToZipFilesGlob = [];
    for (let f of FILE_CONSTANTS.FILES_TO_ZIP) {
        filesToZipFilesGlob.push(FILE_CONSTANTS.DESTINATION_DATA_DIR + "/*" + f)
    }
    const zipFiles = await glob(filesToZipFilesGlob)
    const folderToZip = (FILE_CONSTANTS.DESTINATION_DATA_DIR + "/" +
        FILE_CONSTANTS.NEW_PROJECT_PREFIX).slice(0, -1);
    if (fs.existsSync(folderToZip)) {
        fs.rmSync(folderToZip, {recursive: true, force: true});
    }
    fs.rmSync(zipFileName, {force: true})
    fs.mkdirSync(folderToZip, {recursive: true});
    await copyAllFiles(FILE_CONSTANTS.DESTINATION_DATA_DIR, folderToZip, zipFiles)
    //create a folder and then zip it
    zipper.sync.zip(folderToZip + "/").compress().save(zipFileName);
    console.log("Zip file", zipFileName)
};
//sync to s3

(async () => {
    const csvColumnFilesGlob = [];
    const csvRowFilesGlob = [];
    const csvPlateFilesGlob = [];
    const csvCopyFilesGlob = [];

    for (let f of FILE_CONSTANTS.COLUMN_FILES_POST_FIX) {
        csvColumnFilesGlob.push(FILE_CONSTANTS.SOURCE_DATA_DIR + "/*" + f)
    }
    for (let f of FILE_CONSTANTS.ROW_FILES_POST_FIX) {
        csvRowFilesGlob.push(FILE_CONSTANTS.SOURCE_DATA_DIR + "/*" + f)
    }
    for (let f of FILE_CONSTANTS.PLATE_FILES_POST_FIX) {
        csvPlateFilesGlob.push(FILE_CONSTANTS.SOURCE_DATA_DIR + "/*" + f)
    }
    for (let f of FILE_CONSTANTS.COPY_FILES_POST_FIX) {
        csvCopyFilesGlob.push(FILE_CONSTANTS.SOURCE_DATA_DIR + "/*" + f)
    }
    //create the destination directory if it does not already exists
    if (!fs.existsSync(FILE_CONSTANTS.DESTINATION_DATA_DIR)) {
        fs.mkdirSync(FILE_CONSTANTS.DESTINATION_DATA_DIR, {recursive: true});
    }

    let promises = [
        glob(csvRowFilesGlob),
        glob(csvColumnFilesGlob),
        glob(csvPlateFilesGlob),
        glob(csvCopyFilesGlob)
    ];
    const ps = await Promise.all(promises);

    const rowFiles = ps[0];
    const columnFiles = ps[1];
    const plateFiles = ps[2];
    const copyFiles = ps[3];

    promises = [
        processAllByRows(rowFiles, FILE_CONSTANTS.PERT_IDS),
        processAllByRows(plateFiles, FILE_CONSTANTS.PERT_PLATES),
        processAllByColumn(columnFiles),
        copyAllFiles(FILE_CONSTANTS.SOURCE_DATA_DIR, FILE_CONSTANTS.DESTINATION_DATA_DIR, copyFiles),
        copyHomeFiles(),
        copyPertDirectory()
    ];
    await Promise.all(promises);
    await zipFiles();
    await cleanUp();
    console.log("Done");
})();


