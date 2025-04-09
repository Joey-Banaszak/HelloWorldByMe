import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./Layout";
import "./styles.css";

const Messages = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyMessages, setReplyMessages] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [threads, setThreads] = useState([]);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
  
    const fetchMessages = async () => {
      try {
        const inboxRes = await axios.get("/messages/inbox", {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        const sentRes = await axios.get("/messages/sent", {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        const inboxMsgs = inboxRes.data.messages || [];
        const sentMsgs = sentRes.data.messages || [];
  
        const groupedThreads = {};
  
        // Group inbox messages by sender
        inboxMsgs.forEach((msg) => {
          const user = msg.sender;
          if (!groupedThreads[user]) groupedThreads[user] = [];
          groupedThreads[user].push({ ...msg, direction: "inbox" });
        });
  
        // Group sent messages by receiver
        sentMsgs.forEach((msg) => {
          const user = msg.receiver;
          if (!groupedThreads[user]) groupedThreads[user] = [];
          groupedThreads[user].push({ ...msg, direction: "sent" });
        });
  
        // Convert to array of threads
        const threadList = Object.entries(groupedThreads).map(([userId, messages]) => ({
          userId,
          messages: messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
          isOpen: false, // collapsed by default
        }));
  
        setThreads(threadList);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
  
    fetchMessages();
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
  
      // Remove message from threads state
      const updatedThreads = threads.map((thread) => {
        return {
          ...thread,
          messages: thread.messages.filter((m) => m.id !== id),
        };
      }).filter(thread => thread.messages.length > 0); // Optionally remove empty threads
  
      setThreads(updatedThreads);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete message");
    }
  };  

  const archiveMessage = async (id) => {
  try {
    await axios.put(`/api/messages/archive/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Remove archived message from threads
    const updatedThreads = threads.map((thread) => {
      return {
        ...thread,
        messages: thread.messages.filter((m) => m.id !== id),
      };
    }).filter(thread => thread.messages.length > 0); // Clean up empty threads

    setThreads(updatedThreads);
  } catch (err) {
    console.error("Failed to archive message:", err);
    alert("Failed to archive message");
  }
};

const sendReply = async (receiverId) => {
    const messageText = replyMessages[receiverId] || "";
  
    if (messageText.trim() === "") {
      setError("Message cannot be empty.");
      return;
    }
  
    const newMsg = {
      id: Date.now(),
      sender: userId,
      receiver: receiverId,
      content: messageText,
      timestamp: new Date().toISOString(),
      direction: "sent",
    };
  
    try {
      await axios.post("/messages", {
        sender: userId,
        receiver: receiverId,
        content: messageText,
      });
  
      const updatedThreads = threads.map((thread) => {
        if (thread.userId === receiverId) {
          return {
            ...thread,
            messages: [...thread.messages, newMsg],
          };
        }
        return thread;
      });
  
      setThreads(updatedThreads);
      setReplyMessages((prev) => ({
        ...prev,
        [receiverId]: "", // clear only this thread's reply box
      }));
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Try again.");
    }
  };  

  
  return (
    <Layout>
      {<div className="threads-container">
        {threads.map((thread, index) => (
            <div key={index} className="thread-block">
            <div
                className="thread-header"
                onClick={() => {
                const updated = [...threads];
                updated[index].isOpen = !updated[index].isOpen;
                setThreads(updated);
                }}
            >
                <strong>Conversation with:</strong> {thread.userId} {" "}
                <span style={{ fontSize: "0.8rem", color: "#555" }}>
                ({thread.messages.length} message{thread.messages.length !== 1 ? "s" : ""})
                </span>
            </div>

            {thread.isOpen && ( <>
            <div className="thread-messages">
                {thread.messages.map((msg) => (
                    <div
                    key={msg.id}
                    className={`bubble-message ${msg.direction === "sent" ? "sent-bubble" : "received-bubble"}`}
                    >
                        <div className="bubble-meta">
                            {msg.direction === "sent" ? "To" : "From"}: {msg.direction === "sent" ? msg.receiver : msg.sender}
                            <span className="bubble-timestamp">
                            {new Date(msg.timestamp).toLocaleString()}
                            </span>
                        </div>
                    <div className="bubble-content">{msg.content}</div>
                        <div className="bubble-actions">
                            <button onClick={() => deleteMessage(msg.id)}>🗑️</button>
                            {msg.direction === "inbox" && (
                            <>
                                <button onClick={() => archiveMessage(msg.id)}>📥 Archive</button>
                            </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* reply box always at bottom of thread */}
            <div className="reply-box-below-thread">
            <textarea
                placeholder={`Reply to ${thread.userId}...`}
                value={replyMessages[thread.userId] || ""}
                onChange={(e) =>
                    setReplyMessages((prev) => ({
                    ...prev,
                    [thread.userId]: e.target.value,
                    }))
                }
                />
                <button onClick={() => sendReply(thread.userId)}>Send</button>
            </div>
            </>
            )}

        </div>
    ))}
    </div>
    }
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
        <div className="comm-method-selector">
        <label htmlFor="method">Method: </label>
        <select
            value="message"
            onChange={(e) => {
            if (e.target.value !== "message") {
                alert(`Sorry, "${e.target.value}" is not currently supported.`);
            }
            }}
        >
            <option value="message">Message</option>
            <option value="text">Text Message</option>
            <option value="email">Email</option>
        </select>
        </div>
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
