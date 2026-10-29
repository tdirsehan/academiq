# AcademIQ Tools

AcademIQ Tools is a portfolio of eight focused academic web applications developed by Prof. Dr. Taşkın Dirsehan to support the research-to-publication process from finding articles, framing the academic task and analysing data to journal submission and reviewer response.

## Live website

https://tdirsehan.github.io/academiq/

## Free public tools

1. Academic Prompt Generator  
https://tdirsehan.github.io/academic-prompt-generator/

2. Data2Analysis  
https://tdirsehan.github.io/academiq/data2analysis/

3. Abstract2Keywords  
https://tdirsehan.github.io/abstract2keywords/

4. Abstract2Title  
https://tdirsehan.github.io/abstract2title/

5. Abstract2Journal  
https://tdirsehan.github.io/abstract2journal/

6. Abstract2CoverLetter  
https://tdirsehan.github.io/abstract2coverletter/

7. Review Splitter  
https://tdirsehan.github.io/review-splitter/

8. Title2DOI  
https://tdirsehan.github.io/academiq/title2doi/

All eight tools are freely accessible. There is no subscription, institutional licence, or required payment. The main website also provides an embedded launcher so tools can be used without first leaving the AcademIQ landing page, while each tool can also be opened directly in its own GitHub Pages application. Publisher full text reached through Title2DOI may require payment or institutional access.

## Integrated research workflow

Title2DOI / article access
→ Research task / prompt
→ Data2Analysis
→ Abstract2Keywords
→ Abstract2Title
→ Abstract2Journal
→ Abstract2CoverLetter
→ Review Splitter

The tools are modular and can be used independently. Together they support distinct stages in the research-to-publication journey.

## Data2Analysis

Data2Analysis accepts CSV, TSV, XLSX and XLS files in the browser. It diagnoses variable types, classifies the dataset as qualitative, quantitative or mixed, recommends methods supported by the observed data structure, and runs selected analyses without uploading the dataset to an AcademIQ server.

Current quantitative analyses include descriptive statistics, frequency analysis, Pearson correlation, Welch independent-samples t-test, one-way ANOVA, chi-square test of independence with Cramér's V, and simple linear regression. The qualitative module provides lexical exploration using term and bigram frequency plus representative-text retrieval; it is not presented as a replacement for human qualitative coding or full thematic analysis.

## Open-access and donation-supported model

AcademIQ follows a free-access model:

Free Access → Optional Donation → Continued Maintenance and Development

Donations are voluntary. A donation does not unlock additional access, features, or service commitments. All users receive the same public access to the available AcademIQ tools.

Support link: https://github.com/sponsors/tdirsehan

## Responsible use

AcademIQ Tools supports academic work but does not replace scholarly judgement, peer review, editorial decisions, source verification, methodological assumptions, or institutional research governance.

Scores such as Prompt Quality, Title Fit, Journal Fit, Aims & Scope Fit, Cover Letter Quality, and statistical outputs are decision-support indicators rather than guarantees. Journal Fit is not an acceptance probability, and statistical significance does not by itself establish causality or methodological adequacy.

Abstract2Journal uses OpenAlex to retrieve publication evidence. Title2DOI sends submitted article titles, optional author surnames and publication years, or a DOI, directly from the browser to Crossref. It stores no persistent search history and shows title-similarity candidates rather than asserting that every result is the correct article. Other modules may operate locally in the browser as described in their interfaces.

## Title2DOI

The [Title2DOI module](title2doi/) finds DOI records and publisher links from article titles. Optional author and year fields narrow the search; DOI input retrieves its record directly. Results display title, authors, publication year, journal, DOI, and article links, with a copy-DOI action. See [module documentation](title2doi/README.md) for matching, coverage and network behavior.

## Legal / information pages

- Privacy: https://tdirsehan.github.io/academiq/privacy.html
- Terms: https://tdirsehan.github.io/academiq/terms.html


## Security and supported import limits

Data2Analysis uses vendored SheetJS CE 0.20.3 and jStat 1.9.6. Imports run in a dedicated Worker and are limited to 5 MiB, 10,000 data rows and 100 columns, with a 10-second parsing timeout. Dataset contents stay in the browser. See [SECURITY.md](SECURITY.md) for additional text/archive limits, dependency provenance, browser protections and GitHub Pages header limitations.

After changing scripts or styles, run `npm run security:refresh` and `npm test` before publishing so CSP and resource integrity hashes remain current.

## Visual identity and catalogue

The catalogue uses the AcademIQ navy/blue logo at `assets/academiq-logo.png`, with shared header display styles in `assets/brand.css`. The original transparent artwork is reused without raster edits. The homepage includes stage filters, a local text search, mobile navigation, and direct/embedded access to all eight tools. Search terms remain in the browser. Data2Analysis, Title2DOI and the information pages share the updated logo. Separately hosted module repositories retain their own interfaces.

## Interface language

The module interfaces use English, including Title2DOI messages and both Social Analyzer routes. Search results, author names, supplied research text and user comments retain their original language. Multilingual matching and analysis dictionaries are preserved. Language checks run with `npm test`.


## Research Question Builder

Open `research-question-builder/` to define a research problem and select 1–10 questions. The module prepares an English prompt for ChatGPT with sequential RQ1:, RQ2: labels, optional context, population and method constraints. It does not call an AI API or save entered data. Illustrative questions are explicitly labelled.
