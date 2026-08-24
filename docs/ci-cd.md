# CI/CD pipeline

The `CI/CD` GitHub Actions workflow gates every pull request and production deployment with:

- Prettier formatting verification
- ESLint with zero warnings
- TypeScript checks
- Unit and browser end-to-end tests
- CLI integration testing
- A production build
- CodeQL security analysis for JavaScript, TypeScript, and GitHub Actions
- Dependency vulnerability review
- CodeRabbit AI code review
- Vercel preview or production deployment from a prebuilt artifact

Pull requests from branches in this repository receive preview deployments after every GitHub Actions gate passes. Pull requests from forks run verification without receiving repository deployment secrets. CodeRabbit reviews every non-draft pull request and requests changes when it finds unresolved issues. A push to `main` deploys production only after the protected branch accepts the change.

## Required repository setup

Add these encrypted GitHub Actions secrets:

| Secret              | Value                                      |
| ------------------- | ------------------------------------------ |
| `VERCEL_TOKEN`      | Vercel access token used by the CLI        |
| `VERCEL_ORG_ID`     | Vercel account or team ID                  |
| `VERCEL_PROJECT_ID` | Vercel project ID for the docs application |

Install the [CodeRabbit GitHub App](https://github.com/apps/coderabbitai) for this repository. The repository configuration in `.coderabbit.yaml` enables automatic incremental reviews and the request-changes workflow. CodeRabbit requests changes when it finds issues and switches to approval after its comments are resolved.

Protect `main`, require pull requests, dismiss stale approvals when new commits are pushed, require conversation resolution, and make these checks mandatory:

- `CodeQL (javascript-typescript)`
- `CodeQL (actions)`
- `Dependency vulnerability review`
- `Format, lint, types, unit tests, and build`
- `Browser end-to-end tests`
- `CLI integration fixture`

CodeRabbit is a GitHub App review rather than a GitHub Actions job. The branch protection review and conversation rules make its request-changes workflow part of the merge gate without introducing a fragile polling action.

The production job uses the GitHub `production` environment. Add required reviewers or deployment branch rules to that environment if production releases need manual approval.

Vercel Git auto-deployments are disabled in `apps/docs/vercel.json` so the GitHub Actions deployment is the only deployment path.
