/** @format */

import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  IconButton,
  Chip,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
  Checkbox,
  Toolbar,
  Menu,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as ApproveIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  LockOpen as UnbanIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import axios from "axios";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Định nghĩa các trạng thái tài khoản
const ACCOUNT_STATUS = {
  ACTIVE: "ACTIVE",
  BANNED: "BANNED",
  INACTIVE: "INACTIVE",
};

const Users = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // State cho việc chọn nhiều tài khoản
  const [selected, setSelected] = useState([]);
  const [bulkActionAnchorEl, setBulkActionAnchorEl] = useState(null);
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("");

  // Add state for status menu
  const [statusMenuAnchorEl, setStatusMenuAnchorEl] = useState(null);
  const [statusMenuUser, setStatusMenuUser] = useState(null);

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Chuẩn bị tham số cho API
      const roleNames = [];
      if (roleFilter === "all") {
        roleNames.push("TENANT", "OWNER");
      } else {
        roleNames.push(roleFilter.toUpperCase());
      }

      // Xác định trạng thái status
      let status = null;
      if (statusFilter === "active") {
        status = "ACTIVE";
      } else if (statusFilter === "inactive") {
        status = "INACTIVE";
      } else if (statusFilter === "banned") {
        status = "BANNED";
      }

      // Tạo URL với tham số roleNames
      let url = `http://localhost:8888/api/v1/account/admin/getAllAccountsByRolesAndStatus?page=${page}&size=${rowsPerPage}&sortBy=createdAt`;

      // Thêm tham số status nếu có
      if (status !== null) {
        url += `&status=${status}`;
      }

      // Thêm tham số roleNames
      if (roleFilter !== "all") {
        url += `&roleNames=${roleFilter.toUpperCase()}`;
      } else {
        url += `&roleNames=TENANT,OWNER`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.code === 1000) {
        const userData = response.data.result;

        // Nếu có tìm kiếm, lọc kết quả theo searchQuery
        let filteredUsers = userData.content;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredUsers = filteredUsers.filter(
            (user) =>
              user.firstName.toLowerCase().includes(query) ||
              user.lastName.toLowerCase().includes(query) ||
              user.email.toLowerCase().includes(query) ||
              user.phoneNumber.toLowerCase().includes(query)
          );
        }

        setUsers(filteredUsers);
        setTotalElements(userData.totalElements);
        setTotalPages(userData.totalPages);
        // Xóa các lựa chọn khi tải dữ liệu mới
        setSelected([]);
      } else {
        setError("Không thể tải dữ liệu người dùng");
      }
    } catch (err) {
      setError(
        "Lỗi khi tải dữ liệu: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, statusFilter, roleFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async () => {
    // Implement save logic here
    try {
      // Example update call
      // await axios.put(`http://localhost:8888/api/v1/account/admin/updateAccount/${selectedUser.accountId}`,
      //   selectedUser,
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      // fetchUsers();
      handleCloseDialog();
    } catch (err) {
      setError(
        "Lỗi khi cập nhật người dùng: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchUsers();
  };

  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setRoleFilter("all");
    setPage(0);
    fetchUsers();
  };

  const handleToggleUserStatus = async (user) => {
    try {
      let newStatus;
      if (user.status === ACCOUNT_STATUS.ACTIVE) {
        newStatus = ACCOUNT_STATUS.BANNED;
      } else if (user.status === ACCOUNT_STATUS.BANNED) {
        newStatus = ACCOUNT_STATUS.ACTIVE;
      } else if (user.status === ACCOUNT_STATUS.INACTIVE) {
        newStatus = ACCOUNT_STATUS.ACTIVE;
      }

      // Example toggle status call
      // await axios.put(`http://localhost:8888/api/v1/account/admin/updateStatus/${user.accountId}`,
      //   { status: newStatus },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      // fetchUsers();

      // Temporary solution to show the change without API call
      const updatedUsers = users.map((u) => {
        if (u.accountId === user.accountId) {
          return { ...u, status: newStatus };
        }
        return u;
      });
      setUsers(updatedUsers);
    } catch (err) {
      setError(
        "Lỗi khi thay đổi trạng thái người dùng: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // Xử lý chọn/bỏ chọn tất cả
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = users.map((n) => n.accountId);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  // Xử lý chọn/bỏ chọn một hàng
  const handleSelectClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  // Kiểm tra xem một hàng có được chọn không
  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Mở menu hành động hàng loạt
  const handleBulkActionClick = (event) => {
    setBulkActionAnchorEl(event.currentTarget);
  };

  // Đóng menu hành động hàng loạt
  const handleBulkActionClose = () => {
    setBulkActionAnchorEl(null);
  };

  // Mở dialog thay đổi trạng thái hàng loạt
  const handleBulkStatusClick = () => {
    setBulkActionAnchorEl(null);
    setBulkStatusDialogOpen(true);
  };

  // Đóng dialog thay đổi trạng thái hàng loạt
  const handleBulkStatusClose = () => {
    setBulkStatusDialogOpen(false);
    setBulkStatus("");
  };

  // Áp dụng thay đổi trạng thái hàng loạt
  const handleBulkStatusApply = async () => {
    try {
      if (!bulkStatus) {
        setError("Vui lòng chọn trạng thái");
        return;
      }

      // Call the bulk update API endpoint
      const response = await axios.put(
        `http://localhost:8888/api/v1/account/admin/bulkUpdateAccountStatus`,
        null,
        {
          params: {
            ids: selected.join(","), // Join IDs with commas for multiple selections
            status: bulkStatus,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.code === 1000) {
        // Update UI to reflect changes
        const updatedUsers = users.map((user) => {
          if (selected.includes(user.accountId)) {
            return { ...user, status: bulkStatus };
          }
          return user;
        });
        setUsers(updatedUsers);
        setSelected([]);
        setBulkStatusDialogOpen(false);
        setBulkStatus("");
      } else {
        setError(
          "Không thể cập nhật trạng thái: " +
            (response.data?.message || "Lỗi không xác định")
        );
      }
    } catch (err) {
      setError(
        "Lỗi khi cập nhật trạng thái người dùng: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (e) {
      return dateString;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "TENANT":
        return "Người thuê";
      case "OWNER":
        return "Chủ nhà";
      case "ADMIN":
        return "Quản trị viên";
      default:
        return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "TENANT":
        return "info";
      case "OWNER":
        return "success";
      case "ADMIN":
        return "error";
      default:
        return "default";
    }
  };

  // Helper function to get status action title
  const getStatusActionTitle = (status) => {
    switch (status) {
      case ACCOUNT_STATUS.ACTIVE:
        return "Vô hiệu hóa tài khoản";
      case ACCOUNT_STATUS.BANNED:
        return "Mở khóa tài khoản";
      case ACCOUNT_STATUS.INACTIVE:
        return "Kích hoạt tài khoản";
      default:
        return "Thay đổi trạng thái";
    }
  };

  // Helper function to get status action icon
  const getStatusActionIcon = (status) => {
    switch (status) {
      case ACCOUNT_STATUS.ACTIVE:
        return <BlockIcon />;
      case ACCOUNT_STATUS.BANNED:
        return <UnbanIcon />;
      case ACCOUNT_STATUS.INACTIVE:
        return <ApproveIcon />;
      default:
        return <BlockIcon />;
    }
  };

  // Helper function to get status action color
  const getStatusActionColor = (status) => {
    switch (status) {
      case ACCOUNT_STATUS.ACTIVE:
        return "error";
      case ACCOUNT_STATUS.BANNED:
      case ACCOUNT_STATUS.INACTIVE:
        return "success";
      default:
        return "primary";
    }
  };

  // Handle opening status menu
  const handleStatusMenuOpen = (event, user) => {
    setStatusMenuAnchorEl(event.currentTarget);
    setStatusMenuUser(user);
  };

  // Handle closing status menu
  const handleStatusMenuClose = () => {
    setStatusMenuAnchorEl(null);
    setStatusMenuUser(null);
  };

  // Handle status change
  const handleChangeStatus = async (newStatus) => {
    if (!statusMenuUser) return;

    try {
      // Call the API to update user status
      const response = await axios.put(
        `http://localhost:8888/api/v1/account/admin/bulkUpdateAccountStatus`,
        null,
        {
          params: {
            ids: statusMenuUser.accountId,
            status: newStatus,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.code === 1000) {
        // Update UI to reflect changes
        const updatedUsers = users.map((u) => {
          if (u.accountId === statusMenuUser.accountId) {
            return { ...u, status: newStatus };
          }
          return u;
        });
        setUsers(updatedUsers);
        handleStatusMenuClose();
      } else {
        setError(
          "Không thể cập nhật trạng thái: " +
            (response.data?.message || "Lỗi không xác định")
        );
      }
    } catch (err) {
      setError(
        "Lỗi khi thay đổi trạng thái người dùng: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant='h5'
        sx={{ mb: 3, fontWeight: "bold", color: "primary.main" }}
      >
        Quản lý người dùng
      </Typography>

      {error && (
        <Alert
          severity='error'
          sx={{ mb: 2 }}
          action={
            <Button
              color='inherit'
              size='small'
              onClick={() => setError(null)}
            >
              Đóng
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Grid
        container
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <TextField
            fullWidth
            label='Tìm kiếm người dùng'
            variant='outlined'
            size='small'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            InputProps={{
              endAdornment: (
                <IconButton
                  size='small'
                  onClick={handleSearch}
                >
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <FormControl
            fullWidth
            size='small'
          >
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              label='Trạng thái'
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value='all'>Tất cả</MenuItem>
              <MenuItem value='active'>Hoạt động</MenuItem>
              <MenuItem value='inactive'>Chưa kích hoạt</MenuItem>
              <MenuItem value='banned'>Đã vô hiệu hóa</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <FormControl
            fullWidth
            size='small'
          >
            <InputLabel>Vai trò</InputLabel>
            <Select
              value={roleFilter}
              label='Vai trò'
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value='all'>Tất cả</MenuItem>
              <MenuItem value='owner'>Chủ nhà</MenuItem>
              <MenuItem value='tenant'>Người thuê</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
          sx={{ display: "flex", justifyContent: "flex-end" }}
        >
          <Button
            variant='outlined'
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            fullWidth
          >
            Làm mới
          </Button>
        </Grid>
      </Grid>

      {/* Toolbar cho hành động hàng loạt */}
      {selected.length > 0 && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            bgcolor: (theme) => theme.palette.primary.light,
            color: (theme) => theme.palette.primary.contrastText,
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Typography
            sx={{ flex: "1 1 100%" }}
            color='inherit'
            variant='subtitle1'
            component='div'
          >
            Đã chọn {selected.length} tài khoản
          </Typography>
          <Tooltip title='Thao tác với các tài khoản đã chọn'>
            <IconButton onClick={handleBulkActionClick}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={bulkActionAnchorEl}
            open={Boolean(bulkActionAnchorEl)}
            onClose={handleBulkActionClose}
          >
            <MenuItem onClick={handleBulkStatusClick}>
              Thay đổi trạng thái
            </MenuItem>
          </Menu>
        </Toolbar>
      )}

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Table
          sx={{ minWidth: 650 }}
          aria-label='users table'
        >
          <TableHead sx={{ backgroundColor: "rgba(25, 118, 210, 0.08)" }}>
            <TableRow>
              <TableCell padding='checkbox'>
                <Checkbox
                  color='primary'
                  indeterminate={
                    selected.length > 0 && selected.length < users.length
                  }
                  checked={users.length > 0 && selected.length === users.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Họ tên</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Vai trò</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Ngày tạo</TableCell>
              <TableCell
                sx={{ fontWeight: "bold" }}
                align='right'
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align='center'
                  sx={{ py: 3 }}
                >
                  <CircularProgress size={40} />
                  <Typography sx={{ mt: 1 }}>Đang tải dữ liệu...</Typography>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align='center'
                  sx={{ py: 3 }}
                >
                  <Typography>Không tìm thấy người dùng nào</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isItemSelected = isSelected(user.accountId);

                return (
                  <TableRow
                    key={user.accountId}
                    hover
                    selected={isItemSelected}
                  >
                    <TableCell padding='checkbox'>
                      <Checkbox
                        color='primary'
                        checked={isItemSelected}
                        onClick={(event) =>
                          handleSelectClick(event, user.accountId)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {user.firstName + " " + user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleLabel(user.roleName)}
                        color={getRoleColor(user.roleName)}
                        size='small'
                        variant='outlined'
                        sx={{ fontWeight: "500" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          user.status === ACCOUNT_STATUS.ACTIVE
                            ? "Hoạt động"
                            : user.status === ACCOUNT_STATUS.INACTIVE
                            ? "Chưa kích hoạt"
                            : "Đã vô hiệu hóa"
                        }
                        color={
                          user.status === ACCOUNT_STATUS.ACTIVE
                            ? "success"
                            : user.status === ACCOUNT_STATUS.INACTIVE
                            ? "warning"
                            : "error"
                        }
                        size='small'
                        sx={{ fontWeight: "500" }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell align='right'>
                      <Tooltip title='Chỉnh sửa'>
                        <IconButton
                          size='small'
                          color='primary'
                          onClick={() => handleEditUser(user)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Thay đổi trạng thái'>
                        <IconButton
                          size='small'
                          color='primary'
                          onClick={(event) => handleStatusMenuOpen(event, user)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Xóa'>
                        <IconButton
                          size='small'
                          color='error'
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage='Số hàng mỗi trang:'
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count}`
          }
        />
      </TableContainer>

      {/* Edit User Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            backgroundColor: "rgba(25, 118, 210, 0.08)",
            color: "primary.dark",
          }}
        >
          Chỉnh sửa thông tin người dùng
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid
              container
              spacing={2}
              sx={{ mt: 1 }}
            >
              <Grid
                item
                xs={12}
                sm={6}
              >
                <TextField
                  fullWidth
                  label='Họ'
                  defaultValue={selectedUser.firstName}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      firstName: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <TextField
                  fullWidth
                  label='Tên'
                  defaultValue={selectedUser.lastName}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      lastName: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid
                item
                xs={12}
              >
                <TextField
                  fullWidth
                  label='Email'
                  defaultValue={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                />
              </Grid>
              <Grid
                item
                xs={12}
              >
                <TextField
                  fullWidth
                  label='Số điện thoại'
                  defaultValue={selectedUser.phoneNumber}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid
                item
                xs={12}
              >
                <FormControl fullWidth>
                  <InputLabel>Vai trò</InputLabel>
                  <Select
                    label='Vai trò'
                    defaultValue={selectedUser.roleName}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        roleName: e.target.value,
                      })
                    }
                  >
                    <MenuItem value='OWNER'>Chủ nhà</MenuItem>
                    <MenuItem value='TENANT'>Người thuê</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid
                item
                xs={12}
              >
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    label='Trạng thái'
                    defaultValue={selectedUser.status}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        status: e.target.value,
                      })
                    }
                  >
                    <MenuItem value={ACCOUNT_STATUS.ACTIVE}>Hoạt động</MenuItem>
                    <MenuItem value={ACCOUNT_STATUS.INACTIVE}>
                      Chưa kích hoạt
                    </MenuItem>
                    <MenuItem value={ACCOUNT_STATUS.BANNED}>
                      Đã vô hiệu hóa
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseDialog}
            variant='outlined'
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveUser}
            variant='contained'
            color='primary'
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Status Change Dialog */}
      <Dialog
        open={bulkStatusDialogOpen}
        onClose={handleBulkStatusClose}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            backgroundColor: "rgba(25, 118, 210, 0.08)",
            color: "primary.dark",
          }}
        >
          Thay đổi trạng thái cho {selected.length} tài khoản
        </DialogTitle>
        <DialogContent>
          <FormControl
            fullWidth
            sx={{ mt: 2 }}
          >
            <InputLabel>Trạng thái mới</InputLabel>
            <Select
              value={bulkStatus}
              label='Trạng thái mới'
              onChange={(e) => setBulkStatus(e.target.value)}
            >
              <MenuItem value={ACCOUNT_STATUS.ACTIVE}>Hoạt động</MenuItem>
              <MenuItem value={ACCOUNT_STATUS.INACTIVE}>
                Chưa kích hoạt
              </MenuItem>
              <MenuItem value={ACCOUNT_STATUS.BANNED}>Đã vô hiệu hóa</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleBulkStatusClose}
            variant='outlined'
          >
            Hủy
          </Button>
          <Button
            onClick={handleBulkStatusApply}
            variant='contained'
            color='primary'
            disabled={!bulkStatus}
          >
            Áp dụng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Change Menu */}
      <Menu
        anchorEl={statusMenuAnchorEl}
        open={Boolean(statusMenuAnchorEl)}
        onClose={handleStatusMenuClose}
      >
        {statusMenuUser && statusMenuUser.status !== ACCOUNT_STATUS.ACTIVE && (
          <MenuItem
            onClick={() => handleChangeStatus(ACCOUNT_STATUS.ACTIVE)}
            sx={{ color: "success.main" }}
          >
            <ApproveIcon sx={{ mr: 1 }} /> Kích hoạt
          </MenuItem>
        )}
        {statusMenuUser &&
          statusMenuUser.status !== ACCOUNT_STATUS.INACTIVE && (
            <MenuItem
              onClick={() => handleChangeStatus(ACCOUNT_STATUS.INACTIVE)}
              sx={{ color: "warning.main" }}
            >
              <BlockIcon sx={{ mr: 1 }} /> Đặt chưa kích hoạt
            </MenuItem>
          )}
        {statusMenuUser && statusMenuUser.status !== ACCOUNT_STATUS.BANNED && (
          <MenuItem
            onClick={() => handleChangeStatus(ACCOUNT_STATUS.BANNED)}
            sx={{ color: "error.main" }}
          >
            <BlockIcon sx={{ mr: 1 }} /> Vô hiệu hóa
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default Users;
