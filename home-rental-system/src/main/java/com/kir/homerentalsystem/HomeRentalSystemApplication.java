package com.kir.homerentalsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HomeRentalSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(HomeRentalSystemApplication.class, args);
    }

}
