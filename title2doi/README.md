# Title2DOI · AcademIQ

Public module: https://tdirsehan.github.io/academiq/title2doi/

Article titles are searched in Crossref using `query.bibliographic`; optional `query.author` and publication-year filters narrow the search. Title searches target journal articles. DOI input uses Crossref's single-record endpoint, which can also return other registered work types. Crossref coverage is not exhaustive.

Up to 40 relevance-ranked candidates are retrieved. When none has an exact normalized title match, a second, sequential pool of up to 20 candidates ordered by citation count is retrieved after a 1.2-second gap. Citation count broadens retrieval only; final ranking uses normalized title equality and token overlap. At most six unique DOI records are displayed. An exact title label refers to text similarity, not independently verified article identity. Authors, date and journal should be checked. No DOI or access URL is generated without a returned DOI record.

Result cards include bibliographic details, a DOI copy button, a DOI resolver link, and a publisher link when a permitted HTTPS URL is present in the record. Full text may require payment or institutional access. No unauthorized copies or paywall bypass are offered.

Searches are submitted directly to `https://api.crossref.org` on form submission. No account, API key, server proxy, database, analytics or runtime dependency is required by this module. No persistent search history is stored. A bounded in-memory cache holds up to 12 searches until the page is closed or reloaded. Rate limits, connectivity, timeouts and coverage can prevent results. The supplementary request failing preserves usable primary candidates.

Untrusted metadata is length-limited and rendered as text nodes. API responses are bounded to 1 MB per request. External article links must be HTTPS without credentials, IP addresses or local hostnames. DOI resolver URLs are constructed under `https://doi.org/`. Searches are cancelable and time-limited. GitHub Pages supports the included CSP meta policy; additional HTTP response-header protections require hosting support as described in [SECURITY.md](../SECURITY.md).

After editing, run `npm run security:refresh` and `npm test` from the repository root. This updates the content-versioned core import, HTML resource URLs, CSP and SRI. The module-specific tests are in `tests/title2doi.test.mjs`.

API documentation:
- https://www.crossref.org/documentation/retrieve-metadata/rest-api/
- https://github.com/CrossRef/rest-api-doc
