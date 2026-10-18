# TradeStats

Aplicación móvil para traders de opciones binarias que quieren llevar un registro profesional de sus operativas y evaluar si su estrategia es matemáticamente rentable.

---

## El problema que resuelve

La mayoría de los traders de opciones binarias no llevan un registro ordenado de sus operaciones. Sin datos, es imposible saber si una estrategia funciona o si se está perdiendo dinero de forma sistemática. TradeStats resuelve esto dando un lugar único para registrar cada operación y calculando automáticamente todas las métricas que importan.

---

## Qué hace la app

### Registro de operaciones
Después de cerrar cada operación, el trader registra:
- El monto invertido
- El payout ofrecido por el bróker (85% o 90%)
- El resultado: ganada o perdida

La app calcula automáticamente la ganancia o pérdida real y la guarda con fecha y hora.

### Dashboard
Vista principal con un resumen instantáneo del estado de la cuenta:
- Balance actual de la cuenta
- P&L neto total
- Retorno porcentual sobre el capital inicial
- Win rate, profit factor y expectativa matemática por operación
- Racha actual de victorias o pérdidas consecutivas
- Indicador de rentabilidad de la estrategia
- Últimas 5 operaciones registradas

### Estadísticas
Análisis completo con filtros por período: hoy, esta semana, este mes o todo el historial.

Métricas incluidas:
- **Win rate** — porcentaje de operaciones ganadoras
- **Profit factor** — ratio entre ganancias brutas y pérdidas brutas. Un valor mayor a 1 indica estrategia favorable
- **Expectativa matemática** — ganancia o pérdida promedio esperada por cada operación
- **Racha máxima ganadora y perdedora** — para evaluar la consistencia de la estrategia
- **Racha actual** — cuántas operaciones consecutivas se llevan del mismo tipo
- **Curva de equity** — gráfico que muestra cómo ha evolucionado el balance de la cuenta a lo largo del tiempo
- **Rendimiento sobre capital** — retorno porcentual sobre el capital inicial registrado

El indicador de rentabilidad compara el win rate actual contra el punto de equilibrio matemático según el payout del bróker. Por ejemplo, con un payout de 85% se necesita ganar al menos el 54.05% de las operaciones para ser rentable.

### Historial
Lista completa de todas las operaciones registradas con la posibilidad de:
- Editar cualquier operación ya guardada
- Eliminar operaciones con confirmación

Cada edición recalcula automáticamente todas las estadísticas.

### Configuración
- Capital inicial de la cuenta para calcular el retorno porcentual real
- Payout por defecto que se preselecciona al registrar cada operación

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | React Native + Expo (SDK 57) |
| Lenguaje | TypeScript |
| Base de datos | expo-sqlite (local, sin internet) |
| Estado global | Zustand |
| Navegación | React Navigation (Bottom Tabs) |
| Gráficos | react-native-svg |
| Iconos | @expo/vector-icons (Ionicons) |

---

## Arquitectura

```
src/
├── components/        Componentes reutilizables
├── screens/           Una pantalla por archivo
│   ├── DashboardScreen.tsx
│   ├── NewTradeScreen.tsx
│   ├── HistoryScreen.tsx
│   ├── StatsScreen.tsx
│   └── SettingsScreen.tsx
├── database/
│   ├── database.ts    Inicialización de SQLite y creación de tablas
│   └── operations.ts  Funciones CRUD
├── store/
│   └── useTradeStore.ts  Estado global y lógica de negocio
├── navigation/
│   └── AppNavigator.tsx  Tab bar y rutas
├── types/
│   └── index.ts       Tipos TypeScript globales
├── utils/
│   └── calculations.ts  Motor de cálculo de estadísticas
└── constants/
    └── index.ts       Colores, espaciados y valores fijos
```

---

## Cómo correr el proyecto

```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npx expo start
```

Escanea el QR con Expo Go en tu teléfono Android.

---

## Cómo usar la app

1. Ve a **Config** y registra tu capital inicial y payout por defecto
2. Después de cada operación ve a **Registrar**, ingresa el monto, el payout y el resultado
3. Revisa el **Dashboard** para ver el estado general de tu cuenta
4. Analiza tus métricas en **Estadísticas** filtrando por período
5. Edita o elimina operaciones desde **Historial** si cometiste un error al registrar

---

## Diseño

- Dark mode nativo
- Paleta semántica: verde para ganancias, rojo para pérdidas, violeta como color de marca
- Sin conexión a internet requerida — todo funciona localmente en el dispositivo
- Pensado para uso diario durante sesiones de trading

---

## Autor

[@yerald.dev](https://github.com/yerald0108)