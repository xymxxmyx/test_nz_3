// Уроки: базовые правила английского — уровень А1-А2
// Каждый урок: id, icon, title, desc (в списке), intro, sections (heading/paragraphs/examples [en, ru]), summary
const A1A2_LESSONS = [
    {
        id: "word-order",
        icon: "🧱",
        title: "Порядок слов в предложении",
        desc: "Прямой порядок слов, настоящее простое время, вопросы и отрицания",
        intro: "В английском языке порядок слов в предложении строго зафиксирован. Переставлять слова, как в русском, нельзя — от этого ломается смысл предложения.",
        sections: [
            {
                heading: "Прямой порядок слов",
                paragraphs: [
                    "Утвердительное предложение строится так: Подлежащее (кто ?) → Сказуемое (что делает ?) → Дополнение (что / кого ?).",
                    "Настоящее простое время (Present Simple) используем для регулярных действий, фактов и привычек."
                ],
                examples: [
                    ["I play football.", "Я играю в футбол."],
                    ["She drinks tea.", "Она пьёт чай."],
                    ["We live in Moscow.", "Мы живём в Москве."],
                    ["He watches TV in the evening.", "Он смотрит телевизор вечером."]
                ]
            },
            {
                heading: "Окончание -s у глагола",
                paragraphs: [
                    "В третьем лице единственного числа (he, she, it) к глаголу добавляется -s или -es: play → plays, watch → watches.",
                    "В остальных случаях (I, you, we, they) глагол стоит без окончания."
                ],
                examples: [
                    ["He plays football.", "Он играет в футбол."],
                    ["They play football.", "Они играют в футбол."],
                    ["She watches TV.", "Она смотрит телевизор."]
                ]
            },
            {
                heading: "Вопросы и отрицания с do / does",
                paragraphs: [
                    "В вопросах и отрицаниях Present Simple на помощь приходят вспомогательные глаголы do (I, you, we, they) и does (he, she, it).",
                    "В отрицании после do / does ставится частица not, а основной глагол возвращается в начальную форму (без -s).",
                    "Наречия частотности (always, usually, often, never) ставятся перед основным глаголом."
                ],
                examples: [
                    ["Do you play football ?", "Ты играешь в футбол ?"],
                    ["Does she drink tea ?", "Она пьёт чай ?"],
                    ["She does not (doesn't) drink coffee.", "Она не пьёт кофе."],
                    ["I always drink tea in the morning.", "Я всегда пью чай утром."]
                ]
            }
        ],
        summary: [
            "Порядок слов: Подлежащее → Сказуемое → Дополнение.",
            "В Present Simple у he / she / it глагол получает -s.",
            "Вопросы — с do / does, отрицания — с don't / doesn't + начальная форма глагола."
        ]
    },
    {
        id: "to-be",
        icon: "⚖️",
        title: "Глагол to be (am / is / are)",
        desc: "Самый важный глагол-связка, вопросы и отрицания",
        intro: "Глагол to be («быть») — главный глагол-связка. Он нужен, когда в русском предложении глагола нет: «Я студент», «Она врач», «Они дома».",
        sections: [
            {
                heading: "Формы глагола",
                paragraphs: [
                    "У to be три формы: am (только с I), is (he, she, it) и are (we, you, they).",
                    "Запомните соответствия: I am, you are, he / she / it is, we are, they are."
                ],
                examples: [
                    ["I am a student.", "Я студент."],
                    ["She is a doctor.", "Она врач."],
                    ["They are friends.", "Они друзья."],
                    ["We are at home.", "Мы дома."]
                ]
            },
            {
                heading: "Отрицание",
                paragraphs: [
                    "Чтобы сделать отрицание, добавьте not после формы: am not, is not, are not.",
                    "В разговорной речи используют сокращения: isn't и aren't."
                ],
                examples: [
                    ["I am not tired.", "Я не устал."],
                    ["She is not (isn't) at work.", "Она не на работе."],
                    ["They are not (aren't) happy.", "Они не счастливы."]
                ]
            },
            {
                heading: "Вопросы",
                paragraphs: [
                    "В вопросах форма am / is / are переезжает на первое место: Are you ...? Is she ...?"
                ],
                examples: [
                    ["Are you ready ?", "Ты готов ?"],
                    ["Is she a teacher ?", "Она учительница ?"],
                    ["Are they at home ?", "Они дома ?"]
                ]
            }
        ],
        summary: [
            "I am, he / she / it is, we / you / they are.",
            "Отрицание: am not / isn't / aren't.",
            "Вопрос: форма глагола на первое место — Are you ...?, Is she ...?"
        ]
    },
    {
        id: "plural-articles",
        icon: "🔢",
        title: "Множественное число и артикли",
        desc: "Как образуется множественное число и когда ставить a, an, the",
        intro: "Множественное число в английском чаще всего образуется добавлением -s. Артикль a / an указывает на «один из», а the — на «конкретный».",
        sections: [
            {
                heading: "Множественное число",
                paragraphs: [
                    "Большинство существительных образуют множественное число добавлением -s: cat → cats.",
                    "После -s, -ss, -x, -sh, -ch добавляем -es: box → boxes, dish → dishes, bus → buses.",
                    "Если слово оканчивается на согласную + y, то y меняется на -ies: city → cities."
                ],
                examples: [
                    ["a cat → cats", "кот → коты"],
                    ["a box → boxes", "коробка → коробки"],
                    ["a city → cities", "город → города"]
                ]
            },
            {
                heading: "Исключения",
                paragraphs: [
                    "Некоторые слова меняют форму целиком — их нужно просто запомнить."
                ],
                examples: [
                    ["man → men", "мужчина → мужчины"],
                    ["woman → women", "женщина → женщины"],
                    ["child → children", "ребёнок → дети"],
                    ["foot → feet", "ступня → ступни"]
                ]
            },
            {
                heading: "Артикли a / an / the",
                paragraphs: [
                    "Неопределённый артикль a / an ставят перед единственным числом, когда говорят о чём-то в первый раз: «какой-то, один из».",
                    "an ставим перед словами, начинающимися с гласного звука: an apple, an hour. Перед согласным звуком — a: a cat, a book.",
                    "Определённый артикль the используют, когда речь о конкретном предмете, который уже известен собеседнику."
                ],
                examples: [
                    ["I have a cat.", "У меня есть кот (какой-то)."],
                    ["Give me an apple.", "Дай мне яблоко."],
                    ["The cat is on the sofa.", "Тот самый кот на диване."]
                ]
            }
        ],
        summary: [
            "-s для множественного числа, -es после s / x / sh / ch, -ies после согласной + y.",
            "Исключения: man → men, child → children, foot → feet.",
            "a — перед согласным звуком, an — перед гласным, the — для конкретного предмета."
        ]
    },
    {
        id: "pronouns",
        icon: "👤",
        title: "Личные и притяжательные местоимения",
        desc: "I / you / he / she / it, my / your / his — как не путать",
        intro: "Местоимения заменяют существительные и помогают не повторять слова. Важно различать личные местоимения (кто ?) и притяжательные (чей ?).",
        sections: [
            {
                heading: "Личные местоимения",
                paragraphs: [
                    "Личные местоимения показывают, кто выполняет действие: I, you, he, she, it, we, they.",
                    "he — мужчина, she — женщина, it — предмет или животное, they — они (несколько людей или предметов)."
                ],
                examples: [
                    ["I am here.", "Я здесь."],
                    ["She is my friend.", "Она моя подруга."],
                    ["It is a cat.", "Это кот."],
                    ["They are students.", "Они студенты."]
                ]
            },
            {
                heading: "You — и ты, и вы",
                paragraphs: [
                    "В английском нет отдельного слова для «вы». You значит и «ты», и «вы» — и глагол с ним всегда одинаковый (are)."
                ],
                examples: [
                    ["You are kind.", "Ты добрый / Вы добры."],
                    ["You speak English.", "Ты говоришь по-английски / Вы говорите по-английски."]
                ]
            },
            {
                heading: "Притяжательные местоимения",
                paragraphs: [
                    "Притяжательные местоимения отвечают на вопрос «чей?» и всегда стоят перед существительным: my (мой), your (твой/ваш), his (его), her (её), its (его/её — вещи), our (наш), their (их).",
                    "Запомните пары: I → my, you → your, he → his, she → her, we → our, they → their."
                ],
                examples: [
                    ["This is my book.", "Это моя книга."],
                    ["Her name is Anna.", "Её зовут Анна."],
                    ["Their house is big.", "Их дом большой."]
                ]
            }
        ],
        summary: [
            "Личные: I, you, he, she, it, we, they.",
            "you = ты и вы одновременно.",
            "Притяжательные отвечают на «чей»: my, your, his, her, our, their."
        ]
    },
    {
        id: "can-must",
        icon: "💪",
        title: "Глаголы can и must",
        desc: "Мочь, уметь и должен — без сложных спряжений",
        intro: "Глаголы can (мочь, уметь) и must (должен) — особенные: после них глагол стоит в начальной форме без to и без окончаний, независимо от лица.",
        sections: [
            {
                heading: "Can — мочь, уметь",
                paragraphs: [
                    "Can всегда в одной форме: I can, he can, they can. После can не ставим to и не добавляем -s: He can swim (не can swims).",
                    "Вопрос образуется перестановкой can на первое место, отрицание — can not (can't)."
                ],
                examples: [
                    ["I can swim.", "Я умею плавать."],
                    ["She can play guitar.", "Она умеет играть на гитаре."],
                    ["Can you help me ?", "Ты можешь мне помочь ?"],
                    ["He can't drive.", "Он не умеет водить."]
                ]
            },
            {
                heading: "Must — должен",
                paragraphs: [
                    "Must тоже не меняется по лицам и используется для обязанностей и правил.",
                    "Отрицание must not (mustn't) значит «нельзя, запрещено».",
                    "must и can не сочетаются друг с другом и с do в вопросах."
                ],
                examples: [
                    ["I must go now.", "Я должен идти сейчас."],
                    ["You must wear a uniform.", "Вы должны носить форму."],
                    ["You mustn't smoke here.", "Здесь нельзя курить."]
                ]
            },
            {
                heading: "Разница с to be + able",
                paragraphs: [
                    "Для будущего или прошедшего времени с can используют конструкции to be able to (быть способным).",
                    "Уровню А1-А2 достаточно уверенно пользоваться can и must в настоящем времени."
                ],
                examples: [
                    ["I am able to help you.", "Я могу (способен) помочь тебе."],
                    ["He was able to finish the task.", "Он смог закончить задание."]
                ]
            }
        ],
        summary: [
            "can / must не меняются по лицам и не добавляют -s.",
            "После can / must глагол в начальной форме без to.",
            "Вопрос — can/must на первое место, отрицание — can't / mustn't."
        ]
    },
    {
        id: "question-words",
        icon: "❓",
        title: "Вопросительные слова",
        desc: "What, Where, When, Who, Why, How — порядок вопросов",
        intro: "Вопросительные слова (what, where, when, who, why, how) ставятся в начало вопроса и требуют конкретного ответа, а не «да/нет».",
        sections: [
            {
                heading: "Основные слова",
                paragraphs: [
                    "What — что / какой, Where — где / куда, When — когда, Who — кто, Why — почему, How — как.",
                    "How может образовывать сочетания: How old (сколько лет), How many (сколько, с исчисляемыми), How much (сколько, с неисчисляемыми)."
                ],
                examples: [
                    ["What is your name ?", "Как тебя зовут ?"],
                    ["Where do you live ?", "Где ты живёшь ?"],
                    ["When do you wake up ?", "Когда ты встаёшь ?"],
                    ["Who is your teacher ?", "Кто твой учитель ?"]
                ]
            },
            {
                heading: "Порядок слов с Wh-словами",
                paragraphs: [
                    "В вопросах с вопросительным словом порядок: Wh-слово → вспомогательный глагол (do/does/is/are) → подлежащее → основной глагол.",
                    "Если вопрос к подлежащему (кто/что делает ?), вспомогательный глагол не нужен: Who lives here ?"
                ],
                examples: [
                    ["Why are you sad ?", "Почему ты грустный ?"],
                    ["How do you go to work ?", "Как ты добираешься на работу ?"],
                    ["Who lives here ?", "Кто живёт здесь ?"]
                ]
            },
            {
                heading: "How old / How many / How much",
                paragraphs: [
                    "How old — о возрасте, How many — с исчисляемыми существительными (книги, яблоки), How much — с неисчисляемыми (деньги, вода)."
                ],
                examples: [
                    ["How old are you ?", "Сколько тебе лет ?"],
                    ["How many books do you have ?", "Сколько у тебя книг ?"],
                    ["How much money do you need ?", "Сколько денег тебе нужно ?"]
                ]
            }
        ],
        summary: [
            "Wh-слово → вспомогательный глагол → подлежащее → глагол.",
            "Вопрос к подлежащему — без вспомогательного глагола.",
            "how many — с исчисляемыми, how much — с неисчисляемыми."
        ]
    },
    {
        id: "present-continuous",
        icon: "⏳",
        title: "Настоящее продолженное время (Present Continuous)",
        desc: "am / is / are + -ing для действий прямо сейчас",
        intro: "Present Continuous (am/is/are + глагол с -ing) описывает действие, происходящее прямо сейчас, в момент речи.",
        sections: [
            {
                heading: "Как образуется",
                paragraphs: [
                    "Формула: форма глагола to be (am / is / are) + глагол с окончанием -ing: am going, is playing, are working.",
                    "-ing образуется добавлением: play → playing. Если слово оканчивается на -e, оно уходит: write → writing. После ударного закрытого слога согласная удваивается: run → running."
                ],
                examples: [
                    ["I am reading now.", "Я читаю сейчас."],
                    ["She is cooking dinner.", "Она готовит ужин."],
                    ["They are playing football.", "Они играют в футбол."],
                    ["He is running in the park.", "Он бегает в парке."]
                ]
            },
            {
                heading: "Отрицание и вопросы",
                paragraphs: [
                    "Отрицание — not после am/is/are: am not, isn't, aren't. Вопрос — форма to be на первое место.",
                    "Маркеры времени: now (сейчас), at the moment (в данный момент), look ! (смотри !)."
                ],
                examples: [
                    ["I am not sleeping.", "Я не сплю."],
                    ["She isn't working today.", "Она сегодня не работает."],
                    ["Are you listening to me ?", "Ты слушаешь меня ?"],
                    ["Look ! The dog is running.", "Смотри ! Собака бежит."]
                ]
            },
            {
                heading: "Когда НЕ используем",
                paragraphs: [
                    "Глаголы состояния (state verbs) не употребляются в Continuous: know (знать), like (нравиться), want (хотеть), need (нуждаться), understand (понимать), love (любить).",
                    "С ними всегда Present Simple."
                ],
                examples: [
                    ["I know the answer.", "Я знаю ответ."],
                    ["She likes coffee.", "Ей нравится кофе."],
                    ["I need help.", "Мне нужна помощь."]
                ]
            }
        ],
        summary: [
            "am / is / are + глагол с -ing — действие прямо сейчас.",
            "Маркеры: now, at the moment, look !",
            "Глаголы состояния (know, like, want, need) — только Present Simple."
        ]
    },
    {
        id: "prepositions",
        icon: "📍",
        title: "Предлоги времени и места",
        desc: "in / on / at — когда какой использовать",
        intro: "Предлоги in, on, at — одни из самых частых. У них есть простые правила для времени и места, которые стоит запомнить.",
        sections: [
            {
                heading: "Время: in / on / at",
                paragraphs: [
                    "at — точное время и моменты: at 5 o'clock, at night, at noon.",
                    "in — месяцы, годы, сезоны и части дня: in May, in 2020, in summer, in the morning.",
                    "on — дни недели и даты: on Monday, on 5 May, on my birthday."
                ],
                examples: [
                    ["The lesson starts at 9 o'clock.", "Урок начинается в 9 часов."],
                    ["I was born in 1995.", "Я родился в 1995 году."],
                    ["We meet on Friday.", "Мы встречаемся в пятницу."]
                ]
            },
            {
                heading: "Место: in / on / at",
                paragraphs: [
                    "at — точка, конкретная позиция: at home, at school, at the bus stop.",
                    "in — внутри чего-то: in the room, in the bag, in Moscow.",
                    "on — на поверхности: on the table, on the wall, on the floor."
                ],
                examples: [
                    ["She is at home.", "Она дома."],
                    ["The keys are in the bag.", "Ключи в сумке."],
                    ["The cup is on the table.", "Чашка на столе."]
                ]
            },
            {
                heading: "Другие важные предлоги",
                paragraphs: [
                    "Into — внутрь (движение), out of — из, under — под, behind — за, next to — рядом с, between — между.",
                    "uphill — сложно, но на уровне А1 достаточно основных предлогов места и времени."
                ],
                examples: [
                    ["The cat is under the chair.", "Кот под стулом."],
                    ["The bank is next to the shop.", "Банк рядом с магазином."],
                    ["The park is between the houses.", "Парк между домами."]
                ]
            }
        ],
        summary: [
            "Время: at (точное время), in (месяцы/годы/части дня), on (дни недели).",
            "Место: at (точка), in (внутри), on (на поверхности).",
            "under — под, behind — за, next to — рядом, between — между."
        ]
    }
];