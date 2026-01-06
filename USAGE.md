# Resume Builder

A YAML-first, multi-format resume generation system with support for variants and cover letters. Built on the [JSONResume](https://jsonresume.org/) standard.

## Features

- 📝 **YAML-first authoring** with private field support (fields starting with `_`)
- 🎨 **Multiple output formats**: HTML, PDF, DOCX, JSON, Markdown
- 🎯 **Variant support** for job-specific resumes (e.g., `v2026.1.0-apple`)
- 💌 **Cover letter generation** with templates
- 🚀 **Automated deployment** to GitHub Pages
- 📦 **GitHub Releases** with all format artifacts
- 🔄 **Live development** with hot reload

## Quick Start

### Local Development

```bash
# Install dependencies (done automatically in devcontainer)
npm install

# Build resume
npm run build

# Build and serve locally (with hot reload)
npm run dev
```

Visit http://localhost:3000 to preview your resume.

### Project Structure

```
cv/
├── resume/
│   ├── data.yaml              # Main resume (source of truth)
│   ├── variants/              # Job-specific overlays
│   │   └── apple-ios.yaml
│   └── cover-letters/         # Cover letter data
│       └── apple.yaml
├── templates/
│   ├── resume.md.hbs          # Resume markdown template
│   └── cover.md.hbs           # Cover letter template
├── scripts/
│   ├── build.js               # Main build script
│   ├── build-variant.js       # Variant builder
│   ├── build-cover.js         # Cover letter builder
│   ├── generate-markdown.js   # Markdown generator
│   └── release.js             # Release helper
├── dist/                      # Generated outputs (gitignored)
└── public/                    # GitHub Pages output
```

## Usage

### Editing Your Resume

Edit `resume/data.yaml` with your information. The file follows the [JSONResume schema](https://jsonresume.org/schema/).

**Private fields** (starting with `_`) are filtered out of the public JSON:

```yaml
# Configuration (private, not exported)
_theme: jsonresume-theme-elegant
_domain: resume.doughatcher.com

# Public data
basics:
  name: Doug Hatcher
  email: doug@example.com
  # ...
```

### Building Formats

```bash
# Build all formats
npm run build:all

# Build specific formats
npm run build:md      # Markdown
npm run build:html    # HTML
npm run build:pdf     # PDF (requires LaTeX)
npm run build:docx    # Word document
```

### Creating Variants

Variants allow you to create job-specific resumes by overlaying customizations on your base resume.

1. **Create a variant file**: `resume/variants/company-name.yaml`
2. **Build the variant**: `npm run build:variant company-name`

Example variant (`resume/variants/apple-ios.yaml`):

```yaml
basics:
  summary: |
    Custom summary emphasizing iOS experience...

# Only include specific projects
projects:
  - name: Apple WW Digital Channel
  - name: Booksio
  - name: Nintendo of America
```

The variant will be merged with your base data using `yq`.

### Creating Cover Letters

1. **Create cover letter data**: `resume/cover-letters/company.yaml`
2. **Build the cover letter**: `npm run build:cover company`

Example (`resume/cover-letters/apple.yaml`):

```yaml
position: Senior Infrastructure Engineer
company: Apple
date: "2026-01-05"
intro: |
  I am writing to express my interest...

highlights:
  - title: Proven Apple Experience
    description: |
      Successfully delivered...
```

### Creating Releases

Use the interactive release tool:

```bash
npm run release
```

This will:
1. Prompt for version number (e.g., `v2026.1.1`)
2. Optionally create a variant release (e.g., `v2026.1.1-apple`)
3. Build all necessary formats
4. Create a git tag
5. Instruct you to push the tag to trigger GitHub Actions

**Push the tag to create a GitHub Release:**

```bash
git push origin v2026.1.1-apple
```

GitHub Actions will automatically:
- Build all formats (JSON, MD, HTML, PDF, DOCX)
- Build variant and cover letter if applicable
- Create a GitHub Release with all files as downloadable artifacts

### Changing Themes

Edit `_theme` in `resume/data.yaml`:

```yaml
_theme: jsonresume-theme-elegant
```

Available themes: [Browse on npm](https://www.npmjs.com/search?q=jsonresume-theme)

Popular options:
- `jsonresume-theme-elegant`
- `jsonresume-theme-even`
- `jsonresume-theme-stackoverflow`
- `jsonresume-theme-kendall`

Install a new theme:

```bash
npm install jsonresume-theme-<name> --save-dev
```

## Deployment

### GitHub Pages

The resume automatically deploys to GitHub Pages on every push to `main`. Configure in GitHub:

1. Go to **Settings → Pages**
2. Set source to **GitHub Actions**
3. Your resume will be available at `https://yourusername.github.io/cv/`

### Custom Domain

Set `_domain` in `resume/data.yaml`:

```yaml
_domain: resume.doughatcher.com
```

Then configure DNS:

```
Type: CNAME
Name: resume
Value: yourusername.github.io
```

## Development

### Watch Mode

```bash
npm run dev
```

Watches `resume/data.yaml` for changes and rebuilds automatically.

### Validation

```bash
npm run validate
```

Validates your resume against the JSONResume schema.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build resume.json from YAML |
| `npm run build:all` | Build all formats |
| `npm run build:formats` | Build MD, HTML, PDF, DOCX |
| `npm run build:variant <name>` | Build job-specific variant |
| `npm run build:cover <name>` | Build cover letter |
| `npm run dev` | Watch and rebuild + serve locally |
| `npm run serve` | Serve dist/ locally |
| `npm run validate` | Validate JSONResume schema |
| `npm run release` | Interactive release tool |

## Technologies

- **YAML Processing**: [js-yaml](https://github.com/nodeca/js-yaml), [yq](https://github.com/mikefarah/yq)
- **Templates**: [Handlebars](https://handlebarsjs.com/)
- **JSONResume**: [resumed](https://github.com/rbardini/resumed)
- **Document Conversion**: [Pandoc](https://pandoc.org/)
- **Deployment**: GitHub Actions + GitHub Pages

## License

Private

## Customization

### Custom Templates

Edit templates in `templates/`:
- `resume.md.hbs` - Resume markdown template
- `cover.md.hbs` - Cover letter template

### Custom Word Styles

1. Generate a resume: `npm run build:docx`
2. Open `dist/resume.docx` in Word
3. Modify styles (Heading 1, Heading 2, Normal, etc.)
4. Save as `templates/reference.docx`
5. Future builds will use your custom styles

## Troubleshooting

**PDF generation fails:**
- Requires LaTeX (xelatex). Install via `apt-get install texlive-xetex` or skip PDF generation.

**Theme not working:**
- Make sure the theme is installed: `npm install jsonresume-theme-<name>`
- Update `_theme` in `resume/data.yaml`

**Variant merge not working:**
- Ensure `yq` is installed and in PATH
- Check YAML syntax in variant files

## Contributing

This is a personal CV repository, but feel free to fork and adapt for your own use!
