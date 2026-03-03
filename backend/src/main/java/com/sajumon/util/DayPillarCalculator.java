package com.sajumon.util;

import java.util.HashMap;
import java.util.Map;

/**
 * 만세력 기반 일주(日柱) 계산기.
 * Julian Day Number를 이용하여 육십갑자 일주를 정확히 계산한다.
 */
public class DayPillarCalculator {

    private static final String[] HEAVENLY_STEMS = {
            "갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"
    };

    private static final String[] EARTHLY_BRANCHES = {
            "자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"
    };

    private static final String[] ANIMALS = {
            "rat", "ox", "tiger", "rabbit", "dragon", "snake",
            "horse", "goat", "monkey", "rooster", "dog", "pig"
    };

    private static final String[] SIXTY_PILLARS = new String[60];

    static {
        for (int i = 0; i < 60; i++) {
            SIXTY_PILLARS[i] = HEAVENLY_STEMS[i % 10] + EARTHLY_BRANCHES[i % 12];
        }
    }

    public static long calculateJDN(int year, int month, int day) {
        int a = (14 - month) / 12;
        int y = year + 4800 - a;
        int m = month + 12 * a - 3;

        return day
                + (153L * m + 2) / 5
                + 365L * y
                + y / 4
                - y / 100
                + y / 400
                - 32045;
    }

    public static int getDayPillarIndex(int year, int month, int day) {
        long jdn = calculateJDN(year, month, day);
        int index = (int) ((jdn + 49) % 60);
        return index < 0 ? index + 60 : index;
    }

    public static String getDayPillarName(int year, int month, int day) {
        return SIXTY_PILLARS[getDayPillarIndex(year, month, day)];
    }

    public static String getAnimal(int year, int month, int day) {
        int pillarIndex = getDayPillarIndex(year, month, day);
        int branchIndex = pillarIndex % 12;
        return ANIMALS[branchIndex];
    }

    public static Map<String, String> calculate(String birthDate, String birthTime) {
        int year = Integer.parseInt(birthDate.substring(0, 4));
        int month = Integer.parseInt(birthDate.substring(4, 6));
        int day = Integer.parseInt(birthDate.substring(6, 8));

        Map<String, String> result = new HashMap<>();
        result.put("ilju", getDayPillarName(year, month, day));
        result.put("animal", getAnimal(year, month, day));
        return result;
    }
}
