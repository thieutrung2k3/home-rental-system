/** @format */

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, CircularProgress, Paper, Grid } from "@mui/material";
import privateAxios from "../../utils/axiosInstance";

const PropertyDetail = () => {
  const { propertyId } = useParams(); // Get propertyId from the URL
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const response = await privateAxios.get(`/property/${propertyId}`);
        setProperty(response.data); // Assuming the API returns the property details
      } catch (error) {
        console.error("Error fetching property details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [propertyId]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!property) {
    return (
      <Typography
        variant='h6'
        align='center'
        sx={{ mt: 4 }}
      >
        Property not found.
      </Typography>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography
        variant='h4'
        gutterBottom
      >
        {property.title}
      </Typography>
      <Typography
        variant='subtitle1'
        gutterBottom
      >
        {property.address}
      </Typography>
      <Typography
        variant='body1'
        gutterBottom
      >
        {property.description}
      </Typography>
      <Typography
        variant='body2'
        gutterBottom
      >
        Bedrooms: {property.bedrooms}, Bathrooms: {property.bathrooms}, Area:{" "}
        {property.area} m²
      </Typography>
      <Typography
        variant='body2'
        gutterBottom
      >
        Price/Month: ${property.pricePerMonth}, Security Deposit: $
        {property.securityDeposit}
      </Typography>
      <Typography
        variant='body2'
        gutterBottom
      >
        Available: {property.isAvailable ? "Yes" : "No"}
      </Typography>

      <Typography
        variant='h6'
        sx={{ mt: 3 }}
      >
        Amenities
      </Typography>
      <Grid
        container
        spacing={2}
      >
        {property.amenities.map((amenity) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={amenity.amenityId}
          >
            <Paper sx={{ p: 2 }}>
              <Typography variant='subtitle1'>{amenity.name}</Typography>
              <img
                src={amenity.imageUrl}
                alt={amenity.name}
                style={{ width: "100%", height: "auto" }}
              />
              <Typography variant='body2'>{amenity.description}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography
        variant='h6'
        sx={{ mt: 3 }}
      >
        Images
      </Typography>
      <Grid
        container
        spacing={2}
      >
        {property.propertyImages.map((image) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={image.imageId}
          >
            <img
              src={image.imageUrl}
              alt={`Property Image ${image.imageId}`}
              style={{ width: "100%", height: "auto" }}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default PropertyDetail;
