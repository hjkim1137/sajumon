package com.sajumon.util;

public class ZodiacUtils {

    /**
     * 연도를 입력받아 해당 연도의 12간지 영문명을 반환합니다.
     * @param year (예: 1995)
     * @return 영문 띠 이름 (예: "Pig")
     */
    public static String getZodiacAnimal(int year) {
        // 12간지 순서: 원숭이(0), 닭(1), 개(2), 돼지(3), 쥐(4), 소(5), 호랑이(6), 토끼(7), 용(8), 뱀(9), 말(10), 양(11)
        // 연도를 12로 나눈 나머지에 따라 결정됩니다.
        String[] animals = {
                "Monkey", "Rooster", "Dog", "Pig", "Rat", "Ox",
                "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat"
        };

        return animals[year % 12];
    }
}