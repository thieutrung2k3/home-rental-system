/** @format */

import React, { useState } from "react";
import { Box, CssBaseline, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import PropertyList from "../../components/PropertyList/PropertyList";

const Dashboard = () => {
  const [open, setOpen] = useState(true);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const propertyData = {
    result: {
      content: [
        {
          propertyId: 1,
          title: "Luxury Apartment",
          category: { name: "Apartment" },
          location: { city: "New York" },
          bedrooms: 3,
          bathrooms: 2,
          pricePerMonth: 2500,
          isAvailable: true,
        },
      ],
      totalPages: 1,
      totalElements: 1,
    },
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <CssBaseline />

      {/* Header component */}
      <Header
        open={open}
        toggleDrawer={toggleDrawer}
      />

      {/* Sidebar component */}
      <Sidebar
        open={open}
        toggleDrawer={toggleDrawer}
      />

      {/* Main content */}
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? 200 : 10}px)` },
          ml: { sm: `${open ? 0 : 10}px` },
          transition: (theme) =>
            theme.transitions.create(["margin", "width"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          backgroundColor: (theme) => theme.palette.grey[50],
          minHeight: "100vh",
          overflow: "auto",
        }}
      >
        <Toolbar />
        <Outlet /> {/* This will render the nested routes */}
      </Box>
    </Box>
  );
};

export default Dashboard;
