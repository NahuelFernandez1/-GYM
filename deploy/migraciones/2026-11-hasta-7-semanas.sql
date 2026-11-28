-- Permite planes de hasta 7 semanas (antes el maximo era 5). El valor por defecto sigue en 5.
-- Se puede correr con el backend andando: solo cambia el CHECK.
BEGIN;
ALTER TABLE planificaciones DROP CONSTRAINT ck_planificaciones_cantidad_semanas;
ALTER TABLE planificaciones
  ADD CONSTRAINT ck_planificaciones_cantidad_semanas CHECK (cantidad_semanas BETWEEN 1 AND 7);
COMMIT;
