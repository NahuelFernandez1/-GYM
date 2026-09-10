package com.masgym.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.net.URI;
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
		aplicarDatabaseUrlDeRender();
		SpringApplication.run(MasgymApiApplication.class, args);
	}

	// Render (y la mayoria de los hosts) exponen la base como una unica
	// DATABASE_URL en formato "postgres://usuario:password@host:puerto/db",
	// pero el driver JDBC necesita "jdbc:postgresql://host:puerto/db" con el
	// usuario y la password aparte. La parseamos aca en vez de pedirle a
	// Render que arme piezas sueltas (host/puerto/etc), que no son
	// propiedades validas para referenciar una base en el render.yaml.
	private static void aplicarDatabaseUrlDeRender() {
		String databaseUrl = System.getenv("DATABASE_URL");
		if (databaseUrl == null || databaseUrl.isBlank()) {
			return;
		}
		URI uri = URI.create(databaseUrl);
		String[] credenciales = uri.getUserInfo().split(":", 2);
		// Render no siempre incluye el puerto en la DATABASE_URL interna (asume 5432).
		int puerto = uri.getPort() == -1 ? 5432 : uri.getPort();
		System.setProperty("DB_URL", "jdbc:postgresql://" + uri.getHost() + ":" + puerto + uri.getPath() + "?sslmode=require");
		System.setProperty("DB_USERNAME", credenciales[0]);
		System.setProperty("DB_PASSWORD", credenciales[1]);
	}

}
