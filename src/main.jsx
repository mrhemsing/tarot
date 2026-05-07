import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Sparkles, FlipHorizontal } from 'lucide-react';
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

const suitImageCodes = { Pentacles: 'P', Wands: 'W', Cups: 'C', Swords: 'S' };
const rankImageCodes = ['0A', '02', '03', '04', '05', '06', '07', '08', '09', '10', 'J1', 'J2', 'QU', 'KI'];
const rwsImageFor = card => card.id < 22
  ? `/rws/sm_RWSa-T-${String(card.id).padStart(2, '0')}.webp`
  : `/rws/sm_RWSa-${suitImageCodes[card.arcana]}-${rankImageCodes[(card.id - 22) % 14]}.webp`;

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
].map(card => ({ ...card, image: rwsImageFor(card) }));

const positions = [
  { key: 'past', label: 'Past', prompt: 'what shaped the path behind you' },
  { key: 'present', label: 'Present', prompt: 'what is moving through the current moment' },
  { key: 'future', label: 'Future', prompt: 'what wants to become visible next' }
];

const preloadImage = src => new Promise(resolve => {
  const image = new Image();
  image.onload = resolve;
  image.onerror = resolve;
  image.src = src;
});

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

function TarotWheel({ reading, ritualState, chargeProgress }) {
  const selectedIds = new Set(reading.map(r => r.card.id));
  const isActiveRitual = ['charging', 'building', 'charged', 'collapse', 'selected', 'revealing', 'returning'].includes(ritualState);
  return <div className={`wheel-wrap ${ritualState} ${isActiveRitual ? 'casting' : ''}`} style={{ '--charge': chargeProgress }} aria-label="Tarot wheel choosing three cards">
    <div className="aura" />
    <div className="site-title" aria-hidden="true"><span>MOONWELL</span><span>TAROT</span></div>
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

    </div>
  </div>;
}

function cardAnalysis(item) {
  const { card, label, prompt } = item;
  const isMajor = card.arcana === 'Major Arcana';
  const positionLens = {
    Past: 'In the past position, this points to the root condition: the older choice, wound, lesson, or momentum that shaped the question before it reached today.',
    Present: 'In the present position, this describes the living pressure of the moment: what needs attention, what is asking to be named, and where your agency is strongest right now.',
    Future: 'In the future position, this is not a fixed prediction. It is the likely doorway opening next if the current energy continues, and the guidance for walking through it cleanly.'
  }[label];
  const scale = isMajor
    ? 'Because this is a Major Arcana card, read it as a larger soul-pattern rather than a minor passing mood. It usually speaks to timing, identity, transformation, or a lesson that wants integration.'
    : `Because this is a ${card.arcana} card, read it through the element of ${card.element}: ${card.arcana === 'Wands' ? 'desire, creative fire, instinct, confidence, and action' : card.arcana === 'Cups' ? 'emotion, relationship, intuition, memory, and tenderness' : card.arcana === 'Swords' ? 'thought, truth, conflict, communication, and mental clarity' : 'the body, money, labor, stability, home, and practical results'}.`;
  return [
    `${card.name} carries the theme of ${card.meaning}. ${positionLens}`,
    scale,
    `For “${prompt},” the card suggests looking at where ${card.meaning.split(',')[0]} is already active. The message is less about forcing an outcome and more about noticing the pattern clearly enough to choose your next move with intention.`,
    `A grounded way to work with it: name what is real, release the part that is only fear or habit, then take one small action that honors the card’s strongest medicine.`
  ];
}

function ReadingCard({ item, index, flipped, spotlight, fullScreen, showArt, onFlip, onToggleArt, cardRef, returnVector }) {
  const analysis = cardAnalysis(item);
  const handleClick = event => {
    if (event.target.closest('.flip-control')) {
      onFlip();
      return;
    }
    if (event.target.closest('.card-scroll')) return;
    if (fullScreen) return;
    onFlip(event.currentTarget);
  };
  const vector = returnVector || { x: '0px', y: '-52vh' };
  const controls = fullScreen ? <span className="detail-controls">
    <span className="flip-control art-toggle-control" aria-label={showArt ? 'Show reading' : 'Show full art'} onClick={event => { event.stopPropagation(); onToggleArt?.(); }}><FlipHorizontal size={18} /></span>
    <span className="flip-control close-control" aria-label="Close" onClick={event => { event.stopPropagation(); onFlip(); }}>×</span>
  </span> : null;
  return <div ref={cardRef} className={`tarot-flip ${flipped ? 'is-flipped' : ''} ${spotlight ? 'is-spotlight' : ''} ${fullScreen ? 'is-fullscreen-detail' : ''} ${showArt ? 'is-showing-art' : ''}`} style={{ '--i': index, '--return-x': vector.x, '--return-y': vector.y }} onPointerDown={event => event.stopPropagation()} onPointerUp={event => event.stopPropagation()} onClick={handleClick} role="button" tabIndex={0} aria-label={`${flipped ? 'Reading for' : 'Reveal'} ${item.label}: ${item.card.name}`}>
    <span className="tarot-inner">
      <span className="tarot-face tarot-front art-front">
        {controls}
        <span className="casino-burst" aria-hidden="true"><i/><i/><i/><i/><i/><i/></span>
        <span className="spotlight-kicker">{item.label}</span>
        <span className="spotlight-title">{item.card.name}</span>
        <span className="position">{item.label}</span>
        <span className="spotlight-card-frame"><img className="rws-card-art" src={item.card.image} alt={item.card.name} draggable="false" /></span>

      </span>
      <span className="tarot-face tarot-back">
        {fullScreen ? controls : <span className="flip-control" aria-hidden="true"><FlipHorizontal size={16} /></span>}
        <div className="card-scroll" onClick={event => event.stopPropagation()}>
          <span className="position">{item.label}</span>
          <span className="card-name">{item.card.name}</span>
          <span className="reading-line">{item.line}</span>
          {analysis.map((paragraph, paragraphIndex) => <span className="analysis-copy" key={paragraphIndex}>{paragraph}</span>)}
          <span className="meaning"><strong>Keywords:</strong> {item.card.meaning}.</span>
        </div>
      </span>
    </span>
  </div>;
}

function App() {
  const [reading, setReading] = useState([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [ritualState, setRitualState] = useState('idle');
  const [chargeText, setChargeText] = useState('Focus on a question,\nthen press and hold the moon.');
  const [chargeProgress, setChargeProgress] = useState(0);
  const [flippedCards, setFlippedCards] = useState([false, false, false]);
  const [spotlightCardIndex, setSpotlightCardIndex] = useState(null);
  const [openCardIndex, setOpenCardIndex] = useState(null);
  const [isClosingDetail, setIsClosingDetail] = useState(false);
  const [detailShowsArt, setDetailShowsArt] = useState(false);
  const [detailOrigin, setDetailOrigin] = useState({ x: 0, y: 0, scale: 0.28 });
  const [returnClones, setReturnClones] = useState([]);
  const [assetsReady, setAssetsReady] = useState(false);
  const timers = useRef([]);
  const hapticTimer = useRef(null);
  const progressTimer = useRef(null);
  const holdStart = useRef(0);
  const pointerSeed = useRef({ x: 0, y: 0 });
  const castStarted = useRef(false);
  const cardRefs = useRef([]);
  const seedStars = useMemo(() => Array.from({ length: 120 }, (_, i) => ({ left: Math.random()*100, top: Math.random()*100, delay: Math.random()*5, size: Math.random()*2+1, id: i })), []);

  useEffect(() => {
    let cancelled = false;
    const criticalAssets = ['/tarot-wheel.webp', ...deck.map(card => card.image)];
    Promise.all([
      ...criticalAssets.map(preloadImage),
      document.fonts?.ready?.catch?.(() => undefined) || Promise.resolve(),
      new Promise(resolve => setTimeout(resolve, 450))
    ]).then(() => {
      if (!cancelled) setAssetsReady(true);
    });
    return () => { cancelled = true; };
  }, []);

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
    if (['charging', 'building', 'charged', 'collapse', 'selected', 'revealing', 'returning'].includes(ritualState)) return;
    clearTimers();
    vibrate(18);
    holdStart.current = performance.now();
    pointerSeed.current = { x: Math.round(event.clientX || 0), y: Math.round(event.clientY || 0) };
    castStarted.current = false;
    setReading([]);
    setRevealedCount(0);
    setChargeProgress(0);
    setFlippedCards([false, false, false]);
    setSpotlightCardIndex(null);
    setOpenCardIndex(null);
    setIsClosingDetail(false);
    setRitualState('charging');
    setChargeText('The moon wakes the wheel… keep holding.');
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
      const holdDuration = Math.round(performance.now() - holdStart.current);
      chooseCards(pointerSeed.current.x, pointerSeed.current.y, holdDuration);
    }, 5000));
  };

  const chooseCards = (x, y, holdDuration = 5000) => {
    if (castStarted.current) return;
    castStarted.current = true;
    clearTimers();
    setChargeProgress(1);
    const next = pickReading(`${holdDuration}:${x}:${y}:${Date.now()}`);
    vibrate([30, 55, 45]);
    setReading(next);
    setChargeProgress(1);
    setRevealedCount(0);
    setRitualState('revealing');
    setChargeText('Your path is opening…');

    [0, 3000, 6000].forEach((delay, index) => {
      timers.current.push(setTimeout(() => {
        setSpotlightCardIndex(index);
        setChargeText(`${positions[index].label} card revealed.`);
        vibrate(index === 2 ? [18, 35, 28] : 16);
      }, delay));
    });
    timers.current.push(setTimeout(() => {
      setSpotlightCardIndex(null);
      setRevealedCount(3);
      setRitualState('done');
      setChargeText('Your full spread is below: Past, Present, Future. Tap each card to read it.');
    }, 9100));
  };

  const releaseCharge = event => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    window.getSelection?.().removeAllRanges();
    if (castStarted.current) return;
    if (!['charging', 'building'].includes(ritualState)) return;
    clearTimers();
    vibrate([10, 35, 10]);
    setRitualState('idle');
    setChargeProgress(0);
    setChargeText('Hold the moon for the full 5 seconds.');
  };

  const resetRitual = () => {
    clearTimers();
    if (reading.length > 0) {
      setFlippedCards([false, false, false]);
      setSpotlightCardIndex(null);
      setOpenCardIndex(null);
      const wheelRect = document.querySelector('.wheel')?.getBoundingClientRect();
      const wheelCenter = wheelRect && wheelRect.width > 0 && wheelRect.height > 0
        ? { x: wheelRect.left + wheelRect.width / 2, y: wheelRect.top + wheelRect.height / 2 }
        : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      if (wheelCenter) {
        setReturnClones(reading.map((item, index) => {
          const rect = cardRefs.current[index]?.getBoundingClientRect();
          if (!rect) return null;
          return {
            key: `${item.key}-${item.card.id}-return`,
            image: item.card.image,
            name: item.card.name,
            index,
            left: `${Math.round(rect.left)}px`,
            top: `${Math.round(rect.top)}px`,
            width: `${Math.round(rect.width)}px`,
            height: `${Math.round(rect.height)}px`,
            x: `${Math.round(wheelCenter.x - (rect.left + rect.width / 2))}px`,
            y: `${Math.round(wheelCenter.y - (rect.top + rect.height / 2))}px`
          };
        }).filter(Boolean));
      }
      setRevealedCount(0);
      setChargeProgress(0);
      setRitualState('returning');
      setChargeText('The cards rise back to the crown of the wheel.');
      vibrate([14, 28, 18]);
      timers.current.push(setTimeout(() => {
        setReading([]);
        setRevealedCount(0);
        setReturnClones([]);
        setOpenCardIndex(null);
        setIsClosingDetail(false);
        setRitualState('idle');
        setChargeText('Focus on a question,\nthen press and hold the moon.');
      }, 1250));
      return;
    }
    setReading([]);
    setRevealedCount(0);
    setReturnClones([]);
    setChargeProgress(0);
    setFlippedCards([false, false, false]);
    setSpotlightCardIndex(null);
    setOpenCardIndex(null);
    setIsClosingDetail(false);
    setRitualState('idle');
    setChargeText('Focus on a question,\nthen press and hold the moon.');
  };

  const isRitualActive = ['charging', 'building', 'charged', 'collapse', 'selected', 'revealing', 'returning'].includes(ritualState);
  const moonPhase = useMemo(() => getMoonPhase(), []);
  const flipCard = (index, sourceElement) => {
    if (sourceElement && typeof window !== 'undefined') {
      const rect = sourceElement.getBoundingClientRect();
      const targetWidth = Math.min(window.innerWidth, 760);
      setDetailOrigin({
        x: rect.left + rect.width / 2 - window.innerWidth / 2,
        y: rect.top + rect.height / 2 - window.innerHeight / 2,
        scale: Math.min(0.5, Math.max(0.18, rect.width / targetWidth))
      });
    }
    setIsClosingDetail(false);
    setDetailShowsArt(false);
    setOpenCardIndex(index);
  };
  const closeDetail = () => {
    setIsClosingDetail(true);
    timers.current.push(setTimeout(() => {
      setOpenCardIndex(null);
      setIsClosingDetail(false);
      setDetailShowsArt(false);
    }, 620));
  };

  return <main className={`app ${ritualState} ${assetsReady ? 'assets-ready' : 'is-preloading'}`} onContextMenu={event => event.preventDefault()} onSelect={event => event.preventDefault()} onSelectStart={event => event.preventDefault()}>
    {!assetsReady && <div className="preloader" role="status" aria-live="polite">
      <div className="preloader-copy">Opening the wheel…</div>
    </div>}
    <div className="stars">{seedStars.map(s => <i key={s.id} style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, width: s.size, height: s.size }} />)}</div>
    <TarotWheel reading={reading} ritualState={ritualState} chargeProgress={chargeProgress} />

    <a className="average-badge" href="https://b-average.com" target="_blank" rel="noreferrer" aria-label="B Average">B AVERAGE</a>

    {spotlightCardIndex !== null && reading[spotlightCardIndex] && <div className="mobile-reveal-stage" aria-hidden="true">
      <ReadingCard key={`${spotlightCardIndex}-${reading[spotlightCardIndex].card.id}`} item={reading[spotlightCardIndex]} index={spotlightCardIndex} flipped={false} spotlight={true} onFlip={() => {}} />
    </div>}

    <section className="ritual-status" aria-live="polite">
      {chargeText}
    </section>

    <button className="thumbprint-cue moon-hold" type="button" onPointerDown={beginCharge} onPointerUp={releaseCharge} onPointerCancel={releaseCharge} onPointerLeave={releaseCharge} aria-label={`Hold current moon phase: ${moonPhase.name}`} title={`Current moon phase: ${moonPhase.name}`}>
      <span className="moon-hold-orb" aria-hidden="true">{moonPhase.symbol}</span>
      <span className="thumbprint-label">{['charging', 'building', 'charged'].includes(ritualState) ? `${Math.round(chargeProgress * 100)}%` : moonPhase.name}</span>
    </button>

    <section className="spread" aria-live="polite">
      {positions.map((p, i) => revealedCount > i && reading[i] ? <ReadingCard key={reading[i].key + reading[i].card.id} item={reading[i]} index={i} flipped={false} spotlight={false} cardRef={element => { cardRefs.current[i] = element; }} onFlip={sourceElement => flipCard(i, sourceElement)} /> : <div className="empty-card" key={p.key}><h3>{p.label}</h3><p>{isRitualActive ? 'Waiting for the wheel to choose...' : p.prompt}</p></div>)}
    </section>

    {returnClones.length > 0 && <div className="return-clones" aria-hidden="true">
      {returnClones.map(clone => <div className="return-clone" key={clone.key} style={{ '--i': clone.index, '--return-x': clone.x, '--return-y': clone.y, left: clone.left, top: clone.top, width: clone.width, height: clone.height }}>
        <img src={clone.image} alt="" draggable="false" />
      </div>)}
    </div>}

    {openCardIndex !== null && reading[openCardIndex] && <div className={`detail-stage ${isClosingDetail ? 'is-closing' : ''}`} style={{ '--origin-x': `${detailOrigin.x}px`, '--origin-y': `${detailOrigin.y}px`, '--origin-scale': detailOrigin.scale }} role="dialog" aria-modal="true" aria-label={`${reading[openCardIndex].label}: ${reading[openCardIndex].card.name}`}>
      <ReadingCard item={reading[openCardIndex]} index={openCardIndex} flipped={!detailShowsArt} spotlight={false} fullScreen={true} showArt={detailShowsArt} onToggleArt={() => setDetailShowsArt(value => !value)} onFlip={closeDetail} />
    </div>}

    {reading.length > 0 && <section className="hero compact cast-again"><button onPointerDown={event => event.stopPropagation()} onPointerUp={event => event.stopPropagation()} onClick={resetRitual} disabled={isRitualActive}><span aria-hidden="true">✨</span> Cast again</button></section>}
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
