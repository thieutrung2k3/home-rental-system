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
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as ApproveIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import axios from "axios";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const AdminAccounts = () => {
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

      // Xác định trạng thái isActive
      let status = null;
      if (statusFilter === "active") {
        status = "ACTIVE";
      } else if (statusFilter === "inactive") {
        status = "INACTIVE";
      } else if (statusFilter === "banned") {
        status = "BANNED";
      }

      // Tạo URL với tham số roleNames
      let url = `http://localhost:8888/api/v1/account/admin/getAllAccountsByRolesAndStatus?page=${page}&size=${rowsPerPage}&sortBy=createdAt&roleNames=ADMIN`;

      // Thêm tham số isActive nếu có
      if (status !== null) {
        url += `&status=${status}`;
      }

      // Thêm tham số roleNames

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
      // Example toggle status call
      // await axios.put(`http://localhost:8888/api/v1/account/admin/toggleStatus/${user.accountId}`,
      //   {},
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      // fetchUsers();
    } catch (err) {
      setError(
        "Lỗi khi thay đổi trạng thái người dùng: " +
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

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant='h5'
        sx={{ mb: 3, fontWeight: "bold", color: "primary.main" }}
      >
        Quản lý tài khoản quản trị
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
                  colSpan={6}
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
                  colSpan={6}
                  align='center'
                  sx={{ py: 3 }}
                >
                  <Typography>Không tìm thấy người dùng nào</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.accountId}
                  hover
                >
                  <TableCell>{user.firstName + " " + user.lastName}</TableCell>
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
                        user.status === "ACTIVE"
                          ? "Hoạt động"
                          : user.status === "INACTIVE"
                          ? "Không hoạt động"
                          : "Đã vô hiệu hóa"
                      }
                      color={
                        user.status === "ACTIVE"
                          ? "success"
                          : user.status === "INACTIVE"
                          ? "warning"
                          : "error"
                      }
                      size='small'
                      sx={{ fontWeight: "500" }}
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell align='right'>
                    <IconButton
                      size='small'
                      color='primary'
                      onClick={() => handleEditUser(user)}
                      title='Chỉnh sửa'
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size='small'
                      color={user.isActive ? "error" : "success"}
                      onClick={() => handleToggleUserStatus(user)}
                      title={user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                    >
                      {user.isActive ? <BlockIcon /> : <ApproveIcon />}
                    </IconButton>
                    <IconButton
                      size='small'
                      color='error'
                      title='Xóa'
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
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
                    defaultValue={selectedUser.isActive}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        isActive: e.target.value,
                      })
                    }
                  >
                    <MenuItem value={true}>Hoạt động</MenuItem>
                    <MenuItem value={false}>Không hoạt động</MenuItem>
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
    </Box>
  );
};

export default AdminAccounts;
