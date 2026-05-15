# CodeSync Angular Frontend

Angular 19 SPA for the CodeSync backend and case-study requirements.

## Run

```bash
npm install
npm start -- --host 127.0.0.1 --port 4200
```

Open `http://127.0.0.1:4200/`.

The app expects the API gateway at:

```ts
http://localhost:8080/api/v1
```

Change `API_BASE` in `src/app/core/api.service.ts` if your gateway runs on a different host or port.

## Implemented Flow

- First screen is `/auth/login`, with `/auth/register` as the registration flow
- Login/register with JWT persistence and route guards
- Post-login dashboard at `/dashboard`
- Public project discovery and search at `/explore`
- Developer workspace at `/workspace`
- File/folder tree, file creation, and Monaco editor
- Save file content, run code, poll execution result
- Snapshot creation, snapshot diff loading
- Inline review comments and resolve/unresolve
- Profile settings at `/profile`
- Notifications inbox at `/notifications`
- Admin user list and broadcast notification form at `/admin`

## Backend Note

The PDF says guests can browse public projects, but the current gateway config applies `JwtAuthFilter` to all `/api/v1/projects/**` paths. If guest browsing returns `401`, either allow `/api/v1/projects/public` and `/api/v1/projects/search` through the gateway without the JWT filter, or point those two reads directly at the project service.
