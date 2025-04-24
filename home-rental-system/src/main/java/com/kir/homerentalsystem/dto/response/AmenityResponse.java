package com.kir.homerentalsystem.dto.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AmenityResponse {
    private Long amenityId;
    private String name;
    private String imageUrl;
    private String description;
}
