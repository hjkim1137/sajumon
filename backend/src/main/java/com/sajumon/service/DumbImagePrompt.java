package com.sajumon.service;

import org.springframework.stereotype.Component;

@Component
public class DumbImagePrompt {

    private static final String BASE_TEMPLATE = """
        A very simple, clean 2D pixel art illustration of a %s.
        Style: Minimalist MS Paint doodle, primitive digital drawing.

        CRITICAL RULES:
        - **Pure white background.**
        - **Solid black outlines only for the animal.** No gray, no shading, no gradients.
        - The animal must have an extremely simple, expressionless face: two small dot eyes and a single straight line for a mouth.
        - **Clear and recognizable silhouette.** No blurry pixels, no messy noise.
        - Drawing style should look like a careless mouse-drawn sketch, but the shape must be distinct.

        THEME OBJECT:
        - The animal is %s a %s.
        - The %s is the ONLY colored element in the entire image.
        - Color: Single flat %s color. Careless fill, but no blurry edges.
        - Placement: %s, awkwardly positioned.

        NEGATIVE PROMPT:
        blurry, low quality, distorted, messy pixels, noise, shading, 3D, realistic, artistic, colorful animal, background, text, borders.
        """;

    public String generate(String animal, String theme) {
        String propDescription = createPropDescription(animal, theme);
        return String.format(BASE_TEMPLATE, animal, propDescription.split("\\|")[0], propDescription.split("\\|")[1], propDescription.split("\\|")[1], propDescription.split("\\|")[2], propDescription.split("\\|")[3]);
    }

    private String createPropDescription(String animal, String theme) {
        String prop;
        String action;
        String color;
        String placement;

        switch (theme.toLowerCase()) {
            case "health", "건강운" -> { prop = "dumbbell"; color = "gray"; action = "holding"; placement = "in its hand"; }
            case "career", "커리어운" -> { prop = "necktie"; color = "blue"; action = "holding"; placement = "in its hand"; }
            case "money", "금전운" -> { prop = "money bill"; color = "green"; action = "holding"; placement = "in its hand"; }
            case "love", "연애운" -> { prop = "heart"; color = "red"; action = "holding"; placement = "in its hand"; }
            case "study", "학업운" -> { prop = "graduation cap"; color = "navy"; action = "wearing"; placement = "on its head"; }
            default -> { prop = "star"; color = "yellow"; action = "holding"; placement = "in its hand"; }
        }

        // 포맷팅을 위해 데이터를 파이프(|)로 묶어서 반환
        return String.format("%s|%s|%s|%s", action, prop, color, placement);
    }
}