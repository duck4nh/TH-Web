import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

export default function TopBar({ currentUser, onLogout }) {
  const location = useLocation();
  const path = location.pathname;
  const [rightText, setRightText] = useState("User List");
  const navigate = useNavigate();

  // State cho upload dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

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

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    try {
      await fetchModel("/admin/logout", "POST");
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
      onLogout();
    }
  };

  // Xử lý chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadError("");
    }
  };

  // Xử lý upload photo
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("http://localhost:8081/api/photo/new", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const newPhoto = await response.json();
      console.log("Photo uploaded successfully:", newPhoto);

      setUploadSuccess(true);
      setSelectedFile(null);
      document.getElementById("file-input").value = "";

      // Đóng dialog sau 1 giây
      setTimeout(() => {
        setOpenDialog(false);
        setUploadSuccess(false);
        // Refresh photos
        if (currentUser) {
          navigate(`/photos/${currentUser._id}`);
        }
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  // Đóng dialog
  const handleCloseDialog = () => {
    if (! uploading) {
      setOpenDialog(false);
      setSelectedFile(null);
      setUploadError("");
      setUploadSuccess(false);
      document.getElementById("file-input").value = "";
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

              {/* ✅ Nút Add Photo */}
              <Button
                variant="contained"
                color="success"
                startIcon={<CloudUploadIcon />}
                onClick={() => setOpenDialog(true)}
                size="small"
                sx={{
                  backgroundColor: "#4caf50",
                  "&:hover": { backgroundColor: "#45a049" },
                }}
              >
                Add Photo
              </Button>

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
            <>
              <Typography variant="subtitle1" color="inherit">
                Please Login
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleLogin}
                size="small"
              >
                Login
              </Button>
            </>
          )}
        </Box>
      </Toolbar>

      {/* ✅ Dialog Upload Photo */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload a New Photo</DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadError}
            </Alert>
          )}

          {uploadSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              ✓ Photo uploaded successfully!
            </Alert>
          )}

          {/* Drag-drop zone */}
          <Box
            onClick={() => document.getElementById("file-input").click()}
            sx={{
              border: "2px dashed #ccc",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              transition:  "all 0.3s",
              backgroundColor: selectedFile ?"#e8f5e9" : "transparent",
              borderColor: selectedFile ?"#4caf50" : "#ccc",
              "&:hover": {
                borderColor: "#4caf50",
                backgroundColor: "#f1f8f6",
              },
            }}
          >
            <CloudUploadIcon
              sx={{ fontSize: 48, color: "#4caf50", mb: 1 }}
            />
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              Click to select or drag and drop
            </Typography>
            <Typography variant="caption" color="textSecondary">
              JPG, PNG, GIF, WebP (Max 10MB)
            </Typography>

            {selectedFile && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#4caf50" }}>
                  ✓ {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
            )}
          </Box>

          {/* Hidden file input */}
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            disabled={uploading}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            color="success"
            disabled={! selectedFile || uploading}
          >
            {uploading ?(
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
}