// Challenge 3: URL Shortening Service - Frontend
// React component for URL shortening form
// Connects to backend API at http://localhost:3001

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

/**
 * Redirect component - handles GET /{KEY} requests
 * Fetches original URL from backend and redirects
 */
function Redirect() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      if (!key) {
        navigate("/");
        return;
      }

      try {
        // Call backend API to get original URL
        // Use /api/:key endpoint to get URL as JSON
        // Use relative path since proxy is configured
        const response = await axios.get(`/api/${key}`);

        // If we get here, the key exists and we have the original URL
        if (response.data && response.data.url) {
          // Redirect to original URL
          window.location.href = response.data.url;
          return;
        } else {
          setError("Invalid response from server");
        }
      } catch (err) {
        // Handle errors
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            setError(err.response?.data?.message || "URL not found");
          } else {
            setError(err.message || "Failed to redirect");
          }
        } else {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      }
    };

    fetchAndRedirect();
  }, [key, navigate]);

  if (error) {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "50px auto",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
          textAlign: "center",
        }}
      >
        <h2>404 - URL Not Found</h2>
        <p>{error}</p>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Go to URL Shortener
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
      }}
    >
      <p>Redirecting...</p>
    </div>
  );
}

/**
 * Home component - Main URL shortening form
 * Displays form to shorten URL and shows the result
 */
function Home() {
  // State to store the input URL
  const [url, setUrl] = useState<string>("");

  // State to store the result (short key)
  const [result, setResult] = useState<string | null>(null);

  // State to store error messages
  const [error, setError] = useState<string | null>(null);

  // State to track loading status
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Handle form submission
   * Sends POST request to backend /shorten endpoint
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      // Send POST request to backend API
      // Use relative path since proxy is configured
      const response = await axios.post("/api/shorten", {
        url: url,
      });

      // Success - store the key
      setResult(response.data.key);
    } catch (err) {
      // Handle errors
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || "Failed to shorten URL");
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#333" }}>URL Shortener</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL to shorten (e.g., https://example.com)"
          required
          style={{
            padding: "12px",
            fontSize: "16px",
            border: "2px solid #ddd",
            borderRadius: "4px",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Shortening..." : "Shorten URL"}
        </button>
      </form>

      {/* Display result if available */}
      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#e7f3ff",
            borderRadius: "4px",
          }}
        >
          <strong>Short URL Key:</strong> <code>{result}</code>
          <br />
          <strong>Short URL:</strong>{" "}
          <a href={`http://localhost/${result}`} target="_blank" rel="noopener noreferrer">
            http://localhost/{result}
          </a>
        </div>
      )}

      {/* Display error if any */}
      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#ffe7e7",
            color: "#d32f2f",
            borderRadius: "4px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}

/**
 * App component with routing
 * Handles:
 * - GET / - Display form (Home component)
 * - GET /{KEY} - Redirect to original URL (Redirect component)
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:key" element={<Redirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
