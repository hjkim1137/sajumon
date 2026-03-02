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
        // 로그 확인용
        System.out.println("분석 요청: 날짜=" + request.getBirthDate() + ", 시간=" + request.getBirthTime() + ", 테마=" + request.getTheme());

        // 1. 시스템 역할 정의 (만세력 계산기 역할 부여)
        String systemRole = "당신은 한국의 정통 명리학 전문가이자 만세력 계산기입니다. " +
                "사용자의 생년월일시(양력 기준)를 바탕으로 정확한 '일주(日柱)'를 계산하는 것이 가장 중요한 임무입니다.";

        // 2. 프롬프트 강화 (계산 로직 유도 및 출력 형식 고정)
        String userContent = String.format(
                "사용자 정보: 생년월일 %s, 태어난 시간 %s, 관심 테마 %s\n\n" +
                        "### 필수 작업 단계 ###\n" +
                        "1. 입력된 %s(YYYYMMDD)를 연/월/일로 분리하세요.\n" +
                        "2. 해당 날짜의 '일주(日柱)' 육십갑자(예: 甲子, 乙亥 등)를 만세력 기준으로 정확히 도출하세요.\n" +
                        "3. 도출된 일주의 지지(地支)에 해당하는 동물(십이지신)을 영문으로 결정하세요.\n" +
                        "   (rat, ox, tiger, rabbit, dragon, snake, horse, sheep, monkey, rooster, dog, pig)\n\n" +
                        "### 응답 규칙 ###\n" +
                        "- 모든 응답은 반드시 JSON 형식이어야 합니다.\n" +
                        "- 'ilju' 키값에는 반드시 '갑자', '을해'와 같은 한글 명칭만 넣으세요.\n" +
                        "- 'animal' 키값에는 위의 영문 동물명 중 하나만 넣으세요.\n\n" +
                        "JSON 예시:\n" +
                        "{\n" +
                        "  \"ilju\": \"갑자\",\n" +
                        "  \"animal\": \"rat\",\n" +
                        "  \"title\": \"수식어\"\n" +
                        "}",
                request.getBirthDate(), request.getBirthTime(), request.getTheme(), request.getBirthDate()
        );

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-4o-mini"); // 정확도가 너무 낮다면 gpt-4o 권장
        requestBody.put("messages", Arrays.asList(
                Map.of("role", "system", "content", systemRole),
                Map.of("role", "user", "content", userContent)
        ));
        requestBody.put("response_format", Map.of("type", "json_object"));
        requestBody.put("temperature", 0.3); // 일관된 계산을 위해 낮은 온도 설정

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);

            Map<String, Object> responseBody = response.getBody();
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            String content = (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");

            System.out.println("GPT 최종 응답: " + content);

            return objectMapper.readValue(content, Map.class);
        } catch (Exception e) {
            System.err.println("분석 중 에러 발생: " + e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("ilju", "갑자"); // 최소한의 기본값 설정
            fallback.put("animal", "dog");
            fallback.put("title", "운명의");
            return fallback;
        }
    }
}