"use client";

import * as React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#0b0b0f", paper: "#11141a" },
    text: {
      primary: "rgba(255,255,255,.95)",
      secondary: "rgba(255,255,255,.75)",
      disabled: "rgba(255,255,255,.45)",
    },
    divider: "rgba(255,255,255,.14)",
    primary: { main: "#00d0ff", contrastText: "#001018" },
    secondary: { main: "#03d88f" },
  },
  typography: {
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255,255,255,.06)",
          borderRadius: 10,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,.22)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,.45)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00d0ff",
            boxShadow: "0 0 0 3px rgba(0,208,255,.2)",
          },
          "& .MuiSelect-icon": { color: "rgba(255,255,255,.9)" },
          "& input, & .MuiSelect-select": { color: "rgba(255,255,255,.95)" },
          "& input::placeholder": { color: "rgba(255,255,255,.65)", opacity: 1 },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: { root: { color: "rgba(255,255,255,.75)", "&.Mui-focused": { color: "#9eeaff" } } },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#11141a",
          color: "rgba(255,255,255,.95)",
          border: "1px solid rgba(255,255,255,.14)",
          borderRadius: 10,
        },
      },
    },
    MuiSlider: {
      styleOverrides: { thumb: { boxShadow: "0 0 0 3px rgba(0,208,255,.2)" }, rail: { opacity: .3 } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          background: "linear-gradient(135deg,rgba(0,208,255,.25),rgba(0,255,225,.18))",
          border: "1px solid rgba(0,208,255,.45)",
          color: "#e9eef5",
          transition: "background .15s ease, transform .15s ease",
          '&:hover': {
            background: "linear-gradient(135deg,rgba(0,208,255,.35),rgba(0,255,225,.28))",
            transform: "translateY(-1px)",
          },
          '&:active': { transform: "translateY(0)" },
        },
        outlined: {
          background: "linear-gradient(135deg,rgba(0,208,255,.25),rgba(0,255,225,.18))",
          borderColor: "rgba(0,208,255,.45)",
          '&:hover': { background: "linear-gradient(135deg,rgba(0,208,255,.35),rgba(0,255,225,.28))" },
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none", border: "1px solid rgba(255,255,255,.12)" } } },
  },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

