/** @format */

import React, { useState, useEffect } from "react";
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
  LinearProgress,
} from "@mui/material";
import {
  Email as EmailIcon,
  VerifiedUser as VerifiedUserIcon,
  Home as HomeIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { publicAxios } from "../../utils/axiosInstance";
import SessionExpired from "../../components/SessionExpired";
import {
  createOtpSession,
  isValidOtpSession,
  getOtpSessionTimeRemaining,
  clearOtpSession,
} from "../../utils/sessionTimeout";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [sessionValid, setSessionValid] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  const [timeRemaining, setTimeRemaining] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmallMobile = useMediaQuery("(max-width:450px)");

  useEffect(() => {
    // Get email from URL parameters
    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get("email");

    if (emailParam) {
      setEmail(emailParam);

      // Check if session exists or create a new one
      if (!isValidOtpSession(emailParam)) {
        createOtpSession(emailParam);
      }

      // Check if session is valid
      const isValid = isValidOtpSession(emailParam);
      setSessionValid(isValid);

      if (isValid) {
        const remainingTime = getOtpSessionTimeRemaining();
        setTimeRemaining(remainingTime);
      }
    } else {
      // Redirect to register if no email provided
      navigate("/register");
    }
  }, [location, navigate]);

  // Timer for session expiration
  useEffect(() => {
    if (!sessionValid || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      const remaining = getOtpSessionTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setSessionValid(false);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionValid, timeRemaining]);

  useEffect(() => {
    // Countdown timer for OTP resend
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleOtpChange = (e) => {
    // Only allow numbers and limit to 6 characters
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!otp || otp.length !== 6) {
      setError("Vui lòng nhập mã OTP 6 chữ số");
      return;
    }

    setIsLoading(true);

    try {
      const response = await publicAxios.post(
        "/auth/public/validateOtpCode",
        null,
        {
          params: {
            email: email,
            otpCode: otp,
            type: "REGISTER",
          },
        }
      );

      if (response.data?.code === 1000) {
        setSuccess(true);
        setIsVerified(true);
        // Clear OTP session on successful verification
        clearOtpSession();

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError("Xác thực thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      let errorMessage = "Xác thực thất bại. Vui lòng thử lại.";

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

  const handleResendOtp = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await publicAxios.post(
        "/email/public/sendOtpEmail",
        null,
        {
          params: {
            email: email,
          },
        }
      );

      if (response.data?.code === 1000) {
        // Reset countdown
        setCountdown(60);
        setCanResend(false);

        // Refresh session
        createOtpSession(email);
        setSessionValid(true);
        setTimeRemaining(getOtpSessionTimeRemaining());
      } else {
        setError("Không thể gửi lại mã OTP. Vui lòng thử lại sau.");
      }
    } catch (err) {
      let errorMessage = "Không thể gửi lại mã OTP. Vui lòng thử lại sau.";

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
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
          Xác thực tài khoản
        </Typography>
        <Typography variant='body1'>
          Vui lòng kiểm tra email của bạn và nhập mã OTP để hoàn tất việc đăng
          ký
        </Typography>
      </Box>
    );
  };

  // Show session expired screen if session is invalid
  if (!sessionValid && !isVerified) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Header />
        <Box
          sx={{
            flex: 1,
            display: "flex",
            background: "linear-gradient(135deg, #40c4ff 0%, #0288d1 100%)",
            padding: 2,
            pt: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SessionExpired
            message='Phiên xác thực OTP đã hết hạn. Vui lòng đăng nhập lại để nhận mã OTP mới.'
            onRedirect={() => navigate("/login")}
          />
        </Box>
        <Footer />
      </Box>
    );
  }

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
                  {/* Session timer */}
                  <Box sx={{ mb: 2, width: "100%" }}>
                    <Grid
                      container
                      spacing={1}
                      alignItems='center'
                      sx={{ mb: 1 }}
                    >
                      <Grid item>
                        <AccessTimeIcon
                          color='primary'
                          fontSize='small'
                        />
                      </Grid>
                      <Grid item>
                        <Typography
                          variant='body2'
                          color='primary'
                        >
                          Thời gian còn lại: {formatTime(timeRemaining)}
                        </Typography>
                      </Grid>
                    </Grid>
                    <LinearProgress
                      variant='determinate'
                      value={(timeRemaining / 600) * 100} // 10 minutes = 600 seconds
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor:
                            timeRemaining < 60 ? "#ff9800" : "#2196f3",
                        },
                      }}
                    />
                  </Box>

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
                        Xác thực OTP
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
                        Chúng tôi đã gửi một mã OTP đến email của bạn
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
                        Xác thực thành công! Đang chuyển đến trang đăng nhập...
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
                        disabled
                        id='email'
                        label='Email'
                        value={email}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <EmailIcon color='primary' />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 2 }}
                      />

                      <TextField
                        margin='normal'
                        required
                        fullWidth
                        id='otp'
                        label='Mã OTP'
                        name='otp'
                        autoComplete='one-time-code'
                        autoFocus
                        value={otp}
                        onChange={handleOtpChange}
                        disabled={isLoading}
                        placeholder='Nhập mã 6 chữ số'
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <VerifiedUserIcon color='primary' />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 3 }}
                        inputProps={{
                          maxLength: 6,
                          inputMode: "numeric",
                          pattern: "[0-9]*",
                        }}
                      />

                      <Box sx={{ textAlign: "right", mb: 2 }}>
                        <Button
                          disabled={!canResend || isLoading}
                          onClick={handleResendOtp}
                          sx={{
                            textTransform: "none",
                            color: theme.palette.primary.main,
                            "&:disabled": {
                              color: theme.palette.text.disabled,
                            },
                          }}
                        >
                          {canResend
                            ? "Gửi lại mã"
                            : `Gửi lại sau (${countdown}s)`}
                        </Button>
                      </Box>

                      <Button
                        type='submit'
                        fullWidth
                        variant='contained'
                        size='large'
                        disabled={isLoading || otp.length !== 6}
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
                          "Xác nhận"
                        )}
                      </Button>
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

export default OtpVerification;
