/** @format */

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
  Grid,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  Link,
  Fade,
  Zoom,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Divider,
} from "@mui/material";
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Work as WorkIcon,
  DateRange as DateRangeIcon,
  AttachMoney as AttachMoneyIcon,
} from "@mui/icons-material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { publicAxios } from "../../utils/axiosInstance";
import { ROLES } from "../../utils/auth";
import { createOtpSession } from "../../utils/sessionTimeout";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    roleName: ROLES.TENANT, // Default to TENANT

    // Owner fields
    companyName: "",
    taxId: "",

    // Tenant fields
    dateOfBirth: "",
    occupation: "",
    income: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmallMobile = useMediaQuery("(max-width:450px)");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    if (!formData.email) {
      setError("Email không được để trống");
      return false;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Email không hợp lệ");
      return false;
    }

    if (!formData.password) {
      setError("Mật khẩu không được để trống");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return false;
    }

    if (!formData.firstName) {
      setError("Họ không được để trống");
      return false;
    }

    if (!formData.lastName) {
      setError("Tên không được để trống");
      return false;
    }

    if (!formData.phoneNumber) {
      setError("Số điện thoại không được để trống");
      return false;
    }

    // Validate Owner fields
    if (formData.roleName === ROLES.OWNER) {
      if (!formData.companyName) {
        setError("Tên công ty không được để trống");
        return false;
      }
      if (!formData.taxId) {
        setError("Mã số thuế không được để trống");
        return false;
      }
    }

    // Validate Tenant fields
    if (formData.roleName === ROLES.TENANT) {
      if (!formData.dateOfBirth) {
        setError("Ngày sinh không được để trống");
        return false;
      }
      if (!formData.occupation) {
        setError("Nghề nghiệp không được để trống");
        return false;
      }
      if (!formData.income) {
        setError("Thu nhập không được để trống");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        roleName: formData.roleName,
      };

      // Add role-specific fields
      if (formData.roleName === ROLES.OWNER) {
        registerData.companyName = formData.companyName;
        registerData.taxId = formData.taxId;
      } else if (formData.roleName === ROLES.TENANT) {
        registerData.dateOfBirth = formData.dateOfBirth;
        registerData.occupation = formData.occupation;
        registerData.income = formData.income;
      }

      const response = await publicAxios.post(
        "/account/public/register",
        registerData
      );

      if (response.data?.code === 1000) {
        setSuccess(true);

        // Create an OTP session for verification
        createOtpSession(formData.email);

        // Redirect to OTP verification page after successful registration
        setTimeout(() => {
          navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
        }, 2000);
      } else {
        setError("Đăng ký thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      let errorMessage = "Đăng ký thất bại. Vui lòng thử lại.";

      if (err.response?.data) {
        const { code, message } = err.response.data;
        if (code !== 1000) {
          errorMessage = message || errorMessage;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderLeftSide = () => {
    if (isMobile) return null;

    return (
      <Box sx={{ p: 4, textAlign: "center", color: "white" }}>
        <HomeIcon sx={{ fontSize: 60, mb: 2 }} />
        <Typography
          variant='h3'
          sx={{ mb: 2, fontWeight: "bold" }}
        >
          RentHouse
        </Typography>
        <Typography
          variant='h5'
          sx={{ mb: 4 }}
        >
          Hệ thống quản lý nhà ở và phòng trọ thông minh
        </Typography>
        <Typography variant='body1'>
          Giải pháp toàn diện cho chủ nhà và người thuê
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Box
        sx={{
          flex: 1,
          display: "flex",
          background: "linear-gradient(135deg, #40c4ff 0%, #0288d1 100%)",
          padding: 2,
          pt: 8,
        }}
      >
        <Container maxWidth='lg'>
          <Grid
            container
            spacing={2}
            justifyContent='center'
            sx={{
              mt: 2,
              mb: 4,
            }}
          >
            <Fade
              in
              timeout={1000}
            >
              <Grid
                item
                xs={12}
                md={isMobile ? 12 : 5}
                sx={{ display: isMobile ? "none" : "block" }}
              >
                {!isMobile && renderLeftSide()}
              </Grid>
            </Fade>

            <Grid
              item
              xs={12}
              md={7}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Zoom
                in
                timeout={800}
              >
                <Paper
                  elevation={24}
                  sx={{
                    p: { xs: 2, sm: 4 },
                    borderRadius: 2,
                    backdropFilter: "blur(10px)",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    width: "100%",
                    maxWidth: "650px",
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": {
                      transform: "scale(1.01)",
                    },
                    overflow: "hidden",
                  }}
                >
                  <Box sx={{ textAlign: "center", mb: 4 }}>
                    {isMobile && (
                      <Zoom
                        in
                        timeout={600}
                      >
                        <HomeIcon
                          sx={{
                            fontSize: 40,
                            mb: 2,
                            color: theme.palette.primary.main,
                          }}
                        />
                      </Zoom>
                    )}
                    <Fade
                      in
                      timeout={1200}
                    >
                      <Typography
                        component='h1'
                        variant='h4'
                        sx={{
                          fontWeight: "bold",
                          color: theme.palette.primary.main,
                          fontSize: { xs: "1.75rem", sm: "2.125rem" },
                        }}
                      >
                        Đăng ký tài khoản
                      </Typography>
                    </Fade>
                  </Box>

                  {error && (
                    <Fade in>
                      <Alert
                        severity='error'
                        sx={{ mb: 3 }}
                      >
                        {error}
                      </Alert>
                    </Fade>
                  )}

                  {success && (
                    <Fade in>
                      <Alert
                        severity='success'
                        sx={{ mb: 3 }}
                      >
                        Đăng ký thành công! Đang chuyển đến trang xác thực
                        OTP...
                      </Alert>
                    </Fade>
                  )}

                  <Fade
                    in
                    timeout={1000}
                  >
                    <Box
                      component='form'
                      onSubmit={handleSubmit}
                      noValidate
                      sx={{
                        "& .MuiTextField-root": {
                          transition: "transform 0.2s ease-in-out",
                          "&:hover": {
                            transform: "translateY(-2px)",
                          },
                        },
                      }}
                    >
                      <Typography
                        variant='h6'
                        sx={{
                          mb: 2,
                          fontWeight: "bold",
                          color: theme.palette.primary.main,
                          fontSize: { xs: "1rem", sm: "1.25rem" },
                        }}
                      >
                        Tài khoản
                      </Typography>

                      <Grid
                        container
                        spacing={2}
                      >
                        <Grid
                          item
                          xs={12}
                        >
                          <TextField
                            required
                            fullWidth
                            id='email'
                            label='Email'
                            name='email'
                            autoComplete='email'
                            autoFocus
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position='start'>
                                  <EmailIcon color='primary' />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid
                          item
                          container
                          spacing={2}
                        >
                          <Grid
                            item
                            xs={12}
                            sm={6}
                          >
                            <TextField
                              required
                              fullWidth
                              name='password'
                              label='Mật khẩu'
                              type={showPassword ? "text" : "password"}
                              id='password'
                              autoComplete='new-password'
                              value={formData.password}
                              onChange={handleChange}
                              disabled={isLoading}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position='start'>
                                    <LockIcon color='primary' />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position='end'>
                                    <IconButton
                                      aria-label='toggle password visibility'
                                      onClick={handleClickShowPassword}
                                      edge='end'
                                      disabled={isLoading}
                                      size='small'
                                    >
                                      {showPassword ? (
                                        <VisibilityOffIcon />
                                      ) : (
                                        <VisibilityIcon />
                                      )}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
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
                              name='confirmPassword'
                              label='Xác nhận mật khẩu'
                              type={showConfirmPassword ? "text" : "password"}
                              id='confirmPassword'
                              autoComplete='new-password'
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              disabled={isLoading}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position='start'>
                                    <LockIcon color='primary' />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position='end'>
                                    <IconButton
                                      aria-label='toggle password visibility'
                                      onClick={handleClickShowConfirmPassword}
                                      edge='end'
                                      disabled={isLoading}
                                      size='small'
                                    >
                                      {showConfirmPassword ? (
                                        <VisibilityOffIcon />
                                      ) : (
                                        <VisibilityIcon />
                                      )}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 3 }} />

                      <Typography
                        variant='h6'
                        sx={{
                          mb: 2,
                          fontWeight: "bold",
                          color: theme.palette.primary.main,
                          fontSize: { xs: "1rem", sm: "1.25rem" },
                        }}
                      >
                        Thông tin cá nhân
                      </Typography>

                      <Grid
                        container
                        spacing={2}
                      >
                        <Grid
                          item
                          xs={12}
                          sm={isSmallMobile ? 12 : 6}
                        >
                          <TextField
                            required
                            fullWidth
                            id='firstName'
                            label='Họ'
                            name='firstName'
                            autoComplete='given-name'
                            value={formData.firstName}
                            onChange={handleChange}
                            disabled={isLoading}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position='start'>
                                  <AccountCircleIcon color='primary' />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          sm={isSmallMobile ? 12 : 6}
                        >
                          <TextField
                            required
                            fullWidth
                            id='lastName'
                            label='Tên'
                            name='lastName'
                            autoComplete='family-name'
                            value={formData.lastName}
                            onChange={handleChange}
                            disabled={isLoading}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position='start'>
                                  <AccountCircleIcon color='primary' />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid
                          item
                          xs={12}
                        >
                          <TextField
                            required
                            fullWidth
                            id='phoneNumber'
                            label='Số điện thoại'
                            name='phoneNumber'
                            autoComplete='tel'
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            disabled={isLoading}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position='start'>
                                  <PhoneIcon color='primary' />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid
                          item
                          xs={12}
                        >
                          <FormControl
                            fullWidth
                            required
                          >
                            <InputLabel id='roleName-label'>Bạn là</InputLabel>
                            <Select
                              labelId='roleName-label'
                              id='roleName'
                              name='roleName'
                              value={formData.roleName}
                              label='Bạn là'
                              onChange={handleChange}
                              disabled={isLoading}
                            >
                              <MenuItem value={ROLES.TENANT}>
                                Người thuê nhà
                              </MenuItem>
                              <MenuItem value={ROLES.OWNER}>Chủ nhà</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>

                      {/* Owner-specific fields */}
                      <Collapse in={formData.roleName === ROLES.OWNER}>
                        <Box sx={{ mt: 3 }}>
                          <Divider sx={{ my: 3 }} />
                          <Typography
                            variant='h6'
                            sx={{
                              mb: 2,
                              fontWeight: "bold",
                              color: theme.palette.primary.main,
                              fontSize: { xs: "1rem", sm: "1.25rem" },
                            }}
                          >
                            Thông tin dành cho chủ nhà
                          </Typography>

                          <Grid
                            container
                            spacing={2}
                          >
                            <Grid
                              item
                              xs={12}
                            >
                              <TextField
                                required={formData.roleName === ROLES.OWNER}
                                fullWidth
                                id='companyName'
                                label='Tên công ty'
                                name='companyName'
                                value={formData.companyName}
                                onChange={handleChange}
                                disabled={isLoading}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position='start'>
                                      <BusinessIcon color='primary' />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                            >
                              <TextField
                                required={formData.roleName === ROLES.OWNER}
                                fullWidth
                                id='taxId'
                                label='Mã số thuế'
                                name='taxId'
                                value={formData.taxId}
                                onChange={handleChange}
                                disabled={isLoading}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position='start'>
                                      <DescriptionIcon color='primary' />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      </Collapse>

                      {/* Tenant-specific fields */}
                      <Collapse in={formData.roleName === ROLES.TENANT}>
                        <Box sx={{ mt: 3 }}>
                          <Divider sx={{ my: 3 }} />
                          <Typography
                            variant='h6'
                            sx={{
                              mb: 2,
                              fontWeight: "bold",
                              color: theme.palette.primary.main,
                              fontSize: { xs: "1rem", sm: "1.25rem" },
                            }}
                          >
                            Thông tin dành cho người thuê
                          </Typography>

                          <Grid
                            container
                            spacing={2}
                          >
                            <Grid
                              item
                              xs={12}
                            >
                              <TextField
                                required={formData.roleName === ROLES.TENANT}
                                fullWidth
                                id='dateOfBirth'
                                label='Ngày sinh'
                                name='dateOfBirth'
                                type='date'
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                disabled={isLoading}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position='start'>
                                      <DateRangeIcon color='primary' />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                            >
                              <TextField
                                required={formData.roleName === ROLES.TENANT}
                                fullWidth
                                id='occupation'
                                label='Nghề nghiệp'
                                name='occupation'
                                value={formData.occupation}
                                onChange={handleChange}
                                disabled={isLoading}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position='start'>
                                      <WorkIcon color='primary' />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                            >
                              <TextField
                                required={formData.roleName === ROLES.TENANT}
                                fullWidth
                                id='income'
                                label='Thu nhập hàng tháng (VND)'
                                name='income'
                                type='number'
                                value={formData.income}
                                onChange={handleChange}
                                disabled={isLoading}
                                inputProps={{
                                  step: 1000,
                                  min: 0,
                                }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position='start'>
                                      <AttachMoneyIcon color='primary' />
                                    </InputAdornment>
                                  ),
                                  endAdornment: (
                                    <InputAdornment position='end'>
                                      VND
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      </Collapse>

                      <Button
                        type='submit'
                        fullWidth
                        variant='contained'
                        size='large'
                        disabled={isLoading}
                        sx={{
                          mt: 4,
                          mb: 3,
                          py: 1.5,
                          fontSize: { xs: "0.9rem", sm: "1.1rem" },
                          fontWeight: "bold",
                          background:
                            "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.12)",
                          transition: "all 0.3s ease-in-out",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 12px rgba(33, 203, 243, 0.3)",
                          },
                        }}
                      >
                        {isLoading ? (
                          <CircularProgress
                            size={24}
                            color='inherit'
                          />
                        ) : (
                          "Đăng ký"
                        )}
                      </Button>

                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                        >
                          Đã có tài khoản?{" "}
                          <Link
                            component={RouterLink}
                            to='/login'
                            sx={{
                              color: theme.palette.primary.main,
                              textDecoration: "none",
                              fontWeight: "bold",
                              "&:hover": {
                                textDecoration: "underline",
                              },
                            }}
                          >
                            Đăng nhập ngay
                          </Link>
                        </Typography>
                      </Box>
                    </Box>
                  </Fade>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
