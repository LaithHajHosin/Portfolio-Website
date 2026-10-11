# Projects folder structure review

Reviewed on 2026-10-11 after adding project ordering and catalog-driven landing-page filters.

## Assessment

**The current structure is good for a small collection of standalone demos.** It is consistent, easy to navigate, and all checked local references resolve. It does not need another `internal/` or `external/` layer yet; the previous outline below this note described a proposed structure, not the actual repository, and has been replaced with the verified layout.

## Verified structure

```text
projects/
├── README.md
├── projects.js
├── appear-array-image/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── README.md
├── ... 25 more standalone project folders with the same four files
```

- There are **26** project folders. Every folder contains `index.html`, `style.css`, `script.js`, and `README.md`.
- `projects.js` is the shared landing-page catalog; each record has an explicit `order`, and lower numbers appear first. It also defines the filter-button labels and values.
- The landing page renders the mini-project cards from that catalog. Its featured AI project cards remain hand-authored in `index.html`; the AI filter is retained for them.
- The catalog's default card image is `assets/icons/app.png`, which exists in the repository. Project-specific pages also reference shared media under `assets/`.
- All checked local HTML asset references, demo paths, catalog image paths, and stylesheet/script links resolve.
- Seven projects have an empty `script.js` because their source demo has no JavaScript; the files are retained to keep each project folder's layout predictable, not because scripts are missing.
- Per-project READMEs now describe the shared asset location correctly.

## Remaining improvements

- Some catalog values repeat the same information (for example `description`/`desc`, `url`/`extra_information.demo_path`, and `tags`/`extra_information.tags`). Keep them synchronized for now; consider adopting one canonical field per value if the card renderer is refactored.
- The 26 demos currently share the `frontend` card category. The filter configuration includes `All Projects`, `Frontend`, and `AI / ML`; the latter is for the featured AI cards. Add a filter only when cards use its category.
- Card thumbnails currently use the same default icon. Add project-specific thumbnails to `assets/` and update each record's `image_path` when suitable previews are available.

## Conclusion

The folder layout and local links are sound for the current scale. The ordering and filter definitions are now centralized in `projects.js`; future maintenance should keep the catalog, shared asset paths, and README references aligned.
