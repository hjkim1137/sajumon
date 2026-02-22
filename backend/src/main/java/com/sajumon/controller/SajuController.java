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

            // 1. 생년월일(YYYY-MM-DD)에서 연도 추출
            int birthYear = 2000; // 기본값 설정
            if (request.getBirthDate() != null && request.getBirthDate().length() >= 4) {
                birthYear = Integer.parseInt(request.getBirthDate().substring(0, 4));
            }

            // 2. 유틸리티를 사용하여 실제 띠 계산
            String animal = com.sajumon.util.ZodiacUtils.getZodiacAnimal(birthYear);

            // 3. 테마 가져오기
            String selectedTheme = request.getTheme() != null ? request.getTheme() : "love";

            // 4. 이미지 생성 호출
            String imageUrl = sajuService.generateSajuImage(animal, selectedTheme);

            Map<String, String> response = new HashMap<>();
            response.put("text", textResult);
            response.put("imageUrl", imageUrl);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "띠 계산 또는 이미지 생성 중 오류: " + e.getMessage()));
        }
    }
}