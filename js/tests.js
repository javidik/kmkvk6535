// ========== ТЕСТИРОВАНИЕ ========== 

class TestEngine {
    constructor(testId) {
        this.testId = testId;
        this.currentQuestion = 0;
        this.answers = {};
        this.score = 0;
        this.questions = [];
    }

    loadTest(testData) {
        this.questions = testData.questions || [];
        this.testData = testData;
    }

    getQuestion(index) {
        return this.questions[index];
    }

    answerQuestion(answer) {
        this.answers[this.currentQuestion] = answer;
    }

    nextQuestion() {
        if (this.currentQuestion < this.questions.length - 1) {
            this.currentQuestion++;
            return true;
        }
        return false;
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            return true;
        }
        return false;
    }

    calculateScore() {
        this.score = Object.keys(this.answers).length * 10;
        return this.score;
    }

    submitTest() {
        this.calculateScore();
        AppState.saveTestResult(this.testId, this.score, this.answers);
        AppState.addToHistory('Прохождение теста', this.testData.name);
        return {
            score: this.score,
            total: this.questions.length,
            percentage: Math.round((this.score / (this.questions.length * 10)) * 100)
        };
    }
}

// Генератор вопросов для демонстрационного теста
function generateDemoQuestions(count = 10) {
    const questionTemplates = [
        { text: 'Предпочитаю работать с людьми' },
        { text: 'Интересуюсь техникой и механизмами' },
        { text: 'Люблю анализировать информацию' },
        { text: 'Хорошо организую работу других' },
        { text: 'Люблю новые вызовы и экстремальные ситуации' },
        { text: 'Предпочитаю стабильность и порядок' },
        { text: 'Интересуюсь искусством и творчеством' },
        { text: 'Хорошо разбираюсь в сложных системах' },
        { text: 'Люблю риск и приключения' },
        { text: 'Стремлюсь к лидерству и авторитету' }
    ];

    const questions = [];
    for (let i = 0; i < count; i++) {
        questions.push({
            id: i,
            text: questionTemplates[i % questionTemplates.length].text,
            type: 'rating',
            scale: [
                { value: 1, label: 'Полностью не согласен' },
                { value: 2, label: 'Не согласен' },
                { value: 3, label: 'Нейтрально' },
                { value: 4, label: 'Согласен' },
                { value: 5, label: 'Полностью согласен' }
            ]
        });
    }
    return questions;
}

// Генератор рекомендаций на основе результатов
function generateRecommendations(score, testName) {
    const recommendations = {
        'Тест Холланда': [
            'Рекомендуются технические специальности в ВВС',
            'Подходят должности инженера и техника',
            'Возможна работа в системе управления и связи'
        ],
        'Опросник личностные качества': [
            'Развитые лидерские качества - подходите на командные должности',
            'Высокая ответственность - хороший кандидат на офицерскую должность',
            'Рекомендуется специальность в области управления персоналом'
        ],
        'Тест общих умственных способностей': [
            'Высокие аналитические способности',
            'Рекомендуются сложные технические специальности',
            'Подходит инженерная подготовка в военных ВУЗах'
        ]
    };

    return recommendations[testName] || [
        'Вы прошли тест успешно',
        'Результаты помогут определить вашу профессиональную направленность'
    ];
}

// Рендер вопроса теста
function renderTestQuestion(testEngine) {
    const question = testEngine.getQuestion(testEngine.currentQuestion);
    if (!question) return '';

    let html = \`
        <div class="test-question">
            <h4>Вопрос \${testEngine.currentQuestion + 1} из \${testEngine.questions.length}</h4>
            <p class="question-text">\${question.text}</p>
    \`;

    if (question.type === 'rating') {
        html += '<div class="rating-scale">';
        question.scale.forEach(option => {
            const isSelected = testEngine.answers[testEngine.currentQuestion] === option.value;
            html += \`
                <label class="rating-option \${isSelected ? 'selected' : ''}">
                    <input type="radio" name="answer" value="\${option.value}" 
                           \${isSelected ? 'checked' : ''} 
                           onchange="currentTestEngine.answerQuestion(\${option.value})">
                    <span>\${option.label}</span>
                </label>
            \`;
        });
        html += '</div>';
    }

    html += '</div>';
    return html;
}
