import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  Box,
  Divider,
} from "@mui/material";
import fetchModel from "../../lib/fetchModelData";

function formatDate(d) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(d));
  } catch {
    return d;
  }
}

function Test({ currentUser, searchText }) {
  const userId = currentUser._id;
  const [comments, setComments] = useState(null);
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetchModel(`/commentsOfSearch/?keyword=${searchText}`),
      fetchModel(`/user/${userId}`),
    ]).then(([comments, userData]) => {
      if (!mounted) return;
      setComments(Array.isArray(comments) ? comments : []);
      setOwner(userData || null);
      console.log(comments);
      console.log(owner);
    });

    return () => {
      mounted = false;
    };
  }, [userId, searchText]);

  if (!comments || !owner) return <Typography>Loading…</Typography>;
  if (comments.length === 0)
    return <Typography>No comments by this user.</Typography>;

  const filteredComments = comments.filter(
    (c) => c.photo.user_id === currentUser._id
  );
  
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

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Comments by "{searchText}""
      </Typography>

      {comments.map((c) => {
        const imgSrc = getImageSrc(c.photo.file_name);

        return (
          <Card key={c._id} sx={{ display: "flex", gap: 2, p: 2 }}>
            <Link to={`/photos/${c.photo.user_id}#${c.photo._id}`}>
              <CardMedia
                component="img"
                image={imgSrc}
                alt={c.photo.file_name}
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: 2,
                  objectFit: "cover",
                }}
              />
            </Link>

            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="caption">
                {formatDate(c.date_time)}
              </Typography>

              <Divider sx={{ my: 1 }} />

              <Typography variant="body1">
                <Link
                  to={`/photos/${c.photo.user_id}#${c.photo._id}`}
                  style={{ textDecoration: "none" }}
                >
                  {c.comment}
                </Link>
              </Typography>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

export default Test;
