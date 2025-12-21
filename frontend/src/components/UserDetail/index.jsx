import React, { useEffect, useState } from "react";
import { Typography, Button } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!userId) {
      setUser(null);
      return;
    }

    fetchModel(`/user/${userId}`)
      .then((data) => {
        if (!mounted) return;
        setUser(data || null);
      })
      .catch((err) => {
        console.error("fetch /user/:id error:", err);
        if (mounted) setError(err.message || "Failed to load user");
      });

    return () => {
      mounted = false;
    };
  }, [userId]);

  if (error) return <Typography variant="body1">Error: {error}</Typography>;
  if (user === undefined)
    return <Typography variant="body1">Loading user…</Typography>;
  if (user === null)
    return (
      <Typography variant="body1">User with ID {userId} not found.</Typography>
    );

  return (
    <>
      <Typography variant="h4">
        {user.first_name} {user.last_name}
      </Typography>
      <Typography variant="body1">
        <b>Location : </b>
        {user.location}
      </Typography>
      <Typography variant="body1">
        <b>Occupation : </b>
        {user.occupation}
      </Typography>
      <Typography variant="body1">
        <b>Description : </b>
        {user.description}
      </Typography>

      <Button
        component={RouterLink}
        to={`/photos/${userId}`}
        variant="contained"
        size="small"
        sx={{ width: "fit-content", mt: 1 }}
      >
        View photos
      </Button>
    </>
  );
}

export default UserDetail;
