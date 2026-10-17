# Myinder Admin Dashboard

Responsive React + TypeScript + Tailwind CSS admin dashboard.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Live users API

The Saved Users page fetches real records from the admin API. The API URL is configured in `.env`:

```env
VITE_ADMIN_USERS_API_URL=https://myinder-server.onrender.com/api/admin/users
```

If you change `.env`, restart the Vite development server. The endpoint must return JSON containing an array of users, either directly or under `users`, `data`, `items`, or `results`.

The API mapper supports common fields including `user_id`/`id`, `name`, `ig_username`, `major`, university/school fields, and photo arrays (`photos`, `images`, `user_photos`, or `photo_urls`). Photo entries may be URL strings or objects containing `url`, `photo_url`, `image_url`, `src`, `path`, or `filename`.

## Backend requirements

- The endpoint must be reachable from the browser and allow CORS requests from your frontend origin (for example `http://localhost:5173` or your deployed dashboard domain).
- The admin endpoint should be protected by your backend's admin authentication. Do not put server secrets or database credentials in a Vite `.env` variable; `VITE_` values are public in the browser bundle.
- Relative photo paths are resolved against the API host. Bare photo filenames are resolved to `/api/images/:filename`.
- If the API's response field names differ, update `src/admin/services/usersService.ts` in `mapUser()`.

## Included

- Sidebar navigation and admin footer
- Saved users grid with search, total count and pagination
- User details modal with name, university, major, Instagram and uploaded images
- Individual image downloads and Download All Images ZIP action
- Loading and API error states
