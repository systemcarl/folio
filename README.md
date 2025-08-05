# Blank
*Blank* is a simple, open-source, easily-branded blog application, built with
the [*SvelteKit*](https://kit.svelte.dev/docs/kit) framework.

## Customization
Aside from the necessary [deployment configuration](#configuration), the
application requires no additional customization; all customization is optional
and primarily cosmetic.

### Theming
Adding a custom `theme.json` file to the `/static` folder will populate the
application with the provided theme settings.
```json
{
  "themes": {
    "default": {},
  }
}
```

The theme definitions can define colours, and backgrounds. Background and
the applied colour palette are defined per section. Colour values are expected
to be palette keys, not absolute colour values. An example theme definition can
be found in the [theme](src/lib/utils/theme.ts) utility file along with expected
type definitions.

## Deployment
The built [*SvelteKit*](https://kit.svelte.dev/docs/kit) server-side application
is configured to be deployed to a [*Node.js*](https://nodejs.org/) environment.
Before building and running the application, all necessary development
dependencies must be installed.
```bash
npm install
```

### Configuration
Optional environment variables can be defined in a `.env` file at the root of
the project. A sample `.env` file is provided as [`.env.example`](.env.example).

#### Logging
Server side events are automatically logged and formatted using
[*Pino*](https://getpino.io/). Events are sent to the application's standard
output to capture logs in the console or environment log files. In development,
[`pino-pretty`](https://github.com/pinojs/pino-pretty) is used to format the log
output.

#### Error Monitoring & Performance Tracking
To enable [*Sentry*](https://docs.sentry.io/platforms/javascript/guides/svelte/)
error tracking and performance monitoring, add the necessary environment
variables:
- `PUBLIC_SENTRY_DSN`: The public DSN for your Sentry project,
- `SENTRY_ORG`: Your Sentry organization slug,
- `SENTRY_PROJECT`: Your Sentry project slug,
- `SENTRY_AUTH_TOKEN`: Your Sentry authentication token.

### Development
The application can be started locally using [*Vite*](https://vitejs.dev/)'s
development server.
```bash
npm run dev
```

### Production
Run the build command to create an optimized production build, which can also
be served locally using [*Vite*](https://vitejs.dev/).
```bash
npm run build
npm run preview
```

### Testing
Application and configuration unit tests can be run using
[*Vitest*](https://vitest.dev/).
```bash
npm run test
```
