package com.kir.homerentalsystem.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AmenityRequest {
    private Long amenityId;
    private String name;
    private String description;
}
