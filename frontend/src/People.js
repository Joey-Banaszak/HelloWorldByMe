import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "./Layout";
import "./styles.css";

const People = () => {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const token = localStorage.getItem("token");

  const fetchOrgs = async () => {
    try {
      const res = await axios.get("/api/organizations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrgs(res.data.organizations);
    } catch (err) {
      console.error("Failed to fetch organizations", err);
    }
  };

  const createOrg = async () => {
    try {
      await axios.post(
        "/api/organizations",
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      setDescription("");
      fetchOrgs();
    } catch (err) {
      console.error("Failed to create organization", err);
    }
  };

  const selectOrg = async (org) => {
    setSelectedOrg(org);
    try {
      const res = await axios.get(
        `/api/organizations/${org.id}/members`
      );
      setMembers(res.data.members);
    } catch (err) {
      console.error("Failed to fetch members", err);
    }
  };

  const inviteMember = async () => {
    try {
      await axios.post(
        `/api/organizations/${selectedOrg.id}/add`,
        { target_user_id: inviteUserId, role: inviteRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInviteUserId("");
      setInviteRole("member");
      selectOrg(selectedOrg);
    } catch (err) {
      console.error("Failed to add member", err);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  return (
    <Layout>
      <div className="org-container">
        <h2>People & Organizations</h2>

        <div className="create-org">
          <h3>Create New Organization</h3>
          <input
            type="text"
            placeholder="Organization Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button onClick={createOrg}>Create</button>
        </div>

        <div className="org-list">
          <h3>Your Organizations</h3>
          {orgs.map((org) => (
            <div key={org.id} className="org-item" onClick={() => navigate(`/organizations/${org.id}`)}>
              <strong>{org.name}</strong>
              <p>{org.description}</p>
              <span className="role-tag">{org.role}</span>
            </div>
          ))}
        </div>

        {selectedOrg && (
          <div className="org-details">
            <h3>Members of {selectedOrg.name}</h3>
            <ul>
              {members.map((m) => (
                <li key={m.user_id}>{m.name} - <em>{m.role}</em></li>
              ))}
            </ul>
            <div className="invite-member">
              <h4>Invite Member</h4>
              <input
                type="text"
                placeholder="Username"
                value={inviteUserId}
                onChange={(e) => setInviteUserId(e.target.value)}
              />
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={inviteMember}>Add Member</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default People;
