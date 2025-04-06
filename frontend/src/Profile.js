import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./Layout";
import "./styles.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ bio: "", organization: "" });
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Fetch user profile
    axios.get("/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      setUser(response.data.user);
      setProfile(response.data.profile || { bio: "", organization: "" });
      setLoading(false);
    })
    .catch(error => {
      console.error("Profile Fetch Error:", error);
      setLoading(false);
    });

    // Fetch user's organizations
    axios.get("/api/organizations", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => setOrgs(response.data.organizations || []))
    .catch(error => console.error("Org Fetch Error:", error));
  }, [token]);

  const handleBioSave = async () => {
    setSaving(true);
    try {
      await axios.put("/api/auth/profile", {
        bio: profile.bio
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Bio updated!");
    } catch (error) {
      console.error("Failed to update bio", error);
      alert("Error saving bio");
    }
    setSaving(false);
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Error loading profile.</div>;

  return (
    <Layout>
      <div className="profile-container">
        <h2>Welcome, {user.name}!</h2>

        <div className="profile-section">
          <label htmlFor="bio"><strong>Bio:</strong></label>
          <textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Tell us about yourself..."
          />
          <button onClick={handleBioSave} disabled={saving}>
            {saving ? "Saving..." : "Save Bio"}
          </button>
        </div>

        <div className="profile-section">
          <h3>Active Organizations</h3>
          {orgs.length === 0 ? (
            <p>You are not part of any organizations.</p>
          ) : (
            <ul>
              {orgs.map((org) => (
                <li key={org.id}>
                  {org.name} ({org.role})<br />
                  <small>Joined: {new Date(org.joined_at).toLocaleDateString()}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
