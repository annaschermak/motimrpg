// =============================================
//  MOTIM — Sistema para Foundry VTT
//  Por Anna Schermak e Marina Sampaio
//  Secular Games
// =============================================

const MOTIM_CONFIG = {
  naturezas: {
    "loba_do_mar": {
      label: "Loba do Mar",
      bonuses: { navegar: 1, negociar: -1 }
    },
    "terra_firme": {
      label: "Terra Firme",
      bonuses: { negociar: 1, navegar: -1 }
    }
  },
  profissoes: {
    "soldada":   { label: "Soldada",   bonuses: { lutar: 1, navegar: -1 } },
    "lutadora":  { label: "Lutadora",  bonuses: { lutar: 1, acalmarTripulacao: -1 } },
    "taberneira":{ label: "Taberneira",bonuses: { negociar: 1, lutar: -1 } },
    "barda":     { label: "Barda",     bonuses: { acalmarTripulacao: 1, lutar: -1 } },
    "artista":   { label: "Artista",   bonuses: { acalmarTripulacao: 1, consertar: -1 } },
    "marceneira":{ label: "Marceneira",bonuses: { consertar: 1, lutar: -1 } }
  },
  habilidades: {
    "lutar":             { label: "Lutar",             naipe: "espada",  emoji: "⚔️" },
    "negociar":          { label: "Negociar",           naipe: "ouro",    emoji: "💰" },
    "navegar":           { label: "Navegar",            naipe: "paus",    emoji: "🧭" },
    "consertar":         { label: "Consertar",          naipe: "copas",   emoji: "🔧" },
    "acalmarTripulacao": { label: "Acalmar Tripulação", naipe: "copas",   emoji: "🕊️" }
  }
};

// =============================================
//  ACTOR CLASS
// =============================================
class MotimActor extends Actor {
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.type === "pirata") this._prepararPirata();
  }

  _prepararPirata() {
    const s = this.system;
    const nat  = MOTIM_CONFIG.naturezas[s.natureza]  || {};
    const prof = MOTIM_CONFIG.profissoes[s.profissao] || {};

    s.bonusCapitaTotal = {};
    for (const key of Object.keys(MOTIM_CONFIG.habilidades)) {
      let b = 0;
      if (nat.bonuses?.[key])  b += nat.bonuses[key];
      if (prof.bonuses?.[key]) b += prof.bonuses[key];
      s.bonusCapitaTotal[key] = b;
    }
  }

  getBonusCapita(habilidade) {
    if (this.type !== "pirata") return 0;
    return this.system.bonusCapitaTotal?.[habilidade] ?? 0;
  }
}

// =============================================
//  FICHA DA PIRATA
// =============================================
class MotimPirataSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["motim", "sheet", "pirata"],
      template: "systems/motim/templates/actor-pirata-sheet.html",
      width: 500,
      height: 620,
      resizable: true
    });
  }

  getData() {
    const ctx = super.getData();
    const s = this.actor.system;
    ctx.system = s;

    ctx.naturezas = Object.entries(MOTIM_CONFIG.naturezas).map(([key, val]) => ({
      key, label: val.label, selected: key === s.natureza,
      bonusStr: _formatBonuses(val.bonuses)
    }));

    ctx.profissoes = Object.entries(MOTIM_CONFIG.profissoes).map(([key, val]) => ({
      key, label: val.label, selected: key === s.profissao,
      bonusStr: _formatBonuses(val.bonuses)
    }));

    ctx.habilidades = Object.entries(MOTIM_CONFIG.habilidades).map(([key, hab]) => ({
      key,
      label: hab.label,
      emoji: hab.emoji,
      value: s.habilidades[key]?.value ?? 0
    }));

    // Bônus combinado natureza + profissão para exibição na ficha
    const nat  = MOTIM_CONFIG.naturezas[s.natureza]  || {};
    const prof = MOTIM_CONFIG.profissoes[s.profissao] || {};
    ctx.bonusCapita = Object.entries(MOTIM_CONFIG.habilidades).map(([key, hab]) => {
      let b = (nat.bonuses?.[key] || 0) + (prof.bonuses?.[key] || 0);
      return { key, label: hab.label, bonus: b, str: b >= 0 ? `+${b}` : `${b}`, positivo: b > 0, negativo: b < 0 };
    }).filter(x => x.bonus !== 0);

    return ctx;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".rolar-habilidade").on("click", ev => {
      const hab = ev.currentTarget.dataset.habilidade;
      this._rolar(hab);
    });

    html.find(".toggle-capita").on("click", () => {
      this.actor.update({ "system.ehCapita": !this.actor.system.ehCapita });
    });

    html.find(".item-usado-check").on("change", ev => {
      this.actor.update({ "system.itemUsado": ev.currentTarget.checked });
    });
  }

  async _rolar(habilidade) {
    const s     = this.actor.system;
    const hab   = MOTIM_CONFIG.habilidades[habilidade];
    const valor = s.habilidades[habilidade]?.value ?? 0;

    // Busca a capitã ativa (outra pirata marcada como capitã)
    const capita = game.actors.find(a =>
      a.type === "pirata" && a.system.ehCapita && a.id !== this.actor.id
    );
    const bonusCapita = capita ? capita.getBonusCapita(habilidade) : 0;
    const totalBonus  = valor + bonusCapita;

    const roll = new Roll(`2d6 + ${totalBonus}`);
    await roll.evaluate();

    const total = roll.total;
    const d1 = roll.dice[0].results[0].result;
    const d2 = roll.dice[0].results[1].result;

    let resultadoClass = "";
    let resultadoTexto = "";

    if (d1 === 1 && d2 === 1) {
      resultadoClass = "critico-negativo";
      resultadoTexto = "💀 Crítico Negativo";
    } else if (d1 === 6 && d2 === 6) {
      resultadoClass = "critico-positivo";
      resultadoTexto = "⭐ Crítico Positivo";
    } else if (total >= 12) {
      resultadoClass = "vitoria";
      resultadoTexto = "✅ Vitória — Desafio DIFÍCIL";
    } else if (total >= 8) {
      resultadoClass = "vitoria";
      resultadoTexto = "✅ Vitória — Desafio MÉDIO";
    } else if (total >= 4) {
      resultadoClass = "vitoria";
      resultadoTexto = "✅ Vitória — Desafio FÁCIL";
    } else {
      resultadoClass = "derrota";
      resultadoTexto = "❌ Derrota";
    }

    let capitaInfo = "";
    if (capita && bonusCapita !== 0) {
      const sinal = bonusCapita > 0 ? "+" : "";
      capitaInfo = `<div class="chat-capita">Bônus da Capitã <strong>${capita.name}</strong>: ${sinal}${bonusCapita}</div>`;
    }

    const flavor = `
      <div class="motim-chat-roll">
        <div class="chat-header">
          <span class="chat-pirata">${this.actor.name}</span> rola
          <span class="chat-hab">${hab.emoji} ${hab.label}</span>
        </div>
        <div class="chat-detalhe">
          Atributo: <strong>${valor >= 0 ? "+" : ""}${valor}</strong>
          ${capitaInfo}
        </div>
        <div class="chat-resultado ${resultadoClass}">
          <span class="chat-total">${total}</span>
          <span class="chat-texto">${resultadoTexto}</span>
        </div>
        ${_tabTesouro(total, d1, d2)}
      </div>`;

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor,
      rollMode: game.settings.get("core", "rollMode")
    });
  }
}

// =============================================
//  FICHA DO NAVIO
// =============================================
class MotimNavioSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["motim", "sheet", "navio"],
      template: "systems/motim/templates/actor-navio-sheet.html",
      width: 540,
      height: 560,
      resizable: true
    });
  }

  getData() {
    const ctx = super.getData();
    const s = this.actor.system;
    ctx.system = s;

    ctx.motimSlots     = _slots(s.motim.value, s.motim.max, "motim");
    ctx.navegacaoSlots = _slots(s.navegacao.value, s.navegacao.max, "navegacao");
    ctx.estragoSlots   = _slots(s.estrago.value, s.estrago.max, "estrago");
    ctx.prestigioSlots = _slots(s.prestigio.value, s.prestigio.max, "prestigio");

    ctx.navioAfundando   = s.estrago.value >= s.estrago.max;
    ctx.motimIminente    = s.motim.value >= s.motim.max;

    return ctx;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Slots clicáveis (motim, navegacao, estrago, prestigio)
    html.find(".track-slot").on("click", ev => {
      const track = ev.currentTarget.dataset.track;
      const idx   = parseInt(ev.currentTarget.dataset.idx);
      const s     = this.actor.system;
      const atual = s[track].value;
      // Toggle: clica no último preenchido → diminui; caso contrário → vai até idx+1
      const novo  = (idx + 1 === atual) ? idx : idx + 1;
      this.actor.update({ [`system.${track}.value`]: novo });
    });

    // Botões +/- para recursos e tesouro
    html.find(".btn-recurso").on("click", ev => {
      const track = ev.currentTarget.dataset.track;
      const delta = parseInt(ev.currentTarget.dataset.delta);
      const val   = this.actor.system[track].value;
      this.actor.update({ [`system.${track}.value`]: Math.max(0, val + delta) });
    });

    // Número de jogadores → ajusta max de Motim e Prestígio
    html.find(".input-jogadores").on("change", ev => {
      const n = Math.max(1, parseInt(ev.currentTarget.value) || 4);
      this.actor.update({
        "system.numJogadores":  n,
        "system.motim.max":     n,
        "system.prestigio.max": n
      });
    });

    // Botão de Motim (zerar motim e trocar capitã)
    html.find(".btn-motim").on("click", () => {
      this.actor.update({ "system.motim.value": 0 });
      ui.notifications.info("MOTIM! Uma nova Capitã assume o comando.");
    });

    // Botão Prestígio cheio → +1 slot Motim
    html.find(".btn-prestigio-bônus").on("click", () => {
      const s   = this.actor.system;
      const max = s.motim.max + 1;
      this.actor.update({
        "system.motim.max":    max,
        "system.prestigio.value": 0
      });
      ui.notifications.info(`Prestígio máximo atingido! Motim agora tem ${max} espaços.`);
    });
  }
}

// =============================================
//  HELPERS
// =============================================
function _slots(value, max, track) {
  const arr = [];
  for (let i = 0; i < max; i++) {
    arr.push({ idx: i, track, filled: i < value });
  }
  return arr;
}

function _formatBonuses(bonuses) {
  if (!bonuses) return "";
  return Object.entries(bonuses).map(([key, val]) => {
    const label = MOTIM_CONFIG.habilidades[key]?.label ?? key;
    return `${val > 0 ? "+" : ""}${val} ${label}`;
  }).join(", ");
}

function _tabTesouro(total, d1, d2) {
  if (d1 === 1 && d2 === 1) return "";
  if (total < 4) return "";

  let tesouro = "";
  if (total >= 12 || (d1 === 6 && d2 === 6)) tesouro = "💎💎💎 Tesouro (difícil)";
  else if (total >= 8)  tesouro = "💎💎 Tesouro (médio)";
  else if (total >= 4)  tesouro = "💎 Tesouro (fácil)";

  return tesouro
    ? `<div class="chat-tesouro">Tesouro possível: <strong>${tesouro}</strong></div>`
    : "";
}

// =============================================
//  INICIALIZAÇÃO
// =============================================
Hooks.once("init", () => {
  console.log("MOTIM | Inicializando sistema...");

  CONFIG.Actor.documentClass = MotimActor;
  CONFIG.MOTIM = MOTIM_CONFIG;

  Actors.unregisterSheet("core", ActorSheet);

  Actors.registerSheet("motim", MotimPirataSheet, {
    types: ["pirata"],
    makeDefault: true,
    label: "Ficha de Pirata"
  });

  Actors.registerSheet("motim", MotimNavioSheet, {
    types: ["navio"],
    makeDefault: true,
    label: "Ficha do Navio"
  });

  console.log("MOTIM | Sistema carregado. Bon voyage!");
});
