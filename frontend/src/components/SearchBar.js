import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  InputBase,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ArticleIcon from "@mui/icons-material/Article";
import { getAutocompleteSuggestions, filterSuggestions } from "../utils/autocompleteUtils";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedFields, setSelectedFields] = useState([]);
  const [toastOpen, setToastOpen] = useState(false);

  const recognitionRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionRefs = useRef([]);

  const getSelectedTable = useCallback(() => {
    const field = selectedFields.find((f) => f.type === "column");
    return field ? field.table : selectedFields.find((f) => f.type === "table")?.label || null;
  }, [selectedFields]);

  const buildFinalQuery = useCallback(
    (base = query) => {
      const table = getSelectedTable();
      const fieldStr = selectedFields
        .filter((f) => f.type === "column")
        .map((f) => `${f.table}.${f.label}`)
        .join(", ");
      const parts = [table, fieldStr, base].filter(Boolean);
      return parts.join(" | ");
    },
    [query, selectedFields, getSelectedTable]
  );

  useEffect(() => {
    setAllSuggestions(getAutocompleteSuggestions());

    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const voiceResult = event.results[0][0].transcript;
        setQuery(voiceResult);
        onSearch(buildFinalQuery(voiceResult));
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [onSearch, buildFinalQuery]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition not supported.");
      return;
    }
    isListening ? recognitionRef.current.stop() : recognitionRef.current.start();
    setIsListening(!isListening);
  };

  const handleKeyDown = (e) => {
    if (filteredSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const nextIndex = prev < filteredSuggestions.length - 1 ? prev + 1 : 0;
          scrollIntoView(nextIndex);
          return nextIndex;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const nextIndex = prev > 0 ? prev - 1 : filteredSuggestions.length - 1;
          scrollIntoView(nextIndex);
          return nextIndex;
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected =
          highlightedIndex >= 0
            ? filteredSuggestions[highlightedIndex]
            : { label: query, type: "custom" };
        handleSuggestionClick(selected);
      }
    } else if (e.key === "Enter") {
      onSearch(buildFinalQuery());
    }
  };

  const scrollIntoView = (index) => {
    const el = suggestionRefs.current[index];
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setHighlightedIndex(-1);

    if (value.trim() === "") {
      setSelectedFields([]);
      setFilteredSuggestions([]);
      return;
    }

    const parts = value.trim().split(/[\s,]+/); // Split by spaces only
    const lastPart = parts[parts.length - 1] || "";
    setFilteredSuggestions(filterSuggestions(lastPart, allSuggestions));
  };

  const handleSuggestionClick = (suggestion) => {
    const selectedTable = getSelectedTable();

    if (suggestion.type === "column" || suggestion.type === "table") {
      if (!selectedTable || selectedTable === (suggestion.table || suggestion.label)) {
        const exists = selectedFields.some(
          (f) => f.label === suggestion.label && f.table === suggestion.table
        );
        if (!exists) {
          const newSelected = [...selectedFields, suggestion];
          setSelectedFields(newSelected);

          const fieldText = suggestion.label;
          const queryParts = query.trim().split(/\s+/); // Split by spaces only
          queryParts[queryParts.length - 1] = fieldText;
          const newQuery = queryParts.join(" ") + " ";

          setQuery(newQuery);
        }
      } else {
        setToastOpen(true);
      }
    } else {
      setQuery(suggestion.label);
      onSearch(buildFinalQuery(suggestion.label));
    }

    setFilteredSuggestions([]);
    setHighlightedIndex(-1);
  };

  const handleSearchClick = () => {
    onSearch(buildFinalQuery());
    setFilteredSuggestions([]);
    setHighlightedIndex(-1);
  };

  return (
    <Box sx={{ position: "relative", width: "100%", maxWidth: "700px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#fff",
          borderRadius: "30px",
          border: "2px solid #dfe1e5",
          padding: "2px 8px",
          boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            borderColor: "#c0c0c0",
          },
          "&:focus-within": {
            boxShadow: "0 5px 12px rgba(66, 133, 244, 0.3)",
            borderColor: "#4285f4",
          },
        }}
      >
        <InputBase
          placeholder="Search or add fields from tables"
          value={query}
          inputRef={inputRef}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          sx={{ flex: 1, fontSize: "14px", padding: "6px 8px" }}
        />

        <Tooltip title={isListening ? "Stop voice input" : "Start voice input"}>
          <IconButton onClick={toggleListening}>
            {isListening ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Execute search">
          <IconButton onClick={handleSearchClick}>
            <SearchIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography
        variant="caption"
        sx={{ mt: 0.5, ml: 1, display: "block", color: "text.secondary" }}
      >
        Use ↑ or ↓ to navigate suggestions. Press Enter to select.
      </Typography>

      {filteredSuggestions.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: "absolute",
            width: "100%",
            top: "100%",
            mt: 1,
            zIndex: 10,
            maxHeight: 180,
            overflowY: "auto",
            borderRadius: 2,
            p: 0.5,
          }}
        >
          <List dense sx={{ py: 0 }}>
            {filteredSuggestions.map((s, index) => (
              <ListItem
                key={index}
                disablePadding
                selected={index === highlightedIndex}
                ref={(el) => (suggestionRefs.current[index] = el)}
              >
                <ListItemButton
                  onClick={() => handleSuggestionClick(s)}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    minHeight: "36px",
                    backgroundColor: index === highlightedIndex ? "#f0f7ff" : "inherit",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: "30px",
                      color: s.type === "table" ? "#1565c0" : "#2e7d32",
                    }}
                  >
                    {s.type === "table" ? (
                      <FolderOpenIcon fontSize="small" />
                    ) : (
                      <ArticleIcon fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2">{s.label}</Typography>}
                    secondary={
                      <Typography variant="caption">
                        {s.type === "column" ? `Field (${s.table})` : "Table"}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="warning"
          variant="filled"
          onClose={() => setToastOpen(false)}
        >
          You can only select fields or a table from one table at a time.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SearchBar;