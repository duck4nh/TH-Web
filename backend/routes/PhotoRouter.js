const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const { requireAuth } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/photosOfUser/:id", requireAuth ,async (req, res) => {
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
        comment: c.comment,
        date_time: c.date_time,
        user: usersMap[String(c.user_id)] || null,
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

module.exports = router;
