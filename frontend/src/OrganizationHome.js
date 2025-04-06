import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "./Layout";
import axios from "axios";

const OrganizationHome = () => {
  const { id } = useParams();
  const [org, setOrg] = useState(null);
  const [requests, setRequests] = useState([]);
  const [members, setMembers] = useState([]);

  const token = localStorage.getItem("token");

  const fetchOrg = async () => {
    const res = await axios.get("/api/organizations", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const found = res.data.organizations.find((o) => o.id.toString() === id);
    setOrg(found);
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`/api/organizations/${id}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests);
    } catch (err) {
      // Not an admin? Ignore.
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`/api/organizations/${id}/members`);
      setMembers(res.data.members);
    } catch (err) {
      console.error("Failed to fetch members", err);
    }
  };

  const approveRequest = async (requestId, userId) => {
    try {
      await axios.post(
        `/api/organizations/${id}/add`,
        { target_user_id: userId, role: "member" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.post(
        `/api/requests/${requestId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRequests(requests.filter((r) => r.id !== requestId));
      fetchMembers();
    } catch (err) {
      console.error("Failed to approve member", err);
    }
  };

  useEffect(() => {
    fetchOrg();
    fetchRequests();
    fetchMembers();
  }, [id]);

  return (
    <Layout>
      <div className="main-title">Organization Home</div>
      {org && (
        <>
          <h2>{org.name}</h2>
          <p>{org.description}</p>
          <p><strong>Your Role:</strong> {org.role}</p>
        </>
      )}

    <div style={{ marginTop: "20px" }}>
    <h3>Members</h3>
    <ul>
        {members.map((m) => (
        <li key={m.user_id}>
            {m.name} ({m.user_id}) –
            <select
            value={m.role}
            onChange={async (e) => {
                const newRole = e.target.value;
                try {
                await axios.post(
                    `http://localhost:5000/api/organizations/${id}/members/${m.user_id}/role`,
                    { role: newRole },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                fetchMembers(); 
                } catch (err) {
                alert("Failed to update role");
                }
            }}
            >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            </select>

            <button
            onClick={async () => {
                if (window.confirm(`Remove ${m.name} from the organization?`)) {
                try {
                    await axios.delete(
                    `http://localhost:5000/api/organizations/${id}/members/${m.user_id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                    );
                    fetchMembers(); 
                } catch (err) {
                    alert("Failed to remove member");
                }
                }
            }}
            style={{ marginLeft: "10px", background: "red", color: "white" }}
            >
            Kick
            </button>
        </li>
        ))}
    </ul>
    </div>


      {requests.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Join Requests</h3>
          <ul>
            {requests.map((r) => (
              <li key={r.id}>
                {r.name} ({r.user_id}) – {new Date(r.requested_at).toLocaleString()}
                <button onClick={() => approveRequest(r.id, r.user_id)}>Approve</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Layout>
  );
};

export default OrganizationHome;
