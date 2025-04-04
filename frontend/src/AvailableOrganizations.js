import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import axios from "axios";

const AvailableOrganizations = () => {
  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await axios.get("/api/organizations/all");
        setOrgs(res.data.organizations);
      } catch (err) {
        console.error("Failed to load orgs", err);
      }
    };
    fetchOrgs();
  }, []);

  const requestToJoin = async (orgId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`/api/organizations/${orgId}/request`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Join request sent!");
    } catch (err) {
      alert("You may have already requested to join.");
    }
  };

  return (
    <Layout>
      <h2>Browse Organizations</h2>
      {orgs.map((org) => (
        <div key={org.id} className="org-item">
          <strong>{org.name}</strong>
          <p>{org.description}</p>
          <button onClick={() => requestToJoin(org.id)}>Request to Join</button>
        </div>
      ))}
    </Layout>
  );
};

export default AvailableOrganizations;
