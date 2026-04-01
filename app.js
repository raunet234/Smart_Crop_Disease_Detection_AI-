/* ============================================
   CropGuard AI — Application Logic
   Backend-Powered AI Diagnosis (no API keys exposed)
   15 PlantVillage Disease Classes
   ============================================ */

// ──── API CONFIGURATION ────────────────────────────────
// Replace this with your actual Railway deployment URL.
// Example: "https://cropguard-api-production.up.railway.app"
const API_BASE_URL = "https://YOUR-RAILWAY-API-URL";

document.addEventListener('DOMContentLoaded', () => {

    // ──── NAV SCROLL BEHAVIOUR ──────────────────────────
    const nav = document.getElementById('main-nav');
    const observeScroll = () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', observeScroll, { passive: true });
    observeScroll();

    // ──── MOBILE TOGGLE ─────────────────────────────────
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    toggle.addEventListener('click', () => links.classList.toggle('open'));

    // Close menu on link click
    links.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => links.classList.remove('open'));
    });

    // ──── SCROLL-TRIGGERED FADE-UP ─────────────────────
    const faders = document.querySelectorAll('.fade-up');
    const fadeObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('in-view');
                fadeObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });

    faders.forEach(el => fadeObs.observe(el));

    // ──── FILE UPLOAD & DRAG-DROP ──────────────────────
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    const previewArea = document.getElementById('preview-area');
    const previewImg = document.getElementById('preview-img');
    const scanOverlay = document.getElementById('scan-overlay');
    const resultsPanel = document.getElementById('results-panel');

    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', e => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', e => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) handleFile(fileInput.files[0]);
    });

    // Store the current image as base64 for API calls
    let currentImageBase64 = null;

    function handleFile(file) {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            // Store base64 data (strip the data:image/...;base64, prefix)
            currentImageBase64 = e.target.result.split(',')[1];
            previewArea.classList.add('active');
            uploadZone.style.display = 'none';

            // Start scanning animation
            scanOverlay.classList.add('active');
            resultsPanel.classList.remove('visible');
            document.getElementById('results-title').textContent = 'Analyzing…';
            document.getElementById('results-status').style.background = 'var(--clr-warning)';

            // Show results panel with loading state
            resultsPanel.classList.add('visible');
            document.getElementById('results-body').innerHTML = `
              <div style="text-align:center; padding:48px 0; color:var(--clr-text-light);">
                <div class="loading-spinner" style="width:40px;height:40px;border:3px solid rgba(255,255,255,.15);border-top-color:var(--clr-primary,#4ade80);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px;"></div>
                <p style="font-size:.95rem;font-weight:500;">Analyzing your leaf image…</p>
                <p style="font-size:.8rem;opacity:.6;margin-top:4px;">This may take a few seconds</p>
              </div>`;

            // Run AI processing
            setTimeout(async () => {
                scanOverlay.classList.remove('active');
                const disease = await predictDisease(file);
                renderResults(disease);
            }, 1500);
        };
        reader.readAsDataURL(file);
    }

    // ──── SUPPORTED DISEASE CLASSES ─────────────────────
    const CLASS_NAMES = [
        'Corn___Cercospora_leaf_spot', 'Corn___Common_rust',
        'Corn___Northern_Leaf_Blight', 'Corn___healthy',
        'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
        'Rice___Brown_spot', 'Rice___Hispa', 'Rice___Leaf_blast', 'Rice___healthy',
        'Tomato___Bacterial_spot', 'Tomato___Early_blight',
        'Tomato___Late_blight', 'Tomato___healthy'
    ];

    // ──── TREATMENT DATABASE ──────────────────────────
    const TREATMENTS = {
        'Corn___Cercospora_leaf_spot': {
            treatment: 'Apply fungicides containing azoxystrobin or pyraclostrobin at first sign of grey leaf spot. Rotate crops annually and till crop debris. Choose resistant hybrids where available.',
            prevention: 'Ensure proper plant spacing for airflow. Avoid excessive nitrogen fertilisation. Scout fields regularly from VT through R3 growth stages.'
        },
        'Corn___Common_rust': {
            treatment: 'Apply foliar fungicides (triazole or strobilurin-based) when pustules appear on lower leaves before tasseling. Use resistant corn varieties for long-term control.',
            prevention: 'Plant rust-resistant hybrids. Monitor fields when temperatures are 16–23°C with high humidity. Early planting can help avoid peak rust pressure.'
        },
        'Corn___Northern_Leaf_Blight': {
            treatment: 'Apply fungicide (propiconazole or azoxystrobin) at VT-R1 stage when lower leaf lesions appear. Remove and destroy infected crop debris post-harvest.',
            prevention: 'Use NCLB-resistant hybrids. Practise 2–3 year crop rotation away from corn. Ensure good field drainage and reduce leaf wetness duration.'
        },
        'Corn___healthy': {
            treatment: 'No treatment needed — your corn plant is healthy! Continue regular monitoring and maintain good agronomic practices.',
            prevention: 'Maintain balanced fertilisation, proper irrigation, and scout fields weekly for early detection of any emerging issues.'
        },
        'Potato___Early_blight': {
            treatment: 'Apply chlorothalonil or mancozeb fungicide sprays at 7–10 day intervals beginning when symptoms appear. Remove heavily infected lower leaves.',
            prevention: 'Use certified disease-free seed potatoes. Ensure adequate plant nutrition (especially potassium). Practise 3-year crop rotation and destroy volunteer plants.'
        },
        'Potato___Late_blight': {
            treatment: 'Apply systemic fungicides (metalaxyl/mefenoxam or cymoxanil) immediately upon detection. Destroy all infected plant material. This disease can devastate entire fields within days.',
            prevention: 'Plant Late blight-resistant varieties. Avoid overhead irrigation. Monitor weather forecasts for blight-favourable conditions (cool, wet). Eliminate cull piles.'
        },
        'Potato___healthy': {
            treatment: 'No treatment needed — your potato plant is healthy! Continue monitoring for pests and maintaining proper soil moisture.',
            prevention: 'Maintain proper hilling, balanced fertilisation, and regular scouting. Ensure good drainage to prevent waterlogging.'
        },
        'Rice___Brown_spot': {
            treatment: 'Apply fungicides such as propiconazole or tricyclazole at booting and heading stages. Improve soil fertility, especially silicon and potassium supplementation.',
            prevention: 'Use disease-free certified seeds. Apply balanced NPK + silicon fertilisers. Maintain proper water management and avoid drought stress.'
        },
        'Rice___Hispa': {
            treatment: 'Apply recommended insecticides (chlorpyrifos or cartap hydrochloride) when 1–2 adults/hill are observed. Remove and destroy affected leaf tips. Use biological control with parasitoids.',
            prevention: 'Avoid excessive nitrogen. Clip infested leaf tips during transplanting. Use early-maturing varieties and synchronised planting in the community.'
        },
        'Rice___Leaf_blast': {
            treatment: 'Apply tricyclazole or isoprothiolane fungicide at first symptom. Drain fields temporarily to reduce humidity. Avoid applying excessive nitrogen.',
            prevention: 'Plant blast-resistant varieties. Use balanced fertilisation (limit N to recommended levels). Ensure proper spacing and avoid water stress during the vegetative stage.'
        },
        'Rice___healthy': {
            treatment: 'No treatment needed — your rice plant is healthy! Continue proper water and nutrient management for optimal yield.',
            prevention: 'Follow recommended planting schedules, maintain standing water at appropriate depth, and scout for pest/disease weekly.'
        },
        'Tomato___Bacterial_spot': {
            treatment: 'Apply copper-based bactericides mixed with mancozeb every 5–7 days. Remove and destroy severely infected plants. Avoid working in the field when plants are wet.',
            prevention: 'Use pathogen-free certified seeds and transplants. Practise crop rotation (3+ years). Avoid overhead irrigation and use drip irrigation instead.'
        },
        'Tomato___Early_blight': {
            treatment: 'Apply fungicide sprays (chlorothalonil, mancozeb, or azoxystrobin) at 7–10 day intervals. Remove infected lower leaves and ensure good air circulation.',
            prevention: 'Mulch around plants to prevent soil splash. Stake or cage tomato plants. Use resistant varieties and practise 2–3 year rotation away from Solanaceae.'
        },
        'Tomato___Late_blight': {
            treatment: 'Apply systemic fungicides (mefenoxam or cyazofamid) immediately. Remove and destroy all infected plant material. This disease spreads rapidly in cool, wet conditions.',
            prevention: 'Plant resistant varieties. Avoid overhead watering. Ensure proper spacing for airflow. Monitor P. infestans forecasts and apply preventive fungicides during high-risk periods.'
        },
        'Tomato___healthy': {
            treatment: 'No treatment needed — your tomato plant is healthy! Continue regular care with proper watering, staking, and fertiliser application.',
            prevention: 'Maintain consistent watering (avoid extremes), apply mulch, prune suckers for airflow, and scout plants twice weekly for early signs of issues.'
        },
        'default': {
            treatment: 'Apply integrated disease management: isolate affected plants, improve airflow, avoid overhead irrigation, and use a crop-specific fungicide or bactericide based on local agricultural extension service guidelines.',
            prevention: 'Practise crop rotation, use certified disease-free seeds, maintain balanced fertilisation, and scout fields regularly for early detection.'
        }
    };

    // ──── MODEL STATUS UI ──────────────────────────
    function updateModelStatusUI(status) {
        const badge = document.getElementById('model-status-badge');
        if (!badge) return;

        switch (status) {
            case 'loading':
                badge.innerHTML = '<span class="dot dot--pulse"></span> Analysing with AI…';
                badge.className = 'model-status-badge loading';
                break;
            case 'ready':
                badge.innerHTML = '<span class="dot dot--live"></span> CropGuard AI Ready';
                badge.className = 'model-status-badge ready';
                break;
            case 'error':
                badge.innerHTML = '<span class="dot dot--error"></span> AI Service Unavailable';
                badge.className = 'model-status-badge error';
                break;
        }
    }

    function formatLabel(rawLabel) {
        return rawLabel.replace('___', ' — ').replaceAll('_', ' ');
    }

    function classifySeverity(confidence, isHealthy) {
        if (isHealthy) return { severity: 'Healthy', severityClass: 'success' };
        if (confidence >= 90) return { severity: 'High', severityClass: 'danger' };
        if (confidence >= 75) return { severity: 'Moderate', severityClass: 'warning' };
        return { severity: 'Mild', severityClass: 'success' };
    }

    // ──── BACKEND API CALL ──────────────────────────
    // Accepts a File object; sends it as FormData to the Railway backend.
    async function predictDisease(file) {
        updateModelStatusUI('loading');
        const startTime = performance.now();

        try {
            // Build FormData — browser sets the correct multipart Content-Type automatically.
            // Do NOT manually set Content-Type when using FormData.
            const formData = new FormData();
            formData.append('image', file);

            const controller = new AbortController();
            // 60-second timeout — generous for mobile networks
            const timeoutId = setTimeout(() => controller.abort(), 60000);

            let response;
            try {
                response = await fetch(`${API_BASE_URL}/api/diagnose`, {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal
                });
            } finally {
                clearTimeout(timeoutId);
            }

            // Handle non-200 HTTP responses
            if (!response.ok) {
                let errorMsg = `Server error (${response.status})`;
                try {
                    const errBody = await response.json();
                    if (errBody.error || errBody.message) {
                        errorMsg = errBody.error || errBody.message;
                    }
                } catch (_) { /* ignore JSON parse failures on error bodies */ }
                throw new Error(errorMsg);
            }

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            const inferenceTime = (performance.now() - startTime).toFixed(0);
            const rawClass = result.disease_class || 'Unknown___disease';
            const disease = formatLabel(rawClass);
            const isHealthy = rawClass.includes('healthy');
            const severityInfo = classifySeverity(result.confidence, isHealthy);
            const treatmentData = TREATMENTS[rawClass] || TREATMENTS.default;

            updateModelStatusUI('ready');

            return {
                disease,
                confidence: result.confidence,
                severity: severityInfo.severity,
                severityClass: severityInfo.severityClass,
                treatment: treatmentData.treatment,
                prevention: treatmentData.prevention,
                rawClass,
                isHealthy,
                modelUsed: 'CropGuard AI Engine',
                inferenceTime,
                analysis: result.analysis,
                top3: (result.top3 || []).map(p => ({
                    label: formatLabel(p.label),
                    prob: Number(p.prob).toFixed(1)
                }))
            };

        } catch (error) {
            console.error('❌ Diagnosis error:', error);
            updateModelStatusUI('error');

            // Distinguish network/fetch failures from server errors
            const isNetworkError = !window.navigator.onLine ||
                error.name === 'AbortError' ||
                error.name === 'TypeError' ||
                error.message.toLowerCase().includes('failed to fetch') ||
                error.message.toLowerCase().includes('networkerror');

            const userMessage = isNetworkError
                ? 'AI service unavailable. Please check your connection and try again.'
                : `Error: ${error.message}. Please try again.`;

            const retryTip = isNetworkError
                ? 'The AI backend may be offline or unreachable. Try refreshing the page.'
                : 'If this persists, the AI service may be temporarily busy. Wait a moment and retry.';

            return {
                disease: isNetworkError ? 'AI Service Unavailable' : 'Analysis Error',
                confidence: 0,
                severity: 'Error',
                severityClass: 'warning',
                treatment: userMessage,
                prevention: retryTip,
                rawClass: '',
                isHealthy: false,
                modelUsed: 'CropGuard AI Engine',
                analysis: error.name === 'AbortError'
                    ? 'Request timed out after 60 seconds.'
                    : error.message
            };
        }
    }

    // ──── RENDER RESULTS ──────────────────────────────
    function renderResults(disease) {
        const titleEl = document.getElementById('results-title');
        const statusEl = document.getElementById('results-status');

        if (disease.isHealthy) {
            titleEl.textContent = '✅ Healthy Plant';
            statusEl.style.background = 'var(--clr-success)';
        } else if (disease.confidence === 0) {
            titleEl.textContent = '⚠️ ' + disease.disease;
            statusEl.style.background = 'var(--clr-warning)';
        } else {
            titleEl.textContent = '🔬 Diagnosis Complete';
            statusEl.style.background = disease.severityClass === 'danger' ? 'var(--clr-danger, #ef4444)' : 'var(--clr-success)';
        }

        const body = document.getElementById('results-body');
        body.innerHTML = `
      <div class="result-item">
        <span class="result-item__label">Disease Detected</span>
        <span class="result-item__value">${disease.disease}</span>
      </div>
      <div class="result-item">
        <span class="result-item__label">Severity</span>
        <span class="result-item__value badge--${disease.severityClass}">${disease.severity}</span>
      </div>
      <div class="result-item">
        <span class="result-item__label">Model Used</span>
        <span class="result-item__value">${disease.modelUsed}</span>
      </div>
      ${disease.inferenceTime ? `
      <div class="result-item">
        <span class="result-item__label">Response Time</span>
        <span class="result-item__value">${disease.inferenceTime} ms</span>
      </div>` : ''}

      ${disease.analysis ? `
      <div class="result-item" style="flex-direction:column;align-items:flex-start;gap:4px;">
        <span class="result-item__label">AI Analysis</span>
        <span class="result-item__value" style="font-size:.88rem;line-height:1.5;">${disease.analysis}</span>
      </div>` : ''}

      <div class="confidence-bar">
        <div class="confidence-bar__label">
          <span>Confidence</span>
          <span id="conf-value">${disease.confidence}%</span>
        </div>
        <div class="confidence-bar__track">
          <div class="confidence-bar__fill" id="conf-fill"></div>
        </div>
      </div>

      ${disease.top3 && disease.top3.length ? `
      <div class="top3-predictions">
        <p class="top3-predictions__title">Top Predictions</p>
        ${disease.top3.map((p, i) => `
        <div class="top3-predictions__row">
          <span class="top3-predictions__rank">${i + 1}</span>
          <span class="top3-predictions__label">${p.label}</span>
          <span class="top3-predictions__prob">${p.prob}%</span>
        </div>`).join('')}
      </div>` : ''}

      <div class="treatment-box">
        <div class="treatment-box__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Recommended Treatment
        </div>
        <p class="treatment-box__text">${disease.treatment}</p>
      </div>

      ${disease.prevention ? `
      <div class="treatment-box treatment-box--prevention">
        <div class="treatment-box__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Prevention Tips
        </div>
        <p class="treatment-box__text">${disease.prevention}</p>
      </div>` : ''}
    `;

        requestAnimationFrame(() => {
            setTimeout(() => {
                const fill = document.getElementById('conf-fill');
                if (fill) fill.style.width = disease.confidence + '%';
            }, 100);
        });
    }

    // ──── INITIALIZE ──────────────────────────────
    updateModelStatusUI('ready');
    console.info('✅ CropGuard AI ready — using backend AI server');

    // ──── RESET UPLOAD (click on preview to re-upload) ──
    previewArea.addEventListener('click', () => {
        previewArea.classList.remove('active');
        uploadZone.style.display = '';
        scanOverlay.classList.remove('active');
        fileInput.value = '';
        currentImageBase64 = null;

        document.getElementById('results-title').textContent = 'Awaiting image…';
        document.getElementById('results-status').style.background = '';
        document.getElementById('results-body').innerHTML = `
      <div style="text-align:center; padding:40px 0; color:var(--clr-text-light);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 12px;display:block;opacity:.4;"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
        Upload a leaf image to start the AI diagnosis pipeline. The AI will classify the disease and provide treatment recommendations.
      </div>`;
        resultsPanel.classList.remove('visible');
    });

    // ──── ENVIRONMENT FORM ─────────────────────────────
    const envForm = document.getElementById('env-form');
    envForm.addEventListener('submit', e => {
        e.preventDefault();

        const temp = parseFloat(document.getElementById('temperature').value) || 0;
        const humidity = parseFloat(document.getElementById('humidity').value) || 0;
        const rainfall = parseFloat(document.getElementById('rainfall').value) || 0;
        const crop = document.getElementById('crop-type').value;

        // Update gauge cards
        document.getElementById('gauge-temp').textContent = temp + '°C';
        document.getElementById('gauge-humidity').textContent = humidity + '%';
        document.getElementById('gauge-rain').textContent = rainfall + 'mm';

        // Temperature status
        const tempStatus = document.getElementById('gauge-temp-status');
        if (temp > 35) { tempStatus.textContent = 'High'; tempStatus.className = 'gauge-card__status alert'; }
        else if (temp > 28) { tempStatus.textContent = 'Elevated'; tempStatus.className = 'gauge-card__status elevated'; }
        else { tempStatus.textContent = 'Normal'; tempStatus.className = 'gauge-card__status normal'; }

        // Humidity status
        const humStatus = document.getElementById('gauge-humidity-status');
        if (humidity > 85) { humStatus.textContent = 'Critical'; humStatus.className = 'gauge-card__status alert'; }
        else if (humidity > 65) { humStatus.textContent = 'Elevated'; humStatus.className = 'gauge-card__status elevated'; }
        else { humStatus.textContent = 'Normal'; humStatus.className = 'gauge-card__status normal'; }

        // Rainfall status
        const rainStatus = document.getElementById('gauge-rain-status');
        if (rainfall > 80) { rainStatus.textContent = 'Heavy'; rainStatus.className = 'gauge-card__status alert'; }
        else if (rainfall > 40) { rainStatus.textContent = 'Moderate'; rainStatus.className = 'gauge-card__status elevated'; }
        else { rainStatus.textContent = 'Light'; rainStatus.className = 'gauge-card__status normal'; }

        // Risk calculation
        let riskScore = 0;
        if (temp > 25 && temp < 35) riskScore += 20;
        if (temp >= 35) riskScore += 35;
        if (humidity > 70) riskScore += 25;
        if (humidity > 85) riskScore += 15;
        if (rainfall > 50) riskScore += 20;
        if (rainfall > 80) riskScore += 15;

        if (crop === 'Rice (Paddy)' && humidity > 80) riskScore += 10;
        if (crop === 'Potato' && temp > 20 && temp < 25 && humidity > 75) riskScore += 15;
        if (crop === 'Tomato' && humidity > 80 && temp < 25) riskScore += 10;

        riskScore = Math.min(riskScore, 100);

        const riskEl = document.getElementById('gauge-risk');
        const riskStatus = document.getElementById('gauge-risk-status');
        riskEl.textContent = riskScore + '%';

        if (riskScore > 70) {
            riskStatus.textContent = 'High Risk';
            riskStatus.className = 'gauge-card__status alert';
        } else if (riskScore > 40) {
            riskStatus.textContent = 'Moderate';
            riskStatus.className = 'gauge-card__status elevated';
        } else {
            riskStatus.textContent = 'Low';
            riskStatus.className = 'gauge-card__status normal';
        }

        const btn = document.getElementById('predict-risk-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Risk Updated';
        btn.style.background = 'var(--clr-success)';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
    });

    // ──── SMOOTH SCROLL ───────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // ──── COUNTER ANIMATION FOR HERO STATS ─────────────
    const statValues = document.querySelectorAll('.hero__stat-value');
    const statsObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                statsObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    if (statValues.length) {
        statsObs.observe(statValues[0].closest('.hero__stats'));
    }

    function animateStats() {
        const targets = [
            { el: statValues[0], end: 15, suffix: '', decimal: false },
            { el: statValues[1], end: 99.5, suffix: '%', decimal: true },
            { el: statValues[2], end: 4, suffix: '', decimal: false },
        ];

        targets.forEach(({ el, end, suffix, decimal }) => {
            let current = 0;
            const step = end / 50;
            const timer = setInterval(() => {
                current += step;
                if (current >= end) {
                    current = end;
                    clearInterval(timer);
                }
                el.textContent = (decimal ? current.toFixed(1) : Math.round(current)) + suffix;
            }, 30);
        });
    }

});
