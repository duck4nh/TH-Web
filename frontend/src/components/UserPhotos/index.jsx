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

function UserPhotos() {
  const { userId } = useParams();
  const location = useLocation();
  const [photos, setPhotos] = useState(null);
  const [owner, setOwner] = useState(undefined);
  const [error, setError] = useState(null);

  const [commentText, setCommentText] = useState({});
  const [loadingCommentPhotoId, setLoadingCommentPhotoId] = useState(null);
  const [commentError, setCommentError] = useState({});

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
  }, [userId]);

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
                  p.comments.map((c) => (
                    <Box key={String(c._id)} sx={{ mb: 2 }}>
                      <Divider sx={{ mb: 1 }} />
                      <Typography
                        variant="caption"
                        sx={{ display: "block", opacity: 0.7, mb: 0.5 }}
                      >
                        {formatDate(c.date_time)}
                      </Typography>
                      <Typography variant="body2">
                        <RouterLink
                          to={`/users/${c.user?._id}`}
                          style={{ textDecoration: "none", fontWeight: 600 }}
                        >
                          {c.user
                            ? `${c.user.first_name} ${c.user.last_name}`
                            : "Unknown"}
                        </RouterLink>
                        {":  "}
                        {c.comment}
                      </Typography>
                    </Box>
                  ))
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
