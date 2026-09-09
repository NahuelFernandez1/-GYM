package com.masgym.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class MasgymApiApplication {

	public static void main(String[] args) {
		// Fija la zona horaria del proceso a Argentina. Sin esto, LocalDate.now()
		// usa la zona horaria del sistema operativo del servidor: en un host en la
		// nube (tipicamente UTC) eso hace que un plan/pago se marque VENCIDO hasta
		// 3 horas antes de que realmente venza segun el horario de Argentina.
		TimeZone.setDefault(TimeZone.getTimeZone("America/Argentina/Buenos_Aires"));
		SpringApplication.run(MasgymApiApplication.class, args);
	}

}
