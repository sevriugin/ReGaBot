'use strict';

module.exports = {
	start : {
		name : /\/start/,
		userNotFound : "Привет, я *Янде* - бот *Яндекс.Денег*,\nПридумай защитный *пин-код*, состоящий из _4х цифр_.",
		knowUser : "Да-да?"
	},
	pin : {
		name : /^[0-9]{4}$/,
		newPin :  "Спасибо, я запомнила твой пин-код, не сообщай его незнакомым!",
		errPin : "Пин-код неверный, в случае потери пин-кода нажми на помощь, если ошибся - попытайся ввести ещё раз.",
		auth : "Пин-код верный, продолжаем!",
		form : {
			reply_markup : JSON.stringify({
				keyboard : [
					['Произвести авторизацию'],
					['Помощь ❓']
				]
			})
		}
	},
	yandexMoneyAuth : {
		name : /Произвести авторизацию/,
		notAuth : "Необходимо авторизоваться! Введи свой пин-код:",
		getToken : "Для авторизации Яндекс.Денег перейди по [ссылке]"
	},
	about_us :{
		name : /Обо мне/,
		info : "Бот Yandex Money поможет вам без труда воспользоваться услугой Яндекс.Деньги"
	},
	help : {
		name : /Помощь ❓/,
		advice : /Совет ❤️/,
		delete : /Удаление профиля ❌/,
		info : "Пожалуйста, введи свой *пин-код*. Если не помнишь пин-код, удали профиль и авторизируйся заново.",
		form : {
			parse_mode : 'Markdown',
			reply_markup : JSON.stringify({
				keyboard : [
					['Совет ❤️'],
					['Удаление профиля ❌']
				]
			})
		} 
	},
	wallet : {
		remember : /Запомни мой телефон 👔/,
		balance : /Покажи баланс 📰/,
		history : /Покажи последние операции 📋/,
		control : /Управление расходами 📊/,
		form : {
			parse_mode : 'Markdown',
			reply_markup : JSON.stringify({
				keyboard : [
					['Покажи баланс 📰','Покажи последние операции 📋'],
					['Оплатить 💵','Перевести 📩'],
					['Запомни мой телефон 👔','Управление расходами 📊']
				]
			})
		},
		start : {
            parse_mode : 'Markdown',
			reply_markup : JSON.stringify({
				keyboard : [
					['Покажи баланс 📰','Покажи последние операции 📋'],
					['Оплатить 💵','Перевести 📩'],
					['Управление расходами 📊']
				]
			})
		}
	},
	payment : {
		pay : /Оплатить 💵/,
		mobile : /Пополни телефон 📱/,
		myMobile : /Пополни мой мобильный 📲/,
		back : /Назад ↪️/,
		form : {
			reply_markup : JSON.stringify({
				keyboard : [
					['Пополни телефон 📱'],
					['Пополни мой мобильный 📲'],
					['Назад ↪️']
				]
			})
		}     
	},
	payMobile : {
			sum : /^\d{1,4}\s(руб)(ль)?(ля)?(лей)?\s?/,
			my : /^(7)\d{10}$/,
			name : /^(7)\d{10}\s((\d{1,4}))\s?$/
	},
	transfer : {
		name : /Перевести 📩/,
		anotherClient : /Перевести на карту/,
		credit : /^\d{15}\s((\d{1,4})(\s([a-zA-ZA-Яа-яё\ \,\d])+)?)/,
		form : {
			reply_markup : JSON.stringify({
				keyboard : [
					['Перевести на карту'],
					['Назад ↪️']
				]
			})
		}
	},
	expenses : {
        dontspend: /^Не потратить\sбольше\s(\d){1,6}\s?$/,
        accumulate:/^Накопить\s(\d){1,6}\s?$/,
        reach: /^Заработать\s(\d){1,6}\s?$/,
        discounts : /Покажи скидку/,
        intention: /Задать цель 🛠/,
		see : /Покажи расходы 💰/,
		form : {
			parse_mode : 'Markdown',
			reply_markup : JSON.stringify({
				keyboard : [
					['Покажи скидку', 'Задать цель 🛠'],
					['Назад ↪️']
				]
			})
		}
	},
	md: {
		parse_mode : 'Markdown',
		reply_markup : JSON.stringify({
			hide_keyboard : true
		})
	},
	hide: {
		reply_markup : JSON.stringify({
			hide_keyboard : true
		})
	}
};