const TelegramBot = require('node-telegram-bot-api')
const config = require('./config')
const myf = require('./used_functions')
const calc = require('./calc')

TOKEN = config.TOKEN


	//пол: <b>${user_data[4]}</b>
	// 	const text_age = `Введите Ваш возраст. <em>Алгоритм принимает значения между 10 и 100</em>.`
	// 	bot.sendMessage(userId, text_age, options);
	


// const bot = new TelegramBot(TOKEN,{
// 	webHook: {
// 		port: config.port,
// 	}
// });
// bot.setWebHook(`${config.url}/bot${TOKEN}`)


const bot = new TelegramBot(TOKEN, {
	polling: true
});


questions = [['Укажите возраст наследодателя', 'до 35 лет', 'после 35 лет'],
['Укажите пол наследодателя','ж','м'],
['Остался ли у наследодателя отец?','нет','да'],
['Осталась ли у наследодателя мать?','нет','да'],
['Остался ли у наследодателя супруг?','нет','да'],
['Осталась ли у наследодателя супруга?','нет','1','2','3','4'],
'Введите количество сыновей наследодателя:',
'Введите количество дочерей наследодателя:',
['Остался ли у наследодателя дедушка (отец отца)?','нет','да'],
['Остался ли у наследодателя прадедушка (отец отца отца)?','нет','да'],
['Остался ли у наследодателя прапрадедушка? (отец отца отца отца)','нет','да'],

['Осталась ли у наследодателя бабушка (мать отца)?','нет','да'],
['Осталась ли у наследодателя бабушка (мать матери)?','нет','да'],
['Осталась ли у наследодателя прабабушка (мать отца отца)?','нет','да'],
['Осталась ли у наследодателя прабабушка (мать мать отца)?','нет','да'],
['Осталась ли у наследодателя прабабушка (мать мать матери)?','нет','да'],



'Остался ли у наследодателя внук? (сын сына)',
'Остался ли у наследодателя правнук? (сын сына сына)',
'Остался ли у наследодателя праправнук? (сын сына сына сына)',
'Осталась ли у наследодателя внучка? (дочь сына)',
'Осталась ли у наследодателя правнучка? (дочь сына сына)',

'Осталась ли у наследодателя праправнучка? (дочь сына сына сына)',
'Остался ли у наследодателя родной брат?',
'Осталась ли у наследодателя родная сестра?',
'Остался ли у наследодателя единокровный брат?',
'Осталась ли у наследодателя единокровная сестра?',
'Остались ли у наследодателя единоутробные братья/сестры?',
'Остался ли у наследодателя родной дядя? (брат отца)',
'Остался ли у наследодателя единокровный брат? (ед.кр. брат отца)']

var order = 0
var n = questions.length
var ans = {}
var nishod_m = 0
var nishod_f = 0
var voshod = 0
var br_sist = 0 //есть ли боковые братья сестры? Для опреления доли матери
var vnuki = 0 //внуки м.пола для условия введения внучки при наличии дочери
var res_text //конечный текст

var text_mother, text_common, text_father,text_husband, text_wife
var text_son, text_dau, text_vnuk, text_vnuch, text_gdad, text_gmoth
var text_bro, text_sis, text_ekbr, text_eksis, text_eu, text_side


bot.onText(/\/start/, msg => {
	ans = {}
	const chatId = msg.chat.id
	bot.sendMessage(chatId,questions[0][0],{
		reply_markup: {
			inline_keyboard: [
				[	{text: questions[0][1],
					callback_data: 'age0'},
					{text: questions[0][2],
					callback_data: 'age1'}]
				]
			}
		})
})


bot.onText(/\/help/, msg => {
	ans = {}
	const chatId = msg.chat.id
	bot.sendMessage(chatId,`Комментарии по распределению наслества`,{
		reply_markup: {
			inline_keyboard: [
				[	{text: 'мать',
					callback_data: 'mother'},
					{text: 'отец',
					callback_data: 'father'},
					{text: 'муж',
					callback_data: 'husband'},
					{text: 'жена',
					callback_data: 'wife'}
				],

				[	{text: 'сын',
					callback_data: 'son'},
					{text: 'дочь',
					callback_data: 'daught'},
					{text: 'внук',
					callback_data: 'gson'},
					{text: 'внучка',
					callback_data: 'gdaught'}
				],

				[	{text: 'дед',
					callback_data: 'gdad'},
					{text: 'бабушка',
					callback_data: 'gmother'},
					{text: 'брат',
					callback_data: 'brother'},
					{text: 'сестра',
					callback_data: 'sister'}
				],

				[	{text: 'ед.кр.брат',
					callback_data: 'ed_kr_b'},
					{text: 'ед.кр.сестра',
					callback_data: 'ed_kr_s'},
					{text: 'ед.утробные бр/сест',
					callback_data: 'ed_ut'}
				],

				[	{text: 'общая инф',
					callback_data: 'common_info'},
					{text: 'боковой элемент',
					callback_data: 'side'}
				]
							]
			}
		})
})




// отец:
//Если даже существование наследницы женского пола (дочери) позволяет отцу взять конечную долю (та‘сиб), то существование сына это право у отца отнимает.

// внук вводится если нет сына
// внук - это сын сына, внучка - это дочь сына
//если дочь одна, она получает 1/2, вводится внучка и получает 1/6, то есть их совместная доля есть 2/3. 
// 		В этом случае, если внучек несколько, то они делят 1/6 поровну между собой
// внучка вводится если нет сына и дочерей меньше 2
// внучка вводится если нет сына и дочерей больше 1 и есть внуки
// если дочерей больше или равно 2, то внучка вводится только при наличии внука

// дедушка вводится если нет отца
// прадедушка вводится если нет отца (автоматичеси соблюдается) и прадедушки
// прапрадедушка вводится если нет отца и прадедушки

// для введения любой бабушки должна отсутствовать мать
// к тому же:
// gmm: нет доп.условий
// gmf: если нет отца
// gmff: нет отца, gmm, gmf
// gmmf: нет отца, gmm, gmf
// gmmm: нет gmm, gmf

// родной брат вводится:
// отсутствует восх и нисх мужской пол

// родная сестра вводится:
// отсутствует восх и нисх мужской пол
// наследует зависимо от дочерей либо внучек
// если не остается остатка после того как все заберут, значит 
//    им не достается

// единокровный брат вводится: [ekbro]
// отсутствует восх и нисх мужской пол
// отсутсвуют родные братья и сестры

// сын родного брата (племянник и внучатые племянники):
// отсутствует восх и нисх мужской пол
// нет родного и единкровного брата
// нет родной и единкровной сестры

// сын единкровного брата (дети брата и внуч племянники):
// отсутствует восх и нисх мужской пол
// нет родного брата, единокровного брата, родной и единокровной сестры
// нет сына родного брата 
//дочь единокровного брата в наследство не вступает

//единокровная сестра: [eksis]
//отсутствует восх и нисх мужской пол
//нет родного брата
//родная сестра
//две или более родные сестры, если нет единокровного брата


//родные и единокровные дяди
//(здесь же и нисходящие их родство)
// отсутствует восх и нисх мужской пол
// отсутствуют родной и единокровный братья и их дети
// отсутсв родная и единокр сестра
//




// Единоутробные братья и сестры
// нет восход мужского
// нет любого нисход
// если один, то 1/6
// если несколько, то 1/3 делят поровну


bot.on('callback_query', query => {
	const chat = query.message.chat
	const chatId = chat.id
	const message_id = query.message.message_id
	const text = query.message.text

	switch (query.data) {
	 	case 'age0':
	 		ans.age = 0
			bot.deleteMessage(chatId, message_id).then(order = 1)
		 	break
		case 'age1':
			ans.age = 1
			bot.deleteMessage(chatId, message_id).then(order = 1)
			break
		case 'sex0':
			ans.sex = 0
			bot.deleteMessage(chatId, message_id).then(order = 2)
//			bot.sendMessage(chatId,questions[1][0])
//			bot.sendMessage(chatId,'пол: женский')
			break
		case 'sex1':
			ans.sex = 1
			bot.deleteMessage(chatId, message_id).then(order = 2)
//			bot.sendMessage(chatId,questions[1][0])
//			bot.sendMessage(chatId,'пол: мужской')
			break
		case 'f0':
//			ans.f = 0 //если отца нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 3)
//			bot.sendMessage(chatId,questions[2][0])
//			bot.sendMessage(chatId,'отца нет')
			break
		case 'f1':
			ans.f = 1
			voshod += 1
			bot.deleteMessage(chatId, message_id).then(order = 3)
//			bot.sendMessage(chatId,'отец есть')
			break
		case 'm0':
//			ans.m = 0 //если мамы нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 4)
//			bot.sendMessage(chatId,questions[3][0])
//			bot.sendMessage(chatId,'матери нет')
			break
		case 'm1':
			ans.m = 1
			bot.deleteMessage(chatId, message_id).then(order = 4)
//			bot.sendMessage(chatId,questions[3][0])
//			bot.sendMessage(chatId,'мать есть')
			break
		case 'sp0':
//			ans.sp = 0 //если супруга нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 6)
//			bot.sendMessage(chatId,'супруга(и) нет')
			break
		case 'sp1':
			ans.sp = 1
			bot.deleteMessage(chatId, message_id).then(order = 6)
//			bot.sendMessage(chatId,'один(одна) супруга(и)')
			break
		case 'sp2':
			ans.sp = 2
			bot.deleteMessage(chatId, message_id).then(order = 6)
//			bot.sendMessage(chatId,'две супруги')
			break
		case 'sp3':
			ans.sp = 3
			bot.deleteMessage(chatId, message_id).then(order = 6)
//			bot.sendMessage(chatId,'три супруги')
			break
		case 'sp4':
			ans.sp = 4
			bot.deleteMessage(chatId, message_id).then(order = 6)
//			bot.sendMessage(chatId,'четыре супруги')
			break
		case 's0':
//			ans.s = 0 //если сына нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 7)
//			bot.sendMessage(chatId,'нет сыновей')
			break
		case 's1':
			ans.s = 1
			nishod_m += 1 
			bot.deleteMessage(chatId, message_id).then(order = 7)
//			bot.sendMessage(chatId,'один сын')
			break
		case 's2':
			ans.s = 2
			nishod_m += 2
			bot.deleteMessage(chatId, message_id).then(order = 7)
//			bot.sendMessage(chatId,'два сына')
			break
		case 's3':
			ans.s = 3
			nishod_m += 3
			bot.deleteMessage(chatId, message_id).then(order = 7)
//			bot.sendMessage(chatId,'три сына')
			break
		case 's4':
			ans.s = 4
			nishod_m += 4
			bot.deleteMessage(chatId, message_id).then(order = 7)
//			bot.sendMessage(chatId,'четыре сына')
			break
		case 's5':
			ans.s = 5
			nishod_m += 5
			bot.deleteMessage(chatId, message_id).then(order = 7)
//			bot.sendMessage(chatId,'пять сыновей')
			break
		case 's6':
			ans.s = 6
			nishod_m += 6
			bot.deleteMessage(chatId, message_id).then(order = 7)
//			bot.sendMessage(chatId,'шесть сыновей')
			break
		case 's7':
			ans.s = 7
			nishod_m += 7
			bot.deleteMessage(chatId, message_id).then(order = 7)
//			bot.sendMessage(chatId,'семь сыновей')
			break
		case 's8':
			ans.s = 8
			nishod_m += 8
			bot.deleteMessage(chatId, message_id).then(order = 7)
//			bot.sendMessage(chatId,'восемь сыновей')
			break
		case 's9':
			ans.s = 9
			nishod_m += 9
			bot.deleteMessage(chatId, message_id).then(order = 7)
//			bot.sendMessage(chatId,'девять сыновей')
			break
		case 'd0':
//			ans.d = 0 //если дочери нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 8)
//			bot.sendMessage(chatId,'нет дочерей')
			break
		case 'd1':
			ans.d = 1
			nishod_f += 1
			bot.deleteMessage(chatId, message_id).then(order = 8)
//			bot.sendMessage(chatId,'одна дочь')
			break
		case 'd2':
			ans.d = 2
			nishod_f += 2
			bot.deleteMessage(chatId, message_id).then(order = 8)
//			bot.sendMessage(chatId,'две дочери')
			break
		case 'd3':
			ans.d = 3
			nishod_f += 3
			bot.deleteMessage(chatId, message_id).then(order = 8)
//			bot.sendMessage(chatId,'три дочери')
			break
		case 'd4':
			ans.d = 4
			nishod_f += 4
			bot.deleteMessage(chatId, message_id).then(order = 8)
//			bot.sendMessage(chatId,'четыре дочери')
			break
		case 'd5':
			ans.d = 5
			nishod_f += 5
			bot.deleteMessage(chatId, message_id).then(order = 8)
//			bot.sendMessage(chatId,'пять дочерей')
			break
		case 'd6':
			ans.d = 6
			nishod_f += 6
			bot.deleteMessage(chatId, message_id).then(order = 8)
//			bot.sendMessage(chatId,'шесть дочерей')
			break
		case 'd7':
			ans.d = 7
			nishod_f += 7
			bot.deleteMessage(chatId, message_id).then(order = 8)
//			bot.sendMessage(chatId,'семь дочерей')
			break
		case 'd8':
			ans.d = 8
			nishod_f += 8
			bot.deleteMessage(chatId, message_id).then(order = 8)
//			bot.sendMessage(chatId,'восемь дочерей')
			break
		case 'd9':
			ans.d = 9
			nishod_f += 9
			bot.deleteMessage(chatId, message_id).then(order = 8)
//			bot.sendMessage(chatId,'девять дочерей')
			break
		case 'gd0': //ответ на вопрос 8
//			ans.gd = 0 //если деда нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 9)
//			bot.sendMessage(chatId,'дедушки нет')
			break
		case 'gd1':
			ans.gd = 1
			voshod += 1
			bot.deleteMessage(chatId, message_id).then(order = 11)
//			bot.sendMessage(chatId,'дедушка есть')
			break

		case 'ggd0': //ответ на вопрос 9
//			ans.ggd = 0 //если прадеда нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 10)
//			bot.sendMessage(chatId,'ПраДедушки нет')
			break
		case 'ggd1':
			ans.ggd = 1
			voshod += 1
			bot.deleteMessage(chatId, message_id).then(order = 11)
//			bot.sendMessage(chatId,'ПраДедушка есть')
			break
		case 'gggd0': //прапрадед
//			ans.gggd = 0 //если прапрадеда нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 11)
//			bot.sendMessage(chatId,'ПраПраДедушки нет')
			break
		case 'gggd1':
			ans.gggd = 1
			voshod += 1
			bot.deleteMessage(chatId, message_id).then(order = 11)
//			bot.sendMessage(chatId,'ПраПраДедушка есть')
			break

		case 'gmf0': //вопрос 11: бабушка (мать отца)
//			ans.gmf = 0 //если бабушки нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 12)
//			bot.sendMessage(chatId,'бабушки(о) нет')
			break
		case 'gmf1':
			ans.gmf = 1
			bot.deleteMessage(chatId, message_id).then(order = 12)
//			bot.sendMessage(chatId,'бабушка(о) есть')
			break

		case 'gmm0': //вопрос 12: бабушка (мать матери)
//			ans.gmm = 0 //если бабушки нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 13)
//			bot.sendMessage(chatId,'бабушки(м) нет')
			break
		case 'gmm1':
			ans.gmm = 1
			bot.deleteMessage(chatId, message_id).then(order = 13)
//			bot.sendMessage(chatId,'бабушка(м) есть')
			break

		case 'gmff0': //вопрос 13: прабабушка (мать отца отца)
//			ans.gmff = 0 ////если прабабушки нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 14)
//			bot.sendMessage(chatId,'бабушки (мать отца отца) нет')
			break
		case 'gmff1':
			ans.gmff = 1
			bot.deleteMessage(chatId, message_id).then(order = 14)
//			bot.sendMessage(chatId,'бабушка (мать отца отца) есть')
			break

		case 'gmmf0': //вопрос 14: прабабушка (мать мать отца)
//			ans.gmmf = 0 //если прабабушки нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 15)
//			bot.sendMessage(chatId,'бабушки (мать матери отца) нет')
			break
		case 'gmmf1':
			ans.gmmf = 1
			bot.deleteMessage(chatId, message_id).then(order = 15)
//			bot.sendMessage(chatId,'бабушка (мать матери отца) есть')
			break

		case 'gmmm0': //вопрос 14: прабабушка (мать мать матери)
//			ans.gmmm = 0 //если прабабушки нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 16)
//			bot.sendMessage(chatId,'бабушки (мать матери матери) нет')
			break
		case 'gmmm1':
			ans.gmmm = 1
			bot.deleteMessage(chatId, message_id).then(order = 16)
//			bot.sendMessage(chatId,'бабушка (мать матери матери) есть')
			break

		case 'gs0':
//			ans.gs = 0 //если внука нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 17)
//			bot.sendMessage(chatId,'внука нет')
			break
		case 'gs1':
			ans.gs = 1
			nishod_m += 1
			vnuki += 1
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'один внук')
			break
		case 'gs2':
			ans.gs = 2
			nishod_m += 2
			vnuki += 2
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'два внука')
			break
		case 'gs3':
			ans.gs = 3
			nishod_m += 3
			vnuki += 3
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'три внука')
			break
		case 'gs4':
			ans.gs = 4
			nishod_m += 4
			vnuki += 4
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'четыре внука')
			break
		case 'gs5':
			ans.gs = 5
			nishod_m += 5
			vnuki += 5
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'пять внуков')
			break
		case 'gs6':
			ans.gs = 6
			nishod_m += 6
			vnuki += 6
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'шесть внуков')
			break
		case 'gs7':
			ans.gs = 7
			nishod_m += 7
			vnuki += 7
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'семь внуков')
			break
		case 'gs8':
			ans.gs = 8
			nishod_m += 8
			vnuki += 8
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'восемь внуков')
			break
		case 'gs9':
			ans.gs = 9
			nishod_m += 9
			vnuki += 9
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'девять внуков')
			break
		case 'ggs0':
//			ans.ggs = 0 //если правнука нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 18)
//			bot.sendMessage(chatId,'правнуков нет')

			break
		case 'ggs1':
			ans.ggs = 1
			nishod_m += 1
			vnuki += 1
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'один правнук')
			break
		case 'ggs2':
			ans.ggs = 2
			nishod_m += 2
			vnuki += 2
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'два правнука')
			break
		case 'ggs3':
			ans.ggs = 3
			nishod_m += 3
			vnuki += 3
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'три правнука')
			break
		case 'ggs4':
			ans.ggs = 4
			nishod_m += 4
			vnuki += 4
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'четыре правнука')
			break
		case 'ggs5':
			ans.ggs = 5
			nishod_m += 5
			vnuki += 5
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'пять правнуков')
			break						
		case 'ggs6':
			ans.ggs = 6
			nishod_m += 6
			vnuki += 6
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'шесть правнуков')
			break
		case 'ggs7':
			ans.ggs = 7
			nishod_m += 7
			vnuki += 7
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'семь правнуков')
			break
		case 'ggs8':
			ans.ggs = 8
			nishod_m += 8
			vnuki += 8
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'восемь правнуков')
			break
		case 'ggs9':
			ans.ggs = 9
			nishod_m += 9
			vnuki += 9
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'девять правнуков')
			break
		case 'gggs0':
//			ans.gggs = 0 //если праправнука нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'ПраПраВнуков нет')
			break
		case 'gggs1':
			ans.gggs = 1
			nishod_m += 1
			vnuki += 1
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'один ПраПраВнук')
			break
		case 'gggs2':
			ans.gggs = 2
			nishod_m += 2
			vnuki += 2
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'два ПраПраВнука')
			break
		case 'gggs3':
			ans.gggs = 3
			nishod_m += 3
			vnuki += 3
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'три ПраПраВнука')
			break
		case 'gggs4':
			ans.gggs = 4
			nishod_m += 4
			vnuki += 4
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'четыре ПраПраВнука')
			break
		case 'gggs5':
			ans.gggs = 5
			nishod_m += 5
			vnuki += 5
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'пять ПраПраВнуков')
			break
		case 'gggs6':
			ans.gggs = 6
			nishod_m += 6
			vnuki += 6
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'шесть ПраПраВнуков')
			break
		case 'gggs7':
			ans.gggs = 7
			nishod_m += 7
			vnuki += 7
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'семь ПраПраВнуков')
			break
		case 'gggs8':
			ans.gggs = 8
			nishod_m += 8
			vnuki += 8
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'восемь ПраПраВнуков')
			break
		case 'gggs9':
			ans.gggs = 9
			nishod_m += 9
			vnuki += 9
			bot.deleteMessage(chatId, message_id).then(order = 19)
//			bot.sendMessage(chatId,'девять ПраПраВнуков')
			break

		case 'gda0':  //внуЧка
//			ans.gda = 0 //если внучки нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 20)
//			bot.sendMessage(chatId,'внучек нет')
			break
		case 'gda1':
			ans.gda = 1
			nishod_f += 1
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'одна внучка')
			break
		case 'gda2':
			ans.gda = 2
			nishod_f += 2
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'две внучки')
			break
		case 'gda3':
			ans.gda = 3
			nishod_f += 3
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'три внучки')
			break
		case 'gda4':
			ans.gda = 4
			nishod_f += 4
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'четыре внучки')
			break
		case 'gda5':
			ans.gda = 5
			nishod_f += 5
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'пять внучек')
			break
		case 'gda6':
			ans.gda = 6
			nishod_f += 6
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'шесть внучек')
			break
		case 'gda7':
			ans.gda = 7
			nishod_f += 7
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'семь внучек')
			break
		case 'gda8':
			ans.gda = 8
			nishod_f += 8
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'восемь внучек')
			break
		case 'gda9':
			ans.gda = 9
			nishod_f += 9
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'девять внучек')
			break

		case 'ggda0':  //правнучка
//			ans.ggda = 0 //если правнучки нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 21)
//			bot.sendMessage(chatId,'правнучек нет')
			break
		case 'ggda1':
			ans.ggda = 1
			nishod_f += 1
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'одна правнучка')
			break
		case 'ggda2':
			ans.ggda = 2
			nishod_f += 2
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'две правнучки')
			break
		case 'ggda3':
			ans.ggda = 3
			nishod_f += 3
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'три правнучки')
			break
		case 'ggda4':
			ans.ggda = 4
			nishod_f += 4
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'четыре правнучки')
			break
		case 'ggda5':
			ans.ggda = 5
			nishod_f += 5
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'пять правнучек')
			break
		case 'ggda6':
			ans.ggda = 6
			nishod_f += 6
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'шесть правнучек')
			break
		case 'ggda7':
			ans.ggda = 7
			nishod_f += 7
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'семь правнучек')
			break
		case 'ggda8':
			ans.ggda = 8
			nishod_f += 8
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'восемь правнучек')
			break
		case 'ggda9':
			ans.ggda = 9
			nishod_f += 9
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'девять правнучек')
			break

		case 'gggda0':  //праправнучка
//			ans.gggda = 0 //если праправнучки нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'ПраПраВнучек нет')
			break
		case 'gggda1':
			ans.gggda = 1
			nishod_f += 1
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'одна ПраПраВнучка')
			break
		case 'gggda2':
			ans.gggda = 2
			nishod_f += 2
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'две ПраПраВнучки')
			break
		case 'gggda3':
			ans.gggda = 3
			nishod_f += 3
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'три ПраПраВнучки')
			break
		case 'gggda4':
			ans.gggda = 4
			nishod_f += 4
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'четыре ПраПраВнучки')
			break
		case 'gggda5':
			ans.gggda = 5
			nishod_f += 5
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'пять ПраПраВнучек')
			break
		case 'gggda6':
			ans.gggda = 6
			nishod_f += 6
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'шесть ПраПраВнучек')
			break
		case 'gggda7':
			ans.gggda = 7
			nishod_f += 7
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'семь ПраПраВнучек')
			break
		case 'gggda8':
			ans.gggda = 8
			nishod_f += 8
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'восемь ПраПраВнучек')
			break
		case 'gggda9':
			ans.gggda = 9
			nishod_f += 9
			bot.deleteMessage(chatId, message_id).then(order = 22)
//			bot.sendMessage(chatId,'девять ПраПраВнучек')
			break

		case 'br0':  //родной брат
//			ans.br = 0 //если родного брата нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 23)
//			bot.sendMessage(chatId,'родного брата нет')
			break
		case 'br1':
			ans.br = 1
			br_sist += 1
			bot.deleteMessage(chatId, message_id).then(order = 23)
//			bot.sendMessage(chatId,'один родной брат')
			break
		case 'br2':
			ans.br = 2
			br_sist += 2
			bot.deleteMessage(chatId, message_id).then(order = 23)
//			bot.sendMessage(chatId,'два родных брата')
			break
		case 'br3':
			ans.br = 3
			br_sist += 3
			bot.deleteMessage(chatId, message_id).then(order = 23)
//			bot.sendMessage(chatId,'три родных брата')
			break
		case 'br4':
			ans.br = 4
			br_sist += 4
			bot.deleteMessage(chatId, message_id).then(order = 23)
//			bot.sendMessage(chatId,'четыре родных брата')
			break
		case 'br5':
			ans.br = 5
			br_sist += 5
			bot.deleteMessage(chatId, message_id).then(order = 23)
//			bot.sendMessage(chatId,'пять родных братьев')
			break
		case 'br6':
			ans.br = 6
			br_sist += 6
			bot.deleteMessage(chatId, message_id).then(order = 23)
//			bot.sendMessage(chatId,'шесть родных братьев')
			break
		case 'br7':
			ans.br = 7
			br_sist += 7
			bot.deleteMessage(chatId, message_id).then(order = 23)
//			bot.sendMessage(chatId,'семь родных братьев')
			break
		case 'br8':
			ans.br = 8
			br_sist += 8
			bot.deleteMessage(chatId, message_id).then(order = 23)
//			bot.sendMessage(chatId,'восемь родных братьев')
			break
		case 'br9':
			ans.br = 9
			br_sist += 9
			bot.deleteMessage(chatId, message_id).then(order = 23)
//			bot.sendMessage(chatId,'девять родных братьев')
			break

		case 'sis0':  //родная сестра
//			ans.sis = 0 //если родной сестры нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 24)
//			bot.sendMessage(chatId,'родной сестры нет')
			break
		case 'sis1':
			ans.sis = 1
			bot.deleteMessage(chatId, message_id).then(order = 24)
//			bot.sendMessage(chatId,'одна родная сестра')
			break
		case 'sis2':
			ans.sis = 2
			br_sist += 2
			bot.deleteMessage(chatId, message_id).then(order = 24)
//			bot.sendMessage(chatId,'две родные сестры')
			break
		case 'sis3':
			ans.sis = 3
			br_sist += 3
			bot.deleteMessage(chatId, message_id).then(order = 24)
//			bot.sendMessage(chatId,'три родные сестры')
			break
		case 'sis4':
			ans.sis = 4
			br_sist += 4
			bot.deleteMessage(chatId, message_id).then(order = 24)
//			bot.sendMessage(chatId,'четыре родных сестёр')
			break
		case 'sis5':
			ans.sis = 5
			br_sist += 5
			bot.deleteMessage(chatId, message_id).then(order = 24)
//			bot.sendMessage(chatId,'пять родных сестёр')
			break
		case 'sis6':
			ans.sis = 6
			br_sist += 6
			bot.deleteMessage(chatId, message_id).then(order = 24)
//			bot.sendMessage(chatId,'шесть родных сестёр')
			break
		case 'sis7':
			ans.sis = 7
			br_sist += 7
			bot.deleteMessage(chatId, message_id).then(order = 24)
//			bot.sendMessage(chatId,'семь родных сестёр')
			break
		case 'sis8':
			ans.sis = 8
			br_sist += 8
			bot.deleteMessage(chatId, message_id).then(order = 24)
//			bot.sendMessage(chatId,'восемь родных сестёр')
			break
		case 'sis9':
			ans.sis = 9
			br_sist += 9
			bot.deleteMessage(chatId, message_id).then(order = 24)
//			bot.sendMessage(chatId,'девять родных сестёр')
			break

		case 'ekbr0':  //единокровный брат
//			ans.ekbr = 0 //если единокр брата нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 25)
//			bot.sendMessage(chatId,'единокровного брата нет')
			break
		case 'ekbr1':
			ans.ekbr = 1
			br_sist += 1
			bot.deleteMessage(chatId, message_id).then(order = 25)
//			bot.sendMessage(chatId,'один единокровный брат')
			break
		case 'ekbr2':
			ans.ekbr = 2
			br_sist += 2
			bot.deleteMessage(chatId, message_id).then(order = 25)
//			bot.sendMessage(chatId,'два единокровных брата')
			break
		case 'ekbr3':
			ans.ekbr = 3
			br_sist += 3
			bot.deleteMessage(chatId, message_id).then(order = 25)
//			bot.sendMessage(chatId,'три единокровных брата')
			break
		case 'ekbr4':
			ans.ekbr = 4
			br_sist += 4
			bot.deleteMessage(chatId, message_id).then(order = 25)
//			bot.sendMessage(chatId,'четыре единокровных брата')
			break
		case 'ekbr5':
			ans.ekbr = 5
			br_sist += 5
			bot.deleteMessage(chatId, message_id).then(order = 25)
//			bot.sendMessage(chatId,'пять единокровных братьев')
			break
		case 'ekbr6':
			ans.ekbr = 6
			br_sist += 6
			bot.deleteMessage(chatId, message_id).then(order = 25)
//			bot.sendMessage(chatId,'шесть единокровных братьев')
			break
		case 'ekbr7':
			ans.ekbr = 7
			br_sist += 7
			bot.deleteMessage(chatId, message_id).then(order = 25)
//			bot.sendMessage(chatId,'семь единокровных братьев')
			break
		case 'ekbr8':
			ans.ekbr = 8
			br_sist += 8
			bot.deleteMessage(chatId, message_id).then(order = 25)
//			bot.sendMessage(chatId,'восемь единокровных братьев')
			break
		case 'ekbr9':
			ans.ekbr = 9
			br_sist += 9
			bot.deleteMessage(chatId, message_id).then(order = 25)
//			bot.sendMessage(chatId,'девять единокровных братьев')
			break

		case 'eksis0':  //единокровная сестра
//			ans.eksis = 0 //если единокр сестры нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 26)
//			bot.sendMessage(chatId,'единокровной сестры нет')
			break
		case 'eksis1':
			ans.eksis = 1
			br_sist += 1
			bot.deleteMessage(chatId, message_id).then(order = 26)
//			bot.sendMessage(chatId,'одна единокровная сестра')
			break
		case 'eksis2':
			ans.eksis = 2
			br_sist += 2
			bot.deleteMessage(chatId, message_id).then(order = 26)
//			bot.sendMessage(chatId,'две единокровные сестры')
			break
		case 'eksis3':
			ans.eksis = 3
			br_sist += 3
			bot.deleteMessage(chatId, message_id).then(order = 26)
//			bot.sendMessage(chatId,'три единокровные сестры')
			break
		case 'eksis4':
			ans.eksis = 4
			br_sist += 4
			bot.deleteMessage(chatId, message_id).then(order = 26)
//			bot.sendMessage(chatId,'четыре единокровных сестёр')
			break
		case 'eksis5':
			ans.eksis = 5
			br_sist += 5
			bot.deleteMessage(chatId, message_id).then(order = 26)
//			bot.sendMessage(chatId,'пять единокровных сестёр')
			break
		case 'eksis6':
			ans.eksis = 6
			br_sist += 6
			bot.deleteMessage(chatId, message_id).then(order = 26)
//			bot.sendMessage(chatId,'шесть единокровных сестёр')
			break
		case 'eksis7':
			ans.eksis = 7
			br_sist += 7
			bot.deleteMessage(chatId, message_id).then(order = 26)
//			bot.sendMessage(chatId,'семь единокровных сестёр')
			break
		case 'eksis8':
			ans.eksis = 8
			br_sist += 8
			bot.deleteMessage(chatId, message_id).then(order = 26)
//			bot.sendMessage(chatId,'восемь единокровных сестёр')
			break
		case 'eksis9':
			ans.eksis = 9
			br_sist += 9
			bot.deleteMessage(chatId, message_id).then(order = 26)
//			bot.sendMessage(chatId,'девять единокровных сестёр')
			break

		case 'eu0':  //единоутробные братья/сестры
//			ans.eu = 0 //если единоутр бр/сестёр нет, то записи нет
			bot.deleteMessage(chatId, message_id).then(order = 80)
//			bot.sendMessage(chatId,'единоутробного/ой брата/сестры нет')
			break
		case 'eu1':
			ans.eu = 1
			br_sist += 1
			bot.deleteMessage(chatId, message_id).then(order = 80)
//			bot.sendMessage(chatId,'один/одна единоутробный/ая брат/сестра')
			break
		case 'eu2':
			ans.eu = 2
			br_sist += 2
			bot.deleteMessage(chatId, message_id).then(order = 80)
//			bot.sendMessage(chatId,'два/две единоутробных/ые брата/сестры')
			break
		case 'eu3':
			ans.eu = 3
			br_sist += 3
			bot.deleteMessage(chatId, message_id).then(order = 80)
//			bot.sendMessage(chatId,'три единоутробных/ые брата/сестры')
			break
		case 'eu4':
			ans.eu = 4
			br_sist += 4
			bot.deleteMessage(chatId, message_id).then(order = 80)
//			bot.sendMessage(chatId,'четыре единоутробных/ые брата/сестры')
			break
		case 'eu5':
			ans.eu = 5
			br_sist += 5
			bot.deleteMessage(chatId, message_id).then(order = 80)
//			bot.sendMessage(chatId,'пять единоутробных/ые брата/сестры')
			break
		case 'eu6':
			ans.eu = 6
			br_sist += 6
			bot.deleteMessage(chatId, message_id).then(order = 80)
//			bot.sendMessage(chatId,'шесть единоутробных/ые брата/сестры')
			break
		case 'eu7':
			ans.eu = 7
			br_sist += 7
			bot.deleteMessage(chatId, message_id).then(order = 80)
//			bot.sendMessage(chatId,'семь единоутробных/ые брата/сестры')
			break
		case 'eu8':
			ans.eu = 8
			br_sist += 8
			bot.deleteMessage(chatId, message_id).then(order = 80)
//			bot.sendMessage(chatId,'восемь единоутробных/ые брата/сестры')
			break
		case 'eu9':
			ans.eu = 9
			br_sist += 9
			bot.deleteMessage(chatId, message_id).then(order = 80)
//			bot.sendMessage(chatId,'девять единоутробных/ые брата/сестры')
			break

		case 'bok0':  //боковой элемент
			bot.deleteMessage(chatId, message_id).then(order = 100)
//			bot.sendMessage(chatId,'бокового элемента нет')
			break
		case 'bok1':
			ans.bok = 1
			bot.deleteMessage(chatId, message_id).then(order = 100)
//			bot.sendMessage(chatId,'один боковой элемент')
			break
		case 'bok2':
			ans.bok = 2
			bot.deleteMessage(chatId, message_id).then(order = 100)
//			bot.sendMessage(chatId,'два боковых элемента')
			break
		case 'bok3':
			ans.bok = 3
			bot.deleteMessage(chatId, message_id).then(order = 100)
//			bot.sendMessage(chatId,'три боковых элемента')
			break
		case 'bok4':
			ans.bok = 4
			bot.deleteMessage(chatId, message_id).then(order = 100)
//			bot.sendMessage(chatId,'четыре боковых элемента')
			break
		case 'bok5':
			ans.bok = 5
			bot.deleteMessage(chatId, message_id).then(order = 100)
//			bot.sendMessage(chatId,'пять боковых элементов')
			break
		case 'bok6':
			ans.bok = 6
			bot.deleteMessage(chatId, message_id).then(order = 100)
//			bot.sendMessage(chatId,'шесть боковых элементов')
			break
		case 'bok7':
			ans.bok = 7
			bot.deleteMessage(chatId, message_id).then(order = 100)
//			bot.sendMessage(chatId,'семь боковых элементов')
			break
		case 'bok8':
			ans.bok = 8
			bot.deleteMessage(chatId, message_id).then(order = 100)
//			bot.sendMessage(chatId,'восемь боковых элементов')x
			break
		case 'bok9':
			ans.bok = 9
			bot.deleteMessage(chatId, message_id).then(order = 100)
//			bot.sendMessage(chatId,'девять боковых элементов')
			break
		case 'calc':
			res_text = calc.calculating(ans)
			const options = {parse_mode: 'HTML'}
			bot.sendMessage(chatId,res_text, options).then(order = 101)
			break
		case 'common_info':
			text_common = `	Нисходящее родство наследодателя - это дети, внуки и т.д.
			Восходящее родство наследодателя - это отец, мать, дедушка, бабушка и т.д.
			Дедушка - это отец отца и т.д. по мужской линии.
			Внук - это сына, сын сына сына и т.д. 
			Внучка - это дочь сына, дочь сына сына и т.д.
			Единокровный брат - это отец один, а матери разные.
			Единокровная сестра - это мать одна, а отцы разные.

			Право на наследование конечной доли по силе в следующем порядке:
			сын, внук, и т.д., отец, дедушка, и т.д.,родной брат (совместно с родной сестрой), единокровный брат (совместно с единокровной сестрой), сын родного брата, сын единокровного брата, и т.д., родной дядя, единокровный дядя, сын родного дяди, сын единокровного дяди и т.д. 
			Любой элемент в этой последовательности не допускает к наследованию следующего.`
			bot.sendMessage(chatId,text_common)
			break
		case 'mother':
			text_mother = `Мать получает 1/3 при отсутствии нисходящего родства (фуру‘) и отсутствии двух и более [любых] братьев или сестер наследодателя. 
мать получает 1/6 при наличии нисходящего родства или двух и более [любых] братьев или сестер наследодателя.
мать Одну треть (1/3) от остатка (который остался после доли одного из супругов) только в двух примерах, которые называются «Умарскими примерами»`
			bot.sendMessage(chatId,text_mother)
			break
		case 'father':
			text_father = `Отец получает 1/6 при наличии нисходящего мужского родства;
отец получает 1/6+остаток при наличии только женского нисходящего родства;
отец получает остаток при отсутствии нисходящего родства.`
			bot.sendMessage(chatId,text_father)
			break
		case 'husband':
			text_husband = `Муж получает 1/2 при отсутствии нисходящего родства;
муж получает 1/4 при наличии нисходящего родства.`
			bot.sendMessage(chatId,text_husband)
			break
		case 'wife':
			text_wife = `Жена получает 1/4 при отсутствии нисходящего родства.
Либо получает 1/8 при наличии нисходящего родства.
* Нельзя забывать, что после смерти мужа все совместно нажитое имущество
делится пополам, половина жены остается жене. За единицу делимого имущества принимается доля мужа. Из нее жена имеет право 
забрать 1/4 либо 1/8 в зависимости от наличия детей или внуков. 
Несколько жен делят 1/4 либо 1/8 поровну между собой. То есть, сначала определяется вид части (1/4 или 1/8), 
далее она делится между всеми женами поровну.`
			bot.sendMessage(chatId,text_wife)
			break
		case 'son':
			text_son = `Сын получает конечную долю, если один. Несколько сыновей делят остаток поровну.
Если есть дочери, то остаток распределяется так, что каждый из сыновей получают в два раза больше каждой из дочерей.`
			bot.sendMessage(chatId,text_son)
			break
		case 'daught':
			text_dau = `Одна дочь получает 1/2 долю. Две и более дочерей получают 2/3 и делят её поровну между собой.
Если есть сыновья, то остаток распределяется так, что каждый из сыновей получают в два раза больше каждой из дочерей.`
			bot.sendMessage(chatId,text_dau)
			break
		case 'gson':
			text_vnuk = `Внук получает конечную долю при отсутствии сына. Правнук получает конечную часть
при отсутствии внука и т.д. по мужской линии. Несколько внуков делят остаток поровну между собой.
Если есть внучки, то остаток распределяется так, что каждый из внуков получает в два раза больше каждой из внучек.`
			bot.sendMessage(chatId,text_vnuk)
			break
		case 'gdaught':
			text_vnuch = `Внучка допускается к наследованию при отсутсвии сына наследодателя.
Если есть внуки, остаток распределяется так, что каждый из внуков получает в два раза больше каждой из внучек.
Если нет внуков, то выясняем наличие дочери. Если дочери нет, то внучка наследует как дочь: 1 внучка получает 1/2,
две и более внучки получают 2/3 и делят поровну. Если дочь одна, то внучка получает 1/6, большее количество внучек делят поровну 1/6.
Если же дочерей две или более, то внучка не является наследницей.`
			bot.sendMessage(chatId,text_vnuch)
			break
		case 'gdad':
			text_gdad = `Если есть отец, дедушка не допускается к наследованию и т.д.
Если отца нет, дедушка наследует как отец: при наличии мужского нисходящего родства получает 1/6,
при наличии только женского нисходящего родства 1/6+остаток, в иных случаях только остаток.`
			bot.sendMessage(chatId,text_gdad)
			break
		case 'gmother':
			text_gmoth = `Под бабушкой в двух восходящих поколениях имеются в виду следующие 5:  мать отца, мать матери, мать отца отца, мать матери отца, мать матери матери.
Ближайший к наследодателю уровень не допускает следующий. Напр., мать матери не допускет мать матери матери.
Если осталась мать, то она не допускает любую из бабушек. Отец не допускает к наследованию бабушек по своей линии.
Бабушка наследует 1/6 наследства, несколько бабушек делят 1/6 поровну.`
			bot.sendMessage(chatId,text_gmoth)
			break
		case 'brother':
			text_bro = `Родной брат допускается к наследованию конечного остатка либо всего наследства при отсутствии нисходящей и восходящей мужской линии наследодателя.
Если есть родные сёстры, то остаток распределяется так, что каждый из братьев получает в два раза больше каждой из сестёр.
Если родных сестёр нет, то братья делят остаток поровну.`
			bot.sendMessage(chatId,text_bro)
			break
		case 'sister':
			text_sis = `Родная сестра допускается к наследованию конечного остатка либо всего наследства при отсутствии нисходящей и восходящей мужской линии наследодателя.
Если есть родные братья, то сестры наследуют наряду с ними, причем остаток распределяется так, что каждый из братьев получает в два раза больше каждой из сестёр.
Если родных братьев нет, а также нет нисходящей женской линии наследодателя (дочь, внучка ..), то сестра наследует как дочь:
одна сестра получает 1/2, две и более получают 2/3 и делят поровну. Если же есть нисходящяя женская линия (независимо от кол-ва дочерей или внучек) родная сестра получает остаток при его наличии.`
			bot.sendMessage(chatId,text_sis)
			break
		case 'ed_kr_b':
			text_ekbr = `Единокровный брат допускается к наследованию конечного остатка либо всего наследства при отсутствии нисходящей и восходящей мужской линии наследодателя.
Еще одно условие - это отсутствие родных братьев и сестёр. Если единокровных братьев несколько, то они делят свою часть поровну.
Если есть единокровная сестра, то она также наследует наряду с единокровными братьями, получая при этом каждый единокровный брат получает в два раза больше единокровной сестры.`
			bot.sendMessage(chatId,text_ekbr)
			break
		case 'ed_kr_s':
			text_eksis = `Единокровная сестра допускается к наследованию конечного остатка либо всего наследства при отсутствии нисходящей и восходящей мужской линии наследодателя.
Еще одно условие - это отсутствие родных братьев либо двух и более родных сестёр либо одной сестры, которая наследует остаток зависимо от дочерей. 
При отсутствии единокровного брата единокровная сестра наследует как дочь: одна получает 1/2, две и более получают 2/3 и делят поровну.
Также при отсутствии единокровного брата, но при наличии дочери либо внучки и т.п. наследодателя, единокровная сестра наследует остаток.`
			bot.sendMessage(chatId,text_eksis)
			break
		case 'ed_ut':
			text_eu = `Единоутробные братья/сёстры допускаются к наследованию конечного остатка либо всего наследства при отсутствии восходящей мужской и нисходящей мужской и женский линий наследодателя.
Единственный единоутробный брат/сестра наследуют 1/6.
Два и более единоутробных братьев/сестёр наследуют 1/3 и делят поровну между собой (то есть 1:1).`
			bot.sendMessage(chatId,text_eu)
			break
		case 'side':
			text_side = `Если нет восходящих, нисходящих линий, нет родных братьев/сестер, единокровных братьев/сестер, которые получили бы остаток,
смотрим на наличие следуюшего бокового элемента. Под ним понимается один из следующих наследников в зависимости от близости к наследодателю:
сын родного брата, сын единокровного брата, родной дядя, единокровный дядя, сын родного дяди,
сын единокровного дяди. Причем выбранный элемент не допускает к наследованию следующего за ним и полчает конечную долю либо все наследство.`
			bot.sendMessage(chatId,text_side)
			break
	}


	if (order == 1){
		bot.sendMessage(chatId,questions[1][0],{
		reply_markup: {
			inline_keyboard: [
				[	{text: questions[1][1],
					callback_data: 'sex0'},
					{text: questions[1][2],
					callback_data: 'sex1'}]
				]
			}
		})
	}

	if (order == 2){
		bot.sendMessage(chatId,questions[2][0],{
		reply_markup: {
			inline_keyboard: [
				[	{text: questions[2][1],
					callback_data: 'f0'},
					{text: questions[2][2],
					callback_data: 'f1'}]
				]
			}
		})
	}

	if (order == 3){
		bot.sendMessage(chatId,questions[3][0],{
		reply_markup: {
			inline_keyboard: [
				[	{text: questions[3][1],
					callback_data: 'm0'},
					{text: questions[3][2],
					callback_data: 'm1'}]
				]
			}
		})
	}

	if (order == 4){
		if (ans.sex) { //муж
			bot.sendMessage(chatId,questions[5][0],{
				reply_markup: {
					inline_keyboard: [
						[	{text: questions[5][1],
							callback_data: 'sp0'},
							{text: questions[5][2],
							callback_data: 'sp1'},
							{text: questions[5][3],
							callback_data: 'sp2'},
							{text: questions[5][4],
							callback_data: 'sp3'},
							{text: questions[5][5],
							callback_data: 'sp4'}
						]
						]
					}
				})
		}

		else { //жены
			bot.sendMessage(chatId,questions[4][0],{
			reply_markup: {
				inline_keyboard: [
					[{text: questions[4][1],
					callback_data: 'sp0'},
					{text: questions[4][2],
					callback_data: 'sp1'}]
					]
				}
			})
		}
	}

	if (order == 6){ //сыновья
		bot.sendMessage(chatId,questions[6],{
		reply_markup: {
			inline_keyboard: [
				[	{text: '0',
					callback_data: 's0'},
					{text: '1',
					callback_data: 's1'},
					{text: '2',
					callback_data: 's2'},
					{text: '3',
					callback_data: 's3'},
					{text: '4',
					callback_data: 's4'}
				],
				[	{text: '5',
					callback_data: 's5'},
					{text: '6',
					callback_data: 's6'},
					{text: '7',
					callback_data: 's7'},
					{text: '8',
					callback_data: 's8'},
					{text: '9',
					callback_data: 's9'}
				]
				]
			}
		})
	}


	if (order == 7){ //дочери
		bot.sendMessage(chatId,questions[7],{
		reply_markup: {
			inline_keyboard: [
				[	{text: '0',
					callback_data: 'd0'},
					{text: '1',
					callback_data: 'd1'},
					{text: '2',
					callback_data: 'd2'},
					{text: '3',
					callback_data: 'd3'},
					{text: '4',
					callback_data: 'd4'}
				],
				[	{text: '5',
					callback_data: 'd5'},
					{text: '6',
					callback_data: 'd6'},
					{text: '7',
					callback_data: 'd7'},
					{text: '8',
					callback_data: 'd8'},
					{text: '9',
					callback_data: 'd9'}
				]
				]
			}
		})
	}

	if (order == 8 && !ans.f){ //вопрос про деда (отец отца)
//		console.log(order,questions[order])
			bot.sendMessage(chatId,questions[8][0],{
			reply_markup: {
				inline_keyboard: [
					[	{text: questions[8][1],
						callback_data: 'gd0'},
						{text: questions[8][2],
						callback_data: 'gd1'}]
					]
				}
			})
	} else if (order == 8) {
		order = 11 //если есть отец, переходи на бабушек
	}

	if (order == 9){ //далее вводим прадедушку

		bot.sendMessage(chatId,questions[9][0],{
		reply_markup: {
			inline_keyboard: [
				[	{text: questions[9][1],
					callback_data: 'ggd0'},
					{text: questions[9][2],
					callback_data: 'ggd1'}]
				]
			}
		})
	}

	if (order == 10){ //далее вводим прапрадедушку, если отс нижн родство
		bot.sendMessage(chatId,questions[10][0],{
		reply_markup: {
			inline_keyboard: [
				[	{text: questions[10][1],
					callback_data: 'gggd0'},
					{text: questions[10][2],
					callback_data: 'gggd1'}]
				]
			}
		})
	}

	if (order == 11 && ans.m == 0 && ans.f == 0){ //бабушка (мать отца) [gmf]
	//условие: нет матери и отца
		bot.sendMessage(chatId,questions[11][0],{
		reply_markup: {
			inline_keyboard: [
				[	{text: questions[11][1],
					callback_data: 'gmf0'},
					{text: questions[11][2],
					callback_data: 'gmf1'}]
				]
			}
		})
	} else if (order == 11){
		order = 12
	}

	if (order == 12 && !ans.m){ //бабушка (мать матери) [gmm]
	//условие: нет матери
		bot.sendMessage(chatId,questions[12][0],{
		reply_markup: {
			inline_keyboard: [
				[	{text: questions[12][1],
					callback_data: 'gmm0'},
					{text: questions[12][2],
					callback_data: 'gmm1'}]
				]
			}
		})
	} else if (order == 12){
		order = 13
	}

	if (order == 13 && ans.m ==0 && ans.f == 0 && !ans.gmf && !ans.gmm){ //бабушка (мать отца отца)
	//[gmff]
	//условие: нет матери, отца, матери отца, матери мамы
		bot.sendMessage(chatId,questions[13][0],{
		reply_markup: {
			inline_keyboard: [
				[	{text: questions[13][1],
					callback_data: 'gmff0'},
					{text: questions[13][2],
					callback_data: 'gmff1'}]
				]
			}
		})
	} else if (order == 13){
		order = 14
	}

	if (order == 14 && ans.m ==0 && ans.f == 0 && !ans.gmf && !ans.gmm){ //бабушка (мать мать отца)
	//условие: нет матери и отца, бабушки по отцу 
	//[gmmf]
		bot.sendMessage(chatId,questions[14][0],{
		reply_markup: {
			inline_keyboard: [
				[	{text: questions[14][1],
					callback_data: 'gmmf0'},
					{text: questions[14][2],
					callback_data: 'gmmf1'}]
				]
			}
		})
	} else if (order == 14) {
		order = 15
	}

	if (order == 15 && ans.m ==0 && !ans.gmm && !ans.gmf){ //бабушка (мать мать матери)
	//условие: нет матери, бабушки по матери, бабушки по отцу

		bot.sendMessage(chatId,questions[15][0],{
		reply_markup: {
			inline_keyboard: [
				[	{text: questions[15][1],
					callback_data: 'gmmm0'},
					{text: questions[15][2],
					callback_data: 'gmmm1'}]
				]
			}
		})
	} else if (order == 15) {
		order = 16
	}


	if (order == 16 && ans.age == 1 && !ans.s){ //внук
		bot.sendMessage(chatId,questions[16],{
		reply_markup: {
			inline_keyboard: [
				[	{text: '0',
					callback_data: 'gs0'},
					{text: '1',
					callback_data: 'gs1'},
					{text: '2',
					callback_data: 'gs2'},
					{text: '3',
					callback_data: 'gs3'},
					{text: '4',
					callback_data: 'gs4'}
				],
				[	{text: '5',
					callback_data: 'gs5'},
					{text: '6',
					callback_data: 'gs6'},
					{text: '7',
					callback_data: 'gs7'},
					{text: '8',
					callback_data: 'gs8'},
					{text: '9',
					callback_data: 'gs9'}
				]
				]
			}
		})
	} else if (order == 16) {
		order = 50 //если возраст меньше 35 отправили на заполнение восх и нисх
	}

	if (order == 17 && !ans.gs){ //правнук
		bot.sendMessage(chatId,questions[17],{
		reply_markup: {
			inline_keyboard: [
				[	{text: '0',
					callback_data: 'ggs0'},
					{text: '1',
					callback_data: 'ggs1'},
					{text: '2',
					callback_data: 'ggs2'},
					{text: '3',
					callback_data: 'ggs3'},
					{text: '4',
					callback_data: 'ggs4'}
				],
				[	{text: '5',
					callback_data: 'ggs5'},
					{text: '6',
					callback_data: 'ggs6'},
					{text: '7',
					callback_data: 'ggs7'},
					{text: '8',
					callback_data: 'ggs8'},
					{text: '9',
					callback_data: 'ggs9'}
				]
				]
			}
		})
	} else if (order == 17) {
		order = 19 //отправили на введение внучки
	}

	if (order == 18 && !ans.ggs){ //праправнук
		bot.sendMessage(chatId,questions[18],{
		reply_markup: {
			inline_keyboard: [
				[	{text: '0',
					callback_data: 'gggs0'},
					{text: '1',
					callback_data: 'gggs1'},
					{text: '2',
					callback_data: 'gggs2'},
					{text: '3',
					callback_data: 'gggs3'},
					{text: '4',
					callback_data: 'gggs4'}
				],
				[	{text: '5',
					callback_data: 'gggs5'},
					{text: '6',
					callback_data: 'gggs6'},
					{text: '7',
					callback_data: 'gggs7'},
					{text: '8',
					callback_data: 'gggs8'},
					{text: '9',
					callback_data: 'gggs9'}
				]
				]
			}
		})
	} else if (order == 18) {
		order = 19
	}

	if ((order == 19 && (ans.d == 1 || !ans.d))|| (order == 19 && ans.d > 1 && vnuki > 0 )){ //внучка
		//то что нет сына обеспечено ранее, тогда сразу ушли на брата
		//если одна дочка, то внучка вводится
		//если две или более, тогда смотрим на внуков(vnuki)
			//если они есть, то вводим, если нет , то нет 
		bot.sendMessage(chatId,questions[19],{
		reply_markup: {
			inline_keyboard: [
				[	{text: '0',
					callback_data: 'gda0'},
					{text: '1',
					callback_data: 'gda1'},
					{text: '2',
					callback_data: 'gda2'},
					{text: '3',
					callback_data: 'gda3'},
					{text: '4',
					callback_data: 'gda4'}
				],
				[	{text: '5',
					callback_data: 'gda5'},
					{text: '6',
					callback_data: 'gda6'},
					{text: '7',
					callback_data: 'gda7'},
					{text: '8',
					callback_data: 'gda8'},
					{text: '9',
					callback_data: 'gda9'}
				]
				]
			}
		})
	} else if (order == 19) {
	//иначе переходим на заполнение восх и нисх
		order = 50
	}


	if (order == 20){ //правнуЧка
		bot.sendMessage(chatId,questions[20],{
		reply_markup: {
			inline_keyboard: [
				[	{text: '0',
					callback_data: 'ggda0'},
					{text: '1',
					callback_data: 'ggda1'},
					{text: '2',
					callback_data: 'ggda2'},
					{text: '3',
					callback_data: 'ggda3'},
					{text: '4',
					callback_data: 'ggda4'}
				],
				[	{text: '5',
					callback_data: 'ggda5'},
					{text: '6',
					callback_data: 'ggda6'},
					{text: '7',
					callback_data: 'ggda7'},
					{text: '8',
					callback_data: 'ggda8'},
					{text: '9',
					callback_data: 'ggda9'}
				]
				]
			}
		})
	}

	if (order == 21){ //праправнуЧка
		bot.sendMessage(chatId,questions[21],{
		reply_markup: {
			inline_keyboard: [
				[	{text: '0',
					callback_data: 'gggda0'},
					{text: '1',
					callback_data: 'gggda1'},
					{text: '2',
					callback_data: 'gggda2'},
					{text: '3',
					callback_data: 'gggda3'},
					{text: '4',
					callback_data: 'gggda4'}
				],
				[	{text: '5',
					callback_data: 'gggda5'},
					{text: '6',
					callback_data: 'gggda6'},
					{text: '7',
					callback_data: 'gggda7'},
					{text: '8',
					callback_data: 'gggda8'},
					{text: '9',
					callback_data: 'gggda9'}
				]
				]
			}
		})
	}

	if (order == 50) {
		//запишем всех восходящих и нисходящих
		ans.nishod_m = nishod_m
		ans.nishod_f = nishod_f
		ans.voshod = voshod
		ans.vnuki = vnuki
		//перейдем к родному брату	
		order = 22

		//!! если есть восх либо нисх м, то можно переходить к расчету
		//нет СМЫСЛА вводить боковых

	}


	if (order == 22 && (voshod+nishod_m)==0){ //родной брат

//		console.log('родной брат', voshod, nishod_m)
		bot.sendMessage(chatId,questions[22],{
		reply_markup: {
			inline_keyboard: [
				[	{text: '0',
					callback_data: 'br0'},
					{text: '1',
					callback_data: 'br1'},
					{text: '2',
					callback_data: 'br2'},
					{text: '3',
					callback_data: 'br3'},
					{text: '4',
					callback_data: 'br4'}
				],
				[	{text: '5',
					callback_data: 'br5'},
					{text: '6',
					callback_data: 'br6'},
					{text: '7',
					callback_data: 'br7'},
					{text: '8',
					callback_data: 'br8'},
					{text: '9',
					callback_data: 'br9'}
				]
				]
			}
		})
	} else if (order == 22) {
//		console.log('НЕТ родного брата')
		order = 23 //к сестре
	}


	if (order == 23 && (voshod+nishod_m)==0){ //родная сестра
//		console.log('родная сестра')

		bot.sendMessage(chatId,questions[23],{
		reply_markup: {
			inline_keyboard: [
				[	{text: '0',
					callback_data: 'sis0'},
					{text: '1',
					callback_data: 'sis1'},
					{text: '2',
					callback_data: 'sis2'},
					{text: '3',
					callback_data: 'sis3'},
					{text: '4',
					callback_data: 'sis4'}
				],
				[	{text: '5',
					callback_data: 'sis5'},
					{text: '6',
					callback_data: 'sis6'},
					{text: '7',
					callback_data: 'sis7'},
					{text: '8',
					callback_data: 'sis8'},
					{text: '9',
					callback_data: 'sis9'}
				]
				]
			}
		})
	} else if (order == 23) {
		order = 24


		//начинаем вводить боковых
		//

	}




	if (order == 24 && (voshod+nishod_m)==0 && !ans.br && !ans.sis){ //единокровный брат
		bot.sendMessage(chatId,questions[24],{
		reply_markup: {
			inline_keyboard: [
				[	{text: '0',
					callback_data: 'ekbr0'},
					{text: '1',
					callback_data: 'ekbr1'},
					{text: '2',
					callback_data: 'ekbr2'},
					{text: '3',
					callback_data: 'ekbr3'},
					{text: '4',
					callback_data: 'ekbr4'}
				],
				[	{text: '5',
					callback_data: 'ekbr5'},
					{text: '6',
					callback_data: 'ekbr6'},
					{text: '7',
					callback_data: 'ekbr7'},
					{text: '8',
					callback_data: 'ekbr8'},
					{text: '9',
					callback_data: 'ekbr9'}
				]
				]
			}
		})
	} else if (order == 24) {
//		console.log(' перехожу к  25')
		order = 25
	}


	if (order == 25 && (voshod+nishod_m)==0 && !ans.br && (!ans.sis || ans.sis==1) && ans.sis*ans.d == 0){ //единокровная сестра
//16.03.19 убрал !ans.sis, так как если одна сестра
		bot.sendMessage(chatId,questions[25],{
		reply_markup: {
			inline_keyboard: [
				[	{text: '0',
					callback_data: 'eksis0'},
					{text: '1',
					callback_data: 'eksis1'},
					{text: '2',
					callback_data: 'eksis2'},
					{text: '3',
					callback_data: 'eksis3'},
					{text: '4',
					callback_data: 'eksis4'}
				],
				[	{text: '5',
					callback_data: 'eksis5'},
					{text: '6',
					callback_data: 'eksis6'},
					{text: '7',
					callback_data: 'eksis7'},
					{text: '8',
					callback_data: 'eksis8'},
					{text: '9',
					callback_data: 'eksis9'}
				]
				]
			}
		})
	} else if (order == 25) {
//		console.log(' перехожу к  26')
		order = 26
	}

	if (order == 26 && (voshod+nishod_m+nishod_f) == 0 && !ans.br && (!ans.sis || ans.sis == 1) && !ans.ekbr){ //единокровная сестра
		//единоутробные
//		console.log('WRITING EU')
		bot.sendMessage(chatId,questions[26],{
		reply_markup: {
			inline_keyboard: [
				[	{text: '0',
					callback_data: 'eu0'},
					{text: '1',
					callback_data: 'eu1'},
					{text: '2',
					callback_data: 'eu2'},
					{text: '3',
					callback_data: 'eu3'},
					{text: '4',
					callback_data: 'eu4'}
				],
				[	{text: '5',
					callback_data: 'eu5'},
					{text: '6',
					callback_data: 'eu6'},
					{text: '7',
					callback_data: 'eu7'},
					{text: '8',
					callback_data: 'eu8'},
					{text: '9',
					callback_data: 'eu9'}
				]
				]
			}
		})
	} else if (order == 26) {
//		console.log('WRITING EU11')
		order = 80

		//идем записывать всех братьев и сестер
	}

	if (order == 80 && ans.all_br_sis==0 && (ans.voshod+ans.nishod_f+ans.nishod_m)==0 ) {
		ans.all_br_sis = (ans.br || 0) + (ans.sis || 0) + (ans.eu || 0) + (ans.ekbr || 0) + (ans.eksis || 0)
		//переходим к остальным боковым
		var texti = `ВНИМАНИЕ! Далее под боковым элементом понимается один из следующих наследников: \n`
		texti += `сын родного брата, сын единокровного брата, `
		texti += `родной дядя, единокровный дядя, сын родного дяди, `
		texti += `сын единокровного дяди. Причем выбранный элемент не допускает к наследованию следующего за ним и полчает конечную долю либо все наследство.`
		bot.sendMessage(chatId,texti,{
		reply_markup: {
			inline_keyboard: [
				[	{text: '0',
					callback_data: 'bok0'},
					{text: '1',
					callback_data: 'bok1'},
					{text: '2',
					callback_data: 'bok2'},
					{text: '3',
					callback_data: 'bok3'},
					{text: '4',
					callback_data: 'bok4'}
				],
				[	{text: '5',
					callback_data: 'bok5'},
					{text: '6',
					callback_data: 'bok6'},
					{text: '7',
					callback_data: 'bok7'},
					{text: '8',
					callback_data: 'bok8'},
					{text: '9',
					callback_data: 'bok9'}
				]
				]
			}
		})
	} else if (order == 80) {
		order = 100
	}	

	if (order == 100) {
	//появляется кнопка Расчитать
		bot.sendMessage(chatId,'Переходим к расчёту',{
		reply_markup: {
			inline_keyboard: [
				[	{text: 'Рассчитать',
					callback_data: 'calc'}
				]
				]
			}
		})

	}
	if (order == 101) {
		bot.deleteMessage(chatId, message_id)
	}



//	console.log(ans,voshod)
})



//ans = { age: 0, sex: 0, f: 1, m: 1, sp: 1, s: 1, d: 0 }
var all_dads = ['f', 'gf', 'ggf', 'gggf']

//console.log(questions[8])

// proba = {
// 	f: 19,
// 	g: 2
// }

// console.log( 'f' in proba )
// // console.log(proba.f+proba.g+proba.kk)
// if (proba.g && proba.kk){
// 	console.log('yes')
// }
// else {
// 	console.log('no')
// }

// отец:
//Если даже существование наследницы женского пола (дочери) позволяет отцу взять конечную долю (та‘сиб), то существование сына это право у отца отнимает.

//мать:
//Одну треть (1/3) при отсутствии нисходящего родства (фуру‘) и отсутствии двух и более [любых] братьев или сестер наследодателя. 
//Одну шестую (1/6) при существовании нисходящего родства или существовании двух и более [любых] братьев или сестер наследодателя.
//Одну треть (1/3) от остатка (который остался после доли одно- го из супругов) только в двух примерах, которые называются «Умарскими примерами»

// внук вводится если нет сына
// внук - это сын сына, внучка - это дочь сына
//если дочь одна, она получает 1/2, вводится внучка и получает 1/6, то есть их совместная доля есть 2/3. 
// 		В этом случае, если внучек несколько, то они делят 1/6 поровну между собой
// внучка вводится если нет сына и дочерей меньше 2
// внучка вводится если нет сына и дочерей больше 1 и есть внуки
// если дочерей больше или равно 2, то внучка вводится только при наличии внука

// дедушка вводится если нет отца
// прадедушка вводится если нет отца (автоматичеси соблюдается) и прадедушки
// прапрадедушка вводится если нет отца и прадедушки

// для введения любой бабушки должна отсутствовать мать
// к тому же:
// gmm: нет доп.условий
// gmf: если нет отца
// gmff: нет отца, gmm, gmf
// gmmf: нет отца, gmm, gmf
// gmmm: нет gmm, gmf

// родной брат вводится:
// отсутствует восх и нисх мужской пол

// родная сестра вводится:
// отсутствует восх и нисх мужской пол
// наследует зависимо от дочерей либо внучек
// если не остается остатка после того как все заберут, значит 
//    им не достается

// единокровный брат вводится: [ekbro]
// отсутствует восх и нисх мужской пол
// отсутсвуют родные братья и сестры

// сын родного брата (племянник и внучатые племянники):
// отсутствует восх и нисх мужской пол
// нет родного и единкровного брата
// нет родной и единкровной сестры

// сын единкровного брата (дети брата и внуч племянники):
// отсутствует восх и нисх мужской пол
// нет родного брата, единокровного брата, родной и единокровной сестры
// нет сына родного брата 
//дочь единокровного брата в наследство не вступает

//единокровная сестра: [eksis]
//отсутствует восх и нисх мужской пол
//нет родного брата
//родная сестра
//две или более родные сестры, если нет единокровного брата


//родные и единокровные дяди
//(здесь же и нисходящие их родство)
// отсутствует восх и нисх мужской пол
// отсутствуют родной и единокровный братья и их дети
// отсутсв родная и единокр сестра
//




// Единоутробные братья и сестры
// нет восход мужского
// нет любого нисход
// если один, то 1/6
// если несколько, то 1/3 делят поровну
