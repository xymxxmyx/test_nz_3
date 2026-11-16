// Уроки: грамматика среднего уровня — B1-B2
// Каждый урок: id, icon, title, desc (в списке), intro, sections (heading/paragraphs/examples [en, ru]), summary
const B1B2_LESSONS = [
    {
        id: "present-perfect",
        icon: "⏰",
        title: "Настоящее совершённое время (Present Perfect)",
        desc: "have / has + третья форма: опыт, результат и маркеры времени",
        intro: "Present Perfect связывает прошлое и настоящее: действие уже произошло, но его результат важен сейчас. Формула: have / has + третья форма глагола.",
        sections: [
            {
                heading: "Как образуется",
                paragraphs: [
                    "Формула: have (I, we, you, they) / has (he, she, it) + третья форма глагола (V3): I have seen, She has finished.",
                    "Правильные глаголы получают -ed (finish → finished), а третью форму неправильных нужно запоминать: go → gone, see → seen, eat → eaten."
                ],
                examples: [
                    ["I have seen this film.", "Я (уже) видел этот фильм."],
                    ["She has finished her homework.", "Она закончила домашнее задание."],
                    ["We have been to London.", "Мы были в Лондоне (опыт)."]
                ]
            },
            {
                heading: "Когда используем",
                paragraphs: [
                    "Present Perfect описывает опыт (Have you ever...?), результат, который важен сейчас, и действия в незаконченный период (today, this week).",
                    "already и just ставятся перед третьей формой, yet — в конце вопроса и отрицания.",
                    "Если указано точное время (yesterday, in 2010), используем Past Simple."
                ],
                examples: [
                    ["I have just finished the task.", "Я только что закончил задание."],
                    ["Have you washed the dishes yet?", "Ты уже помыл посуду?"],
                    ["She has already left.", "Она уже ушла."],
                    ["He went to London in 2010.", "Он ездил в Лондон в 2010 году."]
                ]
            },
            {
                heading: "since и for",
                paragraphs: [
                    "for — «как долго» (продолжительность): for two years. since — «с какого момента»: since 2015.",
                    "ever — «когда-либо» (в вопросах), never — «никогда»: Have you ever ...? I have never ..."
                ],
                examples: [
                    ["I have lived here for five years.", "Я живу здесь пять лет."],
                    ["She has worked here since 2015.", "Она работает здесь с 2015 года."],
                    ["Have you ever tried sushi?", "Ты когда-нибудь пробовал суши?"]
                ]
            }
        ],
        summary: [
            "have / has + третья форма (V3): see → seen, go → gone.",
            "Маркеры: already, just, yet, ever, never.",
            "for — продолжительность, since — начало; точное время — только Past Simple."
        ]
    },
    {
        id: "past-continuous",
        icon: "🎬",
        title: "Прошедшее продолженное время (Past Continuous)",
        desc: "was / were + -ing: действие в процессе в прошлом",
        intro: "Past Continuous (was / were + глагол с -ing) описывает длительное действие, которое происходило в определённый момент в прошлом или было прервано другим действием.",
        sections: [
            {
                heading: "Как образуется",
                paragraphs: [
                    "Формула: was (I, he, she, it) / were (we, you, they) + глагол с -ing: was reading, were playing.",
                    "Отрицание — was not (wasn't), were not (weren't). Вопрос — was / were на первое место."
                ],
                examples: [
                    ["I was reading at 7 pm.", "Я читал в семь вечера."],
                    ["She was sleeping all evening.", "Она спала весь вечер."],
                    ["They were playing football.", "Они играли в футбол."]
                ]
            },
            {
                heading: "Прерывание действия",
                paragraphs: [
                    "Одно действие прерывает другое: длительное (Past Continuous) + короткое (Past Simple). Связываем их словами when и while.",
                    "while — с длительным действием, when — обычно с коротким."
                ],
                examples: [
                    ["I was cooking when he arrived.", "Я готовил, когда он пришёл."],
                    ["While she was talking, the phone rang.", "Пока она говорила, зазвонил телефон."],
                    ["He fell asleep while he was watching TV.", "Он уснул, пока смотрел телевизор."]
                ]
            },
            {
                heading: "Когда ещё используем",
                paragraphs: [
                    "Два параллельных действия в прошлом (while), а также описание обстановки: что кто-то делал в определённый момент.",
                    "Маркеры: at 7 o'clock yesterday, at that moment, all evening."
                ],
                examples: [
                    ["At 9 o'clock we were still working.", "В девять мы всё ещё работали."],
                    ["While I was cooking, my sister was dancing.", "Пока я готовила, сестра танцевала."],
                    ["What were you doing at 7 am?", "Что ты делал в семь утра?"]
                ]
            }
        ],
        summary: [
            "was / were + глагол с -ing — действие в процессе в прошлом.",
            "Длительное действие прерывает Past Simple: was doing when ... happened.",
            "while — с длительным действием, when — с коротким."
        ]
    },
    {
        id: "future-forms",
        icon: "🔮",
        title: "Будущее: will / going to / Present Continuous",
        desc: "Спонтанные решения, планы и договорённости",
        intro: "В английском нет одного будущего времени — для него используются will, be going to и Present Continuous. Выбор зависит от того, спонтанное это решение, план или договорённость.",
        sections: [
            {
                heading: "will",
                paragraphs: [
                    "will + начальная форма глагола, сокращение 'll.",
                    "Используем для спонтанных решений, обещаний, предложений и прогнозов с I think, probably."
                ],
                examples: [
                    ["Don't worry, I'll help you.", "Не волнуйся, я помогу тебе."],
                    ["I think it will rain.", "Думаю, будет дождь."],
                    ["She will call you tonight.", "Она позвонит тебе вечером."]
                ]
            },
            {
                heading: "be going to",
                paragraphs: [
                    "am / is / are going to + глагол — планы и намерения, решения, принятые заранее.",
                    "Также прогнозы на основе того, что мы видим: чёрные тучи → it's going to rain."
                ],
                examples: [
                    ["I'm going to study English next year.", "Я собираюсь учить английский в следующем году."],
                    ["Look at those clouds! It's going to rain.", "Посмотри на те тучи! Будет дождь."],
                    ["We are going to visit our grandparents.", "Мы собираемся навестить бабушку с дедушкой."]
                ]
            },
            {
                heading: "Present Continuous для будущего",
                paragraphs: [
                    "Договорённости с указанием времени: I'm meeting him at 6.",
                    "will — решение в момент речи, going to — план, Present Continuous — запланированная договорённость."
                ],
                examples: [
                    ["I'm seeing the dentist tomorrow.", "Я иду к стоматологу завтра."],
                    ["They're flying to Paris on Friday.", "В пятницу они летят в Париж."],
                    ["She is having a party this weekend.", "На выходных у неё вечеринка."]
                ]
            }
        ],
        summary: [
            "will — спонтанное решение, обещание, прогноз.",
            "be going to — план или намерение.",
            "Present Continuous + время — запланированная договорённость."
        ]
    },
    {
        id: "conditionals",
        icon: "🧩",
        title: "Условные предложения: Zero и First Conditional",
        desc: "Если ... → факты (Zero) и реальное будущее (First)",
        intro: "Условные предложения описывают ситуации «если». Zero Conditional говорит о фактах и правилах, First Conditional — о реальных условиях в будущем.",
        sections: [
            {
                heading: "Zero Conditional",
                paragraphs: [
                    "Формула: If + Present Simple, Present Simple. Описывает факты, правила и очевидные вещи.",
                    "В общих истинах if можно заменить на when."
                ],
                examples: [
                    ["If you heat ice, it melts.", "Если нагреть лёд, он тает."],
                    ["When you mix red and white, you get pink.", "Если смешать красный и белый, получится розовый."],
                    ["If I get up late, I miss my bus.", "Если я встаю поздно, я опаздываю на автобус."]
                ]
            },
            {
                heading: "First Conditional",
                paragraphs: [
                    "Формула: If + Present Simple, will + глагол. Реальное условие в будущем: что произойдёт, если условие выполнится.",
                    "Когда предложение начинается с if, ставится запятая. В части с if никогда не используем will."
                ],
                examples: [
                    ["If it rains, we will stay at home.", "Если пойдёт дождь, мы останемся дома."],
                    ["We will miss the train if we don't hurry.", "Мы опоздаем на поезд, если не поторопимся."],
                    ["If she calls, I will talk to her.", "Если она позвонит, я поговорю с ней."]
                ]
            },
            {
                heading: "if / when / unless",
                paragraphs: [
                    "unless = if ... not («если не»).",
                    "when — «когда» (уверенность, что это произойдёт), if — «если» (менее уверенно)."
                ],
                examples: [
                    ["Unless you study, you won't pass the exam.", "Если ты не будешь заниматься, ты не сдашь экзамен."],
                    ["I will call you when I arrive.", "Я позвоню тебе, когда приеду."],
                    ["If I have time, I will help you.", "Если у меня будет время, я помогу тебе."]
                ]
            }
        ],
        summary: [
            "Zero: If + Present Simple, Present Simple — факты.",
            "First: If + Present Simple, will + глагол — реальное будущее.",
            "unless = if ... not; when — уверенность, if — условие."
        ]
    },
    {
        id: "modal-deduction",
        icon: "🕵️",
        title: "Предположения: must / may / might / can't",
        desc: "Уверенность и вероятность: наверняка, возможно, точно нет",
        intro: "Модальные глаголы выражают предположения: must — «наверняка», can't — «точно нет», may / might — «возможно». Они одинаковы для всех лиц.",
        sections: [
            {
                heading: "must и can't",
                paragraphs: [
                    "must + глагол — уверенность, что это так (логичный вывод по фактам).",
                    "can't + глагол — уверенность, что это не так.",
                    "Важно: в предположениях must НЕ значит «должен»."
                ],
                examples: [
                    ["He must be rich.", "Он, наверное, богат."],
                    ["She can't be at home — the lights are off.", "Её точно нет дома — свет выключен."],
                    ["You must be tired after such a long trip.", "Ты, должно быть, устал после такой долгой поездки."]
                ]
            },
            {
                heading: "may / might",
                paragraphs: [
                    "may / might + глагол — возможность (около 50%). might звучит чуть менее уверенно.",
                    "Отрицание: might not / may not — «возможно, нет»."
                ],
                examples: [
                    ["It may rain tomorrow.", "Завтра, возможно, будет дождь."],
                    ["She might be at work now.", "Она, возможно, сейчас на работе."],
                    ["The meeting might not start on time.", "Встреча, возможно, не начнётся вовремя."]
                ]
            },
            {
                heading: "Без to и -s",
                paragraphs: [
                    "После must / may / might / can't глагол стоит в начальной форме без to: He might come (не might comes).",
                    "Модальные глаголы не меняются по лицам: I must, he must, they must."
                ],
                examples: [
                    ["He might come late.", "Он, возможно, придёт поздно."],
                    ["She may call you tomorrow.", "Она, возможно, позвонит тебе завтра."],
                    ["They must know the truth.", "Они, должно быть, знают правду."]
                ]
            }
        ],
        summary: [
            "must — точно так, can't — точно не так (вывод).",
            "may / might — возможно, вероятно.",
            "После модальных глаголов — начальная форма без to и без -s."
        ]
    },
    {
        id: "comparatives",
        icon: "📏",
        title: "Степени сравнения прилагательных",
        desc: "bigger, more interesting, the best — как сравнивать",
        intro: "Степени сравнения нужны, чтобы сравнивать предметы: big → bigger → the biggest, interesting → more interesting → the most interesting.",
        sections: [
            {
                heading: "Короткие прилагательные",
                paragraphs: [
                    "Односложные получают -er / -est: old → older → oldest.",
                    "После ударного слога согласная удваивается: big → bigger, hot → hotter. Слова на -y: happy → happier.",
                    "Исключения: good → better → the best, bad → worse → the worst, far → farther / further."
                ],
                examples: [
                    ["My brother is older than me.", "Мой брат старше меня."],
                    ["Today is hotter than yesterday.", "Сегодня жарче, чем вчера."],
                    ["She is the best student in the class.", "Она лучшая ученица в классе."]
                ]
            },
            {
                heading: "Длинные прилагательные",
                paragraphs: [
                    "Многосложные образуют степени с more / the most: interesting → more interesting → the most interesting.",
                    "Сравнение «такой же…, как» — as ... as. «Не такой… как» — not as ... as."
                ],
                examples: [
                    ["This film is more interesting than that one.", "Этот фильм интереснее, чем тот."],
                    ["She is as tall as her brother.", "Она такая же высокая, как её брат."],
                    ["This test is not as difficult as the last one.", "Этот тест не такой сложный, как прошлый."]
                ]
            },
            {
                heading: "than и усилители",
                paragraphs: [
                    "Перед вторым предметом сравнения — than: This car is faster than mine.",
                    "Усилители степени: much, a little, far — much better, a little older."
                ],
                examples: [
                    ["Your bag is much bigger than mine.", "Твоя сумка намного больше моей."],
                    ["This task is a little harder than the previous one.", "Это задание немного сложнее предыдущего."],
                    ["The new phone is far more expensive.", "Новый телефон гораздо дороже."]
                ]
            }
        ],
        summary: [
            "Один слог — -er / -est: big → bigger → the biggest.",
            "Длинные — more / the most: beautiful → more beautiful.",
            "as ... as — такой же; than — чем; much, a little, far — усилители."
        ]
    },
    {
        id: "relative-clauses",
        icon: "🔗",
        title: "Относительные придаточные: who / which / that",
        desc: "Кто, который, где и чей — соединяем предложения",
        intro: "Относительные придаточные помогают объяснить, о ком или о чём идёт речь: The man who lives next door is a doctor. Ключевые слова: who, which, that, where, whose.",
        sections: [
            {
                heading: "who / which / that",
                paragraphs: [
                    "who — о людях, which — о предметах и животных, that — и о людях, и о вещах (разговорный стиль).",
                    "Порядок: существительное → союз → придаточное."
                ],
                examples: [
                    ["The doctor who helped me was kind.", "Врач, который мне помог, был добрым."],
                    ["The book which I borrowed is great.", "Книга, которую я взял, отличная."],
                    ["That's the house that my grandfather built.", "Это дом, который построил мой дедушка."]
                ]
            },
            {
                heading: "where / whose",
                paragraphs: [
                    "where — о месте, whose — о принадлежности («чей»).",
                    "whose ставится перед существительным: the man whose car."
                ],
                examples: [
                    ["This is the cafe where we first met.", "Это кафе, где мы встретились впервые."],
                    ["The girl whose bag is lost is crying.", "Девочка, чья сумка потерялась, плачет."],
                    ["I know a place where you can swim.", "Я знаю место, где можно плавать."]
                ]
            },
            {
                heading: "Определяющие и неопределяющие",
                paragraphs: [
                    "Определяющее придаточное уточняет предмет — без него смысл теряется. Запятые не нужны.",
                    "Неопределяющее — дополнительная информация, отделяется запятыми. В нём не используют that (только who / which)."
                ],
                examples: [
                    ["My brother, who lives in Paris, speaks French.", "Мой брат, который живёт в Париже, говорит по-французски."],
                    ["The video, which is very popular, was filmed here.", "Это видео, которое очень популярно, снято здесь."]
                ]
            }
        ],
        summary: [
            "who — люди, which — вещи, that — и люди, и вещи.",
            "where — место, whose — принадлежность.",
            "Неопределяющие придаточные отделяются запятыми; в них нет that."
        ]
    },
    {
        id: "reported-speech",
        icon: "💬",
        title: "Косвенная речь",
        desc: "said / told, сдвиг времён и вопросы «asked if»",
        intro: "Косвенная речь передаёт слова другого человека без точного цитирования: He said, «I am tired» → He said (that) he was tired. При этом время обычно «сдвигается» на шаг назад.",
        sections: [
            {
                heading: "say / tell",
                paragraphs: [
                    "say + (that) + предложение: He said (that) he was busy.",
                    "tell + кому + (that): She told me (that) she was busy. После said не ставим me."
                ],
                examples: [
                    ["He said that he was busy.", "Он сказал, что занят."],
                    ["She told me she was tired.", "Она сказала мне, что устала."],
                    ["They said the train was late.", "Они сказали, что поезд опаздывает."]
                ]
            },
            {
                heading: "Сдвиг времён",
                paragraphs: [
                    "am / is → was, are → were, а остальные настоящие времена тоже уходят в прошедшие: want → wanted, is doing → was doing.",
                    "Будущее и модальные: will → would, can → could, may → might."
                ],
                examples: [
                    ["He said: «I am tired» → He said he was tired.", "Он сказал: «Я устал» → Он сказал, что устал."],
                    ["«I will come» → She said she would come.", "«Я приду» → Она сказала, что придёт."],
                    ["«I can swim» → He said he could swim.", "«Я умею плавать» → Он сказал, что умеет плавать."]
                ]
            },
            {
                heading: "Вопросы и указания",
                paragraphs: [
                    "Вопросы: asked + if / whether + прямой порядок слов (без do / does).",
                    "Команды и просьбы: tell / ask + to + глагол."
                ],
                examples: [
                    ["He asked if I was ready.", "Он спросил, готов ли я."],
                    ["She asked me where I lived.", "Она спросила меня, где я живу."],
                    ["The teacher told us to open the books.", "Учитель велел нам открыть книги."],
                    ["Mom asked me to buy milk.", "Мама попросила меня купить молоко."]
                ]
            }
        ],
        summary: [
            "said that / told me that — после said не ставится me.",
            "Сдвиг времён: am → was, will → would, can → could.",
            "Вопросы: asked if + прямой порядок слов; команды: told / asked + to."
        ]
    }
];