/** @format */

import React from "react";
import { Box, Typography, Button, Paper, Container, Grid } from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const SessionExpired = ({ message, onRedirect }) => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    if (onRedirect && typeof onRedirect === "function") {
      onRedirect();
    } else {
      navigate("/login");
    }
  };

  return (
    <Container
      maxWidth='sm'
      sx={{ mt: 8, mb: 4 }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 2,
          textAlign: "center",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <ErrorIcon
            color='error'
            sx={{ fontSize: 80, mb: 2, opacity: 0.8 }}
          />
          <Typography
            variant='h4'
            component='h1'
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Phiên đã hết hạn
          </Typography>
          <Typography
            variant='body1'
            color='text.secondary'
            sx={{ mb: 3 }}
          >
            {message || "Phiên xác thực của bạn đã hết hạn hoặc không hợp lệ."}
          </Typography>
          <Button
            variant='contained'
            size='large'
            onClick={handleRedirect}
            sx={{
              mt: 2,
              px: 4,
              py: 1,
              fontSize: "1.1rem",
              background: "linear-gradient(45deg, #f44336 30%, #ff9800 90%)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 6px 15px rgba(244, 67, 54, 0.4)",
              },
            }}
          >
            Quay lại đăng nhập
          </Button>
        </Box>
        <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid rgba(0, 0, 0, 0.1)" }}>
          <Grid
            container
            spacing={1}
            alignItems='center'
            justifyContent='center'
          >
            <Grid item>
              <AccessTimeIcon
                color='action'
                fontSize='small'
              />
            </Grid>
            <Grid item>
              <Typography
                variant='body2'
                color='text.secondary'
              >
                Thời gian hiển thị OTP có giới hạn vì lý do bảo mật
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default SessionExpired;
