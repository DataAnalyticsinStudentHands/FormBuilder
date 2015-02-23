FormBuilder
===========

FormBuilder is a dynamic form building web application that works with dynamic forms and provides sharing functionality. It communicates to a Java Backend located in FormBuilderBackend repo.

### Getting Started
1. Run `bower install`. This uses `bower.json` and install local dependencies.

2. Run `ionic serve`. This uses `ionic.xml` and will serve as local node server. Live updates when you make changes to the code.

### Branch and Versioning Introduction
- **MASTER** Up to date version of what is deployed to production environment. Updates to master must be for deploying a new release. Production releases must be tagged with a production release tag.
- **PRERELEASE** Used to deploy to the test environment. Commits directly to this branch should be for bug hotfixing and must bump the PATCH version number in the release tagging. All test deployments must be tagged with a pre-production release tag.
- **FEATURE/*** Features are developed in the feature/* branches. Feature branch work towards bumps in MINOR version number as they are merged into the release branch. Feature branches can sync and push to the release branch as needed.

#### Key Points:
- Generic development or design commits may go in feature/development or feature/design branches.
- Major version updates will occur once there are a significant number of commits in the release branch that are tested working.
- It should be safe to update the production environment across minor and patch version changes.

For more details on semantic versioning: www.semver.org
