package com.kir.homerentalsystem.util;

/**
 * Utility class for converting numbers into their Vietnamese verbal representation.
 * <p>
 * This class provides methods to convert positive long numbers into
 * Vietnamese words, commonly used for displaying monetary values or counts.
 * </p>
 *
 * @author TrungTH
 * @see <a href="https://github.com/thieutrung2k3">Number to words</a>
 */
public class NumberUtil {

    /**
     * Array of Vietnamese unit names for thousands, millions, billions, etc.
     */
    private static final String[] UNITS = {"nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ", "tỷ tỷ"};

    /**
     * Array of Vietnamese words for numbers from 0 to 10.
     */
    private static final String[] NUMBER_WORDS = {"không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"};

    /**
     * Converts a number (up to 999) to its Vietnamese word representation.
     * This method handles numbers from 0 to 999 and returns the Vietnamese language
     * representation of that number.
     *
     * @param temp The number to convert (should be between 0 and 999)
     * @return A string representing the given number in Vietnamese words
     *
     * Examples:
     * - 5 → "năm"
     * - 15 → "mười năm"
     * - 105 → "một trăm linh năm"
     * - 235 → "hai trăm ba mươi năm"
     */
    private static String readNumberHundred(long temp){
        StringBuilder result = new StringBuilder();
        if (temp < 100) {
            result.insert(0, (temp / 10 != 0 ? (temp / 10 == 1 ? "mười" : NUMBER_WORDS[(int)temp / 10])  + " " : "")
                    + (temp % 10 != 0 ? NUMBER_WORDS[(int)temp % 10] : ""));
        } else {
            int v3 = (int)temp / 100;
            int v2 = (int)(temp % 100) / 10;
            int v1 = (int)temp % 10;
            result.insert(0, NUMBER_WORDS[v3] + " trăm"
                    + (v2 != 0 ? " " + NUMBER_WORDS[v2] + " mươi" : "")
                    +(v1 != 0 && v2 == 0 ? " linh" : "")
                    + ( v1 != 0 ? " " + NUMBER_WORDS[v1] : ""));
        }
        return result.toString();
    }

    /**
     * Converts any long integer to its Vietnamese word representation.
     * This method breaks down large numbers into groups of thousands and applies
     * the appropriate Vietnamese units (nghìn, triệu, tỷ, etc.) to each group.
     *
     * The method handles large numbers by breaking them down into groups of 3 digits,
     * converting each group to words and adding the appropriate unit suffix.
     *
     * @param num The number to convert to Vietnamese words
     * @return A string representing the given number in Vietnamese words
     *
     * Examples:
     * - 1,000 → "một nghìn"
     * - 1,500,000 → "một triệu năm trăm nghìn"
     * - 1,234,567,890 → "một tỷ hai trăm ba mươi bốn triệu năm trăm sáu mươi bảy nghìn tám trăm chín mươi"
     *
     * Note: The current implementation handles numbers up to the "tỷ tỷ" unit (10^24).
     * For extremely large numbers beyond the UNITS array capacity, the conversion may be incomplete.
     */
    public static String readNumberByVietnamese(long num) {
        //1.500.200
        StringBuilder result = new StringBuilder();
        long divide = num;
        int i = 0;
        while (divide != 0) {
            long temp = divide % 1000;
            result.insert(0, readNumberHundred(temp) + " ");

            divide = divide / 1000;
            if (divide < 1000 && i < UNITS.length) {
                result.insert(0, readNumberHundred(divide) + " " + UNITS[i] + " ");
                break;
            }
            if(temp != 0)
                result.insert(0, UNITS[i] + " ");

            if(i < UNITS.length - 1) {
                i++;
            }
        }
        return result.toString().trim();
    }
}
