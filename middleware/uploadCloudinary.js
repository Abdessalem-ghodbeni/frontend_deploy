const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

module.exports = {
    uploadFile: async (filePath) => {
        try {
            const result = await cloudinary.uploader.upload(filePath);
            return result;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
};