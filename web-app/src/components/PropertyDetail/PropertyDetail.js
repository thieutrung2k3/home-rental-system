/** @format */

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, CircularProgress, Paper, Grid } from "@mui/material";
import { publicAxios } from "../../utils/axiosInstance";

const PropertyDetail = () => {
  const { propertyId } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const response = await publicAxios.get(
          "/property/public/getPropertyById",
          {
            params: { id: propertyId },
          }
        );

        if (response.data?.code === 1000 && response.data?.result) {
          setProperty(response.data.result);
          setError(null);
        } else {
          setError("Property not found");
          setProperty(null);
        }
      } catch (error) {
        console.error("Error fetching property details:", error);
        setError(
          error.response?.data?.message || "Error loading property details"
        );
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

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

  if (error || !property) {
    return (
      <Typography
        variant='h6'
        align='center'
        sx={{ mt: 4 }}
      >
        {error || "Property not found"}
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

      <Grid
        container
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Grid
          item
          xs={12}
          md={6}
        >
          <Typography
            variant='subtitle1'
            gutterBottom
          >
            <strong>Owner:</strong> {property.name} ({property.email})
          </Typography>
          <Typography
            variant='subtitle1'
            gutterBottom
          >
            <strong>Address:</strong> {property.address}
          </Typography>
          <Typography
            variant='body1'
            gutterBottom
          >
            {property.description}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
        >
          <Typography
            variant='body2'
            gutterBottom
          >
            <strong>Bedrooms:</strong> {property.bedrooms}
          </Typography>
          <Typography
            variant='body2'
            gutterBottom
          >
            <strong>Bathrooms:</strong> {property.bathrooms}
          </Typography>
          <Typography
            variant='body2'
            gutterBottom
          >
            <strong>Area:</strong> {property.area} m²
          </Typography>
          <Typography
            variant='body2'
            gutterBottom
          >
            <strong>Price/Month:</strong>{" "}
            {formatCurrency(property.pricePerMonth)}
          </Typography>
          <Typography
            variant='body2'
            gutterBottom
          >
            <strong>Security Deposit:</strong>{" "}
            {formatCurrency(property.securityDeposit)}
          </Typography>
          <Typography
            variant='body2'
            gutterBottom
          >
            <strong>Available:</strong> {property.isAvailable ? "Yes" : "No"}
          </Typography>
          <Typography
            variant='body2'
            gutterBottom
          >
            <strong>Featured:</strong> {property.isFeatured ? "Yes" : "No"}
          </Typography>
          <Typography
            variant='body2'
            gutterBottom
          >
            <strong>Listed:</strong> {formatDate(property.createdAt)}
          </Typography>
          <Typography
            variant='body2'
            gutterBottom
          >
            <strong>Last Updated:</strong> {formatDate(property.updatedAt)}
          </Typography>
        </Grid>
      </Grid>

      {/* Display Amenities */}
      {property.amenities && property.amenities.length > 0 && (
        <>
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
        </>
      )}

      {/* Display Property Images */}
      {property.propertyImages && property.propertyImages.length > 0 && (
        <>
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
            {property.propertyImages
              .sort((a, b) => (b.isPrimary ? 1 : -1))
              .map((image) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={image.imageId}
                >
                  <img
                    src={image.imageUrl}
                    alt={`Property Image ${image.imageId}${
                      image.isPrimary ? " (Primary)" : ""
                    }`}
                    style={{
                      width: "100%",
                      height: "auto",
                      border: image.isPrimary ? "2px solid #1976d2" : "none",
                    }}
                  />
                </Grid>
              ))}
          </Grid>
        </>
      )}
    </Paper>
  );
};

export default PropertyDetail;
