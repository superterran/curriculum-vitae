#!/bin/bash
set -e

echo "🔧 Setting up Resume Builder environment..."

# Install yq for YAML processing
echo "📦 Installing yq..."
sudo wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64
sudo chmod +x /usr/local/bin/yq

# Install Pandoc for document conversion
echo "📦 Installing Pandoc..."
PANDOC_VERSION="3.1.11"
wget -q https://github.com/jgm/pandoc/releases/download/${PANDOC_VERSION}/pandoc-${PANDOC_VERSION}-linux-amd64.tar.gz
sudo tar xzf pandoc-${PANDOC_VERSION}-linux-amd64.tar.gz --strip-components 1 -C /usr/local/
rm pandoc-${PANDOC_VERSION}-linux-amd64.tar.gz

# Install Node.js dependencies
echo "📦 Installing npm packages..."
npm install

# Build resume and generate all formats
echo "📄 Building resume and generating DOCX..."
npm run build
npm run build:md
npm run build:docx || true

echo "✅ Setup complete! Resume formats available in dist/"
