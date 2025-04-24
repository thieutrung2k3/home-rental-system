package com.kir.homerentalsystem.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PropertyImageResponse {
    private Long imageId;
    private String imageUrl;
    private Boolean isPrimary;
    private LocalDateTime uploadDate;
}
