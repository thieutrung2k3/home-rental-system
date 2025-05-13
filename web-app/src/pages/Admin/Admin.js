/** @format */

import React, { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Container,
  Grid,
  Paper,
  ListItemButton,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  BookOnline as BookingsIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Properties from "./Properties";
import PropertyForm from "./PropertyForm";
import Users from "./Users";
import AdminAccounts from "./AdminAccounts";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const Admin = () => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const menuItems = [
    { text: "Tổng quan", icon: <DashboardIcon />, path: "/admin" },
    { text: "Quản lý nhà", icon: <HomeIcon />, path: "/admin/properties" },
    { text: "Quản lý người dùng", icon: <PeopleIcon />, path: "/admin/users" },
    {
      text: "Quản lý quản trị viên",
      icon: <AdminIcon />,
      path: "/admin/admin-accounts",
    },
    { text: "Đặt phòng", icon: <BookingsIcon />, path: "/admin/bookings" },
    { text: "Báo cáo", icon: <ReportsIcon />, path: "/admin/reports" },
    { text: "Cài đặt", icon: <SettingsIcon />, path: "/admin/settings" },
  ];

  const drawer = (
    <div>
      <Toolbar
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "64px !important",
        }}
      >
        <Typography
          variant='h6'
          noWrap
          component='div'
          sx={{
            fontWeight: "bold",
            fontSize: "1.2rem",
          }}
        >
          Quản trị hệ thống
        </Typography>
      </Toolbar>
      <Divider />
      <List
        sx={{
          padding: "8px",
          "& .MuiListItemButton-root": {
            borderRadius: "8px",
            marginBottom: "4px",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: theme.palette.primary.light,
              transform: "translateX(5px)",
              "& .MuiListItemIcon-root": {
                color: theme.palette.primary.main,
              },
              "& .MuiListItemText-primary": {
                color: theme.palette.primary.main,
                fontWeight: "bold",
              },
            },
            "&.Mui-selected": {
              backgroundColor: `${theme.palette.primary.main} !important`,
              color: "white",
              "& .MuiListItemIcon-root": {
                color: "white",
              },
              "& .MuiListItemText-primary": {
                color: "white",
                fontWeight: "bold",
              },
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            },
          },
        }}
      >
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              cursor: "pointer",
              "& .MuiListItemIcon-root": {
                minWidth: "40px",
                transition: "all 0.3s ease",
              },
              "& .MuiListItemText-primary": {
                fontSize: "0.95rem",
                transition: "all 0.3s ease",
              },
            }}
          >
            <ListItemIcon
              sx={{
                color:
                  location.pathname === item.path
                    ? "white"
                    : theme.palette.primary.main,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </div>
  );

  const Dashboard = () => (
    <Container
      maxWidth='lg'
      sx={{ mt: 4, mb: 4 }}
    >
      <Grid
        container
        spacing={3}
      >
        {/* Dashboard Overview Cards */}
        <Grid
          item
          xs={12}
          md={3}
        >
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 140,
            }}
          >
            <Typography
              component='h2'
              variant='h6'
              color='primary'
              gutterBottom
            >
              Tổng số nhà
            </Typography>
            <Typography
              component='p'
              variant='h4'
            >
              150
            </Typography>
          </Paper>
        </Grid>
        <Grid
          item
          xs={12}
          md={3}
        >
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 140,
            }}
          >
            <Typography
              component='h2'
              variant='h6'
              color='primary'
              gutterBottom
            >
              Người dùng đang hoạt động
            </Typography>
            <Typography
              component='p'
              variant='h4'
            >
              1,250
            </Typography>
          </Paper>
        </Grid>
        <Grid
          item
          xs={12}
          md={3}
        >
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 140,
            }}
          >
            <Typography
              component='h2'
              variant='h6'
              color='primary'
              gutterBottom
            >
              Đang chờ duyệt
            </Typography>
            <Typography
              component='p'
              variant='h4'
            >
              12
            </Typography>
          </Paper>
        </Grid>
        <Grid
          item
          xs={12}
          md={3}
        >
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 140,
            }}
          >
            <Typography
              component='h2'
              variant='h6'
              color='primary'
              gutterBottom
            >
              Tổng đặt phòng
            </Typography>
            <Typography
              component='p'
              variant='h4'
            >
              450
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Activity Section */}
        <Grid
          item
          xs={12}
        >
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <Typography
              component='h2'
              variant='h6'
              color='primary'
              gutterBottom
            >
              Hoạt động gần đây
            </Typography>
            {/* Add activity list here */}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position='fixed'
        sx={{
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          ml: { sm: `${open ? drawerWidth : 0}px` },
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          backgroundColor: "white",
          color: theme.palette.primary.main,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          <IconButton
            color='inherit'
            aria-label='open drawer'
            edge='start'
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              "&:hover": {
                backgroundColor: theme.palette.primary.light,
                color: "white",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant='h6'
            noWrap
            component='div'
            sx={{ fontWeight: "bold" }}
          >
            Bảng điều khiển quản trị
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid rgba(0, 0, 0, 0.12)",
            boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
          },
        }}
        variant={isMobile ? "temporary" : "persistent"}
        anchor='left'
        open={open}
        onClose={handleDrawerToggle}
      >
        {drawer}
      </Drawer>

      <Main open={open}>
        <Toolbar />
        <Routes>
          <Route
            path='/'
            element={<Dashboard />}
          />
          <Route
            path='/properties'
            element={<Properties />}
          />
          <Route
            path='/properties/add'
            element={<PropertyForm />}
          />
          <Route
            path='/properties/edit/:id'
            element={<PropertyForm />}
          />
          <Route
            path='/users'
            element={<Users />}
          />
          <Route
            path='/admin-accounts'
            element={<AdminAccounts />}
          />
          {/* Add other routes as needed */}
        </Routes>
      </Main>
    </Box>
  );
};

export default Admin;
