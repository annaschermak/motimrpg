// =============================================
//  MOTIM — Sistema para Foundry VTT v1.3.0
//  Por Anna Schermak e Marina Sampaio — Secular Games
// =============================================

const MOTIM_CONFIG = {
  naturezas: {
    "terra_firme": { label: "Terra Firme", bonuses: { negociar: 1,  navegar: -1 } },
    "loba_do_mar": { label: "Loba do Mar", bonuses: { navegar: 1,   negociar: -1 } }
  },
  profissoes: {
    "soldada":    { label: "Soldada",    bonuses: { lutar: 1,             consertar: -1 } },
    "lutadora":   { label: "Lutadora",   bonuses: { lutar: 1,             acalmarTripulacao: -1 } },
    "taberneira": { label: "Taberneira", bonuses: { acalmarTripulacao: 1, consertar: -1 } },
    "barda":      { label: "Barda",      bonuses: { acalmarTripulacao: 1, lutar: -1 } },
    "artista":    { label: "Artista",    bonuses: { consertar: 1,         lutar: -1 } },
    "marceneira": { label: "Marceneira", bonuses: { consertar: 1,         acalmarTripulacao: -1 } }
  },
  habilidades: {
    "lutar":             { label: "Lutar",             emoji: "⚔️" },
    "negociar":          { label: "Negociar",           emoji: "💰" },
    "navegar":           { label: "Navegar",            emoji: "🧭" },
    "consertar":         { label: "Consertar",          emoji: "🔧" },
    "acalmarTripulacao": { label: "Acalmar Tripulação", emoji: "🕊️" }
  }
};

const OUTCOMES = {
  negociar: {
    vitoria:    ["+Prestígio", "+Tesouro (pela dificuldade)"],
    derrota:    ["+Estrago", "−Prestígio"],
    criticoPos: ["++Prestígio", "+Tesouro (pela dificuldade)"],
    criticoNeg: ["+Estrago", "+Motim", "−Tesouro (roubado)"]
  },
  lutar: {
    vitoria:    ["+Prestígio", "+Tesouro (pela dificuldade)"],
    derrota:    ["+Estrago", "−Prestígio"],
    criticoPos: ["++Prestígio", "+Tesouro (pela dificuldade)"],
    criticoNeg: ["+Estrago", "+Motim", "−Tesouro (roubado)"]
  },
  navegar: {
    vitoria:    ["+Navegação"],
    derrota:    ["+Estrago ou −Navegação"],
    criticoPos: ["++Navegação"],
    criticoNeg: ["+Estrago", "−Navegação"]
  },
  consertar: {
    vitoria:    ["−Estrago (reparo)"],
    derrota:    ["Não conserta"],
    criticoPos: ["−−Estrago (reparo duplo)"],
    criticoNeg: ["+Estrago", "+Motim"]
  },
  acalmar: {
    vitoria:    ["−Motim"],
    derrota:    ["Não acalma"],
    criticoPos: ["Zera Motim"],
    criticoNeg: ["+Motim"]
  }
};

const DESAFIOS = {
  ouro: {
    simbolo: "♦", nome: "Ouro", ignora: true,
    acao: "negociar", acaoLabel: "Negociar",
    perguntas: "O que você quer negociar? Seu navio tem recursos para lidar com estragos? Você tem algo para oferecer em troca? Vale a pena arriscar uma negociação?",
    cartas: {
      "A":  { titulo: "Motim!", descricao: "Algo deu errado durante a negociação e a tripulação inicia um movimento.", motim: true },
      "2":  { titulo: "Rota Comercial", dificuldade: "facil" },
      "3":  { titulo: "Rota Comercial", dificuldade: "facil" },
      "4":  { titulo: "Rota Comercial", dificuldade: "facil" },
      "5":  { titulo: "Rota Comercial", dificuldade: "medio" },
      "6":  { titulo: "Rota Comercial", dificuldade: "medio" },
      "7":  { titulo: "Rota Comercial", dificuldade: "medio" },
      "8":  { titulo: "Rota Comercial", dificuldade: "dificil" },
      "9":  { titulo: "Rota Comercial", dificuldade: "dificil" },
      "10": { titulo: "Rota Comercial", dificuldade: "dificil" },
      "J":  { titulo: "Porto Comercial Ruim", descricao: "Os preços são mais altos que o normal. Recursos custam o dobro: leve 1, pague 2.", dificuldade: "facil" },
      "Q":  { titulo: "Navio Cargueiro Virou!", descricao: "Corra para tentar pegar os recursos de graça! Role 1d6 para determinar quantos recursos você conseguiu.", especial: true, efeitos: ["rolar_recursos"] },
      "K":  { titulo: "Hoje Tem Promoção!", descricao: "Leve 2, pague 1. Recursos pela metade do preço.", dificuldade: "facil" }
    }
  },
  paus: {
    simbolo: "♣", nome: "Paus", ignora: false,
    acao: "navegar", acaoLabel: "Navegar",
    perguntas: "O clima está frio, quente, chovendo? Nevando? O mar está calmo ou agitado? Como está a visão do céu? Há estrelas? Algum farol para se orientar?",
    cartas: {
      "A":  { titulo: "Motim!", descricao: "O clima fez mudar os ânimos da tripulação.", motim: true },
      "2":  { titulo: "Clima", dificuldade: "facil" },
      "3":  { titulo: "Clima", dificuldade: "facil" },
      "4":  { titulo: "Clima", dificuldade: "facil" },
      "5":  { titulo: "Clima", dificuldade: "medio" },
      "6":  { titulo: "Clima", dificuldade: "medio" },
      "7":  { titulo: "Clima", dificuldade: "medio" },
      "8":  { titulo: "Clima", dificuldade: "dificil" },
      "9":  { titulo: "Clima", dificuldade: "dificil" },
      "10": { titulo: "Clima", dificuldade: "dificil" },
      "J":  { titulo: "Tempestade!", descricao: "Uma tempestade atravessa a noite — o barco perde estabilidade e recursos. Role 1d6 para decidir quantos recursos são perdidos. (Crítico Positivo ignora a perda.)", dificuldade: "dificil", efeitos: ["rolar_perda_recursos"] },
      "Q":  { titulo: "Dia Perfeito!", descricao: "O dia está perfeito para navegação. Não é necessário rolar Navegar para prosseguir.", especial: true, semRolagem: true },
      "K":  { titulo: "Neblina!", descricao: "Uma neblina confunde a visão — o navio bate em algo. +1 Estrago. Desafio fácil para não bater em mais pedras.", dificuldade: "facil", efeitos: ["estrago+1"] }
    }
  },
  espada: {
    simbolo: "♠", nome: "Espada", ignora: false,
    acao: "lutar", acaoLabel: "Lutar (ou Navegar para fugir)",
    perguntas: "Quem são os inimigos? São formidáveis? Que armas e estratégias iremos usar? Estamos lutando pela honra ou pelo tesouro?",
    cartas: {
      "A":  { titulo: "Motim!", descricao: "A tripulação não quer lutar — o outro navio parece muito melhor.", motim: true },
      "2":  { titulo: "Outro Navio", dificuldade: "facil" },
      "3":  { titulo: "Outro Navio", dificuldade: "facil" },
      "4":  { titulo: "Outro Navio", dificuldade: "facil" },
      "5":  { titulo: "Outro Navio", dificuldade: "medio" },
      "6":  { titulo: "Outro Navio", dificuldade: "medio" },
      "7":  { titulo: "Outro Navio", dificuldade: "medio" },
      "8":  { titulo: "Outro Navio", dificuldade: "dificil" },
      "9":  { titulo: "Outro Navio", dificuldade: "dificil" },
      "10": { titulo: "Outro Navio", dificuldade: "dificil" },
      "J":  { titulo: "Canto de Sereia", descricao: "O canto de uma sereia chama a tripulação pro fundo do mar. Nenhum Tesouro ou Prestígio — e possível dano ao barco.", dificuldade: "dificil",
              outcomesCustom: { vitoria:["+Estrago","−Prestígio"], derrota:["++Estrago","−−Prestígio"], criticoPos:["+Estrago","−Prestígio"], criticoNeg:["++Estrago","−−Prestígio"] }},
      "Q":  { titulo: "Capitã Formidável!", descricao: "Uma capitã do outro navio possui muito prestígio e está pronta para cair na briga.", dificuldade: "dificil",
              outcomesCustom: { vitoria:["++Tesouro","++Prestígio"], derrota:["++Estrago","−−Prestígio"], criticoPos:["++Tesouro","++Prestígio"], criticoNeg:["++Estrago","−−Prestígio"] }},
      "K":  { titulo: "KRAKEN!", descricao: "Um kraken ataca o navio! É um desafio difícil!", dificuldade: "dificil",
              outcomesCustom: { vitoria:["+++Prestígio"], derrota:["+++Estrago"], criticoPos:["+++Prestígio"], criticoNeg:["+++Estrago"] }}
    }
  },
  copas: {
    simbolo: "♥", nome: "Copas", ignora: true,
    acao: "consertar", acaoLabel: "Consertar ou Acalmar Tripulação",
    perguntas: "Temos estragos no navio para consertar? O que está quebrado? O que usaremos de recursos para reparar? Existe alguém te esperando em casa?",
    cartas: {
      "A":  { titulo: "Motim!", descricao: "A tripulação está exausta e não aguenta mais tanto sol e pouca cenoura.", motim: true },
      "2":  { titulo: "Rota de Reparo", dificuldade: "facil" },
      "3":  { titulo: "Rota de Reparo", dificuldade: "facil" },
      "4":  { titulo: "Rota de Reparo", dificuldade: "facil" },
      "5":  { titulo: "Rota de Reparo", dificuldade: "medio" },
      "6":  { titulo: "Rota de Reparo", dificuldade: "medio" },
      "7":  { titulo: "Rota de Reparo", dificuldade: "medio" },
      "8":  { titulo: "Rota de Reparo", dificuldade: "dificil" },
      "9":  { titulo: "Rota de Reparo", dificuldade: "dificil" },
      "10": { titulo: "Rota de Reparo", dificuldade: "dificil" },
      "J":  { titulo: "Festa das Marujas!", descricao: "A capitã saiu e as marujas tomaram conta. Uma festa acontece — todos os recursos são esgotados.", especial: true, efeitos: ["recursos=0"] },
      "Q":  { titulo: "A Barda se Inspirou!", descricao: "Uma canção acalma o coração de todas. A tripulação é acalmada e a canção é cantada em todos os mares. Zera Motim e ++Prestígio.", especial: true, semRolagem: true, efeitos: ["motim=0","prestigio+2"] },
      "K":  { titulo: "Rum de Cenoura Demais", descricao: "A tripulação está dispersa demais. Não será possível acalmar a tripulação ou reparar o navio nesta rodada.", especial: true, semRolagem: true }
    }
  }
};

// =============================================
//  HELPERS
// =============================================
function _getBonusProprio(system, habilidade) {
  const nat  = MOTIM_CONFIG.naturezas[system.natureza]  || {};
  const prof = MOTIM_CONFIG.profissoes[system.profissao] || {};
  return (nat.bonuses?.[habilidade] || 0) + (prof.bonuses?.[habilidade] || 0);
}

function _slots(value, max, track) {
  const arr = [];
  for (let i = 0; i < max; i++) arr.push({ idx: i, track, filled: i < value });
  return arr;
}

function _sinal(n) { return n >= 0 ? `+${n}` : `${n}`; }

// =============================================
//  ACTOR
// =============================================
class MotimActor extends Actor {
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.type === "pirata") {
      const s = this.system;
      s.bonusCapitaTotal = {};
      for (const key of Object.keys(MOTIM_CONFIG.habilidades)) {
        s.bonusCapitaTotal[key] = _getBonusProprio(s, key);
      }
    }
  }
  getBonusCapita(habilidade) {
    if (this.type !== "pirata") return 0;
    return _getBonusProprio(this.system, habilidade);
  }
}

// =============================================
//  FICHA DA PIRATA
// =============================================
class MotimPirataSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["motim","sheet","pirata"],
      template: "systems/motim/templates/actor-pirata-sheet.html",
      width: 500, height: 640, resizable: true
    });
  }

  getData() {
    const ctx = super.getData();
    const s   = this.actor.system;
    ctx.system = s;

    ctx.naturezas  = Object.entries(MOTIM_CONFIG.naturezas).map(([k,v]) => ({ key:k, label:v.label, selected:k===s.natureza }));
    ctx.profissoes = Object.entries(MOTIM_CONFIG.profissoes).map(([k,v]) => ({ key:k, label:v.label, selected:k===s.profissao }));

    const nat  = MOTIM_CONFIG.naturezas[s.natureza]  || {};
    const prof = MOTIM_CONFIG.profissoes[s.profissao] || {};

    // Habilidades com breakdown de bônus próprios
    ctx.habilidades = Object.entries(MOTIM_CONFIG.habilidades).map(([k,h]) => {
      const base    = s.habilidades[k]?.value ?? 0;
      const bonNat  = nat.bonuses?.[k]  || 0;
      const bonProf = prof.bonuses?.[k] || 0;
      const total   = base + bonNat + bonProf;
      return { key:k, label:h.label, emoji:h.emoji, value:base, bonNat, bonProf, total, temBonus: bonNat!==0 || bonProf!==0 };
    });

    // Bônus que esta pirata concede à tripulação como capitã
    ctx.bonusCapita = Object.entries(MOTIM_CONFIG.habilidades).map(([k,h]) => {
      const b = (nat.bonuses?.[k]||0) + (prof.bonuses?.[k]||0);
      return { key:k, label:h.label, bonus:b, str:_sinal(b), positivo:b>0, negativo:b<0 };
    }).filter(x => x.bonus !== 0);

    return ctx;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".rolar-habilidade").on("click", ev => this._rolar(ev.currentTarget.dataset.habilidade));
    html.find(".btn-toggle-capita").on("click", () => this.actor.update({ "system.ehCapita": !this.actor.system.ehCapita }));
    html.find(".item-usado-check").on("change", ev => this.actor.update({ "system.itemUsado": ev.currentTarget.checked }));
  }

  async _rolar(habilidade) {
    const s   = this.actor.system;
    const hab = MOTIM_CONFIG.habilidades[habilidade];

    // 1. Atributo distribuído pela jogadora
    const atributo = s.habilidades[habilidade]?.value ?? 0;

    // 2. Bônus próprios: natureza + profissão desta pirata
    const nat     = MOTIM_CONFIG.naturezas[s.natureza]  || {};
    const prof    = MOTIM_CONFIG.profissoes[s.profissao] || {};
    const bonNat  = nat.bonuses?.[habilidade]  || 0;
    const bonProf = prof.bonuses?.[habilidade] || 0;

    // 3. Bônus da Capitã (natureza + profissão dela, se houver capitã ativa)
    const capita      = game.actors.find(a => a.type==="pirata" && a.system.ehCapita && a.id!==this.actor.id);
    const bonusCapita = capita ? capita.getBonusCapita(habilidade) : 0;

    // Total
    const totalBonus = atributo + bonNat + bonProf + bonusCapita;
    const formula    = `2d6 + (${totalBonus})`;

    const roll = new Roll(formula);
    await roll.evaluate();

    const total = roll.total;
    const d1    = roll.dice[0].results[0].result;
    const d2    = roll.dice[0].results[1].result;

    // Resultado
    let rClass = "", rTexto = "";
    if      (d1===1 && d2===1)   { rClass="critico-negativo"; rTexto="💀 Crítico Negativo"; }
    else if (d1===6 && d2===6)   { rClass="critico-positivo"; rTexto="⭐ Crítico Positivo"; }
    else if (total >= 12)        { rClass="vitoria"; rTexto="✅ Vitória — Desafio DIFÍCIL"; }
    else if (total >= 8)         { rClass="vitoria"; rTexto="✅ Vitória — Desafio MÉDIO"; }
    else if (total >= 4)         { rClass="vitoria"; rTexto="✅ Vitória — Desafio FÁCIL"; }
    else                         { rClass="derrota"; rTexto="❌ Derrota"; }

    // Breakdown detalhado no chat
    const linhas = [];
    linhas.push(`<div class="bl">Atributo: <strong>${_sinal(atributo)}</strong></div>`);
    if (bonNat  !== 0) linhas.push(`<div class="bl">${nat.label  || "Natureza"}: <strong>${_sinal(bonNat)}</strong></div>`);
    if (bonProf !== 0) linhas.push(`<div class="bl">${prof.label || "Profissão"}: <strong>${_sinal(bonProf)}</strong></div>`);
    if (bonusCapita !== 0 && capita) linhas.push(`<div class="bl bl-capita">Capitã ${capita.name}: <strong>${_sinal(bonusCapita)}</strong></div>`);
    linhas.push(`<div class="bl bl-total">Total: <strong>${_sinal(totalBonus)}</strong></div>`);

    const tesouro = (total>=12||(d1===6&&d2===6)) ? "💎💎💎" : total>=8 ? "💎💎" : total>=4 ? "💎" : "";

    const flavor = `
      <div class="motim-chat-roll">
        <div class="chat-header">
          <span class="chat-pirata">${this.actor.name}</span> rola
          <span class="chat-hab">${hab.emoji} ${hab.label}</span>
        </div>
        <div class="chat-breakdown">${linhas.join("")}</div>
        <div class="chat-resultado ${rClass}">
          <span class="chat-total">${total}</span>
          <span class="chat-texto">${rTexto}</span>
        </div>
        ${tesouro ? `<div class="chat-tesouro">Tesouro possível: <strong>${tesouro}</strong></div>` : ""}
      </div>`;

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor,
      rollMode: game.settings.get("core","rollMode")
    });
  }
}

// =============================================
//  FICHA DO NAVIO
// =============================================
class MotimNavioSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["motim","sheet","navio"],
      template: "systems/motim/templates/actor-navio-sheet.html",
      width: 540, height: 600, resizable: true
    });
  }
  getData() {
    const ctx = super.getData(), s = this.actor.system;
    ctx.system = s;
    ctx.motimSlots     = _slots(s.motim.value,    s.motim.max,    "motim");
    ctx.navegacaoSlots = _slots(s.navegacao.value, s.navegacao.max,"navegacao");
    ctx.estragoSlots   = _slots(s.estrago.value,   s.estrago.max,  "estrago");
    ctx.prestigioSlots = _slots(s.prestigio.value, s.prestigio.max,"prestigio");
    ctx.navioAfundando = s.estrago.value  >= s.estrago.max;
    ctx.motimIminente  = s.motim.value    >= s.motim.max;
    return ctx;
  }
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".track-slot").on("click", ev => {
      const track = ev.currentTarget.dataset.track, idx = parseInt(ev.currentTarget.dataset.idx);
      const atual = this.actor.system[track].value;
      this.actor.update({ [`system.${track}.value`]: (idx+1===atual) ? idx : idx+1 });
    });
    html.find(".btn-recurso").on("click", ev => {
      const track = ev.currentTarget.dataset.track, delta = parseInt(ev.currentTarget.dataset.delta);
      this.actor.update({ [`system.${track}.value`]: Math.max(0, this.actor.system[track].value + delta) });
    });
    html.find(".input-jogadores").on("change", ev => {
      const n = Math.max(1, parseInt(ev.currentTarget.value)||4);
      this.actor.update({ "system.numJogadores":n, "system.motim.max":n, "system.prestigio.max":n });
    });
    html.find(".btn-motim").on("click", () => {
      this.actor.update({ "system.motim.value": 0 });
      ui.notifications.info("MOTIM! Uma nova Capitã assume o comando.");
    });
    html.find(".btn-prestigio-bonus").on("click", () => {
      const max = this.actor.system.motim.max + 1;
      this.actor.update({ "system.motim.max": max, "system.prestigio.value": 0 });
      ui.notifications.info(`Prestígio máximo! Motim agora tem ${max} espaços.`);
    });
    html.find(".btn-tirar-carta").on("click", () => new MotimDesafioApp(this.actor).render(true));
  }
}

// =============================================
//  APP DE DESAFIOS (sorteio automático)
// =============================================
class MotimDesafioApp extends Application {
  constructor(navio) { super(); this.navio = navio; this._sortear(); }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id:"motim-desafio", title:"🃏 Carta Sorteada — Desafio",
      template:"systems/motim/templates/desafio-app.html",
      width:460, height:"auto", resizable:false,
      classes:["motim","desafio-app"]
    });
  }

  _sortear() {
    const naipes = ["ouro","paus","espada","copas"];
    const valores = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
    this.naipe = naipes[Math.floor(Math.random() * naipes.length)];
    this.carta = valores[Math.floor(Math.random() * valores.length)];
  }

  getData() {
    return {
      naipeInfo: { ...DESAFIOS[this.naipe], key: this.naipe },
      carta:     this.carta,
      desafio:   this._prepararDesafio()
    };
  }

  _prepararDesafio() {
    const nd=DESAFIOS[this.naipe], cd=nd.cartas[this.carta];
    const DIFS={facil:"Fácil",medio:"Médio",dificil:"Difícil"};
    const TESOUROS={facil:"💎 ×1",medio:"💎💎 ×2",dificil:"💎💎💎 ×3"};
    const MAPA={
      "motim=0":              {efeito:"motim=0",    valor:0,label:"✨ Zerar Motim"},
      "recursos=0":           {efeito:"recursos=0", valor:0,label:"🪵 Zerar Recursos"},
      "prestigio+2":          {efeito:"prestigio+", valor:2,label:"⭐ +2 Prestígio"},
      "estrago+1":            {efeito:"estrago+",   valor:1,label:"🔩 +1 Estrago"},
      "rolar_recursos":       {efeito:"rolar_rec",  valor:0,label:"🎲 Rolar 1d6 → +Recursos"},
      "rolar_perda_recursos": {efeito:"rolar_perd", valor:0,label:"🎲 Rolar 1d6 → −Recursos"}
    };
    const desafio={
      titulo:cd.titulo, descricao:cd.descricao||null, perguntas:nd.perguntas,
      acaoLabel:nd.acaoLabel,
      tipo:cd.motim?"motim":(cd.especial?"especial":"normal"),
      emoji:cd.motim?"💥":(cd.especial?"✨":"🃏"),
      dificuldade:cd.dificuldade||null,
      dificuldadeLabel:cd.dificuldade?DIFS[cd.dificuldade]:null,
      tesouro:cd.dificuldade?TESOUROS[cd.dificuldade]:null,
      semRolagem:cd.semRolagem||false,
      outcomes:cd.outcomesCustom||(cd.dificuldade?OUTCOMES[nd.acao]:null),
      efeitos:[]
    };
    if(cd.motim) desafio.efeitos.push({efeito:"motim+",valor:1,label:"💥 +1 Motim"});
    for(const ef of (cd.efeitos||[])) { if(MAPA[ef]) desafio.efeitos.push(MAPA[ef]); }
    return desafio;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".btn-sortear-nova").on("click", ()=>{ this._sortear(); this.render(false); });
    html.find(".btn-postar-chat").on("click",  ()=>this._postarChat());
    html.find(".btn-aplicar").on("click", ev =>this._aplicarEfeito(ev.currentTarget.dataset.efeito, parseInt(ev.currentTarget.dataset.valor)||0));
  }

  async _aplicarEfeito(efeito, valor) {
    const navio=this.navio;
    if(!navio){ui.notifications.warn("Nenhum navio selecionado.");return;}
    const s=navio.system;
    if(efeito==="motim+")    {await navio.update({"system.motim.value":   Math.min(s.motim.value+valor,   s.motim.max)});   ui.notifications.info(`+${valor} Motim.`);}
    if(efeito==="motim=0")   {await navio.update({"system.motim.value":   0}); ui.notifications.info("Motim zerado!");}
    if(efeito==="recursos=0"){await navio.update({"system.recursos.value":0}); ui.notifications.info("Recursos zerados.");}
    if(efeito==="prestigio+"){ await navio.update({"system.prestigio.value":Math.min(s.prestigio.value+valor,s.prestigio.max)}); ui.notifications.info(`+${valor} Prestígio.`);}
    if(efeito==="estrago+")  {await navio.update({"system.estrago.value": Math.min(s.estrago.value+valor, s.estrago.max)});  ui.notifications.info(`+${valor} Estrago.`);}
    if(efeito==="rolar_rec") {
      const r=new Roll("1d6");await r.evaluate();
      await navio.update({"system.recursos.value":s.recursos.value+r.total});
      r.toMessage({flavor:`🎲 Recursos de graça: <strong>+${r.total}</strong>`});
    }
    if(efeito==="rolar_perd"){
      const r=new Roll("1d6");await r.evaluate();
      await navio.update({"system.recursos.value":Math.max(0,s.recursos.value-r.total)});
      r.toMessage({flavor:`🎲 Recursos perdidos: <strong>−${r.total}</strong>`});
    }
  }

  async _postarChat() {
    const nd=DESAFIOS[this.naipe], desafio=this._prepararDesafio();
    let outcomesHtml="";
    if(desafio.outcomes){
      const oc=desafio.outcomes;
      outcomesHtml=`<div class="chat-outcomes-grid">
        <div class="co-cell co-vitoria"><div class="co-head">✅ Vitória</div>${oc.vitoria.map(x=>`<div>${x}</div>`).join("")}</div>
        <div class="co-cell co-derrota"><div class="co-head">❌ Derrota</div>${oc.derrota.map(x=>`<div>${x}</div>`).join("")}</div>
        <div class="co-cell co-cpos"><div class="co-head">⭐ Crítico +</div>${oc.criticoPos.map(x=>`<div>${x}</div>`).join("")}</div>
        <div class="co-cell co-cneg"><div class="co-head">💀 Crítico −</div>${oc.criticoNeg.map(x=>`<div>${x}</div>`).join("")}</div>
      </div>`;
    }
    const content=`
      <div class="motim-chat-desafio">
        <div class="cd-header tipo-${desafio.tipo}">
          <span class="cd-simbolo">${nd.simbolo}</span>
          <strong class="cd-valor">${this.carta}</strong>
          <span class="cd-titulo">${desafio.titulo}</span>
          ${desafio.dificuldadeLabel?`<span class="cd-dif dif-${desafio.dificuldade}">${desafio.dificuldadeLabel}</span>`:""}
        </div>
        ${desafio.descricao?`<p class="cd-desc">${desafio.descricao}</p>`:""}
        ${desafio.acaoLabel&&!desafio.semRolagem?`<p class="cd-acao"><strong>Ação:</strong> ${desafio.acaoLabel}</p>`:""}
        ${desafio.tesouro?`<p class="cd-tesouro">💎 Tesouro em vitória: <strong>${desafio.tesouro}</strong></p>`:""}
        ${outcomesHtml}
      </div>`;
    ChatMessage.create({content,speaker:{alias:"🃏 Desafio"}});
  }
}

// =============================================
//  INIT
// =============================================
Hooks.once("init", () => {
  console.log("MOTIM | v1.3.0 carregando...");
  CONFIG.Actor.documentClass = MotimActor;
  CONFIG.MOTIM = MOTIM_CONFIG;
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("motim", MotimPirataSheet, { types:["pirata"], makeDefault:true, label:"Ficha de Pirata" });
  Actors.registerSheet("motim", MotimNavioSheet,  { types:["navio"],  makeDefault:true, label:"Ficha do Navio"  });
  console.log("MOTIM | Pronto. Bon voyage! 🏴‍☠️");
});
