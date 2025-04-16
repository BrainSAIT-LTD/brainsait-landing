# Demos and architectures

URL: https://developers.cloudflare.com/pages/demos/

import { ExternalResources, GlossaryTooltip, ResourcesBySelector } from "~/components"

Learn how you can use Pages within your existing application and architecture.

## Demos

Explore the following <GlossaryTooltip term="demo application">demo applications</GlossaryTooltip> for Pages.

<ExternalResources type="apps" products={["Pages"]} />

## Reference architectures

Explore the following <GlossaryTooltip term="reference architecture">reference architectures</GlossaryTooltip> that use Pages:

<ResourcesBySelector types={["reference-architecture","design-guide","reference-architecture-diagram"]} products={["Pages"]} />

---

# Cloudflare Pages

URL: https://developers.cloudflare.com/pages/

import { CardGrid, Description, Feature, LinkTitleCard, Plan, RelatedProduct, Render } from "~/components"

<Description>

Create full-stack applications that are instantly deployed to the Cloudflare global network.
</Description>

<Plan type="all" />

Deploy your Pages project by connecting to [your Git provider](/pages/get-started/git-integration/), uploading prebuilt assets directly to Pages with [Direct Upload](/pages/get-started/direct-upload/) or using [C3](/pages/get-started/c3/) from the command line.

***

## Features

<Feature header="Pages Functions" href="/pages/functions/">

Use Pages Functions to deploy server-side code to enable dynamic functionality without running a dedicated server.


</Feature>

<Feature header="Rollbacks" href="/pages/configuration/rollbacks/">

Rollbacks allow you to instantly revert your project to a previous production deployment.


</Feature>

<Feature header="Redirects" href="/pages/configuration/redirects/">

Set up redirects for your Cloudflare Pages project.


</Feature>

***

## Related products

<RelatedProduct header="Workers" href="/workers/" product="workers">

Cloudflare Workers provides a serverless execution environment that allows you to create new applications or augment existing ones without configuring or maintaining infrastructure.


</RelatedProduct>

<RelatedProduct header="R2" href="/r2/" product="r2">

Cloudflare R2 Storage allows developers to store large amounts of unstructured data without the costly egress bandwidth fees associated with typical cloud storage services.


</RelatedProduct>

<RelatedProduct header="D1" href="/d1/" product="d1">

D1 is Cloudflareâ€™s native serverless database. Create a database by importing data or defining your tables and writing your queries within a Worker or through the API.


</RelatedProduct>

<RelatedProduct header="Zaraz" href="/zaraz/" product="zaraz">

Offload third-party tools and services to the cloud and improve the speed and security of your website.


</RelatedProduct>

***

## More resources

<CardGrid>

<LinkTitleCard title="Limits" href="/pages/platform/limits/" icon="document">
Learn about limits that apply to your Pages project (500 deploys per month on the Free plan).
</LinkTitleCard>

<LinkTitleCard title="Migration guides" href="/pages/migrations/" icon="pen">
Migrate to Pages from your existing hosting provider.
</LinkTitleCard>

<LinkTitleCard title="Framework guides" href="/pages/framework-guides/" icon="open-book">
Deploy popular frameworks such as React, Hugo, and Next.js on Pages.
</LinkTitleCard>

<LinkTitleCard title="Developer Discord" href="https://discord.cloudflare.com" icon="discord">
Connect with the Workers community on Discord to ask questions, show what you are building, and discuss the platform with other developers.
</LinkTitleCard>

<LinkTitleCard title="@CloudflareDev" href="https://x.com/cloudflaredev" icon="x.com">
Follow @CloudflareDev on Twitter to learn about product announcements, and what is new in Cloudflare Workers.
</LinkTitleCard>

</CardGrid>

---

# REST API

URL: https://developers.cloudflare.com/pages/configuration/api/

The [Pages API](/api/resources/pages/subresources/projects/methods/list/) empowers you to build automations and integrate Pages with your development workflow. At a high level, the API endpoints let you manage deployments and builds and configure projects. Cloudflare supports [Deploy Hooks](/pages/configuration/deploy-hooks/) for headless CMS deployments. Refer to the [API documentation](https://api.cloudflare.com/) for a full breakdown of object types and endpoints.

## How to use the API

### Get an API token

To create an API token:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com).
2. Select the user icon on the top right of your dashboard > **My Profile**.
3. Select [**API Tokens**](https://dash.cloudflare.com/profile/api-tokens) > **Create Token**.
4. You can go to **Edit Cloudflare Workers** template > **Use template** or go to **Create Custom Token** > **Get started**. If you create a custom token, you will need to make sure to add the **Cloudflare Pages** permission with **Edit** access.

### Make requests

After creating your token, you can authenticate and make requests to the API using your API token in the request headers. For example, here is an API request to get all deployments in a project.

```bash
curl 'https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}/deployments' \
--header 'Authorization: Bearer <API_TOKEN>'
```

Try it with one of your projects by replacing `{account_id}`, `{project_name}`, and `<API_TOKEN>`. Refer to [Find your account ID](/fundamentals/setup/find-account-and-zone-ids/) for more information.

## Examples

The API is even more powerful when combined with Cloudflare Workers: the easiest way to deploy serverless functions on Cloudflare's global network. The following section includes three code examples on how to use the Pages API. To build and deploy these samples, refer to the [Get started guide](/workers/get-started/guide/).

### Triggering a new build every hour

Suppose we have a CMS that pulls data from live sources to compile a static output. You can keep the static content as recent as possible by triggering new builds periodically using the API.

```js
const endpoint = "https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}/deployments";

export default {
  async scheduled(_, env) {
    const init = {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        // We recommend you store the API token as a secret using the Workers dashboard or using Wrangler as documented here: https://developers.cloudflare.com/workers/wrangler/commands/#secret
        "Authorization": `Bearer ${env.API_TOKEN}`,
      },
    };

    await fetch(endpoint, init);
  }
}
```

After you have deployed the JavaScript Worker, set a cron trigger in your Worker to run this script periodically. Refer to [Cron Triggers](/workers/configuration/cron-triggers/) for more details.

### Deleting old deployments after a week

Cloudflare Pages hosts and serves all project deployments on preview links. Suppose you want to keep your project private and prevent access to your old deployments. You can use the API to delete deployments after a month, so that they are no longer public online. The latest deployment for a branch cannot be deleted.

```js
const endpoint = "https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}/deployments";
const expirationDays = 7;

export default {
  async scheduled(_, env) {
    const init = {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        // We recommend you store the API token as a secret using the Workers dashboard or using Wrangler as documented here: https://developers.cloudflare.com/workers/wrangler/commands/#secret
        "Authorization": `Bearer ${env.API_TOKEN}`,
      },
    };

    const response = await fetch(endpoint, init);
    const deployments = await response.json();

    for (const deployment of deployments.result) {
      // Check if the deployment was created within the last x days (as defined by `expirationDays` above)
      if ((Date.now() - new Date(deployment.created_on)) / 86400000 > expirationDays) {
        // Delete the deployment
        await fetch(`${endpoint}/${deployment.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            "Authorization": `Bearer ${env.API_TOKEN}`,
          },
        });
      }
    }
  }
}
```

After you have deployed the JavaScript Worker, you can set a cron trigger in your Worker to run this script periodically. Refer to the [Cron Triggers guide](/workers/configuration/cron-triggers/) for more details.

### Sharing project information

Imagine you are working on a development team using Pages to build your websites. You would want an easy way to share deployment preview links and build status without having to share Cloudflare accounts. Using the API, you can easily share project information, including deployment status and preview links, and serve this content as HTML from a Cloudflare Worker.

```js
const deploymentsEndpoint =
  "https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}/deployments";
const projectEndpoint =
  "https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}";

export default {
  async fetch(request, env) {
    const init = {
      headers: {
        "content-type": "application/json;charset=UTF-8",
        // We recommend you store the API token as a secret using the Workers dashboard or using Wrangler as documented here: https://developers.cloudflare.com/workers/wrangler/commands/#secret
        "Authorization": `Bearer ${env.API_TOKEN}`,
      },
    };

    const style = `body { padding: 6em; font-family: sans-serif; } h1 { color: #f6821f }`;
    let content = "<h2>Project</h2>";

    let response = await fetch(projectEndpoint, init);
    const projectResponse = await response.json();
    content += `<p>Project Name: ${projectResponse.result.name}</p>`;
    content += `<p>Project ID: ${projectResponse.result.id}</p>`;
    content += `<p>Pages Subdomain: ${projectResponse.result.subdomain}</p>`;
    content += `<p>Domains: ${projectResponse.result.domains}</p>`;
    content += `<a href="${projectResponse.result.canonical_deployment.url}"><p>Latest preview: ${projectResponse.result.canonical_deployment.url}</p></a>`;

    content += `<h2>Deployments</h2>`;
    response = await fetch(deploymentsEndpoint, init);
    const deploymentsResponse = await response.json();

    for (const deployment of deploymentsResponse.result) {
      content += `<a href="${deployment.url}"><p>Deployment: ${deployment.id}</p></a>`;
    }

    let html = `
      <!DOCTYPE html>
      <head>
        <title>Example Pages Project</title>
      </head>
      <body>
        <style>${style}</style>
        <div id="container">
          ${content}
        </div>
      </body>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
      },
    });
  }
}
```

## Related resources

* [Pages API Docs](/api/resources/pages/subresources/projects/methods/list/)
* [Workers Getting Started Guide](/workers/get-started/guide/)
* [Workers Cron Triggers](/workers/configuration/cron-triggers/)

---

# Build caching

URL: https://developers.cloudflare.com/pages/configuration/build-caching/

Improve Pages build times by caching dependencies and build output between builds with a project-wide shared cache.

The first build to occur after enabling build caching on your Pages project will save to cache. Every subsequent build will restore from cache unless configured otherwise.

## About build cache

When enabled, the build cache will automatically detect and cache data from each build. Refer to [Frameworks](/pages/configuration/build-caching/#frameworks) to review what directories are automatically saved and restored from the build cache.

### Requirements

Build caching requires the [V2 build system](/pages/configuration/build-image/#v2-build-system) or later. To update from V1, refer to the [V2 build system migration instructions](/pages/configuration/build-image/#v1-to-v2-migration).

### Package managers

Pages will cache the global cache directories of the following package managers:

| Package Manager               | Directories cached   |
| ----------------------------- | -------------------- |
| [npm](https://www.npmjs.com/) | `.npm`               |
| [yarn](https://yarnpkg.com/)  | `.cache/yarn`        |
| [pnpm](https://pnpm.io/)      | `.pnpm-store`        |
| [bun](https://bun.sh/)        | `.bun/install/cache` |

### Frameworks

Some frameworks provide a cache directory that is typically populated by the framework with intermediate build outputs or dependencies during build time. Pages will automatically detect the framework you are using and cache this directory for reuse in subsequent builds.

The following frameworks support build output caching:

| Framework  | Directories cached                            |
| ---------- | --------------------------------------------- |
| Astro      | `node_modules/.astro`                         |
| Docusaurus | `node_modules/.cache`, `.docusaurus`, `build` |
| Eleventy   | `.cache`                                      |
| Gatsby     | `.cache`, `public`                            |
| Next.js    | `.next/cache`                                 |
| Nuxt       | `node_modules/.cache/nuxt`                    |

### Limits

The following limits are imposed for build caching:

- **Retention**: Cache is purged seven days after its last read date. Unread cache artifacts are purged seven days after creation.
- **Storage**: Every project is allocated 10 GB. If the project cache exceeds this limit, the project will automatically start deleting artifacts that were read least recently.

## Enable build cache

To enable build caching :

1. Navigate to [Workers & Pages Overview](https://dash.cloudflare.com) on the Dashboard.
2. Find your Pages project.
3. Go to **Settings** > **Build** > **Build cache**.
4. Select **Enable** to turn on build caching.

## Clear build cache

The build cache can be cleared for a project if needed, such as when debugging build issues. To clear the build cache:

1. Navigate to [Workers & Pages Overview](https://dash.cloudflare.com) on the Dashboard.
2. Find your Pages project.
3. Go to **Settings** > **Build** > **Build cache**.
4. Select **Clear Cache** to clear the build cache.

---

# Branch deployment controls

URL: https://developers.cloudflare.com/pages/configuration/branch-build-controls/

import { Render } from "~/components"

When connected to your git repository, Pages allows you to control which environments and branches you would like to automatically deploy to. By default, Pages will trigger a deployment any time you commit to either your production or preview environment. However, with branch deployment controls, you can configure automatic deployments to suit your preference on a per project basis.

## Production branch control

:::caution[Direct Upload]


<Render file="prod-branch-update" />


:::

To configure deployment options, go to your Pages project > **Settings** > **Builds & deployments** > **Configure Production deployments**. Pages will default to setting your production environment to the branch you first push, but you can set your production to another branch if you choose.

You can also enable or disable automatic deployment behavior on the production branch by checking the **Enable automatic production branch deployments** box. You must save your settings in order for the new production branch controls to take effect.

## Preview branch control

When configuring automatic preview deployments, there are three options to choose from.

* **All non-Production branches**: By default, Pages will automatically deploy any and every commit to a preview branch.
* **None**: Turns off automatic builds for all preview branches.
* **Custom branches**: Customize the automatic deployments of certain preview branches.

### Custom preview branch control

By selecting **Custom branches**, you can specify branches you wish to include and exclude from automatic deployments in the provided configuration fields. The configuration fields can be filled in two ways:

* **Static branch names**: Enter the precise name of the branch you are looking to include or exclude (for example, staging or dev).
* **Wildcard syntax**: Use wildcards to match multiple branches. You can specify wildcards at the start or end of your rule. The order of execution for the configuration is (1) Excludes, (2) Includes, (3) Skip. Pages will process the exclude configuration first, then go to the include configuration. If a branch does not match either then it will be skipped.

:::note[Wildcard syntax]


A wildcard (`*`) is a character that is used within rules. It can be placed alone to match anything or placed at the start or end of a rule to allow for better control over branch configuration. A wildcard will match zero or more characters.For example, if you wanted to match all branches that started with `fix/` then you would create the rule `fix/*` to match strings like `fix/1`, `fix/bugs`or `fix/`.


:::

**Example 1:**

If you want to enforce branch prefixes such as `fix/`, `feat/`, or `chore/` with wildcard syntax, you can include and exclude certain branches with the following rules:

* Include Preview branches:
  `fix/*`, `feat/*`, `chore/*`

* Exclude Preview branches:
  \`\`

Here Pages will include any branches with the indicated prefixes and exclude everything else. In this example, the excluding option is left empty.

**Example 2:**

If you wanted to prevent [dependabot](https://github.com/dependabot) from creating a deployment for each PR it creates, you can exclude those branches with the following:

* Include Preview branches:
  `*`

* Exclude Preview branches:
  `dependabot/*`

Here Pages will include all branches except any branch starting with `dependabot`. In this example, the excluding option means any `dependabot/`  branches will not be built.

**Example 3:**

If you only want to deploy release-prefixed branches, then you could use the following rules:

* Include Preview branches:
  `release/*`

* Exclude Preview branches:
  `*`

This will deploy only branches starting with `release/`.

---

# Build configuration

URL: https://developers.cloudflare.com/pages/configuration/build-configuration/

import { Details, PagesBuildPresetsTable } from "~/components";

You may tell Cloudflare Pages how your site needs to be built as well as where its output files will be located.

## Build commands and directories

You should provide a build command to tell Cloudflare Pages how to build your application. For projects not listed here, consider reading the tool's documentation or framework, and submit a pull request to add it here.

Build directories indicates where your project's build command outputs the built version of your Cloudflare Pages site. Often, this defaults to the industry-standard `public`, but you may find that you need to customize it.

<Details header="Understanding your build configuration">

The build command is provided by your framework. For example, the Gatsby framework uses `gatsby build` as its build command. When you are working without a framework, leave the **Build command** field blank. Pages determines whether a build has succeeded or failed by reading the exit code returned from the user supplied build command. Any non-zero return code will cause a build to be marked as failed. An exit code of 0 will cause the Pages build to be marked as successful and assets will be uploaded regardless of if error logs are written to standard error.

The build directory is generated from the build command. Each framework has its own naming convention, for example, the build output directory is named `/public` for many frameworks.

The root directory is where your siteâ€™s content lives. If not specified, Cloudflare assumes that your linked git repository is the root directory. The root directory needs to be specified in cases like monorepos, where there may be multiple projects in one repository.

</Details>

## Framework presets

Cloudflare maintains a list of build configurations for popular frameworks and tools. These are accessible during project creation. Below are some standard build commands and directories for popular frameworks and tools.

If you are not using a preset, use `exit 0` as your **Build command**.

<PagesBuildPresetsTable />

## Environment variables

If your project makes use of environment variables to build your site, you can provide custom environment variables:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In **Account Home**, select **Workers & Pages**.
3. In **Overview**, select your Pages project.
4. Select **Settings** > **Environment variables**.

The following system environment variables are injected by default (but can be overridden):

| Environment Variable  | Injected value                        | Example use-case                                                                        |
| --------------------- | ------------------------------------- | --------------------------------------------------------------------------------------- |
| `CF_PAGES`            | `1`                                   | Changing build behaviour when run on Pages versus locally                               |
| `CF_PAGES_COMMIT_SHA` | `<sha1-hash-of-current-commit>`       | Passing current commit ID to error reporting, for example, Sentry                       |
| `CF_PAGES_BRANCH`     | `<branch-name-of-current-deployment>` | Customizing build based on branch, for example, disabling debug logging on `production` |
| `CF_PAGES_URL`        | `<url-of-current-deployment>`         | Allowing build tools to know the URL the page will be deployed at                       |

---

# Build image

URL: https://developers.cloudflare.com/pages/configuration/build-image/

import {
	PagesBuildEnvironment,
	PagesBuildEnvironmentLanguages,
	PagesBuildEnvironmentTools,
} from "~/components";

Cloudflare Pages' build environment has broad support for a variety of languages, such as Ruby, Node.js, Python, PHP, and Go.

If you need to use a [specific version](#override-default-versions) of a language, (for example, Node.js or Ruby) you can specify it by providing an associated environment variable in your build configuration, or setting the relevant file in your source code.

## Supported languages and tools

In the following tables, review the preinstalled versions for languages and tools included in the Cloudflare Pages' build image, and the environment variables and/or files available for [overriding the preinstalled version](#override-default-versions):

### Languages and runtime

<PagesBuildEnvironmentLanguages />

:::note[Any version]
Under Supported versions, "Any version" refers to support for all versions of the language or tool including versions newer than the Default version.
:::

### Tools

<PagesBuildEnvironmentTools />

:::note[Any version]
Under Supported versions, "Any version" refers to support for all versions of the language or tool including versions newer than the Default version.
:::

### Frameworks

To use a specific version of a framework, specify it in the project's package manager configuration file.
For example, if you use Gatsby, your `package.json` should include the following:

```
"dependencies": {
	"gatsby": "^5.13.7",
}
```

When your build starts, if not already [cached](/pages/configuration/build-caching/), version 5.13.7 of Gatsby will be installed using `npm install`.

## Advanced Settings

### Override default versions

To override default versions of languages and tools in the build system, you can either set the desired version through environment variables or by adding files to your project.

To set the version using environment variables, you can:

1. Find the environment variable name for the language or tool in [this table](/pages/configuration/build-image/#supported-languages-and-tools).
2. Add the environment variable on the dashboard by going to **Settings** > **Environment variables** in your Pages project, or [add the environment variable via Wrangler](/workers/configuration/environment-variables/#add-environment-variables-via-wrangler).

Or, to set the version by adding a file to your project, you can:

1. Find the file name for the language or tool in [this table](/pages/configuration/build-image/#supported-languages-and-tools).
2. Add the specified file name to the root directory of your project, and add the desired version number as the contents of the file.

For example, if you were previously relying on the default version of Node.js in the v1 build system, to migrate to v2, you must specify that you need Node.js `12.18.0` by setting a `NODE_VERSION = 12.18.0` environment variable or by adding a `.node-version` or `.nvmrc` file to your project with `12.18.0` added as the contents to the file.

### Skip dependency install

You can add the following environment variable to disable automatic dependency installation, and run a custom install command instead.

| Build variable            | Value         |
| ------------------------- | ------------- |
| `SKIP_DEPENDENCY_INSTALL` | `1` or `true` |

## V2 build system

The [v2 build system](https://blog.cloudflare.com/moderizing-cloudflare-pages-builds-toolbox/) announced in May 2023 brings several improvements to project builds.

### V1 to V2 Migration

To migrate to this new version, configure your Pages project settings in the dashboard:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. Select **Workers & Pages** > in **Overview**, select your Pages project.
3. Go to **Settings** > **Build & deployments** > **Build system version** and select the latest version.

If you were previously relying on the default versions of any languages or tools in the build system, your build may fail when migrating to v2. To fix this, you must specify the version you wish to use by [overriding](/pages/configuration/build-image/#overriding-default-versions) the default versions.

### Limitations

The following features are not currently supported when using the v2 build system:

- Specifying Node.js versions as codenames (for example, `hydrogen` or `lts/hydrogen`).
- Detecting Yarn version from `yarn.lock` file version.
- Detecting pnpm version detection based `pnpm-lock.yaml` file version.
- Detecting Node.js and package managers from `package.json` -> `"engines"`.
- `pipenv` and `Pipfile` support.

## Build environment

Cloudflare Pages builds are run in a [gVisor](https://gvisor.dev/docs/) container.

<PagesBuildEnvironment />

---

# Build watch paths

URL: https://developers.cloudflare.com/pages/configuration/build-watch-paths/

When you connect a git repository to Pages, by default a change to any file in the repository will trigger a Pages build. You can configure Pages to include or exclude specific paths to specify if Pages should skip a build for a given path. This can be especially helpful if you are using a monorepo project structure and want to limit the amount of builds being kicked off.

## Configure paths

To configure which paths are included and excluded:

1. In **Overview**, select your Pages project.
2. Go to **Settings** > **Build** > **Build watch paths**. Pages will default to setting your projectâ€™s includes paths to everything (\[\*]) and excludes paths to nothing (`[]`).

The configuration fields can be filled in two ways:

- **Static filepaths**: Enter the precise name of the file you are looking to include or exclude (for example, `docs/README.md`).
- **Wildcard syntax:** Use wildcards to match multiple path directories. You can specify wildcards at the start or end of your rule.

:::note[Wildcard syntax]

A wildcard (`*`) is a character that is used within rules. It can be placed alone to match anything or placed at the start or end of a rule to allow for better control over branch configuration. A wildcard will match zero or more characters.For example, if you wanted to match all branches that started with `fix/` then you would create the rule `fix/*` to match strings like `fix/1`, `fix/bugs`or `fix/`.

:::

For each path in a push event, build watch paths will be evaluated as follows:

- Paths satisfying excludes conditions are ignored first
- Any remaining paths are checked against includes conditions
- If any matching path is found, a build is triggered. Otherwise the build is skipped

Pages will bypass the path matching for a push event and default to building the project if:

- A push event contains 0 file changes, in case a user pushes a empty push event to trigger a build
- A push event contains 3000+ file changes or 20+ commits

## Examples

### Example 1

If you want to trigger a build from all changes within a set of directories, such as all changes in the folders `project-a/` and `packages/`

- Include paths: `project-a/*, packages/*`
- Exclude paths: \`\`

### Example 2

If you want to trigger a build for any changes, but want to exclude changes to a certain directory, such as all changes in a docs/ directory

- Include paths: `*`
- Exclude paths: `docs/*`

### Example 3

If you want to trigger a build for a specific file or specific filetype, for example all files ending in `.md`.

- Include paths: `*.md`
- Exclude paths: \`\`

---

# Debugging Pages

URL: https://developers.cloudflare.com/pages/configuration/debugging-pages/

When setting up your Pages project, you may encounter various errors that prevent you from successfully deploying your site. This guide gives an overview of some common errors and solutions.

## Check your build log

You can review build errors in your Pages build log. To access your build log:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com).
2. In **Account Home**, go to **Workers & Pages**.
3. In **Overview**, select your Pages project > **View build**.

![After logging in to the Cloudflare dashboard, access the build log by following the instructions above](~/assets/images/pages/platform/pages-build-log.png)

Possible errors in your build log are included in the following sections.

### Initializing build environment

Possible errors in this step could be caused by improper installation during Git integration.

To fix this in GitHub:

1. Log in to your GitHub account.
2. Go to **Settings** from your user icon > find **Applications** under Integrations.
3. Find **Cloudflare Pages** > **Configure** > scroll down and select **Uninstall**.
4. Re-authorize your GitHub user/organization on the Cloudflare dashboard.

To fix this in GitLab:

1. Log in to your GitLab account.
2. Go to **Preferences** from your user icon > **Applications**.
3. Find **Cloudflare Pages** > scroll down and select **Revoke**.

Be aware that you need a role of **Maintainer** or above to successfully link your repository, otherwise the build will fail.

### Cloning git repository

Possible errors in this step could be caused by lack of Git Large File Storage (LFS). Check your LFS usage by referring to the [GitHub](https://docs.github.com/en/billing/managing-billing-for-git-large-file-storage/viewing-your-git-large-file-storage-usage) and [GitLab](https://docs.gitlab.com/ee/topics/git/lfs/) documentation.

Make sure to also review your submodule configuration by going to the `.gitmodules` file in your root directory. This file needs to contain both a `path` and a `url` property.

Example of a valid configuration:

```js
[submodule "example"]
	path = example/path
	url = git://github.com/example/repo.git
```

Example of an invalid configuration:

```js
[submodule "example"]
	path = example/path
```

or

```js
[submodule "example"]
        url = git://github.com/example/repo.git
```

### Building application

Possible errors in this step could be caused by faulty setup in your Pages project. Review your build command, output folder and environment variables for any incorrect configuration.

:::note

Make sure there are no emojis or special characters as part of your commit message in a Pages project that is integrated with GitHub or GitLab as it can potentially cause issues when building the project.

:::

### Deploying to Cloudflare's global network

Possible errors in this step could be caused by incorrect Pages Functions configuration. Refer to the [Functions](/pages/functions/) documentation for more information on Functions setup.

If you are not using Functions or have reviewed that your Functions configuration does not contain any errors, review the [Cloudflare Status site](https://www.cloudflarestatus.com/) for Cloudflare network issues that could be causing the build failure.

## Differences between `pages.dev` and custom domains

If your custom domain is proxied (orange-clouded) through Cloudflare, your zone's settings, like caching, will apply.

If you are experiencing issues with new content not being shown, go to **Rules** > **Page Rules** in the Cloudflare dashboard and check for a Page Rule with **Cache Everything** enabled. If present, remove this rule as Pages handles its own cache.

If you are experiencing errors on your custom domain but not on your `pages.dev` domain, go to **DNS** > **Records** in the Cloudflare dashboard and set the DNS record for your project to be **DNS Only** (grey cloud). If the error persists, review your zone's configuration.

## Domain stuck in verification

If your [custom domain](/pages/configuration/custom-domains/) has not moved from the **Verifying** stage in the Cloudflare dashboard, refer to the following debugging steps.

### Blocked HTTP validation

Pages uses HTTP validation and needs to hit an HTTP endpoint during validation. If another Cloudflare product is in the way (such as [Access](/cloudflare-one/policies/access/), [a redirect](/rules/url-forwarding/), [a Worker](/workers/), etc.), validation cannot be completed.

To check this, run a `curl` command against your domain hitting `/.well-known/acme-challenge/randomstring`. For example:

```sh
curl -I https://example.com/.well-known/acme-challenge/randomstring
```

```sh output

HTTP/2 302
date: Mon, 03 Apr 2023 08:37:39 GMT
location: https://example.cloudflareaccess.com/cdn-cgi/access/login/example.com?kid=...&redirect_url=%2F.well-known%2Facme-challenge%2F...
access-control-allow-credentials: true
cache-control: private, max-age=0, no-store, no-cache, must-revalidate, post-check=0, pre-check=0
server: cloudflare
cf-ray: 7b1ffdaa8ad60693-MAN
```

In the example above, you are redirecting to Cloudflare Access (as shown by the `Location` header). In this case, you need to disable Access over the domain until the domain is verified. After the domain is verified, Access can be re-enabled.

You will need to do the same kind of thing for Redirect Rules or a Worker example too.

### Missing CAA records

If nothing is blocking the HTTP validation, then you may be missing Certification Authority Authorization (CAA) records. This is likely if you have disabled [Universal SSL](/ssl/edge-certificates/universal-ssl/) or use an external provider.

To check this, run a `dig` on the custom domain's apex (or zone, if this is a [subdomain zone](/dns/zone-setups/subdomain-setup/)). For example:

```sh
dig CAA example.com
```

```sh output

; <<>> DiG 9.10.6 <<>> CAA example.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 59018
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;example.com.		IN	CAA

;; ANSWER SECTION:
example.com.	300	IN	CAA	0 issue "amazon.com"

;; Query time: 92 msec
;; SERVER: 127.0.2.2#53(127.0.2.2)
;; WHEN: Mon Apr 03 10:15:51 BST 2023
;; MSG SIZE  rcvd: 76
```

In the above example, there is only a single CAA record which is allowing Amazon to issue ceritficates.

To resolve this, you will need to add the following CAA records which allows all of the Certificate Authorities (CAs) Cloudflare uses to issue certificates:

```
example.com.            300     IN      CAA     0 issue "letsencrypt.org"
example.com.            300     IN      CAA     0 issue "pki.goog; cansignhttpexchanges=yes"
example.com.            300     IN      CAA     0 issue "ssl.com"
example.com.            300     IN      CAA     0 issuewild "letsencrypt.org"
example.com.            300     IN      CAA     0 issuewild "pki.goog; cansignhttpexchanges=yes"
example.com.            300     IN      CAA     0 issuewild "ssl.com"
```

### Zone holds

A [zone hold](/fundamentals/setup/account/account-security/zone-holds/) will prevent Pages from adding a custom domain for a hostname under a zone hold.

To add a custom domain for a hostname with a zone hold, temporarily [release the zone hold](/fundamentals/setup/account/account-security/zone-holds/#release-zone-holds) during the custom domain setup process.

Once the custom domain has been successfully completed, you may [reinstate the zone hold](/fundamentals/setup/account/account-security/zone-holds/#enable-zone-holds).

:::caution[Still having issues]

If you have done the steps above and your domain is still verifying after 15 minutes, join our [Discord](https://discord.cloudflare.com) for support or contact our support team through the [Support Portal](https://dash.cloudflare.com/?to=/:account/support).

:::

## Resources

If you need additional guidance on build errors, contact your Cloudflare account team (Enterprise) or refer to the [Support Center](/support/contacting-cloudflare-support/) for guidance on contacting Cloudflare Support.

You can also ask questions in the Pages section of the [Cloudflare Developers Discord](https://discord.com/invite/cloudflaredev).

---

# Custom domains

URL: https://developers.cloudflare.com/pages/configuration/custom-domains/

import { Render } from "~/components";

When deploying your Pages project, you may wish to point custom domains (or subdomains) to your site.

## Add a custom domain

<Render file="custom-domain-steps" />

### Add a custom apex domain

If you are deploying to an apex domain (for example, `example.com`), then you will need to add your site as a Cloudflare zone and [configure your nameservers](#configure-nameservers).

#### Configure nameservers

To use a custom apex domain (for example, `example.com`) with your Pages project, [configure your nameservers to point to Cloudflare's nameservers](/dns/zone-setups/full-setup/setup/). If your nameservers are successfully pointed to Cloudflare, Cloudflare will proceed by creating a CNAME record for you.

### Add a custom subdomain

If you are deploying to a subdomain, it is not necessary for your site to be a Cloudflare zone. You will need to [add a custom CNAME record](#add-a-custom-cname-record) to point the domain to your Cloudflare Pages site. To deploy your Pages project to a custom apex domain, that custom domain must be a zone on the Cloudflare account you have created your Pages project on.

:::note

If the zone is on the Enterprise plan, make sure that you [release the zone hold](/fundamentals/setup/account/account-security/zone-holds/#release-zone-holds) before adding the custom domain. A zone hold would prevent the custom subdomain from activating.

:::

#### Add a custom CNAME record

If you do not want to point your nameservers to Cloudflare, you must create a custom CNAME record to use a subdomain with Cloudflare Pages. After logging in to your DNS provider, add a CNAME record for your desired subdomain, for example, `shop.example.com`. This record should point to your custom Pages subdomain, for example, `<YOUR_SITE>.pages.dev`.

| Type    | Name               | Content                 |
| ------- | ------------------ | ----------------------- |
| `CNAME` | `shop.example.com` | `<YOUR_SITE>.pages.dev` |

If your site is already managed as a Cloudflare zone, the CNAME record will be added automatically after you confirm your DNS record.

:::note

To ensure a custom domain is added successfully, you must go through the [Add a custom domain](#add-a-custom-domain) process described above. Manually adding a custom CNAME record pointing to your Cloudflare Pages site - without first associating the domain (or subdomains) in the Cloudflare Pages dashboard - will result in your domain failing to resolve at the CNAME record address, and display a [`522` error](/support/troubleshooting/http-status-codes/cloudflare-5xx-errors/#error-522-connection-timed-out).

:::

## Delete a custom domain

To detach a custom domain from your Pages project, you must modify your zone's DNS records.

First, log in to the Cloudflare dashboard > select your account in **Account Home** > select your website > **DNS**.

Then, in **DNS** > **Records**:

1. Locate your Pages project's CNAME record.
2. Select **Edit**.
3. Select **Delete**.

Next, in Account Home, go to **Workers & Pages**:

1. In **Overview**, select your Pages project.
2. Go to **Custom domains**.
3. Select the **three dot icon** next to your custom domain > **Remove domain**.

After completing these steps, your Pages project will only be accessible through the `*.pages.dev` subdomain you chose when creating your project.

## Disable access to `*.pages.dev` subdomain

To disable access to your project's provided `*.pages.dev` subdomain:

1. Use Cloudflare Access over your previews (`*.{project}.pages.dev`). Refer to [Customize preview deployments access](/pages/configuration/preview-deployments/#customize-preview-deployments-access).

2. Redirect the `*.pages.dev` URL associated with your production Pages project to a custom domain. You can use the account-level [Bulk Redirect](/rules/url-forwarding/bulk-redirects/) feature to redirect your `*.pages.dev` URL to a custom domain.

## Caching

For guidelines on caching, refer to [Caching and performance](/pages/configuration/serving-pages/#caching-and-performance).

## Known issues

### CAA records

Certification Authority Authorization (CAA) records allow you to restrict certificate issuance to specific Certificate Authorities (CAs).

This can cause issues when adding a [custom domain](/pages/configuration/custom-domains/) to your Pages project if you have CAA records that do not allow Cloudflare to issue a certificate for your custom domain.

To resolve this, add the necessary CAA records to allow Cloudflare to issue a certificate for your custom domain.

```
example.com.            300     IN      CAA     0 issue "letsencrypt.org"
example.com.            300     IN      CAA     0 issue "pki.goog; cansignhttpexchanges=yes"
example.com.            300     IN      CAA     0 issue "ssl.com"
example.com.            300     IN      CAA     0 issuewild "letsencrypt.org"
example.com.            300     IN      CAA     0 issuewild "pki.goog; cansignhttpexchanges=yes"
example.com.            300     IN      CAA     0 issuewild "ssl.com"
```

Refer to the [Certification Authority Authorization (CAA) FAQ](/ssl/edge-certificates/troubleshooting/caa-records/) for more information.

### Change DNS entry away from Pages and then back again

Once a custom domain is set up, if you change the DNS entry to point to something else (for example, your origin), the custom domain will become inactive. If you then change that DNS entry to point back at your custom domain, anybody using that DNS entry to visit your website will get errors until it becomes active again. If you want to redirect traffic away from your Pages project temporarily instead of changing the DNS entry, it would be better to use an [Origin rule](/rules/origin-rules/) or a [redirect rule](/rules/url-forwarding/single-redirects/create-dashboard/) instead.

## Relevant resources

- [Debugging Pages](/pages/configuration/debugging-pages/) - Review common errors when deploying your Pages project.

---

# Deploy Hooks

URL: https://developers.cloudflare.com/pages/configuration/deploy-hooks/

With Deploy Hooks, you can trigger deployments using event sources beyond commits in your source repository. Each event source may obtain its own unique URL, which will receive HTTP POST requests in order to initiate new deployments. This feature allows you to integrate Pages with new or existing workflows. For example, you may:

* Automatically deploy new builds whenever content in a Headless CMS changes
* Implement a fully customized CI/CD pipeline, deploying only under desired conditions
* Schedule a CRON trigger to update your website on a fixed timeline

To create a Deploy Hook:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In Account Home, select **Workers & Pages**.
3. In **Overview**, select your Pages project.
4. Go to **Settings** > **Builds & deployments** and select **Add deploy hook** to start configuration.

![Add a deploy hook on the Cloudflare dashboard](~/assets/images/pages/platform/deploy-hooks-add.png)

## Parameters needed

To configure your Deploy Hook, you must enter two key parameters:

1. **Deploy hook name:** a unique identifier for your Deploy Hook (for example, `contentful-site`)
2. **Branch to build:** the repository branch your Deploy Hook should build

![Choosing Deploy Hook name and branch to build on Cloudflare dashboard](~/assets/images/pages/platform/deploy-hooks-configure.png)

## Using your Deploy Hook

Once your configuration is complete, the Deploy Hookâ€™s unique URL is ready to be used. You will see both the URL as well as the POST request snippet available to copy.

![Reviewing the Deploy Hook's newly generated unique URL](~/assets/images/pages/platform/deploy-hooks-details.png)

Every time a request is sent to your Deploy Hook, a new build will be triggered. Review the **Source** column of your deployment log to see which deployment were triggered by a Deploy Hook.

![Reviewing which deployment was triggered by a Deploy Hook](~/assets/images/pages/platform/deploy-hooks-deployment-logs.png)

## Security Considerations

Deploy Hooks are uniquely linked to your project and do not require additional authentication to be used. While this does allow for complete flexibility, it is important that you protect these URLs in the same way you would safeguard any proprietary information or application secret.

If you suspect unauthorized usage of a Deploy Hook, you should delete the Deploy Hook and generate a new one in its place.

## Integrating Deploy Hooks with common CMS platforms

Every CMS provider is different and will offer different pathways in integrating with Pages' Deploy Hooks. The following section contains step-by-step instructions for a select number of popular CMS platforms.

### Contentful

Contentful supports integration with Cloudflare Pages via its **Webhooks** feature. In your Contentful project settings, go to **Webhooks**, create a new Webhook, and paste in your unique Deploy Hook URL in the **URL** field. Optionally, you can specify events that the Contentful Webhook should forward. By default, Contentful will trigger a Pages deployment on all project activity, which may be a bit too frequent. You can filter for specific events, such as Create, Publish, and many others.

![Configuring Deploy Hooks with Contentful](~/assets/images/pages/platform/contentful.png)

### Ghost

You can configure your Ghost website to trigger Pages deployments by creating a new **Custom Integration**. In your Ghost websiteâ€™s settings, create a new Custom Integration in the **Integrations** page.

Each custom integration created can have multiple **webhooks** attached to it. Create a new webhook by selecting **Add webhook** and **Site changed (rebuild)** as the **Event**. Then paste your unique Deploy Hook URL as the **Target URL** value. After creating this webhook, your Cloudflare Pages application will redeploy whenever your Ghost site changes.

![Configuring Deploy Hooks with Ghost](~/assets/images/pages/platform/ghost.png)

### Sanity

In your Sanity project's Settings page, find the **Webhooks** section, and add the Deploy Hook URL, as seen below. By default, the Webhook will trigger your Pages Deploy Hook for all datasets inside of your Sanity project. You can filter notifications to individual datasets, such as production, using the **Dataset** field:

![Configuring Deploy Hooks with Sanity](~/assets/images/pages/platform/sanity.png)

### WordPress

You can configure WordPress to trigger a Pages Deploy Hook by installing the free **WP Webhooks** plugin. The plugin includes a number of triggers, such as **Send Data on New Post, Send Data on Post Update** and **Send Data on Post Deletion**, all of which allow you to trigger new Pages deployments as your WordPress data changes. Select a trigger on the sidebar of the plugin settings and then [**Add Webhook URL**](https://wordpress.org/plugins/wp-webhooks/), pasting in your unique Deploy Hook URL.

![Configuring Deploy Hooks with WordPress](~/assets/images/pages/platform/wordpress.png)

### Strapi

In your Strapi Admin Panel, you can set up and configure webhooks to enhance your experience with Cloudflare Pages. In the Strapi Admin Panel:

1. Navigate to **Settings**.
2. Select **Webhooks**.
3. Select **Add New Webhook**.
4. In the **Name** form field, give your new webhook a unique name.
5. In the **URL** form field, paste your unique Cloudflare Deploy Hook URL.

In the Strapi Admin Panel, you can configure your webhook to be triggered based on events. You can adjust these settings to create a new deployment of your Cloudflare Pages site automatically when a Strapi entry or media asset is created, updated, or deleted.

Be sure to add the webhook configuration to the [production](https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/installation.html) Strapi application that powers your Cloudflare site.

![Configuring Deploy Hooks with Strapi](~/assets/images/pages/platform/strapi.png)

### Storyblok

You can set up and configure deploy hooks in Storyblok to trigger events. In your Storyblok space, go to **Settings** and scroll down to **Webhooks**. Paste your deploy hook into the **Story published & unpublished** field and select **Save**.

![Configuring Deploy Hooks with Storyblok](https://user-images.githubusercontent.com/53130544/161367254-ff475f3b-2821-4ee8-a175-8e96e779aa08.png)

---

# Early Hints

URL: https://developers.cloudflare.com/pages/configuration/early-hints/

[Early Hints](/cache/advanced-configuration/early-hints/) help the browser to load webpages faster. Early Hints is enabled automatically on all `pages.dev` domains and custom domains.

Early Hints automatically caches any [`preload`](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preload) and [`preconnect`](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preconnect) type [`Link` headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link) to send as Early Hints to the browser. The hints are sent to the browser before the full response is prepared, and the browser can figure out how to load the webpage faster for the end user. There are two ways to create these `Link` headers in Pages:

## Configure Early Hints

Early Hints can be created with either of the two methods detailed below.

### 1. Configure your `_headers` file

Create custom headers using the [`_headers` file](/pages/configuration/headers/). If you include a particular stylesheet on your `/blog/` section of your website, you would create the following rule:

```txt
/blog/*
  Link: </styles.css>; rel=preload; as=style
```

Pages will attach this `Link: </styles.css>; rel=preload; as=style` header. Early Hints will then emit this header as an Early Hint once cached.

### 2. Automatic `Link` header generation

In order to make the authoring experience easier, Pages also automatically generates `Link` headers from any `<link>` HTML elements with the following attributes:

* `href`
* `as` (optional)
* `rel` (one of `preconnect`, `preload`, or `modulepreload`)

`<link>` elements which contain any other additional attributes (for example, `fetchpriority`, `crossorigin` or `data-do-not-generate-a-link-header`) will not be used to generate `Link` headers in order to prevent accidentally losing any custom prioritization logic that would otherwise be dropped as an Early Hint.

This allows you to directly create Early Hints as you are writing your document, without needing to alternate between your HTML and `_headers` file.

```html
<html>
  <head>
    <link rel="preload" href="/style.css" as="style" />
    <link rel="stylesheet" href="/style.css" />
  </head>
</html>
```

### Disable automatic `Link` header generation Automatic `Link` header

Remove any automatically generated `Link` headers by adding the following to your `_headers` file:

```txt
/*
  ! Link
```

:::caution


Automatic `Link` header generation should not have any negative performance impact on your website. If you need to disable this feature, contact us by letting us know about your circumstance in our [Discord server](https://discord.com/invite/cloudflaredev).


:::

---

# Headers

URL: https://developers.cloudflare.com/pages/configuration/headers/

import { Render } from "~/components";

<Render product="workers" file="custom_headers" params={{ product: "pages" }} />

---

# Configuration

URL: https://developers.cloudflare.com/pages/configuration/

import { DirectoryListing } from "~/components"

<DirectoryListing />

---

# Monorepos

URL: https://developers.cloudflare.com/pages/configuration/monorepos/

While some apps are built from a single repository, Pages also supports apps with more complex setups. A monorepo is a repository that has multiple subdirectories each containing its own application.

## Set up

You can create multiple projects using the same repository, [in the same way that you would create any other Pages project](/pages/get-started/git-integration). You have the option to vary the build command and/or root directory of your project to tell Pages where you would like your build command to run. All project names must be unique even if connected to the same repository.

## Builds

When you connect a git repository to Pages, by default a change to any file in the repository will trigger a Pages build.

![Monorepo example diagram](~/assets/images/pages/configuration/pages-path.png)

Take for example `my-monorepo` above with two associated Pages projects (`marketing-app` and `ecommerce-app`) and their listed dependencies. By default, if you change a file in the project directory for `marketing-app`, then a build for the `ecommerce-app` project will also be triggered, even though `ecommerce-app` and its dependencies have not changed. To avoid such duplicate builds, you can include and exclude both [build watch paths](/pages/configuration/build-watch-paths) or [branches](/pages/configuration/branch-build-controls) to specify if Pages should skip a build for a given project.

## Git integration

Once you've created a separate Pages project for each of the projects within your Git repository, each Git push will issue a new build and deployment for all connected projects unless specified in your build configuration.

GitHub will display separate comments for each project with the updated project and deployment URL if there is a Pull Request associated with the branch.

### GitHub check runs and GitLab commit statuses

If you have multiple projects associated with your repository, your [GitHub check run](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks#checks) or [Gitlab commit status](https://docs.gitlab.com/ee/user/project/merge_requests/status_checks.html) will appear like the following on your repository:

![GitHub check run](~/assets/images/pages/configuration/ghcheckrun.png)
![GitLab commit status](~/assets/images/pages/configuration/glcommitstatus.png)

If a build skips for any reason (i.e. CI Skip, build watch paths, or branch deployment controls), the check run/commit status will not appear.

## Monorepo management tools:

While Pages does not provide specialized tooling for dependency management in monorepos, you may choose to bring additional tooling to help manage your repository. For simple subpackage management, you can utilize tools like [npm](https://docs.npmjs.com/cli/v8/using-npm/workspaces), [pnpm](https://pnpm.io/workspaces), and [Yarn](https://yarnpkg.com/features/workspaces) workspaces. You can also use more powerful tools such as [Turborepo](https://turbo.build/repo/docs), [NX](https://nx.dev/getting-started/intro), or [Lerna](https://lerna.js.org/docs/getting-started) to additionally manage dependencies and task execution.

## Limitations

- You must be using [Build System V2](/pages/configuration/build-image/#v2-build-system) or later in order for monorepo support to be enabled.
- You can configure a maximum of 5 Pages projects per repository. If you need this limit raised, contact your Cloudflare account team or use the [Limit Increase Request Form](https://docs.google.com/forms/d/e/1FAIpQLSd_fwAVOboH9SlutMonzbhCxuuuOmiU1L_I5O2CFbXf_XXMRg/viewform).

---

# Preview deployments

URL: https://developers.cloudflare.com/pages/configuration/preview-deployments/

Preview deployments allow you to preview new versions of your project without deploying it to production. To view preview deployments:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/login) and select your account.
2. In **Account Home**, select **Workers & Pages**.
3. Select your project and find the deployment you would like to view.

Every time you open a new pull request on your GitHub repository, Cloudflare Pages will create a unique preview URL, which will stay updated as you continue to push new commits to the branch. This is only true when pull requests originate from the repository itself.

![GitHub Preview URLs](~/assets/images/pages/configuration/ghpreviewurls.png)

For example, if you have a repository called `user-example` connected to Pages, this will give you a `user-example.pages.dev` subdomain. If `main` is your default branch, then any commits to the `main` branch will update your `user-example.pages.dev` content, as well as any [custom domains](/pages/configuration/custom-domains/) attached to the project.

![User-example repository's deployment status and preview](~/assets/images/pages/platform/preview-deployment-mergedone.png)

While developing `user-example`, you may push new changes to a `development` branch, for example.

In this example, after you create the new `development` branch, Pages will automatically generate a preview deployment for these changes available at `373f31e2.user-example.pages.dev` - where `373f31e2` is a randomly generated hash.

Each new branch you create will receive a new, randomly-generated hash in front of your `pages.dev` subdomain.

![User-example repository's newly generated preview deployment link and status](~/assets/images/pages/platform/preview-deployment-generated.png)

Any additional changes to the `development` branch will continue to update this `373f31e2.user-example.pages.dev` preview address until the `development` branch is merged with the `main` production branch.

Any custom domains, as well as your `user-example.pages.dev` site, will not be affected by preview deployments.

## Customize preview deployments access

You can use [Cloudflare Access](/cloudflare-one/policies/access/) to manage access to your deployment previews. By default, these deployment URLs are public. Enabling the access policy will restrict viewing project deployments to your Cloudflare account.

Once enabled, you can [set up a multi-user account](/fundamentals/setup/manage-members/) to allow other members of your team to view preview deployments.

By default, preview deployments are enabled and available publicly. In your project's settings, you can require visitors to authenticate to view preview deployment. This allows you to lock down access to these preview deployments to your teammates, organization, or anyone else you specify via [Access policies](/cloudflare-one/policies/).

To protect your preview deployments behind Cloudflare Access:

1. Log in to [Cloudflare dashboard](https://dash.cloudflare.com/login).
2. In Account Home, select **Workers & Pages**.
3. In **Overview**, select your Pages project.
4. Go to **Settings** > **General** > and select **Enable access policy**.

Note that this will only protect your preview deployments (for example, `373f31e2.user-example.pages.dev` and every other randomly generated preview link) and not your `*.pages.dev` domain or custom domain.

:::note

If you want to enable Access for your `*.pages.dev` domain and your custom domain along with your preview deployments, review [Known issues](/pages/platform/known-issues/#enable-access-on-your-pagesdev-domain) for instructions.

:::

## Preview aliases

When a preview deployment is published, it is given a unique, hash-based address â€” for example, `<hash>.<project>.pages.dev`. These are atomic and may always be visited in the future. However, Pages also creates an alias for `git` branch's name and updates it so that the alias always maps to the latest commit of that branch.

For example, if you push changes to a `development` branch (which is not associated with your Production environment), then Pages will deploy to `abc123.<project>.pages.dev` and alias `development.<project>.pages.dev` to it. Later, you may push new work to the `development` branch, which creates the `xyz456.<project>.pages.dev` deployment. At this point, the `development.<project>.pages.dev` alias points to the `xyz456` deployment, but `abc123.<project>.pages.dev` remains accessible directly.

Branch name aliases are lowercased and non-alphanumeric characters are replaced with a hyphen â€” for example, the `fix/api` branch creates the `fix-api.<project>.pages.dev` alias.

To view branch aliases within your Pages project, select **View build** for any preview deployment. **Deployment details** will display all aliases associated with that deployment.

You can attach a Preview alias to a custom domain by [adding a custom domain to a branch](https://developers.cloudflare.com/pages/how-to/custom-branch-aliases/).

---

# Redirects

URL: https://developers.cloudflare.com/pages/configuration/redirects/

import { Render } from "~/components";

<Render product="workers" file="redirects" params={{ product: "pages" }} />

---

# Serving Pages

URL: https://developers.cloudflare.com/pages/configuration/serving-pages/

Cloudflare Pages includes a number of defaults for serving your Pages sites. This page details some of those decisions, so you can understand how Pages works, and how you might want to override some of the default behaviors.

## Route matching

If an HTML file is found with a matching path to the current route requested, Pages will serve it. Pages will also redirect HTML pages to their extension-less counterparts: for instance, `/contact.html` will be redirected to `/contact`, and `/about/index.html` will be redirected to `/about/`.

## Not Found behavior

You can define a custom page to be displayed when Pages cannot find a requested file by creating a `404.html` file. Pages will then attempt to find the closest 404 page. If one is not found in the same directory as the route you are currently requesting, it will continue to look up the directory tree for a matching `404.html` file, ending in `/404.html`. This means that you can define custom 404 paths for situations like `/blog/404.html` and `/404.html`, and Pages will automatically render the correct one depending on the situation.

## Single-page application (SPA) rendering

If your project does not include a top-level `404.html` file, Pages assumes that you are deploying a single-page application. This includes frameworks like React, Vue, and Angular. Pages' default single-page application behavior matches all incoming paths to the root (`/`), allowing you to capture URLs like `/about` or `/help` and respond to them from within your SPA.

## Caching and performance

### Recommendations

In most situations, you should avoid setting up any custom caching on your site. Pages comes with built in caching defaults that are optimized for caching as much as possible, while providing the most up to date content. Every time you deploy an asset to Pages, the asset remains cached on the Cloudflare CDN until your next deployment.

Therefore, if you add caching to your [custom domain](/pages/configuration/custom-domains/), it may lead to stale assets being served after a deployment.

In addition, adding caching to your custom domain may cause issues with [Pages redirects](/pages/configuration/redirects/) or [Pages functions](/pages/functions/). These issues can occur because the cached response might get served to your end user before Pages can act on the request.

However, there are some situations where [Cache Rules](/cache/how-to/cache-rules/) on your custom domain does make sense. For example, you may have easily cacheable locations for immutable assets, such as CSS or JS files with content hashes in their file names. Custom caching can help in this case, speeding up the user experience until the file (and associated filename) changes. Just make sure that your caching does not interfere with any redirects or Functions.

Note that when you use Cloudflare Pages, the static assets that you upload as part of your Pages project are automatically served from [Tiered Cache](/cache/how-to/tiered-cache/). You do not need to separately enable Tiered Cache for the custom domain that your Pages project runs on.

:::note[Purging the cache]


If you notice stale assets being served after a new deployment, go to your zone and then **Caching** > **Configuration** > [**Purge Everything**](/cache/how-to/purge-cache/purge-everything/) to ensure the latest deployment gets served.


:::

### Behavior

For browser caching, Pages always sends `Etag` headers for `200 OK` responses, which the browser then returns in an `If-None-Match` header on subsequent requests for that asset. Pages compares the `If-None-Match` header from the request with the `Etag` it's planning to send, and if they match, Pages instead responds with a `304 Not Modified` that tells the browser it's safe to use what is stored in local cache.

Pages currently returns `200` responses for HTTP range requests; however, the team is working on adding spec-compliant `206` partial responses.

Pages will also serve Gzip and Brotli responses whenever possible.

## Asset retention

We will insert assets into the cache on a per-data center basis. Assets have a time-to-live (TTL) of one week but can also disappear at any time. If you do a new deploy, the assets could exist in that data center up to one week.

## Headers

By default, Pages automatically adds several [HTTP response headers](https://developer.mozilla.org/en-US/docs/Glossary/Response_header) when serving assets, including:

```txt title="Headers always added"
Access-Control-Allow-Origin: *
Cf-Ray: $CLOUDFLARE_RAY_ID
Referrer-Policy: strict-origin-when-cross-origin
Etag: $ETAG
Content-Type: $CONTENT_TYPE
X-Content-Type-Options: nosniff
Server: cloudflare
```

:::note


The [`Cf-Ray`](/fundamentals/reference/cloudflare-ray-id/) header is unique to Cloudflare.


:::

```txt title="Headers sometimes added"
// if the asset has been encoded
Cache-Control: no-transform
Content-Encoding: $CONTENT_ENCODING

// if the asset is cacheable (the request does not have an `Authorization` or `Range` header)
Cache-Control: public, max-age=0, must-revalidate

// if requesting the asset over a preview URL
X-Robots-Tag: noindex
```

To modify the headers added by Cloudflare Pages - perhaps to add [Early Hints](/pages/configuration/early-hints/) - update the [\_headers file](/pages/configuration/headers/) in your project.

---

# Advanced mode

URL: https://developers.cloudflare.com/pages/functions/advanced-mode/

import { TabItem, Tabs } from "~/components"

Advanced mode allows you to develop your Pages Functions with a `_worker.js` file rather than the `/functions` directory.

In some cases, Pages Functions' built-in file path based routing and middleware system is not desirable for existing applications. You may have a Worker that is complex and difficult to splice up into Pages' file-based routing system. For these cases, Pages offers the ability to define a `_worker.js` file in the output directory of your Pages project.

When using a `_worker.js` file, the entire `/functions` directory is ignored, including its routing and middleware characteristics. Instead, the `_worker.js` file is deployed and must be written using the [Module Worker syntax](/workers/runtime-apis/handlers/fetch/). If you have never used Module syntax, refer to the [JavaScript modules blog post](https://blog.cloudflare.com/workers-javascript-modules/) to learn more. Using Module syntax enables JavaScript frameworks to generate a Worker as part of the Pages output directory contents.

## Set up a Function

In advanced mode, your Function will assume full control of all incoming HTTP requests to your domain. Your Function is required to make or forward requests to your project's static assets. Failure to do so will result in broken or unwanted behavior. Your Function must be written in Module syntax.

After making a `_worker.js` file in your output directory, add the following code snippet:

<Tabs> <TabItem label="JavaScript" icon="seti:javascript">

```js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      // TODO: Add your custom /api/* logic here.
      return new Response('Ok');
    }
    // Otherwise, serve the static assets.
    // Without this, the Worker will error and no assets will be served.
    return env.ASSETS.fetch(request);
  },
}
```

</TabItem> <TabItem label="TypeScript" icon="seti:typescript">

```ts
// Note: You would need to compile your TS into JS and output it as a `_worker.js` file. We do not read `_worker.ts`

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      // TODO: Add your custom /api/* logic here.
      return new Response('Ok');
    }
    // Otherwise, serve the static assets.
    // Without this, the Worker will error and no assets will be served.
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
```

</TabItem> </Tabs>

In the above code, you have configured your Function to return a response under all requests headed for `/api/`. Otherwise, your Function will fallback to returning static assets.

* The `env.ASSETS.fetch()` function will allow you to return assets on a given request.
* `env` is the object that contains your environment variables and bindings.
* `ASSETS` is a default Function binding that allows communication between your Function and Pages' asset serving resource.
* `fetch()` calls to Pages' asset-serving resource and serves the requested asset.

## Migrate from Workers

To migrate an existing Worker to your Pages project, copy your Worker code and paste it into your new `_worker.js` file. Then handle static assets by adding the following code snippet to `_worker.js`:

```ts
return env.ASSETS.fetch(request);
```

## Deploy your Function

After you have set up a new Function or migrated your Worker to `_worker.js`, make sure your `_worker.js` file is placed in your Pages' project output directory. Deploy your project through your Git integration for advanced mode to take effect.

---

# Rollbacks

URL: https://developers.cloudflare.com/pages/configuration/rollbacks/

Rollbacks allow you to instantly revert your project to a previous production deployment.

Any production deployment that has been successfully built is a valid rollback target. When your project has rolled back to a previous deployment, you may still rollback to deployments that are newer than your current version. Note that preview deployments are not valid rollback targets.

In order to perform a rollback, go to **Deployments** in your Pages project. Browse the **All deployments** list and select the three dotted actions menu for the desired target. Select **Rollback to this deployment** for a confirmation window to appear. When confirmed, your project's production deployment will change instantly.

![Deployments for your Pages project that can be used for rollbacks](~/assets/images/pages/platform/rollbacks.png)

## Related resources

* [Preview Deployments](/pages/configuration/preview-deployments/)
* [Branch deployment controls](/pages/configuration/branch-build-controls/)

---

# Debugging and logging

URL: https://developers.cloudflare.com/pages/functions/debugging-and-logging/

Access your Functions logs by using the Cloudflare dashboard or the [Wrangler CLI](/workers/wrangler/commands/#deployment-tail).

Logs are a powerful debugging tool that can help you test and monitor the behavior of your Pages Functions once they have been deployed. Logs are available for every deployment of your Pages project.

Logs provide detailed information about events and can give insight into:

* Successful or failed requests to your Functions.
* Uncaught exceptions thrown by your Functions.
* Custom `console.log`s declared within your Functions.
* Production issues that cannot be easily reproduced.
* Real-time view of incoming requests to your application.

There are two ways to start a logging session:

1. Run `wrangler pages deployment tail` [in your terminal](/pages/functions/debugging-and-logging/#view-logs-with-wrangler).
2. Use the [Cloudflare dashboard](/pages/functions/debugging-and-logging/#view-logs-in-the-cloudflare-dashboard).

## Add custom logs

Custom logs are `console.log()` statements that you can add yourself inside your Functions. When streaming logs for deployments that contain these Functions, the statements will appear in both `wrangler pages deployment tail` and dashboard outputs.

Below is an example of a custom `console.log` statement  inside a Pages Function:

```js
export async function onRequest(context) {
  console.log(`[LOGGING FROM /hello]: Request came from ${context.request.url}`);

  return new Response("Hello, world!");
}
```

After you deploy the code above, run `wrangler pages deployment tail` in your terminal. Then access the route at which your Function lives. Your terminal will display:

![Run wrangler pages deployment tail](~/assets/images/pages/platform/functions/wrangler-custom-logs.png)

Your dashboard will display:

![Follow the above steps to access custom logs in the dashboard](~/assets/images/pages/platform/functions/dash-custom-logs.png)

## View logs with Wrangler

`wrangler pages deployment tail` enables developers to livestream logs for a specific project and deployment.

To get started, run `wrangler pages deployment tail` in your Pages project directory. This will log any incoming requests to your application in your local terminal.

The output of each `wrangler pages deployment tail` log is a structured JSON object:

```js
{
  "outcome": "ok",
  "scriptName": null,
  "exceptions": [
    {
      "stack": "    at src/routes/index.tsx17:4\n    at new Promise (<anonymous>)\n",
      "name": "Error",
      "message": "An error has occurred",
      "timestamp": 1668542036110
    }
  ],
  "logs": [],
  "eventTimestamp": 1668542036104,
  "event": {
    "request": {
      "url": "https://pages-fns.pages.dev",
      "method": "GET",
      "headers": {},
      "cf": {}
    },
    "response": {
      "status": 200
    }
  },
  "id": 0
}
```

`wrangler pages deployment tail` allows you to customize a logging session to better suit your needs. Refer to the [`wrangler pages deployment tail` documentation](/workers/wrangler/commands/#deployment-tail) for available configuration options.

## View logs in the Cloudflare Dashboard

To view logs for your `production` or `preview` environments associated with any deployment:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/) and select your account.
2. In **Account Home**, select **Workers & Pages**.
3. Select your Pages project, go to the deployment you want to view logs for and select **View details** > **Functions**.

Logging is available for all customers (Free, Paid, Enterprise).

## Limits

The following limits apply to Functions logs:

* Logs are not stored. You can start and stop the stream at any time to view them, but they do not persist.
* Logs will not display if the Functionâ€™s requests per second are over 100 for the last five minutes.
* Logs from any [Durable Objects](/pages/functions/bindings/#durable-objects) your Functions bind to will show up in the Cloudflare dashboard.
* A maximum of 10 clients can view a deploymentâ€™s logs at one time. This can be a combination of either dashboard sessions or `wrangler pages deployment tail` calls.

## Sourcemaps

If you're debugging an uncaught exception, you might find that the [stack traces](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack) in your logs contain line numbers to generated JavaScript files. Using Pages' support for [source maps](https://web.dev/articles/source-maps) you can get stack traces that match with the line numbers and symbols of your original source code.

:::note


When developing fullstack applications, many build tools (including wrangler for Pages Functions and most fullstack frameworks) will generate source maps for both the client and server, ensure your build step is configured to only emit server sourcemaps or use an additional build step to remove the client source maps. Public source maps might expose the source code of your application to the user.


:::

Refer to [Source maps and stack traces](/pages/functions/source-maps/) for an in-depth explanation.

---

# Bindings

URL: https://developers.cloudflare.com/pages/functions/bindings/

import { Render, TabItem, Tabs, WranglerConfig } from "~/components";

A [binding](/workers/runtime-apis/bindings/) enables your Pages Functions to interact with resources on the Cloudflare developer platform. Use bindings to integrate your Pages Functions with Cloudflare resources like [KV](/kv/concepts/how-kv-works/), [Durable Objects](/durable-objects/), [R2](/r2/), and [D1](/d1/). You can set bindings for both production and preview environments.

This guide will instruct you on configuring a binding for your Pages Function. You must already have a Cloudflare Developer Platform resource set up to continue.

:::note

Pages Functions only support a subset of all [bindings](/workers/runtime-apis/bindings/), which are listed on this page.

:::

## KV namespaces

[Workers KV](/kv/concepts/kv-namespaces/) is Cloudflare's key-value storage solution.

To bind your KV namespace to your Pages Function, you can configure a KV namespace binding in the [Wrangler configuration file](/pages/functions/wrangler-configuration/#kv-namespaces) or the Cloudflare dashboard.

To configure a KV namespace binding via the Cloudflare dashboard:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In **Account Home**, select **Workers & Pages**.
3. Select your Pages project > **Settings**.
4. Select your Pages environment > **Bindings** > **Add** > **KV namespace**.
5. Give your binding a name under **Variable name**.
6. Under **KV namespace**, select your desired namespace.
7. Redeploy your project for the binding to take effect.

Below is an example of how to use KV in your Function. In the following example, your KV namespace binding is called `TODO_LIST` and you can access the binding in your Function code on `context.env`:

<Tabs> <TabItem label="JavaScript" icon="seti:javascript">

```js
export async function onRequest(context) {
	const task = await context.env.TODO_LIST.get("Task:123");
	return new Response(task);
}
```

</TabItem> <TabItem label="TypeScript" icon="seti:typescript">

```ts
interface Env {
	TODO_LIST: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
	const task = await context.env.TODO_LIST.get("Task:123");
	return new Response(task);
};
```

</TabItem> </Tabs>

### Interact with your KV namespaces locally

You can interact with your KV namespace bindings locally in one of two ways:

- Configure your Pages project's Wrangler file and run [`npx wrangler pages dev`](/workers/wrangler/commands/#dev-1).
- Pass arguments to `wrangler pages dev` directly.

To interact with your KV namespace binding locally by passing arguments to the Wrangler CLI, add `-k <BINDING_NAME>` or `--kv=<BINDING_NAME>` to the `wrangler pages dev` command. For example, if your KV namespace is bound your Function via the `TODO_LIST` binding, access the KV namespace in local development by running:

```sh
npx wrangler pages dev <OUTPUT_DIR> --kv=TODO_LIST
```

<Render file="cli-precedence-over-file" />

## Durable Objects

[Durable Objects](/durable-objects/) (DO) are Cloudflare's strongly consistent data store that power capabilities such as connecting WebSockets and handling state.

<Render file="do-note" product="pages" />

To bind your Durable Object to your Pages Function, you can configure a Durable Object binding in the [Wrangler configuration file](/pages/functions/wrangler-configuration/#kv-namespaces) or the Cloudflare dashboard.

To configure a Durable Object binding via the Cloudflare dashboard:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In **Account Home**, select **Workers & Pages**.
3. Select your Pages project > **Settings**.
4. Select your Pages environment > **Bindings** > **Add** > **Durable Object**.
5. Give your binding a name under **Variable name**.
6. Under **Durable Object namespace**, select your desired namespace.
7. Redeploy your project for the binding to take effect.

Below is an example of how to use Durable Objects in your Function. In the following example, your DO binding is called `DURABLE_OBJECT` and you can access the binding in your Function code on `context.env`:

<Tabs> <TabItem label="JavaScript" icon="seti:javascript">

```js
export async function onRequestGet(context) {
	const id = context.env.DURABLE_OBJECT.newUniqueId();
	const stub = context.env.DURABLE_OBJECT.get(id);

	// Pass the request down to the durable object
	return stub.fetch(context.request);
}
```

</TabItem> <TabItem label="TypeScript" icon="seti:typescript">

```ts
interface Env {
	DURABLE_OBJECT: DurableObjectNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
	const id = context.env.DURABLE_OBJECT.newUniqueId();
	const stub = context.env.DURABLE_OBJECT.get(id);

	// Pass the request down to the durable object
	return stub.fetch(context.request);
};
```

</TabItem> </Tabs>

### Interact with your Durable Object namespaces locally

You can interact with your Durable Object bindings locally in one of two ways:

- Configure your Pages project's Wrangler file and run [`npx wrangler pages dev`](/workers/wrangler/commands/#dev-1).
- Pass arguments to `wrangler pages dev` directly.

While developing locally, to interact with a Durable Object namespace, run `wrangler dev` in the directory of the Worker exporting the Durable Object. In another terminal, run `wrangler pages dev` in the directory of your Pages project.

To interact with your Durable Object namespace locally via the Wrangler CLI, append `--do <BINDING_NAME>=<CLASS_NAME>@<SCRIPT_NAME>` to `wrangler pages dev`. `CLASS_NAME` indicates the Durable Object class name and `SCRIPT_NAME` the name of your Worker.

For example, if your Worker is called `do-worker` and it declares a Durable Object class called `DurableObjectExample`, access this Durable Object by running `npx wrangler dev` in the `do-worker` directory. At the same time, run `npx wrangler pages dev <OUTPUT_DIR> --do MY_DO=DurableObjectExample@do-worker` in your Pages' project directory. Interact with the `MY_DO` binding in your Function code by using `context.env` (for example, `context.env.MY_DO`).

<Render file="cli-precedence-over-file" />

## R2 buckets

[R2](/r2/) is Cloudflare's blob storage solution that allows developers to store large amounts of unstructured data without the egress fees.

To bind your R2 bucket to your Pages Function, you can configure a R2 bucket binding in the [Wrangler configuration file](/pages/functions/wrangler-configuration/#r2-buckets) or the Cloudflare dashboard.

To configure a R2 bucket binding via the Cloudflare dashboard:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In **Account Home**, select **Workers & Pages**.
3. Select your Pages project > **Settings**.
4. Select your Pages environment > **Bindings** > **Add** > **R2 bucket**.
5. Give your binding a name under **Variable name**.
6. Under **R2 bucket**, select your desired R2 bucket.
7. Redeploy your project for the binding to take effect.

Below is an example of how to use R2 buckets in your Function. In the following example, your R2 bucket binding is called `BUCKET` and you can access the binding in your Function code on `context.env`:

<Tabs> <TabItem label="JavaScript" icon="seti:javascript">

```js
export async function onRequest(context) {
	const obj = await context.env.BUCKET.get("some-key");
	if (obj === null) {
		return new Response("Not found", { status: 404 });
	}
	return new Response(obj.body);
}
```

</TabItem> <TabItem label="TypeScript" icon="seti:typescript">

```ts
interface Env {
	BUCKET: R2Bucket;
}

export const onRequest: PagesFunction<Env> = async (context) => {
	const obj = await context.env.BUCKET.get("some-key");
	if (obj === null) {
		return new Response("Not found", { status: 404 });
	}
	return new Response(obj.body);
};
```

</TabItem> </Tabs>

### Interact with your R2 buckets locally

You can interact with your R2 bucket bindings locally in one of two ways:

- Configure your Pages project's Wrangler file and run [`npx wrangler pages dev`](/workers/wrangler/commands/#dev-1).
- Pass arguments to `wrangler pages dev` directly.

:::note

By default, Wrangler automatically persists data to local storage. For more information, refer to [Local development](/workers/local-development/).

:::

To interact with an R2 bucket locally via the Wrangler CLI, add `--r2=<BINDING_NAME>` to the `wrangler pages dev` command. If your R2 bucket is bound to your Function with the `BUCKET` binding, access this R2 bucket in local development by running:

```sh
npx wrangler pages dev <OUTPUT_DIR> --r2=BUCKET
```

Interact with this binding by using `context.env` (for example, `context.env.BUCKET`.)

<Render file="cli-precedence-over-file" />

## D1 databases

[D1](/d1/) is Cloudflareâ€™s native serverless database.

To bind your D1 database to your Pages Function, you can configure a D1 database binding in the [Wrangler configuration file](/pages/functions/wrangler-configuration/#d1-databases) or the Cloudflare dashboard.

To configure a D1 database binding via the Cloudflare dashboard:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In **Account Home**, select **Workers & Pages**.
3. Select your Pages project > **Settings**.
4. Select your Pages environment > **Bindings** > **Add**> **D1 database bindings**.
5. Give your binding a name under **Variable name**.
6. Under **D1 database**, select your desired D1 database.
7. Redeploy your project for the binding to take effect.

Below is an example of how to use D1 in your Function. In the following example, your D1 database binding is `NORTHWIND_DB` and you can access the binding in your Function code on `context.env`:

<Tabs> <TabItem label="JavaScript" icon="seti:javascript">

```js
export async function onRequest(context) {
	// Create a prepared statement with our query
	const ps = context.env.NORTHWIND_DB.prepare("SELECT * from users");
	const data = await ps.first();

	return Response.json(data);
}
```

</TabItem> <TabItem label="TypeScript" icon="seti:typescript">

```ts
interface Env {
	NORTHWIND_DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
	// Create a prepared statement with our query
	const ps = context.env.NORTHWIND_DB.prepare("SELECT * from users");
	const data = await ps.first();

	return Response.json(data);
};
```

</TabItem> </Tabs>

### Interact with your D1 databases locally

You can interact with your D1 database bindings locally in one of two ways:

- Configure your Pages project's Wrangler file and run [`npx wrangler pages dev`](/workers/wrangler/commands/#dev-1).
- Pass arguments to `wrangler pages dev` directly.

To interact with a D1 database via the Wrangler CLI while [developing locally](/d1/best-practices/local-development/#develop-locally-with-pages), add `--d1 <BINDING_NAME>=<DATABASE_ID>` to the `wrangler pages dev` command.

If your D1 database is bound to your Pages Function via the `NORTHWIND_DB` binding and the `database_id` in your Wrangler file is `xxxx-xxxx-xxxx-xxxx-xxxx`, access this database in local development by running:

```sh
npx wrangler pages dev <OUTPUT_DIR> --d1 NORTHWIND_DB=xxxx-xxxx-xxxx-xxxx-xxxx
```

Interact with this binding by using `context.env` (for example, `context.env.NORTHWIND_DB`.)

:::note

By default, Wrangler automatically persists data to local storage. For more information, refer to [Local development](/workers/local-development/).

:::

Refer to the [D1 Workers Binding API documentation](/d1/worker-api/) for the API methods available on your D1 binding.

<Render file="cli-precedence-over-file" />

## Vectorize indexes

[Vectorize](/vectorize/) is Cloudflareâ€™s native vector database.

To bind your Vectorize index to your Pages Function, you can configure a Vectorize index binding in the [Wrangler configuration file](/pages/functions/wrangler-configuration/#vectorize-indexes) or the Cloudflare dashboard.

To configure a Vectorize index binding via the Cloudflare dashboard:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In **Account Home**, select **Workers & Pages**.
3. Choose whether you would like to set up the binding in your **Production** or **Preview** environment.
4. Select your Pages project > **Settings**.
5. Select your Pages environment > **Bindings** > **Add** > **Vectorize index**.
6. Give your binding a name under **Variable name**.
7. Under **Vectorize index**, select your desired Vectorize index.
8. Redeploy your project for the binding to take effect.

### Use Vectorize index bindings

To use Vectorize index in your Pages Function, you can access your Vectorize index binding in your Pages Function code. In the following example, your Vectorize index binding is called `VECTORIZE_INDEX` and you can access the binding in your Pages Function code on `context.env`.

<Tabs> <TabItem label="JavaScript" icon="seti:javascript">

```js
// Sample vectors: 3 dimensions wide.
//
// Vectors from a machine-learning model are typically ~100 to 1536 dimensions
// wide (or wider still).
const sampleVectors = [
	{
		id: "1",
		values: [32.4, 74.1, 3.2],
		metadata: { url: "/products/sku/13913913" },
	},
	{
		id: "2",
		values: [15.1, 19.2, 15.8],
		metadata: { url: "/products/sku/10148191" },
	},
	{
		id: "3",
		values: [0.16, 1.2, 3.8],
		metadata: { url: "/products/sku/97913813" },
	},
	{
		id: "4",
		values: [75.1, 67.1, 29.9],
		metadata: { url: "/products/sku/418313" },
	},
	{
		id: "5",
		values: [58.8, 6.7, 3.4],
		metadata: { url: "/products/sku/55519183" },
	},
];

export async function onRequest(context) {
	let path = new URL(context.request.url).pathname;
	if (path.startsWith("/favicon")) {
		return new Response("", { status: 404 });
	}

	// You only need to insert vectors into your index once
	if (path.startsWith("/insert")) {
		// Insert some sample vectors into your index
		// In a real application, these vectors would be the output of a machine learning (ML) model,
		// such as Workers AI, OpenAI, or Cohere.
		let inserted = await context.env.VECTORIZE_INDEX.insert(sampleVectors);

		// Return the number of IDs we successfully inserted
		return Response.json(inserted);
	}
}
```

</TabItem> <TabItem label="TypeScript" icon="seti:typescript">

```ts
export interface Env {
	// This makes our vector index methods available on context.env.VECTORIZE_INDEX.*
	// For example, context.env.VECTORIZE_INDEX.insert() or query()
	VECTORIZE_INDEX: VectorizeIndex;
}

// Sample vectors: 3 dimensions wide.
//
// Vectors from a machine-learning model are typically ~100 to 1536 dimensions
// wide (or wider still).
const sampleVectors: Array<VectorizeVector> = [
	{
		id: "1",
		values: [32.4, 74.1, 3.2],
		metadata: { url: "/products/sku/13913913" },
	},
	{
		id: "2",
		values: [15.1, 19.2, 15.8],
		metadata: { url: "/products/sku/10148191" },
	},
	{
		id: "3",
		values: [0.16, 1.2, 3.8],
		metadata: { url: "/products/sku/97913813" },
	},
	{
		id: "4",
		values: [75.1, 67.1, 29.9],
		metadata: { url: "/products/sku/418313" },
	},
	{
		id: "5",
		values: [58.8, 6.7, 3.4],
		metadata: { url: "/products/sku/55519183" },
	},
];

export const onRequest: PagesFunction<Env> = async (context) => {
	let path = new URL(context.request.url).pathname;
	if (path.startsWith("/favicon")) {
		return new Response("", { status: 404 });
	}

	// You only need to insert vectors into your index once
	if (path.startsWith("/insert")) {
		// Insert some sample vectors into your index
		// In a real application, these vectors would be the output of a machine learning (ML) model,
		// such as Workers AI, OpenAI, or Cohere.
		let inserted = await context.env.VECTORIZE_INDEX.insert(sampleVectors);

		// Return the number of IDs we successfully inserted
		return Response.json(inserted);
	}
};
```

</TabItem> </Tabs>

## Workers AI

[Workers AI](/workers-ai/) allows you to run machine learning models, powered by serverless GPUs, on Cloudflareâ€™s global network.

To bind Workers AI to your Pages Function, you can configure a Workers AI binding in the [Wrangler configuration file](/pages/functions/wrangler-configuration/#workers-ai) or the Cloudflare dashboard.

When developing locally using Wrangler, you can define an AI binding using the `--ai` flag. Start Wrangler in development mode by running [`wrangler pages dev --ai AI`](/workers/wrangler/commands/#dev) to expose the `context.env.AI` binding.

To configure a Workers AI binding via the Cloudflare dashboard:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In **Account Home**, select **Workers & Pages**.
3. Select your Pages project > **Settings**.
4. Select your Pages environment > **Bindings** > **Add** > **Workers AI**.
5. Give your binding a name under **Variable name**.
6. Redeploy your project for the binding to take effect.

### Use Workers AI bindings

To use Workers AI in your Pages Function, you can access your Workers AI binding in your Pages Function code. In the following example, your Workers AI binding is called `AI` and you can access the binding in your Pages Function code on `context.env`.

<Tabs> <TabItem label="JavaScript" icon="seti:javascript">

```js
export async function onRequest(context) {
	const input = { prompt: "What is the origin of the phrase Hello, World" };

	const answer = await context.env.AI.run(
		"@cf/meta/llama-3.1-8b-instruct",
		input,
	);

	return Response.json(answer);
}
```

</TabItem> <TabItem label="TypeScript" icon="seti:typescript">

```ts
interface Env {
	AI: Ai;
}

export const onRequest: PagesFunction<Env> = async (context) => {
	const input = { prompt: "What is the origin of the phrase Hello, World" };

	const answer = await context.env.AI.run(
		"@cf/meta/llama-3.1-8b-instruct",
		input,
	);

	return Response.json(answer);
};
```

</TabItem> </Tabs>

### Interact with your Workers AI binding locally

<Render file="ai-local-usage-charges" product="workers" />

You can interact with your Workers AI bindings locally in one of two ways:

- Configure your Pages project's Wrangler file and run [`npx wrangler pages dev`](/workers/wrangler/commands/#dev-1).
- Pass arguments to `wrangler pages dev` directly.

To interact with a Workers AI binding via the Wrangler CLI while developing locally, run:

```sh
npx wrangler pages dev --ai=<BINDING_NAME>
```

<Render file="cli-precedence-over-file" />

## Service bindings

[Service bindings](/workers/runtime-apis/bindings/service-bindings/) enable you to call a Worker from within your Pages Function.

To bind your Pages Function to a Worker, configure a Service binding in your Pages Function using the [Wrangler configuration file](/pages/functions/wrangler-configuration/#service-bindings) or the Cloudflare dashboard.

To configure a Service binding via the Cloudflare dashboard:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In **Account Home**, select **Workers & Pages**.
3. Select your Pages project > **Settings**.
4. Select your Pages environment > **Bindings** > **Add** > **Service binding**.
5. Give your binding a name under **Variable name**.
6. Under **Service**, select your desired Worker.
7. Redeploy your project for the binding to take effect.

Below is an example of how to use Service bindings in your Function. In the following example, your Service binding is called `SERVICE` and you can access the binding in your Function code on `context.env`:

<Tabs> <TabItem label="JavaScript" icon="seti:javascript">

```js
export async function onRequestGet(context) {
	return context.env.SERVICE.fetch(context.request);
}
```

</TabItem> <TabItem label="TypeScript" icon="seti:typescript">

```ts
interface Env {
	SERVICE: Fetcher;
}

export const onRequest: PagesFunction<Env> = async (context) => {
	return context.env.SERVICE.fetch(context.request);
};
```

</TabItem> </Tabs>

### Interact with your Service bindings locally

You can interact with your Service bindings locally in one of two ways:

- Configure your Pages project's Wrangler file and run [`npx wrangler pages dev`](/workers/wrangler/commands/#dev-1).
- Pass arguments to `wrangler pages dev` directly.

To interact with a [Service binding](/workers/runtime-apis/bindings/service-bindings/) while developing locally, run the Worker you want to bind to via `wrangler dev` and in parallel, run `wrangler pages dev` with `--service <BINDING_NAME>=<SCRIPT_NAME>` where `SCRIPT_NAME` indicates the name of the Worker. For example, if your Worker is called `my-worker`, connect with this Worker by running it via `npx wrangler dev` (in the Worker's directory) alongside `npx wrangler pages dev <OUTPUT_DIR> --service MY_SERVICE=my-worker` (in the Pages' directory). Interact with this binding by using `context.env` (for example, `context.env.MY_SERVICE`).

If you set up the Service binding via the Cloudflare dashboard, you will need to append `wrangler pages dev` with `--service <BINDING_NAME>=<SCRIPT_NAME>` where `BINDING_NAME` is the name of the Service binding and `SCRIPT_NAME` is the name of the Worker.

For example, to develop locally, if your Worker is called `my-worker`, run `npx wrangler dev` in the `my-worker` directory. In a different terminal, also run `npx wrangler pages dev <OUTPUT_DIR> --service MY_SERVICE=my-worker` in your Pages project directory. Interact with this Service binding by using `context.env` (for example, `context.env.MY_SERVICE`).

Wrangler also supports running your Pages project and bound Workers in the same dev session with one command. To try it out, pass multiple -c flags to Wrangler, like this: `wrangler pages dev -c wrangler.toml -c ../other-worker/wrangler.toml`. The first argument must point to your Pages configuration file, and the subsequent configurations will be accessible via a Service binding from your Pages project.

:::caution

Support for running multiple Workers in the same dev session with one Wrangler command is experimental, and subject to change as we work on the experience. If you run into bugs or have any feedback, [open an issue on the workers-sdk repository](https://github.com/cloudflare/workers-sdk/issues/new)

:::

<Render file="cli-precedence-over-file" />

## Queue Producers

[Queue Producers](/queues/configuration/javascript-apis/#producer) enable you to send messages into a queue within your Pages Function.

To bind a queue to your Pages Function, configure a queue producer binding in your Pages Function using the [Wrangler configuration file](/pages/functions/wrangler-configuration/#queues-producers) or the Cloudflare dashboard:

To configure a queue producer binding via the Cloudflare dashboard:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In **Account Home**, select **Workers & Pages**.
3. Select your Pages project > **Settings**.
4. Select your Pages environment > **Functions** > **Add** > **Queue**.
5. Give your binding a name under **Variable name**.
6. Under **Queue**, select your desired queue.
7. Redeploy your project for the binding to take effect.

Below is an example of how to use a queue producer binding in your Function. In this example, the binding is named `MY_QUEUE` and you can access the binding in your Function code on `context.env`:

<Tabs> <TabItem label="JavaScript" icon="seti:javascript">

```js
export async function onRequest(context) {
	await context.env.MY_QUEUE.send({
		url: request.url,
		method: request.method,
		headers: Object.fromEntries(request.headers),
	});

	return new Response("Sent!");
}
```

</TabItem> <TabItem label="TypeScript" icon="seti:typescript">

```ts
interface Env {
	MY_QUEUE: Queue<any>;
}

export const onRequest: PagesFunction<Env> = async (context) => {
	await context.env.MY_QUEUE.send({
		url: request.url,
		method: request.method,
		headers: Object.fromEntries(request.headers),
	});

	return new Response("Sent!");
};
```

</TabItem> </Tabs>

### Interact with your Queue Producer binding locally

If using a queue producer binding with a Pages Function, you will be able to send events to a queue locally. However, it is not possible to consume events from a queue with a Pages Function. You will have to create a [separate consumer Worker](/queues/get-started/#5-create-your-consumer-worker) with a [queue consumer handler](/queues/configuration/javascript-apis/#consumer) to consume events from the queue. Wrangler does not yet support running separate producer Functions and consumer Workers bound to the same queue locally.

## Hyperdrive configs

:::note

PostgreSQL drivers like [`Postgres.js`](https://github.com/porsager/postgres) depend on Node.js APIs. Pages Functions with Hyperdrive bindings must be [deployed with Node.js compatibility](/workers/runtime-apis/nodejs).

<WranglerConfig>

```toml title="wrangler.toml"
compatibility_flags = [ "nodejs_compat" ]
compatibility_date = "2024-09-23"
```

</WranglerConfig>

:::

[Hyperdrive](/hyperdrive/) is a service for connecting to your existing databases from Cloudflare Workers and Pages Functions.

To bind your Hyperdrive config to your Pages Function, you can configure a Hyperdrive binding in the [Wrangler configuration file](/pages/functions/wrangler-configuration/#hyperdrive) or the Cloudflare dashboard.

To configure a Hyperdrive binding via the Cloudflare dashboard:
1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In **Account Home**, select **Workers & Pages**.
3. Select your Pages project > **Settings**.
4. Select your Pages environment > **Bindings** > **Add** > **Hyperdrive**.
5. Give your binding a name under **Variable name**.
6. Under **Hyperdrive configuration**, select your desired configuration.
7. Redeploy your project for the binding to take effect.

Below is an example of how to use Hyperdrive in your Function. In the following example, your Hyperdrive config is named `HYPERDRIVE` and you can access the binding in your Function code on `context.env`:

<Tabs> <TabItem label="JavaScript" icon="seti:javascript">

```js
import postgres from "postgres";

export async function onRequest(context) {
	// create connection to postgres database
	const sql = postgres(context.env.HYPERDRIVE.connectionString);

	try {
		const result = await sql`SELECT id, name, value FROM records`;

		return Response.json({result: result})
	} catch (e) {
		return Response.json({error: e.message, {status: 500}});
	}
}
```

</TabItem> <TabItem label="TypeScript" icon="seti:typescript">

```ts
import postgres from "postgres";

interface Env {
	HYPERDRIVE: Hyperdrive;
}

type MyRecord = {
	id: number;
	name: string;
	value: string;
};

export const onRequest: PagesFunction<Env> = async (context) => {
	// create connection to postgres database
	const sql = postgres(context.env.HYPERDRIVE.connectionString);

	try {
		const result = await sql<MyRecord[]>`SELECT id, name, value FROM records`;

		return Response.json({result: result})
	} catch (e) {
		return Response.json({error: e.message, {status: 500}});
	}
};
```

</TabItem> </Tabs>

### Interact with your Hyperdrive binding locally

To interact with your Hyperdrive binding locally, you must provide a local connection string to your database that your Pages project will connect to directly. You can set an environment variable `WRANGLER_HYPERDRIVE_LOCAL_CONNECTION_STRING_<BINDING_NAME>` with the connection string of the database, or use the Wrangler file to configure your Hyperdrive binding with a `localConnectionString` as specified in [Hyperdrive documentation for local development](/hyperdrive/configuration/local-development/). Then, run [`npx wrangler pages dev <OUTPUT_DIR>`](/workers/wrangler/commands/#dev-1).

## Analytics Engine

The [Analytics Engine](/analytics/analytics-engine/) binding enables you to write analytics within your Pages Function.

To bind an Analytics Engine dataset to your Pages Function, you must configure an Analytics Engine binding using the [Wrangler configuration file](/pages/functions/wrangler-configuration/#analytics-engine-datasets) or the Cloudflare dashboard:

To configure an Analytics Engine binding via the Cloudflare dashboard:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In **Account Home**, select **Workers & Pages**.
3. Select your Pages project > **Settings**.
4. Select your Pages environment > **Bindings** > **Add** > **Analytics engine**.
5. Give your binding a name under **Variable name**.
6. Under **Dataset**, input your desired dataset.
7. Redeploy your project for the binding to take effect.

Below is an example of how to use an Analytics Engine binding in your Function. In the following example, the binding is called `ANALYTICS_ENGINE` and you can access the binding in your Function code on `context.env`:

<Tabs> <TabItem label="JavaScript" icon="seti:javascript">

```js
export async function onRequest(context) {
	const url = new URL(context.request.url);

	context.env.ANALYTICS_ENGINE.writeDataPoint({
		indexes: [],
		blobs: [url.hostname, url.pathname],
		doubles: [],
	});

	return new Response("Logged analytic");
}
```

</TabItem> <TabItem label="TypeScript" icon="seti:typescript">

```ts
interface Env {
	ANALYTICS_ENGINE: AnalyticsEngineDataset;
}

export const onRequest: PagesFunction<Env> = async (context) => {
	const url = new URL(context.request.url);

	context.env.ANALYTICS_ENGINE.writeDataPoint({
		indexes: [],
		blobs: [url.hostname, url.pathname],
		doubles: [],
	});

	return new Response("Logged analytic");
};
```

</TabItem> </Tabs>

### Interact with your Analytics Engine binding locally

You cannot use an Analytics Engine binding locally.

## Environment variables

An [environment variable](/workers/configuration/environment-variables/) is an injected value that can be accessed by your Functions. Environment variables are a type of binding that allow you to attach text strings or JSON values to your Pages Function. It is stored as plain text. Set your environment variables directly within the Cloudflare dashboard for both your production and preview environments at runtime and build-time.

To add environment variables to your Pages project, you can use the [Wrangler configuration file](/pages/functions/wrangler-configuration/#environment-variables) or the Cloudflare dashboard.

To configure an environment variable via the Cloudflare dashboard:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In **Account Home**, select **Workers & Pages**.
3. Select your Pages project > **Settings**.
4. Select your Pages environment > **Variables and Secrets** > **Add** .
5. After setting a variable name and value, select **Save**.

Below is an example of how to use environment variables in your Function. The environment variable in this example is `ENVIRONMENT` and you can access the environment variable on `context.env`:

<Tabs> <TabItem label="JavaScript" icon="seti:javascript">

```js
export function onRequest(context) {
	if (context.env.ENVIRONMENT === "development") {
		return new Response("This is a local environment!");
	} else {
		return new Response("This is a live environment");
	}
}
```

</TabItem> <TabItem label="TypeScript" icon="seti:typescript">

```ts
interface Env {
	ENVIRONMENT: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
	if (context.env.ENVIRONMENT === "development") {
		return new Response("This is a local environment!");
	} else {
		return new Response("This is a live environment");
	}
};
```

</TabItem> </Tabs>

### Interact with your environment variables locally

You can interact with your environment variables locally in one of two ways:

- Configure your Pages project's Wrangler file and running `npx wrangler pages dev`.
- Pass arguments to [`wrangler pages dev`](/workers/wrangler/commands/#dev-1) directly.

To interact with your environment variables locally via the Wrangler CLI, add `--binding=<ENVIRONMENT_VARIABLE_NAME>=<ENVIRONMENT_VARIABLE_VALUE>` to the `wrangler pages dev` command:

```sh
npx wrangler pages dev --binding=<ENVIRONMENT_VARIABLE_NAME>=<ENVIRONMENT_VARIABLE_VALUE>
```

## Secrets

Secrets are a type of binding that allow you to attach encrypted text values to your Pages Function. You cannot see secrets after you set them and can only access secrets programmatically on `context.env`. Secrets are used for storing sensitive information like API keys and auth tokens.

To add secrets to your Pages project:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In **Account Home**, select **Workers & Pages**.
3. Select your Pages project > select **Settings**.
4. Select your Pages environment > **Variables and Secrets** > **Add**.
5. Set a variable name and value.
6. Select **Encrypt** to create your secret.
7. Select **Save**.

You use secrets the same way as environment variables. When setting secrets with Wrangler or in the Cloudflare dashboard, it needs to be done before a deployment that uses those secrets. For more guidance, refer to [Environment variables](#environment-variables).

### Local development with secrets
<Render file="secrets-in-dev" product="workers" />

---

# API reference

URL: https://developers.cloudflare.com/pages/functions/api-reference/

The following methods can be used to configure your Pages Function.

## Methods

### `onRequests`

The `onRequest` method will be called unless a more specific `onRequestVerb` method is exported. For example, if both `onRequest` and `onRequestGet` are exported, only `onRequestGet` will be called for `GET` requests.

* <code>onRequest(context[EventContext](#eventcontext))</code> Response | Promise\<Response>
  * This function will be invoked on all requests no matter what the request method is, as long as no specific request verb (like one of the methods below) is exported.
* <code>onRequestGet(context[EventContext](#eventcontext))</code> Response | Promise\<Response>
  * This function will be invoked on all `GET` requests.
* <code>onRequestPost(context[EventContext](#eventcontext))</code> Response | Promise\<Response>
  * This function will be invoked on all `POST` requests.
* <code>onRequestPatch(context[EventContext](#eventcontext))</code> Response | Promise\<Response>
  * This function will be invoked on all `PATCH` requests.
* <code>onRequestPut(context[EventContext](#eventcontext))</code> Response | Promise\<Response>
  * This function will be invoked on all `PUT` requests.
* <code>onRequestDelete(context[EventContext](#eventcontext))</code> Response | Promise\<Response>
  * This function will be invoked on all `DELETE` requests.
* <code>onRequestHead(context[EventContext](#eventcontext))</code> Response | Promise\<Response>
  * This function will be invoked on all `HEAD` requests.
* <code>onRequestOptions(context[EventContext](#eventcontext))</code> Response | Promise\<Response>
  * This function will be invoked on all `OPTIONS` requests.



### `env.ASSETS.fetch()`

The `env.ASSETS.fetch()` function allows you to fetch a static asset from your Pages project.

You can pass a [Request object](/workers/runtime-apis/request/), URL string, or URL object to `env.ASSETS.fetch()` function. The URL must be to the pretty path, not directly to the asset. For example, if you had the path `/users/index.html`, you will request `/users/` instead of `/users/index.html`. This method call will run the header and redirect rules, modifying the response that is returned.

## Types

### `EventContext`


The following are the properties on the `context` object which are passed through on the `onRequest` methods:

* `request` [Request](/workers/runtime-apis/request/)

  This is the incoming [Request](/workers/runtime-apis/request/).

* `functionPath` string

  This is the path of the request.

* <code>waitUntil(promisePromise\<any>)</code> void

  Refer to [`waitUntil` documentation](/workers/runtime-apis/context/#waituntil) for more information.

* <code>passThroughOnException()</code> void

  Refer to [`passThroughOnException` documentation](/workers/runtime-apis/context/#passthroughonexception) for more information. Note that this will not work on an [advanced mode project](/pages/functions/advanced-mode/).

* <code>next(input?Request | string, init?RequestInit)</code> Promise\<Response>

  Passes the request through to the next Function or to the asset server if no other Function is available.

* `env` [EnvWithFetch](#envwithfetch)

* `params` Params\<P>

  Holds the values from [dynamic routing](/pages/functions/routing/#dynamic-routes).

  In the following example, you have a dynamic path that is `/users/[user].js`. When you visit the site on `/users/nevi` the `params` object would look like:

  ```js
  {
    user: "nevi"
  }
  ```

  This allows you fetch the dynamic value from the path:

  ```js
  export function onRequest(context) {
    return new Response(`Hello ${context.params.user}`);
  }
  ```

  Which would return `"Hello nevi"`.

* `data` Data



### `EnvWithFetch`

Holds the environment variables, secrets, and bindings for a Function. This also holds the `ASSETS` binding which is how you can fallback to the asset-serving behavior.

---

# Functions

URL: https://developers.cloudflare.com/pages/functions/

import { DirectoryListing } from "~/components"

Pages Functions allows you to build full-stack applications by executing code on the Cloudflare network with [Cloudflare Workers](/workers/). With Functions, you can introduce application aspects such as authenticating, handling form submissions, or working with middleware. [Workers runtime features](/workers/runtime-apis/) are configurable on Pages Functions, including [compatibility with a subset of Node.js APIs](/workers/runtime-apis/nodejs) and the ability to set a [compatibility date or compatibility flag](/workers/configuration/compatibility-dates/). Use Functions to deploy server-side code to enable dynamic functionality without running a dedicated server.

To provide feedback or ask questions on Functions, join the [Cloudflare Developers Discord](https://discord.com/invite/cloudflaredev) and connect with the Cloudflare team in the [#functions channel](https://discord.com/channels/595317990191398933/910978223968518144).

<DirectoryListing />

---

# Local development

URL: https://developers.cloudflare.com/pages/functions/local-development/

Run your Pages application locally with our Wrangler Command Line Interface (CLI).

## Install Wrangler

To get started with Wrangler, refer to the [Install/Update Wrangler](/workers/wrangler/install-and-update/).

## Run your Pages project locally

The main command for local development on Pages is `wrangler pages dev`. This will let you run your Pages application locally, which includes serving static assets and running your Functions.

With your folder of static assets set up, run the following command to start local development:

```sh
npx wrangler pages dev <DIRECTORY-OF-ASSETS>
```

This will then start serving your Pages project. You can press `b` to open the browser on your local site, (available, by default, on [http://localhost:8788](http://localhost:8788)).

:::note

If you have a [Wrangler configuration file](/pages/functions/wrangler-configuration/) file configured for your Pages project, you can run [`wrangler pages dev`](/workers/wrangler/commands/#dev-1) without specifying a directory.

:::

### HTTPS support

To serve your local development server over HTTPS with a self-signed certificate, you can [set `local_protocol` via the [Wrangler configuration file](/pages/functions/wrangler-configuration/#local-development-settings) or you can pass the `--local-protocol=https` argument to [`wrangler pages dev`](/workers/wrangler/commands/#dev-1):

```sh
npx wrangler pages dev --local-protocol=https <DIRECTORY-OF-ASSETS>
```

## Attach bindings to local development

To attach a binding to local development, refer to [Bindings](/pages/functions/bindings/) and find the Cloudflare Developer Platform resource you would like to work with.

## Additional Wrangler configuration

If you are using a Wrangler configuration file in your project, you can set up dev server values like: `port`, `local protocol`, `ip`, and `port`. For more information, read about [configuring local development settings](/pages/functions/wrangler-configuration/#local-development-settings).

---

# Get started

URL: https://developers.cloudflare.com/pages/functions/get-started/

This guide will instruct you on creating and deploying a Pages Function.

## Prerequisites

You must have a Pages project set up on your local machine or deployed on the Cloudflare dashboard. To create a Pages project, refer to [Get started](/pages/get-started/).

## Create a Function

To get started with generating a Pages Function, create a `/functions` directory. Make sure that the `/functions` directory is at the root of your Pages project (and not in the static root, such as `/dist`).

:::note[Advanced mode]


For existing applications where Pages Functionsâ€™ built-in file path based routing and middleware system is not desirable, use [Advanced mode](/pages/functions/advanced-mode/). Advanced mode allows you to develop your Pages Functions with a `_worker.js` file rather than the `/functions` directory.


:::

Writing your Functions files in the `/functions` directory will automatically generate a Worker with custom functionality at predesignated routes.

Copy and paste the following code into a `helloworld.js` file that you create in your `/functions` folder:

```js
export function onRequest(context) {
  return new Response("Hello, world!")
}
```

In the above example code, the `onRequest` handler takes a request [`context`](/pages/functions/api-reference/#eventcontext) object. The handler must return a `Response` or a `Promise` of a `Response`.

This Function will run on the `/helloworld` route and returns `"Hello, world!"`. The reason this Function is available on this route is because the file is named `helloworld.js`. Similarly, if this file was called `howdyworld.js`, this function would run on `/howdyworld`.

Refer to [Routing](/pages/functions/routing/) for more information on route customization.

### Runtime features

[Workers runtime features](/workers/runtime-apis/) are configurable on Pages Functions, including [compatibility with a subset of Node.js APIs](/workers/runtime-apis/nodejs) and the ability to set a [compatibility date or compatibility flag](/workers/configuration/compatibility-dates/).

Set these configurations by passing an argument to your [Wrangler](/workers/wrangler/commands/#dev-1) command or by setting them in the dashboard. To set Pages compatibility flags in the Cloudflare dashboard:

1. Log into the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. Select **Workers & Pages** and select your Pages project.
3. Select **Settings** > **Functions** > **Compatibility Flags**.
4. Configure your Production and Preview compatibility flags as needed.

Additionally, use other Cloudflare products such as [D1](/d1/) (serverless DB) and [R2](/r2/) from within your Pages project by configuring [bindings](/pages/functions/bindings/).

## Deploy your Function

After you have set up your Function, deploy your Pages project. Deploy your project by:

* Connecting your [Git provider](/pages/get-started/git-integration/).
* Using [Wrangler](/workers/wrangler/commands/#pages) from the command line.

:::caution

[Direct Upload](/pages/get-started/direct-upload/) from the Cloudflare dashboard is currently not supported with Functions.
:::

## Related resources

* Customize your [Function's routing](/pages/functions/routing/)
* Review the [API reference](/pages/functions/api-reference/)
* Learn how to [debug your Function](/pages/functions/debugging-and-logging/)

---

# Metrics

URL: https://developers.cloudflare.com/pages/functions/metrics/

Functions metrics can help you diagnose issues and understand your workloads by showing performance and usage data for your Functions.

## Functions metrics

Functions metrics aggregate request data for an individual Pages project. To view your Functions metrics:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In **Account Home**, select **Workers & Pages** > in **Overview**, select your Pages project.
3. In your Pages project, select **Functions Metrics**.

There are three metrics that can help you understand the health of your Function:

1. Requests success.
2. Requests errors.
3. Invocation Statuses.

### Requests

In **Functions metrics**, you can see historical request counts broken down into total requests, successful requests and errored requests. Information on subrequests is available by selecting **Subrequests**.

* **Total**: All incoming requests registered by a Function. Requests blocked by [Web Application Firewall (WAF)](https://www.cloudflare.com/waf/) or other security features will not count.
* **Success**: Requests that returned a `Success` or `Client Disconnected` [invocation status](#invocation-statuses).
* **Errors**: Requests that returned a `Script Threw Exception`, `Exceeded Resources`, or `Internal Error` [invocation status](#invocation-statuses)
* **Subrequests**: Requests triggered by calling `fetch` from within a Function. When your Function fetches a static asset, it will count as a subrequest. A subrequest that throws an uncaught error will not be counted.

Request traffic data may display a drop off near the last few minutes displayed in the graph for time ranges less than six hours. This does not reflect a drop in traffic, but a slight delay in aggregation and metrics delivery.

### Invocation statuses

Function invocation statuses indicate whether a Function executed successfully or failed to generate a response in the Workers runtime. Invocation statuses differ from HTTP status codes. In some cases, a Function invocation succeeds but does not generate a successful HTTP status because of another error encountered outside of the Workers runtime. Some invocation statuses result in a Workers error code being returned to the client.

| Invocation status      | Definition                                            | Workers error code | Graph QL field       |
| ---------------------- | ----------------------------------------------------- | ------------------ | -------------------- |
| Success                | Worker script executed successfully                   |                    | success              |
| Client disconnected    | HTTP client disconnected before the request completed |                    | clientDisconnected   |
| Script threw exception | Worker script threw an unhandled JavaScript exception | 1101               | scriptThrewException |
| Exceeded resources^1   | Worker script exceeded runtime limits                 | 1102, 1027         | exceededResources    |
| Internal error^2       | Workers runtime encountered an error                  |                    | internalError        |

1. The Exceeded Resources status may appear when the Worker exceeds a [runtime limit](/workers/platform/limits/#request-limits). The most common cause is excessive CPU time, but is also caused by a script exceeding startup time or free tier limits.
2. The Internal Error status may appear when the Workers runtime fails to process a request due to an internal failure in our system. These errors are not caused by any issue with the Function code nor any resource limit. While requests with Internal Error status are rare, some may appear during normal operation. These requests are not counted towards usage for billing purposes. If you notice an elevated rate of requests with Internal Error status, review [www.cloudflarestatus.com](http://www.cloudflarestatus.com).

To further investigate exceptions, refer to [Debugging and Logging](/pages/functions/debugging-and-logging)

### CPU time per execution

The CPU Time per execution chart shows historical CPU time data broken down into relevant quantiles using [reservoir sampling](https://en.wikipedia.org/wiki/Reservoir_sampling).  Learn more about [interpreting quantiles](https://www.statisticshowto.com/quantile-definition-find-easy-steps/).

In some cases, higher quantiles may appear to exceed [CPU time limits](/workers/platform/limits/#cpu-time) without generating invocation errors because of a mechanism in the Workers runtime that allows rollover CPU time for requests below the CPU limit.

### Duration per execution

The **Duration** chart underneath **Median CPU time** in the **Functions metrics** dashboard shows historical [duration](/workers/platform/limits/#duration) per Function execution. The data is broken down into relevant quantiles, similar to the CPU time chart.

Understanding duration on your Function is useful when you are intending to do a significant amount of computation on the Function itself. This is because you may have to use the Standard or Unbound usage model which allows up to 30 seconds of CPU time.

Workers on the [Bundled Usage Model](/workers/platform/pricing/#workers) may have high durations, even with a 50 ms CPU time limit, if they are running many network-bound operations like fetch requests and waiting on responses.

### Metrics retention

Functions metrics can be inspected for up to three months in the past in maximum increments of one week. The **Functions metrics** dashboard in your Pages project includes the charts and information described above.

---

# Middleware

URL: https://developers.cloudflare.com/pages/functions/middleware/

Middleware is reusable logic that can be run before your [`onRequest`](/pages/functions/api-reference/#onrequests) function. Middlewares are typically utility functions. Error handling, user authentication, and logging are typical candidates for middleware within an application.

## Add middleware

Middleware is similar to standard Pages Functions but middleware is always defined in a `_middleware.js` file in your project's `/functions` directory. A `_middleware.js` file exports an [`onRequest`](/pages/functions/api-reference/#onrequests) function. The middleware will run on requests that match any Pages Functions in the same `/functions` directory, including subdirectories. For example, `functions/users/_middleware.js` file will match requests for `/functions/users/nevi`, `/functions/users/nevi/123` and `functions/users`.

If you want to run a middleware on your entire application, including in front of static files, create a `functions/_middleware.js` file.

In `_middleware.js` files, you may export an `onRequest` handler or any of its method-specific variants. The following is an example middleware which handles any errors thrown in your project's Pages Functions. This example uses the `next()` method available in the request handler's context object:

```js
export async function onRequest(context) {
  try {
    return await context.next();
  } catch (err) {
    return new Response(`${err.message}\n${err.stack}`, { status: 500 });
  }
}
```

## Chain middleware

You can export an array of Pages Functions as your middleware handler. This allows you to chain together multiple middlewares that you want to run. In the following example, you can handle any errors generated from your project's Functions, and check if the user is authenticated:

```js
async function errorHandling(context) {
  try {
    return await context.next();
  } catch (err) {
    return new Response(`${err.message}\n${err.stack}`, { status: 500 });
  }
}

function authentication(context) {
  if (context.request.headers.get("x-email") != "admin@example.com") {
    return new Response("Unauthorized", { status: 403 });
  }

  return context.next();
}

export const onRequest = [errorHandling, authentication];
```

In the above example, the `errorHandling` function will run first. It will capture any errors in the `authentication` function and any errors in any other subsequent Pages Functions.

---

# Module support

URL: https://developers.cloudflare.com/pages/functions/module-support/

Pages Functions provide support for several module types, much like [Workers](https://blog.cloudflare.com/workers-javascript-modules/). This means that you can import and use external modules such as WebAssembly (Wasm), `text` and `binary` files inside your Functions code.

This guide will instruct you on how to use these different module types inside your Pages Functions.

## ECMAScript Modules

ECMAScript modules (or in short ES Modules) is the official, [standardized](https://tc39.es/ecma262/#sec-modules) module system for JavaScript. It is the recommended mechanism for writing modular and reusable JavaScript code.

[ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) are defined by the use of `import` and `export` statements. Below is an example of a script written in ES Modules format, and a Pages Function that imports that module:

```js
export function greeting(name: string): string {
  return `Hello ${name}!`;
}
```

```js
import { greeting } from "../src/greeting.ts";

export async function onRequest(context) {
    return new Response(`${greeting("Pages Functions")}`);
}
```

## WebAssembly Modules

[WebAssembly](/workers/runtime-apis/webassembly/) (abbreviated Wasm) allows you to compile languages like Rust, Go, or C to a binary format that can run in a wide variety of environments, including web browsers, Cloudflare Workers, Cloudflare Pages Functions, and other WebAssembly runtimes.

The distributable, loadable, and executable unit of code in WebAssembly is called a [module](https://webassembly.github.io/spec/core/syntax/modules.html).

Below is a basic example of how you can import Wasm Modules inside your Pages Functions code:

```js
import addModule from "add.wasm";

export async function onRequest() {
	const addInstance = await WebAssembly.instantiate(addModule);
	return new Response(
		`The meaning of life is ${addInstance.exports.add(20, 1)}`
	);
}
```

## Text Modules

Text Modules are a non-standardized means of importing resources such as HTML files as a `String`.

To import the below HTML file into your Pages Functions code:

```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Hello Pages Functions!</h1>
  </body>
</html>
```

Use the following script:

```js
import html from "../index.html";

export async function onRequest() {
	return new Response(
		html,
    {
      headers: { "Content-Type": "text/html" }
    }
	);
}
```

## Binary Modules

Binary Modules are a non-standardized way of importing binary data such as images as an `ArrayBuffer`.

Below is a basic example of how you can import the data from a binary file inside your Pages Functions code:

```js
import data from "../my-data.bin";

export async function onRequest() {
	return new Response(
		data,
    {
      headers: { "Content-Type": "application/octet-stream" }
    }
	);
}
```

---

# Pricing

URL: https://developers.cloudflare.com/pages/functions/pricing/

Requests to your Functions are billed as Cloudflare Workers requests. Workers plans and pricing can be found [in the Workers documentation](/workers/platform/pricing/).

## Paid Plans

Requests to your Pages functions count towards your quota for Workers Paid plans, including requests from your Function to KV or Durable Object bindings.

Pages supports the [Standard usage model](/workers/platform/pricing/#example-pricing-standard-usage-model).

:::note


Workers Enterprise accounts are billed based on the usage model specified in their contract. To switch to the Standard usage model, reach out to your Customer Success Manager (CSM). Some Workers Enterprise customers maintain the ability to [change usage models](/workers/platform/pricing/#how-to-switch-usage-models).


:::

### Static asset requests

On both free and paid plans, requests to static assets are free and unlimited. A request is considered static when it does not invoke Functions. Refer to [Functions invocation routes](/pages/functions/routing/#functions-invocation-routes) to learn more about when Functions are invoked.

## Free Plan

Requests to your Pages Functions count towards your quota for the Workers Free plan. For example, you could use 50,000 Functions requests and 50,000 Workers requests to use your full 100,000 daily request usage. The free plan daily request limit resets at midnight UTC.

---

# Routing

URL: https://developers.cloudflare.com/pages/functions/routing/

import { FileTree } from "~/components";

Functions utilize file-based routing. Your `/functions` directory structure determines the designated routes that your Functions will run on. You can create a `/functions` directory with as many levels as needed for your project's use case. Review the following directory:

<FileTree>
- ...
- functions
	- index.js
	- helloworld.js
	- howdyworld.js
	- fruits
		- index.js
		- apple.js
		- banana.js
</FileTree>

The following routes will be generated based on the above file structure. These routes map the URL pattern to the `/functions` file that will be invoked when a visitor goes to the URL:

| File path                   | Route                     |
| --------------------------- | ------------------------- |
| /functions/index.js         | example.com               |
| /functions/helloworld.js    | example.com/helloworld    |
| /functions/howdyworld.js    | example.com/howdyworld    |
| /functions/fruits/index.js  | example.com/fruits        |
| /functions/fruits/apple.js  | example.com/fruits/apple  |
| /functions/fruits/banana.js | example.com/fruits/banana |

:::note[Trailing slash]

Trailing slash is optional. Both `/foo` and `/foo/` will be routed to `/functions/foo.js` or `/functions/foo/index.js`. If your project has both a `/functions/foo.js` and `/functions/foo/index.js` file, `/foo` and `/foo/` would route to `/functions/foo/index.js`.

:::

If no Function is matched, it will fall back to a static asset if there is one. Otherwise, the Function will fall back to the [default routing behavior](/pages/configuration/serving-pages/) for Pages' static assets.

## Dynamic routes

Dynamic routes allow you to match URLs with parameterized segments. This can be useful if you are building dynamic applications. You can accept dynamic values which map to a single path by changing your filename.

### Single path segments

To create a dynamic route, place one set of brackets around your filename â€“ for example, `/users/[user].js`. By doing this, you are creating a placeholder for a single path segment:

| Path               | Matches? |
| ------------------ | -------- |
| /users/nevi        | Yes      |
| /users/daniel      | Yes      |
| /profile/nevi      | No       |
| /users/nevi/foobar | No       |
| /nevi              | No       |

### Multipath segments

By placing two sets of brackets around your filename â€“ for example, `/users/[[user]].js` â€“ you are matching any depth of route after `/users/`:

| Path                  | Matches? |
| --------------------- | -------- |
| /users/nevi           | Yes      |
| /users/daniel         | Yes      |
| /profile/nevi         | No       |
| /users/nevi/foobar    | Yes      |
| /users/daniel/xyz/123 | Yes      |
| /nevi                 | No       |

:::note[Route specificity]

More specific routes (routes with fewer wildcards) take precedence over less specific routes.

:::

#### Dynamic route examples

Review the following `/functions/` directory structure:

<FileTree>
- ...
- functions
	- date.js
	- users
		- special.js
		- [user].js
		- [[catchall]].js
</FileTree>

The following requests will match the following files:

| Request               | File                                              |
| --------------------- | ------------------------------------------------- |
| /foo                  | Will route to a static asset if one is available. |
| /date                 | /date.js                                          |
| /users/daniel         | /users/\[user].js                                 |
| /users/nevi           | /users/\[user].js                                 |
| /users/special        | /users/special.js                                 |
| /users/daniel/xyz/123 | /users/\[\[catchall]].js                          |

The URL segment(s) that match the placeholder (`[user]`) will be available in the request [`context`](/pages/functions/api-reference/#eventcontext) object. The [`context.params`](/pages/functions/api-reference/#eventcontext) object can be used to find the matched value for a given filename placeholder.

For files which match a single URL segment (use a single set of brackets), the values are returned as a string:

```js
export function onRequest(context) {
  return new Response(context.params.user)
}
```

The above logic will return `daniel` for requests to `/users/daniel`.

For files which match against multiple URL segments (use a double set of brackets), the values are returned as an array:

```js
export function onRequest(context) {
  return new Response(JSON.stringify(context.params.catchall))
}
```

The above logic will return `["daniel", "xyz", "123"]` for requests to `/users/daniel/xyz/123`.

## Functions invocation routes

On a purely static project, Pages offers unlimited free requests. However, once you add Functions on a Pages project, all requests by default will invoke your Function. To continue receiving unlimited free static requests, exclude your project's static routes by creating a `_routes.json` file. This file will be automatically generated if a `functions` directory is detected in your project when you publish your project with Pages CI or Wrangler.

:::note

Some frameworks (such as Remix, SvelteKit) will also automatically generate a `_routes.json` file. However, if your preferred framework does not, create an issue on their framework repository with a link to this page or let us know on [Discord](https://discord.cloudflare.com). Refer to the [Framework guide](/pages/framework-guides/) for more information on full-stack frameworks.

:::

### Create a `_routes.json` file

Create a `_routes.json` file to control when your Function is invoked. It should be placed in the output directory of your project.

This file will include three different properties:

* **version**: Defines the version of the schema. Currently there is only one version of the schema (version 1), however, we may add more in the future and aim to be backwards compatible.
* **include**: Defines routes that will be invoked by Functions. Accepts wildcard behavior.
* **exclude**: Defines routes that will not be invoked by Functions. Accepts wildcard behavior. `exclude` always take priority over `include`.

:::note

Wildcards match any number of path segments (slashes). For example, `/users/*` will match everything after the`/users/` path.

:::

#### Example configuration

Below is an example of a `_routes.json`.

```json
{
   "version": 1,
   "include": ["/*"],
   "exclude": []
}
```

This `_routes.json` will invoke your Functions on all routes.

Below is another example of a `_routes.json` file. Any route inside the `/build` directory will not invoke the Function and will not incur a Functions invocation charge.

```json
{
   "version": 1,
   "include": ["/*"],
   "exclude": ["/build/*"]
}
```

### Limits

Functions invocation routes have the following limits:

* You must have at least one include rule.
* You may have no more than 100 include/exclude rules combined.
* Each rule may have no more than 100 characters.

---

# Smart Placement

URL: https://developers.cloudflare.com/pages/functions/smart-placement/

By default, [Workers](/workers/) and [Pages Functions](/pages/functions/) are invoked in a data center closest to where the request was received. If you are running back-end logic in a Pages Function, it may be more performant to run that Pages Function closer to your back-end infrastructure rather than the end user. Smart Placement (beta) automatically places your workloads in an optimal location that minimizes latency and speeds up your applications.

## Background

Smart Placement applies to Pages Functions and middleware. Normally, assets are always served globally and closest to your users.

Smart Placement on Pages currently has some caveats. While assets are always meant to be served from a location closest to the user, there are two exceptions to this behavior:

1. If using middleware for every request (`functions/_middleware.js`) when Smart Placement is enabled, all assets will be served from a location closest to your back-end infrastructure. This may result in an unexpected increase in latency as a result.

2. When using [`env.ASSETS.fetch`](https://developers.cloudflare.com/pages/functions/advanced-mode/), assets served via the `ASSETS` fetcher from your Pages Function are served from the same location as your Function. This could be the location closest to your back-end infrastructure and not the user.

:::note


To understand how Smart Placement works, refer to [Smart Placement](/workers/configuration/smart-placement/).


:::

## Enable Smart Placement (beta)

Smart Placement is available on all plans.

### Enable Smart Placement via the dashboard

To enable Smart Placement via the dashboard:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In Account Home, select **Workers & Pages**.
3. In **Overview**, select your Pages project.
4. Select **Settings** > **Functions**.
5. Under **Placement**, choose **Smart**.
6. Send some initial traffic (approximately 20-30 requests) to your Pages Functions. It takes a few minutes after you have sent traffic to your Pages Function for Smart Placement to take effect.
7. View your Pages Function's [request duration metrics](/workers/observability/metrics-and-analytics/) under Functions Metrics.

## Give feedback on Smart Placement

Smart Placement is in beta. To share your thoughts and experience with Smart Placement, join the [Cloudflare Developer Discord](https://discord.cloudflare.com).

---

# Source maps and stack traces

URL: https://developers.cloudflare.com/pages/functions/source-maps/

import { Render, WranglerConfig } from "~/components"

<Render file="source-maps" product="workers" />

:::caution


Support for uploading source maps for Pages is available now in open beta. Minimum required Wrangler version: 3.60.0.


:::

## Source Maps

To enable source maps, provide the `--upload-source-maps` flag to [`wrangler pages deploy`](/workers/wrangler/commands/#deploy-1) or add the following to your Pages application's [Wrangler configuration file](/pages/functions/wrangler-configuration/) if you are using the Pages build environment:

<WranglerConfig>

```toml
upload_source_maps = true
```

</WranglerConfig>

When uploading source maps is enabled, Wrangler will automatically generate and upload source map files when you run [`wrangler pages deploy`](/workers/wrangler/commands/#deploy-1).

## Stack traces

â€‹â€‹
When your application throws an uncaught exception, we fetch the source map and use it to map the stack trace of the exception back to lines of your applicationâ€™s original source code.

You can then view the stack trace when streaming [real-time logs](/pages/functions/debugging-and-logging/).

:::note


The source map is retrieved after your Pages Function invocation completes â€” it's an asynchronous process that does not impact your applications's CPU utilization or performance. Source maps are not accessible inside the application at runtime, if you `console.log()` the [stack property](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack), you will not get a deobfuscated stack trace.

:::

## Limits

| Description                    | Limit         |
| ------------------------------ | ------------- |
| Maximum Source Map Size        | 15 MB gzipped |

## Related resources

* [Real-time logs](/pages/functions/debugging-and-logging/) - Learn how to capture Pages logs in real-time.

---

# TypeScript

URL: https://developers.cloudflare.com/pages/functions/typescript/

import { PackageManagers, Render } from "~/components";

Pages Functions supports TypeScript. Author any files in your `/functions` directory with a `.ts` extension instead of a `.js` extension to start using TypeScript.

You can add runtime types and Env types by running:

<PackageManagers
	type="exec"
	pkg="wrangler"
	args={"types --path='./functions/types.d.ts'"}
/>

Then configure the types by creating a `functions/tsconfig.json` file:

```json
{
	"compilerOptions": {
		"target": "esnext",
		"module": "esnext",
		"lib": ["esnext"],
		"types": ["./types.d.ts"]
	}
}
```

See [the `wrangler types` command docs](/workers/wrangler/commands/#types) for more details.

If you already have a `tsconfig.json` at the root of your project, you may wish to explicitly exclude the `/functions` directory to avoid conflicts. To exclude the `/functions` directory:

```json
{
	"include": ["src/**/*"],
	"exclude": ["functions/**/*"],
	"compilerOptions": {}
}
```

Pages Functions can be typed using the `PagesFunction` type. This type accepts an `Env` parameter. The `Env` type should have been generated by `wrangler types` and can be found at the top of `types.d.ts`.

Alternatively, you can define the `Env` type manually. For example:

```ts
interface Env {
	KV: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
	const value = await context.env.KV.get("example");
	return new Response(value);
};
```

If you are using `nodejs_compat`, make sure you have installed `@types/node` and updated your `tsconfig.json`.

```json
{
	"compilerOptions": {
		"target": "esnext",
		"module": "esnext",
		"lib": ["esnext"],
		"types": ["./types.d.ts", "node"]
	}
}
```

:::note

If you were previously using `@cloudflare/workers-types` instead of the runtime types generated by `wrangler types`, you can refer to this [migration guide](/workers/languages/typescript/#migrating).

:::

---

# Configuration

URL: https://developers.cloudflare.com/pages/functions/wrangler-configuration/

import { Render, TabItem, Tabs, Type, MetaInfo, WranglerConfig } from "~/components";

:::caution

If your project contains an existing Wrangler file that you [previously used for local development](/pages/functions/local-development/), make sure you verify that it matches your project settings in the Cloudflare dashboard before opting-in to deploy your Pages project with the Wrangler configuration file. Instead of writing your Wrangler file by hand, Cloudflare recommends using `npx wrangler pages download config` to download your current project settings into a Wrangler file.

:::

:::note

As of Wrangler v3.91.0, Wrangler supports both JSON (`wrangler.json` or `wrangler.jsonc`) and TOML (`wrangler.toml`) for its configuration file. Prior to that version, only `wrangler.toml` was supported.

:::

Pages Functions can be configured two ways, either via the [Cloudflare dashboard](https://dash.cloudflare.com) or the Wrangler configuration file, a file used to customize the development and deployment setup for [Workers](/workers/) and Pages Functions.

This page serves as a reference on how to configure your Pages project via the Wrangler configuration file.

If using a Wrangler configuration file, you must treat your file as the [source of truth](/pages/functions/wrangler-configuration/#source-of-truth) for your Pages project configuration.

Using the Wrangler configuration file to configure your Pages project allows you to:

- **Store your configuration file in source control:** Keep your configuration in your repository alongside the rest of your code.
- **Edit your configuration via your code editor:** Remove the need to switch back and forth between interfaces.
- **Write configuration that is shared across environments:** Define configuration like [bindings](/pages/functions/bindings/) for local development, preview and production in one file.
- **Ensure better access control:** By using a configuration file in your project repository, you can control who has access to make changes without giving access to your Cloudflare dashboard.

## Example Wrangler file

<WranglerConfig>

```toml
name = "my-pages-app"
pages_build_output_dir = "./dist"

[[kv_namespaces]]
binding = "KV"
id = "<NAMESPACE_ID>"

[[d1_databases]]
binding = "DB"
database_name = "northwind-demo"
database_id = "<DATABASE_ID>"

[vars]
API_KEY = "1234567asdf"
```

</WranglerConfig>

## Requirements

### V2 build system

Pages Functions configuration via the Wrangler configuration file requires the [V2 build system](/pages/configuration/build-image/#v2-build-system) or later. To update from V1, refer to the [V2 build system migration instructions](/pages/configuration/build-image/#v1-to-v2-migration).

### Wrangler

You must have Wrangler version 3.45.0 or higher to use a Wrangler configuration file for your Pages project's configuration. To check your Wrangler version, update Wrangler or install Wrangler, refer to [Install/Update Wrangler](/workers/wrangler/install-and-update/).

## Migrate from dashboard configuration

The migration instructions for Pages projects that do not have a Wrangler file currently are different than those for Pages projects with an existing Wrangler file. Read the instructions based on your situation carefully to avoid errors in production.

### Projects with existing Wrangler file

Before you could use the Wrangler configuration file to define your preview and production configuration, it was possible to use the file to define which [bindings](/pages/functions/bindings/) should be available to your Pages project in local development.

If you have been using a Wrangler configuration file for local development, you may already have a file in your Pages project that looks like this:

<WranglerConfig>

```toml
[[kv_namespaces]]
binding = "KV"
id = "<NAMESPACE_ID>"
```

</WranglerConfig>

If you would like to use your existing Wrangler file for your Pages project configuration, you must:

1. Add the `pages_build_output_dir` key with the appropriate value of your [build output directory](/pages/configuration/build-configuration/#build-commands-and-directories) (for example, `pages_build_output_dir = "./dist"`.)
2. Review your existing Wrangler configuration carefully to make sure it aligns with your desired project configuration before deploying.

If you add the `pages_build_output_dir` key to your Wrangler configuration file and deploy your Pages project, Pages will use whatever configuration was defined for local use, which is very likely to be non-production. Do not deploy until you are confident that your Wrangler configuration file is ready for production use.

:::caution[Overwriting configuration]

Running [`wrangler pages download config`](/pages/functions/wrangler-configuration/#projects-without-existing-wranglertoml-file) will overwrite your existing Wrangler file with a generated Wrangler file based on your Cloudflare dashboard configuration. Run this command only if you want to discard your previous Wrangler file that you used for local development and start over with configuration pulled from the Cloudflare dashboard.

:::

You can continue to use your Wrangler file for local development without migrating it for production use by not adding a `pages_build_output_dir` key. If you do not add a `pages_build_output_dir` key and run `wrangler pages deploy`, you will see a warning message telling you that fields are missing and that the file will continue to be used for local development only.

### Projects without existing Wrangler file

If you have an existing Pages project with configuration set up via the Cloudflare dashboard and do not have an existing Wrangler file in your Project, run the `wrangler pages download config` command in your Pages project directory. The `wrangler pages download config` command will download your existing Cloudflare dashboard configuration and generate a valid Wrangler file in your Pages project directory.

<Tabs> <TabItem label="npm">

```sh
npx wrangler pages download config <PROJECT_NAME>
```

</TabItem> <TabItem label="yarn">

```sh
yarn wrangler pages download config <PROJECT_NAME>
```

</TabItem> <TabItem label="pnpm">

```sh
pnpm wrangler pages download config <PROJECT_NAME>
```

</TabItem> </Tabs>

Review your generated Wrangler file. To start using the Wrangler configuration file for your Pages project's configuration, create a new deployment, via [Git integration](/pages/get-started/git-integration/) or [Direct Upload](/pages/get-started/direct-upload/).

### Handling compatibility dates set to "Latest"

In the Cloudflare dashboard, you can set compatibility dates for preview deployments to "Latest". This will ensure your project is always using the latest compatibility date without the need to explicitly set it yourself.

If you download a Wrangler configuration file from a project configured with "Latest" using the `wrangler pages download` command, your Wrangler configuration file will have the latest compatibility date available at the time you downloaded the configuration file. Wrangler does not support the "Latest" functionality like the dashboard. Compatibility dates must be explicitly set when using a Wrangler configuration file.

Refer to [this guide](/workers/configuration/compatibility-dates/) for more information on what compatibility dates are and how they work.

## Differences using a Wrangler configuration file for Pages Functions and Workers

If you have used [Workers](/workers), you may already be familiar with the [Wrangler configuration file](/workers/wrangler/configuration/). There are a few key differences to be aware of when using this file with your Pages Functions project:

- The configuration fields **do not match exactly** between Pages Functions Wrangler file and the Workers equivalent. For example, configuration keys like `main`, which are Workers specific, do not apply to a Pages Function's Wrangler configuration file. Some functionality supported by Workers, such as [module aliasing](/workers/wrangler/configuration/#module-aliasing) cannot yet be used by Cloudflare Pages projects.
- The Pages' Wrangler configuration file introduces a new key, `pages_build_output_dir`, which is only used for Pages projects.
- The concept of [environments](/pages/functions/wrangler-configuration/#configure-environments) and configuration inheritance in this file **is not** the same as Workers.
- This file becomes the [source of truth](/pages/functions/wrangler-configuration/#source-of-truth) when used, meaning that you **can not edit the same fields in the dashboard** once you are using this file.

## Configure environments

With a Wrangler configuration file, you can quickly set configuration across your local environment, preview deployments, and production.

### Local development

The Wrangler configuration file applies locally when using `wrangler pages dev`. This means that you can test out configuration changes quickly without a need to login to the Cloudflare dashboard. Refer to the following config file for an example:



<WranglerConfig>

```toml
name = "my-pages-app"
pages_build_output_dir = "./dist"
compatibility_date = "2023-10-12"
compatibility_flags = ["nodejs_compat"]

[[kv_namespaces]]
binding = "KV"
id = "<NAMESPACE_ID>"
```

</WranglerConfig>

This Wrangler configuration file adds the `nodejs_compat` compatibility flag and a KV namespace binding to your Pages project. Running `wrangler pages dev` in a Pages project directory with this Wrangler configuration file will apply the `nodejs_compat` compatibility flag locally, and expose the `KV` binding in your Pages Function code at `context.env.KV`.

:::note

For a full list of configuration keys, refer to [inheritable keys](#inheritable-keys) and [non-inheritable keys](#non-inheritable-keys).

:::

### Production and preview deployments

Once you are ready to deploy your project, you can set the configuration for production and preview deployments by creating a new deployment containing a Wrangler file.

:::note

For the following commands, if you are using git it is important to remember the branch that you set as your [production branch](/pages/configuration/branch-build-controls/#production-branch-control) as well as your [preview branch settings](/pages/configuration/branch-build-controls/#preview-branch-control).

:::

To use the example above as your configuration for production, make a new production deployment using:

```sh
npx wrangler pages deploy
```

or more specifically:

```sh
npx wrangler pages deploy --branch <PRODUCTION BRANCH>
```

To deploy the configuration for preview deployments, you can run the same command as above while on a branch you have configured to work with [preview deployments](/pages/configuration/branch-build-controls/#preview-branch-control). This will set the configuration for all preview deployments, not just the deployments from a specific branch. Pages does not currently support branch-based configuration.

:::note

The `--branch` flag is optional with `wrangler pages deploy`. If you use git integration, Wrangler will infer the branch you are on from the repository you are currently in and implicitly add it to the command.

:::

### Environment-specific overrides

There are times that you might want to use different configuration across local, preview deployments, and production. It is possible to override configuration for production and preview deployments by using `[env.production]` or `[env.preview]`.

:::note

Unlike [Workers Environments](/workers/wrangler/configuration/#environments), `production` and `preview` are the only two options available via `[env.<ENVIRONMENT>]`.

:::

Refer to the following Wrangler configuration file for an example of how to override preview deployment configuration:



<WranglerConfig>

```toml
name = "my-pages-site"
pages_build_output_dir = "./dist"

[[kv_namespaces]]
binding = "KV"
id = "<NAMESPACE_ID>"

[vars]
API_KEY = "1234567asdf"

[[env.preview.kv_namespaces]]
binding = "KV"
id = "<PREVIEW_NAMESPACE_ID>"

[env.preview.vars]
API_KEY = "8901234bfgd"
```

</WranglerConfig>

If you deployed this file via `wrangler pages deploy`, `name`, `pages_build_output_dir`, `kv_namespaces`, and `vars` would apply the configuration to local and production, while `env.preview` would override `kv_namespaces` and `vars` for preview deployments.

If you wanted to have configuration values apply to local and preview, but override production, your file would look like this:



<WranglerConfig>

```toml
name = "my-pages-site"
pages_build_output_dir = "./dist"

[[kv_namespaces]]
binding = "KV"
id = "<NAMESPACE_ID>"

[vars]
API_KEY = "1234567asdf"

[[env.production.kv_namespaces]]
binding = "KV"
id = "<PRODUCTION_NAMESPACE_ID>"

[env.production.vars]
API_KEY = "8901234bfgd"
```

</WranglerConfig>

You can always be explicit and override both preview and production:



<WranglerConfig>

```toml
name = "my-pages-site"
pages_build_output_dir = "./dist"

[[kv_namespaces]]
binding = "KV"
id = "<NAMESPACE_ID>"

[vars]
API_KEY = "1234567asdf"

[[env.preview.kv_namespaces]]
binding = "KV"
id = "<PREVIEW_NAMESPACE_ID>"

[env.preview.vars]
API_KEY = "8901234bfgd"

[[env.production.kv_namespaces]]
binding = "KV"
id = "<PRODUCTION_NAMESPACE_ID>"

[env.production.vars]
API_KEY = "6567875fvgt"
```

</WranglerConfig>

## Inheritable keys

Inheritable keys are configurable at the top-level, and can be inherited (or overridden) by environment-specific configuration.

- `name` <Type text="string" /> <MetaInfo text="required" />

  - The name of your Pages project. Alphanumeric and dashes only.

- `pages_build_output_dir` <Type text="string" /> <MetaInfo text="required" />

  - The path to your project's build output folder. For example: `./dist`.

- `compatibility_date` <Type text="string" /> <MetaInfo text="required" />

  - A date in the form `yyyy-mm-dd`, which will be used to determine which version of the Workers runtime is used. Refer to [Compatibility dates](/workers/configuration/compatibility-dates/).

- `compatibility_flags` string\[] optional

  - A list of flags that enable features from upcoming features of the Workers runtime, usually used together with `compatibility_date`. Refer to [compatibility dates](/workers/configuration/compatibility-dates/).

- `send_metrics` <Type text="boolean" /> <MetaInfo text="optional" />

  - Whether Wrangler should send usage data to Cloudflare for this project. Defaults to `true`. You can learn more about this in our [data policy](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler/telemetry.md).

- `limits` Limits optional

  - Configures limits to be imposed on execution at runtime. Refer to [Limits](#limits).

- `placement` Placement optional

  - Specify how Pages Functions should be located to minimize round-trip time. Refer to [Smart Placement](/workers/configuration/smart-placement/).

- `upload_source_maps` boolean

  - When `upload_source_maps` is set to `true`, Wrangler will upload any server-side source maps part of your Pages project to give corrected stack traces in logs.

## Non-inheritable keys

Non-inheritable keys are configurable at the top-level, but, if any one non-inheritable key is overridden for any environment (for example,`[[env.production.kv_namespaces]]`), all non-inheritable keys must also be specified in the environment configuration and overridden.

For example, this configuration will not work:



<WranglerConfig>

```toml
name = "my-pages-site"
pages_build_output_dir = "./dist"

[[kv_namespaces]]
binding = "KV"
id = "<NAMESPACE_ID>"

[vars]
API_KEY = "1234567asdf"

[env.production.vars]
API_KEY = "8901234bfgd"
```

</WranglerConfig>

`[[env.production.vars]]` is set to override `[vars]`. Because of this `[[kv_namespaces]]` must also be overridden by defining `[[env.production.kv_namespaces]]`.

This will work for local development, but will fail to validate when you try to deploy.

- `vars` <Type text="object" /> <MetaInfo text="optional" />

  - A map of environment variables to set when deploying your Function. Refer to [Environment variables](/pages/functions/bindings/#environment-variables).

- `d1_databases` <Type text="object" /> <MetaInfo text="optional" />

  - A list of D1 databases that your Function should be bound to. Refer to [D1 databases](/pages/functions/bindings/#d1-databases).

- `durable_objects` <Type text="object" /> <MetaInfo text="optional" />

  - A list of Durable Objects that your Function should be bound to. Refer to [Durable Objects](/pages/functions/bindings/#durable-objects).

- `hyperdrive` <Type text="object" /> <MetaInfo text="optional" />

  - Specifies Hyperdrive configs that your Function should be bound to. Refer to [Hyperdrive](/pages/functions/bindings/#r2-buckets).

- `kv_namespaces` <Type text="object" /> <MetaInfo text="optional" />

  - A list of KV namespaces that your Function should be bound to. Refer to [KV namespaces](/pages/functions/bindings/#kv-namespaces).

- `queues.producers` <Type text="object" /> <MetaInfo text="optional" />

  - Specifies Queues Producers that are bound to this Function. Refer to [Queues Producers](/queues/get-started/#4-set-up-your-producer-worker).

- `r2_buckets` <Type text="object" /> <MetaInfo text="optional" />

  - A list of R2 buckets that your Function should be bound to. Refer to [R2 buckets](/pages/functions/bindings/#r2-buckets).

- `vectorize` <Type text="object" /> <MetaInfo text="optional" />

  - A list of Vectorize indexes that your Function should be bound to. Refer to [Vectorize indexes](/vectorize/get-started/intro/#3-bind-your-worker-to-your-index).

- `services` <Type text="object" /> <MetaInfo text="optional" />

  - A list of service bindings that your Function should be bound to. Refer to [service bindings](/pages/functions/bindings/#service-bindings).

- `analytics_engine_datasets` <Type text="object" /> <MetaInfo text="optional" />

  - Specifies analytics engine datasets that are bound to this Function. Refer to [Workers Analytics Engine](/analytics/analytics-engine/get-started/).

- `ai` <Type text="object" /> <MetaInfo text="optional" />

  - Specifies an AI binding to this Function. Refer to [Workers AI](/pages/functions/bindings/#workers-ai).

## Limits

You can configure limits for your Pages project in the same way you can for Workers. Read [this guide](/workers/wrangler/configuration/#limits) for more details.

## Bindings

A [binding](/pages/functions/bindings/) enables your Pages Functions to interact with resources on the Cloudflare Developer Platform. Use bindings to integrate your Pages Functions with Cloudflare resources like [KV](/kv/), [Durable Objects](/durable-objects/), [R2](/r2/), and [D1](/d1/). You can set bindings for both production and preview environments.

### D1 databases

[D1](/d1/) is Cloudflare's serverless SQL database. A Function can query a D1 database (or databases) by creating a [binding](/workers/runtime-apis/bindings/) to each database for [D1 Workers Binding API](/d1/worker-api/).

:::note

When using Wrangler in the default local development mode, files will be written to local storage instead of the preview or production database. Refer to [Local development](/workers/local-development/) for more details.

:::

- Configure D1 database bindings via your [Wrangler file](/workers/wrangler/configuration/#d1-databases) the same way they are configured with Cloudflare Workers.
- Interact with your [D1 Database binding](/pages/functions/bindings/#d1-databases).

### Durable Objects

[Durable Objects](/durable-objects/) provide low-latency coordination and consistent storage for the Workers platform.

- Configure Durable Object namespace bindings via your [Wrangler file](/workers/wrangler/configuration/#durable-objects) the same way they are configured with Cloudflare Workers.

:::caution

<Render file="do-note" product="pages" /> Durable Object bindings configured in a Pages project's Wrangler configuration file require the `script_name` key. For Workers, the `script_name` key is optional.

:::

- Interact with your [Durable Object namespace binding](/pages/functions/bindings/#durable-objects).

### Environment variables

[Environment variables](/workers/configuration/environment-variables/) are a type of binding that allow you to attach text strings or JSON values to your Pages Function.

- Configure environment variables via your [Wrangler file](/workers/wrangler/configuration/#environment-variables) the same way they are configured with Cloudflare Workers.
- Interact with your [environment variables](/pages/functions/bindings/#environment-variables).

### Hyperdrive

[Hyperdrive](/hyperdrive/) bindings allow you to interact with and query any Postgres database from within a Pages Function.

- Configure Hyperdrive bindings via your [Wrangler file](/workers/wrangler/configuration/#hyperdrive) the same way they are configured with Cloudflare Workers.

### KV namespaces

[Workers KV](/kv/api/) is a global, low-latency, key-value data store. It stores data in a small number of centralized data centers, then caches that data in Cloudflareâ€™s data centers after access.

:::note

When using Wrangler in the default local development mode, files will be written to local storage instead of the preview or production namespace. Refer to [Local development](/workers/local-development/) for more details.

:::

- Configure KV namespace bindings via your [Wrangler file](/workers/wrangler/configuration/#kv-namespaces) the same way they are configured with Cloudflare Workers.
- Interact with your [KV namespace binding](/pages/functions/bindings/#kv-namespaces).

### Queues Producers

[Queues](/queues/) is Cloudflare's global message queueing service, providing [guaranteed delivery](/queues/reference/delivery-guarantees/) and [message batching](/queues/configuration/batching-retries/). [Queue Producers](/queues/configuration/javascript-apis/#producer) enable you to send messages into a queue within your Pages Function.

:::note

You cannot currently configure a [queues consumer](/queues/reference/how-queues-works/#consumers) with Pages Functions.

:::

- Configure Queues Producer bindings via your [Wrangler file](/workers/wrangler/configuration/#queues) the same way they are configured with Cloudflare Workers.
- Interact with your [Queues Producer binding](/pages/functions/bindings/#queue-producers).

### R2 buckets

[Cloudflare R2 Storage](/r2) allows developers to store large amounts of unstructured data without the costly egress bandwidth fees associated with typical cloud storage services.

:::note

When using Wrangler in the default local development mode, files will be written to local storage instead of the preview or production bucket. Refer to [Local development](/workers/local-development/) for more details.

:::

- Configure R2 bucket bindings via your [Wrangler file](/workers/wrangler/configuration/#r2-buckets) the same way they are configured with Cloudflare Workers.
- Interact with your [R2 bucket bindings](/pages/functions/bindings/#r2-buckets).

### Vectorize indexes

A [Vectorize index](/vectorize/) allows you to insert and query vector embeddings for semantic search, classification and other vector search use-cases.

- Configure Vectorize bindings via your [Wrangler file](/workers/wrangler/configuration/#vectorize-indexes) the same way they are configured with Cloudflare Workers.

### Service bindings

A service binding allows you to call a Worker from within your Pages Function. Binding a Pages Function to a Worker allows you to send HTTP requests to the Worker without those requests going over the Internet. The request immediately invokes the downstream Worker, reducing latency as compared to a request to a third-party service. Refer to [About Service bindings](/workers/runtime-apis/bindings/service-bindings/).

- Configure service bindings via your [Wrangler file](/workers/wrangler/configuration/#service-bindings) the same way they are configured with Cloudflare Workers.
- Interact with your [service bindings](/pages/functions/bindings/#service-bindings).

### Analytics Engine Datasets

[Workers Analytics Engine](/analytics/analytics-engine/) provides analytics, observability and data logging from Pages Functions. Write data points within your Pages Function binding then query the data using the [SQL API](/analytics/analytics-engine/sql-api/).

- Configure Analytics Engine Dataset bindings via your [Wrangler file](/workers/wrangler/configuration/#analytics-engine-datasets) the same way they are configured with Cloudflare Workers.
- Interact with your [Analytics Engine Dataset](/pages/functions/bindings/#analytics-engine).

### Workers AI

[Workers AI](/workers-ai/) allows you to run machine learning models, on the Cloudflare network, from your own code â€“ whether that be from Workers, Pages, or anywhere via REST API.

<Render file="ai-local-usage-charges" product="workers" />

Unlike other bindings, this binding is limited to one AI binding per Pages Function project.

- Configure Workers AI bindings via your [Wrangler file](/workers/wrangler/configuration/#workers-ai) the same way they are configured with Cloudflare Workers.
- Interact with your [Workers AI binding](/pages/functions/bindings/#workers-ai).

## Local development settings

The local development settings that you can configure are the same for Pages Functions and Cloudflare Workers. Read [this guide](/workers/wrangler/configuration/#local-development-settings) for more details.

## Source of truth

When used in your Pages Functions projects, your Wrangler file is the source of truth. You will be able to see, but not edit, the same fields when you log into the Cloudflare dashboard.

If you decide that you do not want to use a Wrangler configuration file for configuration, you can safely delete it and create a new deployment. Configuration values from your last deployment will still apply and you will be able to edit them from the dashboard.

---

# Blazor

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-blazor-site/

import { Render } from "~/components";

[Blazor](https://blazor.net) is an SPA framework that can use C# code, rather than JavaScript in the browser. In this guide, you will build a site using Blazor, and deploy it using Cloudflare Pages.

## Install .NET

Blazor uses C#. You will need the latest version of the [.NET SDK](https://dotnet.microsoft.com/download) to continue creating a Blazor project. If you don't have the SDK installed on your system please download and run the installer.

## Creating a new Blazor WASM project

There are two types of Blazor hosting models: [Blazor Server](https://learn.microsoft.com/en-us/aspnet/core/blazor/hosting-models?view=aspnetcore-8.0#blazor-server) which requires a server to serve the Blazor application to the end user, and [Blazor WebAssembly](https://learn.microsoft.com/en-us/aspnet/core/blazor/hosting-models?view=aspnetcore-8.0#blazor-webassembly) which runs in the browser. Blazor Server is incompatible with the Cloudflare edge network model, thus this guide only use Blazor WebAssembly.

Create a new Blazor WebAssembly (WASM) application by running the following command:

```sh
dotnet new blazorwasm -o my-blazor-project
```

## Create the build script

To deploy, Cloudflare Pages will need a way to build the Blazor project. In the project's directory root, create a `build.sh` file. Populate the file with this (updating the `.dotnet-install.sh` line appropriately if you're not using the latest .NET SDK):

```
#!/bin/sh
curl -sSL https://dot.net/v1/dotnet-install.sh > dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh -c 8.0 -InstallDir ./dotnet
./dotnet/dotnet --version
./dotnet/dotnet publish -c Release -o output
```

Your `build.sh` file needs to be executable for the build command to work. You can make it so by running `chmod +x build.sh`.

<Render file="tutorials-before-you-start" />

## Create a `.gitignore` file

Creating a `.gitignore` file ensures that only what is needed gets pushed onto your GitHub repository. Create a `.gitignore` file by running the following command:

```sh
dotnet new gitignore
```

<Render file="framework-guides/create-github-repository" />

## Deploy with Cloudflare Pages

<Render file="deploy-to-pages-steps-no-preset" />

<div>

| Configuration option | Value            |
| -------------------- | ---------------- |
| Production branch    | `main`           |
| Build command        | `./build.sh`     |
| Build directory      | `output/wwwroot` |

</div>

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `dotnet`, your project dependencies, and building your site, before deploying it.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.
Every time you commit new code to your Blazor site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

## Troubleshooting

### A file is over the 25 MiB limit

If you receive the error message `Error: Asset "/opt/buildhome/repo/output/wwwroot/_framework/dotnet.wasm" is over the 25MiB limit`, resolve this by doing one of the following actions:

1. Reduce the size of your assets with the following [guide](https://docs.microsoft.com/en-us/aspnet/core/blazor/performance?view=aspnetcore-6.0#minimize-app-download-size).

Or

2. Remove the `*.wasm` files from the output (`rm output/wwwroot/_framework/*.wasm`) and modify your Blazor application to [load the Brotli compressed files](https://docs.microsoft.com/en-us/aspnet/core/blazor/host-and-deploy/webassembly?view=aspnetcore-6.0#compression) instead.

<Render file="framework-guides/learn-more" params={{ one: "Blazor" }} />

---

# Brunch

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-brunch-site/

import { PagesBuildPreset, Render } from "~/components";

[Brunch](https://brunch.io/) is a fast front-end web application build tool with simple declarative configuration and seamless incremental compilation for rapid development.

## Install Brunch

To begin, install Brunch:

```sh
npm install -g brunch
```

## Create a Brunch project

Brunch maintains a library of community-provided [skeletons](https://brunch.io/skeletons) to offer you a boilerplate for your project. Run Brunch's recommended `es6` skeleton with the `brunch new` command:

```sh
brunch new proj -s es6
```

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository" />

## Deploy with Cloudflare Pages

<Render file="deploy-to-pages-steps-with-preset" params={{ name: "Brunch" }} />

<PagesBuildPreset framework="brunch" />

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.

Every time you commit new code to your Brunch site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests and be able to preview how changes look to your site before deploying them to production.

<Render file="framework-guides/learn-more" params={{ one: "Brunch" }} />

---

# Docusaurus

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-docusaurus-site/

import { PagesBuildPreset, Render, PackageManagers } from "~/components";

[Docusaurus](https://docusaurus.io) is a static site generator. It builds a single-page application with fast client-side navigation, leveraging the full power of React to make your site interactive. It provides out-of-the-box documentation features but can be used to create any kind of site such as a personal website, a product site, a blog, or marketing landing pages.

## Set up a new project

Use the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) CLI (C3) to set up your project. C3 will create a new project directory, initiate Docusaurus' official setup tool, and provide the option to deploy instantly.

To use `create-cloudflare` to create a new Docusaurus project, run the following command:

<PackageManagers
	type="create"
	pkg="cloudflare@latest my-docusaurus-app"
	args="--framework=docusaurus --platform=pages"
/>

`create-cloudflare` will install additional dependencies, including the [Wrangler](/workers/wrangler/install-and-update/#check-your-wrangler-version) CLI and any necessary adapters, and ask you setup questions.

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository" />

## Deploy with Cloudflare Pages

<Render file="deploy-via-c3" params={{ name: "Docusaurus" }} />

### Deploy via the Cloudflare dashboard

<Render
	file="deploy-to-pages-steps-with-preset"
	params={{ name: "Docusarus" }}
/>

<PagesBuildPreset framework="docusaurus" />

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.

Every time you commit new code to your Docusaurus site and push those changes to GitHub, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests and be able to preview how changes look to your site before deploying them to production.

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

<Render file="framework-guides/learn-more" params={{ one: "Docusaurus" }} />

---

# Gridsome

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-gridsome-site/

import { PagesBuildPreset, Render } from "~/components";

[Gridsome](https://gridsome.org) is a Vue.js powered Jamstack framework for building static generated websites and applications that are fast by default. In this guide, you will create a new Gridsome project and deploy it using Cloudflare Pages. You will use the [`@gridsome/cli`](https://github.com/gridsome/gridsome/tree/master/packages/cli), a command line tool for creating new Gridsome projects.

## Install Gridsome

Install the `@gridsome/cli` by running the following command in your terminal:

```sh
npm install --global @gridsome/cli
```

## Set up a new project

With Gridsome installed, set up a new project by running `gridsome create`. The `create` command accepts a name that defines the directory of the project created and an optional starter kit name. You can review more starters in the [Gridsome starters section](https://gridsome.org/docs/starters/).

```sh
npx gridsome create my-gridsome-website
```

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository" />

## Deploy with Cloudflare Pages

To deploy your site to Pages:

<Render
	file="deploy-to-pages-steps-with-preset"
	params={{ name: "Gridsome" }}
/>

<PagesBuildPreset framework="gridsome" />

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `vuepress`, your project dependencies, and building your site, before deploying it.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`. Every time you commit new code to your Gridsome project, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes to your site look before deploying them to production.

<Render file="framework-guides/learn-more" params={{ one: "Gridsome" }} />

---

# Gatsby

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-gatsby-site/

import { PagesBuildPreset, Render } from "~/components";

[Gatsby](https://www.gatsbyjs.com/) is an open-source React framework for creating websites and apps. In this guide, you will create a new Gatsby application and deploy it using Cloudflare Pages. You will be using the `gatsby` CLI to create a new Gatsby site.

## Install Gatsby

Install the `gatsby` CLI by running the following command in your terminal:

```sh
npm install -g gatsby-cli
```

## Create a new project

With Gatsby installed, you can create a new project using `gatsby new`. The `new` command accepts a GitHub URL for using an existing template. As an example, use the `gatsby-starter-lumen` template by running the following command in your terminal. You can find more in [Gatsby's Starters section](https://www.gatsbyjs.com/starters/?v=2):

```sh
npx gatsby new my-gatsby-site https://github.com/alxshelepenok/gatsby-starter-lumen
```

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository_no_init" />

## Deploy with Cloudflare Pages

<Render file="deploy-to-pages-steps-with-preset" params={{ name: "Gatsby" }} />

<PagesBuildPreset framework="gatsby" />

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `gatsby`, your project dependencies, and building your site, before deploying it.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.
Every time you commit new code to your Gatsby site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

## Dynamic routes

If you are using [dynamic routes](https://www.gatsbyjs.com/docs/reference/functions/routing/#dynamic-routing) in your Gatsby project, set up a [proxy redirect](/pages/configuration/redirects/#proxying) for these routes to take effect.

If you have a dynamic route, such as `/users/[id]`, create your proxy redirect by referring to the following example:

```
/users/* /users/:id 200
```

<Render file="framework-guides/learn-more" params={{ one: "Gatsby" }} />

---

# Hexo

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-hexo-site/

import { Render } from "~/components";

[Hexo](https://hexo.io/) is a tool for generating static websites, powered by Node.js. Hexo's benefits include speed, simplicity, and flexibility, allowing it to render Markdown files into static web pages via Node.js.

In this guide, you will create a new Hexo application and deploy it using Cloudflare Pages. You will use the `hexo` CLI to create a new Hexo site.

## Installing Hexo

First, install the Hexo CLI with `npm` or `yarn` by running either of the following commands in your terminal:

```sh
npm install hexo-cli -g
# or
yarn global add hexo-cli
```

On macOS and Linux, you can install with [brew](https://brew.sh/):

```sh
brew install hexo
```

<Render file="tutorials-before-you-start" />

## Creating a new project

With Hexo CLI installed, create a new project by running the `hexo init` command in your terminal:

```sh
hexo init my-hexo-site
cd my-hexo-site
```

Hexo sites use themes to customize the appearance of statically built HTML sites. Hexo has a default theme automatically installed, which you can find on [Hexo's Themes page](https://hexo.io/themes/).

## Creating a post

Create a new post to give your Hexo site some initial content. Run the `hexo new` command in your terminal to generate a new post:

```sh
hexo new "hello hexo"
```

Inside of `hello-hexo.md`, use Markdown to write the content of the article. You can customize the tags, categories or other variables in the article. Refer to the [Front Matter section](https://hexo.io/docs/front-matter) of the [Hexo documentation](https://hexo.io/docs/) for more information.

<Render file="framework-guides/create-github-repository" />

## Deploy with Cloudflare Pages

<Render file="deploy-to-pages-steps-no-preset" />

<div>

| Configuration option | Value           |
| -------------------- | --------------- |
| Production branch    | `main`          |
| Build command        | `npm run build` |
| Build directory      | `public`        |

</div>

After completing configuration, click the **Save and Deploy** button. You should see Cloudflare Pages installing `hexo` and your project dependencies, and building your site, before deploying it.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.
Every time you commit new code to your Hexo site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

## Using a specific Node.js version

Some Hexo themes or plugins have additional requirements for different Node.js versions. To use a specific Node.js version for Hexo:

1. Go to your Pages project.
2. Go to **Settings** > **Environment variables**.
3. Set the environment variable `NODE_VERSION` and a value of your required Node.js version (for example, `14.3`).

![Follow the instructions above to set up an environment variable in the Pages dashboard](~/assets/images/pages/framework-guides/node-version-pages.png)

<Render file="framework-guides/learn-more" params={{ one: "Hexo" }} />

---

# Hono

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-hono-site/

import {
	ResourcesBySelector,
	ExternalResources,
	Render,
	TabItem,
	Tabs,
	PackageManagers,
	Stream,
} from "~/components";

[Hono](https://honojs.dev/) is a small, simple, and ultrafast web framework for Cloudflare Pages and Workers, Deno, and Bun. Learn more about the creation of Hono by [watching an interview](#creator-interview) with its creator, [Yusuke Wada](https://yusu.ke/).

In this guide, you will create a new Hono application and deploy it using Cloudflare Pages.

## Create a new project

Use the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) CLI (C3) to create a new project. C3 will create a new project directory, initiate Hono's official setup tool, and provide the option to deploy instantly.

To use `create-cloudflare` to create a new Hono project, run the following command:

<PackageManagers
	type="create"
	pkg="cloudflare@latest"
	args="my-hono-app --framework=hono --platform=pages"
/>

In your new Hono project, you will find a `public/static` directory for your static files, and a `src/index.ts` file which is the entrypoint for your server-side code.

## Run in local dev

Develop your app locally by running:

<PackageManagers type="run" args={"dev"} />

You should be able to review your generated web application at `http://localhost:8788`.

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository" />

## Deploy with Cloudflare Pages

<Render file="deploy-via-c3" params={{ name: "Hono" }} />

### Deploy via the Cloudflare dashboard

<Render file="deploy-to-pages-steps-no-preset" />

<div>

| Configuration option | Value           |
| -------------------- | --------------- |
| Production branch    | `main`          |
| Build command        | `npm run build` |
| Build directory      | `dist`          |

</div>

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `my-hono-app`, your project dependencies, and building your site before deploying it.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.
Every time you commit new code to your Hono site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

## Related resources

### Tutorials

For more tutorials involving Hono and Cloudflare Pages, refer to the following resources:

<ResourcesBySelector
	tags={["Hono"]}
	types={["tutorial"]}
	products={["Pages"]}
/>

### Demo apps

For demo applications using Hono and Cloudflare Pages, refer to the following resources:

<ExternalResources tags={["Hono"]} type="apps" products={["Pages"]} />

### Creator Interview

<Stream
	id="db240ef1d351915849151242ec0c5f1c"
	title="DevTalk Episode 01 Hono"
	thumbnail="5s"
/>

---

# Hugo

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-hugo-site/

import { PagesBuildPreset, Render, TabItem, Tabs } from "~/components";

[Hugo](https://gohugo.io/) is a tool for generating static sites, written in Go. It is incredibly fast and has great high-level, flexible primitives for managing your content using different [content formats](https://gohugo.io/content-management/formats/).

In this guide, you will create a new Hugo application and deploy it using Cloudflare Pages. You will use the `hugo` CLI to create a new Hugo site.

<Render file="tutorials-before-you-start" />

Go to [Deploy with Cloudflare Pages](#deploy-with-cloudflare-pages) if you already have a Hugo site hosted with your [Git provider](/pages/get-started/git-integration/).

## Install Hugo

Install the Hugo CLI, using the specific instructions for your operating system.

<Tabs> <TabItem label="macos">

If you use the package manager [Homebrew](https://brew.sh), run the `brew install` command in your terminal to install Hugo:

```sh
brew install hugo
```

</TabItem>
<TabItem label="windows">

If you use the package manager [Chocolatey](https://chocolatey.org/), run the `choco install` command in your terminal to install Hugo:

```sh
choco install hugo --confirm
```

If you use the package manager [Scoop](https://scoop.sh/), run the `scoop install` command in your terminal to install Hugo:

```sh
scoop install hugo
```

</TabItem>
<TabItem label="linux">

The package manager for your Linux distribution may include Hugo. If this is the case, install Hugo directly using the distribution's package manager â€” for instance, in Ubuntu, run the following command:

```sh
sudo apt-get install hugo
```

If your package manager does not include Hugo or you would like to download a release directly, refer to the [**Manual**](/pages/framework-guides/deploy-a-hugo-site/#manual-installation) section.

</TabItem>
</Tabs>

### Manual installation

The Hugo GitHub repository contains pre-built versions of the Hugo command-line tool for various operating systems, which can be found on [the Releases page](https://github.com/gohugoio/hugo/releases).

For more instruction on installing these releases, refer to [Hugo's documentation](https://gohugo.io/getting-started/installing/).

## Create a new project

With Hugo installed, refer to [Hugo's Quick Start](https://gohugo.io/getting-started/quick-start/) to create your project or create a new project by running the `hugo new` command in your terminal:

```sh
hugo new site my-hugo-site
```

Hugo sites use themes to customize the look and feel of the statically built HTML site. There are a number of themes available at [themes.gohugo.io](https://themes.gohugo.io) â€” for now, use the [Ananke theme](https://themes.gohugo.io/themes/gohugo-theme-ananke/) by running the following commands in your terminal:

```sh
cd my-hugo-site
git init
git submodule add https://github.com/theNewDynamic/gohugo-theme-ananke.git themes/ananke
echo "theme = 'ananke'" >> hugo.toml
```

## Create a post

Create a new post to give your Hugo site some initial content. Run the `hugo new` command in your terminal to generate a new post:

```sh
hugo new content posts/hello-world.md
```

Inside of `hello-world.md`, add some initial content to create your post. Remove the `draft` line in your post's frontmatter when you are ready to publish the post. Any posts with `draft: true` set will be skipped by Hugo's build process.

<Render file="framework-guides/create-github-repository_no_init" />

## Deploy with Cloudflare Pages

<Render file="deploy-to-pages-steps-with-preset" params={{ name: "Hugo" }} />

<PagesBuildPreset framework="hugo" />

:::note[Base URL configuration]

Hugo allows you to configure the `baseURL` of your application. This allows you to utilize the `absURL` helper to construct full canonical URLs. In order to do this with Pages, you must provide the `-b` or `--baseURL` flags with the `CF_PAGES_URL` environment variable to your `hugo` build command.

Your final build command may look like this:

```sh
hugo -b $CF_PAGES_URL
```

:::

After completing deployment configuration, select the **Save and Deploy**. You should see Cloudflare Pages installing `hugo` and your project dependencies, and building your site, before deploying it.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.
Every time you commit new code to your Hugo site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

## Use a specific or newer Hugo version

To use a [specific or newer version of Hugo](https://github.com/gohugoio/hugo/releases), create the `HUGO_VERSION` environment variable in your Pages project > **Settings** > **Environment variables**. Set the value as the Hugo version you want to specify (v0.112.0 or later is recommended for newer versions).

For example, `HUGO_VERSION`: `0.115.4`.

:::note

If you plan to use [preview deployments](/pages/configuration/preview-deployments/), make sure you also add environment variables to your **Preview** environment.

:::

<Render file="framework-guides/learn-more" params={{ one: "Hugo" }} />

---

# Jekyll

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-jekyll-site/

import { PagesBuildPreset, Render } from "~/components";

[Jekyll](https://jekyllrb.com/) is an open-source framework for creating websites, based around Markdown with Liquid templates. In this guide, you will create a new Jekyll application and deploy it using Cloudflare Pages. You use the `jekyll` CLI to create a new Jekyll site.

:::note

If you have an existing Jekyll site on GitHub Pages, refer to [the Jekyll migration guide](/pages/migrations/migrating-jekyll-from-github-pages/).

:::

## Installing Jekyll

Jekyll is written in Ruby, meaning that you will need a functioning Ruby installation, like `rbenv`, to install Jekyll.

To install Ruby on your computer, follow the [`rbenv` installation instructions](https://github.com/rbenv/rbenv#installation) and select a recent version of Ruby by running the `rbenv` command in your terminal. The Ruby version you install will also be used to configure the Pages deployment for your application.

```sh
rbenv install <RUBY_VERSION> # For example, 3.1.3
```

With Ruby installed, you can install the `jekyll` Ruby gem:

```sh
gem install jekyll
```

## Creating a new project

With Jekyll installed, you can create a new project running the `jekyll new` in your terminal:

```sh
jekyll new my-jekyll-site
```

Create a base `index.html` in your newly created folder to give your site content:

```html
<!doctype html>
<html>
	<head>
		<meta charset="utf-8" />
		<title>Hello from Cloudflare Pages</title>
	</head>
	<body>
		<h1>Hello from Cloudflare Pages</h1>
	</body>
</html>
```

Optionally, you may use a theme with your new Jekyll site if you would like to start with great styling defaults. For example, the [`minimal-mistakes`](https://github.com/mmistakes/minimal-mistakes) theme has a ["Starting from `jekyll new`"](https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide/#starting-from-jekyll-new) section to help you add the theme to your new site.

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository_no_init" />

If you are migrating an existing Jekyll project to Pages, confirm that your `Gemfile` is committed as part of your codebase. Pages will look at your Gemfile and run `bundle install` to install the required dependencies for your project, including the `jekyll` gem.

## Deploy with Cloudflare Pages

<Render file="deploy-to-pages-steps-with-preset" params={{ name: "Jekyll" }} />

<PagesBuildPreset framework="jekyll" />

Add an [environment variable](/pages/configuration/build-image/) that matches the Ruby version that you are using locally. Set this as `RUBY_VERSION` on both your preview and production deployments. Below, `3.1.3` is used as an example:

| Environment variable | Value   |
| -------------------- | ------- |
| `RUBY_VERSION`       | `3.1.3` |

After configuring your site, you can begin your first deployment. You should see Cloudflare Pages installing `jekyll`, your project dependencies, and building your site before deploying it.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to [the Get started guide](/pages/get-started/).

:::

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.
Every time you commit new code to your Jekyll site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

<Render file="framework-guides/learn-more" params={{ one: "Jekyll" }} />

---

# Nuxt

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-nuxt-site/

import {
	PagesBuildPreset,
	Render,
	TabItem,
	Tabs,
	ResourcesBySelector,
	ExternalResources,
	PackageManagers,
	Stream,
} from "~/components";

[Nuxt](https://nuxt.com) is a web framework making Vue.js-based development simple and powerful.

In this guide, you will create a new Nuxt application and deploy it using Cloudflare Pages.

### Video Tutorial

<Stream
	id="fd106a56e13af42eb39b35c499432e4b"
	title="Deploy a Nuxt Application to Cloudflare"
	thumbnail="2.5s"
/>

## Create a new project using the `create-cloudflare` CLI (C3)

The [`create-cloudflare` CLI (C3)](/pages/get-started/c3/) will configure your Nuxt site for Cloudflare Pages. Run the following command in your terminal to create a new Nuxt site:

<PackageManagers
	type="create"
	pkg="cloudflare@latest my-nuxt-app"
	args="--framework=nuxt --platform=pages"
/>

C3 will ask you a series of setup questions and create a new project with [`nuxi` (the official Nuxt CLI)](https://github.com/nuxt/cli). C3 will also install the necessary adapters along with the [Wrangler CLI](/workers/wrangler/install-and-update/#check-your-wrangler-version).

After creating your project, C3 will generate a new `my-nuxt-app` directory using the default Nuxt template, updated to be fully compatible with Cloudflare Pages.

When creating your new project, C3 will give you the option of deploying an initial version of your application via [Direct Upload](/pages/how-to/use-direct-upload-with-continuous-integration/). You can redeploy your application at any time by running following command inside your project directory:

```sh
npm run deploy
```

:::note[Git integration]

The initial deployment created via C3 is referred to as a [Direct Upload](/pages/get-started/direct-upload/). To set up a deployment via the Pages Git integration, refer to the [Git Integration](#git-integration) section below.

:::

## Configure and deploy a project without C3

To deploy a Nuxt project without C3, follow the [Nuxt Get Started guide](https://nuxt.com/docs/getting-started/installation). After you have set up your Nuxt project, choose either the [Git integration guide](/pages/get-started/git-integration/) or [Direct Upload guide](/pages/get-started/direct-upload/) to deploy your Nuxt project on Cloudflare Pages.

<Render file="framework-guides/git-integration" />

### Create a GitHub repository

<Render file="framework-guides/create-gh-repo" />

```sh
# Skip the following three commands if you have built your application
#Â using C3 or already committed your changes
git init
git add .
git commit -m "Initial commit"

git branch -M main
git remote add origin https://github.com/<YOUR_GH_USERNAME>/<REPOSITORY_NAME>
git push -u origin main
```

### Create a Pages project

<Render file="deploy-to-pages-steps-with-preset" params={{ name: "Nuxt.js" }} />

<PagesBuildPreset framework="nuxt-js" />

Optionally, you can customize the **Project name** field. It defaults to the GitHub repository's name, but it does not need to match. The **Project name** value is assigned as your `*.pages.dev` subdomain.

4. After completing configuration, select the **Save and Deploy**.

Review your first deploy pipeline in progress. Pages installs all dependencies and builds the project as specified. Cloudflare Pages will automatically rebuild your project and deploy it on every new pushed commit.

Additionally, you will have access to [preview deployments](/pages/configuration/preview-deployments/), which repeat the build-and-deploy process for pull requests. With these, you can preview changes to your project with a real URL before deploying your changes to production.

## Use bindings in your Nuxt application

A [binding](/pages/functions/bindings/) allows your application to interact with Cloudflare developer products, such as [KV](/kv/), [Durable Objects](/durable-objects/), [R2](/r2/), and [D1](/d1/).

If you intend to use bindings in your project, you must first set up your bindings for local and remote development.

### Set up bindings for local development

Projects created via C3 come with `nitro-cloudflare-dev`, a `nitro` module that simplifies the process of working with bindings during development:

```typescript
export default defineNuxtConfig({
	modules: ["nitro-cloudflare-dev"],
});
```

This module is powered by the [`getPlatformProxy` helper function](/workers/wrangler/api#getplatformproxy). `getPlatformProxy` will automatically detect any bindings defined in your project's Wrangler configuration file and emulate those bindings in local development. Review [Wrangler configuration information on bindings](/workers/wrangler/configuration/#bindings) for more information on how to configure bindings in the [Wrangler configuration file](/workers/wrangler/configuration/).

:::note

`wrangler.toml` is currently **only** used for local development. Bindings specified in it are not available remotely.

:::

### Set up bindings for a deployed application

In order to access bindings in a deployed application, you will need to [configure your bindings](/pages/functions/bindings/) in the Cloudflare dashboard.

### Add bindings to TypeScript projects

To get proper type support, you need to create a new `env.d.ts` file in the root of your project and declare a [binding](/pages/functions/bindings/).

The following is an example of adding a `KVNamespace` binding:

```ts null {9}
import {
	CfProperties,
	Request,
	ExecutionContext,
	KVNamespace,
} from "@cloudflare/workers-types";

declare module "h3" {
	interface H3EventContext {
		cf: CfProperties;
		cloudflare: {
			request: Request;
			env: {
				MY_KV: KVNamespace;
			};
			context: ExecutionContext;
		};
	}
}
```

### Access bindings in your Nuxt application

In Nuxt, add server-side code via [Server Routes and Middleware](https://nuxt.com/docs/guide/directory-structure/server#server-directory). The `defineEventHandler()` method is used to define your API endpoints in which you can access Cloudflare's context via the provided `context` field. The `context` field allows you to access any bindings set for your application.

The following code block shows an example of accessing a KV namespace in Nuxt.

<Tabs> <TabItem label="JavaScript" icon="seti:javascript">

```javascript null {2}
export default defineEventHandler(({ context }) => {
	const MY_KV = context.cloudflare.env.MY_KV;

	return {
		// ...
	};
});
```

</TabItem> <TabItem label="TypeScript" icon="seti:typescript">

```typescript null {2}
export default defineEventHandler(({ context }) => {
	const MY_KV = context.cloudflare.env.MY_KV;

	return {
		// ...
	};
});
```

</TabItem> </Tabs>

<Render file="framework-guides/learn-more" params={{ one: "Nuxt" }} />

## Related resources

### Tutorials

For more tutorials involving Nuxt, refer to the following resources:

<ResourcesBySelector tags={["Nuxt"]} types={["tutorial"]} />

### Demo apps

For demo applications using Nuxt, refer to the following resources:

<ExternalResources tags={["Nuxt"]} type="apps" />

---

# Pelican

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-pelican-site/

import { PagesBuildPreset, Render } from "~/components";

[Pelican](https://docs.getpelican.com) is a static site generator, written in Python. With Pelican, you can write your content directly with your editor of choice in reStructuredText or Markdown formats.

## Create a Pelican project

To begin, create a Pelican project directory. `cd` into your new directory and run:

```sh
python3 -m pip install pelican
```

Then run:

```sh
pip freeze > requirements.txt
```

Create a directory in your project named `content`:

```sh
mkdir content
```

This is the directory name that you will set in the build command.

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository" />

## Deploy with Cloudflare Pages

<Render file="deploy-to-pages-steps-with-preset" params={{ name: "Pelican" }} />

<PagesBuildPreset framework="pelican" />

4. Select **Environment variables (advanced)** and set the `PYTHON_VERSION` variable with the value of `3.7`.

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.

Every time you commit new code to your Pelican site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests and be able to preview how changes look to your site before deploying them to production.

<Render file="framework-guides/learn-more" params={{ one: "Pelican" }} />

---

# Preact

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-preact-site/

import { Render } from "~/components";

[Preact](https://preactjs.com) is a popular, open-source framework for building modern web applications. Preact can also be used as a lightweight alternative to React because the two share the same API and component model.

In this guide, you will create a new Preact application and deploy it using Cloudflare Pages.
You will use [`create-preact`](https://github.com/preactjs/create-preact), a lightweight project scaffolding tool to set up a new Preact app in seconds.

## Setting up a new project

Create a new project by running the [`npm init`](https://docs.npmjs.com/cli/v6/commands/npm-init) command in your terminal, giving it a title:

```sh
npm init preact
cd your-project-name
```

:::note

During initialization, you can accept the `Prerender app (SSG)?` option to have `create-preact` scaffold your app to produce static HTML pages, along with their assets, for production builds. This option is perfect for Pages.

:::

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository" />

## Deploy with Cloudflare Pages

<Render file="deploy-to-pages-steps-no-preset" />

<div>

| Configuration option | Value           |
| -------------------- | --------------- |
| Production branch    | `main`          |
| Build command        | `npm run build` |
| Build directory      | `dist`          |

</div>

Optionally, you can customize the **Project name** field. It defaults to the GitHub repository's name, but it does not need to match. The **Project name** value is assigned as your `*.pages.dev` subdomain.

After completing configuration, select **Save and Deploy**.

You will see your first deploy pipeline in progress. Pages installs all dependencies and builds the project as specified.

After you have deployed your site, you will receive a unique subdomain for your project on `*.pages.dev`.

Cloudflare Pages will automatically rebuild your project and deploy it on every new pushed commit.

Additionally, you will have access to [preview deployments](/pages/configuration/preview-deployments/), which repeat the build-and-deploy process for pull requests. With these, you can preview changes to your project with a real URL before deploying them to production.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

<Render file="framework-guides/learn-more" params={{ one: "Preact" }} />

---

# React

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/

import { PagesBuildPreset, Render, PackageManagers } from "~/components";

[React](https://reactjs.org/) is a popular framework for building reactive and powerful front-end applications, built by the open-source team at Facebook.

In this guide, you will create a new React application and deploy it using Cloudflare Pages.

## Setting up a new project

Use the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) CLI (C3) to set up a new project. C3 will create a new project directory, initiate React's official setup tool, and provide the option to deploy instantly.

To use `create-cloudflare` to create a new React project, run the following command:

<PackageManagers
	type="create"
	pkg="cloudflare@latest my-react-app"
	args="--framework=react --platform=pages"
/>

`create-cloudflare` will install dependencies, including the [Wrangler](/workers/wrangler/install-and-update/#check-your-wrangler-version) CLI and the Cloudflare Pages adapter, and ask you setup questions.

Go to the application's directory:

```sh
cd my-react-app
```

From here you can run your application with:

```sh
npm start
```

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository_no_init" />

## Deploy with Cloudflare Pages

<Render file="deploy-via-c3" params={{ name: "React" }} />

### Deploy via the Cloudflare dashboard

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/) and select your account.
2. In Account Home, select **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select the new GitHub repository that you created and, in the **Set up builds and deployments** section, provide the following information:

<div>

<PagesBuildPreset framework="react" />

</div>

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `react`, your project dependencies, and building your site, before deploying it.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.
Every time you commit new code to your React application, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

:::note[SPA rendering]

By default, Cloudflare Pages assumes you are developing a single-page application. Refer to [Serving Pages](/pages/configuration/serving-pages/#single-page-application-spa-rendering) for more information.

:::

<Render file="framework-guides/learn-more" params={{ one: "React" }} />

---

# Remix

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/

import {
	PagesBuildPreset,
	Render,
	PackageManagers,
	WranglerConfig,
} from "~/components";

[Remix](https://remix.run/) is a framework that is focused on fully utilizing the power of the web. Like Cloudflare Workers, it uses modern JavaScript APIs, and it places emphasis on web fundamentals such as meaningful HTTP status codes, caching and optimizing for both usability and performance.

In this guide, you will create a new Remix application and deploy to Cloudflare Pages.

## Setting up a new project

Use the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) CLI (C3) to set up a new project. C3 will create a new project directory, initiate Remix's official setup tool, and provide the option to deploy instantly.

To use `create-cloudflare` to create a new Remix project, run the following command:

<PackageManagers
	type="create"
	pkg="cloudflare@latest my-remix-app"
	args="--framework=remix --platform=pages"
/>

`create-cloudflare` will install additional dependencies, including the [Wrangler](/workers/wrangler/install-and-update/#check-your-wrangler-version) CLI and any necessary adapters, and ask you setup questions.

:::caution[Before you deploy]

Your Remix project will include a `functions/[[path]].ts` file. The `[[path]]` filename indicates that this file will handle requests to all incoming URLs. Refer to [Path segments](/pages/functions/routing/#dynamic-routes) to learn more.

The `functions/[[path]].ts` will not function as expected if you attempt to deploy your site before running `remix vite:build`.
:::

After setting up your project, change the directory and render your project by running the following command:

```sh
# choose Cloudflare Pages
cd my-remix-app
npm run dev
```

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository_no_init" />

## Deploy with Cloudflare Pages

<Render file="deploy-via-c3" params={{ name: "Remix" }} />

### Deploy via the Cloudflare dashboard

<Render file="deploy-to-pages-steps-with-preset" params={{ name: "Remix" }} />

<PagesBuildPreset framework="remix" />

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `npm`, your project dependencies, and building your site before deploying it.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.
Every time you commit new code to your Remix site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

### Deploy via the Wrangler CLI

If you use [`create-cloudflare`(C3)](https://www.npmjs.com/package/create-cloudflare) to create your new Remix project, C3 will automatically scaffold your project with [`wrangler`](/workers/wrangler/). To deploy your project, run the following command:

```sh
npm run deploy
```

## Create and add a binding to your Remix application

To add a binding to your Remix application, refer to [Bindings](/pages/functions/bindings/).
A [binding](/pages/functions/bindings/) allows your application to interact with Cloudflare developer products, such as [KV namespaces](/kv/concepts/how-kv-works/), [Durable Objects](/durable-objects/), [R2 storage buckets](/r2/), and [D1 databases](/d1/).

### Binding resources in local development

Remix uses Wrangler's [`getPlatformProxy`](/workers/wrangler/api/#getplatformproxy) to simulate the Cloudflare environment locally. You configure `getPlatformProxy` in your project's `vite.config.ts` file via [`cloudflareDevProxyVitePlugin`](https://remix.run/docs/en/main/future/vite#cloudflare-proxy).

To bind resources in local development, you need to configure the bindings in the Wrangler file. Refer to [Bindings](/workers/wrangler/configuration/#bindings) to learn more.

Once you have configured the bindings in the Wrangler file, the proxies are then available within `context.cloudflare` in your `loader` or `action` functions:

```typescript
export const loader = ({ context }: LoaderFunctionArgs) => {
	const { env, cf, ctx } = context.cloudflare;
	env.MY_BINDING; // Access bound resources here
	// ... more loader code here...
};
```

:::note[Correcting the env type]

You may have noticed that `context.cloudflare.env` is not typed correctly when you add additional bindings in the [Wrangler configuration file](/workers/wrangler/configuration/).

To fix this, run `npm run typegen` to generate the missing types. This will update the `Env` interface defined in `worker-configuration.d.ts`.
After running the command, you can access the bindings in your `loader` or `action` using `context.cloudflare.env` as shown above.
:::

### Binding resources in production

To bind resources in production, you need to configure the bindings in the Cloudflare dashboard. Refer to the [Bindings](/pages/functions/bindings/) documentation to learn more.

Once you have configured the bindings in the Cloudflare dashboard, the proxies are then available within `context.cloudflare.env` in your `loader` or `action` functions as shown [above](#binding-resources-in-local-development).

## Example: Access your D1 database in a Remix application

As an example, you will bind and query a D1 database in a Remix application.

1. Create a D1 database. Refer to the [D1 documentation](/d1/) to learn more.
2. Configure bindings for your D1 database in the Wrangler file:

<WranglerConfig>

```toml
[[ d1_databases ]]
binding = "DB"
database_name = "<YOUR_DATABASE_NAME>"
database_id = "<YOUR_DATABASE_ID>"
```

</WranglerConfig>

3. Run `npm run typegen` to generate TypeScript types for your bindings.

```sh
npm run typegen
```

```sh output
> typegen
> wrangler types

 â›…ï¸ wrangler 3.48.0
-------------------
interface Env {
	DB: D1Database;
}
```

4. Access the D1 database in your `loader` function:

```typescript
import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ context, params }) => {
  const { env, cf, ctx } = context.cloudflare;
  let { results } = await env.DB.prepare(
    "SELECT * FROM products where id = ?1"
  ).bind(params.productId).all();
  return json(results);
};

export default function Index() {
  const results = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Welcome to Remix</h1>
      <div>
        A value from D1:
        <pre>{JSON.stringify(results)}</pre>
      </div>
    </div>
  );
}
```

<Render file="framework-guides/learn-more" params={{ one: "Remix" }} />

---

# SolidStart

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-solid-start-site/

import { Render, PackageManagers } from "~/components";

[Solid](https://www.solidjs.com/) is an open-source web application framework focused on generating performant applications with a modern developer experience based on JSX.

In this guide, you will create a new Solid application implemented via [SolidStart](https://start.solidjs.com/getting-started/what-is-solidstart) (Solid's meta-framework) and deploy it using Cloudflare Pages.

## Create a new project

Use the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) CLI (C3) to set up a new project. C3 will create a new project directory, initiate Solid's official setup tool, and provide the option to deploy instantly.

To use `create-cloudflare` to create a new Solid project, run the following command:

<PackageManagers
	type="create"
	pkg="cloudflare@latest"
	args="my-solid-app --framework=solid"
/>

You will be prompted to select a starter. Choose any of the available options. You will then be asked if you want to enable Server Side Rendering. Reply `yes`. Finally, you will be asked if you want to use TypeScript, choose either `yes` or `no`.

`create-cloudflare` will then install dependencies, including the [Wrangler](/workers/wrangler/install-and-update/#check-your-wrangler-version) CLI and the SolidStart Cloudflare Pages adapter, and ask you setup questions.

After you have installed your project dependencies, start your application:

```sh
npm run dev
```

## SolidStart Cloudflare configuration

<Render file="c3-adapter" />

In order to configure SolidStart so that it can be deployed to Cloudflare pages, update its config file like so:

```diff
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
+  server: {
+    preset: "cloudflare-pages",

+    rollupConfig: {
+      external: ["node:async_hooks"]
+    }
+  }
});
```

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository" />

## Deploy with Cloudflare Pages

<Render file="deploy-via-c3" params={{ name: "Solid" }} />

### Deploy via the Cloudflare dashboard

<Render file="deploy-to-pages-steps-no-preset" />

<div>

| Configuration option | Value           |
| -------------------- | --------------- |
| Production branch    | `main`          |
| Build command        | `npm run build` |
| Build directory      | `dist`          |

</div>

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `npm`, your project dependencies, and building your site before deploying it.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.
Every time you commit new code to your Solid repository, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests, to preview how changes look to your site before deploying them to production.

<Render file="framework-guides/learn-more" params={{ one: "Solid" }} />

---

# Qwik

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-qwik-site/

import { PagesBuildPreset, Render, PackageManagers } from "~/components";

[Qwik](https://github.com/builderio/qwik) is an open-source, DOM-centric, resumable web application framework designed for best possible time to interactive by focusing on [resumability](https://qwik.builder.io/docs/concepts/resumable/), server-side rendering of HTML and [fine-grained lazy-loading](https://qwik.builder.io/docs/concepts/progressive/#lazy-loading) of code.

In this guide, you will create a new Qwik application implemented via [Qwik City](https://qwik.builder.io/qwikcity/overview/) (Qwik's meta-framework) and deploy it using Cloudflare Pages.

## Creating a new project

Use the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) CLI (C3) to create a new project. C3 will create a new project directory, initiate Qwik's official setup tool, and provide the option to deploy instantly.

To use `create-cloudflare` to create a new Qwik project, run the following command:

<PackageManagers
	type="create"
	pkg="cloudflare@latest my-qwik-app"
	args="--framework=qwik --platform=pages"
/>

`create-cloudflare` will install additional dependencies, including the [Wrangler CLI](/workers/wrangler/install-and-update/#check-your-wrangler-version) and any necessary adapters, and ask you setup questions.

As part of the `cloudflare-pages` adapter installation, a `functions/[[path]].ts` file will be created. The `[[path]]` filename indicates that this file will handle requests to all incoming URLs. Refer to [Path segments](/pages/functions/routing/#dynamic-routes) to learn more.

After selecting your server option, change the directory to your project and render your project by running the following command:

```sh
npm start
```

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository" />

## Deploy with Cloudflare Pages

<Render file="deploy-via-c3" params={{ name: "Qwik" }} />

### Deploy via the Cloudflare dashboard

<Render file="deploy-to-pages-steps-with-preset" params={{ name: "Qwik" }} />

<PagesBuildPreset framework="qwik" />

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `npm`, your project dependencies, and building your site before deploying it.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.
Every time you commit new code to your Qwik site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests, to preview how changes look to your site before deploying them to production.

## Use bindings in your Qwik application

A [binding](/pages/functions/bindings/) allows your application to interact with Cloudflare developer products, such as [KV](/kv/concepts/how-kv-works/), [Durable Object](/durable-objects/), [R2](/r2/), and [D1](https://blog.cloudflare.com/introducing-d1/).

In QwikCity, add server-side code via [routeLoaders](https://qwik.builder.io/qwikcity/route-loader/) and [actions](https://qwik.builder.io/qwikcity/action/). Then access bindings set for your application via the `platform` object provided by the framework.

The following code block shows an example of accessing a KV namespace in QwikCity.

```typescript null {4,5}
// ...

export const useGetServerTime = routeLoader$(({ platform }) => {
  // the type `KVNamespace` comes from the @cloudflare/workers-types package
  const { MY_KV } = (platform.env as { MY_KV: KVNamespace }));

  return {
    // ....
  }
});
```

<Render file="framework-guides/learn-more" params={{ one: "Qwik" }} />

---

# Sphinx

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-sphinx-site/

import { Render } from "~/components";

[Sphinx](https://www.sphinx-doc.org/) is a tool that makes it easy to create documentation and was originally made for the publication of Python documentation. It is well known for its simplicity and ease of use.

In this guide, you will create a new Sphinx project and deploy it using Cloudflare Pages.

## Prerequisites

- Python 3 - Sphinx is based on Python, therefore you must have Python installed

- [pip](https://pypi.org/project/pip/) - The PyPA recommended tool for installing Python packages

- [pipenv](https://pipenv.pypa.io/en/latest/) - automatically creates and manages a virtualenv for your projects

:::note

If you are already running a version of Python 3.7, ensure that Python version 3.7 is also installed on your computer before you begin this guide. Python 3.7 is the latest version supported by Cloudflare Pages.

:::

The latest version of Python 3.7 is 3.7.11:

[Python 3.7.11](https://www.python.org/downloads/release/python-3711/)

### Installing Python

Refer to the official Python documentation for installation guidance:

- [Windows](https://www.python.org/downloads/windows/)
- [Linux/UNIX](https://www.python.org/downloads/source/)
- [macOS](https://www.python.org/downloads/macos/)
- [Other](https://www.python.org/download/other/)

### Installing Pipenv

If you already had an earlier version of Python installed before installing version 3.7, other global packages you may have installed could interfere with the following steps to install Pipenv, or your other Python projects which depend on global packages.

[Pipenv](https://pipenv.pypa.io/en/latest/) is a Python-based package manager that makes managing virtual environments simple. This guide will not require you to have prior experience with or knowledge of Pipenv to complete your Sphinx site deployment. Cloudflare Pages natively supports the use of Pipenv and, by default, has the latest version installed.

The quickest way to install Pipenv is by running the command:

```sh
pip install --user pipenv
```

This command will install Pipenv to your user level directory and will make it accessible via your terminal. You can confirm this by running the following command and reviewing the expected output:

```sh
pipenv --version
```

```sh output
pipenv, version 2021.5.29
```

### Creating a Sphinx project directory

From your terminal, run the following commands to create a new directory and navigate to it:

```sh
mkdir my-wonderful-new-sphinx-project
cd my-wonderful-new-sphinx-project
```

### Pipenv with Python 3.7

Pipenv allows you to specify which version of Python to associate with a virtual environment. For the purpose of this guide, the virtual environment for your Sphinx project must use Python 3.7.

Use the following command:

```sh
pipenv --python 3.7
```

You should see the following output:

```bash
Creating a virtualenv for this project...
Pipfile: /home/ubuntu/my-wonderful-new-sphinx-project/Pipfile
Using /usr/bin/python3.7m (3.7.11) to create virtualenv...
â ¸ Creating virtual environment...created virtual environment CPython3.7.11.final.0-64 in 1598ms
  creator CPython3Posix(dest=/home/ubuntu/.local/share/virtualenvs/my-wonderful-new-sphinx-project-Y2HfWoOr, clear=False, no_vcs_ignore=False, global=False)
  seeder FromAppData(download=False, pip=bundle, setuptools=bundle, wheel=bundle, via=copy, app_data_dir=/home/ubuntu/.local/share/virtualenv)
    added seed packages: pip==21.1.3, setuptools==57.1.0, wheel==0.36.2
  activators BashActivator,CShellActivator,FishActivator,PowerShellActivator,PythonActivator,XonshActivator

âœ” Successfully created virtual environment!
Virtualenv location: /home/ubuntu/.local/share/virtualenvs/my-wonderful-new-sphinx-project-Y2HfWoOr
Creating a Pipfile for this project...
```

List the contents of the directory:

```sh
ls
```

```sh output
Pipfile
```

### Installing Sphinx

Before installing Sphinx, create the directory you want your project to live in.

From your terminal, run the following command to install Sphinx:

```sh
pipenv install sphinx
```

You should see output similar to the following:

```bash
Installing sphinx...
Adding sphinx to Pipfile's [packages]...
âœ” Installation Succeeded
Pipfile.lock not found, creating...
Locking [dev-packages] dependencies...
Locking [packages] dependencies...
Building requirements...
Resolving dependencies...
âœ” Success!
Updated Pipfile.lock (763aa3)!
Installing dependencies from Pipfile.lock (763aa3)...
  ðŸ   â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰â–‰ 0/0 â€” 00:00:00
To activate this project's virtualenv, run pipenv shell.
Alternatively, run a command inside the virtualenv with pipenv run.
```

This will install Sphinx into a new virtual environment managed by Pipenv. You should see a directory structure like this:

```bash
my-wonderful-new-sphinx-project
|--Pipfile
|--Pipfile.lock
```

## Creating a new project

With Sphinx installed, you can now run the quickstart command to create a template project for you. This command will only work within the Pipenv environment you created in the previous step. To enter that environment, run the following command from your terminal:

```sh
pipenv shell
```

```sh output
Launching subshell in virtual environment...
ubuntu@sphinx-demo:~/my-wonderful-new-sphinx-project$  . /home/ubuntu/.local/share/virtualenvs/my-wonderful-new-sphinx-project-Y2HfWoOr/bin/activate
```

Now run the following command:

```sh
sphinx-quickstart
```

You will be presented with a number of questions, please answer them in the following:

```sh output
Separate source and build directories (y/n) [n]: Y
Project name: <Your project name>
Author name(s): <You Author Name>
Project release []: <You can accept default here or provide a version>
Project language [en]: <You can accept en here or provide a regional language code>
```

This will create four new files in your active directory, `source/conf.py`, `index.rst`, `Makefile` and `make.bat`:

```bash
my-wonderful-new-sphinx-project
|--Pipfile
|--Pipfile.lock
|--source
|----_static
|----_templates
|----conf.py
|----index.rst
|--Makefile
|--make.bat
```

You now have everything you need to start deploying your site to Cloudflare Pages. For learning how to create documentation with Sphinx, refer to the official [Sphinx documentation](https://www.sphinx-doc.org/en/master/usage/quickstart.html).

<Render file="tutorials-before-you-start" />

## Creating a GitHub repository

In a separate terminal window that is not within the pipenv shell session, verify that SSH key-based authentication is working:

```sh
eval "$(ssh-agent)"
ssh-add -T ~/.ssh/id_rsa.pub
ssh -T git@github.com
```

```sh output

The authenticity of host 'github.com (140.82.113.4)' can't be established.
RSA key fingerprint is SHA256:nThbg6kXUpJWGl7E1IGOCspRomTxdCARLviKw6E5SY8.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'github.com,140.82.113.4' (RSA) to the list of known hosts.
Hi yourgithubusername! You've successfully authenticated, but GitHub does not provide shell access.
```

Create a new GitHub repository by visiting [repo.new](https://repo.new). After your repository is set up, push your application to GitHub by running the following commands in your terminal:

```sh
git init
git config user.name "Your Name"
git config user.email "username@domain.com"
git remote add origin git@github.com:yourgithubusername/githubrepo.git
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

<Render file="deploy-to-pages-steps-no-preset" />

<div>

| Configuration option | Value        |
| -------------------- | ------------ |
| Production branch    | `main`       |
| Build command        | `make html`  |
| Build directory      | `build/html` |

</div>

Below the configuration, make sure to set the environment variable for specifying the `PYTHON_VERSION`.

For example:

<div>

| Variable name  | Value |
| -------------- | ----- |
| PYTHON_VERSION | 3.7   |

</div>

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `Pipenv`, your project dependencies, and building your site, before deployment.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`. Every time you commit new code to your Sphinx site, Cloudflare Pages will automatically rebuild your project and deploy it.

You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

<Render file="framework-guides/learn-more" params={{ one: "Sphinx" }} />

---

# SvelteKit

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-kit-site/

import { PagesBuildPreset, Render, PackageManagers } from "~/components";

[Svelte](https://svelte.dev) is an increasingly popular, open-source framework for building user interfaces and web applications. Unlike most frameworks, Svelte is primarily a compiler that converts your component code into efficient JavaScript that surgically updates the DOM when your application state changes.

In this guide, you will create a new Svelte application and deploy it using Cloudflare Pages.
You will use [`SvelteKit`](https://kit.svelte.dev/), the official Svelte framework for building web applications of all sizes.

## Setting up a new project

Use the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) CLI (C3) to set up a new project. C3 will create a new project directory, initiate Svelte's official setup tool, and provide the option to deploy instantly.

To use `create-cloudflare` to create a new Svelte project, run the following command:

<PackageManagers
	type="create"
	pkg="cloudflare@latest my-svelte-app"
	args="--framework=svelte --platform=pages"
/>

SvelteKit will prompt you for customization choices. For the template option, choose one of the application/project options. The remaining answers will not affect the rest of this guide. Choose the options that suit your project.

`create-cloudflare` will then install dependencies, including the [Wrangler](/workers/wrangler/install-and-update/#check-your-wrangler-version) CLI and the `@sveltejs/adapter-cloudflare` adapter, and ask you setup questions.

After you have installed your project dependencies, start your application:

```sh
npm run dev
```

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository" />

## SvelteKit Cloudflare configuration

To use SvelteKit with Cloudflare Pages, you need to add the [Cloudflare adapter](https://kit.svelte.dev/docs/adapter-cloudflare) to your application.

<Render file="c3-adapter" />

1. Install the Cloudflare Adapter by running `npm i --save-dev @sveltejs/adapter-cloudflare` in your terminal.
2. Include the adapter in `svelte.config.js`:

```diff
- import adapter from '@sveltejs/adapter-auto';
+ import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    // ... truncated ...
  }
};

export default config;
```

3. (Needed if you are using TypeScript) Include support for environment variables. The `env` object, containing KV namespaces and other storage objects, is passed to SvelteKit via the platform property along with context and caches, meaning you can access it in hooks and endpoints. For example:

```diff
declare namespace App {
    interface Locals {}

+   interface Platform {
+       env: {
+           COUNTER: DurableObjectNamespace;
+       };
+       context: {
+           waitUntil(promise: Promise<any>): void;
+       };
+       caches: CacheStorage & { default: Cache }
+   }

    interface Session {}

    interface Stuff {}
}

```

4. Access the added KV or Durable objects (or generally any [binding](/pages/functions/bindings/)) in your endpoint with `env`:

```js
export async function post(context) {
	const counter = context.platform.env.COUNTER.idFromName("A");
}
```

:::note

In addition to the Cloudflare adapter, review other adapters you can use in your project:

- [`@sveltejs/adapter-auto`](https://www.npmjs.com/package/@sveltejs/adapter-auto)

  SvelteKit's default adapter automatically chooses the adapter for your current environment. If you use this adapter, [no configuration is needed](https://kit.svelte.dev/docs/adapter-auto). However, the default adapter introduces a few disadvantages for local development because it has no way of knowing what platform the application is going to be deployed to.

To solve this issue, provide a `CF_PAGES` variable to SvelteKit so that the adapter can detect the Pages platform. For example, when locally building the application: `CF_PAGES=1 vite build`.

- [`@sveltejs/adapter-static`](https://www.npmjs.com/package/@sveltejs/adapter-static)
  Only produces client-side static assets (no server-side rendering) and is compatible with Cloudflare Pages.
  Review the [official SvelteKit documentation](https://kit.svelte.dev/docs/adapter-static) for instructions on how to set up the adapter. Keep in mind that if you decide to use this adapter, the build directory, instead of `.svelte-kit/cloudflare`, becomes `build`. You must also configure your Cloudflare Pages application's build directory accordingly.

:::

:::caution

If you are using any adapter different from the default SvelteKit adapter, remember to commit and push your adapter setting changes to your GitHub repository before attempting the deployment.

:::

## Deploy with Cloudflare Pages

<Render file="deploy-via-c3" params={{ name: "Svelte" }} />

### Deploy via the Cloudflare dashboard

<Render
	file="deploy-to-pages-steps-with-preset"
	params={{ name: "SveltKit" }}
/>

<div>

<PagesBuildPreset framework="sveltekit" />

</div>

Optionally, you can customize the **Project name** field. It defaults to the GitHub repository's name, but it does not need to match. The **Project name** value is assigned as your `*.pages.dev` subdomain.

After completing configuration, click the **Save and Deploy** button.

You will see your first deploy pipeline in progress. Pages installs all dependencies and builds the project as specified.

Cloudflare Pages will automatically rebuild your project and deploy it on every new pushed commit.

Additionally, you will have access to [preview deployments](/pages/configuration/preview-deployments/), which repeat the build-and-deploy process for pull requests. With these, you can preview changes to your project with a real URL before deploying them to production.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

## Functions setup

In SvelteKit, functions are written as endpoints. Functions contained in the `/functions` directory at the project's root will not be included in the deployment, which compiles to a single `_worker.js` file.

To have the functionality equivalent to Pages Functions [`onRequests`](/pages/functions/api-reference/#onrequests), you need to write standard request handlers in SvelteKit. For example, the following TypeScript file behaves like an `onRequestGet`:

```ts
import type { RequestHandler } from "./$types";

export const GET = (({ url }) => {
	return new Response(String(Math.random()));
}) satisfies RequestHandler;
```

:::note[SvelteKit API Routes]

For more information about SvelteKit API Routes, refer to the [SvelteKit documentation](https://kit.svelte.dev/docs/routing#server).
:::

<Render file="framework-guides/learn-more" params={{ one: "Svelte" }} />

---

# Vite 3

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/

import { Render, PackageManagers } from "~/components";

[Vite](https://vitejs.dev) is a next-generation build tool for front-end developers. With [the release of Vite 3](https://vitejs.dev/blog/announcing-vite3.html), developers can make use of new command line (CLI) improvements, starter templates, and [more](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md#300-2022-07-13) to help build their front-end applications.

Cloudflare Pages has native support for Vite 3 projects. Refer to the blog post on [improvements to the Pages build process](https://blog.cloudflare.com/cloudflare-pages-build-improvements/), including sub-second build initialization, for more information on using Vite 3 and Cloudflare Pages to optimize your application's build tooling.

In this guide, you will learn how to start a new project using Vite 3, and deploy it to Cloudflare Pages.

<PackageManagers type="create" pkg="vite@latest" />

```sh output
âœ” Project name: â€¦ vite-on-pages
âœ” Select a framework: â€º vue
âœ” Select a variant: â€º vue

Scaffolding project in ~/src/vite-on-pages...

Done. Now run:

  cd vite-on-pages
  npm install
  npm run dev
```

You will now create a new GitHub repository, and push your code using [GitHub's `gh` command line (CLI)](https://cli.github.com):

```sh
git init
```

```sh output
Initialized empty Git repository in ~/vite-vue3-on-pages/.git/
```

```sh
git add .
git commit -m "Initial commit"                                           vite-vue3-on-pages/git/main +
```

```sh output
[main (root-commit) dad4177] Initial commit
 14 files changed, 1452 insertions(+)
```

```sh
gh repo create
```

```sh output
âœ“ Created repository kristianfreeman/vite-vue3-on-pages on GitHub
âœ“ Added remote git@github.com:kristianfreeman/vite-vue3-on-pages.git
```

```sh
git push
```

To deploy your site to Pages:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/) and select your account.
2. In Account Home, select **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your new GitHub repository.
4. In the **Set up builds and deployments**, set `npm run build` as the **Build command**, and `dist` as the **Build output directory**.

After completing configuration, select **Save and Deploy**.

You will see your first deploy pipeline in progress. Pages installs all dependencies and builds the project as specified. After you have deployed your project, it will be available at the `<YOUR_PROJECT_NAME>.pages.dev` subdomain. Find your project's subdomain in **Workers & Pages** > select your Pages project > **Deployments**.

Cloudflare Pages will automatically rebuild your project and deploy it on every new pushed commit.

Additionally, you will have access to [preview deployments](/pages/configuration/preview-deployments/), which repeat the build-and-deploy process for pull requests. With these, you can preview changes to your project with a real URL before deploying them to production.

<Render file="framework-guides/learn-more" params={{ one: "Vite 3" }} />

---

# VitePress

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-vitepress-site/

import { PagesBuildPreset, Render, TabItem, Tabs } from "~/components";

[VitePress](https://vitepress.dev/) is a [static site generator](https://en.wikipedia.org/wiki/Static_site_generator) (SSG) designed for building fast, content-centric websites. VitePress takes your source content written in [Markdown](https://en.wikipedia.org/wiki/Markdown), applies a theme to it, and generates static HTML pages that can be easily deployed anywhere.

In this guide, you will create a new VitePress project and deploy it using Cloudflare Pages.

## Set up a new project

VitePress ships with a command line setup wizard that will help you scaffold a basic project.

Run the following command in your terminal to create a new VitePress project:

<Tabs> <TabItem label="npm">

```sh
npx vitepress@latest init
```

</TabItem> <TabItem label="pnpm">

```sh
pnpm dlx vitepress@latest init
```

</TabItem> <TabItem label="yarn">

```sh
yarn dlx vitepress@latest init
```

</TabItem> <TabItem label="bun">

```sh
bunx vitepress@latest init
```

</TabItem> </Tabs>

Amongst other questions, the setup wizard will ask you in which directory to save your new project, make sure
to be in the project's directory and then install the `vitepress` dependency with the following command:

<Tabs> <TabItem label="npm">

```sh
npm add -D vitepress
```

</TabItem> <TabItem label="pnpm">

```sh
pnpm add -D vitepress
```

</TabItem> <TabItem label="yarn">

```sh
yarn add -D vitepress
```

</TabItem> <TabItem label="bun">

```sh
bun add -D vitepress
```

</TabItem> </Tabs>

:::note

If you encounter errors, make sure your local machine meets the [Prerequisites for VitePress](https://vitepress.dev/guide/getting-started#prerequisites).

:::

Finally create a `.gitignore` file with the following content:

```
node_modules
.vitepress/cache
.vitepress/dist
```

This step makes sure that unnecessary files are not going to be included in the project's git repository (which we will set up next).

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository" />

## Deploy with Cloudflare Pages

<Render
	file="deploy-to-pages-steps-with-preset"
	params={{ name: "VitePress" }}
/>

<PagesBuildPreset framework="vitepress" />

After configuring your site, you can begin your first deploy. Cloudflare Pages will install `vitepress`, your project dependencies, and build your site, before deploying it.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`. Every time you commit and push new code to your VitePress project, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes to your site look before deploying them to production.

<Render file="framework-guides/learn-more" params={{ one: "VitePress" }} />

---

# Vue

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-vue-site/

import { PagesBuildPreset, Render, PackageManagers } from "~/components";

[Vue](https://vuejs.org/) is a progressive JavaScript framework for building user interfaces. A core principle of Vue is incremental adoption: this makes it easy to build Vue applications that live side-by-side with your existing code.

In this guide, you will create a new Vue application and deploy it using Cloudflare Pages. You will use `vue-cli`, a batteries-included tool for generating new Vue applications.

## Setting up a new project

Use the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) CLI (C3) to set up a new project. C3 will create a new project directory, initiate Vue's official setup tool, and provide the option to deploy instantly.

To use `create-cloudflare` to create a new Vue project, run the following command:

<PackageManagers
	type="create"
	pkg="cloudflare@latest my-vue-app "
	args="--framework=vue --platform=pages"
/>

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository_no_init" />

## Deploy with Cloudflare Pages

<Render file="deploy-via-c3" params={{ name: "Vue" }} />

### Deploy via the Cloudflare dashboard

<Render file="deploy-to-pages-steps-with-preset" params={{ name: "Vue" }} />

<div>

<PagesBuildPreset framework="vue" />

</div>

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `vue`, your project dependencies, and building your site, before deploying it.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.
Every time you commit new code to your Vue application, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

<Render file="framework-guides/learn-more" params={{ one: "Vue" }} />

---

# Zola

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-a-zola-site/

import { PagesBuildPreset, Render } from "~/components";

[Zola](https://www.getzola.org/) is a fast static site generator in a single binary with everything built-in. In this guide, you will create a new Zola application and deploy it using Cloudflare Pages. You will use the `zola` CLI to create a new Zola site.

## Installing Zola

First, [install](https://www.getzola.org/documentation/getting-started/installation/) the `zola` CLI, using the specific instructions for your operating system below:

### macOS (Homebrew)

If you use the package manager [Homebrew](https://brew.sh), run the `brew install` command in your terminal to install Zola:

```sh
brew install zola
```

### Windows (Chocolatey)

If you use the package manager [Chocolatey](https://chocolatey.org/), run the `choco install` command in your terminal to install Zola:

```sh
choco install zola
```

### Windows (Scoop)

If you use the package manager [Scoop](https://scoop.sh/), run the `scoop install` command in your terminal to install Zola:

```sh
scoop install zola
```

### Linux (pkg)

Your Linux distro's package manager may include Zola. If this is the case, you can install it directly using your distro's package manager -- for example, using `pkg`, run the following command in your terminal:

```sh
pkg install zola
```

If your package manager does not include Zola or you would like to download a release directly, refer to the [**Manual**](/pages/framework-guides/deploy-a-zola-site/#manual-installation) section below.

### Manual installation

The Zola GitHub repository contains pre-built versions of the Zola command-line tool for various operating systems, which can be found on [the Releases page](https://github.com/getzola/zola/releases).

For more instruction on installing these releases, refer to [Zola's install guide](https://www.getzola.org/documentation/getting-started/installation/).

## Creating a new project

With Zola installed, create a new project by running the `zola init` command in your terminal using the default template:

```sh
zola init my-zola-project
```

Upon running `zola init`, you will prompted with three questions:

1. What is the URL of your site? ([https://example.com](https://example.com)):
   You can leave this one blank for now.

2. Do you want to enable Sass compilation? \[Y/n]: Y

3. Do you want to enable syntax highlighting? \[y/N]: y

4. Do you want to build a search index of the content? \[y/N]: y

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository_no_init" />

## Deploy with Cloudflare Pages

<Render file="deploy-to-pages-steps-with-preset" params={{ name: "Zola" }} />

<PagesBuildPreset framework="zola" />

Below the configuration, make sure to set the **Environment Variables (advanced)** for specifying the `ZOLA_VERSION`.

For example, `ZOLA_VERSION`: `0.17.2`.

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `zola`, your project dependencies, and building your site, before deploying it.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.

You can now add that subdomain as the `base_url` in your `config.toml` file.

For example:

```yaml
# The URL the site will be built for
base_url = "https://my-zola-project.pages.dev"
```

Every time you commit new code to your Zola site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

<Render file="framework-guides/learn-more" params={{ one: "Zola" }} />

---

# Analog

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-an-analog-site/

import {
	PagesBuildPreset,
	Render,
	TabItem,
	Tabs,
	PackageManagers,
} from "~/components";

[Analog](https://analogjs.org/) is a fullstack meta-framework for Angular, powered by [Vite](https://vitejs.dev/) and [Nitro](https://nitro.unjs.io/).

In this guide, you will create a new Analog application and deploy it using Cloudflare Pages.

## Create a new project with `create-cloudflare`

The easiest way to create a new Analog project and deploy to Cloudflare Pages is to use the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) CLI (also known as C3). To get started, open a terminal and run:

<PackageManagers
	type="create"
	pkg="cloudflare@latest my-analog-app"
	args="--framework=analog --platform=pages"
/>

C3 will walk you through the setup process and create a new project using `create-analog`, the official Analog creation tool. It will also install the necessary adapters along with the [Wrangler CLI](/workers/wrangler/install-and-update/#check-your-wrangler-version).

:::note[Deployment]

The final step of the C3 workflow will offer to deploy your application to Cloudflare. For more information on deployment options, see the [Deployment](#deployment) section below.

:::

## Bindings

A [binding](/pages/functions/bindings/) allows your application to interact with Cloudflare developer products, such as [KV](/kv/), [Durable Objects](/durable-objects/), [R2](/r2/), and [D1](/d1/).

If you intend to use bindings in your project, you must first set up your bindings for local and remote development.

In Analog, server-side code can be added via [API Routes](https://analogjs.org/docs/features/api/overview). The `defineEventHandler()` method is used to define your API endpoints in which you can access Cloudflare's context via the provided `context` field. The `context` field allows you to access any bindings set for your application.

The following code block shows an example of accessing a KV namespace in Analog.

```typescript null {2}
export default defineEventHandler(async ({ context }) => {
	const { MY_KV } = context.cloudflare.env;
	const greeting = (await MY_KV.get("greeting")) ?? "hello";

	return {
		greeting,
	};
});
```

### Setup bindings in development

Projects created via C3 come installed with a Nitro module that simplifies the process of working with bindings during development:

```typescript
const devBindingsModule = async (nitro: Nitro) => {
  if (nitro.options.dev) {
    nitro.options.plugins.push('./src/dev-bindings.ts');
  }
};

export default defineConfig({
  ...
  plugins: [analog({
    nitro: {
      preset: "cloudflare-pages",
      modules: [devBindingsModule]
    }
  })],
  ...
});
```

This module in turn loads a plugin which adds bindings to the request context in dev:

```typescript
import { NitroApp } from "nitropack";
import { defineNitroPlugin } from "nitropack/dist/runtime/plugin";

export default defineNitroPlugin((nitroApp: NitroApp) => {
	nitroApp.hooks.hook("request", async (event) => {
		const _pkg = "wrangler"; // Bypass bundling!
		const { getPlatformProxy } = (await import(
			_pkg
		)) as typeof import("wrangler");
		const platform = await getPlatformProxy();

		event.context.cf = platform["cf"];
		event.context.cloudflare = {
			env: platform["env"] as unknown as Env,
			context: platform["ctx"],
		};
	});
});
```

In the code above, the `getPlatformProxy` helper function will automatically detect any bindings defined in your project's Wrangler file and emulate those bindings in local development. You may wish to refer to [Wrangler configuration information on bindings](/workers/wrangler/configuration/#bindings).

A new type definition for the `Env` type (used by `context.cloudflare.env`) can be generated from the [Wrangler configuration file](/workers/wrangler/configuration/) with the following command:

```sh
npm run cf-typegen
```

This should be done any time you add new bindings to your Wrangler configuration.

### Setup bindings in deployed applications

In order to access bindings in a deployed application, you will need to [configure your bindings](/pages/functions/bindings/) in the Cloudflare dashboard.

## Deployment

When creating your new project, C3 will give you the option of deploying an initial version of your application via [Direct Upload](/pages/how-to/use-direct-upload-with-continuous-integration/). You can redeploy your application at any time by running following command inside your project directory:

```sh
npm run deploy
```

<Render file="framework-guides/git-integration" />

### Create a GitHub repository

<Render file="framework-guides/create-gh-repo" />

```sh
# Skip the following three commands if you have built your application
# using C3 or already committed your changes
git init
git add .
git commit -m "Initial commit"

git branch -M main
git remote add origin https://github.com/<YOUR_GH_USERNAME>/<REPOSITORY_NAME>
git push -u origin main
```

### Create a Pages project

<Render file="deploy-to-pages-steps-with-preset" params={{ name: "Analog" }} />

<PagesBuildPreset framework="analog" />

Optionally, you can customize the **Project name** field. It defaults to the GitHub repository's name, but it does not need to match. The **Project name** value is assigned as your `*.pages.dev` subdomain.

4. After completing configuration, select the **Save and Deploy**.

Review your first deploy pipeline in progress. Pages installs all dependencies and builds the project as specified. Cloudflare Pages will automatically rebuild your project and deploy it on every new pushed commit.

Additionally, you will have access to [preview deployments](/pages/configuration/preview-deployments/), which repeat the build-and-deploy process for pull requests. With these, you can preview changes to your project with a real URL before deploying your changes to production.

---

# Angular

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-an-angular-site/

import { PagesBuildPreset, Render, PackageManagers } from "~/components";

[Angular](https://angular.io/) is an incredibly popular framework for building reactive and powerful front-end applications.

In this guide, you will create a new Angular application and deploy it using Cloudflare Pages.

## Create a new project using the `create-cloudflare` CLI (C3)

Use the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) CLI (C3) to set up a new project. C3 will create a new project directory, initiate Angular's official setup tool, and provide the option to deploy instantly.

To use `create-cloudflare` to create a new Angular project, run the following command:

<PackageManagers
	type="create"
	pkg="cloudflare@latest my-angular-app"
	args="--framework=angular --platform=pages"
/>

`create-cloudflare` will install dependencies, including the [Wrangler](/workers/wrangler/install-and-update/#check-your-wrangler-version) CLI and the Cloudflare Pages adapter, and ask you setup questions.

:::note[Git integration]

The initial deployment created via C3 is referred to as a [Direct Upload](/pages/get-started/direct-upload/). To set up a deployment via the Pages Git integration, refer to the [Git Integration](#git-integration) section below.

:::

<Render file="framework-guides/git-integration" />

### Create a GitHub repository

<Render file="framework-guides/create-gh-repo" /> <br />

```sh
# Skip the following three commands if you have built your application
#Â using C3 or already committed your changes
git init
git add .
git commit -m "Initial commit"

git branch -M main
git remote add origin https://github.com/<YOUR_GH_USERNAME>/<REPOSITORY_NAME>
git push -u origin main
```

### Create a Pages project

<Render file="deploy-to-pages-steps-with-preset" params={{ name: "Angular" }} />

<PagesBuildPreset framework="angular" />

Optionally, you can customize the **Project name** field. It defaults to the GitHub repository's name, but it does not need to match. The **Project name** value is assigned as your `*.pages.dev` subdomain.

4. After completing configuration, select the **Save and Deploy**.

Review your first deploy pipeline in progress. Pages installs all dependencies and builds the project as specified. Cloudflare Pages will automatically rebuild your project and deploy it on every new pushed commit.

Additionally, you will have access to [preview deployments](/pages/configuration/preview-deployments/), which repeat the build-and-deploy process for pull requests. With these, you can preview changes to your project with a real URL before deploying your changes to production.

<Render file="framework-guides/learn-more" params={{ one: "Angular" }} />

---

# Elder.js

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-an-elderjs-site/

import { PagesBuildPreset, Render } from "~/components";

[Elder.js](https://elderguide.com/tech/elderjs/) is an SEO-focused framework for building static sites with [SvelteKit](/pages/framework-guides/deploy-a-svelte-kit-site/).

In this guide, you will create a new Elder.js application and deploy it using Cloudflare Pages.

## Setting up a new project

Create a new project using [`npx degit Elderjs/template`](https://docs.npmjs.com/cli/v6/commands/npm-init), giving it a project name:

```sh
npx degit Elderjs/template elderjs-app
cd elderjs-app
```

The Elder.js template includes a number of pages and examples showing how to build your static site, but by simply generating the project, it is already ready to be deployed to Cloudflare Pages.

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository" />

## Deploy with Cloudflare Pages

<Render
	file="deploy-to-pages-steps-with-preset"
	params={{ name: "Elder.js" }}
/>

<PagesBuildPreset framework="elder-js" />

Optionally, you can customize the **Project name** field. It defaults to the GitHub repository's name, but it does not need to match. The **Project name** value is assigned as your `*.pages.dev` subdomain.

### Finalize Setup

After completing configuration, click the **Save and Deploy** button.

You will see your first deploy pipeline in progress. Pages installs all dependencies and builds the project as specified.

Cloudflare Pages will automatically rebuild your project and deploy it on every new pushed commit.

Additionally, you will have access to [preview deployments](/pages/configuration/preview-deployments/), which repeat the build-and-deploy process for pull requests. With these, you can preview changes to your project with a real URL before deploying them to production.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

<Render file="framework-guides/learn-more" params={{ one: "Elder.js" }} />

---

# Astro

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/

import {
	PagesBuildPreset,
	Render,
	PackageManagers,
	Stream,
} from "~/components";

[Astro](https://astro.build) is an all-in-one web framework for building fast, content-focused websites. By default, Astro builds websites that have zero JavaScript runtime code.

Refer to the [Astro Docs](https://docs.astro.build/) to learn more about Astro or for assistance with an Astro project.

In this guide, you will create a new Astro application and deploy it using Cloudflare Pages.

### Video Tutorial

<Stream
	id="d308a0e06bfaefd12115b34076ba99a4"
	title="Build a Full-Stack Application using Astro and Cloudflare Workers"
	thumbnail="3s"
/>

## Set up a new project

To use `create-cloudflare` to create a new Astro project, run the following command:

<PackageManagers
	type="create"
	pkg="cloudflare@latest my-astro-app"
	args="--framework=astro --platform=pages"
/>

Astro will ask:

1. Which project type you would like to set up. Your answers will not affect the rest of this tutorial. Select an answer ideal for your project.

2. If you want to initialize a Git repository. We recommend you to select `No` and follow this guide's [Git instructions](/pages/framework-guides/deploy-an-astro-site/#create-a-github-repository) below. If you select `Yes`, do not follow the below Git instructions precisely but adjust them to your needs.

`create-cloudflare` will then install dependencies, including the [Wrangler](/workers/wrangler/install-and-update/#check-your-wrangler-version) CLI and the `@astrojs/cloudflare` adapter, and ask you setup questions.

### Astro configuration

You can deploy an Astro Server-side Rendered (SSR) site to Cloudflare Pages using the [`@astrojs/cloudflare` adapter](https://github.com/withastro/adapters/tree/main/packages/cloudflare#readme). SSR sites render on Pages Functions and allow for dynamic functionality and customizations.

<Render file="c3-adapter" />

Add the [`@astrojs/cloudflare` adapter](https://github.com/withastro/adapters/tree/main/packages/cloudflare#readme) to your project's `package.json` by running:

```sh
npm run astro add cloudflare
```

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository" />

## Deploy with Cloudflare Pages

<Render file="deploy-via-c3" params={{ name: "Astro" }} />

### Deploy via the Cloudflare dashboard

<Render file="deploy-to-pages-steps-with-preset" params={{ name: "Astro" }} />

<div>

<PagesBuildPreset framework="astro" />

</div>

Optionally, you can customize the **Project name** field. It defaults to the GitHub repository's name, but it does not need to match. The **Project name** value is assigned as your `*.pages.dev` subdomain.

After completing configuration, select **Save and Deploy**.

You will see your first deployment in progress. Pages installs all dependencies and builds the project as specified.

Cloudflare Pages will automatically rebuild your project and deploy it on every new pushed commit.

Additionally, you will have access to [preview deployments](/pages/configuration/preview-deployments/), which repeat the build-and-deploy process for pull requests. With these, you can preview changes to your project with a real URL before deploying them to production.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

### Local runtime

Local runtime support is configured via the `platformProxy` option:

```js null {6}
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
	}),
});
```

## Use bindings in your Astro application

A [binding](/pages/functions/bindings/) allows your application to interact with Cloudflare developer products, such as [KV](/kv/concepts/how-kv-works/), [Durable Object](/durable-objects/), [R2](/r2/), and [D1](https://blog.cloudflare.com/introducing-d1/).

Use bindings in Astro components and API routes by using `context.locals` from [Astro Middleware](https://docs.astro.build/en/guides/middleware/) to access the Cloudflare runtime which amongst other fields contains the Cloudflare's environment and consecutively any bindings set for your application.

Refer to the following example of how to access a KV namespace with TypeScript.

First, you need to define Cloudflare runtime and KV type by updating the `env.d.ts`:

```typescript
/// <reference types="astro/client" />

type KVNamespace = import("@cloudflare/workers-types").KVNamespace;
type ENV = {
	// replace `MY_KV` with your KV namespace
	MY_KV: KVNamespace;
};

// use a default runtime configuration (advanced mode).
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;
declare namespace App {
	interface Locals extends Runtime {}
}
```

You can then access your KV from an API endpoint in the following way:

```typescript null {3,4,5}
import type { APIContext } from "astro";

export async function get({ locals }: APIContext) {
	// the type KVNamespace comes from the @cloudflare/workers-types package
	const { MY_KV } = locals.runtime.env;

	return {
		// ...
	};
}
```

Besides endpoints, you can also use bindings directly from your Astro components:

```typescript null {2,3}
---
const myKV = Astro.locals.runtime.env.MY_KV;
const value = await myKV.get("key");
---
<div>{value}</div>
```

To learn more about the Astro Cloudflare runtime, refer to the [Access to the Cloudflare runtime](https://docs.astro.build/en/guides/integrations-guide/cloudflare/#access-to-the-cloudflare-runtime) in the Astro documentation.

<Render file="framework-guides/learn-more" params={{ one: "Astro" }} />

---

# Eleventy

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-an-eleventy-site/

import { PagesBuildPreset, Render } from "~/components";

[Eleventy](https://www.11ty.dev/) is a simple static site generator. In this guide, you will create a new Eleventy site and deploy it using Cloudflare Pages. You will be using the `eleventy` CLI to create a new Eleventy site.

## Installing Eleventy

Install the `eleventy` CLI by running the following command in your terminal:

```sh
npm install -g @11ty/eleventy
```

## Creating a new project

There are a lot of [starter projects](https://www.11ty.dev/docs/starter/) available on the Eleventy website. As an example, use the `eleventy-base-blog` project by running the following commands in your terminal:

```sh
git clone https://github.com/11ty/eleventy-base-blog.git my-blog-name
cd my-blog-name
npm install
```

<Render file="tutorials-before-you-start" />

## Creating a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, prepare and push your local application to GitHub by running the following command in your terminal:

```sh
git remote set-url origin https://github.com/yourgithubusername/githubrepo
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

<Render
	file="deploy-to-pages-steps-with-preset"
	params={{ name: "Eleventy" }}
/>

<PagesBuildPreset framework="eleventy" />

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.
Every time you commit new code to your Eleventy site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

<Render file="framework-guides/learn-more" params={{ one: "Eleventy" }} />

---

# Ember

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-an-emberjs-site/

import { PagesBuildPreset, Render } from "~/components";

[Ember.js](https://emberjs.com) is a productive, battle-tested JavaScript framework for building modern web applications. It includes everything you need to build rich UIs that work on any device.

## Install Ember

To begin, install Ember:

```sh
npm install -g ember-cli
```

## Create an Ember project

Use the `ember new` command to create a new application:

```sh
npx ember new ember-quickstart --lang en
```

After the application is generated, change the directory to your project and run your project by running the following commands:

```sh
cd ember-quickstart
npm start
```

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository_no_init" />

## Deploy with Cloudflare Pages

<Render
	file="deploy-to-pages-steps-with-preset"
	params={{ name: "Ember.js" }}
/>

<PagesBuildPreset framework="ember-js" />

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.

Every time you commit new code to your Ember site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests and be able to preview how changes to your site look before deploying them to production.

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

<Render file="framework-guides/learn-more" params={{ one: "Ember" }} />

---

# MkDocs

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-an-mkdocs-site/

import { PagesBuildPreset, Render } from "~/components";

[MkDocs](https://www.mkdocs.org/) is a modern documentation platform where teams can document products, internal knowledge bases and APIs.

## Install MkDocs

MkDocs requires a recent version of Python and the Python package manager, pip, to be installed on your system. To install pip, refer to the [MkDocs Installation guide](https://www.mkdocs.org/user-guide/installation/). With pip installed, run:

```sh
pip install mkdocs
```

## Create an MkDocs project

Use the `mkdocs new` command to create a new application:

```sh
mkdocs new <PROJECT_NAME>
```

Then `cd` into your project, take MkDocs and its dependencies and put them into a `requirements.txt` file:

```sh
pip freeze > requirements.txt
```

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository" />

You have successfully created a GitHub repository and pushed your MkDocs project to that repository.

## Deploy with Cloudflare Pages

<Render file="deploy-to-pages-steps-with-preset" params={{ name: "MkDocs" }} />

<PagesBuildPreset framework="mkdocs" />

4. Go to **Environment variables (advanced)** > **Add variable** > and add the variable `PYTHON_VERSION` with a value of `3.7`.

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.

Every time you commit new code to your MkDocs site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests and be able to preview how changes to your site look before deploying them to production.

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

<Render file="framework-guides/learn-more" params={{ one: "MkDocs" }} />

---

# Framework guides

URL: https://developers.cloudflare.com/pages/framework-guides/

import { DirectoryListing } from "~/components"

<DirectoryListing />

---

# Static HTML

URL: https://developers.cloudflare.com/pages/framework-guides/deploy-anything/

import { Details, Render } from "~/components";

Cloudflare supports deploying any static HTML website to Cloudflare Pages. If you manage your website without using a framework or static site generator, or if your framework is not listed in [Framework guides](/pages/framework-guides/), you can still deploy it using this guide.

<Render file="tutorials-before-you-start" />

<Render file="framework-guides/create-github-repository" />

## Deploy with Cloudflare Pages

<Render file="deploy-to-pages-steps-no-preset" />

<div>

| Configuration option     | Value              |
| ------------------------ | ------------------ |
| Production branch        | `main`             |
| Build command (optional) | `exit 0`           |
| Build output directory   | `<YOUR_BUILD_DIR>` |

</div>

Unlike many of the framework guides, the build command and build output directory for your site are going to be completely custom. If you are not using a preset and do not need to build your site, use `exit 0` as your **Build command**. Cloudflare recommends using `exit 0` as your **Build command** to access features such as Pages Functions. The **Build output directory** is where your application's content lives.

After configuring your site, you can begin your first deploy. Your custom build command (if provided) will run, and Pages will deploy your static site.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

After you have deployed your site, you will receive a unique subdomain for your project on `*.pages.dev`. Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

<Details header="Getting 404 errors on *.pages.dev?">

If you are getting `404` errors when visiting your `*.pages.dev` domain, make sure your website has a top-level file for `index.html`. This `index.html` is what Pages will serve on your apex with no page specified.

</Details>

<Render file="framework-guides/learn-more" params={{ one: " " }} />

---

# CLI

URL: https://developers.cloudflare.com/pages/get-started/c3/

import {
	Render,
	TabItem,
	Tabs,
	Type,
	MetaInfo,
	PackageManagers,
} from "~/components";

Cloudflare provides a CLI command for creating new Workers and Pages projects â€” `npm create cloudflare`, powered by the [`create-cloudflare` package](https://www.npmjs.com/package/create-cloudflare).

## Create a new application

Open a terminal window and run:

<Render file="c3-run-command-no-directory" product="workers" />

Running this command will prompt you to install the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) package, and then ask you questions about the type of application you wish to create.

## Web frameworks

If you choose the "Framework Starter" option, you will be prompted to choose a framework to use. The following frameworks are currently supported:

- [Analog](/pages/framework-guides/deploy-an-analog-site/)
- [Angular](/pages/framework-guides/deploy-an-angular-site/)
- [Astro](/pages/framework-guides/deploy-an-astro-site/)
- [Docusaurus](/pages/framework-guides/deploy-a-docusaurus-site/)
- [Gatsby](/pages/framework-guides/deploy-a-gatsby-site/)
- [Hono](/pages/framework-guides/deploy-a-hono-site/)
- [Next.js](/pages/framework-guides/nextjs/)
- [Nuxt](/pages/framework-guides/deploy-a-nuxt-site/)
- [Qwik](/pages/framework-guides/deploy-a-qwik-site/)
- [React](/pages/framework-guides/deploy-a-react-site/)
- [Remix](/pages/framework-guides/deploy-a-remix-site/)
- [SolidStart](/pages/framework-guides/deploy-a-solid-start-site/)
- [SvelteKit](/pages/framework-guides/deploy-a-svelte-kit-site/)
- [Vue](/pages/framework-guides/deploy-a-vue-site/)

When you use a framework, `npm create cloudflare` directly uses the framework's own command for generating a new projects, which may prompt additional questions. This ensures that the project you create is up-to-date with the latest version of the framework, and you have all the same options when creating you project via `npm create cloudflare` that you would if you created your project using the framework's tooling directly.

## Deploy

Once your project has been configured, you will be asked if you would like to deploy the project to Cloudflare. This is optional.

If you choose to deploy, you will be asked to sign into your Cloudflare account (if you aren't already), and your project will be deployed.

## Creating a new Pages project that is connected to a git repository

To create a new project using `npm create cloudflare`, and then connect it to a Git repository on your Github or Gitlab account, take the following steps:

1. Run `npm create cloudflare@latest`, and choose your desired options
2. Select `no` to the prompt, "Do you want to deploy your application?". This is important â€” if you select `yes` and deploy your application from your terminal ([Direct Upload](/pages/get-started/direct-upload/)), then it will not be possible to connect this Pages project to a git repository later on. You will have to create a new Cloudflare Pages project.
3. Create a new git repository, using the application that `npm create cloudflare@latest` just created for you.
4. Follow the steps outlined in the [Git integration guide](/pages/get-started/git-integration/)

## CLI Arguments

C3 collects any required input through a series of interactive prompts. You may also specify your choices via command line arguments, which will skip these prompts. To use C3 in a non-interactive context such as CI, you must specify all required arguments via the command line.

This is the full format of a C3 invocation alongside the possible CLI arguments:

<Tabs> <TabItem label="npm">

```sh
npm create cloudflare@latest [--] [<DIRECTORY>] [OPTIONS] [-- <NESTED ARGS...>]
```

</TabItem> <TabItem label="yarn">

```sh
yarn create cloudflare [--] [<DIRECTORY>] [OPTIONS] [-- <NESTED ARGS...>]
```

</TabItem> <TabItem label="pnpm">

```sh
pnpm create cloudflare@latest [--] [<DIRECTORY>] [OPTIONS] [-- <NESTED ARGS...>]
```

</TabItem> </Tabs>

- `DIRECTORY` <Type text="string" /> <MetaInfo text="optional" />

  - The directory where the application should be created. The name of the application is taken from the directory name.

- `NESTED ARGS..` <Type text="string[]" /> <MetaInfo text="optional" />

  - CLI arguments to pass to eventual third party CLIs C3 might invoke (in the case of full-stack applications).

- `--category` <Type text="string" /> <MetaInfo text="optional" />

  - The kind of templates that should be created.

  - The possible values for this option are:

    - `hello-world`: Hello World Starter
    - `web-framework`: Framework Starter
    - `demo`: Application Starter
    - `remote-template`: Template from a GitHub repo

- `--type` <Type text="string" /> <MetaInfo text="optional" />

  - The type of application that should be created.

  - The possible values for this option are:

    - `hello-world`: A basic "Hello World" Cloudflare Worker.
    - `hello-world-durable-object`: A [Durable Object](/durable-objects/) and a Worker to communicate with it.
    - `common`: A Cloudflare Worker which implements a common example of routing/proxying functionalities.
    - `scheduled`: A scheduled Cloudflare Worker (triggered via [Cron Triggers](/workers/configuration/cron-triggers/)).
    - `queues`: A Cloudflare Worker which is both a consumer and produced of [Queues](/queues/).
    - `openapi`: A Worker implementing an OpenAPI REST endpoint.
    - `pre-existing`: Fetch a Worker initialized from the Cloudflare dashboard.

- `--framework` <Type text="string" /> <MetaInfo text="optional" />

  - The type of framework to use to create a web application (when using this option, `--type` is ignored).

  - The possible values for this option are:

    - `angular`
    - `astro`
    - `docusaurus`
    - `gatsby`
    - `hono`
    - `next`
    - `nuxt`
    - `qwik`
    - `react`
    - `remix`
    - `solid`
    - `svelte`
    - `vue`

- `--template` <Type text="string" /> <MetaInfo text="optional" />

  - Create a new project via an external template hosted in a git repository

  - The value for this option may be specified as any of the following:

    - `user/repo`
    - `git@github.com:user/repo`
    - `https://github.com/user/repo`
    - `user/repo/some-template` (subdirectories)
    - `user/repo#canary` (branches)
    - `user/repo#1234abcd` (commit hash)
    - `bitbucket:user/repo` (BitBucket)
    - `gitlab:user/repo` (GitLab)

    See the `degit` [docs](https://github.com/Rich-Harris/degit) for more details.

    At a minimum, templates must contain the following:

    - `package.json`
    - [Wrangler configuration file](/pages/functions/wrangler-configuration/)
    - `src/` containing a worker script referenced from the Wrangler configuration file

    See the [templates folder](https://github.com/cloudflare/workers-sdk/tree/main/packages/create-cloudflare/templates) of this repo for more examples.

- `--deploy` <Type text="boolean" /> <MetaInfo text="(default: true) optional" />

  - Deploy your application after it has been created.

- `--lang` <Type text="string" /> <MetaInfo text="(default: ts) optional" />

  - The programming language of the template.

  - The possible values for this option are:

    - `ts`
    - `js`
    - `python`

- `--ts` <Type text="boolean" /> <MetaInfo text="(default: true) optional" />

  - Use TypeScript in your application. Deprecated. Uuse `--lang=ts` instead.

- `--git` <Type text="boolean" /> <MetaInfo text="(default: true) optional" />

  - Initialize a local git repository for your application.

- `--open` <Type text="boolean" /> <MetaInfo text="(default: true) optional" />

  - Open with your browser the deployed application (this option is ignored if the application is not deployed).

- `--existing-script` <Type text="string" /> <MetaInfo text="optional" />

  - The name of an existing Cloudflare Workers script to clone locally. When using this option, `--type` is coerced to `pre-existing`.

  - When `--existing-script` is specified, `deploy` will be ignored.

- `-y`, `--accept-defaults` <Type text="boolean" /> <MetaInfo text="optional" />

  - Use all the default C3 options each can also be overridden by specifying it.

- `--auto-update` <Type text="boolean" /> <MetaInfo text="(default: true) optional" />

  - Automatically uses the latest version of C3.

- `-v`, `--version` <Type text="boolean" /> <MetaInfo text="optional" />

  - Show version number.

- `-h`, `--help` <Type text="boolean" /> <MetaInfo text="optional" />

  - Show a help message.

:::note

All the boolean options above can be specified with or without a value, for example `--open` and `--open true` have the same effect, prefixing `no-` to the option's name negates it, so for example `--no-open` and `--open false` have the same effect.

:::

## Telemetry

Cloudflare collects anonymous usage data to improve `create-cloudflare` over time. Read more about this in our [data policy](https://github.com/cloudflare/workers-sdk/blob/main/packages/create-cloudflare/telemetry.md).

You can opt-out if you do not wish to share any information.

<PackageManagers
	type="create"
	pkg="cloudflare@latest"
	args="telemetry disable"
/>

Alternatively, you can set an environment variable:

```sh
export CREATE_CLOUDFLARE_TELEMETRY_DISABLED=1
```

You can check the status of telemetry collection at any time.

<PackageManagers
	type="create"
	pkg="cloudflare@latest"
	args="telemetry status"
/>

You can always re-enable telemetry collection.

<PackageManagers
	type="create"
	pkg="cloudflare@latest"
	args="telemetry enable"
/>

---

# Git integration

URL: https://developers.cloudflare.com/pages/get-started/git-integration/

import { Details, Render } from "~/components";

In this guide, you will get started with Cloudflare Pages and deploy your first website to the Pages platform through Git integration. The Git integration enables automatic builds and deployments every time you push a change to your connected [GitHub](/pages/configuration/git-integration/github-integration/) or [GitLab](/pages/configuration/git-integration/gitlab-integration/) repository.

:::caution[You cannot switch to Direct Upload later]
If you deploy using the Git integration, you cannot switch to [Direct Upload](/pages/get-started/direct-upload/) later. However, if you already use a Git-integrated project and do not want to trigger deployments every time you push a commit, you can [disable automatic deployments](/pages/configuration/git-integration/#disable-automatic-deployments) on all branches. Then, you can use Wrangler to deploy directly to your Pages projects and make changes to your Git repository without automatically triggering a build.

:::

## Connect your Git provider to Pages

<Render file="get-started-git-connect-pages" product="pages" />

## Configure your deployment

<Render file="get-started-git-configure-deployment" product="pages" />

## Manage site

<Render file="get-started-git-manage-site" product="pages" />

---

# Direct Upload

URL: https://developers.cloudflare.com/pages/get-started/direct-upload/

import { Render } from "~/components";

Direct Upload enables you to upload your prebuilt assets to Pages and deploy them to the Cloudflare global network. You should choose Direct Upload over Git integration if you want to [integrate your own build platform](/pages/how-to/use-direct-upload-with-continuous-integration/) or upload from your local computer.

This guide will instruct you how to upload your assets using Wrangler or the drag and drop method.

:::caution[You cannot switch to Git integration later]
If you choose Direct Upload, you cannot switch to [Git integration](/pages/get-started/git-integration/) later. You will have to create a new project with Git integration to use automatic deployments.
:::

## Prerequisites

Before you deploy your project with Direct Upload, run the appropriate [build command](/pages/configuration/build-configuration/#framework-presets) to build your project.

## Upload methods

After you have your prebuilt assets ready, there are two ways to begin uploading:

- [Wrangler](/pages/get-started/direct-upload/#wrangler-cli).
- [Drag and drop](/pages/get-started/direct-upload/#drag-and-drop).

:::note

Within a Direct Upload project, you can switch between creating deployments with either Wrangler or drag and drop. For existing Git-integrated projects, you can manually create deployments using [`wrangler deploy`](/workers/wrangler/commands/#deploy). However, you cannot use drag and drop on the dashboard with existing Git-integrated projects.

:::

## Supported file types

Below is the supported file types for each Direct Upload options:

- Wrangler: A single folder of assets. (Zip files are not supported.)
- Drag and drop: A zip file or single folder of assets.

## Wrangler CLI

### Set up Wrangler

To begin, install [`npm`](https://docs.npmjs.com/getting-started). Then [install Wrangler, the Developer Platform CLI](/workers/wrangler/install-and-update/).

#### Create your project

Log in to Wrangler with the [`wrangler login` command](/workers/wrangler/commands/#login). Then run the [`pages project create` command](/workers/wrangler/commands/#project-create):

```sh
npx wrangler pages project create
```

You will then be prompted to specify the project name. Your project will be served at `<PROJECT_NAME>.pages.dev` (or your project name plus a few random characters if your project name is already taken). You will also be prompted to specify your production branch.

Subsequent deployments will reuse both of these values (saved in your `node_modules/.cache/wrangler` folder).

#### Deploy your assets

From here, you have created an empty project and can now deploy your assets for your first deployment and for all subsequent deployments in your production environment. To do this, run the [`wrangler pages deploy`](/workers/wrangler/commands/#deploy-1) command:

```sh
npx wrangler pages deploy <BUILD_OUTPUT_DIRECTORY>
```

Find the appropriate build output directory for your project in [Build directory under Framework presets](/pages/configuration/build-configuration/#framework-presets).

Your production deployment will be available at `<PROJECT_NAME>.pages.dev`.

:::note

Before using the `wrangler pages deploy` command, you will need to make sure you are inside the project. If not, you can also pass in the project path.

:::

To deploy assets to a preview environment, run:

```sh
npx wrangler pages deploy <OUTPUT_DIRECTORY> --branch=<BRANCH_NAME>
```

For every branch you create, a branch alias will be available to you at `<BRANCH_NAME>.<PROJECT_NAME>.pages.dev`.

:::note

If you are in a Git workspace, Wrangler will automatically pull the branch information for you. Otherwise, you will need to specify your branch in this command.

:::

If you would like to streamline the project creation and asset deployment steps, you can also use the deploy command to both create and deploy assets at the same time. If you execute this command first, you will still be prompted to specify your project name and production branch. These values will still be cached for subsequent deployments as stated above. If the cache already exists and you would like to create a new project, you will need to run the [`create` command](#create-your-project).

#### Other useful commands

If you would like to use Wrangler to obtain a list of all available projects for Direct Upload, use [`pages project list`](/workers/wrangler/commands/#project-list):

```sh
npx wrangler pages project list
```

If you would like to use Wrangler to obtain a list of all unique preview URLs for a particular project, use [`pages deployment list`](/workers/wrangler/commands/#deployment-list):

```sh
npx wrangler pages deployment list
```

For step-by-step directions on how to use Wrangler and continuous integration tools like GitHub Actions, Circle CI, and Travis CI together for continuous deployment, refer to [Use Direct Upload with continuous integration](/pages/how-to/use-direct-upload-with-continuous-integration/).

## Drag and drop

#### Deploy your project with drag and drop

To deploy with drag and drop:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/login).
2. In **Account Home**, select your account > **Workers & Pages**.
3. Select **Create application** > **Pages** > **Upload assets**.
4. Enter your project name in the provided field and drag and drop your assets.
5. Select **Deploy**.

Your project will be served from `<PROJECT_NAME>.pages.dev`. Next drag and drop your build output directory into the uploading frame. Once your files have been successfully uploaded, select **Save and Deploy** and continue to your newly deployed project.

#### Create a new deployment

After you have your project created, select **Create a new deployment** to begin a new version of your site. Next, choose whether your new deployment will be made to your production or preview environment. If choosing preview, you can create a new deployment branch or enter an existing one.

## Troubleshoot

### Limits

| Upload method | File limit   | File size |
| ------------- | ------------ | --------- |
| Wrangler      | 20,000 files | 25 MiB    |
| Drag and drop | 1,000 files  | 25 MiB    |

If using the drag and drop method, a red warning symbol will appear next to an asset if too large and thus unsuccessfully uploaded. In this case, you may choose to delete that asset but you cannot replace it. In order to do so, you must reupload the entire project.

### Production branch configuration

<Render file="prod-branch-update" />

### Functions

Drag and drop deployments made from the Cloudflare dashboard do not currently support compiling a `functions` folder of [Pages Functions](/pages/functions/). To deploy a `functions` folder, you must use Wrangler. When deploying a project using Wrangler, if a `functions` folder exists where the command is run, that `functions` folder will be uploaded with the project.

However, note that a `_worker.js` file is supported by both Wrangler and drag and drop deployments made from the dashboard.

---

# Getting started

URL: https://developers.cloudflare.com/pages/get-started/

import { DirectoryListing } from "~/components"

Choose a setup method for your Pages project:

<DirectoryListing />

---

# Migrating a Jekyll-based site from GitHub Pages

URL: https://developers.cloudflare.com/pages/migrations/migrating-jekyll-from-github-pages/

In this tutorial, you will learn how to migrate an existing [GitHub Pages site using Jekyll](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll) to Cloudflare Pages. Jekyll is one of the most popular static site generators used with GitHub Pages, and migrating your GitHub Pages site to Cloudflare Pages will take a few short steps.

This tutorial will guide you through:

1. Adding the necessary dependencies used by GitHub Pages to your project configuration.
2. Creating a new Cloudflare Pages site, connected to your existing GitHub repository.
3. Building and deploying your site on Cloudflare Pages.
4. (Optional) Migrating your custom domain.

Including build times, this tutorial should take you less than 15 minutes to complete.

:::note

If you have a Jekyll-based site not deployed on GitHub Pages, refer to [the Jekyll framework guide](/pages/framework-guides/deploy-a-jekyll-site/).

:::

## Before you begin

This tutorial assumes:

1. You have an existing GitHub Pages site using [Jekyll](https://jekyllrb.com/)
2. You have some familiarity with running Ruby's command-line tools, and have both `gem` and `bundle` installed.
3. You know how to use a few basic Git operations, including `add`, `commit`, `push`, and `pull`.
4. You have read the [Get Started](/pages/get-started/) guide for Cloudflare Pages.

If you do not have Rubygems (`gem`) or Bundler (`bundle`) installed on your machine, refer to the installation guides for [Rubygems](https://rubygems.org/pages/download) and [Bundler](https://bundler.io/).

## Preparing your GitHub Pages repository

:::note

If your GitHub Pages repository already has a `Gemfile` and `Gemfile.lock` present, you can skip this step entirely. The GitHub Pages environment assumes a default set of Jekyll plugins that are not explicitly specified in a `Gemfile`.

:::

Your existing Jekyll-based repository must specify a `Gemfile` (Ruby's dependency configuration file) to allow Cloudflare Pages to fetch and install those dependencies during the [build step](/pages/configuration/build-configuration/).

Specifically, you will need to create a `Gemfile` and install the `github-pages` gem, which includes all of the dependencies that the GitHub Pages environment assumes.

[Version 2 of the Pages build environment](/pages/configuration/build-image/#languages-and-runtime) will use Ruby 3.2.2 for the default Jekyll build. Please make sure your local development environment is compatible.

```sh title="Set Ruby Version"
brew install ruby@3.2
export PATH="/usr/local/opt/ruby@3.2/bin:$PATH"
```

```sh title="Create a Gemfile"
cd my-github-pages-repo
bundle init
```

Open the `Gemfile` that was created for you, and add the following line to the bottom of the file:

```ruby title="Specifying the github-pages version"
gem "github-pages", group: :jekyll_plugins
```

Your `Gemfile` should resemble the below:

```ruby
# frozen_string_literal: true

source "https://rubygems.org"

git_source(:github) { |repo_name| "https://github.com/#{repo_name}" }

# gem "rails"
gem "github-pages", group: :jekyll_plugins
```

Run `bundle update`, which will install the `github-pages` gem for you, and create a `Gemfile.lock` file with the resolved dependency versions.

```sh title="Running bundle update"
bundle update
# Bundler will show a lot of output as it fetches the dependencies
```

This should complete successfully. If not, verify that you have copied the `github-pages` line above exactly, and have not commented it out with a leading `#`.

You will now need to commit these files to your repository so that Cloudflare Pages can reference them in the following steps:

```sh title="Commit Gemfile and Gemfile.lock"
git add Gemfile Gemfile.lock
git commit -m "deps: added Gemfiles"
git push origin main
```

## Configuring your Pages project

With your GitHub Pages project now explicitly specifying its dependencies, you can start configuring Cloudflare Pages. The process is almost identical to [deploying a Jekyll site](/pages/framework-guides/deploy-a-jekyll-site/).

:::note

If you are configuring your Cloudflare Pages site for the first time, refer to the [Git integration guide](/pages/get-started/git-integration/), which explains how to connect your existing Git repository to Cloudflare Pages.

:::

To deploy your site to Pages:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/) and select your account.
2. In Account Home, select **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select the new GitHub repository that you created and, in the **Set up builds and deployments** section, provide the following information:

<div>

| Configuration option | Value          |
| -------------------- | -------------- |
| Production branch    | `main`         |
| Build command        | `jekyll build` |
| Build directory      | `_site`        |

</div>

After you have configured your site, you can begin your first deploy. You should see Cloudflare Pages installing `jekyll`, your project dependencies, and building your site, before deploying it.

:::note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

:::

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`. Every time you commit new code to your Jekyll site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

## Migrating your custom domain

If you are using a [custom domain with GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site), you must update your DNS record(s) to point at your new Cloudflare Pages deployment. This will require you to update the `CNAME` record at the DNS provider for your domain to point to `<your-pages-site>.pages.dev`, replacing `<your-username>.github.io`.

Note that it may take some time for DNS caches to expire and for this change to be reflected, depending on the DNS TTL (time-to-live) value you set when you originally created the record.

Refer to the [adding a custom domain](/pages/configuration/custom-domains/#add-a-custom-domain) section of the Get started guide for a list of detailed steps.

## What's next?

- Learn how to [customize HTTP response headers](/pages/how-to/add-custom-http-headers/) for your Pages site using Cloudflare Workers.
- Understand how to [rollback a potentially broken deployment](/pages/configuration/rollbacks/) to a previously working version.
- [Configure redirects](/pages/configuration/redirects/) so that visitors are always directed to your 'canonical' custom domain.

---

# Migrating from Firebase

URL: https://developers.cloudflare.com/pages/migrations/migrating-from-firebase/

In this tutorial, you will learn how to migrate an existing Firebase application to Cloudflare Pages. You should already have an existing project deployed on Firebase that you would like to host on Cloudflare Pages.

## Finding your build command and build directory

To move your application to Cloudflare Pages, you will need to find your build command and build directory.

You will use these to tell Cloudflare Pages how to deploy your project. If you have been deploying manually from your local machine using the `firebase` command-line tool, the `firebase.json` configuration file should include a `public` key that will be your build directory:

```json title="firebase.json"
{
	"public": "public"
}
```

Firebase Hosting does not ask for your build command, so if you are running a standard JavaScript set up, you will probably be using `npm build` or a command specific to the framework or tool you are using (for example, `ng build`).

After you have found your build directory and build command, you can move your project to Cloudflare Pages.

## Creating a new Pages project

If you have not pushed your static site to GitHub before, you should do so before continuing. This will also give you access to features like automatic deployments, and [deployment previews](/pages/configuration/preview-deployments/).

You can create a new repository by visiting [repo.new](https://repo.new) and following the instructions to push your project up to GitHub.

Use the [Get started guide](/pages/get-started/) to add your project to Cloudflare Pages, using the **build command** and **build directory** that you saved earlier.

## Cleaning up your old application and assigning the domain

Once you have deployed your application, go to the Firebase dashboard and remove your old Firebase project. In your Cloudflare DNS settings for your domain, make sure to update the CNAME record for your domain from Firebase to Cloudflare Pages.

By completing this guide, you have successfully migrated your Firebase project to Cloudflare Pages.

---

# Migration guides

URL: https://developers.cloudflare.com/pages/migrations/

import { DirectoryListing } from "~/components";

<DirectoryListing />

---

# Add custom HTTP headers

URL: https://developers.cloudflare.com/pages/how-to/add-custom-http-headers/

import { WranglerConfig } from "~/components";

:::note

Cloudflare provides HTTP header customization for Pages projects by adding a `_headers` file to your project. Refer to the [documentation](/pages/configuration/headers/) for more information.

:::

More advanced customization of HTTP headers is available through Cloudflare Workers [serverless functions](https://www.cloudflare.com/learning/serverless/what-is-serverless/).

If you have not deployed a Worker before, get started with our [tutorial](/workers/get-started/guide/). For the purpose of this tutorial, accomplish steps one (Sign up for a Workers account) through four (Generate a new project) before returning to this page.

Before continuing, ensure that your Cloudflare Pages project is connected to a [custom domain](/pages/configuration/custom-domains/#add-a-custom-domain).

## Writing a Workers function

Workers functions are written in [JavaScript](https://www.cloudflare.com/learning/serverless/serverless-javascript/). When a Worker makes a request to a Cloudflare Pages application, it will receive a response. The response a Worker receives is immutable, meaning it cannot be changed. In order to add, delete, or alter headers, clone the response and modify the headers on a new `Response` instance. Return the new response to the browser with your desired header changes. An example of this is shown below:

```js title="Setting custom headers with a Workers function"
export default {
	async fetch(request) {
		// This proxies your Pages application under the condition that your Worker script is deployed on the same custom domain as your Pages project
		const response = await fetch(request);

		// Clone the response so that it is no longer immutable
		const newResponse = new Response(response.body, response);

		// Add a custom header with a value
		newResponse.headers.append(
			"x-workers-hello",
			"Hello from Cloudflare Workers",
		);

		// Delete headers
		newResponse.headers.delete("x-header-to-delete");
		newResponse.headers.delete("x-header2-to-delete");

		// Adjust the value for an existing header
		newResponse.headers.set("x-header-to-change", "NewValue");

		return newResponse;
	},
};
```

## Deploying a Workers function in the dashboard

The easiest way to start deploying your Workers function is by typing [workers.new](https://workers.new/) in the browser. Log in to your account to be automatically directed to the Workers & Pages dashboard. From the Workers & Pages dashboard, write your function or use one of the [examples from the Workers documentation](/workers/examples/).

Select **Save and Deploy** when your script is ready and set a [route](/workers/configuration/routing/routes/) in your domain's zone settings.

For example, [here is a Workers script](/workers/examples/security-headers/) you can copy and paste into the Workers dashboard that sets common security headers whenever a request hits your Pages URL, such as X-XSS-Protection, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Content-Security-Policy (CSP), and more.

## Deploying a Workers function using the CLI

If you would like to skip writing this file yourself, you can use our `custom-headers-example` [template](https://github.com/kristianfreeman/custom-headers-example) to generate a new Workers function with [wrangler](/workers/wrangler/install-and-update/), the Workers CLI tool.

```sh title="Generating a serverless function with wrangler"
git clone https://github.com/cloudflare/custom-headers-example
cd custom-headers-example
npm install
```

To operate your Workers function alongside your Pages application, deploy it to the same custom domain as your Pages application. To do this, update the Wrangler file in your project with your account and zone details:

<WranglerConfig>

```toml null {4,6,7}
name = "custom-headers-example"

account_id = "FILL-IN-YOUR-ACCOUNT-ID"
workers_dev = false
route = "FILL-IN-YOUR-WEBSITE.com/*"
zone_id = "FILL-IN-YOUR-ZONE-ID"
```

</WranglerConfig>

If you do not know how to find your Account ID and Zone ID, refer to [our guide](/fundamentals/setup/find-account-and-zone-ids/).

Once you have configured your [Wrangler configuration file](/pages/functions/wrangler-configuration/) , run `npx wrangler deploy` in your terminal to deploy your Worker:

```sh
npx wrangler deploy
```

After you have deployed your Worker, your desired HTTP header adjustments will take effect. While the Worker is deployed, you should continue to see the content from your Pages application as normal.

---

# Add a custom domain to a branch

URL: https://developers.cloudflare.com/pages/how-to/custom-branch-aliases/

In this guide, you will learn how to add a custom domain (`staging.example.com`) that will point to a specific branch (`staging`) on your Pages project.

This will allow you to have a custom domain that will always show the latest build for a specific branch on your Pages project.

:::note


Currently, this setup is only supported when using Cloudflare DNS.

If you attempt to follow this guide using an external DNS provider, your custom alias will be sent to the production branch of your Pages project.


:::

First, make sure that you have a successful deployment on the branch you would like to set up a custom domain for.

Next, add a custom domain under your Pages project for your desired custom domain, for example, `staging.example.com`.

![Follow the instructions below to access the custom domains overview in the Pages dashboard.](~/assets/images/pages/how-to//pages_custom_domain-1.png)

To do this:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/login).
2. In Account Home, go to **Workers & Pages**.
3. Select your Pages project.
4. Select **Custom domains** > **Setup a custom domain**.
5. Input the domain you would like to use, such as `staging.example.com`
6. Select **Continue** > **Activate domain**

![After selecting your custom domain, you will be asked to activate it.](~/assets/images/pages/how-to//pages_custom_domain-2.png)

After activating your custom domain, go to [DNS](https://dash.cloudflare.com/?to=/:account/:zone/dns) for the `example.com` zone and find the `CNAME` record with the name `staging` and change the target to include your branch alias.

In this instance, change `your-project.pages.dev` to `staging.your-project.pages.dev`.

![After activating your custom domain, change the CNAME target to include your branch name.](~/assets/images/pages/how-to//pages_custom_domain-3.png)

Now the `staging` branch of your Pages project will be available on `staging.example.com`.

---

# Set build commands per branch

URL: https://developers.cloudflare.com/pages/how-to/build-commands-branches/

This guide will instruct you how to set build commands on specific branches. You will use the `CF_PAGES_BRANCH` environment variable to run a script on a specified branch as opposed to your Production branch. This guide assumes that you have a Cloudflare account and a Pages project.

## Set up

Create a `.sh` file in your project directory. You can choose your file's name, but we recommend you name the file `build.sh`.

In the following script, you will use the `CF_PAGES_BRANCH` environment variable to check which branch is currently being built. Populate your `.sh` file with the following:

```bash
# !/bin/bash

if [ "$CF_PAGES_BRANCH" == "production" ]; then
  # Run the "production" script in `package.json` on the "production" branch
  # "production" should be replaced with the name of your Production branch

  npm run production

elif [ "$CF_PAGES_BRANCH" == "staging" ]; then
  # Run the "staging" script in `package.json` on the "staging" branch
  # "staging" should be replaced with the name of your specific branch

  npm run staging

else
  # Else run the dev script
  npm run dev
fi
```

## Publish your changes

To put your changes into effect:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In Account Home, select **Workers & Pages** > in **Overview**, select your Pages project.
3. Go to **Settings** > **Build & deployments** > **Build configurations** > **Edit configurations**.
4. Update the **Build command** field value to `bash build.sh` and select **Save**.

To test that your build is successful, deploy your project.

---

# Deploy a static WordPress site

URL: https://developers.cloudflare.com/pages/how-to/deploy-a-wordpress-site/

## Overview

In this guide, you will use a WordPress plugin, [Simply Static](https://wordpress.org/plugins/simply-static/), to convert your existing WordPress site to a static website deployed with Cloudflare Pages.

## Prerequisites

This guide assumes that you are:

* The Administrator account on your WordPress site.
* Able to install WordPress plugins on the site.

## Setup

To start, install the [Simply Static](https://wordpress.org/plugins/simply-static/) plugin to export your WordPress site. In your WordPress dashboard, go to **Plugins** > **Add New**.

Search for `Simply Static` and confirm that the resulting plugin that you will be installing matches the plugin below.

![Simply Static plugin](~/assets/images/pages/how-to/simply-static.png)

Select **Install** on the plugin. After it has finished installing, select **Activate**.

### Export your WordPress site

After you have installed the plugin, go to your WordPress dashboard > **Simply Static** > **GENERATE STATIC FILES**.

In the **Activity Log**, find the **ZIP archive created** message and select **Click here to download** to download your ZIP file.

### Deploy your WordPress site with Pages

With your ZIP file downloaded, deploy your site to Pages:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In Account Home, select **Workers & Pages** > **Create application** > **Pages** > **Upload assets**.
3. Name your project > **Create project**.
4. Drag and drop your ZIP file (or unzipped folder of assets) or select it from your computer.
5. After your files have been uploaded, select **Deploy site**.

Your WordPress site will now be live on Pages.

Every time you make a change to your WordPress site, you will need to download a new ZIP file from the WordPress dashboard and redeploy to Cloudflare Pages. Automatic updates are not available with the free version of Simply Static.

## Limitations

There are some features available in WordPress sites that will not be supported in a static site environment:

* WordPress Forms.
* WordPress Comments.
* Any links to `/wp-admin` or similar internal WordPress routes.

## Conclusion

By following this guide, you have successfully deployed a static version of your WordPress site to Cloudflare Pages.

With a static version of your site being served, you can:

* Move your WordPress site to a custom domain or subdomain. Refer to [Custom domains](/pages/configuration/custom-domains/) to learn more.
* Run your WordPress instance locally, or put your WordPress site behind [Cloudflare Access](/pages/configuration/preview-deployments/#customize-preview-deployments-access) to only give access to your contributors. This has a significant effect on the number of attack vectors for your WordPress site and its content.
* Downgrade your WordPress hosting plan to a cheaper plan. Because the memory and bandwidth requirements for your WordPress instance are now smaller, you can often host it on a cheaper plan, or moving to shared hosting.

Connect with the [Cloudflare Developer community on Discord](https://discord.cloudflare.com) to ask questions and discuss the platform with other developers.

---

# How to

URL: https://developers.cloudflare.com/pages/how-to/

import { DirectoryListing } from "~/components"

<DirectoryListing />

---

# Enable Zaraz

URL: https://developers.cloudflare.com/pages/how-to/enable-zaraz/

import { Render } from "~/components"

<Render file="zaraz-definition" product="zaraz" />

## Enable

To enable Zaraz on Cloudflare Pages, you need a [custom domain](/pages/configuration/custom-domains/) associated with your project.

After that, [set up Zaraz](/zaraz/get-started/) on the custom domain.

---

# Install private packages

URL: https://developers.cloudflare.com/pages/how-to/npm-private-registry/

Cloudflare Pages supports custom package registries, allowing you to include private dependencies in your application. While this walkthrough focuses specifically on [npm](https://www.npmjs.com/), the Node package manager and registry, the same approach can be applied to other registry tools.

You will be be adjusting the [environment variables](/pages/configuration/build-configuration/#environment-variables) in your Pages project's **Settings**. An existing website can be modified at any time, but new projects can be initialized with these settings, too. Either way, altering the project settings will not be reflected until its next deployment.

:::caution

Be sure to trigger a new deployment after changing any settings.

:::

## Registry Access Token

Every package registry should have a means of issuing new access tokens. Ideally, you should create a new token specifically for Pages, as you would with any other CI/CD platform.

With npm, you can [create and view tokens through its website](https://docs.npmjs.com/creating-and-viewing-access-tokens) or you can use the `npm` CLI. If you have the CLI set up locally and are authenticated, run the following commands in your terminal:

```sh
# Verify the current npm user is correct
npm whoami

# Create a readonly token
npm token create --read-only
#-> Enter password, if prompted
#-> Enter 2FA code, if configured
```

This will produce a read-only token that looks like a UUID string. Save this value for a later step.

## Private modules on the npm registry

The following section applies to users with applications that are only using private modules from the npm registry.

In your Pages project's **Settings** > **Environment variables**, add a new [environment variable](/pages/configuration/build-configuration/#environment-variables) named `NPM_TOKEN` to the **Production** and **Preview** environments and paste the [read-only token you created](#registry-access-token) as its value.

:::caution

Add the `NPM_TOKEN` variable to both the **Production** and **Preview** environments.

:::

By default, `npm` looks for an environment variable named `NPM_TOKEN` and because you did not define a [custom registry endpoint](#custom-registry-endpoints), the npm registry is assumed. Local development should continue to work as expected, provided that you and your teammates are authenticated with npm accounts (see `npm whoami` and `npm login`) that have been granted access to the private package(s).

## Custom registry endpoints

When multiple registries are in use, a project will need to define its own root-level [`.npmrc`](https://docs.npmjs.com/cli/v7/configuring-npm/npmrc) configuration file. An example `.npmrc` file may look like this:

```ini
@foobar:registry=https://npm.pkg.github.com
//registry.npmjs.org/:_authToken=${TOKEN_FOR_NPM}
//npm.pkg.github.com/:_authToken=${TOKEN_FOR_GITHUB}
```

Here, all packages under the `@foobar` scope are directed towards the GitHub Packages registry. Then the registries are assigned their own access tokens via their respective environment variable names.

:::note

You only need to define an Access Token for the npm registry (refer to `TOKEN_FOR_NPM` in the example) if it is hosting private packages that your application requires.

:::

Your Pages project must then have the matching [environment variables](/pages/configuration/build-configuration/#environment-variables) defined for all environments. In our example, that means `TOKEN_FOR_NPM` must contain [the read-only npm token](#registry-access-token) value and `TOKEN_FOR_GITHUB` must contain its own [personal access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token#creating-a-token).

### Managing multiple environments

In the event that your local development no longer works with your new `.npmrc` file, you will need to add some additional changes:

1. Rename the Pages-compliant `.npmrc` file to `.npmrc.pages`. This should be referencing environment variables.

2. Restore your previous `.npmrc` file â€“ the version that was previously working for you and your teammates.

3. Go to your Pages project > **Settings** > **Environment variables**, add a new [environment variable](/pages/configuration/build-configuration/#environment-variables) named [`NPM_CONFIG_USERCONFIG`](https://docs.npmjs.com/cli/v6/using-npm/config#npmrc-files) and set its value to `/opt/buildhome/repo/.npmrc.pages`. If your `.npmrc.pages` file is not in your project's root directory, adjust this path accordingly.

---

# Redirecting *.pages.dev to a Custom Domain

URL: https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/

import { Example } from "~/components"

Learn how to use [Bulk Redirects](/rules/url-forwarding/bulk-redirects/) to redirect your `*.pages.dev` subdomain to your [custom domain](/pages/configuration/custom-domains/).

You may want to do this to ensure that your site's content is served only on the custom domain, and not the `<project>.pages.dev` site automatically generated on your first Pages deployment.

## Setup

To redirect a `<project>.pages.dev` subdomain to your custom domain:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/?to=/:account/pages/view/:pages-project/domains), and select your account.
2. Select **Workers & Pages** and select your Pages application.
3. Go to **Custom domains** and make sure that your custom domain is listed. If it is not, add it by clicking **Set up a custom domain**.
4. Go **Bulk Redirects**.
5. [Create a bulk redirect list](/rules/url-forwarding/bulk-redirects/create-dashboard/#1-create-a-bulk-redirect-list) modeled after the following (but replacing the values as appropriate):

<Example>

| Source URL    | Target URL            | Status | Parameters                                                                                                               |
| ------------- | --------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| `<project>.pages.dev` | `https://example.com` | `301`  | <ul><li>Preserve query string</li><li>Subpath matching</li><li>Preserve path suffix</li><li>Include subdomains</li></ul> |

</Example>

6. [Create a bulk redirect rule](/rules/url-forwarding/bulk-redirects/create-dashboard/#2-create-a-bulk-redirect-rule) using the list you just created.

To test that your redirect worked, go to your `<project>.pages.dev` domain. If the URL is now set to your custom domain, then the rule has propagated.

## Related resources

* [Redirect www to domain apex](/pages/how-to/www-redirect/)
* [Handle redirects with Bulk Redirects](/rules/url-forwarding/bulk-redirects/)

---

# Preview Local Projects with Cloudflare Tunnel

URL: https://developers.cloudflare.com/pages/how-to/preview-with-cloudflare-tunnel/

[Cloudflare Tunnel](/cloudflare-one/connections/connect-networks/) runs a lightweight daemon (`cloudflared`) in your infrastructure that establishes outbound connections (Tunnels) between your origin web server and the Cloudflare global network. In practical terms, you can use Cloudflare Tunnel to allow remote access to services running on your local machine. It is an alternative to popular tools like [Ngrok](https://ngrok.com), and provides free, long-running tunnels via the [TryCloudflare](/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/) service.

While Cloudflare Pages provides unique [deploy preview URLs](/pages/configuration/preview-deployments/) for new branches and commits on your projects, Cloudflare Tunnel can be used to provide access to locally running applications and servers during the development process. In this guide, you will install Cloudflare Tunnel, and create a new tunnel to provide access to a locally running application. You will need a Cloudflare account to begin using Cloudflare Tunnel.

## Installing Cloudflare Tunnel

Cloudflare Tunnel can be installed on Windows, Linux, and macOS. To learn about installing Cloudflare Tunnel, refer to the [Install cloudflared](/cloudflare-one/connections/connect-networks/downloads/) page in the Cloudflare for Teams documentation.

Confirm that `cloudflared` is installed correctly by running `cloudflared --version` in your command line:

```sh
cloudflared --version
```

```sh output
cloudflared version 2021.5.9 (built 2021-05-21-1541 UTC)
```

## Run a local service

The easiest way to get up and running with Cloudflare Tunnel is to have an application running locally, such as a [React](/pages/framework-guides/deploy-a-react-site/) or [SvelteKit](/pages/framework-guides/deploy-a-svelte-kit-site/) site. When you are developing an application with these frameworks, they will often make use of a `npm run develop` script, or something similar, which mounts the application and runs it on a `localhost` port. For example, the popular `vite` tool runs your in-development React application on port `5173`, making it accessible at the `http://localhost:5173` address.

## Start a Cloudflare Tunnel

With a local development server running, a new Cloudflare Tunnel can be instantiated by running `cloudflared tunnel` in a new command line window, passing in the `--url` flag with your `localhost` URL and port. `cloudflared` will output logs to your command line, including a banner with a tunnel URL:

```sh
cloudflared tunnel --url http://localhost:5173
```

```sh output
2021-07-15T20:11:29Z INF Cannot determine default configuration path. No file [config.yml config.yaml] in [~/.cloudflared ~/.cloudflare-warp ~/cloudflare-warp /etc/cloudflared /usr/local/etc/cloudflared]
2021-07-15T20:11:29Z INF Version 2021.5.9
2021-07-15T20:11:29Z INF GOOS: linux, GOVersion: devel +11087322f8 Fri Nov 13 03:04:52 2020 +0100, GoArch: amd64
2021-07-15T20:11:29Z INF Settings: map[url:http://localhost:5173]
2021-07-15T20:11:29Z INF cloudflared will not automatically update when run from the shell. To enable auto-updates, run cloudflared as a service: https://developers.cloudflare.com/argo-tunnel/reference/service/
2021-07-15T20:11:29Z INF Initial protocol h2mux
2021-07-15T20:11:29Z INF Starting metrics server on 127.0.0.1:42527/metrics
2021-07-15T20:11:29Z WRN Your version 2021.5.9 is outdated. We recommend upgrading it to 2021.7.0
2021-07-15T20:11:29Z INF Connection established connIndex=0 location=ATL
2021-07-15T20:11:32Z INF Each HA connection's tunnel IDs: map[0:cx0nsiqs81fhrfb82pcq075kgs6cybr86v9vdv8vbcgu91y2nthg]
2021-07-15T20:11:32Z INF +-------------------------------------------------------------+
2021-07-15T20:11:32Z INF |  Your free tunnel has started! Visit it:                    |
2021-07-15T20:11:32Z INF |    https://seasonal-deck-organisms-sf.trycloudflare.com     |
2021-07-15T20:11:32Z INF +-------------------------------------------------------------+
```

In this example, the randomly-generated URL `https://seasonal-deck-organisms-sf.trycloudflare.com` has been created and assigned to your tunnel instance. Visiting this URL in a browser will show the application running, with requests being securely forwarded through Cloudflare's global network, through the tunnel running on your machine, to `localhost:5173`:

![Cloudflare Tunnel example rendering a randomly-generated URL](~/assets/images/pages/how-to/tunnel.png)

## Next Steps

Cloudflare Tunnel can be configured in a variety of ways and can be used beyond providing access to your in-development applications. For example, you can provide `cloudflared` with a [configuration file](/cloudflare-one/connections/connect-networks/do-more-with-tunnels/local-management/configuration-file/) to add more complex routing and tunnel setups that go beyond a simple `--url` flag. You can also [attach a Cloudflare DNS record](/cloudflare-one/connections/connect-networks/routing-to-tunnel/dns/) to a domain or subdomain for an easily accessible, long-lived tunnel to your local machine.

Finally, by incorporating Cloudflare Access, you can provide [secure access to your tunnels](/cloudflare-one/applications/configure-apps/self-hosted-public-app/) without exposing your entire server, or compromising on security. Refer to the [Cloudflare for Teams documentation](/cloudflare-one/) to learn more about what you can do with Cloudflare's entire suite of Zero Trust tools.

---

# Refactor a Worker to a Pages Function

URL: https://developers.cloudflare.com/pages/how-to/refactor-a-worker-to-pages-functions/

In this guide, you will learn how to refactor a Worker made to intake form submissions to a Pages Function that can be hosted on your Cloudflare Pages application. [Pages Functions](/pages/functions/) is a serverless function that lives within the same project directory as your application and is deployed with Cloudflare Pages. It enables you to run server-side code that adds dynamic functionality without running a dedicated server. You may want to refactor a Worker to a Pages Function for one of these reasons:

1. If you manage a serverless function that your Pages application depends on and wish to ship the logic without managing a Worker as a separate service.
2. If you are migrating your Worker to Pages Functions and want to use the routing and middleware capabilities of Pages Functions.

:::note

You can import your Worker to a Pages project without using Functions by creating a `_worker.js` file in the output directory of your Pages project. This [Advanced mode](/pages/functions/advanced-mode/) requires writing your Worker with [Module syntax](/workers/reference/migrate-to-module-workers/).

However, when using the `_worker.js` file in Pages, the entire `/functions` directory is ignored â€“ including its routing and middleware characteristics.

:::

## General refactoring steps

1. Remove the fetch handler and replace it with the appropriate `OnRequest` method. Refer to [Functions](/pages/functions/get-started/) to select the appropriate method for your Function.
2. Pass the `context` object as an argument to your new `OnRequest` method to access the properties of the context parameter: `request`,`env`,`params` and `next`.
3. Use middleware to handle logic that must be executed before or after route handlers. Learn more about [using Middleware](/pages/functions/middleware/) in the Functions documentation.

## Background

To explain the process of refactoring, this guide uses a simple form submission example.

Form submissions can be handled by Workers but can also be a good use case for Pages Functions, since forms are most times specific to a particular application.

Assuming you are already using a Worker to handle your form, you would have deployed this Worker and then added the URL to your form action attribute in your HTML form. This means that when you change how the Worker handles your submissions, you must make changes to the Worker script. If the logic in your Worker is used by more than one application, Pages Functions would not be a good use case.

However, it can be beneficial to use a [Pages Function](/pages/functions/) when you would like to organize your function logic in the same project directory as your application.

Building your application using Pages Functions can help you manage your client and serverless logic from the same place and make it easier to write and debug your code.

## Handle form entries with Airtable and Workers

An [Airtable](https://airtable.com/) is a low-code platform for building collaborative applications. It helps customize your workflow, collaborate, and handle form submissions. For this example, you will utilize Airtable's form submission feature.

[Airtable](https://airtable.com/) can be used to store entries of information in different tables for the same account. When creating a Worker for handling the submission logic, the first step is to use [Wrangler](/workers/wrangler/install-and-update/) to initialize a new Worker within a specific folder or at the root of your application.

This step creates the boilerplate to write your Airtable submission Worker. After writing your Worker, you can deploy it to Cloudflare's global network after you [configure your project for deployment](/workers/wrangler/configuration/). Refer to the Workers documentation for a full tutorial on how to [handle form submission with Workers](/workers/tutorials/handle-form-submissions-with-airtable/).

The following code block shows an example of a Worker that handles Airtable form submission.

The `submitHandler` async function is called if the pathname of the work is `/submit`. This function checks that the request method is a `POST` request and then proceeds to parse and post the form entries to Airtable using your credentials, which you can store using [Wrangler `secret`](/workers/wrangler/commands/#secret).

```js
export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (url.pathname === "/submit") {
			return submitHandler(request, env);
		}

		return fetch(request.url);
	},
};

async function submitHandler(request, env) {
	if (request.method !== "POST") {
		return new Response("Method not allowed", {
			status: 405,
		});
	}
	const body = await request.formData();

	const { first_name, last_name, email, phone, subject, message } =
		Object.fromEntries(body);

	const reqBody = {
		fields: {
			"First Name": first_name,
			"Last Name": last_name,
			Email: email,
			"Phone number": phone,
			Subject: subject,
			Message: message,
		},
	};

	return HandleAirtableData(reqBody, env);
}

const HandleAirtableData = (body, env) => {
	return fetch(
		`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(
			env.AIRTABLE_TABLE_NAME,
		)}`,
		{
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
				"Content-type": `application/json`,
			},
		},
	);
};
```

### Refactor your Worker

To refactor the above Worker, go to your Pages project directory and create a `/functions` folder. In `/functions`, create a `form.js` file. This file will handle form submissions.

Then, in the `form.js` file, export a single `onRequestPost`:

```js
export async function onRequestPost(context) {
	return await submitHandler(context);
}
```

Every Worker has an `addEventListener` to listen for `fetch` events, but you will not need this in a Pages Function. Instead, you will `export` a single `onRequest` function, and depending on the HTTPS request it handles, you will name it accordingly. Refer to [Function documentation](/pages/functions/get-started/) to select the appropriate method for your function.

The above code takes a `request` and `env` as arguments which pass these properties down to the `submitHandler` function, which remains unchanged from the [original Worker](#handle-form-entries-with-airtable-and-workers). However, because Functions allow you to specify the HTTPS request type, you can remove the `request.method` check in your Worker. This is now handled by Pages Functions by naming the `onRequest` handler.

Now, you will introduce the `submitHandler` function and pass the `env` parameter as a property. This will allow you to access `env` in the `HandleAirtableData` function below. This function does a `POST` request to Airtable using your Airtable credentials:

```js null {4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22}
export async function onRequestPost(context) {
	return await submitHandler(context);
}

async function submitHandler(context) {
	const body = await context.request.formData();

	const { first_name, last_name, email, phone, subject, message } =
		Object.fromEntries(body);

	const reqBody = {
		fields: {
			"First Name": first_name,
			"Last Name": last_name,
			Email: email,
			"Phone number": phone,
			Subject: subject,
			Message: message,
		},
	};

	return HandleAirtableData({ body: reqBody, env: env });
}
```

Finally, create a `HandleAirtableData` function. This function will send a `fetch` request to Airtable with your Airtable credentials and the body of your request:

```js
// ..
const HandleAirtableData = async function onRequest({ body, env }) {
	return fetch(
		`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(
			env.AIRTABLE_TABLE_NAME,
		)}`,
		{
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
				"Content-type": `application/json`,
			},
		},
	);
};
```

You can test your Function [locally using Wrangler](/pages/functions/local-development/). By completing this guide, you have successfully refactored your form submission Worker to a form submission Pages Function.

## Related resources

- [HTML forms](/pages/tutorials/forms/)
- [Plugins documentation](/pages/functions/plugins/)
- [Functions documentation](/pages/functions/)

---

# Use Direct Upload with continuous integration

URL: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/

Cloudflare Pages supports directly uploading prebuilt assets, allowing you to use custom build steps for your applications and deploy to Pages with [Wrangler](/workers/wrangler/install-and-update/). This guide will teach you how to deploy your application to Pages, using continuous integration.

## Deploy with Wrangler

In your project directory, install [Wrangler](/workers/wrangler/install-and-update/) so you can deploy a folder of prebuilt assets by running the following command:

```sh
# Publish created project
$ CLOUDFLARE_ACCOUNT_ID=<ACCOUNT_ID> npx wrangler pages deploy <DIRECTORY> --project-name=<PROJECT_NAME>
```

## Get credentials from Cloudflare

### Generate an API Token

To generate an API token:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/profile/api-tokens).
2. Select **My Profile** from the dropdown menu of your user icon on the top right of your dashboard.
3. Select **API Tokens** > **Create Token**.
4. Under **Custom Token**, select **Get started**.
5. Name your API Token in the **Token name** field.
6. Under **Permissions**, select *Account*, *Cloudflare Pages* and *Edit*:
7. Select **Continue to summary** > **Create Token**.

![Follow the instructions above to create an API token for Cloudflare Pages](~/assets/images/pages/how-to/select-api-token-for-pages.png)

Now that you have created your API token, you can use it to push your project from continuous integration platforms.

### Get project account ID

To find your account ID, log in to the Cloudflare dashboard > select your zone in **Account Home** > find your account ID in **Overview** under **API** on the right-side menu. If you have not added a zone, add one by selecting **Add site**. You can purchase a domain from [Cloudflare's registrar](/registrar/).

## Use GitHub Actions

[GitHub Actions](https://docs.github.com/en/actions) is a continuous integration and continuous delivery (CI/CD) platform that allows you to automate your build, test, and deployment pipeline when using GitHub. You can create workflows that build and test every pull request to your repository or deploy merged pull requests to production.

After setting up your project, you can set up a GitHub Action to automate your subsequent deployments with Wrangler.

### Add Cloudflare credentials to GitHub secrets

In the GitHub Action you have set up, environment variables are needed to push your project up to Cloudflare Pages. To add the values of these environment variables in your project's GitHub repository:

1. Go to your project's repository in GitHub.
2. Under your repository's name, select **Settings**.
3. Select **Secrets** > **Actions** > **New repository secret**.
4. Create one secret and put **CLOUDFLARE\_ACCOUNT\_ID** as the name with the value being your Cloudflare account ID.
5. Create another secret and put **CLOUDFLARE\_API\_TOKEN** as the name with the value being your Cloudflare API token.

Add the value of your Cloudflare account ID and Cloudflare API token as `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`, respectively. This will ensure that these secrets are secure, and each time your Action runs, it will access these secrets.

### Set up a workflow

Create a `.github/workflows/pages-deployment.yaml` file at the root of your project. The `.github/workflows/pages-deployment.yaml` file will contain the jobs you specify on the request, that is: `on: [push]` in this case. It can also be on a pull request. For a detailed explanation of GitHub Actions syntax, refer to the [official documentation](https://docs.github.com/en/actions).

In your `pages-deployment.yaml` file, copy the following content:

```yaml
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    name: Deploy to Cloudflare Pages
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      # Run your project's build step
      # - name: Build
      #   run: npm install && npm run build
      - name: Publish
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: YOUR_PROJECT_NAME # e.g. 'my-project'
          directory: YOUR_DIRECTORY_OF_STATIC_ASSETS # e.g. 'dist'
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

In the above code block, you have set up an Action that runs when you push code to the repository. Replace `YOUR_PROJECT_NAME` with your Cloudflare Pages project name and `YOUR_DIRECTORY_OF_STATIC_ASSETS` with your project's output directory, respectively.

The `${{ secrets.GITHUB_TOKEN }}` will be automatically provided by GitHub Actions with the `contents: read` and `deployments: write` permission. This will enable our Cloudflare Pages action to create a Deployment on your behalf.

:::note


This workflow automatically triggers on the current git branch, unless you add a `branch` option to the `with` section.


:::

## Using CircleCI for CI/CD

[CircleCI](https://circleci.com/) is another continuous integration and continuous delivery (CI/CD) platform that allows you to automate your build, test, and deployment pipeline. It can be configured to efficiently run complex pipelines with caching, docker layer caching, and resource classes.

Similar to GitHub Actions, CircleCI can use Wrangler to continuously deploy your projects each time to push to your code.

### Add Cloudflare credentials to CircleCI

After you have generated your Cloudflare API token and found your account ID in the dashboard, you will need to add them to your CircleCI dashboard to use your environment variables in your project.

To add environment variables, in the CircleCI web application:

1. Go to your Pages project > **Settings**.
2. Select **Projects** in the side menu.
3. Select the ellipsis (...) button in the project's row. You will see the option to add environment variables.
4. Select **Environment Variables** > **Add Environment Variable**.
5. Enter the name and value of the new environment variable, which is your Cloudflare credentials (`CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`).

![Follow the instructions above to add environment variables to your CircleCI settings](~/assets/images/pages/how-to/project-settings-env-var-v2.png)

### Set up a workflow

Create a `.circleci/config.yml` file at the root of your project. This file contains the jobs that will be executed based on the order of your workflow. In your `config.yml` file, copy the following content:

```yaml
version: 2.1
jobs:
 Publish-to-Pages:
   docker:
     - image: cimg/node:18.7.0

   steps:
     - checkout
     # Run your project's build step
     - run: npm install && npm run build
     # Publish with wrangler
     - run: npx wrangler pages deploy dist --project-name=<PROJECT NAME> # Replace dist with the name of your build folder and input your project name

workflows:
 Publish-to-Pages-workflow:
   jobs:
     - Publish-to-Pages
```

Your continuous integration workflow is broken down into jobs when using CircleCI. From the code block above, you can see that you first define a list of jobs that run on each commit. For example, your repository will run on a prebuilt docker image `cimg/node:18.7.0`. It first checks out the repository with the Node version specified in the image.

:::note[Note]


Wrangler requires a Node version of at least `16.17.0`. You must upgrade your Node.js version if your version is lower than `16.17.0`.


:::

You can modify the Wrangler command with any [`wrangler pages deploy` options](/workers/wrangler/commands/#deploy-1).

After all the specified steps, define a `workflow` at the end of your file. You can learn more about creating a custom process with CircleCI from the [official documentation](https://circleci.com/docs/2.0/concepts/).

## Travis CI for CI/CD

Travis CI is an open-source continuous integration tool that handles specific tasks, such as pull requests and code pushes for your project workflow. Travis CI can be integrated into your GitHub projects, databases, and other preinstalled services enabled in your build configuration. To use Travis CI, you should have A GitHub, Bitbucket, GitLab or Assembla account.

### Add Cloudflare credentials to TravisCI

In your Travis project, add the Cloudflare credentials you have generated from the Cloudflare dashboard to access them in your `travis.yml` file. Go to your Travis CI dashboard and select your current project > **More options** > **Settings** > **Environment Variables**.

Set the environment variable's name and value and the branch you want it to be attached to. You can also set the privacy of the value.

### Setup

Go to [Travis-ci.com](https://Travis-ci.com) and enable your repository by login in with your preferred provider. This guide uses GitHub. Next, create a `.travis.yml` file and copy the following into the file:

```yaml
language: node_js
node_js:
  - "18.0.0" # You can specify more versions of Node you want your CI process to support
branches:
  only:
    - travis-ci-test # Specify what branch you want your CI process to run on
install:
  - npm install

script:
  - npm run build # Switch this out with your build command or remove it if you don't have a build step
  - npx wrangler pages deploy dist --project-name=<PROJECT NAME>

env:
  - CLOUDFLARE_ACCOUNT_ID: { $CLOUDFLARE_ACCOUNT_ID }
  - CLOUDFLARE_API_TOKEN: { $CLOUDFLARE_API_TOKEN }
```

This will set the Node.js version to 18. You have also set branches you want your continuous integration to run on. Finally, input your `PROJECT NAME` in the script section and your CI process should work as expected.

You can also modify the Wrangler command with any [`wrangler pages deploy` options](/workers/wrangler/commands/#deploy-1).

---

# Use Pages Functions for A/B testing

URL: https://developers.cloudflare.com/pages/how-to/use-worker-for-ab-testing-in-pages/

In this guide, you will learn how to use [Pages Functions](/pages/functions/) for A/B testing in your Pages projects. A/B testing is a user experience research methodology applied when comparing two or more versions of a web page or application. With A/B testing, you can serve two or more versions of a webpage to users and divide traffic to your site.

## Overview

Configuring different versions of your application for A/B testing will be unique to your specific use case. For all developers, A/B testing setup can be simplified into a few helpful principles.

Depending on the number of application versions you have (this guide uses two), you can assign your users into experimental groups. The experimental groups in this guide are the base route `/` and the test route `/test`.

To ensure that a user remains in the group you have given, you will set and store a cookie in the browser and depending on the cookie value you have set, the corresponding route will be served.

## Set up your Pages Function

In your project, you can handle the logic for A/B testing using [Pages Functions](/pages/functions/). Pages Functions allows you to handle server logic from within your Pages project.

To begin:

1. Go to your Pages project directory on your local machine.
2. Create a `/functions` directory. Your application server logic will live in the `/functions` directory.

## Add middleware logic

Pages Functions have utility functions that can reuse chunks of logic which are executed before and/or after route handlers. These are called [middleware](/pages/functions/middleware/). Following this guide, middleware will allow you to intercept requests to your Pages project before they reach your site.

In your `/functions` directory, create a `_middleware.js` file.

:::note


When you create your `_middleware.js` file at the base of your `/functions` folder, the middleware will run for all routes on your project. Learn more about [middleware routing](/pages/functions/middleware/).


:::

Following the Functions naming convention, the `_middleware.js` file exports a single async `onRequest` function that accepts a `request`, `env` and `next` as an argument.

```js
const abTest = async ({request, next, env}) => {
  /*
  Todo:
  1. Conditional statements to check for the cookie
  2. Assign cookies based on percentage, then serve
  */
}

export const onRequest = [abTest]
```

To set the cookie, create the `cookieName` variable and assign any value. Then create the `newHomepagePathName` variable and assign it `/test`:

```js null {1,2}
const cookieName = "ab-test-cookie"
const newHomepagePathName = "/test"

const abTest = async ({request, next, env}) => {
  /*
  Todo:
  1. Conditional statements to check for the cookie
  2. Assign cookie based on percentage then serve
  */
}

export const onRequest = [abTest]
```

## Set up conditional logic

Based on the URL pathname, check that the cookie value is equal to `new`. If the value is `new`, then `newHomepagePathName` will be served.

```js null {7,8,9,10,11,12,13,14,15,16,17,18,19}
const cookieName = "ab-test-cookie"
const newHomepagePathName = "/test"

const abTest = async ({request, next, env}) => {
  /*
  Todo:
  1. Assign cookies based on randomly generated percentage, then serve
  */

  const url = new URL(request.url)
  if (url.pathname === "/") {
    // if cookie ab-test-cookie=new then change the request to go to /test
    // if no cookie set, pass x% of traffic and set a cookie value to "current" or "new"

    let cookie = request.headers.get("cookie")
    // is cookie set?
    if (cookie && cookie.includes(`${cookieName}=new`)) {
      // Change the request to go to /test (as set in the newHomepagePathName variable)
      url.pathname = newHomepagePathName
      return env.ASSETS.fetch(url)
    }
  }
}

export const onRequest = [abTest]
```

If the cookie value is not present, you will have to assign one. Generate a percentage (from 0-99) by using: `Math.floor(Math.random() * 100)`. Your default cookie version is given a value of `current`.

If the percentage of the number generated is lower than `50`, you will assign the cookie version to `new`. Based on the percentage randomly generated, you will set the cookie and serve the assets. After the conditional block, pass the request to `next()`. This will pass the request to Pages. This will result in 50% of users getting the `/test` homepage.

The `env.ASSETS.fetch()` function will allow you to send the user to a modified path which is defined through the `url` parameter. `env` is the object that contains your environment variables and bindings. `ASSETS` is a default Function binding that allows communication between your Function and Pages' asset serving resource. `fetch()` calls to the Pages asset-serving resource and returns the asset (`/test` homepage) to your website's visitor.

:::note[Binding]


A Function is a Worker that executes on your Pages project to add dynamic functionality. A binding is how your Function (Worker) interacts with external resources. A binding is a runtime variable that the Workers runtime provides to your code.


:::

```js null {20-36}
const cookieName = "ab-test-cookie"
const newHomepagePathName = "/test"

const abTest = async (context) => {
  const url = new URL(context.request.url)
  // if homepage
  if (url.pathname === "/") {
    // if cookie ab-test-cookie=new then change the request to go to /test
    // if no cookie set, pass x% of traffic and set a cookie value to "current" or "new"

    let cookie = request.headers.get("cookie")
    // is cookie set?
    if (cookie && cookie.includes(`${cookieName}=new`)) {
      // pass the request to /test
      url.pathname = newHomepagePathName
      return context.env.ASSETS.fetch(url)
    } else {
      const percentage = Math.floor(Math.random() * 100)
      let version = "current" // default version
      // change pathname and version name for 50% of traffic
      if (percentage < 50) {
        url.pathname = newHomepagePathName
        version = "new"
      }
      // get the static file from ASSETS, and attach a cookie
      const asset = await context.env.ASSETS.fetch(url)
      let response = new Response(asset.body, asset)
      response.headers.append("Set-Cookie", `${cookieName}=${version}; path=/`)
      return response
    }
  }
  return context.next()
};

export const onRequest = [abTest];
```

## Deploy to Cloudflare Pages

After you have set up your `functions/_middleware.js` file in your project you are ready to deploy with Pages. Push your project changes to GitHub/GitLab.

After you have deployed your application, review your middleware Function:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. In Account Home, select **Workers & Pages**.
3. In **Overview**, select your Pages project > **Settings** > **Functions** > **Configuration**.

---

# Enable Web Analytics

URL: https://developers.cloudflare.com/pages/how-to/web-analytics/

import { Render } from "~/components"

<Render file="web-analytics-definition" product="web-analytics" />

## Enable on Pages project

Cloudflare Pages offers a one-click setup for Web Analytics:

<Render file="web-analytics-setup" />

## View metrics

To view the metrics associated with your Pages project:

1. Log in to [Cloudflare dashboard](https://dash.cloudflare.com/login).
2. From Account Home, select **Analytics & Logs** > **Web Analytics**.
3. Select the analytics associated with your Pages project.

For more details about how to use Web Analytics, refer to the [Web Analytics documentation](/web-analytics/data-metrics/).

## Troubleshooting

<Render file="web-analytics-troubleshooting" product="web-analytics" />

---

# Redirecting www to domain apex

URL: https://developers.cloudflare.com/pages/how-to/www-redirect/

import { Example } from "~/components";

Learn how to redirect a `www` subdomain to your apex domain (`example.com`).

This setup assumes that you already have a [custom domain](/pages/configuration/custom-domains/) attached to your Pages project.

## Setup

To redirect your `www` subdomain to your domain apex:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. Go to **Bulk Redirects**.
3. [Create a bulk redirect list](/rules/url-forwarding/bulk-redirects/create-dashboard/#1-create-a-bulk-redirect-list) modeled after the following (but replacing the values as appropriate):

<Example>

| Source URL        | Target URL            | Status | Parameters                                                                                                               |
| ----------------- | --------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| `www.example.com` | `https://example.com` | `301`  | <ul><li>Preserve query string</li><li>Subpath matching</li><li>Preserve path suffix</li><li>Include subdomains</li></ul> |

</Example>

4. [Create a bulk redirect rule](/rules/url-forwarding/bulk-redirects/create-dashboard/#2-create-a-bulk-redirect-rule) using the list you just created.
5. Go to **DNS**.
6. [Create a DNS record](/dns/manage-dns-records/how-to/create-dns-records/#create-dns-records) for the `www` subdomain using the following values:

<Example>

| Type | Name  | IPv4 address | Proxy status |
| ---- | ----- | ------------ | ------------ |
| `A`  | `www` | `192.0.2.1`  | Proxied      |

</Example>

It may take a moment for this DNS change to propagate, but once complete, you can run the following command in your terminal.

```sh
curl --head -i https://www.example.com/
```

Then, inspect the output to verify that the `location` header and status code are being set as configured.

## Related resources

- [Redirect `*.pages.dev` to a custom domain](/pages/how-to/redirect-to-custom-domain/)
- [Handle redirects with Bulk Redirects](/rules/url-forwarding/bulk-redirects/)

---

# Changelog

URL: https://developers.cloudflare.com/pages/platform/changelog/

import { ProductReleaseNotes } from "~/components";

{/* <!-- Actual content lives in /src/content/release-notes/pages.yaml. Update the file there for new entries to appear here. For more details, refer to https://developers.cloudflare.com/style-guide/documentation-content-strategy/content-types/changelog/#yaml-file --> */}

<ProductReleaseNotes />

---

# Platform

URL: https://developers.cloudflare.com/pages/platform/

import { DirectoryListing } from "~/components"

<DirectoryListing />

---

# Known issues

URL: https://developers.cloudflare.com/pages/platform/known-issues/

Here are some known bugs and issues with Cloudflare Pages:

## Builds and deployment

- GitHub and GitLab are currently the only supported platforms for automatic CI/CD builds. [Direct Upload](/pages/get-started/direct-upload/) allows you to integrate your own build platform or upload from your local computer.

- Incremental builds are currently not supported in Cloudflare Pages.

- Uploading a `/functions` directory through the dashboard's Direct Upload option does not work (refer to [Using Functions in Direct Upload](/pages/get-started/direct-upload/#functions)).

- Commits/PRs from forked repositories will not create a preview. Support for this will come in the future.

## Git configuration

- If you deploy using the Git integration, you cannot switch to Direct Upload later. However, if you already use a Git-integrated project and do not want to trigger deployments every time you push a commit, you can [disable/pause automatic deployments](/pages/configuration/git-integration/#disable-automatic-deployments). Alternatively, you can delete your Pages project and create a new one pointing at a different repository if you need to update it.

## Build configuration

- `*.pages.dev` subdomains currently cannot be changed. If you need to change your `*.pages.dev` subdomain, delete your project and create a new one.

- Hugo builds automatically run an old version. To run the latest version of Hugo (for example, `0.101.0`), you will need to set an environment variable. Set `HUGO_VERSION` to `0.101.0` or the Hugo version of your choice.

- By default, Cloudflare uses Node `12.18.0` in the Pages build environment. If you need to use a newer Node version, refer to the [Build configuration page](/pages/configuration/build-configuration/) for configuration options.

- For users migrating from Netlify, Cloudflare does not support Netlify's Forms feature. [Pages Functions](/pages/functions/) are available as an equivalent to Netlify's Serverless Functions.

## Custom Domains

- It is currently not possible to add a custom domain with

  - a wildcard, for example, `*.domain.com`.
  - a Worker already routed on that domain.

- It is currently not possible to add a custom domain with a Cloudflare Access policy already enabled on that domain.

- Cloudflare's Load Balancer does not work with `*.pages.dev` projects; an `Error 1000: DNS points to prohibited IP` will appear.

- When adding a custom domain, the domain will not verify if Cloudflare cannot validate a request for an SSL certificate on that hostname. In order for the SSL to validate, ensure Cloudflare Access or a Cloudflare Worker is allowing requests to the validation path: `http://{domain_name}/.well-known/acme-challenge/*`.

- [Advanced Certificates](/ssl/edge-certificates/advanced-certificate-manager/) cannot be used with Cloudflare Pages due to Cloudflare for SaaS's [certificate prioritization](/ssl/reference/certificate-and-hostname-priority/).

## Pages Functions

- [Functions](/pages/functions/) does not currently support adding/removing polyfills, so your bundler (for example, webpack) may not run.

- `passThroughOnException()` is not currently available for Advanced Mode Pages Functions (Pages Functions which use an `_worker.js` file).

- `passThroughOnException()` is not currently as resilient as it is in Workers. We currently wrap Pages Functions code in a `try`/`catch` block and fallback to calling `env.ASSETS.fetch()`. This means that any critical failures (such as exceeding CPU time or exceeding memory) may still throw an error.

## Enable Access on your `*.pages.dev` domain

If you would like to enable [Cloudflare Access](https://www.cloudflare.com/teams-access/)] for your preview deployments and your `*.pages.dev` domain, you must:

1. Log in to [Cloudflare dashboard](https://dash.cloudflare.com/login).
2. From Account Home, select **Workers & Pages**.
3. In **Overview**, select your Pages project.
4. Go to **Settings** > **Enable access policy**.
5. Select **Edit** on the Access policy created for your preview deployments.
6. In Edit, go to **Overview**.
7. In the **Subdomain** field, delete the wildcard (`*`) and select **Save application**. You may need to change the **Application name** at this step to avoid an error.

At this step, your `*.pages.dev` domain has been secured behind Access. To resecure your preview deployments:

8. Go back to your Pages project > **Settings** > **General** > and reselect **Enable access policy**.
9. Review that two Access policies, one for your `*.pages.dev` domain and one for your preview deployments (`*.<YOUR_SITE>.pages.dev`), have been created.

If you have a custom domain and protected your `*.pages.dev` domain behind Access, you must:

10. Select **Add an application** > **Self hosted** in [Cloudflare Zero Trust](https://one.dash.cloudflare.com/).
11. Input an **Application name** and select your custom domain from the _Domain_ dropdown menu.
12. Select **Next** and configure your access rules to define who can reach the Access authentication page.
13. Select **Add application**.

:::caution

If you do not configure an Access policy for your custom domain, an Access authentication will render but not work for your custom domain visitors. If your Pages project has a custom domain, make sure to add an Access policy as described above in steps 10 through 13 to avoid any authentication issues.

:::

If you have an issue that you do not see listed, let the team know in the Cloudflare Workers Discord. Get your invite at [discord.cloudflare.com](https://discord.cloudflare.com), and share your bug report in the #pages-general channel.

## Delete a project with a high number of deployments

You may not be able to delete your Pages project if it has a high number (over 100) of deployments. The Cloudflare team is tracking this issue.

As a workaround, review the following steps to delete all deployments in your Pages project. After you delete your deployments, you will be able to delete your Pages project.

1. Download the `delete-all-deployments.zip` file by going to the following link: [https://pub-505c82ba1c844ba788b97b1ed9415e75.r2.dev/delete-all-deployments.zip](https://pub-505c82ba1c844ba788b97b1ed9415e75.r2.dev/delete-all-deployments.zip).
2. Extract the `delete-all-deployments.zip` file.
3. Open your terminal and `cd` into the `delete-all-deployments` directory.
4. In the `delete-all-deployments` directory, run `npm install` to install dependencies.
5. Review the following commands to decide which deletion you would like to proceed with:

- To delete all deployments except for the live production deployment (excluding [aliased deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/#preview-aliases)):

```sh
CF_API_TOKEN=<YOUR_CF_API_TOKEN> CF_ACCOUNT_ID=<ACCOUNT_ID> CF_PAGES_PROJECT_NAME=<PROJECT_NAME> npm start
```

- To delete all deployments except for the live production deployment (including [aliased deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/#preview-aliases), for example, `staging.example.pages.dev`):

```sh
CF_API_TOKEN=<YOUR_CF_API_TOKEN> CF_ACCOUNT_ID=<ACCOUNT_ID> CF_PAGES_PROJECT_NAME=<PROJECT_NAME> CF_DELETE_ALIASED_DEPLOYMENTS=true npm start
```

To find your Cloudflare API token, log in to the [Cloudflare dashboard](https://dash.cloudflare.com), select the user icon on the upper righthand side of your screen > go to **My Profile** > **API Tokens**.

To find your Account ID, refer to [Find your zone and account ID](/fundamentals/setup/find-account-and-zone-ids/).

## Use Pages as Origin in Cloudflare Load Balancer

[Cloudflare Load Balancing](/load-balancing/) will not work without the host header set. To use a Pages project as target, make sure to select **Add host header** when [creating a pool](/load-balancing/pools/create-pool/#create-a-pool), and set both the host header value and the endpoint address to your `pages.dev` domain.

Refer to [Use Cloudflare Pages as origin](/load-balancing/pools/cloudflare-pages-origin/) for a complete tutorial.

---

# Limits

URL: https://developers.cloudflare.com/pages/platform/limits/

import { Render } from "~/components"

Below are limits observed by the Cloudflare Free plan. For more details on removing these limits, refer to the [Cloudflare plans](https://www.cloudflare.com/plans) page.

<Render file="limits_increase" product="workers" />

## Builds

Each time you push new code to your Git repository, Pages will build and deploy your site. You can build up to 500 times per month on the Free plan. Refer to the Pro and Business plans in [Pricing](https://pages.cloudflare.com/#pricing) if you need more builds.

Builds will timeout after 20 minutes. Concurrent builds are counted per account.

## Custom domains

Based on your Cloudflare plan type, a Pages project is limited to a specific number of custom domains. This limit is on a per-project basis.

| Free | Pro | Business | Enterprise |
| ---- | --- | -------- | ---------- |
| 100  | 250 | 500      | 500[^1]    |

[^1]: If you need more custom domains, contact your account team.

## Files

Pages uploads each file on your site to Cloudflare's globally distributed network to deliver a low latency experience to every user that visits your site. Cloudflare Pages sites can contain up to 20,000 files.

## File size

The maximum file size for a single Cloudflare Pages site asset is 25 MiB.

:::note[Larger Files]


To serve larger files, consider uploading them to [R2](/r2/) and utilizing the [public bucket](/r2/buckets/public-buckets/) feature. You can also use [custom domains](/r2/buckets/public-buckets/#connect-a-bucket-to-a-custom-domain), such as `static.example.com`, for serving these files.


:::

## Headers

A `_headers` file can have a maximum of 100 header rules.

An individual header in a `_headers` file can have a maximum of 2,000 characters. For managing larger headers, it is recommended to implement [Pages Functions](/pages/functions/).

## Preview deployments

You can have an unlimited number of [preview deployments](/pages/configuration/preview-deployments/) active on your project at a time.

## Redirects

A `_redirects` file can have a maximum of 2,000 static redirects and 100 dynamic redirects, for a combined total of 2,100 redirects. It is recommended to use [Bulk Redirects](/pages/configuration/redirects/#surpass-_redirects-limits) when you have a need for more than the `_redirects` file supports.

## Users

Your Pages site can be managed by an unlimited number of users via the Cloudflare dashboard. Note that this does not correlate with your Git project â€“ you can manage both public and private repositories, open issues, and accept pull requests via  without impacting your Pages site.

## Projects

Cloudflare Pages has a soft limit of 100 projects within your account in order to prevent abuse. If you need this limit raised, contact your Cloudflare account team or use the Limit Increase Request Form at the top of this page.

In order to protect against abuse of the service, Cloudflare may temporarily disable your ability to create new Pages projects, if you are deploying a large number of applications in a short amount of time. Contact support if you need this limit increased.

---

# Tutorials

URL: https://developers.cloudflare.com/pages/tutorials/

import { GlossaryTooltip, ListTutorials } from "~/components"

View <GlossaryTooltip term="tutorial">tutorials</GlossaryTooltip> to help you get started with Pages.

<ListTutorials />

---

# GitHub integration

URL: https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/

You can connect each Cloudflare Pages project to a GitHub repository, and Cloudflare will automatically deploy your code every time you push a change to a branch.

## Features

Beyond automatic deployments, the Cloudflare GitHub integration lets you monitor, manage, and preview deployments directly in GitHub, keeping you informed without leaving your workflow.

### Custom branches

Pages will default to setting your [production environment](/pages/configuration/branch-build-controls/#production-branch-control) to the branch you first push. If a branch other than the default branch (e.g. `main`) represents your project's production branch, then go to **Settings** > **Builds** > **Branch control**, change the production branch by clicking the **Production branch** dropdown menu and choose any other branch.

You can also use [preview deployments](/pages/configuration/preview-deployments/) to preview versions of your project before merging your production branch, and deploying to production. Pages allows you to configure which of your preview branches are automatically deployed using [branch build controls](/pages/configuration/branch-build-controls/). To configure, go to **Settings** > **Builds** > **Branch control** and select an option under **Preview branch**. Use [**Custom branches**](/pages/configuration/branch-build-controls/) to specify branches you wish to include or exclude from automatic preview deployments.

### Preview URLs

Every time you open a new pull request on your GitHub repository, Cloudflare Pages will create a unique preview URL, which will stay updated as you continue to push new commits to the branch. Note that preview URLs will not be created for pull requests created from forks of your repository. Learn more in [Preview Deployments](/pages/configuration/preview-deployments/).

![GitHub Preview URLs](~/assets/images/pages/configuration/ghpreviewurls.png)

### Skipping a build via a commit message

Without any configuration required, you can choose to skip a deployment on an ad hoc basis. By adding the `[CI Skip]`, `[CI-Skip]`, `[Skip CI]`, `[Skip-CI]`, or `[CF-Pages-Skip]` flag as a prefix in your commit message, and Pages will omit that deployment. The prefixes are not case sensitive.

### Check runs

If you have one or multiple projects connected to a repository (i.e. a [monorepo](/pages/configuration/monorepos/)), you can check on the status of each build within GitHub via [GitHub check runs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks#checks).

You can see the checks by selecting the status icon next to a commit within your GitHub repository. In the example below, you can select the green check mark to see the results of the check run.

![GitHub status](~/assets/images/workers/platform/ci-cd/gh-status-check-runs.png)

Check runs will appear like the following in your repository.

![GitHub check runs](~/assets/images/pages/configuration/ghcheckrun.png)

If a build skips for any reason (i.e. CI Skip, build watch paths, or branch deployment controls), the check run/commit status will not appear.

## Manage access

You can deploy projects to Cloudflare Workers from your company or side project on GitHub using the [Cloudflare Workers & Pages GitHub App](https://github.com/apps/cloudflare-workers-and-pages).

### Organizational access

You can deploy projects to Cloudflare Pages from your company or side project on both GitHub and GitLab.

When authorizing Cloudflare Pages to access a GitHub account, you can specify access to your individual account or an organization that you belong to on GitHub. In order to be able to add the Cloudflare Pages installation to that organization, your user account must be an owner or have the appropriate role within the organization (that is, the GitHub Apps Manager role). More information on these roles can be seen on [GitHub's documentation](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization#github-app-managers).

:::caution[GitHub security consideration]

A GitHub account should only point to one Cloudflare account. If you are setting up Cloudflare with GitHub for your organization, Cloudflare recommends that you limit the scope of the application to only the repositories you intend to build with Pages. To modify these permissions, go to the [Applications page](https://github.com/settings/installations) on GitHub and select **Switch settings context** to access your GitHub organization settings. Then, select **Cloudflare Workers & Pages** > For **Repository access**, select **Only select repositories** > select your repositories.

:::

### Remove access

You can remove Cloudflare Pages' access to your GitHub repository or account by going to the [Applications page](https://github.com/settings/installations) on GitHub (if you are in an organization, select Switch settings context to access your GitHub organization settings). The GitHub App is named Cloudflare Workers and Pages, and it is shared between Workers and Pages projects.

#### Remove Cloudflare access to a GitHub repository

To remove access to an individual GitHub repository, you can navigate to **Repository access**. Select the **Only select repositories** option, and configure which repositories you would like Cloudflare to have access to.

![GitHub Repository Access](~/assets/images/workers/platform/ci-cd/github-repository-access.png)

#### Remove Cloudflare access to the entire GitHub account

To remove Cloudflare Workers and Pages access to your entire Git account, you can navigate to **Uninstall "Cloudflare Workers and Pages"**, then select **Uninstall**. Removing access to the Cloudflare Workers and Pages app will revoke Cloudflare's access to _all repositories_ from that GitHub account. If you want to only disable automatic builds and deployments, follow the [Disable Build](/workers/ci-cd/builds/#disconnecting-builds) instructions.

Note that removing access to GitHub will disable new builds for Workers and Pages project that were connected to those repositories, though your previous deployments will continue to be hosted by Cloudflare Workers.

### Reinstall the Cloudflare GitHub app

If you see errors where Cloudflare Pages cannot access your git repository, you should attempt to uninstall and reinstall the GitHub application associated with the Cloudflare Pages installation.

1. Go to the installation settings page on GitHub:
   - Navigate to **Settings > Builds** for the Pages project and select **Manage** under Git Repository.
   - Alternatively, visit these links to find the Cloudflare Workers and Pages installation and select **Configure**:

|                  |                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------- |
| **Individual**   | `https://github.com/settings/installations`                                        |
| **Organization** | `https://github.com/organizations/<YOUR_ORGANIZATION_NAME>/settings/installations` |

2. In the Cloudflare Workers and Pages GitHub App settings page, navigate to **Uninstall "Cloudflare Workers and Pages"** and select **Uninstall**.
3. Go back to the [**Workers & Pages** overview](https://dash.cloudflare.com) page. Select **Create application** > **Pages** > **Connect to Git**.
4. Select the **+ Add account** button, select the GitHub account you want to add, and then select **Install & Authorize**.
5. You should be redirected to the create project page with your GitHub account or organization in the account list.
6. Attempt to make a new deployment with your project which was previously broken.

---

# GitLab integration

URL: https://developers.cloudflare.com/pages/configuration/git-integration/gitlab-integration/

You can connect each Cloudflare Pages project to a GitLab repository, and Cloudflare will automatically deploy your code every time you push a change to a branch.

## Features

Beyond automatic deployments, the Cloudflare GitLab integration lets you monitor, manage, and preview deployments directly in GitLab, keeping you informed without leaving your workflow.

### Custom branches

Pages will default to setting your [production environment](/pages/configuration/branch-build-controls/#production-branch-control) to the branch you first push. If a branch other than the default branch (e.g. `main`) represents your project's production branch, then go to **Settings** > **Builds** > **Branch control**, change the production branch by clicking the **Production branch** dropdown menu and choose any other branch.

You can also use [preview deployments](/pages/configuration/preview-deployments/) to preview versions of your project before merging your production branch, and deploying to production. Pages allows you to configure which of your preview branches are automatically deployed using [branch build controls](/pages/configuration/branch-build-controls/). To configure, go to **Settings** > **Builds** > **Branch control** and select an option under **Preview branch**. Use [**Custom branches**](/pages/configuration/branch-build-controls/) to specify branches you wish to include or exclude from automatic preview deployments.

### Skipping a specific build via a commit message

Without any configuration required, you can choose to skip a deployment on an ad hoc basis. By adding the `[CI Skip]`, `[CI-Skip]`, `[Skip CI]`, `[Skip-CI]`, or `[CF-Pages-Skip]` flag as a prefix in your commit message, Pages will omit that deployment. The prefixes are not case sensitive.

### Check runs and preview URLs

If you have one or multiple projects connected to a repository (i.e. a [monorepo](/workers/ci-cd/builds/advanced-setups/#monorepos)), you can check on the status of each build within GitLab via [GitLab commit status](https://docs.gitlab.com/ee/user/project/merge_requests/status_checks.html).

You can see the statuses by selecting the status icon next to a commit or by going to **Build** > **Pipelines** within your GitLab repository. In the example below, you can select the green check mark to see the results of the check run.

![GitLab Status](~/assets/images/workers/platform/ci-cd/gl-status-checks.png)

Check runs will appear like the following in your repository. You can select one of the statuses to view the [preview URL](/pages/configuration/preview-deployments/) for that deployment.

![GitLab Commit Status](~/assets/images/pages/configuration/glcommitstatus.png)

If a build skips for any reason (i.e. CI Skip, build watch paths, or branch deployment controls), the check run/commit status will not appear.

## Manage access

You can deploy projects to Cloudflare Workers from your company or side project on GitLab using the Cloudflare Pages app.

### Organizational access

You can deploy projects to Cloudflare Pages from your company or side project on both GitHub and GitLab.

When you authorize Cloudflare Pages to access your GitLab account, you automatically give Cloudflare Pages access to organizations, groups, and namespaces accessed by your GitLab account. Managing access to these organizations and groups is handled by GitLab.

### Remove access

You can remove Cloudflare Workers' access to your GitLab account by navigating to [Authorized Applications page](https://gitlab.com/-/profile/applications) on GitLab. Find the applications called Cloudflare Workers and select the **Revoke** button to revoke access.

Note that the GitLab application Cloudflare Workers is shared between Workers and Pages projects, and removing access to GitLab will disable new builds for Workers and Pages, though your previous deployments will continue to be hosted by Cloudflare Pages.

### Reinstall the Cloudflare GitLab app

When encountering Git integration related issues, one potential troubleshooting step is attempting to uninstall and reinstall the GitHub or GitLab application associated with the Cloudflare Pages installation.

1. Go to your application settings page on GitLab located here: [https://gitlab.com/-/profile/applications](https://gitlab.com/-/profile/applications)
2. Select the **Revoke** button on your Cloudflare Pages installation if it exists.
3. Go back to the **Workers & Pages** overview page at `https://dash.cloudflare.com/[YOUR_ACCOUNT_ID]/workers-and-pages`. Select **Create application** > **Pages** > **Connect to Git**.
4. Select the **GitLab** tab at the top, select the **+ Add account** button, select the GitLab account you want to add, and then select **Authorize** on the modal titled "Authorize Cloudflare Pages to use your account?".
5. You will be redirected to the create project page with your GitLab account or organization in the account list.
6. Attempt to make a new deployment with your project which was previously broken.

---

# Git integration

URL: https://developers.cloudflare.com/pages/configuration/git-integration/

You can connect each Cloudflare Pages project to a [GitHub](/pages/configuration/git-integration/github-integration) or [GitLab](/pages/configuration/git-integration/gitlab-integration) repository, and Cloudflare will automatically deploy your code every time you push a change to a branch.

:::note
Cloudflare Workers now also supports Git integrations to automatically build and deploy Workers from your connected Git repository. Learn more in [Workers Builds](/workers/ci-cd/builds/).
:::

When you connect a git repository to your Cloudflare Pages project, Cloudflare will also:

- **Preview deployments for custom branches**, generating preview URLs for a commit to any branch in the repository without affecting your production deployment.
- **Preview URLs in pull requests** (PRs) to the repository.
- **Build and deployment status checks** within the Git repository.
- **Skipping builds using a commit message**.

These features allow you to manage your deployments directly within GitHub or GitLab without leaving your team's regular development workflow.

:::caution[You cannot switch to Direct Upload later]
If you deploy using the Git integration, you cannot switch to [Direct Upload](/pages/get-started/direct-upload/) later. However, if you already use a Git-integrated project and do not want to trigger deployments every time you push a commit, you can [disable automatic deployments](/pages/configuration/git-integration/#disable-automatic-deployments) on all branches. Then, you can use Wrangler to deploy directly to your Pages projects and make changes to your Git repository without automatically triggering a build.

:::

## Supported Git providers

Cloudflare supports connecting Cloudflare Pages to your GitHub and GitLab repositories. Pages does not currently support connecting self-hosted instances of GitHub or GitLab.

If you using a different Git provider (e.g. Bitbucket) or a self-hosted instance, you can start with a Direct Upload project and deploy using a CI/CD provider (e.g. GitHub Actions) with [Wrangler CLI](/pages/how-to/use-direct-upload-with-continuous-integration/).

## Add a Git integration

If you do not have a Git account linked to your Cloudflare account, you will be prompted to set up an installation to GitHub or GitLab when [connecting to Git](/pages/get-started/git-integration/) for the first time, or when adding a new Git account. Follow the prompts and authorize the Cloudflare Git integration.

You can check the following pages to see if your Git integration has been installed:

- [GitHub Applications page](https://github.com/settings/installations) (if you're in an organization, select **Switch settings context** to access your GitHub organization settings)
- [GitLab Authorized Applications page](https://gitlab.com/-/profile/applications)

For details on providing access to organization accounts, see the [GitHub](/pages/configuration/git-integration/github-integration/#organizational-access) and [GitLab](/pages/configuration/git-integration/gitlab-integration/#organizational-access) guides.

## Manage a Git integration

You can manage the Git installation associated with your repository connection by navigating to the Pages project, then going to **Settings** > **Builds** and selecting **Manage** under **Git Repository**.

This can be useful for managing repository access or troubleshooting installation issues by reinstalling. For more details, see the [GitHub](/pages/configuration/git-integration/github-integration/#managing-access) and [GitLab](/pages/configuration/git-integration/gitlab-integration/#managing-access) guides.

## Disable automatic deployments

If you are using a Git-integrated project and do not want to trigger deployments every time you push a commit, you can use [branch control](/pages/configuration/branch-build-controls/) to disable/pause builds:

1. Go to the **Settings** of your **Pages project** in the [Cloudflare dashboard](https://dash.cloudflare.com).
2. Navigate to **Build** > edit **Branch control** > turn off **Enable automatic production branch deployments**.
3. You can also change your Preview branch to **None (Disable automatic branch deployments)** to pause automatic preview deployments.

Then, you can use Wrangler to deploy directly to your Pages project and make changes to your Git repository without automatically triggering a build.

---

# Troubleshooting builds

URL: https://developers.cloudflare.com/pages/configuration/git-integration/troubleshooting/

If your git integration is experiencing issues, you may find the following banners in the Deployment page of your Pages project.

## Project creation

#### `This repository is being used for a Cloudflare Pages project on a different Cloudflare account.`

Using the same GitHub/GitLab repository across separate Cloudflare accounts is disallowed. To use the repository for a Pages project in that Cloudflare account, you should delete any Pages projects using the repository in other Cloudflare accounts.

## Deployments

If you run into any issues related to deployments or failing, check your project dashboard to see if there are any SCM installation warnings listed as shown in the screenshot below.

![Pausing a deployment in the Settings of your Pages project](~/assets/images/pages/platform/git.dashboard-error.png)

To resolve any errors displayed in the Cloudflare Pages dashboard, follow the steps listed below.

#### `This project is disconnected from your Git account, this may cause deployments to fail.`

To resolve this issue, follow the steps provided above in the [Reinstalling a Git installation section](/pages/configuration/git-integration/#reinstall-a-git-installation) for the applicable SCM provider. If the issue persists even after uninstalling and reinstalling, contact support.

#### `Cloudflare Pages is not properly installed on your Git account, this may cause deployments to fail.`

To resolve this issue, follow the steps provided above in the [Reinstalling a Git installation section](/pages/configuration/git-integration/#reinstall-a-git-installation) for the applicable SCM provider. If the issue persists even after uninstalling and reinstalling, contact support.

#### `The Cloudflare Pages installation has been suspended, this may cause deployments to fail.`

Go to your GitHub installation settings:

- `https://github.com/settings/installations` for individual accounts
- `https://github.com/organizations/<YOUR_ORGANIZATION_NAME>/settings/installations` for organizational accounts

Click **Configure** on the Cloudflare Pages application. Scroll down to the bottom of the page and click **Unsuspend** to allow Cloudflare Pages to make future deployments.

#### `The project is linked to a repository that no longer exists, this may cause deployments to fail.`

You may have deleted or transferred the repository associated with this Cloudflare Pages project. For a deleted repository, you will need to create a new Cloudflare Pages project with a repository that has not been deleted. For a transferred repository, you can either transfer the repository back to the original Git account or you will need to create a new Cloudflare Pages project with the transferred repository.

#### `The repository cannot be accessed, this may cause deployments to fail.`

You may have excluded this repository from your installation's repository access settings. Go to your GitHub installation settings:

- `https://github.com/settings/installations` for individual accounts
- `https://github.com/organizations/<YOUR_ORGANIZATION_NAME>/settings/installations` for organizational accounts

Click **Configure** on the Cloudflare Pages application. Under **Repository access**, ensure that the repository associated with your Cloudflare Pages project is included in the list.

#### `There is an internal issue with your Cloudflare Pages Git installation.`

This is an internal error in the Cloudflare Pages SCM system. You can attempt to [reinstall your Git installation](/pages/configuration/git-integration/#reinstall-a-git-installation), but if the issue persists, [contact support](/support/contacting-cloudflare-support/).

#### `GitHub/GitLab is having an incident and push events to Cloudflare are operating in a degraded state. Check their status page for more details.`

This indicates that GitHub or GitLab may be experiencing an incident affecting push events to Cloudflare. It is recommended to monitor their status page ([GitHub](https://www.githubstatus.com/), [GitLab](https://status.gitlab.com/)) for updates and try deploying again later.

---

# A/B testing with middleware

URL: https://developers.cloudflare.com/pages/functions/examples/ab-testing/

```js
const cookieName = "ab-test-cookie";
const newHomepagePathName = "/test";

const abTest = async (context) => {
	const url = new URL(context.request.url);
	// if homepage
	if (url.pathname === "/") {
		// if cookie ab-test-cookie=new then change the request to go to /test
		// if no cookie set, pass x% of traffic and set a cookie value to "current" or "new"

		let cookie = request.headers.get("cookie");
		// is cookie set?
		if (cookie && cookie.includes(`${cookieName}=new`)) {
			// pass the request to /test
			url.pathname = newHomepagePathName;
			return context.env.ASSETS.fetch(url);
		} else {
			const percentage = Math.floor(Math.random() * 100);
			let version = "current"; // default version
			// change pathname and version name for 50% of traffic
			if (percentage < 50) {
				url.pathname = newHomepagePathName;
				version = "new";
			}
			// get the static file from ASSETS, and attach a cookie
			const asset = await context.env.ASSETS.fetch(url);
			let response = new Response(asset.body, asset);
			response.headers.append("Set-Cookie", `${cookieName}=${version}; path=/`);
			return response;
		}
	}
	return context.next();
};

export const onRequest = [abTest];
```

---

# Adding CORS headers

URL: https://developers.cloudflare.com/pages/functions/examples/cors-headers/

This example is a snippet from our Cloudflare Pages Template repo.

```ts
// Respond to OPTIONS method
export const onRequestOptions: PagesFunction = async () => {
	return new Response(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Headers": "*",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Max-Age": "86400",
		},
	});
};

// Set CORS to all /api responses
export const onRequest: PagesFunction = async (context) => {
	const response = await context.next();
	response.headers.set("Access-Control-Allow-Origin", "*");
	response.headers.set("Access-Control-Max-Age", "86400");
	return response;
};
```

---

# Examples

URL: https://developers.cloudflare.com/pages/functions/examples/

import { DirectoryListing } from "~/components"

<DirectoryListing />

---

# Cloudflare Access

URL: https://developers.cloudflare.com/pages/functions/plugins/cloudflare-access/

The Cloudflare Access Pages Plugin is a middleware to validate Cloudflare Access JWT assertions. It also includes an API to lookup additional information about a given user's JWT.

## Installation

```sh
npm install @cloudflare/pages-plugin-cloudflare-access
```

## Usage

```typescript
import cloudflareAccessPlugin from "@cloudflare/pages-plugin-cloudflare-access";

export const onRequest: PagesFunction = cloudflareAccessPlugin({
	domain: "https://test.cloudflareaccess.com",
	aud: "4714c1358e65fe4b408ad6d432a5f878f08194bdb4752441fd56faefa9b2b6f2",
});
```

The Plugin takes an object with two properties: the `domain` of your Cloudflare Access account, and the policy `aud` (audience) to validate against. Any requests which fail validation will be returned a `403` status code.

### Access the JWT payload

If you need to use the JWT payload in your application (for example, you need the user's email address), this Plugin will make this available for you at `data.cloudflareAccess.JWT.payload`.

For example:

```typescript
import type { PluginData } from "@cloudflare/pages-plugin-cloudflare-access";

export const onRequest: PagesFunction<unknown, any, PluginData> = async ({
	data,
}) => {
	return new Response(
		`Hello, ${data.cloudflareAccess.JWT.payload.email || "service user"}!`,
	);
};
```

The [entire JWT payload](/cloudflare-one/identity/authorization-cookie/application-token/#payload) will be made available on `data.cloudflareAccess.JWT.payload`. Be aware that the fields available differ between identity authorizations (for example, a user in a browser) and non-identity authorizations (for example, a service token).

### Look up identity

In order to get more information about a given user's identity, use the provided `getIdentity` API function:

```typescript
import { getIdentity } from "@cloudflare/pages-plugin-cloudflare-access/api";

export const onRequest: PagesFunction = async ({ data }) => {
	const identity = await getIdentity({
		jwt: "eyJhbGciOiJIUzI1NiIsImtpZCI6IjkzMzhhYmUxYmFmMmZlNDkyZjY0NmE3MzZmMjVhZmJmN2IwMjVlMzVjNjI3YmU0ZjYwYzQxNGQ0YzczMDY5YjgiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOlsiOTdlMmFhZTEyMDEyMWY5MDJkZjhiYzk5ZmMzNDU5MTNhYjE4NmQxNzRmMzA3OWVhNzI5MjM2NzY2YjJlN2M0YSJdLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiZXhwIjoxNTE5NDE4MjE0LCJpYXQiOjE1MTkzMzE4MTUsImlzcyI6Imh0dHBzOi8vdGVzdC5jbG91ZGZsYXJlYWNjZXNzLmNvbSIsIm5vbmNlIjoiMWQ4MDgzZjcwOGE0Nzk4MjI5NmYyZDk4OTZkNzBmMjA3YTI3OTM4ZjAyNjU0MGMzOTJiOTAzZTVmZGY0ZDZlOSIsInN1YiI6ImNhNjM5YmI5LTI2YWItNDJlNS1iOWJmLTNhZWEyN2IzMzFmZCJ9.05vGt-_0Mw6WEFJF3jpaqkNb88PUMplsjzlEUvCEfnQ",
		domain: "https://test.cloudflareaccess.com",
	});

	return new Response(`Hello, ${identity.name || "service user"}!`);
};
```

The `getIdentity` function takes an object with two properties: a `jwt` string, and a `domain` string. It returns a `Promise` of [the object returned by the `/cdn-cgi/access/get-identity` endpoint](/cloudflare-one/identity/authorization-cookie/application-token/#user-identity). This is particularly useful if you want to use a user's group membership for something like application permissions.

For convenience, this same information can be fetched for the current request's JWT with the `data.cloudflareAccess.JWT.getIdentity` function, (assuming you have already validated the request with the Plugin as above):

```typescript
import type { PluginData } from "@cloudflare/pages-plugin-cloudflare-access";

export const onRequest: PagesFunction<unknown, any, PluginData> = async ({
	data,
}) => {
	const identity = await data.cloudflareAccess.JWT.getIdentity();

	return new Response(`Hello, ${identity.name || "service user"}!`);
};
```

### Login and logout URLs

If you want to force a login or logout, use these utility functions to generate URLs and redirect a user:

```typescript
import { generateLoginURL } from "@cloudflare/pages-plugin-cloudflare-access/api";

export const onRequest = () => {
	const loginURL = generateLoginURL({
		redirectURL: "https://example.com/greet",
		domain: "https://test.cloudflareaccess.com",
		aud: "4714c1358e65fe4b408ad6d432a5f878f08194bdb4752441fd56faefa9b2b6f2",
	});

	return new Response(null, {
		status: 302,
		headers: { Location: loginURL },
	});
};
```

```typescript
import { generateLogoutURL } from "@cloudflare/pages-plugin-cloudflare-access/api";

export const onRequest = () =>
	new Response(null, {
		status: 302,
		headers: {
			Location: generateLogoutURL({
				domain: "https://test.cloudflareaccess.com",
			}),
		},
	});
```

---

# Community Plugins

URL: https://developers.cloudflare.com/pages/functions/plugins/community-plugins/

The following are some of the community-maintained Pages Plugins. If you have created a Pages Plugin and would like to share it with developers, create a PR to add it to this alphabeticallly-ordered list using the link in the footer.

* [pages-plugin-asset-negotiation](https://github.com/Cherry/pages-plugin-asset-negotiation)

  Given a folder of assets in multiple formats, this Plugin will automatically negotiate with a client to serve an optimized version of a requested asset.

* [proxyflare-for-pages](https://github.com/flaregun-net/proxyflare-for-pages)

  Move traffic around your Cloudflare Pages domain with ease. Proxyflare is a reverse-proxy that enables you to:

  * Port forward, redirect, and reroute HTTP and websocket traffic anywhere on the Internet.
  * Mount an entire website on a subpath (for example, `mysite.com/docs`) on your apex domain.
  * Serve static text (like `robots.txt` and other structured metadata) from any endpoint.

  Refer to [Proxyflare](https://proxyflare.works) for more information.

* [cloudflare-pages-plugin-trpc](https://github.com/toyamarinyon/cloudflare-pages-plugin-trpc)

  Allows developers to quickly create a tRPC server with a Cloudflare Pages Function.

* [pages-plugin-twind](https://github.com/helloimalastair/twind-plugin)

  Automatically injects Tailwind CSS styles into HTML pages after analyzing which classes are used.

---

# Google Chat

URL: https://developers.cloudflare.com/pages/functions/plugins/google-chat/

The Google Chat Pages Plugin creates a Google Chat bot which can respond to messages. It also includes an API for interacting with Google Chat (for example, for creating messages) without the need for user input. This API is useful for situations such as alerts.

## Installation

```sh
npm install @cloudflare/pages-plugin-google-chat
```

## Usage

```typescript
import googleChatPlugin from "@cloudflare/pages-plugin-google-chat";

export const onRequest: PagesFunction = googleChatPlugin(async (message) => {
	if (message.text.includes("ping")) {
		return { text: "pong" };
	}

	return { text: "Sorry, I could not understand your message." };
});
```

The Plugin takes a function, which in turn takes an incoming message, and returns a `Promise` of a response message (or `void` if there should not be any response).

The Plugin only exposes a single route, which is the URL you should set in the Google Cloud Console when creating the bot.

![Google Cloud Console's Connection Settings for the Google Chat API showing 'App URL' selected and 'https://example.com/google-chat' entered into the 'App URL' text input.](~/assets/images/pages/platform/functions/google-chat.png)

### API

The Google Chat API can be called directly using the `GoogleChatAPI` class:

```typescript
import { GoogleChatAPI } from "@cloudflare/pages-plugin-google-chat/api";

export const onRequest: PagesFunction = () => {
	// Initialize a GoogleChatAPI with your service account's credentials
	const googleChat = new GoogleChatAPI({
		credentials: {
			client_email: "SERVICE_ACCOUNT_EMAIL_ADDRESS",
			private_key: "SERVICE_ACCOUNT_PRIVATE_KEY",
		},
	});

	// Post a message
	// https://developers.google.com/chat/api/reference/rest/v1/spaces.messages/create
	const message = await googleChat.createMessage(
		{ parent: "spaces/AAAAAAAAAAA" },
		undefined,
		{
			text: "I'm an alert!",
		},
	);

	return new Response("Alert sent.");
};
```

We recommend storing your service account's credentials in KV rather than in plain text as above.

The following functions are available on a `GoogleChatAPI` instance. Each take up to three arguments: an object of path parameters, an object of query parameters, and an object of the request body; as described in the [Google Chat API's documentation](https://developers.google.com/chat/api/reference/rest).

- [`downloadMedia`](https://developers.google.com/chat/api/reference/rest/v1/media/download)
- [`getSpace`](https://developers.google.com/chat/api/reference/rest/v1/spaces/get)
- [`listSpaces`](https://developers.google.com/chat/api/reference/rest/v1/spaces/list)
- [`getMember`](https://developers.google.com/chat/api/reference/rest/v1/spaces.members/get)
- [`listMembers`](https://developers.google.com/chat/api/reference/rest/v1/spaces.members/list)
- [`createMessage`](https://developers.google.com/chat/api/reference/rest/v1/spaces.messages/create)
- [`deleteMessage`](https://developers.google.com/chat/api/reference/rest/v1/spaces.messages/delete)
- [`getMessage`](https://developers.google.com/chat/api/reference/rest/v1/spaces.messages/get)
- [`updateMessage`](https://developers.google.com/chat/api/reference/rest/v1/spaces.messages/update)
- [`getAttachment`](https://developers.google.com/chat/api/reference/rest/v1/spaces.messages.attachments/get)

---

# GraphQL

URL: https://developers.cloudflare.com/pages/functions/plugins/graphql/

The GraphQL Pages Plugin creates a GraphQL server which can respond to `application/json` and `application/graphql` `POST` requests. It responds with [the GraphQL Playground](https://github.com/graphql/graphql-playground) for `GET` requests.

## Installation

```sh
npm install @cloudflare/pages-plugin-graphql
```

## Usage

```typescript
import graphQLPlugin from "@cloudflare/pages-plugin-graphql";
import {
	graphql,
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
} from "graphql";

const schema = new GraphQLSchema({
	query: new GraphQLObjectType({
		name: "RootQueryType",
		fields: {
			hello: {
				type: GraphQLString,
				resolve() {
					return "Hello, world!";
				},
			},
		},
	}),
});

export const onRequest: PagesFunction = graphQLPlugin({
	schema,
	graphql,
});
```

This Plugin only exposes a single route, so wherever it is mounted is wherever it will be available. In the above example, because it is mounted in `functions/graphql.ts`, the server will be available on `/graphql` of your Pages project.

---

# hCaptcha

URL: https://developers.cloudflare.com/pages/functions/plugins/hcaptcha/

The hCaptcha Pages Plugin validates hCaptcha tokens.

## Installation

```sh
npm install @cloudflare/pages-plugin-hcaptcha
```

## Usage

```typescript
import hCaptchaPlugin from "@cloudflare/pages-plugin-hcaptcha";

export const onRequestPost: PagesFunction[] = [
	hCaptchaPlugin({
		secret: "0x0000000000000000000000000000000000000000",
		sitekey: "10000000-ffff-ffff-ffff-000000000001",
	}),
	async (context) => {
		// Request has been validated as coming from a human

		const formData = await context.request.formData();

		// Store user credentials

		return new Response("Successfully registered!");
	},
];
```

This Plugin only exposes a single route. It will be available wherever it is mounted. In the above example, because it is mounted in `functions/register.ts`, it will validate requests to `/register`. The Plugin is mounted with a single object parameter with the following properties.

[`secret`](https://dashboard.hcaptcha.com/settings) (mandatory) and [`sitekey`](https://dashboard.hcaptcha.com/sites) (optional) can both be found in your hCaptcha dashboard.

`response` and `remoteip` are optional strings. `response` the hCaptcha token to verify (defaults to extracting `h-captcha-response` from a `multipart/form-data` request). `remoteip` should be requester's IP address (defaults to the `CF-Connecting-IP` header of the request).

`onError` is an optional function which takes the Pages Function context object and returns a `Promise` of a `Response`. By default, it will return a human-readable error `Response`.

`data.hCaptcha` will be populated in subsequent Pages Functions (including for the `onError` function) with [the hCaptcha response object](https://docs.hcaptcha.com/#verify-the-user-response-server-side).

---

# Honeycomb

URL: https://developers.cloudflare.com/pages/functions/plugins/honeycomb/

The Honeycomb Pages Plugin automatically sends traces to Honeycomb for analysis and observability.

## Installation

```sh
npm install @cloudflare/pages-plugin-honeycomb
```

## Usage

The following usage example uses environment variables you will need to set in your Pages project settings.

```typescript
import honeycombPlugin from "@cloudflare/pages-plugin-honeycomb";

export const onRequest: PagesFunction<{
	HONEYCOMB_API_KEY: string;
	HONEYCOMB_DATASET: string;
}> = (context) => {
	return honeycombPlugin({
		apiKey: context.env.HONEYCOMB_API_KEY,
		dataset: context.env.HONEYCOMB_DATASET,
	})(context);
};
```

Alternatively, you can hard-code (not advisable for API key) your settings the following way:

```typescript
import honeycombPlugin from "@cloudflare/pages-plugin-honeycomb";

export const onRequest = honeycombPlugin({
	apiKey: "YOUR_HONEYCOMB_API_KEY",
	dataset: "YOUR_HONEYCOMB_DATASET_NAME",
});
```

This Plugin is based on the `@cloudflare/workers-honeycomb-logger` and accepts the same [configuration options](https://github.com/cloudflare/workers-honeycomb-logger#config).

Ensure that you enable the option to **Automatically unpack nested JSON** and set the **Maximum unpacking depth** to **5** in your Honeycomb dataset settings.

![Follow the instructions above to toggle on Automatically unpack nested JSON and set the Maximum unpacking depth option to 5 in the Honeycomb dashboard](~/assets/images/pages/platform/functions/honeycomb.png)

### Additional context

`data.honeycomb.tracer` has two methods for attaching additional information about a given trace:

- `data.honeycomb.tracer.log` which takes a single argument, a `String`.
- `data.honeycomb.tracer.addData` which takes a single argument, an object of arbitrary data.

More information about these methods can be seen on [`@cloudflare/workers-honeycomb-logger`'s documentation](https://github.com/cloudflare/workers-honeycomb-logger#adding-logs-and-other-data).

For example, if you wanted to use the `addData` method to attach user information:

```typescript
import type { PluginData } from "@cloudflare/pages-plugin-honeycomb";

export const onRequest: PagesFunction<unknown, any, PluginData> = async ({
	data,
	next,
	request,
}) => {
	// Authenticate the user from the request and extract user's email address
	const email = await getEmailFromRequest(request);

	data.honeycomb.tracer.addData({ email });

	return next();
};
```

---

# Pages Plugins

URL: https://developers.cloudflare.com/pages/functions/plugins/

import { DirectoryListing } from "~/components"

Cloudflare maintains a number of official Pages Plugins for you to use in your Pages projects:

<DirectoryListing />

***

## Author a Pages Plugin

A Pages Plugin is a Pages Functions distributable which includes built-in routing and functionality. Developers can include a Plugin as a part of their Pages project wherever they chose, and can pass it some configuration options. The full power of Functions is available to Plugins, including middleware, parameterized routes, and static assets.

For example, a Pages Plugin could:

* Intercept HTML pages and inject in a third-party script.
* Proxy a third-party service's API.
* Validate authorization headers.
* Provide a full admin web app experience.
* Store data in KV or Durable Objects.
* Server-side render (SSR) webpages with data from a CMS.
* Report errors and track performance.

A Pages Plugin is essentially a library that developers can use to augment their existing Pages project with a deep integration to Functions.

## Use a Pages Plugin

Developers can enhance their projects by mounting a Pages Plugin at a route of their application. Plugins will provide instructions of where they should typically be mounted (for example, an admin interface might be mounted at `functions/admin/[[path]].ts`, and an error logger might be mounted at `functions/_middleware.ts`). Additionally, each Plugin may take some configuration (for example, with an API token).

***

## Static form example

In this example, you will build a Pages Plugin and then include it in a project.

The first Plugin should:

* intercept HTML forms.
* store the form submission in [KV](/kv/api/).
* respond to submissions with a developer's custom response.

### 1. Create a new Pages Plugin

Create a `package.json` with the following:

```json
{
  "name": "@cloudflare/static-form-interceptor",
  "main": "dist/index.js",
  "types": "index.d.ts",
  "files": ["dist", "index.d.ts", "tsconfig.json"],
  "scripts": {
    "build": "npx wrangler pages functions build --plugin --outdir=dist",
    "prepare": "npm run build"
  }
}
```

:::note


The `npx wrangler pages functions build` command supports a number of arguments, including:

* `--plugin` which tells the command to build a Pages Plugin, (rather than Pages Functions as part of a Pages project)
* `--outdir` which allows you to specify where to output the built Plugin
* `--external` which can be used to avoid bundling external modules in the Plugin
* `--watch` argument tells the command to watch for changes to the source files and rebuild the Plugin automatically

For more information about the available arguments, run `npx wrangler pages functions build --help`.


:::

In our example, `dist/index.js` will be the entrypoint to your Plugin. This is a generated file built by Wrangler with the `npm run build` command. Add the `dist/` directory to your `.gitignore`.

Next, create a `functions` directory and start coding your Plugin. The `functions` folder will be mounted at some route by the developer, so consider how you want to structure your files. Generally:

* if you want your Plugin to run on a single route of the developer's choice (for example, `/foo`), create a `functions/index.ts` file.
* if you want your Plugin to be mounted and serve all requests beyond a certain path (for example, `/admin/login` and `/admin/dashboard`), create a `functions/[[path]].ts` file.
* if you want your Plugin to intercept requests but fallback on either other Functions or the project's static assets, create a `functions/_middleware.ts` file.

:::note[Do not include the mounted path in your Plugin]


Your Plugin should not use the mounted path anywhere in the file structure (for example, `/foo` or `/admin`). Developers should be free to mount your Plugin wherever they choose, but you can make recommendations of how you expect this to be mounted in your `README.md`.


:::

You are free to use as many different files as you need. The structure of a Plugin is exactly the same as Functions in a Pages project today, except that the handlers receive a new property of their parameter object, `pluginArgs`. This property is the initialization parameter that a developer passes when mounting a Plugin. You can use this to receive API tokens, KV/Durable Object namespaces, or anything else that your Plugin needs to work.

Returning to your static form example, if you want to intercept requests and override the behavior of an HTML form, you need to create a `functions/_middleware.ts`. Developers could then mount your Plugin on a single route, or on their entire project.

```typescript
class FormHandler {
  element(element) {
    const name = element.getAttribute('data-static-form-name')
    element.setAttribute('method', 'POST')
    element.removeAttribute('action')
    element.append(`<input type="hidden" name="static-form-name" value="${name}" />`, { html: true })
  }
}

export const onRequestGet = async (context) => {
  // We first get the original response from the project
  const response = await context.next()

  // Then, using HTMLRewriter, we transform `form` elements with a `data-static-form-name` attribute, to tell them to POST to the current page
  return new HTMLRewriter().on('form[data-static-form-name]', new FormHandler()).transform(response)
}

export const onRequestPost = async (context) => {
  // Parse the form
  const formData = await context.request.formData()
  const name = formData.get('static-form-name')
  const entries = Object.fromEntries([...formData.entries()].filter(([name]) => name !== 'static-form-name'))

  // Get the arguments given to the Plugin by the developer
  const { kv, respondWith } = context.pluginArgs


  // Store form data in KV under key `form-name:YYYY-MM-DDTHH:MM:SSZ`
  const key = `${name}:${new Date().toISOString()}`
  context.waitUntil(kv.put(name, JSON.stringify(entries)))

  // Respond with whatever the developer wants
  const response = await respondWith({ formData })
  return response
}
```

### 2. Type your Pages Plugin

To create a good developer experience, you should consider adding TypeScript typings to your Plugin. This allows developers to use their IDE features for autocompletion, and also ensure that they include all the parameters you are expecting.

In the `index.d.ts`, export a function which takes your `pluginArgs` and returns a `PagesFunction`. For your static form example, you take two properties, `kv`, a KV namespace, and `respondWith`, a function which takes an object with a `formData` property (`FormData`) and returns a `Promise` of a `Response`:

```typescript
export type PluginArgs = {
  kv: KVNamespace;
  respondWith: (args: { formData: FormData }) => Promise<Response>;
};

export default function (args: PluginArgs): PagesFunction;
```

### 3. Test your Pages Plugin

We are still working on creating a great testing experience for Pages Plugins authors. Please be patient with us until all those pieces come together. In the meantime, you can create an example project and include your Plugin manually for testing.

### 4. Publish your Pages Plugin

You can distribute your Plugin however you choose. Popular options include publishing on [npm](https://www.npmjs.com/), showcasing it in the #what-i-built or #pages-discussions channels in our [Developer Discord](https://discord.com/invite/cloudflaredev), and open-sourcing on [GitHub](https://github.com/).

Make sure you are including the generated `dist/` directory, your typings `index.d.ts`, as well as a `README.md` with instructions on how developers can use your Plugin.

***

### 5. Install your Pages Plugin

If you want to include a Pages Plugin in your application, you need to first install that Plugin to your project.

If you are not yet using `npm` in your project, run `npm init` to create a `package.json` file. The Plugin's `README.md` will typically include an installation command (for example, `npm install --save @cloudflare/static-form-interceptor`).

### 6. Mount your Pages Plugin

The `README.md` of the Plugin will likely include instructions for how to mount the Plugin in your application. You will need to:

1. Create a `functions` directory, if you do not already have one.
2. Decide where you want this Plugin to run and create a corresponding file in the `functions` directory.
3. Import the Plugin and export an `onRequest` method in this file, initializing the Plugin with any arguments it requires.

In the static form example, the Plugin you have created already was created as a middleware. This means it can run on either a single route, or across your entire project. If you had a single contact form on your website at `/contact`, you could create a `functions/contact.ts` file to intercept just that route. You could also create a `functions/_middleware.ts` file to intercept all other routes and any other future forms you might create. As the developer, you can choose where this Plugin can run.

A Plugin's default export is a function which takes the same context parameter that a normal Pages Functions handler is given.

```typescript
import staticFormInterceptorPlugin from "@cloudflare/static-form-interceptor";

export const onRequest = (context) => {
  return staticFormInterceptorPlugin({
    kv: context.env.FORM_KV,
    respondWith: async ({ formData }) => {
      // Could call email/notification service here
      const name = formData.get("name");
      return new Response(`Thank you for your submission, ${name}!`);
    },
  })(context);
};
```

### 7. Test your Pages Plugin

You can use `wrangler pages dev` to test a Pages project, including any Plugins you have installed. Remember to include any KV bindings and environment variables that the Plugin is expecting.

With your Plugin mounted on the `/contact` route, a corresponding HTML file might look like this:

```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Contact us</h1>
    <!-- Include the `data-static-form-name` attribute to name the submission -->
    <form data-static-form-name="contact">
      <label>
        <span>Name</span>
        <input type="text" autocomplete="name" name="name" />
      </label>
      <label>
        <span>Message</span>
        <textarea name="message"></textarea>
      </label>
    </form>
  </body>
</html>
```

Your plugin should pick up the `data-static-form-name="contact"` attribute, set the `method="POST"`, inject in an `<input type="hidden" name="static-form-name" value="contact" />` element, and capture `POST` submissions.

### 8. Deploy your Pages project

Make sure the new Plugin has been added to your `package.json` and that everything works locally as you would expect. You can then `git commit` and `git push` to trigger a Cloudflare Pages deployment.

If you experience any problems with any one Plugin, file an issue on that Plugin's bug tracker.

If you experience any problems with Plugins in general, we would appreciate your feedback in the #pages-discussions channel in [Discord](https://discord.com/invite/cloudflaredev)! We are excited to see what you build with Plugins and welcome any feedback about the authoring or developer experience. Let us know in the Discord channel if there is anything you need to make Plugins even more powerful.

***

## Chain your Plugin

Finally, as with Pages Functions generally, it is possible to chain together Plugins in order to combine together different features. Middleware defined higher up in the filesystem will run before other handlers, and individual files can chain together Functions in an array like so:

```typescript
import sentryPlugin from "@cloudflare/pages-plugin-sentry";
import cloudflareAccessPlugin from "@cloudflare/pages-plugin-cloudflare-access";
import adminDashboardPlugin from "@cloudflare/a-fictional-admin-plugin";

export const onRequest = [
  // Initialize a Sentry Plugin to capture any errors
  sentryPlugin({ dsn: "https://sentry.io/welcome/xyz" }),

  // Initialize a Cloudflare Access Plugin to ensure only administrators can access this protected route
  cloudflareAccessPlugin({
    domain: "https://test.cloudflareaccess.com",
    aud: "4714c1358e65fe4b408ad6d432a5f878f08194bdb4752441fd56faefa9b2b6f2",
  }),

  // Populate the Sentry plugin with additional information about the current user
  (context) => {
    const email = context.data.cloudflareAccessJWT.payload?.email || "service user";

    context.data.sentry.setUser({ email });

    return next();
  },

  // Finally, serve the admin dashboard plugin, knowing that errors will be captured and that every incoming request has been authenticated
  adminDashboardPlugin(),
];
```

---

# Sentry

URL: https://developers.cloudflare.com/pages/functions/plugins/sentry/

:::note

Sentry now provides official support for Cloudflare Workers and Pages. Refer to the [Sentry documentation](https://docs.sentry.io/platforms/javascript/guides/cloudflare/) for more details.

:::

The Sentry Pages Plugin captures and logs all exceptions which occur below it in the execution chain of your Pages Functions. It is therefore recommended that you install this Plugin at the root of your application in `functions/_middleware.ts` as the very first Plugin.

## Installation

```sh
npm install @cloudflare/pages-plugin-sentry
```

## Usage

```typescript
import sentryPlugin from "@cloudflare/pages-plugin-sentry";

export const onRequest: PagesFunction = sentryPlugin({
	dsn: "https://sentry.io/welcome/xyz",
});
```

The Plugin uses [Toucan](https://github.com/robertcepa/toucan-js). Refer to the Toucan README to [review the options it can take](https://github.com/robertcepa/toucan-js#other-options). `context`, `request`, and `event` are automatically populated and should not be manually configured.

If your [DSN](https://docs.sentry.io/product/sentry-basics/dsn-explainer/) is held as an environment variable or in KV, you can access it like so:

```typescript
import sentryPlugin from "@cloudflare/pages-plugin-sentry";

export const onRequest: PagesFunction<{
	SENTRY_DSN: string;
}> = (context) => {
	return sentryPlugin({ dsn: context.env.SENTRY_DSN })(context);
};
```

```typescript
import sentryPlugin from "@cloudflare/pages-plugin-sentry";

export const onRequest: PagesFunction<{
	KV: KVNamespace;
}> = async (context) => {
	return sentryPlugin({ dsn: await context.env.KV.get("SENTRY_DSN") })(context);
};
```

### Additional context

If you need to set additional context for Sentry (for example, user information or additional logs), use the `data.sentry` instance in any Function below the Plugin in the execution chain.

For example, you can access `data.sentry` and set user information like so:

```typescript
import type { PluginData } from "@cloudflare/pages-plugin-sentry";

export const onRequest: PagesFunction<unknown, any, PluginData> = async ({
	data,
	next,
}) => {
	// Authenticate the user from the request and extract user's email address
	const email = await getEmailFromRequest(request);

	data.sentry.setUser({ email });

	return next();
};
```

Again, the full list of features can be found in [Toucan's documentation](https://github.com/robertcepa/toucan-js#features).

---

# Static Forms

URL: https://developers.cloudflare.com/pages/functions/plugins/static-forms/

The Static Forms Pages Plugin intercepts all form submissions made which have the `data-static-form-name` attribute set. This allows you to take action on these form submissions by, for example, saving the submission to KV.

## Installation

```sh
npm install @cloudflare/pages-plugin-static-forms
```

## Usage

```typescript
import staticFormsPlugin from "@cloudflare/pages-plugin-static-forms";

export const onRequest: PagesFunction = staticFormsPlugin({
	respondWith: ({ formData, name }) => {
		const email = formData.get("email");
		return new Response(
			`Hello, ${email}! Thank you for submitting the ${name} form.`,
		);
	},
});
```

```html
<body>
	<h1>Sales enquiry</h1>
	<form data-static-form-name="sales">
		<label>Email address <input type="email" name="email" /></label>
		<label>Message <textarea name="message"></textarea></label>
		<button type="submit">Submit</button>
	</form>
</body>
```

The Plugin takes a single argument, an object with a `respondWith` property. This function takes an object with a `formData` property (the [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) instance) and `name` property (the name value of your `data-static-form-name` attribute). It should return a `Response` or `Promise` of a `Response`. It is in this `respondWith` function that you can take action such as serializing the `formData` and saving it to a KV namespace.

The `method` and `action` attributes of the HTML form do not need to be set. The Plugin will automatically override them to allow it to intercept the submission.

---

# Turnstile

URL: https://developers.cloudflare.com/pages/functions/plugins/turnstile/

[Turnstile](/turnstile/) is Cloudflare's smart CAPTCHA alternative.

The Turnstile Pages Plugin validates Cloudflare Turnstile tokens.

## Installation

```sh
npm install @cloudflare/pages-plugin-turnstile
```

## Usage

```typescript
import turnstilePlugin from "@cloudflare/pages-plugin-turnstile";

/**
 * POST /api/submit-with-plugin
 */

export const onRequestPost = [
	turnstilePlugin({
		// This is the demo secret key. In prod, we recommend you store
		// your secret key(s) safely.
		secret: "0x4AAAAAAASh4E5cwHGsTTePnwcPbnFru6Y",
	}),
	// Alternatively, this is how you can use a secret key which has been stored as an environment variable
	// (async (context) => {
	//   return turnstilePlugin({secret: context.env.SECRET_KEY})(context)
	// }),
	async (context) => {
		// Request has been validated as coming from a human
		const formData = await context.request.formData();
		// Additional solve metadata data is available at context.data.turnstile
		return new Response(
			`Successfully verified! ${JSON.stringify(context.data.turnstile)}`,
		);
	},
];
```

This Plugin only exposes a single route to verify an incoming Turnstile response in a `POST` as the `cf-turnstile-response` parameter. It will be available wherever it is mounted. In the example above, it is mounted in `functions/register.ts`. As a result, it will validate requests to `/register`.

## Properties

The Plugin is mounted with a single object parameter with the following properties:

[`secret`](https://dash.cloudflare.com/login) is mandatory and can both be found in your Turnstile dashboard.

`response` and `remoteip` are optional strings. `response` is the Turnstile token to verify. If it is not provided, the plugin will default to extracting `cf-turnstile-response` value from a `multipart/form-data` request). `remoteip` is the requester's IP address. This defaults to the `CF-Connecting-IP` header of the request.

`onError` is an optional function which takes the Pages Function context object and returns a `Promise` of a `Response`. By default, it will return a human-readable error `Response`.

`context.data.turnstile` will be populated in subsequent Pages Functions (including for the `onError` function) with [the Turnstile siteverify response object](/turnstile/get-started/server-side-validation/).

---

# vercel/og

URL: https://developers.cloudflare.com/pages/functions/plugins/vercel-og/

The `@vercel/og` Pages Plugin is a middleware which renders social images for webpages. It also includes an API to create arbitrary images.

As the name suggests, it is powered by [`@vercel/og`](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation). This plugin and its underlying [Satori](https://github.com/vercel/satori) library was created by the Vercel team.

## Install

To install the `@vercel/og` Pages Plugin, run:

```sh
npm install @cloudflare/pages-plugin-vercel-og
```

## Use

```typescript
import React from "react";
import vercelOGPagesPlugin from "@cloudflare/pages-plugin-vercel-og";

interface Props {
	ogTitle: string;
}

export const onRequest = vercelOGPagesPlugin<Props>({
	imagePathSuffix: "/social-image.png",
	component: ({ ogTitle, pathname }) => {
		return <div style={{ display: "flex" }}>{ogTitle}</div>;
	},
	extractors: {
		on: {
			'meta[property="og:title"]': (props) => ({
				element(element) {
					props.ogTitle = element.getAttribute("content");
				},
			}),
		},
	},
	autoInject: {
		openGraph: true,
	},
});
```

The Plugin takes an object with six properties:

- `imagePathSuffix`: the path suffix to make the generate image available at. For example, if you mount this Plugin at `functions/blog/_middleware.ts`, set the `imagePathSuffix` as `/social-image.png` and have a `/blog/hello-world` page, the image will be available at `/blog/hello-world/social-image.png`.

- `component`: the React component that will be used to render the image. By default, the React component is given a `pathname` property equal to the pathname of the underlying webpage (for example, `/blog/hello-world`), but more dynamic properties can be provided with the `extractors` option.

- `extractors`: an optional object with two optional properties: `on` and `onDocument`. These properties can be set to a function which takes an object and returns a [`HTMLRewriter` element handler](/workers/runtime-apis/html-rewriter/#element-handlers) or [document handler](/workers/runtime-apis/html-rewriter/#document-handlers) respectively. The object parameter can be mutated in order to provide the React component with additional properties. In the example above, you will use an element handler to extract the `og:title` meta tag from the webpage and pass that to the React component as the `ogTitle` property. This is the primary mechanism you will use to create dynamic images which use values from the underlying webpage.

- `options`: [an optional object which is given directly to the `@vercel/og` library](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation/og-image-api).

- `onError`: an optional function which returns a `Response` or a promise of a `Response`. This function is called when a request is made to the `imagePathSuffix` and `extractors` are provided but the underlying webpage is not valid HTML. Defaults to returning a `404` response.

- `autoInject`: an optional object with an optional property: `openGraph`. If set to `true`, the Plugin will automatically set the `og:image`, `og:image:height` and `og:image:width` meta tags on the underlying webpage.

### Generate arbitrary images

Use this Plugin's API to generate arbitrary images, not just as middleware.

For example, the below code will generate an image saying "Hello, world!" which is available at `/greet`.

```typescript
import React from "react";
import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";

export const onRequest: PagesFunction = async () => {
  return new ImageResponse(
    <div style={{ display: "flex" }}>Hello, world!</div>,
    {
      width: 1200,
      height: 630,
    }
  );
};
```

This is the same API that the underlying [`@vercel/og` library](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation/og-image-api) offers.

---

# Stytch

URL: https://developers.cloudflare.com/pages/functions/plugins/stytch/

The Stytch Pages Plugin is a middleware which validates all requests and their `session_token`.

## Installation

```sh
npm install @cloudflare/pages-plugin-stytch
```

## Usage

```typescript
import stytchPlugin from "@cloudflare/pages-plugin-stytch";
import { envs } from "@cloudflare/pages-plugin-stytch/api";

export const onRequest: PagesFunction = stytchPlugin({
	project_id: "YOUR_STYTCH_PROJECT_ID",
	secret: "YOUR_STYTCH_PROJECT_SECRET",
	env: envs.live,
});
```

We recommend storing your secret in KV rather than in plain text as above.

The Stytch Plugin takes a single argument, an object with several properties. `project_id` and `secret` are mandatory strings and can be found in [Stytch's dashboard](https://stytch.com/dashboard/api-keys). `env` is also a mandatory string, and can be populated with the `envs.test` or `envs.live` variables in the API. By default, the Plugin validates a `session_token` cookie of the incoming request, but you can also optionally pass in a `session_token` or `session_jwt` string yourself if you are using some other mechanism to identify user sessions. Finally, you can also pass in a `session_duration_minutes` in order to extend the lifetime of the session. More information on these parameters can be found in [Stytch's documentation](https://stytch.com/docs/api/session-auth).

The validated session response containing user information is made available to subsequent Pages Functions on `data.stytch.session`.

---

# Static site

URL: https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/

import { PagesBuildPreset, Render } from "~/components";

:::note

Do not use this guide unless you have a specific use case for static exports. Cloudflare recommends using the [Deploy a Next.js site](/pages/framework-guides/nextjs/ssr/get-started/) guide.

:::

[Next.js](https://nextjs.org) is an open-source React framework for creating websites and applications. In this guide, you will create a new Next.js application and deploy it using Cloudflare Pages.

This guide will instruct you how to deploy a static site Next.js project with [static exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports).

<Render file="tutorials-before-you-start" />

## Select your Next.js project

If you already have a Next.js project that you wish to deploy, ensure that it is [configured for static exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports), change to its directory, and proceed to the next step. Otherwise, use `create-next-app` to create a new Next.js project.

```sh
npx create-next-app --example with-static-export my-app
```

After creating your project, a new `my-app` directory will be generated using the official [`with-static-export`](https://github.com/vercel/next.js/tree/canary/examples/with-static-export) example as a template. Change to this directory to continue.

```sh
cd my-app
```

### Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git remote add origin https://github.com/<GH_USERNAME>/<REPOSITORY_NAME>.git
git branch -M main
git push -u origin main
```

### Deploy your application to Cloudflare Pages

<Render
	file="deploy-to-pages-steps-with-preset"
	params={{ name: "Next.js (Static HTML Export)" }}
/>

<PagesBuildPreset framework="next-js-static" />

After configuring your site, you can begin your first deploy. Cloudflare Pages will install `next`, your project dependencies, and build your site before deploying it.

## Preview your site

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.

Every time you commit new code to your Next.js site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](/pages/get-started/).

---

# Next.js

URL: https://developers.cloudflare.com/pages/framework-guides/nextjs/

import { DirectoryListing, Stream } from "~/components"

[Next.js](https://nextjs.org) is an open-source React framework for creating websites and applications.

### Video Tutorial

<Stream id="0b28fdd5938c4929bd7fdedcd167044d" title="Deploy NextJS to your Workers Application" thumbnail="2.5s" />

<DirectoryListing />

---

# Resources

URL: https://developers.cloudflare.com/pages/framework-guides/nextjs/resources/

import { ResourcesBySelector, ExternalResources } from "~/components"

## Demo apps

For demo applications using Next.js, refer to the following resources:

<ExternalResources tags={["NextJS"]} type="apps" />

---

# Migrating from Netlify to Pages

URL: https://developers.cloudflare.com/pages/migrations/migrating-from-netlify/

In this tutorial, you will learn how to migrate your Netlify application to Cloudflare Pages.

## Finding your build command and build directory

To move your application to Cloudflare Pages, find your build command and build directory. Cloudflare Pages will use this information to build and deploy your application.

In your Netlify Dashboard, find the project that you want to deploy. It should be configured to deploy from a GitHub repository.

![Selecting a site in the Netlify Dashboard](~/assets/images/pages/migrations/netlify-deploy-1.png)

Inside of your site dashboard, select **Site Settings**, and then **Build & Deploy**.

![Selecting Site Settings in site dashboard](~/assets/images/pages/migrations/netlify-deploy-2.png)

![Selecting Build and Deploy in sidebar](~/assets//images/pages/migrations/netlify-deploy-3.png)

In the **Build & Deploy** tab, find the **Build settings** panel, which will have the **Build command** and **Publish directory** fields. Save these for deploying to Cloudflare Pages. In the below image, **Build command** is `yarn build`, and **Publish directory** is `build/`.

![Finding the Build command and Publish directory fields](~/assets/images/pages/migrations/netlify-deploy-4.png)

## Migrating redirects and headers

If your site includes a `_redirects` file in your publish directory, you can use the same file in Cloudflare Pages and your redirects will execute successfully. If your redirects are in your `netlify.toml` file, you will need to add them to the `_redirects` folder. Cloudflare Pages currently offers limited [supports for advanced redirects](/pages/configuration/redirects/). In the case where you have over 2000 static and/or 100 dynamic redirects rules, it is recommended to use [Bulk Redirects](/rules/url-forwarding/bulk-redirects/create-dashboard/).

Your header files can also be moved into a `_headers` folder in your publish directory. It is important to note that custom headers defined in the `_headers` file are not currently applied to responses from functions, even if the function route matches the URL pattern. To learn more about how to [handle headers, refer to Headers](/pages/configuration/headers/).

:::note

Redirects execute before headers. In the case of a request matching rules in both files, the redirect will take precedence.

:::

## Forms

In your form component, remove the `data-netlify = "true"` attribute or the Netlify attribute from the `<form>` tag. You can now put your form logic as a Pages Function and collect the entries to a database or an Airtable. Refer to the [handling form submissions with Pages Functions](/pages/tutorials/forms/) tutorial for more information.

## Serverless functions

Netlify functions and Pages Functions share the same filesystem convention using a `functions` directory in the base of your project to handle your serverless functions. However, the syntax and how the functions are deployed differs. Pages Functions run on Cloudflare Workers, which by default operate on the Cloudflare global network, and do not require any additional code or configuration for deployment.

Cloudflare Pages Functions also provides middleware that can handle any logic you need to run before and/or after your function route handler.

### Functions syntax

Netlify functions export an async event handler that accepts an event and a context as arguments. In the case of Pages Functions, you will have to export a single `onRequest` function that accepts a `context` object. The `context` object contains all the information for the request such as `request`, `env`, `params`, and returns a new Response. Learn more about [writing your first function](/pages/functions/get-started/)

Hello World with Netlify functions:

```js
exports.handler = async function (event, context) {
	return {
		statusCode: 200,
		body: JSON.stringify({ message: "Hello World" }),
	};
};
```

Hello World with Pages Functions:

```js
export async function onRequestPost(request) {
	return new Response(`Hello world`);
}
```

## Other Netlify configurations

Your `netlify.toml` file might have other configurations that are supported by Pages, such as, preview deployment, specifying publish directory, and plugins. You can delete the file after migrating your configurations.

## Access management

You can migrate your access management to [Cloudflare Zero Trust](/cloudflare-one/) which allows you to manage user authentication for your applications, event logging and requests.

## Creating a new Pages project

Once you have found your build directory and build command, you can move your project to Cloudflare Pages.

The [Get started guide](/pages/get-started/) will instruct you how to add your GitHub project to Cloudflare Pages.

If you choose to use a custom domain for your Pages, you can set it to the same custom domain as your currently deployed Netlify application. To assign a custom domain to your Pages project, refer to [Custom Domains](/pages/configuration/custom-domains/).

## Cleaning up your old application and assigning the domain

In the Cloudflare dashboard, go to **DNS** > **Records** and review that you have updated the CNAME record for your domain from Netlify to Cloudflare Pages. With your DNS record updated, requests will go to your Pages application.

In **DNS**, your record's **Content** should be your `<SUBDOMAIN>.pages.dev` subdomain.

With the above steps completed, you have successfully migrated your Netlify project to Cloudflare Pages.

---

# Migrating from Vercel to Pages

URL: https://developers.cloudflare.com/pages/migrations/migrating-from-vercel/

import { Render } from "~/components";

In this tutorial, you will learn how to deploy your Vercel application to Cloudflare Pages.

You should already have an existing project deployed on Vercel that you would like to host on Cloudflare Pages. Features such as Vercel's serverless functions are currently not supported in Cloudflare Pages.

## Find your build command and build directory

To move your application to Cloudflare Pages, you will need to find your build command and build directory. Cloudflare Pages will use this information to build your application and deploy it.

In your Vercel Dashboard, find the project that you want to deploy. It should be configured to deploy from a GitHub repository.

![Selecting a site in the Vercel Dashboard](~/assets/images/pages/migrations/vercel-deploy-1.png)

Inside of your site dashboard, select **Settings**, then **General**.

![Selecting Site Settings in site dashboard](~/assets/images/pages/migrations/vercel-deploy-2.png)

Find the **Build & Development settings** panel, which will have the **Build Command** and **Output Directory** fields. If you are using a framework, these values may not be filled in, but will show the defaults used by the framework. Save these for deploying to Cloudflare Pages. In the below image, the **Build Command** is `npm run build`, and the **Output Directory** is `build`.

![Finding the Build Command and Output Directory fields](~/assets/images/pages/migrations/vercel-deploy-3.png)

## Create a new Pages project

After you have found your build directory and build command, you can move your project to Cloudflare Pages.

The [Get started guide](/pages/get-started/) will instruct you how to add your GitHub project to Cloudflare Pages.

## Add a custom domain

Next, connect a [custom domain](/pages/configuration/custom-domains/) to your Pages project. This domain should be the same one as your currently deployed Vercel application.

### Change domain nameservers

In most cases, you will want to [add your domain to Cloudflare](/dns/zone-setups/full-setup/setup/).

This does involve changing your domain nameservers, but simplifies your Pages setup and allows you to use an apex domain for your project (like `example.com`).

If you want to take a different approach, read more about [custom domains](/pages/configuration/custom-domains/).

### Set up custom domain

<Render file="custom-domain-steps" />

The next steps vary based on if you [added your domain to Cloudflare](#change-domain-nameservers):

- **Added to Cloudflare**: Cloudflare will set everything up for you automatically and your domain will move to an `Active` status.
- **Not added to Cloudflare**: You need to [update some DNS records](/pages/configuration/custom-domains/#add-a-custom-subdomain) at your DNS provider to finish your setup.

## Delete your Vercel app

Once your custom domain is set up and sending requests to Cloudflare Pages, you can safely delete your Vercel application.

## Troubleshooting

Cloudflare does not provide IP addresses for your Pages project because we do not require `A` or `AAAA` records to link your domain to your project. Instead, Cloudflare uses `CNAME` records.

For more details, refer to [Custom domains](/pages/configuration/custom-domains/).

---

# Migrating from Workers Sites to Pages

URL: https://developers.cloudflare.com/pages/migrations/migrating-from-workers/

In this tutorial, you will learn how to migrate an existing [Cloudflare Workers Sites](/workers/configuration/sites/) application to Cloudflare Pages.

As a prerequisite, you should have a Cloudflare Workers Sites project, created with [Wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler).

Cloudflare Pages provides built-in defaults for every aspect of serving your site. You can port custom behavior in your Worker â€” such as custom caching logic â€” to your Cloudflare Pages project using [Functions](/pages/functions/). This enables an easy-to-use, file-based routing system. You can also migrate your custom headers and redirects to Pages.

You may already have a reasonably complex Worker and/or it would be tedious to splice it up into Pages' file-based routing system. For these cases, Pages offers developers the ability to define a `_worker.js` file in the output directory of your Pages project.

:::note

When using a `_worker.js` file, the entire `/functions` directory is ignored - this includes its routing and middleware characteristics. Instead, the `_worker.js` file is deployed as is and must be written using the [Module Worker syntax](/workers/reference/migrate-to-module-workers/).

:::

By migrating to Cloudflare Pages, you will be able to access features like [preview deployments](/pages/configuration/preview-deployments/) and automatic branch deploys with no extra configuration needed.

## Remove unnecessary code

Workers Sites projects consist of the following pieces:

1. An application built with a [static site tool](/pages/how-to/) or a static collection of HTML, CSS and JavaScript files.
2. If using a static site tool, a build directory (called `bucket` in the [Wrangler configuration file](/pages/functions/wrangler-configuration/)) where the static project builds your HTML, CSS, and JavaScript files.
3. A Worker application for serving that build directory. For most projects, this is likely to be the `workers-site` directory.

When moving to Cloudflare Pages, remove the Workers application and any associated Wrangler configuration files or build output. Instead, note and record your `build` command (if you have one), and the `bucket` field, or build directory, from the Wrangler file in your project's directory.

## Migrate headers and redirects

You can migrate your redirects to Pages, by creating a `_redirects` file in your output directory. Pages currently offers limited support for advanced redirects. More support will be added in the future. For a list of support types, refer to the [Redirects documentation](/pages/configuration/redirects/).

:::note

A project is limited to 2,000 static redirects and 100 dynamic redirects, for a combined total of 2,100 redirects. Each redirect declaration has a 1,000-character limit. Malformed definitions are ignored. If there are multiple redirects for the same source path, the topmost redirect is applied.

Make sure that static redirects are before dynamic redirects in your `_redirects` file.

:::

In addition to a `_redirects` file, Cloudflare also offers [Bulk Redirects](/pages/configuration/redirects/#surpass-_redirects-limits), which handles redirects that surpasses the 2,100 redirect rules limit set by Pages.

Your custom headers can also be moved into a `_headers` file in your output directory. It is important to note that custom headers defined in the `_headers` file are not currently applied to responses from Functions, even if the Function route matches the URL pattern. To learn more about handling headers, refer to [Headers](/pages/configuration/headers/).

## Create a new Pages project

### Connect to your git provider

After you have recorded your **build command** and **build directory** in a separate location, remove everything else from your application, and push the new version of your project up to your git provider. Follow the [Get started guide](/pages/get-started/) to add your project to Cloudflare Pages, using the **build command** and **build directory** that you saved earlier.

If you choose to use a custom domain for your Pages project, you can set it to the same custom domain as your currently deployed Workers application. Follow the steps for [adding a custom domain](/pages/configuration/custom-domains/#add-a-custom-domain) to your Pages project.

:::note

Before you deploy, you will need to delete your old Workers routes to start sending requests to Cloudflare Pages.

:::

### Using Direct Upload

If your Workers site has its custom build settings, you can bring your prebuilt assets to Pages with [Direct Upload](/pages/get-started/direct-upload/). In addition, you can serve your website's assets right to the Cloudflare global network by either using the [Wrangler CLI](/workers/wrangler/install-and-update/) or the drag and drop option.

These options allow you to create and name a new project from the CLI or dashboard. After your project deployment is complete, you can set the custom domain by following the [adding a custom domain](/pages/configuration/custom-domains/#add-a-custom-domain) steps to your Pages project.

## Cleaning up your old application and assigning the domain

After you have deployed your Pages application, to delete your Worker:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/) and select your account.
2. Go to **Workers & Pages** and in **Overview**, select your Worker.
3. Go to **Manage** > **Delete Worker**.

With your Workers application removed, requests will go to your Pages application. You have successfully migrated your Workers Sites project to Cloudflare Pages by completing this guide.

---

# Add a React form with Formspree

URL: https://developers.cloudflare.com/pages/tutorials/add-a-react-form-with-formspree/

Almost every React website needs a form to collect user data. [Formspree](https://formspree.io/) is a back-end service that handles form processing and storage, allowing developers to include forms on their website without writing server-side code or functions.

In this tutorial, you will create a `<form>` component using React and add it to a single page application built with `create-react-app`. Though you are using `create-react-app` (CRA), the concepts will apply to any React framework including Next.js, Gatsby, and more. You will use Formspree to collect the submitted data and send out email notifications when new submissions arrive, without requiring any server-side coding.

You will deploy your site to Cloudflare Pages. Refer to the [Get started guide](/pages/get-started/) to familiarize yourself with the platform.

## Setup

To begin, create a new React project on your local machine with `create-react-app`. Then create a [new GitHub repository](https://repo.new/), and attach the GitHub location as a remote destination:

```sh
# create new project with create-react-app
npx create-react-app new-app
# enter new directory
cd new-app
# attach git remote
git remote add origin git@github.com:<username>/<repo>.git
# change default branch name
git branch -M main
```

You may now modify the React application in the `new-app` directory you created.

## The front-end code

The starting point for `create-react-app` includes a simple Hello World website. You will be adding a Contact Us form that accepts a name, email address, and message. The form code is adapted from the HTML Forms tutorial. For a more in-depth explanation of how HTML forms work and additional learning resources, refer to the [HTML Forms tutorial](/pages/tutorials/forms/).

First, create a new react component called `ContactForm.js` and place it in the `src` folder alongside `App.js`.

```
project-root/
â”œâ”€ package.json
â””â”€ src/
   â”œâ”€ ContactForm.js
   â”œâ”€ App.js
   â””â”€ ...
```

Next, you will build the form component using a helper library from Formspree, [`@formspree/react`](https://github.com/formspree/formspree-react). This library contains a `useForm` hook to simplify the process of handling form submission events and managing form state.

Install it with:

```sh
npm install --save @formspree/react
```

Then paste the following code snippet into the `ContactForm.js` file:

```jsx
import { useForm, ValidationError } from "@formspree/react";

export default function ContactForm() {
	const [state, handleSubmit] = useForm("YOUR_FORM_ID");

	if (state.succeeded) {
		return <p>Thanks for your submission!</p>;
	}

	return (
		<form method="POST" onSubmit={handleSubmit}>
			<label htmlFor="name">Full Name</label>
			<input id="name" type="text" name="name" required />
			<ValidationError prefix="Name" field="name" errors={state.errors} />

			<label htmlFor="email">Email Address</label>
			<input id="email" type="email" name="email" required />
			<ValidationError prefix="Email" field="email" errors={state.errors} />

			<label htmlFor="message">Message</label>
			<textarea id="message" name="message" required></textarea>
			<ValidationError prefix="Message" field="message" errors={state.errors} />

			<button type="submit" disabled={state.submitting}>
				Submit
			</button>
			<ValidationError errors={state.errors} />
		</form>
	);
}
```

Currently, the form contains a placeholder `YOUR_FORM_ID`. You replace this with your own form endpoint later in this tutorial.

The `useForm` hook returns a `state` object and a `handleSubmit` function which you pass to the `onSubmit` form attribute. Combined, these provide a way to submit the form data via AJAX and update form state depending on the response received.

For clarity, this form does not include any styling, but in the GitHub project ([https://github.com/formspree/formspree-example-cloudflare-react](https://github.com/formspree/formspree-example-cloudflare-react)) you can review an example of how to apply styles to the form.

:::note

`ValidationError` components are helpers that display error messages for field errors, or general form errors (if no `field` attribute is provided). For more information on validation, refer to the [Formspree React documentation](https://help.formspree.io/hc/en-us/articles/360055613373-The-Formspree-React-library#validation).

:::

To add this form to your website, import the component:

```jsx
import ContactForm from "./ContactForm";
```

Then insert the form into the page as a react component:

```jsx
<ContactForm />
```

For example, you can update your `src/App.js` file to add the form:

```jsx
import ContactForm from "./ContactForm"; // <-- import the form component
import logo from "./logo.svg";
import "./App.css";

function App() {
	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<p>
					Edit <code>src/App.js</code> and save to reload.
				</p>
				<a
					className="App-link"
					href="https://reactjs.org"
					target="_blank"
					rel="noopener noreferrer"
				>
					Learn React
				</a>

				{/* your contact form component goes here */}
				<ContactForm />
			</header>
		</div>
	);
}

export default App;
```

Now you have a single-page application containing a Contact Us form with several fields for the user to fill out. However, you have not set up the form to submit to a valid form endpoint yet. You will do that in the [next section](#the-formspree-back-end).

:::note[GitHub repository]

The source code for this example is [available on GitHub](https://github.com/formspree/formspree-example-cloudflare-react). It is a live Pages application with a [live demo](https://formspree-example-cloudflare-react.pages.dev/) available, too.

:::

## The Formspree back end

The React form is complete, however, when the user submits this form, they will get a `Form not found` error. To fix this, create a new Formspree form, and copy its unique ID into the form's `useForm` invocation.

To create a Formspree form, sign up for [an account on Formspree](https://formspree.io/register). Then create a new form with the **+ New form** button. Name your new form `Contact-us form` and update the recipient email to an email where you wish to receive your form submissions. Finally, select **Create Form**.

![Creating a Formspree form](~/assets/images/pages/tutorials/react-new-form-dialog.png)

You will be presented with instructions on how to integrate your new form. Copy the formâ€™s `hashid` (the last 8 alphanumeric characters from the URL) and paste it into the `useForm` function in the `ContactForm` component you created above.

![Newly generated form endpoint that you can copy to use in the ContactForm component](~/assets/images/pages/tutorials/react-form-endpoint.png)

Your component should now have a line like this:

```jsx
const [state, handleSubmit] = useForm("mqldaqwx");

/* replace the random-like string above with your own form's ID */
```

Now when you submit your form, you should be shown a Thank You message. The form data will be submitted to your account on [Formspree.io](https://formspree.io/).

From here you can adjust your form processing logic to update the [notification email address](https://help.formspree.io/hc/en-us/articles/115008379348-Changing-a-form-email-address), or add plugins like [Google Sheets](https://help.formspree.io/hc/en-us/articles/360036563573-Use-Google-Sheets-to-send-your-submissions-to-a-spreadsheet), [Slack](https://help.formspree.io/hc/en-us/articles/360045648933-Send-Slack-notifications), and more.

For more help setting up Formspree, refer to the following resources:

- For general help with Formspree, refer to the [Formspree help site](https://help.formspree.io/hc/en-us).
- For more help creating forms in React, refer to the [formspree-react documentation](https://help.formspree.io/hc/en-us/articles/360055613373-The-Formspree-React-library)
- For tips on integrating Formspree with popular platforms like Next.js, Gatsby and Eleventy, refer to the [Formspree guides](https://formspree.io/guides).

## Deployment

You are now ready to deploy your project.

If you have not already done so, save your progress within `git` and then push the commit(s) to the GitHub repository:

```sh
# Add all files
git add -A
# Commit w/ message
git commit -m "working example"
# Push commit(s) to remote
git push -u origin main
```

Your work now resides within the GitHub repository, which means that Pages is able to access it too.

If this is your first Cloudflare Pages project, refer to the [Get started guide](/pages/get-started/) for a complete walkthrough. After selecting the appropriate GitHub repository, you must configure your project with the following build settings:

- **Project name** â€“ Your choice
- **Production branch** â€“ `main`
- **Framework preset** â€“ Create React App
- **Build command** â€“ `npm run build`
- **Build output directory** â€“ `build`

After selecting **Save and Deploy**, your Pages project will begin its first deployment. When successful, you will be presented with a unique `*.pages.dev` subdomain and a link to your live demo.

## Using environment variables with forms

Sometimes it is helpful to set up two forms, one for development, and one for production. That way you can develop and test your form without corrupting your production dataset, or sending test notifications to clients.

To set up production and development forms first create a second form in Formspree. Name this form Contact Us Testing, and note the form's [`hashid`](https://help.formspree.io/hc/en-us/articles/360015130174-Getting-your-form-s-hashid-).

Then change the `useForm` hook in your `ContactForm.js` file so that it is initialized with an environment variable, rather than a string:

```jsx
const [state, handleSubmit] = useForm(process.env.REACT_APP_FORM_ID);
```

In your Cloudflare Pages project settings, add the `REACT_APP_FORM_ID` environment variable to both the Production and Preview environments. Use your original form's `hashid` for Production, and the new test form's `hashid` for the Preview environment:

![Edit option for environment variables in your Production and Preview environments](~/assets/images/pages/tutorials/env-vars.png)

Now, when you commit and push changes to a branch of your git repository, a new preview app will be created with a form that submits to the test form URL. However, your production website will continue to submit to the original form URL.

:::note

Create React App uses the prefix `REACT_APP_` to designate environment variables that are accessible to front-end JavaScript code. A different framework will use a different prefix to expose environment variables. For example, in the case of Next.js, the prefix is `NEXT_PUBLIC_`. Consult the documentation of your front-end framework to determine how to access environment variables from your React code.

:::

In this tutorial, you built and deployed a website using Cloudflare Pages and Formspree to handle form submissions. You created a React application with a form that communicates with Formspree to process and store submission requests and send notifications.

If you would like to review the full source code for this application, you can find it on [GitHub](https://github.com/formspree/formspree-example-cloudflare-react).

## Related resources

- [Add an HTML form with Formspree](/pages/tutorials/add-an-html-form-with-formspree/)
- [HTML Forms](/pages/tutorials/forms/)

---

# Add an HTML form with Formspree

URL: https://developers.cloudflare.com/pages/tutorials/add-an-html-form-with-formspree/

Almost every website, whether it is a simple HTML portfolio page or a complex JavaScript application, will need a form to collect user data. [Formspree](https://formspree.io) is a back-end service that handles form processing and storage, allowing developers to include forms on their website without writing server-side code or functions.

In this tutorial, you will create a `<form>` using plain HTML and CSS and add it to a static HTML website hosted on Cloudflare Pages. Refer to the [Get started guide](/pages/get-started/) to familiarize yourself with the platform. You will use Formspree to collect the submitted data and send out email notifications when new submissions arrive, without requiring any JavaScript or back-end coding.

## Setup

To begin, create a [new GitHub repository](https://repo.new/). Then create a new local directory on your machine, initialize git, and attach the GitHub location as a remote destination:

```sh
# create new directory
mkdir new-project
# enter new directory
cd new-project
# initialize git
git init
# attach remote
git remote add origin git@github.com:<username>/<repo>.git
# change default branch name
git branch -M main
```

You may now begin working in the `new-project` directory you created.

## The website markup

You will only be using plain HTML for this example project. The home page will include a Contact Us form that accepts a name, email address, and message.

:::note

The form code is adapted from the HTML Forms tutorial. For a more in-depth explanation of how HTML forms work and additional learning resources, refer to the [HTML Forms tutorial](/pages/tutorials/forms/).

:::

The form code:

```html
<form method="POST" action="/">
	<label for="name">Full Name</label>
	<input id="name" type="text" name="name" pattern="[A-Za-z]+" required />

	<label for="email">Email Address</label>
	<input id="email" type="email" name="email" required />

	<label for="message">Message</label>
	<textarea id="message" name="message" required></textarea>

	<button type="submit">Submit</button>
</form>
```

The `action` attribute determines where the form data is sent. You will update this later to send form data to Formspree. All `<input>` tags must have a unique `name` in order to capture the user's data. The `for` and `id` values must match in order to link the `<label>` with the corresponding `<input>` for accessibility tools like screen readers.

:::note

Refer to the [HTML Forms tutorial](/pages/tutorials/forms/) on how to build an HTML form.

:::

To add this form to your website, first, create a `public/index.html` in your project directory. The `public` directory should contain all front-end assets, and the `index.html` file will serve as the home page for the website.

Copy and paste the following content into your `public/index.html` file, which includes the above form:

```html
<html lang="en">
	<head>
		<meta charset="utf8" />
		<title>Form Demo</title>
		<meta name="viewport" content="width=device-width,initial-scale=1" />
	</head>
	<body>
		<!-- the form from above -->

		<form method="POST" action="/">
			<label for="name">Full Name</label>
			<input id="name" type="text" name="name" pattern="[A-Za-z]+" required />

			<label for="email">Email Address</label>
			<input id="email" type="email" name="email" required />

			<label for="message">Message</label>
			<textarea id="message" name="message" required></textarea>

			<button type="submit">Submit</button>
		</form>
	</body>
</html>
```

Now you have an HTML document containing a Contact Us form with several fields for the user to fill out. However, you have not yet set the `action` attribute to a server that can handle the form data. You will do this in the next section of this tutorial.

:::note[GitHub Repository]

The source code for this example is [available on GitHub](https://github.com/formspree/formspree-example-cloudflare-html). It is a live Pages application with a [live demo](https://formspree-example-cloudflare-html.pages.dev/) available, too.

:::

## The Formspree back end

The HTML form is complete, however, when the user submits this form, the data will be sent in a `POST` request to the `/` URL. No server exists to process the data at that URL, so it will cause an error. To fix that, create a new Formspree form, and copy its unique URL into the form's `action`.

To create a Formspree form, sign up for [an account on Formspree](https://formspree.io/register).

Next, create a new form with the **+ New form** button. Name it `Contact-us form` and update the recipient email to an email where you wish to receive your form submissions. Then select **Create Form**.

![Creating a Formspree form](~/assets/images/pages/tutorials/new-form-dialog.png)

You will then be presented with instructions on how to integrate your new form.

![Formspree endpoint](~/assets/images/pages/tutorials/form-endpoint.png)

Copy the `Form Endpoint` URL and paste it into the `action` attribute of the form you created above.

```html
<form method="POST" action="https://formspree.io/f/mqldaqwx">
	<!-- replace with your own formspree endpoint -->
</form>
```

Now when you submit your form, you should be redirected to a Thank You page. The form data will be submitted to your account on [Formspree.io](https://formspree.io/).

You can now adjust your form processing logic to change the [redirect page](https://help.formspree.io/hc/en-us/articles/360012378333--Thank-You-redirect), update the [notification email address](https://help.formspree.io/hc/en-us/articles/115008379348-Changing-a-form-email-address), or add plugins like [Google Sheets](https://help.formspree.io/hc/en-us/articles/360036563573-Use-Google-Sheets-to-send-your-submissions-to-a-spreadsheet), [Slack](https://help.formspree.io/hc/en-us/articles/360045648933-Send-Slack-notifications) and more.

For more help setting up Formspree, refer to the following resources:

- For general help with Formspree, refer to the [Formspree help site](https://help.formspree.io/hc/en-us).
- For examples and inspiration for your own HTML forms, review the [Formspree form library](https://formspree.io/library).
- For tips on integrating Formspree with popular platforms like Next.js, Gatsby and Eleventy, refer to the [Formspree guides](https://formspree.io/guides).

## Deployment

You are now ready to deploy your project.

If you have not already done so, save your progress within `git` and then push the commit(s) to the GitHub repository:

```sh
# Add all files
git add -A
# Commit w/ message
git commit -m "working example"
# Push commit(s) to remote
git push -u origin main
```

Your work now resides within the GitHub repository, which means that Pages is able to access it too.

If this is your first Cloudflare Pages project, refer to [Get started](/pages/get-started/) for a complete setup guide. After selecting the appropriate GitHub repository, you must configure your project with the following build settings:

- **Project name** â€“ Your choice
- **Production branch** â€“Â `main`
- **Framework preset** â€“Â None
- **Build command** â€“ None / Empty
- **Build output directory** â€“ `public`

After selecting **Save and Deploy**, your Pages project will begin its first deployment. When successful, you will be presented with a unique `*.pages.dev` subdomain and a link to your live demo.

In this tutorial, you built and deployed a website using Cloudflare Pages and Formspree to handle form submissions. You created a static HTML document with a form that communicates with Formspree to process and store submission requests and send notifications.

If you would like to review the full source code for this application, you can find it on [GitHub](https://github.com/formspree/formspree-example-cloudflare-html).

## Related resources

- [Add a React form with Formspree](/pages/tutorials/add-a-react-form-with-formspree/)
- [HTML Forms](/pages/tutorials/forms/)

---

# Build a blog using Nuxt.js and Sanity.io on Cloudflare Pages

URL: https://developers.cloudflare.com/pages/tutorials/build-a-blog-using-nuxt-and-sanity/

import { Stream } from "~/components";

In this tutorial, you will build a blog application using Nuxt.js and Sanity.io and deploy it on Cloudflare Pages. Nuxt.js is a powerful static site generator built on the front-end framework Vue.js. Sanity.io is a headless CMS tool built for managing your application's data without needing to maintain a database.

## Prerequisites

- A recent version of [npm](https://docs.npmjs.com/getting-started) on your computer
- A [Sanity.io](https://www.sanity.io) account

## Creating a new Sanity project

To begin, create a new Sanity project, using one of Sanity's templates, the blog template. If you would like to customize your configuration, you can modify the schema or pick a custom template.

### Installing Sanity and configuring your dataset

Create your new Sanity project by installing the `@sanity/cli` client from npm, and running `sanity init` in your terminal:

```sh title="Installing the Sanity client and creating a new project"
npm install -g @sanity/cli && sanity init
```

When you create a Sanity project, you can choose to use one of their pre-defined schemas. Schemas describe the shape of your data in your Sanity dataset -- if you were to start a brand new project, you may choose to initialize the schema from scratch, but for now, select the **Blog** schema.

### Inspecting your schema

With your project created, you can navigate into the folder and start up the studio locally:

```sh title="Starting the Sanity studio"
cd my-sanity-project
sanity start
```

The Sanity studio is where you can create new records for your dataset. By default, running the studio locally makes it available at `localhost:3333`â€“ go there now and create your author record. You can also create blog posts here.

![Creating a blog post in the Sanity Project dashboard](~/assets/images/pages/tutorials/sanity-studio.png)

### Deploying your dataset

When you are ready to deploy your studio, run `sanity deploy` to choose a unique URL for your studio. This means that you (or anyone else you invite to manage your blog) can access the studio at a `yoururl.sanity.studio` domain.

```sh title="Deploying the studio"
sanity deploy
```

Once you have deployed your Sanity studio:

1. Go into Sanity's management panel ([manage.sanity.io](https://manage.sanity.io)).
2. Find your project.
3. Select **API**.
4. Add `http://localhost:3000` as an allowed CORS origin for your project.

This means that requests that come to your Sanity dataset from your Nuxt application will be allowlisted.

![Your Sanity project's CORS settings](~/assets/images/pages/tutorials/cors.png)

## Creating a new Nuxt.js project

Next, create a Nuxt.js project. In a new terminal, use `create-nuxt-app` to set up a new Nuxt project:

```sh title="Creating a new Nuxt.js project"
npx create-nuxt-app blog
```

Importantly, ensure that you select a rendering mode of **Universal (SSR / SSG)** and a deployment target of **Static (Static/JAMStack hosting)**, while going through the setup process.

After you have completed your project, `cd` into your new project, and start a local development server by running `yarn dev` (or, if you chose npm as your package manager, `npm run dev`):

```sh title="Starting a Nuxt.js development server"
cd blog
yarn dev
```

### Integrating Sanity.io

After your Nuxt.js application is set up, add Sanity's `@sanity/nuxt` plugin to your Nuxt project:

```sh title="Adding @nuxt/sanity"
yarn add @nuxtjs/sanity @sanity/client
```

To configure the plugin in your Nuxt.js application, you will need to provide some configuration details. The easiest way to do this is to copy the `sanity.json` folder from your studio into your application directory (though there are other methods, too: [refer to the `@nuxt/sanity` documentation](https://sanity.nuxtjs.org/getting-started/quick-start/).

```sh title="Adding sanity.json"
cp ../my-sanity-project/sanity.json .
```

Finally, add `@nuxtjs/sanity` as a **build module** in your Nuxt configuration:

```js title="nuxt.config.js"
{
	buildModules: ["@nuxtjs/sanity"];
}
```

### Setting up components

With Sanity configured in your application, you can begin using it to render your blog. You will now set up a few pages to pull data from your Sanity API and render it. Note that if you are not familiar with Nuxt, it is recommended that you review the [Nuxt guide](https://nuxtjs.org/guide), which will teach you some fundamentals concepts around building applications with Nuxt.

### Setting up the index page

To begin, update the `index` page, which will be rendered when you visit the root route (`/`). In `pages/index.vue`:

```html title="pages/index.vue"
<template>
	<div class="container">
		<div>
			<h1 class="title">My Blog</h1>
		</div>
		<div class="posts">
			<div v-for="post in posts" :key="post._id">
				<h2><a v-bind:href="post.slug.current" v-text="post.title" /></h2>
			</div>
		</div>
	</div>
</template>

<script>
	import { groq } from "@nuxtjs/sanity";

	export default {
		async asyncData({ $sanity }) {
			const query = groq`*[_type == "post"]`;
			const posts = await $sanity.fetch(query);
			return { posts };
		},
	};
</script>

<style>
	.container {
		margin: 2rem;
		min-height: 100vh;
	}
	.posts {
		margin: 2rem 0;
	}
</style>
```

Vue SFCs, or _single file components_, are a unique Vue feature that allow you to combine JavaScript, HTML and CSS into a single file. In `pages/index.vue`, a `template` tag is provided, which represents the Vue component.

Importantly, `v-for` is used as a directive to tell Vue to render HTML for each `post` in an array of `posts`:

```html title="Inspecting the v-for directive"
<div v-for="post in posts" :key="post._id">
	<h2><a v-bind:href="post.slug.current" v-text="post.title" /></h2>
</div>
```

To populate that `posts` array, the `asyncData` function is used, which is provided by Nuxt to make asynchronous calls (for example, network requests) to populate the page's data.

The `$sanity` object is provided by the Nuxt and Sanity.js integration as a way to make requests to your Sanity dataset. By calling `$sanity.fetch`, and passing a query, you can retrieve specific data from our Sanity dataset, and return it as your page's data.

If you have not used Sanity before, you will probably be unfamiliar with GROQ, the GRaph Oriented Query language provided by Sanity for interfacing with your dataset. GROQ is a powerful language that allows you to tell the Sanity API what data you want out of your dataset. For our first query, you will tell Sanity to retrieve every object in the dataset with a `_type` value of `post`:

```js title="A basic GROQ query"
const query = groq`*[_type == "post"]`;
const posts = await $sanity.fetch(query);
```

### Setting up the blog post page

Our `index` page renders a link for each blog post in our dataset, using the `slug` value to set the URL for a blog post. For example, if I create a blog post called "Hello World" and set the slug to `hello-world`, my Nuxt application should be able to handle a request to the page `/hello-world`, and retrieve the corresponding blog post from Sanity.

Nuxt has built-in support for these kind of pages, by creating a new file in `pages` in the format `_slug.vue`. In the `asyncData` function of your page, you can then use the `params` argument to reference the slug:

```html title="pages/_slug.vue"
<script>
	export default {
		async asyncData({ params, $sanity }) {
			console.log(params); // { slug: "hello-world" }
		},
	};
</script>
```

With that in mind, you can build `pages/_slug.vue` to take the incoming `slug` value, make a query to Sanity to find the matching blog post, and render the `post` title for the blog post:

```html title="pages/_slug.vue"
<template>
	<div class="container">
		<div v-if="post">
			<h1 class="title" v-text="post.title" />
			<div class="content"></div>
		</div>
		<h4><a href="/">â† Go back</a></h4>
	</div>
</template>

<script>
	import { groq } from "@nuxtjs/sanity";

	export default {
		async asyncData({ params, $sanity }) {
			const query = groq`*[_type == "post" && slug.current == "${params.slug}"][0]`;
			const post = await $sanity.fetch(query);
			return { post };
		},
	};
</script>

<style>
	.container {
		margin: 2rem;
		min-height: 100vh;
	}

	.content {
		margin: 2rem 0;
		max-width: 38rem;
	}

	p {
		margin: 1rem 0;
	}
</style>
```

When visiting, for example, `/hello-world`, Nuxt will take the incoming slug `hello-world`, and make a GROQ query to Sanity for any objects with a `_type` of `post`, as well as a slug that matches the value `/hello-world`. From that set, you can get the first object in the array (using the array index operator you would find in JavaScript â€“ `[0]`) and set it as `post` in your page data.

### Rendering content for a blog post

You have rendered the `post` title for our blog, but you are still missing the content of the blog post itself. To render this, import the [`sanity-blocks-vue-component`](https://github.com/rdunk/sanity-blocks-vue-component) package, which takes Sanity's [Portable Text](https://www.sanity.io/docs/presenting-block-text) format and renders it as a Vue component.

First, install the npm package:

```sh title="Add sanity-blocks-vue-component package"
yarn add sanity-blocks-vue-component
```

After the package is installed, create `plugins/sanity-blocks.js`, which will import the component and register it as the Vue component `block-content`:

```js title="plugins/sanity-blocks.js"
import Vue from "vue";
import BlockContent from "sanity-blocks-vue-component";
Vue.component("block-content", BlockContent);
```

In your Nuxt configuration, `nuxt.config.js`, import that file as part of the `plugins` directive:

```js title="nuxt.config.js"
{
	plugins: ["@/plugins/sanity-blocks.js"];
}
```

In `pages/_slug.vue`, you can now use the `<block-content>` component to render your content. This takes the format of a custom HTML component, and takes three arguments: `:blocks`, which indicates what to render (in our case, `child`), `v-for`, which accepts an iterator of where to get `child` from (in our case, `post.body`), and `:key`, which helps Vue [keep track of state rendering](https://vuejs.org/v2/guide/list.html#Maintaining-State) by providing a unique value for each post: that is, the `_id` value.

```html title="pages/_slug.vue" {6}
<template>
	<div class="container">
		<div v-if="post">
			<h1 class="title" v-text="post.title" />
			<div class="content">
				<block-content
					:blocks="child"
					v-for="child in post.body"
					:key="child._id"
				/>
			</div>
		</div>
		<h4><a href="/">â† Go back</a></h4>
	</div>
</template>

<script>
	import { groq } from "@nuxtjs/sanity";

	export default {
		async asyncData({ params, $sanity }) {
			const query = groq`*[_type == "post" && slug.current == "${params.slug}"][0]`;
			const post = await $sanity.fetch(query);
			return { post };
		},
	};
</script>

<style>
	.container {
		margin: 2rem;
		min-height: 100vh;
	}

	.content {
		margin: 2rem 0;
		max-width: 38rem;
	}

	p {
		margin: 1rem 0;
	}
</style>
```

In `pages/index.vue`, you can use the `block-content` component to render a summary of the content, by taking the first block in your blog post content and rendering it:

```html title="pages/index.vue" {11-13,39}
<template>
	<div class="container">
		<div>
			<h1 class="title">My Blog</h1>
		</div>
		<div class="posts">
			<div v-for="post in posts" :key="post._id">
				<h2><a v-bind:href="post.slug.current" v-text="post.title" /></h2>
				<div class="summary">
					<block-content
						:blocks="post.body[0]"
						v-bind:key="post.body[0]._id"
						v-if="post.body.length"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { groq } from "@nuxtjs/sanity";

	export default {
		async asyncData({ $sanity }) {
			const query = groq`*[_type == "post"]`;
			const posts = await $sanity.fetch(query);
			return { posts };
		},
	};
</script>

<style>
	.container {
		margin: 2rem;
		min-height: 100vh;
	}
	.posts {
		margin: 2rem 0;
	}
	.summary {
		margin-top: 0.5rem;
	}
</style>
```

<Stream
	id="cdf12588663302139f022c26c4e5cede"
	title="Nuxt & Sanity video"
/>

There are many other things inside of your blog schema that you can add to your project. As an exercise, consider one of the following to continue developing your understanding of how to build with a headless CMS:

- Create `pages/authors.vue`, and render a list of authors (similar to `pages/index.vue`, but for objects with `_type == "author"`)
- Read the Sanity docs on [using references in GROQ](https://www.sanity.io/docs/how-queries-work#references-and-joins-db43dfd18d7d), and use it to render author information in a blog post page

## Publishing with Cloudflare Pages

Publishing your project with Cloudflare Pages is a two-step process: first, push your project to GitHub, and then in the Cloudflare Pages dashboard, set up a new project based on that GitHub repository. Pages will deploy a new version of your site each time you publish, and will even set up preview deployments whenever you open a new pull request.

To push your project to GitHub, [create a new repository](https://repo.new), and follow the instructions to push your local Git repository to GitHub.

After you have pushed your project to GitHub, deploy your site to Pages:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/) and select your account.
2. In Account Home, select **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select the new GitHub repository that you created and, in the **Set up builds and deployments** section, choose _Nuxt_. Pages will set the correct fields for you automatically.

When your site has been deployed, you will receive a unique URL to view it in production.

In order to automatically deploy your project when your Sanity.io data changes, you can use [Deploy Hooks](/pages/configuration/deploy-hooks/). Create a new Deploy Hook URL in your **Pages project** > **Settings**. In your Sanity project's Settings page, find the **Webhooks** section, and add the Deploy Hook URL, as seen below:

![Adding a Deploy Hook URL on Sanity's dashboard](~/assets/images/pages/tutorials/hooks.png)

Now, when you make a change to your Sanity.io dataset, Sanity will make a request to your unique Deploy Hook URL, which will begin a new Cloudflare Pages deploy. By doing this, your Pages application will remain up-to-date as you add new blog posts, or edit existing ones.

## Conclusion

By completing this guide, you have successfully deployed your own blog, powered by Nuxt, Sanity.io, and Cloudflare Pages. You can find the source code for both codebases on GitHub:

- Blog front end: [https://github.com/signalnerve/nuxt-sanity-blog](https://github.com/signalnerve/nuxt-sanity-blog)
- Sanity dataset: [https://github.com/signalnerve/sanity-blog-schema](https://github.com/signalnerve/sanity-blog-schema)

If you enjoyed this tutorial, you may be interested in learning how you can use Cloudflare Workers, our powerful serverless function platform, to augment your existing site. Refer to the [Build an API for your front end using Pages Functions tutorial](/pages/tutorials/build-an-api-with-pages-functions/) to learn more.

---

# Build an API for your front end using Pages Functions

URL: https://developers.cloudflare.com/pages/tutorials/build-an-api-with-pages-functions/

import { Stream } from "~/components";

In this tutorial, you will build a full-stack Pages application. Your application will contain:

- A front end, built using Cloudflare Pages and the [React framework](/pages/framework-guides/deploy-a-react-site/).
- A JSON API, built with [Pages Functions](/pages/functions/get-started/), that returns blog posts that can be retrieved and rendered in your front end.

If you prefer to work with a headless CMS rather than an API to render your blog content, refer to the [headless CMS tutorial](/pages/tutorials/build-a-blog-using-nuxt-and-sanity/).

## Video Tutorial

<Stream
	id="2d8bbaa18fbd3ffa859a7fb30e9b3dd1"
	title="Build an API With Pages Functions"
	thumbnail="29s"
/>

## 1. Build your front end

To begin, create a new Pages application using the React framework.

### Create a new React project

In your terminal, create a new React project called `blog-frontend` using the `create-vite` command. Go into the newly created `blog-frontend` directory and start a local development server:

```sh title="Create a new React application"
npx create-vite -t react blog-frontend
cd blog-frontend
npm install
npm run dev
```

### Set up your React project

To set up your React project:

1. Install the [React Router](https://reactrouter.com/en/main/start/tutorial) in the root of your `blog-frontend` directory.

With `npm`:

```sh
npm install react-router-dom@6
```

With `yarn`:

```sh
yarn add react-router-dom@6
```

2. Clear the contents of `src/App.js`. Copy and paste the following code to import the React Router into `App.js`, and set up a new router with two routes:

```js
import { Routes, Route } from "react-router-dom";

import Posts from "./components/posts";
import Post from "./components/post";

function App() {
	return (
		<Routes>
			<Route path="/" element={<Posts />} />
			<Route path="/posts/:id" element={<Post />} />
		</Routes>
	);
}

export default App;
```

3. In the `src` directory, create a new folder called `components`.
4. In the `components` directory, create two files: `posts.js`, and `post.js`. These files will load the blog posts from your API, and render them.
5. Populate `posts.js` with the following code:

```js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Posts = () => {
	const [posts, setPosts] = useState([]);

	useEffect(() => {
		const getPosts = async () => {
			const resp = await fetch("/api/posts");
			const postsResp = await resp.json();
			setPosts(postsResp);
		};

		getPosts();
	}, []);

	return (
		<div>
			<h1>Posts</h1>
			{posts.map((post) => (
				<div key={post.id}>
					<h2>
						<Link to={`/posts/${post.id}`}>{post.title}</Link>
					</h2>
				</div>
			))}
		</div>
	);
};

export default Posts;
```

6. Populate `post.js` with the following code:

```js
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const Post = () => {
	const [post, setPost] = useState({});
	const { id } = useParams();

	useEffect(() => {
		const getPost = async () => {
			const resp = await fetch(`/api/post/${id}`);
			const postResp = await resp.json();
			setPost(postResp);
		};

		getPost();
	}, [id]);

	if (!Object.keys(post).length) return <div />;

	return (
		<div>
			<h1>{post.title}</h1>
			<p>{post.text}</p>
			<p>
				<em>Published {new Date(post.published_at).toLocaleString()}</em>
			</p>
			<p>
				<Link to="/">Go back</Link>
			</p>
		</div>
	);
};

export default Post;
```

## 2. Build your API

You will now create a Pages Functions that stores your blog content and retrieves it via a JSON API.

### Write your Pages Function

To create the Pages Function that will act as your JSON API:

1. Create a `functions` directory in your `blog-frontend` directory.
2. In `functions`, create a directory named `api`.
3. In `api`, create a `posts.js` file in the `api` directory.
4. Populate `posts.js` with the following code:

```js
import posts from "./post/data";

export function onRequestGet() {
	return Response.json(posts);
}
```

This code gets blog data (from `data.js`, which you will make in step 8) and returns it as a JSON response from the path `/api/posts`.

5. In the `api` directory, create a directory named `post`.
6. In the `post` directory, create a `data.js` file.
7. Populate `data.js` with the following code. This is where your blog content, blog title, and other information about your blog lives.

```js
const posts = [
	{
		id: 1,
		title: "My first blog post",
		text: "Hello world! This is my first blog post on my new Cloudflare Workers + Pages blog.",
		published_at: new Date("2020-10-23"),
	},
	{
		id: 2,
		title: "Updating my blog",
		text: "It's my second blog post! I'm still writing and publishing using Cloudflare Workers + Pages :)",
		published_at: new Date("2020-10-26"),
	},
];

export default posts;
```

8. In the `post` directory, create an `[[id]].js` file.
9. Populate `[[id]].js` with the following code:

```js title="[[id]].js"
import posts from "./data";

export function onRequestGet(context) {
	const id = context.params.id;

	if (!id) {
		return new Response("Not found", { status: 404 });
	}

	const post = posts.find((post) => post.id === Number(id));

	if (!post) {
		return new Response("Not found", { status: 404 });
	}

	return Response.json(post);
}
```

`[[id]].js` is a [dynamic route](/pages/functions/routing#dynamic-routes) which is used to accept a blog post `id`.

## 3. Deploy

After you have configured your Pages application and Pages Function, deploy your project using the Wrangler or via the dashboard.

### Deploy with Wrangler

In your `blog-frontend` directory, run [`wrangler pages deploy`](/workers/wrangler/commands/#deploy-1) to deploy your project to the Cloudflare dashboard.

```sh
wrangler pages deploy blog-frontend
```

### Deploy via the dashboard

To deploy via the Cloudflare dashboard, you will need to create a new Git repository for your Pages project and connect your Git repository to Cloudflare. This tutorial uses GitHub as its Git provider.

#### Create a new repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git init
git remote add origin https://github.com/<YOUR-GH-USERNAME>/<REPOSITORY-NAME>
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

#### Deploy with Cloudflare Pages

Deploy your application to Pages:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/) and select your account.
2. In Account Home, select **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select the new GitHub repository that you created and, in the **Set up builds and deployments** section, provide the following information:

<div>

| Configuration option | Value           |
| -------------------- | --------------- |
| Production branch    | `main`          |
| Build command        | `npm run build` |
| Build directory      | `build`         |

</div>

After configuring your site, begin your first deploy. You should see Cloudflare Pages installing `blog-frontend`, your project dependencies, and building your site.

By completing this tutorial, you have created a full-stack Pages application.

## Related resources

- Learn about [Pages Functions routing](/pages/functions/routing)

---

# Create a HTML form

URL: https://developers.cloudflare.com/pages/tutorials/forms/

In this tutorial, you will create a simple `<form>` using plain HTML and CSS and deploy it to Cloudflare Pages. While doing so, you will learn about some of the HTML form attributes and how to collect submitted data within a Worker.

:::note[MDN Introductory Series]

This tutorial will briefly touch upon the basics of HTML forms. For a more in-depth overview, refer to MDN's [Web Forms â€“ Working with user data](https://developer.mozilla.org/en-US/docs/Learn/Forms) introductory series.

:::

This tutorial will make heavy use of Cloudflare Pages and [its Workers integration](/pages/functions/). Refer to the [Get started guide](/pages/get-started/) guide to familiarize yourself with the platform.

## Overview

On the web, forms are a common point of interaction between the user and the web document. They allow a user to enter data and, generally, submit their data to a server. A form is comprised of at least one form input, which can vary from text fields to dropdowns to checkboxes and more.

Each input should be named â€“ using the [`name`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-name) attribute â€“ so that the input's value has an identifiable name when received by the server. Additionally, with the advancement of HTML5, form elements may declare additional attributes to opt into automatic form validation. The available validations vary by input type; for example, a text input that accepts emails (via [`type=email`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types)) can ensure that the value looks like a valid email address, a number input (via `type=number`) will only accept integers or decimal values (if allowed), and generic text inputs can define a custom [`pattern`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-pattern) to allow. However, all inputs can declare whether or not a value is [`required`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-required).

Below is an example HTML5 form with a few inputs and their validation rules defined:

```html
<form method="POST" action="/api/submit">
	<input type="text" name="fullname" pattern="[A-Za-z]+" required />
	<input type="email" name="email" required />
	<input type="number" name="age" min="18" required />

	<button type="submit">Submit</button>
</form>
```

If an HTML5 form has validation rules defined, browsers will automatically check all rules when the user attempts to submit the form. Should there be any errors, the submission is prevented and the browser displays the error message(s) to the user for correction. The `<form>` will only `POST` data to the `/submit` endpoint when there are no outstanding validation errors. This entire process is native to HTML5 and only requires the appropriate form and input attributes to exist â€”Â no JavaScript is required.

Form elements may also have a [`<label>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label) element associated with them, allowing you to clearly describe each input. This is great for visual clarity, of course, but it also allows for more accessible user experiences since the HTML markup is more well-defined. Assistive technologies directly benefit from this; for example, screen readers can announce which `<input>` is focused. And when a `<label>` is clicked, its assigned form input is focused instead, increasing the activation area for the input.

To enable this, you must create a `<label>` element for each input and assign each `<input>` element and unique `id` attribute value. The `<label>` must also possess a [`for`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label#attr-for) attribute that reflects its input's unique `id` value. Amending the previous snippet should produce the following:

```html
<form method="POST" action="/api/submit">
	<label for="i-fullname">Full Name</label>
	<input
		id="i-fullname"
		type="text"
		name="fullname"
		pattern="[A-Za-z]+"
		required
	/>

	<label for="i-email">Email Address</label>
	<input id="i-email" type="email" name="email" required />

	<label for="i-age">Your Age</label>
	<input id="i-age" type="number" name="age" min="18" required />

	<button type="submit">Submit</button>
</form>
```

:::note

Your `for` and `id` values do not need to exactly match the values shown above. You may use any `id` values so long as they are unique to the HTML document. A `<label>` can only be linked with an `<input>` if the `for` and `id` attributes match.

:::

When this `<form>` is submitted with valid data, its data contents are sent to the server. You may customize how and where this data is sent by declaring attributes on the form itself. If you do not provide these details, the `<form>` will GET the data to the current URL address, which is rarely the desired behavior. To fix this, at minimum, you need to define an [`action`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-action) attribute with the target URL address, but declaring a [`method`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-method) is often recommended too, even if you are redeclaring the default `GET` value.

By default, HTML forms send their contents in the `application/x-www-form-urlencoded` MIME type. This value will be reflected in the `Content-Type` HTTP header, which the receiving server must read to determine how to parse the data contents. You may customize the MIME type through the [`enctype`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-enctype) attribute. For example, to accept files (via `type=file`), you must change the `enctype` to the `multipart/form-data` value:

```html
<form method="POST" action="/api/submit" enctype="multipart/form-data">
	<label for="i-fullname">Full Name</label>
	<input
		id="i-fullname"
		type="text"
		name="fullname"
		pattern="[A-Za-z]+"
		required
	/>

	<label for="i-email">Email Address</label>
	<input id="i-email" type="email" name="email" required />

	<label for="i-age">Your Age</label>
	<input id="i-age" type="number" name="age" min="18" required />

	<label for="i-avatar">Profile Picture</label>
	<input id="i-avatar" type="file" name="avatar" required />

	<button type="submit">Submit</button>
</form>
```

Because the `enctype` changed, the browser changes how it sends data to the server too. The `Content-Type` HTTP header will reflect the new approach and the HTTP request's body will conform to the new MIME type. The receiving server must accommodate the new format and adjust its request parsing method.

## Live example

The rest of this tutorial will focus on building an HTML form on Pages, including a Worker to receive and parse the form submissions.

:::note[GitHub Repository]

The source code for this example is [available on GitHub](https://github.com/cloudflare/submit.pages.dev). It is a live Pages application with a [live demo](https://submit.pages.dev/) available, too.

:::

### Setup

To begin, create a [new GitHub repository](https://repo.new/). Then create a new local directory on your machine, initialize git, and attach the GitHub location as a remote destination:

```sh
# create new directory
mkdir new-project
# enter new directory
cd new-project
# initialize git
git init
# attach remote
git remote add origin git@github.com:<username>/<repo>.git
# change default branch name
git branch -M main
```

You may now begin working in the `new-project` directory you created.

### Markup

The form for this example is fairly straightforward. It includes an array of different input types, including checkboxes for selecting multiple values. The form also does not include any validations so that you may see how empty and/or missing values are interpreted on the server.

You will only be using plain HTML for this example project. You may use your preferred JavaScript framework, but raw languages have been chosen for simplicity and familiarity â€“Â all frameworks are abstracting and/or producing a similar result.

Create a `public/index.html` in your project directory. All front-end assets will exist within this `public` directory and this `index.html` file will serve as the home page for the website.

Copy and paste the following content into your `public/index.html` file:

```html
<html lang="en">
	<head>
		<meta charset="utf8" />
		<title>Form Demo</title>
		<meta name="viewport" content="width=device-width,initial-scale=1" />
	</head>
	<body>
		<form method="POST" action="/api/submit">
			<div class="input">
				<label for="name">Full Name</label>
				<input id="name" name="name" type="text" />
			</div>

			<div class="input">
				<label for="email">Email Address</label>
				<input id="email" name="email" type="email" />
			</div>

			<div class="input">
				<label for="referers">How did you hear about us?</label>
				<select id="referers" name="referers">
					<option hidden disabled selected value></option>
					<option value="Facebook">Facebook</option>
					<option value="Twitter">Twitter</option>
					<option value="Google">Google</option>
					<option value="Bing">Bing</option>
					<option value="Friends">Friends</option>
				</select>
			</div>

			<div class="checklist">
				<label>What are your favorite movies?</label>
				<ul>
					<li>
						<input id="m1" type="checkbox" name="movies" value="Space Jam" />
						<label for="m1">Space Jam</label>
					</li>
					<li>
						<input
							id="m2"
							type="checkbox"
							name="movies"
							value="Little Rascals"
						/>
						<label for="m2">Little Rascals</label>
					</li>
					<li>
						<input id="m3" type="checkbox" name="movies" value="Frozen" />
						<label for="m3">Frozen</label>
					</li>
					<li>
						<input id="m4" type="checkbox" name="movies" value="Home Alone" />
						<label for="m4">Home Alone</label>
					</li>
				</ul>
			</div>

			<button type="submit">Submit</button>
		</form>
	</body>
</html>
```

This HTML document will contain a form with a few fields for the user to fill out. Because there is no validation rules within the form, all fields are optional and the user is able to submit an empty form. For this example, this is intended behavior.

:::note[Optional content]

Technically, only the `<form>` and its child elements are necessary. The `<head>` and the enclosing `<html>` and `<body>` tags are optional and not strictly necessary for a valid HTML document.

The HTML page is also completely unstyled at this point, relying on the browsers' default UI and color palettes. Styling the page is entirely optional and not necessary for the form to function. If you would like to attach a CSS stylesheet, you may [add a `<link>` element](https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps/Getting_started#adding_css_to_our_document). Refer to the finished tutorial's [source code](https://github.com/cloudflare/submit.pages.dev/blob/8c0594f48681935c268987f2f08bcf3726a74c57/public/index.html#L11) for an example or any inspiration â€“Â the only requirement is that your CSS stylesheet also resides within the `public` directory.

:::

### Worker

The HTML form is complete and ready for deployment. When the user submits this form, all data will be sent in a `POST` request to the `/api/submit` URL. This is due to the form's `method` and `action` attributes. However, there is currently no request handler at the `/api/submit` address. You will now create it.

Cloudflare Pages offers a [Functions](/pages/functions/) feature, which allows you to define and deploy Workers for dynamic behaviors.

Functions are linked to the `functions` directory and conveniently construct URL request handlers in relation to the `functions` file structure. For example, the `functions/about.js` file will map to the `/about` URL and `functions/hello/[name].js` will handle the `/hello/:name` URL pattern, where `:name` is any matching URL segment. Refer to the [Functions routing](/pages/functions/routing/) documentation for more information.

To define a handler for `/api/submit`, you must create a `functions/api/submit.js` file. This means that your `functions` and `public` directories should be siblings, with a total project structure similar to the following:

```txt
â”œâ”€â”€ functions
â”‚Â Â  â””â”€â”€ api
â”‚Â Â      â””â”€â”€ submit.js
â””â”€â”€ public
    â””â”€â”€ index.html
```

The `<form>` will send `POST` requests, which means that the `functions/api/submit.js` file needs to export an `onRequestPost` handler:

```js
/**
 * POST /api/submit
 */
export async function onRequestPost(context) {
	// TODO: Handle the form submission
}
```

The `context` parameter is an object filled with several values of potential interest. For this example, you only need the [`Request`](/workers/runtime-apis/request/) object, which can be accessed through the `context.request` key.

As mentioned, a `<form>` defaults to the `application/x-www-form-urlencoded` MIME type when submitting. And, for more advanced scenarios, the `enctype="multipart/form-data"` attribute is needed. Luckily, both MIME types can be parsed and treated as [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData). This means that with Workers â€“ which includes Pages Functions â€“ you are able to use the native [`Request.formData`](https://developer.mozilla.org/en-US/docs/Web/API/Request/formData) parser.

For illustrative purposes, the example application's form handler will reply with all values it received. A `Response` must always be returned by the handler, too:

```js
/**
 * POST /api/submit
 */
export async function onRequestPost(context) {
	try {
		let input = await context.request.formData();
		let pretty = JSON.stringify([...input], null, 2);
		return new Response(pretty, {
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
		});
	} catch (err) {
		return new Response("Error parsing JSON content", { status: 400 });
	}
}
```

With this handler in place, the example is now fully functional. When a submission is received, the Worker will reply with a JSON list of the `FormData` key-value pairs.

However, if you want to reply with a JSON object instead of the key-value pairs (an Array of Arrays), then you must do so manually. Recently, JavaScript added the [`Object.fromEntries`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries) utility. This works well in some cases; however, the example `<form>` includes a `movies` checklist that allows for multiple values. If using `Object.fromEntries`, the generated object would only keep one of the `movies` values, discarding the rest. To avoid this, you must write your own `FormData` to `Object` utility instead:

```js
/**
 * POST /api/submit
 */
export async function onRequestPost(context) {
	try {
		let input = await context.request.formData();

		// Convert FormData to JSON
		// NOTE: Allows multiple values per key
		let output = {};
		for (let [key, value] of input) {
			let tmp = output[key];
			if (tmp === undefined) {
				output[key] = value;
			} else {
				output[key] = [].concat(tmp, value);
			}
		}

		let pretty = JSON.stringify(output, null, 2);
		return new Response(pretty, {
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
		});
	} catch (err) {
		return new Response("Error parsing JSON content", { status: 400 });
	}
}
```

The final snippet (above) allows the Worker to retain all values, returning a JSON response with an accurate representation of the `<form>` submission.

### Deployment

You are now ready to deploy your project.

If you have not already done so, save your progress within `git` and then push the commit(s) to the GitHub repository:

```sh
# Add all files
git add -A
# Commit w/ message
git commit -m "working example"
# Push commit(s) to remote
git push -u origin main
```

Your work now resides within the GitHub repository, which means that Pages is able to access it too.

If this is your first Cloudflare Pages project, refer to the [Get started guide](/pages/get-started/) for a complete walkthrough. After selecting the appropriate GitHub repository, you must configure your project with the following build settings:

- **Project name** â€“ Your choice
- **Production branch** â€“Â `main`
- **Framework preset** â€“Â None
- **Build command** â€“ None / Empty
- **Build output directory** â€“ `public`

After clicking the **Save and Deploy** button, your Pages project will begin its first deployment. When successful, you will be presented with a unique `*.pages.dev` subdomain and a link to your live demo.

In this tutorial, you built and deployed a website and its back-end logic using Cloudflare Pages with its Workers integration. You created a static HTML document with a form that communicates with a Worker handler to parse the submission request(s).

If you would like to review the full source code for this application, you can find it on [GitHub](https://github.com/cloudflare/submit.pages.dev).

## Related resources

- [Build an API for your front end using Cloudflare Workers](/pages/tutorials/build-an-api-with-pages-functions/)
- [Handle form submissions with Airtable](/workers/tutorials/handle-form-submissions-with-airtable/)

---

# Localize a website with HTMLRewriter

URL: https://developers.cloudflare.com/pages/tutorials/localize-a-website/

import { Render, PackageManagers, WranglerConfig } from "~/components";

In this tutorial, you will build an example internationalization and localization engine (commonly referred to as **i18n** and **l10n**) for your application, serve the content of your site, and automatically translate the content based on your visitorsâ€™ location in the world.

This tutorial uses the [`HTMLRewriter`](/workers/runtime-apis/html-rewriter/) class built into the Cloudflare Workers runtime, which allows for parsing and rewriting of HTML on the Cloudflare global network. This gives developers the ability to efficiently and transparently customize their Workers applications.

![An example site that has been successfully localized in Japanese, German and English](~/assets/images/workers/tutorials/localize-website/i18n.jpg)

---

<Render file="tutorials-before-you-start" />

## Prerequisites

This tutorial is designed to use an existing website. To simplify this process, you will use a free HTML5 template from [HTML5 UP](https://html5up.net). With this website as the base, you will use the `HTMLRewriter` functionality in the Workers platform to overlay an i18n layer, automatically translating the site based on the userâ€™s language.

If you would like to deploy your own version of the site, you can find the source [on GitHub](https://github.com/lauragift21/i18n-example-workers). Instructions on how to deploy this application can be found in the projectâ€™s README.

## Create a new application

Create a new application using the [`create-cloudflare`](/pages/get-started/c3), a CLI for creating and deploying new applications to Cloudflare.

<PackageManagers type="create" pkg="cloudflare@latest" args={"i18n-example"} />

For setup, select the following options:

- For _What would you like to start with_?, select `Framework Starter`.
- For _Which development framework do you want to use?_, select `React`.
- For, _Do you want to deploy your application?_, select `No`.

The newly generated `i18n-example` project will contain two folders: `public` and `src` these contain files for a React application:

```sh
cd i18n-example
ls
```

```sh output
public src package.json
```

We have to make a few adjustments to the generated project, first we want to the replace the content inside of the `public` directory, with the default generated HTML code for the HTML5 UP template seen in the demo screenshot: download a [release](https://github.com/signalnerve/i18n-example-workers/archive/v1.0.zip) (ZIP file) of the code for this project and copy the `public` folder to your own project to get started.

Next, let's create a functions directory with an `index.js` file, this will be where the logic of the application will be written.

```sh
mkdir functions
cd functions
touch index.js
```

Additionally, we'll remove the `src/` directory since its content isn't necessary for this project. With the static HTML for this project updated, you can focus on the script inside of the `functions` folder, at `index.js`.

## Understanding `data-i18n-key`

The `HTMLRewriter` class provided in the Workers runtime allows developers to parse HTML and write JavaScript to query and transform every element of the page.

The example website in this tutorial is a basic single-page HTML project that lives in the `public` directory. It includes an `h1` element with the text `Example Site` and a number of `p` elements with different text:

![Demo code shown in Chrome DevTools with the elements described above](~/assets/images/workers/tutorials/localize-website/code-example.png)

What is unique about this page is the addition of [data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) in the HTML â€“ custom attributes defined on a number of elements on this page. The `data-i18n-key` on the `h1` tag on this page, as well as many of the `p` tags, indicates that there is a corresponding internationalization key, which should be used to look up a translation for this text:

```html
<!-- source clipped from i18n-example site -->

<div class="inner">
	<h1 data-i18n-key="headline">Example Site</h1>
	<p data-i18n-key="subtitle">This is my example site. Depending o...</p>
	<p data-i18n-key="disclaimer">Disclaimer: the initial translations...</p>
</div>
```

Using `HTMLRewriter`, you will parse the HTML within the `./public/index.html` page. When a `data-i18n-key` attribute is found, you should use the attribute's value to retrieve a matching translation from the `strings` object. With `HTMLRewriter`, you can query elements to accomplish tasks like finding a data attribute. However, as the name suggests, you can also rewrite elements by taking a translated string and directly inserting it into the HTML.

Another feature of this project is based on the `Accept-Language` header, which exists on incoming requests. You can set the translation language per request, allowing users from around the world to see a locally relevant and translated page.

## Using the HTML Rewriter API

Begin with the `functions/index.js` file. Your application in this tutorial will live entirely in this file.

Inside of this file, start by adding the default code for running a [Pages Function](/pages/functions/get-started/#create-a-function).

```js
export function onRequest(context) {
	return new Response("Hello, world!");
}
```

The important part of the code lives in the `onRequest` function. To implement translations on the site, take the HTML response retrieved from `env.ASSETS.fetch(request)` this allows you to fetch a static asset from your Pages project and pass it into a new instance of `HTMLRewriter`. When instantiating `HTMLRewriter`, you can attach handlers using the `on` function. For this tutorial, you will use the `[data-i18n-key]` selector (refer to the [HTMLRewriter documentation](/workers/runtime-apis/html-rewriter/) for more advanced usage) to locate all elements with the `data-i18n-key` attribute, which means that they must be translated. Any matching element will be passed to an instance of your `ElementHandler` class, which will contain the translation logic. With the created instance of `HTMLRewriter`, the `transform` function takes a `response` and can be returned to the client:

```js
export async function onRequest(context) {
	const { request, env } = context;
	const response = await env.ASSETS.fetch(request);
	return new HTMLRewriter()
		.on("[data-i18n-key]", new ElementHandler(countryStrings))
		.transform(response);
}
```

## Transforming HTML

Your `ElementHandler` will receive every element parsed by the `HTMLRewriter` instance, and due to the expressive API, you can query each incoming element for information.

In [How it works](#understanding-data-i18n-key), the documentation describes `data-i18n-key`, a custom data attribute that could be used to find a corresponding translated string for the websiteâ€™s user interface. In `ElementHandler`, you can define an `element` function, which will be called as each element is parsed. Inside of the `element` function, you can query for the custom data attribute using `getAttribute`:

```js
class ElementHandler {
	element(element) {
		const i18nKey = element.getAttribute("data-i18n-key");
	}
}
```

With `i18nKey` defined, you can use it to search for a corresponding translated string. You will now set up a `strings` object with key-value pairs corresponding to the `data-i18n-key` value. For now, you will define a single example string, `headline`, with a German `string`, `"Beispielseite"` (`"Example Site"`), and retrieve it in the `element` function:

```js null {1,2,3,4,5,10}
const strings = {
	headline: "Beispielseite",
};

class ElementHandler {
	element(element) {
		const i18nKey = element.getAttribute("data-i18n-key");
		const string = strings[i18nKey];
	}
}
```

Take your translated `string` and insert it into the original element, using the `setInnerContent` function:

```js null {11,12,13}
const strings = {
	headline: "Beispielseite",
};

class ElementHandler {
	element(element) {
		const i18nKey = element.getAttribute("data-i18n-key");
		const string = strings[i18nKey];
		if (string) {
			element.setInnerContent(string);
		}
	}
}
```

To review that everything looks as expected, use the preview functionality built into Wrangler. Call [`wrangler pages dev ./public`](/workers/wrangler/commands/#dev) to open up a live preview of your project. The command is refreshed after every code change that you make.

You can expand on this translation functionality to provide country-specific translations, based on the incoming requestâ€™s `Accept-Language` header. By taking this header, parsing it, and passing the parsed language into your `ElementHandler`, you can retrieve a translated string in your userâ€™s home language, provided that it is defined in `strings`.

To implement this:

1. Update the `strings` object, adding a second layer of key-value pairs and allowing strings to be looked up in the format `strings[country][key]`.
2. Pass a `countryStrings` object into our `ElementHandler`, so that it can be used during the parsing process.
3. Grab the `Accept-Language` header from an incoming request, parse it, and pass the parsed language to `ElementHandler`.

To parse the `Accept-Language` header, install the [`accept-language-parser`](https://www.npmjs.com/package/accept-language-parser) npm package:

```sh
npm i accept-language-parser
```

Once imported into your code, use the package to parse the most relevant language for a client based on `Accept-Language` header, and pass it to `ElementHandler`. Your final code for the project, with an included sample translation for Germany and Japan (using Google Translate) looks like this:

```js null {32,33,34,39,62,63,64,65}
import parser from "accept-language-parser";

// do not set to true in production!
const DEBUG = false;

const strings = {
	de: {
		title: "Beispielseite",
		headline: "Beispielseite",
		subtitle:
			"Dies ist meine Beispielseite. AbhÃ¤ngig davon, wo auf der Welt Sie diese Site besuchen, wird dieser Text in die entsprechende Sprache Ã¼bersetzt.",
		disclaimer:
			"Haftungsausschluss: Die anfÃ¤nglichen Ãœbersetzungen stammen von Google Translate, daher sind sie mÃ¶glicherweise nicht perfekt!",
		tutorial:
			"Das Tutorial fÃ¼r dieses Projekt finden Sie in der Cloudflare Workers-Dokumentation.",
		copyright: "Design von HTML5 UP.",
	},
	ja: {
		title: "ã‚µãƒ³ãƒ—ãƒ«ã‚µã‚¤ãƒˆ",
		headline: "ã‚µãƒ³ãƒ—ãƒ«ã‚µã‚¤ãƒˆ",
		subtitle:
			"ã“ã‚Œã¯ç§ã®ä¾‹ã®ã‚µã‚¤ãƒˆã§ã™ã€‚ ã“ã®ã‚µã‚¤ãƒˆã«ã‚¢ã‚¯ã‚»ã‚¹ã™ã‚‹ä¸–ç•Œã®å ´æ‰€ã«å¿œã˜ã¦ã€ã“ã®ãƒ†ã‚­ã‚¹ãƒˆã¯å¯¾å¿œã™ã‚‹è¨€èªžã«ç¿»è¨³ã•ã‚Œã¾ã™ã€‚",
		disclaimer:
			"å…è²¬äº‹é …ï¼šæœ€åˆã®ç¿»è¨³ã¯Googleç¿»è¨³ã‹ã‚‰ã®ã‚‚ã®ã§ã™ã®ã§ã€å®Œç’§ã§ã¯ãªã„ã‹ã‚‚ã—ã‚Œã¾ã›ã‚“ï¼",
		tutorial:
			"Cloudflare Workersã®ãƒ‰ã‚­ãƒ¥ãƒ¡ãƒ³ãƒˆã§ã“ã®ãƒ—ãƒ­ã‚¸ã‚§ã‚¯ãƒˆã®ãƒãƒ¥ãƒ¼ãƒˆãƒªã‚¢ãƒ«ã‚’è¦‹ã¤ã‘ã¦ãã ã•ã„ã€‚",
		copyright: "HTML5 UPã«ã‚ˆã‚‹è¨­è¨ˆã€‚",
	},
};

class ElementHandler {
	constructor(countryStrings) {
		this.countryStrings = countryStrings;
	}

	element(element) {
		const i18nKey = element.getAttribute("data-i18n-key");
		if (i18nKey) {
			const translation = this.countryStrings[i18nKey];
			if (translation) {
				element.setInnerContent(translation);
			}
		}
	}
}

export async function onRequest(context) {
	const { request, env } = context;
	try {
		let options = {};
		if (DEBUG) {
			options = {
				cacheControl: {
					bypassCache: true,
				},
			};
		}
		const languageHeader = request.headers.get("Accept-Language");
		const language = parser.pick(["de", "ja"], languageHeader);
		const countryStrings = strings[language] || {};

		const response = await env.ASSETS.fetch(request);
		return new HTMLRewriter()
			.on("[data-i18n-key]", new ElementHandler(countryStrings))
			.transform(response);
	} catch (e) {
		if (DEBUG) {
			return new Response(e.message || e.toString(), {
				status: 404,
			});
		} else {
			return env.ASSETS.fetch(request);
		}
	}
}
```

## Deploy

Your i18n tool built on Cloudflare Pages is complete and it is time to deploy it to your domain.

To deploy your application to a `*.pages.dev` subdomain, you need to specify a directory of static assets to serve, configure the `pages_build_output_dir` in your projectâ€™s Wrangler file and set the value to `./public`:

<WranglerConfig>

```toml null {2}
name = "i18n-example"
pages_build_output_dir = "./public"
compatibility_date = "2024-01-29"
```

</WranglerConfig>

Next, you need to configure a deploy script in `package.json` file in your project. Add a deploy script with the value `wrangler pages deploy`:

```json null {3}
"scripts": {
  "dev": "wrangler pages dev",
  "deploy": "wrangler pages deploy"
}
```

Using `wrangler`, deploy to Cloudflareâ€™s network, using the `deploy` command:

```sh
npm run deploy
```

![An example site that has been successfully localized in Japanese, German and English](~/assets/images/workers/tutorials/localize-website/i18n.jpg)

## Related resources

In this tutorial, you built and deployed an i18n tool using `HTMLRewriter`. To review the full source code for this application, refer to the [repository on GitHub](https://github.com/lauragift21/i18n-example-workers).

If you want to get started building your own projects, review the existing list of [Quickstart templates](/workers/get-started/quickstarts/).

---

# Use R2 as static asset storage with Cloudflare Pages

URL: https://developers.cloudflare.com/pages/tutorials/use-r2-as-static-asset-storage-for-pages/

import { WranglerConfig } from "~/components";

This tutorial will teach you how to use [R2](/r2/) as a static asset storage bucket for your [Pages](/pages/) app. This is especially helpful if you're hitting the [file limit](/pages/platform/limits/#files) or the [max file size limit](/pages/platform/limits/#file-size) on Pages.

To illustrate how this is done, we will use R2 as a static asset storage for a fictional cat blog.

## The Cat blog

Imagine you run a static cat blog containing funny cat videos and helpful tips for cat owners. Your blog is growing and you need to add more content with cat images and videos.

The blog is hosted on Pages and currently has the following directory structure:

```
.
â”œâ”€â”€ public
â”‚Â Â  â”œâ”€â”€ index.html
â”‚Â Â  â”œâ”€â”€ static
â”‚Â Â  â”‚Â Â  â”œâ”€â”€ favicon.ico
â”‚Â Â  â”‚Â Â  â””â”€â”€ logo.png
â”‚Â Â  â””â”€â”€ style.css
â””â”€â”€ wrangler.toml
```

Adding more videos and images to the blog would be great, but our asset size is above the [file limit on Pages](/pages/platform/limits/#file-size). Let us fix this with R2.

## Create an R2 bucket

The first step is creating an R2 bucket to store the static assets. A new bucket can be created with the dashboard or via Wrangler.

Using the dashboard, navigate to the R2 tab, then click onÂ *Create bucket.*Â We will name the bucket for our blog _cat-media_. Always remember to give your buckets descriptive names:

![Dashboard](~/assets/images/pages/tutorials/pages-r2/dash.png)

With the bucket created, we can upload media files to R2. Iâ€™ll drag and drop two folders with a few cat images and videos into the R2 bucket:

![Upload](/images/pages/tutorials/pages-r2/upload.gif)

Alternatively, an R2 bucket can be created with Wrangler from the command line by running:

```sh
npx wrangler r2 bucket create <bucket_name>
# i.e
# npx wrangler r2 bucket create cat-media
```

Files can be uploaded to the bucket with the following command:

```sh
npx wrangler r2 object put <bucket_name>/<file_name> -f <path_to_file>
# i.e
# npx wrangler r2 object put cat-media/videos/video1.mp4 -f ~/Downloads/videos/video1.mp4
```

## Bind R2 to Pages

To bind the R2 bucket we have created to the cat blog, we need to update the Wrangler configuration.

Open the [Wrangler configuration file](/pages/functions/wrangler-configuration/), and add the following binding to the file. `bucket_name` should be the exact name of the bucket created earlier, while `binding` can be any custom name referring to the R2 resource:

<WranglerConfig>

```toml
[[r2_buckets]]
binding = "MEDIA"
bucket_name = "cat-media"
```

</WranglerConfig>

:::note

Note: The keyword `ASSETS` is reserved and cannot be used as a resource binding.
:::

Save the [Wrangler configuration file](/pages/functions/wrangler-configuration/), and we are ready to move on to the last step.

Alternatively, you can add a binding to your Pages project on the dashboard by navigating to the projectâ€™s _Settings_ tab > _Functions_ > _R2 bucket bindings_.

## Serve R2 Assets From Pages

The last step involves serving media assets from R2 on the blog. To do that, we will create a function to handle requests for media files.

In the project folder, create a _functions_ directory. Then, create a _media_ subdirectory and a file named `[[all]].js` in it. All HTTP requests to `/media` will be routed to this file.

After creating the folders and JavaScript file, the blog directory structure should look like:

```
.
â”œâ”€â”€ functions
â”‚Â Â  â””â”€â”€ media
â”‚Â Â      â””â”€â”€ [[all]].js
â”œâ”€â”€ public
â”‚Â Â  â”œâ”€â”€ index.html
â”‚Â Â  â”œâ”€â”€ static
â”‚Â Â  â”‚Â Â  â”œâ”€â”€ favicon.ico
â”‚Â Â  â”‚Â Â  â””â”€â”€ icon.png
â”‚Â Â  â””â”€â”€ style.css
â””â”€â”€ wrangler.toml

```

Finally, we will add a handler function to `[[all]].js`. This function receives all media requests, and returns the corresponding file asset from R2:

```js
export async function onRequestGet(ctx) {
	const path = new URL(ctx.request.url).pathname.replace("/media/", "");
	const file = await ctx.env.MEDIA.get(path);
	if (!file) return new Response(null, { status: 404 });
	return new Response(file.body, {
		headers: { "Content-Type": file.httpMetadata.contentType },
	});
}
```

## Deploy the blog

Before deploying the changes made so far to our cat blog, let us add a few new posts to `index.html`. These posts depend on media assets served from R2:

```html
<!doctype html>
<html lang="en">
	<body>
		<h1>Awesome Cat Blog! ðŸ˜º</h1>
		<p>Today's post:</p>
		<video width="320" controls>
			<source src="/media/videos/video1.mp4" type="video/mp4" />
		</video>
		<p>Yesterday's post:</p>
		<img src="/media/images/cat1.jpg" width="320" />
	</body>
</html>
```

With all the files saved, open a new terminal window to deploy the app:

```sh
npx wrangler deploy
```

Once deployed, media assets are fetched and served from the R2 bucket.

![Deployed App](/images/pages/tutorials/pages-r2/deployed.gif)

## **Related resources**

- [Learn how function routing works in Pages.](/pages/functions/routing/)
- [Learn how to create public R2 buckets](/r2/buckets/public-buckets/).
- [Learn how to use R2 from Workers](/r2/api/workers/workers-api-usage/).

---

# Advanced Usage

URL: https://developers.cloudflare.com/pages/framework-guides/nextjs/ssr/advanced/

## Custom Worker Entrypoint

If you need to run code before or after your Next.js application, create your own Worker entrypoint and forward requests to your Next.js application.

This can help you intercept logs from your app, catch and handle uncaught exceptions, or add additional context to incoming requests or outgoing responses.

1. Create a new file in your Next.js project, with a [`fetch()` handler](/workers/runtime-apis/handlers/fetch/), that looks like this:

```ts
import nextOnPagesHandler from "@cloudflare/next-on-pages/fetch-handler";

export default {
	async fetch(request, env, ctx) {
		// do something before running the next-on-pages handler

		const response = await nextOnPagesHandler.fetch(request, env, ctx);

		// do something after running the next-on-pages handler

		return response;
	},
} as ExportedHandler<{ ASSETS: Fetcher }>;
```

This looks like a Worker â€”Â but it does not need its own Wrangler file. You can think of it purely as code that `@cloudflare/next-on-pages` will then use to wrap the output of the build that is deployed to your Cloudflare Pages project.

2. Pass the entrypoint argument to the next-on-pages CLI with the path to your handler.

```sh
npx @cloudflare/next-on-pages --custom-entrypoint=./custom-entrypoint.ts
```

---

# Caching

URL: https://developers.cloudflare.com/pages/framework-guides/nextjs/ssr/caching/

[`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages) supports [caching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#caching-data) and [revalidating](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#revalidating-data) data returned by subrequests you make in your app by calling [`fetch()`](/workers/runtime-apis/fetch/).

By default, all `fetch()` subrequests made in your Next.js app are cached. Refer to the [Next.js documentation](https://nextjs.org/docs/app/building-your-application/caching#opting-out-1) for information about how to disable caching for an individual subrequest, or for an entire route.

[The cache persists across deployments](https://nextjs.org/docs/app/building-your-application/caching#data-cache). You are responsible for revalidating/purging this cache.

## Storage options

You can configure your Next.js app to write cache entries to and read from either [Workers KV](/kv/) or the [Cache API](/workers/runtime-apis/cache/).

### Workers KV (recommended)

It takes an extra step to enable, but Cloudflare recommends caching data using [Workers KV](/kv/).

When you write cached data to Workers KV, you write to storage that can be read by any Cloudflare location. This means your app can fetch data, cache it in KV, and then subsequent requests anywhere around the world can read from this cache.

:::note


Workers KV is eventually consistent, which means that it can take up to 60 seconds for updates to be reflected globally.


:::

To use Workers KV as the cache for your Next.js app, [add a KV binding](/pages/functions/bindings/#kv-namespaces) to your Pages project, and set the name of the binding to `__NEXT_ON_PAGES__KV_SUSPENSE_CACHE`.

### Cache API (default)

The [Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/) is the default option for caching data in your Next.js app. You do not need to take any action to enable the Cache API.

In contrast with Workers KV, when you write data using the Cache API, data is only cached in the Cloudflare location that you are writing data from.

---

# Bindings

URL: https://developers.cloudflare.com/pages/framework-guides/nextjs/ssr/bindings/

Once you have [set up next-on-pages](/pages/framework-guides/nextjs/ssr/get-started/), you can access [bindings](/workers/runtime-apis/bindings/) from any route of your Next.js app via `getRequestContext`:

```js
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function GET(request) {
	let responseText = "Hello World";

	const myKv = getRequestContext().env.MY_KV_NAMESPACE;
	await myKv.put("foo", "bar");
	const foo = await myKv.get("foo");

	return new Response(foo);
}
```

Add bindings to your Pages project by adding them to your [Wrangler configuration file](/pages/functions/wrangler-configuration/).

## TypeScript type declarations for bindings

To ensure that the `env` object from `getRequestContext().env` above has accurate TypeScript types, install [`@cloudflare/workers-types`](https://www.npmjs.com/package/@cloudflare/workers-types) and create a [TypeScript declaration file](https://www.typescriptlang.org/docs/handbook/2/type-declarations.html).

Install Workers Types:

```sh
npm install --save-dev @cloudflare/workers-types
```

Add Workers Types to your `tsconfig.json` file, replacing the date below with your project's [compatibility date](/workers/configuration/compatibility-dates/):

```diff title="tsconfig.json"
    "types": [
+        "@cloudflare/workers-types/2024-07-29"
    ]
```

Create an `env.d.ts` file in the root directory of your Next.js app, and explicitly declare the type of each binding:

```ts title="env.d.ts"
interface CloudflareEnv {
	MY_KV_1: KVNamespace;
	MY_KV_2: KVNamespace;
	MY_R2: R2Bucket;
	MY_DO: DurableObjectNamespace;
}
```

## Other Cloudflare APIs (`cf`, `ctx`)

Access context about the incoming request from the [`cf` object](/workers/runtime-apis/request/#incomingrequestcfproperties), as well as [lifecycle methods from the `ctx` object](/workers/runtime-apis/handlers/fetch/) from the return value of [`getRequestContext()`](https://github.com/cloudflare/next-on-pages/blob/main/packages/next-on-pages/src/api/getRequestContext.ts):

```js
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function GET(request) {
	const { env, cf, ctx } = getRequestContext();

	// ...
}
```

---

# Get started

URL: https://developers.cloudflare.com/pages/framework-guides/nextjs/ssr/get-started/

import { PackageManagers, WranglerConfig } from "~/components";

Learn how to deploy full-stack (SSR) Next.js apps to Cloudflare Pages.

:::note
You can now also deploy Next.js apps to [Cloudflare Workers](https://developers.cloudflare.com/workers/frameworks/), including apps that use the Node.js "runtime" from Next.js. This allows you to use the [Node.js APIs that Cloudflare Workers provides](/workers/runtime-apis/nodejs/#built-in-nodejs-runtime-apis), and ensures compatibility with a broader set of Next.js features and rendering modes.

Refer to the [OpenNext docs for the `@opennextjs/cloudflare` adapter](https://opennext.js.org/cloudflare) to learn how to get started.
:::

## New apps

To create a new Next.js app, pre-configured to run on Cloudflare, run:

<PackageManagers
	type="create"
	pkg="cloudflare@latest my-next-app"
	args="--framework=next --platform=pages"
/>

For more guidance on developing your app, refer to [Bindings](/pages/framework-guides/nextjs/ssr/bindings/) or the [Next.js documentation](https://nextjs.org).

---

## Existing apps

### 1. Install next-on-pages

First, install [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages):

```sh
npm install --save-dev @cloudflare/next-on-pages
```

### 2. Add Wrangler file

Then, add a [Wrangler configuration file](/pages/functions/wrangler-configuration/) to the root directory of your Next.js app:

<WranglerConfig>

```toml
name = "my-app"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"
```

</WranglerConfig>

This is where you configure your Pages project and define what resources it can access via [bindings](/workers/runtime-apis/bindings/).

### 3. Update `next.config.mjs`

Next, update the content in your `next.config.mjs` file.

```diff title="next.config.mjs"
+ import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

/** @type {import('next').NextConfig} */
const nextConfig = {};

+ if (process.env.NODE_ENV === 'development') {
+   await setupDevPlatform();
+ }

export default nextConfig;
```

These changes allow you to access [bindings](/pages/framework-guides/nextjs/ssr/bindings/) in local development.

### 4. Ensure all server-rendered routes use the Edge Runtime

Next.js has [two "runtimes"](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes) â€” "Edge" and "Node.js". When you run your Next.js app on Cloudflare, you [can use available Node.js APIs](/workers/runtime-apis/nodejs/) â€”Â but you currently can only use Next.js' "Edge" runtime.

This means that for each server-rendered route â€” ex: an API route or one that uses `getServerSideProps` â€”Â you must configure it to use the "Edge" runtime:

```js
export const runtime = "edge";
```

### 5. Update `package.json`

Add the following to the scripts field of your `package.json` file:

```json title="package.json"
"pages:build": "npx @cloudflare/next-on-pages",
"preview": "npm run pages:build && wrangler pages dev",
"deploy": "npm run pages:build && wrangler pages deploy"
```

- `npm run pages:build`: Runs `next build`, and then transforms its output to be compatible with Cloudflare Pages.
- `npm run preview`: Builds your app, and runs it locally in [workerd](https://github.com/cloudflare/workerd), the open-source Workers Runtime. (`next dev` will only run your app in Node.js)
- `npm run deploy`: Builds your app, and then deploys it to Cloudflare

### 6. Deploy to Cloudflare Pages

Either deploy via the command line:

```sh
npm run deploy
```

Or [connect a Github or Gitlab repository](/pages/get-started/git-integration/), and Cloudflare will automatically build and deploy each pull request you merge to your production branch.

### 7. (Optional) Add `eslint-plugin-next-on-pages`

Optionally, you might want to add `eslint-plugin-next-on-pages`, which lints your Next.js app to ensure it is configured correctly to run on Cloudflare Pages.

```sh
npm install --save-dev eslint-plugin-next-on-pages
```

Once it is installed, add the following to `.eslintrc.json`:

```diff title=".eslintrc.json"
{
  "extends": [
    "next/core-web-vitals",
+    "plugin:eslint-plugin-next-on-pages/recommended"
  ],
  "plugins": [
+    "eslint-plugin-next-on-pages"
  ]
}
```

## Related resources

- [Bindings](/pages/framework-guides/nextjs/ssr/bindings/)
- [Troubleshooting](/pages/framework-guides/nextjs/ssr/troubleshooting/)

---

# Full-stack (SSR)

URL: https://developers.cloudflare.com/pages/framework-guides/nextjs/ssr/

import { DirectoryListing } from "~/components"

[Next.js](https://nextjs.org) is an open-source React.js framework for building full-stack applications. This section helps you deploy a full-stack Next.js project to Cloudflare Pages using [`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages/tree/main/packages/next-on-pages/docs).

:::note
You should consider using [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare), which allows you to build and deploy Next.js apps to [Cloudflare Workers](/workers/static-assets/), use [Node.js APIs](/workers/runtime-apis/nodejs/) that Cloudflare Workers supports, and supports additional Next.js features.

If you're coming from Vercel, you can easily migrate your Next.js app to Cloudflare by using [Diverce](https://github.com/ygwyg/diverce), which will automatically add OpenNext to your project and create a pull request that makes it deployable to Cloudflare. 
:::

<DirectoryListing />

---

# Routing static assets

URL: https://developers.cloudflare.com/pages/framework-guides/nextjs/ssr/static-assets/

When you use a JavaScript framework like Next.js on Cloudflare Pages, the framework adapter (ex: `@cloudflare/next-on-pages`) automatically generates a [`_routes.json` file](/pages/functions/routing/#create-a-_routesjson-file), which defines specific paths of your app's static assets. This file tells Cloudflare, `for these paths, don't run the Worker, you can just serve the static asset on this path` (an image, a chunk of client-side JavaScript, etc.)

The framework adapter handles this for youÂ â€”Â you typically shouldn't need to create your own `_routes.json` file.

If you need to, you can define your own `_routes.json` file in the root directory of your project. For example, you might want to declare the `/favicon.ico` path as a static asset where the Worker should not be invoked.

You would add it to the `excludes` filed of your `_routes.json` file:

```json title="_routes.json"
{
	"version": 1,
	"exclude": ["/favicon.ico"]
}
```

During the build process, `@cloudflare/next-on-pages` will automatically generate its own `_routes.json` file in the output directory. Any entries that are provided in your own `_routes.json` file (in the project's root directory) will be merged with the generated file.

---

# Supported features

URL: https://developers.cloudflare.com/pages/framework-guides/nextjs/ssr/supported-features/

import { Details } from "~/components";

## Supported Next.js versions

`@cloudflare/next-on-pages` supports all minor and patch version of Next.js 13 and 14. We regularly run manual and automated tests to ensure compatibility.

### Node.js API support

Next.js has [two "runtimes"](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes) â€” "Edge" and "Node.js".

The `@cloudflare/next-on-pages` adapter supports only the edge "runtime".

The [`@opennextjs/cloudflare` adapter](https://opennext.js.org/cloudflare), which lets you build and deploy Next.js apps to [Cloudflare Workers](/workers/), supports the Node.js "runtime" from Next.js. When you use it, you can use the [full set of Node.js APIs](/workers/runtime-apis/nodejs/) that Cloudflare Workers provide.

`@opennextjs/cloudflare` is pre 1.0, and still in active development. As it approaches 1.0, it will become the clearly better choice for most Next.js apps, since Next.js has been engineered to only support its Node.js "runtime" for many newly introduced features.

Refer to the [OpenNext docs](https://opennext.js.org/cloudflare) and the [Workers vs. Pages compatibility matrix](/workers/static-assets/migrate-from-pages/#compatibility-matrix) for more information to help you decide which to use.

#### Supported Node.js APIs when using `@cloudflare/next-on-pages`

When you use `@cloudflare/next-on-pages`, your Next.js app must use the "edge" runtime from Next.js. The Workers runtime [supports a broad set of Node.js APIs](/workers/runtime-apis/nodejs/) â€”Â but [the Next.js Edge Runtime code intentionally constrains this](https://github.com/vercel/next.js/blob/canary/packages/next/src/build/webpack/plugins/middleware-plugin.ts#L820). As a result, only the following Node.js APIs will work in your Next.js app:

- `buffer`
- `events`
- `assert`
- `util`
- `async_hooks`

If you need to use other APIs from Node.js, you should use [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) instead.

## Supported Features

### Routers

Cloudlflare recommends using the [App router](https://nextjs.org/docs/app) from Next.js.

Cloudflare also supports the older [Pages](https://nextjs.org/docs/pages) router from Next.js.

### next.config.mjs Properties

[`next.config.js` â€” app router](https://nextjs.org/docs/app/api-reference/next-config-js) and [\`next.config.js - pages router](https://nextjs.org/docs/pages/api-reference/next-config-js)

| Option                              | Next Docs                                                                                                                                                                                    | Support      |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| appDir                              | [app](https://nextjs.org/docs/app/api-reference/next-config-js/appDir)                                                                                                                       | âœ…           |
| assetPrefix                         | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/assetPrefix), [app](https://nextjs.org/docs/app/api-reference/next-config-js/assetPrefix)                                 | ðŸ”„           |
| basePath                            | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/basePath), [app](https://nextjs.org/docs/app/api-reference/next-config-js/basePath)                                       | âœ…           |
| compress                            | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/compress), [app](https://nextjs.org/docs/app/api-reference/next-config-js/compress)                                       | `N/A`[^1]    |
| devIndicators                       | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/devIndicators), [app](https://nextjs.org/docs/app/api-reference/next-config-js/devIndicators)                             | `N/A`[^2]    |
| distDir                             | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/distDir), [app](https://nextjs.org/docs/app/api-reference/next-config-js/distDir)                                         | `N/A`[^3]    |
| env                                 | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/env), [app](https://nextjs.org/docs/app/api-reference/next-config-js/env)                                                 | âœ…           |
| eslint                              | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/eslint), [app](https://nextjs.org/docs/app/api-reference/next-config-js/eslint)                                           | âœ…           |
| exportPathMap                       | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/exportPathMap), [app](https://nextjs.org/docs/app/api-reference/next-config-js/exportPathMap)                             | `N/A`[^4]    |
| generateBuildId                     | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/generateBuildId), [app](https://nextjs.org/docs/app/api-reference/next-config-js/generateBuildId)                         | âœ…           |
| generateEtags                       | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/generateEtags), [app](https://nextjs.org/docs/app/api-reference/next-config-js/generateEtags)                             | ðŸ”„           |
| headers                             | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/headers), [app](https://nextjs.org/docs/app/api-reference/next-config-js/headers)                                         | âœ…           |
| httpAgentOptions                    | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/httpAgentOptions), [app](https://nextjs.org/docs/app/api-reference/next-config-js/httpAgentOptions)                       | `N/A`        |
| images                              | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/images), [app](https://nextjs.org/docs/app/api-reference/next-config-js/images)                                           | âœ…           |
| incrementalCacheHandlerPath         | [app](https://nextjs.org/docs/app/api-reference/next-config-js/incrementalCacheHandlerPath)                                                                                                  | ðŸ”„           |
| logging                             | [app](https://nextjs.org/docs/app/api-reference/next-config-js/logging)                                                                                                                      | `N/A`[^5]    |
| mdxRs                               | [app](https://nextjs.org/docs/app/api-reference/next-config-js/mdxRs)                                                                                                                        | âœ…           |
| onDemandEntries                     | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/onDemandEntries), [app](https://nextjs.org/docs/app/api-reference/next-config-js/onDemandEntries)                         | `N/A`[^6]    |
| optimizePackageImports              | [app](https://nextjs.org/docs/app/api-reference/next-config-js/optimizePackageImports)                                                                                                       | âœ…/`N/A`[^7] |
| output                              | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/output), [app](https://nextjs.org/docs/app/api-reference/next-config-js/output)                                           | `N/A`[^8]    |
| pageExtensions                      | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/pageExtensions), [app](https://nextjs.org/docs/app/api-reference/next-config-js/pageExtensions)                           | âœ…           |
| Partial Prerendering (experimental) | [app](https://nextjs.org/docs/app/api-reference/next-config-js/partial-prerendering)                                                                                                         | âŒ[^9]       |
| poweredByHeader                     | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/poweredByHeader), [app](https://nextjs.org/docs/app/api-reference/next-config-js/poweredByHeader)                         | ðŸ”„           |
| productionBrowserSourceMaps         | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/productionBrowserSourceMaps), [app](https://nextjs.org/docs/app/api-reference/next-config-js/productionBrowserSourceMaps) | ðŸ”„[^10]      |
| reactStrictMode                     | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/reactStrictMode), [app](https://nextjs.org/docs/app/api-reference/next-config-js/reactStrictMode)                         | âŒ[^11]      |
| redirects                           | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/redirects), [app](https://nextjs.org/docs/app/api-reference/next-config-js/redirects)                                     | âœ…           |
| rewrites                            | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/rewrites), [app](https://nextjs.org/docs/app/api-reference/next-config-js/rewrites)                                       | âœ…           |
| Runtime Config                      | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/runtime-configuration), [app](https://nextjs.org/docs/app/api-reference/next-config-js/runtime-configuration)             | âŒ[^12]      |
| serverActions                       | [app](https://nextjs.org/docs/app/api-reference/next-config-js/serverActions)                                                                                                                | âœ…           |
| serverComponentsExternalPackages    | [app](https://nextjs.org/docs/app/api-reference/next-config-js/serverComponentsExternalPackages)                                                                                             | `N/A`[^13]   |
| trailingSlash                       | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/trailingSlash), [app](https://nextjs.org/docs/app/api-reference/next-config-js/trailingSlash)                             | âœ…           |
| transpilePackages                   | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/transpilePackages), [app](https://nextjs.org/docs/app/api-reference/next-config-js/transpilePackages)                     | âœ…           |
| turbo                               | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/turbo), [app](https://nextjs.org/docs/app/api-reference/next-config-js/turbo)                                             | ðŸ”„           |
| typedRoutes                         | [app](https://nextjs.org/docs/app/api-reference/next-config-js/typedRoutes)                                                                                                                  | âœ…           |
| typescript                          | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/typescript), [app](https://nextjs.org/docs/app/api-reference/next-config-js/typescript)                                   | âœ…           |
| urlImports                          | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/urlImports), [app](https://nextjs.org/docs/app/api-reference/next-config-js/urlImports)                                   | âœ…           |
| webpack                             | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/webpack), [app](https://nextjs.org/docs/app/api-reference/next-config-js/webpack)                                         | âœ…           |
| webVitalsAttribution                | [pages](https://nextjs.org/docs/pages/api-reference/next-config-js/webVitalsAttribution), [app](https://nextjs.org/docs/app/api-reference/next-config-js/webVitalsAttribution)               | âœ…           |

```
- âœ…: Supported
- ðŸ”„: Not currently supported
- âŒ: Not supported
- N/A: Not applicable
```

[^1]: **compression**: [Cloudflare applies Brotli or Gzip compression](/speed/optimization/content/compression/) automatically. When developing locally with Wrangler, no compression is applied.

[^2]: **dev indicators**: If you're developing using `wrangler pages dev`, it hard refreshes your application the dev indicator doesn't appear. If you run your app locally using `next dev`, this option works fine.

[^3]: **setting custom build directory**: Applications built using `@cloudflare/next-on-pages` don't rely on the `.next` directory so this option isn't really applicable (the `@cloudflare/next-on-pages` equivalent is to use the `--outdir` flag).

[^4]: **exportPathMap**: Option used for SSG not applicable for apps built using `@cloudflare/next-on-pages`.

[^5]: **logging**: If you're developing using `wrangler pages dev`, the extra logging is not applied (since you are effectively running a production build). If you run your app locally using `next dev`, this option works fine.

[^6]: **onDemandEntries**: Not applicable since it's an option for the Next.js server during development which we don't rely on.

[^7]: **optimizePackageImports**: `@cloudflare/next-on-pages` performs chunks deduplication and provides an implementation based on modules lazy loading, based on this applying an `optimizePackageImports` doesn't have an impact on the output produced by the CLI. This configuration can still however be used to speed up the build process (both when running `next dev` or when generating a production build).

[^8]: **output**: `@cloudflare/next-on-pages` works with the standard Next.js output, `standalone` is incompatible with it, `export` is used to generate a static site which doesn't need `@cloudflare/next-on-pages` to run.

[^9]: **Partial Prerendering (experimental)**: As presented in the official [Next.js documentation](https://nextjs.org/docs/app/api-reference/next-config-js/partial-prerendering): `Partial Prerendering is designed for the Node.js runtime only.`, as such it is fundamentally incompatibly with `@cloudflare/next-on-pages` (which only works on the edge runtime).

[^10]: **productionBrowserSourceMaps**: The webpack chunks deduplication performed by `@cloudflare/next-on-pages` doesn't currently preserve source maps in any case so this option can't be implemented either. In the future we might try to preserver source maps, in such case it should be simple to also support this option.

[^11]: **reactStrictMode**: Currently we build the application so react strict mode (being a local dev feature) doesn't work either way. If we can make strict mode work, this option will most likely work straight away.

[^12]: **runtime configuration**: We could look into implementing the runtime configuration but it is probably not worth it since it is a legacy configuration and environment variables should be used instead.

[^13]: **serverComponentsExternalPackages**: This option is for applications running on Node.js so it's not relevant to applications running on Cloudflare Pages.

### Internationalization

Cloudflare also supports Next.js' [internationalized (`i18n`) routing](https://nextjs.org/docs/pages/building-your-application/routing/internationalization).

### Rendering and Data Fetching

#### Incremental Static Regeneration

If you use Incremental Static Regeneration (ISR)[^14], `@cloudflare/next-on-pages` will use static fallback files that are generated by the build process.

This means that your application will still correctly serve your ISR/prerendered pages (but without the regeneration aspect). If this causes issues for your application, change your pages to use server side rendering (SSR) instead.

<Details header="Background">

ISR pages are built by the Vercel CLI to generate Vercel [Prerender Functions](https://vercel.com/docs/build-output-api/v3/primitives#prerender-functions). These are Node.js serverless functions that can be called in the background while serving the page from the cache.

It is not possible to use these with Cloudflare Pages and they are not compatible with the [edge runtime](https://nextjs.org/docs/app/api-reference/edge) currently.

</Details>

[^14]: [Incremental Static Regeneration (ISR)](https://vercel.com/docs/incremental-static-regeneration) is a rendering mode in Next.js that allows you to automatically cache and periodically regenerate pages with fresh data.

#### Dynamic handling of static routes

`@cloudflare/next-on-pages` supports standard statically generated routes.

It does not support dynamic Node.js-based on-demand handling of such routes.

For more details see:

- [troubleshooting `generateStaticParams`](/pages/framework-guides/nextjs/ssr/troubleshooting/#generatestaticparams)
- [troubleshooting `getStaticPaths` ](/pages/framework-guides/nextjs/ssr/troubleshooting/#getstaticpaths)

#### Caching and Data Revalidation

Revalidation and `next/cache` are supported on Cloudflare Pages and can use various bindings. For more information, see our [caching documentation](/pages/framework-guides/nextjs/ssr/caching/).

---

# Troubleshooting

URL: https://developers.cloudflare.com/pages/framework-guides/nextjs/ssr/troubleshooting/

Learn more about troubleshooting issues with your Full-stack (SSR) Next.js apps using Cloudflare.

## Edge runtime

You must configure all server-side routes in your Next.js project as [Edge runtime](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes) routes, by adding the following to each route:

```js
export const runtime = "edge";
```

:::note

If you are still using the Next.js [Pages router](https://nextjs.org/docs/pages), for page routes, you must use `'experimental-edge'` instead of `'edge'`.
:::

***

## App router

### Not found

Next.js generates a `not-found` route for your application under the hood during the build process. In some circumstances, Next.js can detect that the route requires server-side logic (particularly if computation is being performed in the root layout component) and Next.js automatically creates a [Node.js runtime serverless function](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes) that is not compatible with Cloudflare Pages.

To prevent this, you can provide a custom `not-found` route that explicitly uses the edge runtime:

```ts
export const runtime = 'edge'

export default async function NotFound() {
    // ...
    return (
        // ...
    )
}
```

### `generateStaticParams`

When you use [static site generation (SSG)](https://nextjs.org/docs/pages/building-your-application/rendering/static-site-generation) in the [`/app` directory](https://nextjs.org/docs/getting-started/project-structure) and also use the [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) function, Next.js tries to handle requests for non statically generated routes automatically, and creates a [Node.js runtime serverless function](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes) that is not compatible with Cloudflare Pages.

You can opt out of this behavior by setting [`dynamicParams`](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamicparams) to `false`:

```diff
+ export const dynamicParams = false

// ...
```

### Top-level `getRequestContext`

You must call `getRequestContext` within the function that handles your route â€”Â it cannot be called in global scope.

Don't do this:

```js null {5}
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

const myVariable = getRequestContext().env.MY_VARIABLE

export async function GET(request) {
  return new Response(myVariable)
}
```

Instead, do this:

```js null {6}
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function GET(request) {
  const myVariable = getRequestContext().env.MY_VARIABLE
  return new Response(myVariable)
}
```

***

## Pages router

### `getStaticPaths`

When you use [static site generation (SSG)](https://nextjs.org/docs/pages/building-your-application/rendering/static-site-generation) in the [`/pages` directory](https://nextjs.org/docs/getting-started/project-structure) and also use the [`getStaticPaths`](https://nextjs.org/docs/pages/api-reference/functions/get-static-paths) function, Next.js by default tries to handle requests for non statically generated routes automatically, and creates a [Node.js runtime serverless function](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes) that is not compatible with Cloudflare Pages.

You can opt out of this behavior by specifying a [false `fallback`](https://nextjs.org/docs/pages/api-reference/functions/get-static-paths#fallback-false):

```diff
// ...

export async function getStaticPaths() {
    // ...

    return {
        paths,
+       fallback: false,
	}
}
```

:::caution


Note that the `paths` array cannot be empty since an empty `paths` array causes Next.js to ignore the provided `fallback` value.


:::

---