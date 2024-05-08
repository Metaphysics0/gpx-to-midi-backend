# The backend for [gpx-to-midi](https://github.com/Metaphysics0/gpx-to-midi)

## How to run the app

Option 1: Local dev server with Bun

- Make sure you have Bun installed first.
  See https://bun.sh/docs/installation

```bash
bun install
bun run dev
```

Option 2: From the `Dockerfile`

```bash
docker build --pull -t gpx-to-midi-backend .
docker run -d -p 3002:3002 gpx-to-midi-backend
```

open http://localhost:3002
