import "./App.css";

import React, { useState, useEffect } from "react";
import { Grid, Typography, Paper } from "@mui/material";
import { BrowserRouter as Router, Route, Routes, Navigate} from "react-router-dom";

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import UserComments from "./components/UserComments";
import LoginRegister from "./components/LoginRegister";
import fetchModel from "./lib/fetchModelData";


function ProtectedRoute({ currentUser, children }) {
  return currentUser ? children : <Navigate to="/login" replace />;
}

function RedirectToLogin() {
  return <Navigate to="/login" replace />;
}

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  //Check nếu user đã login khi app load
  useEffect(() => {
    fetchModel("/admin/whoami")
      .then((userData) => {
        setCurrentUser(userData);
      })
      .catch(() => {
        setCurrentUser(null);
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (isCheckingAuth) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography variant="h6">Loading...</Typography>
      </div>
    );
  }

  return (
    <Router>
      <AppContent
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />
    </Router>
  );
};


function AppContent({ currentUser, onLoginSuccess, onLogout }) {
  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TopBar currentUser={currentUser} onLogout={onLogout} />
        </Grid>
        <div className="main-topbar-buffer" />

        {/* UserList chỉ hiển thị nếu có user login */}
        <Grid item sm={3}>
          <Paper className="main-grid-item">
            {/* <UserList /> */}
            {currentUser ? (
              <UserList />
            ) : (
              <Typography sx={{ p: 2 }} variant="body2" color="text.secondary">
                Please login to view users
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item sm={9}>
          <Paper className="main-grid-item">
            <Routes>
              <Route
                path="/login"
                element={
                  currentUser ? (
                    <Navigate to={`/users/${currentUser._id}`} replace />
                  ) : (
                    <LoginRegister onLoginSuccess={onLoginSuccess} />
                  )
                }
              />

              <Route
                path="/users/:userId"
                element={
                  <ProtectedRoute currentUser={currentUser}>
                    <UserDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/photos/:userId"
                element={
                  <ProtectedRoute currentUser={currentUser}>
                    <UserPhotos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comments/:userId"
                element={
                  <ProtectedRoute currentUser={currentUser}>
                    <UserComments />
                  </ProtectedRoute>
                }
              />
              {/* <Route
                path="/users"
                element={
                  <ProtectedRoute currentUser={currentUser}>
                    <UserList />
                  </ProtectedRoute>
                }
              /> */}

              <Route
                path="/"
                element={
                  currentUser ? (
                    <Navigate to={`/users/${currentUser._id}`} replace />
                    // null
                  ) : (
                    // <Navigate to="/login" replace />
                    null
                  )
                }
              />

              <Route path="*" element={<RedirectToLogin />} />
            </Routes>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;