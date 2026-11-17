// Тест по уроку «Глагол to be (am / is / are)» — А1-А2
if (typeof window.A1A2_TESTS === "undefined") { window.A1A2_TESTS = {}; }
window.A1A2_TESTS["to-be"] = {
    lessonId: "to-be",
    questions: [
        {
            q: "I ___ a doctor.",
            options: ["am", "is", "are", "be"],
            correct: 0,
            why: "С I всегда только am: I am a doctor."
        },
        {
            q: "She ___ my sister.",
            options: ["am", "is", "are", "be"],
            correct: 1,
            why: "С he / she / it используем is: She is my sister."
        },
        {
            q: "They ___ from Spain.",
            options: ["am", "is", "are", "be"],
            correct: 2,
            why: "С they используем are: They are from Spain."
        },
        {
            q: "We ___ at home.",
            options: ["is", "are", "am", "be"],
            correct: 1,
            why: "С we используем are: We are at home."
        },
        {
            q: "Bob and Tom ___ students.",
            options: ["is", "am", "are", "be"],
            correct: 2,
            why: "Bob and Tom — это they, поэтому are: are students."
        },
        {
            q: "Выберите отрицание: «Он не учитель».",
            options: ["He are not a teacher.", "He am not a teacher.", "He isn't a teacher.", "He don't be a teacher."],
            correct: 2,
            why: "Отрицание с is — is not / isn't: He isn't a teacher."
        },
        {
            q: "___ you hungry ?",
            options: ["Is", "Am", "Are", "Does"],
            correct: 2,
            why: "В вопросе с you форма are уходит на первое место: Are you hungry ?"
        },
        {
            q: "___ she happy ?",
            options: ["Is", "Am", "Are", "Do"],
            correct: 0,
            why: "В вопросе с she форма is на первом месте: Is she happy ?"
        },
        {
            q: "I ___ tired. (я не устал)",
            options: ["am not", "isn't", "aren't", "not am"],
            correct: 0,
            why: "С I отрицание — am not: I am not tired."
        },
        {
            q: "Выберите правильный вариант: «Они не в школе».",
            options: ["They not are at school.", "They aren't at school.", "They isn't at school.", "They don't at school."],
            correct: 1,
            why: "С they отрицание — are not / aren't: They aren't at school."
        }
    ]
};