package com.sajumon.service;

import com.sajumon.dto.SajuRequest;
import com.sajumon.util.DayPillarCalculator;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class SajuService {

    public Map<String, Object> analyzeSaju(SajuRequest request) {
        System.out.println("분석 요청: 날짜=" + request.getBirthDate()
                + ", 시간=" + request.getBirthTime()
                + ", 테마=" + request.getTheme());

        try {
            // 만세력 알고리즘 기반 일주 계산 (GPT 대신 정확한 수학적 계산)
            Map<String, String> pillar = DayPillarCalculator.calculate(
                    request.getBirthDate(),
                    request.getBirthTime()
            );

            String ilju = pillar.get("ilju");
            String animal = pillar.get("animal");

            System.out.println("일주 계산 결과: ilju=" + ilju + ", animal=" + animal);

            Map<String, Object> result = new HashMap<>();
            result.put("ilju", ilju);
            result.put("animal", animal);
            result.put("title", "운명의"); // 프론트엔드에서 getRandomModifier로 재생성됨
            return result;
        } catch (Exception e) {
            System.err.println("일주 계산 중 에러 발생: " + e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("ilju", "갑자");
            fallback.put("animal", "rat");
            fallback.put("title", "운명의");
            return fallback;
        }
    }
}