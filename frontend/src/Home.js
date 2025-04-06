import React, { useState } from "react";
import Layout from "./Layout";
import "./styles.css";

const Home = () => {
  const [selectedItem, setSelectedItem] = useState("");

  return (
    <Layout>
      <div className="main-title">add item to your Home Page</div>
      
      <div className="radio-options">
        <label>
          <input
            type="radio"
            name="itemType"
            value="blog"
            onChange={(e) => setSelectedItem(e.target.value)}
          />
          blog
        </label>
        <label>
          <input
            type="radio"
            name="itemType"
            value="file"
            onChange={(e) => setSelectedItem(e.target.value)}
          />
          file
        </label>
        <label>
          <input
            type="radio"
            name="itemType"
            value="folder"
            onChange={(e) => setSelectedItem(e.target.value)}
          />
          folder
        </label>
      </div>

      <div className="button-container">
        <button className="continue-button">continue</button>
        <button className="cancel-button">cancel</button>
      </div>
    </Layout>
  );
};

export default Home;
