package com.sajumon.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter @Setter
public class SajuRequest {
    private String name;
    private String birthDate;
    private String category;
    private List<String> answers; // 질문 6개에 대한 답변 리스트
}