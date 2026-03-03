package com.sajumon.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class SajuRequest {
    private String name;
    private String birthDate;
    private String birthTime;
    private String gender;
    private String theme;
    private List<String> answers;
}