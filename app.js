/* ============================================
   CropGuard AI — Application Logic
   ============================================ */

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

    function handleFile(file) {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewArea.classList.add('active');
            uploadZone.style.display = 'none';

            // Start scanning animation
            scanOverlay.classList.add('active');
            resultsPanel.classList.remove('visible');
            document.getElementById('results-title').textContent = 'Analysing leaf…';
            document.getElementById('results-status').style.background = 'var(--clr-warning)';

            // Show results panel
            resultsPanel.classList.add('visible');

            // Simulate AI processing time
            setTimeout(() => {
                scanOverlay.classList.remove('active');
                showMockResults();
            }, 3000);
        };
        reader.readAsDataURL(file);
    }

    // ──── MOCK DIAGNOSIS RESULTS ───────────────────────
    const diseases = [
        {
            name: 'Tomato — Late Blight',
            confidence: 96.8,
            severity: 'Moderate',
            severityClass: 'warning',
            treatment: 'Apply copper-based fungicide (2g/L) immediately. Remove affected leaves and improve air circulation by pruning. Avoid overhead irrigation. Monitor neighbouring plants for spread over the next 7 days.'
        },
        {
            name: 'Potato — Early Blight',
            confidence: 94.2,
            severity: 'High',
            severityClass: 'danger',
            treatment: 'Apply chlorothalonil or mancozeb-based fungicide. Remove and destroy severely infected leaves. Ensure proper spacing between plants. Apply preventive sprays every 7–10 days during wet seasons.'
        },
        {
            name: 'Apple — Cedar Apple Rust',
            confidence: 97.5,
            severity: 'Mild',
            severityClass: 'success',
            treatment: 'Apply myclobutanil-based fungicide at petal fall. Remove nearby cedar/juniper trees if possible. Monitor for lesion development and reapply fungicide in 14 days as needed.'
        },
        {
            name: 'Grape — Black Rot',
            confidence: 93.1,
            severity: 'High',
            severityClass: 'danger',
            treatment: 'Apply captan or myclobutanil at bloom stage. Remove mummified fruit and infected debris. Ensure good canopy management for air circulation. Spray preventively throughout the growing season.'
        },
        {
            name: 'Corn — Northern Leaf Blight',
            confidence: 91.6,
            severity: 'Moderate',
            severityClass: 'warning',
            treatment: 'Apply propiconazole or azoxystrobin fungicide. Use resistant hybrids where available. Practice crop rotation with non-host crops to reduce soil inoculum levels.'
        },
        {
            name: 'Rice — Bacterial Leaf Blight',
            confidence: 95.3,
            severity: 'High',
            severityClass: 'danger',
            treatment: 'Drain fields and reduce nitrogen fertilizer. Apply streptomycin sulfate or copper hydroxide. Plant resistant varieties (e.g., IR64). Maintain balanced fertilization to reduce susceptibility.'
        }
    ];

    function showMockResults() {
        const disease = diseases[Math.floor(Math.random() * diseases.length)];

        document.getElementById('results-title').textContent = 'Diagnosis Complete';
        document.getElementById('results-status').style.background = 'var(--clr-success)';

        const body = document.getElementById('results-body');
        body.innerHTML = `
      <div class="result-item">
        <span class="result-item__label">Disease Detected</span>
        <span class="result-item__value">${disease.name}</span>
      </div>
      <div class="result-item">
        <span class="result-item__label">Severity</span>
        <span class="result-item__value ${disease.severityClass}">${disease.severity}</span>
      </div>
      <div class="result-item">
        <span class="result-item__label">Model Used</span>
        <span class="result-item__value">EfficientNet-B3 + ViT</span>
      </div>
      <div class="result-item">
        <span class="result-item__label">Dataset</span>
        <span class="result-item__value">PlantVillage / PlantDoc</span>
      </div>

      <div class="confidence-bar">
        <div class="confidence-bar__label">
          <span>Confidence</span>
          <span id="conf-value">${disease.confidence}%</span>
        </div>
        <div class="confidence-bar__track">
          <div class="confidence-bar__fill" id="conf-fill"></div>
        </div>
      </div>

      <div class="treatment-box">
        <div class="treatment-box__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Recommended Treatment
        </div>
        <p class="treatment-box__text">${disease.treatment}</p>
      </div>
    `;

        // Animate confidence bar
        requestAnimationFrame(() => {
            setTimeout(() => {
                document.getElementById('conf-fill').style.width = disease.confidence + '%';
            }, 100);
        });
    }

    // ──── RESET UPLOAD (click on preview to re-upload) ──
    previewArea.addEventListener('click', () => {
        previewArea.classList.remove('active');
        uploadZone.style.display = '';
        scanOverlay.classList.remove('active');
        fileInput.value = '';

        document.getElementById('results-title').textContent = 'Awaiting image…';
        document.getElementById('results-status').style.background = '';
        document.getElementById('results-body').innerHTML = `
      <div style="text-align:center; padding:40px 0; color:var(--clr-text-light);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 12px;display:block;opacity:.4;"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
        Upload a leaf image to start the AI diagnosis pipeline. The model will classify the disease and generate an explainable Grad-CAM heatmap.
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

        // Risk calculation (mock algorithm)
        let riskScore = 0;
        if (temp > 25 && temp < 35) riskScore += 20;
        if (temp >= 35) riskScore += 35;
        if (humidity > 70) riskScore += 25;
        if (humidity > 85) riskScore += 15;
        if (rainfall > 50) riskScore += 20;
        if (rainfall > 80) riskScore += 15;

        // Clamp
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

        // Button feedback
        const btn = document.getElementById('predict-risk-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Risk Updated';
        btn.style.background = 'var(--clr-success)';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
    });

    // ──── SMOOTH SCROLL FOR ANCHOR LINKS ───────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
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
            { el: statValues[0], end: 38, suffix: '+', decimal: false },
            { el: statValues[1], end: 99.5, suffix: '%', decimal: true },
            { el: statValues[2], end: 14, suffix: '', decimal: false },
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

        // The "<2s" stat stays static
    }

});
