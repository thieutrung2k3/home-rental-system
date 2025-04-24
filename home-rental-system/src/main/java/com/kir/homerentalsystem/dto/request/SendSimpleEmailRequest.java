package com.kir.homerentalsystem.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SendSimpleEmailRequest {
    private String to;
    private String subject;
    private String text;
}
