package com.kir.homerentalsystem.service;

import com.kir.homerentalsystem.constant.AuthEmailType;

public interface EmailService {
    void sendSimpleEmail(String to, String subject, String text);

    void sendEmailWithAttachment(String to, String subject, String text, String attachmentPath, String attachmentName);

    void sendEmailForAuth(String email, AuthEmailType type);

}
