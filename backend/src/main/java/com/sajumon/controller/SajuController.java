package com.sajumon.controller;

import com.sajumon.dto.SajuRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/saju")
@CrossOrigin(origins = "http://localhost:3000") // 프론트엔드 접속 허용
public class SajuController {

    @PostMapping("/analyze")
    public String analyzeSaju(@RequestBody SajuRequest request) {
        // 우선 데이터가 잘 오는지 확인용 로그
        System.out.println("받은 이름: " + request.getName());
        System.out.println("선택한 답변들: " + request.getAnswers());

        return "백엔드 데이터 수신 완료! 이제 AI 분석을 시작할 수 있습니다.";
    }
}