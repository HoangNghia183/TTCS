import multer from 'multer';
import path from 'path';

// Cấu hình nơi lưu trữ file (Lưu tạm vào bộ nhớ Disk của server)
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/'); // File sẽ được lưu vào thư mục 'uploads' ở root
    },
    filename(req, file, cb) {
        // Đặt tên file: tên_gốc + ngày_tháng + đuôi_file (để tránh trùng tên)
        // VD: meo-anh.png -> meo-anh-167888888.png
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

// Hàm kiểm tra định dạng file
function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp|pdf|epub/; // Các đuôi cho phép
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/pdf' || file.mimetype === 'application/epub+zip';

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh, PDF và EPUB (jpg, jpeg, png, webp, pdf, epub)!'));
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Giới hạn file 50MB cho sách số
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

export default upload;