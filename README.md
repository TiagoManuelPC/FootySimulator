# FootySimulator

A small demo that simulates a live football match and visualises events
in an Angular frontend while the backend pushes events using SignalR.

This repo contains:

- `API/` — ASP.NET Core (.NET 10) API with a SignalR `MatchHub` and a
    `MatchSimulator` service that emits synthetic events.
- `angular/` — Angular application (signals-based components, heatmap,
    charts and a live event feed).

## Quick overview

- Frontend connects to the backend SignalR hub at `/matchHub` to receive
    live events.
- Events include: `Pass`, `Shot`, `Tackle`, `Goal` plus coordinates and
    player/team metadata.
- The Angular app shows a heatmap, possession doughnut, a goal-probability
    chart and a scrolling live feed.

## Prerequisites

- .NET 10 SDK
- Node.js (LTS) and `yarn`

## Run locally

1. Start the backend API

```powershell
cd API
dotnet restore
dotnet build
dotnet run
```

By default the API runs at `https://localhost:5001` for dev (see
`API/Properties/launchSettings.json`). The SignalR negotiate endpoint is
`https://localhost:5001/matchHub/negotiate`.

2. Start the frontend

```powershell
cd angular
yarn
yarn start
```

Open `http://localhost:4200` and the app should connect to the backend.

## Notes & troubleshooting

- If the SignalR client can't connect, check the API is running and
    that the `SignalrService` is using the correct URL
    (`https://localhost:5001/matchHub`).
- For local dev you may need to trust the ASP.NET dev certificate.
- CORS: API must allow the Angular origin and use credentials for
    SignalR (do not use `AllowAnyOrigin()` together with
    `AllowCredentials()`).
- The frontend uses Chart.js and `heatmap.js` — a small postinstall
    patch exists to work around an ImageData assignment issue in some
    environments (see `angular/scripts/patch-heatmap.js`).
- The favicon is a football SVG at `angular/src/football.svg`.

## Development notes

- The feed badges use inline SVGs for consistency; theme toggle stores
    preference in `localStorage` and toggles a `dark` class on `html`.
- The `MatchSimulator` prevents the first five players per team from
    shooting or scoring (configurable server-side behaviour).


## License

MIT
------------------------------------------------------------------------
