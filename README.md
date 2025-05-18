# AURA Platform

AURA (Auditing Universal Risk Analytics) is a cloud-native, AI-powered auditing risk monitoring solution designed to enhance audit efficiency, accuracy, and foresight.

## Project Overview

This repository contains a demonstration version of the AURA platform that showcases key product features described in the business plan. The demo focuses on UI and logic demonstration rather than complete development, presenting a comprehensive view of the product's capabilities.

For more information about the project:
- [Project Summary](./project_summary.md)
- [Technical Architecture](./technical_architecture.md)

## Key Features

- **Data Integration**: Multi-source data fusion from financial, macroeconomic, sentiment, and operational data
- **Risk Analysis**: AI-driven risk prediction, anomaly detection, and fraud pressure assessment
- **Visualization**: Interactive dashboards, risk heat maps, historical trend analysis
- **Alert System**: Risk-based notifications with audit-focused context and recommendations

## Getting Started

### Prerequisites

- Python 3.8+ (for backend)
- Node.js and npm (for frontend)
- Virtual environment tool (e.g., venv)

### Backend Setup

1. Create and activate a virtual environment:
   ```bash
   cd "C:\Users\surface pro\Desktop\python exploration\kpmg"
   python -m venv .venv
   .venv\Scripts\activate  # On Windows
   ```

2. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the backend server:
   ```bash
   uvicorn backend.app.main:app --reload
   ```

   The backend server will be available at http://127.0.0.1:8000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd "C:\Users\surface pro\Desktop\python exploration\kpmg\frontend"
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

   The frontend will be available at http://localhost:3000

## API Documentation

Once the backend server is running, you can access the API documentation at:
- http://127.0.0.1:8000/docs (Swagger UI)
- http://127.0.0.1:8000/redoc (ReDoc)

## Project Structure

```
kpmg/
├── backend/               # Backend code
│   └── app/
│       ├── api/           # API endpoints
│       │   ├── platform/  # Platform management APIs
│       │   ├── finance.py # Financial data endpoints
│       │   ├── fake_data.py # Mock data generation
│       │   ├── alerts.py  # Alert notification endpoints
│       │   └── fake_opinion.py # Mock audit opinions
│       ├── core/          # Core application logic
│       ├── db/            # Database models and queries
│       └── main.py        # Application entry point
├── frontend/              # Frontend code
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # React components
│       ├── hooks/         # Custom React hooks
│       ├── styles/        # CSS styles
│       └── utils/         # Utility functions
├── .venv/                 # Virtual environment (not tracked in git)
├── project_summary.md     # Project overview document
├── technical_architecture.md # Technical architecture document
├── README.md              # This file
└── requirements.txt       # Python dependencies
```

## Usage

The AURA demo provides several demonstration companies with different risk profiles:

- **AURA**: A stable company with healthy financials
- **BETA**: A growth company with some risk factors
- **CRISIS**: A distressed company with multiple risk indicators

To explore the platform:

1. Start both the backend and frontend servers as described in the Getting Started section
2. Open your browser to http://localhost:3000
3. Use the company selector in the header to switch between different demo companies
4. Explore the various dashboards, charts, and risk indicators
5. Try the Data Platform section to see the technical capabilities of the system

## License

This project is proprietary software for demonstration purposes only.

## Contact

For more information about the AURA platform, please contact the development team. 