// MainApp.jsx
import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import SearchBar from "./SearchBar";
import DataTable from "./DataTable";
import PaginationBox from "./PaginationBox";
import { fetchData, initializeConnection, closeConnection } from "../utils/api";
import DotLoader from "./DotLoader";

const MainApp = () => {
  const [data, setData] = useState(null);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    setLoading(true);
    setData(null);

    setTimeout(async () => {
      try {
        const result = await fetchData(query, from, to);
        setData(result || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  useEffect(() => {
    initializeConnection();

    const handleBeforeUnload = () => {
      closeConnection();
    };

    const handlePageShow = (event) => {
      if (event.persisted) {
        initializeConnection();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        initializeConnection();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: "linear-gradient(to right, #1e3c72, #2a5298)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", letterSpacing: "1px" }}>
            Data Table Viewer
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          width: "100%",
          padding: 2,
          background: "linear-gradient(to bottom right, #ebf0f5, #d9e2ec)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          marginTop: "64px",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "720px",
            marginTop: "20px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <SearchBar onSearch={handleSearch} />
        </Box>

        <Box
          sx={{
            width: "100%",
            maxWidth: "500px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <PaginationBox from={from} to={to} setFrom={setFrom} setTo={setTo} />
        </Box>

        <Box sx={{ width: "100%", maxWidth: "90%", overflowX: "auto" }}>
          {loading && <DotLoader />}
          {!loading && data !== null && <DataTable data={data} />}
        </Box>
      </Box>
    </>
  );
};

export default MainApp;
