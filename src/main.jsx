import React, { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Sparkles, Moon, RotateCcw } from 'lucide-react';
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

const deck = [
  ...major.map(([name, meaning], i) => ({ id: i, name, arcana: 'Major Arcana', sigil: '✦', meaning })),
  ...Object.entries(suits).flatMap(([suit, [element, domain]], suitIndex) =>
    ranks.map(([rank, rankMeaning], rankIndex) => ({
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

function MarbleWheel({ reading, activeIndex, fallenCount, isCasting, spinTime }) {
  const visibleSelections = reading.slice(0, fallenCount).map(r => r.card.id);
  if (activeIndex >= 0 && reading[activeIndex]) visibleSelections.push(reading[activeIndex].card.id);
  const selectedIds = new Set(visibleSelections);
  return <div className={`wheel-wrap ${isCasting ? 'casting' : ''}`} style={{ '--spin-time': `${spinTime}ms` }} aria-label="Zoetrope wishing well with 78 tarot marbles spinning into the center">
    <div className="aura" />
    <div className="wheel">
      {deck.map((card, index) => {
        const angle = (360 / deck.length) * index;
        const chosenIndex = reading.findIndex(r => r.card.id === card.id);
        const isActive = chosenIndex === activeIndex;
        return <div
          key={card.id}
          className={`marble ${selectedIds.has(card.id) ? 'selected' : ''} ${isActive ? 'falling' : ''}`}
          title={card.name}
          style={{ '--angle': `${angle}deg`, '--delay': `${index * -0.035}s`, '--vortex-delay': `${(index % 13) * 0.035}s` }}
        ><span>{card.sigil}</span></div>;
      })}
      <div className="well-mouth"><Moon size={34}/><span>Moonwell</span></div>
    </div>
  </div>;
}

function ReadingCard({ item, index }) {
  return <article className="reading-card" style={{ '--i': index }}>
    <div className="position">{item.label}</div>
    <h3>{item.card.name}</h3>
    <p className="arcana">{item.card.arcana}{item.card.element ? ` · ${item.card.element}` : ''}</p>
    <p>{item.line}</p>
    <p className="meaning"><strong>Oracle:</strong> {item.card.meaning}.</p>
  </article>;
}

function App() {
  const [reading, setReading] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [fallenCount, setFallenCount] = useState(0);
  const [phase, setPhase] = useState('idle');
  const [spinTime, setSpinTime] = useState(10000);
  const timers = useRef([]);
  const seedStars = useMemo(() => Array.from({ length: 90 }, (_, i) => ({ left: Math.random()*100, top: Math.random()*100, delay: Math.random()*5, size: Math.random()*2+1, id: i })), []);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const cast = () => {
    clearTimers();
    const next = pickReading();
    const nextSpinTime = 8000 + Math.floor(Math.random() * 4001);
    setSpinTime(nextSpinTime);
    setReading(next);
    setActiveIndex(-1);
    setFallenCount(0);
    setPhase('casting');

    [0,1,2].forEach(i => {
      timers.current.push(setTimeout(() => setActiveIndex(i), nextSpinTime + i * 950));
      timers.current.push(setTimeout(() => setFallenCount(i + 1), nextSpinTime + 720 + i * 950));
    });
    timers.current.push(setTimeout(() => {
      setActiveIndex(-1);
      setPhase('revealed');
    }, nextSpinTime + 3600));
  };

  const isCasting = phase === 'casting';
  const isRevealed = phase === 'revealed';

  return <main>
    <div className="stars">{seedStars.map(s => <i key={s.id} style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, width: s.size, height: s.size }} />)}</div>
    <section className="hero">
      <p className="eyebrow"><Sparkles size={16}/> AI Tarot Reading</p>
      <h1>Ask the Moonwell</h1>
      <p className="lede">Seventy-eight enchanted marbles circle the wishing well, spiraling down into the Moonwell until three are chosen: past, present, and future.</p>
      <button onClick={cast} disabled={isCasting}>{isCasting ? <Sparkles size={18}/> : reading.length ? <RotateCcw size={18}/> : <Sparkles size={18}/>} {isCasting ? 'The marbles are spinning...' : reading.length ? 'Cast Again' : 'Cast the Reading'}</button>
    </section>

    <MarbleWheel reading={reading} activeIndex={activeIndex} fallenCount={fallenCount} isCasting={isCasting} spinTime={spinTime} />

    <section className="ritual-status" aria-live="polite">
      {isCasting ? fallenCount ? `The chosen marbles are surfacing... ${fallenCount}/3` : 'All 78 marbles are spiraling into the center...' : isRevealed ? 'The Moonwell has spoken.' : 'Focus on a question, then cast the reading.'}
    </section>

    <section className="spread" aria-live="polite">
      {!isRevealed ? positions.map((p, i) => <div className="empty-card" key={p.key}><span>{i+1}</span><h3>{p.label}</h3><p>{isCasting ? 'Hidden in the spinning marbles...' : p.prompt}</p></div>) : reading.map((item, i) => <ReadingCard key={item.key + item.card.id} item={item} index={i} />)}
    </section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
