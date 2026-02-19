package com.sajumon.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// dto/ImageRequest.java
@Getter
@Setter
@AllArgsConstructor
public class ImageRequest {
    private String model = "dall-e-3";
    private String prompt;
    private int n = 1;
    private String size = "1024x1024";
}