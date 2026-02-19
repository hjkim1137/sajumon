package com.sajumon.service;

import com.sajumon.dto.SajuRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class SajuService {

    private final String apiKey;
    private final String apiUrl;
    private final RestTemplate restTemplate;

    // 생성자를 통해 설정 파일의 값을 주입받음
    public SajuService(
            @Value("${openai.api.key}") String apiKey,
            @Value("${openai.api.url}") String apiUrl) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.restTemplate = new RestTemplate();
    }

    public String analyzeSaju(SajuRequest request) {
        RestTemplate restTemplate = new RestTemplate();

        // 1. 프롬프트 구성 (사주 전문가처럼 행동하도록 지시)
        String systemRole = "당신은 전문 사주풀이 도사입니다. 사용자의 정보와 질문 답변을 바탕으로 올해의 운세를 친절하고 위트 있게 풀이해주세요.";
        String userContent = String.format(
                "이름: %s, 생년월일: %s, 선택한 성향: %s. 이 데이터를 바탕으로 사주 풀이를 해주세요.",
                request.getName(), request.getBirthDate(), request.getAnswers().toString()
        );

        // 2. OpenAI 형식에 맞게 요청 바디 생성
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-4o-mini"); // 가성비 좋은 모델
        requestBody.put("messages", Arrays.asList(
                Map.of("role", "system", "content", systemRole),
                Map.of("role", "user", "content", userContent)
        ));

        // 3. 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            // 4. API 호출 및 응답 처리
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");

            return (String) message.get("content");
        } catch (Exception e) {
            return "AI 분석 중 오류가 발생했습니다: " + e.getMessage();
        }
    }

    // SajuService.java 내부의 메서드
    public String generateSajuImage(String animal, String theme, String object) {
        // 1. 템플릿에 값 채워넣기
        String finalPrompt = String.format(DumbImagePrompt.TEMPLATE, animal, theme, object);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        // 2. DALL-E API 요청 구성
        Map<String, Object> body = new HashMap<>();
        body.put("model", "dall-e-3");
        body.put("prompt", finalPrompt);
        body.put("n", 1);
        body.put("size", "1024x1024");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            // 이미지 생성 API URL은 chat이 아니라 images/generations 입니다.
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/images/generations",
                    entity,
                    Map.class
            );

            List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");
            return (String) data.get(0).get("url");
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}