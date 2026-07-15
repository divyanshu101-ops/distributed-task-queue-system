import fs from "fs/promises";
import path from "path";

export const processImage = async (payload) => {

    console.log();
    console.log("Image Processor Started");

    if (!payload.imageName) {
        throw new Error("Invalid image payload");
    }

    const imagesFolder = path.join(
        process.cwd(),
        "jobs",
        "storage",
        "uploads"
    );

    const processedFolder = path.join(
        process.cwd(),
        "jobs",
        "storage",
        "processed-images"
    );

    await fs.mkdir(processedFolder, {
        recursive: true
    });

    const sourcePath = path.join(
        imagesFolder,
        payload.imageName
    );

    const processedFileName = `processed-${Date.now()}-${payload.imageName}`;

    const destinationPath = path.join(
        processedFolder,
        processedFileName
    );

    await fs.copyFile(sourcePath, destinationPath);

    console.log(`Source      : ${payload.imageName}`);
    console.log(`Output File : ${processedFileName}`);

    console.log("Image Processed Successfully");

};