# 3D Geospatial Challenge

Visor 3D geoespacial hecho con **Vite + TypeScript + Three.js**.

## Requisitos

- Node.js 20+ recomendado
- npm (o pnpm)

## Ejecutar el proyecto

1. Instalar dependencias:

```bash
npm install
```

2. Levantar en desarrollo:

```bash
npm run dev
```

3. Abrir en el navegador la URL que muestra Vite (normalmente `http://localhost:5173`).

## Scripts disponibles

- `npm run dev`: servidor de desarrollo
- `npm run build`: chequeo TypeScript + build de producción
- `npm run preview`: preview del build generado
- `npm run test`: tests en modo watch (Vitest)
- `npm run test:run`: tests en ejecución única

## Estructura principal

```txt
src/
  app/       # bootstrap y composición de la app
  viewer/    # escena, cámara, renderer, controles, luces, helpers, fit y resize
  loaders/   # carga OBJ y metadata geométrica original
  models/    # registry y manager de modelos
  markers/   # creación y gestión de marcadores
  ui/        # panel de control en HTML/CSS/TS
```

## Modelos OBJ

- Los OBJ se sirven desde `public/models/`.
- El registro de modelos está en `src/models/modelRegistry.ts`.
