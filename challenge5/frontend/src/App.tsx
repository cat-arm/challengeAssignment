// Challenge 5: Full-stack Frontend
// Port: 5002
// React component for user management with search, table, edit, remove, and pagination

import React, { useState, useEffect, useCallback } from "react";
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

  // State for creating new user
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState<Omit<User, "id">>({
    name: "",
    age: 0,
    email: "",
    avatarUrl: "",
  });
  const [createFormErrors, setCreateFormErrors] = useState<Record<string, string>>({});
  const [createFormError, setCreateFormError] = useState<string | null>(null);

  // State for edit form errors
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // State for user detail view
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState<boolean>(false);
  const [userDetailError, setUserDetailError] = useState<string | null>(null);

  /**
   * Fetch users from backend API
   * Includes search and pagination parameters
   */
  const fetchUsers = useCallback(async () => {
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
  }, [searchTerm, start, limit]);

  /**
   * Fetch users when component mounts or when search/pagination changes
   */
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Re-fetch when fetchUsers changes

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
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || (err instanceof Error ? err.message : "Failed to delete user");
      alert(errorMessage); // Keep alert for delete as it's a critical action
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
    setEditFormErrors({});
    setEditFormError(null);
    // Scroll to the row after a short delay to ensure DOM is updated
    setTimeout(() => {
      const rowElement = document.querySelector(`[data-user-id="${user.id}"]`);
      if (rowElement) {
        rowElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 100);
  };

  /**
   * Handle edit form input change
   */
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue: any = value;
    
    if (name === "age") {
      const numValue = parseInt(value);
      // Prevent negative values - don't allow typing negative numbers
      if (value === "" || isNaN(numValue)) {
        processedValue = "";
      } else if (numValue < 0) {
        // Don't update if negative value is entered
        return;
      } else {
        processedValue = numValue;
      }
    }
    
    setEditForm((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
    // Clear error for this field when user starts typing
    if (editFormErrors[name]) {
      setEditFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // Clear general error
    if (editFormError) {
      setEditFormError(null);
    }
  };

  /**
   * Handle save edited user
   * Updates user and refreshes the list
   */
  const handleSaveEdit = async () => {
    if (!editingUser) return;

    // Clear previous errors
    setEditFormErrors({});
    setEditFormError(null);

    // Validate form - merge with existing user data for validation
    const fullForm = { ...editingUser, ...editForm };
    const errors = validateUserForm(fullForm);
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    try {
      await axios.put(`http://localhost:5001/api/user/${editingUser.id}`, editForm);
      setEditingUser(null);
      setEditForm({});
      setEditFormErrors({});
      setEditFormError(null);
      fetchUsers(); // Refresh list
    } catch (err: any) {
      if (err.response?.data?.error) {
        setEditFormError(err.response.data.error);
      } else {
        setEditFormError(err instanceof Error ? err.message : "Failed to update user");
      }
    }
  };

  /**
   * Handle cancel edit
   */
  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({});
    setEditFormErrors({});
    setEditFormError(null);
  };

  /**
   * Validate email format
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate URL format
   */
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  /**
   * Validate user form data
   */
  const validateUserForm = (form: Partial<Omit<User, "id">>): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!form.name || form.name.trim() === "") {
      errors.name = "Name is required";
    }

    if (form.age === undefined || form.age === null) {
      errors.age = "Age is required";
    } else if (typeof form.age === "number") {
      if (isNaN(form.age) || form.age < 1 || !Number.isInteger(form.age)) {
        errors.age = "Age must be a positive integer (at least 1)";
      }
    } else {
      errors.age = "Age must be a number";
    }

    if (!form.email || form.email.trim() === "") {
      errors.email = "Email is required";
    } else if (!validateEmail(form.email)) {
      errors.email = "Invalid email format";
    }

    if (!form.avatarUrl || form.avatarUrl.trim() === "") {
      errors.avatarUrl = "Avatar URL is required";
    } else if (!validateUrl(form.avatarUrl)) {
      errors.avatarUrl = "Invalid URL format";
    }

    return errors;
  };

  /**
   * Handle create form input change
   */
  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue: any = value;
    
    if (name === "age") {
      const numValue = parseInt(value);
      // Prevent negative values - don't allow typing negative numbers
      if (value === "" || isNaN(numValue)) {
        processedValue = "";
      } else if (numValue < 0) {
        // Don't update if negative value is entered
        return;
      } else {
        processedValue = numValue;
      }
    }
    
    setCreateForm((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
    // Clear error for this field when user starts typing
    if (createFormErrors[name]) {
      setCreateFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // Clear general error
    if (createFormError) {
      setCreateFormError(null);
    }
  };

  /**
   * Handle create new user
   */
  const handleCreateUser = async () => {
    // Clear previous errors
    setCreateFormErrors({});
    setCreateFormError(null);

    // Validate form
    const errors = validateUserForm(createForm);
    if (Object.keys(errors).length > 0) {
      setCreateFormErrors(errors);
      return;
    }

    try {
      await axios.post("http://localhost:5001/api/user", createForm);
      setCreateForm({
        name: "",
        age: 0,
        email: "",
        avatarUrl: "",
      });
      setCreateFormErrors({});
      setCreateFormError(null);
      setShowCreateForm(false);
      fetchUsers(); // Refresh list
    } catch (err: any) {
      if (err.response?.data?.error) {
        setCreateFormError(err.response.data.error);
      } else {
        setCreateFormError(err instanceof Error ? err.message : "Failed to create user");
      }
    }
  };

  /**
   * Handle cancel create
   */
  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setCreateForm({
      name: "",
      age: 0,
      email: "",
      avatarUrl: "",
    });
    setCreateFormErrors({});
    setCreateFormError(null);
  };

  /**
   * Handle generate avatar URL for create form
   */
  const handleGenerateAvatar = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/avatar/generate", {
        params: {
          email: createForm.email || undefined,
          size: 150,
        },
      });
      setCreateForm((prev) => ({
        ...prev,
        avatarUrl: response.data.avatarUrl,
      }));
      // Clear error if exists
      if (createFormErrors.avatarUrl) {
        setCreateFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.avatarUrl;
          return newErrors;
        });
      }
    } catch (err) {
      setCreateFormError(err instanceof Error ? err.message : "Failed to generate avatar");
    }
  };

  /**
   * Handle generate avatar URL for edit form
   * Generates a new random avatar URL each time (doesn't use email to ensure uniqueness)
   */
  const handleGenerateAvatarEdit = async () => {
    try {
      // Don't send email parameter to ensure we get a new random avatar each time
      const response = await axios.get("http://localhost:5001/api/avatar/generate", {
        params: {
          size: 150,
        },
      });
      setEditForm((prev) => ({
        ...prev,
        avatarUrl: response.data.avatarUrl,
      }));
      // Clear error if exists
      if (editFormErrors.avatarUrl) {
        setEditFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.avatarUrl;
          return newErrors;
        });
      }
      // Clear general error
      if (editFormError) {
        setEditFormError(null);
      }
    } catch (err) {
      setEditFormError(err instanceof Error ? err.message : "Failed to generate avatar");
    }
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

  /**
   * Fetch user detail by ID
   */
  const fetchUserById = async (userId: string) => {
    setLoadingUserDetail(true);
    setUserDetailError(null);

    try {
      const response = await axios.get(`http://localhost:5001/api/user/${userId}`);
      setSelectedUser(response.data);
    } catch (err: any) {
      if (err.response?.data?.error) {
        setUserDetailError(err.response.data.error);
      } else {
        setUserDetailError(err instanceof Error ? err.message : "Failed to fetch user detail");
      }
      setSelectedUser(null);
    } finally {
      setLoadingUserDetail(false);
    }
  };

  /**
   * Handle view user detail
   */
  const handleViewUser = (userId: string) => {
    fetchUserById(userId);
  };

  /**
   * Close user detail view
   */
  const handleCloseUserDetail = () => {
    setSelectedUser(null);
    setUserDetailError(null);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>User Management</h1>

      {/* Create User Button */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {showCreateForm ? "Cancel Create" : "+ Create New User"}
        </button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "2px solid #28a745",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "15px" }}>Create New User</h2>

          {/* General Error Message */}
          {createFormError && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#ffe7e7",
                color: "#d32f2f",
                borderRadius: "4px",
                marginBottom: "15px",
                border: "1px solid #d32f2f",
              }}
            >
              <strong>Error:</strong> {createFormError}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Name *</label>
              <input
                type="text"
                name="name"
                value={createForm.name}
                onChange={handleCreateFormChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: createFormErrors.name ? "2px solid #d32f2f" : "1px solid #ddd",
                  borderRadius: "4px",
                }}
                placeholder="Enter name"
              />
              {createFormErrors.name && (
                <div style={{ color: "#d32f2f", fontSize: "12px", marginTop: "4px" }}>{createFormErrors.name}</div>
              )}
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Age *</label>
              <input
                type="number"
                name="age"
                value={createForm.age || ""}
                onChange={handleCreateFormChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: createFormErrors.age ? "2px solid #d32f2f" : "1px solid #ddd",
                  borderRadius: "4px",
                }}
                placeholder="Enter age"
                min="1"
              />
              {createFormErrors.age && (
                <div style={{ color: "#d32f2f", fontSize: "12px", marginTop: "4px" }}>{createFormErrors.age}</div>
              )}
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Email *</label>
              <input
                type="email"
                name="email"
                value={createForm.email}
                onChange={handleCreateFormChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: createFormErrors.email ? "2px solid #d32f2f" : "1px solid #ddd",
                  borderRadius: "4px",
                }}
                placeholder="Enter email"
              />
              {createFormErrors.email && (
                <div style={{ color: "#d32f2f", fontSize: "12px", marginTop: "4px" }}>{createFormErrors.email}</div>
              )}
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Avatar URL *</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  name="avatarUrl"
                  value={createForm.avatarUrl}
                  onChange={handleCreateFormChange}
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: createFormErrors.avatarUrl ? "2px solid #d32f2f" : "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                  placeholder="Enter avatar URL"
                />
                <button
                  type="button"
                  onClick={handleGenerateAvatar}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#17a2b8",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontSize: "14px",
                  }}
                  title="Generate random avatar URL"
                >
                  Generate
                </button>
              </div>
              {createFormErrors.avatarUrl && (
                <div style={{ color: "#d32f2f", fontSize: "12px", marginTop: "4px" }}>
                  {createFormErrors.avatarUrl}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleCreateUser}
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Create User
            </button>
            <button
              onClick={handleCancelCreate}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", width: "20%" }}>Avatar</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", width: "18%" }}>Name</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", width: "8%" }}>Age</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", width: "22%" }}>Email</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", width: "18%" }}>Actions</th>
                <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #ddd", width: "8%" }}>View</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "20px", textAlign: "center" }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    data-user-id={user.id}
                    style={{
                      borderBottom: "1px solid #eee",
                      verticalAlign: "top",
                    }}
                  >
                    {editingUser?.id === user.id ? (
                      // Edit Mode
                      <>
                        <td style={{ padding: "12px", height: "60px", width: "20%", verticalAlign: "middle" }}>
                          <div style={{ display: "flex", gap: "4px", flexDirection: "column", justifyContent: "center" }}>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <input
                                type="text"
                                name="avatarUrl"
                                value={editForm.avatarUrl || ""}
                                onChange={handleEditFormChange}
                                style={{
                                  flex: 1,
                                  padding: "5px",
                                  border: editFormErrors.avatarUrl ? "2px solid #d32f2f" : "1px solid #ddd",
                                  borderRadius: "4px",
                                }}
                              />
                              <button
                                type="button"
                                onClick={handleGenerateAvatarEdit}
                                style={{
                                  padding: "5px 10px",
                                  backgroundColor: "#17a2b8",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  whiteSpace: "nowrap",
                                  fontSize: "11px",
                                }}
                                title="Generate random avatar URL"
                              >
                                Gen
                              </button>
                            </div>
                            {editFormErrors.avatarUrl && (
                              <div style={{ color: "#d32f2f", fontSize: "11px", marginTop: "2px" }}>
                                {editFormErrors.avatarUrl}
                              </div>
                            )}
                            {editFormError && (
                              <div style={{ color: "#d32f2f", fontSize: "11px", marginTop: "2px", backgroundColor: "#ffe7e7", padding: "4px", borderRadius: "4px" }}>
                                <strong>Error:</strong> {editFormError}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "12px", height: "60px", width: "18%", verticalAlign: "middle" }}>
                          <div>
                            <input
                              type="text"
                              name="name"
                              value={editForm.name || ""}
                              onChange={handleEditFormChange}
                              style={{
                                width: "100%",
                                padding: "5px",
                                border: editFormErrors.name ? "2px solid #d32f2f" : "1px solid #ddd",
                                borderRadius: "4px",
                                boxSizing: "border-box",
                              }}
                            />
                            {editFormErrors.name && (
                              <div style={{ color: "#d32f2f", fontSize: "11px", marginTop: "2px" }}>
                                {editFormErrors.name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "12px", height: "60px", width: "8%", verticalAlign: "middle" }}>
                          <div>
                            <input
                              type="number"
                              name="age"
                              value={editForm.age || ""}
                              onChange={handleEditFormChange}
                              min="1"
                              style={{
                                width: "100%",
                                padding: "5px",
                                border: editFormErrors.age ? "2px solid #d32f2f" : "1px solid #ddd",
                                borderRadius: "4px",
                                boxSizing: "border-box",
                              }}
                            />
                            {editFormErrors.age && (
                              <div style={{ color: "#d32f2f", fontSize: "11px", marginTop: "2px" }}>
                                {editFormErrors.age}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "12px", height: "60px", width: "22%", verticalAlign: "middle" }}>
                          <div>
                            <input
                              type="email"
                              name="email"
                              value={editForm.email || ""}
                              onChange={handleEditFormChange}
                              style={{
                                width: "100%",
                                padding: "5px",
                                border: editFormErrors.email ? "2px solid #d32f2f" : "1px solid #ddd",
                                borderRadius: "4px",
                                boxSizing: "border-box",
                              }}
                            />
                            {editFormErrors.email && (
                              <div style={{ color: "#d32f2f", fontSize: "11px", marginTop: "2px" }}>
                                {editFormErrors.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "12px", height: "60px", width: "18%", verticalAlign: "middle" }}>
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
                        <td style={{ padding: "12px", height: "60px", width: "8%", verticalAlign: "middle", textAlign: "center" }}>
                          <button
                            onClick={() => handleViewUser(editingUser.id)}
                            style={{
                              padding: "5px 10px",
                              backgroundColor: "#17a2b8",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "14px",
                            }}
                            title="View user details"
                          >
                            👁️
                          </button>
                        </td>
                      </>
                    ) : (
                      // View Mode
                      <>
                        <td style={{ padding: "12px", height: "60px", width: "20%", verticalAlign: "middle" }}>
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
                        <td style={{ padding: "12px", height: "60px", width: "18%", verticalAlign: "middle" }}>{user.name}</td>
                        <td style={{ padding: "12px", height: "60px", width: "8%", verticalAlign: "middle" }}>{user.age}</td>
                        <td style={{ padding: "12px", height: "60px", width: "22%", verticalAlign: "middle" }}>{user.email}</td>
                        <td style={{ padding: "12px", height: "60px", width: "18%", verticalAlign: "middle" }}>
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
                        <td style={{ padding: "12px", height: "60px", width: "8%", verticalAlign: "middle", textAlign: "center" }}>
                          <button
                            onClick={() => handleViewUser(user.id)}
                            style={{
                              padding: "5px 10px",
                              backgroundColor: "#17a2b8",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "14px",
                            }}
                            title="View user details"
                          >
                            👁️
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

      {/* User Detail Modal */}
      {selectedUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseUserDetail}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "30px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0 }}>User Details</h2>
              <button
                onClick={handleCloseUserDetail}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ×
              </button>
            </div>

            {loadingUserDetail ? (
              <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
            ) : userDetailError ? (
              <div
                style={{
                  padding: "15px",
                  backgroundColor: "#ffe7e7",
                  color: "#d32f2f",
                  borderRadius: "4px",
                  marginBottom: "20px",
                }}
              >
                Error: {userDetailError}
              </div>
            ) : selectedUser ? (
              <div>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  {selectedUser.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt={selectedUser.name}
                      style={{ width: "120px", height: "120px", borderRadius: "50%", border: "3px solid #ddd" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        backgroundColor: "#ddd",
                        margin: "0 auto",
                      }}
                    />
                  )}
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <strong style={{ display: "block", marginBottom: "5px", color: "#666" }}>ID:</strong>
                  <div style={{ padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>{selectedUser.id}</div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <strong style={{ display: "block", marginBottom: "5px", color: "#666" }}>Name:</strong>
                  <div style={{ padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>{selectedUser.name}</div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <strong style={{ display: "block", marginBottom: "5px", color: "#666" }}>Age:</strong>
                  <div style={{ padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>{selectedUser.age}</div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <strong style={{ display: "block", marginBottom: "5px", color: "#666" }}>Email:</strong>
                  <div style={{ padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>{selectedUser.email}</div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <strong style={{ display: "block", marginBottom: "5px", color: "#666" }}>Avatar URL:</strong>
                  <div style={{ padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "4px", wordBreak: "break-all", fontSize: "12px" }}>
                    {selectedUser.avatarUrl}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
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
