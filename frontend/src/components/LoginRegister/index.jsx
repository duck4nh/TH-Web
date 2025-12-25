import React, { useState } from "react";
import { Box, TextField, Button, Typography, Paper, Divider, Alert } from "@mui/material";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

function LoginRegister({ onLoginSuccess }) {
    const [loginName, setLoginName] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    const [regLoginName, setRegLoginName] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regPassword2, setRegPassword2] = useState("");
    const [regFirstName, setRegFirstName] = useState("");
    const [regLastName, setRegLastName] = useState("");
    const [regLocation, setRegLocation] = useState("");
    const [regDescription, setRegDescription] = useState("");
    const [regOccupation, setRegOccupation] = useState("");
    const [regError, setRegError] = useState("");
    const [regSuccess, setRegSuccess] = useState("");
    const [regLoading, setRegLoading] = useState(false);

    // Handle login submit
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError("");
        setLoginLoading(true);

        // Validate input
        if (!loginName || !loginPassword) {
            setLoginError("Please enter login name and password");
            setLoginLoading(false);
            return;
        }
        try {
            // Gọi POST /admin/login với fetchModel
            const userData = await fetchModel("/admin/login", "POST", {
                login_name: loginName,
                password: loginPassword,
            });
            onLoginSuccess(userData);
        } catch (error) {
            setLoginError(error.message || "Login failed.  Please try again.");
        } finally {
            setLoginLoading(false);
        }
    };

    // Handle registration submit
    const handleRegister = async (e) => {
        e.preventDefault();
        setRegError("");
        setRegSuccess("");
        setRegLoading(true);

        if (regPassword !== regPassword2) {
            setRegError("Passwords do not match");
            setRegLoading(false);
            return;
        }

        if (!regLoginName || !regPassword || !regFirstName || !regLastName) {
            setRegError("Please fill in all required fields (marked with *)");
            setRegLoading(false);
            return;
        }

        if (regPassword.trim() === "") {
            setRegError("Password cannot be empty");
            setRegLoading(false);
            return;
        }

        try {
            // Gọi POST /user với fetchModel
            await fetchModel("/user", "POST", {
                login_name: regLoginName,
                password: regPassword,
                first_name: regFirstName,
                last_name: regLastName,
                location: regLocation || "",
                description: regDescription || "",
                occupation: regOccupation || "",
            });
            setRegSuccess("Registration successful! You can now login with your credentials.");
            setRegLoginName("");
            setRegPassword("");
            setRegPassword2("");
            setRegFirstName("");
            setRegLastName("");
            setRegLocation("");
            setRegDescription("");
            setRegOccupation("");
        } catch (error) {
            setRegError(error.message || "Registration failed. Please try again.");
        } finally {
            setRegLoading(false);
        }
    };

    return (
        <Box sx={{ display: "flex", gap: 3, flexDirection: "column", p: 2 }}>
            {/* ==================== LOGIN SECTION ==================== */}
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                    Login
                </Typography>

                {loginError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLoginError("")}>
                        {loginError}
                    </Alert>
                )}

                <form onSubmit={handleLogin}>
                    <TextField
                        label="Login Name"
                        fullWidth
                        margin="normal"
                        value={loginName}
                        onChange={(e) => setLoginName(e.target.value)}
                        disabled={loginLoading}
                        required
                        autoComplete="username"
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={loginLoading}
                        required
                        autoComplete="current-password"
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                        disabled={loginLoading}
                    >
                        {loginLoading ? "Logging in..." : "Login"}
                    </Button>
                </form>
            </Paper>

            <Divider />
            {/* ==================== REGISTRATION SECTION ==================== */}
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                    Register New Account
                </Typography>

                {regError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setRegError("")}>
                        {regError}
                    </Alert>
                )}

                {regSuccess && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setRegSuccess("")}>
                        {regSuccess}
                    </Alert>
                )}

                <form onSubmit={handleRegister}>
                    <TextField
                        label="Login Name"
                        fullWidth
                        margin="normal"
                        value={regLoginName}
                        onChange={(e) => setRegLoginName(e.target.value)}
                        disabled={regLoading}
                        required
                        autoComplete="username"
                        helperText="Unique username for login"
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        disabled={regLoading}
                        required
                        autoComplete="new-password"
                    />
                    <TextField
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={regPassword2}
                        onChange={(e) => setRegPassword2(e.target.value)}
                        disabled={regLoading}
                        required
                        autoComplete="new-password"
                        error={regPassword2 !== "" && regPassword !== regPassword2}
                        helperText={
                            regPassword2 !== "" && regPassword !== regPassword2
                                ? "Passwords do not match"
                                : ""
                        }
                    />
                    <TextField
                        label="First Name"
                        fullWidth
                        margin="normal"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        disabled={regLoading}
                        required
                        autoComplete="given-name"
                    />
                    <TextField
                        label="Last Name"
                        fullWidth
                        margin="normal"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        disabled={regLoading}
                        required
                        autoComplete="family-name"
                    />
                    <TextField
                        label="Location"
                        fullWidth
                        margin="normal"
                        value={regLocation}
                        onChange={(e) => setRegLocation(e.target.value)}
                        disabled={regLoading}
                        autoComplete="address-level2"
                    />
                    <TextField
                        label="Description"
                        fullWidth
                        margin="normal"
                        multiline
                        rows={3}
                        value={regDescription}
                        onChange={(e) => setRegDescription(e.target.value)}
                        disabled={regLoading}
                        placeholder="Tell us about yourself..."
                    />
                    <TextField
                        label="Occupation"
                        fullWidth
                        margin="normal"
                        value={regOccupation}
                        onChange={(e) => setRegOccupation(e.target.value)}
                        disabled={regLoading}
                        autoComplete="organization-title"
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        fullWidth
                        sx={{ mt: 2 }}
                        disabled={regLoading}
                    >
                        {regLoading ? "Registering..." : "Register Me"}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}

export default LoginRegister;