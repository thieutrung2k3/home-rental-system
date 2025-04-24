package com.kir.homerentalsystem.service.kafka.consumer;

import com.kir.homerentalsystem.dto.request.SendSimpleEmailRequest;
import com.kir.homerentalsystem.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailConsumer {
    private final EmailService emailService;
    
    @Value("${kafka.topics.otp}")
    private String otpTopic;

    @KafkaListener(topics = "${kafka.topics.otp}", groupId = "renHome")
    public void sendOtpEmail(SendSimpleEmailRequest request){
        emailService.sendSimpleEmail(request.getTo(), request.getSubject(), request.getText());
    }
}