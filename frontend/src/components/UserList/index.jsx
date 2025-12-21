import React, { useEffect, useState } from "react";
import {
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Box,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

function UserList() {
  const [users, setUsers] = useState(null);
  const [photoCounts, setPhotoCounts] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Load list of all users
    fetchModel("/user/list")
      .then(async (data) => {
        if (!mounted) return;

        const userList = Array.isArray(data) ? data : [];
        setUsers(userList);

        // Load photo count + comment count for each user
        const photoCountObj = {};
        const commentCountObj = {};

        for (const u of userList) {
          const userId = u._id;

          // Photos count
          const photos = await fetchModel(`/photo/photosOfUser/${userId}`);
          photoCountObj[userId] = Array.isArray(photos) ? photos.length : 0;

          // Comment count
          const comments = await fetchModel(`/commentsOfUser/${userId}`);
          commentCountObj[userId] = Array.isArray(comments)
            ? comments.length
            : 0;
        }

        if (mounted) {
          setPhotoCounts(photoCountObj);
          setCommentCounts(commentCountObj);
        }
      })
      .catch((err) => {
        console.error("fetch user list error:", err);
        if (mounted) setError(err.message || "Failed to load users");
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (error) return <Typography>Error: {error}</Typography>;
  if (!users) return <Typography>Loading users...</Typography>;

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 1 }}>
        User List
      </Typography>

      <List component="nav">
        {users.map((user) => {
          const userId = user._id;
          return (
            <ListItemButton
              key={userId}
              component={RouterLink}
              to={`/users/${userId}`}
              divider
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <ListItemText primary={`${user.first_name} ${user.last_name}`} />

              <Box sx={{ display: "flex", gap: 1 }}>
                {/* Green photo bubble */}
                <Box
                  sx={{
                    background: "green",
                    color: "white",
                    px: 1.2,
                    borderRadius: 12,
                    fontSize: "0.8rem",
                  }}
                >
                  {photoCounts[userId] ?? 0}
                </Box>

                {/* Red comment bubble -> clickable */}
                <Box
                  component={RouterLink}
                  to={`/comments/${userId}`}
                  sx={{
                    background: "red",
                    color: "white",
                    px: 1.2,
                    borderRadius: 12,
                    fontSize: "0.8rem",
                    textDecoration: "none",
                  }}
                >
                  {commentCounts[userId] ?? 0}
                </Box>
              </Box>
            </ListItemButton>
          );
        })}
      </List>
    </div>
  );
}

export default UserList;
