import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  TextField,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import fetchModel from "../../lib/fetchModelData";

export default function AccountProfile({ currentUser }) {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      setForm(currentUser);
    }
  }, []);

  if (!user || !form) return <CircularProgress />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setForm(user); // reset về dữ liệu gốc
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await fetchModel("/admin/profile", "PUT", {
        first_name: form.first_name,
        last_name: form.last_name,
        location: form.location,
        description: form.description,
        occupation: form.occupation,
      });

      setUser(updated);
      setForm(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
      <Card>
        <CardHeader title="My Account" />

        <CardContent>
          <TextField
            label="First Name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            fullWidth
            disabled={!isEditing}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Last Name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            fullWidth
            disabled={!isEditing}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Location"
            name="location"
            value={form.location || ""}
            onChange={handleChange}
            fullWidth
            disabled={!isEditing}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Occupation"
            name="occupation"
            value={form.occupation || ""}
            onChange={handleChange}
            fullWidth
            disabled={!isEditing}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Description"
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            disabled={!isEditing}
          />

          {/* Action buttons */}
          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            {!isEditing ? (
              <Button variant="contained" onClick={handleEdit}>
                Edit
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
