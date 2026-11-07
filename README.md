# Portfolio

A motion-led personal portfolio with a built-in admin panel. Every word, image, project, colour and section can be changed from `/admin` without touching code.

Built with Next.js, GSAP, Lenis and Vercel Blob.

## Run it locally

```bash
npm install
```

Create a file called `.env.local` in the project folder:

```
ADMIN_PASSWORD=choose-a-long-password-here
```

The password must be at least 12 characters. Then start the site:

```bash
npm run dev
```

The site is at http://localhost:3000 and the admin is at http://localhost:3000/admin. Locally, content and uploads are saved to a `.data` folder, so no other setup is needed.

## Deploy to Vercel

### Option 1: import this repository

1. Go to [vercel.com/new](https://vercel.com/new) and import this repository.
2. Under **Environment Variables**, add `ADMIN_PASSWORD` with a password of at least 12 characters.
3. Click **Deploy**.
4. In the new project, open **Storage**, then **Create Database**, then **Blob**. Set the access to **Private** and connect it to the project in all environments.
5. Open **Deployments** and redeploy the latest one, so it picks up the storage connection.

The admin can't save until step 4 is done, and it will tell you so.

### Option 2: one-click deploy

This creates your own copy of the repository, and sets up the storage for you:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAhsan-Yasin%2Fnew_portfolio&env=ADMIN_PASSWORD&envDescription=The%20password%20for%20the%20admin%20panel.%20At%20least%2012%20characters.&stores=%5B%7B%22type%22%3A%22blob%22%2C%22access%22%3A%22private%22%7D%5D)

## Make it yours

1. Go to `/admin` on your site and sign in.
2. The **Overview** page has a checklist: add your name and photo, then replace the sample projects.
3. Click **Publish**.

The site starts with sample content for a fictional person. Until your first publish, search engines are asked not to index it.

## How the admin works

- **Everything autosaves as a draft.** Visitors only see changes after you click **Publish**, and they see them immediately.
- **Preview** shows your draft exactly as it will look, on desktop or phone.
- **History and backup** keeps your last 30 published versions, which you can restore, and lets you export or import everything as a file.
- **Design** controls the accent colour, fonts, corner style, light or dark mode, and how much animation the site uses.
- **Sections** reorders or hides any part of the home page.

## Good to know

- To change the admin password, update `ADMIN_PASSWORD` in your Vercel project settings and redeploy. This signs out every existing session.
- Visitors who have asked their device to reduce motion get a calm, static version of the site automatically.
- The resume page at `/resume` is generated from your content and prints cleanly as a PDF. You can also upload your own PDF under **Profile**.
