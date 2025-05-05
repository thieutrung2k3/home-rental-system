package com.kir.homerentalsystem.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PAVResponse {
    private String name;
    private String value;
}
