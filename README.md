# View Counter Badge

![View counter badge](https://view-counter.jim60105.workers.dev)

Count how many visitors any page gets. A simple solution to add a view counter badge to your readme files or web page.

> [!Note]
> I have rewritten this worker from KV storage to D1 storage.  
> The main reason is that the free plan **_limits KV to 1,000 write, delete, list operations per day_**, but **_allows D1 for 100,000 rows written per day_**, and the KV limit is lower than the daily views of my site.
>
> **The following are the differences from upstream**
>
> - Change from KV storage to D1 database.
> - Migrate project from JavaScript to TypeScript.
> - Migrate from Service Workers to ES Modules (D1 can only works with ES Modules).
> - Update CI workflow.

## Usage

The view counter badge is meant to be deployed individually for each profile/user. Click the button and then follow the steps below to deploy your own view counter in no time!

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/jim60105/worker-view-counter-badge)

### Set your app name

In `wrangler.toml` and change the `name` property - this will be the subdomain that your app is published on.

Your Cloudflare workers domain will be of the format `{your-worker-domain}.workers.dev`. When you publish an app on a Worker,
it will be published on a subdomain corresponding to your app name - `{worker-name}.{your-worker-domain}.workers.dev` by default.

### Create D1 Database

Create a new D1 Database, it's important that you name it `ViewCounter`. Then edit your `wrangler.toml` and change the `database_id` property with the id. Following these steps:

#### Step 1: Create a new D1 Database

> [!IMPORTANT]  
> Execute the following command in your working directory.

Create a new D1 Database with the name `ViewCounter`.

```bash
wrangler d1 create ViewCounter
```

You will get a response with the `database_id` like this:

```bash
✅ Successfully created DB 'ViewCounter' in region APAC
Created your database using D1's new storage backend. The new storage backend is not yet recommended for production
workloads, but backs up your data via point-in-time restore.

[[d1_databases]]
binding = "DB" # i.e. available in your Worker on env.DB
database_name = "ViewCounter"
database_id = "72f5fd97-3f01-40e7-b31f-6c3117a9c624"
```

#### Step 2: Update `wrangler.toml`

Fill the `database_id` property in `wrangler.toml` with the id you got in the previous step.

> [!IMPORTANT]  
> `binding` and `database_name` must be `ViewCounter` for our code to work.

```toml
[[d1_databases]]
binding = "ViewCounter"
database_id = "72f5fd97-3f01-40e7-b31f-6c3117a9c624" # Your database id
database_name = "ViewCounter"
```

#### Step 3: Create the table

Create a table named `ViewCounter` with `init_database.sql`

```bash
wrangler d1 execute ViewCounter --file=./init_database.sql
```

### Get your Account ID and create a new API Token

To get your account ID:

- Go to <https://dash.cloudflare.com> > Workers
- Copy your account ID

To create a new API Token:

- Go to <https://dash.cloudflare.com/profile/api-tokens> > Create Token
- Give your token a name (i.e. Github Actions)
- Choose start with template
- Select the "Edit Cloudflare Workers" template
- Account Resources > Include > {your account}
- Zone Resources > Include > All zones from account > {your account}

Once done, navigate to your GitHub repository > Settings > Secrets and add the following secrets:

```text
- Name: CF_API_TOKEN
- Value: your-api-token

- Name: CF_ACCOUNT_ID
- Value: your-account-id
```

Now if you push a new commit into `master` and you'll find your view counter deployed at `{worker-name}.{your-worker-domain}.workers.dev`

## Add counter to README

```html
<img src="https://<Your-cloudflare-deployment>.workers.dev" alt="View counter badge" />
```

OR

```markdown
![View counter badge](https://<Your-cloudflare-deployment>.workers.dev)
```

## Customization

You can pass arguments to customize your view counter. The badge is created using `badgen` so all the options supported by `badgen` except for icon and iconWidth can be used.

|  Parameter   | Default |         Allowed values          |      Example       |
| :----------: | :-----: | :-----------------------------: | :----------------: |
|   `label`    |  Views  |           Any string            |  `label=Visitors`  |
| `labelColor` |   555   | RGB values or valid color names | `labelColor=black` |
|   `color`    |  blue   | RGB values or valid color names |   `color=green`    |
|   `style`    |  flat   |       `flat` or `classic`       |  `style=classic`   |
|   `scale`    |    1    |           Any integer           |     `scale=2`      |

Valid color names are:

```text
blue, cyan, green, yellow, orange, red, pink, purple, grey, black
```

Example of a counter with parameters:

```text
https://<Your cloudflare deployment>.workers.dev?style=classic&labelColor=black&color=green
```

## Multiple Deployments

You can deploy multiple view counters under the same GitHub account and Cloudflare account.

1. Create a new git branch.
2. Change the `name` in `wrangler.toml` to deploy on a different subdomain.
3. Change the `CounterName` in `src/index.ts` to any other name you like.
4. Then trigger the GitHub workflow again.

## License

MIT License  
Copyright (c) 2022 Aveek Saha and 陳鈞
