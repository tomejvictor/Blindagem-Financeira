// ===== CONFIGURATION =====
const CONFIG = {
    CDI_RATE: 0.1432, // 10.75% ao ano (2026)
    INFLATION_RATE: 0.045, // 4.62% ao ano
    OPTIMAL_MULTIPLIER: 1.20, // 120% do CDI
    RATES: {
        poupanca: 0.0817, // 6.17% ao ano
        'cdb-baixo': 0.0968, // 90% do CDI
        'cdb-medio': 0.1075, // 100% do CDI
    },
    WHATSAPP: '5531920094657', // Altere para o seu número real
    ADVISOR_NAME: 'João Tomé',
    BRAPI_TOKEN: 'bvjwtABLxWYueC7doNQDRt' // Sua chave Brapi integrada
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
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
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
        const inflationImpact = this.calculateInflationImpact(this.investmentValue, this.timePeriod);
        const realLoss = loss + inflationImpact;

        const projection5Current = this.calculateReturn(this.investmentValue, this.currentRate, 60);
        const projection5Optimal = this.calculateReturn(this.investmentValue, this.optimalRate, 60);
        const projection5Loss = projection5Optimal - projection5Current;

        return {
            currentValue: currentReturn,
            currentReturn: currentReturn - this.investmentValue,
            optimalValue: optimalReturn,
            optimalReturn: optimalReturn - this.investmentValue,
            loss, lossPercentage, inflationImpact, realLoss,
            projection5Current, projection5Optimal, projection5Loss
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

// ===== NEWS API INTEGRATION (BRAPI) =====
class NewsManager {
    constructor() {
        this.newsContainer = document.getElementById('newsContainer');
        this.insights = {
            'economia': ['Movimento crucial para sua carteira.', 'Hora de revisar sua estratégia.'],
            'default': ['Informação é poder. Como seu assessor, ajudo você a filtrar o que importa.']
        };
    }

    async loadNews() {
        try {
            this.showLoading();
            
            // Busca notícias reais da Brapi
            const response = await fetch(`https://brapi.dev/api/news?token=${CONFIG.BRAPI_TOKEN}&category=finance`);
            const data = await response.json();

            if (data.news && data.news.length > 0) {
                this.renderNews(data.news);
            } else {
                this.renderNews(this.getMockNews());
            }
        } catch (error) {
            console.error('Erro ao carregar notícias:', error);
            this.renderNews(this.getMockNews()); // Fallback se a API falhar
        }
    }

    renderNews(newsArray) {
        // Remove o spinner e renderiza os cards
        this.newsContainer.innerHTML = newsArray.slice(0, 6).map(news => {
            // Normaliza os dados da Brapi ou do Mock
            const normalizedNews = {
                image: news.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600',
                title: news.title,
                description: news.content || news.description || 'Notícia importante sobre o mercado financeiro.',
                category: 'MERCADO',
                source: news.source || 'Brapi News',
                date: news.date || new Date().toLocaleDateString('pt-BR'),
                url: news.link || news.url || '#',
                topic: news.topic || 'economia'
            };
            return this.createNewsCard(normalizedNews);
        }).join('');
    }

    createNewsCard(news) {
        return `
            <article class="news-card">
                <img src="${news.image}" alt="${news.title}" class="news-image" loading="lazy">
                <div class="news-content">
                    <span class="news-category">${news.category}</span>
                    <h3 class="news-title">${news.title}</h3>
                    <p class="news-description">${news.description}</p>
                    <div class="news-meta">
                        <span>${news.source}</span>
                        <span>${news.date}</span>
                    </div>
                    <div class="advisor-insight">
                        <div class="insight-header">
                            <div class="insight-avatar" style="background: #007bff; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">JT</div>
                            <div class="insight-author">Insight do ${CONFIG.ADVISOR_NAME}</div>
                        </div>
                        <p class="insight-text">💡 Como seu assessor, vejo que esta notícia reforça a necessidade de proteger seu patrimônio hoje.</p>
                    </div>
                    <a href="${news.url}" target="_blank" class="news-link">Ler notícia completa</a>
                </div>
            </article>
        `;
    }

    getMockNews() {
        return [
            {
                title: 'Banco Central mantém Selic em 10,50% e sinaliza possível alta',
                description: 'Copom indica preocupação com cenário inflacionário para 2026.',
                source: 'Valor Econômico',
                date: '4 fev 2026',
                topic: 'economia'
            }
        ];
    }

    showLoading() {
        this.newsContainer.innerHTML = `
            <div class="loading-spinner" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <div class="spinner"></div>
                <p>Carregando notícias do mercado real...</p>
            </div>
        `;
    }
}

const newsManager = new NewsManager();

// ===== EVENT HANDLERS =====
document.addEventListener('DOMContentLoaded', () => {
    newsManager.loadNews();

    const investmentValueInput = document.getElementById('investmentValue');
    if(investmentValueInput) {
        investmentValueInput.addEventListener('input', (e) => formatInputCurrency(e.target));
    }

    const calculateBtn = document.getElementById('calculateBtn');
    if(calculateBtn) calculateBtn.addEventListener('click', handleCalculate);

    const leadForm = document.getElementById('leadForm');
    if(leadForm) leadForm.addEventListener('submit', handleFormSubmit);
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
    
    document.getElementById('timestamp').textContent = formatDate();
    document.getElementById('currentValue').textContent = formatCurrency(results.currentValue);
    document.getElementById('optimalValue').textContent = formatCurrency(results.optimalValue);
    document.getElementById('lossValue').textContent = formatCurrency(results.loss);
    
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const message = `🎯 Nova Solicitação: ${data.name} - Patrimônio: ${data.investmentAmount}`;
    const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
              }
