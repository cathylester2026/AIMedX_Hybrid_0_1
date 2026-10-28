import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, QrCode, Sparkles, Users } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { hasSupabase, supabase } from './supabase';

/* =========================================================================
   FUTURE-READY HOSPITAL CHALLENGE · HYBRID 0.5
   Steps 1–5: Join → Hospital reveal → Resources → Strategic briefs →
   Six-capability portfolio → Virtual Care full decision round
   ========================================================================= */

const BUILD_LABEL = 'HYBRID 0.5';
const SINGLE_PLAYER_URL =
  import.meta.env.VITE_SINGLE_PLAYER_URL ||
  'https://cathylester2026.github.io/AIMedX_Single_Player_Build_01/';
const BASE = import.meta.env.BASE_URL;

/* All responses are stored against this round id so the existing
   hybrid_responses unique constraint continues to work unchanged. */
const ROUND_ID = 'virtual-care';

/* ------------------------------------------------------------------ PERSONAS */

const PERSONAS = [
  { id: 'clinical', name: 'Clinical Leader', line: 'Protect care quality, safety and workforce usability.' },
  { id: 'operations', name: 'Operations Leader', line: 'Protect flow, reliability and implementation capacity.' },
  { id: 'digital', name: 'Digital Leader', line: 'Build an enabling platform without creating technical debt.' },
  { id: 'finance', name: 'Financial Steward', line: 'Protect capital flexibility and long-term value.' },
  { id: 'design', name: 'Facilities + Design Leader', line: 'Create adaptable infrastructure and environments.' }
];

const PERSONA_BRIEFS = {
  clinical: {
    name: 'Clinical Leader',
    responsibility: 'Protect the ability to deliver safe, effective care while the organization changes around it.',
    protect: ['Care quality', 'Workforce usability', 'Patient experience'],
    watch: ['Workflow burden', 'Clinical reliability', 'Adoption risk'],
    question: 'Will this actually make care better, or simply add another layer of complexity?'
  },
  operations: {
    name: 'Operations Leader',
    responsibility: 'Make transformation operationally achievable without destabilizing today’s care delivery.',
    protect: ['Continuity of care', 'Reliable operations', 'Implementation capacity'],
    watch: ['Workflow disruption', 'Staffing requirements', 'Change saturation'],
    question: 'Can we realistically implement this while continuing to operate?'
  },
  digital: {
    name: 'Digital Leader',
    responsibility: 'Create the enabling digital foundation while avoiding decisions that become tomorrow’s technical debt.',
    protect: ['Interoperability', 'Data availability', 'Platform scalability'],
    watch: ['Integration complexity', 'Network + data requirements', 'Technical debt'],
    question: 'Does this strengthen the platform for what comes next, or create another isolated solution?'
  },
  finance: {
    name: 'Financial Steward',
    responsibility: 'Protect the organization’s ability to fund transformation over time, not just the next investment.',
    protect: ['Capital flexibility', 'Long-term value', 'Investment capacity'],
    watch: ['First cost', 'Lifecycle cost', 'Stranded investment'],
    question: 'Is committing capital here more valuable than preserving it for what we may need next?'
  },
  design: {
    name: 'Facilities + Design Leader',
    responsibility: 'Create an environment that can support today’s decision without preventing tomorrow’s possibilities.',
    protect: ['Adaptability', 'Infrastructure capacity', 'Long-term flexibility'],
    watch: ['Space implications', 'MEP + network requirements', 'Premature physical commitments'],
    question: 'What does this decision require from the building, and what are we locking in if we act now?'
  }
};

/* ----------------------------------------------------------------- HOSPITALS */

const HOSPITALS = {
  academic: {
    id: 'academic',
    image: `${BASE}hospitals/aging-academic.png`,
    name: 'Aging Academic Medical Center',
    tagline: 'Renew while remaining operational.',
    description: 'Modernize what must change while preserving flexibility for futures that cannot be completely predicted.',
    mission: ['Protect complex care', 'Remain a learning environment', 'Avoid locking the project into today’s care model'],
    strength: 'Specialized clinical expertise',
    constraint: 'Aging infrastructure',
    condition: 'Ongoing operations and difficult phasing',
    tension: 'Your clinical ambitions exceed what the organization can change all at once.',
    resources: { capital: 16, infrastructure: 10, operationalReadiness: 16, changeCapacity: 9 }
  },
  regional: {
    id: 'regional',
    image: `${BASE}hospitals/regional-referral-campus-v2.png`,
    name: 'Regional Referral Hospital',
    tagline: 'Expand access while protecting specialized capacity.',
    description: 'Serve a growing region without diluting the clinical capabilities patients depend on.',
    mission: ['Expand access to specialty care', 'Protect critical referral capacity', 'Create a scalable regional platform'],
    strength: 'Trusted regional destination',
    constraint: 'Capacity pressure and uneven access',
    condition: 'Growth must occur while care demand continues',
    tension: 'The region needs more access, but growth can outpace workforce and infrastructure readiness.',
    resources: { capital: 14, infrastructure: 12, operationalReadiness: 13, changeCapacity: 11 }
  },
  distributed: {
    id: 'distributed',
    image: `${BASE}hospitals/distributed-system.png`,
    name: 'Distributed Health System',
    tagline: 'Create consistent care across a distributed network.',
    description: 'Connect hospitals, ambulatory sites and home settings into one coherent care platform.',
    mission: ['Create a consistent care experience', 'Extend expertise across the network', 'Reduce fragmentation between settings'],
    strength: 'Broad community reach',
    constraint: 'Inconsistent systems and workflows',
    condition: 'Multiple sites with different levels of readiness',
    tension: 'Your scale creates opportunity, but inconsistency makes every system-wide change harder.',
    resources: { capital: 15, infrastructure: 11, operationalReadiness: 12, changeCapacity: 13 }
  },
  greenfield: {
    id: 'greenfield',
    image: `${BASE}hospitals/greenfield.png`,
    name: 'Greenfield Medical Center',
    tagline: 'Build for futures that are still emerging.',
    description: 'Use a rare clean-slate opportunity without overcommitting to assumptions that may not last.',
    mission: ['Create a future-ready care platform', 'Enable new models of care', 'Preserve long-term adaptability'],
    strength: 'Clean-slate design opportunity',
    constraint: 'Uncertain future demand and care models',
    condition: 'Major decisions must be made before operations exist',
    tension: 'You can build almost anything, but every early commitment can reduce future flexibility.',
    resources: { capital: 18, infrastructure: 16, operationalReadiness: 10, changeCapacity: 12 }
  }
};

const TABLE_MAP = { 1: 'academic', 2: 'regional', 3: 'distributed', 4: 'greenfield', 5: 'academic', 6: 'regional' };

const RESOURCE_LABELS = {
  capital: 'Capital',
  infrastructure: 'Infrastructure',
  operationalReadiness: 'Operational readiness',
  changeCapacity: 'Change capacity'
};
const RESOURCE_HINTS = {
  capital: 'What you can afford to invest.',
  infrastructure: 'What your physical + digital foundation can support.',
  operationalReadiness: 'What you can implement while delivering care.',
  changeCapacity: 'How much transformation people and workflows can absorb.'
};
const ZERO_COST = { capital: 0, infrastructure: 0, operationalReadiness: 0, changeCapacity: 0 };

/* -------------------------------------------------------------- CAPABILITIES */

const CAPABILITIES = [
  {
    id: 'virtual-care',
    name: 'Virtual Care',
    promise: 'Extend care beyond the physical room.',
    image: `${BASE}capabilities/virtual-care.png`,
    demands: ['Infrastructure', 'Operational readiness', 'Change capacity'],
    preview: 'Connect patients, providers and expertise across locations.',
    available: true
  },
  {
    id: 'ambient-intelligence',
    name: 'Ambient Intelligence',
    promise: 'Reduce documentation burden and make spaces aware of people and activity.',
    image: `${BASE}capabilities/ambient-intelligence.png`,
    demands: ['Infrastructure', 'Change capacity', 'Data governance'],
    preview: 'Ambient documentation, passive sensing and context-aware rooms that give clinicians time back.'
  },
  {
    id: 'smart-rooms',
    name: 'Smart Rooms',
    promise: 'Create connected spaces that adapt to patient and care-team needs.',
    image: `${BASE}capabilities/smart-rooms.png`,
    demands: ['Capital', 'Infrastructure', 'Change capacity'],
    preview: 'Integrate patient controls, communication, environmental settings and care-team support.'
  },
  {
    id: 'autonomous-logistics',
    name: 'Autonomous Logistics',
    promise: 'Move materials without relying on people for every movement.',
    image: `${BASE}capabilities/autonomous-logistics.png`,
    demands: ['Capital', 'Infrastructure', 'Operational readiness'],
    preview: 'Use robotics and automation to improve supply movement, replenishment and nonclinical travel.'
  },
  {
    id: 'predictive-operations',
    name: 'Predictive Operations',
    promise: 'Anticipate demand before it becomes disruption.',
    image: `${BASE}capabilities/predictive-operations.png`,
    demands: ['Infrastructure', 'Operational readiness', 'Change capacity'],
    preview: 'Forecast capacity, staffing, flow, maintenance and asset needs.'
  },
  {
    id: 'care-platform',
    name: 'Next-Generation Care Platform',
    promise: 'Create the foundation that allows capabilities to work together.',
    image: `${BASE}capabilities/care-platform.png`,
    demands: ['Capital', 'Infrastructure', 'Change capacity'],
    preview: 'Establish interoperability, integrated data, enterprise identity and scalable digital services.'
  }
];
const capabilityById = id => CAPABILITIES.find(c => c.id === id) || null;

/* Hospital-specific mission fit for every capability (fixes generic cards). */
const CAPABILITY_FIT = {
  academic: {
    'virtual-care': { level: 'Moderate–High', note: 'Extends specialized expertise beyond the campus, but aging infrastructure may need enabling work first.' },
    'ambient-intelligence': { level: 'Moderate', note: 'Can reduce documentation burden without rebuilding every workflow, but legacy rooms limit sensing and network readiness.' },
    'smart-rooms': { level: 'Moderate', note: 'Improves experience, but retrofitting occupied units is costly and difficult to phase.' },
    'autonomous-logistics': { level: 'Low–Moderate', note: 'Constrained corridors, elevators and mixed building generations make automated movement difficult.' },
    'predictive-operations': { level: 'High', note: 'Helps protect complex-care capacity while renovation phasing disrupts space and flow.' },
    'care-platform': { level: 'High', note: 'Reduces integration debt accumulated across building and system generations.' }
  },
  regional: {
    'virtual-care': { level: 'High', note: 'Extends specialty access across a broad catchment and relieves pressure on referral capacity.' },
    'ambient-intelligence': { level: 'Moderate–High', note: 'Can extend scarce workforce capacity as regional demand grows.' },
    'smart-rooms': { level: 'Moderate', note: 'Supports growth units, but standardizing too early may limit flexibility as demand shifts.' },
    'autonomous-logistics': { level: 'Moderate', note: 'Expansion creates a chance to plan service routes, but benefit depends on scale.' },
    'predictive-operations': { level: 'High', note: 'Anticipates referral surges and capacity pressure before they become access problems.' },
    'care-platform': { level: 'Moderate–High', note: 'Connects referring partners and regional sites into a scalable platform.' }
  },
  distributed: {
    'virtual-care': { level: 'High', note: 'Directly extends expertise across sites and reduces fragmentation.' },
    'ambient-intelligence': { level: 'Moderate', note: 'Could create consistent documentation, but uneven site readiness complicates deployment.' },
    'smart-rooms': { level: 'Low–Moderate', note: 'Room-level investment must repeat across many sites with different readiness.' },
    'autonomous-logistics': { level: 'Low', note: 'Most movement occurs between sites, not within a single building.' },
    'predictive-operations': { level: 'Moderate–High', note: 'Enables system-wide capacity balancing, if data is consistent across sites.' },
    'care-platform': { level: 'Essential', note: 'Creates the common foundation every system-wide capability depends on.' }
  },
  greenfield: {
    'virtual-care': { level: 'High', note: 'Can be embedded into the care model and room standards from day one.' },
    'ambient-intelligence': { level: 'High', note: 'Sensing, power and network pathways can be built in before walls close.' },
    'smart-rooms': { level: 'High', note: 'The room standard and enabling infrastructure can be set before construction.' },
    'autonomous-logistics': { level: 'High', note: 'Dedicated routes, elevators and staging can be designed in rather than retrofitted.' },
    'predictive-operations': { level: 'Moderate', note: 'Valuable, but there is no operational history yet to predict from.' },
    'care-platform': { level: 'Essential', note: 'Establishes the enterprise foundation before operations and habits exist.' }
  }
};
const fitFor = (hospitalId, capId) => CAPABILITY_FIT[hospitalId]?.[capId] || null;

/* Capability-specific persona lenses (fixes repeated generic prompts). */
const CAPABILITY_LENSES = {
  'virtual-care': {
    clinical: 'Can virtual interaction improve access without compromising clinical reliability or adding workflow burden?',
    operations: 'Can this become part of routine care delivery without unsustainable coordination burden?',
    digital: 'Can the existing platform support scalable virtual care rather than another isolated solution?',
    finance: 'Does this extend access and capacity enough to justify the enabling investment?',
    design: 'Which spaces must support virtual interaction, and what should be embedded now versus kept adaptable?'
  },
  'ambient-intelligence': {
    clinical: 'Will ambient documentation give clinicians time back, or add another layer to verify?',
    operations: 'Can workflows absorb passive sensing without creating alert fatigue?',
    digital: 'Do we have the data governance, privacy controls and network to support always-on sensing?',
    finance: 'Is reduced documentation burden measurable enough to justify the investment?',
    design: 'What ceiling, power and network infrastructure must be embedded, and how quickly will sensors change?'
  },
  'smart-rooms': {
    clinical: 'Will connected rooms improve safety and experience, or add devices to manage at the bedside?',
    operations: 'Can staff support and maintain this across every unit?',
    digital: 'Will room systems integrate with the platform, or create another vendor island?',
    finance: 'Does the benefit justify repeating this package across hundreds of rooms?',
    design: 'Which room elements should be fixed now, and which should remain swappable?'
  },
  'autonomous-logistics': {
    clinical: 'Will automated delivery return nursing time to patients?',
    operations: 'Can supply chain, elevators and staffing models be redesigned around automation?',
    digital: 'Can robots integrate with doors, elevators, inventory and security systems?',
    finance: 'Will labor and reliability savings outweigh capital and maintenance cost?',
    design: 'What corridor widths, elevators, staging and charging zones does this require?'
  },
  'predictive-operations': {
    clinical: 'Will predictions support clinical judgment, or create pressure to follow the model?',
    operations: 'Will teams trust the forecasts enough to act on them?',
    digital: 'Is our data clean, timely and connected enough to predict anything?',
    finance: 'Can better capacity decisions defer or avoid capital investment?',
    design: 'What command-center space and building-system data does this require?'
  },
  'care-platform': {
    clinical: 'Will a common platform reduce the number of systems clinicians must navigate?',
    operations: 'Can we absorb an enterprise transition while continuing to operate?',
    digital: 'Is this the foundation that prevents every future capability from becoming technical debt?',
    finance: 'Can we defer this foundation without multiplying future integration costs?',
    design: 'What network, data and room infrastructure must the building provide for the platform?'
  }
};
const lensFor = (capId, persona) =>
  CAPABILITY_LENSES[capId]?.[persona] || CAPABILITY_LENSES[capId]?.clinical || '';

/* ------------------------------------------------------- VIRTUAL CARE ROUND */

const VIRTUAL_CARE = {
  id: 'virtual-care',
  name: 'Virtual Care',
  tagline: 'Extend care beyond the physical room.',
  image: `${BASE}capabilities/virtual-care.png`,
  opportunity: 'Extend specialist access, support distributed care and connect expertise across locations.',
  enables: ['Remote specialty consultation', 'Virtual nursing + support', 'Care beyond the hospital', 'More flexible use of expertise'],
  requires: ['Reliable network + audiovisual infrastructure', 'Appropriate room environments', 'Workflow integration', 'Staff adoption'],
  cost: { capital: 2, infrastructure: 2, operationalReadiness: 2, changeCapacity: 3 },
  adaptCost: { capital: 1, infrastructure: 1, operationalReadiness: 0, changeCapacity: 1 }
};

const VC_MISSION = {
  academic: {
    fit: 'Extends specialized expertise beyond the campus and creates options for managing demand without relying exclusively on additional physical capacity.',
    tradeoff: 'Aging infrastructure may require enabling network, audiovisual and room modernization before Virtual Care can operate reliably at scale.'
  },
  regional: {
    fit: 'Extends specialty access across a broad referral region and can reduce unnecessary travel while preserving access to specialized expertise.',
    tradeoff: 'Regional reach only improves if connectivity, staffing models and referral workflows are reliable across the catchment area.'
  },
  distributed: {
    fit: 'Directly supports the mission of extending expertise across settings and reducing fragmentation across the network.',
    tradeoff: 'Inconsistent infrastructure and workflows across sites may increase implementation complexity and change burden.'
  },
  greenfield: {
    fit: 'Allows virtual interaction to be embedded into the care model and space standards from the beginning.',
    tradeoff: 'Over-specifying today’s virtual-care technology could lock a new campus into solutions that will evolve quickly.'
  }
};

const costForChoice = choice =>
  choice === 'invest' ? VIRTUAL_CARE.cost : choice === 'adapt' ? VIRTUAL_CARE.adaptCost : ZERO_COST;

/* ------------------------------------------------------------------ HELPERS */

const code = () => `HYB-${Math.floor(100 + Math.random() * 900)}`;
const uid = () => crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const getJoinUrl = c => `${location.origin}${location.pathname}?join=${encodeURIComponent(c)}`;
const localKey = c => `aimedx-hybrid-${c}`;
const validTable = n => (Number.isInteger(Number(n)) && Number(n) >= 1 && Number(n) <= 6 ? Number(n) : null);
const activeTables = participants =>
  [...new Set((participants || []).map(p => validTable(p.table_number)).filter(Boolean))].sort((a, b) => a - b);
const byTime = (a, b) => String(a.updated_at || '').localeCompare(String(b.updated_at || ''));
const latest = rows => [...rows].sort(byTime).slice(-1)[0];

const responseFor = (responses, participantId, type) =>
  latest((responses || []).filter(r => r.participant_id === participantId && r.response_type === type));

/* The latest record for a table wins, INCLUDING cleared records (empty choice).
   This makes "Change selection" and "Keep discussing" work for anyone at the table. */
const tableLatest = (responses, table, type) => {
  const row = latest((responses || []).filter(r => r.response_type === type && validTable(r.table_number) === table));
  return row && row.choice ? row : null;
};
const tableAcks = (responses, table, decision) =>
  decision
    ? (responses || []).filter(
        r =>
          r.response_type === 'decision_ack' &&
          validTable(r.table_number) === table &&
          r.choice === decision.choice &&
          byTime(decision, r) <= 0
      ).length
    : 0;

/* --------------------------------------------------------------- DATA LAYER */

function loadLocal(c) {
  try {
    return JSON.parse(localStorage.getItem(localKey(c)) || 'null');
  } catch {
    return null;
  }
}
async function saveSession(s) {
  if (hasSupabase) {
    const { error } = await supabase.from('hybrid_sessions').upsert(s);
    if (error) throw error;
  } else {
    const current = loadLocal(s.code) || {};
    localStorage.setItem(
      localKey(s.code),
      JSON.stringify({ ...current, ...s, participants: current.participants || [], responses: current.responses || [] })
    );
  }
}
async function fetchSession(c) {
  if (hasSupabase) {
    const { data } = await supabase.from('hybrid_sessions').select('*').eq('code', c).maybeSingle();
    return data;
  }
  return loadLocal(c);
}
async function fetchParticipants(sessionId, c) {
  if (hasSupabase) {
    const { data } = await supabase.from('hybrid_participants').select('*').eq('session_id', sessionId).order('created_at');
    return data || [];
  }
  return loadLocal(c)?.participants || [];
}
async function addParticipant(p, c) {
  if (hasSupabase) {
    const { error } = await supabase.from('hybrid_participants').upsert(p);
    if (error) throw error;
  } else {
    const s = loadLocal(c) || {};
    const all = [...(s.participants || []).filter(x => x.id !== p.id), p];
    localStorage.setItem(localKey(c), JSON.stringify({ ...s, participants: all }));
  }
}
async function fetchResponses(sessionId, c) {
  if (hasSupabase) {
    const { data } = await supabase.from('hybrid_responses').select('*').eq('session_id', sessionId).order('updated_at');
    return data || [];
  }
  return loadLocal(c)?.responses || [];
}
async function saveResponse(r, c) {
  if (hasSupabase) {
    const { error } = await supabase
      .from('hybrid_responses')
      .upsert(r, { onConflict: 'session_id,participant_id,response_type,capability_id' });
    if (error) throw error;
  } else {
    const current = loadLocal(c) || {};
    const key = x => `${x.session_id}|${x.participant_id}|${x.response_type}|${x.capability_id}`;
    const all = [...(current.responses || []).filter(x => key(x) !== key(r)), r];
    localStorage.setItem(localKey(c), JSON.stringify({ ...current, responses: all }));
  }
}

/* ---------------------------------------------------------------- UI ATOMS */

function Button({ children, secondary = false, onClick, disabled = false, className = '' }) {
  return (
    <button type="button" className={`button ${secondary ? 'secondary' : ''} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">A<span>I</span></div>
      <div>
        <b>AIMedX</b>
        <small>FUTURE-READY HOSPITAL CHALLENGE</small>
      </div>
    </div>
  );
}
function Shell({ children, compact = false }) {
  return (
    <main className={compact ? 'app compact' : 'app'}>
      <header>
        <Brand />
        <span className="build">{BUILD_LABEL}</span>
      </header>
      {children}
      <footer>Stantec Healthcare · Strategy before technology</footer>
    </main>
  );
}
const FIT_COLORS = {
  Essential: '#35134f',
  High: '#6a2ca0',
  'Moderate–High': '#8a58b5',
  Moderate: '#9a6b18',
  'Low–Moderate': '#8a8590',
  Low: '#a7a2ab'
};
function FitBadge({ fit, compact = false }) {
  if (!fit) return null;
  return (
    <span
      style={{
        display: 'inline-block',
        background: FIT_COLORS[fit.level] || '#6a2ca0',
        color: '#fff',
        fontSize: compact ? 9 : 10,
        fontWeight: 800,
        letterSpacing: '.08em',
        padding: compact ? '4px 7px' : '6px 9px',
        textTransform: 'uppercase'
      }}
    >
      Mission fit · {fit.level}
    </span>
  );
}
function PhoneState({ kicker, title, text }) {
  return (
    <Shell compact>
      <section className="phone-card centered">
        <div className="eyebrow">{kicker}</div>
        <h1>{title}</h1>
        <p>{text}</p>
        <div className="pulse"><span /></div>
      </section>
    </Shell>
  );
}

/* =========================================================== FACILITATOR */

function Landing({ onFacilitated }) {
  return (
    <Shell>
      <section className="design-landing">
        <div className="landing-copy">
          <div className="eyebrow">HEALTHCARE FUTURES · BY STANTEC</div>
          <h1>Design for<br /><em>what comes next.</em></h1>
          <p>Mission shapes strategy. Strategy shapes decisions. Decisions shape design.</p>
          <div className="landing-actions">
            <a className="choice-tile" href={SINGLE_PLAYER_URL}>
              <span>01 · EXPLORE</span><b>On your own</b><small>Individual strategy experience</small><ArrowRight />
            </a>
            <button className="choice-tile primary" type="button" onClick={onFacilitated}>
              <span>02 · COLLABORATE</span><b>As a table</b><small>Facilitated strategy experience</small><ArrowRight />
            </button>
          </div>
        </div>
        <div className="landing-mosaic">
          {Object.values(HOSPITALS).map((h, i) => (
            <figure key={h.id}>
              <img src={h.image} alt="" />
              <figcaption><span>{String(i + 1).padStart(2, '0')}</span>{h.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </Shell>
  );
}

function FacilitatorStart({ onCreate, onBack }) {
  return (
    <Shell>
      <section className="fac-start">
        <div className="fac-visual">
          <img src={HOSPITALS.greenfield.image} alt="" />
          <div className="visual-tag">FACILITATED TABLE EXPERIENCE</div>
        </div>
        <div className="fac-copy">
          <button className="text-link" onClick={onBack}><ArrowLeft size={16} /> Back</button>
          <div className="eyebrow">COLLABORATE · BUILD A SHARED FUTURE</div>
          <h1>Create the room.</h1>
          <p>Generate a session code and QR. Each participant brings a perspective, joins a table and inherits a healthcare reality.</p>
          <Button onClick={onCreate}>CREATE SESSION <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

function Lobby({ session, participants, onAdvance }) {
  const groups = useMemo(
    () =>
      [1, 2, 3, 4, 5, 6]
        .map(n => ({ n, h: HOSPITALS[TABLE_MAP[n]], count: participants.filter(p => validTable(p.table_number) === n).length }))
        .filter(g => g.count > 0),
    [participants]
  );
  return (
    <Shell>
      <section className="room-head">
        <div>
          <div className="eyebrow">JOIN THE EXPERIENCE</div>
          <h1>{session.code}</h1>
          <p>Scan · Initials · Perspective · Table</p>
        </div>
        <div className="qr"><QRCodeSVG value={getJoinUrl(session.code)} size={176} /></div>
      </section>
      <div className="participant-total">
        <Users /> <b>{participants.length}</b> participant{participants.length === 1 ? '' : 's'} joined
      </div>
      {groups.length === 0 ? (
        <section className="waiting-tables">
          <span>WAITING FOR TEAMS</span>
          <h2>Table cards appear as teams join.</h2>
          <p>Keep the QR and session code on screen while participants choose their table.</p>
        </section>
      ) : (
        <section className={`table-grid active-${groups.length}`}>
          {groups.map(g => (
            <article className="visual-table-card" key={g.n}>
              <img src={g.h.image} alt="" />
              <div className="visual-card-copy">
                <span>TABLE {g.n}</span>
                <h3>{g.h.name}</h3>
                <b>{g.count} joined</b>
              </div>
            </article>
          ))}
        </section>
      )}
      <div className="room-actions">
        <Button onClick={() => onAdvance('assignments')} disabled={!participants.length}>
          REVEAL YOUR HOSPITALS <ArrowRight size={18} />
        </Button>
      </div>
    </Shell>
  );
}

function AssignmentRoom({ participants, onAdvance }) {
  const active = activeTables(participants);
  return (
    <Shell>
      <section className="stage-title">
        <div className="eyebrow">CONTEXT BEFORE TECHNOLOGY</div>
        <h1>Your challenge starts with<br />who you are building for.</h1>
        <p>Different missions. Different assets. Different constraints.</p>
      </section>
      <section className={`assignment-grid active-${active.length}`}>
        {active.map(n => {
          const h = HOSPITALS[TABLE_MAP[n]];
          return (
            <article className="reveal-card" key={n}>
              <img src={h.image} alt="" />
              <div><span>TABLE {n}</span><h2>{h.name}</h2><p>{h.tagline}</p></div>
            </article>
          );
        })}
      </section>
      <div className="room-actions">
        <Button onClick={() => onAdvance('context')}>REVEAL THE CHALLENGE <ArrowRight size={18} /></Button>
      </div>
    </Shell>
  );
}

function ContextRoom({ participants, onAdvance }) {
  const active = activeTables(participants);
  return (
    <Shell>
      <section className="stage-title slim">
        <div className="eyebrow">YOUR HOSPITALS</div>
        <h1>Mission meets inherited reality.</h1>
        <p>Every table begins from a different strategic position.</p>
      </section>
      <section className={`context-columns active-${active.length}`}>
        {active.map(n => {
          const h = HOSPITALS[TABLE_MAP[n]];
          return (
            <article key={n}>
              <img src={h.image} alt="" />
              <span>TABLE {n}</span>
              <h2>{h.name}</h2>
              <p>{h.tagline}</p>
              <div><b>STRENGTH</b>{h.strength}</div>
              <div><b>CONSTRAINT</b>{h.constraint}</div>
              <div><b>CONDITION</b>{h.condition}</div>
            </article>
          );
        })}
      </section>
      <div className="room-actions">
        <Button onClick={() => onAdvance('tension')}>REVEAL THE TENSION <ArrowRight size={18} /></Button>
      </div>
    </Shell>
  );
}

function TensionRoom({ onAdvance }) {
  return (
    <Shell>
      <section className="center-stage tension-stage">
        <div className="eyebrow">WATCH THIS TENSION</div>
        <h1>Your ambition exceeds what<br />you can change all at once.</h1>
        <p>Every table has a distinct version of this tension on the phone.</p>
        <Button onClick={() => onAdvance('resources')}>UNDERSTAND YOUR STARTING POSITION <ArrowRight size={18} /></Button>
      </section>
    </Shell>
  );
}

function ResourcesRoom({ participants = [], onAdvance }) {
  const active = activeTables(participants);
  return (
    <Shell>
      <section className="stage-title resource-intro">
        <div className="eyebrow">YOUR CAPACITY TO CHANGE</div>
        <h1>Resources make the choices real.</h1>
        <p>Every future capability has a cost. Some require capital. Some demand infrastructure. Others depend on operational readiness or the organization’s ability to absorb change.</p>
      </section>
      <section className="resource-explainer">
        {Object.keys(RESOURCE_LABELS).map(k => (
          <div key={k}><b>{RESOURCE_LABELS[k].toUpperCase()}</b><span>{RESOURCE_HINTS[k]}</span></div>
        ))}
      </section>
      <div className="resource-bridge">
        <strong>As your team invests, these resources will be used.</strong>
        <span>Your challenge is to advance the mission without exhausting the system’s capacity to adapt.</span>
      </div>
      <section className={`resource-table active-${active.length}`}>
        {active.map(n => {
          const h = HOSPITALS[TABLE_MAP[n]];
          return (
            <article key={n}>
              <span>TABLE {n}</span>
              <h3>{h.name}</h3>
              <div className="resource-row">
                {Object.entries(h.resources).map(([k, v]) => (
                  <div key={k}><small>{RESOURCE_LABELS[k]}</small><b>{v}</b></div>
                ))}
              </div>
            </article>
          );
        })}
      </section>
      <section className="resource-mechanic">
        <div><b>INVEST</b><span>Resources are consumed.</span></div>
        <div><b>PRESERVE</b><span>Capacity remains available.</span></div>
        <div><b>ADAPT</b><span>Flexibility can reduce future exposure.</span></div>
      </section>
      <blockquote>Your job is not to buy the most technology. Your job is to advance the mission without compromising the system’s ability to adapt.</blockquote>
      <div className="room-actions">
        <Button onClick={() => onAdvance('discussion')}>BEGIN TABLE DISCUSSION <ArrowRight size={18} /></Button>
      </div>
    </Shell>
  );
}

function Countdown({ seconds }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setRemaining(x => Math.max(0, x - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  return <div className="timer">{remaining}</div>;
}

function DiscussionRoom({ onAdvance }) {
  return (
    <Shell>
      <section className="center-stage discussion">
        <div className="eyebrow">BEFORE YOU INVEST</div>
        <h1>What is the one thing your team<br />cannot afford to get wrong?</h1>
        <Countdown seconds={60} />
        <p>DISCUSS AT YOUR TABLE · SECONDS</p>
        <Button onClick={() => onAdvance('brief_reveal')}>REVEAL STRATEGIC BRIEFS <ArrowRight size={18} /></Button>
      </section>
    </Shell>
  );
}

function BriefRevealRoom({ onAdvance }) {
  return (
    <Shell>
      <section className="brief-room">
        <div className="brief-room-copy">
          <div className="eyebrow">ONE SYSTEM · DIFFERENT RESPONSIBILITIES</div>
          <h1>You won't all see the challenge <em>the same way.</em></h1>
          <p>Your hospital has one mission, but leadership decisions are made through different lenses. Your phone now contains the part of the challenge you are responsible for protecting.</p>
          <Button onClick={() => onAdvance('brief_read')}>LOOK AT YOUR PHONE <ArrowRight size={18} /></Button>
        </div>
        <div className="lens-field" aria-hidden="true">
          <span>CLINICAL</span><span>OPERATIONS</span><span>DIGITAL</span><span>FINANCE</span><span>DESIGN</span>
          <b>ONE<br />SYSTEM</b>
        </div>
      </section>
    </Shell>
  );
}

function BriefReadRoom({ onAdvance }) {
  return (
    <Shell>
      <section className="center-stage brief-timer">
        <div className="eyebrow">READ YOUR BRIEF PRIVATELY</div>
        <h1>Where do you expect<br /><em>tension to emerge?</em></h1>
        <Countdown seconds={30} />
        <p>SECONDS · YOUR PHONE CONTAINS YOUR PRIVATE DECISION LENS</p>
        <Button onClick={() => onAdvance('brief_share')}>INTRODUCE YOUR LENS <ArrowRight size={18} /></Button>
      </section>
    </Shell>
  );
}

function PerspectiveCards({ participants, responses, large = false }) {
  const perspectives = responses.filter(r => r.response_type === 'perspective');
  return (
    <div className={`captured-perspectives ${large ? 'large' : ''}`}>
      {participants.map(p => {
        const brief = PERSONA_BRIEFS[p.persona];
        const r = latest(perspectives.filter(x => x.participant_id === p.id));
        return (
          <article key={p.id}>
            <span>{brief?.name || p.persona} · T{validTable(p.table_number) || '—'}</span>
            <b>{r?.choice || (large ? brief?.protect?.[0] : 'Waiting for perspective')}</b>
            {r?.note && <p>“{r.note}”</p>}
            {large && <small>{brief?.question}</small>}
          </article>
        );
      })}
    </div>
  );
}

function BriefShareRoom({ onAdvance, responses = [], participants = [] }) {
  return (
    <Shell>
      <section className="brief-share-room">
        <div className="eyebrow">DIFFERENT PERSPECTIVES · ONE HOSPITAL</div>
        <h1>Introduce the responsibility you chose.</h1>
        <p>Each player selects one priority on the phone, then explains why it matters for this hospital.</p>
        <PerspectiveCards participants={participants} responses={responses} />
        <div className="room-actions">
          <Button onClick={() => onAdvance('alignment')}>CONTINUE <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

function AlignmentRoom({ onAdvance, responses = [], participants = [] }) {
  return (
    <Shell>
      <section className="alignment-room">
        <div className="eyebrow">ONE HOSPITAL · COMPETING RESPONSIBILITIES</div>
        <h1>These priorities are all legitimate.</h1>
        <p>The next decision will require each table to balance them. Use these perspective cards when explaining your choice.</p>
        <PerspectiveCards participants={participants} responses={responses} large />
        <div className="room-actions">
          <Button onClick={() => onAdvance('ready')}>READY FOR THE FIRST DECISION <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

function ReadyRoom({ onAdvance }) {
  return (
    <Shell>
      <section className="center-stage ready-room">
        <div className="eyebrow">STEP 3 COMPLETE</div>
        <h1>One hospital.<br /><em>Five legitimate lenses.</em></h1>
        <p>Your table is ready to review the capability portfolio.</p>
        <Button onClick={() => onAdvance('cap_portfolio')}>BEGIN ROUND 1 <ArrowRight size={18} /></Button>
      </section>
    </Shell>
  );
}

/* ------------------------------------------------ STEP 5 · CAPABILITY ROOMS */

function CapabilityPortfolioRoom({ participants = [], onAdvance }) {
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="cap-portfolio-room">
        <div className="cap-portfolio-head">
          <div>
            <div className="eyebrow">SIX POSSIBILITIES · LIMITED CAPACITY</div>
            <h1>Where should your hospital invest?</h1>
          </div>
          <p>Selection means evaluate, not commit. Resources are spent only after the full implications are understood. Each phone shows the mission fit for that table’s hospital.</p>
        </div>
        <div className="cap-grid">
          {CAPABILITIES.map((c, i) => (
            <article key={c.id}>
              <div className="cap-image">
                <img src={c.image} alt="" />
                <span>0{i + 1}</span>
                {c.available && <b>FULL FLOW AVAILABLE</b>}
              </div>
              <div className="cap-card-copy">
                <h2>{c.name}</h2>
                <p>{c.promise}</p>
                <div>{c.demands.map(x => <span key={x}>{x}</span>)}</div>
                <div style={{ display: 'grid', gap: 4, marginTop: 10 }}>
                  {tables.map(t => {
                    const fit = fitFor(TABLE_MAP[t], c.id);
                    return (
                      <small key={t} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#4b494e' }}>
                        <span>TABLE {t}</span><b>{fit?.level}</b>
                      </small>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="room-actions">
          <Button onClick={() => onAdvance('cap_nominate')}>OPEN PRIVATE NOMINATIONS <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

function ProgressGrid({ participants, done, label }) {
  return (
    <div className="progress-grid">
      {activeTables(participants).map(t => {
        const members = participants.filter(p => validTable(p.table_number) === t);
        const count = members.filter(p => done(p)).length;
        return (
          <article key={t}>
            <span>TABLE {t}</span>
            <b>{count} of {members.length}</b>
            <small>{count === members.length ? `ALL ${label} IN` : `${label} SUBMITTED`}</small>
            <div><i style={{ width: `${members.length ? (count / members.length) * 100 : 0}%` }} /></div>
          </article>
        );
      })}
    </div>
  );
}

function CapabilityNominationRoom({ participants = [], responses = [], onAdvance }) {
  const noms = responses.filter(r => r.response_type === 'capability_nomination' && r.choice);
  return (
    <Shell>
      <section className="cap-nom-room">
        <div className="eyebrow">PRIVATE NOMINATION</div>
        <h1>Which capability should your table evaluate?</h1>
        <p>The room shows completion only until nominations are revealed.</p>
        <ProgressGrid participants={participants} label="NOMINATIONS" done={p => noms.some(n => n.participant_id === p.id)} />
        <div className="room-actions">
          <Button onClick={() => onAdvance('cap_select')}>REVEAL NOMINATIONS <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

function CapabilitySelectionRoom({ participants = [], responses = [], onAdvance }) {
  const noms = responses.filter(r => r.response_type === 'capability_nomination' && r.choice);
  const tables = activeTables(participants);
  const allSelected = tables.length > 0 && tables.every(t => tableLatest(responses, t, 'capability_selection'));
  return (
    <Shell>
      <section className="cap-selection-room">
        <div className="eyebrow">NOMINATION RESULTS</div>
        <h1>Choose one capability to evaluate.</h1>
        <p>These totals show interest, not commitment. On one phone at each table, record the shared selection.</p>
        <div className="cap-tally-grid">
          {tables.map(t => {
            const members = participants.filter(p => validTable(p.table_number) === t);
            const sel = tableLatest(responses, t, 'capability_selection');
            const selCap = sel ? capabilityById(sel.choice) : null;
            return (
              <article key={t}>
                <span>TABLE {t} · {HOSPITALS[TABLE_MAP[t]].name}</span>
                {CAPABILITIES.map(c => {
                  const count = members.filter(p => latest(noms.filter(n => n.participant_id === p.id))?.choice === c.id).length;
                  const personas = members
                    .filter(p => latest(noms.filter(n => n.participant_id === p.id))?.choice === c.id)
                    .map(p => PERSONA_BRIEFS[p.persona]?.name.split(' ')[0])
                    .join(', ');
                  return (
                    <div key={c.id}>
                      <b>{c.name}{personas && <small style={{ display: 'block', fontWeight: 400, color: '#777' }}>{personas}</small>}</b>
                      <strong>{count}</strong>
                    </div>
                  );
                })}
                <div className="selection-live-status">
                  <b>SHARED SELECTION</b>
                  <strong>{selCap?.name || 'WAITING FOR SELECTION'}</strong>
                </div>
              </article>
            );
          })}
        </div>
        <div className="room-actions">
          <Button disabled={!allSelected} onClick={() => onAdvance('cap_confirm')}>
            {allSelected ? 'CONFIRM TABLE SELECTIONS' : 'WAITING FOR TABLE SELECTIONS'} <ArrowRight size={18} />
          </Button>
        </div>
      </section>
    </Shell>
  );
}

function CapabilityConfirmRoom({ participants = [], responses = [], onAdvance }) {
  const tables = activeTables(participants);
  const rows = tables.map(t => tableLatest(responses, t, 'capability_selection'));
  const allSelected = tables.length > 0 && rows.every(Boolean);
  const allVirtual = allSelected && rows.every(r => r.choice === 'virtual-care');
  return (
    <Shell>
      <section className="cap-confirm-room">
        <div className="eyebrow">SELECTED FOR EVALUATION</div>
        <h1>No resources have been committed yet.</h1>
        <p>Virtual Care is the complete investment round in this prototype. Tables that chose another capability will see a preview first.</p>
        <div className="cap-confirm-grid">
          {tables.map((t, i) => {
            const row = rows[i];
            const c = row ? capabilityById(row.choice) : null;
            const fit = c ? fitFor(TABLE_MAP[t], c.id) : null;
            return (
              <article key={t}>
                <img src={(c || CAPABILITIES[0]).image} alt="" />
                <div>
                  <span>TABLE {t} · {HOSPITALS[TABLE_MAP[t]].name}</span>
                  <h2>{c ? c.name : 'WAITING FOR SELECTION'}</h2>
                  <p>{c ? c.promise : 'A table member can still record the selection on the phone.'}</p>
                  {fit && <FitBadge fit={fit} compact />}
                  {c && <small style={{ display: 'block', marginTop: 8 }}>{c.available ? 'FULL FLOW READY' : 'PREVIEW AVAILABLE'}</small>}
                </div>
              </article>
            );
          })}
        </div>
        <div className="room-actions">
          <Button secondary onClick={() => onAdvance('cap_select')}>CHANGE SELECTION</Button>
          <Button disabled={!allSelected} onClick={() => onAdvance(allVirtual ? 'vc_reveal' : 'cap_preview')}>
            CONTINUE <ArrowRight size={18} />
          </Button>
        </div>
      </section>
    </Shell>
  );
}

function CapabilityPreviewRoom({ participants = [], responses = [], onAdvance }) {
  const tables = activeTables(participants);
  const previews = tables
    .map(t => ({ t, row: tableLatest(responses, t, 'capability_selection') }))
    .filter(x => x.row && x.row.choice !== 'virtual-care');
  return (
    <Shell>
      <section className="cap-confirm-room">
        <div className="eyebrow">CAPABILITY PREVIEWS</div>
        <h1>Different hospitals. Different first priorities.</h1>
        <p>These capabilities are recorded for reporting. Full investment rounds for them are not included in this prototype, so every table will now evaluate Virtual Care together and compare how the same capability plays out in different hospitals.</p>
        <div className="cap-confirm-grid">
          {previews.map(({ t, row }) => {
            const c = capabilityById(row.choice);
            const fit = fitFor(TABLE_MAP[t], c.id);
            return (
              <article key={t}>
                <img src={c.image} alt="" />
                <div>
                  <span>TABLE {t} · {HOSPITALS[TABLE_MAP[t]].name}</span>
                  <h2>{c.name}</h2>
                  <p>{c.preview}</p>
                  <FitBadge fit={fit} compact />
                  <p style={{ fontSize: 13, marginTop: 8 }}>{fit?.note}</p>
                </div>
              </article>
            );
          })}
        </div>
        <div className="room-actions">
          <Button secondary onClick={() => onAdvance('cap_select')}>CHANGE SELECTIONS</Button>
          <Button onClick={() => onAdvance('vc_reveal')}>EVALUATE VIRTUAL CARE TOGETHER <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

/* ----------------------------------------------- STEP 4 · VIRTUAL CARE ROOMS */

function VCRevealRoom({ onAdvance }) {
  return (
    <Shell>
      <section className="vc-hero">
        <div className="vc-image">
          <img src={VIRTUAL_CARE.image} alt="" />
          <div className="vc-round">ROUND 1 · INVEST</div>
        </div>
        <div className="vc-hero-copy">
          <div className="eyebrow">YOUR FIRST OPPORTUNITY</div>
          <h1>Virtual<br /><em>Care.</em></h1>
          <h2>{VIRTUAL_CARE.tagline}</h2>
          <p>{VIRTUAL_CARE.opportunity}</p>
          <div className="vc-mini-grid">
            <div><b>WHAT IT ENABLES</b>{VIRTUAL_CARE.enables.map(x => <span key={x}>{x}</span>)}</div>
            <div><b>BUT IT REQUIRES</b>{VIRTUAL_CARE.requires.map(x => <span key={x}>{x}</span>)}</div>
          </div>
          <Button onClick={() => onAdvance('vc_instinct')}>SEE IT THROUGH YOUR LENS <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

function VCInstinctRoom({ onAdvance, participants = [], responses = [] }) {
  const votes = responses.filter(r => r.response_type === 'first_instinct' && r.choice);
  return (
    <Shell>
      <section className="center-stage vc-instinct-room">
        <div className="eyebrow">PRIVATE FIRST INSTINCT</div>
        <h1>What would <em>you</em> do?</h1>
        <p>Vote privately on your phone. The room shows completion only, not choices.</p>
        <ProgressGrid participants={participants} label="RESPONSES" done={p => votes.some(v => v.participant_id === p.id)} />
        <Button onClick={() => onAdvance('vc_cost')}>REVEAL THE COST <ArrowRight size={18} /></Button>
      </section>
    </Shell>
  );
}

function VCCostRoom({ onAdvance }) {
  return (
    <Shell>
      <section className="vc-cost-room">
        <div className="eyebrow">EVERY CAPABILITY HAS A COST</div>
        <h1>Investment consumes capacity.</h1>
        <p>Full commitment requires more than capital. It draws on infrastructure, operations and the organization’s ability to absorb change.</p>
        <div className="cost-compare">
          <div className="cost-card invest">
            <span>FULL INVESTMENT</span><h2>INVEST</h2>
            {Object.entries(VIRTUAL_CARE.cost).map(([k, v]) => <div key={k}><b>{RESOURCE_LABELS[k]}</b><strong>{v}</strong></div>)}
          </div>
          <div className="cost-card adapt">
            <span>PRESERVE OPTIONALITY</span><h2>ADAPT</h2>
            {Object.entries(VIRTUAL_CARE.adaptCost).map(([k, v]) => <div key={k}><b>{RESOURCE_LABELS[k]}</b><strong>{v}</strong></div>)}
            <p>Optionality is not free. Enabling infrastructure still requires investment.</p>
          </div>
          <div className="cost-card preserve">
            <span>DEFER</span><h2>PRESERVE</h2>
            <div className="preserve-zero">0</div>
            <p>Resources remain available for priorities still ahead.</p>
          </div>
        </div>
        <div className="room-actions">
          <Button onClick={() => onAdvance('vc_mission')}>CONNECT TO MISSION <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

function VCMissionRoom({ participants = [], onAdvance }) {
  const active = [...new Set(participants.map(p => TABLE_MAP[validTable(p.table_number)]).filter(Boolean))];
  return (
    <Shell>
      <section className="vc-mission-room">
        <div className="eyebrow">MISSION BEFORE TECHNOLOGY</div>
        <h1>Same capability. Different strategic fit.</h1>
        <div className="mission-fit-grid">
          {active.map(id => {
            const h = HOSPITALS[id];
            const m = VC_MISSION[id];
            return (
              <article key={id}>
                <span>{h.name}</span>
                <div style={{ marginTop: 8 }}><FitBadge fit={fitFor(id, 'virtual-care')} compact /></div>
                <h3>WHY IT FITS</h3><p>{m.fit}</p>
                <h3>THE TRADE-OFF</h3><p>{m.tradeoff}</p>
              </article>
            );
          })}
        </div>
        <div className="room-actions">
          <Button onClick={() => onAdvance('vc_design')}>TRANSLATE TO DESIGN <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

function VCDesignRoom({ onAdvance }) {
  return (
    <Shell>
      <section className="vc-design-room">
        <div className="eyebrow">WHAT THIS DECISION MEANS FOR DESIGN</div>
        <h1>A technology decision becomes a design requirement.</h1>
        <div className="design-implications">
          <div><b>SPACE</b><p>Rooms need appropriate sightlines, lighting, acoustics and backgrounds.</p></div>
          <div><b>INFRASTRUCTURE</b><p>Network, power, mounting and audiovisual capability become baseline requirements.</p></div>
          <div><b>OPERATIONS</b><p>Clinical workflow must account for remote participants and new patterns of interaction.</p></div>
          <div><b>FLEXIBILITY</b><p>Not every room needs identical technology, but the environment should make expansion possible.</p></div>
        </div>
        <div className="room-actions">
          <Button onClick={() => onAdvance('vc_discuss')}>REVEAL FIRST INSTINCTS <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

function VCDiscussRoom({ participants = [], responses = [], onAdvance }) {
  const votes = responses.filter(r => r.response_type === 'first_instinct' && r.choice);
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="vc-discuss-room">
        <div className="eyebrow">REVEAL FIRST INSTINCTS</div>
        <h1>Now you can see where the tension lives.</h1>
        <p>Names remain private. Personas are visible because the leadership lens is part of the learning.</p>
        <div className="tally-table-grid">
          {tables.map(t => {
            const members = participants.filter(p => validTable(p.table_number) === t);
            const rows = members.map(p => ({ p, r: latest(votes.filter(v => v.participant_id === p.id)) }));
            const counts = ['invest', 'preserve', 'adapt'].map(c => [c, rows.filter(x => x.r?.choice === c).length]);
            return (
              <article key={t}>
                <span>TABLE {t} · {HOSPITALS[TABLE_MAP[t]].name}</span>
                <div className="persona-votes">
                  {rows.map(({ p, r }) => (
                    <div key={p.id}>
                      <b>{PERSONA_BRIEFS[p.persona]?.name}</b>
                      <strong className={r?.choice || 'waiting'}>{r?.choice?.toUpperCase() || 'NO VOTE'}</strong>
                    </div>
                  ))}
                </div>
                <div className="tally-bars">
                  {counts.map(([c, n]) => <div key={c}><span>{c}</span><b>{n}</b></div>)}
                </div>
              </article>
            );
          })}
        </div>
        <div className="discussion-note">
          <b>60–90 SEC</b>
          <span>What changed after seeing cost, mission fit and design consequences?</span>
        </div>
        <div className="room-actions">
          <Button onClick={() => onAdvance('vc_table_decision')}>MAKE THE TABLE DECISION <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

function VCTableDecisionRoom({ participants = [], responses = [], onAdvance }) {
  const tables = activeTables(participants);
  const allDecided = tables.length > 0 && tables.every(t => tableLatest(responses, t, 'table_decision'));
  return (
    <Shell>
      <section className="vc-decision-room">
        <div className="eyebrow">ONE TEAM · ONE DECISION</div>
        <h1>Resolve the trade-off together.</h1>
        <p>Any table member can propose the decision. Everyone else acknowledges or keeps the discussion open.</p>
        <div className="decision-status-grid">
          {tables.map(t => {
            const d = tableLatest(responses, t, 'table_decision');
            const members = participants.filter(p => validTable(p.table_number) === t).length;
            const acks = tableAcks(responses, t, d);
            return (
              <article key={t}>
                <span>TABLE {t} · {HOSPITALS[TABLE_MAP[t]].name}</span>
                <h2>{d?.choice?.toUpperCase() || 'DISCUSSING'}</h2>
                <p>{d ? `${acks} of ${members} acknowledged` : 'Waiting for a proposed decision'}</p>
              </article>
            );
          })}
        </div>
        <div className="room-actions">
          <Button onClick={() => onAdvance('vc_portfolio')}>
            {allDecided ? 'APPLY DECISIONS' : 'APPLY DECISIONS (UNDECIDED TABLES MAKE NO CHANGE)'} <ArrowRight size={18} />
          </Button>
        </div>
      </section>
    </Shell>
  );
}

function VCPortfolioRoom({ participants = [], responses = [] }) {
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="vc-portfolio-room">
        <div className="eyebrow">ROUND 1 CHECKPOINT</div>
        <h1>Your hospitals are beginning to take shape.</h1>
        <div className="portfolio-table-grid">
          {tables.map(t => {
            const h = HOSPITALS[TABLE_MAP[t]];
            const d = tableLatest(responses, t, 'table_decision');
            const choice = d?.choice || null;
            const cost = costForChoice(choice);
            return (
              <article key={t}>
                <img src={VIRTUAL_CARE.image} alt="" />
                <div>
                  <span>TABLE {t} · {h.name}</span>
                  <h2>{choice ? choice.toUpperCase() : 'NO DECISION'}</h2>
                  <p>
                    {choice === 'invest'
                      ? 'Virtual Care committed.'
                      : choice === 'adapt'
                      ? 'Enabled for future adoption.'
                      : choice === 'preserve'
                      ? 'Virtual Care deferred. Capacity preserved.'
                      : 'No table decision recorded. Resources unchanged.'}
                  </p>
                  <div className="remaining-resources">
                    {Object.entries(h.resources).map(([k, v]) => (
                      <div key={k}><small>{RESOURCE_LABELS[k]}</small><b>{v} → {v - cost[k]}</b></div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </Shell>
  );
}

function CompleteRoom() {
  return (
    <Shell>
      <section className="center-stage">
        <div className="icon-disc"><Sparkles /></div>
        <div className="eyebrow">CHECKPOINT</div>
        <h1>Did context change the conversation?</h1>
        <p>Did the hospital’s mission, constraints and resources change how your table was beginning to think about technology?</p>
      </section>
    </Shell>
  );
}

function Facilitator({ onExit }) {
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [responses, setResponses] = useState([]);
  const busy = useRef(false);

  const create = async () => {
    const s = { id: uid(), code: code(), phase: 'lobby', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    await saveSession(s);
    setSession(s);
  };

  const refresh = async () => {
    if (!session || busy.current) return;
    busy.current = true;
    try {
      const s = await fetchSession(session.code);
      if (s) setSession(x => ({ ...x, ...s }));
      setParticipants(await fetchParticipants(session.id, session.code));
      setResponses(await fetchResponses(session.id, session.code));
    } finally {
      busy.current = false;
    }
  };

  useEffect(() => {
    if (!session) return;
    refresh();
    const t = setInterval(refresh, 1500);
    let channel;
    if (hasSupabase) {
      channel = supabase
        .channel(`hybrid-room-${session.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hybrid_sessions', filter: `id=eq.${session.id}` }, refresh)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hybrid_participants', filter: `session_id=eq.${session.id}` }, refresh)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hybrid_responses', filter: `session_id=eq.${session.id}` }, refresh)
        .subscribe();
    }
    return () => {
      clearInterval(t);
      if (channel) supabase.removeChannel(channel);
    };
  }, [session?.id]);

  const advance = async phase => {
    const next = { ...session, phase, updated_at: new Date().toISOString() };
    await saveSession(next);
    setSession(next);
  };

  if (!session) return <FacilitatorStart onCreate={create} onBack={onExit} />;

  const props = { participants, responses, onAdvance: advance };
  switch (session.phase) {
    case 'lobby': return <Lobby session={session} {...props} />;
    case 'assignments': return <AssignmentRoom {...props} />;
    case 'context': return <ContextRoom {...props} />;
    case 'tension': return <TensionRoom {...props} />;
    case 'resources': return <ResourcesRoom {...props} />;
    case 'discussion': return <DiscussionRoom {...props} />;
    case 'brief_reveal': return <BriefRevealRoom {...props} />;
    case 'brief_read': return <BriefReadRoom {...props} />;
    case 'brief_share': return <BriefShareRoom {...props} />;
    case 'alignment': return <AlignmentRoom {...props} />;
    case 'ready': return <ReadyRoom {...props} />;
    case 'cap_portfolio': return <CapabilityPortfolioRoom {...props} />;
    case 'cap_nominate': return <CapabilityNominationRoom {...props} />;
    case 'cap_select': return <CapabilitySelectionRoom {...props} />;
    case 'cap_confirm': return <CapabilityConfirmRoom {...props} />;
    case 'cap_preview': return <CapabilityPreviewRoom {...props} />;
    case 'vc_reveal': return <VCRevealRoom {...props} />;
    case 'vc_instinct': return <VCInstinctRoom {...props} />;
    case 'vc_cost': return <VCCostRoom {...props} />;
    case 'vc_mission': return <VCMissionRoom {...props} />;
    case 'vc_design': return <VCDesignRoom {...props} />;
    case 'vc_discuss': return <VCDiscussRoom {...props} />;
    case 'vc_table_decision': return <VCTableDecisionRoom {...props} />;
    case 'vc_portfolio': return <VCPortfolioRoom {...props} />;
    default: return <CompleteRoom />;
  }
}

/* ============================================================ PARTICIPANT */

function JoinCode({ initial, onJoin, onExit }) {
  const [c, setC] = useState(initial || '');
  return (
    <Shell compact>
      <section className="phone-card">
        <button className="text-link" onClick={onExit}><ArrowLeft size={16} /> Home</button>
        <QrCode className="solo-icon" />
        <div className="eyebrow">JOIN A FACILITATED SESSION</div>
        <h1>Enter the room code.</h1>
        <input value={c} onChange={e => setC(e.target.value.toUpperCase())} placeholder="HYB-123" maxLength={7} />
        <Button disabled={c.length < 5} onClick={() => onJoin(c.trim())}>CONTINUE</Button>
      </section>
    </Shell>
  );
}

function Onboard({ session, onDone }) {
  const [step, setStep] = useState(0);
  const [initials, setInitials] = useState('');
  const [persona, setPersona] = useState('');
  const [table, setTable] = useState(null);
  const [error, setError] = useState('');

  const finish = async () => {
    try {
      const t = validTable(table);
      if (!t) throw new Error('Please choose a table from 1 to 6.');
      const p = {
        id: uid(),
        session_id: session.id,
        initials: initials.trim().toUpperCase(),
        persona,
        table_number: t,
        hospital_id: TABLE_MAP[t],
        created_at: new Date().toISOString()
      };
      await addParticipant(p, session.code);
      sessionStorage.setItem(`hybrid-player-${session.code}`, JSON.stringify(p));
      onDone(p);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Shell compact>
      <section className="phone-card">
        {step === 0 && (
          <>
            <div className="eyebrow">FIRST, WHO ARE YOU?</div>
            <h1>Add your initials.</h1>
            <input autoFocus value={initials} onChange={e => setInitials(e.target.value.slice(0, 3))} placeholder="CJ" />
            <Button disabled={!initials.trim()} onClick={() => setStep(1)}>CONTINUE</Button>
          </>
        )}
        {step === 1 && (
          <>
            <div className="eyebrow">YOUR PERSPECTIVE</div>
            <h1>What perspective are you bringing?</h1>
            <div className="persona-list">
              {PERSONAS.map(p => (
                <button type="button" key={p.id} className={persona === p.id ? 'selected' : ''} onClick={() => setPersona(p.id)}>
                  <b>{p.name}</b><span>{p.line}</span>{persona === p.id && <Check />}
                </button>
              ))}
            </div>
            <Button disabled={!persona} onClick={() => setStep(2)}>CONTINUE</Button>
          </>
        )}
        {step === 2 && (
          <>
            <div className="eyebrow">FIND YOUR TEAM</div>
            <h1>Which table are you sitting at?</h1>
            <div className="table-picker">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button type="button" className={table === n ? 'selected' : ''} onClick={() => setTable(n)} key={n}>{n}</button>
              ))}
            </div>
            {table && (
              <div className="selection-summary">
                <span>TABLE {table}</span>
                <b>{HOSPITALS[TABLE_MAP[table]].name}</b>
              </div>
            )}
            <Button disabled={!table} onClick={finish}>JOIN TABLE {table || ''}</Button>
          </>
        )}
        {error && <p className="error">{error}</p>}
      </section>
    </Shell>
  );
}

function PerspectiveCapture({ player, brief, responses, onSubmit }) {
  const existing = responseFor(responses, player.id, 'perspective');
  const [choice, setChoice] = useState(existing?.choice || '');
  const [note, setNote] = useState(existing?.note || '');
  const [saved, setSaved] = useState(Boolean(existing));
  const table = validTable(player.table_number);
  const submit = async () => {
    if (!choice) return;
    await onSubmit('perspective', choice, note);
    setSaved(true);
  };
  return (
    <Shell compact>
      <section className="phone-card strategic-brief share-brief">
        <div className="eyebrow">YOUR PERSPECTIVE · {table ? `TABLE ${table}` : 'TABLE ASSIGNMENT UNAVAILABLE'}</div>
        <h1>What will you protect?</h1>
        <p>Select the priority that matters most for this hospital.</p>
        <div className="priority-picker">
          {brief.protect.map(x => (
            <button type="button" className={choice === x ? 'selected' : ''} onClick={() => { setChoice(x); setSaved(false); }} key={x}>
              {choice === x && <Check size={18} />}<b>{x}</b>
            </button>
          ))}
        </div>
        <label className="note-label">
          Complete the sentence <small>optional · 140 characters</small>
          <textarea
            maxLength={140}
            value={note}
            onChange={e => { setNote(e.target.value); setSaved(false); }}
            placeholder={`Protect ${choice || 'this priority'} because...`}
          />
        </label>
        <Button disabled={!choice || saved} onClick={submit}>{saved ? 'PERSPECTIVE CAPTURED' : 'SAVE MY PERSPECTIVE'}</Button>
      </section>
    </Shell>
  );
}

function CapabilityCardsPhone({ player, responses, onSubmit, mode }) {
  const type = mode === 'nominate' ? 'capability_nomination' : 'capability_selection';
  const table = validTable(player.table_number);
  const current = mode === 'nominate' ? responseFor(responses, player.id, type) : tableLatest(responses, table, type);
  const [choice, setChoice] = useState(current?.choice || '');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setChoice(current?.choice || ''); }, [current?.choice]);

  const choose = async id => {
    setChoice(id);
    setBusy(true);
    try { await onSubmit(type, id, ''); } finally { setBusy(false); }
  };

  return (
    <Shell compact>
      <section className="phone-card cap-phone">
        <div className="eyebrow">{mode === 'nominate' ? 'PRIVATE NOMINATION' : `TABLE ${table || '—'} · SHARED SELECTION`}</div>
        <h1>{mode === 'nominate' ? 'Which capability should your table explore?' : 'Record your table’s shared selection.'}</h1>
        <p>
          {mode === 'nominate'
            ? 'Choose through your leadership lens. You can change the nomination until the facilitator advances.'
            : 'Any table member can record it. Selection means evaluate. No resources are committed yet.'}
        </p>
        <div className="phone-cap-grid">
          {CAPABILITIES.map(c => {
            const fit = fitFor(player.hospital_id, c.id);
            return (
              <button type="button" disabled={busy} className={choice === c.id ? 'selected' : ''} onClick={() => choose(c.id)} key={c.id}>
                <img src={c.image} alt="" />
                <div>
                  {choice === c.id && <Check />}
                  <b>{c.name}</b>
                  <span>{c.promise}</span>
                  <div style={{ margin: '6px 0' }}><FitBadge fit={fit} compact /></div>
                  <span style={{ fontSize: 11, color: '#4b494e' }}>{fit?.note}</span>
                  <small>{lensFor(c.id, player.persona)}</small>
                </div>
              </button>
            );
          })}
        </div>
        {choice && (
          <div className="submission-confirm">
            <Check /> {mode === 'nominate' ? 'Nomination submitted' : 'Table selection recorded'} · Tap another card to change
          </div>
        )}
      </section>
    </Shell>
  );
}

function CapabilitySelectedPhone({ player, responses, onSubmit, preview = false }) {
  const table = validTable(player.table_number);
  const selection = tableLatest(responses, table, 'capability_selection');
  if (!selection && !preview) return <CapabilityCardsPhone player={player} responses={responses} onSubmit={onSubmit} mode="select" />;
  const c = selection ? capabilityById(selection.choice) : CAPABILITIES[0];
  const fit = fitFor(player.hospital_id, c.id);
  return (
    <Shell compact>
      <section className="phone-card cap-waiting">
        <div className="eyebrow">TABLE {table || '—'} · {preview ? 'CAPABILITY PREVIEW' : 'SELECTED'}</div>
        <img className="phone-hospital-image" src={c.image} alt="" />
        <h1>{c.name}</h1>
        <p>{preview ? c.preview : c.promise}</p>
        <FitBadge fit={fit} />
        <p style={{ marginTop: 10 }}>{fit?.note}</p>
        <div className="brief-question"><b>YOUR LENS</b><p>{lensFor(c.id, player.persona)}</p></div>
        <div className="wait-note">
          {preview
            ? c.available
              ? 'Your table will move into the full Virtual Care round.'
              : 'Your selection is recorded. Every table will now evaluate Virtual Care together.'
            : 'No resources have been committed yet.'}
        </div>
        {!preview && (
          <Button secondary onClick={() => onSubmit('capability_selection', '', '')}>CHANGE TABLE SELECTION</Button>
        )}
      </section>
    </Shell>
  );
}

function InstinctVote({ player, responses, onSubmit }) {
  const existing = responseFor(responses, player.id, 'first_instinct');
  const [choice, setChoice] = useState(existing?.choice || '');
  useEffect(() => { if (existing?.choice) setChoice(existing.choice); }, [existing?.choice]);
  const choose = async c => {
    setChoice(c);
    await onSubmit('first_instinct', c, '');
  };
  return (
    <Shell compact>
      <section className="phone-card">
        <div className="eyebrow">PRIVATE FIRST INSTINCT</div>
        <h1>What would you do?</h1>
        <p>{lensFor('virtual-care', player.persona)}</p>
        <div className="phone-choice-stack interactive">
          {[
            ['invest', 'Important enough to consume resources now.'],
            ['preserve', 'Protect capacity for competing priorities.'],
            ['adapt', 'Prepare for it without fully committing.']
          ].map(([c, txt]) => (
            <button type="button" className={choice === c ? 'selected' : ''} onClick={() => choose(c)} key={c}>
              {choice === c && <Check />}<b>{c.toUpperCase()}</b><span>{txt}</span>
            </button>
          ))}
        </div>
        {choice && <div className="submission-confirm"><Check /> Response submitted · Tap another choice to change</div>}
      </section>
    </Shell>
  );
}

function TableDecisionPhone({ player, responses, onSubmit }) {
  const table = validTable(player.table_number);
  const d = tableLatest(responses, table, 'table_decision');
  const myAck = d
    ? (responses || []).find(
        r => r.response_type === 'decision_ack' && r.participant_id === player.id && r.choice === d.choice && byTime(d, r) <= 0
      )
    : null;
  return (
    <Shell compact>
      <section className="phone-card">
        <div className="eyebrow">TABLE {table || '—'} · SHARED DECISION</div>
        <h1>{d ? `Proposed: ${d.choice.toUpperCase()}` : 'One team. One direction.'}</h1>
        {!d ? (
          <>
            <p>Any person at the table may propose the agreed direction.</p>
            <div className="phone-choice-stack interactive">
              {[
                ['invest', 'Commit the full resource cost.'],
                ['preserve', 'Defer and retain capacity.'],
                ['adapt', 'Invest selectively to preserve optionality.']
              ].map(([c, txt]) => (
                <button type="button" onClick={() => onSubmit('table_decision', c, '')} key={c}>
                  <b>{c.toUpperCase()}</b><span>{txt}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p>Does this reflect the table’s agreement? {tableAcks(responses, table, d)} acknowledged so far.</p>
            <Button disabled={Boolean(myAck)} onClick={() => onSubmit('decision_ack', d.choice, '')}>
              {myAck ? 'ACKNOWLEDGED' : 'ACKNOWLEDGE'}
            </Button>
            <Button secondary onClick={() => onSubmit('table_decision', '', '')}>KEEP DISCUSSING</Button>
          </>
        )}
      </section>
    </Shell>
  );
}

function PortfolioPhone({ player, responses }) {
  const table = validTable(player.table_number);
  const h = HOSPITALS[player.hospital_id];
  const d = tableLatest(responses, table, 'table_decision');
  const choice = d?.choice || null;
  const cost = costForChoice(choice);
  return (
    <Shell compact>
      <section className="phone-card">
        <div className="eyebrow">ROUND 1 CHECKPOINT · TABLE {table || '—'}</div>
        <h1>{choice ? `Virtual Care: ${choice.toUpperCase()}` : 'No table decision recorded'}</h1>
        <p>{h.name}</p>
        <div className="phone-resources">
          {Object.entries(h.resources).map(([k, v]) => (
            <div key={k}><span>{RESOURCE_LABELS[k]}</span><b>{v} → {v - cost[k]}</b></div>
          ))}
        </div>
        <blockquote>Advance the mission without exhausting your system’s ability to adapt.</blockquote>
      </section>
    </Shell>
  );
}

function PlayerView({ session, player, responses, onSubmit }) {
  const h = HOSPITALS[player.hospital_id] || HOSPITALS[TABLE_MAP[validTable(player.table_number)]] || HOSPITALS.academic;
  const brief = PERSONA_BRIEFS[player.persona] || PERSONA_BRIEFS.clinical;
  const table = validTable(player.table_number);
  const tableLabel = table ? `TABLE ${table}` : 'TABLE ASSIGNMENT UNAVAILABLE';
  const sub = { player, responses, onSubmit };

  switch (session.phase) {
    case 'lobby':
      return <PhoneState kicker={tableLabel} title="You’re in." text={`${h.name}. Stay here. Your facilitator will reveal the challenge.`} />;

    case 'assignments':
      return (
        <Shell compact>
          <section className="phone-card hospital-card">
            <div className="eyebrow">YOU ARE {tableLabel}</div>
            <img className="phone-hospital-image" src={h.image} alt="" />
            <h1>{h.name}</h1>
            <h2>{h.tagline}</h2>
            <p>{h.description}</p>
            <div className="wait-note">Your facilitator is guiding the room.</div>
          </section>
        </Shell>
      );

    case 'context':
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">{tableLabel} · YOUR CHALLENGE</div>
            <img className="phone-hospital-image compact-image" src={h.image} alt="" />
            <h1>{h.name}</h1>
            <h3>What the mission demands</h3>
            <ol className="mission-list">
              {h.mission.map((m, i) => <li key={m}><span>0{i + 1}</span>{m}</li>)}
            </ol>
            <div className="inherit">
              <p><b>STRENGTH</b>{h.strength}</p>
              <p><b>CONSTRAINT</b>{h.constraint}</p>
              <p><b>CONDITION</b>{h.condition}</p>
            </div>
          </section>
        </Shell>
      );

    case 'tension':
      return <PhoneState kicker="WATCH THIS TENSION" title={h.tension} text="Understand the problem before you begin optimizing the resources." />;

    case 'resources':
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">YOUR CAPACITY TO CHANGE</div>
            <h1>These resources are finite.</h1>
            <p>Future capabilities will draw on different kinds of capacity. As your table invests, resources will be used.</p>
            <div className="phone-resources">
              {Object.entries(h.resources).map(([k, v]) => (
                <div key={k}><span>{RESOURCE_LABELS[k]}</span><b>{v}</b><small>{RESOURCE_HINTS[k]}</small></div>
              ))}
            </div>
            <div className="phone-mechanic">
              <b>INVEST</b> uses capacity · <b>PRESERVE</b> keeps capacity · <b>ADAPT</b> protects flexibility
            </div>
            <blockquote>Advance the mission without exhausting your system’s ability to adapt.</blockquote>
          </section>
        </Shell>
      );

    case 'discussion':
      return <PhoneState kicker={tableLabel} title="Talk with your team." text="What is the one thing your health system cannot afford to get wrong?" />;

    case 'brief_reveal':
      return <PhoneState kicker="ONE SYSTEM · DIFFERENT RESPONSIBILITIES" title="Your strategic brief is ready." text="Your facilitator will reveal when to open it." />;

    case 'brief_read':
      return (
        <Shell compact>
          <section className="phone-card strategic-brief">
            <div className="eyebrow">YOUR STRATEGIC BRIEF</div>
            <span className="brief-table">{tableLabel} · {h.name}</span>
            <h1>{brief.name}</h1>
            <h3>Your responsibility</h3>
            <p className="brief-responsibility">{brief.responsibility}</p>
            <div className="brief-columns">
              <div><b>PROTECT</b>{brief.protect.map(x => <span key={x}>{x}</span>)}</div>
              <div><b>WATCH</b>{brief.watch.map(x => <span key={x}>{x}</span>)}</div>
            </div>
            <div className="brief-question"><b>YOUR QUESTION</b><p>{brief.question}</p></div>
            <small className="private-note">Read privately. You will introduce your lens next.</small>
          </section>
        </Shell>
      );

    case 'brief_share':
      return <PerspectiveCapture player={player} brief={brief} responses={responses} onSubmit={onSubmit} />;

    case 'alignment':
      return <PhoneState kicker="PRODUCTIVE TENSION" title="You should not all agree." text="Bring your responsibility into the next decision. Every perspective is legitimate, but not always compatible." />;

    case 'ready':
      return <PhoneState kicker="READY FOR THE FIRST DECISION" title={brief.name} text="Your table has one hospital, one mission and multiple legitimate lenses." />;

    case 'cap_portfolio':
      return <PhoneState kicker="SIX POSSIBILITIES · LIMITED CAPACITY" title="Review the capability portfolio." text="Your facilitator will open private nominations next." />;

    case 'cap_nominate':
      return <CapabilityCardsPhone {...sub} mode="nominate" />;

    case 'cap_select':
      return <CapabilityCardsPhone {...sub} mode="select" />;

    case 'cap_confirm':
      return <CapabilitySelectedPhone {...sub} />;

    case 'cap_preview':
      return <CapabilitySelectedPhone {...sub} preview />;

    case 'vc_reveal':
      return (
        <Shell compact>
          <section className="phone-card vc-phone">
            <div className="eyebrow">ROUND 1 · VIRTUAL CARE</div>
            <img className="phone-hospital-image" src={VIRTUAL_CARE.image} alt="" />
            <h1>{VIRTUAL_CARE.name}</h1>
            <p>{VIRTUAL_CARE.tagline}</p>
            <FitBadge fit={fitFor(h.id, 'virtual-care')} />
            <div className="brief-question"><b>YOUR LENS</b><p>{lensFor('virtual-care', player.persona)}</p></div>
          </section>
        </Shell>
      );

    case 'vc_instinct':
      return <InstinctVote {...sub} />;

    case 'vc_cost':
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">IF YOUR TABLE INVESTS</div>
            <h1>See the resource impact.</h1>
            <div className="phone-resources">
              {Object.entries(h.resources).map(([k, v]) => (
                <div key={k}>
                  <span>{RESOURCE_LABELS[k]}</span>
                  <b>{v} → {Math.max(0, v - VIRTUAL_CARE.cost[k])}</b>
                  <small>Adapt: {v} → {Math.max(0, v - VIRTUAL_CARE.adaptCost[k])}</small>
                </div>
              ))}
            </div>
            <p><b>ADAPT</b> uses less capacity, but optionality is not free.</p>
          </section>
        </Shell>
      );

    case 'vc_mission': {
      const m = VC_MISSION[h.id];
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">MISSION FIT · {h.name}</div>
            <h1>Does Virtual Care advance your mission?</h1>
            <FitBadge fit={fitFor(h.id, 'virtual-care')} />
            <h3>WHY IT FITS</h3><p>{m.fit}</p>
            <h3>THE TRADE-OFF</h3><p>{m.tradeoff}</p>
          </section>
        </Shell>
      );
    }

    case 'vc_design':
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">DESIGN CONSEQUENCE</div>
            <h1>The choice changes the environment.</h1>
            <div className="share-priorities">
              <span>SPACE · sightlines, lighting, acoustics</span>
              <span>INFRASTRUCTURE · network, power, audiovisual</span>
              <span>OPERATIONS · remote participants in workflow</span>
              <span>FLEXIBILITY · enable expansion without identical rooms</span>
            </div>
          </section>
        </Shell>
      );

    case 'vc_discuss': {
      const mine = responseFor(responses, player.id, 'first_instinct');
      const perspective = responseFor(responses, player.id, 'perspective');
      return (
        <Shell compact>
          <section className="phone-card strategic-brief share-brief">
            <div className="eyebrow">DISCUSS AT YOUR TABLE</div>
            <h1>Explain your first instinct.</h1>
            <p>
              You chose <b>{mine?.choice?.toUpperCase() || 'NO VOTE'}</b>
              {perspective?.choice ? <> while protecting <b>{perspective.choice}</b>.</> : '.'}
            </p>
            <p>{brief.responsibility}</p>
            <div className="brief-question"><b>YOUR QUESTION</b><p>{brief.question}</p></div>
          </section>
        </Shell>
      );
    }

    case 'vc_table_decision':
      return <TableDecisionPhone {...sub} />;

    case 'vc_portfolio':
      return <PortfolioPhone {...sub} />;

    default:
      return <PhoneState kicker="READY" title={brief.name} text="Your facilitator is guiding the room." />;
  }
}

function Participant({ initialCode, onExit }) {
  const [codeValue, setCodeValue] = useState(initialCode || '');
  const [session, setSession] = useState(null);
  const [player, setPlayer] = useState(null);
  const [responses, setResponses] = useState([]);
  const [error, setError] = useState('');

  const join = async c => {
    const found = await fetchSession(c);
    if (!found) {
      setError('Session not found. Check the code and try again.');
      return;
    }
    setError('');
    setCodeValue(c);
    setSession(found);
    const saved = sessionStorage.getItem(`hybrid-player-${c}`);
    if (saved) setPlayer(JSON.parse(saved));
  };

  useEffect(() => {
    if (initialCode) join(initialCode);
  }, []);

  useEffect(() => {
    if (!session) return;
    const refresh = async () => {
      const current = await fetchSession(session.code);
      if (current) setSession(previous => ({ ...previous, ...current }));
      setResponses(await fetchResponses(session.id, session.code));
    };
    refresh();
    const timer = setInterval(refresh, 1500);
    let channel;
    if (hasSupabase) {
      channel = supabase
        .channel(`hybrid-player-session-${session.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hybrid_sessions', filter: `id=eq.${session.id}` }, refresh)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hybrid_responses', filter: `session_id=eq.${session.id}` }, refresh)
        .subscribe();
    }
    return () => {
      clearInterval(timer);
      if (channel) supabase.removeChannel(channel);
    };
  }, [session?.id]);

  const submit = async (type, choice, note = '') => {
    if (!session || !player) return;
    const table = validTable(player.table_number);
    if (!table) {
      setError('A valid table assignment is required.');
      return;
    }
    const response = {
      id: uid(),
      session_id: session.id,
      participant_id: player.id,
      table_number: table,
      hospital_id: player.hospital_id || TABLE_MAP[table],
      persona: player.persona,
      capability_id: ROUND_ID,
      response_type: type,
      choice,
      note,
      updated_at: new Date().toISOString()
    };
    try {
      await saveResponse(response, session.code);
      setResponses(await fetchResponses(session.id, session.code));
    } catch (e) {
      setError(e.message || 'Your response could not be saved. Please try again.');
    }
  };

  if (!session) {
    return (
      <>
        <JoinCode initial={codeValue} onJoin={join} onExit={onExit} />
        {error && <div className="toast">{error}</div>}
      </>
    );
  }
  if (!player) return <Onboard session={session} onDone={setPlayer} />;
  return (
    <>
      <PlayerView session={session} player={player} responses={responses} onSubmit={submit} />
      {error && <div className="toast" onClick={() => setError('')}>{error}</div>}
    </>
  );
}

/* =================================================================== APP */

export default function App() {
  const query = new URLSearchParams(location.search);
  const joinCode = query.get('join');
  const [mode, setMode] = useState(joinCode ? 'participant' : 'landing');

  if (mode === 'landing') return <Landing onFacilitated={() => setMode('facilitator')} />;
  if (mode === 'facilitator') return <Facilitator onExit={() => setMode('landing')} />;
  return (
    <Participant
      initialCode={joinCode}
      onExit={() => {
        history.replaceState({}, '', location.pathname);
        setMode('landing');
      }}
    />
  );
}
