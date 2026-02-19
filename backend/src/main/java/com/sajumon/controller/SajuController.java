package com.sajumon.controller;

import com.sajumon.dto.SajuRequest;
import com.sajumon.service.SajuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/saju")
@RequiredArgsConstructor

public class SajuController {

    private final SajuService sajuService;

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeSaju(@RequestBody SajuRequest request) {
        try {
            String textResult = sajuService.analyzeSaju(request);

            // 생년월일로부터 띠를 계산하는 로직이 있다고 가정 (예: Pig)
            // 테마와 오브젝트도 질문 결과에 따라 다르게 설정 가능
            String imageUrl = sajuService.generateSajuImage("Pig", "love", "heart");

            Map<String, String> response = new HashMap<>();
            response.put("text", textResult);
            response.put("imageUrl", imageUrl);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}