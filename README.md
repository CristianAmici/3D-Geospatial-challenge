# 3D Geospatial Challenge

Visor 3D geoespacial hecho con Vite + TypeScript + Three.js (sin framework).

## Requisitos

- Node.js 20+
- npm (o pnpm)

## Ejecutar el proyecto

1. Instalar dependencias:

```bash
npm install
```

2. Levantar entorno de desarrollo:

```bash
npm run dev
```

3. Abrir la URL que muestra Vite (normalmente `http://localhost:5173`).

## Scripts

- `npm run dev`: servidor de desarrollo
- `npm run build`: type-check + build de produccion
- `npm run preview`: servir build local
- `npm run test`: tests en watch
- `npm run test:run`: tests en una corrida

## Estructura principal

```txt
src/
  app/       # bootstrap y composicion de la app
  viewer/    # scene, camera, renderer, controls, lights, helpers, resize, loop
  loaders/   # carga OBJ + metadata original
  models/    # registry y manager de modelos
  spatial/   # transformacion source/original -> scene
  markers/   # creacion y gestion de marcadores
  ui/        # panel de control en HTML/CSS/TS
```

## Modelos OBJ

- Los OBJ se sirven desde `public/models/`.
- El catalogo de modelos esta en `src/models/modelRegistry.ts`.
- No se editan OBJ: la adaptacion espacial se hace en runtime.

## Coordenadas y transformaciones

- El pipeline usa un transformador espacial unico para mantener consistencia.
- Modelos y marcadores pasan por la misma conversion de coordenadas.
- Entradas de marker en UI se interpretan como coordenadas originales/source.
- El transformador aplica:
  - global origin (para acercar coordenadas georreferenciadas al origen de escena)
  - rotacion compartida de sistema (`sceneSourceRotation`)
  - offsets locales de modelo cuando corresponda

