// Тест по уроку «Предположения: must / may / might / can't» — B1-B2
if (typeof window.B1B2_TESTS === "undefined") { window.B1B2_TESTS = {}; }
window.B1B2_TESTS["modal-deduction"] = {
    lessonId: "modal-deduction",
    questions: [
        {
            q: "The lights are off. She ___ be at home.",
            options: ["can't", "mustn't", "may", "must"],
            correct: 0,
            why: "Вывод «точно нет» — can't: She can't be at home."
        },
        {
            q: "He has worked all night. He ___ be tired.",
            options: ["must", "can't", "might not", "may"],
            correct: 0,
            why: "Логичный вывод «наверняка так» — must: He must be tired."
        },
        {
            q: "He ___ be 30 years old — he looks much younger.",
            options: ["can't", "must", "may", "is"],
            correct: 0,
            why: "«Точно не так» (по виду не похоже) — can't be 30."
        },
        {
            q: "It ___ rain tomorrow. Take an umbrella.",
            options: ["may", "must", "can't", "had"],
            correct: 0,
            why: "Возможность — may: It may rain tomorrow."
        },
        {
            q: "She ___ at the meeting right now. (возможно)",
            options: ["might be", "must be", "can't be", "is"],
            correct: 0,
            why: "Неуверенное предположение — might be."
        },
        {
            q: "Выберите правильную структуру.",
            options: ["He might comes late.", "He might come late.", "He must comes late.", "He may to come late."],
            correct: 1,
            why: "После may / might глагол в начальной форме без to и без -s: might come."
        },
        {
            q: "They ___ be very rich — they own a yacht.",
            options: ["can't", "must", "may not", "might"],
            correct: 1,
            why: "Вывод по факту (есть яхта) — must: They must be very rich."
        },
        {
            q: "It's green and talks! That ___ be a parrot.",
            options: ["can't", "must", "mayn't", "would"],
            correct: 1,
            why: "Зелёное и говорит — уверенный вывод: That must be a parrot."
        },
        {
            q: "— Where is Tom? — He ___ be in the kitchen. (возможно)",
            options: ["might", "must", "can't", "isn't"],
            correct: 0,
            why: "Неуверенное предположение — might: He might be in the kitchen."
        },
        {
            q: "The meeting ___ start on time. (возможно, не начнётся)",
            options: ["might not", "mustn't", "can't", "not might"],
            correct: 0,
            why: "«Возможно, нет» — might not: The meeting might not start on time."
        }
    ]
};