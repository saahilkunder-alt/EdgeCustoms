# EdgeCustoms

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.6.

## Cloudflare Pages Local Development (Full-Stack)

Since this app uses Cloudflare Pages Functions (in the `functions/` directory) and a D1 Database, running a standard `ng serve` will only run the frontend without the backend API. 

Follow these steps to run the full application locally with Wrangler and a local D1 database:

### 1. Initialize the Local D1 Database
First, set up and seed your local SQLite database using the provided SQL files:
```bash
npm run db:init
```
*This command executes `schema.sql`, `seed_catalog.sql`, and `seed_users.sql` on the local D1 database emulator (`.wrangler/state/v3/d1`).*

### 2. Run the App with Live Reload
Wrangler Pages Dev serves static files from the build output directory (`dist/edge-customs/browser`). To get live reloading for your code changes, you need to run the compiler and the dev server in parallel:

*   **Terminal 1**: Start the Angular build in watch mode:
    ```bash
    npm run watch
    ```
    *This will compile the frontend and automatically recompile whenever you make changes.*

*   **Terminal 2**: Start the Wrangler development server:
    ```bash
    npm run pages:dev
    ```
    *This starts the serverless backend functions, simulates the D1 database binding (`DB`), and serves the frontend on [http://localhost:8788/](http://localhost:8788/).*

---

## Frontend-Only Development

If you only need to work on the UI styling and layout without requiring the backend APIs, you can run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
