// Тест по уроку «Степени сравнения прилагательных» — B1-B2
if (typeof window.B1B2_TESTS === "undefined") { window.B1B2_TESTS = {}; }
window.B1B2_TESTS["comparatives"] = {
    lessonId: "comparatives",
    questions: [
        {
            q: "This box is ___ than that one.",
            options: ["more big", "bigger", "more bigger", "big"],
            correct: 1,
            why: "Один слог + удвоенная согласная: big → bigger."
        },
        {
            q: "Это самый интересный фильм: the ___ film.",
            options: ["most interesting", "interestingest", "more interesting", "more interestingest"],
            correct: 0,
            why: "Длинное прилагательное: the most interesting."
        },
        {
            q: "The weather today is ___ than yesterday.",
            options: ["more hot", "hotter", "hotest", "hottest"],
            correct: 1,
            why: "Сравнение двух предметов — сравнительная степень: hotter (hot → hotter)."
        },
        {
            q: "My sister is ___ than me.",
            options: ["more old", "older", "oldest", "the older"],
            correct: 1,
            why: "Один слог: old → older. В сравнении — than."
        },
        {
            q: "She is ___ her brother.",
            options: ["as tall as", "taller as", "as tall than", "so tall like"],
            correct: 0,
            why: "«Такой же, как» — as ... as: as tall as her brother."
        },
        {
            q: "English is ___ difficult than Russian.",
            options: ["more", "most", "much", "as"],
            correct: 0,
            why: "Многосложное прилагательное: more difficult than."
        },
        {
            q: "He is ___ boy in our class.",
            options: ["tallest", "the tallest", "more tall", "taller"],
            correct: 1,
            why: "С превосходной степенью нужен артикль the: the tallest."
        },
        {
            q: "Good → better → ___.",
            options: ["the best", "bestest", "the better", "most good"],
            correct: 0,
            why: "Исключение: good → better → the best."
        },
        {
            q: "This test is ___ difficult as the last one.",
            options: ["not as", "more", "as more", "so much"],
            correct: 0,
            why: "«Не такой... как» — not as ... as: not as difficult as."
        },
        {
            q: "Усилитель: The new house is ___ bigger than the old one.",
            options: ["much", "more", "many", "very big"],
            correct: 0,
            why: "Усилитель степени — much: much bigger than."
        }
    ]
};