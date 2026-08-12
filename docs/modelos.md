# Modelos de datos

## Animal
Representa a un animal disponible para adopción.

Campos principales:
- id: identificador único
- name: nombre del animal
- species: especie
- age: edad
- description: descripción
- images: array de imágenes
- createdAt / updatedAt: auditoría temporal

## SolicitudAdopcion
Registra una solicitud de adopción realizada por un usuario.

Campos principales:
- id
- animalId: referencia al animal
- nombre, email, telefono, mensaje
- estado: pendiente, aceptada, rechazada, etc.

## Voluntario
Representa un voluntario que se registra en la protectora.

Campos principales:
- id
- nombre, email, telefono
- disponibilidad
- mensaje
- citas: relación con citas de voluntariado

## CitaVoluntariado
Gestiona la asignación temporal de un voluntario a una tarea o turno.

Campos principales:
- id
- voluntarioId
- inicio, fin
- estado
- notas

## Evento
Contiene los eventos o actividades organizadas por la protectora.

Campos principales:
- id
- titulo, descripcion, fecha, lugar
- images

## Donacion
Guarda una donación realizada por un donante.

Campos principales:
- id
- cantidad
- nombre, email
- metodoId: referencia al tipo de pago

## TipoPago
Define los métodos de pago disponibles para las donaciones.

Campos principales:
- id
- tipo
- label
- account

## Usuario
Representa a los usuarios del panel administrativo.

Campos principales:
- id
- nombre, email, password
- role
- mfaEnabled, mfaSecret, mfaTempSecret, mfaRecoveryCodes

## SecurityAuditLog
Registra eventos de auditoría y seguridad.

Campos principales:
- id
- createdAt
- userId, email, action, success
- ip, userAgent, path, method, reason, metadata
