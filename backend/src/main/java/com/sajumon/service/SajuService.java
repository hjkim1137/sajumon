package com.sajumon.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper;

    public SajuService(@Value("${openai.api.key}") String apiKey,
                       @Value("${openai.api.url}") String apiUrl) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, Object> analyzeSaju(SajuRequest request) {
        // 1. 데이터 검증 (로그를 찍어서 서버 터미널에서 확인해보세요)
        System.out.println("분석 요청 데이터: " + request.getBirthDate() + ", " + request.getBirthTime() + ", " + request.getTheme());

        // 2. 프롬프트 보강 (반드시 예측해서라도 답하라고 지시)
        String systemRole = "당신은 만세력 전문가입니다. 입력된 생년월일시가 숫자로만 되어있어도(예:19950505) 연/월/일로 해석하여 일주 동물을 판별하세요. " +
                "정보가 조금 부족해도 사주 명리학에 근거하여 가장 유사한 결과를 반드시 도출해야 합니다.";

        String userContent = String.format(
                "사용자 정보: 생일 %s, 시간 %s, 테마 %s.\n\n" +
                        "### 지시 사항 ###\n" +
                        "응답은 반드시 아래의 '평면적인(Flat) JSON' 형식으로만 하세요. 객체 안에 객체를 넣지 마세요.\n" +
                        "{\n" +
                        "  \"animal\": \"(반드시 영어 소문자)\",\n" +
                        "  \"title\": \"...\",\n" +
                        "  \"speechText\": \"...\",\n" +
                        "  \"interpret\": \"...\",\n" +
                        "  \"effect\": \"...\"\n" +
                        "}",
                request.getBirthDate(), request.getBirthTime(), request.getTheme()
        );

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-4o-mini");
        requestBody.put("messages", Arrays.asList(
                Map.of("role", "system", "content", systemRole),
                Map.of("role", "user", "content", userContent)
        ));
        requestBody.put("response_format", Map.of("type", "json_object"));

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            String content = (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");

            // GPT 응답이 오면 로그로 먼저 찍어보세요
            System.out.println("GPT 응답 내용: " + content);

            return objectMapper.readValue(content, Map.class);
        } catch (Exception e) {
            // 통신 자체가 실패했을 때의 방어 로직
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("animal", "dragon");
            fallback.put("title", "운명의 부적");
            fallback.put("speechText", "하늘의 기운이 너를 향하고 있다!");
            fallback.put("effect", "모든 능력치 +10");
            return fallback;
        }
    }
}