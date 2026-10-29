# Security controls

The public AcademIQ catalogue and Data2Analysis are static GitHub Pages applications. No research dataset is uploaded to an AcademIQ server by Data2Analysis. Separate tools linked from the catalogue may have their own network behavior.

## Dependency and import controls

- SheetJS CE is pinned to 0.20.3, which is beyond the affected ranges for CVE-2023-30533 and CVE-2024-22363. SheetJS and jStat are vendored with licenses and SHA-384 checksums under `data2analysis/vendor/`.
- The SheetJS official CDN rejected this build environment. Its published 0.20.3 archive was retrieved from the SheetXL mirror and checked against both the archive SHA-512 pinned by that mirror and the standalone script SHA-384 pinned by Anthropic's official plugin repository. Retrieval provenance is recorded in `vendor/manifest.json`.
- Spreadsheet parsing runs in a dedicated, terminable Worker. The main page cancels an import after 10 seconds, cancels stale readers when another file or sample is selected, and does not fall back to parsing untrusted workbooks on the main thread.
- Imports are bounded to 5 MiB, 10,000 data rows, 100 columns, 10,000 characters per cell and 2 million total text characters. XLSX central-directory metadata is checked for a 25 MiB declared expanded size and 512 entries. Metadata checks do not guarantee a strict browser memory ceiling; malformed data must still be treated as untrusted.
- CSV codebook exports prefix formula-like string values to prevent spreadsheet formula execution on opening an exported file.

## Browser controls

All HTML pages in this repository include a hash-based script CSP and no-referrer policy. Script event attributes are prohibited. External runtime scripts have been removed from Data2Analysis; local HTML script/style references have SRI hashes. Styles retain inline permission for existing presentation and dynamically generated charts. The launcher permits only the seven documented module URLs.

GitHub Pages does not expose per-repository custom HTTP response-header configuration. The HTML meta CSP therefore cannot enforce `frame-ancestors`, `X-Frame-Options`, `Permissions-Policy` or `X-Content-Type-Options`. No ineffective `_headers` file or unsupported meta equivalents are presented as protection. HTTPS/HSTS and hosting infrastructure remain managed by GitHub Pages. Header-level embedding restrictions would require a host or reverse proxy that supports those headers.

## Maintenance and scope

Run `npm run security:refresh` after changing scripts or styles, then `npm test` before publishing. The refresh command rebuilds CSP and SRI hashes. No runtime package installation is required.

These controls reduce specific risks; they are not an assurance that every possible vulnerability has been excluded. GitHub account security, authorized source edits, browser extensions and separately hosted module repositories are outside these changes.

References:
- https://cdn.sheetjs.com/advisories/CVE-2023-30533
- https://cdn.sheetjs.com/advisories/CVE-2024-22363
- https://docs.sheetjs.com/docs/getting-started/installation/standalone/
- https://github.com/sheetxl/vendor-xlsx
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy
