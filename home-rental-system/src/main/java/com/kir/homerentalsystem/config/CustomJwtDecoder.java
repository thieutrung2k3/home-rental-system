package com.kir.homerentalsystem.config;

import com.kir.homerentalsystem.dto.request.ValidateTokenRequest;
import com.kir.homerentalsystem.dto.response.ValidateTokenResponse;
import com.kir.homerentalsystem.service.AuthService;
import com.nimbusds.jose.JOSEException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.text.ParseException;
import java.util.Objects;

@Slf4j
@Component
public class CustomJwtDecoder implements JwtDecoder {
    private final AuthService authenticationService;

    public CustomJwtDecoder(@Lazy AuthService authenticationService) {
        this.authenticationService = authenticationService;
    }


    private NimbusJwtDecoder nimbusJwtDecoder = null;

    @Value("${jwt.signerKey}")
    private String signerKey;

    @Override
    public Jwt decode(String token) {
        log.info("Validating token: " + token);
        ValidateTokenResponse response = authenticationService.validateToken(ValidateTokenRequest.builder()
                .token(token)
                .build());
        log.info("Token validation response: " + response.isValid());
        if (!response.isValid()) throw new JwtException("Token invalid");
        if(Objects.isNull(nimbusJwtDecoder)){
            SecretKeySpec spec = new SecretKeySpec((signerKey.getBytes()), "HS256");
            nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(spec).macAlgorithm(MacAlgorithm.HS256).build();
        }
        Jwt jwt = nimbusJwtDecoder.decode(token);
        log.info("Subject: " + jwt.getSubject());
        return jwt;
    }
}
