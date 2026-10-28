import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, QrCode, Users } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { hasSupabase, supabase } from './supabase';

/* =====================================================================
   FUTURE-READY HOSPITAL CHALLENGE · HYBRID · ROUND 1.1
   Steps 1-5: Join -> Hospital reveal -> Resources -> Strategic brief ->
   Capability portfolio (nominate) -> Virtual Care full decision round
   ===================================================================== */

const BUILD_LABEL = 'ROUND 1.1';
const SINGLE_PLAYER_URL =
  import.meta.env.VITE_SINGLE_PLAYER_URL ||
  'https://cathylester2026.github.io/AIMedX_Single_Player_Build_01/';
const BASE = import.meta.env.BASE_URL;
const TABLE_NUMBERS = [1, 2, 3, 4, 5, 6];
const CHOICES = ['invest', 'preserve', 'adapt'];

/* ---------------------------------------------------------------------
   CONTENT · PERSONAS
   --------------------------------------------------------------------- */

const PERSONAS = [
  { id: 'clinical', name: 'Clinical Leader', line: 'Protect care quality, safety and workforce usability.' },
  { id: 'operations', name: 'Operations Leader', line: 'Protect flow, reliability and implementation capacity.' },
  { id: 'digital', name: 'Digital Leader', line: 'Build an enabling platform without creating technical debt.' },
  { id: 'finance', name: 'Financial Steward', line: 'Protect capital flexibility and long-term value.' },
  { id: 'design', name: 'Facilities + Design Leader', line: 'Create adaptable infrastructure and environments.' },
];

const PERSONA_BRIEFS = {
  clinical: {
    name: 'Clinical Leader',
    responsibility: 'Protect the ability to deliver safe, effective care while the organization changes around it.',
    protect: ['Care quality', 'Workforce usability', 'Patient experience'],
    watch: ['Workflow burden', 'Clinical reliability', 'Adoption risk'],
    question: 'Will this actually make care better, or simply add another layer of complexity?',
  },
  operations: {
    name: 'Operations Leader',
    responsibility: 'Make transformation operationally achievable without destabilizing today’s care delivery.',
    protect: ['Continuity of care', 'Reliable operations', 'Implementation capacity'],
    watch: ['Workflow disruption', 'Staffing requirements', 'Change saturation'],
    question: 'Can we realistically implement this while continuing to operate?',
  },
  digital: {
    name: 'Digital Leader',
    responsibility: 'Create the enabling digital foundation while avoiding decisions that become tomorrow’s technical debt.',
    protect: ['Interoperability', 'Data availability', 'Platform scalability'],
    watch: ['Integration complexity', 'Network + data requirements', 'Technical debt'],
    question: 'Does this strengthen the platform for what comes next, or create another isolated solution?',
  },
  finance: {
    name: 'Financial Steward',
    responsibility: 'Protect the organization’s ability to fund transformation over time, not just the next investment.',
    protect: ['Capital flexibility', 'Long-term value', 'Investment capacity'],
    watch: ['First cost', 'Lifecycle cost', 'Stranded investment'],
    question: 'Is committing capital here more valuable than preserving it for what we may need next?',
  },
  design: {
    name: 'Facilities + Design Leader',
    responsibility: 'Create an environment that can support today’s decision without preventing tomorrow’s possibilities.',
    protect: ['Adaptability', 'Infrastructure capacity', 'Long-term flexibility'],
    watch: ['Space implications', 'MEP + network requirements', 'Premature physical commitments'],
    question: 'What does this decision require from the building, and what are we locking in if we act now?',
  },
};

const briefFor = (persona) => PERSONA_BRIEFS[persona] || PERSONA_BRIEFS.clinical;

/* ---------------------------------------------------------------------
   CONTENT · HOSPITALS
   --------------------------------------------------------------------- */

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
    resources: { capital: 16, infrastructure: 10, operationalReadiness: 16, changeCapacity: 9 },
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
    resources: { capital: 14, infrastructure: 12, operationalReadiness: 13, changeCapacity: 11 },
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
    resources: { capital: 15, infrastructure: 11, operationalReadiness: 12, changeCapacity: 13 },
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
    resources: { capital: 18, infrastructure: 16, operationalReadiness: 10, changeCapacity: 12 },
  },
};

const TABLE_MAP = { 1: 'academic', 2: 'regional', 3: 'distributed', 4: 'greenfield', 5: 'academic', 6: 'regional' };

const RESOURCE_LABELS = {
  capital: 'Capital',
  infrastructure: 'Infrastructure',
  operationalReadiness: 'Operational readiness',
  changeCapacity: 'Change capacity',
};

const RESOURCE_MEANING = {
  capital: 'What you can afford to invest.',
  infrastructure: 'What your physical + digital foundation can support.',
  operationalReadiness: 'What you can implement while delivering care.',
  changeCapacity: 'How much transformation people and workflows can absorb.',
};

/* ---------------------------------------------------------------------
   CONTENT · CAPABILITY PORTFOLIO (Round 1.1)
   --------------------------------------------------------------------- */

const CAPABILITIES = [
  {
    id: 'virtual-care',
    name: 'Virtual Care',
    promise: 'Extend care beyond the physical room.',
    image: `${BASE}capabilities/virtual-care.png`,
    demands: ['Infrastructure', 'Operational readiness', 'Change capacity'],
    fullFlow: true,
  },
  {
    id: 'ambient-intelligence',
    name: 'Ambient Intelligence',
    promise: 'Reduce documentation burden and make spaces aware of patient, staff and operational context.',
    image: `${BASE}capabilities/ambient-intelligence.png`,
    demands: ['Infrastructure', 'Change capacity', 'Data governance'],
  },
  {
    id: 'smart-rooms',
    name: 'Smart Rooms',
    promise: 'Create connected spaces that adapt to patient and care-team needs.',
    image: `${BASE}capabilities/smart-rooms.png`,
    demands: ['Capital', 'Infrastructure', 'Change capacity'],
  },
  {
    id: 'autonomous-logistics',
    name: 'Autonomous Logistics',
    promise: 'Move materials without relying on people for every movement.',
    image: `${BASE}capabilities/autonomous-logistics.png`,
    demands: ['Capital', 'Infrastructure', 'Operational readiness'],
  },
  {
    id: 'predictive-operations',
    name: 'Predictive Operations',
    promise: 'Anticipate demand before it becomes disruption.',
    image: `${BASE}capabilities/predictive-operations.png`,
    demands: ['Infrastructure', 'Operational readiness', 'Change capacity'],
  },
  {
    id: 'care-platform',
    name: 'Next-Generation Care Platform',
    promise: 'Create the foundation that allows capabilities to work together.',
    image: `${BASE}capabilities/care-platform.png`,
    demands: ['Capital', 'Infrastructure', 'Change capacity'],
  },
];

const capabilityById = (id) => CAPABILITIES.find((c) => c.id === id);

/* Hospital-specific mission fit: [level, why it matters to this hospital] */
const CAPABILITY_FIT = {
  'virtual-care': {
    academic: ['Moderate–High', 'Extends specialized expertise beyond the campus, but enabling infrastructure may have to come first.'],
    regional: ['High', 'Extends specialty access across a broad catchment and reduces unnecessary travel.'],
    distributed: ['High', 'Connects expertise across settings and directly reduces fragmentation.'],
    greenfield: ['Moderate', 'Can be embedded from day one, but today’s devices could lock in quickly.'],
  },
  'ambient-intelligence': {
    academic: ['Moderate', 'Reduces documentation burden without rebuilding every workflow, if legacy infrastructure can carry sensing.'],
    regional: ['High', 'Stretches a scarce workforce by reducing documentation and manual monitoring.'],
    distributed: ['Moderate', 'Delivers value only with consistent data and governance across sites.'],
    greenfield: ['High', 'Unobtrusive sensing and computing readiness can be embedded before walls close.'],
  },
  'smart-rooms': {
    academic: ['Moderate', 'Valuable, but retrofitting occupied units is disruptive and must be phased.'],
    regional: ['Moderate', 'Improves experience, but repeating the package across many rooms drives cost.'],
    distributed: ['Low–Moderate', 'Hard to standardize across sites with different levels of readiness.'],
    greenfield: ['High', 'The room standard and enabling infrastructure can be set before construction.'],
  },
  'autonomous-logistics': {
    academic: ['Low–Moderate', 'Legacy corridors, elevators and phasing constrain robotic routes.'],
    regional: ['Moderate', 'Frees staff time across a busy campus if circulation can support it.'],
    distributed: ['Moderate', 'Can support network-wide supply movement, but every site is different.'],
    greenfield: ['High', 'Circulation, elevators and storage can be planned around automation.'],
  },
  'predictive-operations': {
    academic: ['High', 'Helps manage constrained capacity during renewal and phasing.'],
    regional: ['High', 'Anticipates referral demand and protects specialty capacity.'],
    distributed: ['High', 'Balances demand across sites, if the data is consistent.'],
    greenfield: ['Moderate', 'Valuable later, but there is no operating history to predict from yet.'],
  },
  'care-platform': {
    academic: ['High', 'Reduces integration debt before more capabilities are layered on.'],
    regional: ['Moderate–High', 'Creates a scalable base for regional growth.'],
    distributed: ['Essential', 'The common foundation needed to reduce fragmentation across the network.'],
    greenfield: ['High', 'Builds the integration foundation before point solutions arrive.'],
  },
};

const fitFor = (capabilityId, hospitalId) => {
  const row = CAPABILITY_FIT[capabilityId]?.[hospitalId];
  return row ? { level: row[0], why: row[1] } : { level: '—', why: '' };
};

const fitClass = (level) => {
  const l = (level || '').toLowerCase();
  if (l.startsWith('essential')) return 'fit-essential';
  if (l.startsWith('high')) return 'fit-high';
  if (l.startsWith('moderate')) return 'fit-moderate';
  return 'fit-low';
};

/* Persona questions are now capability-specific (Round 1.1) */
const CAPABILITY_LENSES = {
  'virtual-care': {
    clinical: 'Can virtual interaction improve access without compromising clinical reliability or adding workflow burden?',
    operations: 'Can this become part of routine care delivery without adding unsustainable coordination burden?',
    digital: 'Can the existing platform support scalable virtual care rather than another isolated solution?',
    finance: 'Does this extend access and capacity enough to justify the enabling investment?',
    design: 'Which spaces must support virtual interaction, and what should be embedded now versus kept adaptable?',
  },
  'ambient-intelligence': {
    clinical: 'Will ambient documentation give clinicians time back, and can they trust what it captures?',
    operations: 'Can sensing data actually change how units run, or will it become another dashboard?',
    digital: 'Do we have the data governance, privacy and integration maturity to support continuous sensing?',
    finance: 'Can documentation time savings be measured well enough to justify the investment?',
    design: 'What ceiling, power and network provisions must rooms carry, and how visible should the technology be?',
  },
  'smart-rooms': {
    clinical: 'Will connected rooms improve patient experience and care-team support, or add devices to manage?',
    operations: 'Who supports and maintains hundreds of connected rooms around the clock?',
    digital: 'Will room systems integrate with the enterprise platform or create room-level silos?',
    finance: 'Will the benefit justify repeating this technology package across every room?',
    design: 'How do we set a room standard that stays adaptable as room technology changes?',
  },
  'autonomous-logistics': {
    clinical: 'Will this return time to bedside care, or only move work somewhere else?',
    operations: 'Can supply, pharmacy and environmental workflows be redesigned around automated movement?',
    digital: 'Can robots reliably integrate with elevators, doors, inventory and tracking systems?',
    finance: 'Does labor and reliability value outweigh the capital and maintenance burden?',
    design: 'Can corridors, elevators and staging space support automated routes without compromising people flow?',
  },
  'predictive-operations': {
    clinical: 'Will predictions arrive early enough to change care decisions, and will clinicians trust them?',
    operations: 'Are we prepared to act differently on what the forecasts tell us?',
    digital: 'Is our data clean, connected and timely enough for reliable prediction?',
    finance: 'Can better foresight measurably reduce cost, delay and lost capacity?',
    design: 'Does the building need a command space, sensing or flexible capacity to act on predictions?',
  },
  'care-platform': {
    clinical: 'Will a common platform make information easier to find and act on at the point of care?',
    operations: 'Can we absorb an enterprise platform change while continuing to operate?',
    digital: 'Is this the foundation every other capability depends on, and what happens if we defer it?',
    finance: 'Is a foundational investment worth it now, or will deferring it multiply future integration cost?',
    design: 'What network, technology space and pathway capacity must the building provide for the platform to scale?',
  },
};

const lensFor = (capabilityId, persona) =>
  CAPABILITY_LENSES[capabilityId]?.[persona] || briefFor(persona).question;

/* ---------------------------------------------------------------------
   CONTENT · VIRTUAL CARE FULL ROUND
   --------------------------------------------------------------------- */

const VIRTUAL_CARE = {
  id: 'virtual-care',
  name: 'Virtual Care',
  tagline: 'Extend care beyond the physical room.',
  image: `${BASE}capabilities/virtual-care.png`,
  opportunity: 'Extend specialist access, support distributed care and connect expertise across locations.',
  enables: ['Remote specialty consultation', 'Virtual nursing + support', 'Care beyond the hospital', 'More flexible use of expertise'],
  requires: ['Reliable network + audiovisual infrastructure', 'Appropriate room environments', 'Workflow integration', 'Staff adoption'],
  cost: { capital: 2, infrastructure: 2, operationalReadiness: 2, changeCapacity: 3 },
  adaptCost: { capital: 1, infrastructure: 1, operationalReadiness: 0, changeCapacity: 1 },
};

const NO_COST = { capital: 0, infrastructure: 0, operationalReadiness: 0, changeCapacity: 0 };

const VC_MISSION = {
  academic: {
    fit: 'Extends specialized expertise beyond the campus and creates options for managing demand without relying only on additional physical capacity.',
    tradeoff: 'Aging infrastructure may require enabling network, audiovisual and room modernization before Virtual Care can operate reliably at scale.',
  },
  regional: {
    fit: 'Extends specialty access across a broad referral region and can reduce unnecessary travel while preserving access to specialized expertise.',
    tradeoff: 'Regional reach only improves if connectivity, staffing models and referral workflows are reliable across the catchment area.',
  },
  distributed: {
    fit: 'Directly supports the mission of extending expertise across settings and reducing fragmentation across the network.',
    tradeoff: 'Inconsistent infrastructure and workflows across sites may increase implementation complexity and change burden.',
  },
  greenfield: {
    fit: 'Allows virtual interaction to be embedded into the care model and space standards from the beginning.',
    tradeoff: 'Over-specifying today’s virtual-care technology could lock a new campus into solutions that will evolve quickly.',
  },
};

const CHOICE_TEXT = {
  invest: 'Important enough to consume resources now.',
  preserve: 'Protect capacity for competing priorities.',
  adapt: 'Prepare for it without fully committing.',
};

const DECISION_TEXT = {
  invest: 'Commit the full resource cost.',
  preserve: 'Defer and retain capacity.',
  adapt: 'Invest selectively to preserve optionality.',
};

const costForChoice = (choice) =>
  choice === 'invest' ? VIRTUAL_CARE.cost : choice === 'adapt' ? VIRTUAL_CARE.adaptCost : NO_COST;

/* ---------------------------------------------------------------------
   UTILITIES
   --------------------------------------------------------------------- */

const makeCode = () => `HYB-${Math.floor(100 + Math.random() * 900)}`;
const uid = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
const getJoinUrl = (c) => `${location.origin}${location.pathname}?join=${encodeURIComponent(c)}`;
const localKey = (c) => `aimedx-hybrid-${c}`;

const validTable = (n) => {
  const v = Number(n);
  return Number.isInteger(v) && v >= 1 && v <= 6 ? v : null;
};

const byTime = (a, b) => String(a.updated_at || '').localeCompare(String(b.updated_at || ''));

const activeTables = (participants) =>
  [...new Set(participants.map((p) => validTable(p.table_number)).filter(Boolean))].sort((a, b) => a - b);

const membersOf = (participants, table) => participants.filter((p) => validTable(p.table_number) === table);

const hospitalForTable = (table) => HOSPITALS[TABLE_MAP[table]];

const responsesOfType = (responses, type, capabilityId) =>
  responses.filter((r) => r.response_type === type && (!capabilityId || r.capability_id === capabilityId));

const myResponse = (responses, participantId, type, capabilityId) =>
  responses
    .filter((r) => r.participant_id === participantId && r.response_type === type && (!capabilityId || r.capability_id === capabilityId))
    .sort(byTime)
    .slice(-1)[0];

/* Latest table-decision row for a table. A blank choice = "keep discussing". */
const activeProposal = (responses, table) => {
  const latest = responsesOfType(responses, 'table_decision', 'virtual-care')
    .filter((r) => validTable(r.table_number) === table)
    .sort(byTime)
    .slice(-1)[0];
  return latest && latest.choice ? latest : null;
};

const acknowledgersOf = (responses, table, proposal) =>
  proposal
    ? responsesOfType(responses, 'decision_ack', 'virtual-care').filter(
        (r) => validTable(r.table_number) === table && r.choice === proposal.choice && byTime({ updated_at: proposal.updated_at }, r) <= 0
      )
    : [];

const resourcesAfter = (hospital, choice) => {
  const cost = costForChoice(choice);
  return Object.fromEntries(
    Object.entries(hospital.resources).map(([k, v]) => [k, Math.max(0, v - (cost[k] || 0))])
  );
};

/* ---------------------------------------------------------------------
   DATA LAYER (Supabase with local fallback for single-browser review)
   --------------------------------------------------------------------- */

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
    localStorage.setItem(localKey(s.code), JSON.stringify({ ...current, ...s }));
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
    const current = loadLocal(c) || {};
    const all = [...(current.participants || []).filter((x) => x.id !== p.id), p];
    localStorage.setItem(localKey(c), JSON.stringify({ ...current, participants: all }));
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
    const key = (x) => `${x.session_id}|${x.participant_id}|${x.response_type}|${x.capability_id}`;
    const all = [...(current.responses || []).filter((x) => key(x) !== key(r)), r];
    localStorage.setItem(localKey(c), JSON.stringify({ ...current, responses: all }));
  }
}

/* ---------------------------------------------------------------------
   SHARED UI
   --------------------------------------------------------------------- */

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

function FitChip({ level }) {
  return <span className={`fit-chip ${fitClass(level)}`}>{level} fit</span>;
}

function ProgressGrid({ participants, responses, type, capabilityId, doneLabel, partialLabel }) {
  const rows = responsesOfType(responses, type, capabilityId);
  return (
    <div className="progress-grid">
      {activeTables(participants).map((t) => {
        const members = membersOf(participants, t);
        const done = members.filter((p) => rows.some((r) => r.participant_id === p.id && r.choice)).length;
        return (
          <article key={t}>
            <span>TABLE {t}</span>
            <b>{done} of {members.length}</b>
            <small>{done === members.length ? doneLabel : partialLabel}</small>
            <div><i style={{ width: `${members.length ? (done / members.length) * 100 : 0}%` }} /></div>
          </article>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------
   STEP 1 · LANDING + FACILITATOR SETUP
   --------------------------------------------------------------------- */

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
              <span>01 · EXPLORE</span>
              <b>On your own</b>
              <small>Individual strategy experience</small>
              <ArrowRight />
            </a>
            <button className="choice-tile primary" type="button" onClick={onFacilitated}>
              <span>02 · COLLABORATE</span>
              <b>As a table</b>
              <small>Facilitated strategy experience</small>
              <ArrowRight />
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
          <button className="text-link" type="button" onClick={onBack}><ArrowLeft size={16} /> Back</button>
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
      TABLE_NUMBERS.map((n) => ({ n, h: hospitalForTable(n), count: membersOf(participants, n).length })).filter((g) => g.count > 0),
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
          {groups.map((g) => (
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

/* ---------------------------------------------------------------------
   STEP 2 · HOSPITAL REVEAL + RESOURCES (facilitator)
   --------------------------------------------------------------------- */

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
        {active.map((n) => {
          const h = hospitalForTable(n);
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
        {active.map((n) => {
          const h = hospitalForTable(n);
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

function ResourcesRoom({ onAdvance }) {
  return (
    <Shell>
      <section className="fac-resource-screen">
        <div className="resource-hero">
          <div>
            <div className="eyebrow">YOUR CAPACITY TO CHANGE</div>
            <h1>You cannot<br /><em>do everything.</em></h1>
          </div>
          <p>Every table begins with four finite resources. Every future capability will draw on them differently.</p>
        </div>
        <section className="resource-explainer room-resource-explainer">
          {Object.keys(RESOURCE_LABELS).map((k, i) => (
            <div key={k}>
              <span>0{i + 1}</span>
              <b>{RESOURCE_LABELS[k].toUpperCase()}</b>
              <p>{RESOURCE_MEANING[k]}</p>
            </div>
          ))}
        </section>
        <section className="resource-how">
          <div className="resource-how-title">
            <span>WHAT YOUR DECISIONS WILL DO</span>
            <h2>Look at your phone.</h2>
            <p>Your phone shows your table's starting capacity. Where is your system strong? Where are you constrained?</p>
          </div>
          <div className="resource-actions">
            <div><b>INVEST</b><span>Spend capacity to advance the mission.</span></div>
            <div><b>PRESERVE</b><span>Hold capacity for priorities still ahead.</span></div>
            <div><b>ADAPT</b><span>Protect flexibility where the future is uncertain.</span></div>
          </div>
        </section>
        <blockquote className="resource-goal">
          The goal isn't to spend everything. The goal is to make the right investments without exhausting your ability to adapt.
        </blockquote>
        <div className="room-actions resource-screen-actions">
          <Button onClick={() => onAdvance('discussion')}>BEGIN TABLE DISCUSSION <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

function Countdown({ seconds }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setRemaining((x) => Math.max(0, x - 1)), 1000);
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

/* ---------------------------------------------------------------------
   STEP 3 · STRATEGIC BRIEF (facilitator)
   --------------------------------------------------------------------- */

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
  const perspectives = responsesOfType(responses, 'perspective');
  return (
    <div className={`captured-perspectives ${large ? 'large' : ''}`}>
      {participants.map((p) => {
        const brief = briefFor(p.persona);
        const r = myResponse(perspectives, p.id, 'perspective');
        return (
          <article key={p.id}>
            <span>{brief.name} · T{validTable(p.table_number) || '—'}</span>
            <b>{r?.choice || (large ? brief.protect[0] : 'Waiting for perspective')}</b>
            {r?.note && <p>“{r.note}”</p>}
            {large && <small>{brief.question}</small>}
          </article>
        );
      })}
    </div>
  );
}

function BriefShareRoom({ participants, responses, onAdvance }) {
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

function AlignmentRoom({ participants, responses, onAdvance }) {
  return (
    <Shell>
      <section className="alignment-room">
        <div className="eyebrow">ONE HOSPITAL · COMPETING RESPONSIBILITIES</div>
        <h1>These priorities are all legitimate.</h1>
        <p>The next decision will require each table to balance them. Use these perspectives when explaining your choices.</p>
        <PerspectiveCards participants={participants} responses={responses} large />
        <div className="room-actions">
          <Button onClick={() => onAdvance('ready')}>READY FOR THE CAPABILITY PORTFOLIO <ArrowRight size={18} /></Button>
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
        <p>Next: six capabilities your hospital could pursue, and limited capacity to pursue them.</p>
        <Button onClick={() => onAdvance('cap_portfolio')}>OPEN THE CAPABILITY PORTFOLIO <ArrowRight size={18} /></Button>
      </section>
    </Shell>
  );
}

/* ---------------------------------------------------------------------
   STEP 5 · CAPABILITY PORTFOLIO (facilitator) · Round 1.1
   Nominate -> compare -> every table evaluates Virtual Care together
   --------------------------------------------------------------------- */

function CapabilityPortfolioRoom({ participants, onAdvance }) {
  const active = activeTables(participants);
  return (
    <Shell>
      <section className="cap-portfolio-room">
        <div className="cap-portfolio-head">
          <div>
            <div className="eyebrow">SIX POSSIBILITIES · LIMITED CAPACITY</div>
            <h1>Where should your hospital invest?</h1>
          </div>
          <p>The same capability fits each hospital differently. Nominating a capability means you want to evaluate it, not that you are spending resources.</p>
        </div>
        <div className="cap-grid">
          {CAPABILITIES.map((c, i) => (
            <article key={c.id}>
              <div className="cap-image">
                <img src={c.image} alt="" />
                <span>0{i + 1}</span>
                {c.fullFlow && <b>FULL ROUND IN THIS BUILD</b>}
              </div>
              <div className="cap-card-copy">
                <h2>{c.name}</h2>
                <p>{c.promise}</p>
                <div>{c.demands.map((x) => <span key={x}>{x}</span>)}</div>
                <ul className="cap-fit-row">
                  {active.map((t) => {
                    const fit = fitFor(c.id, TABLE_MAP[t]);
                    return (
                      <li key={t}>
                        <em>T{t}</em>
                        <FitChip level={fit.level} />
                      </li>
                    );
                  })}
                </ul>
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

function CapabilityNominationRoom({ participants, responses, onAdvance }) {
  return (
    <Shell>
      <section className="cap-nom-room">
        <div className="eyebrow">PRIVATE NOMINATION</div>
        <h1>Which capability should your table evaluate first?</h1>
        <p>Each phone shows how every capability fits your hospital and the question your role should be asking. The room shows completion only.</p>
        <ProgressGrid
          participants={participants}
          responses={responses}
          type="capability_nomination"
          capabilityId="portfolio"
          doneLabel="ALL NOMINATIONS IN"
          partialLabel="NOMINATIONS SUBMITTED"
        />
        <div className="room-actions">
          <Button onClick={() => onAdvance('cap_results')}>REVEAL NOMINATIONS <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

function CapabilityResultsRoom({ participants, responses, onAdvance }) {
  const noms = responsesOfType(responses, 'capability_nomination', 'portfolio');
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="cap-selection-room">
        <div className="eyebrow">NOMINATION RESULTS</div>
        <h1>Different hospitals. Different priorities.</h1>
        <p>These nominations show where each table's interest lies. To compare decisions fairly, every table will now evaluate the same capability.</p>
        <div className="cap-tally-grid">
          {tables.map((t) => {
            const members = membersOf(participants, t);
            const nominationOf = (p) => myResponse(noms, p.id, 'capability_nomination', 'portfolio')?.choice;
            const ranked = CAPABILITIES.map((c) => ({ c, n: members.filter((p) => nominationOf(p) === c.id).length })).sort((a, b) => b.n - a.n);
            return (
              <article key={t}>
                <span>TABLE {t} · {hospitalForTable(t).name}</span>
                {ranked.map(({ c, n }) => (
                  <div key={c.id}><b>{c.name}</b><strong>{n}</strong></div>
                ))}
                <div className="nomination-personas">
                  {members.map((p) => (
                    <small key={p.id}>
                      {briefFor(p.persona).name}: <b>{capabilityById(nominationOf(p))?.name || 'No nomination'}</b>
                    </small>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
        <div className="selection-live-status common-capability">
          <b>EVERY TABLE NOW EVALUATES</b>
          <strong>Virtual Care</strong>
        </div>
        <div className="room-actions">
          <Button onClick={() => onAdvance('vc_reveal')}>BEGIN VIRTUAL CARE ROUND <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

/* ---------------------------------------------------------------------
   STEP 4 · VIRTUAL CARE FULL ROUND (facilitator)
   --------------------------------------------------------------------- */

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
            <div><b>WHAT IT ENABLES</b>{VIRTUAL_CARE.enables.map((x) => <span key={x}>{x}</span>)}</div>
            <div><b>BUT IT REQUIRES</b>{VIRTUAL_CARE.requires.map((x) => <span key={x}>{x}</span>)}</div>
          </div>
          <Button onClick={() => onAdvance('vc_instinct')}>SEE IT THROUGH YOUR LENS <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

function VCInstinctRoom({ participants, responses, onAdvance }) {
  return (
    <Shell>
      <section className="center-stage vc-instinct-room">
        <div className="eyebrow">PRIVATE FIRST INSTINCT</div>
        <h1>What would <em>you</em> do?</h1>
        <p>Vote privately on your phone. The room shows completion only, not choices.</p>
        <ProgressGrid
          participants={participants}
          responses={responses}
          type="first_instinct"
          capabilityId="virtual-care"
          doneLabel="ALL RESPONSES IN"
          partialLabel="RESPONSES SUBMITTED"
        />
        <Button onClick={() => onAdvance('vc_cost')}>REVEAL THE COST <ArrowRight size={18} /></Button>
      </section>
    </Shell>
  );
}

function CostCard({ label, title, cost, note, className }) {
  return (
    <div className={`cost-card ${className}`}>
      <span>{label}</span>
      <h2>{title}</h2>
      {cost ? (
        Object.entries(cost).map(([k, v]) => (
          <div key={k}><b>{RESOURCE_LABELS[k]}</b><strong>{v}</strong></div>
        ))
      ) : (
        <div className="preserve-zero">0</div>
      )}
      {note && <p>{note}</p>}
    </div>
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
          <CostCard className="invest" label="FULL INVESTMENT" title="INVEST" cost={VIRTUAL_CARE.cost} />
          <CostCard className="adapt" label="PRESERVE OPTIONALITY" title="ADAPT" cost={VIRTUAL_CARE.adaptCost}
            note="Optionality is not free. Enabling infrastructure still requires investment, and the clinical benefit is delayed." />
          <CostCard className="preserve" label="DEFER" title="PRESERVE" note="Resources remain available for priorities still ahead." />
        </div>
        <div className="room-actions">
          <Button onClick={() => onAdvance('vc_mission')}>CONNECT TO MISSION <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

function VCMissionRoom({ participants, onAdvance }) {
  const hospitalIds = [...new Set(activeTables(participants).map((t) => TABLE_MAP[t]))];
  return (
    <Shell>
      <section className="vc-mission-room">
        <div className="eyebrow">MISSION BEFORE TECHNOLOGY</div>
        <h1>Same capability. Different strategic fit.</h1>
        <div className="mission-fit-grid">
          {hospitalIds.map((id) => (
            <article key={id}>
              <span>{HOSPITALS[id].name}</span>
              <FitChip level={fitFor('virtual-care', id).level} />
              <h3>WHY IT FITS</h3>
              <p>{VC_MISSION[id].fit}</p>
              <h3>THE TRADE-OFF</h3>
              <p>{VC_MISSION[id].tradeoff}</p>
            </article>
          ))}
        </div>
        <div className="room-actions">
          <Button onClick={() => onAdvance('vc_design')}>TRANSLATE TO DESIGN <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

const DESIGN_IMPLICATIONS = [
  ['SPACE', 'Rooms need appropriate sightlines, lighting, acoustics and backgrounds.'],
  ['INFRASTRUCTURE', 'Network, power, mounting and audiovisual capability become baseline requirements.'],
  ['OPERATIONS', 'Clinical workflow must account for remote participants and new patterns of interaction.'],
  ['FLEXIBILITY', 'Not every room needs identical technology, but the environment should make expansion possible.'],
];

function VCDesignRoom({ onAdvance }) {
  return (
    <Shell>
      <section className="vc-design-room">
        <div className="eyebrow">WHAT THIS DECISION MEANS FOR DESIGN</div>
        <h1>A technology decision becomes a design requirement.</h1>
        <div className="design-implications">
          {DESIGN_IMPLICATIONS.map(([k, v]) => <div key={k}><b>{k}</b><p>{v}</p></div>)}
        </div>
        <div className="room-actions">
          <Button onClick={() => onAdvance('vc_discuss')}>REVEAL FIRST INSTINCTS <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

function VCDiscussRoom({ participants, responses, onAdvance }) {
  const votes = responsesOfType(responses, 'first_instinct', 'virtual-care');
  return (
    <Shell>
      <section className="vc-discuss-room">
        <div className="eyebrow">REVEAL FIRST INSTINCTS</div>
        <h1>Now you can see where the tension lives.</h1>
        <p>Names remain private. Personas are visible because the leadership lens is part of the learning.</p>
        <div className="tally-table-grid">
          {activeTables(participants).map((t) => {
            const rows = membersOf(participants, t).map((p) => ({ p, r: myResponse(votes, p.id, 'first_instinct') }));
            return (
              <article key={t}>
                <span>TABLE {t} · {hospitalForTable(t).name}</span>
                <div className="persona-votes">
                  {rows.map(({ p, r }) => (
                    <div key={p.id}>
                      <b>{briefFor(p.persona).name}</b>
                      <strong className={r?.choice || 'waiting'}>{r?.choice?.toUpperCase() || 'WAITING'}</strong>
                    </div>
                  ))}
                </div>
                <div className="tally-bars">
                  {CHOICES.map((c) => (
                    <div key={c}><span>{c}</span><b>{rows.filter((x) => x.r?.choice === c).length}</b></div>
                  ))}
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

function VCTableDecisionRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  const allProposed = tables.length > 0 && tables.every((t) => activeProposal(responses, t));
  return (
    <Shell>
      <section className="vc-decision-room">
        <div className="eyebrow">ONE TEAM · ONE DECISION</div>
        <h1>Resolve the trade-off together.</h1>
        <p>One table member proposes the decision. Everyone else acknowledges, or reopens the discussion.</p>
        <div className="decision-status-grid">
          {tables.map((t) => {
            const proposal = activeProposal(responses, t);
            const members = membersOf(participants, t);
            const acks = acknowledgersOf(responses, t, proposal).length;
            return (
              <article key={t}>
                <span>TABLE {t}</span>
                <h2>{proposal ? proposal.choice.toUpperCase() : 'DISCUSSING'}</h2>
                <p>{proposal ? `${acks} of ${members.length} acknowledged` : 'Waiting for a proposed decision'}</p>
              </article>
            );
          })}
        </div>
        <div className="room-actions">
          <Button disabled={!allProposed} onClick={() => onAdvance('vc_portfolio')}>
            {allProposed ? 'APPLY DECISIONS' : 'WAITING FOR TABLE DECISIONS'} <ArrowRight size={18} />
          </Button>
        </div>
      </section>
    </Shell>
  );
}

function VCPortfolioRoom({ participants, responses }) {
  return (
    <Shell>
      <section className="vc-portfolio-room">
        <div className="eyebrow">ROUND 1 CHECKPOINT</div>
        <h1>Your hospitals are beginning to take shape.</h1>
        <div className="portfolio-table-grid">
          {activeTables(participants).map((t) => {
            const h = hospitalForTable(t);
            const choice = activeProposal(responses, t)?.choice || 'preserve';
            const after = resourcesAfter(h, choice);
            return (
              <article key={t}>
                <img src={VIRTUAL_CARE.image} alt="" />
                <div>
                  <span>TABLE {t} · {h.name}</span>
                  <h2>{choice.toUpperCase()}</h2>
                  <p>{choice === 'invest' ? 'Virtual Care committed.' : choice === 'adapt' ? 'Enabled for future adoption.' : 'Virtual Care deferred.'}</p>
                  <div className="remaining-resources">
                    {Object.entries(h.resources).map(([k, v]) => (
                      <div key={k}><small>{RESOURCE_LABELS[k]}</small><b>{v} → {after[k]}</b></div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <p className="prototype-note">Round 1.1 stops here. Remaining capabilities will use this same decision engine.</p>
      </section>
    </Shell>
  );
}

/* ---------------------------------------------------------------------
   FACILITATOR CONTROLLER
   --------------------------------------------------------------------- */

const FACILITATOR_SCREENS = {
  assignments: AssignmentRoom,
  context: ContextRoom,
  tension: TensionRoom,
  resources: ResourcesRoom,
  discussion: DiscussionRoom,
  brief_reveal: BriefRevealRoom,
  brief_read: BriefReadRoom,
  brief_share: BriefShareRoom,
  alignment: AlignmentRoom,
  ready: ReadyRoom,
  cap_portfolio: CapabilityPortfolioRoom,
  cap_nominate: CapabilityNominationRoom,
  cap_results: CapabilityResultsRoom,
  vc_reveal: VCRevealRoom,
  vc_instinct: VCInstinctRoom,
  vc_cost: VCCostRoom,
  vc_mission: VCMissionRoom,
  vc_design: VCDesignRoom,
  vc_discuss: VCDiscussRoom,
  vc_table_decision: VCTableDecisionRoom,
  vc_portfolio: VCPortfolioRoom,
};

/* Older builds used these phase names; route them safely. */
const LEGACY_PHASES = { cap_select: 'cap_results', cap_confirm: 'cap_results', cap_preview: 'cap_results', complete: 'vc_portfolio' };

function Facilitator({ onExit }) {
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [responses, setResponses] = useState([]);
  const busy = useRef(false);

  const create = async () => {
    const now = new Date().toISOString();
    const s = { id: uid(), code: makeCode(), phase: 'lobby', created_at: now, updated_at: now };
    await saveSession(s);
    setSession(s);
  };

  useEffect(() => {
    if (!session) return undefined;
    const refresh = async () => {
      if (busy.current) return;
      busy.current = true;
      try {
        const s = await fetchSession(session.code);
        if (s) setSession((x) => ({ ...x, ...s }));
        setParticipants(await fetchParticipants(session.id, session.code));
        setResponses(await fetchResponses(session.id, session.code));
      } finally {
        busy.current = false;
      }
    };
    refresh();
    const timer = setInterval(refresh, 1500);
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
      clearInterval(timer);
      if (channel) supabase.removeChannel(channel);
    };
  }, [session?.id]);

  const advance = async (phase) => {
    const next = { ...session, phase, updated_at: new Date().toISOString() };
    await saveSession(next);
    setSession(next);
  };

  if (!session) return <FacilitatorStart onCreate={create} onBack={onExit} />;
  const phase = LEGACY_PHASES[session.phase] || session.phase;
  if (phase === 'lobby') return <Lobby session={session} participants={participants} onAdvance={advance} />;
  const Screen = FACILITATOR_SCREENS[phase] || VCPortfolioRoom;
  return <Screen session={session} participants={participants} responses={responses} onAdvance={advance} />;
}

/* ---------------------------------------------------------------------
   PARTICIPANT · JOIN + ONBOARD
   --------------------------------------------------------------------- */

function JoinCode({ initial, onJoin, onExit }) {
  const [c, setC] = useState(initial || '');
  return (
    <Shell compact>
      <section className="phone-card">
        <button className="text-link" type="button" onClick={onExit}><ArrowLeft size={16} /> Home</button>
        <QrCode className="solo-icon" />
        <div className="eyebrow">JOIN A FACILITATED SESSION</div>
        <h1>Enter the room code.</h1>
        <input value={c} onChange={(e) => setC(e.target.value.toUpperCase())} placeholder="HYB-123" maxLength={7} />
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
    const t = validTable(table);
    if (!t) {
      setError('Choose a table between 1 and 6.');
      return;
    }
    try {
      const p = {
        id: uid(),
        session_id: session.id,
        initials: initials.trim().toUpperCase(),
        persona,
        table_number: t,
        hospital_id: TABLE_MAP[t],
        created_at: new Date().toISOString(),
      };
      await addParticipant(p, session.code);
      sessionStorage.setItem(`hybrid-player-${session.code}`, JSON.stringify(p));
      onDone(p);
    } catch (e) {
      setError(e.message || 'Unable to join. Try again.');
    }
  };

  return (
    <Shell compact>
      <section className="phone-card">
        {step === 0 && (
          <>
            <div className="eyebrow">FIRST, WHO ARE YOU?</div>
            <h1>Add your initials.</h1>
            <input autoFocus value={initials} onChange={(e) => setInitials(e.target.value.slice(0, 3))} placeholder="CJ" />
            <Button disabled={!initials.trim()} onClick={() => setStep(1)}>CONTINUE</Button>
          </>
        )}
        {step === 1 && (
          <>
            <div className="eyebrow">YOUR PERSPECTIVE</div>
            <h1>What perspective are you bringing?</h1>
            <div className="persona-list">
              {PERSONAS.map((p) => (
                <button type="button" key={p.id} className={persona === p.id ? 'selected' : ''} onClick={() => setPersona(p.id)}>
                  <b>{p.name}</b>
                  <span>{p.line}</span>
                  {persona === p.id && <Check />}
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
              {TABLE_NUMBERS.map((n) => (
                <button type="button" className={table === n ? 'selected' : ''} onClick={() => setTable(n)} key={n}>{n}</button>
              ))}
            </div>
            {table && (
              <div className="selection-summary">
                <span>TABLE {table}</span>
                <b>{hospitalForTable(table).name}</b>
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

/* ---------------------------------------------------------------------
   PARTICIPANT · INTERACTIVE PHONE SCREENS
   --------------------------------------------------------------------- */

function PerspectiveCapture({ player, brief, responses, onSubmit }) {
  const existing = myResponse(responses, player.id, 'perspective');
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
          {brief.protect.map((x) => (
            <button type="button" key={x} className={choice === x ? 'selected' : ''} onClick={() => { setChoice(x); setSaved(false); }}>
              {choice === x && <Check size={18} />}
              <b>{x}</b>
            </button>
          ))}
        </div>
        <label className="note-label">
          Complete the sentence <small>optional · 140 characters</small>
          <textarea
            maxLength={140}
            value={note}
            onChange={(e) => { setNote(e.target.value); setSaved(false); }}
            placeholder={`Protect ${choice || 'this priority'} because...`}
          />
        </label>
        <Button disabled={!choice || saved} onClick={submit}>{saved ? 'PERSPECTIVE CAPTURED' : 'SAVE MY PERSPECTIVE'}</Button>
      </section>
    </Shell>
  );
}

function CapabilityNominationPhone({ player, responses, onSubmit }) {
  const existing = myResponse(responses, player.id, 'capability_nomination', 'portfolio');
  const [choice, setChoice] = useState(existing?.choice || '');
  const [saved, setSaved] = useState(Boolean(existing?.choice));

  const choose = async (id) => {
    setChoice(id);
    await onSubmit('capability_nomination', id, '', 'portfolio');
    setSaved(true);
  };

  return (
    <Shell compact>
      <section className="phone-card cap-phone">
        <div className="eyebrow">PRIVATE NOMINATION · {HOSPITALS[player.hospital_id]?.name}</div>
        <h1>Which capability should your table evaluate first?</h1>
        <p>Choose through your leadership lens. You can change your nomination until the facilitator advances.</p>
        <div className="phone-cap-grid">
          {CAPABILITIES.map((c) => {
            const fit = fitFor(c.id, player.hospital_id);
            return (
              <button type="button" key={c.id} className={choice === c.id ? 'selected' : ''} onClick={() => choose(c.id)}>
                <img src={c.image} alt="" />
                <div>
                  {choice === c.id && <Check />}
                  <b>{c.name}</b>
                  <span>{c.promise}</span>
                  <div className="phone-fit"><FitChip level={fit.level} /><em>{fit.why}</em></div>
                  <small>{lensFor(c.id, player.persona)}</small>
                </div>
              </button>
            );
          })}
        </div>
        {saved && (
          <div className="submission-confirm"><Check /> Nomination submitted · Tap another card to change</div>
        )}
      </section>
    </Shell>
  );
}

function CapabilityResultsPhone({ player, participants, responses }) {
  const table = validTable(player.table_number);
  const mine = myResponse(responses, player.id, 'capability_nomination', 'portfolio');
  const nominated = capabilityById(mine?.choice);
  return (
    <Shell compact>
      <section className="phone-card cap-waiting">
        <div className="eyebrow">TABLE {table || '—'} · NOMINATIONS REVEALED</div>
        <img className="phone-hospital-image" src={VIRTUAL_CARE.image} alt="" />
        <h1>Every table now evaluates Virtual Care.</h1>
        <p>{nominated ? `You nominated ${nominated.name}.` : 'You did not submit a nomination.'} Using the same capability lets the room compare how each hospital decides.</p>
        <div className="wait-note">No resources have been committed yet.</div>
      </section>
    </Shell>
  );
}

function InstinctVote({ player, responses, onSubmit }) {
  const existing = myResponse(responses, player.id, 'first_instinct', 'virtual-care');
  const [choice, setChoice] = useState(existing?.choice || '');
  const [saved, setSaved] = useState(Boolean(existing?.choice));

  const choose = async (c) => {
    setChoice(c);
    await onSubmit('first_instinct', c, '');
    setSaved(true);
  };

  return (
    <Shell compact>
      <section className="phone-card">
        <div className="eyebrow">PRIVATE FIRST INSTINCT</div>
        <h1>What would you do?</h1>
        <p>{lensFor('virtual-care', player.persona)}</p>
        <div className="phone-choice-stack interactive">
          {CHOICES.map((c) => (
            <button type="button" key={c} className={choice === c ? 'selected' : ''} onClick={() => choose(c)}>
              {choice === c && <Check />}
              <b>{c.toUpperCase()}</b>
              <span>{CHOICE_TEXT[c]}</span>
            </button>
          ))}
        </div>
        {saved && <div className="submission-confirm"><Check /> Response submitted · Tap another choice to change</div>}
      </section>
    </Shell>
  );
}

function TableDecisionPhone({ player, participants, responses, onSubmit }) {
  const table = validTable(player.table_number);
  const proposal = activeProposal(responses, table);
  const acks = acknowledgersOf(responses, table, proposal);
  const myAck = acks.some((r) => r.participant_id === player.id);
  const members = membersOf(participants, table);
  const mine = proposal && proposal.participant_id === player.id;

  return (
    <Shell compact>
      <section className="phone-card">
        <div className="eyebrow">TABLE {table || '—'} · SHARED DECISION</div>
        <h1>{proposal ? `Proposed: ${proposal.choice.toUpperCase()}` : 'One team. One direction.'}</h1>
        {!proposal ? (
          <>
            <p>Agree out loud first. Then one person records the table's decision.</p>
            <div className="phone-choice-stack interactive">
              {CHOICES.map((c) => (
                <button type="button" key={c} onClick={() => onSubmit('table_decision', c, '')}>
                  <b>{c.toUpperCase()}</b>
                  <span>{DECISION_TEXT[c]}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="proposal-banner">
              <b>{mine ? 'YOU PROPOSED THIS' : 'PROPOSED BY YOUR TABLE'}</b>
              <span>{acks.length} of {members.length || '—'} acknowledged</span>
            </div>
            <p>{DECISION_TEXT[proposal.choice]} Does this reflect your table's agreement?</p>
            <Button disabled={myAck} onClick={() => onSubmit('decision_ack', proposal.choice, '')}>
              {myAck ? 'ACKNOWLEDGED' : 'ACKNOWLEDGE'}
            </Button>
            <Button secondary onClick={() => onSubmit('table_decision', '', 'reopened')}>KEEP DISCUSSING</Button>
          </>
        )}
      </section>
    </Shell>
  );
}

/* ---------------------------------------------------------------------
   PARTICIPANT · PHASE ROUTER
   --------------------------------------------------------------------- */

function PlayerView({ session, player, participants, responses, onSubmit }) {
  const h = HOSPITALS[player.hospital_id] || hospitalForTable(validTable(player.table_number)) || HOSPITALS.academic;
  const brief = briefFor(player.persona);
  const table = validTable(player.table_number);
  const tableLabel = table ? `TABLE ${table}` : 'TABLE ASSIGNMENT UNAVAILABLE';
  const phase = LEGACY_PHASES[session.phase] || session.phase;

  switch (phase) {
    case 'lobby':
      return <PhoneState kicker={tableLabel} title={'You’re in.'} text={`${h.name}. Stay here. Your facilitator will reveal the challenge.`} />;

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
                <div key={k}><span>{RESOURCE_LABELS[k]}</span><b>{v}</b><small>{RESOURCE_MEANING[k]}</small></div>
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
      return <PhoneState kicker={'ONE SYSTEM · DIFFERENT RESPONSIBILITIES'} title="Your strategic brief is ready." text="Your facilitator will reveal when to open it." />;

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
              <div><b>PROTECT</b>{brief.protect.map((x) => <span key={x}>{x}</span>)}</div>
              <div><b>WATCH</b>{brief.watch.map((x) => <span key={x}>{x}</span>)}</div>
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
      return <PhoneState kicker="NEXT: CAPABILITY PORTFOLIO" title={brief.name} text="Six capabilities are coming. Your hospital cannot pursue them all." />;

    case 'cap_portfolio':
      return <PhoneState kicker={'SIX POSSIBILITIES · LIMITED CAPACITY'} title="Review the capability portfolio." text="Your facilitator will open private nominations next." />;

    case 'cap_nominate':
      return <CapabilityNominationPhone player={player} responses={responses} onSubmit={onSubmit} />;

    case 'cap_results':
      return <CapabilityResultsPhone player={player} participants={participants} responses={responses} />;

    case 'vc_reveal':
      return (
        <Shell compact>
          <section className="phone-card vc-phone">
            <div className="eyebrow">ROUND 1 · VIRTUAL CARE</div>
            <img className="phone-hospital-image" src={VIRTUAL_CARE.image} alt="" />
            <h1>{VIRTUAL_CARE.name}</h1>
            <p>{VIRTUAL_CARE.tagline}</p>
            <div className="brief-question"><b>YOUR LENS</b><p>{lensFor('virtual-care', player.persona)}</p></div>
          </section>
        </Shell>
      );

    case 'vc_instinct':
      return <InstinctVote player={player} responses={responses} onSubmit={onSubmit} />;

    case 'vc_cost':
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">IF YOUR TABLE INVESTS</div>
            <h1>See the resource impact.</h1>
            <div className="phone-resources">
              {Object.entries(h.resources).map(([k, v]) => (
                <div key={k}><span>{RESOURCE_LABELS[k]}</span><b>{v} → {resourcesAfter(h, 'invest')[k]}</b></div>
              ))}
            </div>
            <p><b>ADAPT</b> uses less capacity, but optionality is not free and the benefit is delayed.</p>
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
            <FitChip level={fitFor('virtual-care', h.id).level} />
            <h3>WHY IT FITS</h3>
            <p>{m.fit}</p>
            <h3>THE TRADE-OFF</h3>
            <p>{m.tradeoff}</p>
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
              {DESIGN_IMPLICATIONS.map(([k, v]) => <span key={k}>{k} · {v}</span>)}
            </div>
          </section>
        </Shell>
      );

    case 'vc_discuss': {
      const vote = myResponse(responses, player.id, 'first_instinct', 'virtual-care');
      return (
        <Shell compact>
          <section className="phone-card strategic-brief share-brief">
            <div className="eyebrow">DISCUSS AT YOUR TABLE</div>
            <h1>Explain your first instinct.</h1>
            <p>Your first instinct: <b>{vote?.choice?.toUpperCase() || 'NOT SUBMITTED'}</b></p>
            <p>{brief.responsibility}</p>
            <div className="brief-question"><b>YOUR QUESTION</b><p>{lensFor('virtual-care', player.persona)}</p></div>
          </section>
        </Shell>
      );
    }

    case 'vc_table_decision':
      return <TableDecisionPhone player={player} participants={participants} responses={responses} onSubmit={onSubmit} />;

    case 'vc_portfolio': {
      const choice = activeProposal(responses, table)?.choice || 'preserve';
      const after = resourcesAfter(h, choice);
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">ROUND 1 CHECKPOINT · {tableLabel}</div>
            <h1>Virtual Care: {choice.toUpperCase()}</h1>
            <div className="phone-resources">
              {Object.entries(h.resources).map(([k, v]) => (
                <div key={k}><span>{RESOURCE_LABELS[k]}</span><b>{v} → {after[k]}</b></div>
              ))}
            </div>
            <p>This is your remaining capacity for the capabilities still ahead.</p>
          </section>
        </Shell>
      );
    }

    default:
      return <PhoneState kicker={tableLabel} title="Stay with your table." text="Your facilitator will guide the next step." />;
  }
}

/* ---------------------------------------------------------------------
   PARTICIPANT CONTROLLER
   --------------------------------------------------------------------- */

function Participant({ initialCode, onExit }) {
  const [codeValue, setCodeValue] = useState(initialCode || '');
  const [session, setSession] = useState(null);
  const [player, setPlayer] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [responses, setResponses] = useState([]);
  const [error, setError] = useState('');

  const join = async (c) => {
    const found = await fetchSession(c);
    if (!found) {
      setError('Session not found. Check the code and try again.');
      return;
    }
    setCodeValue(c);
    setSession(found);
    const saved = sessionStorage.getItem(`hybrid-player-${c}`);
    if (saved) setPlayer(JSON.parse(saved));
  };

  useEffect(() => {
    if (initialCode) join(initialCode);
  }, []);

  useEffect(() => {
    if (!session) return undefined;
    const refresh = async () => {
      const current = await fetchSession(session.code);
      if (current) setSession((prev) => ({ ...prev, ...current }));
      setParticipants(await fetchParticipants(session.id, session.code));
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

  const submit = async (type, choice, note = '', capabilityId = 'virtual-care') => {
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
      hospital_id: player.hospital_id,
      persona: player.persona,
      capability_id: capabilityId,
      response_type: type,
      choice,
      note,
      updated_at: new Date().toISOString(),
    };
    try {
      await saveResponse(response, session.code);
      setResponses(await fetchResponses(session.id, session.code));
    } catch (e) {
      setError(e.message || 'Response could not be saved.');
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
      <PlayerView session={session} player={player} participants={participants} responses={responses} onSubmit={submit} />
      {error && <div className="toast" onClick={() => setError('')}>{error}</div>}
    </>
  );
}

/* ---------------------------------------------------------------------
   APP ROOT
   --------------------------------------------------------------------- */

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
