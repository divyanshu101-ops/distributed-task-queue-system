import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(
    process.cwd(),
    "..",
    "storage",
    "uploads"
);

// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, {
        recursive: true
    });
}

const storage = multer.diskStorage({

    destination(req, file, cb) {

        cb(null, uploadsDir);

    },

    filename(req, file, cb) {

        const uniqueName =
            `${Date.now()}-${file.originalname}`;

        cb(null, uniqueName);

    }

});

const upload = multer({
    storage
});

export default upload;