package com.kir.homerentalsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StatisticsResponse {
    private int rentedPropertyCount;
    private int availablePropertyCount;
    private int totalPropertyCount;
}
