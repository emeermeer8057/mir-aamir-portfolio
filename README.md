# Mir Aamir — Exact React Frontend

This version preserves the supplied site's original HTML structure, CSS, page-transition animation system, animated headline, mobile header, theme panel, portfolio effects, and other legacy interactions inside a React/Vite application.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Contact form

GitHub Pages cannot run Node/PHP. For a working static contact form, create a Formspree form and set:

```env
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/YOUR_FORM_ID
```

Without it, the form falls back to the user's email client.

## GitHub Pages

Push this project to GitHub and use the included Actions workflow.

If the repository is named `mir-aamir-portfolio`, the workflow automatically builds with:

```text
/mir-aamir-portfolio/
```

The site will be available at:

```text
https://YOUR_USERNAME.github.io/mir-aamir-portfolio/
```


## Important: legacy animation boot

The supplied template uses a legacy jQuery `window.load` preloader. Because React injects the original DOM after the browser load event, this conversion explicitly runs that preloader initialization after the legacy scripts load. This prevents the site from remaining on the original loader screen while retaining the original page-transition system.


## Content source
The page content and assets in this build are taken from the supplied `css.zip` (`default.php` and its asset folders), while the React bootstrap and animation-compatible wrapper are retained from the fixed version.
