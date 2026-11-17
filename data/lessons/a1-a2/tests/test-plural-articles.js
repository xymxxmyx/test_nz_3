// Тест по уроку «Множественное число и артикли» — А1-А2
if (typeof window.A1A2_TESTS === "undefined") { window.A1A2_TESTS = {}; }
window.A1A2_TESTS["plural-articles"] = {
    lessonId: "plural-articles",
    questions: [
        {
            q: "Множественное число от «dog»:",
            options: ["doges", "dogs", "dogies", "dogg"],
            correct: 1,
            why: "Обычное слово — добавляем -s: dog → dogs."
        },
        {
            q: "Множественное число от «box»:",
            options: ["boxs", "boxies", "boxes", "box"],
            correct: 2,
            why: "После -x добавляем -es: box → boxes."
        },
        {
            q: "Множественное число от «city»:",
            options: ["citys", "cityes", "cities", "city"],
            correct: 2,
            why: "Согласная + y меняется на -ies: city → cities."
        },
        {
            q: "Множественное число от «baby»:",
            options: ["babys", "babies", "babyes", "baby"],
            correct: 1,
            why: "Согласная + y → -ies: baby → babies."
        },
        {
            q: "Множественное число от «man»:",
            options: ["mans", "men", "manies", "manes"],
            correct: 1,
            why: "Исключение: man → men."
        },
        {
            q: "Множественное число от «child»:",
            options: ["childs", "childes", "children", "childrens"],
            correct: 2,
            why: "Исключение: child → children."
        },
        {
            q: "Аrтикль перед «___ apple»:",
            options: ["a", "an", "the a", "без артикля"],
            correct: 1,
            why: "apple начинается с гласного звука — ставим an: an apple."
        },
        {
            q: "Аrтикль перед «___ umbrella»:",
            options: ["a", "an", "no", "the an"],
            correct: 1,
            why: "umbrella начинается с гласного звука — an umbrella."
        },
        {
            q: "Почему в предложении «The cat is on the sofa» стоит the ?",
            options: ["Это какой-то кот.", "Речь о конкретном коте, известном собеседнику.", "the всегда стоит с животными.", "the нужен для единственного числа."],
            correct: 1,
            why: "the используют для конкретного предмета, уже известного собеседнику."
        },
        {
            q: "Выберите правильный вариант:",
            options: ["I have a dog.", "I have an dog.", "I have dog.", "I have a dogs."],
            correct: 0,
            why: "dog начинается с согласного звука — a dog, и в единственном числе."
        }
    ]
};