import multer from 'multer';

// Use memory storage so files are available in req.files as buffers
const storage = multer.memoryStorage();
const uploadMemory = multer({ storage });

export default uploadMemory;
