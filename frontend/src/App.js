import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import LandingPage from "./components/LandingPage";
import MainApp from "./components/MainApp";

const App = () => {
  const theme = createTheme({
    palette: {
      mode: "light",
      background: {
        default: "#f5f5f5",
        paper: "#ffffff",
      },
      text: {
        primary: "#333333",
        secondary: "#555555",
      },
    },
    typography: {
      fontFamily: "Arial, sans-serif",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/main" element={<MainApp />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
