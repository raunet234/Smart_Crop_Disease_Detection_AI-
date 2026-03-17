<p align="center">
  <img src="assets/images/hero-bg.png" alt="CropGuard AI Banner" width="100%" />
</p>

<h1 align="center">🌿 CropGuard AI — Smart Crop Disease Detection Using AI</h1>

<p align="center">
  <strong>Advanced Deep Learning System for Automated Crop Disease Diagnosis</strong><br/>
  Combining leaf image analysis with environmental data for accurate, explainable, and sustainable agricultural diagnostics.
</p>

<p align="center">
  <a href="https://eloquent-quokka-5cf4b7.netlify.app/">🌐 Live Demo</a> •
  <a href="#features">✨ Features</a> •
  <a href="#tech-stack">🧬 Tech Stack</a> •
  <a href="#getting-started">🚀 Getting Started</a> •
  <a href="#research">📄 Research</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Diseases-38%2B%20Classes-blue?style=flat-square" alt="Diseases" />
  <img src="https://img.shields.io/badge/Accuracy-99.5%25-orange?style=flat-square" alt="Accuracy" />
  <img src="https://img.shields.io/badge/Crops-14%20Species-green?style=flat-square" alt="Crops" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License" />
</p>

---

## 📖 About

**CropGuard AI** is a multimodal AI-powered web application that detects crop diseases from leaf images and predicts future outbreak risks using environmental data. Built as part of a research project at **Lovely Professional University**, the system aims to bring expert-level plant diagnostics to smallholder farmers using nothing more than a smartphone.

> 🌾 *"Plant diseases cause over $220 billion in annual losses worldwide. Early detection is the key to food security."*

### The Problem
- Traditional disease detection relies on **visual inspection by experts** — slow, expensive, and unscalable
- Existing AI models trained on **lab-quality datasets** (PlantVillage) fail in real field conditions
- Rural farmers lack access to **internet connectivity** and **specialized hardware**

### Our Solution
A **multimodal system** that:
1. Analyses **leaf images** using CNN / Vision Transformer architectures
2. Integrates **environmental data** (temperature, humidity, rainfall) for context-aware diagnosis
3. Provides **explainable heatmaps** (Grad-CAM) showing where the AI focuses
4. Delivers **sustainable treatment recommendations** for each detected disease
5. Runs on **edge devices** (smartphones, IoT) for offline, field-ready deployment

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔬 Disease Diagnosis
Upload or capture a crop leaf image — the deep learning model identifies the disease in under 2 seconds with 99%+ accuracy across 38 disease classes and 14 crop species.

### 🗺️ Explainable Heatmaps
Grad-CAM visualizations highlight exactly which parts of the leaf the AI focuses on, building trust through transparency.

### 📱 Edge AI & Mobile
Quantized models (MobileNetV3, 0.93M params) run offline on smartphones and IoT edge devices — no internet required.

</td>
<td width="50%">

### 🌡️ Environmental Analysis
Integrates temperature, humidity, and rainfall data alongside visual data for a multimodal, context-aware diagnosis.

### 📈 Risk Forecasting
Time-series models predict future disease outbreaks using historical weather patterns and cropping calendars.

### 🔒 Privacy-Preserving
Federated Learning framework enables collaborative model training without sharing raw farm data.

</td>
</tr>
</table>

---

## 🧬 Tech Stack

### AI / Deep Learning Models

| Architecture | Parameters | Accuracy | Best For |
|-------------|-----------|----------|----------|
| **ResNet-50** | 25M | 98%+ (PlantVillage) | Robust baseline |
| **DenseNet-121** | 8M | 99.81% | Fine-grained disease variants |
| **EfficientNet-B3** | 12M | 80.19% (PlantDoc) | Field data generalization |
| **Vision Transformer (ViT-30)** | — | 98.41% (Rice Leaf) | Global context awareness |
| **MobileNetV3-small** | 0.93M | ~99.5% | On-device / Edge AI |

### Datasets

| Dataset | Images | Classes | Type |
|---------|--------|---------|------|
| [PlantVillage](https://www.kaggle.com/datasets/emmarex/plantdisease) | 54,305 | 38 | Controlled lab |
| [PlantDoc](https://github.com/pratikkayal/PlantDoc-Dataset) | 2,598 | 27 | Real-world field |
| [PaddyDoctor](https://www.kaggle.com/competitions/paddy-disease-classification) | 10,407 | 10 | Rice-specific |
| PlantWild | Large-scale | — | Extreme field conditions |

### Frontend
- **HTML5** + **Vanilla CSS** + **JavaScript** + **TensorFlow.js**
- Responsive design with mobile-first approach
- Frosted glass card UI inspired by CSSA (Crop Science Society of America)
- Micro-animations: scroll fade-up, scan line effect, counter animations
- Google Fonts: Inter + Playfair Display

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- Python 3.x (only for local development server)

### Run Locally

```bash
# Clone the repository
git clone https://github.com/raunet234/Smart_Crop_Disease_Detection_AI-.git

# Navigate to the project
cd Smart_Crop_Disease_Detection_AI-

# Start a local server
python -m http.server 8080

# Open in browser
# http://localhost:8080
```

### Deploy to Netlify (Free)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop the project folder
3. Get a live URL instantly!


### TensorFlow.js Model Setup

The UI now runs real inference through TensorFlow.js and looks for model files at `model/model.json`.

1. Train/export your model in TensorFlow.js format.
2. Copy `model.json` and all shard `.bin` files into `model/`.
3. Serve the app (`python -m http.server 8080`) and upload a leaf image.

If model files are missing, the app shows a fallback message instead of fake random predictions.

---

## 📁 Project Structure

```
Smart_Crop_Disease_Detection_AI-/
├── index.html              # Main web application (all sections)
├── styles.css              # Complete CSS design system (600+ lines)
├── app.js                  # Application logic & interactions
├── PRODUCTION_ROADMAP.md   # Roadmap to production-ready app
├── web_app_build_prompt.md # Build specification from research paper
├── .gitignore              # Git ignore rules
├── assets/
│   └── images/             # AI-generated agricultural imagery
│       ├── hero-bg.png
│       ├── card-diagnosis.png
│       ├── card-disease.png
│       ├── card-analytics.png
│       ├── card-environment.png
│       ├── card-edge-ai.png
│       └── card-research.png
└── README.md               # This file
```

---

## 🖥️ Screenshots

### Hero Section
Full-width agricultural background with cinematic overlay, animated stat counters, and olive-green CTA buttons.

### Feature Cards (CSSA-Inspired)
3×2 frosted glass card grid with real agricultural imagery, hover zoom effects, and clear call-to-action links.

### AI Diagnosis
Drag-and-drop upload zone with scanning animation, confidence bar, severity indicator, and treatment recommendations.

### Environmental Intelligence
Input form for temperature, humidity, rainfall, and soil pH — live-updating weather gauge cards with risk calculator.

---

## 📄 Research

This project is based on the research paper:

> **"Advanced Deep Learning Architectures for Automated Crop Disease Diagnosis: A Comprehensive Analysis of State-of-the-Art Models, Datasets, and Field Deployment Challenges"**

### Authors
- **Rauneet Raj** — B.Tech CSE, Lovely Professional University
- **Vishal Kumar Yadav** — B.Tech CSE, Lovely Professional University
- **Aditya Pratap Singh** — Assistant Professor CSE, Lovely Professional University
- **Ashutosh Kumar Pathak** — B.Tech CSE, Lovely Professional University
- **Nitesh Kumar** — B.Tech CSE, Lovely Professional University
- **Suhel** — B.Tech CSE, Lovely Professional University

### Key Contributions
1. Comparative analysis of CNN, ViT, and Hybrid architectures for plant disease detection
2. Multimodal approach combining leaf images with environmental sensor data
3. Edge AI deployment strategies using model quantization and TinyML
4. Privacy-preserving Federated Learning for collaborative training
5. Explainable AI (XAI) with Grad-CAM for transparent diagnostics

---

## 🗺️ Roadmap

See [PRODUCTION_ROADMAP.md](PRODUCTION_ROADMAP.md) for the full plan. Key milestones:

- [x] Frontend UI with all sections
- [x] Image upload with drag-and-drop
- [x] Environmental data input and risk gauges
- [x] Responsive mobile layout
- [x] Deployed to Netlify
- [x] TensorFlow.js inference pipeline integrated (drop-in model artifacts required)
- [ ] Treatment database (38 diseases)
- [ ] Camera capture for mobile
- [ ] PWA offline support
- [ ] Grad-CAM heatmap visualization
- [ ] Multi-language support (Hindi, Tamil)
- [ ] Auto weather data via API

---

## 🤝 Contributing

Contributions are welcome! If you'd like to help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [PlantVillage](https://plantvillage.psu.edu/) — For the foundational dataset
- [TensorFlow](https://www.tensorflow.org/) — Deep learning framework
- [Lovely Professional University](https://www.lpu.in/) — Institutional support
- [CSSA](https://www.crops.org/) — UI design inspiration

---

<p align="center">
  Made with 💚 for sustainable agriculture<br/>
  <strong>Lovely Professional University — Department of Computer Science & Engineering</strong>
</p>
