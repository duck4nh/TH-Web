import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

function UserPhotos({ currentUser }) {
  const { userId } = useParams();
  const location = useLocation();
  const [photos, setPhotos] = useState(null);
  const [like, setLike] = useState(null);
  const [owner, setOwner] = useState(undefined);
  const [error, setError] = useState(null);

  const [commentText, setCommentText] = useState({});
  const [loadingCommentPhotoId, setLoadingCommentPhotoId] = useState(null);
  const [commentError, setCommentError] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  useEffect(() => {
    let mounted = true;
    if (!userId) {
      setOwner(null);
      setPhotos([]);
      return;
    }

    Promise.all([
      fetchModel(`/photo/photosOfUser/${userId}`),
      fetchModel(`/user/${userId}`),
    ])
      .then(([photosData, userData]) => {
        if (!mounted) return;
        setPhotos(Array.isArray(photosData) ? photosData : []);
        setOwner(userData || null);
      })
      .catch((err) => {
        console.error("fetch photos/owner error:", err);
        if (mounted) setError(err.message || "Failed to load photos");
      });

    return () => {
      mounted = false;
    };
  }, [userId, like]);

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [photos, location.hash]);

  const handleAddComment = async (photoId) => {
    const commentContent = commentText[photoId]?.trim();

    if (!commentContent) {
      setCommentError({
        ...commentError,
        [photoId]: "Comment cannot be empty",
      });
      return;
    }

    setLoadingCommentPhotoId(photoId);
    setCommentError({ ...commentError, [photoId]: "" });

    try {
      const newComment = await fetchModel(
        `/commentsOfPhoto/${photoId}`,
        "POST",
        { comment: commentContent }
      );

      setPhotos((prevPhotos) =>
        prevPhotos.map((p) => {
          if (p._id === photoId) {
            return {
              ...p,
              comments: [...(p.comments || []), newComment],
            };
          }
          return p;
        })
      );

      setCommentText({ ...commentText, [photoId]: "" });
    } catch (err) {
      console.error("Error adding comment:", err);
      setCommentError({
        ...commentError,
        [photoId]: err.message || "Failed to add comment",
      });
    } finally {
      setLoadingCommentPhotoId(null);
    }
  };

  const handleAddLike = async (photoId, liked) => {
    try {
      if (!liked) {
        const response = await fetchModel(
          `/photo/likeOfPhoto/${photoId}/like`,
          "POST"
        );
        setLike(1);
        console.log(like);
      } else {
        const response = await fetch(
          `https://6h2l5v-8081.csb.app/api/photo/likeOfPhoto/${photoId}/like`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to unlike photo");
        }
        setLike(0);
        console.log(like);
      }
    } catch (err) {
      console.error("Like/Unlike error:", err);
    }
  };

  const handleUpdateComment = async (photoId, commentId) => {
    try {
      const updated = await fetchModel(
        `/comments/${commentId}`,
        "PUT",
        { comment: editCommentText }
      );
  
      setPhotos((prev) =>
        prev.map((p) =>
          p._id === photoId
            ? {
                ...p,
                comments: p.comments.map((c) =>
                  c._id === commentId
                    ? { ...c, comment: updated.comment.comment, date_time: updated.comment.date_time }
                    : c
                ),
              }
            : p
        )
      );
  
      setEditingCommentId(null);
      setEditCommentText("");
    } catch (err) {
      console.error("Update comment error:", err);
    }
  };

  const handleDeleteComment = async (photoId, commentId) => {
    try {
      await fetchModel(`/comments/${commentId}`, "DELETE");
  
      setPhotos((prev) =>
        prev.map((p) =>
          p._id === photoId
            ? {
                ...p,
                comments: p.comments.filter((c) => c._id !== commentId),
              }
            : p
        )
      );
    } catch (err) {
      console.error("Delete comment error:", err);
    }
  };
  
  
  //  HÀM TẠO IMAGE URL
  const getImageSrc = (fileName) => {
    // Kiểm tra nếu filename bắt đầu bằng số (ảnh upload mới từ backend)
    if (/^\d/.test(fileName)) {
      // Ảnh mới:  gọi từ backend
      return `http://localhost:8081/images/${fileName}`;
    } else {
      // Ảnh cũ: gọi từ frontend
      return `/images/${fileName}`;
    }
  };
  
  const isMyComment = (commentUserId) =>
    String(commentUserId) === String(currentUser._id);

  if (error) return <Typography variant="body1">Error: {error}</Typography>;
  if (owner === undefined || photos === null)
    return <Typography variant="body1">Loading…</Typography>;
  if (owner === null)
    return <Typography variant="body1">User not found.</Typography>;
  if (!photos || photos.length === 0)
    return <Typography variant="body1">No photos for this user.</Typography>;

  return (
    <Box className="user-photos" sx={{ display: "grid", gap: 2 }}>
      {photos.map((p) => {
        // Dùng hàm để xác định URL
        const imgSrc = getImageSrc(p.file_name);
        const liked = p.likes?.some(
          (l) => String(l.user_id) === String(currentUser._id)
        );

        return (
          <Card key={String(p._id)} id={p._id} elevation={1}>
            <CardHeader
              title={owner.first_name + " " + owner.last_name}
              subheader={formatDate(p.date_time)}
            />
            <CardContent>
              {p.file_name ? (
                <img
                  src={imgSrc}
                  alt={p.file_name}
                  style={{
                    width: "90%",
                    display: "block",
                    borderRadius: 8,
                  }}
                />
              ) : (
                <Typography variant="body2">
                  Image not found: {p.file_name}
                </Typography>
              )}
              {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  variant={liked ? "contained" : "outlined"}
                  color={liked ? "error" : "primary"}
                  size="small"
                  onClick={() => handleAddLike(p._id, liked)}
                  sx={{ mt: 1 }}
                >
                  {liked ? "Like" : "Like"}
                </Button>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {p.likes?.length} likes
                </Typography>
              </Box> */}

              {/* Phần Comments */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Comments ({p.comments ? p.comments.length : 0})
                </Typography>

                {!p.comments || p.comments.length === 0 ? (
                  <Typography variant="body2" sx={{ mb: 2, opacity: 0.7 }}>
                    No comments yet. Be the first to comment!
                  </Typography>
                ) : (
                  p.comments.map((c) => {
                    const mine = isMyComment(c.user?._id);
                    const isEditing = editingCommentId === c._id;

                    return (
                      <Box key={c._id} sx={{ mb: 2 }}>
                        <Divider sx={{ mb: 1 }} />

                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {formatDate(c.date_time)}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                          }}
                        >
                        {isEditing ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            sx={{ mt: 1 }}
                          />
                        ) : (
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            <RouterLink
                              to={`/users/${c.user?._id}`}
                              style={{ fontWeight: 600, textDecoration: "none" }}
                            >
                              {c.user
                                ? `${c.user.first_name} ${c.user.last_name}`
                                : "Unknown"}
                            </RouterLink>
                            {": "}
                            {c.comment}
                          </Typography>
                        )}

                        {mine && (
                          <Box sx={{ mt: 0.5, display: "flex", gap: 1 }}>
                            {isEditing ? (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => handleUpdateComment(p._id, c._id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => setEditingCommentId(null)}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => {
                                    setEditingCommentId(c._id);
                                    setEditCommentText(c.comment);
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="error"
                                  onClick={() => handleDeleteComment(p._id, c._id)}
                                >
                                  Delete
                                </Button>
                              </>
                            )};
                          </Box>
                          
                        )}
                        </Box>
                      </Box>
                    );
                  })
                )}

                {/* Form thêm comment */}
                <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #e0e0e0" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1.5, fontWeight: 600 }}
                  >
                    Add a Comment
                  </Typography>

                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Share your thoughts about this photo..."
                    value={commentText[p._id] || ""}
                    onChange={(e) =>
                      setCommentText({
                        ...commentText,
                        [p._id]: e.target.value,
                      })
                    }
                    disabled={loadingCommentPhotoId === p._id}
                    sx={{ mb: 1 }}
                    variant="outlined"
                    size="small"
                  />

                  {commentError[p._id] && (
                    <Typography
                      variant="caption"
                      sx={{ color: "error.main", display: "block", mb: 1 }}
                    >
                      {commentError[p._id]}
                    </Typography>
                  )}

                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleAddComment(p._id)}
                    disabled={loadingCommentPhotoId === p._id}
                    sx={{ mt: 1 }}
                  >
                    {loadingCommentPhotoId === p._id ? (
                      <>
                        <CircularProgress
                          size={16}
                          sx={{ mr: 1 }}
                          color="inherit"
                        />
                        Posting...
                      </>
                    ) : (
                      "Post Comment"
                    )}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

export default UserPhotos;
