package com.kir.homerentalsystem.util;

import com.kir.homerentalsystem.exception.AppException;
import com.kir.homerentalsystem.exception.ErrorCode;

import java.time.LocalDate;

public class TimeUtil {
    public static LocalDate getLastDateOfMonth(int month){
        if(month >= 1 && month <= 12){
            return LocalDate.of(LocalDate.now().getYear(), month + 1, 1).minusDays(1);
        } else{
            throw new AppException(ErrorCode.TIME_FORMAT_INVALID);
        }
    }

    public static LocalDate getFirstDateOfMonth(int month){
        if(month >= 1 && month <= 12){
            return LocalDate.of(LocalDate.now().getYear(), month, 1);
        } else{
            throw new AppException(ErrorCode.TIME_FORMAT_INVALID);
        }
    }
}
