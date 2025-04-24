package com.kir.homerentalsystem.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.List;

@Slf4j
@Component
public class AuthChannelInterceptor implements ChannelInterceptor {
    @Autowired
    private CustomJwtDecoder customJwtDecoder;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> tokens = accessor.getNativeHeader("token");
            if (tokens != null && !tokens.isEmpty()) {
                String token = tokens.get(0);
                Jwt jwt = customJwtDecoder.decode(token);
                accessor.setUser(() -> jwt.getSubject());
            } else {
                log.warn("No token found in headers");
                throw new IllegalArgumentException("Missing token in STOMP headers");
            }
        }
        return message;
    }

}
