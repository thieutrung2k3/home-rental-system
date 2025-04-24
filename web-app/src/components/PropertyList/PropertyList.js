/** @format */

import React, { useEffect, useState, useMemo } from "react";
import { List, ListItem } from "@mui/material";
import {
  Box,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
  TableContainer,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  ImageList, // Add this
  ImageListItem, // Add this
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import privateAxios from "../../utils/axiosInstance";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import {
  BedOutlined as BedIcon,
  BathtubOutlined as BathtubIcon,
  SquareFootOutlined as SquareFootIcon,
  LocationOnOutlined as LocationOnIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import MobileStepper from "@mui/material/MobileStepper";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

// Add these styled components at the top of your file, after imports
const StyledTablePagination = styled(TablePagination)(({ theme }) => ({
  ".MuiTablePagination-select": {
    padding: "4px 28px 4px 8px", // Reduced padding
    borderRadius: "4px",
    border: "1px solid #e0e0e0",
    minWidth: "60px", // Added min-width
    maxWidth: "80px", // Added max-width
    fontSize: "0.875rem", // Slightly smaller font
    "&:hover": {
      borderColor: theme.palette.primary.main,
    },
    "&:focus": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
    },
  },
  ".MuiTablePagination-selectIcon": {
    color: theme.palette.primary.main,
  },
  ".MuiTablePagination-actions": {
    marginLeft: "20px",
    "& .MuiIconButton-root": {
      padding: "8px",
      borderRadius: "50%",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: theme.palette.primary.light,
        transform: "scale(1.1)",
      },
      "&.Mui-disabled": {
        opacity: 0.5,
      },
    },
  },
  ".MuiTablePagination-displayedRows": {
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
  ".MuiTablePagination-toolbar": {
    minHeight: "56px",
    padding: "8px 16px",
    backgroundColor: "#fafafa",
    borderRadius: "0 0 8px 8px",
  },
  ".MuiTablePagination-selectLabel": {
    fontSize: "0.875rem", // Match select font size
  },
}));

const COLUMN_WIDTHS = {
  stt: "50px",
  title: "200px",
  address: "250px",
  bedrooms: "100px",
  bathrooms: "100px",
  area: "100px",
  price: "150px",
  status: "120px",
  actions: "150px",
};

// Add this helper function alongside the existing formatPrice function
const formatCurrency = (amount) => {
  if (!amount) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Keep your existing formatPrice function
const formatPrice = (value) => {
  if (!value) return "";
  return new Intl.NumberFormat("vi-VN").format(value);
};

const PropertyList = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigation
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState({
    title: "",
    address: "",
    bedrooms: "",
    bathrooms: "",
    areaFrom: "",
    areaTo: "",
    priceFrom: "",
    priceTo: "",
    status: "", // for availability status
  });

  // Add sort state and handler
  const [sortConfig, setSortConfig] = useState({
    sortBy: "propertyId",
    sortDirection: "DESC",
  });

  const handleSort = (column) => {
    setSortConfig((prev) => ({
      sortBy: column,
      sortDirection:
        prev.sortBy === column && prev.sortDirection === "ASC" ? "DESC" : "ASC",
    }));
  };

  // Update the useEffect hook with the new API call
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await privateAxios.get(
          "/property/owner/searchProperties",
          {
            params: {
              title: searchQuery.title || null,
              address: searchQuery.address || null,
              bedrooms: searchQuery.bedrooms || null,
              bathrooms: searchQuery.bathrooms || null,
              minArea: searchQuery.areaFrom || null,
              maxArea: searchQuery.areaTo || null,
              minPrice: searchQuery.priceFrom || null,
              maxPrice: searchQuery.priceTo || null,
              isAvailable:
                searchQuery.status === ""
                  ? null
                  : searchQuery.status === "true",
              page: page,
              size: rowsPerPage,
              sortBy: sortConfig.sortBy,
              sortDirection: sortConfig.sortDirection,
            },
          }
        );

        if (response.data?.result) {
          setProperties(response.data.result.content);
          setTotalPages(response.data.result.totalPages);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [page, rowsPerPage, searchQuery, sortConfig]);

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

  const handleRowClick = (propertyId) => {
    const property = properties.find((p) => p.propertyId === propertyId);
    setSelectedProperty(property);
    setOpenDialog(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (field, value) => {
    setSearchQuery((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPage(0); // Reset to first page when searching
  };

  // Update the SearchFields component
  const SearchFields = () => {
    const [localSearch, setLocalSearch] = useState({ ...searchQuery });

    const handleLocalSearch = (field, value) => {
      setLocalSearch((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const handleSearchClick = () => {
      // Validate number inputs before searching
      const validatedSearch = {
        ...localSearch,
        bedrooms: localSearch.bedrooms ? parseInt(localSearch.bedrooms) : null,
        bathrooms: localSearch.bathrooms
          ? parseInt(localSearch.bathrooms)
          : null,
        areaFrom: localSearch.areaFrom
          ? parseFloat(localSearch.areaFrom)
          : null,
        areaTo: localSearch.areaTo ? parseFloat(localSearch.areaTo) : null,
        priceFrom: localSearch.priceFrom
          ? parseFloat(localSearch.priceFrom)
          : null,
        priceTo: localSearch.priceTo ? parseFloat(localSearch.priceTo) : null,
      };

      setSearchQuery(validatedSearch);
    };

    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        handleSearchClick();
      }
    };

    const handleClearSearch = () => {
      const emptySearch = {
        title: "",
        address: "",
        bedrooms: "",
        bathrooms: "",
        areaFrom: "",
        areaTo: "",
        priceFrom: "",
        priceTo: "",
        status: "",
      };
      setLocalSearch(emptySearch);
      setSearchQuery(emptySearch);
    };

    return (
      <Box sx={{ mb: 2 }}>
        {/* Title and Address Search - First Row */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            size='small'
            label='Tiêu đề'
            value={localSearch.title}
            onChange={(e) => handleLocalSearch("title", e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ flex: 2 }}
          />
          <TextField
            size='small'
            label='Địa chỉ'
            value={localSearch.address}
            onChange={(e) => handleLocalSearch("address", e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ flex: 2 }}
          />
        </Box>

        {/* Filters - Second Row */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
          {/* Room filters */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              size='small'
              label='Số phòng ngủ'
              value={localSearch.bedrooms}
              onChange={(e) => handleLocalSearch("bedrooms", e.target.value)}
              type='number'
              sx={{ width: "120px" }}
              InputProps={{ inputProps: { min: 0, step: 1 } }}
            />
            <TextField
              size='small'
              label='Số phòng tắm'
              value={localSearch.bathrooms}
              onChange={(e) => handleLocalSearch("bathrooms", e.target.value)}
              type='number'
              sx={{ width: "120px" }}
              InputProps={{ inputProps: { min: 0, step: 1 } }}
            />
          </Box>

          {/* Area range */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              size='small'
              label='Diện tích từ'
              value={localSearch.areaFrom}
              onChange={(e) => handleLocalSearch("areaFrom", e.target.value)}
              type='number'
              sx={{ width: "120px" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>m²</InputAdornment>
                ),
                inputProps: { min: 0, step: 5 },
              }}
            />
            <span>-</span>
            <TextField
              size='small'
              label='Diện tích đến'
              value={localSearch.areaTo}
              onChange={(e) => handleLocalSearch("areaTo", e.target.value)}
              type='number'
              sx={{ width: "120px" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>m²</InputAdornment>
                ),
                inputProps: { min: 0, step: 5 },
              }}
            />
          </Box>

          {/* Price range */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              size='small'
              label='Giá từ'
              value={localSearch.priceFrom}
              onChange={(e) => handleLocalSearch("priceFrom", e.target.value)}
              type='number'
              sx={{ width: "150px" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>VNĐ</InputAdornment>
                ),
                inputProps: { min: 0, step: 1000 },
              }}
            />
            <span>-</span>
            <TextField
              size='small'
              label='Giá đến'
              value={localSearch.priceTo}
              onChange={(e) => handleLocalSearch("priceTo", e.target.value)}
              type='number'
              sx={{ width: "150px" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>VNĐ</InputAdornment>
                ),
                inputProps: { min: 0, step: 1000 },
              }}
            />
          </Box>

          <TextField
            select
            size='small'
            label=''
            value={localSearch.status}
            onChange={(e) => handleLocalSearch("status", e.target.value)}
            sx={{ width: "150px" }}
            SelectProps={{
              native: true,
            }}
          >
            <option value=''>Tất cả</option>
            <option value='true'>Còn trống</option>
            <option value='false'>Đã cho thuê</option>
          </TextField>
        </Box>

        {/* Search Buttons */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant='outlined'
            onClick={handleClearSearch}
            startIcon={<ClearIcon />}
          >
            Xóa bộ lọc
          </Button>
          <Button
            variant='contained'
            onClick={handleSearchClick}
            startIcon={<SearchIcon />}
          >
            Tìm kiếm
          </Button>
        </Box>
      </Box>
    );
  };

  // Add these theme colors at the top of your file
  const themeColors = {
    primary: {
      main: "#2c3e50", // Navy blue
      light: "#34495e",
      dark: "#2c3e50",
      gradient: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
    },
    secondary: {
      main: "#e74c3c", // Red
      light: "#e57373",
      contrastText: "#fff",
    },
    success: {
      main: "#27ae60", // Green
      light: "#2ecc71",
    },
    warning: {
      main: "#f39c12", // Orange
      light: "#f1c40f",
    },
    error: {
      main: "#c0392b", // Dark red
      light: "#e74c3c",
    },
    background: {
      default: "#ecf0f1",
      paper: "#ffffff",
    },
  };

  // Update the PropertyDialog component structure
  const PropertyDialog = ({ property, onClose }) => {
    // Add constant for error image URL
    const errorImageUrl =
      "https://via.placeholder.com/600x400?text=Ảnh+không+tồn+tại";

    // Add state for amenity dialog
    const [selectedAmenity, setSelectedAmenity] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [openImagePreview, setOpenImagePreview] = useState(false);

    // Add navigation handlers
    const handleNext = () => {
      setActiveStep((prevStep) =>
        prevStep < sortedImages.length - 1 ? prevStep + 1 : prevStep
      );
    };

    const handleBack = () => {
      setActiveStep((prevStep) => (prevStep > 0 ? prevStep - 1 : prevStep));
    };

    // Add image preview handlers
    const handleOpenImagePreview = () => {
      setOpenImagePreview(true);
    };

    const handleCloseImagePreview = () => {
      setOpenImagePreview(false);
    };

    // Sort images to show primary image first
    const sortedImages = useMemo(() => {
      if (!property.propertyImages) return [];
      return [...property.propertyImages].sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return 0;
      });
    }, [property.propertyImages]);

    const maxSteps = sortedImages.length || 0;
    const currentImage = sortedImages[activeStep];

    // Add amenity handlers
    const handleOpenAmenityPreview = (amenity) => {
      setSelectedAmenity(amenity);
    };

    const handleCloseAmenityPreview = () => {
      setSelectedAmenity(null);
    };

    return (
      <>
        {/* Main Dialog */}
        <Dialog
          open={true}
          onClose={onClose}
          maxWidth='md'
          PaperProps={{
            sx: {
              height: "90vh",
              maxHeight: "900px",
              width: "800px",
              borderRadius: 2,
              fontFamily: '"Nunito", "Roboto", "Arial", sans-serif',
            },
          }}
        >
          {/* Title Section */}
          <DialogTitle
            sx={{
              m: 0,
              p: 2,
              background: themeColors.primary.gradient,
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant='h6'
                sx={{ fontWeight: 600 }}
              >
                {property.title}
              </Typography>
              <Typography
                variant='subtitle2'
                sx={{ opacity: 0.9 }}
              >
                <LocationOnIcon
                  sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }}
                />
                {property.address}
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          {/* Image Gallery Section - Remains at the top */}
          <Box sx={{ position: "relative", width: "100%", height: "350px" }}>
            {sortedImages.length > 0 ? (
              <>
                <Box
                  sx={{
                    height: "350px",
                    width: "100%",
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                  onClick={handleOpenImagePreview}
                >
                  <img
                    src={currentImage?.imageUrl || errorImageUrl}
                    alt={`Ảnh ${activeStep + 1}`}
                    onError={(e) => {
                      e.target.src = errorImageUrl;
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {currentImage?.isPrimary && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        bgcolor: themeColors.secondary.main,
                        color: "white",
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        zIndex: 1,
                      }}
                    >
                      Ảnh chính
                    </Box>
                  )}
                </Box>
                <MobileStepper
                  steps={maxSteps}
                  position='static'
                  activeStep={activeStep}
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    bgcolor: "rgba(0, 0, 0, 0.5)",
                    "& .MuiMobileStepper-dot": {
                      bgcolor: "rgba(255, 255, 255, 0.5)",
                    },
                    "& .MuiMobileStepper-dotActive": {
                      bgcolor: "white",
                    },
                  }}
                  nextButton={
                    <Button
                      size='small'
                      onClick={() => handleNext()}
                      disabled={activeStep === maxSteps - 1}
                      sx={{ color: "white" }}
                    >
                      Tiếp
                      <KeyboardArrowRight />
                    </Button>
                  }
                  backButton={
                    <Button
                      size='small'
                      onClick={() => handleBack()}
                      disabled={activeStep === 0}
                      sx={{ color: "white" }}
                    >
                      <KeyboardArrowLeft />
                      Trước
                    </Button>
                  }
                />
              </>
            ) : (
              <Box
                sx={{
                  height: "350px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#f8f9fa",
                }}
              >
                <Typography color='text.secondary'>Chưa có hình ảnh</Typography>
              </Box>
            )}
          </Box>

          <DialogContent sx={{ p: 2, overflowY: "auto" }}>
            {/* Price and Status - More Compact */}
            <Paper
              elevation={2}
              sx={{
                p: 2,
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
              }}
            >
              <Box>
                <Typography
                  variant='h5'
                  sx={{ color: themeColors.secondary.main, fontWeight: 600 }}
                >
                  {formatCurrency(property.pricePerMonth)}
                  <Typography
                    component='span'
                    sx={{ ml: 1, fontSize: "1rem", color: "text.secondary" }}
                  >
                    / tháng
                  </Typography>
                </Typography>
                <Typography
                  variant='subtitle2'
                  sx={{ color: themeColors.primary.main }}
                >
                  Đặt cọc: {formatCurrency(property.securityDeposit)}
                </Typography>
              </Box>
              <Chip
                label={property.isAvailable ? "Còn trống" : "Đã cho thuê"}
                color={property.isAvailable ? "success" : "error"}
                sx={{ fontSize: "0.875rem" }}
              />
            </Paper>

            {/* Property Details */}
            <Grid
              container
              spacing={2}
              sx={{ mb: 3 }}
            >
              <Grid
                item
                xs={12}
              >
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{ color: themeColors.primary.main, fontWeight: 600 }}
                >
                  Thông tin chi tiết
                </Typography>
                <Paper sx={{ p: 2 }}>
                  {/* Description */}
                  <Typography
                    variant='body1'
                    paragraph
                    sx={{ color: "text.secondary", mb: 2 }}
                  >
                    {property.description}
                  </Typography>

                  {/* Property Features in One Row */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 3,
                      p: 2,
                      bgcolor: "#f8f9fa",
                      borderRadius: 1,
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 2,
                        borderRight: "1px solid #e0e0e0",
                      }}
                    >
                      <BedIcon color='primary' />
                      <Typography sx={{ fontWeight: 500 }}>
                        {property.bedrooms} phòng ngủ
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 2,
                        borderRight: "1px solid #e0e0e0",
                      }}
                    >
                      <BathtubIcon color='primary' />
                      <Typography sx={{ fontWeight: 500 }}>
                        {property.bathrooms} phòng tắm
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 2,
                      }}
                    >
                      <SquareFootIcon color='primary' />
                      <Typography sx={{ fontWeight: 500 }}>
                        {property.area} m²
                      </Typography>
                    </Box>
                  </Box>

                  {/* Last Updated */}
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{
                      mt: 2,
                      textAlign: "right",
                      fontStyle: "italic",
                    }}
                  >
                    Cập nhật:{" "}
                    {new Date(property.updatedAt).toLocaleDateString("vi-VN")}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Amenities Section with click handler */}
            <Typography
              variant='h6'
              gutterBottom
              sx={{ color: themeColors.primary.main, fontWeight: 600 }}
            >
              Tiện ích
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Grid
                container
                spacing={2}
              >
                {property.amenities && property.amenities.length > 0 ? (
                  property.amenities.map((amenity) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={amenity.amenityId}
                    >
                      <Paper
                        sx={{
                          p: 1.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          height: "100%",
                          cursor: "pointer",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            transition: "all 0.2s",
                            boxShadow: 2,
                          },
                        }}
                        onClick={() => handleOpenAmenityPreview(amenity)}
                      >
                        <img
                          src={amenity.imageUrl}
                          alt={amenity.name}
                          onError={(e) => {
                            e.target.src = errorImageUrl;
                          }}
                          style={{
                            width: 24,
                            height: 24,
                            objectFit: "contain",
                          }}
                        />
                        <Box>
                          <Typography
                            variant='subtitle2'
                            sx={{ color: themeColors.primary.main }}
                          >
                            {amenity.name}
                          </Typography>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                          >
                            {amenity.description}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  <Grid
                    item
                    xs={12}
                  >
                    <Paper
                      sx={{ p: 2, textAlign: "center", bgcolor: "#f8f9fa" }}
                    >
                      <Typography color='text.secondary'>
                        Chưa có tiện ích
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
            <Button
              onClick={onClose}
              variant='outlined'
              startIcon={<CloseIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                color: themeColors.primary.main,
              }}
            >
              Đóng
            </Button>
            <Button
              variant='contained'
              onClick={() => navigate(`/property/${property.propertyId}`)}
              startIcon={<ArrowForwardIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                bgcolor: themeColors.secondary.main,
                "&:hover": { bgcolor: themeColors.secondary.dark },
              }}
            >
              Xem chi tiết
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Image Preview Dialog */}
        <Dialog
          open={openImagePreview}
          onClose={() => setOpenImagePreview(false)}
          maxWidth={false}
          PaperProps={{
            sx: {
              width: "90vw",
              height: "90vh",
              m: 0,
              bgcolor: "background.paper",
              position: "relative",
            },
          }}
        >
          <IconButton
            onClick={() => setOpenImagePreview(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
              bgcolor: "rgba(0, 0, 0, 0.5)",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.7)",
              },
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box
            sx={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              bgcolor: "black",
            }}
          >
            {/* Main Image */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <img
                src={
                  property.propertyImages[activeStep]?.imageUrl || errorImageUrl
                }
                alt={`Ảnh ${activeStep + 1}`}
                onError={(e) => {
                  e.target.src = errorImageUrl;
                }}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />

              {/* Navigation Buttons */}
              <IconButton
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={{
                  position: "absolute",
                  left: 16,
                  color: "white",
                  bgcolor: "rgba(0, 0, 0, 0.5)",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.7)",
                  },
                  "&.Mui-disabled": {
                    display: "none",
                  },
                }}
              >
                <KeyboardArrowLeft />
              </IconButton>
              <IconButton
                onClick={handleNext}
                disabled={activeStep === maxSteps - 1}
                sx={{
                  position: "absolute",
                  right: 16,
                  color: "white",
                  bgcolor: "rgba(0, 0, 0, 0.5)",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.7)",
                  },
                  "&.Mui-disabled": {
                    display: "none",
                  },
                }}
              >
                <KeyboardArrowRight />
              </IconButton>
            </Box>

            {/* Thumbnails */}
            <Box
              sx={{
                p: 2,
                bgcolor: "rgba(0, 0, 0, 0.9)",
                display: "flex",
                gap: 1,
                overflowX: "auto",
                "&::-webkit-scrollbar": {
                  height: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "4px",
                },
              }}
            >
              {property.propertyImages.map((image, index) => (
                <Box
                  key={image.imageId}
                  onClick={() => setActiveStep(index)}
                  sx={{
                    width: 100,
                    height: 70,
                    flexShrink: 0,
                    cursor: "pointer",
                    border: activeStep === index ? "2px solid white" : "none",
                    opacity: activeStep === index ? 1 : 0.6,
                    transition: "all 0.2s",
                    "&:hover": {
                      opacity: 1,
                    },
                  }}
                >
                  <img
                    src={image.imageUrl || errorImageUrl}
                    alt={`Thumbnail ${index + 1}`}
                    onError={(e) => {
                      e.target.src = errorImageUrl;
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Dialog>
      </>
    );
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography
          variant='h5'
          gutterBottom
          sx={{ fontWeight: "bold", color: "#1976d2" }}
        >
          Danh sách tài sản của tôi
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ mb: 2 }}
        >
          Quản lý tất cả các tài sản của bạn tại đây
        </Typography>
      </Paper>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <SearchFields />
        <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
          {" "}
          {/* Adjusted height for pagination */}
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    width: COLUMN_WIDTHS.stt,
                  }}
                >
                  STT
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    width: COLUMN_WIDTHS.title,
                    cursor: "pointer",
                  }}
                  onClick={() => handleSort("title")}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Tiêu đề
                    {sortConfig.sortBy === "title" && (
                      <Box
                        component='span'
                        sx={{ ml: 0.5 }}
                      >
                        {sortConfig.sortDirection === "ASC" ? "↑" : "↓"}
                      </Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    width: COLUMN_WIDTHS.address,
                  }}
                >
                  Địa chỉ
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    width: COLUMN_WIDTHS.bedrooms,
                  }}
                >
                  Số phòng ngủ
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    width: COLUMN_WIDTHS.bathrooms,
                  }}
                >
                  Số phòng tắm
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    width: COLUMN_WIDTHS.area,
                  }}
                >
                  Diện tích (m²)
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    width: COLUMN_WIDTHS.price,
                  }}
                >
                  Giá/tháng
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    width: COLUMN_WIDTHS.status,
                  }}
                >
                  Trạng thái
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    width: COLUMN_WIDTHS.actions,
                  }}
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    align='center'
                    sx={{ py: 3 }}
                  >
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : properties.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    align='center'
                    sx={{
                      py: 6,
                      backgroundColor: "#fafafa",
                      borderBottom: "none",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant='h6'
                        color='text.secondary'
                      >
                        Không tìm thấy tài sản nào
                      </Typography>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Thử thay đổi bộ lọc tìm kiếm của bạn
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((property, index) => (
                  <TableRow
                    key={property.propertyId}
                    hover
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                        transition: "background-color 0.2s ease-in-out",
                      },
                    }}
                  >
                    <TableCell align='center'>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell>{property.title}</TableCell>
                    <TableCell>{property.address}</TableCell>
                    <TableCell align='center'>{property.bedrooms}</TableCell>
                    <TableCell align='center'>{property.bathrooms}</TableCell>
                    <TableCell align='center'>{property.area}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(property.pricePerMonth)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          property.isAvailable ? "Còn trống" : "Đã cho thuê"
                        }
                        color={property.isAvailable ? "success" : "error"}
                        size='small'
                        sx={{ minWidth: 90 }}
                      />
                    </TableCell>
                    <TableCell>
                      {/* Remove the Box component and use a fragment instead */}
                      <>
                        <Tooltip title='Xem chi tiết'>
                          <IconButton
                            size='small'
                            color='primary'
                            onClick={() => handleRowClick(property.propertyId)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Chỉnh sửa'>
                          <IconButton
                            size='small'
                            color='info'
                            onClick={() =>
                              navigate(`/property/edit/${property.propertyId}`)
                            }
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Xóa'>
                          <IconButton
                            size='small'
                            color='error'
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <StyledTablePagination
          component='div'
          count={totalPages * rowsPerPage} // Total number of items
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            borderTop: "1px solid rgba(224, 224, 224, 1)",
            "& .MuiTablePagination-toolbar": {
              flexWrap: "wrap",
              gap: 1,
            },
          }}
          labelRowsPerPage='Số hàng mỗi trang'
          labelDisplayedRows={({ from, to, count }) => (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontWeight: 500,
                color: "primary.main",
              }}
            >
              <span style={{ color: "#666" }}>Hiển thị</span>
              <strong>{from}</strong>
              <span style={{ color: "#666" }}>đến</span>
              <strong>{to}</strong>
              <span style={{ color: "#666" }}>trong tổng số</span>
              <strong>{count !== -1 ? count : `${to}+`}</strong>
            </span>
          )}
          ActionsComponent={(props) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title='Trang trước'>
                <span>
                  <IconButton
                    onClick={(e) => props.onPageChange(e, props.page - 1)}
                    disabled={props.page === 0}
                    size='small'
                    sx={{
                      "&:hover": {
                        backgroundColor: "primary.light",
                      },
                      "&.Mui-disabled": {
                        opacity: 0.5,
                      },
                    }}
                  >
                    <NavigateBeforeIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title='Trang sau'>
                <span>
                  <IconButton
                    onClick={(e) => props.onPageChange(e, props.page + 1)}
                    disabled={
                      props.page >=
                      Math.ceil(props.count / props.rowsPerPage) - 1
                    }
                    size='small'
                    sx={{
                      "&:hover": {
                        backgroundColor: "primary.light",
                      },
                      "&.Mui-disabled": {
                        opacity: 0.5,
                      },
                    }}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          )}
        />
      </Paper>
      {/* Property Detail Dialog */}
      {openDialog && selectedProperty && (
        <PropertyDialog
          property={selectedProperty}
          onClose={() => {
            setOpenDialog(false);
            setSelectedProperty(null);
          }}
        />
      )}
    </Box>
  );
};

export default PropertyList;
