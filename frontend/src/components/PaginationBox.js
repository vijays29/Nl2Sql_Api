import React from "react";
import { Box, TextField, Tooltip, IconButton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const PaginationBox = ({ from, to, setFrom, setTo }) => {
  const handleFromChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setFrom(value);
      if (value >= to) {
        setTo(value + 1);
      }
    }
  };

  const handleToChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > from) {
      setTo(value);
    } else {
      setTo(from + 1);
    }
  };

  const handleIncrease = () => {
    setFrom((prev) => prev + 10);
    setTo((prev) => prev + 10);
  };

  const handleDecrease = () => {
    setFrom((prev) => Math.max(0, prev - 10));
    setTo((prev) => Math.max(from + 1, to - 10));
  };

  const handleResetClick = () => {
    setFrom(0);
    setTo(10);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.2,
        background: "#f9fafb",
        padding: "10px 16px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e0e3e7",
        width: "auto",
        maxWidth: "100%",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <TextField
        label="From"
        type="number"
        variant="outlined"
        size="medium"
        value={from}
        onChange={handleFromChange}
        sx={{
          width: "80px",
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            backgroundColor: "#fff",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#f1f1f1",
            },
            "&.Mui-focused": {
              borderColor: "#1976d2",
              boxShadow: "0 0 8px rgba(25, 118, 210, 0.3)",
            },
          },
          "& input": {
            color: "#333",
            fontSize: "14px",
            padding: "8px 10px",
          },
        }}
      />

      <TextField
        label="To"
        type="number"
        variant="outlined"
        size="medium"
        value={to}
        onChange={handleToChange}
        sx={{
          width: "80px",
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            backgroundColor: "#fff",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#f1f1f1",
            },
            "&.Mui-focused": {
              borderColor: "#1976d2",
              boxShadow: "0 0 8px rgba(25, 118, 210, 0.3)",
            },
          },
          "& input": {
            color: "#333",
            fontSize: "14px",
            padding: "8px 10px",
          },
        }}
      />

      <Tooltip title="Decrease by 10">
        <IconButton
          onClick={handleDecrease}
          sx={{
            background: "#fff3e0",
            color: "#e65100",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            transition: "all 0.2s ease",
            "&:hover": {
              background: "#ffe0b2",
              transform: "scale(1.1)",
            },
          }}
        >
          <ArrowDownwardIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Increase by 10">
        <IconButton
          onClick={handleIncrease}
          sx={{
            background: "#e3f2fd",
            color: "#1976d2",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            transition: "all 0.2s ease",
            "&:hover": {
              background: "#bbdefb",
              transform: "scale(1.1)",
            },
          }}
        >
          <ArrowUpwardIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Reset Pagination">
        <IconButton
          onClick={handleResetClick}
          sx={{
            background: "#e8f5e9",
            color: "#388e3c",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            transition: "all 0.2s ease",
            "&:hover": {
              background: "#c8e6c9",
              transform: "scale(1.1)",
            },
          }}
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default PaginationBox;
