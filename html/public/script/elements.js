//elements

var E = {

	unitH: 52,
	margin: { top: 50, right: 20, bottom: 50, left: 200, more: 30 },

	movieR: 8,
	barW: 6,

	color: {
		movie: '#000',
		career: '#cc0000',
		'career-text'	: '#cc0000',
		age: '#00cc00',
		'age-text': '#00cc00',
		birth: '#000',
		death: '#000',
		'death-v': '#000',
		'death-h': '#000',
		won: '#0000cc',
		nominated: '#999',
		chevron: '#333'
	},

	stroke: {
		age: 6,
		career: 6,
		'death-h': 3,
		'death-v': 3
	},

	chevron: function() {
		return {
			open: 'M -4 ' + (this.unitH/2 - 2) + ' h -10 l 5 6 z',
			close: 'M -4 ' + (this.unitH/2 + 2) + ' h -10 l 5 -6 z'
		};
	}
};
