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

function UserComments() {
  const { userId } = useParams();
  const [comments, setComments] = useState(null);
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetchModel(`/commentsOfUser/${userId}`),
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
  }, [userId]);

  if (!comments || !owner) return <Typography>Loading…</Typography>;
  if (comments.length === 0)
    return <Typography>No comments by this user.</Typography>;

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Comments by {owner.first_name} {owner.last_name}
      </Typography>

      {comments.map((c) => (
        <Card key={c._id} sx={{ display: "flex", gap: 2, p: 2 }}>
          <Link to={`/photos/${c.photo.user_id}#${c.photo._id}`}>
            <CardMedia
              component="img"
              image={`/images/${c.photo.file_name}`}
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
            <Typography variant="caption">{formatDate(c.date_time)}</Typography>

            <Divider sx={{ my: 1 }} />

            <Typography variant="body1">
              <Link
                to={`/photos/${c.photo._id}`}
                style={{ textDecoration: "none" }}
              >
                {c.comment}
              </Link>
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export default UserComments;
