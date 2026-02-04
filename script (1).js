// ===== CONFIGURATION =====
const CONFIG = {
    CDI_RATE: 0.1432, // 10.75% ao ano (2026)
    INFLATION_RATE: 0.0432, // 4.62% ao ano
    OPTIMAL_MULTIPLIER: 1.20, // 120% do CDI
    RATES: {
        poupanca: 0.0817, // 6.17% ao ano
        'cdb-baixo': 0.0968, // 90% do CDI
        'cdb-medio': 0.1075, // 100% do CDI
    },
    WHATSAPP: '5531920094657', // Altere para o número real
    ADVISOR_NAME: 'João Tomé'
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
            'economia': [
                'Este movimento no mercado pode impactar diretamente a rentabilidade da sua carteira. É hora de revisar seus investimentos.',
                'Fique atento: mudanças na economia afetam tanto a renda fixa quanto a variável. Diversificação é essencial.',
                'Este cenário pode gerar oportunidades interessantes para quem está posicionado corretamente.',
            ],
            'finance': [
                'Dados como estes mostram a importância de ter uma estratégia bem definida e acompanhamento profissional.',
                'O mercado está sinalizando mudanças. Investidores preparados podem se beneficiar.',
                'Esta notícia reforça a necessidade de ter uma carteira balanceada e adequada ao seu perfil.',
            ],
            'investimentos': [
                'Momento crucial para reavaliar sua estratégia de investimentos. Vamos conversar sobre sua carteira?',
                'Movimentos como este criam janelas de oportunidade para investidores bem assessorados.',
                'Este é exatamente o tipo de informação que uso para proteger e potencializar os investimentos dos meus clientes.',
            ],
            'default': [
                'Como assessor, meu trabalho é filtrar o que realmente importa para o seu patrimônio e traduzir em ações práticas.',
                'Esta notícia tem impacto direto nas suas finanças. Vamos analisar juntos como isso afeta seus objetivos?',
                'Informação é poder no mercado financeiro. Deixe-me ajudá-lo a tomar as melhores decisões.',
            ]
        };
    }

    async loadNews() {
    try {
        const response = await fetch(
            'https://newsapi.org/v2/everything?q=tesla&from=2026-01-04&sortBy=publishedAt&apiKey=f68f5fb1e5cb4b97a268b34f5d4867df'
        );
        const data = await response.json();
        this.renderNews(data.articles);
    } catch (error) {
        this.showError();
    }
}

            console.error('Erro ao carregar notícias:', error);
            this.showError();
        }
    }

    getMockNews() {
        return [
            {
                title: 'Banco Central mantém Selic em 10,50% e sinaliza possível alta',
                description: 'Em decisão unânime, Copom mantém taxa básica de juros e indica preocupação com cenário inflacionário para 2026.',
                category: 'ECONOMIA',
                source: 'Valor Econômico',
                date: '4 fev 2026',
                image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop',
                url: 'https://valor.globo.com',
                topic: 'economia'
            },
            {
                title: 'Dólar fecha em queda após dados positivos do emprego nos EUA',
                description: 'Moeda americana recua 1,2% frente ao real, encerrando cotação em R$ 5,82. Investidores avaliam cenário global.',
                category: 'CÂMBIO',
                source: 'InfoMoney',
                date: '4 fev 2026',
                image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&h=400&fit=crop',
                url: 'https://infomoney.com.br',
                topic: 'finance'
            },
            {
                title: 'Fundos imobiliários têm melhor janeiro em 5 anos',
                description: 'Setor registra valorização média de 4,8% no primeiro mês de 2026, impulsionado por queda nos juros futuros.',
                category: 'INVESTIMENTOS',
                source: 'Seu Dinheiro',
                date: '3 fev 2026',
                image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop',
                url: 'https://seudinheiro.com',
                topic: 'investimentos'
            },
            {
                title: 'Tesouro Direto: títulos prefixados têm maior procura em fevereiro',
                description: 'Investidores apostam em ancoragem das expectativas de inflação e buscam travar rentabilidade acima de 11% ao ano.',
                category: 'RENDA FIXA',
                source: 'Blog do Investidor',
                date: '3 fev 2026',
                image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop',
                url: 'https://blogdoinvestidor.com.br',
                topic: 'investimentos'
            },
            {
                title: 'Bolsa brasileira opera em alta com expectativa de balanços',
                description: 'Ibovespa sobe 1,5% no início da sessão, com investidores atentos à temporada de resultados do 4º trimestre.',
                category: 'BOLSA',
                source: 'Estadão',
                date: '4 fev 2026',
                image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop',
                url: 'https://estadao.com.br',
                topic: 'finance'
            },
            {
                title: 'Inflação desacelera em janeiro e fica em 0,38%, diz IPCA',
                description: 'Resultado veio abaixo das expectativas do mercado. Acumulado em 12 meses fica em 4,62%, dentro da meta do BC.',
                category: 'ECONOMIA',
                source: 'G1 Economia',
                date: '3 fev 2026',
                image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=400&fit=crop',
                url: 'https://g1.globo.com',
                topic: 'economia'
            }
        ];
    }

    renderNews(newsArray) {
        this.newsContainer.innerHTML = newsArray.map(news => this.createNewsCard(news)).join('');
    }

    createNewsCard(news) {
        const insight = this.getRandomInsight(news.topic);
        
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
                            <div class="insight-avatar">JT</div>
                            <div>
                                <div class="insight-author">Insight do ${CONFIG.ADVISOR_NAME}</div>
                            </div>
                        </div>
                        <p class="insight-text">💡 ${insight}</p>
                    </div>
                    
                    <a href="${news.url}" target="_blank" rel="noopener noreferrer" class="news-link">
                        Ler notícia completa
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                </div>
            </article>
        `;
    }

    getRandomInsight(topic) {
        const insightArray = this.insights[topic] || this.insights['default'];
        return insightArray[Math.floor(Math.random() * insightArray.length)];
    }

    showLoading() {
        this.newsContainer.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Carregando notícias do mercado...</p>
            </div>
        `;
    }

    showError() {
        this.newsContainer.innerHTML = `
            <div class="loading-spinner">
                <p style="color: var(--danger);">❌ Erro ao carregar notícias. Tente novamente mais tarde.</p>
            </div>
        `;
    }
}

const newsManager = new NewsManager();

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
