// import multer from "multer";
// import path from "path";

// const storage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//   const allowedExtensions = [
//     ".pdf",
//     ".jpg",
//     ".jpeg",
//     ".png",
//     ".xls",
//     ".csv",
//     ".ppt",
//   ];

//   const fileExtension = path.extname(file.originalname).toLowerCase();
//   if (allowedExtensions.includes(fileExtension)) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error(
//         "Invalid file type. Only PDF, image, XLS, and CSV files are allowed."
//       )
//     );
//   }
// };

// // export const singleUpload = multer({ storage, fileFilter }).single("file");
// export const singleUpload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // Augmenter la limite de taille à 10 Mo (vous pouvez ajuster cette valeur selon vos besoins)
//   },
// }).single("file");
const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".xls",
    ".csv",
    ".ppt",
  ];

  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, image, XLS, and CSV files are allowed."
      )
    );
  }
};

// export const singleUpload = multer({ storage, fileFilter }).single("file");
const multerInstance = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Augmenter la limite de taille à 10 Mo (vous pouvez ajuster cette valeur selon vos besoins)
  },
});
const singleUpload = multerInstance.single("file");

module.exports = singleUpload;
