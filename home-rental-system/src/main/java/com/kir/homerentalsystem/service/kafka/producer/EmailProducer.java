package com.kir.homerentalsystem.service.kafka.producer;

import com.kir.homerentalsystem.dto.request.SendSimpleEmailRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topics.otp}")
    private String otpTopic;

    public void sendOtpEmail(SendSimpleEmailRequest request){
        kafkaTemplate.send(otpTopic, request);
    }
}
