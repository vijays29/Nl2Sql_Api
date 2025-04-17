import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  InputAdornment,
  TextField,
  Stack,
  Paper,
  Tooltip,
  Menu,
  MenuItem,
  IconButton,
  Checkbox,
  ListItemText,
  Snackbar,
  SnackbarContent,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import { CSVLink } from "react-csv";
import { DataGrid } from "@mui/x-data-grid";

const DataTable = ({ data }) => {
  const [filterQuery, setFilterQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(() =>
    ["S.No", ...Object.keys(data?.[0] || {}).filter((col) => col !== "RNUM")]
  );
  const [copiedMessageOpen, setCopiedMessageOpen] = useState(false);

  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleToggleColumn = (col) => {
    setVisibleColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const modifiedData =
    data?.map((item, index) => ({
      id: index,
      "S.No": item.RNUM || index + 1,
      ...item,
    })) || [];

  const allDataColumns = ["S.No", ...Object.keys(data?.[0] || {}).filter((col) => col !== "RNUM")];

  const columns = visibleColumns.map((col) => ({
    field: col,
    headerName: col,
    flex: col === "S.No" ? 0.5 : 1,
    minWidth: col === "S.No" ? 60 : 120,
    headerAlign: col === "S.No" ? "left" : "center",
    align: col === "S.No" ? "left" : "center",
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Tooltip title={params.value?.toString()} arrow placement="top">
        <Box
          sx={{
            px: 1,
            py: 0.5,
            width: "100%",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            borderRadius: 1,
            transition: "all 0.25s ease-in-out",
            "&:hover": {
              backgroundColor: "#e8f0fc",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              transform: "scale(1.02)",
              fontWeight: 500,
              color: "#0d47a1",
            },
            cursor: "text", // allows text selection
          }}
        >
          {params.value}
        </Box>
      </Tooltip>
    ),
    renderHeader: (params) => (
      <strong style={{ fontWeight: 600, fontSize: 14, color: "#2a3e52" }}>
        {params.colDef.headerName}
      </strong>
    ),
  }));

  const filteredRows = modifiedData.filter((row) =>
    Object.entries(row).some(
      ([key, value]) =>
        visibleColumns.includes(key) &&
        value?.toString().toLowerCase().includes(filterQuery.toLowerCase())
    )
  );

  const handlePrint = () => {
    const printableData = filteredRows.map((row) =>
      Object.fromEntries(visibleColumns.map((col) => [col, row[col]]))
    );

    const printWindow = window.open("", "_blank");
    const style = `
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
          font-family: Arial, sans-serif;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 8px;
          text-align: center;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
      </style>
    `;

    const tableHtml = `
      ${style}
      <h3 style="text-align:center">Printed Data Records</h3>
      <table>
        <thead>
          <tr>${visibleColumns.map((col) => `<th>${col}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${printableData
            .map(
              (row) =>
                `<tr>${visibleColumns
                  .map((col) => `<td>${row[col] ?? ""}</td>`)
                  .join("")}</tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;

    printWindow.document.write(tableHtml);
    printWindow.document.close();
    printWindow.print();
  };

  // Show copied message on Ctrl+C if selection exists inside data box
  useEffect(() => {
    const handleCopy = (e) => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        setCopiedMessageOpen(true);
      }
    };

    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
  }, []);

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          mt: 2,
          p: 3,
          borderRadius: 3,
          overflow: "hidden",
          display: filteredRows.length ? "block" : "none",
        }}
      >
        {/* Table Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2a3e52" }}>
            Query Results
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Search..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "#888" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 250,
                backgroundColor: "#f9f9f9",
                borderRadius: 1,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#ddd" },
                  "&:hover fieldset": { borderColor: "#bbb" },
                  "& input": { color: "#2a3e52" },
                },
              }}
            />

            <IconButton size="small" onClick={handleClick}>
              <Tooltip title="Select Columns" arrow>
                <ViewColumnIcon sx={{ color: "#555" }} />
              </Tooltip>
            </IconButton>

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              {allDataColumns.map((col) => (
                <MenuItem key={col} onClick={() => handleToggleColumn(col)}>
                  <Checkbox checked={visibleColumns.includes(col)} />
                  <ListItemText primary={col} />
                </MenuItem>
              ))}
            </Menu>
          </Stack>
        </Box>

        {/* Table Body */}
        <Box
          sx={{
            width: "100%",
            height: Math.min(60 * filteredRows.length + 56, 500),
            transition: "height 0.3s ease",
          }}
        >
          <DataGrid
            rows={filteredRows}
            columns={columns}
            disableColumnMenu
            hideFooter
            scrollbarSize={8}
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#e9eff5",
                fontWeight: "bold",
                fontSize: 13,
                color: "#1a2e44",
                borderBottom: "1px solid #ccc",
                position: "sticky",
                top: 0,
                zIndex: 1,
              },
              "& .MuiDataGrid-cell": {
                fontSize: 13,
                color: "#333",
                borderBottom: "1px solid #eee",
                transition: "all 0.2s ease-in-out",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f4f9ff",
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: "#fff",
              },
            }}
          />
        </Box>

        {/* Footer */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={2}
          px={1}
          py={1}
          sx={{
            backgroundColor: "#f8f9fa",
            borderTop: "1px solid #ddd",
            borderRadius: "0 0 8px 8px",
          }}
        >
          <Typography variant="body2" sx={{ color: "#555", fontWeight: 500 }}>
            {filteredRows.length} record{filteredRows.length !== 1 ? "s" : ""} fetched
          </Typography>
          <Stack direction="row" spacing={1}>
            <CSVLink
              data={filteredRows.map((row) =>
                Object.fromEntries(visibleColumns.map((col) => [col, row[col]]))
              )}
              filename="data_export.csv"
              style={{ textDecoration: "none" }}
            >
              <Button
                startIcon={<FileDownloadIcon />}
                size="small"
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  color: "#fff",
                  backgroundColor: "#2a5298",
                  "&:hover": { backgroundColor: "#1e3c72" },
                }}
              >
                Export CSV
              </Button>
            </CSVLink>

            <Button
              startIcon={<PrintIcon />}
              size="small"
              onClick={handlePrint}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                color: "#fff",
                backgroundColor: "#2a5298",
                "&:hover": { backgroundColor: "#1e3c72" },
              }}
            >
              Print
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Snackbar for copy feedback */}
      <Snackbar
        open={copiedMessageOpen}
        onClose={() => setCopiedMessageOpen(false)}
        autoHideDuration={2000}
      >
        <SnackbarContent
          sx={{
            backgroundColor: "#2a5298",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            textAlign: "center",
            borderRadius: 2,
            padding: "8px 16px",
          }}
          message="Text copied successfully!"
        />
      </Snackbar>
    </>
  );
};

export default DataTable;
