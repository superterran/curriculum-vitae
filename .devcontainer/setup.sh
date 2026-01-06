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

# Install LaTeX for PDF generation
echo "📦 Installing LaTeX (this may take a few minutes)..."
sudo apt-get update -qq
sudo apt-get install -y -qq texlive-xetex texlive-fonts-recommended texlive-fonts-extra

# Install Node.js dependencies
echo "📦 Installing npm packages..."
npm install

# Build resume and generate all formats
echo "📄 Building resume and generating DOCX/PDF..."
npm run build
npm run build:docs

echo "✅ Setup complete! Resume formats available in dist/"
