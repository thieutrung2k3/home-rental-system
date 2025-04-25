/** @format */

import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
  IconButton,
  Alert,
  FormControlLabel,
  Switch,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import {
  BusinessCenter,
  LocationOn,
  Description,
  AddPhotoAlternate,
  NavigateNext,
  NavigateBefore,
  Save,
  Delete,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { privateAxios } from "../../utils/axiosInstance";
import { alpha } from "@mui/material/styles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const themeColors = {
  primary: {
    main: "#1976d2",
    light: "#42a5f5",
    dark: "#1565c0",
    gradient: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
    background: "#f8fafc", // Light background for sections
  },
  secondary: {
    main: "#f50057",
    light: "#f73378",
    dark: "#c51162",
  },
};

const CreateProperty = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    "Thông tin cơ bản",
    "Chi tiết tài sản",
    "Tiện ích",
    "Hình ảnh",
  ];

  const [propertyData, setPropertyData] = useState({
    categoryId: 2,
    location: {
      city: "",
      district: "",
      postalCode: "",
      country: "Việt Nam",
      ward: "",
      latitude: null,
      longitude: null,
    },
    title: "",
    description: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    pricePerMonth: "",
    securityDeposit: "",
    amenities: [],
    propertyImages: [],
  });

  // Update the tempAmenity state to include imageFile and imagePreview
  const [tempAmenity, setTempAmenity] = useState({
    name: "",
    description: "",
    imageFile: null,
    imagePreview: null,
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  // Add loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: false,
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  // Set primary image
  const handleSetPrimaryImage = (index) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  // Remove image
  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Handle amenity input
  const handleAmenityChange = (e) => {
    const { name, value } = e.target;
    setTempAmenity((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add handler for amenity image upload
  const handleAmenityImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setTempAmenity((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  // Update the handleAddAmenity function to include image preview
  const handleAddAmenity = () => {
    if (tempAmenity.name && tempAmenity.description && tempAmenity.imageFile) {
      setPropertyData((prev) => ({
        ...prev,
        amenities: [
          ...prev.amenities,
          {
            name: tempAmenity.name,
            description: tempAmenity.description,
            imageFile: tempAmenity.imageFile,
            imagePreview: tempAmenity.imagePreview, // Keep the preview URL
          },
        ],
      }));
      // Reset form without revoking the URL since we're still using it
      setTempAmenity({
        name: "",
        description: "",
        imageFile: null,
        imagePreview: null,
      });
    }
  };

  // Update the handleRemoveAmenity function to cleanup image URLs
  const handleRemoveAmenity = (index) => {
    setPropertyData((prev) => {
      // Revoke the URL before removing the amenity
      if (prev.amenities[index]?.imagePreview) {
        URL.revokeObjectURL(prev.amenities[index].imagePreview);
      }
      return {
        ...prev,
        amenities: prev.amenities.filter((_, i) => i !== index),
      };
    });
  };

  // Update prepareFormData function
  const prepareFormData = () => {
    const formData = new FormData();

    // Prepare property data without files
    const propertyJson = {
      ...propertyData,
      propertyImages: images.map((img) => ({
        isPrimary: img.isPrimary,
      })),
      amenities: propertyData.amenities.map((amenity) => ({
        name: amenity.name,
        description: amenity.description,
      })),
    };

    // Add property JSON string
    formData.append("property", JSON.stringify(propertyJson));

    // Add property images
    images.forEach((img) => {
      formData.append("propertyImages", img.file);
    });

    // Add amenity images - if there are no amenities, add an empty file
    if (propertyData.amenities.length > 0) {
      propertyData.amenities.forEach((amenity) => {
        if (amenity.imageFile) {
          formData.append("amenities", amenity.imageFile);
        }
      });
    } else {
      // Add an empty blob if no amenities to prevent backend error
      const emptyBlob = new Blob([""], { type: "application/octet-stream" });
      formData.append("amenities", emptyBlob);
    }

    // Log formData contents for debugging
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    return formData;
  };

  // Update handleSubmit function
  const handleSubmit = async () => {
    setIsSubmitting(true); // Start loading
    try {
      const formData = prepareFormData();

      const response = await privateAxios.post(
        "property/owner/createProperty",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.result) {
        toast.success("🏠 Tạo tài sản thành công!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          style: {
            backgroundColor: themeColors.primary.main,
            color: "#fff",
          },
        });

        setTimeout(() => {
          navigate("/owner/properties");
        }, 2000);
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại!", {
          position: "top-right",
          theme: "colored",
          style: {
            backgroundColor: themeColors.secondary.main,
          },
        });
      }
    } catch (error) {
      console.error(
        "Error creating property:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!";
      toast.error(errorMessage, {
        position: "top-right",
        theme: "colored",
        style: {
          backgroundColor: themeColors.secondary.main,
        },
      });

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  // Add handleInputChange function
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setPropertyData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add this after handleInputChange function
  const handleLocationChange = (event) => {
    const { name, value } = event.target;
    const field = name.split(".")[1]; // Extract field name after 'location.'

    setPropertyData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  // Add navigation handlers
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Update validateStep function
  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    switch (step) {
      case 0:
        if (!propertyData?.title?.trim()) {
          newErrors.title = "Vui lòng nhập tiêu đề";
          isValid = false;
        }
        if (!propertyData?.location?.city?.trim()) {
          newErrors.city = "Vui lòng nhập thành phố";
          isValid = false;
        }
        if (!propertyData?.location?.district?.trim()) {
          newErrors.district = "Vui lòng nhập quận/huyện";
          isValid = false;
        }
        if (!propertyData?.location?.ward?.trim()) {
          newErrors.ward = "Vui lòng nhập phường/xã";
          isValid = false;
        }
        break;
      case 1:
        if (!propertyData?.pricePerMonth) {
          newErrors.pricePerMonth = "Vui lòng nhập giá cho thuê";
          isValid = false;
        }
        if (!propertyData?.area) {
          newErrors.area = "Vui lòng nhập diện tích";
          isValid = false;
        }
        break;
      // Add validation for other steps if needed
      case 2:
        if (propertyData.amenities.length > 0) {
          const missingImages = propertyData.amenities.some(
            (amenity) => !amenity.imageFile
          );
          if (missingImages) {
            newErrors.amenities = "Tất cả tiện ích phải có ảnh";
            isValid = false;
          }
        }
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Add this case to your renderStepContent function
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid
            container
            spacing={4}
          >
            <Grid
              container
              spacing={3}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  background: alpha(themeColors.primary.main, 0.03),
                  borderRadius: 2,
                  "& .MuiTextField-root": {
                    "& .MuiInputLabel-root": {
                      fontSize: "1rem",
                      color: "text.primary",
                    },
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#fff",
                      "&:hover fieldset": {
                        borderColor: "rgba(0, 0, 0, 0.23)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: themeColors.primary.main,
                        borderWidth: 1,
                      },
                    },
                  },
                }}
              >
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{
                    mb: 4,
                    display: "flex",
                    alignItems: "center",
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: themeColors.primary.main,
                  }}
                >
                  <BusinessCenter sx={{ mr: 1.5, fontSize: "1.5rem" }} />
                  Thông tin chung
                </Typography>

                {/* Title field */}
                <TextField
                  fullWidth
                  label='Tiêu đề'
                  name='title'
                  value={propertyData.title}
                  onChange={handleInputChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  required
                  placeholder='Nhập tiêu đề tài sản của bạn'
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      fontSize: "1rem",
                      backgroundColor: "#fff",
                    },
                    "& .MuiInputBase-input": {
                      padding: "16px 14px",
                    },
                  }}
                />

                {/* Description field */}
                <TextField
                  fullWidth
                  label='Mô tả'
                  name='description'
                  value={propertyData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={6}
                  placeholder='Mô tả chi tiết về tài sản của bạn'
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "1rem",
                      lineHeight: 1.6,
                    },
                  }}
                />
              </Paper>
            </Grid>

            {/* Location section with similar styling improvements */}
            <Grid
              item
              xs={12}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  background: themeColors.primary.background,
                  borderRadius: 2,
                  "& .MuiTextField-root": {
                    "& .MuiInputLabel-root": {
                      fontSize: "1rem",
                      color: "text.primary",
                    },
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#fff",
                      "&:hover fieldset": {
                        borderColor: "rgba(0, 0, 0, 0.23)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: themeColors.primary.main,
                        borderWidth: 1,
                      },
                    },
                  },
                }}
              >
                <Typography
                  variant='h6'
                  gutterBottom
                  color='primary'
                  sx={{ mb: 3 }}
                >
                  <LocationOn
                    sx={{
                      mr: 1,
                      verticalAlign: "middle",
                      color: themeColors.primary.main,
                    }}
                  />
                  Địa chỉ
                </Typography>

                <Grid
                  container
                  spacing={3}
                >
                  <Grid
                    item
                    xs={12}
                    sm={6}
                  >
                    <TextField
                      fullWidth
                      label='Thành phố'
                      name='location.city'
                      value={propertyData.location.city}
                      onChange={handleLocationChange}
                      error={!!errors.city}
                      helperText={errors.city}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused fieldset": {
                            borderColor: themeColors.primary.main,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                  >
                    <TextField
                      fullWidth
                      label='Quận/Huyện'
                      name='location.district'
                      value={propertyData.location.district}
                      onChange={handleLocationChange}
                      error={!!errors.district}
                      helperText={errors.district}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused fieldset": {
                            borderColor: themeColors.primary.main,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                  >
                    <TextField
                      fullWidth
                      label='Phường/Xã'
                      name='location.ward'
                      value={propertyData.location.ward}
                      onChange={handleLocationChange}
                      error={!!errors.ward}
                      helperText={errors.ward}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused fieldset": {
                            borderColor: themeColors.primary.main,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                  >
                    <TextField
                      fullWidth
                      label='Mã bưu chính'
                      name='location.postalCode'
                      value={propertyData.location.postalCode}
                      onChange={handleLocationChange}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused fieldset": {
                            borderColor: themeColors.primary.main,
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              xs={12}
              sm={6}
            >
              <TextField
                fullWidth
                label='Giá cho thuê/tháng'
                name='pricePerMonth'
                type='number'
                value={propertyData.pricePerMonth}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>VND</InputAdornment>
                  ),
                }}
                error={!!errors.pricePerMonth}
                helperText={errors.pricePerMonth}
                required
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
            >
              <TextField
                fullWidth
                label='Tiền đặt cọc'
                name='securityDeposit'
                type='number'
                value={propertyData.securityDeposit}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>VND</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={4}
            >
              <TextField
                fullWidth
                label='Số phòng ngủ'
                name='bedrooms'
                type='number'
                value={propertyData.bedrooms}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={4}
            >
              <TextField
                fullWidth
                label='Số phòng tắm'
                name='bathrooms'
                type='number'
                value={propertyData.bathrooms}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={4}
            >
              <TextField
                fullWidth
                label='Diện tích'
                name='area'
                type='number'
                value={propertyData.area}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>m²</InputAdornment>
                  ),
                }}
                error={!!errors.area}
                helperText={errors.area}
                required
              />
            </Grid>
          </Grid>
        );

      case 2: // Amenities step
        return (
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              xs={12}
            >
              <Typography
                variant='h6'
                gutterBottom
              >
                Thêm tiện ích
              </Typography>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Grid
                  container
                  spacing={2}
                >
                  {/* Input fields for amenity */}
                  <Grid
                    item
                    xs={12}
                    sm={4}
                  >
                    <TextField
                      fullWidth
                      label='Tên tiện ích'
                      name='name'
                      value={tempAmenity.name}
                      onChange={handleAmenityChange}
                      required
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={8}
                  >
                    <TextField
                      fullWidth
                      label='Mô tả'
                      name='description'
                      value={tempAmenity.description}
                      onChange={handleAmenityChange}
                      required
                    />
                  </Grid>

                  {/* Image preview */}
                  <Grid
                    item
                    xs={12}
                  >
                    {tempAmenity.imagePreview ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          bgcolor: "grey.50",
                          p: 2,
                          borderRadius: 1,
                        }}
                      >
                        <img
                          src={tempAmenity.imagePreview}
                          alt='Preview'
                          style={{
                            width: 120,
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                        <IconButton
                          color='error'
                          onClick={() => {
                            URL.revokeObjectURL(tempAmenity.imagePreview);
                            setTempAmenity((prev) => ({
                              ...prev,
                              imageFile: null,
                              imagePreview: null,
                            }));
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    ) : (
                      <Button
                        variant='outlined'
                        component='label'
                        startIcon={<AddPhotoAlternate />}
                        fullWidth
                        sx={{ py: 1.5 }}
                      >
                        Chọn ảnh cho tiện ích
                        <input
                          type='file'
                          hidden
                          accept='image/*'
                          onChange={handleAmenityImageUpload}
                        />
                      </Button>
                    )}
                  </Grid>

                  {/* Add button */}
                  <Grid
                    item
                    xs={12}
                  >
                    <Button
                      fullWidth
                      variant='contained'
                      onClick={handleAddAmenity}
                      disabled={
                        !tempAmenity.name ||
                        !tempAmenity.description ||
                        !tempAmenity.imageFile
                      }
                      sx={{ py: 1.5 }}
                    >
                      Thêm tiện ích
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              {/* List of added amenities */}
              <Box sx={{ mt: 3 }}>
                <Grid
                  container
                  spacing={2}
                >
                  {propertyData.amenities.map((amenity, index) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={index}
                    >
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <IconButton
                          onClick={() => handleRemoveAmenity(index)}
                          color='error'
                          sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            bgcolor: "rgba(255,255,255,0.8)",
                            "&:hover": {
                              bgcolor: "rgba(255,255,255,0.9)",
                            },
                            zIndex: 2,
                          }}
                        >
                          <Delete />
                        </IconButton>

                        <Box sx={{ position: "relative", mb: 2 }}>
                          <img
                            src={amenity.imagePreview}
                            alt={amenity.name}
                            style={{
                              width: "100%",
                              height: 200,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                        </Box>

                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant='subtitle1'
                            sx={{
                              fontWeight: 600,
                              mb: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {amenity.name}
                          </Typography>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {amenity.description}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        );

      case 3: // Images step
        return (
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              xs={12}
            >
              <Typography
                variant='h6'
                gutterBottom
              >
                Thêm hình ảnh
              </Typography>
              <Button
                variant='outlined'
                component='label'
                startIcon={<AddPhotoAlternate />}
                sx={{ mb: 2 }}
              >
                Chọn ảnh
                <input
                  type='file'
                  hidden
                  multiple
                  accept='image/*'
                  onChange={handleImageUpload}
                />
              </Button>

              <Grid
                container
                spacing={2}
              >
                {images.map((img, index) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={index}
                  >
                    <Card>
                      <CardMedia
                        component='img'
                        height='200'
                        image={img.preview}
                        alt={`Preview ${index + 1}`}
                      />
                      <CardContent>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={img.isPrimary}
                              onChange={() => handleSetPrimaryImage(index)}
                            />
                          }
                          label='Ảnh chính'
                        />
                        <IconButton
                          onClick={() => handleRemoveImage(index)}
                          color='error'
                          sx={{ float: "right" }}
                        >
                          <Delete />
                        </IconButton>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  // Update the styles for the main container and paper
  return (
    <Box
      sx={{
        p: 3,
        maxWidth: 1200,
        margin: "0 auto",
        bgcolor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <ToastContainer />
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          variant='h5'
          gutterBottom
          sx={{
            mb: 3,
            color: themeColors.primary.main,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Thêm tài sản mới
        </Typography>

        <Stepper
          activeStep={activeStep}
          sx={{
            mb: 4,
            "& .MuiStepLabel-root .Mui-completed": {
              color: themeColors.primary.main,
            },
            "& .MuiStepLabel-root .Mui-active": {
              color: themeColors.secondary.main,
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "space-between",
            borderTop: 1,
            borderColor: "divider",
            pt: 3,
          }}
        >
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<NavigateBefore />}
            sx={{
              "&:not(:disabled)": {
                color: themeColors.primary.main,
              },
            }}
          >
            Quay lại
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant='contained'
              onClick={handleSubmit}
              startIcon={isSubmitting ? null : <Save />}
              disabled={isSubmitting}
              sx={{
                background: themeColors.secondary.main,
                "&:hover": {
                  background: themeColors.secondary.dark,
                },
                minWidth: 120,
              }}
            >
              {isSubmitting ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CircularProgress
                    size={24}
                    color='inherit'
                    sx={{ mr: 1 }}
                  />
                  Đang lưu...
                </Box>
              ) : (
                "Lưu tài sản"
              )}
            </Button>
          ) : (
            <Button
              variant='contained'
              onClick={handleNext}
              endIcon={<NavigateNext />}
              sx={{
                background: themeColors.primary.main,
                "&:hover": {
                  background: themeColors.primary.dark,
                },
              }}
            >
              Tiếp theo
            </Button>
          )}
        </Box>
      </Paper>

      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        }}
        open={isSubmitting}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress
            color='primary'
            size={60}
          />
          <Typography
            variant='h6'
            sx={{
              color: "#fff",
              mt: 2,
              fontWeight: 500,
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Đang tạo tài sản...
          </Typography>
        </Box>
      </Backdrop>
    </Box>
  );
};

export default CreateProperty;
