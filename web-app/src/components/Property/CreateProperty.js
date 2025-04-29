/** @format */

import React, { useState, useEffect } from "react";
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
import { privateAxios, publicAxios } from "../../utils/axiosInstance";
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

  // Add this state after other state declarations
  const [availableAmenities, setAvailableAmenities] = useState([]);
  const [selectedAmenity, setSelectedAmenity] = useState("");
  const [isCustomAmenity, setIsCustomAmenity] = useState(false);

  // Update the tempAmenity state - remove image related fields
  const [tempAmenity, setTempAmenity] = useState({
    amenityId: null,
    name: "",
    description: "",
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  // Add loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add this to your state declarations
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

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

  // Update handleAmenityChange to handle both custom and selected amenities
  const handleAmenityChange = (e) => {
    const { name, value } = e.target;
    setTempAmenity((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add this new handler for selecting an existing amenity
  const handleAmenitySelect = (event) => {
    const value = event.target.value;

    if (value === "custom") {
      setIsCustomAmenity(true);
      setTempAmenity({
        amenityId: null,
        name: "",
        description: "",
      });
    } else {
      setIsCustomAmenity(false);
      const selected = availableAmenities.find(
        (amenity) => amenity.amenityId === Number(value)
      );
      if (selected) {
        setTempAmenity({
          amenityId: selected.amenityId,
          name: selected.name,
          description: selected.description,
        });
      }
    }

    setSelectedAmenity(value);
  };

  // Update the handleAddAmenity function to include image preview
  const handleAddAmenity = () => {
    if (tempAmenity.name && tempAmenity.description) {
      // Check if this amenity is already added
      const isDuplicate = propertyData.amenities.some(
        (a) =>
          a.amenityId === tempAmenity.amenityId ||
          (a.name.toLowerCase() === tempAmenity.name.toLowerCase() &&
            !a.amenityId &&
            !tempAmenity.amenityId)
      );

      if (isDuplicate) {
        toast.warning("Tiện ích này đã được thêm vào danh sách!", {
          position: "top-right",
        });
        return;
      }

      setPropertyData((prev) => ({
        ...prev,
        amenities: [
          ...prev.amenities,
          {
            amenityId: tempAmenity.amenityId,
            name: tempAmenity.name,
            description: tempAmenity.description,
          },
        ],
      }));
      // Reset form
      setTempAmenity({
        amenityId: null,
        name: "",
        description: "",
      });
      setSelectedAmenity("");
      setIsCustomAmenity(false);
    }
  };

  // Add this function after handleAddAmenity
  const handleRemoveAmenity = (index) => {
    setPropertyData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };
  // Add this useEffect after your state declarations
  useEffect(() => {
    // Function to fetch amenities from the API
    const fetchAmenities = async () => {
      try {
        const response = await publicAxios.get("amenity/public/getAll");
        console.log("Fetched amenities:", response.data);
        if (response.data?.result) {
          setAvailableAmenities(response.data.result);
        }
      } catch (error) {
        console.error("Error fetching amenities:", error);
        toast.error("Không thể tải danh sách tiện ích", {
          position: "top-right",
        });
      }
    };

    // Call the function when component mounts
    fetchAmenities();
  }, []); // Empty dependency array means this runs once on mount

  // Add this useEffect to fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await privateAxios.get("category/public/findAll");
        console.log("Fetched categories:", response.data);
        if (response.data?.result) {
          setCategories(response.data.result);

          // If we already have a categoryId, select that category
          if (propertyData.categoryId) {
            const selectedCat = response.data.result.find(
              (cat) => cat.categoryId === propertyData.categoryId
            );
            setSelectedCategory(selectedCat || null);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Không thể tải danh sách loại hình nhà ở", {
          position: "top-right",
        });
      }
    };

    fetchCategories();
  }, []);

  // Update prepareFormData function to include propertyAttributeValues
  const prepareFormData = () => {
    const formData = new FormData();

    // Extract property attribute values from the form data
    const propertyAttributeValues = [];

    // Check if category has attributes and process them
    if (selectedCategory && selectedCategory.propertyAttributes) {
      selectedCategory.propertyAttributes.forEach((attr) => {
        const attributeKey = `attribute_${attr.id}`;
        if (
          propertyData[attributeKey] !== undefined &&
          propertyData[attributeKey] !== ""
        ) {
          propertyAttributeValues.push({
            attributeId: attr.id,
            value: String(propertyData[attributeKey]), // Convert all values to string as per the example
          });
        }
      });

      // Add basic attributes that might be in the main propertyData
      if (propertyData.bedrooms) {
        // Find attribute ID for bedrooms from selected category
        const bedroomsAttr = selectedCategory.propertyAttributes.find(
          (attr) => attr.name === "Số phòng ngủ"
        );
        if (bedroomsAttr) {
          propertyAttributeValues.push({
            attributeId: bedroomsAttr.id,
            value: String(propertyData.bedrooms),
          });
        }
      }

      if (propertyData.bathrooms) {
        const bathroomsAttr = selectedCategory.propertyAttributes.find(
          (attr) => attr.name === "Số phòng tắm"
        );
        if (bathroomsAttr) {
          propertyAttributeValues.push({
            attributeId: bathroomsAttr.id,
            value: String(propertyData.bathrooms),
          });
        }
      }
    }

    // Updated property JSON structure to match expected format
    const propertyJson = {
      categoryId: propertyData.categoryId,
      location: propertyData.location,
      title: propertyData.title,
      description: propertyData.description,
      bedrooms: propertyData.bedrooms || 0,
      bathrooms: propertyData.bathrooms || 0,
      area: propertyData.area || 0,
      pricePerMonth: propertyData.pricePerMonth || 0,
      securityDeposit: propertyData.securityDeposit || 0,
      propertyAttributeValues: propertyAttributeValues,
      amenities: propertyData.amenities.map((amenity) => ({
        amenityId: amenity.amenityId,
        name: amenity.name,
        description: amenity.description,
      })),
      propertyImages: images.map((img) => ({
        isPrimary: img.isPrimary,
      })),
    };

    console.log("Property JSON being sent:", propertyJson);

    // Add property JSON string
    formData.append("property", JSON.stringify(propertyJson));

    // Add property images
    images.forEach((img) => {
      formData.append("propertyImages", img.file);
    });

    // We don't need amenity images, but the API requires the field
    const emptyBlob = new Blob([""], { type: "application/octet-stream" });
    formData.append("amenities", emptyBlob);

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

  // Add this function after handleLocationChange
  const handleCategoryChange = (event) => {
    const categoryId = Number(event.target.value);
    const selected = categories.find((cat) => cat.categoryId === categoryId);

    setSelectedCategory(selected);
    setPropertyData((prev) => ({
      ...prev,
      categoryId: categoryId,
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
        // Remove category validation from step 0
        if (!propertyData.title) {
          newErrors.title = "Vui lòng nhập tiêu đề";
          isValid = false;
        }
        // Other validations for step 0
        break;

      case 1:
        // Add category validation to step 1
        if (!propertyData.categoryId) {
          newErrors.categoryId = "Vui lòng chọn loại hình nhà ở";
          isValid = false;
        }
        if (!propertyData.pricePerMonth) {
          newErrors.pricePerMonth = "Vui lòng nhập giá cho thuê";
          isValid = false;
        }
        if (!propertyData.area) {
          newErrors.area = "Vui lòng nhập diện tích";
          isValid = false;
        }
        break;

      // Other cases remain the same
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
            >
              {/* Category selection */}
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  background: alpha(themeColors.primary.main, 0.03),
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: themeColors.primary.main,
                  }}
                >
                  <BusinessCenter sx={{ mr: 1.5 }} />
                  Loại hình nhà ở
                </Typography>

                <Grid
                  container
                  spacing={3}
                >
                  <Grid
                    item
                    xs={12}
                  >
                    <FormControl
                      fullWidth
                      sx={{ backgroundColor: "#fff", p: 1, borderRadius: 1 }}
                    >
                      <InputLabel>Chọn loại hình</InputLabel>
                      <Select
                        value={propertyData.categoryId || ""}
                        onChange={handleCategoryChange}
                        label='Chọn loại hình'
                        error={!!errors.categoryId}
                      >
                        <MenuItem value=''>
                          <em>Chọn loại hình nhà ở</em>
                        </MenuItem>
                        {categories.map((category) => (
                          <MenuItem
                            key={category.categoryId}
                            value={category.categoryId}
                          >
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {errors.categoryId && (
                      <Typography
                        color='error'
                        variant='caption'
                        sx={{ mt: 1, display: "block" }}
                      >
                        {errors.categoryId}
                      </Typography>
                    )}
                    {selectedCategory && (
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{
                          mt: 2,
                          p: 1,
                          bgcolor: "rgba(0,0,0,0.03)",
                          borderRadius: 1,
                        }}
                      >
                        <strong>{selectedCategory.name}:</strong>{" "}
                        {selectedCategory.description}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Paper>

              {/* Existing basic info section */}
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  background: alpha(themeColors.primary.main, 0.03),
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: themeColors.primary.main,
                  }}
                >
                  <Description sx={{ mr: 1.5 }} />
                  Thông tin cơ bản
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
                      sx={{ backgroundColor: "#fff" }}
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
                      sx={{ backgroundColor: "#fff" }}
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
                      sx={{ backgroundColor: "#fff" }}
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
                      sx={{ backgroundColor: "#fff" }}
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
                      sx={{ backgroundColor: "#fff" }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Rest of the existing code for property attributes */}
              {selectedCategory && selectedCategory.propertyAttributes && (
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    background: alpha(themeColors.primary.main, 0.03),
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant='h6'
                    gutterBottom
                    sx={{
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: themeColors.primary.main,
                    }}
                  >
                    <BusinessCenter sx={{ mr: 1.5 }} />
                    Thuộc tính đặc thù ({selectedCategory.name})
                  </Typography>

                  <Grid
                    container
                    spacing={3}
                  >
                    {selectedCategory.propertyAttributes
                      .filter(
                        (attr) =>
                          ![
                            "Diện tích",
                            "Số phòng ngủ",
                            "Số phòng tắm",
                          ].includes(attr.name)
                      )
                      .map((attribute) => {
                        const attributeKey = `attribute_${attribute.id}`;

                        // Check attribute data type
                        if (attribute.dataType === "NUMBER") {
                          return (
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              key={attributeKey}
                            >
                              <TextField
                                fullWidth
                                label={attribute.name}
                                name={attributeKey}
                                type='number'
                                value={propertyData[attributeKey] || ""}
                                onChange={handleInputChange}
                                InputProps={{
                                  endAdornment: attribute.unit ? (
                                    <InputAdornment position='end'>
                                      {attribute.unit}
                                    </InputAdornment>
                                  ) : null,
                                }}
                                helperText={attribute.description}
                                sx={{ backgroundColor: "#fff" }}
                              />
                            </Grid>
                          );
                        } else if (attribute.dataType === "TEXT") {
                          return (
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              key={attributeKey}
                            >
                              <TextField
                                fullWidth
                                label={attribute.name}
                                name={attributeKey}
                                value={propertyData[attributeKey] || ""}
                                onChange={handleInputChange}
                                helperText={attribute.description}
                                sx={{ backgroundColor: "#fff" }}
                              />
                            </Grid>
                          );
                        } else if (attribute.dataType === "BOOLEAN") {
                          return (
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              key={attributeKey}
                            >
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={!!propertyData[attributeKey]}
                                    onChange={(e) => {
                                      handleInputChange({
                                        target: {
                                          name: attributeKey,
                                          value: e.target.checked,
                                        },
                                      });
                                    }}
                                    color='primary'
                                  />
                                }
                                label={
                                  <Box>
                                    <Typography variant='body1'>
                                      {attribute.name}
                                    </Typography>
                                    <Typography
                                      variant='caption'
                                      color='text.secondary'
                                    >
                                      {attribute.description}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </Grid>
                          );
                        }
                        return null;
                      })}
                  </Grid>
                </Paper>
              )}
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
                Tiện ích
              </Typography>
              <Paper sx={{ p: 3, mb: 2 }}>
                <Grid
                  container
                  spacing={2}
                >
                  {/* Amenity selection or custom input */}
                  <Grid
                    item
                    xs={12}
                  >
                    <FormControl fullWidth>
                      <InputLabel>Chọn tiện ích có sẵn</InputLabel>
                      <Select
                        value={selectedAmenity}
                        onChange={handleAmenitySelect}
                        label='Chọn tiện ích có sẵn'
                      >
                        <MenuItem value=''>
                          <em>Chọn tiện ích</em>
                        </MenuItem>
                        {availableAmenities.map((amenity) => (
                          <MenuItem
                            key={amenity.amenityId}
                            value={amenity.amenityId}
                          >
                            {amenity.name}
                          </MenuItem>
                        ))}
                        <MenuItem value='custom'>
                          <em>+ Thêm tiện ích mới</em>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Show these fields only if custom amenity is selected */}
                  {isCustomAmenity && (
                    <>
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
                    </>
                  )}

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
                        !selectedAmenity ||
                        (isCustomAmenity &&
                          (!tempAmenity.name || !tempAmenity.description))
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
                <Typography
                  variant='h6'
                  gutterBottom
                >
                  Tiện ích đã thêm
                </Typography>
                {propertyData.amenities.length === 0 ? (
                  <Alert severity='info'>Chưa có tiện ích nào được thêm</Alert>
                ) : (
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
                            p: 3,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            borderLeft: amenity.amenityId
                              ? `4px solid ${themeColors.primary.main}`
                              : `4px solid ${themeColors.secondary.main}`,
                          }}
                        >
                          <IconButton
                            onClick={() => handleRemoveAmenity(index)}
                            color='error'
                            sx={{
                              position: "absolute",
                              right: 8,
                              top: 8,
                            }}
                          >
                            <Delete />
                          </IconButton>

                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant='subtitle1'
                              sx={{
                                fontWeight: 600,
                                mb: 1,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {amenity.name}
                              {!amenity.amenityId && (
                                <Typography
                                  component='span'
                                  sx={{
                                    ml: 1,
                                    fontSize: "0.7rem",
                                    backgroundColor: themeColors.secondary.main,
                                    color: "#fff",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                  }}
                                >
                                  TÙY CHỈNH
                                </Typography>
                              )}
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
                )}
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
