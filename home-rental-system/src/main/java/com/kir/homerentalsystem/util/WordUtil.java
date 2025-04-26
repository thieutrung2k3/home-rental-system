package com.kir.homerentalsystem.util;

import com.kir.homerentalsystem.entity.Account;
import com.kir.homerentalsystem.entity.Lease;
import com.kir.homerentalsystem.exception.AppException;
import com.kir.homerentalsystem.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.format.datetime.DateFormatter;
import org.springframework.util.StringUtils;
import org.springframework.core.io.Resource;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
public class WordUtil {

    public static ByteArrayInputStream fillTemplate(Lease lease) {
        // Khởi tạo document từ template
        XWPFDocument document;
        ClassPathResource templateResource = new ClassPathResource("templates/lease_template.docx");
        try {
            if (!templateResource.exists()) {
                log.info("Template not found: {}", templateResource.getFilename());
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
            }

            try (InputStream is = templateResource.getInputStream()) {
                document = new XWPFDocument(is);
            }
        } catch (IOException e) {
            log.error("Failed to load template: {}", templateResource.getFilename(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        try {
            // Tạo map các placeholder và giá trị tương ứng
            Map<String, String> placeholders = createPlaceholderMap(lease);

            // Thay thế placeholder trong paragraphs
            for (XWPFParagraph paragraph : document.getParagraphs()) {
                replacePlaceholdersInParagraph(paragraph, placeholders);
            }

            // Thay thế placeholder trong tables
            for (XWPFTable table : document.getTables()) {
                for (XWPFTableRow row : table.getRows()) {
                    for (XWPFTableCell cell : row.getTableCells()) {
                        for (XWPFParagraph paragraph : cell.getParagraphs()) {
                            replacePlaceholdersInParagraph(paragraph, placeholders);
                        }
                    }
                }
            }

            // Thay thế placeholder trong header
            for (XWPFHeader header : document.getHeaderList()) {
                for (XWPFParagraph paragraph : header.getParagraphs()) {
                    replacePlaceholdersInParagraph(paragraph, placeholders);
                }
                for (XWPFTable table : header.getTables()) {
                    for (XWPFTableRow row : table.getRows()) {
                        for (XWPFTableCell cell : row.getTableCells()) {
                            for (XWPFParagraph paragraph : cell.getParagraphs()) {
                                replacePlaceholdersInParagraph(paragraph, placeholders);
                            }
                        }
                    }
                }
            }

            // Thay thế placeholder trong footer
            for (XWPFFooter footer : document.getFooterList()) {
                for (XWPFParagraph paragraph : footer.getParagraphs()) {
                    replacePlaceholdersInParagraph(paragraph, placeholders);
                }
                for (XWPFTable table : footer.getTables()) {
                    for (XWPFTableRow row : table.getRows()) {
                        for (XWPFTableCell cell : row.getTableCells()) {
                            for (XWPFParagraph paragraph : cell.getParagraphs()) {
                                replacePlaceholdersInParagraph(paragraph, placeholders);
                            }
                        }
                    }
                }
            }

            // Lưu document vào ByteArrayOutputStream
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.write(baos);
            document.close();

            return new ByteArrayInputStream(baos.toByteArray());
        } catch (IOException e) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }
    public static Map<String, String> createPlaceholderMap(Lease lease) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        Map<String, String> placeholderMap = new HashMap<>();

        LocalDateTime startDate = lease.getCreatedAt();
        placeholderMap.put("${START_DAY}", "15");
        placeholderMap.put("${START_MONTH}", "5");
        placeholderMap.put("${START_YEAR}", "2025");

        String firstName = lease.getTenant().getAccount().getFirstName();
        String lastName = lease.getTenant().getAccount().getLastName();
        placeholderMap.put("${TENANT_NAME}", lastName + " " + firstName);
        placeholderMap.put(("${ID_NUMBER}"), lease.getTenant().getAccount().getIdNumber());
        placeholderMap.put("${ISSUED_BY}", lease.getTenant().getAccount().getIssuedBy());
        placeholderMap.put("${ISSUE_DATE}", formatter.format(lease.getTenant().getAccount().getIssueDate()));
        placeholderMap.put("${PERMANENT_ADDRESS}", lease.getTenant().getAccount().getPermanentAddress());

        firstName = lease.getProperty().getOwner().getAccount().getFirstName();
        lastName = lease.getProperty().getOwner().getAccount().getLastName();
        placeholderMap.put("${OWNER_NAME_OWNER}", lastName + " " + firstName);
        placeholderMap.put(("${ID_NUMBER_OWNER}"), lease.getProperty().getOwner().getAccount().getIdNumber());
        placeholderMap.put("${ISSUED_BY_OWNER}", lease.getProperty().getOwner().getAccount().getIssuedBy());
        placeholderMap.put("${ISSUE_DATE_OWNER}", formatter.format(lease.getProperty().getOwner().getAccount().getIssueDate()));
        placeholderMap.put("${PERMANENT_ADDRESS_OWNER}", lease.getProperty().getOwner().getAccount().getPermanentAddress());

        placeholderMap.put("${ADDRESS_PROPERTY}", lease.getProperty().getAddress());
//        placeholderMap.put("${AREA}", String.valueOf(lease.getProperty().getArea()));

        placeholderMap.put("${START_DATE}", lease.getStartDate().format(formatter));
        placeholderMap.put("${END_DATE}", lease.getEndDate().format(formatter));

        placeholderMap.put("${DEPOSIT_SECURITY}", String.valueOf(lease.getSecurityDeposit()));
        placeholderMap.put("${MONTHLY_RENT}", String.valueOf(lease.getMonthlyRent()));

        return placeholderMap;
    }

    public static void replacePlaceholdersInParagraph(XWPFParagraph paragraph, Map<String, String> placeholders) {
        String paragraphText = paragraph.getText();
        if (StringUtils.hasText(paragraphText)) {
            for (Map.Entry<String, String> entry : placeholders.entrySet()) {
                if (paragraphText.contains(entry.getKey()) && entry.getValue() != null) {
                    List<XWPFRun> runs = paragraph.getRuns();

                    // Tìm và thay thế các placeholders trong từng run
                    TextSegment foundSegment = paragraph.searchText(entry.getKey(), new PositionInParagraph());
                    if (foundSegment != null) {
                        // Lấy vị trí run bắt đầu và kết thúc của placeholder
                        int beginRun = foundSegment.getBeginRun();
                        int endRun = foundSegment.getEndRun();

                        if (beginRun == endRun) {
                            // Placeholder nằm trong một run
                            XWPFRun run = runs.get(beginRun);
                            String text = run.getText(0);
                            if (text != null) {
                                text = text.replace(entry.getKey(), entry.getValue());
                                run.setText(text, 0);
                            }
                        } else {
                            // Placeholder nằm trên nhiều run
                            // Đặt giá trị mới vào run đầu tiên
                            XWPFRun firstRun = runs.get(beginRun);
                            String text = firstRun.getText(0);
                            if (text != null) {
                                int beginIndex = text.indexOf(entry.getKey().substring(0, Math.min(entry.getKey().length(), text.length())));
                                if (beginIndex >= 0) {
                                    text = text.substring(0, beginIndex) + entry.getValue();
                                    firstRun.setText(text, 0);
                                }
                            }

                            // Xóa phần placeholder trong các run tiếp theo
                            for (int i = beginRun + 1; i <= endRun; i++) {
                                XWPFRun run = runs.get(i);
                                run.setText("", 0);
                            }
                        }
                    }
                }
            }
        }
    }
}
