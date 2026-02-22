package com.sajumon.controller;

import com.sajumon.dto.SajuRequest;
import com.sajumon.service.SajuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/saju")
@RequiredArgsConstructor
public class SajuController {

    private final SajuService sajuService;

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeSaju(@RequestBody SajuRequest request) {
        try {
            // 1. GPT 분석 결과 가져오기
            Map<String, Object> result = sajuService.analyzeSaju(request);

            // 2. 응답용 새 Map 생성 (구조를 단순하게 만듦)
            Map<String, Object> response = new HashMap<>();

            // 3. 이미지 매핑에 필요한 값을 최상위에 강제 주입
            // 만약 result 안에 animal이 있다면 가져오고, 없으면 sajuAnalysis 안에서 꺼냄
            String animal = (String) result.getOrDefault("animal", "dog");
            if (result.containsKey("sajuAnalysis")) {
                Map<String, Object> analysis = (Map<String, Object>) result.get("sajuAnalysis");
                animal = (String) analysis.getOrDefault("animal", animal);
            }

            response.put("animal", animal);
            response.put("theme", request.getTheme()); // 프론트에서 보낸 테마 그대로 사용

            // 4. 나머지 GPT 응답 내용도 합치기
            response.putAll(result);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}