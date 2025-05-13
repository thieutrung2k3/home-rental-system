/** @format */

import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  IconButton,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

const PropertyForm = ({ property, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    property || {
      title: "",
      description: "",
      location: "",
      price: "",
      type: "",
      bedrooms: "",
      bathrooms: "",
      area: "",
      amenities: [],
      images: [],
    }
  );

  const [amenityInput, setAmenityInput] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAmenityAdd = () => {
    if (amenityInput && !formData.amenities.includes(amenityInput)) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput],
      }));
      setAmenityInput("");
    }
  };

  const handleAmenityDelete = (amenityToDelete) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter(
        (amenity) => amenity !== amenityToDelete
      ),
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // Handle image upload logic here
    // For now, we'll just add the file names
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files.map((file) => file.name)],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography
        variant='h6'
        gutterBottom
      >
        {property ? "Edit Property" : "Add New Property"}
      </Typography>
      <Box
        component='form'
        onSubmit={handleSubmit}
      >
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            xs={12}
          >
            <TextField
              required
              fullWidth
              label='Property Title'
              name='title'
              value={formData.title}
              onChange={handleChange}
            />
          </Grid>
          <Grid
            item
            xs={12}
          >
            <TextField
              required
              fullWidth
              multiline
              rows={4}
              label='Description'
              name='description'
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
          >
            <TextField
              required
              fullWidth
              label='Location'
              name='location'
              value={formData.location}
              onChange={handleChange}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
          >
            <TextField
              required
              fullWidth
              type='number'
              label='Price per Month'
              name='price'
              value={formData.price}
              onChange={handleChange}
              InputProps={{
                startAdornment: "$",
              }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
          >
            <FormControl
              fullWidth
              required
            >
              <InputLabel>Property Type</InputLabel>
              <Select
                name='type'
                value={formData.type}
                onChange={handleChange}
                label='Property Type'
              >
                <MenuItem value='apartment'>Apartment</MenuItem>
                <MenuItem value='house'>House</MenuItem>
                <MenuItem value='villa'>Villa</MenuItem>
                <MenuItem value='condo'>Condo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
          >
            <TextField
              required
              fullWidth
              type='number'
              label='Bedrooms'
              name='bedrooms'
              value={formData.bedrooms}
              onChange={handleChange}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
          >
            <TextField
              required
              fullWidth
              type='number'
              label='Bathrooms'
              name='bathrooms'
              value={formData.bathrooms}
              onChange={handleChange}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
          >
            <TextField
              required
              fullWidth
              type='number'
              label='Area (sq ft)'
              name='area'
              value={formData.area}
              onChange={handleChange}
            />
          </Grid>
          <Grid
            item
            xs={12}
          >
            <Box sx={{ mb: 2 }}>
              <Typography
                variant='subtitle1'
                gutterBottom
              >
                Amenities
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField
                  size='small'
                  label='Add Amenity'
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAmenityAdd();
                    }
                  }}
                />
                <Button
                  variant='contained'
                  onClick={handleAmenityAdd}
                  disabled={!amenityInput}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {formData.amenities.map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    onDelete={() => handleAmenityDelete(amenity)}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
          >
            <Box sx={{ mb: 2 }}>
              <Typography
                variant='subtitle1'
                gutterBottom
              >
                Images
              </Typography>
              <input
                accept='image/*'
                style={{ display: "none" }}
                id='property-images'
                type='file'
                multiple
                onChange={handleImageUpload}
              />
              <label htmlFor='property-images'>
                <Button
                  variant='outlined'
                  component='span'
                >
                  Upload Images
                </Button>
              </label>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {formData.images.map((image, index) => (
                  <Chip
                    key={index}
                    label={image}
                    onDelete={() => {
                      setFormData((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index),
                      }));
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
          >
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant='outlined'
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                variant='contained'
              >
                {property ? "Update Property" : "Add Property"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default PropertyForm;
