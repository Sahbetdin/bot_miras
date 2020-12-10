const myf = require('./used_functions')

module.exports = {


calculating(ans) {

var flag = false //расчет выполнен
var all_dads = ['f', 'gf', 'ggf', 'gggf']
var text =``
var str

var dad = null //это переменная, которая принимает одно из значений пап из all_dads
flag_dad = false //для поиска "отца"
var count
var ost // was 232th line
var denoms = []
var factors = [] //factors that to be multiplied to get common divisor
var common_d
var n


for (i in all_dads){
	for (j in ans) {
		if (j==all_dads[i] && ans[j] == 1){
			dad = j
			flag_dad = true
			break
		}
	}
	if (flag_dad){
		break
	}
} 



p = {}

//есть ли Умарский пример
//в Умарских примерах мы ничего не меняем
if (ans.sex==0 && ans.f==1 && ans.m==1 && ans.sp>0 && ans.nishod_m==0 && ans.nishod_f==0 && ans.br_sist==0) {
//остались муж, отец и мать
	p.m = [1,6]
	p.f = [1,3]
	p.sp = [1,2]
	flag = true
	text += ` Муж получает 1/2, так как нет наследника нисходящего родства.\n`
	text += ` Мать получает 1/3 от остатка, который остаётся после
доли мужа, что составляет 1/3*1/2=1/6, так как это один из «Умарских примеров».\n`
	text += ` Отец получает конечную долю (та‘сиб) 1/3 после мужа и матери, так
как отсутствует наследник нисходящего родства.\n`
//	console.log('УМАРСКИЙ', p)
} 
else if (ans.sex ==1 && ans.f==1 && ans.m==1 && ans.sp>0 && ans.nishod_m==0 && ans.nishod_f==0 && ans.br_sist==0) {
//остались жена, отец и мать
	p.m = [1,4]
	p.f = [1,2]
	p.sp = [1,4*ans.sp]
	flag = true
	text += ` Жена получает 1/4, так как нет наследника нисходящего родства.\n`
	text += ` Мать получает 1/3 от остатка, который остаётся после доли жены, что составляет 1/3*3/4 = 1/4, так как это один из «Умарских примеров».\n`
	text += ` Отец получает конечную долю (та‘сиб) 1/2 после жены и матери, так как отсутствует наследник нисходящего родства.\n`
//	console.log('УМАРСКИЙ', p)
} 

// else if (!ans.sex && ans.sp && ans.m && ans.eu>=2 && (ans.br || ans.sis) && (ans.nishod_m+ans.nishod_f)==0 ){
// 	//Пример ОСЛОВ стр.105
// 	var hh = ans.br || ans.sis
// 	p.sp = [1,2,1]
// 	p.m = [1,6,1]
// 	p.eu = [1,3*(ans.br+ans.eu),ans.eu]
// 	p.br = [1,3*(ans.br+ans.eu),ans.br]
// 	flag = true
// 	text += ` Ханафиты и ханбалиты решили, что родной брат в этом случае ничего не получает.`
// 	text +=	` Вы можете обратиться за подробной консультацией на сайт unilawyers.ru.`
// 	text +=  `Маликиты и шафииты пришли к выводу, что родной брат приравнивается к единоутробному и становится с единоутробными братьями соучастником в наследовании.`
// 	text == ` Ниже приведен именно такой расчет, который состялся во времена Умара (р.а.) и носит название примера Ослов. \n`

// }

//доля папы
if (dad != null && !flag) {
	if (ans.nishod_m) {
		//если есть м нисход, то 1/6
		p[dad] = [1,6,1,0]
//		[ost,common_d] = [5,6]

		if (ans.nishod_m == 1) {
			text += ` Отец получает обязательную долю 1/6, так как существует наследник нисходящего родства мужского пола.\n`			
		} else if (ans.nishod_m > 1) {
			text += ` Отец получает обязательную долю 1/6, так как существуют наследники нисходящего родства мужского пола.\n`			
		}
	} else if (ans.nishod_f){
		//если есть ж нисход, то 1/6+ост
		p[dad] = [1,6,1,1]
//		[ost,common_d] = [5,6]

		text += ` Отец получает обязательную долю 1/6 и конечную долю (та‘сиб), так как существует нисходящее родство только женского пола.\n`
	} else if (!ans.nishod_m && !ans.nishod_f) {
		//если нет нисход, то остаток
		p[dad] = [0,1,1,1]
//		[ost,common_d] = [1,1]
		text += ` Отец получает конечную долю (та‘сиб), так как отсутствует наследник нисходящего родства.\n`
	}
} 

if (!flag) {
//доля мамы
if (ans.m) {
	if (!(ans.nishod_m + ans.nishod_f) && ans.all_br_sis < 2) {
		p['m']= [1,3,1]
		text += ` Мать получает обязательную долю 1/3, так как отсутствует наследник нисходящего родства (фуру‘) и количество братьев/сестёр наследодателя меньше двух.\n`
	} else if ((ans.nishod_m + ans.nishod_f)>0 || ans.all_br_sis >= 2) {
		p['m']= [1,6,1]
		text += ` Мать получает обязательную долю 1/6, так как существует наследник нисходящего родства либо количество братьев/сестёр наследодателя больше одного.\n`
	}
}


//супруг(а)
if (ans.sex && ans.sp > 0) { //наследодатель мужчина и осталась супруга(и)
	if (ans.nishod_m+ans.nishod_f) {
		p['sp'] = [1,8,ans.sp]
		if (ans.sp == 1) {
			text += ` Жена получает обязательную долю 1/8, так как существует наследник нисходящего родства. \n`
		} else {
			str = myf.num_to_word_female(ans.sp)
			str = str[0].toUpperCase() + str.slice(1)

			text += ` ${str} жены получают обязательную долю 1/8 и делят эту часть поровну, получая по ${p.sp[0]}/${p.sp[1]}, так как нет наследника нисходящего родства (фуру‘). \n`
		}

	} else if (!(ans.nishod_m+ans.nishod_f)){
		p['sp'] = [1,4,ans.sp]
		if (ans.sp == 1) {
			text += ` Жена получает обязательную долю 1/4, так как нет наследника нисходящего родства (фуру‘). \n`
		} else {
			text += ` Жены получают обязательную долю 1/4 и делят поровну, так как нет наследника нисходящего родства (фуру‘). \n`
		}
		
	}
} else if (!ans.sex && ans.sp == 1) { //наследодатель женщина и остался муж
	if (ans.nishod_m+ans.nishod_f) {
		p['sp'] = [1,4,1]
		if (ans.nishod_m == 1) {
			text += ` Муж получает обязательную долю 1/4, так как существует наследник нисходящего родства (фуру‘). \n`
		} else if (ans.nishod_m > 1) {
			text += ` Муж получает обязательную долю 1/4, так как существуют наследники нисходящего родства (фуру‘). \n`
		}


	} else if (!(ans.nishod_m+ans.nishod_f)){
		p['sp'] = [1,2,1]
		text += ` Муж получает обязательную долю 1/2, так как нет наследника нисходящего родства (фуру‘). \n`

	}
}
}

//бабушка (и)
var all_grandmas = ['gmm', 'gmf', 'gmff', 'gmmf','gmmm']

//в итоге может быть:
var grandma
if (!flag) {
if (ans.gmm && ans.gmf) {
	grandma = ['gmf','gmm']
	text += ` Бабушки получают обязательную долю 1/6 и делят поровну, так как отсутствуют мать и отец.\n`
} else if (ans.gmm) {
	grandma = 'gmm'
	text += ` Бабушка (мать матери) получает обязательную долю 1/6, так как отсутствует мать.\n`
} else if (ans.gmf) {
	grandma = 'gmf'
	text += ` Бабушка (мать отца) получает обязательную долю 1/6, так как отсутствуют мать и отец.\n`
} else if (ans.gmff && ans.gmmf && ans.gmmm) {
	grandma = ['gmff','gmmf','gmmm']
	text += ` Бабушки получают обязательную долю 1/6 и делят поровну, так как отсутствуют мать и отец.\n`
} else if (ans.gmff && ans.gmmf) {
	grandma = ['gmff','gmmf']
	text += ` Бабушки получают обязательную долю 1/6 и делят поровну, так как отсутствуют мать и отец.\n`
} else if (ans.gmff && ans.gmmm) {
	grandma = ['gmff','gmmm']
	text += ` Бабушки получают обязательную долю 1/6 и делят поровну, так как отсутствуют мать и отец.\n`
} else if (ans.gmmf && ans.gmmm) {
	grandma = ['gmmf','gmmm']	
	text += ` Бабушки получают обязательную долю 1/6 и делят поровну, так как отсутствуют мать и отец.\n`
} else if (ans.gmff) {
	grandma = 'gmff'
	text += ` Прабабушка (мать отца отца) получает обязательную долю м1/6, так как отсутствуют мать и отец.\n`
} else if (ans.gmmf) {
	grandma = 'gmmf'
	text += ` Прабабушка (мать матери отца) получает обязательную долю 1/6, так как отсутствуют мать и отец.\n`
} else if (ans.gmmm) {
	grandma = 'gmmm'
	text += ` Прабабушка (мать матери матери) получает обязательную долю 1/6, так как отсутствуют мать и отец.\n`
}
}

//отсутствие матери уже обоспечено, 
//так как мы задавали вопрос про бабушек, учитывая это
if (grandma) {
	p[grandma] = [1,6,1]
}

if (!flag) {


for (i in p) {
	denoms.push(p[i][1])
}

n = denoms.length
if (n) {
	common_d = myf.max_poss_dev(denoms)
}

for (var j = 0; j < n; j++) {
	factors.push(common_d/denoms[j])
}

count = 0
for (i in p) {
	p[i][0] *= factors[count]
	p[i][1] = common_d
	count += 1
}

if (Object.keys(p).length > 0 && p.constructor === Object && common_d) {
	ost = common_d
	for (i in p) {
		ost -= p[i][0] //ost - это числитель дроби остатка
	}
}



//дети
var parts_kids
if (ans.s && ans.d) { //есть сыновья и дочери
	parts_kids = 2 * ans.s + ans.d
	p.s = [2*ost,common_d*parts_kids,ans.s] //каждый сын!!, а не в общем
	p.d = [ost,common_d*parts_kids, ans.d]   //каждая дочь, а не в общем!!!


	p.s = myf.reduce_fraction(p.s[0], p.s[1])
	p.s.push(ans.s)
	p.d = myf.reduce_fraction(p.d[0], p.d[1])
	p.d.push(ans.d)


	if (ans.s > 1 && ans.d > 1) {
		text += ` Среди наследников есть ${myf.num_to_word_man(ans.s)} сыновей и ${myf.num_to_word_female(ans.d)} дочери. В этом случае каждый из сыновей наследуют конечную долю ${p.s[0]}/${p.s[1]}, что в два раза больше доли дочерей ${p.d[0]}/${p.d[1]} (в два раза больше своих сестер). \n`
	} else if (ans.s > 1) {
		text += ` Среди наследников есть ${myf.num_to_word_man(ans.s)} сыновей и дочь. В этом случае каждый из сыновей наследует конечную долю ${p.s[0]}/${p.s[1]}, что в два раза больше доли дочери ${p.d[0]}/${p.d[1]} (в два раза больше своей сестры).\n`
	} else if (ans.d > 1) {
		text += ` Среди наследников есть сын и ${myf.num_to_word_female(ans.d)} дочери. В этом случае сын наследует конечную долю ${p.s[0]}/${p.s[1]}, что в два раза больше доли каждой из дочерей ${p.d[0]}/${p.d[1]} (в два раза больше своих сестер).\n`
	} else {
		text += ` Среди наследников есть сын и дочь. В этом случае сын наследуют конечную долю ${p.s[0]}/${p.s[1]}, что в два раза больше доли дочери ${p.d[0]}/${p.d[1]} (в два раза больше своей сестры).\n`
	}

} else if (ans.d) { //есть дочь(ери) и надо смотреть внуков и внучек
	if (ans.d == 1) {
		//одна дочь получает 1/2
		if (!common_d) { //если еще никто не получил до дочери,т.е. она одна, то назначаем общ.знам. 2
			common_d = 2
			ost = 2
		}
		p.d = [1,2,1]
		text += ` Дочь является единственной наследницей первой степени нисходящего родства (фуру‘) и наследует половину (1/2) наследства [обязательная часть]. \n`
		if (common_d%2==0) { //если общий знаменатель четный
			p.d = [common_d/2,common_d,1]
			ost -= p.d[0] //....
		} else if (common_d%2==1) {
			p.d = [common_d,2*common_d,1]
			ost = 2 * ost - common_d
			common_d *= 2
		}
	} else if (ans.d >= 2) {
		//две и более дочерей вместе получают 2/3

		if (Object.keys(p).length === 0 && p.constructor === Object) { //если еще никто не получил до дочерей,т.е. они одни, то назначаем общ.знам. 3
			p.d = myf.reduce_fraction(2,3*ans.d)
			p.d.push(ans.d)
			common_d = 3
			ost = 1

		}  else {
			p.d = myf.reduce_fraction(2,3*ans.d)
			p.d.push(ans.d)
			ost -= p.d[0]*ans.d
		}
		str = myf.num_to_word_female(ans.d)
		str = str[0].toUpperCase() + str.slice(1)
		text += ` ${str} дочери наследодателя делят поровну между собой 2/3 наследства [обязательная часть], так как отсутствует сын наследодателя.`
		text += ` При этом каждая из них получает ${p.d[0]}/${p.d[1]}.\n`
	}


} else if (ans.s) { //есть только сын и он забирает остаток
	p.s = myf.reduce_fraction(ost, common_d*ans.s)
	p.s.push(ans.s)

	if (ans.s == 1) {
		text += ` Сын забирает остаток, т.е. ${p.s[0]}/${p.s[1]}.\n`
	} else {
		str =myf.num_to_word_man(ans.s)
		str = str[0].toUpperCase() + str.slice(1)
		text += ` ${str} сыновей забирают остаток, т.е. каждый по ${p.s[0]}/${p.s[1]}.\n`
	}
}



//определяем истинного внука, т.е. выбираем из нисходящих внуков
var vnuk = null //логика такакя же, как и при выборе восходящего папы
var vnuk_num //количество внуков
all_vnuki = ['gs','ggs','ggs']

flag_vnuk = false //для поиска "внука"

for (i in all_vnuki){
	for (j in ans) {
		if (j==all_vnuki[i]){
			vnuk = j
			vnuk_num = ans[j]
			flag_vnuk = true
			break
		}
	}
	if (flag_vnuk){
		break
	}
} 

var vnuchka = null
var vnuchka_num //количество внучек
all_vnuchki = ['gda','ggda','gggda']

flag_vnuchki = false //для поиска "внучки"
for (i in all_vnuchki){
	for (j in ans) {
		if (j==all_vnuchki[i]){
			vnuchka = j
			vnuchka_num = ans[j]
			flag_vnuchki = true
			break
		}
	}
	if (flag_vnuchki){
		break
	}
} 

//часть внуков(чек)
var parts_grand_kids
if (ost && vnuk_num) {

	if (Object.keys(p).length === 0 && p.constructor === Object) {
		ost = 1
		common_d = 1
	}


//vnuk, vnuchka, vnuk_num, vnuchka_num
	if (vnuk_num>1 && vnuchka_num>1) { //есть внук(и) и внучка(и)
	 	parts_grand_kids = 2 * vnuk_num + vnuchka_num
	 	p[vnuk] = [2 * ost, common_d * parts_grand_kids, vnuk_num] //указана доля каждого внука
	 	p[vnuchka] = [ost, common_d * parts_grand_kids]   //указана доля каждой внучки

	 	p[vnuk] = myf.reduce_fraction(p[vnuk][0], p[vnuk][1])
	 	p[vnuk].push(vnuk_num)
	 	p[vnuchka] = myf.reduce_fraction(p[vnuchka][0], p[vnuchka][1])
	 	p[vnuchka].push(vnuchka_num)	
 		text += ` Среди наследников есть ${myf.num_to_word_man(ans.gs)} внуков и ${myf.num_to_word_female(ans.gda)} внучки. В этом случае каждый из внуков наследует конечную долю ${p[vnuk][0]}/${p[vnuk][1]}, что в два раза больше доли внучек ${p[vnuchka][0]}/${p[vnuchka][1]} (в два раза больше своих сестер). \n`
	} else if (vnuk_num > 1 && vnuchka_num == 1) {
		parts_grand_kids = 2 * vnuk_num + 1
	 	p[vnuk] = [2 * ost, common_d * parts_grand_kids, vnuk_num] //указана доля каждого внука
	 	p[vnuchka] = [ost, common_d * parts_grand_kids, 1]   //указана доля каждой внучки

	 	p[vnuk] = myf.reduce_fraction(p[vnuk][0], p[vnuk][1])
	 	p[vnuk].push(vnuk_num)
	 	p[vnuchka] = myf.reduce_fraction(p[vnuchka][0], p[vnuchka][1])
	 	p[vnuchka].push(1)
	
	 	text += ` Среди наследников есть ${myf.num_to_word_man(vnuk_num)} внуков и внучка. В этом случае каждый из внуков наследует конечную долю ${p[vnuk][0]}/${p[vnuk][1]}, что в два раза больше доли внучки ${p[vnuchka][0]}/${p[vnuchka][1]} (в два раза больше своей сестры).\n`
	} else if (vnuk_num == 1 && vnuchka_num > 1) {
		parts_grand_kids = 2 + vnuchka_num
	 	p[vnuk] = [2 * ost, common_d * parts_grand_kids,1] //указана доля каждого внука
	 	p[vnuchka] = [ost, common_d * parts_grand_kids, vnuchka_num]   //указана доля каждой внучки

	 	p[vnuk] = myf.reduce_fraction(p[vnuk][0], p[vnuk][1])
	 	p[vnuk].push(1)
	 	p[vnuchka] = myf.reduce_fraction(p[vnuchka][0], p[vnuchka][1])
	 	p[vnuchka].push(vnuchka_num)
	
	 	text += ` Среди наследников есть внук и ${myf.num_to_word_female(vnuchka_num)} внучки. В этом случае внук наследует конечную долю ${p[vnuk][0]}/${p[vnuk][1]}, что в два раза больше доли внучек ${p[vnuchka][0]}/${p[vnuchka][1]} (в два раза больше своих сестер).\n`
	} else if (vnuk_num == 1 && vnuchka_num == 1) {
	 	p[vnuk] = [2 * ost, common_d * 3,1]
	 	p[vnuchka] = [ost, common_d * 3,1]

	 	p[vnuk] = myf.reduce_fraction(p[vnuk][0], p[vnuk][1])
	 	p[vnuk].push(1)
	 	p[vnuchka] = myf.reduce_fraction(p[vnuchka][0], p[vnuchka][1])
	 	p[vnuchka].push(1)
	
	 	text += ` Среди наследников есть внук и внучка. В этом случае внук наследует конечную долю ${p[vnuk][0]}/${p[vnuk][1]}, что в два раза больше доли внучки ${p[vnuchka][0]}/${p[vnuchka][1]} (в два раза больше своей сестры).\n`
	} else if (vnuk_num > 1) {
	 	p[vnuk] = [ost, common_d*vnuk_num, vnuk_num]
		text += ` Среди наследников есть ${myf.num_to_word_man(vnuk_num)} внуков. В этом случае каждый из них наследует конечную долю в ${p[vnuk][0]}/${p[vnuk][1]}. \n`
	} else if (vnuk_num == 1) {
	 	p[vnuk] = [ost, common_d, 1]
		text += ` Среди наследников есть внук. Он наследует конечную долю ${p[vnuk][0]}/${p[vnuk][1]}. \n`
	}

	ost = 0
} else if (vnuchka_num>1 && !vnuk_num ) { //убрал условие ost>0, так как у 2 и более внучек своя обяз доля
	if (Object.keys(p).length === 0 && p.constructor === Object) {
		ost = 1
		common_d = 1
	}

	if (ans.d>1) {
		text += ` Внучки не являются наследницами, так как дочерей больше одной. \n`
	} else if (ans.d == 1) {
		//всем 1/6 поровну
		p[vnuchka] = myf.reduce_fraction(1,6*vnuchka_num)
	 	p[vnuchka].push(vnuchka_num)
		text += ` Внучки наследуют обязательную часть в 1/6, так как осталась одна дочь. Они делят свою долю поровну и получают по ${p[vnuchka][0]}/${p[vnuchka][1]}. Их совместная доля в сумме с единственной дочерью есть 2/3. \n`

	} else {
		//всем 2/3 поровну
		p[vnuchka] = myf.reduce_fraction(2,3*vnuchka_num)
	 	p[vnuchka].push(vnuchka_num)
	 	ost = 1
	 	common_d = 3
		text += ` При отсутствии дочери внучки наследуют обязательную часть в 2/3. Они делят свою долю поровну и получают по ${p[vnuchka][0]}/${p[vnuchka][1]}. \n`
	}

} else if (vnuchka_num==1 && !vnuk_num) { //убрал условие ost>0, так как у 1 внучки своя обяз доля

	if (Object.keys(p).length === 0 && p.constructor === Object) {
		ost = 1
		common_d = 1
	}
		if (ans.d>2) {
		text += ` Внучка не является наследницей, так как дочерей две либо больше. \n`
	} else if (ans.d == 1) {
		//1/6 
		p[vnuchka] = [1,6,1]
		text += ` Внучка наследует обязательную часть в 1/6, так как осталась одна дочь. Их совместная доля в сумме дает 2/3. \n`
		var helpi = myf.subtract1_6(ost,common_d)
		ost = helpi[0]
		common_d = helpi[1]
		
	} else {
		//1/2
		p[vnuchka] = [1,2,1]
		text += ` Внучка наследует 1/2 [обязательную часть], наподобие одной дочери. \n`
		ost = 2 * ost - common_d
		common_d *= 2
	}

}

//если остаток принадлежит отцу:
if (p.f) {
	if (p.f[2]==1 && ans.nishod_m==0) {//отец еще не получил долю и должен получить остаток
		if (p.f[0]==0 && p.f[2]==1){ 
			p.f[0] = ost
			p.f[1] = common_d
		} else if (p.f[0]==1 && p.f[2]==1) {//отец получил 1/6 и должен получить остаток
			p.f = myf.dad1_6(ost,common_d)
		} 
	}
}

//единоутробные братья/сестры
//Считаем раньше братьев и сестер
if ((ans.voshod+ans.nishod_f+ans.nishod_m) == 0 && ans.eu) {
	if (ans.eu == 1) {
		p.eu = [1,6,1]
		text += ` Единоутробный/ая брат/сестра наследует обязательную долю 1/6.\n`
		var helpi = myf.subtract1_6(ost,common_d)
		ost = helpi[0]
		common_d = helpi[1]

	} else {
		p.eu = [1,3*ans.eu,ans.eu]
		text += ` Группа единоутробных братьев/сестёр наследуют обязательную долю 1/3, делят её поровну. При этом каждый из них получает по ${p.eu[0]}/${p.eu[1]}.\n`
		var helpi = myf.subtract1_3(ost,common_d)
		ost = helpi[0]
		common_d = helpi[1]

	}
}

if (ost == 0 && (ans.br || ans.sis) && ans.eu>=2) {
	text += ` Ханафиты и ханбалиты решили, что родной брат в этом случае ничего не получает.`
	text += ` Ниже приведен расчет именно для такого случая. `
	text +=  `Маликиты и шафииты пришли к выводу, что родной брат приравнивается к единоутробному и становится с единоутробными братьями соучастником в наследовании.`
	text +=	` Вы можете обратиться за подробной консультацией на сайт unilawyers.ru. \n`
}



//вставляем родных братьев и сестер при отсутствии дочерей(и)
if (ost && ans.nishod_m == 0 || (Object.keys(p).length === 0 && p.constructor === Object)) {

	if (Object.keys(p).length === 0 && p.constructor === Object) {
		ost = 1
		common_d = 1
	}


	if (ans.br && ans.sis){
		var parts_br_sis = 2 * ans.br + ans.sis

		p.br = [2*ost,common_d*parts_br_sis,ans.br] //каждый брат
		p.sis = [ost,common_d*parts_br_sis, ans.sis]   //каждая сестра


		p.br = myf.reduce_fraction(p.br[0], p.br[1])
		p.br.push(ans.br)
		p.sis = myf.reduce_fraction(p.sis[0], p.sis[1])
		p.sis.push(ans.sis)

		if (ans.br > 1 && ans.sis > 1) {
			str = myf.num_to_word_man(ans.br)
			str = str[0].toUpperCase() + str.slice(1)
			text += ` Отсутствуют наследники мужского пола восходящего (усуль) и нисходящего (фуру‘) родства. ${str} родных братьев наследуют конечную долю в ${p.br[0]}/${p.br[1]} каждый, что в два раза больше доли сестёр ${p.sis[0]}/${p.sis[1]}.\n`
		} else if (ans.br > 1) {
			text += ` Отсутствуют наследники мужского пола восходящего (усуль) и нисходящего (фуру‘) родства. Каждый из ${myf.num_to_tvorit(ans.br)} родных братьев наследует остаток наследства по ${p.br[0]}/${p.br[1]}. Родная сестра наследует совместно с родными братьями и получает ${p.sis[0]}/${p.sis[1]}.\n`
		} else if (ans.sis > 1) {
			text += ` Отсутствуют наследники мужского пола восходящего (усуль) и нисходящего (фуру‘) родства. Родной брат наследует ${p.br[0]}/${p.br[1]}. Каждая из ${myf.num_to_tvorit(ans.sis)} родных сестёр наследует ${p.sis[0]}/${p.sis[1]} совместно с родным братом остаток наследства, получая в два раза меньше своего брата.\n`
		} else {
			text += ` Отсутствуют наследники мужского пола восходящего (усуль) и нисходящего (фуру‘) родства. Родной брат наследует ${p.br[0]}/${p.br[1]}. Родная сестра наследует ${p.sis[0]}/${p.sis[1]} совместно с родным братом остаток наследства, получая в два раза меньше своего брата.\n`
		}

//
	} else if (ans.br) {
		p.br = myf.reduce_fraction(ost, common_d*ans.br)
		p.br.push(ans.br)

		if (ans.br == 1) {
			text += ` Отсутствуют наследники мужского пола восходящего (усуль) и нисходящего (фуру‘) родства. Родной брат наследует ${p.br[0]}/${p.br[1]}, т.е. остаток наследства.\n`
		} else {
			str = myf.num_to_word_common(ans.br)
			str = str[0].toUpperCase() + str.slice(1)
			text += ` Отсутствуют наследники мужского пола восходящего (усуль) и нисходящего (фуру‘) родства. ${str} родных брата делят поровну остаток наследства. Каждый получает по ${p.br[0]}/${p.br[1]}.\n`
		}

	} else if (ans.sis && ans.nishod_f) {
		//неважно, сколько сестер, коль скоро есть дочь
		//есть дочери и тогда сестра получает остаток
//!!! после внучек делим между сестрами
//17 март 2019		
		p.sis = [ost,common_d*ans.sis,ans.sis]
		myf.reduce_fraction(p.sis)
		p.sis = myf.reduce_fraction(p.sis[0],p.sis[1])
		p.sis.push(ans.sis)

		ost = 0
		

		if (ans.sis == 1) {
			text += ` Отсутствуют наследники мужского пола восходящего (усуль) и нисходящего (фуру‘) родства. Сестра наследует остаток наследства, а именно ${p.sis[0]}/${p.sis[1]}.\n`
		} else {
			str = myf.num_to_word_female(ans.sis)
			str = str[0].toUpperCase() + str.slice(1)
			text += ` Отсутствуют наследники мужского пола восходящего (усуль) и нисходящего (фуру‘) родства. ${str} cестры наследуют остаток наследства, при этом каждая получает ${p.sis[0]}/${p.sis[1]}.\n`			
		}
	} else if (ans.sis && !ans.nishod_f) {
		//если нет дочери, то получае(ю)т как дочь
		if (ans.sis == 1) {//одна сестра получает 1/2
			p.sis = [1,2,1]
			text += ` Отсутствуют наследники мужского пола восходящего (усуль) и нисходящего (фуру‘) родства. Сестра наследует половину (1/2) наследства.\n`
			if (common_d%2==0) { //если общий знаменатель четный
				p.sis = [common_d/2,common_d,1]
				ost -= p.sis[0] //....
			} else if (common_d%2==1) {
				p.sis = [common_d,2*common_d,1]
				ost = 2 * ost - common_d
				common_d *= 2
			}

		} else if (ans.sis >= 2) { //две и более сестёр вместе получают 2/3
			str = myf.num_to_word_female(ans.sis)
			str = str[0].toUpperCase() + str.slice(1)
			text += ` Отсутствуют наследники мужского пола восходящего (усуль) и нисходящего (фуру‘) родства. ${str} сестры наследодателя делят поровну 2/3 наследства между собой.`
			p.sis = myf.reduce_fraction(2,3*ans.sis)
			p.sis.push(ans.sis)
			text += ` При этом каждая из них получает ${p.sis[0]}/${p.sis[1]}.\n`
			ost -= p.sis[0]*ans.sis
		}
	}
}

//Единокровный брат допускается к наследованию при отсутствии восходящего и нисходящего родства мужского пола, а также при от- сутствии родного брата и родной сестры40, которая наследует оста- ток зависимо от дочерей (та‘сиб ма‘а аль-гайр). 
//Единокровные спрашивались, когда убедились, что родных братьев и сестер нет
//Поэтому убираем условие [&& (ans.nishod_m+ans.voshod) == 0 && !ans.br && !ans.sis]
if (ost || (Object.keys(p).length === 0 && p.constructor === Object)) {
	//ans.ekbr
	//ans.eksis
	if (Object.keys(p).length === 0 && p.constructor === Object) {
		ost = 1
		common_d = 1
	}

	if (ans.ekbr && ans.eksis) {

		var parts_ek_br_sis = 2 * ans.ekbr + ans.eksis

		p.ekbr = [2*ost,common_d*parts_ek_br_sis,ans.ekbr] //каждый брат
		p.eksis = [ost,common_d*parts_ek_br_sis, ans.eksis]   //каждая сестра


		p.ekbr = myf.reduce_fraction(p.ekbr[0], p.ekbr[1])
		p.ekbr.push(ans.ekbr)
		p.eksis = myf.reduce_fraction(p.eksis[0], p.eksis[1])
		p.eksis.push(ans.eksis)

		if (ans.ekbr > 1 && ans.eksis > 1) {
			str = myf.num_to_word_man(ans.ekbr)
			str = str[0].toUpperCase() + str.slice(1)
			text += ` ${str} единокровных братьев наследуют ${p.ekbr[0]}/${p.ekbr[1]}, что в два раза больше доли единокровных сестёр ${p.eksis[0]}/${p.eksis[1]}. \n`
		} else if (ans.ekbr > 1) {
			text += ` Каждый из ${myf.num_to_tvorit(ans.ekbr)} единокровных братьев наследует остаток наследства и получает по ${p.ekbr[0]}/${p.ekbr[1]}. Единокровная сестра наследует совместно с единокровными братьями и получает ${p.eksis[0]}/${p.eksis[1]}.\n`
		} else if (ans.eksis > 1) {
			text += ` Единокровный брат наследует ${p.ekbr[0]}/${p.ekbr[1]}. Каждая из ${myf.num_to_tvorit(ans.eksis)} единокровных сестёр наследует ${p.eksis[0]}/${p.eksis[1]} совместно с единокровным братом остаток наследства, получая в два раза меньше него.\n`
		} else {
			text += ` Единокровный брат наследует ${p.ekbr[0]}/${p.ekbr[1]}. Единокровная сестра наследует ${p.eksis[0]}/${p.eksis[1]} совместно с единокровным братом остаток наследства, получая в два раза меньше него.\n`
		}


	} else if (ans.ekbr) {
		p.ekbr = myf.reduce_fraction(ost, common_d*ans.ekbr)
		p.ekbr.push(ans.ekbr)

		if (ans.ekbr == 1) {
			text += ` Единокровный брат наследует ${p.ekbr[0]}/${p.ekbr[1]}, т.е. остаток наследства.\n`
		} else {
			str = myf.num_to_word_common(ans.ekbr)
			str = str[0].toUpperCase() + str.slice(1)
			text += ` ${str} единокровных брата делят поровну остаток наследства. Каждый получает по ${p.ekbr[0]}/${p.ekbr[1]}.\n`
		}
	} 
	else if (ans.eksis && !ans.sis && ans.d) {

		p.eksis = [ost,common_d*ans.eksis,ans.eksis]
		myf.reduce_fraction(p.eksis)
		p.eksis = myf.reduce_fraction(p.eksis[0],p.eksis[1])
		p.eksis.push(ans.eksis)

		ost = 0
		if (ans.eksis == 1) {
			text += ` Единокровная сестра наследует остаток, так как существует наследница нисходящего родства (дочь) и отсутствует родная сестра, которая могла бы получить остаток. Она получает ${p.eksis[0]}/${p.eksis[1]}.\n`
		} else {
			str = myf.num_to_word_female(ans.eksis)
			str = str[0].toUpperCase() + str.slice(1)
			text += ` ${str} единокровные сестры делят поровну между собой остаток наследства, так как существует наследница нисходящего родства (дочь) и отсутствует родная сестра, которая могла бы получить остаток. Каждая из них получает ${p.eksis[0]}/${p.eksis[1]}.\n`			
		}



	} 
	else if (ans.eksis && !ans.sis) {
		//если нет родной сестры и дочери, то получае(ю)т как дочь
		if (ans.eksis == 1) {//одна ек.сестра получает 1/2
			p.eksis = [1,2,1]
			text += ` Единокровная сестра наследует половину (1/2) наследства.\n`
			if (common_d%2==0) { //если общий знаменатель четный
				p.eksis = [common_d/2,common_d,1]
				ost -= p.eksis[0] //....
			} else if (common_d%2==1) {
				p.eksis = [common_d,2*common_d,1]
				ost = 2 * ost - common_d
				common_d *= 2
			}

		} else if (ans.eksis >= 2) { //две и более единокровных сестёр вместе получают 2/3
			str = myf.num_to_word_female(ans.eksis)
			str = str[0].toUpperCase() + str.slice(1)
			text += ` ${str} единокровные сёстры наследодателя делят поровну между собой 2/3 наследства.`
			p.eksis = myf.reduce_fraction(2,3*ans.eksis)
			p.eksis.push(ans.eksis)
			text += ` При этом каждая из них получает ${p.eksis[0]}/${p.eksis[1]}.\n`
			ost -= p.eksis[0]*ans.eksis
		}
	} else if (ans.eksis && ans.sis == 1) {
		//если одна родная сестра, то единокровная получает 1/6
		p.eksis = [1,6*ans.eksis,ans.eksis]


		helpi = myf.subtract1_6(ost,common_d)
		ost = helpi[0]
		common_d = helpi[1]

		p.eksis = myf.reduce_fraction(p.eksis[0],p.eksis[1])
		p.eksis.push(ans.eksis)

		if (ans.eksis == 1) {
			text += ` Единокровная сестра наследует обязательную часть в 1/6 наследства.\n`
		} else {
			str = myf.num_to_word_female(ans.eksis)
			str = str[0].toUpperCase() + str.slice(1)
			text += ` ${str} единокровных cестёр наследуют обязательную часть в 1/6, при этом каждая получает ${p.eksis[0]}/${p.eksis[1]}.\n`
		}
	} else if (ans.eksis && ans.sis > 1) {
		if (ans.eksis == 1) {
			text += ` Единокровная сестра не является наследницей, так как родных сестёр больше одной.\n`
		} else {
			text += ` Единокровные сёстры не являются наследницами, так как родных сестёр больше одной.\n`
		}
	}


	if (ost && ans.bok) {
		p.bok = [ost,common_d]
		text += ` Боковой элемент наследует конечную долю в размере ${p.bok[0]}/${p.bok[1]}.\n`
	}

}


var help_ren = myf.renorming(p,text)
p = help_ren[0]
text = help_ren[1]

//парсим бабушек
for (i in p){ 
	if (i.indexOf(',') > -1) { //парсим бабушек
			var parsed_gm = i.split(',')
			for (var j=0; j<parsed_gm.length; j++) {
				p[parsed_gm[j]] = [p[i][0],p[i][1]*parsed_gm.length,1]
			}
	delete p[i]
	}
}

}
//в самом конце:

text += ` <b>В итоге:</b> \n`
var roles
for (i in p){
	if (i == 'sp') {
		if (ans.sex == 0) {
			roles = 'муж'
		} else {
			roles = 'жена'
		}
		text += `${roles}: ${Math.round(p[i][0]/p[i][1]*10000)/100}% \n`
	} else {
		roles = myf.roles_to_words(i)
		if (p[i][2]>1){
			for (var j=0; j<p[i][2]; j++){
				text += `${roles} №${j+1}: ${Math.round(p[i][0]/p[i][1]*10000)/100}% \n`
			}
		} else {
			text += `${roles}: ${Math.round(p[i][0]/p[i][1]*10000)/100}% \n`
		}
	}
}

return text

	
} //func fininshing
} //module fin