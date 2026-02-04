// ===== CONFIGURATION =====
const CONFIG = {
    CDI_RATE: 0.1432, // 14.32% ao ano (2026)
    INFLATION_RATE: 0.0432, // 4.32% ao ano
    OPTIMAL_MULTIPLIER: 1.20, // 120% do CDI
    RATES: {
        poupanca: 0.0819, // 8.19% ao ano
        'cdb-baixo': 0.0968, // 90% do CDI
        'cdb-medio': 0.1075, // 100% do CDI
    },
    WHATSAPP: '5531920094657', // Altere para o número real
    ADVISOR_NAME: 'João Tomé'
};
const API_KEYS = {
    BRAPI: 'https://brapi.dev/api/quote/WEGE3?modules=balanceSheetHistory,balanceSheetHistoryQuarterly',
    DADOS_MERCADO: 'https://newsapi.org/v2/everything?q=tesla&from=2026-01-04&sortBy=publishedAt&apiKey=f68f5fb1e5cb4b97a268b34f5d4867df'
};

// ===== UTILITY FUNCTIONS =====
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

const formatDate = () => {
    return new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const parseValue = (value) => {
    return parseFloat(value.toString().replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
};

const formatInputCurrency = (input) => {
    let value = input.value.replace(/\D/g, '');
    if (value) {
        value = (parseInt(value) / 100).toFixed(2);
        input.value = parseFloat(value).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
};

// ===== CALCULATOR LOGIC =====
class InvestmentCalculator {
    constructor() {
        this.investmentValue = 0;
        this.investmentType = '';
        this.timePeriod = 0;
        this.currentRate = 0;
        this.optimalRate = CONFIG.CDI_RATE * CONFIG.OPTIMAL_MULTIPLIER;
    }

    calculate() {
        const currentReturn = this.calculateReturn(this.investmentValue, this.currentRate, this.timePeriod);
        const optimalReturn = this.calculateReturn(this.investmentValue, this.optimalRate, this.timePeriod);
        const loss = optimalReturn - currentReturn;
        const lossPercentage = ((loss / this.investmentValue) * 100).toFixed(2);

        // Calcular impacto da inflação
        const inflationImpact = this.calculateInflationImpact(this.investmentValue, this.timePeriod);
        const realLoss = loss + inflationImpact;

        // Projeção 5 anos
        const projection5Current = this.calculateReturn(this.investmentValue, this.currentRate, 60);
        const projection5Optimal = this.calculateReturn(this.investmentValue, this.optimalRate, 60);
        const projection5Loss = projection5Optimal - projection5Current;

        return {
            currentValue: currentReturn,
            currentReturn: currentReturn - this.investmentValue,
            optimalValue: optimalReturn,
            optimalReturn: optimalReturn - this.investmentValue,
            loss,
            lossPercentage,
            inflationImpact,
            realLoss,
            projection5Current,
            projection5Optimal,
            projection5Loss
        };
    }

    calculateReturn(principal, annualRate, months) {
        const monthlyRate = annualRate / 12;
        return principal * Math.pow(1 + monthlyRate, months);
    }

    calculateInflationImpact(principal, months) {
        const monthlyInflation = CONFIG.INFLATION_RATE / 12;
        const inflatedValue = principal * Math.pow(1 + monthlyInflation, months);
        return inflatedValue - principal;
    }

    setInvestment(value, type, period) {
        this.investmentValue = parseValue(value);
        this.investmentType = type;
        this.timePeriod = parseInt(period);
        this.currentRate = CONFIG.RATES[type] || 0;
    }
}

const calculator = new InvestmentCalculator();

// ===== NEWS API INTEGRATION =====
class NewsManager {
    constructor() {
        this.newsContainer = document.getElementById('newsContainer');
        this.insights = {
            'ALTA': 'Este movimento de alta confirma a força do setor. Ótima oportunidade para rebalancear lucros.',
            'BAIXA': 'Momento de cautela, mas também de oportunidades para quem foca em dividendos e longo prazo.',
            'NEUTRO': 'Mercado lateralizado. É o momento ideal para o perito analisar os fundamentos com calma.'
        };
    }

    async loadNews() {
        try {
            this.showLoading();

            // 1. Buscando dados da Brapi (Cotações Principais)
            const brapiResponse = await fetch(`https://brapi.dev/api/quote/IBOV,PETR4,VALE3?token=${API_KEYS.BRAPI}`);
            const marketData = await brapiResponse.json();

            // 2. Buscando Câmbio da HG Brasil (Dólar/Euro)
            const hgResponse = await fetch(`https://api.hgbrasil.com/finance?format=json-cors&key=${API_KEYS.HG_BRASIL}`);
            const financeData = await hgResponse.json();

            // 3. Buscando Notícias (Exemplo usando Brapi News ou NewsAPI)
            // Aqui usamos a lógica de fetch que você enviou adaptada
            const newsResponse = await fetch(`https://newsapi.org/v2/everything?q=economia+investimentos&language=pt&sortBy=publishedAt&apiKey=SUA_NEWS_API_KEY`);
            const newsData = await newsResponse.json();

            // Combinamos tudo para renderizar
            this.renderDashboard(marketData.results, financeData.results.currencies, newsData.articles);

        } catch (error) {
            console.error('Erro na integração das APIs:', error);
            // Se as chaves estiverem vazias, ele carregará o Mock para o site não ficar em branco
            const mockNews = this.getMockNews();
            this.renderNews(mockNews);
        }
    }

    // Nova função para criar um Dashboard Profissional
    renderDashboard(stocks, currencies, articles) {
        let html = `
            <div class="market-ticker" style="grid-column: 1/-1; display: flex; gap: 20px; margin-bottom: 20px; overflow-x: auto; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                <div class="ticker-item"><strong>USD:</strong> R$ ${currencies.USD.buy.toFixed(2)}</div>
                <div class="ticker-item"><strong>EUR:</strong> R$ ${currencies.EUR.buy.toFixed(2)}</div>
                ${stocks.map(s => `
                    <div class="ticker-item">
                        <strong>${s.symbol}:</strong> R$ ${s.regularMarketPrice} 
                        <span style="color: ${s.regularMarketChangePercent > 0 ? 'green' : 'red'}">
                            (${s.regularMarketChangePercent.toFixed(2)}%)
                        </span>
                    </div>
                `).join('')}
            </div>
        `;

        // Renderiza as notícias reais vindas da API
        if (articles && articles.length > 0) {
            html += articles.slice(0, 6).map(article => this.createRealNewsCard(article)).join('');
        }

        this.newsContainer.innerHTML = html;
    }

    createRealNewsCard(article) {
        const category = "MERCADO";
        const date = new Date(article.publishedAt).toLocaleDateString('pt-BR');
        
        return `
            <article class="news-card">
                <img src="${article.urlToImage || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600'}" class="news-image" loading="lazy">
                <div class="news-content">
                    <span class="news-category">${category}</span>
                    <h3 class="news-title">${article.title}</h3>
                    <p class="news-description">${article.description || 'Clique para ler os detalhes desta movimentação do mercado.'}</p>
                    
                    <div class="news-meta">
                        <span>${article.source.name}</span>
                        <span>${date}</span>
                    </div>
                    
                    <div class="advisor-insight">
                        <div class="insight-header">
                            <div class="insight-avatar" style="background: var(--primary);">JT</div>
                            <div>
                                <div class="insight-author">Análise de João Tomé</div>
                            </div>
                        </div>
                        <p class="insight-text">💡 Como seu assessor, vejo que esta notícia reforça a necessidade de proteção patrimonial hoje.</p>
                    </div>
                    
                    <a href="${article.url}" target="_blank" class="news-link">Ler notícia completa</a>
                </div>
            </article>
        `;
    }

    // Mantive seu MockNews como fallback (caso a API falhe ou as chaves expirem)
    getMockNews() { /* ... mesmo código do seu original ... */ }
    renderNews(newsArray) { /* ... mesmo código do seu original ... */ }
    createNewsCard(news) { /* ... mesmo código do seu original ... */ }
    showLoading() { /* ... mesmo código do seu original ... */ }
    showError() { /* ... mesmo código do seu original ... */ }
}

// ===== EVENT HANDLERS =====
document.addEventListener('DOMContentLoaded', () => {
    // Load news
    newsManager.loadNews();

    // Format currency input
    const investmentValueInput = document.getElementById('investmentValue');
    investmentValueInput.addEventListener('input', (e) => {
        formatInputCurrency(e.target);
    });

    // Calculate button
    const calculateBtn = document.getElementById('calculateBtn');
    calculateBtn.addEventListener('click', handleCalculate);

    // Lead form
    const leadForm = document.getElementById('leadForm');
    leadForm.addEventListener('submit', handleFormSubmit);

    // Phone mask
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 6) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        } else if (value.length > 0) {
            value = value.replace(/^(\d*)/, '($1');
        }
        
        e.target.value = value;
    });
});

function handleCalculate() {
    const value = document.getElementById('investmentValue').value;
    const type = document.getElementById('investmentType').value;
    const period = document.getElementById('timePeriod').value;

    if (!value || !type || !period) {
        alert('⚠️ Por favor, preencha todos os campos antes de calcular.');
        return;
    }

    calculator.setInvestment(value, type, period);
    const results = calculator.calculate();
    displayResults(results);
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.classList.remove('hidden');

    // Update timestamp
    document.getElementById('timestamp').textContent = formatDate();

    // Current investment
    document.getElementById('currentValue').textContent = formatCurrency(results.currentValue);
    document.getElementById('currentReturn').textContent = `Rendimento: ${formatCurrency(results.currentReturn)}`;

    // Optimal investment
    document.getElementById('optimalValue').textContent = formatCurrency(results.optimalValue);
    document.getElementById('optimalReturn').textContent = `Rendimento: ${formatCurrency(results.optimalReturn)}`;

    // Loss
    document.getElementById('lossValue').textContent = formatCurrency(results.loss);
    document.getElementById('lossPercentage').textContent = `Você perdeu ${results.lossPercentage}%`;

    // Inflation impact
    document.getElementById('realLoss').textContent = formatCurrency(results.realLoss);

    // 5 year projection
    document.getElementById('projection5Current').textContent = formatCurrency(results.projection5Current);
    document.getElementById('projection5Optimal').textContent = formatCurrency(results.projection5Optimal);
    document.getElementById('projection5Loss').textContent = formatCurrency(results.projection5Loss);

    // Smooth scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function handleFormSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Enviando...</span>';

    // Get form data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    // Build WhatsApp message
    const message = buildWhatsAppMessage(data);
    
    // Simulate sending (in production, send to your CRM/backend)
    setTimeout(() => {
        // Open WhatsApp
        const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        // Success feedback
        submitBtn.innerHTML = '<span>✅ Redirecionando para WhatsApp...</span>';
        
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            e.target.reset();
        }, 3000);
    }, 1000);
}

function buildWhatsAppMessage(data) {
    return `
🎯 *Nova Solicitação de Consultoria*

👤 *Nome:* ${data.name}
📱 *Telefone:* ${data.phone}
📧 *E-mail:* ${data.email}
💰 *Patrimônio:* ${data.investmentAmount}

${data.message ? `📝 *Mensagem:* ${data.message}` : ''}

---
Enviado via Landing Page de Investimentos
    `.trim();
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.calculator-card, .news-card, .form-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ===== AUTO-REFRESH NEWS (optional) =====
// Uncomment to auto-refresh news every 5 minutes
// setInterval(() => {
//     newsManager.loadNews();
// }, 5 * 60 * 1000);
