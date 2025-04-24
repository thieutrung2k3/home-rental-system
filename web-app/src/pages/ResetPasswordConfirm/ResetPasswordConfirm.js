/** @format */

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
  Button,
  Fade,
  Zoom,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  LockReset as LockResetIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { publicAxios } from "../../utils/axiosInstance";

const ResetPasswordConfirm = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const confirmPasswordReset = async () => {
      // Get email and code from URL query parameters
      const searchParams = new URLSearchParams(location.search);
      const email = searchParams.get("email");
      const code = searchParams.get("code");

      if (!email || !code) {
        setError(
          "Liên kết đặt lại mật khẩu không hợp lệ. Vui lòng kiểm tra lại."
        );
        setIsLoading(false);
        return;
      }

      try {
        // Call the API to confirm password reset
        const response = await publicAxios.post(
          `/auth/public/confirmPasswordReset?email=${encodeURIComponent(
            email
          )}&code=${encodeURIComponent(code)}`
        );

        if (response.data?.code === 1000) {
          setSuccess(true);
        } else {
          setError("Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại.");
        }
      } catch (err) {
        let errorMessage =
          "Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại.";

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

    confirmPasswordReset();
  }, [location.search]);

  const handleNavigateToLogin = () => {
    navigate("/login");
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
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container
          maxWidth='md'
          sx={{
            marginTop: "80px",
            marginBottom: "80px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Zoom
            in
            timeout={800}
          >
            <Paper
              elevation={24}
              sx={{
                p: { xs: 4, sm: 6 },
                borderRadius: 2,
                backdropFilter: "blur(10px)",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                maxWidth: 600,
                width: "100%",
                mx: "auto",
              }}
            >
              {isLoading ? (
                <Box
                  sx={{
                    py: 5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "300px",
                  }}
                >
                  <CircularProgress
                    size={60}
                    sx={{ mb: 3 }}
                  />
                  <Typography
                    variant='h5'
                    sx={{ mb: 2 }}
                  >
                    Đang xử lý...
                  </Typography>
                  <Typography
                    variant='body1'
                    color='text.secondary'
                    sx={{ maxWidth: "400px", mx: "auto" }}
                  >
                    Vui lòng đợi trong khi chúng tôi đặt lại mật khẩu của bạn.
                  </Typography>
                </Box>
              ) : success ? (
                <Fade
                  in
                  timeout={1000}
                >
                  <Box
                    sx={{
                      py: 5,
                      minHeight: "300px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircleIcon
                      color='success'
                      sx={{ fontSize: 80, mb: 3, mx: "auto" }}
                    />
                    <Typography
                      variant='h4'
                      sx={{ mb: 3, fontWeight: "bold" }}
                    >
                      Đặt lại mật khẩu thành công!
                    </Typography>
                    <Typography
                      variant='body1'
                      color='text.secondary'
                      sx={{ mb: 4, maxWidth: "450px", mx: "auto" }}
                    >
                      Mật khẩu của bạn đã được đặt lại thành công. Mật khẩu mới
                      đã được gửi trong email của bạn.
                    </Typography>
                    <Button
                      variant='contained'
                      size='large'
                      onClick={handleNavigateToLogin}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        background:
                          "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.12)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          boxShadow: "0 6px 15px rgba(33, 150, 243, 0.4)",
                        },
                        maxWidth: "350px",
                        mx: "auto",
                      }}
                    >
                      Đăng nhập với mật khẩu mới
                    </Button>
                  </Box>
                </Fade>
              ) : (
                <Fade
                  in
                  timeout={1000}
                >
                  <Box
                    sx={{
                      py: 5,
                      minHeight: "300px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <ErrorIcon
                      color='error'
                      sx={{ fontSize: 80, mb: 3, mx: "auto" }}
                    />
                    <Typography
                      variant='h4'
                      sx={{ mb: 3, fontWeight: "bold" }}
                    >
                      Đặt lại mật khẩu thất bại
                    </Typography>
                    <Alert
                      severity='error'
                      sx={{ mb: 4, maxWidth: "450px", mx: "auto" }}
                    >
                      {error}
                    </Alert>
                    <Button
                      variant='contained'
                      color='primary'
                      size='large'
                      onClick={() => navigate("/forgot-password")}
                      startIcon={<LockResetIcon />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          boxShadow: "0 6px 15px rgba(33, 150, 243, 0.4)",
                        },
                        maxWidth: "250px",
                        mx: "auto",
                      }}
                    >
                      Thử lại
                    </Button>
                  </Box>
                </Fade>
              )}
            </Paper>
          </Zoom>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default ResetPasswordConfirm;
