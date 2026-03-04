package com.example.globalipplatform.project.controller;

import com.example.globalipplatform.project.DTO.SavedIpAssetItemDTO;
import com.example.globalipplatform.project.entity.User;
import com.example.globalipplatform.project.repository.UserRepository;
import com.example.globalipplatform.project.service.IpAssetStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ip/assets")
@CrossOrigin(origins = "http://localhost:3000")
public class IpAssetController {

    private final IpAssetStorageService ipAssetStorageService;
    private final UserRepository userRepository;

    public IpAssetController(IpAssetStorageService ipAssetStorageService, UserRepository userRepository) {
        this.ipAssetStorageService = ipAssetStorageService;
        this.userRepository = userRepository;
    }

    private Long getCurrentUserId(Authentication auth) {
        if (auth == null || !auth.isAuthenticated())
            throw new RuntimeException("Not authenticated");
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    /** List current user's saved IP assets (patents and trademarks). */
    @GetMapping
    public ResponseEntity<List<SavedIpAssetItemDTO>> listMyAssets(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        return ResponseEntity.ok(ipAssetStorageService.listSaved(userId));
    }

    /** Save a patent or trademark to My IP Assets. Body: { "type": "PATENT"|"TRADEMARK", "assetId": number } */
    @PostMapping("/save")
    public ResponseEntity<?> saveAsset(Authentication authentication, @RequestBody Map<String, Object> body) {
        Long userId = getCurrentUserId(authentication);
        String type = (String) body.get("type");
        Number assetIdNum = (Number) body.get("assetId");
        if (type == null || assetIdNum == null)
            return ResponseEntity.badRequest().body(Map.of("error", "type and assetId are required"));
        long assetId = assetIdNum.longValue();
        try {
            SavedIpAssetItemDTO saved = ipAssetStorageService.save(userId, type, assetId);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Remove a saved patent or trademark. */
    @DeleteMapping("/save/{type}/{assetId}")
    public ResponseEntity<?> removeSavedAsset(Authentication authentication,
                                              @PathVariable String type,
                                              @PathVariable Long assetId) {
        Long userId = getCurrentUserId(authentication);
        try {
            ipAssetStorageService.remove(userId, type, assetId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Check if current user has saved this asset. */
    @GetMapping("/saved/{type}/{assetId}")
    public ResponseEntity<Map<String, Boolean>> checkSaved(Authentication authentication,
                                                            @PathVariable String type,
                                                            @PathVariable Long assetId) {
        Long userId = getCurrentUserId(authentication);
        boolean saved = ipAssetStorageService.isSaved(userId, type, assetId);
        return ResponseEntity.ok(Map.of("saved", saved));
    }
}
