module.exports = {
	dad1_6(a,b){
		if (b%6 == 0) {	
			return [b/6 + a, b]
		} else if (b%2 == 0) {
			return [b/2+3*a,b*3]
		} else if (b%3 == 0) {
			return [b/3+2*a,b*2]
		} else {
			return [b+6*a,b*6]
		}
	},
	
	subtract1_6(a,b){
		if (b%6 == 0) {	
			return [a - b/6, b]
		} else if (b%2 == 0) {
			return [3*a-b/2,b*3]
		} else if (b%3 == 0) {
			return [2*a-b/3,b*2]
		} else {
			return [6*a-b,b*6]
		}
	},

	subtract1_3(a,b){
		if (b%3 == 0) {	
			return [a - b/3, b]
		} else {
			return [3*a-b,b*3]
		}
	},

	num_to_word_common(n){
		switch(n) {
			case 1:
				return 'один'
			case 2:
				return 'два'
			case 3:
				return 'три'
			case 4:
				return 'четыре'
			case 5:
				return 'пять'
			case 6:
				return 'шесть'
			case 7:
				return 'семь'
			case 8:
				return 'восемь'
			case 9:
				return 'девять'
		}
	},

	num_to_word_man(n){
		switch(n) {
			case 1:
				return 'один'
			case 2:
				return 'двое'
			case 3:
				return 'трое'
			case 4:
				return 'четверо'
			case 5:
				return 'пятеро'
			case 6:
				return 'шестеро'
			case 7:
				return 'семеро'
			case 8:
				return 'восемь'
			case 9:
				return 'девять'
		}
	},

	num_to_word_female(n){
		switch(n) {
			case 1:
				return 'одна'
			case 2:
				return 'две'
			case 3:
				return 'три'
			case 4:
				return 'четыре'
			case 5:
				return 'пять'
			case 6:
				return 'шесть'
			case 7:
				return 'семь'
			case 8:
				return 'восемь'
			case 9:
				return 'девять'
		}
	},


	num_to_tvorit(n){
		switch(n) {
			case 1:
				return ''
			case 2:
				return 'двоих'
			case 3:
				return 'троих'
			case 4:
				return 'четверых'
			case 5:
				return 'пятерых'
			case 6:
				return 'шестерых'
			case 7:
				return 'семерых'
			case 8:
				return 'восьмерых'
			case 9:
				return 'девятерых'
		}
	},

	roles_to_words(w){	
		switch(w) {
			case 'm':
				return 'мать'
			case 'f':
				return 'отец'
			case 's':
				return 'сын'
			case 'd':
				return 'дочь'
			case 'gd':
				return 'дед (отец отца)'
			case 'ggd':
				return 'прадед (отец отца отца)'
			case 'gggd':
				return 'прапрадед (отец отца отца отца)'
			case 'gs':
				return 'внук (сын сына)'
			case 'ggs':
				return 'правнук (сын сына сына)'
			case 'gggs':
				return 'праправнук (сын сына сына сына)'
			case 'gda':
				return 'внучка (дочь сына)'
			case 'ggda':
				return 'правнучка (дочь сына сына)'
			case 'gggda':
				return 'праправнучка (дочь сына сына сына)'
			case 'br':
				return 'родной брат'
			case 'sis':
				return 'родная сестра'
			case 'ekbr':
				return 'единокровный брат'
			case 'eksis':
				return 'единокровная сестра'
			case 'eu':
				return 'единоутробный брат/сестра'
			case 'gmf':
				return 'бабушка (мать отца)'
			case 'gmm':
				return 'бабушка (мать матери)'
			case 'gmff':
				return 'бабушка (мать отца отца)'
			case 'gmmf':
				return 'бабушка (мать матери отца)'
			case 'gmmm':
				return 'бабушка (мать матери матери)'
			case 'bok':
				return 'боковой элемент'
		}
	},
	//returns maximum possible devisor for given array of denomenators
	max_poss_dev(a){
		var min_d = Math.min(...a)
		var m = a.length
		var reminders = []
		var common_denominator // common devisor
		var summ_r // sum of reminders when i is divided by denoms[j]
		var max_poss_dev //maximum possible devisor
		max_poss_dev = 1
		for (var j = 0; j < m; j++) {
			max_poss_dev *= a[j]
		}
		for (var i = min_d; i <= max_poss_dev; i++){
			reminders = []
			for (var j = 0; j < m; j++) {
				reminders.push(i%a[j])
			}
			summ_r = 0
			for (var j = 0; j < m; j++) {
				summ_r += reminders[j]
			}
			if (summ_r == 0){
				common_denominator = i
				break
			}
		}
		return common_denominator
	},


	reduce_fraction(a,b) {
		for (var i=a; i>1; i--){
			if (a%i==0) {
				if (b%i==0) {
					return [a/i, b/i]
				}

			}
		}
		return [a,b]
	},

	renorming(p, text){
		//11 марта 2019
		//малые доли
		//перерасчет с вычетом мужа
		var summ_all = 0
		denoms = []
		for (i in p){
	//		console.log(p[i])
			denoms.push(p[i][1])
		}
		var n = denoms.length
		var common_d = this.max_poss_dev(denoms)
//		console.log('COMMON D ',common_d)

		var factors = []
		for (var j = 0; j < n; j++) {
			factors.push(common_d/denoms[j])
		}
//		console.log('FACTORS ',factors)


		var summ_all = 0
		var count = 0
		for (i in p) {
			summ_all += factors[count]*p[i][0]*p[i][2]
	//		console.log('summ_all ', factors[count]*p[i][0]*p[i][2])
			count += 1
		}


		var ost = common_d - summ_all
	//	console.log('OST', ost)
	//	console.log('OST p', p)

		//если остаток меньше нуля, значит надо увеличивать общий знаменатель
		if (ost < 0) {
			text += ` Так как сумма всех обязательных долей больше 1, необходимо уменьшение долей ('ауль) каждого. Это приводит к новому общему знаменателю ${summ_all} вместо ${common_d}.\n`
			common_d = summ_all
			count = 0
			for (i in p){
				p[i][0] = factors[count]*p[i][0] //*p[i][2]
				p[i][1] = summ_all
				count += 1
			}

		} else if (ost > 0) {
			text += ` Так как сумма всех обязательных долей меньше 1, и нет наследователей, которые получают остаток, перераспределяем доли с новым общим знаменателем ${summ_all} вместо ${common_d}.\n`
			if (p.sp) {
				text += `(за вычетом доли супруга[и]) \n`
				ost = common_d - p.sp[0] //это новый остаток после того, как из 1 вычли долю супруга
	//			console.log('ПЕРЕД ОБЩ ЗНАМ ost', ost)
			} else {
				ost = common_d
			}

			summ_all = 0 //и новый summ_all - сумма всех долей без супруга

	//делаем одинаковый знаменатель
			count = 0
			for (i in p) {
				if (i != 'sp') {
					p[i][0] = p[i][0]*factors[count]
					p[i][1] = p[i][1]*factors[count]
				}
				count += 1
	//			console.log('ДЕЛАЕМ ОДИНАК ЗНАМ p[i]',i, factors[count], p[i])
	//			console.log('  ')
			}

	//		console.log('COMMON D ', common_d, p)
			// console.log('OST2 ', ost)
	//складываем все числители умноженные на factor
			for (i in p) {
	//			console.log(i, p[i][0], p[i][2])
				if (i != 'sp') {
					summ_all += p[i][0]*p[i][2]
				}
			}
	//		console.log('DURING RENORM ', summ_all)


			for (i in p) {
				if (i != 'sp') {
					p[i][0] = p[i][0]*ost
	//				p[i][0] = p[i][0]*ost
					p[i][1] = p[i][1]*summ_all
				}
			}
	//		console.log('DURING RENORM DENOM ',p)

	//		console.log([ost, summ_all])
		}
	//если остаток больше нуля, то надо убирать долю супруга и перерасчитывать по остальным

	return [p, text]
	}


}
