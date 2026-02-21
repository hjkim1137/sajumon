package com.sajumon.service;

import org.springframework.stereotype.Component;

@Component
public class DumbImagePrompt {

    // 1. 공통적인 스타일 템플릿 (변하지 않는 부분)
    private static final String BASE_TEMPLATE = """
        Create a tiny low-resolution MS Paint pixel doodle of a %s,
        like a badly upscaled 32x32 internet sticker.
        
        IMPORTANT COLOR RULES:
        - The animal must be ONLY black outline on white.
        - NO body color fill.
        - NO animal-specific colors (no brown, gray, orange, etc.).
        - Outline-only, like a coloring book drawing.
        
        FACE DESIGN:
        - The %s has a blank, deadpan face: two dot eyes and a straight line mouth.
        
        DECORATION / PROP:
        %s
        
        Flat white background.
        Looks like a corrupted pixel emoji, badly scaled up.
        """;

    /**
     * 동물과 테마를 받아 최종 프롬프트를 생성합니다.
     */
    public String generate(String animal, String theme) {
        String propDescription = createPropDescription(animal, theme);
        // %s 순서: 동물 이름, 동물 이름, 소품 묘사
        return String.format(BASE_TEMPLATE, animal, animal, propDescription);
    }

    /**
     * 테마에 따른 소품 묘사 로직을 분리하여 유지보수를 편리하게 합니다.
     */
    private String createPropDescription(String animal, String theme) {
        String prop;
        boolean isWearing = false;

        switch (theme.toLowerCase()) {
            case "health", "건강운" -> prop = "a tiny gray dumbbell";
            case "career", "커리어운" -> prop = "a flat colored necktie";
            case "money", "금전운" -> prop = "a flat green money bill";
            case "love", "연애운" -> prop = "a flat red heart";
            case "study", "학업운" -> {
                prop = "a simple flat graduation cap";
                isWearing = true; // 학업운만 '착용' 상태로 설정
            }
            default -> prop = "a small star";
        }

        if (isWearing) {
            return String.format(
                    "- The %s is wearing %s on its head.\n- The %s is the ONLY colored element flat navy.",
                    animal, prop, prop
            );
        } else {
            return String.format(
                    "- The %s is holding %s.\n- The %s is the ONLY colored element.",
                    animal, prop, prop
            );
        }
    }
}