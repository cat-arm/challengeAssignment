// Challenge 5: Full-stack Frontend
// Port: 5002
// React component for user management with search, table, edit, remove, and pagination

import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * User interface - matches backend User structure
 */
interface User {
  id: string;
  name: string;
  age: number;
  email: string;
  avatarUrl: string;
}

/**
 * App component - Main user management interface
 * Features:
 * - Search box (searches name and email)
 * - Table view with user data
 * - Edit and remove buttons for each user
 * - Pagination controls
 */
function App() {
  // State for users list
  const [users, setUsers] = useState<User[]>([]);

  // State for loading status
  const [loading, setLoading] = useState<boolean>(false);

  // State for error messages
  const [error, setError] = useState<string | null>(null);

  // State for search term
  const [searchTerm, setSearchTerm] = useState<string>("");

  // State for pagination
  const [start, setStart] = useState<number>(0);
  const [limit] = useState<number>(10); // Items per page
  const [total, setTotal] = useState<number>(0);

  // State for editing user
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  /**
   * Fetch users from backend API
   * Includes search and pagination parameters
   */
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("http://localhost:5001/api/user", {
        params: {
          q: searchTerm,
          start,
          limit,
        },
      });

      setUsers(response.data.users || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch users when component mounts or when search/pagination changes
   */
  useEffect(() => {
    fetchUsers();
  }, [start, searchTerm]); // Re-fetch when start or searchTerm changes

  /**
   * Handle search input change
   * Resets pagination to start when searching
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setStart(0); // Reset to first page when searching
  };

  /**
   * Handle delete user
   * Deletes user and refreshes the list
   */
  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5001/api/user/${userId}`);
      // Refresh user list
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  /**
   * Handle edit button click
   * Opens edit form with user data
   */
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      age: user.age,
      email: user.email,
      avatarUrl: user.avatarUrl,
    });
  };

  /**
   * Handle edit form input change
   */
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === "age" ? parseInt(value) || 0 : value,
    }));
  };

  /**
   * Handle save edited user
   * Updates user and refreshes the list
   */
  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      await axios.put(`http://localhost:5001/api/user/${editingUser.id}`, editForm);
      setEditingUser(null);
      setEditForm({});
      fetchUsers(); // Refresh list
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  /**
   * Handle cancel edit
   */
  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({});
  };

  /**
   * Calculate pagination info
   */
  const currentPage = Math.floor(start / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  /**
   * Handle page navigation
   */
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setStart((page - 1) * limit);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>User Management</h1>

      {/* Search Box */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            border: "2px solid #ddd",
            borderRadius: "4px",
          }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#ffe7e7",
            color: "#d32f2f",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          Error: {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>}

      {/* User Table */}
      {!loading && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Avatar</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Name</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Age</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Email</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "20px", textAlign: "center" }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
                    {editingUser?.id === user.id ? (
                      // Edit Mode
                      <>
                        <td style={{ padding: "12px" }}>
                          <input type="text" name="avatarUrl" value={editForm.avatarUrl || ""} onChange={handleEditFormChange} style={{ width: "100%", padding: "5px" }} />
                        </td>
                        <td style={{ padding: "12px" }}>
                          <input type="text" name="name" value={editForm.name || ""} onChange={handleEditFormChange} style={{ width: "100%", padding: "5px" }} />
                        </td>
                        <td style={{ padding: "12px" }}>
                          <input type="number" name="age" value={editForm.age || 0} onChange={handleEditFormChange} style={{ width: "100%", padding: "5px" }} />
                        </td>
                        <td style={{ padding: "12px" }}>
                          <input type="email" name="email" value={editForm.email || ""} onChange={handleEditFormChange} style={{ width: "100%", padding: "5px" }} />
                        </td>
                        <td style={{ padding: "12px" }}>
                          <button
                            onClick={handleSaveEdit}
                            style={{
                              padding: "5px 10px",
                              marginRight: "5px",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            style={{
                              padding: "5px 10px",
                              backgroundColor: "#6c757d",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      // View Mode
                      <>
                        <td style={{ padding: "12px" }}>
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                              onError={(e) => {
                                // Fallback if image fails to load
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                backgroundColor: "#ddd",
                                display: "inline-block",
                              }}
                            />
                          )}
                        </td>
                        <td style={{ padding: "12px" }}>{user.name}</td>
                        <td style={{ padding: "12px" }}>{user.age}</td>
                        <td style={{ padding: "12px" }}>{user.email}</td>
                        <td style={{ padding: "12px" }}>
                          <button
                            onClick={() => handleEditClick(user)}
                            style={{
                              padding: "5px 10px",
                              marginRight: "5px",
                              backgroundColor: "#007bff",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            style={{
                              padding: "5px 10px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && total > 0 && (
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: "8px 16px",
              backgroundColor: currentPage === 1 ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>

          <span style={{ padding: "0 10px" }}>
            Page {currentPage} of {totalPages} (Total: {total} users)
          </span>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 16px",
              backgroundColor: currentPage === totalPages ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
