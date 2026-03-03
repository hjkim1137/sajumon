package com.sajumon.controller;

import com.sajumon.dto.SajuRequest;
import com.sajumon.service.SajuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/saju")
@RequiredArgsConstructor
public class SajuController {

    private final SajuService sajuService;

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeSaju(@RequestBody SajuRequest request) {
        try {
            Map<String, Object> result = sajuService.analyzeSaju(request);
            result.put("theme", request.getTheme());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
