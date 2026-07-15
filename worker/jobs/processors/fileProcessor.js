import fs from "fs/promises";
import path from "path";

export const processFile = async (payload) => {

    console.log();
    console.log("File Processor Started");

    if (!payload.fileName) {
        throw new Error("Invalid file payload");
    }

    const uploadsFolder = path.join(
        process.cwd(),
        "jobs",
        "storage",
        "uploads"
    );

    const processedFolder = path.join(
        process.cwd(),
        "jobs",
        "storage",
        "processed-files"
    );

    // Create processed folder if it doesn't exist
    await fs.mkdir(processedFolder, {
        recursive: true
    });

    const sourcePath = path.join(
        uploadsFolder,
        payload.fileName
    );

    const processedFileName =
        `processed-file-${Date.now()}-${payload.fileName}`;

    const destinationPath = path.join(
        processedFolder,
        processedFileName
    );

    // Copy file
    await fs.copyFile(sourcePath, destinationPath);

    console.log(`Source      : ${payload.fileName}`);
    console.log(`Output File : ${processedFileName}`);

    console.log("File Processed Successfully");

};