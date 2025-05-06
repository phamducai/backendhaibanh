import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';
import * as fs from 'fs';

// Tạo thư mục nếu không tồn tại
const ensureDirectoryExists = (directory: string) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Phân loại file để lưu vào thư mục phù hợp
const getDestination = (req, file) => {
  const isVideo = file.mimetype.startsWith('video/');
  const destination = isVideo ? './uploads/videos' : './uploads/images';
  ensureDirectoryExists(destination);
  return destination;
};

export const fileStorageConfig = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      const destination = getDestination(req, file);
      callback(null, destination);
    },
    filename: (req, file, callback) => {
      const uniqueFileName = `${uuidv4()}${extname(file.originalname)}`;
      callback(null, uniqueFileName);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 250, // Tăng lên 250MB để hỗ trợ file video lớn
  },
  fileFilter: (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|wmv|flv|mkv|webm)$/)) {
      return callback(new Error('Only image and video files are allowed!'), false);
    }
    callback(null, true);
  },
};

// Config riêng cho upload chunk để hỗ trợ file rất lớn
export const chunkUploadConfig = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      const chunkDestination = './uploads/temp';
      ensureDirectoryExists(chunkDestination);
      callback(null, chunkDestination);
    },
    filename: (req, file, callback) => {
      // Sử dụng thông tin chunk để đặt tên file
      const { index, uuid } = req.body;
      callback(null, `${uuid}-${index}`);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB cho mỗi chunk
  },
};
