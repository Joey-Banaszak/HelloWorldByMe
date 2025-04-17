import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./Layout";
import "./styles.css";

// 1. Define dummy users
const dummyUsers = [
    { user_id: "sammm", name: "Samantha", role: "navigator", groups: ["Capstone Team"] },
    { user_id: "nick", name: "Nick", role: "user", groups: ["Capstone Team"] },
    { user_id: "alex", name: "Alex", role: "navigator", groups: ["Capstone Team"] },
    { user_id: "jordan", name: "Jordan", role: "user", groups: [] },
    { user_id: "peter", name: "Peter", role: "admin", groups: [] },
    { user_id: "kevin", name: "Kevin", role: "admin", groups: [] }
  ];
  
  const groupNameSet = new Set();
    dummyUsers.forEach(user => {
    user.groups.forEach(group => groupNameSet.add(group));
    });
    //groupNameSet.add("Admin");
    // groupNameSet.add("Navigators");
    // groupNameSet.add("Users");

    const groupNameToId = {};
    const groups = Array.from(groupNameSet).map((name, idx) => {
    const id = idx + 1;
    groupNameToId[name] = id;
    return { id, name };
    });

    const group_members = [];

    dummyUsers.forEach(user => {
      // Group memberships
      user.groups.forEach(groupName => {
        group_members.push({
          group_id: groupNameToId[groupName],
          user_id: user.user_id
        });
      });
    });
    
  // 4. Combine everything into dummyData
  const dummyData = {
    users: dummyUsers,
    groups,
    group_members,
    messages: [
        {
          id: 1,
          sender: "sammm",
          receiver: "nick",
          content: "Hey Nick!",
          timestamp: "2025-04-14T10:00:00Z",
          is_read: false
        },
        {
          id: 2,
          sender: "nick",
          receiver: "sammm",
          content: "Hey! How's it going?",
          timestamp: "2025-04-14T10:05:00Z",
          is_read: false
        },
        {
          id: 3,
          sender: "Joey",
          group_id: 1,
          content: "Are we ready for the demo?",
          timestamp: "2025-04-14T10:10:00Z",
          is_read: false
        },
        {
            id: 4,
            sender: "Jessica",
            group_id: 1,
            content: "Just finishing up!",
            timestamp: "2025-04-14T10:11:00Z",
            is_read: false
        },
        {
            id: 3,
            sender: "Elizabeth",
            group_id: 1,
            content: "All done here!",
            timestamp: "2025-04-14T10:11:30Z",
            is_read: false
        },
        {
          id: 6,
          sender: "sammm",
          group_id: 1,
          content: "Almost!",
          timestamp: "2025-04-14T10:12:00Z",
          is_read: false
        }
    ]
  };


const Messages = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyMessages, setReplyMessages] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [roleSearchResults, setRoleSearchResults] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [threads, setThreads] = useState([]);
  const [messageMode, setMessageMode] = useState("individual");
  const [searchMode, setSearchMode] = useState("user");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");
 
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [groupSearchResults, setGroupSearchResults] = useState([]);


  useEffect(() => {
    const userId = localStorage.getItem("user_id"); // or hardcode for now
  
    const userGroups = dummyData.group_members
      .filter((gm) => gm.user_id === userId)
      .map((gm) => gm.group_id);
  
      const inboxMsgs = dummyData.messages.filter(
        (msg) =>
          (!msg.group_id &&
            (msg.receiver === userId || msg.sender === userId)) || // individual both directions
          (msg.group_id && userGroups.includes(msg.group_id)) // group
      );      
  
    const groupedThreads = {};
  
    inboxMsgs.forEach((msg) => {
      const key = msg.group_id ? `group-${msg.group_id}` : msg.sender === userId ? msg.receiver : msg.sender;
      if (!groupedThreads[key]) groupedThreads[key] = [];
      groupedThreads[key].push(msg);
    });
  
    const threadList = Object.entries(groupedThreads).map(([threadId, messages]) => ({
        userId: threadId,
        messages: messages
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .map((msg) => ({
            ...msg,
            direction: msg.sender === userId ? "sent" : "inbox"
          })),
        isOpen: false,
        unreadCount: messages.filter((msg) => !msg.is_read && msg.sender !== userId).length
      }));      
    setThreads(threadList);
  }, []);  

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

  const handleRoleSearch = async (query) => {
    //console.log("Searching roles for:", query); // <--- Add this

    setRoleSearchQuery(query);
    setError("");

    if (query.length > 2) {
      try {
        const response = await axios.get(`/api/users/rolesearch?query=${query}`);
        setRoleSearchResults(response.data.users);
      } catch (error) {
        console.error("Error searching users:", error);
      }
    } else {
      setRoleSearchResults([]);
    }
  };

  const selectUserForMessage = (user) => {
    setSelectedUser(user);
    setSearchQuery(user.name);
    setSearchResults([]);
    setError("");
  };

  const selectRoleUserForMessage = (user) => {
    setSelectedUser(user);
    setRoleSearchQuery(user.name);
    setRoleSearchResults([]);
    setError("");
  };

  const sendMessage = async () => {
    const content = newMessage.trim();
    if (!content) {
      setError("Message cannot be empty.");
      return;
    }
  
        if (messageMode === "role") {
        const role = selectedUser?.role;
        const groupName = role.charAt(0).toUpperCase() + role.slice(1) + "s"; // e.g. "navigator" → "Navigators"
        let group = dummyData.groups.find((g) => g.name === groupName);
      
        if (!group) {
            // Create group on the fly
            const newId = dummyData.groups.length + 1;
            group = { id: newId, name: groupName };
            dummyData.groups.push(group);
          
            // Add members
            dummyUsers.forEach((user) => {
              if (user.role === role) {
                dummyData.group_members.push({
                  group_id: newId,
                  user_id: user.user_id
                });
              }
            });
          }          
      
        const newGroupMessage = {
          id: Date.now(),
          sender: userId,
          group_id: group.id,
          content: content,
          timestamp: new Date().toISOString(),
          direction: "sent"
        };
      
        setThreads((prev) => {
          const threadKey = `group-${group.id}`;
          const index = prev.findIndex(t => t.userId === threadKey);
          if (index !== -1) {
            const updated = [...prev];
            updated[index].messages.push(newGroupMessage);
            return updated;
          } else {
            return [
              ...prev,
              {
                userId: threadKey,
                messages: [newGroupMessage],
                isOpen: false,
                unreadCount: 1
              }
            ];
          }
        });
      
        setNewMessage("");
        setSelectedUser(null);
        return;
      }

      if (messageMode === "group") {
        if (selectedUsers.length === 0) {
          setError("Please select at least one user.");
          return;
        }
      
        const groupMessages = selectedUsers.map((receiverId) => ({
          id: Date.now() + Math.random(), // slightly varied ID
          sender: userId,
          receiver: receiverId,
          content: content,
          timestamp: new Date().toISOString(),
          direction: "sent"
        }));
      
        setThreads((prev) => {
          const updated = [...prev];
          groupMessages.forEach((msg) => {
            const index = updated.findIndex(t => t.userId === msg.receiver);
            if (index !== -1) {
              updated[index].messages.push(msg);
            } else {
              updated.push({
                userId: msg.receiver,
                messages: [msg],
                isOpen: false,
                unreadCount: 1
              });
            }
          });
          return updated;
        });
      
        setNewMessage("");
        setSelectedUsers([]);
        return;
      }      
  
    // Fallback: individual message (your existing logic)
    // ...
  };
  

  const archiveMessage = async (id) => {
    try {
      await axios.put(
        `/api/messages/archive/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Remove archived message from threads
      const updatedThreads = threads
        .map((thread) => {
          return {
            ...thread,
            messages: thread.messages.filter((m) => m.id !== id),
          };
        })
        .filter((thread) => thread.messages.length > 0); // Clean up empty threads

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
      {
        <div className="threads-container">
          {threads.map((thread, index) => {
            const isGroup = thread.userId.startsWith("group-");
            return (
            <div key={index} className="thread-block">
              <div
                className="thread-header"
                onClick={async () => {
                    const updated = [...threads];
                    updated[index].isOpen = !updated[index].isOpen;
                    setThreads(updated);
                  
                    // If opening thread, mark unread messages as read
                    if (updated[index].isOpen) {
                      const unreadMessages = threads[index].messages.filter(
                        (msg) => msg.direction === "inbox" && !msg.is_read
                      );
                  
                      for (const msg of unreadMessages) {
                        try {
                          await axios.put(`/api/messages/${msg.id}/read`, {}, {
                            headers: { Authorization: `Bearer ${token}` }
                          });
                  
                          // Optionally mark as read locally too
                          //msg.is_read = true;
                          const globalMsg = dummyData.messages.find(m => m.id === msg.id);
                          if (globalMsg) globalMsg.is_read = true;
                          updated[index].unreadCount -= 1;
                        } catch (err) {
                          console.error("Failed to mark message as read:", err);
                        }
                      }
                    }
                  }}                  
                >
                <strong>Conversation with:</strong>{" "}
                {thread.userId.startsWith("group-")
                ? dummyData.groups.find((g) => `group-${g.id}` === thread.userId)?.name || "Unnamed Group"
                : thread.userId}
                {thread.unreadCount > 0 && (
                <span className="unread-badge"> {thread.unreadCount} new </span>
                )}

                <span style={{ fontSize: "0.8rem", color: "#555" }}>
                  ({thread.messages.length} message
                  {thread.messages.length !== 1 ? "s" : ""})
                </span>
              </div>

              {thread.isOpen && (
                <>
                  <div className="thread-messages">
                    {thread.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`bubble-message ${
                          msg.direction === "sent"
                            ? "sent-bubble"
                            : "received-bubble"
                        }`}
                      >
                        <div className="bubble-meta">
                        {msg.direction === "inbox" && (
                            <>
                            From: {msg.sender}
                            <br />
                            </>
                        )}
                        <span className="bubble-timestamp">
                            {new Date(msg.timestamp).toLocaleString()}
                        </span>
                        </div>
                        <div className="bubble-content">
                        {isGroup && (
                            <div className="bubble-sender" style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                            {msg.sender}
                            </div>
                        )}

                        {msg.content}
                        </div>

                        <div className="bubble-actions">
                          <button onClick={() => deleteMessage(msg.id)}>
                            🗑️
                          </button>
                          {msg.direction === "inbox" && (
                            <>
                              <button onClick={() => archiveMessage(msg.id)}>
                                📥 Archive
                              </button>
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
                    <button onClick={() => sendReply(thread.userId)}>
                      Send
                    </button>
                  </div>
                </>
              )}
            </div>
        );
        })}
        </div>
      }
      {selectedMessage && (
        <div className="message-action-container">
        <h3>Reply to {selectedMessage.sender}</h3>
        <p>{selectedMessage.content}</p>
        <textarea
          placeholder="Type your reply..."
          value={replyMessages[selectedMessage.sender] || ""}
          onChange={(e) =>
            setReplyMessages((prev) => ({
              ...prev,
              [selectedMessage.sender]: e.target.value,
            }))
          }
        />
        <button onClick={sendMessage}>Send Reply</button>
        <button onClick={() => setSelectedMessage(null)}>Cancel</button>
      </div>      
      )}

      <div className="message-input-container">
        <h3>Send a Message</h3>
        <div className="message-mode-selector" style={{ marginBottom: "0.5rem" }}>
        <label htmlFor="message-mode" style={{ marginRight: "0.5rem" }}>
            Send to:
        </label>
        <select
        id="message-mode"
        value={messageMode}
        onChange={(e) => setMessageMode(e.target.value)}
        >
        <option value="individual">Individual</option>
        <option value="role">By Role</option>
        <option value="group">Custom Group</option>
        </select>
        </div>
        {error && <p className="error-message">{error}</p>}
        {messageMode === "individual" && (        
        <div className="search-by-user">
            <div className="search-mode-selector" style={{ marginBottom: "0.5rem" }}>
                <label htmlFor="message-mode" style={{ marginRight: "0.5rem" }}>
                    Search by: 
                </label>
                <select
                id="search-mode"
                value={searchMode}
                onChange={(e) => setSearchMode(e.target.value)}
                >
                <option value="user">User</option>
                <option value="role">Role</option>
                </select>
            </div>
            {searchMode === "user" && (
            <div className="search-by-user">
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
            </div>
            )}
            {searchMode === "role" && (
            <div className="search-by-role">
                <input
                type="text"
                placeholder="Search users by role..."
                value={roleSearchQuery}
                onChange={(e) => handleRoleSearch(e.target.value)}
                />
                {roleSearchResults.length > 0 && (
                <div className="role-search-results">
                    {roleSearchResults.map((user) => (
                    <p key={user.user_id} onClick={() => selectRoleUserForMessage(user)}>
                        {user.name} (@{user.user_id})
                    </p>
                    ))}
                    </div>
                )}
            </div>
            )} 
            {/* <input
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
            )} */}
        </div>
        )}

        {messageMode === "role" && (
        <div className="search-by-role">
            <select
            id="role-target"
            value={selectedUser?.role || ""}
            onChange={(e) =>
                setSelectedUser({ role: e.target.value })
            }
            >
            <option value="">Select a role</option>
            <option value="admin">Admin</option>
            <option value="navigator">Navigator</option>
            <option value="user">User</option>
            </select>
        </div>
        )}

        {messageMode === "group" && (
        <div className="search-by-group" style={{ marginBottom: "1rem" }}>
            <div className="search-mode-selector" style={{ marginBottom: "0.5rem" }}>
                <label htmlFor="message-mode" style={{ marginRight: "0.5rem" }}>
                    Search by: 
                </label>
                <select
                id="search-mode"
                value={searchMode}
                onChange={(e) => setSearchMode(e.target.value)}
                >
                <option value="user">User</option>
                <option value="role">Role</option>
                </select>
            </div>
            {searchMode === "user" && (
            <div className="search-by-user">
                <input
                type="text"
                placeholder="Search users to add..."
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
            </div>
            )}
            {searchMode === "role" && (
            <div className="search-by-role">
                <input
                type="text"
                placeholder="Search users to add by role..."
                value={roleSearchQuery}
                onChange={(e) => handleRoleSearch(e.target.value)}
                />
                {roleSearchResults.length > 0 && (
                <div className="role-search-results">
                    {roleSearchResults.map((user) => (
                    <p key={user.user_id} onClick={() => selectRoleUserForMessage(user)}>
                        {user.name} (@{user.user_id})
                    </p>
                    ))}
                    </div>
                )}
            </div>
            )} 
            {/* <input
            type="text"
            placeholder="Search users to add..."
            value={groupSearchQuery}
            onChange={(e) => {
                const query = e.target.value;
                setGroupSearchQuery(query);

                if (query.length > 2) {
                const matches = dummyData.users.filter((u) =>
                    u.name.toLowerCase().includes(query.toLowerCase()) ||
                    u.user_id.toLowerCase().includes(query.toLowerCase())
                );
                setGroupSearchResults(matches);
                } else {
                setGroupSearchResults([]);
                }
            }}
            /> */}
            {groupSearchResults.length > 0 && (
            <div className="search-results">
                {groupSearchResults.map((user) => (
                <p
                    key={user.user_id}
                    onClick={() => {
                    if (!selectedUsers.includes(user.user_id)) {
                        setSelectedUsers([...selectedUsers, user.user_id]);
                    }
                    setGroupSearchQuery("");
                    setGroupSearchResults([]);
                    }}
                    style={{ cursor: "pointer" }}
                >
                    {user.name} (@{user.user_id})
                </p>
                ))}
            </div>
            )}

            {selectedUsers.length > 0 && (
            <div style={{ marginTop: "0.5rem" }}>
                <strong>Selected Users:</strong>
                <ul>
                {selectedUsers.map((userId) => {
                    const user = dummyData.users.find((u) => u.user_id === userId);
                    return (
                    <li key={userId}>
                        {user?.name} (@{userId}){" "}
                        <button
                        onClick={() =>
                            setSelectedUsers(selectedUsers.filter((id) => id !== userId))
                        }
                        >
                        ❌
                        </button>
                    </li>
                    );
                })}
                </ul>
            </div>
            )}
        </div>
        )}
        {/* <div className="search-section">
            <div className="search-by-user">
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
            </div>
            <div className="search-by-role">
                <input
                type="text"
                placeholder="Search users by role..."
                value={roleSearchQuery}
                onChange={(e) => handleRoleSearch(e.target.value)}
                />
                {roleSearchResults.length > 0 && (
                <div className="role-search-results">
                    {roleSearchResults.map((user) => (
                    <p key={user.user_id} onClick={() => selectRoleUserForMessage(user)}>
                        {user.name} (@{user.user_id})
                    </p>
                    ))}
                    </div>
                )}
            </div>
        </div> */}
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
