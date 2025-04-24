/** @format */

import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Phone,
  Email,
  LocationOn,
} from "@mui/icons-material";

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        color: "text.secondary",
        py: 6,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth='lg'>
        <Grid
          container
          spacing={4}
        >
          {/* Thông tin công ty */}
          <Grid
            item
            xs={12}
            md={4}
          >
            <Typography
              variant='h6'
              color='primary'
              gutterBottom
            >
              RentHouse
            </Typography>
            <Typography
              variant='body2'
              mb={2}
            >
              Hệ thống quản lý nhà ở và phòng trọ thông minh, giải pháp toàn
              diện cho chủ nhà và người thuê.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton
                color='primary'
                aria-label='facebook'
              >
                <Facebook />
              </IconButton>
              <IconButton
                color='primary'
                aria-label='twitter'
              >
                <Twitter />
              </IconButton>
              <IconButton
                color='primary'
                aria-label='instagram'
              >
                <Instagram />
              </IconButton>
              <IconButton
                color='primary'
                aria-label='linkedin'
              >
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Liên hệ */}
          <Grid
            item
            xs={12}
            md={4}
          >
            <Typography
              variant='h6'
              color='primary'
              gutterBottom
            >
              Liên hệ
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <LocationOn
                color='primary'
                sx={{ mr: 1 }}
              />
              <Typography variant='body2'>
                Di Trạch, Hoài Đức, Hà Nội
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Phone
                color='primary'
                sx={{ mr: 1 }}
              />
              <Typography variant='body2'>
                <Link
                  href='tel:+84123456789'
                  color='inherit'
                >
                  (84) 123 456 789
                </Link>
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Email
                color='primary'
                sx={{ mr: 1 }}
              />
              <Typography variant='body2'>
                <Link
                  href='mailto:contact@renthouse.com'
                  color='inherit'
                >
                  contact@renthouse.com
                </Link>
              </Typography>
            </Box>
          </Grid>

          {/* Thông tin quản trị */}
          <Grid
            item
            xs={12}
            md={4}
          >
            <Typography
              variant='h6'
              color='primary'
              gutterBottom
            >
              Quản trị viên
            </Typography>
            <Typography
              variant='body2'
              paragraph
            >
              <strong>Giờ làm việc:</strong> 8:00 - 17:00 (Thứ 2 - Thứ 6)
            </Typography>
            <Typography
              variant='body2'
              paragraph
            >
              <strong>Hỗ trợ khẩn cấp:</strong>
              <br />
              Hotline:{" "}
              <Link
                href='tel:+84987654321'
                color='primary'
              >
                0345695203
              </Link>
            </Typography>
            <Typography variant='body2'>
              <strong>Email hỗ trợ:</strong>
              <br />
              <Link
                href='mailto:admin@renthouse.com'
                color='primary'
              >
                admin@renthouse.com
              </Link>
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 6, mb: 4 }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant='body2'
            color='text.secondary'
          >
            © {currentYear} RentHouse. Bản quyền thuộc về Công ty TNHH
            RentHouse.
          </Typography>
          <Box>
            <Link
              href='/privacy'
              color='inherit'
              sx={{ mx: 1 }}
            >
              Chính sách bảo mật
            </Link>
            |
            <Link
              href='/terms'
              color='inherit'
              sx={{ mx: 1 }}
            >
              Điều khoản sử dụng
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
