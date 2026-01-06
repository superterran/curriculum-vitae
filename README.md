# Doug Hatcher - Resume

Multi-format resume builder powered by YAML and JSONResume.

## Quick Start

```bash
# Build resume
npm run build

# Generate all formats (HTML, PDF, DOCX, MD)
npm run build:all

# Preview locally
npm run dev
```

Visit http://localhost:3000 to preview.

## Features

- 📝 **YAML-first** - Author in human-friendly YAML with comments and private fields
- 🎨 **Multi-format** - Generate HTML, PDF, DOCX, JSON, and Markdown
- 🎯 **Variants** - Create job-specific resumes (e.g., `npm run build:variant apple-ios`)
- 💌 **Cover Letters** - Template-based cover letter generation
- 🚀 **Auto-deploy** - GitHub Pages deployment on every push
- 📦 **Releases** - Automated GitHub Releases with all formats

## Project Structure

```
resume/data.yaml         # Main resume (edit this!)
resume/variants/         # Job-specific overlays
resume/cover-letters/    # Cover letter data
dist/                    # Generated outputs
```

## Creating Releases

```bash
npm run release
```

Interactive tool to create version tags like `v2026.1.0` or `v2026.1.0-apple`.

Push tags to trigger automated GitHub Releases:
```bash
git push origin v2026.1.0-apple
```

## Documentation

See [USAGE.md](USAGE.md) for complete documentation.

## Live Resume

🌐 **https://resume.doughatcher.com**

---

*Built with [JSONResume](https://jsonresume.org/)*


