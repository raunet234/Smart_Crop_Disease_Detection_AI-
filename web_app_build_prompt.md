# Prompt: Build an AI-Powered Crop Disease Detection Web Application

**Objective**: Build a comprehensive web application for an "Automated Crop Disease Diagnosis System" based on advanced deep learning architectures and environmental data integration.

## Application Architecture & Tech Stack
1. **Frontend**: React (Next.js) or Vanilla HTML/CSS/JS with a responsive, mobile-friendly design (Tailwind CSS or modern CSS). It must be optimized for rural farmers using smartphones (Edge AI-friendly).
2. **Backend**: Python (FastAPI or Flask) to serve the deep learning models and handle API requests.
3. **Machine Learning Models**: 
   - A CNN or Vision Transformer (ViT) model for image classification.
   - A Time-Series forecasting model for environmental risk prediction.

## Core Features to Implement

### 1. Multimodal Input Interface
- **Image Upload**: An interface allowing users to upload or capture photos of crop leaves.
- **Environmental Data Form**: Input fields or automatic fetching for weather data: Temperature, Humidity, and Rainfall.

### 2. Disease Diagnosis Dashboard
- **Image Classification Results**: Display the predicted crop disease with confidence scores.
- **Explainable AI (XAI)**: Generate and display "elucidable heatmaps" (e.g., Grad-CAM or Saliency Maps) overlaid on the uploaded leaf image to show exactly which parts of the leaf the AI focused on.
- **Treatment Recommendations**: Provide actionable, sustainable treatment recommendations and chemical application advice based on the diagnosed disease.

### 3. Predictive Analytics & Forecasting
- **Future Risk Analyzer**: A section that takes the environmental data and historical weather data to predict future disease outbreaks or risks using a time-series model.

### 4. Edge & Cloud Integration (System Layer)
- **API First Design**: Create clear RESTful endpoints for the frontend to communicate with the Deep Learning backend.
- **Lightweight View**: Ensure the frontend loads fast and can ideally support offline progressive web app (PWA) capabilities for edge deployment on low-end smartphones.

## UI/UX Guidelines
- **Aesthetic**: Clean, modern, and accessible. Use a color palette inspired by agriculture (greens, earth tones).
- **Usability**: Keep the interface simple with clear call-to-action buttons ("Diagnose Crop", "Upload Leaf Image"). Add micro-animations (e.g., scanning effect over the leaf image while the AI processes it).

## Step-by-Step Instructions for the AI to Execute:
1. **Initialize the Project**: Set up the frontend and backend project structure. Provide the exact directory layout and package dependencies (`requirements.txt`, `package.json`).
2. **Build the Backend Development**: Create the FastAPI routes (`/predict_disease`, `/generate_heatmap`, `/predict_risk`) and draft mock functions for model inference.
3. **Build the Frontend Components**: Construct the upload interface, the results dashboard, and the heatmap visualization component.
4. **Integrate and Polish**: Connect the frontend to the backend API, ensure error handling (e.g., if a non-leaf image is uploaded), and polish the design for a premium look.

Please write the complete code for the backend API and the frontend interfaces to assemble a working prototype of this web application.
