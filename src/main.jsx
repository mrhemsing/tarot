import React, { useEffect, useMemo, useRef, useState } from 'react';
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
    stoneSize: 13 + (card.id * 7) % 5,
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
  past: ['This card rises from the old water, showing the pattern that set the spell in motion.', 'Behind you, the wheel remembers a lesson that still hums under the surface.', 'The first chosen card carries an echo from the path already walked.'],
  present: ['At the center of the wheel, this is the energy asking for your attention now.', 'The current moment glows around this card; it is the hinge of the reading.', 'This card lands with the pulse of the present spell.'],
  future: ['Ahead, this card is less a fixed prophecy than a lantern for the next turn.', 'The final card reveals the shape the path may take if this energy is honored.', 'The well offers this as a possible doorway opening forward.']
};

function hashSeed(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  return () => {
    seed += 0x6D2B79F5;
    let t = seed;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function pickReading(seedInput = String(Date.now())) {
  const random = seededRandom(hashSeed(seedInput));
  const chosen = [];
  const available = [...deck];
  while (chosen.length < 3) {
    const index = Math.floor(random() * available.length);
    chosen.push(available.splice(index, 1)[0]);
  }
  return chosen.map((card, i) => ({ ...positions[i], card, line: phrases[positions[i].key][Math.floor(random() * 3)] }));
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

function TarotWheel({ reading, ritualState, chargeProgress, onCenterDown, onCenterUp }) {
  const selectedIds = new Set(reading.map(r => r.card.id));
  const moonPhase = useMemo(() => getMoonPhase(), []);
  const isActiveRitual = ['charging', 'building', 'charged', 'collapse', 'selected', 'revealing'].includes(ritualState);
  return <div className={`wheel-wrap ${ritualState} ${isActiveRitual ? 'casting' : ''}`} style={{ '--charge': chargeProgress }} aria-label="Tarot wheel choosing three cards from the Moonwell">
    <div className="aura" />
    <div className="wheel">
      {deck.map((card, index) => {
        const angle = (360 / deck.length) * index;
        const isSelected = selectedIds.has(card.id);
        return <div
          key={card.id}
          className={`card-slot ${isSelected ? 'selected' : ''}`}
          title={card.name}
          style={{ '--angle': `${angle}deg`, '--delay': `${index * -0.02}s` }}
        />;
      })}
      <button className="well-mouth" title={`Current moon phase: ${moonPhase.name}`} onPointerDown={onCenterDown} onPointerUp={onCenterUp} onPointerCancel={onCenterUp} onPointerLeave={onCenterUp}>
        <span className="charge-ring" aria-hidden="true" />
        <span className="moon-symbol" aria-hidden="true">{moonPhase.symbol}</span>
        <span className="moon-label">{['charging', 'building', 'charged'].includes(ritualState) ? `${Math.round(chargeProgress * 100)}%` : moonPhase.name.replace(' ', '\n')}</span>
      </button>
    </div>
  </div>;
}

function ReadingCard({ item, index, flipped, onFlip }) {
  return <button className={`tarot-flip ${flipped ? 'is-flipped' : ''}`} style={{ '--i': index }} onPointerDown={event => event.stopPropagation()} onPointerUp={event => event.stopPropagation()} onClick={onFlip} aria-label={`${flipped ? 'Reading for' : 'Reveal'} ${item.label}: ${item.card.name}`}>
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
  const [revealedCount, setRevealedCount] = useState(0);
  const [ritualState, setRitualState] = useState('idle');
  const [chargeText, setChargeText] = useState('Focus on a question, then press and hold the Moonwell.');
  const [chargeProgress, setChargeProgress] = useState(0);
  const [flippedCards, setFlippedCards] = useState([false, false, false]);
  const timers = useRef([]);
  const hapticTimer = useRef(null);
  const progressTimer = useRef(null);
  const holdStart = useRef(0);
  const pointerSeed = useRef({ x: 0, y: 0 });
  const seedStars = useMemo(() => Array.from({ length: 120 }, (_, i) => ({ left: Math.random()*100, top: Math.random()*100, delay: Math.random()*5, size: Math.random()*2+1, id: i })), []);

  useEffect(() => {
    const clearSelection = () => window.getSelection?.().removeAllRanges();
    const blockSelection = event => {
      event.preventDefault();
      clearSelection();
    };
    document.addEventListener('selectionchange', clearSelection);
    document.addEventListener('selectstart', blockSelection);
    return () => {
      document.removeEventListener('selectionchange', clearSelection);
      document.removeEventListener('selectstart', blockSelection);
    };
  }, []);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (hapticTimer.current) clearInterval(hapticTimer.current);
    if (progressTimer.current) clearInterval(progressTimer.current);
    hapticTimer.current = null;
    progressTimer.current = null;
  };

  const vibrate = pattern => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
  };

  const beginCharge = event => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    window.getSelection?.().removeAllRanges();
    if (['charging', 'building', 'charged', 'collapse', 'selected', 'revealing'].includes(ritualState)) return;
    clearTimers();
    vibrate(18);
    holdStart.current = performance.now();
    pointerSeed.current = { x: Math.round(event.clientX || 0), y: Math.round(event.clientY || 0) };
    setReading([]);
    setRevealedCount(0);
    setChargeProgress(0);
    setFlippedCards([false, false, false]);
    setRitualState('charging');
    setChargeText('The Moonwell wakes… keep holding.');
    progressTimer.current = setInterval(() => {
      const progress = Math.min(1, (performance.now() - holdStart.current) / 5000);
      setChargeProgress(progress);
    }, 50);
    hapticTimer.current = setInterval(() => vibrate(9), 460);
    timers.current.push(setTimeout(() => vibrate([10, 28, 12]), 1000));
    timers.current.push(setTimeout(() => vibrate([12, 26, 16]), 2500));
    timers.current.push(setTimeout(() => vibrate([16, 28, 22]), 4000));
    timers.current.push(setTimeout(() => {
      setRitualState(state => state === 'charging' ? 'building' : state);
      setChargeText('Energy is building… the wheel is accelerating.');
      if (hapticTimer.current) clearInterval(hapticTimer.current);
      hapticTimer.current = setInterval(() => vibrate(12), 300);
    }, 1200));
    timers.current.push(setTimeout(() => {
      setRitualState(state => ['charging', 'building'].includes(state) ? 'charged' : state);
      setChargeProgress(1);
      setChargeText('Activated — release to choose.');
      if (hapticTimer.current) clearInterval(hapticTimer.current);
      hapticTimer.current = setInterval(() => vibrate([12, 25, 18]), 220);
      vibrate([18, 35, 28]);
    }, 5000));
  };

  const releaseCharge = event => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    window.getSelection?.().removeAllRanges();
    if (!['charging', 'building', 'charged'].includes(ritualState)) return;
    const holdDuration = Math.round(performance.now() - holdStart.current);
    if (ritualState !== 'charged' || holdDuration < 5000) {
      clearTimers();
      vibrate([10, 35, 10]);
      setRitualState('idle');
      setChargeProgress(0);
      setChargeText('Hold the center moon for the full 5 seconds.');
      return;
    }
    clearTimers();
    const x = Math.round(event.clientX || pointerSeed.current.x);
    const y = Math.round(event.clientY || pointerSeed.current.y);
    const next = pickReading(`${holdDuration}:${x}:${y}:${Date.now()}`);
    vibrate([30, 55, 45]);
    setReading(next);
    setChargeProgress(1);
    setRitualState('collapse');
    setChargeText('Three cards hesitate… then fall inward.');

    timers.current.push(setTimeout(() => {
      setRitualState('selected');
      setChargeText('Gravity has selected your three cards.');
      vibrate(25);
    }, 850));
    timers.current.push(setTimeout(() => {
      setRitualState('revealing');
      setChargeText('Your path is opening…');
    }, 1400));
    [350, 850, 1450].forEach((delay, index) => {
      timers.current.push(setTimeout(() => {
        setRevealedCount(index + 1);
        vibrate(index === 2 ? [18, 35, 28] : 16);
      }, 1400 + delay));
    });
    timers.current.push(setTimeout(() => {
      setRitualState('done');
      setChargeText('Your path has been revealed. Tap each card to read it.');
    }, 3300));
  };

  const resetRitual = () => {
    clearTimers();
    setReading([]);
    setRevealedCount(0);
    setChargeProgress(0);
    setFlippedCards([false, false, false]);
    setRitualState('idle');
    setChargeText('Focus on a question, then press and hold the Moonwell.');
  };

  const isRitualActive = ['charging', 'building', 'charged', 'collapse', 'selected', 'revealing'].includes(ritualState);
  const flipCard = index => setFlippedCards(cards => cards.map((isFlipped, i) => i === index ? !isFlipped : isFlipped));

  return <main className={`app ${ritualState}`} onContextMenu={event => event.preventDefault()} onSelect={event => event.preventDefault()} onSelectStart={event => event.preventDefault()}>
    <div className="stars">{seedStars.map(s => <i key={s.id} style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, width: s.size, height: s.size }} />)}</div>
    <TarotWheel reading={reading} ritualState={ritualState} chargeProgress={chargeProgress} onCenterDown={beginCharge} onCenterUp={releaseCharge} />

    {reading.length > 0 && <section className="hero compact"><button onPointerDown={event => event.stopPropagation()} onPointerUp={event => event.stopPropagation()} onClick={resetRitual} disabled={isRitualActive}><RotateCcw size={18}/> Cast Again</button></section>}

    <section className="spread" aria-live="polite">
      {positions.map((p, i) => revealedCount > i && reading[i] ? <ReadingCard key={reading[i].key + reading[i].card.id} item={reading[i]} index={i} flipped={flippedCards[i]} onFlip={() => flipCard(i)} /> : <div className="empty-card" key={p.key}><span>{i+1}</span><h3>{p.label}</h3><p>{isRitualActive ? 'Waiting for the wheel to choose...' : p.prompt}</p></div>)}
    </section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
