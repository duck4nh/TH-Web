const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const { requireAuth } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/commentsOfUser/:id", requireAuth, async (req, res) => {
  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    const photos = await Photo.find(
      { "comments.user_id": userId },
      "_id file_name comments user_id"
    )
      .lean()
      .exec();

    const userComments = [];

    photos.forEach((photo) => {
      if (Array.isArray(photo.comments)) {
        photo.comments.forEach((c) => {
          if (String(c.user_id) === userId) {
            userComments.push({
              comment: c.comment,
              date_time: c.date_time,
              photo: {
                _id: photo._id,
                file_name: photo.file_name,
                user_id: photo.user_id,
              },
            });
          }
        });
      }
    });

    res.status(200).json(userComments);
  } catch (err) {
    console.error("GET /commentsOfUser/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/commentsOfPhoto/:photo_id", requireAuth, async (req, res) => {
  const photoId = req.params.photo_id;
  const { comment } = req.body;
  const userId = req.user.userId;

  console.log("POST /commentsOfPhoto/:photo_id called");
  console.log("photoId:", photoId, "userId:", userId, "comment:", comment);

  // Kiểm tra photo_id có hợp lệ không
  if (!mongoose.Types.ObjectId.isValid(photoId)) {
    console.log("Invalid photo id");
    return res.status(400).json({ error: "Invalid photo id" });
  }

  // Kiểm tra comment trống
  if (!comment || comment.trim() === "") {
    console.log("Empty comment");
    return res.status(400).json({ error: "Comment cannot be empty" });
  }

  try {
    // Tìm photo
    const photo = await Photo.findById(photoId);
    if (!photo) {
      console.log("Photo not found");
      return res.status(404).json({ error: "Photo not found" });
    }

    // Tạo comment mới
    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      comment: comment.trim(),
      date_time: new Date(),
      user_id: new mongoose.Types.ObjectId(userId),
    };

    // Thêm comment vào array comments của photo
    photo.comments.push(newComment);
    await photo.save();

    console.log("Comment added successfully");

    // Lấy user info để trả về client
    const user = await User.findById(userId, "_id first_name last_name");

    // Trả về comment vừa tạo
    const responseComment = {
      _id: newComment._id,
      comment: newComment.comment,
      date_time: newComment.date_time,
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };

    res.status(201).json(responseComment);
  } catch (err) {
    console.error("POST /commentsOfPhoto/:photo_id error:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

router.get("/commentsOfSearch", requireAuth, async (req, res) => {
  const { keyword } = req.query;

  try {
    const regex = keyword ? new RegExp(keyword, "i") : null;

    const photos = await Photo.find(
      regex ? { "comments.comment": regex } : { comments: { $exists: true, $ne: [] } }
    );

    const result = [];

    for (const photo of photos) {
      for (const c of photo.comments || []) {
        if (!regex || regex.test(c.comment)) {
          result.push({
            comment: c.comment,
            date_time: c.date_time,
            photo: {
              _id: photo._id,
              file_name: photo.file_name,
              user_id: photo.user_id
            }
          });
        }
      }
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/comments/:comment_id", requireAuth, async (req, res) => {
  const { comment_id } = req.params;
  const { comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(comment_id)) {
    return res.status(400).json({ error: "Invalid comment id" });
  }

  try {
    const photo = await Photo.findOne({
      "comments._id": comment_id,
    });

    const targetComment = photo.comments.id(comment_id);
    targetComment.comment = comment.trim();
    targetComment.date_time = new Date();

    await photo.save();

    res.json({
      success: true,
      comment: {
        _id: targetComment._id,
        comment: targetComment.comment,
        date_time: targetComment.date_time,
      },
    });
  } catch (err) {
    console.error("PUT /comments/:comment_id error:", err);
    res.status(500).json({ error: "Failed to update comment" });
  }
});

router.delete("/comments/:comment_id", requireAuth, async (req, res) => {
  const { comment_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(comment_id)) {
    return res.status(400).json({ error: "Invalid comment id" });
  }

  try {
    const photo = await Photo.findOne({
      "comments._id": comment_id,
    });

    photo.comments = photo.comments.filter(
      (c) => String(c._id) !== String(comment_id)
    );

    await photo.save();

    res.json({
      success: true,
      comment_id,
    });
  } catch (err) {
    console.error("DELETE /comments/:comment_id error:", err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

module.exports = router;
