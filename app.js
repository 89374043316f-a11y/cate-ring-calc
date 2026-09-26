// ============ CATERING CALCULATION ENGINE ============

const EVENT_PROFILES = {
  dacha:    { name: 'День на даче', bevMult: 1.0,  breadMult: 1.0,  alcoholMult: 1.0, snackMult: 1.0  },
  party:    { name: 'Вечеринка',   bevMult: 1.15, breadMult: 0.8,  alcoholMult: 1.3, snackMult: 1.3  },
  picnic:   { name: 'Пикник',      bevMult: 1.1,  breadMult: 0.7,  alcoholMult: 0.8, snackMult: 1.1  },
  feast:    { name: 'Застолье',    bevMult: 0.9,  breadMult: 1.3,  alcoholMult: 1.2, snackMult: 0.9  }
};

const WEATHER_PROFILES = {
  cool:   { name: 'Прохладно',   mult: 0.85 },
  warm:   { name: 'Тепло',       mult: 1.0  },
  hot:    { name: 'Жаркий день', mult: 1.25 },
  veryhot:{ name: 'Очень жарко', mult: 1.5  }
};

// Base consumption per person per hour (liters) — no water, reduced
const BEVERAGE_RATES = {
  juice:  { name: 'Соки',      rate: 0.10, detail: 'фруктовые соки' },
  soda:   { name: 'Газировка', rate: 0.08, detail: 'кола, лимонад, тоник' }
};

// Bread per person per event (kg) - not per hour, per event
const BREAD_RATES = {
  bread:  { name: 'Хлеб',           rate: 0.080, detail: 'булочки, багет, нарезной' },
  bakery: { name: 'Выпечка',        rate: 0.060, detail: 'слоёное, круассаны, торты' }
};

// Alcohol per person per event (liters) — wine removed, split between beer and spirits
const ALCOHOL_RATES = {
  beer:    { name: 'Пиво',       rate: 0.70, detail: 'разливное и бутылочное' },
  spirits: { name: 'Крепкое',     rate: 0.18, detail: 'коктейли и в чистом виде' }
};

// Snacks per person per event (kg)
const SNACK_RATES = {
  chips:      { name: 'Чипсы',          rate: 0.050, detail: 'с разными вкусами' },
  nachos:     { name: 'Начос',          rate: 0.040, detail: 'с соусами' },
  fishSnacks: { name: 'Рыбные закуски', rate: 0.030, detail: 'кальмары, рыба, креветки' }
};

// Salads per person per event (kg)
const SALAD_RATES = {
  salads: { name: 'Салаты', rate: 0.200, detail: 'овощные, мясные, рыбные' }
};

// Packaging sizes [size in liters, label, type]
const PACKAGING = {
  juice:   [{ size: 0.2, label: 'Пакеты 200 мл' }, { size: 1.0, label: 'Пакеты 1 л' }, { size: 2.0, label: 'Пакеты 2 л' }, { size: 5.0, label: 'Bag-in-box 5 л' }],
  soda:    [{ size: 0.33, label: 'Банки 330 мл' }, { size: 0.5, label: 'Бутылки 0,5 л' }, { size: 1.0, label: 'Бутылки 1 л' }, { size: 1.5, label: 'Бутылки 1,5 л' }, { size: 2.0, label: 'Бутылки 2 л' }],
  beer:    [{ size: 0.33, label: 'Бутылки 330 мл' }, { size: 0.5, label: 'Банки 0,5 л' }, { size: 0.5, label: 'Бутылки 0,5 л' }, { size: 1.0, label: 'Кеги 1 л' }],
  spirits: [{ size: 0.5, label: 'Бутылки 0,5 л' }, { size: 0.7, label: 'Бутылки 0,7 л' }, { size: 1.0, label: 'Бутылки 1 л' }, { size: 1.75, label: 'Бутылки 1,75 л' }],
  bread:   [{ size: 0.5, label: 'Буханки 500 г' }, { size: 1.0, label: 'Буханки 1 кг' }, { size: 2.0, label: 'Подносы 2 кг' }],
  bakery:  [{ size: 0.1, label: 'Порции 100 г' }, { size: 0.25, label: 'Упаковки 250 г' }, { size: 0.5, label: 'Коробки 500 г' }, { size: 1.0, label: 'Подносы 1 кг' }],
  chips:      [{ size: 0.05, label: 'Пакеты 50 г' }, { size: 0.1, label: 'Пакеты 100 г' }, { size: 0.2, label: 'Пакеты 200 г' }, { size: 0.5, label: 'Большие пакеты 500 г' }],
  nachos:     [{ size: 0.1, label: 'Пакеты 100 г' }, { size: 0.2, label: 'Пакеты 200 г' }, { size: 0.5, label: 'Коробки 500 г' }],
  fishSnacks: [{ size: 0.05, label: 'Порции 50 г' }, { size: 0.1, label: 'Пакеты 100 г' }, { size: 0.25, label: 'Коробки 250 г' }],
  salads:     [{ size: 0.3, label: 'Контейнеры 300 г' }, { size: 0.5, label: 'Контейнеры 500 г' }, { size: 1.0, label: 'Подносы 1 кг' }]
};

const ITEM_COLORS = {
  juice: 'gold', soda: 'purple',
  bread: 'primary', bakery: 'warning',
  chips: 'purple', nachos: 'warning', fishSnacks: 'blue',
  salads: 'success',
  beer: 'gold', spirits: 'warning'
};

const ITEM_LABELS = {
  juice: 'Соки', soda: 'Газировка',
  bread: 'Хлеб', bakery: 'Выпечка',
  chips: 'Чипсы', nachos: 'Начос', fishSnacks: 'Рыбные закуски',
  salads: 'Салаты',
  beer: 'Пиво', spirits: 'Крепкое'
};

// ============ STATE ============
const state = {
  guests: 10,
  duration: 4,
  eventType: 'dacha',
  weather: 'hot',
  reserveBevPct: 5,
  reserveAlcPct: 10,
  alcohol: true,
  extraGuests: true,
  salads: false
};

// ============ CALCULATIONS ============

function calculate() {
  const ev = EVENT_PROFILES[state.eventType];
  const w = WEATHER_PROFILES[state.weather];
  const bevReserveFactor = 1 + state.reserveBevPct / 100;
  const alcReserveFactor = 1 + state.reserveAlcPct / 100;

  const beverages = {};
  for (const [key, info] of Object.entries(BEVERAGE_RATES)) {
    const base = info.rate * state.guests * state.duration * ev.bevMult * w.mult;
    const withReserve = base * bevReserveFactor;
    beverages[key] = { name: info.name, detail: info.detail, base, total: withReserve };
  }

  const bread = {};
  for (const [key, info] of Object.entries(BREAD_RATES)) {
    const base = info.rate * state.guests * ev.breadMult;
    const withReserve = base * bevReserveFactor;
    bread[key] = { name: info.name, detail: info.detail, base, total: withReserve };
  }

  const alcohol = {};
  if (state.alcohol) {
    const alcoholGuests = state.extraGuests ? state.guests + 2 : state.guests;
    for (const [key, info] of Object.entries(ALCOHOL_RATES)) {
      const base = info.rate * alcoholGuests * ev.alcoholMult;
      const withReserve = base * alcReserveFactor;
      alcohol[key] = { name: info.name, detail: info.detail, base, total: withReserve, guests: alcoholGuests };
    }
  }

  const snacks = {};
  for (const [key, info] of Object.entries(SNACK_RATES)) {
    const base = info.rate * state.guests * ev.snackMult;
    const withReserve = base * bevReserveFactor;
    snacks[key] = { name: info.name, detail: info.detail, base, total: withReserve };
  }

  const salads = {};
  if (state.salads) {
    for (const [key, info] of Object.entries(SALAD_RATES)) {
      const base = info.rate * state.guests * ev.breadMult;
      const withReserve = base * bevReserveFactor;
      salads[key] = { name: info.name, detail: info.detail, base, total: withReserve };
    }
  }

  const totalBevLiters = Object.values(beverages).reduce((s, v) => s + v.total, 0);
  const totalBreadKg = Object.values(bread).reduce((s, v) => s + v.total, 0);
  const totalAlcoholLiters = Object.values(alcohol).reduce((s, v) => s + v.total, 0);
  const totalSnacksKg = Object.values(snacks).reduce((s, v) => s + v.total, 0);
  const totalSaladsKg = Object.values(salads).reduce((s, v) => s + v.total, 0);
  const totalLiters = totalBevLiters + totalAlcoholLiters;

  const packaging = {};
  const allItems = { ...beverages, ...bread, ...snacks, ...salads, ...alcohol };
  for (const [key, item] of Object.entries(allItems)) {
    packaging[key] = computePackaging(key, item.total);
  }

  return { beverages, bread, snacks, salads, alcohol, packaging, totalBevLiters, totalBreadKg, totalSnacksKg, totalSaladsKg, totalAlcoholLiters, totalLiters, ev, w, bevReserveFactor, alcReserveFactor };
}

function computePackaging(key, totalLiters) {
  const sizes = PACKAGING[key];
  if (!sizes) return [];

  // Greedy: use largest sizes first, then fill remainder
  let remaining = totalLiters;
  const result = [];

  // Sort by size descending
  const sorted = [...sizes].sort((a, b) => b.size - a.size);

  for (let i = 0; i < sorted.length; i++) {
    const { size, label } = sorted[i];
    if (i === sorted.length - 1) {
      // Last size: round up to cover remainder
      const count = Math.ceil(remaining / size);
      if (count > 0) {
        result.push({ label, size, count, volume: count * size });
      }
    } else {
      const count = Math.floor(remaining / size);
      if (count > 0) {
        result.push({ label, size, count, volume: count * size });
        remaining -= count * size;
      }
    }
  }

  return result;
}

// ============ RENDERING ============

function fmt(n, decimals = 1) {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function renderKPIs(r) {
  const grid = document.getElementById('kpi-grid');
  const kpis = [
    { label: 'Безалк. напитки', value: fmt(r.totalBevLiters, 1), unit: 'литров', icon: 'water', color: 'blue' },
    { label: 'Хлеб и выпечка', value: fmt(r.totalBreadKg, 1), unit: 'кг', icon: 'bread', color: 'primary' },
    { label: 'Закуски', value: fmt(r.totalSnacksKg, 1), unit: 'кг', icon: 'soda', color: 'purple' },
    { label: 'Алкоголь', value: fmt(r.totalAlcoholLiters, 1), unit: 'литров', icon: 'beer', color: 'gold' },
    { label: 'Всего жидкости', value: fmt(r.totalLiters, 1), unit: 'литров', icon: 'soda', color: 'purple' },
    { label: 'Запас', value: '+' + state.reserveBevPct + '%/' + state.reserveAlcPct + '%', unit: 'безалк/алк', icon: 'spirits', color: 'primary' }
  ];

  const icons = {
    water: '<path d="M12 2C8 6 6 10 6 14a6 6 0 0 0 12 0c0-4-2-8-6-12z"/>',
    bread: '<path d="M5 10a7 4 0 0 1 14 0v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M5 14h14"/>',
    beer: '<path d="M8 4h8v16a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z"/><path d="M16 8h3a2 2 0 0 1 0 4h-3"/>',
    soda: '<rect x="8" y="3" width="8" height="18" rx="1"/><path d="M8 7h8"/>',
    bakery: '<circle cx="12" cy="12" r="7"/><path d="M9 12h6M12 9v6"/>',
    spirits: '<path d="M10 3h4l-1 4v13a2 2 0 0 1-2 0V7z"/>'
  };

  grid.innerHTML = kpis.map(k => `
    <div class="kpi-card accent-${k.color}">
      <svg class="kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icons[k.icon]}</svg>
      <div class="kpi-value"><span class="kpi-num">${k.value}</span><span class="kpi-unit">${k.unit}</span></div>
      <div class="kpi-label">${k.label}</div>
    </div>
  `).join('');
}

function renderTable(tableId, items, unit, showReserve = true) {
  const table = document.getElementById(tableId);
  let html = `
    <thead>
      <tr>
        <th>Продукт</th>
        <th>Базовая потребность</th>
        <th>С запасом</th>
      </tr>
    </thead>
    <tbody>
  `;

  let totalBase = 0, totalReserve = 0;
  for (const item of Object.values(items)) {
    totalBase += item.base;
    totalReserve += item.total;
    html += `
      <tr>
        <td>
          <div class="item-name">${item.name}</div>
          <div class="item-detail">${item.detail}</div>
        </td>
        <td>${fmt(item.base, 2)} <span style="font-size:0.85em;color:var(--color-text-muted)">${unit}</span></td>
        <td>${fmt(item.total, 2)} <span style="font-size:0.85em;color:var(--color-text-muted)">${unit}</span></td>
      </tr>
    `;
  }

  html += `
    <tr class="total-row">
      <td>Итого</td>
      <td>${fmt(totalBase, 2)} <span style="font-size:0.85em;color:var(--color-text-muted)">${unit}</span></td>
      <td>${fmt(totalReserve, 2)} <span style="font-size:0.85em;color:var(--color-text-muted)">${unit}</span></td>
    </tr>
  `;

  html += '</tbody>';
  table.innerHTML = html;
}

function renderPackaging(r) {
  const grid = document.getElementById('packaging-grid');
  const allItems = { ...r.beverages, ...r.bread, ...r.alcohol };

  let html = '';
  for (const [key, item] of Object.entries(allItems)) {
    const packs = r.packaging[key];
    const color = ITEM_COLORS[key];
    const totalVol = packs.reduce((s, p) => s + p.volume, 0);
    const unit = key === 'bread' || key === 'bakery' ? 'кг' : 'л';

    html += `
      <div class="packaging-item">
        <div class="packaging-header">
          <span class="packaging-dot text-${color}" style="background: var(--color-${color})"></span>
          <span class="packaging-name">${item.name}</span>
          <span class="packaging-total text-${color}">${fmt(item.total, 1)} ${unit}</span>
        </div>
        <div class="packaging-breakdown">
          ${packs.map(p => `
            <div class="packaging-line">
              <span class="size-label">${p.label}</span>
              <span class="count">${p.count}x</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  grid.innerHTML = html;
}

function renderReserveBanner(r) {
  const banner = document.getElementById('reserve-banner');
  const bevReserve = r.totalBevLiters - Object.values(r.beverages).reduce((s, v) => s + v.base, 0);
  const breadReserve = r.totalBreadKg - Object.values(r.bread).reduce((s, v) => s + v.base, 0);
  const snackReserve = r.totalSnacksKg - Object.values(r.snacks).reduce((s, v) => s + v.base, 0);
  const alcoholReserve = r.totalAlcoholLiters - Object.values(r.alcohol).reduce((s, v) => s + v.base, 0);
  const totalReserve = bevReserve + breadReserve + snackReserve + alcoholReserve;
  const extraGuestsNote = state.alcohol && state.extraGuests ? ' + 2 доп. гостей для алкоголя' : '';

  banner.innerHTML = `
    <div class="reserve-icon">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 L4 6 L4 12 Q4 18 12 22 Q20 18 20 12 L20 6 Z"/><path d="M9 12 L12 15 L15 10"/></svg>
    </div>
    <div class="reserve-content">
      <h3>Страховой запас</h3>
      <p>Запас ${state.reserveBevPct}% для безалкогольных, закусок и хлеба, ${state.reserveAlcPct}% для алкоголя${extraGuestsNote}. Покрывает непредвиденных гостей, проливы и колебания потребления.</p>
      <div class="reserve-stats">
        <div class="reserve-stat">
          <span class="reserve-stat-value">+${fmt(bevReserve, 1)} л</span>
          <span class="reserve-stat-label">Напитки (${state.reserveBevPct}%)</span>
        </div>
        <div class="reserve-stat">
          <span class="reserve-stat-value">+${fmt(breadReserve, 1)} кг</span>
          <span class="reserve-stat-label">Хлеб (${state.reserveBevPct}%)</span>
        </div>
        <div class="reserve-stat">
          <span class="reserve-stat-value">+${fmt(alcoholReserve, 1)} л</span>
          <span class="reserve-stat-label">Алкоголь (${state.reserveAlcPct}%)</span>
        </div>
        <div class="reserve-stat">
          <span class="reserve-stat-value">+${fmt(totalReserve, 1)} всего</span>
          <span class="reserve-stat-label">Общий запас</span>
        </div>
      </div>
    </div>
  `;
}

function renderGrandTotals(r) {
  const container = document.getElementById('grand-totals');
  const items = [
    { title: 'Безалкогольные напитки', value: fmt(r.totalBevLiters, 1), unit: 'литров', color: 'blue' },
    { title: 'Хлеб и выпечка', value: fmt(r.totalBreadKg, 1), unit: 'кг', color: 'primary' },
    { title: 'Закуски', value: fmt(r.totalSnacksKg, 1), unit: 'кг', color: 'purple' },
    { title: 'Алкогольные напитки', value: fmt(r.totalAlcoholLiters, 1), unit: 'литров', color: 'gold' },
    { title: 'Общий объём жидкости', value: fmt(r.totalLiters, 1), unit: 'литров', color: 'purple' }
  ];

  container.innerHTML = items.map(i => `
    <div class="summary-card accent-${i.color}">
      <div class="summary-card-title">${i.title}</div>
      <div class="summary-card-value text-${i.color}">${i.value} ${i.unit}</div>
    </div>
  `).join('');
}

function renderAlcoholSection() {
  const section = document.getElementById('alcohol-section');
  section.style.display = state.alcohol ? '' : 'none';
}

function renderSaladsSection() {
  const section = document.getElementById('salads-section');
  section.style.display = state.salads ? '' : 'none';
}

function renderMarinades(r) {
  const grid = document.getElementById('marinade-grid');
  const meatKg = state.guests * 0.5;
  const multiplier = meatKg; // recipes are per 1 kg of meat

  document.getElementById('marinade-guests').textContent = state.guests;
  document.getElementById('marinade-meat-kg').textContent = fmt(meatKg, 1) + ' кг';

  const recipes = [
    {
      name: 'Классический маринад',
      subtitle: 'Лук, лавровый лист, соль, перец',
      color: 'primary',
      ingredients: [
        { name: 'Лук репчатый', qty: 250, unit: 'г', per: 1 },
        { name: 'Лавровый лист', qty: 4, unit: 'шт', per: 1 },
        { name: 'Соль', qty: 1, unit: 'ст. л.', per: 1 },
        { name: 'Перец чёрный', qty: 0.5, unit: 'ст. л.', per: 1 }
      ],
      steps: [
        'Лук нарежьте тонкими полукольцами.',
        'Соль, перец и лавровый лист соедините в миске. Добавьте лук, перемешайте.',
        'Добавьте мясо, тщательно перемешайте и уберите в холодильник на 6–8 часов.'
      ]
    },
    {
      name: 'Томатный с паприкой',
      subtitle: 'Помидоры, томатная паста, паприка',
      color: 'warning',
      ingredients: [
        { name: 'Лук репчатый', qty: 250, unit: 'г', per: 1 },
        { name: 'Помидор', qty: 1, unit: 'шт', per: 1 },
        { name: 'Томатная паста', qty: 2, unit: 'ст. л.', per: 1 },
        { name: 'Сахар тростниковый', qty: 2, unit: 'ст. л.', per: 1 },
        { name: 'Соль', qty: 1, unit: 'ст. л.', per: 1 },
        { name: 'Сок лимона', qty: 1, unit: 'ст. л.', per: 1 },
        { name: 'Паприка сладкая', qty: 0.5, unit: 'ст. л.', per: 1 },
        { name: 'Перец', qty: 0.5, unit: 'ст. л.', per: 1 }
      ],
      steps: [
        'Лук нарежьте полукольцами, выложите в миску.',
        'Добавьте соль, сахар, перец, паприку и лимонный сок.',
        'Помидор нарежьте кубиками, добавьте с томатной пастой. Перемешайте.'
      ]
    },
    {
      name: 'Карри и соевый соус',
      subtitle: 'Восточные специи, соевый соус',
      color: 'gold',
      ingredients: [
        { name: 'Лук репчатый', qty: 250, unit: 'г', per: 1 },
        { name: 'Соевый соус', qty: 3, unit: 'ст. л.', per: 1 },
        { name: 'Карри', qty: 1, unit: 'ст. л.', per: 1 },
        { name: 'Сушёный чеснок', qty: 1, unit: 'ст. л.', per: 1 },
        { name: 'Молотый имбирь', qty: 1, unit: 'ст. л.', per: 1 },
        { name: 'Паприка сладкая', qty: 0.5, unit: 'ст. л.', per: 1 }
      ],
      steps: [
        'Лук нарежьте полукольцами, выложите в миску.',
        'Добавьте карри, чеснок, паприку, имбирь и соевый соус. Перемешайте.'
      ]
    },
    {
      name: 'Лимонный с газировкой',
      subtitle: 'Лимон, минералка, цедра',
      color: 'blue',
      ingredients: [
        { name: 'Газированная вода', qty: 300, unit: 'мл', per: 1 },
        { name: 'Лук репчатый', qty: 200, unit: 'г', per: 1 },
        { name: 'Лимон', qty: 1, unit: 'шт', per: 1 },
        { name: 'Лимонная цедра', qty: 1, unit: 'ч. л.', per: 1 },
        { name: 'Перец', qty: 1, unit: 'ч. л.', per: 1 },
        { name: 'Соль', qty: 1, unit: 'ч. л.', per: 1 }
      ],
      steps: [
        'Лук нарежьте полукольцами, лимон — тонкими кольцами.',
        'Смешайте цедру, соль и перец. Залейте газировкой.',
        'Добавьте лимон и лук, перемешайте.'
      ]
    },
    {
      name: 'Винный с наршарабом',
      subtitle: 'Красное вино, гранатовый соус',
      color: 'purple',
      ingredients: [
        { name: 'Красное сухое вино', qty: 300, unit: 'мл', per: 1 },
        { name: 'Лук репчатый', qty: 200, unit: 'г', per: 1 },
        { name: 'Соус наршараб', qty: 3, unit: 'ст. л.', per: 1 },
        { name: 'Соль', qty: 2, unit: 'ч. л.', per: 1 },
        { name: 'Сумах', qty: 1, unit: 'ч. л.', per: 1 },
        { name: 'Перец', qty: 1, unit: 'ч. л.', per: 1 }
      ],
      steps: [
        'Специи и соус смешайте до однородности.',
        'Влейте вино, перемешайте до растворения соли.',
        'Добавьте лук, перемешайте.'
      ]
    },
    {
      name: 'Барбекю',
      subtitle: 'Уксус, копчёная паприка, специи',
      color: 'warning',
      ingredients: [
        { name: 'Лук репчатый', qty: 200, unit: 'г', per: 1 },
        { name: 'Уксус столовый 9%', qty: 50, unit: 'мл', per: 1 },
        { name: 'Копчёная паприка', qty: 20, unit: 'г', per: 1 },
        { name: 'Соль', qty: 1, unit: 'ст. л.', per: 1 },
        { name: 'Перец', qty: 1, unit: 'ч. л.', per: 1 },
        { name: 'Сушёный чеснок', qty: 1, unit: 'ч. л.', per: 1 },
        { name: 'Орегано', qty: 1, unit: 'ч. л.', per: 1 },
        { name: 'Тимьян сушёный', qty: 1, unit: 'ч. л.', per: 1 }
      ],
      steps: [
        'Специи смешайте с уксусом до однородной пасты.',
        'Добавьте лук и перемешайте.'
      ]
    }
  ];

  grid.innerHTML = recipes.map(recipe => {
    const ingredientsHtml = recipe.ingredients.map(ing => {
      const total = ing.qty * multiplier;
      const display = total >= 100 && ing.unit === 'г' ? fmt(total / 1000, 2) + ' кг' :
                       total >= 100 && ing.unit === 'мл' ? fmt(total / 1000, 2) + ' л' :
                       fmt(total, ing.unit === 'шт' ? 0 : 1) + ' ' + ing.unit;
      return `<div class="marinade-ingredient">
        <span class="marinade-ingredient-name">${ing.name}</span>
        <span class="marinade-ingredient-qty">${display}</span>
      </div>`;
    }).join('');

    const stepsHtml = recipe.steps.map((s, i) => `<li>${s}</li>`).join('');

    return `
      <div class="marinade-card accent-${recipe.color}">
        <div class="marinade-card-header">
          <div>
            <div class="marinade-card-title">${recipe.name}</div>
            <div class="marinade-card-subtitle">${recipe.subtitle}</div>
          </div>
        </div>
        <div class="marinade-ingredients">${ingredientsHtml}</div>
        <div class="marinade-steps">
          <ol>${stepsHtml}</ol>
        </div>
      </div>
    `;
  }).join('');
}

function renderPriceTable() {
  const table = document.getElementById('price-table');

  const stores = ['Лента', 'Дикси', 'Глобус', 'Магнит', 'Пятёрочка'];

  const products = [
    {
      name: 'Ягермейстер',
      detail: 'Jägermeister, 35%',
      prices: [
        { store: 'Лента', price: '1 199,99 ₽', vol: '0,5 л', url: 'https://lenta.com/product/liker-desertnyjj-alk35-germaniya-05l-151768/' },
        { store: 'Дикси', price: null, vol: 'каталог', url: 'https://dixy.ru/catalog/alkogolnye-napitki/likery/' },
        { store: 'Глобус', price: '1 699,99 ₽', vol: '0,7 л', url: 'https://online.globus.ru/products/likyor-jagermeister-35--alk.-germaniya-07l-500927_ST' },
        { store: 'Магнит', price: '1 299,99 ₽', vol: '0,5 л', url: 'https://magnit.ru/product/1545500175-liker_jagermeister_35_500ml' },
        { store: 'Пятёрочка', price: null, vol: 'каталог', url: 'https://5ka.ru/catalog/pivo-vino-energetiki--251C13047/' }
      ]
    },
    {
      name: 'Бугульма',
      detail: 'Бальзам, 40%',
      prices: [
        { store: 'Лента', price: '499,99 ₽', vol: '0,5 л', url: 'https://lenta.com/product/balzam-alk40-rossiya-05l-147784/' },
        { store: 'Дикси', price: null, vol: 'каталог', url: 'https://dixy.ru/catalog/alkogolnye-napitki/balzamy/' },
        { store: 'Глобус', price: null, vol: 'каталог', url: 'https://online.globus.ru/catalog/alkogol-1225631' },
        { store: 'Магнит', price: '579,99 ₽', vol: '0,5 л', url: 'https://magnit.ru/product/3009000025-balzam_bugulma_flyazhka_40_500ml' },
        { store: 'Пятёрочка', price: null, vol: 'каталог', url: 'https://5ka.ru/catalog/pivo-vino-energetiki--251C13047/' }
      ]
    },
    {
      name: 'Медовуха',
      detail: 'Пряная, 5–6%',
      prices: [
        { store: 'Лента', price: '219,99 ₽', vol: '1 л', url: 'https://lenta.com/catalog/medovuha-22622/' },
        { store: 'Дикси', price: null, vol: 'каталог', url: 'https://dixy.ru/catalog/alkogolnye-napitki/kokteyli-sidr/medovukha/' },
        { store: 'Глобус', price: null, vol: 'каталог', url: 'https://online.globus.ru/catalog/alkogol-1225631/sidr-medovuxa-koktejli-2225647/medovuxa-31448175' },
        { store: 'Магнит', price: '239,99 ₽', vol: '1 л', url: 'https://magnit.ru/product/1000492488-medovyy_napitok_medovukha_pryanaya_tyemnaya_fil_nepas_5_8_1l' },
        { store: 'Пятёрочка', price: null, vol: 'каталог', url: 'https://5ka.ru/catalog/pivo-vino-energetiki--251C13047/' }
      ]
    },
    {
      name: 'Джин',
      detail: 'Gordon\'s / Beefeater, 37,5–40%',
      prices: [
        { store: 'Лента', price: '1 499,99 ₽', vol: '0,7 л', url: 'https://lenta.com/catalog/dzhin-22605/' },
        { store: 'Дикси', price: null, vol: 'каталог', url: 'https://dixy.ru/catalog/alkogolnye-napitki/djin/' },
        { store: 'Глобус', price: null, vol: 'каталог', url: 'https://online.globus.ru/catalog/alkogol-1225631' },
        { store: 'Магнит', price: null, vol: 'каталог', url: 'https://magnit.ru/catalog/47267-balzam_kore_mm_gm' },
        { store: 'Пятёрочка', price: null, vol: 'каталог', url: 'https://5ka.ru/catalog/pivo-vino-energetiki--251C13047/' }
      ]
    },
    {
      name: 'Пиво',
      detail: 'Светлое, 4–5%',
      prices: [
        { store: 'Лента', price: '79,99 ₽', vol: '0,43 л', url: 'https://lenta.com/catalog/pivo-22610/' },
        { store: 'Дикси', price: '92,99 ₽', vol: '0,45 л', url: 'https://dixy.ru/catalog/alkogolnye-napitki/pivo/' },
        { store: 'Глобус', price: '69,99 ₽', vol: '0,45 л', url: 'https://online.globus.ru/catalog/alkogol-1225631/pivo-2225648' },
        { store: 'Магнит', price: '56,99 ₽', vol: '0,45 л', url: 'https://magnit.ru/catalog/41183-pivo_kokteyli_alkogolcorenew' },
        { store: 'Пятёрочка', price: null, vol: 'каталог', url: 'https://5ka.ru/catalog/pivo-vino-energetiki--251C13047/' }
      ]
    }
  ];

  let html = '<thead><tr><th>Напиток</th>';
  stores.forEach(s => { html += `<th class="price-cell">${s}</th>`; });
  html += '</tr></thead><tbody>';

  products.forEach(p => {
    html += `<tr><td><div class="price-name">${p.name}</div><div class="price-detail">${p.detail}</div></td>`;
    p.prices.forEach(pr => {
      if (pr.price) {
        html += `<td class="price-cell"><a class="price-link" href="${pr.url}" target="_blank" rel="noopener"><span class="price-value">${pr.price}</span><span class="price-store-name">${pr.vol}</span></a></td>`;
      } else {
        html += `<td class="price-cell"><a class="price-link" href="${pr.url}" target="_blank" rel="noopener"><span class="price-na">каталог →</span></a></td>`;
      }
    });
    html += '</tr>';
  });

  html += '</tbody>';
  table.innerHTML = html;
}

function renderAll() {
  const r = calculate();
  renderKPIs(r);
  renderTable('beverages-table', r.beverages, 'л');
  renderTable('bread-table', r.bread, 'кг');
  renderTable('snacks-table', r.snacks, 'кг');
  if (state.salads) {
    renderTable('salads-table', r.salads, 'кг');
  }
  if (state.alcohol) {
    renderTable('alcohol-table', r.alcohol, 'л');
  }
  renderAlcoholSection();
  renderSaladsSection();
  renderPackaging(r);
  renderReserveBanner(r);
  renderGrandTotals(r);
  renderMarinades(r);
  renderPricesPage(r);
  renderKbzuPage(r);
  renderProductsPage();
}

// ============ EVENT HANDLERS ============

document.getElementById('guests').addEventListener('input', e => {
  state.guests = parseInt(e.target.value);
  document.getElementById('guests-val').textContent = state.guests;
  renderAll();
});

document.getElementById('duration').addEventListener('input', e => {
  state.duration = parseFloat(e.target.value);
  document.getElementById('duration-val').textContent = state.duration + ' ч';
  renderAll();
});

document.getElementById('reserve-bev').addEventListener('input', e => {
  state.reserveBevPct = parseInt(e.target.value);
  document.getElementById('reserve-bev-val').textContent = '+' + state.reserveBevPct + '%';
  renderAll();
});

document.getElementById('reserve-alc').addEventListener('input', e => {
  state.reserveAlcPct = parseInt(e.target.value);
  document.getElementById('reserve-alc-val').textContent = '+' + state.reserveAlcPct + '%';
  renderAll();
});

document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.type;
    const value = btn.dataset.value;
    document.querySelectorAll(`.toggle-btn[data-type="${type}"]`).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (type === 'event') state.eventType = value;
    if (type === 'weather') state.weather = value;
    renderAll();
  });
});

document.getElementById('alcohol').addEventListener('change', e => {
  state.alcohol = e.target.checked;
  renderAll();
});

document.getElementById('extra-guests').addEventListener('change', e => {
  state.extraGuests = e.target.checked;
  renderAll();
});

document.getElementById('salads').addEventListener('change', e => {
  state.salads = e.target.checked;
  renderAll();
});

// ============ TAB NAVIGATION ============
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.app-page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    if (page === 'products') {
      renderProductsPage();
      pullFromSync();
    }
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  });
});

// ============ PRICE DATA (сентябрь 2026) ============
const STORES = ['Лента', 'Дикси', 'Глобус', 'Магнит', 'Пятёрочка'];

const ALCOHOL_PRODUCTS = [
  {
    name: 'Ягермейстер',
    detail: 'Jägermeister, 35%',
    unitVolume: 0.5,
    minPricePerL: 1199.99 / 0.5,
    prices: [
      { store: 'Лента', price: '1 199,99 ₽', vol: '0,5 л', url: 'https://lenta.com/product/liker-desertnyjj-alk35-germaniya-05l-151768/' },
      { store: 'Дикси', price: null, vol: 'каталог', url: 'https://dixy.ru/catalog/alkogolnye-napitki/likery/' },
      { store: 'Глобус', price: '1 699,99 ₽', vol: '0,7 л', url: 'https://online.globus.ru/products/likyor-jagermeister-35--alk.-germaniya-07l-500927_ST' },
      { store: 'Магнит', price: '1 299,99 ₽', vol: '0,5 л', url: 'https://magnit.ru/product/1545500175-liker_jagermeister_35_500ml' },
      { store: 'Пятёрочка', price: null, vol: 'каталог', url: 'https://5ka.ru/catalog/pivo-vino-energetiki--251C13047/' }
    ]
  },
  {
    name: 'Бугульма',
    detail: 'Бальзам, 40%',
    unitVolume: 0.5,
    minPricePerL: 499.99 / 0.5,
    prices: [
      { store: 'Лента', price: '499,99 ₽', vol: '0,5 л', url: 'https://lenta.com/product/balzam-alk40-rossiya-05l-147784/' },
      { store: 'Дикси', price: null, vol: 'каталог', url: 'https://dixy.ru/catalog/alkogolnye-napitki/balzamy/' },
      { store: 'Глобус', price: null, vol: 'каталог', url: 'https://online.globus.ru/catalog/alkogol-1225631' },
      { store: 'Магнит', price: '579,99 ₽', vol: '0,5 л', url: 'https://magnit.ru/product/3009000025-balzam_bugulma_flyazhka_40_500ml' },
      { store: 'Пятёрочка', price: null, vol: 'каталог', url: 'https://5ka.ru/catalog/pivo-vino-energetiki--251C13047/' }
    ]
  },
  {
    name: 'Медовуха',
    detail: 'Пряная, 5–6%',
    unitVolume: 1.0,
    minPricePerL: 219.99,
    prices: [
      { store: 'Лента', price: '219,99 ₽', vol: '1 л', url: 'https://lenta.com/catalog/medovuha-22622/' },
      { store: 'Дикси', price: null, vol: 'каталог', url: 'https://dixy.ru/catalog/alkogolnye-napitki/kokteyli-sidr/medovukha/' },
      { store: 'Глобус', price: null, vol: 'каталог', url: 'https://online.globus.ru/catalog/alkogol-1225631/sidr-medovuxa-koktejli-2225647/medovuxa-31448175' },
      { store: 'Магнит', price: '239,99 ₽', vol: '1 л', url: 'https://magnit.ru/product/1000492488-medovyy_napitok_medovukha_pryanaya_tyemnaya_fil_nepas_5_8_1l' },
      { store: 'Пятёрочка', price: null, vol: 'каталог', url: 'https://5ka.ru/catalog/pivo-vino-energetiki--251C13047/' }
    ]
  },
  {
    name: 'Джин',
    detail: "Gordon's / Beefeater, 37,5–40%",
    unitVolume: 0.7,
    minPricePerL: 1499.99 / 0.7,
    prices: [
      { store: 'Лента', price: '1 499,99 ₽', vol: '0,7 л', url: 'https://lenta.com/catalog/dzhin-22605/' },
      { store: 'Дикси', price: null, vol: 'каталог', url: 'https://dixy.ru/catalog/alkogolnye-napitki/djin/' },
      { store: 'Глобус', price: null, vol: 'каталог', url: 'https://online.globus.ru/catalog/alkogol-1225631' },
      { store: 'Магнит', price: null, vol: 'каталог', url: 'https://magnit.ru/catalog/47267-balzam_kore_mm_gm' },
      { store: 'Пятёрочка', price: null, vol: 'каталог', url: 'https://5ka.ru/catalog/pivo-vino-energetiki--251C13047/' }
    ]
  },
  {
    name: 'Пиво',
    detail: 'Светлое, 4–5%',
    unitVolume: 0.45,
    minPricePerL: Math.min(79.99/0.43, 92.99/0.45, 69.99/0.45, 56.99/0.45),
    prices: [
      { store: 'Лента', price: '79,99 ₽', vol: '0,43 л', url: 'https://lenta.com/catalog/pivo-22610/' },
      { store: 'Дикси', price: '92,99 ₽', vol: '0,45 л', url: 'https://dixy.ru/catalog/alkogolnye-napitki/pivo/' },
      { store: 'Глобус', price: '69,99 ₽', vol: '0,45 л', url: 'https://online.globus.ru/catalog/alkogol-1225631/pivo-2225648' },
      { store: 'Магнит', price: '56,99 ₽', vol: '0,45 л', url: 'https://magnit.ru/catalog/41183-pivo_kokteyli_alkogolcorenew' },
      { store: 'Пятёрочка', price: null, vol: 'каталог', url: 'https://5ka.ru/catalog/pivo-vino-energetiki--251C13047/' }
    ]
  }
];

const SNACK_PRODUCTS = [
  {
    name: 'Чипсы',
    detail: "Lay's",
    minPricePerKg: (129.99 / 0.15), // approx per 150g pack -> per kg
    prices: [
      { store: 'Лента', price: '129,99 ₽', vol: 'пачка', url: 'https://lenta.com/catalog/chipsy-20196/' },
      { store: 'Дикси', price: null, vol: 'каталог', url: 'https://dixy.ru/' },
      { store: 'Глобус', price: null, vol: 'каталог', url: 'https://online.globus.ru/' },
      { store: 'Магнит', price: '184,99 ₽', vol: 'пачка', url: 'https://magnit.ru/catalog/107249-chipsy_copy' },
      { store: 'Пятёрочка', price: null, vol: 'каталог', url: 'https://5ka.ru/' }
    ]
  },
  {
    name: 'Начос',
    detail: 'Doritos, 135 г',
    minPricePerKg: (259.99 / 0.135),
    prices: [
      { store: 'Лента', price: '259,99 ₽', vol: '135 г', url: 'https://lenta.com/product/chipsy-kukuruznye-taco-pryanaya-paprika-turciya-135g-744664/' },
      { store: 'Дикси', price: null, vol: 'каталог', url: 'https://dixy.ru/' },
      { store: 'Глобус', price: null, vol: 'каталог', url: 'https://online.globus.ru/' },
      { store: 'Магнит', price: null, vol: 'каталог', url: 'https://magnit.ru/' },
      { store: 'Пятёрочка', price: null, vol: 'каталог', url: 'https://5ka.ru/' }
    ]
  },
  {
    name: 'Рыбные закуски',
    detail: 'Кальмар сушёный, 70 г',
    minPricePerKg: (229.99 / 0.07),
    prices: [
      { store: 'Лента', price: null, vol: 'каталог', url: 'https://lenta.com/' },
      { store: 'Дикси', price: null, vol: 'каталог', url: 'https://dixy.ru/' },
      { store: 'Глобус', price: null, vol: 'каталог', url: 'https://online.globus.ru/' },
      { store: 'Магнит', price: '229,99 ₽', vol: '70 г', url: 'https://magnit.ru/product/1000109917-koltsa_kalmara_sukhogruz_70g' },
      { store: 'Пятёрочка', price: null, vol: 'каталог', url: 'https://5ka.ru/' }
    ]
  }
];

const SALAD_PRODUCTS = [
  {
    name: 'Салаты (готовые)',
    detail: 'Овощные, мясные, рыбные — оценка',
    minPricePerKg: 150,
    prices: [
      { store: 'Лента', price: '~180 ₽', vol: 'за кг', url: 'https://lenta.com/catalog/salaty-20430/' },
      { store: 'Дикси', price: null, vol: 'каталог', url: 'https://dixy.ru/' },
      { store: 'Глобус', price: null, vol: 'каталог', url: 'https://online.globus.ru/' },
      { store: 'Магнит', price: '~150 ₽', vol: 'за кг', url: 'https://magnit.ru/catalog/salads' },
      { store: 'Пятёрочка', price: null, vol: 'каталог', url: 'https://5ka.ru/' }
    ]
  }
];

const MEAT_PRODUCTS = [
  {
    name: 'Свинина (шея)',
    detail: 'Без кости, охлаждённая',
    minPricePerKg: 599.99,
    prices: [
      { store: 'Лента', price: '599,99 ₽', vol: 'за кг', url: 'https://lenta.com/product/svinina-sheya-bez-kosti-kusok-ohlazhdennyjj-ves-rossiya-422842/' },
      { store: 'Дикси', price: null, vol: 'каталог', url: 'https://dixy.ru/' },
      { store: 'Глобус', price: null, vol: 'каталог', url: 'https://online.globus.ru/' },
      { store: 'Магнит', price: null, vol: 'каталог', url: 'https://magnit.ru/' },
      { store: 'Пятёрочка', price: null, vol: 'каталог', url: 'https://5ka.ru/' }
    ]
  },
  {
    name: 'Говядина',
    detail: 'Охлаждённая',
    minPricePerKg: 799.99,
    prices: [
      { store: 'Лента', price: '799,99 ₽', vol: 'за кг', url: 'https://lenta.com/catalog/govyadina-418/' },
      { store: 'Дикси', price: null, vol: 'каталог', url: 'https://dixy.ru/' },
      { store: 'Глобус', price: null, vol: 'каталог', url: 'https://online.globus.ru/' },
      { store: 'Магнит', price: null, vol: 'каталог', url: 'https://magnit.ru/' },
      { store: 'Пятёрочка', price: null, vol: 'каталог', url: 'https://5ka.ru/' }
    ]
  },
  {
    name: 'Курица (филе)',
    detail: 'Без кости',
    minPricePerKg: 354.99,
    prices: [
      { store: 'Лента', price: '354,99 ₽', vol: 'за кг', url: 'https://lenta.com/catalog/ptica-141/' },
      { store: 'Дикси', price: null, vol: 'каталог', url: 'https://dixy.ru/' },
      { store: 'Глобус', price: null, vol: 'каталог', url: 'https://online.globus.ru/' },
      { store: 'Магнит', price: null, vol: 'каталог', url: 'https://magnit.ru/' },
      { store: 'Пятёрочка', price: null, vol: 'каталог', url: 'https://5ka.ru/' }
    ]
  }
];

const MARINADE_PRODUCTS = [
  { name: 'Лук репчатый', detail: 'Фасованный, 1 кг', minPricePerKg: 89.99, store: 'Магнит', price: '89,99 ₽', vol: 'за кг', url: 'https://magnit.ru/product/3413351102-luk_repchatyy_fasovannyy_1kg' },
  { name: 'Помидоры', detail: 'Свежие', minPricePerKg: 69.99, store: 'Лента', price: '69,99 ₽', vol: 'за кг', url: 'https://lenta.com/catalog/tomaty-376/' },
  { name: 'Томатная паста', detail: 'Банка/тюба', minPricePerKg: 74.99, store: 'Лента', price: '74,99 ₽', vol: 'упаковка', url: 'https://lenta.com/catalog/tomatnaya-pasta-20837/' },
  { name: 'Лимон', detail: '2 шт', minPricePerKg: 89.99, store: 'Лента', price: '89,99 ₽', vol: '2 шт', url: 'https://lenta.com/product/limony-2sht-525353/' },
  { name: 'Чеснок', detail: 'За кг', minPricePerKg: 429.9, store: 'Магнит', price: '429,90 ₽', vol: 'за кг', url: 'https://magnit.ru/product/3412060011-chesnok' },
  { name: 'Соевый соус', detail: 'Бутылка', minPricePerKg: 79.99, store: 'Лента', price: '79,99 ₽', vol: 'упаковка', url: 'https://lenta.com/catalog/soevyjj-sous-20850/' },
  { name: 'Уксус 9%', detail: '1 л', minPricePerKg: 44.99, store: 'Магнит', price: '44,99 ₽', vol: '1 л', url: 'https://magnit.ru/product/1000208799-uksus_stolovyy_moya_tsena_9' },
  { name: 'Паприка', detail: 'Молотая', minPricePerKg: 59.99, store: 'Лента', price: '59,99 ₽', vol: 'упаковка', url: 'https://lenta.com/catalog/paprika-20892/' },
  { name: 'Соль', detail: 'За кг', minPricePerKg: 12.59, store: 'Магнит', price: '12,59 ₽', vol: 'за кг', url: 'https://magnit.ru/' },
  { name: 'Сахар', detail: 'За кг', minPricePerKg: 89.99, store: 'Магнит', price: '89,99 ₽', vol: 'за кг', url: 'https://magnit.ru/catalog/64153-testmmsakhar' },
  { name: 'Масло растительное', detail: '1 л', minPricePerKg: 109.99, store: 'Лента', price: '109,99 ₽', vol: '1 л', url: 'https://lenta.com/catalog/maslo-20826/' }
];

function renderMultiStorePriceTable(tableId, products) {
  const table = document.getElementById(tableId);
  if (!table) return;
  let html = '<thead><tr><th>Товар</th>';
  STORES.forEach(s => { html += `<th class="price-cell">${s}</th>`; });
  html += '</tr></thead><tbody>';

  products.forEach(p => {
    html += `<tr><td><div class="price-name">${p.name}</div><div class="price-detail">${p.detail}</div></td>`;
    p.prices.forEach(pr => {
      if (pr.price) {
        html += `<td class="price-cell"><a class="price-link" href="${pr.url}" target="_blank" rel="noopener"><span class="price-value">${pr.price}</span><span class="price-store-name">${pr.vol}</span></a></td>`;
      } else {
        html += `<td class="price-cell"><a class="price-link" href="${pr.url}" target="_blank" rel="noopener"><span class="price-na">каталог →</span></a></td>`;
      }
    });
    html += '</tr>';
  });

  html += '</tbody>';
  table.innerHTML = html;
}

function renderMarinadeIngredientTable() {
  const table = document.getElementById('price-table-marinade');
  if (!table) return;
  let html = `
    <thead>
      <tr>
        <th>Ингредиент</th>
        <th>Фасовка</th>
        <th class="price-cell">Лучшая цена</th>
        <th>Магазин</th>
      </tr>
    </thead>
    <tbody>
  `;
  MARINADE_PRODUCTS.forEach(p => {
    html += `
      <tr>
        <td><div class="price-name">${p.name}</div><div class="price-detail">${p.detail}</div></td>
        <td class="price-detail">${p.vol}</td>
        <td class="price-cell"><span class="price-value">${p.price}</span></td>
        <td><a class="price-link" style="display:inline" href="${p.url}" target="_blank" rel="noopener">${p.store} →</a></td>
      </tr>
    `;
  });
  html += '</tbody>';
  table.innerHTML = html;
}

// ============ COST ESTIMATION ============
function renderPricesPage(r) {
  renderMultiStorePriceTable('price-table-alcohol', ALCOHOL_PRODUCTS);
  renderMultiStorePriceTable('price-table-snacks', SNACK_PRODUCTS);
  renderMultiStorePriceTable('price-table-salads', SALAD_PRODUCTS);
  renderMultiStorePriceTable('price-table-meat', MEAT_PRODUCTS);
  renderMarinadeIngredientTable();

  // Cost breakdown based on calculator quantities
  const beerLiters = r.alcohol.beer ? r.alcohol.beer.total : 0;
  const spiritsLiters = r.alcohol.spirits ? r.alcohol.spirits.total : 0;
  // Spirits assumed to be a mix of Ягермейстер/Бугульма/Медовуха/Джин — use average of the four min per-liter prices
  const spiritsProducts = ALCOHOL_PRODUCTS.filter(p => p.name !== 'Пиво');
  const avgSpiritsPricePerL = spiritsProducts.reduce((s, p) => s + p.minPricePerL, 0) / spiritsProducts.length;
  const beerPricePerL = ALCOHOL_PRODUCTS.find(p => p.name === 'Пиво').minPricePerL;

  const chipsKg = r.snacks.chips ? r.snacks.chips.total : 0;
  const nachosKg = r.snacks.nachos ? r.snacks.nachos.total : 0;
  const fishKg = r.snacks.fishSnacks ? r.snacks.fishSnacks.total : 0;

  const saladsKg = (state.salads && r.salads.salads) ? r.salads.salads.total : 0;

  const meatKg = state.guests * 0.5;
  // Assume even split across the three meat types for the marinade section
  const meatKgEach = meatKg / 3;
  const avgMeatPricePerKg = MEAT_PRODUCTS.reduce((s, p) => s + p.minPricePerKg, 0) / MEAT_PRODUCTS.length;

  // Marinade ingredients scale with meat quantity (~250g onion + misc per kg of meat, approx)
  const marinadeCostPerKgMeat = 35; // approx blended cost of marinade ingredients per kg of meat
  const marinadeCost = meatKg * marinadeCostPerKgMeat;

  const breadKg = r.totalBreadKg;
  const breadCostPerKg = 300; // blended bread+bakery approx per kg (no direct price list given)

  const beverageCost = 0; // no price data provided for juice/soda — excluded from total

  const categories = [
    { name: 'Алкоголь — пиво', qty: beerLiters, unit: 'л', pricePerUnit: beerPricePerL, cost: beerLiters * beerPricePerL },
    { name: 'Алкоголь — крепкое', qty: spiritsLiters, unit: 'л', pricePerUnit: avgSpiritsPricePerL, cost: spiritsLiters * avgSpiritsPricePerL },
    { name: 'Закуски — чипсы', qty: chipsKg, unit: 'кг', pricePerUnit: SNACK_PRODUCTS[0].minPricePerKg, cost: chipsKg * SNACK_PRODUCTS[0].minPricePerKg },
    { name: 'Закуски — начос', qty: nachosKg, unit: 'кг', pricePerUnit: SNACK_PRODUCTS[1].minPricePerKg, cost: nachosKg * SNACK_PRODUCTS[1].minPricePerKg },
    { name: 'Закуски — рыбные', qty: fishKg, unit: 'кг', pricePerUnit: SNACK_PRODUCTS[2].minPricePerKg, cost: fishKg * SNACK_PRODUCTS[2].minPricePerKg },
    { name: 'Хлеб и выпечка', qty: breadKg, unit: 'кг', pricePerUnit: breadCostPerKg, cost: breadKg * breadCostPerKg },
    { name: 'Мясо для шашлыка', qty: meatKg, unit: 'кг', pricePerUnit: avgMeatPricePerKg, cost: meatKg * avgMeatPricePerKg },
    { name: 'Продукты для маринада', qty: meatKg, unit: 'кг мяса', pricePerUnit: marinadeCostPerKgMeat, cost: marinadeCost }
  ];

  if (state.salads) {
    categories.push({ name: 'Салаты', qty: saladsKg, unit: 'кг', pricePerUnit: SALAD_PRODUCTS[0].minPricePerKg, cost: saladsKg * SALAD_PRODUCTS[0].minPricePerKg });
  }

  const grandTotal = categories.reduce((s, c) => s + c.cost, 0);

  const breakdownTable = document.getElementById('cost-breakdown-table');
  let html = `
    <thead>
      <tr>
        <th>Категория</th>
        <th>Количество</th>
        <th>Стоимость</th>
      </tr>
    </thead>
    <tbody>
  `;
  categories.forEach(c => {
    html += `
      <tr>
        <td><div class="item-name">${c.name}</div><div class="item-detail">≈ ${fmt(c.pricePerUnit, 0)} ₽/${c.unit === 'кг мяса' ? 'кг' : c.unit}</div></td>
        <td>${fmt(c.qty, 2)} ${c.unit}</td>
        <td>${fmt(c.cost, 0)} ₽</td>
      </tr>
    `;
  });
  html += `
    <tr class="grand-total">
      <td>Итого</td>
      <td></td>
      <td>${fmt(grandTotal, 0)} ₽</td>
    </tr>
  `;
  html += '</tbody>';
  breakdownTable.innerHTML = html;

  document.getElementById('cost-total-value').textContent = fmt(grandTotal, 0) + ' ₽';
  document.getElementById('cost-per-guest-value').textContent = fmt(grandTotal / state.guests, 0) + ' ₽';
}

// ============ KBZU (калорийность/белки/жиры/углеводы) ============

// KBZU per 100g/100ml
const KBZU_DATA = {
  juice:      { name: 'Соки',             kcal: 45,  protein: 0.5, fat: 0.1, carbs: 11,   unitIsLiters: true },
  soda:       { name: 'Газировка',        kcal: 42,  protein: 0,   fat: 0,   carbs: 10.6, unitIsLiters: true },
  bread:      { name: 'Хлеб',             kcal: 265, protein: 7.5, fat: 3.2, carbs: 50,   unitIsLiters: false },
  bakery:     { name: 'Выпечка',          kcal: 350, protein: 6,   fat: 18,  carbs: 45,   unitIsLiters: false },
  chips:      { name: 'Чипсы',            kcal: 540, protein: 7,   fat: 34,  carbs: 56,   unitIsLiters: false },
  nachos:     { name: 'Начос',            kcal: 480, protein: 6,   fat: 24,  carbs: 60,   unitIsLiters: false },
  fishSnacks: { name: 'Рыбные закуски',  kcal: 290, protein: 40,  fat: 5,   carbs: 20,   unitIsLiters: false },
  salads:     { name: 'Салаты',           kcal: 150, protein: 4,   fat: 10,  carbs: 12,   unitIsLiters: false },
  beer:       { name: 'Пиво',             kcal: 45,  protein: 0.5, fat: 0,   carbs: 3.8,  unitIsLiters: true },
  spirits:    { name: 'Крепкое',          kcal: 230, protein: 0,   fat: 0,   carbs: 0,    unitIsLiters: true }
};

// Marinade meat + ingredients KBZU per 100g (raw)
const KBZU_MEAT = {
  pork: { name: 'Свинина (сырая)', kcal: 263, protein: 16, fat: 21, carbs: 0 },
  beef: { name: 'Говядина (сырая)', kcal: 187, protein: 26, fat: 8.5, carbs: 0 },
  chicken: { name: 'Курица филе (сырая)', kcal: 165, protein: 31, fat: 3.6, carbs: 0 }
};

const KBZU_MARINADE_INGREDIENTS = {
  onion: { name: 'Лук', kcal: 41, protein: 1.4, fat: 0.2, carbs: 8.2 },
  tomato: { name: 'Помидоры', kcal: 18, protein: 0.9, fat: 0.2, carbs: 3.9 },
  tomatoPaste: { name: 'Томатная паста', kcal: 82, protein: 4.8, fat: 0.5, carbs: 16 },
  lemon: { name: 'Лимон', kcal: 16, protein: 0.9, fat: 0.1, carbs: 3 },
  garlic: { name: 'Чеснок', kcal: 149, protein: 6.5, fat: 0.5, carbs: 30 },
  soySauce: { name: 'Соевый соус', kcal: 53, protein: 8, fat: 0.6, carbs: 4 }
};

// Custom dishes state (persists during session, not across reloads)
let customDishes = [];
let customDishIdCounter = 1;

function fmtKbzu(n) {
  return Math.round(n).toLocaleString('ru-RU');
}

function computeAutoKbzuItems(r) {
  const items = [];

  // Beverages (liters -> assume 1L = 1000g for juice/soda/beer/spirits)
  for (const [key, item] of Object.entries(r.beverages)) {
    const d = KBZU_DATA[key];
    if (!d) continue;
    const grams = item.total * 1000;
    items.push(makeKbzuItem(d.name, grams, d));
  }

  // Bread
  for (const [key, item] of Object.entries(r.bread)) {
    const d = KBZU_DATA[key];
    if (!d) continue;
    const grams = item.total * 1000;
    items.push(makeKbzuItem(d.name, grams, d));
  }

  // Snacks
  for (const [key, item] of Object.entries(r.snacks)) {
    const d = KBZU_DATA[key];
    if (!d) continue;
    const grams = item.total * 1000;
    items.push(makeKbzuItem(d.name, grams, d));
  }

  // Salads
  if (state.salads) {
    for (const [key, item] of Object.entries(r.salads)) {
      const d = KBZU_DATA[key];
      if (!d) continue;
      const grams = item.total * 1000;
      items.push(makeKbzuItem(d.name, grams, d));
    }
  }

  // Alcohol
  if (state.alcohol) {
    for (const [key, item] of Object.entries(r.alcohol)) {
      const d = KBZU_DATA[key];
      if (!d) continue;
      const grams = item.total * 1000;
      items.push(makeKbzuItem(d.name, grams, d));
    }
  }

  // Meat for shashlik (split evenly across pork/beef/chicken)
  const meatKg = state.guests * 0.5;
  const meatGramsEach = (meatKg * 1000) / 3;
  items.push(makeKbzuItem(KBZU_MEAT.pork.name, meatGramsEach, KBZU_MEAT.pork));
  items.push(makeKbzuItem(KBZU_MEAT.beef.name, meatGramsEach, KBZU_MEAT.beef));
  items.push(makeKbzuItem(KBZU_MEAT.chicken.name, meatGramsEach, KBZU_MEAT.chicken));

  // Marinade ingredients (scaled to meat quantity, ~250g onion per kg of meat as base recipe unit)
  const onionGrams = meatKg * 250;
  const tomatoGrams = meatKg * 60;
  const tomatoPasteGrams = meatKg * 25;
  const lemonGrams = meatKg * 40;
  const garlicGrams = meatKg * 10;
  const soySauceGrams = meatKg * 30;
  items.push(makeKbzuItem(KBZU_MARINADE_INGREDIENTS.onion.name, onionGrams, KBZU_MARINADE_INGREDIENTS.onion));
  items.push(makeKbzuItem(KBZU_MARINADE_INGREDIENTS.tomato.name, tomatoGrams, KBZU_MARINADE_INGREDIENTS.tomato));
  items.push(makeKbzuItem(KBZU_MARINADE_INGREDIENTS.tomatoPaste.name, tomatoPasteGrams, KBZU_MARINADE_INGREDIENTS.tomatoPaste));
  items.push(makeKbzuItem(KBZU_MARINADE_INGREDIENTS.lemon.name, lemonGrams, KBZU_MARINADE_INGREDIENTS.lemon));
  items.push(makeKbzuItem(KBZU_MARINADE_INGREDIENTS.garlic.name, garlicGrams, KBZU_MARINADE_INGREDIENTS.garlic));
  items.push(makeKbzuItem(KBZU_MARINADE_INGREDIENTS.soySauce.name, soySauceGrams, KBZU_MARINADE_INGREDIENTS.soySauce));

  return items.filter(it => it.weight > 0);
}

function makeKbzuItem(name, weightGrams, perHundred) {
  const factor = weightGrams / 100;
  return {
    name,
    weight: weightGrams,
    kcal: perHundred.kcal * factor,
    protein: perHundred.protein * factor,
    fat: perHundred.fat * factor,
    carbs: perHundred.carbs * factor
  };
}

function renderKbzuAutoTable(items) {
  const table = document.getElementById('kbzu-auto-table');
  let html = `
    <thead>
      <tr>
        <th>Продукт</th>
        <th>Вес</th>
        <th>Ккал</th>
        <th>Белки, г</th>
        <th>Жиры, г</th>
        <th>Углеводы, г</th>
      </tr>
    </thead>
    <tbody>
  `;
  items.forEach(it => {
    const weightLabel = it.weight >= 1000 ? fmt(it.weight / 1000, 2) + ' кг' : fmtKbzu(it.weight) + ' г';
    html += `
      <tr>
        <td class="item-name">${it.name}</td>
        <td>${weightLabel}</td>
        <td class="macro-k">${fmtKbzu(it.kcal)}</td>
        <td class="macro-p">${fmtKbzu(it.protein)}</td>
        <td class="macro-f">${fmtKbzu(it.fat)}</td>
        <td class="macro-c">${fmtKbzu(it.carbs)}</td>
      </tr>
    `;
  });
  const totals = items.reduce((acc, it) => ({
    kcal: acc.kcal + it.kcal, protein: acc.protein + it.protein, fat: acc.fat + it.fat, carbs: acc.carbs + it.carbs
  }), { kcal: 0, protein: 0, fat: 0, carbs: 0 });
  html += `
    <tr class="total-row">
      <td>Итого по калькулятору</td>
      <td></td>
      <td class="macro-k">${fmtKbzu(totals.kcal)}</td>
      <td class="macro-p">${fmtKbzu(totals.protein)}</td>
      <td class="macro-f">${fmtKbzu(totals.fat)}</td>
      <td class="macro-c">${fmtKbzu(totals.carbs)}</td>
    </tr>
  `;
  html += '</tbody>';
  table.innerHTML = html;
  return totals;
}

function renderKbzuCustomTable() {
  const table = document.getElementById('kbzu-custom-table');
  if (customDishes.length === 0) {
    table.innerHTML = '<tbody><tr><td class="empty-state">Своих блюд пока нет. Добавьте первое выше.</td></tr></tbody>';
    return { kcal: 0, protein: 0, fat: 0, carbs: 0 };
  }

  let html = `
    <thead>
      <tr>
        <th>Блюдо</th>
        <th>Вес</th>
        <th>Ккал</th>
        <th>Белки, г</th>
        <th>Жиры, г</th>
        <th>Углеводы, г</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
  `;

  let totals = { kcal: 0, protein: 0, fat: 0, carbs: 0 };
  customDishes.forEach(dish => {
    const factor = dish.weight / 100;
    const kcal = dish.kcal100 * factor;
    const protein = dish.protein100 * factor;
    const fat = dish.fat100 * factor;
    const carbs = dish.carbs100 * factor;
    totals.kcal += kcal; totals.protein += protein; totals.fat += fat; totals.carbs += carbs;
    html += `
      <tr>
        <td class="item-name">${dish.name}<span class="custom-dish-badge">своё</span></td>
        <td>${fmtKbzu(dish.weight)} г</td>
        <td class="macro-k">${fmtKbzu(kcal)}</td>
        <td class="macro-p">${fmtKbzu(protein)}</td>
        <td class="macro-f">${fmtKbzu(fat)}</td>
        <td class="macro-c">${fmtKbzu(carbs)}</td>
        <td><button class="btn-remove" data-remove-id="${dish.id}" title="Удалить">✕</button></td>
      </tr>
    `;
  });

  html += `
    <tr class="total-row">
      <td>Итого своих блюд</td>
      <td></td>
      <td class="macro-k">${fmtKbzu(totals.kcal)}</td>
      <td class="macro-p">${fmtKbzu(totals.protein)}</td>
      <td class="macro-f">${fmtKbzu(totals.fat)}</td>
      <td class="macro-c">${fmtKbzu(totals.carbs)}</td>
      <td></td>
    </tr>
  `;
  html += '</tbody>';
  table.innerHTML = html;

  table.querySelectorAll('[data-remove-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.removeId);
      customDishes = customDishes.filter(d => d.id !== id);
      renderKbzuPage(calculate());
    });
  });

  return totals;
}

function renderKbzuPage(r) {
  const autoItems = computeAutoKbzuItems(r);
  const autoTotals = renderKbzuAutoTable(autoItems);
  const customTotals = renderKbzuCustomTable();

  const grandTotals = {
    kcal: autoTotals.kcal + customTotals.kcal,
    protein: autoTotals.protein + customTotals.protein,
    fat: autoTotals.fat + customTotals.fat,
    carbs: autoTotals.carbs + customTotals.carbs
  };

  const summaryGrid = document.getElementById('kbzu-summary-grid');
  const summaryItems = [
    { label: 'Калории (всего)', value: fmtKbzu(grandTotals.kcal), unit: 'ккал', color: 'primary' },
    { label: 'Белки (всего)', value: fmtKbzu(grandTotals.protein), unit: 'г', color: 'blue' },
    { label: 'Жиры (всего)', value: fmtKbzu(grandTotals.fat), unit: 'г', color: 'warning' },
    { label: 'Углеводы (всего)', value: fmtKbzu(grandTotals.carbs), unit: 'г', color: 'success' }
  ];
  summaryGrid.innerHTML = summaryItems.map(s => `
    <div class="kpi-card accent-${s.color}">
      <div class="kpi-value"><span class="kpi-num">${s.value}</span><span class="kpi-unit">${s.unit}</span></div>
      <div class="kpi-label">${s.label}</div>
    </div>
  `).join('');

  const perPersonGrid = document.getElementById('kbzu-per-person-grid');
  const perPersonItems = [
    { title: 'Калории на гостя', value: fmtKbzu(grandTotals.kcal / state.guests), unit: 'ккал', color: 'primary' },
    { title: 'Белки на гостя', value: fmtKbzu(grandTotals.protein / state.guests), unit: 'г', color: 'blue' },
    { title: 'Жиры на гостя', value: fmtKbzu(grandTotals.fat / state.guests), unit: 'г', color: 'warning' },
    { title: 'Углеводы на гостя', value: fmtKbzu(grandTotals.carbs / state.guests), unit: 'г', color: 'success' }
  ];
  perPersonGrid.innerHTML = perPersonItems.map(i => `
    <div class="summary-card accent-${i.color}">
      <div class="summary-card-title">${i.title}</div>
      <div class="summary-card-value text-${i.color}">${i.value} ${i.unit}</div>
    </div>
  `).join('');
}

// ============ DISH KBZU DATABASE (518 dishes) ============
const DISH_KBZU_DB = {
'абрикос': { kcal: 48, p: 1.2, f: 0.1, c: 11 },
  'авокадо': { kcal: 160, p: 2, f: 15, c: 9 },
  'аджапсандали': { kcal: 80, p: 2, f: 4, c: 10 },
  'аджика': { kcal: 60, p: 2, f: 1, c: 12 },
  'азу': { kcal: 180, p: 11, f: 11, c: 8 },
  'ананас': { kcal: 52, p: 0.5, f: 0.1, c: 13 },
  'апельсин': { kcal: 47, p: 0.9, f: 0.1, c: 12 },
  'арахис': { kcal: 567, p: 26, f: 49, c: 16 },
  'арбуз': { kcal: 38, p: 0.6, f: 0.2, c: 9 },
  'ачма': { kcal: 250, p: 8, f: 12, c: 28 },
  'багет': { kcal: 270, p: 8, f: 3, c: 52 },
  'бажа': { kcal: 150, p: 8, f: 12, c: 5 },
  'базилик': { kcal: 27, p: 2.5, f: 0.6, c: 5 },
  'баклажан': { kcal: 24, p: 1, f: 0.2, c: 5 },
  'баклажанная икра': { kcal: 100, p: 2, f: 5, c: 12 },
  'баклажаны жареные': { kcal: 130, p: 1, f: 10, c: 8 },
  'балкарский пирог': { kcal: 220, p: 7, f: 9, c: 28 },
  'банан': { kcal: 95, p: 1.5, f: 0.1, c: 22 },
  'баранина тушёная': { kcal: 200, p: 15, f: 15, c: 4 },
  'бастурма': { kcal: 200, p: 20, f: 12, c: 1 },
  'батон': { kcal: 260, p: 7, f: 3, c: 50 },
  'баурсак': { kcal: 330, p: 7, f: 15, c: 45 },
  'безе': { kcal: 310, p: 5, f: 2, c: 70 },
  'беляши': { kcal: 260, p: 10, f: 15, c: 22 },
  'бефстроганов': { kcal: 200, p: 12, f: 12, c: 8 },
  'бешбармак': { kcal: 180, p: 10, f: 10, c: 12 },
  'биг мак': { kcal: 265, p: 11, f: 14, c: 30 },
  'бигус': { kcal: 120, p: 5, f: 8, c: 8 },
  'биточки': { kcal: 200, p: 10, f: 12, c: 10 },
  'бифштекс': { kcal: 200, p: 15, f: 12, c: 5 },
  'бифштекс рубленый': { kcal: 220, p: 12, f: 15, c: 8 },
  'блинчики': { kcal: 190, p: 5, f: 8, c: 24 },
  'блины': { kcal: 190, p: 5, f: 8, c: 24 },
  'блины с икрой': { kcal: 260, p: 10, f: 14, c: 20 },
  'блины с мясом': { kcal: 230, p: 8, f: 12, c: 22 },
  'блины с творогом': { kcal: 200, p: 8, f: 9, c: 22 },
  'борщ': { kcal: 49, p: 2, f: 2.5, c: 6 },
  'брокколи': { kcal: 28, p: 3, f: 0.5, c: 5 },
  'брускетта': { kcal: 220, p: 6, f: 8, c: 30 },
  'брынза': { kcal: 260, p: 18, f: 20, c: 2 },
  'брюква': { kcal: 37, p: 1.2, f: 0.1, c: 8 },
  'брюссельская капуста': { kcal: 43, p: 4, f: 1, c: 9 },
  'булгур': { kcal: 83, p: 3, f: 0.5, c: 19 },
  'булочка': { kcal: 260, p: 7, f: 4, c: 50 },
  'бургер': { kcal: 295, p: 17, f: 14, c: 24 },
  'бутерброд': { kcal: 250, p: 8, f: 12, c: 28 },
  'бутерброд горячий': { kcal: 280, p: 9, f: 14, c: 30 },
  'бутерброд с икрой': { kcal: 280, p: 10, f: 14, c: 22 },
  'бутерброд с колбасой': { kcal: 250, p: 8, f: 12, c: 28 },
  'бутерброд с рыбой': { kcal: 200, p: 8, f: 9, c: 22 },
  'бутерброд с сыром': { kcal: 230, p: 8, f: 10, c: 26 },
  'варенец': { kcal: 67, p: 3, f: 4, c: 5 },
  'вареники': { kcal: 155, p: 4, f: 3, c: 25 },
  'вареники с вишней': { kcal: 180, p: 4, f: 3, c: 32 },
  'вареники с картофелем': { kcal: 155, p: 4, f: 3, c: 25 },
  'вареники с творогом': { kcal: 210, p: 8, f: 6, c: 28 },
  'васаби': { kcal: 100, p: 5, f: 1, c: 20 },
  'вафли': { kcal: 350, p: 6, f: 20, c: 40 },
  'вафли бельгийские': { kcal: 370, p: 7, f: 22, c: 40 },
  'вермишель': { kcal: 138, p: 4, f: 2, c: 25 },
  'ветчина': { kcal: 145, p: 18, f: 6, c: 2 },
  'ветчина в тесте': { kcal: 250, p: 10, f: 15, c: 20 },
  'винегрет': { kcal: 130, p: 3, f: 7, c: 15 },
  'виноград': { kcal: 73, p: 0.6, f: 0.2, c: 18 },
  'вишня': { kcal: 52, p: 0.8, f: 0.2, c: 12 },
  'вымя': { kcal: 173, p: 12, f: 14, c: 3 },
  'галушки': { kcal: 180, p: 5, f: 5, c: 25 },
  'гамбургер': { kcal: 295, p: 17, f: 14, c: 24 },
  'гаспачо': { kcal: 44, p: 1.5, f: 2, c: 6 },
  'говядина тушёная': { kcal: 180, p: 15, f: 12, c: 5 },
  'голубцы': { kcal: 140, p: 6, f: 8, c: 12 },
  'голубцы ленивые': { kcal: 150, p: 7, f: 8, c: 12 },
  'гоми': { kcal: 90, p: 2, f: 3, c: 16 },
  'горбуша': { kcal: 142, p: 20, f: 6.5, c: 0 },
  'горбуша консервированная': { kcal: 145, p: 21, f: 6, c: 0 },
  'гороховое пюре': { kcal: 115, p: 7, f: 1, c: 18 },
  'гороховый суп': { kcal: 66, p: 4, f: 2, c: 9 },
  'горошек консервированный': { kcal: 55, p: 3, f: 0.5, c: 10 },
  'горчица': { kcal: 130, p: 5, f: 5, c: 12 },
  'гренки': { kcal: 280, p: 8, f: 8, c: 42 },
  'гренки с чесноком': { kcal: 280, p: 8, f: 8, c: 42 },
  'гренки сладкие': { kcal: 300, p: 8, f: 12, c: 42 },
  'грецкие орехи': { kcal: 656, p: 15, f: 65, c: 14 },
  'греческий салат': { kcal: 107, p: 3, f: 9, c: 6 },
  'гречка': { kcal: 132, p: 4, f: 2, c: 25 },
  'гречка варёная': { kcal: 132, p: 4, f: 2, c: 25 },
  'грибной суп': { kcal: 55, p: 2, f: 3, c: 6 },
  'грибы жареные': { kcal: 150, p: 4, f: 10, c: 8 },
  'грибы маринованные': { kcal: 25, p: 2, f: 0.5, c: 4 },
  'грибы тушёные': { kcal: 120, p: 3, f: 7, c: 6 },
  'груша': { kcal: 57, p: 0.4, f: 0.1, c: 15 },
  'гуляш': { kcal: 170, p: 12, f: 10, c: 6 },
  'гуляш из говядины': { kcal: 170, p: 12, f: 10, c: 6 },
  'гуляш из свинины': { kcal: 210, p: 12, f: 14, c: 6 },
  'долма': { kcal: 120, p: 4, f: 7, c: 10 },
  'донер кебаб': { kcal: 215, p: 13, f: 12, c: 16 },
  'драники': { kcal: 180, p: 4, f: 9, c: 22 },
  'дымляма': { kcal: 100, p: 5, f: 6, c: 8 },
  'дыня': { kcal: 35, p: 0.6, f: 0.3, c: 8 },
  'ежевика': { kcal: 43, p: 1.4, f: 0.5, c: 10 },
  'жареная картошка': { kcal: 203, p: 3, f: 10, c: 24 },
  'желе': { kcal: 60, p: 2, f: 0, c: 14 },
  'жульен': { kcal: 180, p: 10, f: 14, c: 5 },
  'жульен с грибами': { kcal: 160, p: 7, f: 12, c: 5 },
  'жульен с курицей': { kcal: 180, p: 10, f: 14, c: 5 },
  'заливное': { kcal: 120, p: 12, f: 6, c: 2 },
  'заливное из мяса': { kcal: 140, p: 13, f: 8, c: 2 },
  'заливное из рыбы': { kcal: 90, p: 10, f: 4, c: 1 },
  'запеканка картофельная': { kcal: 150, p: 4, f: 8, c: 16 },
  'запеканка макаронная': { kcal: 170, p: 5, f: 8, c: 18 },
  'запеканка творожная': { kcal: 180, p: 10, f: 8, c: 16 },
  'зелёный лук': { kcal: 33, p: 1.5, f: 0.2, c: 7 },
  'зефир': { kcal: 300, p: 1, f: 0.5, c: 73 },
  'изюм': { kcal: 299, p: 3, f: 0.5, c: 79 },
  'икра баклажанная': { kcal: 100, p: 2, f: 5, c: 12 },
  'икра кабачковая': { kcal: 97, p: 2, f: 5, c: 11 },
  'икра красная': { kcal: 250, p: 30, f: 15, c: 2 },
  'икра чёрная': { kcal: 260, p: 28, f: 17, c: 2 },
  'индейка жареная': { kcal: 165, p: 28, f: 5, c: 0 },
  'индейка запечённая': { kcal: 140, p: 25, f: 4, c: 0 },
  'инжир': { kcal: 249, p: 4, f: 1, c: 64 },
  'йогурт': { kcal: 87, p: 4, f: 3.5, c: 10 },
  'йогурт натуральный': { kcal: 60, p: 4, f: 1.5, c: 6 },
  'кабачки жареные': { kcal: 120, p: 1, f: 8, c: 8 },
  'кабачковая икра': { kcal: 97, p: 2, f: 5, c: 11 },
  'кабачок': { kcal: 24, p: 0.6, f: 0.3, c: 5 },
  'какао': { kcal: 70, p: 3, f: 3, c: 10 },
  'кальмары варёные': { kcal: 92, p: 18, f: 1.2, c: 3 },
  'кальмары жареные': { kcal: 140, p: 15, f: 8, c: 4 },
  'канапе': { kcal: 220, p: 7, f: 11, c: 24 },
  'капрезе': { kcal: 180, p: 8, f: 14, c: 6 },
  'капуста квашеная': { kcal: 27, p: 2, f: 0.1, c: 5 },
  'капуста маринованная': { kcal: 50, p: 1.5, f: 2, c: 6 },
  'капуста тушёная': { kcal: 90, p: 2, f: 6, c: 8 },
  'карамель': { kcal: 380, p: 1, f: 8, c: 80 },
  'карбонара': { kcal: 250, p: 10, f: 14, c: 22 },
  'картофель варёный': { kcal: 82, p: 2, f: 0.4, c: 17 },
  'картофель жареный': { kcal: 203, p: 3, f: 10, c: 24 },
  'картофель запечённый': { kcal: 93, p: 2, f: 0.1, c: 21 },
  'картофель тушёный': { kcal: 130, p: 3, f: 6, c: 15 },
  'картофель фри': { kcal: 310, p: 4, f: 15, c: 41 },
  'картофельное пюре': { kcal: 106, p: 2, f: 4, c: 15 },
  'картофельное рагу': { kcal: 120, p: 3, f: 6, c: 14 },
  'каша гречневая': { kcal: 132, p: 4, f: 2, c: 25 },
  'каша манная': { kcal: 98, p: 3, f: 1, c: 20 },
  'каша овсяная': { kcal: 88, p: 3, f: 2, c: 14 },
  'каша рисовая': { kcal: 130, p: 3, f: 1, c: 28 },
  'квас': { kcal: 27, p: 0.1, f: 0, c: 6 },
  'квашеная капуста': { kcal: 27, p: 2, f: 0.1, c: 5 },
  'кекс': { kcal: 350, p: 5, f: 15, c: 55 },
  'кексы': { kcal: 350, p: 5, f: 15, c: 55 },
  'кесадилья': { kcal: 250, p: 9, f: 14, c: 24 },
  'кетчуп': { kcal: 93, p: 1.8, f: 0.1, c: 22 },
  'кефир': { kcal: 51, p: 3, f: 1.5, c: 4 },
  'кешью': { kcal: 553, p: 18, f: 44, c: 30 },
  'киви': { kcal: 61, p: 1.1, f: 0.5, c: 15 },
  'кинза': { kcal: 23, p: 2, f: 0.5, c: 4 },
  'кисель': { kcal: 80, p: 0.1, f: 0, c: 20 },
  'клецки': { kcal: 180, p: 5, f: 5, c: 25 },
  'клубника': { kcal: 32, p: 0.7, f: 0.3, c: 8 },
  'клёцки картофельные': { kcal: 150, p: 4, f: 5, c: 22 },
  'кнедлики': { kcal: 200, p: 6, f: 6, c: 28 },
  'кнедлики картофельные': { kcal: 150, p: 4, f: 5, c: 22 },
  'колбаса варёная': { kcal: 260, p: 12, f: 22, c: 2 },
  'колбаса копчёная': { kcal: 320, p: 15, f: 26, c: 2 },
  'компот': { kcal: 60, p: 0.1, f: 0, c: 15 },
  'конфеты': { kcal: 400, p: 3, f: 15, c: 65 },
  'котлеты': { kcal: 250, p: 12, f: 18, c: 10 },
  'котлеты куриные': { kcal: 180, p: 15, f: 9, c: 8 },
  'котлеты рыбные': { kcal: 160, p: 14, f: 8, c: 7 },
  'котлеты свиные': { kcal: 280, p: 13, f: 22, c: 8 },
  'кофе': { kcal: 2, p: 0.2, f: 0, c: 0 },
  'крабовый салат': { kcal: 150, p: 6, f: 9, c: 13 },
  'креветки варёные': { kcal: 95, p: 20, f: 1, c: 0 },
  'креветки жареные': { kcal: 180, p: 18, f: 10, c: 2 },
  'крутоны': { kcal: 330, p: 10, f: 3, c: 65 },
  'крыжовник': { kcal: 44, p: 0.7, f: 0.2, c: 12 },
  'кукуруза варёная': { kcal: 96, p: 3, f: 1, c: 21 },
  'кукуруза консервированная': { kcal: 103, p: 3, f: 1, c: 22 },
  'кулич': { kcal: 330, p: 8, f: 15, c: 45 },
  'купаты': { kcal: 280, p: 14, f: 22, c: 8 },
  'курага': { kcal: 232, p: 5, f: 1, c: 55 },
  'куриная грудка': { kcal: 113, p: 23, f: 2, c: 0 },
  'куриное филе': { kcal: 113, p: 23, f: 2, c: 0 },
  'куриные котлеты': { kcal: 180, p: 15, f: 9, c: 8 },
  'куриные крылышки': { kcal: 220, p: 19, f: 16, c: 0 },
  'куриные ножки': { kcal: 170, p: 20, f: 9, c: 0 },
  'курица варёная': { kcal: 135, p: 25, f: 5, c: 0 },
  'курица гриль': { kcal: 165, p: 31, f: 3.6, c: 0 },
  'курица жареная': { kcal: 210, p: 26, f: 12, c: 0 },
  'курица запечённая': { kcal: 160, p: 27, f: 6, c: 0 },
  'курица тушёная': { kcal: 150, p: 20, f: 7, c: 3 },
  'кускус': { kcal: 112, p: 4, f: 1, c: 23 },
  'кутаиси': { kcal: 200, p: 7, f: 10, c: 22 },
  'кюфта': { kcal: 200, p: 10, f: 14, c: 12 },
  'лаваш': { kcal: 270, p: 9, f: 1, c: 55 },
  'лаваш тонкий': { kcal: 270, p: 9, f: 1, c: 55 },
  'лагман': { kcal: 120, p: 5, f: 5, c: 13 },
  'лазанья': { kcal: 230, p: 10, f: 12, c: 20 },
  'лапша': { kcal: 138, p: 4, f: 2, c: 25 },
  'лапша куриная': { kcal: 48, p: 3, f: 2, c: 5 },
  'лапша удон': { kcal: 130, p: 5, f: 2, c: 23 },
  'ленивые вареники': { kcal: 200, p: 8, f: 7, c: 24 },
  'лепёшка': { kcal: 250, p: 7, f: 4, c: 48 },
  'лимонад': { kcal: 42, p: 0, f: 0, c: 10 },
  'лобио': { kcal: 130, p: 5, f: 7, c: 13 },
  'лобио из фасоли': { kcal: 130, p: 5, f: 7, c: 13 },
  'лосось': { kcal: 208, p: 20, f: 13, c: 0 },
  'лук репчатый': { kcal: 41, p: 1.4, f: 0.2, c: 8.2 },
  'люля-кебаб': { kcal: 240, p: 12, f: 18, c: 10 },
  'майонез': { kcal: 680, p: 2, f: 72, c: 3 },
  'макароны': { kcal: 158, p: 5, f: 1, c: 31 },
  'макароны отварные': { kcal: 158, p: 5, f: 1, c: 31 },
  'малина': { kcal: 46, p: 0.8, f: 0.5, c: 11 },
  'манго': { kcal: 60, p: 0.8, f: 0.4, c: 15 },
  'мандарин': { kcal: 53, p: 0.8, f: 0.3, c: 13 },
  'манты': { kcal: 220, p: 9, f: 10, c: 22 },
  'манты паровые': { kcal: 200, p: 9, f: 9, c: 20 },
  'мармелад': { kcal: 310, p: 1, f: 0.5, c: 75 },
  'мастава': { kcal: 70, p: 4, f: 3, c: 5 },
  'меренги': { kcal: 310, p: 5, f: 2, c: 70 },
  'мидии': { kcal: 77, p: 11, f: 2, c: 4 },
  'мимоза': { kcal: 180, p: 7, f: 14, c: 10 },
  'миндаль': { kcal: 645, p: 18, f: 58, c: 13 },
  'минестроне': { kcal: 40, p: 2, f: 1.5, c: 6 },
  'минтай': { kcal: 72, p: 15, f: 1, c: 0 },
  'молоко': { kcal: 52, p: 3, f: 3.2, c: 5 },
  'морковь': { kcal: 41, p: 1.4, f: 0.2, c: 8.2 },
  'мороженое': { kcal: 210, p: 4, f: 12, c: 24 },
  'мороженое пломбир': { kcal: 230, p: 4, f: 14, c: 24 },
  'мороженое шоколадное': { kcal: 250, p: 4, f: 14, c: 28 },
  'морс': { kcal: 50, p: 0.1, f: 0, c: 12 },
  'мусс': { kcal: 150, p: 3, f: 7, c: 20 },
  'мчади': { kcal: 230, p: 4, f: 3, c: 48 },
  'мясо тушёное': { kcal: 180, p: 15, f: 12, c: 5 },
  'начос': { kcal: 480, p: 6, f: 24, c: 60 },
  'ньокки': { kcal: 150, p: 4, f: 4, c: 24 },
  'овощи гриль': { kcal: 80, p: 2, f: 4, c: 10 },
  'овощи тушёные': { kcal: 80, p: 2, f: 4, c: 8 },
  'овсянка': { kcal: 88, p: 3, f: 2, c: 14 },
  'огурцы': { kcal: 15, p: 0.8, f: 0.1, c: 3 },
  'огурцы маринованные': { kcal: 15, p: 1, f: 0.1, c: 2 },
  'огурцы солёные': { kcal: 11, p: 0.8, f: 0.1, c: 2 },
  'оду': { kcal: 130, p: 10, f: 8, c: 5 },
  'окрошка': { kcal: 67, p: 3, f: 3.5, c: 6 },
  'окрошка на квасе': { kcal: 67, p: 3, f: 3.5, c: 6 },
  'оладьи': { kcal: 225, p: 6, f: 10, c: 28 },
  'оливье': { kcal: 197, p: 5, f: 15, c: 11 },
  'омлет': { kcal: 150, p: 11, f: 12, c: 4 },
  'омлет с сыром': { kcal: 180, p: 13, f: 14, c: 4 },
  'опята жареные': { kcal: 140, p: 3, f: 9, c: 7 },
  'орехи': { kcal: 650, p: 15, f: 60, c: 20 },
  'отбивная куриная': { kcal: 200, p: 18, f: 11, c: 8 },
  'отбивные': { kcal: 300, p: 14, f: 22, c: 12 },
  'ош парвардо': { kcal: 180, p: 8, f: 10, c: 15 },
  'пад тай': { kcal: 180, p: 7, f: 8, c: 22 },
  'паста': { kcal: 220, p: 8, f: 8, c: 32 },
  'пастила': { kcal: 324, p: 1, f: 0.5, c: 80 },
  'пасха': { kcal: 310, p: 8, f: 16, c: 38 },
  'паэлья': { kcal: 150, p: 7, f: 5, c: 18 },
  'пельмени': { kcal: 275, p: 12, f: 12, c: 25 },
  'пепперони': { kcal: 310, p: 20, f: 25, c: 2 },
  'перец болгарский': { kcal: 31, p: 1, f: 0.3, c: 6 },
  'перец фаршированный': { kcal: 100, p: 4, f: 5, c: 10 },
  'перловка': { kcal: 109, p: 3, f: 0.5, c: 23 },
  'персик': { kcal: 39, p: 0.9, f: 0.1, c: 10 },
  'петрушка': { kcal: 49, p: 3, f: 0.5, c: 10 },
  'печень говяжья': { kcal: 127, p: 18, f: 4, c: 4 },
  'печень куриная': { kcal: 140, p: 20, f: 6.5, c: 1 },
  'печень тушёная': { kcal: 130, p: 15, f: 6, c: 6 },
  'печенье': { kcal: 420, p: 7, f: 18, c: 60 },
  'пирог': { kcal: 250, p: 7, f: 12, c: 30 },
  'пирог осетинский': { kcal: 220, p: 7, f: 9, c: 28 },
  'пирог с капустой': { kcal: 220, p: 6, f: 10, c: 28 },
  'пирог с картошкой': { kcal: 210, p: 6, f: 9, c: 28 },
  'пирог с мясом': { kcal: 280, p: 9, f: 14, c: 30 },
  'пирог с рыбой': { kcal: 240, p: 8, f: 11, c: 27 },
  'пирог с яблоками': { kcal: 230, p: 5, f: 9, c: 34 },
  'пирожки жареные': { kcal: 280, p: 8, f: 16, c: 28 },
  'пирожки печёные': { kcal: 230, p: 7, f: 10, c: 30 },
  'пирожное': { kcal: 350, p: 5, f: 18, c: 45 },
  'пирожное картошка': { kcal: 380, p: 6, f: 20, c: 48 },
  'пирожное корзиночка': { kcal: 350, p: 5, f: 18, c: 45 },
  'питта': { kcal: 275, p: 9, f: 1, c: 55 },
  'пицца': { kcal: 260, p: 9, f: 11, c: 30 },
  'пицца гавайская': { kcal: 240, p: 9, f: 9, c: 28 },
  'пицца маргарита': { kcal: 250, p: 9, f: 10, c: 30 },
  'пицца пепперони': { kcal: 290, p: 11, f: 13, c: 30 },
  'пицца четыре сыра': { kcal: 280, p: 11, f: 13, c: 28 },
  'плов': { kcal: 205, p: 7, f: 10, c: 23 },
  'плов с говядиной': { kcal: 210, p: 7, f: 11, c: 23 },
  'плов с курицей': { kcal: 200, p: 7, f: 10, c: 23 },
  'плов со свининой': { kcal: 230, p: 8, f: 12, c: 23 },
  'плов узбекский': { kcal: 210, p: 7, f: 11, c: 23 },
  'помидоры солёные': { kcal: 13, p: 1, f: 0.1, c: 2 },
  'помидоры черри': { kcal: 15, p: 0.9, f: 0.1, c: 3 },
  'почки': { kcal: 66, p: 13, f: 2.5, c: 0 },
  'простокваша': { kcal: 53, p: 3, f: 2.5, c: 4 },
  'пряники': { kcal: 335, p: 5, f: 8, c: 65 },
  'пудинг': { kcal: 220, p: 5, f: 10, c: 28 },
  'пхали': { kcal: 150, p: 4, f: 10, c: 12 },
  'пшено': { kcal: 120, p: 4, f: 1, c: 26 },
  'пюре': { kcal: 106, p: 2, f: 4, c: 15 },
  'рагу овощное': { kcal: 80, p: 2, f: 4, c: 8 },
  'раки варёные': { kcal: 87, p: 18, f: 1, c: 0 },
  'рамен': { kcal: 110, p: 5, f: 4, c: 14 },
  'рассольник': { kcal: 46, p: 2, f: 2, c: 5 },
  'редис': { kcal: 20, p: 1, f: 0.1, c: 4 },
  'репа': { kcal: 32, p: 1.5, f: 0.1, c: 7 },
  'ризотто': { kcal: 160, p: 5, f: 6, c: 22 },
  'рис': { kcal: 130, p: 3, f: 1, c: 28 },
  'рис варёный': { kcal: 130, p: 3, f: 1, c: 28 },
  'рис плов': { kcal: 200, p: 7, f: 10, c: 23 },
  'роллы': { kcal: 180, p: 6, f: 3, c: 30 },
  'роллы калифорния': { kcal: 180, p: 6, f: 5, c: 27 },
  'роллы с лососем': { kcal: 190, p: 7, f: 4, c: 30 },
  'роллы филадельфия': { kcal: 200, p: 8, f: 6, c: 28 },
  'ромштекс': { kcal: 220, p: 11, f: 14, c: 12 },
  'рубец': { kcal: 97, p: 14, f: 4, c: 2 },
  'руккола': { kcal: 25, p: 2.6, f: 0.7, c: 3.7 },
  'рулет куриный': { kcal: 180, p: 14, f: 11, c: 6 },
  'рулет мясной': { kcal: 220, p: 12, f: 16, c: 8 },
  'рыба варёная': { kcal: 90, p: 17, f: 2, c: 0 },
  'рыба жареная': { kcal: 180, p: 17, f: 10, c: 5 },
  'рыба запечённая': { kcal: 130, p: 18, f: 6, c: 0 },
  'рыбный суп': { kcal: 40, p: 3, f: 1, c: 4 },
  'ряженка': { kcal: 67, p: 3, f: 4, c: 5 },
  'ряженка 4%': { kcal: 67, p: 3, f: 4, c: 5 },
  'сайра консервированная': { kcal: 180, p: 18, f: 12, c: 0 },
  'салат греческий': { kcal: 107, p: 3, f: 9, c: 6 },
  'салат из капусты': { kcal: 50, p: 1.5, f: 2.5, c: 6 },
  'салат из моркови': { kcal: 75, p: 1.5, f: 4, c: 8 },
  'салат из огурцов': { kcal: 40, p: 1, f: 2, c: 4 },
  'салат из помидоров': { kcal: 35, p: 1, f: 1.5, c: 5 },
  'салат из редиски': { kcal: 45, p: 1.5, f: 2, c: 4 },
  'салат из свёклы': { kcal: 80, p: 2, f: 4, c: 8 },
  'салат листовой': { kcal: 14, p: 1, f: 0.2, c: 2 },
  'салат мимоза': { kcal: 180, p: 7, f: 14, c: 10 },
  'салат овощной': { kcal: 50, p: 1.5, f: 2.5, c: 6 },
  'салат оливье': { kcal: 197, p: 5, f: 15, c: 11 },
  'салат с ананасом': { kcal: 110, p: 4, f: 7, c: 9 },
  'салат с ветчиной': { kcal: 160, p: 7, f: 12, c: 8 },
  'салат с грибами': { kcal: 120, p: 4, f: 9, c: 8 },
  'салат с колбасой': { kcal: 170, p: 6, f: 13, c: 9 },
  'салат с крабовыми палочками': { kcal: 150, p: 6, f: 9, c: 13 },
  'салат с креветками': { kcal: 130, p: 10, f: 7, c: 6 },
  'салат с курицей': { kcal: 120, p: 10, f: 6, c: 7 },
  'салат с печенью': { kcal: 130, p: 8, f: 8, c: 7 },
  'салат с сухариками': { kcal: 180, p: 5, f: 12, c: 15 },
  'салат с тунцом': { kcal: 140, p: 10, f: 8, c: 8 },
  'салат с фасолью': { kcal: 150, p: 6, f: 7, c: 14 },
  'салат с языком': { kcal: 140, p: 8, f: 9, c: 7 },
  'сало': { kcal: 630, p: 3, f: 65, c: 0 },
  'сало копчёное': { kcal: 650, p: 3, f: 67, c: 0 },
  'сало солёное': { kcal: 630, p: 3, f: 65, c: 0 },
  'салями': { kcal: 336, p: 22, f: 26, c: 2 },
  'самса': { kcal: 260, p: 8, f: 14, c: 26 },
  'сарделька': { kcal: 230, p: 11, f: 20, c: 2 },
  'сардельки': { kcal: 230, p: 11, f: 20, c: 2 },
  'сардина консервированная': { kcal: 208, p: 24, f: 12, c: 0 },
  'сарма': { kcal: 130, p: 5, f: 8, c: 10 },
  'сациви': { kcal: 180, p: 12, f: 13, c: 4 },
  'свинина тушёная': { kcal: 230, p: 14, f: 18, c: 5 },
  'свёкла': { kcal: 42, p: 1.5, f: 0.1, c: 9 },
  'сельдерей': { kcal: 32, p: 1, f: 0.2, c: 7 },
  'сельдь': { kcal: 158, p: 17, f: 10, c: 0 },
  'сельдь под шубой': { kcal: 208, p: 8, f: 17, c: 5 },
  'сельдь солёная': { kcal: 217, p: 17, f: 17, c: 0 },
  'селёдка': { kcal: 158, p: 17, f: 10, c: 0 },
  'селёдка под шубой': { kcal: 208, p: 8, f: 17, c: 5 },
  'семечки': { kcal: 584, p: 21, f: 51, c: 21 },
  'сердце говяжье': { kcal: 96, p: 16, f: 3.5, c: 0 },
  'скумбрия': { kcal: 191, p: 18, f: 13, c: 0 },
  'скумбрия солёная': { kcal: 190, p: 15, f: 14, c: 0 },
  'слива': { kcal: 46, p: 0.7, f: 0.3, c: 11 },
  'сметана': { kcal: 206, p: 3, f: 20, c: 3 },
  'сметана 20%': { kcal: 206, p: 3, f: 20, c: 3 },
  'смородина': { kcal: 44, p: 1, f: 0.2, c: 11 },
  'смузи': { kcal: 60, p: 1, f: 0.5, c: 14 },
  'сок апельсиновый': { kcal: 45, p: 0.7, f: 0.2, c: 11 },
  'сок томатный': { kcal: 18, p: 1, f: 0.1, c: 4 },
  'сок яблочный': { kcal: 46, p: 0.5, f: 0.1, c: 11 },
  'солянка': { kcal: 79, p: 4, f: 4.5, c: 6 },
  'солянка грибная': { kcal: 60, p: 2, f: 3, c: 6 },
  'солянка мясная': { kcal: 79, p: 4, f: 4.5, c: 6 },
  'сомса': { kcal: 260, p: 8, f: 14, c: 26 },
  'сосиски': { kcal: 226, p: 12, f: 19, c: 2 },
  'сосиски в тесте': { kcal: 280, p: 9, f: 16, c: 26 },
  'соус барбекю': { kcal: 150, p: 1, f: 5, c: 25 },
  'соус бешамель': { kcal: 140, p: 4, f: 10, c: 10 },
  'соус грибной': { kcal: 120, p: 3, f: 8, c: 10 },
  'соус карри': { kcal: 130, p: 3, f: 8, c: 13 },
  'соус песто': { kcal: 260, p: 5, f: 24, c: 6 },
  'соус соевый': { kcal: 53, p: 8, f: 0.6, c: 4 },
  'соус сырный': { kcal: 250, p: 8, f: 22, c: 6 },
  'соус тартар': { kcal: 250, p: 3, f: 24, c: 5 },
  'соус томатный': { kcal: 80, p: 1.5, f: 0.5, c: 18 },
  'соус чесночный': { kcal: 300, p: 2, f: 30, c: 5 },
  'спагетти': { kcal: 158, p: 5, f: 1, c: 31 },
  'спагетти болоньезе': { kcal: 190, p: 8, f: 8, c: 22 },
  'студень': { kcal: 180, p: 15, f: 12, c: 1 },
  'судак': { kcal: 84, p: 18, f: 1, c: 0 },
  'суджук': { kcal: 250, p: 18, f: 18, c: 2 },
  'суп куриный': { kcal: 36, p: 3, f: 1.5, c: 4 },
  'суп пюре': { kcal: 65, p: 3, f: 3, c: 7 },
  'сухари': { kcal: 330, p: 10, f: 3, c: 65 },
  'сухарики': { kcal: 330, p: 10, f: 3, c: 65 },
  'суши': { kcal: 150, p: 5, f: 1, c: 30 },
  'сыр': { kcal: 350, p: 25, f: 27, c: 2 },
  'сыр мягкий': { kcal: 260, p: 18, f: 20, c: 2 },
  'сыр твёрдый': { kcal: 350, p: 25, f: 27, c: 2 },
  'сырники': { kcal: 220, p: 12, f: 10, c: 18 },
  'сырники творожные': { kcal: 220, p: 12, f: 10, c: 18 },
  'сёмга': { kcal: 208, p: 20, f: 13, c: 0 },
  'тако': { kcal: 220, p: 8, f: 12, c: 22 },
  'тарталетки': { kcal: 250, p: 7, f: 12, c: 28 },
  'тарталетки с икрой': { kcal: 280, p: 8, f: 14, c: 24 },
  'тарталетки с салатом': { kcal: 220, p: 6, f: 11, c: 26 },
  'творог': { kcal: 155, p: 16, f: 9, c: 3 },
  'творог 5%': { kcal: 121, p: 17, f: 5, c: 2 },
  'творог 9%': { kcal: 185, p: 14, f: 9, c: 3 },
  'тефтели': { kcal: 200, p: 10, f: 12, c: 10 },
  'тефтели в соусе': { kcal: 190, p: 10, f: 11, c: 10 },
  'тирамису': { kcal: 310, p: 6, f: 18, c: 32 },
  'том ям': { kcal: 40, p: 3, f: 2, c: 3 },
  'томаты': { kcal: 18, p: 0.9, f: 0.2, c: 3.9 },
  'топинамбур': { kcal: 73, p: 2, f: 0.2, c: 17 },
  'торт': { kcal: 350, p: 5, f: 18, c: 45 },
  'торт красный бархат': { kcal: 370, p: 5, f: 18, c: 48 },
  'торт медовик': { kcal: 375, p: 6, f: 18, c: 50 },
  'торт наполеон': { kcal: 380, p: 6, f: 20, c: 48 },
  'торт прага': { kcal: 420, p: 7, f: 24, c: 45 },
  'торт птичье молоко': { kcal: 350, p: 6, f: 18, c: 45 },
  'треска': { kcal: 69, p: 15, f: 0.5, c: 0 },
  'тунец': { kcal: 130, p: 24, f: 4, c: 0 },
  'тунец консервированный': { kcal: 120, p: 22, f: 4, c: 0 },
  'тушёная капуста': { kcal: 90, p: 2, f: 6, c: 8 },
  'тыква': { kcal: 22, p: 1, f: 0.1, c: 5 },
  'тыквенный суп': { kcal: 28, p: 1.5, f: 1, c: 4 },
  'укроп': { kcal: 43, p: 2, f: 0.5, c: 9 },
  'устрицы': { kcal: 68, p: 9, f: 2, c: 5 },
  'утка жареная': { kcal: 240, p: 18, f: 20, c: 0 },
  'ухá': { kcal: 46, p: 3, f: 1.5, c: 3 },
  'фалафель': { kcal: 320, p: 13, f: 17, c: 31 },
  'фасоль варёная': { kcal: 127, p: 7, f: 0.5, c: 22 },
  'фасоль консервированная': { kcal: 100, p: 5, f: 0.5, c: 18 },
  'фахитос': { kcal: 150, p: 10, f: 7, c: 12 },
  'финики': { kcal: 292, p: 3, f: 0.5, c: 75 },
  'фисташки': { kcal: 562, p: 20, f: 45, c: 28 },
  'форель': { kcal: 168, p: 20, f: 8, c: 0 },
  'фрикадельки': { kcal: 210, p: 11, f: 13, c: 9 },
  'фундук': { kcal: 628, p: 15, f: 61, c: 17 },
  'халва': { kcal: 540, p: 12, f: 30, c: 52 },
  'харчо': { kcal: 85, p: 5, f: 4, c: 7 },
  'хачапури': { kcal: 250, p: 9, f: 12, c: 28 },
  'хачапури по-аджарски': { kcal: 280, p: 10, f: 14, c: 28 },
  'хачапури по-имеретински': { kcal: 250, p: 9, f: 12, c: 28 },
  'хинкали': { kcal: 200, p: 10, f: 8, c: 22 },
  'хинкали грузинские': { kcal: 200, p: 10, f: 8, c: 22 },
  'хлеб белый': { kcal: 265, p: 7.5, f: 3.2, c: 50 },
  'хлеб лаваш': { kcal: 270, p: 9, f: 1, c: 55 },
  'хлеб ржаной': { kcal: 200, p: 6, f: 2, c: 40 },
  'хлеб чёрный': { kcal: 200, p: 6, f: 2, c: 40 },
  'холодец': { kcal: 180, p: 15, f: 12, c: 1 },
  'хот-дог': { kcal: 290, p: 10, f: 16, c: 26 },
  'хрен': { kcal: 50, p: 2, f: 0.5, c: 10 },
  'хумус': { kcal: 166, p: 8, f: 10, c: 14 },
  'хычин': { kcal: 230, p: 8, f: 10, c: 27 },
  'цветная капуста': { kcal: 30, p: 3, f: 0.5, c: 5 },
  'цезарь': { kcal: 190, p: 15, f: 12, c: 8 },
  'цезарь с курицей': { kcal: 190, p: 15, f: 12, c: 8 },
  'цыплёнок табака': { kcal: 180, p: 22, f: 9, c: 0 },
  'чай': { kcal: 1, p: 0, f: 0, c: 0 },
  'чак-чак': { kcal: 360, p: 7, f: 15, c: 55 },
  'чак-чак медовый': { kcal: 360, p: 7, f: 15, c: 55 },
  'чанахи': { kcal: 120, p: 7, f: 8, c: 6 },
  'чахохбили': { kcal: 130, p: 9, f: 7, c: 5 },
  'чахохбили из курицы': { kcal: 130, p: 9, f: 7, c: 5 },
  'чебурек': { kcal: 260, p: 9, f: 16, c: 21 },
  'чебуреки': { kcal: 260, p: 9, f: 16, c: 21 },
  'черешня': { kcal: 50, p: 1, f: 0.3, c: 11 },
  'чернослив': { kcal: 256, p: 2, f: 1, c: 64 },
  'чеснок': { kcal: 149, p: 6.5, f: 0.5, c: 30 },
  'чечевица варёная': { kcal: 111, p: 9, f: 0.4, c: 20 },
  'чечевичный суп': { kcal: 60, p: 3, f: 1.5, c: 8 },
  'чизбургер': { kcal: 310, p: 17, f: 16, c: 25 },
  'чизкейк': { kcal: 320, p: 7, f: 20, c: 30 },
  'чипсы': { kcal: 540, p: 7, f: 34, c: 56 },
  'чипсы картофельные': { kcal: 540, p: 7, f: 34, c: 56 },
  'шаверма': { kcal: 200, p: 12, f: 11, c: 15 },
  'шампиньоны жареные': { kcal: 150, p: 4, f: 10, c: 8 },
  'шаурма': { kcal: 200, p: 12, f: 11, c: 15 },
  'шашлык': { kcal: 263, p: 16, f: 21, c: 0 },
  'шашлык из баранины': { kcal: 225, p: 17, f: 17, c: 0 },
  'шашлык из говядины': { kcal: 187, p: 26, f: 8.5, c: 0 },
  'шашлык из индейки': { kcal: 165, p: 28, f: 4, c: 0 },
  'шашлык из курицы': { kcal: 165, p: 31, f: 3.6, c: 0 },
  'шашлык из свинины': { kcal: 263, p: 16, f: 21, c: 0 },
  'шварма': { kcal: 200, p: 12, f: 11, c: 15 },
  'шницель': { kcal: 250, p: 12, f: 16, c: 12 },
  'шоколад': { kcal: 540, p: 7, f: 34, c: 56 },
  'шпецле': { kcal: 300, p: 8, f: 8, c: 50 },
  'шпик': { kcal: 630, p: 3, f: 65, c: 0 },
  'шпинат': { kcal: 22, p: 2.9, f: 0.4, c: 3.6 },
  'шпроты': { kcal: 362, p: 17, f: 32, c: 0.5 },
  'шурпа': { kcal: 60, p: 4, f: 3, c: 4 },
  'щавель': { kcal: 22, p: 1.5, f: 0.3, c: 4 },
  'щи': { kcal: 30, p: 1.5, f: 1.5, c: 4 },
  'щука': { kcal: 82, p: 18, f: 0.5, c: 0 },
  'эклер': { kcal: 340, p: 5, f: 20, c: 38 },
  'эларджи': { kcal: 180, p: 5, f: 8, c: 22 },
  'яблоко': { kcal: 52, p: 0.3, f: 0.2, c: 14 },
  'язык говяжий': { kcal: 173, p: 16, f: 12, c: 2 },
  'язык свиной': { kcal: 165, p: 15, f: 12, c: 2 },
  'яичница': { kcal: 180, p: 14, f: 15, c: 1 },
  'яичница-болтунья': { kcal: 160, p: 12, f: 13, c: 1 },
  'яйцо варёное': { kcal: 155, p: 13, f: 11, c: 1 },
  'ёжики': { kcal: 180, p: 9, f: 10, c: 10 },
};

// Populate datalist with all dish names
(function populateDishSuggestions() {
  const datalist = document.getElementById('dish-suggestions');
  datalist.innerHTML = Object.keys(DISH_KBZU_DB).map(name => `<option value="${name}">`).join('');
})();

// Fuzzy search: find dishes matching the typed text (partial match, case-insensitive)
function findDishMatches(query) {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];
  const matches = [];
  for (const [name, data] of Object.entries(DISH_KBZU_DB)) {
    if (name.includes(q) || q.includes(name)) {
      matches.push({ name, data });
    }
  }
  // Sort: prefer exact match, then starts-with, then contains
  matches.sort((a, b) => {
    const aExact = a.name === q ? 0 : 1;
    const bExact = b.name === q ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;
    const aStart = a.name.startsWith(q) ? 0 : 1;
    const bStart = b.name.startsWith(q) ? 0 : 1;
    if (aStart !== bStart) return aStart - bStart;
    return a.name.length - b.name.length;
  });
  return matches;
}

// Auto-fill KBZU/100g when dish name matches database
function autoFillDishKbzu() {
  const name = document.getElementById('dish-name').value.trim();
  const matches = findDishMatches(name);
  
  // Update datalist to show filtered matches
  const datalist = document.getElementById('dish-suggestions');
  if (matches.length > 0) {
    datalist.innerHTML = matches.slice(0, 20).map(m => `<option value="${m.name}">`).join('');
    // Auto-fill with the best match
    const best = matches[0];
    document.getElementById('dish-kcal').value = best.data.kcal;
    document.getElementById('dish-protein').value = best.data.p;
    document.getElementById('dish-fat').value = best.data.f;
    document.getElementById('dish-carbs').value = best.data.c;
    // Brief highlight effect
    ['dish-kcal', 'dish-protein', 'dish-fat', 'dish-carbs'].forEach(id => {
      const el = document.getElementById(id);
      el.style.transition = 'background 200ms';
      el.style.background = 'var(--color-primary-highlight)';
      setTimeout(() => { el.style.background = ''; }, 600);
    });
  }
  updateDishPreview();
}

// Live preview calculation
function updateDishPreview() {
  const name = document.getElementById('dish-name').value.trim();
  const weight = parseFloat(document.getElementById('dish-weight').value);
  const kcal100 = parseFloat(document.getElementById('dish-kcal').value);
  const protein100 = parseFloat(document.getElementById('dish-protein').value);
  const fat100 = parseFloat(document.getElementById('dish-fat').value);
  const carbs100 = parseFloat(document.getElementById('dish-carbs').value);

  const preview = document.getElementById('dish-preview');
  const hasName = name.length > 0;
  const hasWeight = weight > 0;
  const hasKbzu = !isNaN(kcal100) && !isNaN(protein100) && !isNaN(fat100) && !isNaN(carbs100);

  if (!hasName && !hasWeight) {
    preview.style.display = 'none';
    return;
  }

  preview.style.display = 'block';
  document.getElementById('dish-preview-name').textContent = name || '—';

  if (hasWeight && hasKbzu) {
    const factor = weight / 100;
    document.getElementById('dish-preview-kcal').textContent = fmtKbzu(kcal100 * factor);
    document.getElementById('dish-preview-protein').textContent = fmtKbzu(protein100 * factor) + ' г';
    document.getElementById('dish-preview-fat').textContent = fmtKbzu(fat100 * factor) + ' г';
    document.getElementById('dish-preview-carbs').textContent = fmtKbzu(carbs100 * factor) + ' г';
  } else {
    document.getElementById('dish-preview-kcal').textContent = '—';
    document.getElementById('dish-preview-protein').textContent = '—';
    document.getElementById('dish-preview-fat').textContent = '—';
    document.getElementById('dish-preview-carbs').textContent = '—';
  }
}

document.getElementById('dish-name').addEventListener('input', autoFillDishKbzu);
document.getElementById('dish-weight').addEventListener('input', updateDishPreview);
document.getElementById('dish-kcal').addEventListener('input', updateDishPreview);
document.getElementById('dish-protein').addEventListener('input', updateDishPreview);
document.getElementById('dish-fat').addEventListener('input', updateDishPreview);
document.getElementById('dish-carbs').addEventListener('input', updateDishPreview);

document.getElementById('add-dish-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('dish-name').value.trim();
  const weight = parseFloat(document.getElementById('dish-weight').value);
  const kcal100 = parseFloat(document.getElementById('dish-kcal').value);
  const protein100 = parseFloat(document.getElementById('dish-protein').value);
  const fat100 = parseFloat(document.getElementById('dish-fat').value);
  const carbs100 = parseFloat(document.getElementById('dish-carbs').value);

  if (!name || !(weight > 0) || isNaN(kcal100) || isNaN(protein100) || isNaN(fat100) || isNaN(carbs100)) return;

  customDishes.push({ id: customDishIdCounter++, name, weight, kcal100, protein100, fat100, carbs100 });
  e.target.reset();
  document.getElementById('dish-preview').style.display = 'none';
  renderKbzuPage(calculate());
});

// ============ PRODUCTS PAGE WITH SYNC ============

// Static hosting mode: no backend server, uses localStorage only
const SYNC_API = null;

// Product categories derived from calculator items + shashlik ingredients
const PRODUCT_CATEGORIES = [
  {
    title: 'Мясо и шашлык',
    icon: '🥩',
    items: [
      { id: 'porkNeck', name: 'Свиная шея', detail: 'для шашлыка', unit: 'кг', calcKey: null, calcUnit: 'кг' },
      { id: 'beef', name: 'Говядина', detail: 'для шашлыка', unit: 'кг', calcKey: null, calcUnit: 'кг' },
      { id: 'chicken', name: 'Курица', detail: 'бедра, голени, крылья', unit: 'кг', calcKey: null, calcUnit: 'кг' }
    ]
  },
  {
    title: 'Овощи для маринада',
    icon: '🧅',
    items: [
      { id: 'onion', name: 'Лук репчатый', detail: 'для маринада', unit: 'кг', calcKey: null, calcUnit: 'кг' },
      { id: 'tomato', name: 'Помидоры', detail: 'для гриля', unit: 'кг', calcKey: null, calcUnit: 'кг' },
      { id: 'lemon', name: 'Лимоны', detail: 'для маринада и подачи', unit: 'шт', calcKey: null, calcUnit: 'шт' },
      { id: 'spices', name: 'Специи', detail: 'соль, перец, кориандр', unit: 'уп', calcKey: null, calcUnit: 'уп' }
    ]
  },
  {
    title: 'Напитки безалкогольные',
    icon: '🥤',
    items: [
      { id: 'juice', name: 'Соки', detail: 'фруктовые соки', unit: 'л', calcKey: 'juice', calcUnit: 'л' },
      { id: 'soda', name: 'Газировка', detail: 'кола, лимонад, тоник', unit: 'л', calcKey: 'soda', calcUnit: 'л' }
    ]
  },
  {
    title: 'Хлеб и выпечка',
    icon: '🍞',
    items: [
      { id: 'bread', name: 'Хлеб', detail: 'булочки, багет, нарезной', unit: 'кг', calcKey: 'bread', calcUnit: 'кг' },
      { id: 'bakery', name: 'Выпечка', detail: 'слоёное, круассаны', unit: 'кг', calcKey: 'bakery', calcUnit: 'кг' }
    ]
  },
  {
    title: 'Закуски',
    icon: '🍿',
    items: [
      { id: 'chips', name: 'Чипсы', detail: 'с разными вкусами', unit: 'кг', calcKey: 'chips', calcUnit: 'кг' },
      { id: 'nachos', name: 'Начос', detail: 'с соусами', unit: 'кг', calcKey: 'nachos', calcUnit: 'кг' },
      { id: 'fishSnacks', name: 'Рыбные закуски', detail: 'кальмары, рыба', unit: 'кг', calcKey: 'fishSnacks', calcUnit: 'кг' }
    ]
  },
  {
    title: 'Салаты',
    icon: '🥗',
    items: [
      { id: 'salads', name: 'Салаты', detail: 'овощные, мясные, рыбные', unit: 'кг', calcKey: 'salads', calcUnit: 'кг' }
    ]
  },
  {
    title: 'Алкоголь',
    icon: '🍺',
    items: [
      { id: 'beer', name: 'Пиво', detail: 'разливное и бутылочное', unit: 'л', calcKey: 'beer', calcUnit: 'л' },
      { id: 'spirits', name: 'Крепкое', detail: 'коктейли и в чистом виде', unit: 'л', calcKey: 'spirits', calcUnit: 'л' }
    ]
  },
  {
    title: 'Дополнительно',
    icon: '📦',
    items: [
      { id: 'charcoal', name: 'Уголь', detail: 'для мангала', unit: 'уп', calcKey: null, calcUnit: 'уп' },
      { id: 'skewers', name: 'Шампуры', detail: 'металлические', unit: 'шт', calcKey: null, calcUnit: 'шт' },
      { id: 'plates', name: 'Одноразовая посуда', detail: 'тарелки, вилки, стаканы', unit: 'уп', calcKey: null, calcUnit: 'уп' },
      { id: 'napkins', name: 'Салфетки', detail: 'бумажные', unit: 'уп', calcKey: null, calcUnit: 'уп' },
      { id: 'ice', name: 'Лёд', detail: 'для напитков', unit: 'уп', calcKey: null, calcUnit: 'уп' }
    ]
  }
];

// State for product quantities
let productQty = {};  // { itemId: { qty: number, bought: boolean } }
let syncIntervalId = null;
let lastSyncTime = 0;

// In-memory fallback for localStorage (works in restricted iframes)
const _memStore = {};
function safeLocalStorage() {
  try {
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch (e) {}
  return {
    getItem: (k) => _memStore[k] ?? null,
    setItem: (k, v) => { _memStore[k] = v; },
    removeItem: (k) => { delete _memStore[k]; }
  };
}

// Load from localStorage as fallback
function loadProductQtyLocal() {
  try {
    productQty = JSON.parse(safeLocalStorage().getItem('productQty') || '{}');
  } catch (e) {
    productQty = {};
  }
}

function saveProductQtyLocal() {
  try {
    safeLocalStorage().setItem('productQty', JSON.stringify(productQty));
  } catch (e) {}
}

// Get calculated value from calculator for a product
function getCalcValue(calcKey, calcUnit) {
  if (!calcKey) return null;
  const r = calculate();
  const allItems = { ...r.beverages, ...r.bread, ...r.snacks, ...r.salads, ...r.alcohol };
  const item = allItems[calcKey];
  if (!item) return null;
  return { value: item.total, unit: calcUnit };
}

// Render products page
function renderProductsPage() {
  const container = document.getElementById('products-list');
  if (!container) return;

  let html = '';
  let totalItems = 0;
  let boughtItems = 0;

  for (const cat of PRODUCT_CATEGORIES) {
    let rowsHtml = '';
    for (const item of cat.items) {
      const saved = productQty[item.id] || { qty: 0, bought: false };
      const calc = getCalcValue(item.calcKey, item.calcUnit);
      const calcText = calc ? `Калькулятор: ${fmt(calc.value, 1)} ${calc.unit}` : '';
      const qty = saved.qty || 0;
      const bought = saved.bought ? 'bought' : '';
      const boughtClass = saved.bought ? 'bought' : '';
      if (bought) boughtItems++;
      totalItems++;

      rowsHtml += `
        <div class="product-row ${boughtClass}" data-item-id="${item.id}">
          <div class="product-info">
            <div class="product-name">${item.name}</div>
            <div class="product-detail">${item.detail}</div>
          </div>
          <div class="product-calc">${calcText}</div>
          <div class="qty-controls">
            <button class="qty-btn" onclick="adjustQty('${item.id}', -1)">−</button>
            <input type="number" class="qty-input" id="qty-${item.id}" value="${qty}" min="0" step="1" onchange="setQty('${item.id}', this.value)">
            <span class="qty-unit">${item.unit}</span>
          </div>
          <div class="product-bought ${boughtClass}" onclick="toggleBought('${item.id}')"></div>
        </div>
      `;
    }

    html += `
      <div class="product-category">
        <div class="product-category-header">
          <span style="font-size: 1.5rem;">${cat.icon}</span>
          ${cat.title}
        </div>
        ${rowsHtml}
      </div>
    `;
  }

  container.innerHTML = html;

  // Render summary
  const summaryGrid = document.getElementById('products-summary-grid');
  if (summaryGrid) {
    const remaining = totalItems - boughtItems;
    summaryGrid.innerHTML = `
      <div class="summary-item">
        <span class="summary-label">Всего позиций</span>
        <span class="summary-value">${totalItems}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Куплено</span>
        <span class="summary-value" style="color: #22c55e;">${boughtItems}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Осталось</span>
        <span class="summary-value" style="color: #f59e0b;">${remaining}</span>
      </div>
    `;
  }
}

// Adjust quantity by delta
function adjustQty(itemId, delta) {
  const saved = productQty[itemId] || { qty: 0, bought: false };
  saved.qty = Math.max(0, (saved.qty || 0) + delta);
  productQty[itemId] = saved;
  const input = document.getElementById('qty-' + itemId);
  if (input) input.value = saved.qty;
  saveProductQtyLocal();
  pushToSync();
  updateSummaryOnly();
}

// Set quantity directly
function setQty(itemId, value) {
  const val = Math.max(0, parseInt(value) || 0);
  const saved = productQty[itemId] || { qty: 0, bought: false };
  saved.qty = val;
  productQty[itemId] = saved;
  saveProductQtyLocal();
  pushToSync();
  updateSummaryOnly();
}

// Toggle bought status
function toggleBought(itemId) {
  const saved = productQty[itemId] || { qty: 0, bought: false };
  saved.bought = !saved.bought;
  productQty[itemId] = saved;
  saveProductQtyLocal();
  renderProductsPage();
  pushToSync();
}

// Update only summary (without full re-render)
function updateSummaryOnly() {
  let totalItems = 0;
  let boughtItems = 0;
  for (const cat of PRODUCT_CATEGORIES) {
    for (const item of cat.items) {
      totalItems++;
      if (productQty[item.id]?.bought) boughtItems++;
    }
  }
  const summaryGrid = document.getElementById('products-summary-grid');
  if (summaryGrid) {
    const remaining = totalItems - boughtItems;
    summaryGrid.innerHTML = `
      <div class="summary-item">
        <span class="summary-label">Всего позиций</span>
        <span class="summary-value">${totalItems}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Куплено</span>
        <span class="summary-value" style="color: #22c55e;">${boughtItems}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Осталось</span>
        <span class="summary-value" style="color: #f59e0b;">${remaining}</span>
      </div>
    `;
  }
}

// ============ SYNC LOGIC ============

function setSyncStatus(status, text) {
  const dot = document.getElementById('sync-dot');
  const txt = document.getElementById('sync-text');
  if (dot) dot.className = 'sync-dot ' + status;
  if (txt) txt.textContent = text;
}

// Push local changes (localStorage-only on static hosting)
let pushTimeout = null;
function pushToSync() {
  setSyncStatus('connected', 'Локально');
  if (pushTimeout) clearTimeout(pushTimeout);
  pushTimeout = setTimeout(() => {
    saveProductQtyLocal();
    setSyncStatus('connected', 'Сохранено');
    lastSyncTime = Date.now();
  }, 300);
}

// Pull from server (no-op on static hosting, uses localStorage)
async function pullFromSync() {
  setSyncStatus('connected', 'Локально');
  lastSyncTime = Date.now();
}

// Manual sync
async function syncProducts(manual) {
  if (manual) {
    setSyncStatus('syncing', 'Обновление...');
  }
  await pullFromSync();
}

// Reset all products (localStorage-only on static hosting)
async function resetProducts() {
  if (!confirm('Сбросить все количества и отметки о покупке?')) return;
  productQty = {};
  saveProductQtyLocal();
  renderProductsPage();
  setSyncStatus('connected', 'Сброшено');
}

// Initialize products page
function initProductsPage() {
  loadProductQtyLocal();
  renderProductsPage();
  setSyncStatus('connected', 'Локально');
}

// Initialize when page loads
window.addEventListener('load', () => {
  setTimeout(initProductsPage, 1000);
});

// Theme toggle
(function() {
  const t = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let d = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', d);

  function updateIcon() {
    t.innerHTML = d === 'dark'
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    t.setAttribute('aria-label', 'Переключить на ' + (d === 'dark' ? 'светлую' : 'тёмную') + ' тему');
  }
  updateIcon();

  t.addEventListener('click', () => {
    d = d === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', d);
    updateIcon();
  });
})();

// Initial render
renderAll();
