/** @format */

import axios from "axios";

// Base URL - sử dụng đường dẫn tương đối thay vì tuyệt đối để tránh CORS
const BASE_URL = "/api/v1";

// Các hàm auth được import trực tiếp từ file auth (để tránh circular dependency)
const getAuthToken = () => localStorage.getItem("token");

const isTokenExpired = () => {
  const token = getAuthToken();
  if (!token) return true;

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Public Axios instance - không yêu cầu token xác thực
export const publicAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Private Axios instance - yêu cầu token xác thực
export const privateAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor cho privateAxios - tự động thêm token vào header
privateAxios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    // Kiểm tra token hết hạn trước khi gửi request
    if (token && !isTokenExpired()) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Nếu token hết hạn, xóa dữ liệu đăng nhập và chuyển hướng tới trang đăng nhập
      logout();
      window.location.href = "/login";
      return Promise.reject("Token hết hạn hoặc không hợp lệ");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho privateAxios - xử lý lỗi 401 Unauthorized
privateAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token không hợp lệ hoặc hết hạn
      console.log("Phiên đăng nhập hết hạn hoặc không hợp lệ");
      logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default privateAxios;
