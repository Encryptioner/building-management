# 🏢 Building Management

A modern, sleek web application for managing apartment buildings, including creating and managing service charge bills and resident info. Built with Astro, React, TypeScript, and Tailwind CSS.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D22-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue.svg)
![pnpm](https://img.shields.io/badge/pnpm-9-orange.svg)

## ✨ Features

- 📊 **Multi-Category Support** - Add unlimited service charge categories
- 💰 **Flexible Billing** - Single flat or divided across all flats
- 🌍 **Multi-Language** - Easy to add new languages (currently English and Bangla)
- 🖨️ **Print & PDF** - Professional preview and PDF download
- 💾 **Auto-Save** - Never lose your work with local storage
- 📱 **Responsive** - Works perfectly on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, professional design with Tailwind CSS
- ⚡ **Fast** - Built with Astro for optimal performance
- 🔒 **Privacy-First** - All data stays in your browser
- 📴 **Offline Support** - PWA with service worker for offline use
- 📲 **Installable** - Add to home screen on mobile devices

## 📋 Prerequisites

- **Node.js**: Version 22 or higher ([Download](https://nodejs.org/))
- **pnpm**: Fast, disk space efficient package manager ([Installation Guide](https://pnpm.io/installation))

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server (runs at http://localhost:4321)
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview
```

## 🎯 First Time Using the App

1. Click **"Load Example Data"** at the top to see a pre-filled bill
2. **Switch Language** using the dropdown to see Bangla (বাংলা) version
3. Try **adding categories** with the "Add Category" button
4. Click **Preview** to see the formatted bill
5. **Download PDF** or **Print** to test export functionality

## 🛠 Tech Stack

- **[Astro](https://astro.build/)** - Web framework
- **[React](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[jsPDF](https://github.com/parallax/jsPDF)** - PDF generation
- **[html2canvas](https://html2canvas.hertzen.com/)** - HTML to canvas/image

## 🧞 Available Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`            | Install dependencies                             |
| `pnpm dev`                | Start local dev server at `localhost:4321`       |
| `pnpm build`              | Build production site to `./dist/`               |
| `pnpm build:github`       | Build for GitHub Pages deployment                |
| `pnpm build:custom`       | Build for custom domain deployment               |
| `pnpm preview`            | Preview production build locally                 |
| `pnpm astro check`        | Run TypeScript type checking                     |

## 🌐 Deployment

This project supports **two deployment modes**:

### GitHub Pages (Current Default)
```bash
pnpm build:github  # or just pnpm build
git push origin main
```
Deployed at: `https://encryptioner.github.io/building-management/`

### Custom Domain
```bash
pnpm build:custom
# Then deploy dist/ to your hosting
```

📚 **Full deployment guide:** See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🔧 Troubleshooting

### PDF Download Not Working?
- Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Check browser console for errors
- The app automatically handles Tailwind CSS v4 OKLCH colors

### Print Shows Multiple Pages?
- This has been fixed in the latest version
- Make sure you've pulled the latest changes and rebuilt

### React Hydration Errors?
- This has been fixed - language preference now loads properly
- Clear browser cache if you see lingering errors

### Port Already in Use?
```bash
# Kill process on port 4321
lsof -ti:4321 | xargs kill -9

# Or use different port
pnpm dev -- --port 3000
```

## 🌍 Adding New Languages

Want to add Hindi, Spanish, or another language? It's easy!

See [ADD_LANGUAGE.md](ADD_LANGUAGE.md) for a step-by-step guide.

Currently supported:
- 🇬🇧 English
- 🇧🇩 Bangla (বাংলা)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Ankur Mursalin**

- [Website](https://encryptioner.github.io/)
- [LinkedIn](https://www.linkedin.com/in/mir-mursalin-ankur)
- [Github](https://github.com/Encryptioner)

## 🙏 Acknowledgments

- Built with [Astro](https://astro.build/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)

---

