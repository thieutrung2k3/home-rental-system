package com.kir.homerentalsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExportFileResponse {
    private String fileName;
    private String contentType;
    private byte[] data;
}
