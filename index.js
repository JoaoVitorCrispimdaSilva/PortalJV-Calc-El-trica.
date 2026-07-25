const tabelaNeoenergia = [
    { categoria: 'M2', demandaMin: 0, demandaMax: 10, sistema: 'Monofásico', disjuntor: '40 A', ramalConexao: '6+6 CU CONC ou 10+10 AL CONC', ramalEntrada: '6/6 CU XLPE/HEPR', ramalDistribuicao: '6/6/6 CU XLPE/HEPR' },
    { categoria: 'M3', demandaMin: 10.1, demandaMax: 15, sistema: 'Monofásico', disjuntor: '63 A', ramalConexao: '10+10 CU CONC ou 16+16 AL CONC', ramalEntrada: '16/16 CU XLPE/HEPR', ramalDistribuicao: '16/16/16 CU XLPE/HEPR' },
    { categoria: 'T6', demandaMin: 15.1, demandaMax: 21, sistema: 'Trifásico', disjuntor: '32 A', ramalConexao: '3x10+10 AL MULT', ramalEntrada: '3x6/6 CU XLPE/HEPR', ramalDistribuicao: '3x6/6 CU XLPE/HEPR' },
    { categoria: 'T7', demandaMin: 21.1, demandaMax: 26, sistema: 'Trifásico', disjuntor: '40 A', ramalConexao: '3x10+10 AL MULT', ramalEntrada: '3x6/6 CU XLPE/HEPR', ramalDistribuicao: '3x10/10/10 CU XLPE/PVC' },
    { categoria: 'T8', demandaMin: 26.1, demandaMax: 33, sistema: 'Trifásico', disjuntor: '50 A', ramalConexao: '3x16+16 AL MULT', ramalEntrada: '3x10/10 CU XLPE/HEPR', ramalDistribuicao: '3x10/10/10 CU XLPE/PVC' },
    { categoria: 'T9', demandaMin: 33.1, demandaMax: 40, sistema: 'Trifásico', disjuntor: '63 A', ramalConexao: '3x16+16 AL MULT', ramalEntrada: '3x16/16 CU XLPE/HEPR', ramalDistribuicao: '3x16/16/16 CU XLPE/HEPR' },
    { categoria: 'T10', demandaMin: 40.1, demandaMax: 52, sistema: 'Trifásico', disjuntor: '80 A', ramalConexao: '3x25+25 AL MULT', ramalEntrada: '3x25/25 CU XLPE/HEPR', ramalDistribuicao: '3x25/25/25 CU XLPE/HEPR' }
];

document.addEventListener('DOMContentLoaded', () => {
    criarCamposComodos();
    document.getElementById('calcular').addEventListener('click', calcularProjeto);
    document.getElementById('calcularArea').addEventListener('click', calcularAreaConstruida);
    document.getElementById('limparArea').addEventListener('click', limparArea);
    document.querySelectorAll('.aba').forEach((aba) => aba.addEventListener('click', () => abrirAba(aba.dataset.aba)));
    document.querySelectorAll('[data-aba]').forEach((botao) => {
        if (!botao.classList.contains('aba')) botao.addEventListener('click', () => abrirAba(botao.dataset.aba));
    });
});

function abrirAba(nome) {
    document.querySelectorAll('.aba').forEach((aba) => aba.classList.toggle('ativa', aba.dataset.aba === nome));
    document.querySelectorAll('.painel').forEach((painel) => painel.classList.toggle('ativo', painel.id === `painel-${nome}`));
}

function criarCamposComodos() {
    const lista = document.getElementById('listaComodos');
    for (let numero = 1; numero <= 12; numero += 1) {
        const comodo = document.createElement('article');
        comodo.className = 'comodo';
        comodo.innerHTML = `
            <h3>Cômodo ${numero}</h3>
            <div class="medidas">
                <label for="lado-menor-${numero}">Lado menor (m)<input type="number" id="lado-menor-${numero}" min="0" step="any" inputmode="decimal" data-comodo="${numero}"></label>
                <label for="lado-maior-${numero}">Lado maior (m)<input type="number" id="lado-maior-${numero}" min="0" step="any" inputmode="decimal" data-comodo="${numero}"></label>
            </div>
            <p class="area-comodo">Área: <span id="area-comodo-${numero}">0,00 m²</span></p>`;
        lista.appendChild(comodo);
    }
    lista.addEventListener('input', calcularAreaConstruida);
}

function calcularAreaConstruida() {
    let total = 0;
    for (let numero = 1; numero <= 12; numero += 1) {
        const ladoMenor = Number(document.getElementById(`lado-menor-${numero}`).value) || 0;
        const ladoMaior = Number(document.getElementById(`lado-maior-${numero}`).value) || 0;
        const area = ladoMenor * ladoMaior;
        total += area;
        document.getElementById(`area-comodo-${numero}`).textContent = `${formatar(area)} m²`;
    }
    document.getElementById('areaConstruida').textContent = `${formatar(total)} m²`;
}

function limparArea() {
    document.querySelectorAll('#listaComodos input').forEach((campo) => { campo.value = ''; });
    calcularAreaConstruida();
}

function calcularTomadas(area) { if (area < 6) return 1; if (area <= 10) return 2; if (area <= 20) return 3; if (area <= 30) return 4; if (area <= 40) return 5; if (area <= 50) return 6; return Math.ceil(area / 10); }
function calcularTomadasCozinha(area) { if (area <= 15) return 1; if (area <= 30) return 2; return 3; }
function calcularIluminacao(comodos) { return comodos * 100; }
function calcularTUG(area) { return (calcularTomadas(area) * 100) + (calcularTomadasCozinha(area) * 600); }
function calcularCarga(iluminacao, tug, tue) { return (iluminacao + tug + tue) / 1000; }
function buscarCategoria(valor) { return tabelaNeoenergia.find((item) => valor >= item.demandaMin && valor <= item.demandaMax) || null; }
function formatar(valor) { return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function mostrar(id, valor) { document.getElementById(id).textContent = valor; }

function calcularProjeto() {
    const area = Number(document.getElementById('area').value);
    const comodos = Number(document.getElementById('comodos').value);
    const tue = Number(document.getElementById('tue').value);
    if (Number.isNaN(area) || area <= 0) return alert('Informe uma área válida.');
    if (Number.isNaN(comodos) || comodos <= 0) return alert('Informe a quantidade de cômodos.');
    if (Number.isNaN(tue) || tue < 0) return alert('Informe uma potência de TUE válida.');
    const tomadas = calcularTomadas(area);
    const iluminacao = calcularIluminacao(comodos);
    const tug = calcularTUG(area);
    const carga = calcularCarga(iluminacao, tug, tue);
    const dados = buscarCategoria(carga);
    if (!dados) return alert('Carga fora da tabela disponível.');
    mostrar('tomadas', tomadas);
    mostrar('iluminacao', `${iluminacao} W`);
    mostrar('tug', `${tug} W`);
    mostrar('tueResultado', `${tue} W`);
    mostrar('carga', `${formatar(carga)} kW`);
    mostrar('categoria', dados.categoria);
    mostrar('sistema', dados.sistema);
    mostrar('disjuntor', dados.disjuntor);
    mostrar('ramalConexao', dados.ramalConexao);
    mostrar('ramalEntrada', dados.ramalEntrada);
    mostrar('ramalDistribuicao', dados.ramalDistribuicao);
}