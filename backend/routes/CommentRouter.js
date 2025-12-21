const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const { requireAuth } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/commentsOfUser/:id", requireAuth ,async (req, res) => {
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

module.exports = router;
