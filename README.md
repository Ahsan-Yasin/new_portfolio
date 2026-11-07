# Ahsan Yasin: portfolio

A motion-led personal portfolio with a built-in admin panel. Every word, image, project, colour and section can be changed from `/admin` without touching code.

Built with Next.js, GSAP, Lenis and Vercel Blob.

## Run it locally

```bash
npm install
```

```bash
npm run dev
```

The site is at http://localhost:3000 and the admin is at http://localhost:3000/admin. Locally, content and uploads are saved to a `.data` folder, so no other setup is needed.

## Deploy to Vercel

### Option 1: import this repository

1. Go to [vercel.com/new](https://vercel.com/new) and import this repository.
2. Click **Deploy**.
3. In the new project, open **Storage**, then **Create Database**, then **Blob**. Set the access to **Private** and connect it to the project in all environments.
4. Open **Deployments** and redeploy the latest one, so it picks up the storage connection.

The admin can't save until step 3 is done, and it will tell you so.

### Option 2: one-click deploy

This creates your own copy of the repository, and sets up the storage for you:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAhsan-Yasin%2Fnew_portfolio&stores=%5B%7B%22type%22%3A%22blob%22%2C%22access%22%3A%22private%22%7D%5D)

## Editing the site

Go to `/admin` on your site and sign in. The starting content comes from `src/lib/content/seed.ts`. Once you publish from the admin, what you saved there takes over.

## How the admin works

- **Everything autosaves as a draft.** Visitors only see changes after you click **Publish**, and they see them immediately.
- **Preview** shows your draft exactly as it will look, on desktop or phone.
- **History and backup** keeps your last 30 published versions, which you can restore, and lets you export or import everything as a file.
- **Design** controls the accent colour, fonts, corner style, light or dark mode, and how much animation the site uses.
- **Sections** reorders or hides any part of the home page.

## Good to know

- The admin password is set in the code, in `src/lib/auth/token.ts`. To change it, edit that line and push. This signs out every existing session. While this repository is public, anyone who reads that file can sign in.
- Visitors who have asked their device to reduce motion get a calm, static version of the site automatically.
- The resume page at `/resume` is generated from your content and prints cleanly as a PDF. You can also upload your own PDF under **Profile**.
