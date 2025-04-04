import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./Layout";
import "./styles.css";

const Messages = () => {
  const [inbox, setInbox] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios.get("/messages/inbox", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => setInbox(response.data.messages || []))
    .catch(error => console.error("Error fetching inbox messages:", error));

    axios.get("/messages/sent", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => setSentMessages(response.data.messages || []))
    .catch(error => console.error("Error fetching sent messages:", error));
  }, [token]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setError("");

    if (query.length > 2) {
      try {
        const response = await axios.get(`/api/users/search?query=${query}`);
        setSearchResults(response.data.users);
      } catch (error) {
        console.error("Error searching users:", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const selectUserForMessage = (user) => {
    setSelectedUser(user);
    setSearchQuery(user.name);
    setSearchResults([]);
    setError("");
  };

  const sendMessage = async () => {
    if (!selectedUser && !selectedMessage) {
      setError("Please select a user or reply to a message.");
      return;
    }

    const receiver = selectedUser
      ? selectedUser.user_id
      : selectedMessage.sender === userId
      ? selectedMessage.receiver
      : selectedMessage.sender;

    const content = selectedUser ? newMessage : replyMessage;

    if (content.trim() === "") {
      setError("Message cannot be empty.");
      return;
    }

    try {
      await axios.post("/messages", {
        sender: userId,
        receiver,
        content,
      });

      setNewMessage("");
      setReplyMessage("");
      setSelectedMessage(null);
      setSelectedUser(null);
      alert("Message sent!");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Try again.");
    }
  };

  const deleteMessage = async (id) => {
    try {
      await axios.delete(`/api/messages/delete/${id}`);
      setInbox(inbox.filter((m) => m.id !== id));
    } catch (err) {
      alert("Failed to delete message");
    }
  };

  const archiveMessage = async (id) => {
    try {
      await axios.put(`/api/messages/archive/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInbox(inbox.filter((m) => m.id !== id));
    } catch (err) {
      alert("Failed to archive message");
    }
  };

  const handleSelectMessage = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      try {
        await axios.put(`/api/messages/${msg.id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Failed to mark message as read");
      }
    }
  };

  return (
    <Layout>
      <div className="messages-container">
        <h2>Messages</h2>

        <div className="messages-list">
          {inbox.map((msg) => (
            <div
              key={msg.id}
              className={`chat-bubble chat-left`}
            >
              <div>{msg.content}</div>
              <div className="chat-meta">
                From: {msg.sender} | {new Date(msg.timestamp).toLocaleString()}
              </div>
              <div className="chat-actions">
                <button onClick={() => deleteMessage(msg.id)}>🗑️</button>
                <button onClick={() => archiveMessage(msg.id)}>📥 Archive</button>
                <button onClick={() => handleSelectMessage(msg)}>↩️ Reply</button>
              </div>
            </div>
          ))}

          {sentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-bubble chat-right`}
            >
              <div>{msg.content}</div>
              <div className="chat-meta">
                To: {msg.receiver} | {new Date(msg.timestamp).toLocaleString()}
              </div>
              <div className="chat-actions">
                <button onClick={() => deleteMessage(msg.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMessage && (
        <div className="message-action-container">
          <h3>Reply to {selectedMessage.sender}</h3>
          <p>{selectedMessage.content}</p>
          <textarea
            placeholder="Type your reply..."
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
          />
          <button onClick={sendMessage}>Send Reply</button>
          <button onClick={() => setSelectedMessage(null)}>Cancel</button>
        </div>
      )}

      <div className="message-input-container">
        <h3>Send a Message</h3>
        {error && <p className="error-message">{error}</p>}
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((user) => (
              <p key={user.user_id} onClick={() => selectUserForMessage(user)}>
                {user.name} (@{user.user_id})
              </p>
            ))}
          </div>
        )}
        <textarea
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </Layout>
  );
};

export default Messages;
