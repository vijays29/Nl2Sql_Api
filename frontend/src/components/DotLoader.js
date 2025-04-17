// components/DotLoader.jsx
import React from "react";
import { Box } from "@mui/material";

const DotLoader = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.75)",
        zIndex: 1300,
        animation: "fadeIn 0.3s ease-in-out",
        "@keyframes fadeIn": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      <Box sx={{ display: "flex", gap: 2 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: "#2a5298",
              animation: `dotPulse 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              "@keyframes dotPulse": {
                "0%, 100%": { opacity: 0.3, transform: "scale(0.9)" },
                "50%": { opacity: 1, transform: "scale(1.2)" },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default DotLoader;
