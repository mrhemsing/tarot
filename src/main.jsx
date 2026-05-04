import React, { useMemo, useState } from 'react';
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

function MarbleWheel({ reading, activeIndex }) {
  const selectedIds = new Set(reading.map(r => r.card.id));
  return <div className="wheel-wrap" aria-label="Zoetrope wishing well with 78 tarot marbles">
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
          style={{ '--angle': `${angle}deg`, '--delay': `${index * -0.035}s` }}
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
  const seedStars = useMemo(() => Array.from({ length: 90 }, (_, i) => ({ left: Math.random()*100, top: Math.random()*100, delay: Math.random()*5, size: Math.random()*2+1, id: i })), []);

  const cast = () => {
    const next = pickReading();
    setReading(next);
    setActiveIndex(-1);
    [0,1,2].forEach(i => setTimeout(() => setActiveIndex(i), 650 + i * 950));
    setTimeout(() => setActiveIndex(-1), 3900);
  };

  return <main>
    <div className="stars">{seedStars.map(s => <i key={s.id} style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, width: s.size, height: s.size }} />)}</div>
    <section className="hero">
      <p className="eyebrow"><Sparkles size={16}/> AI Tarot Reading</p>
      <h1>Ask the Moonwell</h1>
      <p className="lede">Seventy-eight enchanted marbles circle the wishing well. When the wheel turns, three fall inward to reveal your past, present, and future.</p>
      <button onClick={cast}>{reading.length ? <RotateCcw size={18}/> : <Sparkles size={18}/>} {reading.length ? 'Cast Again' : 'Cast the Reading'}</button>
    </section>

    <MarbleWheel reading={reading} activeIndex={activeIndex} />

    <section className="spread" aria-live="polite">
      {reading.length === 0 ? positions.map((p, i) => <div className="empty-card" key={p.key}><span>{i+1}</span><h3>{p.label}</h3><p>{p.prompt}</p></div>) : reading.map((item, i) => <ReadingCard key={item.key + item.card.id} item={item} index={i} />)}
    </section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
