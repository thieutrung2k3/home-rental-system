package com.kir.homerentalsystem.mapper;

import com.kir.homerentalsystem.dto.response.LeaseResponse;
import com.kir.homerentalsystem.entity.Lease;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LeaseMapper {
    LeaseResponse toLeaseResponse(Lease lease);
}
