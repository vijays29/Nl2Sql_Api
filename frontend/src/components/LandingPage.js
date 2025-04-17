import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { styled, keyframes } from "@mui/system";

// Bubble animation
const bubbleAnimation = keyframes`
  0% { transform: translateY(0); opacity: 0.6; }
  100% { transform: translateY(-100%) scale(1.2); opacity: 0; }
`;

// Pulse glow animation
const pulseGlow = keyframes`
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.05); }
`;

// Styled CTA Button
const FlushButton = styled(Button)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  padding: "12px 28px",
  fontFamily: "'Source Code Pro', monospace",
  fontWeight: 800,
  fontSize: "1.1rem",
  textTransform: "uppercase",
  letterSpacing: 1,
  color: "#e0f7ff",
  background: "linear-gradient(135deg, #0077ff, #00e5ff)",
  borderRadius: "14px",
  boxShadow: "0 4px 18px rgba(0, 229, 255, 0.2)",
  transition: "all 0.4s ease-in-out",
  backdropFilter: "blur(2px)",

  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 0 20px rgba(0,229,255,0.4)",
    background: "linear-gradient(135deg, #00e5ff, #0077ff)",
  },
  "&:active": {
    transform: "scale(0.98)",
    boxShadow: "0 0 12px rgba(0,229,255,0.25)",
  },

  "& .button-glow": {
    content: "''",
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "200%",
    height: "100%",
    background: "linear-gradient(120deg, transparent 0%, rgba(0,229,255,0.2) 50%, transparent 100%)",
    transition: "all 0.5s ease",
    zIndex: -1,
  },
  "&:hover .button-glow": {
    left: "0",
  },

  "& .button-pulse": {
    content: "''",
    position: "absolute",
    top: "-15%",
    left: "-15%",
    width: "130%",
    height: "130%",
    background: "radial-gradient(circle, rgba(0,229,255,0.2) 0%, transparent 70%)",
    borderRadius: "50%",
    zIndex: -2,
    animation: `${pulseGlow} 3s infinite ease-in-out`,
    opacity: 0,
    transition: "opacity 0.4s ease",
  },
  "&:hover .button-pulse": {
    opacity: 1,
  },

  "& .arrow-icon": {
    marginLeft: 10,
    transition: "transform 0.4s ease",
  },
  "&:hover .arrow-icon": {
    transform: "translateX(6px)",
  },

  "& .bubbles": {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -3,
    overflow: "hidden",
  },
  "& .bubbles span": {
    position: "absolute",
    bottom: "-20px",
    width: "6px",
    height: "6px",
    background: "rgba(255,255,255,0.3)",
    borderRadius: "50%",
    animation: `${bubbleAnimation} 3s linear infinite`,
  },

  "& .bubbles span:nth-of-type(1)": { left: "10%", animationDelay: "0s" },
  "& .bubbles span:nth-of-type(2)": { left: "25%", animationDelay: "0.5s" },
  "& .bubbles span:nth-of-type(3)": { left: "40%", animationDelay: "1s" },
  "& .bubbles span:nth-of-type(4)": { left: "60%", animationDelay: "1.5s" },
  "& .bubbles span:nth-of-type(5)": { left: "75%", animationDelay: "2s" },
  "& .bubbles span:nth-of-type(6)": { left: "90%", animationDelay: "2.5s" },
}));

const LandingPage = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate("/main");
  };

  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      >
        <source src="/background6.mp4" type="video/mp4" />
      </video>

      {/* Header */}
<Box
  sx={{
    position: "absolute",
    top: 0,
    py: 2,
    px: 4,
    display: "flex",
    alignItems: "center",
    zIndex: 1,
  }}
>
  <a
    href="https://www.nmsworks.co.in"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
    }}
  >
    <Box
      component="img"
      src="/nms2_logo.png"
      alt="Logo"
      sx={{
        width: 75,
        height: 40,
        mr: 0.8,
        cursor: "pointer",
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
        transition: "filter 0.3s ease",
      }}
    />
    <Typography
      variant="h6"
      sx={{
        color: "#FFFFFF",
        fontWeight: "bold",
        letterSpacing: 0.8,
        textShadow: "1px 1px 4px rgba(0,0,0,0.6)",
        "&:hover": {
          color: "#fffff",
          textShadow: "0 0 10px rgba(93, 108, 108, 0.8)",
        },
      }}
    >
      NL2SQL Explorer
    </Typography>
  </a>
</Box>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ height: "100%" }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            px: 3,
            color: "#ffffff",
          }}
        >
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{
              mb: 2,
              letterSpacing: 1,
              textShadow: "2px 2px 6px rgba(0,0,0,0.6)",
              "&:hover": {
                color: "#5eebf8",
                textShadow: "0 0 12px rgba(0,255,255,0.4)",
              },
            }}
          >
            NL2SQL Explorer
          </Typography>

          <Typography
            variant="h6"
            sx={{
              maxWidth: 800,
              mb: 4,
              lineHeight: 1.6,
              opacity: 0.9,
              textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
              "&:hover": {
                color: "#e0ffff",
                textShadow: "0 0 8px rgba(0,255,255,0.25)",
              },
            }}
          >
            Transform the way you interact with your data. NL2SQL Explorer empowers you to query databases using plain English—no coding required.
          </Typography>

          <Box
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              borderRadius: 3,
              px: 4,
              py: 2.5,
              mb: 5,
              border: "1px solid rgba(255,255,255,0.15)",
              textAlign: "left",
              maxWidth: 600,
              boxShadow: "0 0 10px rgba(0,0,0,0.2)",
              "&:hover": {
                boxShadow: "0 0 16px rgba(0,255,255,0.25)",
              },
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                color: "#00e5ff",
                mb: 1,
                "&:hover": {
                  color: "#00ffff",
                  textShadow: "0 0 6px rgba(0,255,255,0.3)",
                },
              }}
            >
              Guidelines:
            </Typography>
            <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
              {[
                "Use precise and relevant queries.",
                "Reference existing tables and columns only.",
                "No need to write SQL manually.",
                "Pagination, filters, and sorting supported.",
              ].map((rule, index) => (
                <motion.li
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    color: "#dddddd",
                    cursor: "default",
                    transition: "all 0.3s ease",
                  }}
                >
                  {rule}
                </motion.li>
              ))}
            </ul>
          </Box>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <FlushButton onClick={handleGetStarted}>
              <span style={{ position: "relative", zIndex: 2 }}>Let's Get Started</span>
              <span className="arrow-icon">➔</span>
              <span className="button-glow" />
              <span className="button-pulse" />
              <div className="bubbles">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} />
                ))}
              </div>
            </FlushButton>
          </motion.div>
        </Box>
      </motion.div>

      {/* Footer */}
      <Box
        sx={{
          width: "100%",
          position: "absolute",
          bottom: 0,
          py: 1.5,
          textAlign: "center",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          color: "#cccccc",
          fontSize: "0.85rem",
          zIndex: 1,
        }}
      >
        © {new Date().getFullYear()} NMSWorks Software (P) Ltd. All rights reserved.
      </Box>
    </Box>
  );
};

export default LandingPage;
