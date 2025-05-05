package com.kir.homerentalsystem.util;

import java.util.regex.Pattern;

/**
 * Lớp tiện ích để xác thực email và số điện thoại
 * @author Trung
 * @see ValidationUtil
 */
public class ValidationUtil {

    // Mẫu regex cho email - phù hợp với hầu hết các trường hợp email thông thường
    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$");
    
    // Mẫu regex cho số điện thoại Việt Nam (bắt đầu bằng 0, theo sau là 9 chữ số)
    private static final Pattern VIETNAM_PHONE_PATTERN = 
        Pattern.compile("^(0[3|5|7|8|9])+([0-9]{8})$");
    
    // Mẫu regex cho số điện thoại quốc tế (bắt đầu bằng +, theo sau là 1-3 chữ số quốc gia và 7-12 chữ số)
    private static final Pattern INTERNATIONAL_PHONE_PATTERN = 
        Pattern.compile("^\\+(?:[0-9] ?){6,14}[0-9]$");

    /**
     * Kiểm tra tính hợp lệ của địa chỉ email
     * 
     * @param email Địa chỉ email cần kiểm tra
     * @return true nếu email hợp lệ, false nếu không hợp lệ
     */
    public static boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }

    /**
     * Kiểm tra tính hợp lệ của số điện thoại Việt Nam
     * 
     * @param phoneNumber Số điện thoại cần kiểm tra
     * @return true nếu số điện thoại hợp lệ, false nếu không hợp lệ
     */
    public static boolean isValidVietnamesePhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return false;
        }
        return VIETNAM_PHONE_PATTERN.matcher(phoneNumber).matches();
    }

    /**
     * Kiểm tra tính hợp lệ của số điện thoại quốc tế
     * 
     * @param phoneNumber Số điện thoại cần kiểm tra
     * @return true nếu số điện thoại hợp lệ, false nếu không hợp lệ
     */
    public static boolean isValidInternationalPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return false;
        }
        return INTERNATIONAL_PHONE_PATTERN.matcher(phoneNumber).matches();
    }

    /**
     * Kiểm tra tính hợp lệ của số điện thoại (cả định dạng Việt Nam và quốc tế)
     * 
     * @param phoneNumber Số điện thoại cần kiểm tra
     * @return true nếu số điện thoại hợp lệ, false nếu không hợp lệ
     */
    public static boolean isValidPhoneNumber(String phoneNumber) {
        return isValidVietnamesePhoneNumber(phoneNumber) || 
               isValidInternationalPhoneNumber(phoneNumber);
    }
}