package com.kir.homerentalsystem.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    INVALID_KEY(1003, "Invalid message key", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTED(9001, "Email đã tồn tại.", HttpStatus.BAD_REQUEST),
    ACCOUNT_NOT_EXISTED(9002, "Tài khoản không tồn tại.", HttpStatus.NOT_FOUND),
    CANNOT_GENERATE_TOKEN(9003, "Không thể tạo token.", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(9004, "Chưa xác thực", HttpStatus.UNAUTHORIZED),
    FILE_NOT_EXISTED(9005, "Tệp không tồn tại.", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(9006, "Mật khẩu không hợp lệ.", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(9007, "Vai trò không tồn tại.", HttpStatus.NOT_FOUND),
    ACCOUNT_NOT_ACTIVATED(9008, "Tài khoản chưa được kích hoạt.", HttpStatus.UNAUTHORIZED),
    INVALID_EMAIL_FORMAT(9009, "Định dạng email không hợp lệ.", HttpStatus.BAD_REQUEST),
    INVALID_PHONE_FORMAT(9010, "Định dạng số điện thoại không hợp lệ.", HttpStatus.BAD_REQUEST),
    REGISTER_FAILED(9011, "Đăng ký thất bại.", HttpStatus.BAD_REQUEST),
    SEND_OTP_FAILED(9012, "Gửi mã OTP thất bại.", HttpStatus.BAD_REQUEST),
    ACCOUNT_ACTIVATION_CONFLICT(9013, "Tài khoản này đã được kích hoạt.", HttpStatus.BAD_REQUEST),
    REQUEST_INVALID(9014, "Định dạng request không phù hợp.", HttpStatus.BAD_REQUEST),
    OTP_INVALID(9015, "Mã OTP không hợp lệ.", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST(9016, "Yêu cầu không hợp lệ.", HttpStatus.BAD_REQUEST),
    SEND_NEW_PASSWORD_FAILED(9017, "Gửi mật khẩu mới thất bại.", HttpStatus.BAD_REQUEST),
    PASSWORD_EXPIRED(9018, "Yêu cầu đặt lại mật khẩu không tồn tại hoặc đã hết hạn.", HttpStatus.BAD_REQUEST),
    OWNER_NOT_EXISTED(9019, "Chủ sở hữu không tồn tại.", HttpStatus.NOT_FOUND),
    TENANT_NOT_EXISTED(9020, "Người thuê không tồn tại", HttpStatus.NOT_FOUND),
    VERIFICATION_NOT_EXISTED(9021, "Trạng thái xác thực không tồn tại.", HttpStatus.NOT_FOUND),
    PROPERTY_CATEGORY_NOT_EXISTED(9022, "Danh mục không tồn tại.", HttpStatus.NOT_FOUND),
    NOT_AUTHORIZED(9023, "Không đủ quyền hạn.", HttpStatus.UNAUTHORIZED),
    PROPERTY_NOT_EXISTED(9023, "Bất động sản không tồn tại.", HttpStatus.NOT_FOUND),
    PROPERTIES_LIST_IS_NULL(9024, "Danh sách bất động sản rỗng.", HttpStatus.BAD_REQUEST),
    CAN_NOT_SAVE_FILE(9026, "Có lỗi xảy ra khi lưu file.", HttpStatus.INTERNAL_SERVER_ERROR),
    PROPERTY_IS_NOT_AVAILABLE(9027, "Bất động sản này đã được cho thuê hoặc không có sẵn.", HttpStatus.BAD_REQUEST),
    PROPERTY_VIEWING_REQUEST_EXISTED(9028, "Yêu cầu xem nhà đã tồn tại.", HttpStatus.BAD_REQUEST),
    ATTRIBUTE_INVALID(9029, "Thuộc tính không hợp lệ.", HttpStatus.BAD_REQUEST),
    LEASE_NOT_EXISTED(9030, "Hợp đồng không tồn tại", HttpStatus.NOT_FOUND),
    UNCATEGORIZED_EXCEPTION(9999, "Lỗi không xác định", HttpStatus.INTERNAL_SERVER_ERROR);
    
    private int code;
    private String message;
    private HttpStatusCode statusCode;
}