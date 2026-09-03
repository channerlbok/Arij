# Mochu

Mochu is a full-stack project-management app for organizing projects, tracking issues, collaborating with members, and discussing work through comments.

[Live demo](https://calm-mushroom-01576fb1e.7.azurestaticapps.net)

![Mochu projects page](docs/screenshots/projects.png)

## What you can do

- Create an account and sign in securely
- Create, edit, and delete projects
- Create, filter, edit, and delete issues
- Add project members by email
- Collaborate through issue comments
- Track issue type, priority, and status

![Mochu issues page](docs/screenshots/issues.png)

## Built with

- **Frontend:** React, TypeScript, Vite
- **Backend:** C#, ASP.NET Core Minimal APIs
- **Database:** Azure SQL with Entity Framework Core
- **Authentication:** ASP.NET Core Identity with cookie authentication
- **Deployment:** Azure Static Web Apps, Azure App Service, GitHub Actions

## A few technical details

- Users can access projects they own or have been added to as members.
- Project membership is modeled with a `ProjectMember` join table.
- The API uses authorization checks, CORS, and rate limiting.
- The frontend and backend are deployed separately and communicate through REST endpoints.

## Run locally

```bash
# Backend
cd Ajir.Api
dotnet ef database update
dotnet run

# Frontend
cd ../ajir-web
npm install
npm run dev