# Estructura del proyecto con base de datos

```mermaid
flowchart TB
    root["protectora-web2"]

    subgraph frontend["frontend"]
        f_app["src/App.jsx"]
        f_pages["src/pages"]
        f_components["src/components"]
        f_hooks["src/hooks"]
        f_services["src/services"]
        f_styles["src/styles"]
        f_public["public/"]
    end

    subgraph backend["backend"]
        b_src["src/"]
        b_app["src/app.ts"]
        b_server["src/server.ts"]
        b_routes["src/routes/"]
        b_controllers["src/controllers/"]
        b_services["src/services/"]
        b_repos["src/repositories/"]
        b_middleware["src/middleware/"]
        b_config["src/config/"]
        b_prisma["prisma/schema.prisma"]
    end

    subgraph db["Base de datos PostgreSQL"]
        animal["Animal"]
        adopcion["SolicitudAdopcion"]
        voluntario["Voluntario"]
        cita["CitaVoluntariado"]
        evento["Evento"]
        asistente["AsistenteEvento"]
        donacion["Donacion"]
        tipoPago["TipoPago"]
        usuario["Usuario"]
        audit["SecurityAuditLog"]
    end

    subgraph infra["Infraestructura"]
        docker["docker/"]
        docs["docs/"]
        scripts["scripts/"]
    end

    root --> frontend
    root --> backend
    root --> docker
    root --> docs
    root --> scripts

    frontend -->|consume API| backend
    f_app --> f_pages
    f_pages --> f_components
    f_components --> f_services
    f_services -->|HTTP requests| b_routes

    b_app --> b_server
    b_routes --> b_controllers
    b_controllers --> b_services
    b_services --> b_repos
    b_repos -->|Prisma queries| b_prisma
    b_middleware --> b_services
    b_config --> b_app

    b_prisma --> animal
    b_prisma --> adopcion
    b_prisma --> voluntario
    b_prisma --> cita
    b_prisma --> evento
    b_prisma --> asistente
    b_prisma --> donacion
    b_prisma --> tipoPago
    b_prisma --> usuario
    b_prisma --> audit

    animal -->|1:N| adopcion
    voluntario -->|1:N| cita
    evento -->|1:N| asistente
    tipoPago -->|1:N| donacion
    usuario -->|registra| audit

    classDef app fill:#e3f2fd,stroke:#1565c0,stroke-width:1px;
    classDef db fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px;
    classDef infra fill:#fff3e0,stroke:#ef6c00,stroke-width:1px;

    class root,frontend,backend,docs,scripts app;
    class animal,adopcion,voluntario,cita,evento,asistente,donacion,tipoPago,usuario,audit db;
    class docker,infra infra;
```

## Relaciones clave en la BBDD

- Animal 1:N SolicitudAdopcion
- Voluntario 1:N CitaVoluntariado
- Evento 1:N AsistenteEvento
- TipoPago 1:N Donacion
- Usuario guarda auditoría en SecurityAuditLog

## Tecnologías principales

- Frontend: React + Vite + JavaScript/JSX
- Backend: Node.js + Express + Prisma
- Base de datos: PostgreSQL
