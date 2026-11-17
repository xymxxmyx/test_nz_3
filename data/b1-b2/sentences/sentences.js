// Предложения для уровня B1-B2 (Present Perfect, Past Continuous, будущее,
// условные, предположения, сравнения, относительные придаточные, косвенная речь)
const B1B2_SENTENCES = [
    { en: "I have never been to Japan.", ru: "Я никогда не был в Японии.", altRu: [
        "Я ни разу не был в Японии.", "Я никогда не ездил в Японию.", "Я никогда не бывал в Японии.",
        "Я вообще никогда не был в Японии.", "В Японии я никогда не был.", "Я никогда не посещал Японию.",
        "Я никогда не был в Японии прежде.", "Я никогда не бывала в Японии."
    ], altEn: [
        "I've never been to Japan.", "I have never visited Japan.", "I've never visited Japan.",
        "Never have I been to Japan.", "I have not ever been to Japan."
    ] },
    { en: "She has already finished her homework.", ru: "Она уже закончила домашнее задание.", altRu: [
        "Она уже сделала домашнее задание.", "Она уже выполнила домашнее задание.", "Она закончила домашку.",
        "Она уже сделала уроки.", "Она уже справилась с домашним заданием.", "Она домашнее задание уже закончила.",
        "Домашнее задание она уже закончила.", "Она уже завершила домашнее задание."
    ], altEn: [
        "She's already finished her homework.", "She has already done her homework.",
        "She's already done her homework.", "She has finished her homework already.",
        "She already finished her homework."
    ] },
    { en: "They have lived here since 2015.", ru: "Они живут здесь с 2015 года.", altRu: [
        "Они проживают здесь с 2015 года.", "Здесь они живут с 2015 года.", "Они живут тут с две тысячи пятнадцатого года.",
        "Они живут здесь, начиная с 2015 года.", "С 2015 года они живут здесь.", "Они обитают здесь с 2015 года."
    ], altEn: [
        "They've lived here since 2015.", "They have been living here since 2015.",
        "They've been living here since 2015.", "They have lived here from 2015 onwards.",
        "They have lived here starting in 2015."
    ] },
    { en: "We have known each other for ten years.", ru: "Мы знаем друг друга десять лет.", altRu: [
        "Мы знакомы друг с другом десять лет.", "Мы знакомы уже десять лет.", "Мы знаем друг друга уже десять лет.",
        "Мы дружим вот уже десять лет.", "Десять лет мы знаем друг друга.", "Мы знакомы на протяжении десяти лет.",
        "Мы знакомы вот уже десять лет."
    ], altEn: [
        "We've known each other for ten years.", "We have known one another for ten years.",
        "We've known one another for ten years.", "We have been friends for ten years.",
        "We have known each other since ten years."
    ] },
    { en: "Have you ever tried sushi ?", ru: "Ты когда-нибудь пробовал суши ?", altRu: [
        "Вы когда-нибудь пробовали суши ?", "Ты когда-либо пробовал суши ?", "Вы когда-либо пробовали суши ?",
        "Ты когда-нибудь ел суши ?", "Вы когда-нибудь ели суши ?", "Пробовал ли ты когда-нибудь суши ?",
        "Пробовали ли вы когда-нибудь суши ?", "Ты когда-нибудь пробовала суши ?"
    ], altEn: [
        "Have you ever tried sushi before ?", "Have you ever eaten sushi ?", "Did you ever try sushi ?",
        "Have you at any time tried sushi ?", "Ever tried sushi ?"
    ] },
    { en: "I was watching TV when the phone rang.", ru: "Когда зазвонил телефон, я смотрел телевизор.", altRu: [
        "Я смотрел телевизор, когда зазвонил телефон.", "Телефон зазвонил, когда я смотрел телевизор.",
        "Когда зазвонил телефон, я смотрел телек.", "Я смотрела телевизор, когда зазвонил телефон.",
        "Я смотрел телевизор в тот момент, когда зазвонил телефон.", "Зазвонил телефон, а я смотрел телевизор."
    ], altEn: [
        "I was watching TV when the telephone rang.", "The phone rang while I was watching TV.",
        "When the phone rang, I was watching TV.", "I was watching television when the phone rang.",
        "The phone rang while I was watching television."
    ] },
    { en: "While I was cooking dinner, he arrived.", ru: "Пока я готовил ужин, он пришёл.", altRu: [
        "Пока я готовил ужин, он приехал.", "Пока я готовила ужин, он пришёл.", "Он пришёл, пока я готовил ужин.",
        "Он пришёл в то время, как я готовил ужин.", "Пока я готовил ужин, пришёл он.", "В то время как я готовил ужин, он появился."
    ], altEn: [
        "While I was making dinner, he arrived.", "He arrived while I was cooking dinner.",
        "He came while I was cooking dinner.", "While I was cooking supper, he arrived.",
        "As I was cooking dinner, he arrived."
    ] },
    { en: "They were playing football at 7 o'clock yesterday.", ru: "Вчера в семь часов они играли в футбол.", altRu: [
        "Вчера в семь вечера они играли в футбол.", "Они вчера в семь играли в футбол.", "Вчера в 7 часов они играли в футбол.",
        "Они играли в футбол вчера в семь.", "Вчера в семь часов они играли в футбол во дворе.",
        "В семь часов вчера они играли в футбол."
    ], altEn: [
        "Yesterday at 7 o'clock they were playing football.", "They were playing football at seven o'clock yesterday.",
        "At 7 pm yesterday they were playing football.", "They played football at seven yesterday.",
        "At seven yesterday evening they were playing football."
    ] },
    { en: "She was reading a book when the lights went out.", ru: "Когда погас свет, она читала книгу.", altRu: [
        "Она читала книгу, когда погас свет.", "Когда выключился свет, она читала книгу.", "Она читала книгу, когда свет погас.",
        "Свет погас, когда она читала книгу.", "Она читала книгу, и вдруг погас свет.", "Она читала книгу, когда погасло электричество."
    ], altEn: [
        "She was reading a book when the power went out.", "When the lights went out, she was reading a book.",
        "She was reading when the electricity went off.", "The lights went out while she was reading a book.",
        "She was reading a book when the lights suddenly went out."
    ] },
    { en: "I'm going to study English at university.", ru: "Я собираюсь изучать английский в университете.", altRu: [
        "Я собираюсь учить английский в университете.", "Я планирую изучать английский в вузе.", "Я собираюсь изучать английский язык в университете.",
        "Я намерена изучать английский в университете.", "Я собираюсь поступить на английский в университет.", "В университете я собираюсь изучать английский."
    ], altEn: [
        "I am going to study English at university.", "I'm going to study English at college.",
        "I am planning to study English at university.", "I intend to study English at university.",
        "At university, I'm going to study English."
    ] },
    { en: "Look at those clouds ! It's going to rain.", ru: "Посмотри на эти тучи ! Будет дождь.", altRu: [
        "Посмотри на эти облака ! Сейчас пойдёт дождь.", "Взгляни на эти тучи ! Будет дождь.", "Посмотрите на эти тучи ! Пойдёт дождь.",
        "Глянь на эти тучи ! Дождь собирается.", "Посмотри на те тучи ! Сейчас начнётся дождь.", "Взгляни на эти облака ! Дождик будет."
    ], altEn: [
        "Look at those clouds ! It is going to rain.", "Look at those clouds ! It's about to rain.",
        "Look at that sky ! It's going to rain.", "Look at those clouds. Rain is coming.",
        "Look at those clouds ! It's going to start raining."
    ] },
    { en: "I'll call you as soon as I arrive.", ru: "Я позвоню тебе, как только приеду.", altRu: [
        "Я позвоню вам, как только приеду.", "Я сразу же позвоню тебе, как доеду.", "Как только доберусь, я тебе позвоню.",
        "Я позвоню тебе сразу по прибытии.", "Позвоню, как только буду на месте.", "Как только приеду, сразу позвоню тебе."
    ], altEn: [
        "I will call you as soon as I arrive.", "I'll phone you as soon as I get there.",
        "As soon as I arrive, I'll call you.", "I will ring you the moment I arrive.",
        "I'll give you a call as soon as I arrive."
    ] },
    { en: "We are flying to Paris on Friday.", ru: "В пятницу мы летим в Париж.", altRu: [
        "В пятницу мы летим в Париж самолётом.", "Мы летим в Париж в пятницу.", "Пятница — мы летим в Париж.",
        "Мы отправляемся в Париж в пятницу.", "В пятницу мы полетим в Париж.", "Мы летим в Париж в пятницу вечером."
    ], altEn: [
        "We're flying to Paris on Friday.", "We are going to Paris by plane on Friday.",
        "On Friday we are flying to Paris.", "We fly to Paris on Friday.",
        "We are taking a flight to Paris on Friday."
    ] },
    { en: "If it rains tomorrow, we will stay at home.", ru: "Если завтра будет дождь, мы останемся дома.", altRu: [
        "Если завтра пойдёт дождь, мы останемся дома.", "Завтра, если будет дождь, мы останемся дома.",
        "Если завтра будет дождливо, мы не пойдём гулять.", "Если завтра дождь, останемся дома.",
        "Мы останемся дома, если завтра будет дождь.", "Если завтра будет ливень, мы останемся дома."
    ], altEn: [
        "If it rains tomorrow, we'll stay at home.", "We will stay at home if it rains tomorrow.",
        "If it's raining tomorrow, we'll stay in.", "Should it rain tomorrow, we will stay at home.",
        "We'll remain at home if it rains tomorrow."
    ] },
    { en: "Unless you study more, you won't pass the exam.", ru: "Если ты не будешь заниматься больше, ты не сдашь экзамен.", altRu: [
        "Если ты не станешь больше заниматься, ты не сдашь экзамен.", "Без дополнительных занятий ты не сдашь экзамен.",
        "Если не будешь больше учиться, экзамен не сдашь.", "Ты не сдашь экзамен, если не будешь больше заниматься.",
        "Если вы не будете заниматься усерднее, вы не сдадите экзамен.", "Не подготовишься получше — экзамен не сдашь."
    ], altEn: [
        "If you don't study more, you won't pass the exam.", "You won't pass the exam unless you study harder.",
        "Unless you study harder, you'll fail the exam.", "You will not pass the exam if you don't study more.",
        "Failing to study more means you won't pass the exam."
    ] },
    { en: "If you heat ice, it melts.", ru: "Если нагреть лёд, он тает.", altRu: [
        "Если нагреть лёд, он тает.", "Когда нагреваешь лёд, он тает.", "Лёд тает, если его нагреть.",
        "Если нагреть лёд, он растает.", "При нагревании лёд тает.", "Если лёд нагреть, он тает."
    ], altEn: [
        "If you heat ice, it melts.", "When you heat ice, it melts.", "Ice melts if you heat it.",
        "Ice melts when heated.", "Heat ice and it melts."
    ] },
    { en: "She said that she was tired.", ru: "Она сказала, что устала.", altRu: [
        "Она сказала, что она устала.", "Она сказала, что очень устала.", "Она заявила, что устала.",
        "Она сказала, что чувствует усталость.", "Она сказала, что утомилась.", "Она сказала, что устала за день."
    ], altEn: [
        "She said she was tired.", "She told me that she was tired.", "She told me she was tired.",
        "She said she felt tired.", "She announced that she was tired."
    ] },
    { en: "He told me he would come to the party.", ru: "Он сказал мне, что придёт на вечеринку.", altRu: [
        "Он сказал мне, что придёт на праздник.", "Он сказал мне, что прийдёт на тусовку.", "Он пообещал мне, что придёт на вечеринку.",
        "Он сказал мне, что придёт на эту вечеринку.", "Он сказал мне, что будет на вечеринке.", "Мне он сказал, что придёт на вечеринку."
    ], altEn: [
        "He said he would come to the party.", "He told me he'd come to the party.",
        "He told me that he would attend the party.", "He said he would come to the celebration.",
        "He informed me he would come to the party."
    ] },
    { en: "She asked me if I was ready.", ru: "Она спросила меня, готова ли я.", altRu: [
        "Она спросила меня, готов ли я.", "Она спросила, готов ли я.", "Она спросила меня, готова ли я.",
        "Она поинтересовалась, готов ли я.", "Она спросила, готов я или нет.", "Она спросила меня, готов ли я к этому."
    ], altEn: [
        "She asked me whether I was ready.", "She asked if I was ready.", "She inquired whether I was ready.",
        "She asked me if I was prepared.", "She asked me whether I was ready yet."
    ] },
    { en: "The teacher told us to open our books.", ru: "Учитель велел нам открыть книги.", altRu: [
        "Учитель сказал нам открыть книги.", "Учитель попросил нас открыть учебники.", "Учительница велела нам открыть книги.",
        "Учитель сказал нам открыть наши книги.", "Преподаватель велел нам открыть книги.", "Учитель сказал: откройте книги."
    ], altEn: [
        "The teacher told us to open our books.", "The teacher asked us to open our books.",
        "The teacher told us to open the textbooks.", "The teacher made us open our books.",
        "The teacher said to open our books."
    ] },
    { en: "He must be tired after such a long trip.", ru: "Он, должно быть, устал после такой долгой поездки.", altRu: [
        "Он, наверное, устал после такой долгой поездки.", "После такой долгой поездки он, должно быть, устал.",
        "Он наверняка устал после такой долгой дороги.", "После такой дальней поездки он просто обязан устать.",
        "Он, должно быть, очень устал после такой долгой поездки.", "Столько ехать — он точно устал."
    ], altEn: [
        "He must be tired after such a long journey.", "He must be exhausted after such a long trip.",
        "After such a long trip he must be tired.", "He has to be tired after such a long journey.",
        "He must be worn out after such a long trip."
    ] },
    { en: "She can't be at home because the lights are off.", ru: "Её точно нет дома, потому что свет выключен.", altRu: [
        "Её не может быть дома — свет выключен.", "Она точно не дома, ведь свет погашен.", "Раз свет выключен, её нет дома.",
        "Она не может быть дома, потому что везде темно.", "Свет не горит — значит, её нет дома.", "Она наверняка не дома: огни погашены."
    ], altEn: [
        "She can't be at home because the lights are out.", "She can't be home — the lights are off.",
        "The lights are off, so she can't be at home.", "She certainly isn't at home because the lights are off.",
        "She cannot be at home since the lights are switched off."
    ] },
    { en: "It might rain later, so take an umbrella.", ru: "Возможно, позже пойдёт дождь, так что возьми зонт.", altRu: [
        "Позже, возможно, будет дождь, так что возьми зонт.", "Может пойти дождь, поэтому возьми зонт.",
        "Возможно, попозже пойдёт дождь — прихвати зонт.", "Может быть, позже начнётся дождь, так что захвати зонт.",
        "Позже может пойти дождь, поэтому возьми с собой зонт.", "Дождь может пойти позже, так что зонт не помешает."
    ], altEn: [
        "It may rain later, so take an umbrella.", "It might rain later, so bring an umbrella.",
        "Perhaps it will rain later, so take an umbrella.", "It could rain later, so take an umbrella with you.",
        "Take an umbrella in case it rains later."
    ] },
    { en: "This book is more interesting than that one.", ru: "Эта книга интереснее, чем та.", altRu: [
        "Эта книга интереснее той.", "Эта книга интереснее, чем вон та.", "Эта книга поинтереснее, чем та.",
        "Эта книга более интересная, чем та.", "Вот эта книга интереснее той.", "Эта книга куда интереснее той."
    ], altEn: [
        "This book is more interesting than the other one.", "This book is far more interesting than that one.",
        "This one is more interesting than that book.", "Of the two, this book is more interesting.",
        "This book is more interesting than that."
    ] },
    { en: "She is the best student in our class.", ru: "Она лучшая ученица в нашем классе.", altRu: [
        "Она самая лучшая ученица в нашем классе.", "Она лучшая ученица в нашем классе.", "Она лучшая студентка на нашем курсе.",
        "В нашем классе она лучшая ученица.", "Она лучшая из учеников нашего класса.", "Она - самая лучшая ученица в классе."
    ], altEn: [
        "She is the top student in our class.", "She's the best student in our class.",
        "She is the best pupil in our class.", "Among all the students, she is the best.",
        "Nobody in our class studies better than her."
    ] },
    { en: "My brother is as tall as our father.", ru: "Мой брат такого же роста, как наш отец.", altRu: [
        "Мой брат такого же роста, как отец.", "Мой брат ростом в отца.", "Мой брат по росту не уступает отцу.",
        "Мой брат такой же высокий, как наш отец.", "Брат у меня вымахал в отца.", "Мой брат с отца ростом."
    ], altEn: [
        "My brother is the same height as our father.", "My brother is just as tall as our father.",
        "My brother is as tall as our dad.", "Both my brother and father are the same height.",
        "My brother and father are of equal height."
    ] },
    { en: "The man who lives next door is a doctor.", ru: "Мужчина, который живёт по соседству, — врач.", altRu: [
        "Мужчина, живущий по соседству, — врач.", "Сосед, который живёт рядом, — доктор.", "Человек, который живёт в соседнем доме, — врач.",
        "Мужчина, который живёт рядом с нами, — врач по профессии.", "Наш сосед — врач.", "Живущий по соседству мужчина работает врачом."
    ], altEn: [
        "The man that lives next door is a doctor.", "Our next-door neighbour is a doctor.",
        "The man living next door is a doctor.", "The man who lives in the flat next door is a doctor.",
        "The doctor lives next door to us."
    ] },
    { en: "The book which I borrowed was really good.", ru: "Книга, которую я взял, была действительно хорошей.", altRu: [
        "Книга, которую я взяла, была очень хорошей.", "Книга, которую я одолжил, была просто отличной.", "Взятая мной книга оказалась очень хорошей.",
        "Книга, которую я позаимствовал, была хороша.", "Книга, которую я взял почитать, была замечательной.", "Та книга, что я брал, была очень хорошая."
    ], altEn: [
        "The book that I borrowed was really good.", "The book I borrowed was really good.",
        "The book which I borrowed turned out to be great.", "The book that I picked up from the library was great.",
        "I really enjoyed the book I borrowed."
    ] },
    { en: "This is the cafe where we first met.", ru: "Это кафе, где мы встретились впервые.", altRu: [
        "Это то самое кафе, где мы впервые встретились.", "Вот это кафе, где мы познакомились.", "Мы впервые встретились именно в этом кафе.",
        "Это кафе, где мы встретились первый раз.", "Именно в этом кафе мы встретились впервые.", "В этом кафе мы когда-то впервые встретились."
    ], altEn: [
        "This is the cafe where we met for the first time.", "This is the cafe we first met at.",
        "This is the café in which we first met.", "We met for the first time in this cafe.",
        "This is the cafe where we first met each other."
    ] },
    { en: "The girl whose bag was lost was crying.", ru: "Девочка, чья сумка потерялась, плакала.", altRu: [
        "Девочка, потерявшая сумку, плакала.", "Девочка, сумка которой потерялась, плакала.", "Девушка, чья сумка пропала, плакала.",
        "Плакала девочка, потерявшая свою сумку.", "Та девочка, потерявшая сумку, плакала.", "Девочка, у которой потерялась сумка, плакала."
    ], altEn: [
        "The girl whose bag was lost was crying.", "The girl who had lost her bag was crying.",
        "The girl that lost her bag was crying.", "A girl whose bag had gone missing was crying.",
        "The girl crying was the one whose bag was lost."
    ] },
    { en: "I have lived in this city since I was a child.", ru: "Я живу в этом городе с детства.", altRu: [
        "Я проживаю в этом городе с самого детства.", "Я живу в этом городе с раннего детства.", "В этом городе я живу с детства.",
        "Я живу здесь, в этом городе, ещё с детских лет.", "Этим городом я живу с детства.", "Я живу в этом городе с малых лет."
    ], altEn: [
        "I've lived in this city since I was a child.", "I have been living in this city since childhood.",
        "I've lived here since my childhood.", "I have lived in this city all my life.",
        "Since I was a child, I've lived in this city."
    ] },
    { en: "While they were sleeping, the storm began.", ru: "Пока они спали, началась гроза.", altRu: [
        "Пока они спали, разразилась гроза.", "Пока они спали, начался шторм.", "Гроза началась, когда они спали.",
        "Они спали, когда началась гроза.", "Во время их сна началась гроза.", "Пока они спали, налетела буря."
    ], altEn: [
        "While they were sleeping, a storm broke out.", "A storm began while they were sleeping.",
        "The storm started while they slept.", "They were sleeping when the storm broke.",
        "While they were asleep, a storm began."
    ] },
    { en: "I'm meeting my friends at six this evening.", ru: "Сегодня вечером в шесть я встречаюсь с друзьями.", altRu: [
        "Сегодня в шесть вечера я встречаюсь с друзьями.", "В шесть вечера у меня встреча с друзьями.", "Сегодня вечером в шесть я увижусь с друзьями.",
        "Я встречаюсь с друзьями сегодня вечером в шесть часов.", "Сегодня вечером в шесть я иду на встречу с друзьями.", "В шесть вечера сегодня я встречаюсь с приятелями."
    ], altEn: [
        "I am meeting my friends at six this evening.", "I'm meeting some friends at six tonight.",
        "This evening at six I'm meeting my friends.", "I'm seeing my friends at six this evening.",
        "I have a meeting with my friends at six this evening."
    ] },
    { en: "What were you doing at eight o'clock last night ?", ru: "Что ты делал вчера в восемь вечера ?", altRu: [
        "Что вы делали вчера в восемь вечера ?", "Что ты делал вчера в восемь часов ?", "Чем ты занимался вчера вечером в восемь ?",
        "Что ты делал в восемь часов прошлым вечером ?", "Чем вы занимались вчера в восемь вечера ?", "Что ты делал прошлым вечером в восемь ?"
    ], altEn: [
        "What were you doing at 8 o'clock last night ?", "What were you doing at eight last evening ?",
        "What were you up to at eight o'clock last night ?", "At 8 pm last night, what were you doing ?",
        "What were you doing yesterday evening at eight ?"
    ] },
    { en: "If you don't hurry, you will miss the train.", ru: "Если ты не поторопишься, ты опоздаешь на поезд.", altRu: [
        "Если вы не поторопитесь, вы опоздаете на поезд.", "Если не поторопишься, поезд уйдёт без тебя.", "Если ты не поспешишь, ты пропустишь поезд.",
        "Опоздаешь на поезд, если не поторопишься.", "Если не поторопишься, не успеешь на поезд.", "Поторопись, иначе опоздаешь на поезд."
    ], altEn: [
        "If you don't hurry, you'll miss the train.", "You will miss the train unless you hurry.",
        "If you don't hurry up, you'll miss the train.", "Hurry up, or you'll miss the train.",
        "Unless you hurry, you'll be late for the train."
    ] },
    { en: "I'm going to take an exam next week, so I'm studying hard.", ru: "На следующей неделе у меня экзамен, поэтому я усердно занимаюсь.", altRu: [
        "У меня на следующей неделе экзамен, поэтому я усердно готовлюсь.", "На следующей неделе я сдаю экзамен, так что много занимаюсь.",
        "Мне предстоит экзамен на следующей неделе, поэтому я усердно учусь.", "Экзамен на следующей неделе — я усердно готовлюсь.",
        "Так как на следующей неделе экзамен, я сейчас усердно занимаюсь.", "На следующей неделе экзамен, и я упорно занимаюсь."
    ], altEn: [
        "I'm taking an exam next week, so I'm studying hard.", "I have an exam next week, so I'm preparing hard.",
        "Since I have an exam next week, I'm studying hard.", "I'm revising hard because I have an exam next week.",
        "I've got an exam next week, so I'm working hard."
    ] },
    { en: "He said he had never seen such a beautiful sunset.", ru: "Он сказал, что никогда не видел такого красивого заката.", altRu: [
        "Он сказал, что никогда не видел такого прекрасного заката.", "Он признался, что никогда не видел такого красивого заката.",
        "Он сказал, что ни разу не видел столь красивого заката.", "Он сказал, что такого заката никогда не видал.",
        "Он сказал, что не видел за всю жизнь такого красивого заката.", "По его словам, он никогда не видел такого красивого заката."
    ], altEn: [
        "He said he'd never seen such a beautiful sunset.", "He told me he had never seen such a beautiful sunset.",
        "He said he had never witnessed such a lovely sunset.", "He claimed he had never seen a sunset so beautiful.",
        "He said he had never in his life seen such a beautiful sunset."
    ] },
    { en: "You must be very proud of your daughter.", ru: "Вы, должно быть, очень гордитесь своей дочерью.", altRu: [
        "Вы, наверное, сильно гордитесь своей дочерью.", "Ты, должно быть, очень гордишься своей дочерью.", "Вы, верно, очень гордитесь дочерью.",
        "У вас, должно быть, огромная гордость за дочь.", "Вы, наверняка, очень гордитесь своей дочерью.", "Наверное, вы очень гордитесь своей дочерью."
    ], altEn: [
        "You must be very proud of your daughter.", "You must feel very proud of your daughter.",
        "I'm sure you're very proud of your daughter.", "You really must be proud of your daughter.",
        "You must be so proud of your daughter."
    ] },
    { en: "The film was far more exciting than we expected.", ru: "Фильм оказался гораздо интереснее, чем мы ожидали.", altRu: [
        "Фильм был куда более захватывающим, чем мы ожидали.", "Фильм оказался намного интереснее, чем мы ждали.", "Кино было гораздо более захватывающим, чем ожидалось.",
        "Фильм превзошёл наши ожидания — он был очень захватывающим.", "Фильм оказался гораздо увлекательнее, чем мы думали.", "Мы не ожидали, что фильм окажется таким захватывающим."
    ], altEn: [
        "The film was much more exciting than we expected.", "The movie turned out to be far more exciting than we expected.",
        "The film was way more thrilling than we'd expected.", "The movie exceeded our expectations—it was very exciting.",
        "We found the film far more exciting than we had expected."
    ] },
    { en: "She might be at the meeting right now.", ru: "Она, возможно, сейчас на совещании.", altRu: [
        "Она, возможно, прямо сейчас на совещании.", "Она, может быть, сейчас на собрании.", "Она, вероятно, сейчас на встрече.",
        "Возможно, она сейчас находится на совещании.", "Она, может, сейчас как раз на совещании.", "Она сейчас, возможно, на совещании."
    ], altEn: [
        "She may be at the meeting right now.", "She could be in the meeting at the moment.",
        "She might be attending the meeting right now.", "It's possible she's at the meeting now.",
        "She might be in a meeting at this moment."
    ] }
];