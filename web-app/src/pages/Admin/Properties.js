/** @format */

import React, { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";

const Properties = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data - replace with actual API data
  const properties = [
    {
      id: 1,
      title: "Luxury Apartment",
      location: "New York",
      price: 2500,
      status: "approved",
      type: "Apartment",
      bedrooms: 2,
    },
    // Add more mock data as needed
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Grid
        container
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <TextField
            fullWidth
            label='Search Properties'
            variant='outlined'
            size='small'
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <TextField
            fullWidth
            select
            label='Status'
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size='small'
          >
            <MenuItem value='all'>All</MenuItem>
            <MenuItem value='approved'>Approved</MenuItem>
            <MenuItem value='pending'>Pending</MenuItem>
            <MenuItem value='rejected'>Rejected</MenuItem>
          </TextField>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <TextField
            fullWidth
            select
            label='Property Type'
            size='small'
          >
            <MenuItem value='all'>All Types</MenuItem>
            <MenuItem value='apartment'>Apartment</MenuItem>
            <MenuItem value='house'>House</MenuItem>
            <MenuItem value='villa'>Villa</MenuItem>
          </TextField>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            fullWidth
            sx={{ height: "40px" }}
          >
            Add Property
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table
          sx={{ minWidth: 650 }}
          aria-label='properties table'
        >
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Bedrooms</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {properties
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((property) => (
                <TableRow key={property.id}>
                  <TableCell>{property.title}</TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell>${property.price}/month</TableCell>
                  <TableCell>{property.type}</TableCell>
                  <TableCell>{property.bedrooms}</TableCell>
                  <TableCell>
                    <Chip
                      label={property.status}
                      color={getStatusColor(property.status)}
                      size='small'
                    />
                  </TableCell>
                  <TableCell align='right'>
                    <IconButton
                      size='small'
                      color='primary'
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size='small'
                      color='error'
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={properties.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default Properties;
