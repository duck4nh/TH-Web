const express = require("express");
const router = express.Router();
const Friend = require("../db/friendModel");
const User = require("../db/userModel");
const { requireAuth } = require("../middlewares/authMiddleware");

router.get("/friend/list", requireAuth, async (req, res) => {
  const userId = req.user.userId;

  try {
    const doc = await Friend.findOne({ user: userId });
    res.json(doc ? doc.friends : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/friend/add/:otherUserId", requireAuth, async (req, res) => {
  const userId = req.user.userId;
  const { otherUserId } = req.params;

  if (userId === otherUserId) {
    return res.status(400).json({ error: "Cannot add yourself" });
  }

  try {
    // user hiện tại
    let docA = await Friend.findOne({ user: userId });
    if (!docA) docA = new Friend({ user: userId, friends: [] });

    if (!docA.friends.some(id => id.equals(otherUserId))) {
      docA.friends.push(otherUserId);
      await docA.save();
    }

    // user còn lại
    let docB = await Friend.findOne({ user: otherUserId });
    if (!docB) docB = new Friend({ user: otherUserId, friends: [] });

    if (!docB.friends.some(id => id.equals(userId))) {
      docB.friends.push(userId);
      await docB.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/friend/remove/:otherUserId", requireAuth, async (req, res) => {
  const userId = req.user.userId;
  const { otherUserId } = req.params;

  try {
    const docA = await Friend.findOne({ user: userId });
    if (docA) {
      docA.friends = docA.friends.filter(
        (id) => !id.equals(otherUserId)
      );
      await docA.save();
    }

    const docB = await Friend.findOne({ user: otherUserId });
    if (docB) {
      docB.friends = docB.friends.filter(
        (id) => !id.equals(userId)
      );
      await docB.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
  
module.exports = router;


//   router.post("/friend/add/:otherUserId", requireAuth, async (req, res) => {
//     const userId = req.user.userId;
//     const { otherUserId } = req.params;
  
//     try {
//       let doc = await Friend.findOne({ user: userId });
//       if (!doc) doc = new Friend({ user: userId, friends: [] });
  
//       if (!doc.friends.some((id) => id.equals(otherUserId))) {
//         doc.friends.push(otherUserId);
//         await doc.save();
//       }
  
//       res.json({ success: true, friends: doc.friends });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   });

//   router.delete("/friend/remove/:otherUserId", requireAuth, async (req, res) => {
//     const userId = req.user.userId;
//     const { otherUserId } = req.params;
  
//     try {
//       const doc = await Friend.findOne({ user: userId });
//       if (!doc) return res.json({ success: true, friends: [] });
  
//       doc.friends = doc.friends.filter(
//         (id) => !id.equals(otherUserId)
//       );
//       await doc.save();
  
//       res.json({ success: true, friends: doc.friends });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   });
  