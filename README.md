# 🛡️ CodeArmour AI

> **Intelligent Vulnerability Detection with Continuous MLOps Pipeline**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)

## 📋 Overview

CodeArmour AI is an AI-powered Static Application Security Testing (SAST) tool designed to detect security vulnerabilities (such as SQL Injection, XSS, and Buffer Overflows) in source code. Unlike traditional rule-based scanners that rely on static if-else patterns, CodeArmour AI utilizes **Deep Learning (Transformers/CodeBERT)** to understand the semantic context of the code.

### Key Features

- 🤖 **AI-Powered Detection**: Uses CodeBERT Transformer model for semantic code understanding
- 🔄 **Continuous Learning**: MLOps pipeline with automated feedback loop for model retraining
- 📊 **Detailed Reports**: Highlights vulnerable lines with confidence scores
- 🎨 **Developer-Friendly UI**: Monaco Editor (VS Code engine) for code input
- 🐳 **Containerized**: Full Docker support for easy deployment
- ☁️ **Cloud-Ready**: Deploy on Hugging Face Spaces, Vercel, or any cloud platform

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│    Backend      │────▶│    ML Model     │
│  (React + Vite) │     │   (FastAPI)     │     │   (CodeBERT)    │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │    Firebase     │
                        │   (Feedback)    │
                        │                 │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │  MLOps Pipeline │
                        │   (Retraining)  │
                        │                 │
                        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/codearmour-ai.git
cd codearmour-ai

# Frontend Setup
cd frontend
npm install
npm run dev

# Backend Setup (in new terminal)
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.api.main:app --reload

# Or use Docker
docker-compose up --build
```

## 📁 Project Structure

```
codearmour-ai/
├── frontend/           # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/ # UI Components
│   │   ├── pages/      # Page Components
│   │   ├── hooks/      # Custom React Hooks
│   │   ├── services/   # API Services
│   │   └── store/      # Redux Store
│   └── ...
├── backend/            # FastAPI Backend
│   ├── src/
│   │   ├── api/        # API Routes
│   │   ├── models/     # ML Model Integration
│   │   ├── services/   # Business Logic
│   │   └── preprocessing/ # Code Processing
│   └── ...
├── ml/                 # Machine Learning
│   ├── training/       # Training Scripts
│   ├── inference/      # Inference Code
│   ├── models/         # Saved Models
│   └── notebooks/      # Jupyter Notebooks
├── mlops/              # MLOps Pipeline
│   ├── mlflow/         # Experiment Tracking
│   ├── pipelines/      # Training Pipelines
│   └── scripts/        # Automation Scripts
├── infrastructure/     # Docker & Deployment
│   ├── docker/
│   └── nginx/
├── .github/workflows/  # CI/CD Pipelines
└── docs/               # Documentation
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Monaco Editor |
| Backend | FastAPI, Python 3.10+, Uvicorn |
| ML Model | CodeBERT, PyTorch, Transformers |
| Database | Firebase Firestore |
| MLOps | MLflow, GitHub Actions |
| Deployment | Docker, Hugging Face Spaces |

## 🔒 Supported Vulnerabilities

- SQL Injection (SQLi)
- Cross-Site Scripting (XSS)
- Buffer Overflow
- Command Injection
- Path Traversal
- Insecure Deserialization
- And more...

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](docs/contributing.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work*

## 🙏 Acknowledgments

- Microsoft CodeBERT Team
- Hugging Face Transformers
- FastAPI Community
- React Community

---

<p align="center">Made with ❤️ for secure code</p>
