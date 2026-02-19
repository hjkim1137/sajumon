package com.sajumon;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration; // 추가

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class}) // DB 자동설정 제외
public class SajumonApplication {
	public static void main(String[] args) {
		SpringApplication.run(SajumonApplication.class, args);
	}
}