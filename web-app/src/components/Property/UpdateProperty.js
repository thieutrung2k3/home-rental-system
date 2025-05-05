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
  Chip,
  FormHelperText,
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
  RoomService as RoomServiceIcon,
  FormatListBulleted as FormatListBulletedIcon,
  Info as InfoIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Collections as CollectionsIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  SquareFoot as SquareFootIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { privateAxios, publicAxios } from "../../utils/axiosInstance";
import { alpha } from "@mui/material/styles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const themeColors = {
  primary: {
    main: "#0064D2", // Xanh Traveloka
    light: "#3A8EFF",
    dark: "#004BA0",
    gradient: "linear-gradient(45deg, #0064D2 30%, #3A8EFF 90%)",
    background: "#F5F5F5", // Light background
  },
  secondary: {
    main: "#FF5F00", // Cam Traveloka
    light: "#FF7C29",
    dark: "#D14C00",
  },
  text: {
    primary: "#222222",
    secondary: "#717171",
  },
  neutral: {
    light: "#F9F9F9",
    main: "#E5E5E5",
    dark: "#9E9E9E",
  },
  success: {
    main: "#00AA46",
    light: "#E6F5EC",
  },
  warning: {
    main: "#FF8800",
    light: "#FFF1DF",
  },
  error: {
    main: "#E91E63",
    light: "#FDECF3",
  },
};

const TravelokaStyleStepper = ({ activeStep, steps }) => (
  <Stepper
    activeStep={activeStep}
    sx={{
      mb: 4,
      py: 2,
      "& .MuiStepLabel-root .Mui-completed": {
        color: themeColors.success.main,
      },
      "& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel": {
        color: themeColors.text.primary,
      },
      "& .MuiStepLabel-root .Mui-active": {
        color: themeColors.secondary.main,
      },
      "& .MuiStepConnector-line": {
        borderTopWidth: 3,
      },
      "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": {
        borderColor: themeColors.secondary.main,
      },
      "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": {
        borderColor: themeColors.success.main,
      },
      "& .MuiSvgIcon-root": {
        fontSize: 28,
      },
    }}
  >
    {steps.map((label) => (
      <Step key={label}>
        <StepLabel>{label}</StepLabel>
      </Step>
    ))}
  </Stepper>
);

const SectionTitle = ({ icon, title }) => (
  <Typography
    variant='h6'
    gutterBottom
    sx={{
      mb: 3,
      display: "flex",
      alignItems: "center",
      fontSize: "1.15rem",
      fontWeight: 600,
      color: themeColors.primary.main,
      borderLeft: `4px solid ${themeColors.primary.main}`,
      pl: 2,
      py: 0.5,
    }}
  >
    {React.cloneElement(icon, { sx: { mr: 1.5, fontSize: 22 } })}
    {title}
  </Typography>
);

// Cập nhật TravelokaSection để chiếm hết chiều rộng

const TravelokaSection = ({ children, sx = {} }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      mb: 3,
      width: "100%", // Đảm bảo chiếm hết chiều rộng
      borderRadius: 2,
      border: `1px solid ${themeColors.neutral.main}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      ...sx,
    }}
  >
    {children}
  </Paper>
);

const TravelokaButton = ({
  variant = "contained",
  children,
  startIcon,
  endIcon,
  ...props
}) => (
  <Button
    variant={variant}
    startIcon={startIcon}
    endIcon={endIcon}
    sx={{
      textTransform: "none",
      fontWeight: 600,
      borderRadius: 2,
      padding: "10px 16px",
      ...(variant === "contained"
        ? {
            bgcolor:
              props.color === "secondary"
                ? themeColors.secondary.main
                : themeColors.primary.main,
            "&:hover": {
              bgcolor:
                props.color === "secondary"
                  ? themeColors.secondary.dark
                  : themeColors.primary.dark,
            },
          }
        : {}),
      ...(variant === "outlined"
        ? {
            borderColor: themeColors.primary.main,
            color: themeColors.primary.main,
            "&:hover": {
              borderColor: themeColors.primary.dark,
              bgcolor: alpha(themeColors.primary.main, 0.05),
            },
          }
        : {}),
      ...(props.sx || {}),
    }}
    {...props}
  >
    {children}
  </Button>
);

const UpdateProperty = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const { id } = useParams(); // Add this to get property ID from URL

  const steps = [
    "Thông tin cơ bản",
    "Chi tiết tài sản",
    "Tiện ích",
    "Hình ảnh",
  ];

  const [propertyData, setPropertyData] = useState({
    propertyId: null, // Add propertyId field
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
      isExisting: false,
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
      const image = newImages[index];

      if (image.isExisting) {
        // Mark existing images for deletion instead of removing
        return newImages
          .map((img, i) => (i === index ? { ...img, toDelete: true } : img))
          .filter((img) => !img.toDelete);
      } else {
        // For new images, remove them directly
        if (image.preview) URL.revokeObjectURL(image.preview);
        newImages.splice(index, 1);
        return newImages;
      }
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

  // Add loading state for initial data fetch
  const [isLoading, setIsLoading] = useState(true);

  // Add this useEffect to fetch the property data when component mounts
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching property with ID:", id);

        const response = await privateAxios.get(
          `property/public/getPropertyById?id=${id}`
        );

        if (response.data?.result) {
          const property = response.data.result;
          console.log("Fetched property data:", property);

          // Xử lý địa chỉ
          const address = property.address || "";
          const addressParts = address.split(", ");
          const ward = addressParts.length > 0 ? addressParts[0] : "";
          const district = addressParts.length > 1 ? addressParts[1] : "";
          const city = addressParts.length > 2 ? addressParts[2] : "";
          const country =
            addressParts.length > 3 ? addressParts[3] : "Việt Nam";

          // Tìm giá trị cho bedrooms, bathrooms, area từ propertyAttributeValues
          const bedroomsAttr = property.propertyAttributeValues.find(
            (attr) => attr.name === "Số phòng ngủ"
          );
          const bathroomsAttr = property.propertyAttributeValues.find(
            (attr) => attr.name === "Số phòng tắm"
          );
          const areaAttr = property.propertyAttributeValues.find(
            (attr) => attr.name === "Diện tích"
          );

          const bedrooms = bedroomsAttr ? bedroomsAttr.value : "0";
          const bathrooms = bathroomsAttr ? bathroomsAttr.value : "0";
          const area = areaAttr ? areaAttr.value : "0";

          // Khai báo một đối tượng để lưu các thuộc tính bổ sung
          const attributeValues = {};

          // Lọc ra các thuộc tính khác và gán vào attributeValues
          property.propertyAttributeValues.forEach((attr) => {
            if (
              !["Số phòng ngủ", "Số phòng tắm", "Diện tích"].includes(attr.name)
            ) {
              // Ví dụ: attr.name = "Có thang máy" -> attributeKey = "attribute_elevator"
              // Cần tìm attribute ID thực tế từ selectedCategory
              const matchedAttr = selectedCategory?.propertyAttributes?.find(
                (catAttr) => catAttr.name === attr.name
              );

              if (matchedAttr) {
                const attributeKey = `attribute_${matchedAttr.id}`;
                attributeValues[attributeKey] =
                  attr.value === "true" ? true : attr.value;
              }
            }
          });

          // Populate property data state
          setPropertyData({
            propertyId: property.propertyId,
            categoryId: property.categoryId || 2, // Mặc định là 2 nếu không có
            location: {
              city: city,
              district: district,
              postalCode: "",
              country: country,
              ward: ward,
              latitude: null,
              longitude: null,
            },
            title: property.title,
            description: property.description,
            bedrooms: bedrooms,
            bathrooms: bathrooms,
            area: area,
            pricePerMonth: property.pricePerMonth,
            securityDeposit: property.securityDeposit,
            amenities: property.amenities || [],
            propertyImages: property.propertyImages || [],
            ...attributeValues, // Thêm các thuộc tính bổ sung
          });

          // Set category if available
          if (property.name && categories.length > 0) {
            const selectedCat = categories.find(
              (cat) => cat.name === property.name
            );
            setSelectedCategory(selectedCat || null);
          }

          // Process existing images
          if (property.propertyImages && property.propertyImages.length > 0) {
            const existingImages = property.propertyImages.map((img) => ({
              id: img.imageId,
              url: img.imageUrl,
              preview: img.imageUrl,
              isPrimary: img.isPrimary,
              isExisting: true, // Mark as existing image
            }));
            setImages(existingImages);
          }
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        console.error("Error details:", error.response?.data);

        toast.error("Không thể tải thông tin tài sản", {
          position: "top-right",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPropertyData();
    } else {
      setIsLoading(false);
      toast.error("Không tìm thấy ID tài sản", {
        position: "top-right",
      });
      navigate("/owner/properties");
    }
  }, [id, navigate, categories, selectedCategory]);

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

      if (propertyData.area) {
        // Find attribute ID for bedrooms from selected category
        const areaAttr = selectedCategory.propertyAttributes.find(
          (attr) => attr.name === "Diện tích"
        );
        if (areaAttr) {
          propertyAttributeValues.push({
            attributeId: areaAttr.id,
            value: String(propertyData.area),
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
      propertyId: propertyData.propertyId, // Include propertyId for update
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
        id: img.id, // ID của ảnh hiện có
        imageId: img.id, // Thêm imageId để đảm bảo
        imageUrl: img.url || img.preview, // URL hình ảnh
        isPrimary: img.isPrimary,
        toDelete: img.toDelete || false, // Flag for images to be deleted
      })),
    };

    console.log("Property JSON being sent:", propertyJson);

    // Add property JSON string
    formData.append("property", JSON.stringify(propertyJson));

    // Add new property images
    images
      .filter((img) => !img.isExisting)
      .forEach((img) => {
        formData.append("newPropertyImages", img.file);
      });

    // We don't need amenity images, but the API requires the field
    const emptyBlob = new Blob([""], { type: "application/octet-stream" });
    formData.append("amenities", emptyBlob);

    return formData;
  };

  // Update handleSubmit function for updating instead of creating
  // Cập nhật handleSubmit

  const handleSubmit = async () => {
    setIsSubmitting(true); // Start loading
    try {
      const formData = prepareFormData();

      // Log dữ liệu trước khi gửi để kiểm tra
      console.log("Sending update data:", JSON.parse(formData.get("property")));

      const response = await privateAxios.put(
        `property/owner/updateProperty/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Update response:", response.data);

      if (response.data?.result) {
        toast.success("🏠 Cập nhật tài sản thành công!", {
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
        "Error updating property:",
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
            spacing={3}
            sx={{ width: "100%" }} // Đảm bảo Grid container chiếm hết chiều rộng
          >
            <Grid
              item
              xs={12}
              sx={{ width: "100%" }} // Đảm bảo Grid item chiếm hết chiều rộng
            >
              <TravelokaSection>
                <SectionTitle
                  icon={<BusinessCenter />}
                  title='Thông tin chung'
                />

                <Box sx={{ width: "100%" }}>
                  {" "}
                  {/* Thêm Box để bọc form fields */}
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
                      width: "100%", // Đảm bảo text field chiếm hết chiều rộng
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        fontSize: "1rem",
                        bgcolor: "#fff",
                        "&:hover fieldset": {
                          borderColor: themeColors.primary.main,
                          borderWidth: 1,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: themeColors.primary.main,
                          borderWidth: 1,
                        },
                      },
                      "& .MuiInputBase-input": {
                        padding: "14px 14px",
                      },
                      "& .MuiFormHelperText-root": {
                        marginLeft: 0,
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label='Mô tả'
                    name='description'
                    value={propertyData.description}
                    onChange={handleInputChange}
                    multiline
                    rows={5}
                    placeholder='Mô tả chi tiết về tài sản của bạn'
                    sx={{
                      width: "100%", // Đảm bảo text field chiếm hết chiều rộng
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        fontSize: "1rem",
                        lineHeight: 1.6,
                        bgcolor: "#fff",
                        "&:hover fieldset": {
                          borderColor: themeColors.primary.main,
                          borderWidth: 1,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: themeColors.primary.main,
                          borderWidth: 1,
                        },
                      },
                    }}
                  />
                </Box>
              </TravelokaSection>
            </Grid>

            {/* Địa chỉ section */}
            <Grid
              item
              xs={12}
              sx={{ width: "100%" }}
            >
              <TravelokaSection>
                <SectionTitle
                  icon={<LocationOn />}
                  title='Địa chỉ'
                />

                <Grid
                  container
                  spacing={3}
                  sx={{ width: "100%", m: 0 }} // Chiếm hết chiều rộng và reset margin
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
                      placeholder='Ví dụ: Hà Nội'
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "#fff",
                          "&:hover fieldset": {
                            borderColor: themeColors.primary.main,
                            borderWidth: 1,
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: themeColors.primary.main,
                            borderWidth: 1,
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
                      placeholder='Ví dụ: Cầu Giấy'
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "#fff",
                          "&:hover fieldset": {
                            borderColor: themeColors.primary.main,
                            borderWidth: 1,
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: themeColors.primary.main,
                            borderWidth: 1,
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
                      placeholder='Ví dụ: Dịch Vọng Hậu'
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "#fff",
                          "&:hover fieldset": {
                            borderColor: themeColors.primary.main,
                            borderWidth: 1,
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: themeColors.primary.main,
                            borderWidth: 1,
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
                      placeholder='Ví dụ: 100000'
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "#fff",
                          "&:hover fieldset": {
                            borderColor: themeColors.primary.main,
                            borderWidth: 1,
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: themeColors.primary.main,
                            borderWidth: 1,
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </TravelokaSection>
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
              <TravelokaSection>
                <SectionTitle
                  icon={<BusinessCenter />}
                  title='Loại hình nhà ở'
                />

                <FormControl
                  fullWidth
                  error={!!errors.categoryId}
                  sx={{ mb: 2 }}
                >
                  <InputLabel id='category-select-label'>
                    Chọn loại hình
                  </InputLabel>
                  <Select
                    labelId='category-select-label'
                    id='category-select'
                    value={propertyData.categoryId || ""}
                    onChange={handleCategoryChange}
                    label='Chọn loại hình'
                    sx={{
                      borderRadius: 2,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: errors.categoryId
                          ? themeColors.error.main
                          : undefined,
                      },
                    }}
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
                  {errors.categoryId && (
                    <FormHelperText error>{errors.categoryId}</FormHelperText>
                  )}
                </FormControl>

                {selectedCategory && (
                  <Alert
                    severity='info'
                    icon={<InfoIcon />}
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: alpha(themeColors.primary.main, 0.1),
                      border: "1px solid",
                      borderColor: alpha(themeColors.primary.main, 0.2),
                      "& .MuiAlert-icon": {
                        color: themeColors.primary.main,
                      },
                    }}
                  >
                    <Typography
                      variant='subtitle2'
                      sx={{ fontWeight: 600, color: themeColors.primary.main }}
                    >
                      {selectedCategory.name}
                    </Typography>
                    <Typography variant='body2'>
                      {selectedCategory.description}
                    </Typography>
                  </Alert>
                )}
              </TravelokaSection>

              <TravelokaSection>
                <SectionTitle
                  icon={<Description />}
                  title='Thông tin cơ bản'
                />

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
                        startAdornment: (
                          <InputAdornment position='start'>₫</InputAdornment>
                        ),
                      }}
                      error={!!errors.pricePerMonth}
                      helperText={errors.pricePerMonth}
                      required
                      placeholder='Ví dụ: 5,000,000'
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "#fff",
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
                      label='Tiền đặt cọc'
                      name='securityDeposit'
                      type='number'
                      value={propertyData.securityDeposit}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>₫</InputAdornment>
                        ),
                      }}
                      placeholder='Ví dụ: 10,000,000'
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "#fff",
                        },
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <BedIcon sx={{ color: themeColors.primary.main }} />
                          </InputAdornment>
                        ),
                      }}
                      placeholder='Ví dụ: 2'
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "#fff",
                        },
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
                      label='Số phòng tắm'
                      name='bathrooms'
                      type='number'
                      value={propertyData.bathrooms}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <BathtubIcon
                              sx={{ color: themeColors.primary.main }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      placeholder='Ví dụ: 1'
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "#fff",
                        },
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
                      label='Diện tích'
                      name='area'
                      type='number'
                      value={propertyData.area}
                      onChange={handleInputChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>m²</InputAdornment>
                        ),
                        startAdornment: (
                          <InputAdornment position='start'>
                            <SquareFootIcon
                              sx={{ color: themeColors.primary.main }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      error={!!errors.area}
                      helperText={errors.area}
                      required
                      placeholder='Ví dụ: 50'
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "#fff",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </TravelokaSection>

              {selectedCategory && selectedCategory.propertyAttributes && (
                <TravelokaSection>
                  <SectionTitle
                    icon={<BusinessCenter />}
                    title={`Thuộc tính của ${selectedCategory.name}`}
                  />

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
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    bgcolor: "#fff",
                                  },
                                }}
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
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    bgcolor: "#fff",
                                  },
                                }}
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
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  border: `1px solid ${themeColors.neutral.main}`,
                                  borderRadius: 2,
                                  bgcolor: "#fff",
                                }}
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
                                      <Typography
                                        variant='body1'
                                        sx={{ fontWeight: 500 }}
                                      >
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
                              </Paper>
                            </Grid>
                          );
                        }
                        return null;
                      })}
                  </Grid>
                </TravelokaSection>
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
              <TravelokaSection>
                <SectionTitle
                  icon={<RoomServiceIcon />}
                  title='Thêm tiện ích'
                />

                <Grid
                  container
                  spacing={2}
                >
                  <Grid
                    item
                    xs={12}
                  >
                    <FormControl fullWidth>
                      <InputLabel id='amenity-select-label'>
                        Chọn tiện ích có sẵn
                      </InputLabel>
                      <Select
                        labelId='amenity-select-label'
                        id='amenity-select'
                        value={selectedAmenity}
                        onChange={handleAmenitySelect}
                        label='Chọn tiện ích có sẵn'
                        sx={{
                          borderRadius: 2,
                          bgcolor: "#fff",
                        }}
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
                        <Divider sx={{ my: 1 }} />
                        <MenuItem
                          value='custom'
                          sx={{ color: themeColors.secondary.main }}
                        >
                          <AddIcon sx={{ mr: 1, fontSize: 18 }} />
                          <em>Thêm tiện ích mới</em>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {isCustomAmenity && (
                    <Box
                      sx={{
                        width: "100%",
                        mt: 2,
                        p: 2,
                        bgcolor: alpha(themeColors.secondary.main, 0.05),
                        borderRadius: 2,
                        border: `1px dashed ${themeColors.secondary.main}`,
                      }}
                    >
                      <Typography
                        variant='subtitle2'
                        sx={{
                          mb: 2,
                          fontWeight: 600,
                          color: themeColors.secondary.main,
                        }}
                      >
                        Tạo tiện ích mới
                      </Typography>
                      <Grid
                        container
                        spacing={2}
                      >
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
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                bgcolor: "#fff",
                              },
                            }}
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
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                bgcolor: "#fff",
                              },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  <Grid
                    item
                    xs={12}
                    sx={{ mt: 2 }}
                  >
                    <TravelokaButton
                      fullWidth
                      variant='contained'
                      onClick={handleAddAmenity}
                      disabled={
                        !selectedAmenity ||
                        (isCustomAmenity &&
                          (!tempAmenity.name || !tempAmenity.description))
                      }
                      color='secondary'
                      startIcon={<AddIcon />}
                      sx={{ py: 1.5 }}
                    >
                      Thêm tiện ích
                    </TravelokaButton>
                  </Grid>
                </Grid>
              </TravelokaSection>

              <TravelokaSection>
                <SectionTitle
                  icon={<FormatListBulletedIcon />}
                  title='Tiện ích đã thêm'
                />

                {propertyData.amenities.length === 0 ? (
                  <Alert
                    severity='info'
                    icon={<InfoIcon />}
                    sx={{
                      borderRadius: 2,
                      bgcolor: alpha(themeColors.primary.main, 0.1),
                      border: "1px solid",
                      borderColor: alpha(themeColors.primary.main, 0.2),
                    }}
                  >
                    Chưa có tiện ích nào được thêm
                  </Alert>
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
                          elevation={0}
                          sx={{
                            p: 2.5,
                            height: "100%",
                            display: "flex",
                            alignItems: "flex-start",
                            position: "relative",
                            borderRadius: 2,
                            border: `1px solid ${themeColors.neutral.main}`,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: themeColors.primary.main,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              bgcolor: alpha(themeColors.primary.main, 0.1),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              mr: 2,
                            }}
                          >
                            <CheckCircleIcon
                              sx={{ color: themeColors.primary.main }}
                            />
                          </Box>

                          <Box sx={{ flexGrow: 1, pr: 4 }}>
                            <Typography
                              variant='subtitle1'
                              sx={{
                                fontWeight: 600,
                                mb: 0.5,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {amenity.name}
                            </Typography>
                            <Typography
                              variant='body2'
                              color='text.secondary'
                            >
                              {amenity.description}
                            </Typography>

                            {!amenity.amenityId && (
                              <Chip
                                label='Tùy chỉnh'
                                size='small'
                                sx={{
                                  mt: 1,
                                  fontSize: "0.7rem",
                                  bgcolor: alpha(
                                    themeColors.secondary.main,
                                    0.1
                                  ),
                                  color: themeColors.secondary.main,
                                  fontWeight: 600,
                                  height: 20,
                                  borderRadius: "4px",
                                }}
                              />
                            )}
                          </Box>

                          <IconButton
                            onClick={() => handleRemoveAmenity(index)}
                            sx={{
                              position: "absolute",
                              right: 8,
                              top: 8,
                              color: themeColors.error.main,
                              p: 1,
                              "&:hover": {
                                bgcolor: alpha(themeColors.error.main, 0.1),
                              },
                            }}
                          >
                            <Delete fontSize='small' />
                          </IconButton>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </TravelokaSection>
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
              <TravelokaSection>
                <SectionTitle
                  icon={<AddPhotoAlternate />}
                  title='Thêm hình ảnh'
                />

                <Box
                  sx={{
                    border: `2px dashed ${themeColors.neutral.main}`,
                    borderRadius: 2,
                    p: 4,
                    mb: 3,
                    textAlign: "center",
                    bgcolor: alpha(themeColors.primary.main, 0.02),
                  }}
                >
                  <input
                    type='file'
                    hidden
                    multiple
                    accept='image/*'
                    id='image-upload'
                    onChange={handleImageUpload}
                  />
                  <label htmlFor='image-upload'>
                    <Box sx={{ cursor: "pointer" }}>
                      <AddPhotoAlternate
                        sx={{
                          fontSize: 48,
                          color: themeColors.primary.main,
                          mb: 1,
                        }}
                      />
                      <Typography
                        variant='h6'
                        gutterBottom
                        sx={{ fontWeight: 500 }}
                      >
                        Kéo thả hình ảnh hoặc nhấp để chọn
                      </Typography>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Hỗ trợ JPEG, PNG, GIF (tối đa 10MB)
                      </Typography>
                      <TravelokaButton
                        variant='outlined'
                        component='span'
                        sx={{ mt: 2 }}
                      >
                        Chọn ảnh từ máy tính
                      </TravelokaButton>
                    </Box>
                  </label>
                </Box>

                {images.length > 0 && (
                  <>
                    <Typography
                      variant='subtitle1'
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        mt: 3,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <CollectionsIcon
                        sx={{ mr: 1, color: themeColors.primary.main }}
                      />
                      Hình ảnh đã tải lên ({images.length})
                    </Typography>

                    <Alert
                      severity='info'
                      sx={{
                        mb: 2,
                        borderRadius: 2,
                        bgcolor: alpha(themeColors.primary.main, 0.1),
                        border: "1px solid",
                        borderColor: alpha(themeColors.primary.main, 0.2),
                      }}
                    >
                      Vui lòng chọn một ảnh làm ảnh chính để hiển thị nổi bật
                    </Alert>

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
                          <Card
                            sx={{
                              borderRadius: 2,
                              overflow: "hidden",
                              border: img.isPrimary
                                ? `2px solid ${themeColors.secondary.main}`
                                : "1px solid #e0e0e0",
                              position: "relative",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              },
                            }}
                          >
                            {img.isPrimary && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 12,
                                  left: 12,
                                  zIndex: 1,
                                  bgcolor: themeColors.secondary.main,
                                  color: "white",
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                }}
                              >
                                Ảnh chính
                              </Box>
                            )}
                            <CardMedia
                              component='img'
                              height='180'
                              image={img.preview}
                              alt={`Preview ${index + 1}`}
                            />
                            <CardContent sx={{ p: 2 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={img.isPrimary}
                                      onChange={() =>
                                        handleSetPrimaryImage(index)
                                      }
                                      color='secondary'
                                    />
                                  }
                                  label={
                                    <Typography
                                      variant='body2'
                                      sx={{ fontWeight: 500 }}
                                    >
                                      Đặt làm ảnh chính
                                    </Typography>
                                  }
                                />
                                <IconButton
                                  onClick={() => handleRemoveImage(index)}
                                  sx={{
                                    color: themeColors.error.main,
                                    "&:hover": {
                                      bgcolor: alpha(
                                        themeColors.error.main,
                                        0.1
                                      ),
                                    },
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </TravelokaSection>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        maxWidth: 1200,
        margin: "0 auto",
        bgcolor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <ToastContainer />
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
          <Typography
            variant='h6'
            sx={{ ml: 2 }}
          >
            Đang tải thông tin tài sản...
          </Typography>
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            border: `1px solid ${themeColors.neutral.main}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Typography
            variant='h5'
            gutterBottom
            sx={{
              mb: 3,
              color: themeColors.text.primary,
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            Cập nhật thông tin tài sản
          </Typography>

          <TravelokaStyleStepper
            activeStep={activeStep}
            steps={steps}
          />

          {renderStepContent(activeStep)}

          <Box
            sx={{
              mt: 4,
              display: "flex",
              justifyContent: "space-between",
              borderTop: `1px solid ${themeColors.neutral.main}`,
              pt: 3,
            }}
          >
            <TravelokaButton
              variant='outlined'
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<NavigateBefore />}
            >
              Quay lại
            </TravelokaButton>

            {activeStep === steps.length - 1 ? (
              <TravelokaButton
                variant='contained'
                onClick={handleSubmit}
                startIcon={isSubmitting ? null : <Save />}
                disabled={isSubmitting}
                color='secondary'
              >
                {isSubmitting ? (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CircularProgress
                      size={24}
                      color='inherit'
                      sx={{ mr: 1 }}
                    />
                    Đang cập nhật...
                  </Box>
                ) : (
                  "Cập nhật tài sản"
                )}
              </TravelokaButton>
            ) : (
              <TravelokaButton
                variant='contained'
                onClick={handleNext}
                endIcon={<NavigateNext />}
              >
                Tiếp theo
              </TravelokaButton>
            )}
          </Box>
        </Paper>
      )}

      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
        }}
        open={isSubmitting}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress
            size={56}
            sx={{ color: "#fff" }}
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
            Đang cập nhật tài sản...
          </Typography>
        </Box>
      </Backdrop>
    </Box>
  );
};

export default UpdateProperty;
