/** @format */

import React, { useEffect, useState } from "react";
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
  CircularProgress,
  Fade,
  Zoom,
} from "@mui/material";
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  setAuthToken,
  decodeToken,
  getRedirectPath,
  saveUserInfo,
} from "../../utils/auth";
import { publicAxios } from "../../utils/axiosInstance";
import { createOtpSession } from "../../utils/sessionTimeout";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmallMobile = useMediaQuery("(max-width:450px)");

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
  }, []);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const loginData = {
        email: formData.email,
        password: formData.password,
      };

      const response = await publicAxios.post("/auth/public/login", loginData);

      if (response.data?.code === 1000) {
        // Check if account is active
        if (response.data?.result?.isActive === false) {
          // Create an OTP session for verification
          createOtpSession(formData.email);

          // Redirect to OTP verification page if account is not active
          setTimeout(() => {
            navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
          }, 500);
          return;
        }

        // Account is active, proceed with normal login
        const token = response.data.result.token;

        // Giải mã token để lấy thông tin
        const decodedToken = decodeToken(token);
        const scope = decodedToken?.scope;

        // Lưu thông tin người dùng vào localStorage
        const userData = {
          id: response.data.result.id,
          username: response.data.result.username || formData.email,
          email: formData.email,
          role: scope || "USER", // Lấy role từ token (scope) thay vì từ response
          fullName:
            response.data.result.fullName ||
            response.data.result.username ||
            formData.email,
        };

        saveUserInfo(token, userData);

        // Chuyển hướng dựa vào vai trò
        if (scope === "OWNER") {
          setTimeout(() => {
            navigate("/owner/dashboard");
          }, 500);
        } else if (scope === "TENANT") {
          setTimeout(() => {
            navigate("/tenant/home");
          }, 500);
        } else {
          const redirectPath = getRedirectPath(scope);
          setTimeout(() => {
            navigate(redirectPath);
          }, 500);
        }
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";

      if (err.response?.data) {
        const { code, message } = err.response.data;

        // Check for specific error code for inactive account
        if (code === 9008) {
          // Create an OTP session for verification
          createOtpSession(formData.email);

          // Redirect to OTP verification page if account is not active
          setTimeout(() => {
            navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
          }, 500);
          return;
        } else if (code !== 1000) {
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
            alignItems='center'
            justifyContent='center'
            sx={{
              minHeight: "calc(100vh - 64px - 400px)",
              mt: 2,
            }}
          >
            <Fade
              in
              timeout={1000}
            >
              <Grid
                item
                xs={12}
                md={isMobile ? 12 : 6}
                sx={{ display: isMobile ? "none" : "block" }}
              >
                {!isMobile && renderLeftSide()}
              </Grid>
            </Fade>

            <Grid
              item
              xs={12}
              md={6}
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
                    maxWidth: "500px",
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
                        Đăng nhập
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
                      <TextField
                        margin='normal'
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
                              <PersonIcon color='primary' />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        margin='normal'
                        required
                        fullWidth
                        name='password'
                        label='Mật khẩu'
                        type={showPassword ? "text" : "password"}
                        id='password'
                        autoComplete='current-password'
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
                        sx={{ mb: 3 }}
                      />

                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Link
                          component={RouterLink}
                          to='/forgot-password'
                          variant='body2'
                          sx={{
                            color: theme.palette.primary.main,
                            textDecoration: "none",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          Quên mật khẩu?
                        </Link>
                      </Box>

                      <Button
                        type='submit'
                        fullWidth
                        variant='contained'
                        size='large'
                        disabled={isLoading}
                        sx={{
                          mt: 2,
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
                          "Đăng nhập"
                        )}
                      </Button>

                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                        >
                          Chưa có tài khoản?{" "}
                          <Link
                            component={RouterLink}
                            to='/register'
                            sx={{
                              color: theme.palette.primary.main,
                              textDecoration: "none",
                              fontWeight: "bold",
                              "&:hover": {
                                textDecoration: "underline",
                              },
                            }}
                          >
                            Đăng ký ngay
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

export default Login;
