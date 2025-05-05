/** @format */

import React, { useEffect, useState, useMemo } from "react";
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
  ImageList,
  ImageListItem,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Divider,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Drawer,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MobileStepper from "@mui/material/MobileStepper";
import { useNavigate } from "react-router-dom";
import privateAxios from "../../utils/axiosInstance";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  BedOutlined as BedIcon,
  BathtubOutlined as BathtubIcon,
  SquareFootOutlined as SquareFootIcon,
  LocationOnOutlined as LocationOnIcon,
  ArrowForward as ArrowForwardIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  NotificationsNone as NotificationIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Home as HomeIcon,
  DirectionsCar as DirectionsCarIcon,
  Pets as PetsIcon,
  Chair as ChairIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";

// Tạo theme màu Traveloka
const travelokaColors = {
  primary: {
    main: "#0770CD", // Blue primary
    light: "#2D8EE7",
    dark: "#0455A1",
  },
  secondary: {
    main: "#FF5722", // Orange accent
    light: "#FF8A65",
    dark: "#E64A19",
  },
  success: {
    main: "#27AE60",
    light: "#2ECC71",
  },
  warning: {
    main: "#F39C12",
    light: "#FFA000",
  },
  error: {
    main: "#E74C3C",
    light: "#FF5252",
  },
  background: {
    default: "#F5F5F5",
    paper: "#FFFFFF",
  },
  text: {
    primary: "#424242",
    secondary: "#757575",
  },
  neutral: {
    light: "#F8F9FA",
    main: "#E9ECEF",
    dark: "#DEE2E6",
  },
};

// Badge và status styling
const StatusBadge = styled(Chip)(({ theme, status }) => ({
  height: 24,
  borderRadius: 12,
  fontWeight: 600,
  fontSize: "0.75rem",
  color: "#FFF",
  ...(status === "available" && {
    backgroundColor: travelokaColors.success.main,
  }),
  ...(status === "unavailable" && {
    backgroundColor: travelokaColors.error.main,
  }),
}));

// Property card styling
const PropertyCard = styled(Card)(({ theme }) => ({
  position: "relative",
  borderRadius: 8,
  overflow: "hidden",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  width: "320px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
    "& .card-actions": {
      opacity: 1,
    },
  },
}));

// Styled action buttons
const ActionButton = styled(Button)(({ theme, buttontype }) => ({
  borderRadius: 20,
  textTransform: "none",
  fontSize: "0.8rem",
  padding: "4px 12px",
  minWidth: "auto",
  fontWeight: 600,
  ...(buttontype === "view" && {
    backgroundColor: alpha(travelokaColors.primary.main, 0.1),
    color: travelokaColors.primary.main,
    "&:hover": {
      backgroundColor: alpha(travelokaColors.primary.main, 0.2),
    },
  }),
  ...(buttontype === "edit" && {
    backgroundColor: alpha(travelokaColors.warning.main, 0.1),
    color: travelokaColors.warning.main,
    "&:hover": {
      backgroundColor: alpha(travelokaColors.warning.main, 0.2),
    },
  }),
  ...(buttontype === "delete" && {
    backgroundColor: alpha(travelokaColors.error.main, 0.1),
    color: travelokaColors.error.main,
    "&:hover": {
      backgroundColor: alpha(travelokaColors.error.main, 0.2),
    },
  }),
}));

// Tab styling cho filter view
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  minWidth: "auto",
  padding: "12px 16px",
  fontSize: "0.875rem",
  fontWeight: 600,
  color: travelokaColors.text.secondary,
  "&.Mui-selected": {
    color: travelokaColors.primary.main,
    fontWeight: 700,
  },
}));

// Search bar styling - Traveloka style
const SearchBar = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 8,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  border: `1px solid ${alpha(travelokaColors.primary.main, 0.1)}`,
  "&:hover": {
    border: `1px solid ${alpha(travelokaColors.primary.main, 0.3)}`,
  },
  marginRight: 16,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: "auto",
  },
}));

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12); // Increased for grid view
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'table'
  const [tabValue, setTabValue] = useState(0); // For All/Available/Rented tabs
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [orderByAnchorEl, setOrderByAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  // PropertyDialog component với phong cách Traveloka
  const PropertyDialog = ({ property, onClose }) => {
    // Add constant for error image URL
    const errorImageUrl =
      "https://via.placeholder.com/600x400?text=Ảnh+không+tồn+tại";

    // State management
    const [activeStep, setActiveStep] = useState(0);
    const [openImagePreview, setOpenImagePreview] = useState(false);
    const [selectedAmenity, setSelectedAmenity] = useState(null);

    // Navigation handlers
    const handleNext = () => {
      setActiveStep((prevStep) =>
        prevStep < sortedImages.length - 1 ? prevStep + 1 : prevStep
      );
    };

    const handleBack = () => {
      setActiveStep((prevStep) => (prevStep > 0 ? prevStep - 1 : prevStep));
    };

    // Image preview handlers
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

    // Format address properly
    const formatAddress = (property) => {
      const location = property.location || {};
      const parts = [];

      if (location.ward) parts.push(location.ward);
      if (location.district) parts.push(location.district);
      if (location.city) parts.push(location.city);
      if (location.country && location.country !== "Việt Nam")
        parts.push(location.country);

      return parts.join(", ");
    };

    const propertyAddress = property.address || formatAddress(property);

    // Nhóm các thuộc tính để hiển thị hợp lý
    const attributeGroups = useMemo(() => {
      if (!property.propertyAttributeValues)
        return { basic: [], additional: [] };

      // Tách các thuộc tính cơ bản và bổ sung
      const basic = [];
      const additional = [];

      property.propertyAttributeValues.forEach((attr) => {
        // Các thuộc tính cơ bản hiển thị ở phần đầu
        if (["Số phòng ngủ", "Số phòng tắm", "Diện tích"].includes(attr.name)) {
          basic.push(attr);
        } else {
          additional.push(attr);
        }
      });

      return { basic, additional };
    }, [property.propertyAttributeValues]);

    // Helper function để xử lý hiển thị giá trị boolean
    const formatAttributeValue = (value) => {
      if (value === "true") return "Có";
      if (value === "false") return "Không";
      return value;
    };

    // Helper function để xác định icon cho các thuộc tính
    const getAttributeIcon = (attrName) => {
      switch (attrName.toLowerCase()) {
        case "số phòng ngủ":
          return (
            <BedIcon
              sx={{ color: travelokaColors.primary.main, fontSize: 28 }}
            />
          );
        case "số phòng tắm":
          return (
            <BathtubIcon
              sx={{ color: travelokaColors.primary.main, fontSize: 28 }}
            />
          );
        case "diện tích":
          return (
            <SquareFootIcon
              sx={{ color: travelokaColors.primary.main, fontSize: 28 }}
            />
          );
        case "số tầng":
          return (
            <HomeIcon
              sx={{ color: travelokaColors.primary.main, fontSize: 28 }}
            />
          );
        case "mặt tiền":
          return (
            <HomeIcon
              sx={{ color: travelokaColors.primary.main, fontSize: 28 }}
            />
          );
        case "bãi đỗ xe":
          return (
            <DirectionsCarIcon
              sx={{ color: travelokaColors.primary.main, fontSize: 28 }}
            />
          );
        case "được nuôi thú cưng":
          return (
            <PetsIcon
              sx={{ color: travelokaColors.primary.main, fontSize: 28 }}
            />
          );
        case "nội thất":
          return (
            <ChairIcon
              sx={{ color: travelokaColors.primary.main, fontSize: 28 }}
            />
          );
        default:
          return (
            <InfoIcon
              sx={{ color: travelokaColors.primary.main, fontSize: 28 }}
            />
          );
      }
    };

    return (
      <>
        {/* Main Dialog */}
        <Dialog
          open={true}
          onClose={onClose}
          maxWidth='md'
          fullWidth={true}
          PaperProps={{
            sx: {
              maxHeight: "90vh",
              borderRadius: "12px",
              overflowY: "hidden",
            },
          }}
        >
          {/* Close button in top-right corner */}
          <IconButton
            onClick={onClose}
            aria-label='close'
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
              color: "white",
              bgcolor: "rgba(0, 0, 0, 0.5)",
              zIndex: 10,
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.7)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Image Carousel with Thumbnails - Traveloka Style */}
          <Box sx={{ position: "relative", height: "350px", bgcolor: "#000" }}>
            {sortedImages.length > 0 ? (
              <Box
                sx={{
                  height: "100%",
                  width: "100%",
                  position: "relative",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
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
                    maxHeight: "100%",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                />

                {/* Overlay text to indicate clickable */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 60,
                    right: 16,
                    bgcolor: "rgba(0, 0, 0, 0.6)",
                    color: "white",
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <VisibilityIcon sx={{ fontSize: 16 }} />
                  Xem tất cả ảnh
                </Box>

                {currentImage?.isPrimary && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      bgcolor: travelokaColors.secondary.main,
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

                {/* Navigation arrows */}
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBack();
                  }}
                  disabled={activeStep === 0}
                  sx={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "white",
                    bgcolor: "rgba(0, 0, 0, 0.5)",
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.7)" },
                    "&.Mui-disabled": { display: "none" },
                  }}
                >
                  <KeyboardArrowLeft />
                </IconButton>

                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  disabled={activeStep === maxSteps - 1}
                  sx={{
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "white",
                    bgcolor: "rgba(0, 0, 0, 0.5)",
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.7)" },
                    "&.Mui-disabled": { display: "none" },
                  }}
                >
                  <KeyboardArrowRight />
                </IconButton>
              </Box>
            ) : (
              <Box
                sx={{
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#f0f0f0",
                }}
              >
                <Box
                  component='img'
                  src='https://d1785e74lyxkqq.cloudfront.net/_next/static/v2/5/5391d86e5f4c5544ec1a9c32c30e871f.svg'
                  sx={{ width: 80, mb: 2, opacity: 0.5 }}
                />
                <Typography color='text.secondary'>Chưa có hình ảnh</Typography>
              </Box>
            )}

            {/* Thumbnails at the bottom */}
            {sortedImages.length > 1 && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "50px",
                  bgcolor: "rgba(0, 0, 0, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  overflowX: "auto",
                  "&::-webkit-scrollbar": { height: "4px" },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: "rgba(255,255,255,0.3)",
                    borderRadius: "4px",
                  },
                }}
              >
                {sortedImages.map((image, index) => (
                  <Box
                    key={image.imageId || index}
                    onClick={() => setActiveStep(index)}
                    sx={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      mx: 0.5,
                      borderRadius: 1,
                      overflow: "hidden",
                      border:
                        activeStep === index
                          ? `2px solid ${travelokaColors.secondary.main}`
                          : "2px solid transparent",
                      opacity: activeStep === index ? 1 : 0.7,
                      cursor: "pointer",
                      transition: "all 0.2s",
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
            )}
          </Box>

          {/* Content Area */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "calc(90vh - 350px)",
            }}
          >
            {/* Title and Status Bar */}
            <Box
              sx={{
                px: 3,
                py: 2,
                borderBottom: `1px solid ${travelokaColors.neutral.main}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography
                  variant='h5'
                  sx={{
                    fontWeight: 700,
                    color: travelokaColors.text.primary,
                    mb: 0.5,
                  }}
                >
                  {property.title}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: travelokaColors.text.secondary,
                  }}
                >
                  <LocationOnIcon sx={{ fontSize: 18, mr: 0.5 }} />
                  <Typography variant='body2'>{propertyAddress}</Typography>
                </Box>
              </Box>

              <StatusBadge
                label={property.isAvailable ? "Còn trống" : "Đã cho thuê"}
                status={property.isAvailable ? "available" : "unavailable"}
                sx={{ mt: 1 }}
              />
            </Box>

            {/* Content Scrollable Area */}
            <Box sx={{ overflow: "auto", flexGrow: 1, p: 3 }}>
              {/* Price Section - Traveloka Style */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 3,
                  border: `1px solid ${travelokaColors.neutral.main}`,
                  borderRadius: 2,
                  bgcolor: travelokaColors.neutral.light,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      gutterBottom
                    >
                      Giá thuê hàng tháng
                    </Typography>
                    <Typography
                      variant='h5'
                      sx={{
                        fontWeight: 700,
                        color: travelokaColors.secondary.main,
                        display: "flex",
                        alignItems: "baseline",
                      }}
                    >
                      {formatCurrency(property.pricePerMonth)}
                      <Typography
                        component='span'
                        sx={{
                          ml: 1,
                          fontSize: "0.875rem",
                          color: travelokaColors.text.secondary,
                          fontWeight: 400,
                        }}
                      >
                        / tháng
                      </Typography>
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      gutterBottom
                    >
                      Tiền đặt cọc
                    </Typography>
                    <Typography
                      variant='h6'
                      sx={{ fontWeight: 600 }}
                    >
                      {formatCurrency(property.securityDeposit)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Property Highlights Section */}
              <Typography
                variant='h6'
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: travelokaColors.primary.main,
                  borderLeft: `4px solid ${travelokaColors.primary.main}`,
                  pl: 1.5,
                  py: 0.5,
                }}
              >
                Thông tin chính
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  mb: 4,
                  mt: 2,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    flex: "1 0 calc(33% - 16px)",
                    minWidth: { xs: "calc(50% - 8px)", sm: "calc(33% - 16px)" },
                    p: 2,
                    border: `1px solid ${travelokaColors.neutral.main}`,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <BedIcon
                    sx={{ color: travelokaColors.primary.main, fontSize: 28 }}
                  />
                  <Box>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                    >
                      Phòng ngủ
                    </Typography>
                    <Typography
                      variant='h6'
                      sx={{ fontWeight: 600 }}
                    >
                      {property.bedrooms ||
                        attributeGroups.basic.find(
                          (attr) => attr.name === "Số phòng ngủ"
                        )?.value ||
                        "N/A"}
                    </Typography>
                  </Box>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    flex: "1 0 calc(33% - 16px)",
                    minWidth: { xs: "calc(50% - 8px)", sm: "calc(33% - 16px)" },
                    p: 2,
                    border: `1px solid ${travelokaColors.neutral.main}`,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <BathtubIcon
                    sx={{ color: travelokaColors.primary.main, fontSize: 28 }}
                  />
                  <Box>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                    >
                      Phòng tắm
                    </Typography>
                    <Typography
                      variant='h6'
                      sx={{ fontWeight: 600 }}
                    >
                      {property.bathrooms ||
                        attributeGroups.basic.find(
                          (attr) => attr.name === "Số phòng tắm"
                        )?.value ||
                        "N/A"}
                    </Typography>
                  </Box>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    flex: "1 0 calc(33% - 16px)",
                    minWidth: { xs: "calc(50% - 8px)", sm: "calc(33% - 16px)" },
                    p: 2,
                    border: `1px solid ${travelokaColors.neutral.main}`,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <SquareFootIcon
                    sx={{ color: travelokaColors.primary.main, fontSize: 28 }}
                  />
                  <Box>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                    >
                      Diện tích
                    </Typography>
                    <Typography
                      variant='h6'
                      sx={{ fontWeight: 600 }}
                    >
                      {property.area ||
                        attributeGroups.basic.find(
                          (attr) => attr.name === "Diện tích"
                        )?.value ||
                        "N/A"}{" "}
                      m²
                    </Typography>
                  </Box>
                </Paper>
              </Box>

              {/* Thêm phần hiển thị các thuộc tính bổ sung */}
              {attributeGroups.additional.length > 0 && (
                <>
                  <Typography
                    variant='h6'
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: travelokaColors.primary.main,
                      borderLeft: `4px solid ${travelokaColors.primary.main}`,
                      pl: 1.5,
                      py: 0.5,
                      mb: 2,
                    }}
                  >
                    Thông tin chi tiết
                  </Typography>

                  <Grid
                    container
                    spacing={2}
                    sx={{ mb: 4 }}
                  >
                    {attributeGroups.additional.map((attr, index) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        key={`attr-${index}`}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            border: `1px solid ${travelokaColors.neutral.main}`,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            height: "100%",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: travelokaColors.primary.main,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            },
                          }}
                        >
                          {getAttributeIcon(attr.name)}
                          <Box>
                            <Typography
                              variant='subtitle2'
                              sx={{
                                fontWeight: 600,
                                color: travelokaColors.text.primary,
                              }}
                            >
                              {attr.name}
                            </Typography>
                            <Typography
                              variant='body2'
                              color='text.secondary'
                            >
                              {formatAttributeValue(attr.value)}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}

              {/* Description Section */}
              <Typography
                variant='h6'
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: travelokaColors.primary.main,
                  borderLeft: `4px solid ${travelokaColors.primary.main}`,
                  pl: 1.5,
                  py: 0.5,
                }}
              >
                Mô tả
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 4,
                  border: `1px solid ${travelokaColors.neutral.main}`,
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant='body1'
                  sx={{
                    color: travelokaColors.text.primary,
                    lineHeight: 1.7,
                    whiteSpace: "pre-line",
                  }}
                >
                  {property.description}
                </Typography>
              </Paper>

              {/* Amenities Section - Traveloka Card Style */}
              <Typography
                variant='h6'
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: travelokaColors.primary.main,
                  borderLeft: `4px solid ${travelokaColors.primary.main}`,
                  pl: 1.5,
                  py: 0.5,
                  mb: 2,
                }}
              >
                Tiện ích
              </Typography>

              {property.amenities && property.amenities.length > 0 ? (
                <Grid
                  container
                  spacing={2}
                  sx={{ mb: 3 }}
                >
                  {property.amenities.map((amenity) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      key={amenity.amenityId || amenity.name}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          border: `1px solid ${travelokaColors.neutral.main}`,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          height: "100%",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: travelokaColors.primary.main,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: alpha(travelokaColors.primary.main, 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <CheckCircleIcon
                            sx={{ color: travelokaColors.primary.main }}
                          />
                        </Box>
                        <Box>
                          <Typography
                            variant='subtitle1'
                            sx={{ fontWeight: 600 }}
                          >
                            {amenity.name}
                          </Typography>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                          >
                            {amenity.description}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    mb: 3,
                    border: `1px dashed ${travelokaColors.neutral.main}`,
                    borderRadius: 2,
                    bgcolor: alpha(travelokaColors.neutral.light, 0.5),
                  }}
                >
                  <Typography color='text.secondary'>
                    Chưa có thông tin về tiện ích
                  </Typography>
                </Paper>
              )}

              {/* Last updated info */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 2,
                }}
              >
                <Typography
                  variant='caption'
                  sx={{
                    color: travelokaColors.text.secondary,
                    fontStyle: "italic",
                  }}
                >
                  Cập nhật:{" "}
                  {new Date(property.updatedAt).toLocaleDateString("vi-VN")}
                </Typography>
              </Box>
            </Box>

            {/* Footer with actions */}
            <Box
              sx={{
                borderTop: `1px solid ${travelokaColors.neutral.main}`,
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                bgcolor: travelokaColors.neutral.light,
              }}
            >
              <Button
                variant='outlined'
                startIcon={<CloseIcon />}
                onClick={onClose}
                sx={{
                  borderColor: travelokaColors.neutral.dark,
                  color: travelokaColors.text.primary,
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: travelokaColors.text.primary,
                    bgcolor: alpha(travelokaColors.text.primary, 0.05),
                  },
                }}
              >
                Đóng
              </Button>

              <Button
                variant='contained'
                onClick={() => navigate(`/property/${property.propertyId}`)}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: travelokaColors.secondary.main,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor: travelokaColors.secondary.dark,
                  },
                }}
              >
                Xem chi tiết
              </Button>
            </Box>
          </Box>
        </Dialog>

        {/* Fullscreen Image Viewer */}
        <Dialog
          open={openImagePreview}
          onClose={handleCloseImagePreview}
          maxWidth={false}
          fullScreen
        >
          <IconButton
            onClick={handleCloseImagePreview}
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              color: "white",
              bgcolor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1001,
              "&:hover": { bgcolor: "rgba(0, 0, 0, 0.7)" },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box
            sx={{
              height: "100%",
              width: "100%",
              bgcolor: "black",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Main large image */}
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                p: 2,
              }}
            >
              <img
                src={sortedImages[activeStep]?.imageUrl || errorImageUrl}
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

              {/* Navigation buttons */}
              <IconButton
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={{
                  position: "absolute",
                  left: 24,
                  color: "white",
                  bgcolor: "rgba(0, 0, 0, 0.5)",
                  "&:hover": { bgcolor: "rgba(0, 0, 0, 0.7)" },
                  "&.Mui-disabled": { opacity: 0.3 },
                }}
              >
                <KeyboardArrowLeft fontSize='large' />
              </IconButton>

              <IconButton
                onClick={handleNext}
                disabled={activeStep === maxSteps - 1}
                sx={{
                  position: "absolute",
                  right: 24,
                  color: "white",
                  bgcolor: "rgba(0, 0, 0, 0.5)",
                  "&:hover": { bgcolor: "rgba(0, 0, 0, 0.7)" },
                  "&.Mui-disabled": { opacity: 0.3 },
                }}
              >
                <KeyboardArrowRight fontSize='large' />
              </IconButton>
            </Box>

            {/* Thumbnails strip */}
            <Box
              sx={{
                height: 100,
                bgcolor: "rgba(0, 0, 0, 0.9)",
                display: "flex",
                padding: 2,
                gap: 1,
                overflowX: "auto",
                alignItems: "center",
                justifyContent: "center",
                "&::-webkit-scrollbar": { height: 8 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: 4,
                },
              }}
            >
              {sortedImages.map((image, index) => (
                <Box
                  key={image.imageId || index}
                  onClick={() => setActiveStep(index)}
                  sx={{
                    width: 80,
                    height: 60,
                    borderRadius: 1,
                    overflow: "hidden",
                    border:
                      activeStep === index
                        ? `2px solid ${travelokaColors.secondary.main}`
                        : "2px solid transparent",
                    opacity: activeStep === index ? 1 : 0.6,
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
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
    sortBy: "updatedAt", // Sort by updatedAt by default
    sortDirection: "DESC",
  });

  const handleSort = (column) => {
    setSortConfig((prev) => ({
      sortBy: column,
      sortDirection:
        prev.sortBy === column && prev.sortDirection === "ASC" ? "DESC" : "ASC",
    }));
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Update status filter based on tab
    if (newValue === 0) {
      // All
      handleSearch("status", "");
    } else if (newValue === 1) {
      // Available
      handleSearch("status", "true");
    } else if (newValue === 2) {
      // Rented
      handleSearch("status", "false");
    }
  };

  // Add sort menu handlers
  const handleOrderByClick = (event) => {
    setOrderByAnchorEl(event.currentTarget);
  };

  const handleOrderByClose = () => {
    setOrderByAnchorEl(null);
  };

  // Handle sort selection
  const handleSortSelect = (sortBy) => {
    const newDirection =
      sortConfig.sortBy === sortBy && sortConfig.sortDirection === "ASC"
        ? "DESC"
        : "ASC";

    setSortConfig({
      sortBy: sortBy,
      sortDirection: newDirection,
    });

    handleOrderByClose();
  };

  // Fetch properties based on search, sort, and pagination
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
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

  // Format functions
  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Handle search input changes
  const handleSearch = (field, value) => {
    setSearchQuery((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPage(0); // Reset to first page when searching
  };

  // Handle property selection
  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
    setOpenDialog(true);
  };

  // Toggle view mode (grid/table)
  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "table" : "grid");
  };

  // Handle filter drawer
  const toggleFilterDrawer = () => {
    setOpenFilterDrawer(!openFilterDrawer);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // FilterDrawer component
  const FilterDrawer = () => {
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
      toggleFilterDrawer();
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
        status: tabValue === 0 ? "" : tabValue === 1 ? "true" : "false",
      };
      setLocalSearch(emptySearch);
      setSearchQuery(emptySearch);
    };

    return (
      <Drawer
        anchor='right'
        open={openFilterDrawer}
        onClose={toggleFilterDrawer}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 400 },
            p: 3,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant='h6'
            fontWeight={700}
            color={travelokaColors.text.primary}
          >
            Bộ lọc tìm kiếm
          </Typography>
          <IconButton onClick={toggleFilterDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography
          variant='subtitle1'
          fontWeight={600}
          sx={{ mb: 2 }}
        >
          Thông tin cơ bản
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            size='small'
            label='Tiêu đề'
            value={localSearch.title}
            onChange={(e) => handleLocalSearch("title", e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            size='small'
            label='Địa chỉ'
            value={localSearch.address}
            onChange={(e) => handleLocalSearch("address", e.target.value)}
          />
        </Box>

        <Typography
          variant='subtitle1'
          fontWeight={600}
          sx={{ mb: 2 }}
        >
          Đặc điểm
        </Typography>

        <Grid
          container
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Grid
            item
            xs={6}
          >
            <TextField
              fullWidth
              size='small'
              label='Số phòng ngủ'
              value={localSearch.bedrooms}
              onChange={(e) => handleLocalSearch("bedrooms", e.target.value)}
              type='number'
              InputProps={{ inputProps: { min: 0, step: 1 } }}
            />
          </Grid>
          <Grid
            item
            xs={6}
          >
            <TextField
              fullWidth
              size='small'
              label='Số phòng tắm'
              value={localSearch.bathrooms}
              onChange={(e) => handleLocalSearch("bathrooms", e.target.value)}
              type='number'
              InputProps={{ inputProps: { min: 0, step: 1 } }}
            />
          </Grid>
        </Grid>

        <Typography
          variant='subtitle1'
          fontWeight={600}
          sx={{ mb: 2 }}
        >
          Diện tích (m²)
        </Typography>

        <Grid
          container
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Grid
            item
            xs={6}
          >
            <TextField
              fullWidth
              size='small'
              label='Từ'
              value={localSearch.areaFrom}
              onChange={(e) => handleLocalSearch("areaFrom", e.target.value)}
              type='number'
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid
            item
            xs={6}
          >
            <TextField
              fullWidth
              size='small'
              label='Đến'
              value={localSearch.areaTo}
              onChange={(e) => handleLocalSearch("areaTo", e.target.value)}
              type='number'
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
        </Grid>

        <Typography
          variant='subtitle1'
          fontWeight={600}
          sx={{ mb: 2 }}
        >
          Giá thuê (VNĐ)
        </Typography>

        <Grid
          container
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Grid
            item
            xs={6}
          >
            <TextField
              fullWidth
              size='small'
              label='Từ'
              value={localSearch.priceFrom}
              onChange={(e) => handleLocalSearch("priceFrom", e.target.value)}
              type='number'
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid
            item
            xs={6}
          >
            <TextField
              fullWidth
              size='small'
              label='Đến'
              value={localSearch.priceTo}
              onChange={(e) => handleLocalSearch("priceTo", e.target.value)}
              type='number'
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", gap: 2, mt: "auto" }}>
          <Button
            fullWidth
            variant='outlined'
            onClick={handleClearSearch}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              color: travelokaColors.text.primary,
              borderColor: travelokaColors.neutral.dark,
            }}
          >
            Xóa bộ lọc
          </Button>

          <Button
            fullWidth
            variant='contained'
            onClick={handleSearchClick}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              bgcolor: travelokaColors.primary.main,
              "&:hover": {
                bgcolor: travelokaColors.primary.dark,
              },
            }}
          >
            Áp dụng
          </Button>
        </Box>
      </Drawer>
    );
  };

  // PropertyGrid component
  const PropertyGrid = () => {
    return (
      <Grid
        container
        spacing={3}
      >
        {properties.length === 0 ? (
          <Grid
            item
            xs={12}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
                bgcolor: "#f8f9fa",
                borderRadius: 2,
              }}
            >
              <HomeIcon
                sx={{
                  fontSize: 60,
                  color: travelokaColors.neutral.dark,
                  mb: 2,
                }}
              />
              <Typography
                variant='h6'
                color='text.secondary'
                gutterBottom
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
          </Grid>
        ) : (
          properties.map((property) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={property.propertyId}
            >
              <PropertyCard>
                {/* Badge cho nổi bật và trạng thái */}
                <Box
                  sx={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}
                >
                  <StatusBadge
                    label={property.isAvailable ? "Còn trống" : "Đã cho thuê"}
                    status={property.isAvailable ? "available" : "unavailable"}
                  />
                </Box>

                {property.isFeatured && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      zIndex: 2,
                      bgcolor: travelokaColors.secondary.main,
                      color: "white",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    Nổi bật
                  </Box>
                )}

                {/* Ảnh tài sản */}
                <CardMedia
                  component='div'
                  sx={{
                    height: 180,
                    position: "relative",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    cursor: "pointer",
                    backgroundImage: `url(${
                      property.propertyImages?.[0]?.imageUrl ||
                      "https://via.placeholder.com/600x400?text=Ảnh+không+tồn+tại"
                    })`,
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)",
                    },
                  }}
                  onClick={() => handlePropertyClick(property)}
                >
                  {/* Đếm số lượng ảnh */}
                  {property.propertyImages &&
                    property.propertyImages.length > 0 && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          right: 8,
                          background: "rgba(0,0,0,0.6)",
                          color: "white",
                          px: 1,
                          py: 0.3,
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <VisibilityIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        {property.propertyImages.length} ảnh
                      </Box>
                    )}

                  {/* Hover actions */}
                  <Box
                    className='card-actions'
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      left: 8,
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    <ActionButton
                      startIcon={<VisibilityIcon fontSize='small' />}
                      buttontype='view'
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePropertyClick(property);
                      }}
                    >
                      Xem
                    </ActionButton>
                  </Box>
                </CardMedia>

                {/* Thông tin tài sản */}
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  {/* Loại tài sản */}
                  <Typography
                    variant='caption'
                    sx={{
                      display: "inline-block",
                      color: travelokaColors.primary.main,
                      fontWeight: 600,
                      mb: 0.5,
                      bgcolor: alpha(travelokaColors.primary.main, 0.1),
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                    }}
                  >
                    {property.name || "Nhà phố"}
                  </Typography>

                  <Typography
                    variant='subtitle1'
                    component='div'
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      color: travelokaColors.text.primary,
                      height: 48,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {property.title}
                  </Typography>

                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      mb: 1.5,
                      fontSize: "0.75rem",
                      lineHeight: 1.4,
                      height: 32,
                      overflow: "hidden",
                    }}
                  >
                    <LocationOnIcon
                      sx={{
                        fontSize: 16,
                        mr: 0.5,
                        mt: 0.2,
                        color: travelokaColors.primary.main,
                        flexShrink: 0,
                      }}
                    />
                    <span>{property.address}</span>
                  </Typography>

                  {/* Các thuộc tính chính */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      mb: 1.5,
                      gap: { xs: 1, sm: 2 },
                    }}
                  >
                    {/* Hiển thị dựa trên propertyAttributeValues nếu có */}
                    {property.propertyAttributeValues ? (
                      <>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <BedIcon
                            sx={{
                              fontSize: 16,
                              mr: 0.5,
                              color: travelokaColors.primary.main,
                            }}
                          />
                          <Typography
                            variant='body2'
                            sx={{ fontSize: "0.875rem" }}
                          >
                            {property.propertyAttributeValues.find(
                              (attr) => attr.name === "Số phòng ngủ"
                            )?.value ||
                              property.bedrooms ||
                              "N/A"}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <BathtubIcon
                            sx={{
                              fontSize: 16,
                              mr: 0.5,
                              color: travelokaColors.primary.main,
                            }}
                          />
                          <Typography
                            variant='body2'
                            sx={{ fontSize: "0.875rem" }}
                          >
                            {property.propertyAttributeValues.find(
                              (attr) => attr.name === "Số phòng tắm"
                            )?.value ||
                              property.bathrooms ||
                              "N/A"}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <SquareFootIcon
                            sx={{
                              fontSize: 16,
                              mr: 0.5,
                              color: travelokaColors.primary.main,
                            }}
                          />
                          <Typography
                            variant='body2'
                            sx={{ fontSize: "0.875rem" }}
                          >
                            {property.area || "N/A"}m²
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <BedIcon
                            sx={{
                              fontSize: 16,
                              mr: 0.5,
                              color: travelokaColors.primary.main,
                            }}
                          />
                          <Typography
                            variant='body2'
                            sx={{ fontSize: "0.875rem" }}
                          >
                            {property.bedrooms || "N/A"}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <BathtubIcon
                            sx={{
                              fontSize: 16,
                              mr: 0.5,
                              color: travelokaColors.primary.main,
                            }}
                          />
                          <Typography
                            variant='body2'
                            sx={{ fontSize: "0.875rem" }}
                          >
                            {property.bathrooms || "N/A"}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <SquareFootIcon
                            sx={{
                              fontSize: 16,
                              mr: 0.5,
                              color: travelokaColors.primary.main,
                            }}
                          />
                          <Typography
                            variant='body2'
                            sx={{ fontSize: "0.875rem" }}
                          >
                            {property.area || "N/A"}m²
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>

                  {/* Các thuộc tính phổ biến khác */}
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}
                  >
                    {property.propertyAttributeValues &&
                      property.propertyAttributeValues
                        .filter((attr) =>
                          [
                            "Bãi đỗ xe",
                            "Được nuôi thú cưng",
                            "Nội thất",
                          ].includes(attr.name)
                        )
                        .map((attr, index) => (
                          <Chip
                            key={index}
                            size='small'
                            label={
                              attr.name.includes("Được")
                                ? "Thú cưng"
                                : attr.name === "Bãi đỗ xe"
                                ? "Có chỗ đỗ xe"
                                : attr.name
                            }
                            sx={{
                              fontSize: "0.7rem",
                              bgcolor:
                                attr.value === "true" || attr.value?.length > 0
                                  ? alpha(travelokaColors.success.main, 0.1)
                                  : alpha(travelokaColors.error.main, 0.1),
                              color:
                                attr.value === "true" || attr.value?.length > 0
                                  ? travelokaColors.success.main
                                  : travelokaColors.error.main,
                              height: 22,
                              "& .MuiChip-label": { px: 1 },
                            }}
                          />
                        ))}
                  </Box>

                  {/* Giá thuê */}
                  <Typography
                    variant='h6'
                    component='div'
                    sx={{
                      fontWeight: 700,
                      color: travelokaColors.secondary.main,
                    }}
                  >
                    {formatCurrency(property.pricePerMonth)}
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 400,
                        color: travelokaColors.text.secondary,
                        marginLeft: "4px",
                      }}
                    >
                      /tháng
                    </span>
                  </Typography>
                </CardContent>

                <Divider />

                {/* Nút thao tác */}
                <CardActions sx={{ p: 1.5, justifyContent: "space-between" }}>
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                    >
                      Cập nhật:{" "}
                      {new Date(property.updatedAt).toLocaleDateString("vi-VN")}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title='Chỉnh sửa'>
                      <ActionButton
                        size='small'
                        buttontype='edit'
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the property click
                          navigate(
                            `/owner/property/update/${property.propertyId}`
                          );
                        }}
                      >
                        <EditIcon fontSize='small' />
                      </ActionButton>
                    </Tooltip>

                    <Tooltip title='Xóa'>
                      <ActionButton
                        size='small'
                        buttontype='delete'
                      >
                        <DeleteIcon fontSize='small' />
                      </ActionButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </PropertyCard>
            </Grid>
          ))
        )}
      </Grid>
    );
  };

  // PropertyTable component
  const PropertyTable = () => {
    return (
      <TableContainer sx={{ maxHeight: "calc(100vh - 280px)" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 600,
                  backgroundColor: travelokaColors.neutral.light,
                }}
              >
                STT
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  backgroundColor: travelokaColors.neutral.light,
                  cursor: "pointer",
                }}
                onClick={() => handleSort("title")}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
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
                  fontWeight: 600,
                  backgroundColor: travelokaColors.neutral.light,
                }}
              >
                Loại
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  backgroundColor: travelokaColors.neutral.light,
                }}
              >
                Địa chỉ
              </TableCell>
              <TableCell
                align='center'
                sx={{
                  fontWeight: 600,
                  backgroundColor: travelokaColors.neutral.light,
                }}
              >
                Phòng ngủ
              </TableCell>
              <TableCell
                align='center'
                sx={{
                  fontWeight: 600,
                  backgroundColor: travelokaColors.neutral.light,
                }}
              >
                Phòng tắm
              </TableCell>
              <TableCell
                align='center'
                sx={{
                  fontWeight: 600,
                  backgroundColor: travelokaColors.neutral.light,
                }}
              >
                Diện tích (m²)
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  backgroundColor: travelokaColors.neutral.light,
                  cursor: "pointer",
                }}
                onClick={() => handleSort("pricePerMonth")}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  Giá/tháng
                  {sortConfig.sortBy === "pricePerMonth" && (
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
                  fontWeight: 600,
                  backgroundColor: travelokaColors.neutral.light,
                }}
              >
                Trạng thái
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  backgroundColor: travelokaColors.neutral.light,
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
                  colSpan={10}
                  align='center'
                  sx={{ py: 4 }}
                >
                  <CircularProgress
                    size={40}
                    sx={{ color: travelokaColors.primary.main }}
                  />
                </TableCell>
              </TableRow>
            ) : properties.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  align='center'
                  sx={{ py: 6 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <HomeIcon
                      sx={{
                        fontSize: 40,
                        color: travelokaColors.neutral.dark,
                        mb: 1,
                      }}
                    />
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
                      backgroundColor: alpha(
                        travelokaColors.primary.light,
                        0.05
                      ),
                      cursor: "pointer",
                    },
                    ...(index % 2 === 1 && {
                      backgroundColor: alpha(
                        travelokaColors.neutral.light,
                        0.5
                      ),
                    }),
                  }}
                  onClick={() => handlePropertyClick(property)}
                >
                  <TableCell align='center'>
                    {page * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar
                        variant='rounded'
                        src={
                          property.propertyImages?.[0]?.imageUrl ||
                          "https://via.placeholder.com/100x100?text=No+Image"
                        }
                        alt={property.title}
                        sx={{ width: 40, height: 40 }}
                      />
                      <Box>
                        <Typography sx={{ fontWeight: 500 }}>
                          {property.title}
                        </Typography>
                        {property.isFeatured && (
                          <Typography
                            variant='caption'
                            sx={{
                              color: travelokaColors.secondary.main,
                              fontWeight: 500,
                              display: "inline-block",
                              bgcolor: alpha(
                                travelokaColors.secondary.main,
                                0.1
                              ),
                              px: 0.7,
                              borderRadius: 0.5,
                            }}
                          >
                            Nổi bật
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant='body2'
                      sx={{ fontWeight: 500 }}
                    >
                      {property.name || "Nhà phố"}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 180,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {property.address}
                  </TableCell>
                  <TableCell align='center'>
                    {property.propertyAttributeValues
                      ? property.propertyAttributeValues.find(
                          (attr) => attr.name === "Số phòng ngủ"
                        )?.value ||
                        property.bedrooms ||
                        "N/A"
                      : property.bedrooms || "N/A"}
                  </TableCell>
                  <TableCell align='center'>
                    {property.propertyAttributeValues
                      ? property.propertyAttributeValues.find(
                          (attr) => attr.name === "Số phòng tắm"
                        )?.value ||
                        property.bathrooms ||
                        "N/A"
                      : property.bathrooms || "N/A"}
                  </TableCell>
                  <TableCell align='center'>
                    {property.propertyAttributeValues
                      ? property.propertyAttributeValues.find(
                          (attr) => attr.name === "Diện tích"
                        )?.value ||
                        property.bedrooms ||
                        "N/A"
                      : property.bedrooms || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: travelokaColors.secondary.main,
                    }}
                  >
                    {formatCurrency(property.pricePerMonth)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={property.isAvailable ? "Còn trống" : "Đã cho thuê"}
                      status={
                        property.isAvailable ? "available" : "unavailable"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title='Chỉnh sửa'>
                        <IconButton
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/property/edit/${property.propertyId}`);
                          }}
                          sx={{
                            color: travelokaColors.warning.main,
                            bgcolor: alpha(travelokaColors.warning.main, 0.1),
                            "&:hover": {
                              bgcolor: alpha(travelokaColors.warning.main, 0.2),
                            },
                          }}
                        >
                          <EditIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Xóa'>
                        <IconButton
                          size='small'
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            color: travelokaColors.error.main,
                            bgcolor: alpha(travelokaColors.error.main, 0.1),
                            "&:hover": {
                              bgcolor: alpha(travelokaColors.error.main, 0.2),
                            },
                          }}
                        >
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Main render return
  return (
    <Box
      sx={{
        bgcolor: travelokaColors.background.default,
        minHeight: "100vh",
        py: 3,
        px: { xs: 2, md: 3 },
      }}
    >
      {/* Header section with title, add button and simple search */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          mb: 3,
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant='h5'
            sx={{
              fontWeight: 700,
              color: travelokaColors.text.primary,
              fontSize: { xs: "1.5rem", md: "1.75rem" },
            }}
          >
            Tài sản của tôi
          </Typography>
          <Typography
            variant='body2'
            color='text.secondary'
          >
            Quản lý tất cả các tài sản cho thuê của bạn
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            placeholder='Tìm kiếm theo tiêu đề, địa chỉ...'
            size='small'
            value={searchQuery.title}
            onChange={(e) => handleSearch("title", e.target.value)}
            sx={{
              minWidth: { xs: "100%", md: 300 },
              bgcolor: "white",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon sx={{ color: travelokaColors.text.secondary }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => navigate("/property/create")}
            sx={{
              bgcolor: travelokaColors.primary.main,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              whiteSpace: "nowrap",
              "&:hover": {
                bgcolor: travelokaColors.primary.dark,
              },
              display: { xs: "none", md: "flex" },
            }}
          >
            Thêm tài sản
          </Button>
        </Box>
      </Box>

      {/* Add floating action button for mobile */}
      {isMobile && (
        <Button
          variant='contained'
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 10,
            bgcolor: travelokaColors.primary.main,
            borderRadius: "50%",
            minWidth: "auto",
            width: 56,
            height: 56,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            "&:hover": {
              bgcolor: travelokaColors.primary.dark,
            },
          }}
          onClick={() => navigate("/property/create")}
        >
          <AddIcon />
        </Button>
      )}

      {/* Filter and sort toolbar */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            mb: 2,
            gap: 2,
          }}
        >
          {/* Status Tabs */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant='scrollable'
            scrollButtons={isMobile ? "auto" : false}
            sx={{
              minHeight: 40,
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: 1.5,
                bgcolor: travelokaColors.primary.main,
              },
            }}
          >
            <StyledTab label='Tất cả' />
            <StyledTab
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <span>Còn trống</span>
                  <CheckCircleIcon
                    sx={{
                      ml: 0.5,
                      fontSize: 16,
                      color: travelokaColors.success.main,
                    }}
                  />
                </Box>
              }
            />
            <StyledTab
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <span>Đã cho thuê</span>
                  <CancelIcon
                    sx={{
                      ml: 0.5,
                      fontSize: 16,
                      color: travelokaColors.error.main,
                    }}
                  />
                </Box>
              }
            />
          </Tabs>

          {/* View/Filter/Sort controls */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant='outlined'
              startIcon={<FilterListIcon />}
              onClick={toggleFilterDrawer}
              sx={{
                textTransform: "none",
                borderColor: travelokaColors.neutral.main,
                color: travelokaColors.text.primary,
                "&:hover": {
                  borderColor: travelokaColors.primary.main,
                  bgcolor: alpha(travelokaColors.primary.main, 0.05),
                },
              }}
            >
              Bộ lọc
            </Button>

            <Button
              variant='outlined'
              startIcon={<SortIcon />}
              onClick={handleOrderByClick}
              sx={{
                textTransform: "none",
                borderColor: travelokaColors.neutral.main,
                color: travelokaColors.text.primary,
                "&:hover": {
                  borderColor: travelokaColors.primary.main,
                  bgcolor: alpha(travelokaColors.primary.main, 0.05),
                },
              }}
            >
              Sắp xếp
            </Button>

            <Menu
              anchorEl={orderByAnchorEl}
              open={Boolean(orderByAnchorEl)}
              onClose={handleOrderByClose}
              PaperProps={{
                elevation: 2,
                sx: { minWidth: 180, borderRadius: 2, mt: 1 },
              }}
            >
              <MenuItem
                onClick={() => handleSortSelect("updatedAt")}
                sx={{
                  py: 1,
                  color:
                    sortConfig.sortBy === "updatedAt"
                      ? travelokaColors.primary.main
                      : "inherit",
                  fontWeight: sortConfig.sortBy === "updatedAt" ? 600 : 400,
                }}
              >
                Ngày cập nhật{" "}
                {sortConfig.sortBy === "updatedAt" &&
                  (sortConfig.sortDirection === "ASC" ? "↑" : "↓")}
              </MenuItem>
              <MenuItem
                onClick={() => handleSortSelect("title")}
                sx={{
                  py: 1,
                  color:
                    sortConfig.sortBy === "title"
                      ? travelokaColors.primary.main
                      : "inherit",
                  fontWeight: sortConfig.sortBy === "title" ? 600 : 400,
                }}
              >
                Tiêu đề{" "}
                {sortConfig.sortBy === "title" &&
                  (sortConfig.sortDirection === "ASC" ? "↑" : "↓")}
              </MenuItem>
              <MenuItem
                onClick={() => handleSortSelect("pricePerMonth")}
                sx={{
                  py: 1,
                  color:
                    sortConfig.sortBy === "pricePerMonth"
                      ? travelokaColors.primary.main
                      : "inherit",
                  fontWeight: sortConfig.sortBy === "pricePerMonth" ? 600 : 400,
                }}
              >
                Giá thuê{" "}
                {sortConfig.sortBy === "pricePerMonth" &&
                  (sortConfig.sortDirection === "ASC" ? "↑" : "↓")}
              </MenuItem>
              <MenuItem
                onClick={() => handleSortSelect("area")}
                sx={{
                  py: 1,
                  color:
                    sortConfig.sortBy === "area"
                      ? travelokaColors.primary.main
                      : "inherit",
                  fontWeight: sortConfig.sortBy === "area" ? 600 : 400,
                }}
              >
                Diện tích{" "}
                {sortConfig.sortBy === "area" &&
                  (sortConfig.sortDirection === "ASC" ? "↑" : "↓")}
              </MenuItem>
            </Menu>

            <Tooltip
              title={
                viewMode === "grid"
                  ? "Chuyển sang dạng bảng"
                  : "Chuyển sang dạng lưới"
              }
            >
              <IconButton
                onClick={toggleViewMode}
                sx={{
                  border: `1px solid ${travelokaColors.neutral.main}`,
                  borderRadius: 1,
                  p: 1,
                  color: travelokaColors.text.primary,
                  "&:hover": {
                    borderColor: travelokaColors.primary.main,
                    bgcolor: alpha(travelokaColors.primary.main, 0.05),
                  },
                }}
              >
                {viewMode === "grid" ? (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                  >
                    <path d='M4 5h16v2H4z' />
                    <path d='M4 11h16v2H4z' />
                    <path d='M4 17h16v2H4z' />
                  </svg>
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                  >
                    <path d='M3 5v4h4V5H3zm6 0v4h4V5H9zm6 0v4h4V5h-4zm-12 6v4h4v-4H3zm6 0v4h4v-4H9zm6 0v4h4v-4h-4zm-12 6v4h4v-4H3zm6 0v4h4v-4H9zm6 0v4h4v-4h-4z' />
                  </svg>
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Main content */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          mb: 3,
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress
              size={40}
              sx={{ color: travelokaColors.primary.main }}
            />
          </Box>
        ) : (
          <>
            {/* Render either grid or table view */}
            {viewMode === "grid" ? <PropertyGrid /> : <PropertyTable />}
          </>
        )}
      </Paper>

      {/* Pagination */}
      {!loading && properties.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Paper
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              display: "inline-flex",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <TablePagination
              component='div'
              count={totalPages * rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={
                viewMode === "grid" ? [12, 24, 48] : [10, 20, 50]
              }
              labelRowsPerPage='Hiển thị mỗi trang'
            ></TablePagination>
          </Paper>
        </Box>
      )}

      <FilterDrawer />

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
