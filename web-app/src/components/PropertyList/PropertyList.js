/** @format */

import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TableContainer,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import privateAxios from "../../utils/axiosInstance";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { styled } from "@mui/material/styles";

// Add these styled components at the top of your file, after imports
const StyledTablePagination = styled(TablePagination)(({ theme }) => ({
  ".MuiTablePagination-select": {
    padding: "4px 28px 4px 8px", // Reduced padding
    borderRadius: "4px",
    border: "1px solid #e0e0e0",
    minWidth: "60px", // Added min-width
    maxWidth: "80px", // Added max-width
    fontSize: "0.875rem", // Slightly smaller font
    "&:hover": {
      borderColor: theme.palette.primary.main,
    },
    "&:focus": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
    },
  },
  ".MuiTablePagination-selectIcon": {
    color: theme.palette.primary.main,
  },
  ".MuiTablePagination-actions": {
    marginLeft: "20px",
    "& .MuiIconButton-root": {
      padding: "8px",
      borderRadius: "50%",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: theme.palette.primary.light,
        transform: "scale(1.1)",
      },
      "&.Mui-disabled": {
        opacity: 0.5,
      },
    },
  },
  ".MuiTablePagination-displayedRows": {
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
  ".MuiTablePagination-toolbar": {
    minHeight: "56px",
    padding: "8px 16px",
    backgroundColor: "#fafafa",
    borderRadius: "0 0 8px 8px",
  },
  ".MuiTablePagination-selectLabel": {
    fontSize: "0.875rem", // Match select font size
  },
}));

const COLUMN_WIDTHS = {
  stt: "50px",
  title: "200px",
  address: "250px",
  bedrooms: "100px",
  bathrooms: "100px",
  area: "100px",
  price: "150px",
  status: "120px",
  actions: "150px",
};

// Add this helper function before the component
const formatPrice = (value) => {
  if (!value) return "";
  return new Intl.NumberFormat("vi-VN").format(value);
};

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigation
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState({
    title: "",
    address: "",
    bedrooms: "",
    bathrooms: "",
    areaFrom: "",
    areaTo: "",
    priceFrom: "",
    priceTo: "",
    status: "", // for availability status
  });

  // Add sort state and handler
  const [sortConfig, setSortConfig] = useState({
    sortBy: "propertyId",
    sortDirection: "DESC",
  });

  const handleSort = (column) => {
    setSortConfig((prev) => ({
      sortBy: column,
      sortDirection:
        prev.sortBy === column && prev.sortDirection === "ASC" ? "DESC" : "ASC",
    }));
  };

  // Update the useEffect hook with the new API call
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await privateAxios.get(
          "/property/owner/searchProperties",
          {
            params: {
              title: searchQuery.title || null,
              address: searchQuery.address || null,
              bedrooms: searchQuery.bedrooms || null,
              bathrooms: searchQuery.bathrooms || null,
              minArea: searchQuery.areaFrom || null,
              maxArea: searchQuery.areaTo || null,
              minPrice: searchQuery.priceFrom || null,
              maxPrice: searchQuery.priceTo || null,
              isAvailable:
                searchQuery.status === ""
                  ? null
                  : searchQuery.status === "true",
              page: page,
              size: rowsPerPage,
              sortBy: sortConfig.sortBy,
              sortDirection: sortConfig.sortDirection,
            },
          }
        );

        if (response.data?.result) {
          setProperties(response.data.result.content);
          setTotalPages(response.data.result.totalPages);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [page, rowsPerPage, searchQuery, sortConfig]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleRowClick = (propertyId) => {
    navigate(`/property/${propertyId}`); // Navigate to the detail page
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (field, value) => {
    setSearchQuery((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPage(0); // Reset to first page when searching
  };

  // Update the SearchFields component
  const SearchFields = () => {
    const [localSearch, setLocalSearch] = useState({ ...searchQuery });

    const handleLocalSearch = (field, value) => {
      setLocalSearch((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const handleSearchClick = () => {
      // Validate number inputs before searching
      const validatedSearch = {
        ...localSearch,
        bedrooms: localSearch.bedrooms ? parseInt(localSearch.bedrooms) : null,
        bathrooms: localSearch.bathrooms
          ? parseInt(localSearch.bathrooms)
          : null,
        areaFrom: localSearch.areaFrom
          ? parseFloat(localSearch.areaFrom)
          : null,
        areaTo: localSearch.areaTo ? parseFloat(localSearch.areaTo) : null,
        priceFrom: localSearch.priceFrom
          ? parseFloat(localSearch.priceFrom)
          : null,
        priceTo: localSearch.priceTo ? parseFloat(localSearch.priceTo) : null,
      };

      setSearchQuery(validatedSearch);
    };

    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        handleSearchClick();
      }
    };

    const handleClearSearch = () => {
      const emptySearch = {
        title: "",
        address: "",
        bedrooms: "",
        bathrooms: "",
        areaFrom: "",
        areaTo: "",
        priceFrom: "",
        priceTo: "",
        status: "",
      };
      setLocalSearch(emptySearch);
      setSearchQuery(emptySearch);
    };

    return (
      <Box sx={{ mb: 2 }}>
        {/* Title and Address Search - First Row */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            size='small'
            label='Tiêu đề'
            value={localSearch.title}
            onChange={(e) => handleLocalSearch("title", e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ flex: 2 }}
          />
          <TextField
            size='small'
            label='Địa chỉ'
            value={localSearch.address}
            onChange={(e) => handleLocalSearch("address", e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ flex: 2 }}
          />
        </Box>

        {/* Filters - Second Row */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
          {/* Room filters */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              size='small'
              label='Số phòng ngủ'
              value={localSearch.bedrooms}
              onChange={(e) => handleLocalSearch("bedrooms", e.target.value)}
              type='number'
              sx={{ width: "120px" }}
              InputProps={{ inputProps: { min: 0, step: 1 } }}
            />
            <TextField
              size='small'
              label='Số phòng tắm'
              value={localSearch.bathrooms}
              onChange={(e) => handleLocalSearch("bathrooms", e.target.value)}
              type='number'
              sx={{ width: "120px" }}
              InputProps={{ inputProps: { min: 0, step: 1 } }}
            />
          </Box>

          {/* Area range */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              size='small'
              label='Diện tích từ'
              value={localSearch.areaFrom}
              onChange={(e) => handleLocalSearch("areaFrom", e.target.value)}
              type='number'
              sx={{ width: "120px" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>m²</InputAdornment>
                ),
                inputProps: { min: 0, step: 5 },
              }}
            />
            <span>-</span>
            <TextField
              size='small'
              label='Diện tích đến'
              value={localSearch.areaTo}
              onChange={(e) => handleLocalSearch("areaTo", e.target.value)}
              type='number'
              sx={{ width: "120px" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>m²</InputAdornment>
                ),
                inputProps: { min: 0, step: 5 },
              }}
            />
          </Box>

          {/* Price range */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              size='small'
              label='Giá từ'
              value={localSearch.priceFrom}
              onChange={(e) => handleLocalSearch("priceFrom", e.target.value)}
              type='number'
              sx={{ width: "150px" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>VNĐ</InputAdornment>
                ),
                inputProps: { min: 0, step: 1000 },
              }}
            />
            <span>-</span>
            <TextField
              size='small'
              label='Giá đến'
              value={localSearch.priceTo}
              onChange={(e) => handleLocalSearch("priceTo", e.target.value)}
              type='number'
              sx={{ width: "150px" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>VNĐ</InputAdornment>
                ),
                inputProps: { min: 0, step: 1000 },
              }}
            />
          </Box>

          <TextField
            select
            size='small'
            label=''
            value={localSearch.status}
            onChange={(e) => handleLocalSearch("status", e.target.value)}
            sx={{ width: "150px" }}
            SelectProps={{
              native: true,
            }}
          >
            <option value=''>Tất cả</option>
            <option value='true'>Còn trống</option>
            <option value='false'>Đã cho thuê</option>
          </TextField>
        </Box>

        {/* Search Buttons */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant='outlined'
            onClick={handleClearSearch}
            startIcon={<ClearIcon />}
          >
            Xóa bộ lọc
          </Button>
          <Button
            variant='contained'
            onClick={handleSearchClick}
            startIcon={<SearchIcon />}
          >
            Tìm kiếm
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography
          variant='h5'
          gutterBottom
          sx={{ fontWeight: "bold", color: "#1976d2" }}
        >
          Danh sách tài sản của tôi
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ mb: 2 }}
        >
          Quản lý tất cả các tài sản của bạn tại đây
        </Typography>
      </Paper>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <SearchFields />
        <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
          {" "}
          {/* Adjusted height for pagination */}
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    width: COLUMN_WIDTHS.stt,
                  }}
                >
                  STT
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    width: COLUMN_WIDTHS.title,
                    cursor: "pointer",
                  }}
                  onClick={() => handleSort("title")}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Tiêu đề
                    {sortConfig.sortBy === "title" && (
                      <Box
                        component='span'
                        sx={{ ml: 0.5 }}
                      >
                        {sortConfig.sortDirection === "ASC" ? "↑" : "↓"}
                      </Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    width: COLUMN_WIDTHS.address,
                  }}
                >
                  Địa chỉ
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    width: COLUMN_WIDTHS.bedrooms,
                  }}
                >
                  Số phòng ngủ
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    width: COLUMN_WIDTHS.bathrooms,
                  }}
                >
                  Số phòng tắm
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    width: COLUMN_WIDTHS.area,
                  }}
                >
                  Diện tích (m²)
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    width: COLUMN_WIDTHS.price,
                  }}
                >
                  Giá/tháng
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    width: COLUMN_WIDTHS.status,
                  }}
                >
                  Trạng thái
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    width: COLUMN_WIDTHS.actions,
                  }}
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    align='center'
                    sx={{ py: 3 }}
                  >
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : properties.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    align='center'
                    sx={{
                      py: 6,
                      backgroundColor: "#fafafa",
                      borderBottom: "none",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant='h6'
                        color='text.secondary'
                      >
                        Không tìm thấy tài sản nào
                      </Typography>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Thử thay đổi bộ lọc tìm kiếm của bạn
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((property, index) => (
                  <TableRow
                    key={property.propertyId}
                    hover
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                        transition: "background-color 0.2s ease-in-out",
                      },
                    }}
                  >
                    <TableCell align='center'>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell>{property.title}</TableCell>
                    <TableCell>{property.address}</TableCell>
                    <TableCell align='center'>{property.bedrooms}</TableCell>
                    <TableCell align='center'>{property.bathrooms}</TableCell>
                    <TableCell align='center'>{property.area}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(property.pricePerMonth)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          property.isAvailable ? "Còn trống" : "Đã cho thuê"
                        }
                        color={property.isAvailable ? "success" : "error"}
                        size='small'
                        sx={{ minWidth: 90 }}
                      />
                    </TableCell>
                    <TableCell>
                      {/* Remove the Box component and use a fragment instead */}
                      <>
                        <Tooltip title='Xem chi tiết'>
                          <IconButton
                            size='small'
                            color='primary'
                            onClick={() => handleRowClick(property.propertyId)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Chỉnh sửa'>
                          <IconButton
                            size='small'
                            color='info'
                            onClick={() =>
                              navigate(`/property/edit/${property.propertyId}`)
                            }
                          >
                            <EditIcon />
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
                      </>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <StyledTablePagination
          component='div'
          count={totalPages * rowsPerPage} // Total number of items
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            borderTop: "1px solid rgba(224, 224, 224, 1)",
            "& .MuiTablePagination-toolbar": {
              flexWrap: "wrap",
              gap: 1,
            },
          }}
          labelRowsPerPage='Số hàng mỗi trang'
          labelDisplayedRows={({ from, to, count }) => (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontWeight: 500,
                color: "primary.main",
              }}
            >
              <span style={{ color: "#666" }}>Hiển thị</span>
              <strong>{from}</strong>
              <span style={{ color: "#666" }}>đến</span>
              <strong>{to}</strong>
              <span style={{ color: "#666" }}>trong tổng số</span>
              <strong>{count !== -1 ? count : `${to}+`}</strong>
            </span>
          )}
          ActionsComponent={(props) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title='Trang trước'>
                <span>
                  <IconButton
                    onClick={(e) => props.onPageChange(e, props.page - 1)}
                    disabled={props.page === 0}
                    size='small'
                    sx={{
                      "&:hover": {
                        backgroundColor: "primary.light",
                      },
                      "&.Mui-disabled": {
                        opacity: 0.5,
                      },
                    }}
                  >
                    <NavigateBeforeIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title='Trang sau'>
                <span>
                  <IconButton
                    onClick={(e) => props.onPageChange(e, props.page + 1)}
                    disabled={
                      props.page >=
                      Math.ceil(props.count / props.rowsPerPage) - 1
                    }
                    size='small'
                    sx={{
                      "&:hover": {
                        backgroundColor: "primary.light",
                      },
                      "&.Mui-disabled": {
                        opacity: 0.5,
                      },
                    }}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          )}
        />
      </Paper>
    </Box>
  );
};

export default PropertyList;
