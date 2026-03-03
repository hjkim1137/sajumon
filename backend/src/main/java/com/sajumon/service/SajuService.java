package com.sajumon.service;

import com.sajumon.dto.SajuRequest;
import com.sajumon.util.DayPillarCalculator;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class SajuService {

    public Map<String, Object> analyzeSaju(SajuRequest request) {
        try {
            Map<String, String> pillar = DayPillarCalculator.calculate(
                    request.getBirthDate(),
                    request.getBirthTime()
            );

            Map<String, Object> result = new HashMap<>();
            result.put("ilju", pillar.get("ilju"));
            result.put("animal", pillar.get("animal"));
            return result;
        } catch (Exception e) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("ilju", "갑자");
            fallback.put("animal", "rat");
            return fallback;
        }
    }
}
