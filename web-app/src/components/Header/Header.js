/** @format */

import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Button,
  Badge,
  Divider,
  ListItemIcon,
  useTheme,
  Tooltip,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Help as HelpIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  getUserScope,
  getAuthToken,
  isAuthenticated,
  logout,
  getUserInfo,
  fetchUserInfo,
  isTokenExpired,
} from "../../utils/auth";
import { styled, alpha } from "@mui/material/styles";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { formatDistanceToNow, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: "0px 1px 8px rgba(0, 0, 0, 0.08)",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  "& .MuiToolbar-root": {
    minHeight: "64px",
    padding: "0 24px",
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: "8px",
  padding: "8px",
  transition: "all 0.2s",
  "&:hover": {
    backgroundColor:
      theme.palette.primary.lighter || alpha(theme.palette.primary.main, 0.08),
  },
}));

const LogoTypography = styled(Typography)(({ theme }) => ({
  fontSize: "1.25rem",
  fontWeight: 700,
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
  marginLeft: "8px",
}));

const Header = ({ open, toggleDrawer }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [userInfoData, setUserInfoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  const isMenuOpen = Boolean(anchorElUser);
  const isNotificationsMenuOpen = Boolean(anchorElNotifications);

  const clientRef = useRef(null); // Giữ kết nối socket
  const connectedRef = useRef(false); // Đánh dấu đã kết nối chưa

  // Kiểm tra trạng thái đăng nhập
  const isLoggedIn = isAuthenticated();
  const userRole = getUserScope();

  // Add this function at the beginning of the Header component
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      console.log("Notification permission:", permission);
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  // Lấy thông tin người dùng từ API khi component mount
  useEffect(() => {
    const getUserData = async () => {
      if (isLoggedIn) {
        setLoading(true);
        try {
          // Trước tiên sử dụng dữ liệu từ localStorage để hiển thị nhanh
          const localUserInfo = getUserInfo();
          if (localUserInfo) {
            setUserInfoData(localUserInfo);
          }

          // Sau đó gọi API để lấy thông tin mới nhất
          const fetchedUserInfo = await fetchUserInfo();
          setUserInfoData(fetchedUserInfo);
        } catch (error) {
          console.error("Lỗi khi lấy thông tin người dùng:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    getUserData();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || connectedRef.current) return;

    const token = getAuthToken();
    const socket = new SockJS("http://localhost:8888/api/v1/ws");

    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        token: token, // Gửi token trong headers
      },
      debug: (str) => console.log("WebSocket Debug:", str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: (frame) => {
        console.log("Connected to WebSocket:", frame);
        connectedRef.current = true;

        const email = getUserInfo()?.email;
        console.log("User email:", email);

        client.subscribe(
          "/user/queue/notifications",
          (message) => {
            console.log("Received message:", message);

            try {
              const notification = JSON.parse(message.body);
              console.log("Parsed notification:", notification);

              setNotifications((prev) => [
                {
                  id: notification.notificationId,
                  title: notification.title,
                  message: notification.message,
                  isRead: notification.isRead || false,
                  accountId: notification.accountId,
                  createdAt: notification.createdAt || new Date().toISOString(), // Add default timestamp
                  updatedAt: notification.updatedAt,
                },
                ...prev,
              ]);

              if (!notification.isRead) {
                setNotificationCount((prev) => prev + 1);

                // Show browser notification
                if (Notification.permission === "granted") {
                  const browserNotification = new Notification(
                    notification.title,
                    {
                      body: notification.message,
                      icon: "/path/to/your/icon.png", // Add your notification icon
                      badge: "/path/to/your/badge.png", // Add your badge icon
                      tag: notification.notificationId,
                      timestamp: new Date(notification.createdAt).getTime(),
                      requireInteraction: true,
                      vibrate: [200, 100, 200],
                      data: { url: window.location.origin },
                    }
                  );

                  browserNotification.onclick = function () {
                    window.focus();
                    handleNotificationClick(notification);
                    this.close();
                  };

                  // Auto close after 5 seconds
                  setTimeout(() => browserNotification.close(), 5000);
                }
              }
            } catch (error) {
              console.error("Error handling notification:", error);
            }
          },
          {
            token: token,
          }
        );
      },

      onDisconnect: (frame) => {
        console.log("Disconnected from WebSocket:", frame);
        connectedRef.current = false;
      },

      onStompError: (frame) => {
        console.error("STOMP Error:", frame.body);
      },

      onWebSocketError: (event) => {
        console.error("WebSocket Error:", event);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        connectedRef.current = false;
      }
    };
  }, [isLoggedIn]);

  // Add this useEffect after your other useEffects
  useEffect(() => {
    if (isLoggedIn) {
      requestNotificationPermission();
    }
  }, [isLoggedIn]);

  // Thông tin người dùng
  const user = userInfoData || {
    name: "Người dùng",
    email: "",
    avatar: null,
    role: userRole || "Người dùng",
  };

  // Format tên hiển thị
  const displayName =
    user.fullName ||
    user.name ||
    (user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : user.email || "Người dùng");

  // Format vai trò hiển thị
  const displayRole = (() => {
    if (!user.role) return "Người dùng";

    // Kiểm tra nếu role là một object (từ API)
    if (typeof user.role === "object" && user.role !== null) {
      // Sử dụng thuộc tính name của role object
      return user.role.name === "OWNER"
        ? "Chủ nhà"
        : user.role.name === "TENANT"
        ? "Người thuê"
        : user.role.name || "Người dùng";
    }

    // Nếu role là string (từ token hoặc localStorage)
    return user.role === "OWNER"
      ? "Chủ nhà"
      : user.role === "TENANT"
      ? "Người thuê"
      : user.role || "Người dùng";
  })();

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotificationsMenu = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotificationsMenu = () => {
    setAnchorElNotifications(null);
  };

  const handleLogout = () => {
    // Đăng xuất và xóa token, thông tin người dùng
    logout();
    // Chuyển hướng về trang đăng nhập
    navigate("/login");
    handleCloseUserMenu();
  };

  const handleNavigateToProfile = () => {
    navigate("/owner/profile");
    handleCloseUserMenu();
  };

  const handleNavigateToSettings = () => {
    navigate("/owner/settings");
    handleCloseUserMenu();
  };

  const handleNavigateToHelp = () => {
    navigate("/owner/help");
    handleCloseUserMenu();
  };

  const handleNotificationClick = (notification) => {
    // Mark notification as read
    setNotifications((prev) =>
      prev.map((n) => (n === notification ? { ...n, isRead: true } : n))
    );
    setNotificationCount((prev) => Math.max(0, prev - 1));

    // Handle navigation based on notification type
    if (notification.notificationType === "VIEWING_REQUEST") {
      navigate("/owner/viewing-requests");
    }

    handleCloseNotificationsMenu();
  };

  // Render header cho người dùng chưa đăng nhập
  if (!isLoggedIn) {
    return (
      <StyledAppBar position='fixed'>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <HomeIcon
              sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 32 }}
            />
            <Typography
              variant='h6'
              component={RouterLink}
              to='/'
              sx={{
                color: theme.palette.primary.main,
                textDecoration: "none",
                fontWeight: "bold",
                letterSpacing: "0.5px",
              }}
            >
              RentHouse
            </Typography>
          </Box>

          <Box>
            <Button
              component={RouterLink}
              to='/login'
              color='primary'
              sx={{ mx: 1 }}
            >
              Đăng nhập
            </Button>
            <Button
              component={RouterLink}
              to='/register'
              variant='contained'
              color='primary'
              sx={{
                ml: 1,
                px: 3,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              Đăng ký
            </Button>
          </Box>
        </Toolbar>
      </StyledAppBar>
    );
  }

  // Render header cho Owner Dashboard (khi đã đăng nhập và có props open, toggleDrawer)
  if (isLoggedIn && userRole === "OWNER" && toggleDrawer) {
    const menuId = "primary-account-menu";
    const renderMenu = (
      <Menu
        anchorEl={anchorElUser}
        id={menuId}
        keepMounted
        open={isMenuOpen}
        onClose={handleCloseUserMenu}
        PaperProps={{
          elevation: 2,
          sx: {
            minWidth: 200,
            borderRadius: 2,
            mt: 1.5,
            "& .MuiMenuItem-root": {
              px: 2,
              py: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography
            variant='subtitle1'
            fontWeight='bold'
            component='div'
          >
            {displayName}
          </Typography>
          <Box>
            <Typography
              variant='subtitle1'
              color='inherit'
              component='div'
            >
              {user?.email}
            </Typography>
            <Typography
              variant='body2'
              color='inherit'
              sx={{ mt: 0.5 }}
              component='div'
            >
              {user?.role || "User"}
            </Typography>
          </Box>
        </Box>

        <Divider />

        <MenuItem onClick={handleNavigateToProfile}>
          <ListItemIcon>
            <PersonIcon fontSize='small' />
          </ListItemIcon>
          Tài khoản của tôi
        </MenuItem>

        <MenuItem onClick={handleNavigateToSettings}>
          <ListItemIcon>
            <SettingsIcon fontSize='small' />
          </ListItemIcon>
          Cài đặt
        </MenuItem>

        <MenuItem onClick={handleNavigateToHelp}>
          <ListItemIcon>
            <HelpIcon fontSize='small' />
          </ListItemIcon>
          Trợ giúp
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon
              fontSize='small'
              color='error'
            />
          </ListItemIcon>
          <Typography color='error'>Đăng xuất</Typography>
        </MenuItem>
      </Menu>
    );

    const notificationsMenuId = "notifications-menu";
    const renderNotificationsMenu = (
      <Menu
        anchorEl={anchorElNotifications}
        id={notificationsMenuId}
        keepMounted
        open={isNotificationsMenuOpen}
        onClose={handleCloseNotificationsMenu}
        PaperProps={{
          elevation: 2,
          sx: {
            maxWidth: 320,
            maxHeight: 400,
            borderRadius: 2,
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant='subtitle1'
            fontWeight='bold'
          >
            Thông báo
          </Typography>
        </Box>

        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography
              variant='body2'
              color='text.secondary'
            >
              Không có thông báo mới
            </Typography>
          </Box>
        ) : (
          <Box>
            {notifications.map((notification, index) => (
              <MenuItem
                key={`notification-${notification.id || index}`}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  whiteSpace: "normal",
                  minHeight: "auto",
                  py: 1.5,
                  backgroundColor: notification.isRead
                    ? "transparent"
                    : alpha(theme.palette.primary.main, 0.04),
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant='body2'
                      fontWeight={notification.isRead ? 400 : 600}
                      sx={{ flex: 1 }}
                    >
                      {notification.title}
                    </Typography>
                    {/* Time display */}
                    <Typography
                      variant='caption'
                      color='text.disabled'
                      sx={{
                        ml: 2,
                        whiteSpace: "nowrap",
                        fontSize: "0.75rem",
                      }}
                    >
                      {notification.createdAt
                        ? formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                              locale: vi,
                              includeSeconds: true,
                            }
                          )
                        : "Vừa xong"}
                    </Typography>
                  </Box>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ display: "block" }}
                  >
                    {notification.message}
                  </Typography>
                  {/* Full timestamp */}
                  {notification.createdAt && (
                    <Typography
                      variant='caption'
                      color='text.disabled'
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      {new Date(notification.createdAt).toLocaleString(
                        "vi-VN",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }
                      )}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Box>
        )}

        <Divider />

        <Box sx={{ p: 1.5, textAlign: "center" }}>
          <Button
            variant='text'
            size='small'
            onClick={() => {
              handleCloseNotificationsMenu();
              navigate("/owner/notifications");
            }}
          >
            Xem tất cả
          </Button>
        </Box>
      </Menu>
    );

    return (
      <StyledAppBar position='fixed'>
        <Toolbar>
          {isMobile && (
            <StyledIconButton
              color='inherit'
              aria-label='open drawer'
              edge='start'
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </StyledIconButton>
          )}
          {!isMobile && (
            <StyledIconButton
              color='inherit'
              aria-label='open drawer'
              edge='start'
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </StyledIconButton>
          )}

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <HomeIcon
              sx={{
                color: theme.palette.primary.main,
                fontSize: 28,
                filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))",
              }}
            />
            <LogoTypography
              variant='h6'
              noWrap
              component='div'
            >
              RentHouse - Quản lý nhà ở
            </LogoTypography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              "& .MuiIconButton-root": {
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              },
            }}
          >
            <Tooltip
              title='Thông báo'
              arrow
            >
              <StyledIconButton
                size='large'
                aria-label='show notifications'
                aria-controls={notificationsMenuId}
                aria-haspopup='true'
                onClick={handleOpenNotificationsMenu}
                color='inherit'
              >
                <Badge
                  badgeContent={notificationCount}
                  color='error'
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.75rem",
                      height: "18px",
                      minWidth: "18px",
                      padding: "0 4px",
                    },
                  }}
                >
                  <NotificationsIcon />
                </Badge>
              </StyledIconButton>
            </Tooltip>

            <Tooltip
              title='Tài khoản'
              arrow
            >
              <StyledIconButton
                size='large'
                edge='end'
                aria-label='account of current user'
                aria-controls={menuId}
                aria-haspopup='true'
                onClick={handleOpenUserMenu}
                color='inherit'
              >
                {loading ? (
                  <CircularProgress
                    size={24}
                    color='inherit'
                  />
                ) : user.avatar ? (
                  <Avatar
                    src={user.avatar}
                    alt={displayName}
                    sx={{
                      width: 32,
                      height: 32,
                      border: `2px solid ${theme.palette.primary.main}`,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: theme.palette.primary.main,
                      fontWeight: 600,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>
                )}
              </StyledIconButton>
            </Tooltip>

            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                ml: 2,
                paddingLeft: 2,
                borderLeft: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant='subtitle2'
                sx={{ fontWeight: 600 }}
              >
                {displayName}
              </Typography>
              <Typography
                variant='caption'
                sx={{
                  display: "block",
                  color: "text.secondary",
                  ml: 1,
                  backgroundColor:
                    theme.palette.primary.lighter ||
                    alpha(theme.palette.primary.main, 0.1),
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontWeight: 500,
                }}
              >
                {displayRole}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
        {renderMenu}
        {renderNotificationsMenu}
      </StyledAppBar>
    );
  }

  // Header mặc định cho người dùng đã đăng nhập nhưng không phải trong dashboard
  return (
    <StyledAppBar position='fixed'>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <HomeIcon
            sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 32 }}
          />
          <Typography
            variant='h6'
            component={RouterLink}
            to='/'
            sx={{
              color: theme.palette.primary.main,
              textDecoration: "none",
              fontWeight: "bold",
              letterSpacing: "0.5px",
            }}
          >
            RentHouse
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title='Tài khoản'>
            <IconButton
              size='large'
              edge='end'
              aria-label='account of current user'
              aria-haspopup='true'
              onClick={handleOpenUserMenu}
              color='inherit'
            >
              {loading ? (
                <CircularProgress
                  size={24}
                  color='inherit'
                />
              ) : user.avatar ? (
                <Avatar
                  src={user.avatar}
                  alt={displayName}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </Avatar>
              )}
            </IconButton>
          </Tooltip>

          <Menu
            sx={{ mt: "45px" }}
            id='menu-user'
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={isMenuOpen}
            onClose={handleCloseUserMenu}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography
                variant='subtitle1'
                fontWeight='bold'
                component='div'
              >
                {displayName}
              </Typography>
              <Box>
                <Typography
                  variant='subtitle1'
                  color='inherit'
                  component='div'
                >
                  {user?.email}
                </Typography>
                <Typography
                  variant='body2'
                  color='inherit'
                  sx={{ mt: 0.5 }}
                  component='div'
                >
                  {user?.role || "User"}
                </Typography>
              </Box>
            </Box>

            <Divider />

            <MenuItem onClick={handleNavigateToProfile}>
              <ListItemIcon>
                <PersonIcon fontSize='small' />
              </ListItemIcon>
              Tài khoản của tôi
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon
                  fontSize='small'
                  color='error'
                />
              </ListItemIcon>
              <Typography color='error'>Đăng xuất</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
