import React, { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Sparkles, RotateCcw } from 'lucide-react';
import './styles.css';

const major = [
  ['The Fool','beginnings, trust, the sacred leap'], ['The Magician','will, skill, manifestation'], ['The High Priestess','intuition, dreams, hidden knowing'], ['The Empress','creation, beauty, abundance'], ['The Emperor','structure, protection, authority'], ['The Hierophant','tradition, study, spiritual order'], ['The Lovers','choice, union, alignment'], ['The Chariot','motion, discipline, triumph'], ['Strength','courage, patience, soft power'], ['The Hermit','solitude, wisdom, inner lantern'], ['Wheel of Fortune','turning cycles, fate, timing'], ['Justice','truth, balance, consequence'], ['The Hanged Man','pause, surrender, new perspective'], ['Death','release, endings, transformation'], ['Temperance','alchemy, healing, moderation'], ['The Devil','attachment, temptation, shadow'], ['The Tower','revelation, rupture, liberation'], ['The Star','hope, renewal, guidance'], ['The Moon','mystery, illusion, instinct'], ['The Sun','clarity, joy, vitality'], ['Judgement','awakening, reckoning, rebirth'], ['The World','completion, integration, arrival']
];
const suits = {
  Wands: ['fire','ambition, instinct, creative force'],
  Cups: ['water','feeling, love, memory'],
  Swords: ['air','thought, conflict, clarity'],
  Pentacles: ['earth','body, work, resources']
};
const ranks = [
  ['Ace','seed, gift, beginning'], ['Two','choice, pairing, tension'], ['Three','growth, collaboration, signal'], ['Four','stability, pause, foundation'], ['Five','friction, test, change'], ['Six','harmony, passage, support'], ['Seven','challenge, strategy, conviction'], ['Eight','movement, craft, momentum'], ['Nine','threshold, resilience, harvest'], ['Ten','culmination, burden, completion'], ['Page','message, curiosity, apprentice energy'], ['Knight','quest, velocity, devotion'], ['Queen','mastery, care, inner authority'], ['King','command, stewardship, mature power']
];

const gemstonePalette = [
  ['Amethyst', '#fff5ff', '#d89cff', '#7b2fff', '#240a42'],
  ['Emerald', '#ecfff2', '#66f0a2', '#087f54', '#04291f'],
  ['Ruby', '#fff0f2', '#ff6c8a', '#b90f3f', '#33020f'],
  ['Sapphire', '#eef7ff', '#6bb8ff', '#1c49c9', '#06143a'],
  ['Citrine', '#fffbe8', '#ffd96a', '#d77917', '#3a1804'],
  ['Moonstone', '#ffffff', '#c9f6ff', '#878ce8', '#17183f'],
  ['Opal', '#ffffff', '#ffb8ef', '#72fff1', '#22205a'],
  ['Garnet', '#ffe8ee', '#d54a72', '#711027', '#21050b'],
  ['Turquoise', '#efffff', '#53f1dc', '#008f9d', '#042a35'],
  ['Onyx', '#f7f0ff', '#6d607d', '#17121f', '#020105'],
  ['Amber', '#fff3c1', '#ffb23e', '#a84d09', '#2d1302'],
  ['Rose Quartz', '#fff4fb', '#ffabc9', '#c95d90', '#351126']
];

const stoneShapes = [
  '54% 46% 48% 52% / 50% 43% 57% 50%',
  '61% 39% 55% 45% / 45% 57% 43% 55%',
  '48% 52% 42% 58% / 58% 47% 53% 42%',
  '57% 43% 62% 38% / 39% 54% 46% 61%',
  '44% 56% 51% 49% / 53% 38% 62% 47%',
  '63% 37% 44% 56% / 52% 59% 41% 48%',
  '50% 50% 60% 40% / 44% 51% 49% 56%',
  '46% 54% 39% 61% / 60% 45% 55% 40%'
];

const withGem = card => {
  const gem = gemstonePalette[card.id % gemstonePalette.length];
  return {
    ...card,
    gem: gem[0],
    gemColors: gem.slice(1),
    stoneShape: stoneShapes[card.id % stoneShapes.length],
    stoneSize: 16 + (card.id * 7) % 8,
    stoneScaleX: (92 + (card.id * 11) % 18) / 100,
    stoneScaleY: (92 + (card.id * 13) % 18) / 100,
    shineX: 18 + (card.id * 17) % 28,
    shineY: 12 + (card.id * 19) % 24,
    facetTurn: `${(card.id * 37) % 180}deg`
  };
};

const deck = [
  ...major.map(([name, meaning], i) => withGem({ id: i, name, arcana: 'Major Arcana', sigil: '✦', meaning })),
  ...Object.entries(suits).flatMap(([suit, [element, domain]], suitIndex) =>
    ranks.map(([rank, rankMeaning], rankIndex) => withGem({
      id: 22 + suitIndex * 14 + rankIndex,
      name: `${rank} of ${suit}`,
      arcana: suit,
      sigil: suit === 'Wands' ? '♨' : suit === 'Cups' ? '☾' : suit === 'Swords' ? '☄' : '◇',
      meaning: `${rankMeaning}; ${domain}`,
      element
    }))
  )
];

const positions = [
  { key: 'past', label: 'Past', prompt: 'what shaped the path behind you' },
  { key: 'present', label: 'Present', prompt: 'what is moving through the current moment' },
  { key: 'future', label: 'Future', prompt: 'what wants to become visible next' }
];

const phrases = {
  past: ['This card rises from the old water, showing the pattern that set the spell in motion.', 'Behind you, the well remembers a lesson that still hums under the surface.', 'The first marble carries an echo from the path already walked.'],
  present: ['At the center of the wheel, this is the energy asking for your attention now.', 'The current moment glows around this card; it is the hinge of the reading.', 'This marble lands with the pulse of the present spell.'],
  future: ['Ahead, this card is less a fixed prophecy than a lantern for the next turn.', 'The final marble reveals the shape the path may take if this energy is honored.', 'The well offers this as a possible doorway opening forward.']
};

function pickReading() {
  const chosen = [];
  const available = [...deck];
  while (chosen.length < 3) {
    const index = Math.floor(Math.random() * available.length);
    chosen.push(available.splice(index, 1)[0]);
  }
  return chosen.map((card, i) => ({ ...positions[i], card, line: phrases[positions[i].key][Math.floor(Math.random() * 3)] }));
}

function getMoonPhase(date = new Date()) {
  const phases = [
    { name: 'New Moon', symbol: '🌑' },
    { name: 'Waxing Crescent', symbol: '🌒' },
    { name: 'First Quarter', symbol: '🌓' },
    { name: 'Waxing Gibbous', symbol: '🌔' },
    { name: 'Full Moon', symbol: '🌕' },
    { name: 'Waning Gibbous', symbol: '🌖' },
    { name: 'Last Quarter', symbol: '🌗' },
    { name: 'Waning Crescent', symbol: '🌘' }
  ];
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const lunarCycle = 29.530588853;
  const daysSince = (date.getTime() - knownNewMoon) / 86400000;
  const age = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle;
  const index = Math.floor((age / lunarCycle) * 8 + 0.5) % 8;
  return { ...phases[index], age: Math.round(age * 10) / 10 };
}

function buildDropOrder(reading) {
  const selected = reading.map(r => r.card.id);
  const selectedSet = new Set(selected);
  const others = deck.map(card => card.id).filter(id => !selectedSet.has(id)).sort(() => Math.random() - 0.5);
  const order = [...others];
  const revealSlots = [18, 43, 68].map(slot => slot + Math.floor(Math.random() * 8));
  selected.forEach((id, index) => order.splice(Math.min(revealSlots[index], order.length), 0, id));
  return order;
}

function MarbleWheel({ reading, activeMarbleId, droppedIds, isCasting }) {
  const selectedIds = new Set(reading.map(r => r.card.id));
  const moonPhase = useMemo(() => getMoonPhase(), []);
  return <div className={`wheel-wrap ${isCasting ? 'casting' : ''}`} aria-label="Zoetrope wishing well with 78 tarot marbles dropping into the center one by one">
    <div className="aura" />
    <div className="wheel">
      {deck.map((card, index) => {
        const angle = (360 / deck.length) * index;
        const isActive = card.id === activeMarbleId;
        const isDropped = droppedIds.has(card.id);
        return <div
          key={card.id}
          className={`marble ${selectedIds.has(card.id) ? 'selected' : ''} ${isDropped ? 'gone' : ''} ${isActive ? 'falling' : ''}`}
          title={card.name}
          style={{ '--angle': `${angle}deg`, '--delay': `${index * -0.035}s`, '--gem-hi': card.gemColors[0], '--gem-mid': card.gemColors[1], '--gem-core': card.gemColors[2], '--gem-shadow': card.gemColors[3], '--stone-shape': card.stoneShape, '--stone-size': `${card.stoneSize}px`, '--stone-scale-x': card.stoneScaleX, '--stone-scale-y': card.stoneScaleY, '--shine-x': `${card.shineX}%`, '--shine-y': `${card.shineY}%`, '--facet-turn': card.facetTurn }}
        ><span>{card.sigil}</span></div>;
      })}
      <div className="well-mouth" title={`Current moon phase: ${moonPhase.name}`}>
        <span className="moon-symbol" aria-hidden="true">{moonPhase.symbol}</span>
        <span className="moon-label">{moonPhase.name.replace(' ', '\n')}</span>
      </div>
    </div>
  </div>;
}

function ReadingCard({ item, index, flipped, onFlip }) {
  return <button className={`tarot-flip ${flipped ? 'is-flipped' : ''}`} style={{ '--i': index }} onClick={onFlip} aria-label={`${flipped ? 'Reading for' : 'Reveal'} ${item.label}: ${item.card.name}`}>
    <span className="tarot-inner">
      <span className="tarot-face tarot-front">
        <span className="position">{item.label}</span>
        <span className="card-sigil">{item.card.sigil}</span>
        <span className="card-name">{item.card.name}</span>
        <span className="arcana">{item.card.arcana}{item.card.element ? ` · ${item.card.element}` : ''}</span>
        <span className="tap-hint">Tap to reveal</span>
      </span>
      <span className="tarot-face tarot-back">
        <span className="position">{item.label}</span>
        <span className="card-name">{item.card.name}</span>
        <span className="reading-line">{item.line}</span>
        <span className="meaning"><strong>Oracle:</strong> {item.card.meaning}.</span>
      </span>
    </span>
  </button>;
}

function App() {
  const [reading, setReading] = useState([]);
  const [activeMarbleId, setActiveMarbleId] = useState(null);
  const [droppedIds, setDroppedIds] = useState(new Set());
  const [fallenCount, setFallenCount] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [phase, setPhase] = useState('idle');
  const [flippedCards, setFlippedCards] = useState([false, false, false]);
  const timers = useRef([]);
  const seedStars = useMemo(() => Array.from({ length: 90 }, (_, i) => ({ left: Math.random()*100, top: Math.random()*100, delay: Math.random()*5, size: Math.random()*2+1, id: i })), []);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const cast = () => {
    clearTimers();
    const next = pickReading();
    const dropOrder = buildDropOrder(next);
    const duration = 8000 + Math.floor(Math.random() * 4001);
    const step = duration / dropOrder.length;
    setReading(next);
    setActiveMarbleId(null);
    setDroppedIds(new Set());
    setFallenCount(0);
    setRevealedCount(0);
    setFlippedCards([false, false, false]);
    setPhase('casting');

    dropOrder.forEach((cardId, index) => {
      timers.current.push(setTimeout(() => setActiveMarbleId(cardId), index * step));
      timers.current.push(setTimeout(() => {
        setDroppedIds(ids => new Set([...ids, cardId]));
        setFallenCount(index + 1);
        const selectedIndex = next.findIndex(item => item.card.id === cardId);
        if (selectedIndex >= 0) setRevealedCount(count => Math.max(count, selectedIndex + 1));
      }, index * step + Math.min(260, step * .72)));
    });
    timers.current.push(setTimeout(() => {
      setActiveMarbleId(null);
      setPhase('revealed');
    }, duration + 500));
  };

  const isCasting = phase === 'casting';
  const isRevealed = phase === 'revealed';
  const flipCard = index => setFlippedCards(cards => cards.map((isFlipped, i) => i === index ? !isFlipped : isFlipped));

  return <main>
    <div className="stars">{seedStars.map(s => <i key={s.id} style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, width: s.size, height: s.size }} />)}</div>
    <section className="hero">
      <p className="eyebrow"><Sparkles size={16}/> AI Tarot Reading</p>
      <h1>Ask the Moonwell</h1>
      <p className="lede">Seventy-eight enchanted marbles begin on the rim of the wishing well. One by one they drop into the Moonwell, revealing the chosen past, present, and future cards as they fall.</p>
      <button onClick={cast} disabled={isCasting}>{isCasting ? <Sparkles size={18}/> : reading.length ? <RotateCcw size={18}/> : <Sparkles size={18}/>} {isCasting ? 'The marbles are spinning...' : reading.length ? 'Cast Again' : 'Cast the Reading'}</button>
    </section>

    <MarbleWheel reading={reading} activeMarbleId={activeMarbleId} droppedIds={droppedIds} isCasting={isCasting} />

    <section className="ritual-status" aria-live="polite">
      {isCasting ? `${fallenCount}/78 marbles have dropped into the center. ${revealedCount}/3 cards revealed.` : isRevealed ? 'The Moonwell has spoken. Tap each card to reveal its message.' : 'Focus on a question, then cast the reading.'}
    </section>

    <section className="spread" aria-live="polite">
      {positions.map((p, i) => revealedCount > i && reading[i] ? <ReadingCard key={reading[i].key + reading[i].card.id} item={reading[i]} index={i} flipped={flippedCards[i]} onFlip={() => flipCard(i)} /> : <div className="empty-card" key={p.key}><span>{i+1}</span><h3>{p.label}</h3><p>{isCasting ? 'Waiting for its marble to fall...' : p.prompt}</p></div>)}
    </section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
