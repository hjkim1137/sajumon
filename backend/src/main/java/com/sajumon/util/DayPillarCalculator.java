package com.sajumon.util;

import java.util.HashMap;
import java.util.Map;

/**
 * 만세력 기반 일주(日柱) 계산기.
 * Julian Day Number를 이용하여 육십갑자 일주를 정확히 계산한다.
 *
 * 검증: 1994-08-17 → JDN 2449582 → index 11 → 을해 ✓
 */
public class DayPillarCalculator {

    // 천간 (天干) - 10 Heavenly Stems
    private static final String[] HEAVENLY_STEMS = {
            "갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"
    };

    // 지지 (地支) - 12 Earthly Branches
    private static final String[] EARTHLY_BRANCHES = {
            "자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"
    };

    // 십이지신 영문 동물명 (지지 순서와 동일)
    private static final String[] ANIMALS = {
            "rat", "ox", "tiger", "rabbit", "dragon", "snake",
            "horse", "sheep", "monkey", "rooster", "dog", "pig"
    };

    // 육십갑자 (60 Sexagenary Pillars)
    private static final String[] SIXTY_PILLARS = new String[60];

    static {
        for (int i = 0; i < 60; i++) {
            SIXTY_PILLARS[i] = HEAVENLY_STEMS[i % 10] + EARTHLY_BRANCHES[i % 12];
        }
    }

    /**
     * 그레고리력 날짜를 Julian Day Number로 변환한다.
     * 참고: https://en.wikipedia.org/wiki/Julian_day
     */
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

    /**
     * 육십갑자 일주 인덱스(0~59)를 계산한다.
     * 공식: (JDN + 49) % 60
     */
    public static int getDayPillarIndex(int year, int month, int day) {
        long jdn = calculateJDN(year, month, day);
        int index = (int) ((jdn + 49) % 60);
        return index < 0 ? index + 60 : index;
    }

    /**
     * 일주 한글명을 반환한다 (예: "을해").
     */
    public static String getDayPillarName(int year, int month, int day) {
        return SIXTY_PILLARS[getDayPillarIndex(year, month, day)];
    }

    /**
     * 일주의 지지에 해당하는 십이지신 동물 영문명을 반환한다.
     */
    public static String getAnimal(int year, int month, int day) {
        int pillarIndex = getDayPillarIndex(year, month, day);
        int branchIndex = pillarIndex % 12;
        return ANIMALS[branchIndex];
    }

    /**
     * 생년월일시를 받아 일주와 동물을 계산하여 반환한다.
     *
     * @param birthDate YYYYMMDD 형식의 생년월일
     * @param birthTime 시간 값 ("00"=자시, "02"=축시, ..., "22"=해시, "unknown"=모름)
     * @return ilju(일주 한글명), animal(동물 영문명)을 담은 Map
     */
    public static Map<String, String> calculate(String birthDate, String birthTime) {
        int year = Integer.parseInt(birthDate.substring(0, 4));
        int month = Integer.parseInt(birthDate.substring(4, 6));
        int day = Integer.parseInt(birthDate.substring(6, 8));

        // 자시(子時) 보정: 23:30 이후 출생이면 일주는 다음 날 기준
        // 자시(value="00")는 23:30~01:29를 의미함
        // 23:30~00:00 사이 출생자는 입력한 날짜 기준 다음날의 일주를 사용해야 함
        // 단, 00:00~01:29 출생자는 이미 다음날 날짜를 입력하므로 보정 불필요
        // → 자시 선택 시 야자시(夜子時) 관례에 따라 day + 1 처리
        if ("00".equals(birthTime)) {
            // 간단한 다음날 계산 (월말/연말 경계 처리)
            day = day + 1;
            int maxDay = getMaxDay(year, month);
            if (day > maxDay) {
                day = 1;
                month = month + 1;
                if (month > 12) {
                    month = 1;
                    year = year + 1;
                }
            }
        }

        String ilju = getDayPillarName(year, month, day);
        String animal = getAnimal(year, month, day);

        Map<String, String> result = new HashMap<>();
        result.put("ilju", ilju);
        result.put("animal", animal);
        return result;
    }

    /**
     * 해당 월의 마지막 날을 반환한다.
     */
    private static int getMaxDay(int year, int month) {
        switch (month) {
            case 2:
                return isLeapYear(year) ? 29 : 28;
            case 4: case 6: case 9: case 11:
                return 30;
            default:
                return 31;
        }
    }

    /**
     * 윤년 여부를 반환한다.
     */
    private static boolean isLeapYear(int year) {
        return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
    }
}
