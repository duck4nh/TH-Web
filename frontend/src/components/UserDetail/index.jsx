import React, { useEffect, useState } from "react";
import { Typography, Button } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

function UserDetail({currentUser}) {
  const { userId } = useParams();
  const [user, setUser] = useState(undefined);
  const [error, setError] = useState(null);

  const [friendList, setFriendList] = useState([]);
  const isMe = currentUser?._id === userId;
  const isFriend = friendList.includes(userId);

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

  useEffect(() => {
    if (!currentUser) return;

    fetchModel("/friend/list")
      .then((list) => {
        // convert ObjectId -> string cho chắc
        setFriendList((list || []).map(String));
      })
      .catch(console.error);
  }, [currentUser]);

  const handleAddFriend = async () => {
    await fetchModel(`/friend/add/${userId}`, "POST");
    setFriendList((prev) => [...prev, userId]);
  };

  const handleRemoveFriend = async () => {
    await fetchModel(`/friend/remove/${userId}`, "DELETE");
    setFriendList((prev) => prev.filter((id) => id !== userId));
  };

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
      {/* {!isMe && currentUser && (
          isFriend ? (
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={handleRemoveFriend}
              sx={{ width: "fit-content", mt: 1, ml: 1 }}
            >
              Hủy kết bạn
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleAddFriend}
              sx={{ width: "fit-content", mt: 1, ml : 1 }}
            >
              Kết bạn
            </Button>
          )
        )} */}
    </>
  );
}

export default UserDetail;
