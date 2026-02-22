package com.sajumon.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class SajuRequest {
    private String name;
    private String birthDate; // YYYY-MM-DD
    private String birthTime; // HH:mm
    private String gender;
    private String theme;     // 추가: love, money, work 등
    private List<String> answers; // 질문 답변들
}