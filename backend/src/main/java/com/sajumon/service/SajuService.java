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
    private final DumbImagePrompt dumbImagePrompt; // 주입 추가

    // 생성자를 통해 설정 파일의 값을 주입받고, 필요한 객체를 초기화합니다.
    public SajuService(
            @Value("${openai.api.key}") String apiKey,
            @Value("${openai.api.url}") String apiUrl,
            DumbImagePrompt dumbImagePrompt) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.dumbImagePrompt = dumbImagePrompt;
        this.restTemplate = new RestTemplate(); // 매번 새로 생성하지 않고 필드에 저장하여 재사용합니다.
    }

    /**
     * 사용자의 사주 데이터를 분석하여 텍스트 운세를 반환합니다.
     */
    public String analyzeSaju(SajuRequest request) {
        // 1. 프롬프트 구성
        String systemRole = "당신은 전문 사주풀이 도사입니다. 사용자의 정보와 질문 답변을 바탕으로 올해의 운세를 친절하고 위트 있게 풀이해주세요.";
        String userContent = String.format(
                "이름: %s, 생년월일: %s, 선택한 성향: %s. 이 데이터를 바탕으로 사주 풀이를 해주세요.",
                request.getName(), request.getBirthDate(), request.getAnswers().toString()
        );

        // 2. OpenAI 형식에 맞게 요청 바디 생성
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-4o-mini");
        requestBody.put("messages", Arrays.asList(
                Map.of("role", "system", "content", systemRole),
                Map.of("role", "user", "content", userContent)
        ));

        // 3. 공통 헤더 설정
        HttpHeaders headers = createHeaders();
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            // 4. API 호출
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");

            return (String) message.get("content");
        } catch (Exception e) {
            return "AI 분석 중 오류가 발생했습니다: " + e.getMessage();
        }
    }

    /**
     * 테마와 동물에 맞는 이미지를 생성하여 URL을 반환합니다.
     */
    public String generateSajuImage(String animal, String theme) {
        // 1. DumbImagePrompt를 통해 로직이 포함된 프롬프트 생성
        String finalPrompt = dumbImagePrompt.generate(animal, theme);

        // 2. DALL-E API 요청 구성
        Map<String, Object> body = new HashMap<>();
        body.put("model", "dall-e-3");
        body.put("prompt", finalPrompt);
        body.put("n", 1);
        body.put("size", "1024x1024");

        HttpHeaders headers = createHeaders();
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            // 이미지 생성 API 전용 URL 사용
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

    /**
     * OpenAI API 호출을 위한 공통 헤더 생성 메서드
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        return headers;
    }
}