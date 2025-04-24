/** @format */

import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { privateAxios } from "./axiosInstance";

export const ROLES = {
  OWNER: "OWNER",
  TENANT: "TENANT",
};

/**
 * Lưu token xác thực vào localStorage
 * @param {string} token - JWT token nhận được từ server
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

/**
 * Lưu thông tin đăng nhập vào local storage
 * @param {string} token - JWT token nhận được từ server
 * @param {Object} user - Thông tin người dùng
 */
export const saveUserInfo = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

/**
 * Lấy thông tin token từ local storage
 * @returns {string|null} JWT token hoặc null nếu chưa đăng nhập
 */
export const getAuthToken = () => {
  return localStorage.getItem("token");
};

/**
 * Lấy thông tin người dùng từ local storage
 * @returns {Object|null} Thông tin người dùng hoặc null nếu chưa đăng nhập
 */
export const getUserInfo = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user info:", error);
    return null;
  }
};

/**
 * Lấy thông tin người dùng từ API sử dụng token
 * @returns {Promise<Object>} Promise với thông tin người dùng
 */
export const fetchUserInfo = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Không có token");
    }

    // Thử gọi API
    try {
      const response = await privateAxios.get("/account/user/getMyInfo");

      if (response.data?.code === 1000) {
        const userData = response.data.result || {};

        // Tạo đối tượng user từ dữ liệu API
        const user = {
          id: userData.accountId,
          email: userData.email,
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          fullName:
            `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
            userData.email,
          phoneNumber: userData.phoneNumber,
          isActive: userData.isActive,
          role:
            typeof userData.role === "object"
              ? userData.role.name
              : userData.role,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          companyName: userData.companyName,
          taxId: userData.taxId,
          dateOfBirth: userData.dateOfBirth,
          occupation: userData.occupation,
          income: userData.income,
        };

        // Cập nhật thông tin người dùng trong localStorage
        localStorage.setItem("user", JSON.stringify(user));

        return user;
      } else {
        // Fallback to existing user info
        return getUserInfo();
      }
    } catch (apiError) {
      console.error("Lỗi CORS hoặc API:", apiError);
      // Nếu có lỗi CORS, lấy thông tin từ token
      const decodedToken = decodeToken(token);

      if (decodedToken) {
        // Tạo thông tin người dùng cơ bản từ token
        const basicUserInfo = {
          id: decodedToken.accountId,
          email: decodedToken.email || decodedToken.sub,
          role: decodedToken.scope || getUserScope(),
          fullName: decodedToken.email || decodedToken.sub || "Người dùng",
        };

        return basicUserInfo;
      }

      // Nếu không thể lấy thông tin từ token, sử dụng thông tin hiện có
      return getUserInfo();
    }
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return getUserInfo(); // Fallback về thông tin đã lưu trong localStorage
  }
};

/**
 * Lấy phạm vi quyền của người dùng từ token
 * @returns {string} Phạm vi quyền (GUEST, USER, OWNER, ADMIN, ...)
 */
export const getUserScope = () => {
  const token = getAuthToken();

  if (token) {
    // Ưu tiên lấy role từ token
    const decodedToken = decodeToken(token);
    if (decodedToken?.scope) {
      return decodedToken.scope;
    }
  }

  // Nếu không có token hoặc token không chứa scope, thử lấy từ thông tin user
  const user = getUserInfo();
  return user?.role || "GUEST";
};

/**
 * Kiểm tra xem người dùng có đăng nhập hay không
 * @returns {boolean} true nếu đã đăng nhập, false nếu chưa
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Kiểm tra xem người dùng có quyền truy cập vào một tài nguyên không
 * @param {string[]} allowedRoles - Danh sách các vai trò được phép
 * @returns {boolean} true nếu có quyền, false nếu không
 */
export const hasAccess = (allowedRoles) => {
  const currentRole = getUserScope();
  return allowedRoles.includes(currentRole);
};

/**
 * Đăng xuất người dùng, xóa thông tin đăng nhập
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const decodeToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return {
      email: decoded.sub,
      accountId: decoded.accountId,
      scope: decoded.scope,
      exp: decoded.exp,
      iat: decoded.iat,
    };
  } catch (error) {
    return null;
  }
};

export const getAccountId = () => {
  const token = getAuthToken();
  if (!token) return null;

  const decodedToken = decodeToken(token);
  return decodedToken?.accountId || null;
};

export const isTokenExpired = () => {
  const token = getAuthToken();
  if (!token) return true;

  const decodedToken = decodeToken(token);
  if (!decodedToken?.exp) return true;

  // Convert exp to milliseconds and compare with current time
  return decodedToken.exp * 1000 < Date.now();
};

export const getRedirectPath = (scope) => {
  switch (scope) {
    case ROLES.OWNER:
      return "/owner/dashboard";
    case ROLES.TENANT:
      return "/tenant/home";
    default:
      return "/login";
  }
};
