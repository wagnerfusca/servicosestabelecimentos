const app = function () {
	const API_BASE = 'https://script.google.com/macros/s/AKfycbw5OA_1ISlZa9wflRQZCsKC3B9j7Scl3m3cw8u7HAdaOnKTKod1pSDHQLCUOp4cVcZx/exec';
	const API_KEY = 'servicosestabelecimentos';
	const CATEGORIES = {
		'Todos': {name: 'Todos', color: '#000'},
		'Academia e Personal Trainer': {name: 'Academia e Personal Trainer', color: '#bfa719'},
		'Alimentos, bebidas e gás': {name: 'Alimentos, bebidas e gás', color: '#18b1fc'},
		'Ar condicionado': {name: 'Ar condicionado', color: '#e34000'},
		'Assistência técnica': {name: 'Assistência técnica', color: '#3b987d'},		
		'Cabelo, Unha e Salão de Beleza': {name: 'Cabelo, Unha e Salão de Beleza', color: '#972E18'},
		'Carros e motos (vendas)': {name: 'Carros e motos (vendas)', color: '#B7E533'},
		'Casa (pintura, gesso, eletricista, encanador, reforma, construção, energia solar)': {name: 'Casa (pintura, gesso, eletricista, encanador, reforma, construção, energia solar)', color: '#576098'},
		'Consórcios': {name: 'Consórcios', color: '#585E7E'},
		'Consultoria (coach, processos, negócios)': {name: 'Consultoria (coach, processos, negócios)', color: '#2ECC71'},
		'Diarista e serviços de limpeza': {name: 'Diarista e serviços de limpeza', color: '#F50DBD'},
		'Eletrônicos (Informática, celular, tablet)': {name: 'Eletrônicos (Informática, celular, tablet)', color: '#42CFC9'},
		'Estética e Depilação': {name: 'Estética e Depilação', color: '#70295F'},
		'Frete e Motoboy': {name: 'Frete e Motoboy', color: '#1C3006'},
		'Imóveis': {name: 'Imóveis', color: '#A7CD7D'},		
		'Investimentos': {name: 'Investimentos', color: '#BCDDDB'},
		'Jóias e semi jóias': {name: 'Jóias e semi jóias', color: '#C5BCDD'},
		'Marketing (agência, mkt digital, rede social)': {name: 'Marketing (agência, mkt digital, rede social)', color: '#4F16E9'},
		'Móveis planejados': {name: 'Móveis planejados', color: '#E99C16'},
		'Odontologia': {name: 'Odontologia', color: '#876F45'},
		'Oficinas mecânicas e auto elétricas': {name: 'Oficinas mecânicas e auto elétricas', color: '#CA5D12'},
		'Pets (Veterinários, consultórios, ração)': {name: 'Pets (Veterinários, consultórios, ração)', color: '#CA128F'},
		'Plano de saúde e Seguros (vida, carro, casa)': {name: 'Plano de saúde e Seguros (vida, carro, casa)', color: '#685E64'},
		'Posto de Combustíveis': {name: 'Posto de Combustíveis', color: '#6B0FF4'},
		'Professor (idiomas, música, desenho, matemática, português, etc)': {name: 'Professor (idiomas, música, desenho, matemática, português, etc)', color: '#C6ABEF'},
		'Roupas, sapatos e brechó': {name: 'Roupas, sapatos e brechó', color: '#27C5E1'},
		'Outros': {name: 'Outros', color: '#D1F7FE'},

	};
	
	var novosDetalhesDoEvento = '';

	const state = {activeCategory: null, initialized: false};
	const page = {};

	function init () {
		page.notice = document.getElementById('notice');
		page.filter = document.getElementById('category-list');
		page.container = document.getElementById('container');
		page.alert = document.getElementById('alert');
		_buildFilter();
		_getJson();
	}

	function _setDataAtualizacao(cabecalho) {
		page.alert.innerHTML = '<div> Atualizado em: <b>'+cabecalho[14]+'</b></div>';
	}

	function _getJson () {
			$('.loading').toggle();
			fetch(_buildApiUrl(state.activeCategory))
			.then((response) => response.json())
			.then((json) => {
				if (json.status !== 'success') {
					_setNotice(json.message);
				}
				_setDataAtualizacao(json.cabecalho);
				localStorage.setItem('servicosestab', JSON.stringify(json));
				_renderEvents(json.data);
				if(!state.initialized){
					_setQtyBadges(json.data);
					state.initialized = true;
				}
				$('.loading').toggle();
			})
			.catch((error) => {
				_setNotice('Unexpected error loading events');
			})
	}

	function _setQtyBadges (events) {
		var categories = [];
		categories['Todos'] = events.length;
		events.forEach(function(event){
			const category = _getCategoryByName(event.categoria);
			if(!categories[event.categoria])
				categories[event.categoria] = 0;
			if(
				event.categoria === category.name ||
				event.categoria === category.index
			){

				categories[event.categoria] += 1;
			}
		});

		var filters = document.querySelectorAll('[data-category]');
		filters.forEach(function(filterElement){
			var cat = _getCategoryByName(filterElement.dataset.category);
			filterElement.innerHTML += `
				<span style="background-color: ${cat.color}" class="float-right badge round">
				${categories[filterElement.dataset.category] || 0}
				</span>
			`;
		});
	}

	function _buildFilter () {
		for(var prop in CATEGORIES) {
			page.filter.appendChild(_buildFilterLink(CATEGORIES[prop].name, prop, false));
		}
	}

	function _buildFilterLink (element, key, isSelected) {
		const categoryListElement = document.createElement('a');
		  categoryListElement.innerHTML = _capitalize(element);
		  categoryListElement.setAttribute('data-category', key);
		  categoryListElement.href = '#';
		  categoryListElement.classList = isSelected ? 'list-group-item active' : 'list-group-item';
		  categoryListElement.onclick = function (event) {
		  	let category = key === 'Todos' ? null : key.toLowerCase();

			_setActiveCategory(category);
			_getJson();
		  };
		  return categoryListElement;
	}

	function _buildApiUrl (category) {
		let url = API_BASE;
		url += '?key=' + API_KEY;
		url += category !== null ? '&category=' + category : '';
		return url;
	}

	function _setNotice (label) {
		page.notice.innerHTML = label;
	}

	function _setNovosDetalhesDoEvento(label){
			novosDetalhesDoEvento = '';
			if (label == 'NEW') {
				novosDetalhesDoEvento = '<img src = "new.png"/> </h2>';
			}
	}

	function _renderEvents (eventsData) {
		let eventListElement = document.getElementById('event-list');
		eventListElement.innerHTML = '';
		eventsData.forEach(function (event) {
			let linha = document.createElement('li');
			const category = _getCategoryByName(event.categoria);
			_setNovosDetalhesDoEvento(event.novo);

			linha.innerHTML = `
				
				<div class="info">
					<div class="category" style="background-color: ${category.color}">${category.name}</div>
					
					<div class="row">
						<div class="col-sm-10">
							<h2 class="title">${event.nome} ${novosDetalhesDoEvento}

						</div>
					</div>
					<div class="d-flex">
						<div class="col-xs-12 col-sm-12">
							<div class="row">
								<div class="col-sm-12">${event.descricao}</div>
							</div>
							<div class="row">
								<div class="col-sm-3 font-weight-bold">Local:</div>
								<div class="col-sm-9">${event.endereco} - ${event.cidade}</div>
							</div>
							<div class="row">
								<div class="col-sm-3 font-weight-bold">Whatsapp:</div>
								<div class="col-sm-3">${event.whatsapp}</div>
								<div class="col-sm-3 font-weight-bold"><a href="${event.instagram}" target="_blank"><span>Instagram</span></a></div>
								<div class="col-sm-3 font-weight-bold"><a href="${event.site}" target="_blank"><span>Site ou Facebook</span></a></div>
							</div>
							<div class="row">
								
							</div>
						</div>
					</div>

				</div>`;
			eventListElement.appendChild(linha);
		});
	}

	function _getCategoryByName (category) {
		const categoryIndex = Object.keys(CATEGORIES).filter(function(index){
			return CATEGORIES[index].name === category 
					|| index === category;
		});
		CATEGORIES[categoryIndex].index = categoryIndex[0];
		return CATEGORIES[categoryIndex];
	}

	function _formatString (string) {
		if(string == ''){
			return '';
		}
		return string;
	}
	function _formatLink (string) {
		if(string == ''){
			return '';
		}
		return 'Acesse o site';
	}

	function _capitalize (label) {
		return label.slice(0, 1).toUpperCase() + label.slice(1).toLowerCase();
	}

	
	function _setActiveCategory (category) {
		$('#collapseAside').removeClass('show');
		state.activeCategory = category;
		
		const label = category === null ? 'Todos' : category;
		Array.from(page.filter.children).forEach(function (element) {
			element.classList = label === element.innerHTML.toLowerCase() ? 'list-group-item active' : 'list-group-item';
	  	});
	}

	return {
		init: init
	 };
}();
