const quizLabel = "Розрахуйте оптимальний варіант кондиціонера";

const questions = [
    {
        type: "cards",
        title: "Чи потрібне вам встановлення / монтаж?",
        description: "Почнемо з формату запиту, щоб одразу зрозуміти, чи потрібен вам лише підбір техніки, чи повний комплекс робіт.",
        hint: "Оберіть один варіант і натисніть «Далі».",
        options: [
            {
                value: "Цікавить лише покупка кондиціонера",
                note: "Підберемо модель під площу та бюджет",
                image: "assets/conditioners/install-only.svg",
            },
            {
                value: "Цікавить покупка та встановлення кондиціонера",
                note: "Підбір, доставка та монтаж під ключ",
                image: "assets/conditioners/install-service.svg",
            },
            {
                value: "Інше...",
                note: "Потрібна консультація щодо варіантів",
                image: "assets/conditioners/consult-card.svg",
            },
        ],
    },
    {
        type: "choice",
        title: "Скільки кондиціонерів вам потрібно?",
        description: "Це допоможе одразу зорієнтуватися по обсягу робіт і підібрати оптимальне рішення для всієї квартири.",
        hint: "Можна обрати лише один основний варіант.",
        options: [{ value: "Один" }, { value: "Два" }, { value: "Три" }, { value: "Інша кількість" }],
    },
    {
        type: "range",
        title: "Вкажіть орієнтовну площу вашого приміщення",
        description: "Площа впливає на потужність кондиціонера та рекомендацію щодо моделі.",
        hint: "Значення можна ввести вручну або змінити повзунком.",
        min: 20,
        max: 300,
        step: 1,
        unit: "м²",
        defaultValue: 60,
    },
    {
        type: "brands",
        title: "Якої фірми кондиціонер вам потрібен?",
        description: "Якщо бренд уже подобається, позначте його. Якщо ні, оберіть варіант консультації, і ми підберемо кілька рішень.",
        hint: "Список брендів прокручується, якщо не поміщається повністю.",
        options: [
            { value: "Neoclima", logo: "Neoclima", color: "#141d4c", accent: "#ef3340" },
            { value: "Toshiba", logo: "TOSHIBA", color: "#e3171d" },
            { value: "Panasonic", logo: "Panasonic", color: "#1560b2" },
            { value: "Cooper&Hunter", logo: "COOPER\n& HUNTER", color: "#145db8" },
            { value: "Mitsubishi Electric", logo: "MITSUBISHI\nELECTRIC", color: "#20263c", accent: "#da1e28" },
            { value: "Zanussi", logo: "ZANUSSI", color: "#111111" },
            { value: "LG", logo: "LG", color: "#af0d4b" },
            { value: "Gree", logo: "GREE", color: "#246bce" },
            { value: "Samsung", logo: "SAMSUNG", color: "#183f9e" },
            { value: "AUX", logo: "AUX", color: "#0061ff" },
            {
                value: "Потрібна консультація щодо бренду",
                logo: "ПІДБІР\nБРЕНДУ",
                color: "#1d4ed8",
                subtitle: "Ще не визначився",
            },
        ],
    },
    {
        type: "visual-choice",
        title: "Які необхідні терміни для виконання послуг?",
        description: "Підкажіть бажані строки, і ми зорієнтуємо по доступності монтажної бригади.",
        hint: "Останній крок перед контактною формою.",
        visual: "assets/conditioners/room-ac-real.jpg",
        options: [{ value: "Протягом двох днів" }, { value: "Протягом тижня" }, { value: "Протягом місяця" }, { value: "За домовленістю" }],
    },
];

const quizContent = document.getElementById("quizContent");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const nextButton = document.getElementById("nextButton");
const prevButton = document.getElementById("prevButton");
const quizActions = document.getElementById("quizActions");
const successModal = document.getElementById("successModal");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");

let currentStep = 0;
let answers = createInitialAnswers();
let isSubmitting = false;

function createInitialAnswers() {
    return questions.map((question) => {
        if (question.type === "range") {
            return formatRangeAnswer(question.defaultValue, question.unit);
        }

        return "";
    });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function formatRangeAnswer(value, unit) {
    return `${value} ${unit}`;
}

function parseRangeAnswer(value, fallback) {
    const parsed = Number.parseInt(String(value).replace(/[^\d]/g, ""), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function hasAnswer(question, value) {
    if (question.type === "range") {
        return Number.isFinite(parseRangeAnswer(value, Number.NaN));
    }

    return String(value).trim() !== "";
}

function renderQuestion() {
    setQuizActionsVisible(true);

    const question = questions[currentStep];
    if (question.type === "range" && !hasAnswer(question, answers[currentStep])) {
        answers[currentStep] = formatRangeAnswer(question.defaultValue, question.unit);
    }

    quizContent.innerHTML = `
        <article class="quiz-question quiz-question--${question.type}" aria-labelledby="quiz-title">
            <p class="quiz-question__eyebrow">${escapeHtml(quizLabel)}</p>
            <h3 id="quiz-title">${escapeHtml(question.title)}</h3>
            <p>${escapeHtml(question.description)}</p>
            ${renderQuestionBody(question)}
            <p class="quiz-hint">${escapeHtml(question.hint)}</p>
        </article>
    `;
}

function renderQuestionBody(question) {
    switch (question.type) {
        case "cards":
            return renderCardsQuestion(question);
        case "choice":
            return renderChoiceQuestion(question);
        case "range":
            return renderRangeQuestion(question);
        case "brands":
            return renderBrandsQuestion(question);
        case "visual-choice":
            return renderVisualChoiceQuestion(question);
        default:
            return "";
    }
}

function renderCardsQuestion(question) {
    const optionsMarkup = question.options
        .map((option) => {
            const isSelected = answers[currentStep] === option.value;
            return `
                <button
                    class="quiz-option quiz-option--card${isSelected ? " is-selected" : ""}"
                    type="button"
                    data-option="${escapeHtml(option.value)}"
                    aria-pressed="${isSelected}"
                >
                    <span class="option-art option-art--image">
                        <img src="${escapeHtml(option.image)}" alt="" loading="lazy" />
                    </span>
                    <span class="option-label">${escapeHtml(option.value)}</span>
                    <span class="option-note">${escapeHtml(option.note)}</span>
                </button>
            `;
        })
        .join("");

    return `<div class="quiz-options quiz-options--cards">${optionsMarkup}</div>`;
}

function renderChoiceQuestion(question) {
    const optionsMarkup = question.options
        .map((option) => {
            const isSelected = answers[currentStep] === option.value;
            return `
                <button
                    class="quiz-option quiz-option--choice${isSelected ? " is-selected" : ""}"
                    type="button"
                    data-option="${escapeHtml(option.value)}"
                    aria-pressed="${isSelected}"
                >
                    <span class="quiz-option__radio" aria-hidden="true"></span>
                    <span class="option-label">${escapeHtml(option.value)}</span>
                </button>
            `;
        })
        .join("");

    return `<div class="quiz-options quiz-options--choice">${optionsMarkup}</div>`;
}

function renderRangeQuestion(question) {
    const currentValue = parseRangeAnswer(answers[currentStep], question.defaultValue);

    return `
        <div class="range-question">
            <label class="range-question__field">
                <span class="visually-hidden">Орієнтовна площа приміщення</span>
                <input
                    class="range-question__number"
                    type="number"
                    min="${question.min}"
                    max="${question.max}"
                    step="${question.step}"
                    value="${currentValue}"
                    data-range-number
                />
                <span class="range-question__unit">${escapeHtml(question.unit)}</span>
            </label>

            <input
                class="range-question__slider"
                type="range"
                min="${question.min}"
                max="${question.max}"
                step="${question.step}"
                value="${currentValue}"
                data-range-slider
            />

            <div class="range-question__meta" aria-hidden="true">
                <span>${question.min}</span>
                <span>${question.max}</span>
            </div>
        </div>
    `;
}

function renderBrandsQuestion(question) {
    const optionsMarkup = question.options
        .map((option) => {
            const isSelected = answers[currentStep] === option.value;
            const accentMarkup = option.accent
                ? `<span class="brand-card__accent" style="background:${escapeHtml(option.accent)};"></span>`
                : "";

            return `
                <button
                    class="quiz-option brand-card${isSelected ? " is-selected" : ""}"
                    type="button"
                    data-option="${escapeHtml(option.value)}"
                    aria-pressed="${isSelected}"
                    style="--brand-color: ${escapeHtml(option.color)};"
                >
                    ${accentMarkup}
                    <span class="brand-card__logo">${escapeHtml(option.logo)}</span>
                    <span class="brand-card__name">${escapeHtml(option.value)}</span>
                    ${option.subtitle ? `<span class="brand-card__subtitle">${escapeHtml(option.subtitle)}</span>` : ""}
                </button>
            `;
        })
        .join("");

    return `
        <div class="brand-scroll" tabindex="0" aria-label="Список брендів кондиціонерів">
            <div class="quiz-options quiz-options--brands">${optionsMarkup}</div>
        </div>
    `;
}

function renderVisualChoiceQuestion(question) {
    const optionsMarkup = question.options
        .map((option) => {
            const isSelected = answers[currentStep] === option.value;
            return `
                <button
                    class="quiz-option quiz-option--visual${isSelected ? " is-selected" : ""}"
                    type="button"
                    data-option="${escapeHtml(option.value)}"
                    aria-pressed="${isSelected}"
                >
                    <span class="quiz-option__radio" aria-hidden="true"></span>
                    <span class="option-label">${escapeHtml(option.value)}</span>
                </button>
            `;
        })
        .join("");

    return `
        <div class="visual-choice">
            <div class="visual-choice__options">${optionsMarkup}</div>
            <div class="visual-choice__art">
                <img src="${escapeHtml(question.visual)}" alt="" loading="lazy" />
            </div>
        </div>
    `;
}

function syncSelectedOption() {
    const selectedValue = answers[currentStep];

    quizContent.querySelectorAll("[data-option]").forEach((button) => {
        const isSelected = button.dataset.option === selectedValue;
        button.classList.toggle("is-selected", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
    });
}

function syncRangeQuestion(value) {
    const question = questions[currentStep];
    const clampedValue = Math.min(question.max, Math.max(question.min, value));
    const formattedAnswer = formatRangeAnswer(clampedValue, question.unit);
    answers[currentStep] = formattedAnswer;

    const slider = quizContent.querySelector("[data-range-slider]");
    const numberInput = quizContent.querySelector("[data-range-number]");
    if (slider) {
        slider.value = String(clampedValue);
        slider.style.setProperty("--range-progress", `${((clampedValue - question.min) / (question.max - question.min)) * 100}%`);
    }
    if (numberInput) {
        numberInput.value = String(clampedValue);
    }

    updateProgress();
}

function renderForm() {
    setQuizActionsVisible(false);

    const summaryMarkup = questions
        .map((question, index) => `<li><strong>${escapeHtml(question.title)}</strong><span>${escapeHtml(answers[index])}</span></li>`)
        .join("");

    quizContent.innerHTML = `
        <section class="quiz-form">
            <p class="quiz-question__eyebrow">${escapeHtml(quizLabel)}</p>
            <h3>Залиште контакти для персонального прорахунку</h3>
            <p>Заповніть коротку форму, і ми зв'яжемося з вами, щоб уточнити деталі квартири, підібрати кондиціонер та узгодити виїзд спеціаліста.</p>

            <div class="quiz-form__summary">
                <strong>Ваші відповіді:</strong>
                <ul>${summaryMarkup}</ul>
            </div>

            <form id="leadForm" novalidate>
                <div class="quiz-form__grid">
                    <div class="field">
                        <label for="name">Ім'я</label>
                        <input id="name" name="name" type="text" placeholder="Ваше ім'я" required />
                    </div>

                    <div class="field">
                        <label for="phone">Телефон</label>
                        <input id="phone" name="phone" type="tel" placeholder="+380 XX XXX XX XX" required />
                    </div>

                    <div class="field field--wide">
                        <label for="comment">Коментар</label>
                        <textarea
                            id="comment"
                            name="comment"
                            rows="4"
                            placeholder="Наприклад: квартира 56 м², монтаж цікавить у найближчі дні, потрібна порада щодо бренду"
                        ></textarea>
                    </div>
                </div>

                <div class="quiz-form__footer">
                    <div class="quiz-form__buttons">
                        <button class="quiz-nav quiz-nav--ghost" id="formBackButton" type="button">Назад</button>
                        <button class="form-submit" id="submitButton" type="submit">Надіслати заявку</button>
                    </div>
                    <p class="quiz-status" id="formStatus" aria-live="polite">Натискаючи кнопку, ви надсилаєте заявку на персональний прорахунок та зворотний дзвінок.</p>
                </div>
            </form>
        </section>
    `;

    const leadForm = document.getElementById("leadForm");
    const formBackButton = document.getElementById("formBackButton");

    leadForm.addEventListener("submit", handleSubmit);
    formBackButton.addEventListener("click", () => {
        currentStep = questions.length - 1;
        render();
    });
}

function setQuizActionsVisible(isVisible) {
    quizActions.hidden = !isVisible;
    quizActions.style.display = isVisible ? "" : "none";
}

function updateProgress() {
    if (currentStep < questions.length) {
        const percent = Math.round(((currentStep + 1) / questions.length) * 100);
        progressText.textContent = `Готово: ${percent}%`;
        progressFill.style.width = `${percent}%`;
        nextButton.textContent = currentStep === questions.length - 1 ? "Останній крок" : "Далі";
        nextButton.disabled = !hasAnswer(questions[currentStep], answers[currentStep]);
        prevButton.disabled = currentStep === 0;
        prevButton.hidden = false;
        nextButton.hidden = false;
        setQuizActionsVisible(true);
    } else {
        progressText.textContent = "Готово: 100%";
        progressFill.style.width = "100%";
        setQuizActionsVisible(false);
    }
}

function render() {
    if (currentStep < questions.length) {
        renderQuestion();
        if (questions[currentStep].type === "range") {
            const question = questions[currentStep];
            const currentValue = parseRangeAnswer(answers[currentStep], question.defaultValue);
            syncRangeQuestion(currentValue);
        }
    } else {
        renderForm();
    }

    updateProgress();
}

function validatePhone(value) {
    const digitsOnly = value.replace(/\D/g, "");
    return digitsOnly.length >= 10;
}

async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
        return;
    }

    const form = event.currentTarget;
    const status = document.getElementById("formStatus");
    const submitButton = document.getElementById("submitButton");
    const formData = new FormData(form);
    const payload = {
        name: String(formData.get("name") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        comment: String(formData.get("comment") || "").trim(),
        answers: questions.map((question, index) => ({
            question: question.title,
            answer: answers[index],
        })),
        submittedAt: new Date().toISOString(),
        source: "air-conditioner-lviv-quiz",
    };

    if (!payload.name) {
        status.textContent = "Вкажіть, будь ласка, ім'я.";
        return;
    }

    if (!validatePhone(payload.phone)) {
        status.textContent = "Вкажіть коректний номер телефону.";
        return;
    }

    isSubmitting = true;
    submitButton.disabled = true;
    status.textContent = "Надсилаємо заявку...";

    try {
        const requestBody = new FormData();
        requestBody.append("name", payload.name);
        requestBody.append("phone", payload.phone);
        requestBody.append("comment", payload.comment);
        requestBody.append("source", payload.source);
        requestBody.append("submitted_at", payload.submittedAt);
        requestBody.append("answers_json", JSON.stringify(payload.answers));
        requestBody.append(
            "answers_text",
            payload.answers.map((item, index) => `${index + 1}. ${item.question}: ${item.answer}`).join("\n"),
        );

        const response = await fetch("send.php", {
            method: "POST",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
            body: requestBody,
        });
        const result = await response.json().catch(() => ({ ok: response.ok }));

        if (!response.ok || !result.ok) {
            throw new Error("request_failed");
        }

        form.reset();
        status.textContent = "Заявку успішно надіслано.";
        openModal();
        answers = createInitialAnswers();
        currentStep = 0;
        render();
    } catch (error) {
        status.textContent = "Не вдалося надіслати заявку. Спробуйте ще раз трохи пізніше.";
    } finally {
        isSubmitting = false;
        submitButton.disabled = false;
    }
}

function openModal() {
    successModal.classList.add("is-open");
    successModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    successModal.classList.remove("is-open");
    successModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

nextButton.addEventListener("click", () => {
    if (currentStep >= questions.length || !hasAnswer(questions[currentStep], answers[currentStep])) {
        return;
    }

    currentStep += 1;
    render();
});

prevButton.addEventListener("click", () => {
    if (currentStep === 0) {
        return;
    }

    currentStep -= 1;
    render();
});

quizContent.addEventListener("click", (event) => {
    const optionButton = event.target.closest("[data-option]");

    if (!(optionButton instanceof HTMLElement) || !quizContent.contains(optionButton) || currentStep >= questions.length) {
        return;
    }

    const selectedValue = optionButton.dataset.option ?? "";
    if (!selectedValue || answers[currentStep] === selectedValue) {
        return;
    }

    answers[currentStep] = selectedValue;
    syncSelectedOption();
    updateProgress();
});

quizContent.addEventListener("input", (event) => {
    if (currentStep >= questions.length || questions[currentStep].type !== "range") {
        return;
    }

    const question = questions[currentStep];
    if (!(event.target instanceof HTMLInputElement)) {
        return;
    }

    if (!event.target.matches("[data-range-slider], [data-range-number]")) {
        return;
    }

    const rawValue = Number.parseInt(event.target.value, 10);
    const safeValue = Number.isFinite(rawValue) ? rawValue : question.defaultValue;
    syncRangeQuestion(safeValue);
});

quizContent.addEventListener("change", (event) => {
    if (currentStep >= questions.length || questions[currentStep].type !== "range") {
        return;
    }

    const question = questions[currentStep];
    if (!(event.target instanceof HTMLInputElement) || !event.target.matches("[data-range-number]")) {
        return;
    }

    const rawValue = Number.parseInt(event.target.value, 10);
    const safeValue = Number.isFinite(rawValue) ? rawValue : question.defaultValue;
    syncRangeQuestion(safeValue);
});

closeModalButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && successModal.classList.contains("is-open")) {
        closeModal();
    }
});

render();
