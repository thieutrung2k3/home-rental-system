/** @format */

import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Collapse,
  Tooltip,
} from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";
import { Link, useLocation } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PeopleIcon from "@mui/icons-material/People";
import PaymentIcon from "@mui/icons-material/Payment";
import ReportIcon from "@mui/icons-material/Report";
import SettingsIcon from "@mui/icons-material/Settings";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIcon from "@mui/icons-material/Assignment";
import StarIcon from "@mui/icons-material/Star";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import GroupsIcon from "@mui/icons-material/Groups";
import { HomeMax, HomeMini, House } from "@mui/icons-material";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
}));

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: 240,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    background: theme.palette.background.paper,
    borderRight: "none",
    boxShadow: "4px 0 15px rgba(0, 0, 0, 0.08)",
    position: "relative",
    overflow: "hidden",
    "&:before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: `linear-gradient(to bottom, ${alpha(
        theme.palette.primary.main,
        0.02
      )}, transparent)`,
      pointerEvents: "none",
    },
  },
  ...(open && {
    width: 290,
    transition: theme.transitions.create(["width", "box-shadow"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    "& .MuiDrawer-paper": {
      width: 300,
      boxShadow: "4px 0 20px rgba(0, 0, 0, 0.12)",
    },
  }),
  ...(!open && {
    transition: theme.transitions.create(["width", "box-shadow"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    "& .MuiDrawer-paper": {
      width: theme.spacing(7),
    },
  }),
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
  margin: "4px 8px",
  borderRadius: "8px",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: "scale(1.02)",
  },
  ...(active === "true" && {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.16),
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
    },
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main,
      transform: "scale(1.1)",
    },
    "& .MuiListItemText-primary": {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
  }),
}));

const StyledSubListItemButton = styled(ListItemButton)(({ theme, active }) => ({
  margin: "2px 16px",
  borderRadius: "8px",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: "scale(1.02)",
  },
  ...(active && {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    boxShadow: `0 2px 6px ${alpha(theme.palette.primary.main, 0.15)}`,
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.16),
      boxShadow: `0 3px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main,
      transform: "scale(1.1)",
    },
    "& .MuiListItemText-primary": {
      color: theme.palette.primary.main,
      fontWeight: 500,
    },
  }),
}));

const Sidebar = ({ open, toggleDrawer }) => {
  const location = useLocation();
  const theme = useTheme();
  const [propertyOpen, setPropertyOpen] = useState(false);
  const [tenantOpen, setTenantOpen] = useState(false);

  const handlePropertyClick = () => {
    setPropertyOpen(!propertyOpen);
  };

  const handleTenantClick = () => {
    setTenantOpen(!tenantOpen);
  };

  const isActive = (path) => {
    if (!path) return false;

    // Exact match for leaf routes
    if (path === "/owner/properties/add" || path === "/owner/properties") {
      return location.pathname === path;
    }

    // For parent routes, check if we're in their section
    return (
      location.pathname.startsWith(path + "/") || location.pathname === path
    );
  };

  const menuItems = [
    {
      text: "Trang chủ",
      icon: <House />,
      path: "/owner/dashboard",
    },
    {
      text: "Tổng quan",
      icon: <DashboardIcon />,
      path: "/owner/overview",
    },
    {
      text: "Quản lý tài sản",
      icon: <ApartmentIcon />,
      onClick: handlePropertyClick,
      open: propertyOpen,
      subItems: [
        {
          text: "Tất cả tài sản",
          icon: <BusinessIcon />,
          path: "/owner/properties",
        },
        {
          text: "Thêm tài sản mới",
          icon: <AddBusinessIcon />,
          path: "/owner/properties/add",
        },
      ],
    },
    {
      text: "Quản lý người thuê",
      icon: <PeopleIcon />,
      onClick: handleTenantClick,
      open: tenantOpen,
      subItems: [
        {
          text: "Danh sách người thuê",
          icon: <GroupsIcon />,
          path: "/owner/tenants",
        },
        {
          text: "Yêu cầu đăng ký thuê",
          icon: <AssignmentIcon />,
          path: "/owner/tenants/applications",
        },
      ],
    },
    {
      text: "Quản lý hóa đơn",
      icon: <PaymentIcon />,
      path: "/owner/invoices",
    },
    {
      text: "Đánh giá",
      icon: <StarIcon />,
      path: "/owner/reviews",
    },
    {
      text: "Báo cáo & Thống kê",
      icon: <ReportIcon />,
      path: "/owner/reports",
    },
    {
      text: "Cài đặt",
      icon: <SettingsIcon />,
      path: "/owner/settings",
    },
  ];

  return (
    <StyledDrawer
      variant='permanent'
      open={open}
      sx={{
        "& .MuiDrawer-paper": {
          position: "relative",
          border: "none",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <DrawerHeader>
        <IconButton onClick={toggleDrawer}>
          <ChevronLeftIcon />
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List
        sx={{
          pt: 1,
          "& .MuiListItemIcon-root": {
            minWidth: 0,
            color: theme.palette.text.secondary,
            transition: "all 0.2s ease-in-out",
          },
          "& .MuiListItemText-primary": {
            fontSize: "0.875rem",
            fontWeight: 500,
            color: theme.palette.text.primary,
            transition: "all 0.2s ease-in-out",
          },
          "& .MuiListItem-root": {
            transition: "transform 0.2s ease-in-out",
            "&:hover": {
              transform: "translateX(4px)",
            },
          },
          "& .MuiCollapse-root": {
            transition: "all 0.3s ease-in-out",
          },
        }}
      >
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            {item.subItems ? (
              <>
                <ListItem
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <StyledListItemButton
                    onClick={item.onClick}
                    active={isActive(item.path).toString()}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                    }}
                  >
                    <Tooltip
                      title={!open ? item.text : ""}
                      placement='right'
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                    </Tooltip>
                    {open && (
                      <>
                        <ListItemText primary={item.text} />
                        {item.open ? <ExpandLess /> : <ExpandMore />}
                      </>
                    )}
                  </StyledListItemButton>
                </ListItem>
                <Collapse
                  in={open && item.open}
                  timeout='auto'
                  unmountOnExit
                >
                  <List
                    component='div'
                    disablePadding
                  >
                    {item.subItems.map((subItem) => (
                      <ListItem
                        key={subItem.text}
                        disablePadding
                        sx={{ display: "block" }}
                      >
                        <StyledSubListItemButton
                          component={Link}
                          to={subItem.path}
                          active={isActive(subItem.path)}
                          sx={{
                            minHeight: 40,
                            justifyContent: open ? "initial" : "center",
                            px: 2.5,
                          }}
                        >
                          <Tooltip
                            title={!open ? subItem.text : ""}
                            placement='right'
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 0,
                                mr: open ? 3 : "auto",
                                justifyContent: "center",
                              }}
                            >
                              {subItem.icon}
                            </ListItemIcon>
                          </Tooltip>
                          {open && <ListItemText primary={subItem.text} />}
                        </StyledSubListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItem
                disablePadding
                sx={{ display: "block" }}
              >
                <StyledListItemButton
                  component={Link}
                  to={item.path}
                  active={isActive(item.path).toString()}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <Tooltip
                    title={!open ? item.text : ""}
                    placement='right'
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                  </Tooltip>
                  {open && <ListItemText primary={item.text} />}
                </StyledListItemButton>
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>
    </StyledDrawer>
  );
};

export default Sidebar;
