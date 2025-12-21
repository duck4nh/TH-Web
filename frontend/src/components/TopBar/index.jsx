import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { useLocation } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

export default function TopBar({ currentUser, onLogout }) {
  const location = useLocation();
  const path = location.pathname;
  const [rightText, setRightText] = useState("User List");

  useEffect(() => {
    let mounted = true;

    // Nếu không có user, hiển thị "Please Login"
    if (!currentUser) {
      setRightText("Please Login");
      return () => {
        mounted = false;
      };
    }

    // Nếu có user, hiển thị context based on route
    let m = path.match(/^\/users\/(\w+)/);
    if (m) {
      const userId = m[1];
      fetchModel(`/user/${userId}`)
        .then((data) => {
          if (!mounted) return;
          if (data) {
            setRightText(`${data.first_name} ${data.last_name}`);
          } else {
            setRightText("User not found");
          }
        })
        .catch(() => mounted && setRightText("User"));
      return () => {
        mounted = false;
      };
    }

    m = path.match(/^\/photos\/(\w+)/);
    if (m) {
      const userId = m[1];
      fetchModel(`/user/${userId}`)
        .then((data) => {
          if (!mounted) return;
          if (data) {
            setRightText(`Photos of ${data.first_name} ${data.last_name}`);
          } else {
            setRightText("Photos");
          }
        })
        .catch(() => mounted && setRightText("Photos"));
      return () => {
        mounted = false;
      };
    }

    setRightText("User List");

    return () => {
      mounted = false;
    };
  }, [path, currentUser]);


  //Handle logout - sử dụng fetchModel
  const handleLogout = async () => {
    try {
      await fetchModel("/admin/logout", "POST");
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
      onLogout();
    }
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" color="inherit">
          Chu Duc Anh
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Hiển thị "Hi <firstname>" hoặc "Please Login" */}
          {currentUser ? (
            <>
              <Typography variant="subtitle1" color="inherit">
                Hi {currentUser.first_name}
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleLogout}
                size="small"
              >
                Logout
              </Button>
            </>
          ) : (
            <Typography variant="subtitle1" color="inherit">
              {rightText}
            </Typography>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}