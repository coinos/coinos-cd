## Coinos CD

----

WIP wrapper, launcher and admin UI for managing, testing & deploying Coinos

Intended for more optimal CI/CD, intuitive developer experience & improved stability.

#### goals: 
- versioned releases
- locked/fixed versioned deps, including Docker images
- all associated docker images custom to Coinos can be rebuilt locally/from source
- runs against automated QA test suite
  - releases not published if test fails
- centralized/simplified application configuration
- centralized logging
- commands for convenient spinup, spindown, and purging/starting from scratch
- run services locally or in container without complex configuration changes (ie- run app and ui on local machine vs running via container)
- recipes/playbooks/workflows and scripts for managing deployments; instances and clusters both in cloud and on metal
- admin UI for accessing logs, results of QA tests, managing deployments 

