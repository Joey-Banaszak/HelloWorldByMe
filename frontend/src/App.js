import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import React from "react";
import Home from "./Home";
import Profile from "./Profile";
import Messages from "./Messages";
import People from "./People";
import Login from "./Login";
import SignUp from "./SignUp";
import Layout from "./Layout";
import OrganizationHome from "./OrganizationHome";
import AvailableOrganizations from "./AvailableOrganizations";
import { useAuth } from "./AuthContext"; // ⬅️ new
import "./styles.css";
import NavigatorForm from "./NavForm";
import ServiceMatch from "./ServiceMatch";
import Mapping from "./Mapping";

const App = () => {
  const { isAuthenticated } = useAuth(); // ⬅️ using global context now

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout>
                <Home />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/organizations/:id"
          element={
            isAuthenticated ? (
              <Layout>
                <OrganizationHome />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/join-orgs"
          element={
            isAuthenticated ? (
              <Layout>
                <AvailableOrganizations />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <Layout>
                <Profile />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/messages"
          element={
            isAuthenticated ? (
              <Layout>
                <Messages />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/people"
          element={
            isAuthenticated ? (
              <Layout>
                <People />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/nav-form"
          element={
            isAuthenticated ? (
              <Layout>
                <NavigatorForm />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/service-match"
          element={
            isAuthenticated ? (
              <Layout>
                <ServiceMatch />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/mapping"
          element={
            isAuthenticated ? (
              <Layout>
                <Mapping />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
