package com.kir.homerentalsystem.util;

import java.security.SecureRandom;

public class OtpCodeUtil {
    public static String generateOtpCode() {
        SecureRandom random = new SecureRandom();
        return String.format("%06d", random.nextInt(1_000_000));
    }
}
