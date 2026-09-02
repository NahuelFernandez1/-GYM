package com.masgym.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MasgymApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(MasgymApiApplication.class, args);
	}

}
