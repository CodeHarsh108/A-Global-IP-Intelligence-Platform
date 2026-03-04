package com.example.globalipplatform.project.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** One item in the "My IP Assets" list for display. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedIpAssetItemDTO {
    private String type;           // "PATENT" or "TRADEMARK"
    private Long assetId;          // id of Patent or Trademark entity
    private String title;          // patent title or trademark mark/title
    private String applicationNumber;
    private String status;
    private String jurisdiction;
    private LocalDateTime filingDate;
    private LocalDateTime savedAt;
}
