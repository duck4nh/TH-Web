import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import { Link, useParams, useLocation } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch (e) {
    return dateStr;
  }
}

function UserPhotos() {
  const { userId } = useParams();
  const location = useLocation(); // để lấy fragment
  const [photos, setPhotos] = useState(null);
  const [owner, setOwner] = useState(undefined);
  const [error, setError] = useState(null);

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

  // Scroll đến fragment nếu có
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [photos, location.hash]); // chạy khi photos load xong hoặc fragment thay đổi

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
        const imgSrc = `/images/${p.file_name}`;

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
                    width: "100%",
                    maxWidth: 720,
                    display: "block",
                    borderRadius: 8,
                  }}
                />
              ) : (
                <Typography variant="body2">
                  Image not found: {p.file_name}
                </Typography>
              )}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Comments
                </Typography>
                {(!p.comments || p.comments.length === 0) && (
                  <Typography variant="body2">No comments yet.</Typography>
                )}
                {p.comments &&
                  p.comments.map((c) => (
                    <Box key={String(c._id)} sx={{ mb: 1.5 }}>
                      <Divider sx={{ mb: 1 }} />
                      <Typography
                        variant="caption"
                        sx={{ display: "block", opacity: 0.8 }}
                      >
                        {formatDate(c.date_time)}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        <Link
                          to={`/users/${c.user?._id}`}
                          style={{ textDecoration: "none" }}
                        >
                          {c.user
                            ? `${c.user.first_name} ${c.user.last_name}`
                            : "Unknown"}
                        </Link>
                        {": "}
                        {c.comment}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

export default UserPhotos;
