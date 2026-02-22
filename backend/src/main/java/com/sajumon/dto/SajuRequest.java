package com.sajumon.dto;

import lombok.Data;
import java.util.List;

@Data // 이 어노테이션이 있으면 getTheme()를 자동으로 만들어줍니다.
public class SajuRequest {
    private String name;
    private String birthDate;
    private List<String> answers;
    private String theme;
}