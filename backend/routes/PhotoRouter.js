const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const { requireAuth } = require("../middlewares/authMiddleware");
const router = express.Router();

// Cấu hình thư mục lưu ảnh
const imagesDir = path.join(__dirname, "../public/images");

// Tạo thư mục nếu chưa có
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Cấu hình multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesDir);
  },
  filename: function (req, file, cb) {
    // Tạo filename duy nhất:  timestamp + random string + extension
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${ext}`;
    cb(null, uniqueName);
  },
});

// Multer config
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: function (req, file, cb) {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// GET /photosOfUser/: id - Lấy danh sách photos của user
router.get("/photosOfUser/:id", requireAuth, async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    const photos = await Photo.find(
      { user_id: id },
      "_id user_id file_name date_time comments"
    )
      .lean()
      .exec();

    const commentUserIds = new Set();
    photos.forEach((p) => {
      p.comments.forEach((c) => {
        if (c.user_id) commentUserIds.add(String(c.user_id));
      });
    });

    const users = await User.find(
      { _id: { $in: Array.from(commentUserIds) } },
      "_id first_name last_name"
    )
      .lean()
      .exec();

    const usersMap = {};
    users.forEach((u) => {
      usersMap[String(u._id)] = {
        _id: u._id,
        first_name: u.first_name,
        last_name: u.last_name,
      };
    });

    const APIPhotos = photos.map((p) => {
      const mappedComments = p.comments.map((c) => ({
        _id: c._id,
        comment:  c.comment,
        date_time: c.date_time,
        user:  usersMap[String(c.user_id)] || null,
      }));

      return {
        _id: p._id,
        user_id: p.user_id,
        file_name: p.file_name,
        date_time: p.date_time,
        comments: mappedComments,
      };
    });

    res.status(200).json(APIPhotos);
  } catch (err) {
    console.error("GET /photosOfUser/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ POST /new - Upload photo mới
router.post("/new", requireAuth, upload.single("file"), async (req, res) => {
  try {
    // Kiểm tra file
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const userId = req.user.userId;
    const fileName = req.file.filename;

    console.log(`Uploading photo for user ${userId}:  ${fileName}`);

    // Tạo photo object mới
    const newPhoto = new Photo({
      file_name: fileName,
      date_time: new Date(),
      user_id: new mongoose.Types.ObjectId(userId),
      comments: [],
    });

    // Lưu vào database
    await newPhoto.save();

    console.log("Photo saved successfully:", newPhoto._id);

    // Trả về thông tin photo mới
    res.status(201).json({
      _id: newPhoto._id,
      user_id: newPhoto.user_id,
      file_name:  newPhoto.file_name,
      date_time: newPhoto.date_time,
      comments:  [],
    });
  } catch (err) {
    console.error("POST /photos/new error:", err);
    // Xóa file nếu lỗi khi save
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Failed to upload photo" });
  }
});

module.exports = router;