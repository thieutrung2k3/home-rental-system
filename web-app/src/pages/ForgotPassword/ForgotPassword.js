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
  useTheme,
  useMediaQuery,
  CircularProgress,
  Fade,
  Zoom,
  Link,
} from "@mui/material";
import {
  Email as EmailIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { publicAxios } from "../../utils/axiosInstance";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmallMobile = useMediaQuery("(max-width:450px)");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate email
    if (!email) {
      setError("Vui lòng nhập email của bạn");
      return;
    }

    if (!validateEmail(email)) {
      setError("Email không hợp lệ");
      return;
    }

    setIsLoading(true);

    try {
      const response = await publicAxios.post(
        "/account/public/sendResetPasswordEmail",
        null,
        {
          params: {
            email: email,
          },
        }
      );

      if (response.data?.code === 1000) {
        setSuccess(true);
      } else {
        setError("Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.");
      }
    } catch (err) {
      let errorMessage =
        "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.";

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
          Quên mật khẩu
        </Typography>
        <Typography variant='body1'>
          Hãy nhập email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại
          mật khẩu
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
                {renderLeftSide()}
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
                        Quên mật khẩu
                      </Typography>
                    </Fade>
                    <Fade
                      in
                      timeout={1400}
                    >
                      <Typography
                        variant='body1'
                        sx={{ mt: 2, color: "text.secondary" }}
                      >
                        Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu
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
                        Đã gửi email đặt lại mật khẩu! Vui lòng kiểm tra hộp thư
                        của bạn và làm theo hướng dẫn.
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
                        value={email}
                        onChange={handleEmailChange}
                        disabled={isLoading || success}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <EmailIcon color='primary' />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 3 }}
                      />

                      <Button
                        type='submit'
                        fullWidth
                        variant='contained'
                        size='large'
                        disabled={isLoading || success}
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
                          "Gửi yêu cầu"
                        )}
                      </Button>

                      <Box sx={{ textAlign: "center" }}>
                        <Button
                          component={RouterLink}
                          to='/login'
                          startIcon={<ArrowBackIcon />}
                          sx={{
                            textTransform: "none",
                            color: theme.palette.primary.main,
                            "&:hover": {
                              backgroundColor: "transparent",
                              textDecoration: "underline",
                            },
                          }}
                        >
                          Quay lại đăng nhập
                        </Button>
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

export default ForgotPassword;
