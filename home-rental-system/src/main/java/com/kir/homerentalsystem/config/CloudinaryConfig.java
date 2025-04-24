package com.kir.homerentalsystem.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import io.netty.util.internal.ObjectUtil;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary(){
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dqrdafw9n",
                "api_key", "667491699163635",
                "api_secret", "UvnjPAhcRABZ6L7J5pwAKykfIrA"
        ));
    }
}
