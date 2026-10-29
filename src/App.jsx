import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Layers3, QrCode, RotateCcw, Users, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { hasSupabase, supabase } from './supabase';

/* =====================================================================
   FUTURE-READY HOSPITAL CHALLENGE · HYBRID · ROUND 2.0
   Setup -> table-chosen teaching round -> three portfolio cycles
   with a Future Signal before the last -> side-by-side comparison
   ===================================================================== */

const BUILD_LABEL = 'ROUND 2.2';
const SINGLE_PLAYER_URL =
  import.meta.env.VITE_SINGLE_PLAYER_URL ||
  'https://cathylester2026.github.io/AIMedX_Single_Player_Build_01/';
const BASE = import.meta.env.BASE_URL;
const TABLE_NUMBERS = [1, 2, 3, 4, 5, 6];

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
   CONTENT · CAPABILITY PORTFOLIO (Round 2.0)
   Each table chooses its own teaching capability. Costs depend on the hospital.
   --------------------------------------------------------------------- */

const RES_KEYS = ['capital', 'infrastructure', 'operationalReadiness', 'changeCapacity'];
const RES_SHORT = ['Capital', 'Infra', 'Ops', 'Change'];

const CAPABILITIES = [
  {
    id: 'virtual-care',
    name: 'Virtual Care',
    promise: 'Bring expertise to the patient, wherever either one is.',
    image: `${BASE}capabilities/virtual-care.png`,
    scope: 'Remote specialist consults and virtual nursing on priority inpatient units, plus scheduled virtual follow-up visits for selected services.',
    excluded: 'Hospital-at-home programs and remote monitoring.',
    prepare: { pkg: 'Connectivity and audiovisual standards for priority rooms, a virtual consult workflow and a governance model.', ready: 'Rooms and workflows that can switch on virtual consults quickly.', notYet: 'No virtual nursing or virtual visits in operation.' },
    exposure: 'Specialist access keeps depending largely on where specialists are based, with today’s gaps remaining.',
    support: [['SPACE', 'Rooms where a remote clinician can see, hear and be heard clearly.'], ['INFRASTRUCTURE', 'Reliable coverage and capacity wherever virtual care is delivered.'], ['OPERATIONS', 'Workflows that include a remote participant without slowing care.'], ['FLEXIBILITY', 'Expansion to more rooms without rework.']],
    early: 'Which rooms and units must support virtual interaction, and the coverage they need.',
    open: 'Devices, carts and displays. They will change faster than the rooms.',
    scale: { unit: 'Bedside workflow changes when a remote clinician joins.', facility: 'Coverage, audiovisual standards and support make it reliable.', system: 'Shared scheduling, platforms and governance let expertise serve every site.' },
    continuum: 'Two movements: virtual visits move some encounters out of the hospital, while virtual consults bring expertise into the room without moving care at all.',
    revealLine: 'Not all virtual care moves care. Some of it moves expertise.',
    invest: { headline: 'Virtual care becomes part of how care is delivered.', unit: 'Teams work with remote colleagues as a routine part of care.', facility: 'Priority rooms carry the coverage and audiovisual standard.', system: 'Specialist time can be shared across sites through one schedule.', flow: 'Selected follow-up visits move out of the hospital.' },
    tradeoff: { academic: 'Aging infrastructure may require network, audiovisual and room upgrades before virtual care is reliable.', regional: 'Reach only improves if connectivity, staffing and referral workflows are reliable across the catchment.', distributed: 'Inconsistent infrastructure and workflows across sites add implementation effort.', greenfield: 'Specifying today’s virtual-care devices could lock a new campus into technology that will change quickly.' },
    context: { academic: 'Here, older rooms may need upgrades before virtual care is reliable.', regional: 'Here, the value comes from reach across a wide region.', distributed: 'Here, it connects expertise that is spread thin across sites.', greenfield: 'Here, rooms can be designed for it from day one, while the devices stay replaceable.' },
  },
  {
    id: 'ambient-intelligence',
    name: 'Ambient Intelligence',
    promise: 'Give clinicians time back from documentation.',
    image: `${BASE}capabilities/ambient-intelligence.png`,
    scope: 'Ambient clinical documentation on priority units: the conversation is captured and drafted into the record for clinician review.',
    excluded: 'Environmental sensing, fall detection and location tracking.',
    prepare: { pkg: 'Consent and privacy policies, data governance, record integration design and a pilot with one willing team.', ready: 'A tested, governed approach that can scale quickly.', notYet: 'Most clinicians still document manually.' },
    exposure: 'Documentation keeps competing with time at the bedside, at today’s level.',
    support: [['SPACE', 'Conversations that can be captured accurately while staying private.'], ['INFRASTRUCTURE', 'Reliable coverage for the devices clinicians carry or rooms use.'], ['OPERATIONS', 'Review and sign-off built into the clinical day.'], ['FLEXIBILITY', 'A change of tools without a change to the room.']],
    early: 'Acoustic privacy and coverage in the spaces where clinical conversations happen.',
    open: 'The capture device and software. They are changing quickly.',
    scale: { unit: 'Clinicians document differently at the bedside.', facility: 'Coverage and privacy must hold up in every room where it is used.', system: 'Consent, privacy and data governance must be consistent across the enterprise.' },
    continuum: 'Care stays where it is. What changes is how clinicians spend their time.',
    revealLine: 'Some capabilities do not move care. They change who has time to give it.',
    invest: { headline: 'Documentation effort can decrease. Your team decides how released time is used.', unit: 'Clinicians review drafted notes instead of writing them from scratch.', facility: 'Clinical spaces support private, accurate capture.', system: 'Enterprise consent and data governance become a requirement.', flow: 'Care settings stay the same.' },
    tradeoff: { academic: 'Teaching rounds with many participants make consent and accurate capture harder.', regional: 'The value depends on adoption by a stretched workforce with little time to learn new tools.', distributed: 'Consent, privacy and data practices differ across sites and must align before results can be trusted.', greenfield: 'With no clinical teams yet, adoption cannot be tested until the hospital opens.' },
    context: { academic: 'Here, teaching rounds with many voices make capture harder.', regional: 'Here, time returned to a stretched workforce is the main benefit.', distributed: 'Here, the benefit depends on consistent governance across every site.', greenfield: 'Here, readiness can be designed in, but adoption cannot be tested yet.' },
  },
  {
    id: 'smart-rooms',
    name: 'Smart Rooms',
    promise: 'Give patients control and keep care teams informed.',
    image: `${BASE}capabilities/smart-rooms.png`,
    scope: 'Patient control of lighting, temperature, shades and entertainment, plus in-room information connected to nurse call.',
    excluded: 'Automatic room-readiness status and bedside device data integration.',
    prepare: { pkg: 'A room standard, controls and integration specifications, and power and network capacity in new or renovated rooms.', ready: 'Rooms that can accept the technology without being reopened.', notYet: 'Patients and staff see no change yet.' },
    exposure: 'Patient control of the room, and the link between nurse call and in-room information, stay as they are today.',
    support: [['SPACE', 'Patient control and information within reach and sight from the bed.'], ['INFRASTRUCTURE', 'Power and network capacity in every room that will carry it.'], ['OPERATIONS', 'Around-the-clock support when a room system fails.'], ['FLEXIBILITY', 'Device replacement without reopening walls.']],
    early: 'The room standard: where power, data and access must be in every room.',
    open: 'The specific controls, displays and software.',
    scale: { unit: 'The patient and care-team experience changes in every room.', facility: 'The facility must support and maintain every connected room.', system: 'Room systems must connect to enterprise platforms instead of becoming isolated.' },
    continuum: 'Care stays in the hospital. Smart Rooms change the stay, not where care happens.',
    revealLine: 'Not every capability moves care. Some make the hospital stay better.',
    invest: { headline: 'The room becomes part of the care experience.', unit: 'Patients control their environment; staff see requests in context.', facility: 'Capital and support needs repeat across every room.', system: 'Room data must connect to enterprise systems.', flow: 'Care stays in the hospital; the stay changes.' },
    tradeoff: { academic: 'Occupied-room upgrades may require bed closures and careful phasing during an already difficult renewal.', regional: 'The cost repeats in every room, far beyond the price of a pilot.', distributed: 'Room types and readiness differ across sites, so one standard is hard to apply.', greenfield: 'The initial room standard shapes construction and must support later revisions.' },
    context: { academic: 'Here, occupied-room upgrades may require bed closures and careful phasing.', regional: 'Here, the cost repeats across many rooms on a growing campus.', distributed: 'Here, rooms differ widely between sites.', greenfield: 'Here, the initial room standard shapes construction and must allow later revision.' },
  },
  {
    id: 'autonomous-logistics',
    name: 'Autonomous Logistics',
    promise: 'Move materials without relying on people for every trip.',
    image: `${BASE}capabilities/autonomous-logistics.png`,
    scope: 'Automated movement of supplies, linen and waste within the facility on defined routes.',
    excluded: 'Distribution to other sites or to patients’ homes.',
    prepare: { pkg: 'Route analysis, elevator and door control readiness, and space reserved for staging and charging.', ready: 'Routes that can accept automation without rework.', notYet: 'Staff still carry every delivery.' },
    exposure: 'Staff keep spending time on routine material movement, as they do today.',
    support: [['SPACE', 'Routes with room to pass, turn and wait safely.'], ['INFRASTRUCTURE', 'Elevator and door access, and places to charge.'], ['OPERATIONS', 'Supply, linen and waste workflows that hand trips to automation.'], ['FLEXIBILITY', 'New routes and vehicles without rebuilding.']],
    early: 'Which routes, elevators and staging areas must accommodate automated movement.',
    open: 'The vehicles themselves and how many.',
    scale: { unit: 'Staff spend less time fetching and carrying.', facility: 'Circulation and elevator capacity are shared with automated traffic.', system: 'Supply practices can be standardized where sites share approaches.' },
    continuum: 'Care does not move. Materials do, and the building has to make room for them.',
    revealLine: 'Some capabilities move materials, not patients, and still reshape the building.',
    invest: { headline: 'Routine movement becomes automated.', unit: 'Staff hand defined transport trips to automation.', facility: 'Routes, elevators and staging space are shared with automated traffic.', system: 'Supply practices can be standardized across similar sites.', flow: 'Care settings are unchanged.' },
    tradeoff: { academic: 'Narrow legacy corridors and shared elevators limit where automation can travel.', regional: 'Automation must share circulation with a busy campus population.', distributed: 'Each site has a different layout, so one solution rarely fits all.', greenfield: 'Designing around today’s vehicles could fix routes that later technology does not need.' },
    context: { academic: 'Here, narrow legacy corridors and shared elevators limit the routes.', regional: 'Here, automation shares circulation with a busy campus population.', distributed: 'Here, each site has a different layout.', greenfield: 'Here, circulation can be planned with automation in mind from the start.' },
  },
  {
    id: 'predictive-operations',
    name: 'Predictive Operations',
    promise: 'See demand coming before it becomes disruption.',
    image: `${BASE}capabilities/predictive-operations.png`,
    scope: 'Forecasting of admissions, discharges and bed demand, used to plan staffing and capacity.',
    excluded: 'Clinical prediction, such as early warning of patient deterioration.',
    prepare: { pkg: 'Data quality work, the core data connections and a forecast pilot for one service line.', ready: 'Trustworthy data and a tested forecast.', notYet: 'Staffing and bed decisions are still made the same day.' },
    exposure: 'Staffing and capacity decisions keep relying mostly on same-day information.',
    support: [['SPACE', 'People who act on a forecast able to coordinate, together or across locations.'], ['INFRASTRUCTURE', 'Timely, connected operational data.'], ['OPERATIONS', 'Roles and escalation paths that act on forecasts.'], ['FLEXIBILITY', 'Capacity in the building that can flex when the forecast says it should.']],
    early: 'Which spaces can flex, and how far, so a forecast has something to act on.',
    open: 'Where coordination happens. A shared room is one option, not a requirement.',
    scale: { unit: 'Managers staff and plan earlier.', facility: 'Beds and support capacity are used more dynamically.', system: 'Demand can be balanced across sites.' },
    continuum: 'Care settings do not change, but patients can be planned into the right one earlier.',
    revealLine: 'Foresight changes when decisions are made, not where care happens.',
    invest: { headline: 'Operations plan ahead of demand.', unit: 'Units staff to tomorrow’s forecast, not only today’s census.', facility: 'Flexible capacity is used more deliberately.', system: 'Demand can be balanced across sites.', flow: 'Patients are planned into the right setting earlier.' },
    tradeoff: { academic: 'A forecast only helps if constrained units can act on what it shows.', regional: 'Forecasts must cover referral demand from across the region, not just the campus.', distributed: 'Inconsistent data across sites weakens every forecast.', greenfield: 'With no operating history yet, early forecasts will be unreliable.' },
    context: { academic: 'Here, capacity is constrained during renewal, so foresight matters.', regional: 'Here, demand arrives from across the whole region.', distributed: 'Here, inconsistent data across sites weakens every forecast.', greenfield: 'Here, there is no operating history to forecast from yet.' },
  },
  {
    id: 'care-platform',
    name: 'Shared Digital Foundation',
    promise: 'Build the common base that other capabilities can use.',
    image: `${BASE}capabilities/care-platform.png`,
    scope: 'An integration layer, enterprise identity and access, common data standards, network readiness and a cybersecurity baseline.',
    excluded: 'Clinical applications, including any record-system replacement.',
    prepare: { pkg: 'Architecture, data standards and governance, plus space and pathway capacity reserved for growth.', ready: 'A defined target that later capabilities can be designed against.', notYet: 'Each capability is still connected on its own.' },
    exposure: 'New capabilities keep being connected one at a time, as they are today.',
    support: [['SPACE', 'Technology rooms with room to grow.'], ['INFRASTRUCTURE', 'Network and pathway capacity beyond today’s need.'], ['OPERATIONS', 'Shared standards that sites and vendors follow.'], ['FLEXIBILITY', 'Applications that can change without rebuilding the base.']],
    early: 'Technology space and pathway capacity. They are hard to add later.',
    open: 'The specific vendors and applications that connect to it.',
    scale: { unit: 'Information becomes more consistent where systems adopt the standards.', facility: 'Technology space and network capacity must carry the foundation.', system: 'The foundation is governed at enterprise level and serves every site.' },
    continuum: 'Moves no care on its own. It can let information follow the patient when other capabilities use it.',
    revealLine: 'A foundation does not move care. It can make moving care safer.',
    invest: { headline: 'A common base is in place before more is added.', unit: 'Information becomes more consistent where systems adopt the standards.', facility: 'Technology space and network capacity are built for growth.', system: 'Later capabilities that use the foundation can cost less to add.', flow: 'Information can follow the patient where capabilities connect to it.' },
    tradeoff: { academic: 'A foundation project during renewal adds load to an organization already managing disruptive phasing.', regional: 'Foundational work competes with the visible access improvements the region is asking for.', distributed: 'Every site must converge on common standards, which is difficult and politically sensitive.', greenfield: 'Easy to build in from day one, but a foundation chosen now must still evolve.' },
    context: { academic: 'Here, the foundation competes with renewal for scarce change capacity.', regional: 'Here, it competes with visible access improvements.', distributed: 'Here, it reduces the inconsistency that makes every other change harder.', greenfield: 'Here, it can be built before individual solutions arrive.' },
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
    academic: ['Moderate', 'Reduces documentation burden without rebuilding every workflow.'],
    regional: ['High', 'Stretches a scarce workforce by reducing documentation.'],
    distributed: ['Moderate', 'Delivers value only with consistent data and governance across sites.'],
    greenfield: ['High', 'Coverage and privacy for ambient capture can be designed in from the start.'],
  },
  'smart-rooms': {
    academic: ['Moderate', 'Valuable, but retrofitting occupied units is disruptive and must be phased.'],
    regional: ['Moderate', 'Improves experience, but repeating the package across many rooms drives cost.'],
    distributed: ['Low–Moderate', 'Hard to standardize across sites with different levels of readiness.'],
    greenfield: ['High', 'The room standard and enabling infrastructure can be set before construction.'],
  },
  'autonomous-logistics': {
    academic: ['Low–Moderate', 'Legacy corridors, elevators and phasing constrain automated routes.'],
    regional: ['Moderate', 'Frees staff time across a busy campus if circulation can support it.'],
    distributed: ['Moderate', 'Can support supply movement at larger sites, but every site is different.'],
    greenfield: ['High', 'Circulation, elevators and storage can be planned with automation in mind.'],
  },
  'predictive-operations': {
    academic: ['High', 'Helps manage constrained capacity during renewal and phasing.'],
    regional: ['High', 'Anticipates referral demand and protects specialty capacity.'],
    distributed: ['High', 'Balances demand across sites, if the data is consistent.'],
    greenfield: ['Moderate', 'Valuable later, but there is no operating history to predict from yet.'],
  },
  'care-platform': {
    academic: ['High', 'Reduces integration effort before more capabilities are layered on.'],
    regional: ['Moderate–High', 'Creates a scalable base for regional growth.'],
    distributed: ['High', 'The common base needed to reduce fragmentation across the network.'],
    greenfield: ['High', 'Builds the integration base before individual solutions arrive.'],
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
const fitRank = (level) => ({ high: 4, 'moderate–high': 3, moderate: 2, 'low–moderate': 1 }[(level || '').toLowerCase()] || 0);

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
    operations: 'Can review and sign-off fit the clinical day without slowing care?',
    digital: 'Do we have the consent, privacy and integration maturity to support ambient capture?',
    finance: 'Can documentation time savings be measured well enough to justify the investment?',
    design: 'Which spaces need acoustic privacy and coverage for conversations to be captured well?',
  },
  'smart-rooms': {
    clinical: 'Will connected rooms improve patient experience and care-team support, or add devices to manage?',
    operations: 'Who supports and maintains every connected room around the clock?',
    digital: 'Will room systems integrate with enterprise platforms or create room-level silos?',
    finance: 'Will the benefit justify repeating this technology package across every room?',
    design: 'How do we set a room standard that stays adaptable as room technology changes?',
  },
  'autonomous-logistics': {
    clinical: 'Will this return time to bedside care, or only move work somewhere else?',
    operations: 'Can supply, linen and waste workflows be redesigned around automated movement?',
    digital: 'Can automation reliably integrate with elevators, doors and inventory systems?',
    finance: 'Does labor and reliability value outweigh the capital and maintenance burden?',
    design: 'Can corridors, elevators and staging space support automated routes without compromising people flow?',
  },
  'predictive-operations': {
    clinical: 'Will forecasts arrive early enough to change staffing and bed decisions?',
    operations: 'Are we prepared to act differently on what the forecasts tell us?',
    digital: 'Is our data clean, connected and timely enough for reliable forecasting?',
    finance: 'Can better foresight measurably reduce cost, delay and lost capacity?',
    design: 'Which spaces can flex when a forecast says they should?',
  },
  'care-platform': {
    clinical: 'Will common standards make information easier to find and act on at the point of care?',
    operations: 'Can we absorb an enterprise foundation project while continuing to operate?',
    digital: 'Which later capabilities would actually use this foundation, and what happens if we defer it?',
    finance: 'Is a foundational investment worth more now than a visible capability today?',
    design: 'What network, technology space and pathway capacity must the building provide for the foundation to grow?',
  },
};

const lensFor = (capabilityId, persona) =>
  CAPABILITY_LENSES[capabilityId]?.[persona] || briefFor(persona).question;

/* ---------------------------------------------------------------------
   RESOURCE MODEL · verified by exhaustive simulation (Draft v2 + review)
   Values are [Capital, Infrastructure, Operational readiness, Change capacity]
   --------------------------------------------------------------------- */

const BASE_COST = {
  'virtual-care': [2, 2, 2, 3],
  'ambient-intelligence': [2, 3, 1, 3],
  'smart-rooms': [4, 3, 2, 2],
  'autonomous-logistics': [4, 3, 3, 1],
  'predictive-operations': [1, 2, 3, 3],
  'care-platform': [3, 3, 2, 4],
};
const HOSPITAL_COST_MOD = {
  academic: { 'smart-rooms': [0, 2, 1, 0], 'autonomous-logistics': [0, 3, 0, 0], 'ambient-intelligence': [0, 1, 0, 0], 'virtual-care': [0, 1, 0, 0], 'care-platform': [0, 1, 0, 1] },
  regional: { 'smart-rooms': [2, 0, 1, 0], 'virtual-care': [0, 0, 1, 0], 'autonomous-logistics': [0, 1, 1, 0], 'ambient-intelligence': [0, 0, 1, 1], 'predictive-operations': [0, 0, 1, 0], 'care-platform': [0, 0, 1, 1] },
  distributed: { 'smart-rooms': [0, 1, 0, 2], 'ambient-intelligence': [0, 1, 0, 2], 'predictive-operations': [0, 1, 0, 2], 'virtual-care': [0, 1, 0, 1], 'care-platform': [1, 0, 0, 0], 'autonomous-logistics': [1, 0, 1, 1] },
  greenfield: { 'smart-rooms': [0, -1, 0, 0], 'autonomous-logistics': [0, -1, 0, 0], 'ambient-intelligence': [0, -1, 0, 0], 'predictive-operations': [0, 0, 2, 0], 'virtual-care': [0, 0, 1, 0] },
};
const FOUNDATION_USERS = ['virtual-care', 'ambient-intelligence', 'smart-rooms', 'predictive-operations'];
const COST_REASON = {
  academic: 'Aging infrastructure raises the Infrastructure cost of anything that touches rooms or pathways.',
  regional: 'Growth while demand continues adds Operational readiness to most capabilities.',
  distributed: 'Inconsistent systems add Change capacity to anything that must work across sites.',
  greenfield: 'Building before walls close lowers Infrastructure costs; no operating history raises Operational readiness.',
};

const investCost = (hospitalId, capId, foundation = false) => {
  const mod = HOSPITAL_COST_MOD[hospitalId]?.[capId] || [0, 0, 0, 0];
  const v = BASE_COST[capId].map((b, i) => b + mod[i]);
  if (foundation && FOUNDATION_USERS.includes(capId)) {
    v[1] -= 1;
    if (hospitalId === 'distributed') v[3] -= 1;
  }
  return v.map((x) => Math.max(0, x));
};
/* Prepare: about 40% of Invest, rounded up, in every resource the capability uses. Never free. */
const prepareCost = (hospitalId, capId) => investCost(hospitalId, capId).map((x) => (x > 0 ? Math.max(1, Math.ceil(x * 0.4)) : 0));
/* Invest after Prepare: today's Invest price (including any foundation discount) minus what was already paid. */
const completeCost = (hospitalId, capId, foundation = false) =>
  investCost(hospitalId, capId, foundation).map((x, i) => Math.max(0, x - prepareCost(hospitalId, capId)[i]));

const CHOICES = ['invest', 'prepare', 'hold'];
const CHOICE_TEXT = {
  invest: 'Commit to the defined scope now.',
  prepare: 'Complete the enabling package. Keep the option open.',
  hold: 'Keep capacity for what comes next.',
};
const DECISION_TEXT = {
  invest: 'Commit the full resource cost and deliver the defined scope.',
  prepare: 'Pay for the enabling package. Investing later costs the remainder.',
  hold: 'Make no commitment. Resources stay available.',
};

const CHANGE_OPTIONS = [
  ['device', 'The device or technology itself'],
  ['location', 'Where it sits in the building'],
  ['infrastructure', 'Access to the infrastructure behind it'],
];

const FUTURE_SIGNALS = [
  { id: 'workforce', kind: 'opportunity', title: 'The workforce tightens.', text: 'Nursing and support-staff vacancies rise sharply across the region. Every hour of staff time now matters more.', responds: ['ambient-intelligence', 'autonomous-logistics'] },
  { id: 'virtual-shift', kind: 'opportunity', title: 'Care moves out.', text: 'A major payer shifts follow-up care to virtual and home settings within the year.', responds: ['virtual-care'] },
  { id: 'demand-surge', kind: 'opportunity', title: 'Demand surges.', text: 'A neighboring hospital closes its inpatient units. Referral demand rises faster than anyone planned for.', responds: ['predictive-operations', 'virtual-care'] },
  { id: 'cyber', kind: 'shock', title: 'A cyber incident hits the region.', text: 'Ransomware takes a neighboring system offline for weeks. Every hospital must harden and recover, and the cost lands on whatever capacity it has least of.', responds: ['care-platform'], hit: 2, partial: 1 },
];
const signalById = (id) => FUTURE_SIGNALS.find((s) => s.id === id);

/* ---------------------------------------------------------------------
   DEBRIEF CONTENT · DRAFT outcome values for review (game values, not data)
   --------------------------------------------------------------------- */
const OUTCOME_DIMS = [
  ['access', 'Access', 'Patients reach the right care sooner.'],
  ['workforce', 'Workforce capacity', 'Staff time goes to care, not workarounds.'],
  ['experience', 'Patient experience', 'The stay and the visit feel better.'],
  ['resilience', 'Operational resilience', 'The hospital absorbs disruption.'],
  ['adaptability', 'Adaptability', 'The hospital can change direction later.'],
];
const OUTCOME_VALUE = {
  'virtual-care': { access: 2, workforce: 1, experience: 1, resilience: 1 },
  'ambient-intelligence': { workforce: 2, experience: 1 },
  'smart-rooms': { experience: 2, workforce: 1 },
  'autonomous-logistics': { workforce: 2, resilience: 1 },
  'predictive-operations': { resilience: 2, access: 1, workforce: 1 },
  'care-platform': { adaptability: 2, resilience: 1 },
};
const HOSPITAL_PRIORITY = {
  academic: ['resilience', 'workforce'],
  regional: ['access', 'workforce'],
  distributed: ['access', 'adaptability'],
  greenfield: ['adaptability', 'experience'],
};
const OUTCOME_STATUS = { moved: 'MOVED', partly: 'PARTLY MOVED', unchanged: 'UNCHANGED', weakened: 'WEAKENED' };

/* ---------------------------------------------------------------------
   ROLE VIEW · one shared care moment per capability (facilitator) and one
   statement per role (phones). Reviewed wording, Round 2.2.
   --------------------------------------------------------------------- */
const ROLE_VIEW = {
  'virtual-care': {
    moment: 'A specialist joins remotely while the bedside team continues care, and the patient and family need to see, hear and participate clearly.',
    clinical: 'Remote expertise can reach the bedside without waiting for the next on-site visit or transferring a patient just for a consult.',
    operations: 'Specialist time can be coordinated across units and sites, so fewer patients wait in a bed for a consult.',
    digital: 'Shared identity, integration and service standards let virtual care expand without every department building its own solution.',
    finance: 'Specialist capacity can reach more patients, with the potential to avoid some transfers and deliver selected follow-up visits remotely.',
    design: 'Designing for clear, private remote participation now lets more rooms support virtual care as services expand.',
  },
  'ambient-intelligence': {
    moment: 'A clinician finishes a patient conversation. A draft note is ready for review before the next encounter.',
    clinical: 'You review and sign a drafted note, so more of your attention stays with the patient during the conversation.',
    operations: 'Documentation effort can drop at shift change and after hours, if the team agrees how the released time is used.',
    digital: 'A common approach to consent, privacy and record integration gives clinical teams a governed way to adopt documentation tools.',
    finance: 'Reducing documentation effort can release valuable clinical capacity, if the benefit justifies licensing, integration and support.',
    design: 'Spaces where conversations can be captured accurately and kept private, which improves acoustics for every encounter.',
  },
  'smart-rooms': {
    moment: 'At 2 a.m., a patient wants dimmer lights and another blanket. They can adjust the lights; the blanket request needs to reach the right person.',
    clinical: 'Patients can handle simple comforts themselves, and the calls that reach you arrive with more context from the room.',
    operations: 'Fewer call-light trips for simple comforts, and nurse call linked to what’s happening in the room.',
    digital: 'Room systems that connect to nurse call and enterprise platforms, not a standalone system in every room.',
    finance: 'A patient-experience improvement people notice and rate, if the cost per room holds up across every room.',
    design: 'Set clear rules for where power, data and controls go, adapted to each room type and kept separate from devices that will change.',
  },
  'autonomous-logistics': {
    moment: 'Supplies arrive on the unit automatically, but the delivery has to pass staff, beds and visitors in the corridor without disrupting care.',
    clinical: 'Nurses spend less time fetching supplies and linen, and more time at the bedside.',
    operations: 'Routine trips become predictable and trackable, freeing support staff for work that needs a person.',
    digital: 'Connected doors, elevators and tracking help automated deliveries reach their destination reliably, with a clear fallback when systems fail.',
    finance: 'Reliability and staff-time gains that repeat every shift, a lasting return on the capital and maintenance cost.',
    design: 'Reserve usable routes, staging and charging space now, so automated delivery can expand without disruptive building changes.',
  },
  'predictive-operations': {
    moment: 'It’s Monday morning. Expected admissions and delayed discharges suggest Wednesday’s beds may be tight. The team still has time to respond.',
    clinical: 'Staffing and beds can be planned earlier, so your unit is less likely to absorb a surge at the last minute.',
    operations: 'Earlier warning gives you time to adjust staffing, discharge coordination and available capacity before the shortfall arrives.',
    digital: 'A reason to clean up and connect operational data that later capabilities will also use.',
    finance: 'Fewer last-minute agency shifts, diversions and blocked beds, if teams act on the forecast.',
    design: 'Adaptable space gives teams more ways to respond when demand changes, provided staffing and services can support it.',
  },
  'care-platform': {
    moment: 'A patient moves from the emergency department to a unit to a clinic. The existing systems along the way don’t share information easily, so staff re-enter it at each step.',
    clinical: 'Information can follow your patient between settings, where the systems you use adopt the shared standards.',
    operations: 'Reusable connections and common standards can reduce the coordination work each time a capability is added.',
    digital: 'Shared identity, integration, data standards and security give later capabilities a common base that can evolve.',
    finance: 'Lowers the risk of one-off investments that can’t be reused. The return arrives through the capabilities that follow.',
    design: 'Technology rooms and pathway capacity sized for growth now, because they’re hard to add after the walls close.',
  },
};
const ROLE_ORDER = ['clinical', 'operations', 'digital', 'finance', 'design'];
const roleLine = (capId, persona) => ROLE_VIEW[capId]?.[persona] || '';
const careMoment = (capId) => ROLE_VIEW[capId]?.moment || '';
const ROLE_DIM = { clinical: 'experience', operations: 'resilience', digital: 'adaptability', finance: 'workforce', design: 'adaptability' };
const DECISION_PROMPT = 'Which capability best addresses our hospital’s immediate need, and whose implementation burden are we accepting?';
const BUILDING_QUESTION = 'What does this choice require us to decide about the building now?';
const signalTagFor = (signal, capId) => {
  if (!signal || !signal.responds.includes(capId)) return null;
  return signal.kind === 'shock' ? 'WOULD HAVE PROTECTED' : 'SIGNAL';
};

const NEED_LINE = {
  academic: 'Specialists are overcommitted, units are aging, and every renovation competes with beds in service.',
  regional: 'Patients travel hours for specialty care, and referral beds fill before the day is half over.',
  distributed: 'The same patient has a different experience at every site, and staff work across systems that do not connect.',
  greenfield: 'You must decide how this hospital will work years before the first patient arrives.',
};

const FALLBACK_HOSPITAL_IMAGE = `${BASE}hospitals/greenfield.png`;
const imageFallback = (e, fallback = FALLBACK_HOSPITAL_IMAGE) => {
  const img = e.currentTarget;
  if (img.dataset.fellback === '1') return;
  img.dataset.fellback = '1';
  img.src = fallback;
};

const SCALE_VISUALS = {
  unit: `${BASE}capabilities/virtual-care.png`,
  facility: `${BASE}hospitals/greenfield.png`,
  system: `${BASE}hospitals/distributed-system.png`,
};


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

/* Latest table-level row of a type for a key (any member can record it; latest wins). */
const latestTableRow = (responses, table, type, key) =>
  responsesOfType(responses, type, key)
    .filter((r) => validTable(r.table_number) === table)
    .sort(byTime)
    .slice(-1)[0];

/* Facilitator rows encode the table in the key so one facilitator record can hold one row per table. */
const facKey = (key, table) => `${key}-T${table}`;
const facRow = (responses, type, key, table) => responsesOfType(responses, type, facKey(key, table)).sort(byTime).slice(-1)[0];

const activeProposal = (responses, table, key = 'teach') => {
  const latest = latestTableRow(responses, table, 'table_decision', key);
  return latest && latest.choice ? latest : null;
};

const acknowledgersOf = (responses, table, proposal, key = 'teach') => {
  if (!proposal) return [];
  const rows = responsesOfType(responses, 'decision_ack', key).filter(
    (r) => validTable(r.table_number) === table && r.choice === proposal.choice && byTime({ updated_at: proposal.updated_at }, r) <= 0
  );
  return rows.some((r) => r.participant_id === proposal.participant_id) ? rows : [...rows, { participant_id: proposal.participant_id, implicit: true }];
};

/* A table blocks the teaching decision only after someone at that table submitted a first instinct. */
const teachTables = (participants, responses) => {
  const ids = new Set(participants.map((p) => p.id));
  return [...new Set(
    responsesOfType(responses, 'first_instinct', 'teach')
      .filter((r) => ids.has(r.participant_id))
      .map((r) => validTable(r.table_number))
      .filter(Boolean)
  )].sort((a, b) => a - b);
};

const decisionForTable = (responses, table, key = 'teach') => {
  const proposal = activeProposal(responses, table, key);
  if (proposal) return { status: 'decided', choice: proposal.choice, proposal };
  const excluded = facRow(responses, 'table_no_decision', key, table);
  return excluded ? { status: 'no-decision', choice: null, proposal: null } : { status: 'waiting', choice: null, proposal: null };
};

const nominationRanking = (participants, responses, table) => {
  const noms = responsesOfType(responses, 'capability_nomination', 'portfolio');
  const members = membersOf(participants, table);
  const pick = (p) => myResponse(noms, p.id, 'capability_nomination', 'portfolio')?.choice;
  return CAPABILITIES.map((c, i) => ({ c, i, n: members.filter((p) => pick(p) === c.id).length }))
    .sort((a, b) => b.n - a.n || a.i - b.i);
};

/* Teaching capability: facilitator-approved, else the table's leading nomination. */
const teachCapFor = (participants, responses, table) => {
  const assigned = facRow(responses, 'teach_assign', 'teach', table)?.choice;
  if (assigned && capabilityById(assigned)) return assigned;
  const top = nominationRanking(participants, responses, table)[0];
  return top && top.n > 0 ? top.c.id : 'virtual-care';
};

/* Teaching decision, including the one revision allowed when the board opens. */
const teachDecisionFor = (responses, table) => {
  const original = decisionForTable(responses, table, 'teach').choice;
  const rev = latestTableRow(responses, table, 'teach_revise', 'teach');
  if (rev && rev.choice && rev.choice !== original) return { choice: rev.choice, original, revised: true };
  return { choice: original, original, revised: false };
};

const sub = (a, b) => a.map((x, i) => x - b[i]);
const fits = (have, cost) => cost.every((c, i) => have[i] >= c);
const limitingOf = (have, cost) => {
  const i = cost.findIndex((c, k) => have[k] < c);
  return i < 0 ? null : { key: RES_KEYS[i], label: RESOURCE_LABELS[RES_KEYS[i]], have: have[i], need: cost[i] };
};
const toObj = (arr) => Object.fromEntries(RES_KEYS.map((k, i) => [k, arr[i]]));
const startOf = (h) => RES_KEYS.map((k) => h.resources[k]);

const parseCycleChoice = (choice) => {
  if (!choice) return null;
  const [action, cap] = choice.split('|');
  return { action, cap: cap || null };
};

const sumOf = (a) => a.reduce((x, y) => x + y, 0);
const listJoin = (arr) => (arr.length <= 1 ? arr.join('') : arr.length === 2 ? `${arr[0]} and ${arr[1]}` : `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}`);
const capNames = (ids) => ids.map((id) => capabilityById(id)?.name).filter(Boolean);

/* Replays every decision for a table, in order, through the cycle given.
   A shock challenge (e.g. cyber) lands after cycle 2, before the final cycle. */
const ledgerFor = (participants, responses, table, uptoCycle = 0, opts = {}) => {
  const h = hospitalForTable(table);
  let have = startOf(h);
  let foundation = false;
  const invested = [];
  const prepared = [];
  const history = [];
  let closed = false;
  const shock = opts.preSignal ? null : shockSignal(responses);
  let shockLoss = null;
  const applyShock = () => {
    if (!shock || shockLoss) return;
    const id = shock.responds[0];
    const amount = invested.includes(id) ? 0 : prepared.includes(id) ? shock.partial : shock.hit;
    const start = startOf(h);
    let tight = -1;
    have.forEach((v, i) => { if (v > 0 && (tight < 0 || v / start[i] < have[tight] / start[tight])) tight = i; });
    shockLoss = RES_KEYS.map((_, i) => (i === tight ? Math.min(have[i], amount) : 0));
    have = have.map((x, i) => x - shockLoss[i]);
    history.push({ source: 'signal', action: 'shock', cost: shockLoss });
  };
  const apply = (action, cap, source) => {
    if (!cap || !capabilityById(cap)) return false;
    if (action === 'invest') {
      if (invested.includes(cap)) return false;
      const cost = prepared.includes(cap) ? completeCost(h.id, cap, foundation) : investCost(h.id, cap, foundation);
      if (!fits(have, cost)) { history.push({ source, action, cap, invalid: true }); return false; }
      have = sub(have, cost);
      history.push({ source, action, cap, completed: prepared.includes(cap), cost });
      invested.push(cap);
      if (prepared.includes(cap)) prepared.splice(prepared.indexOf(cap), 1);
      if (cap === 'care-platform') foundation = true;
      return true;
    }
    if (action === 'prepare') {
      if (invested.includes(cap) || prepared.includes(cap)) return false;
      const cost = prepareCost(h.id, cap);
      if (!fits(have, cost)) { history.push({ source, action, cap, invalid: true }); return false; }
      have = sub(have, cost);
      prepared.push(cap);
      history.push({ source, action, cap, cost });
      return true;
    }
    return false;
  };
  const teachCap = teachCapFor(participants, responses, table);
  const td = teachDecisionFor(responses, table);
  if (td.choice === 'invest' || td.choice === 'prepare') apply(td.choice, teachCap, 'teach');
  else history.push({ source: 'teach', action: td.choice || 'none', cap: teachCap });
  for (let k = 1; k <= uptoCycle; k += 1) {
    if (k === 3) applyShock();
    if (closed) { history.push({ source: `cycle-${k}`, action: 'closed' }); continue; }
    const row = activeProposal(responses, table, `cycle-${k}`);
    const parsed = parseCycleChoice(row?.choice);
    if (!parsed) { history.push({ source: `cycle-${k}`, action: 'none' }); continue; }
    if (parsed.action === 'close') { closed = true; history.push({ source: `cycle-${k}`, action: 'close' }); continue; }
    if (parsed.action === 'hold') { history.push({ source: `cycle-${k}`, action: 'hold' }); continue; }
    apply(parsed.action, parsed.cap, `cycle-${k}`);
  }
  if (uptoCycle >= 2) applyShock();
  return { hospital: h, have, remaining: toObj(have), foundation, invested, prepared, closed, history, teachCap, teach: td, shockLoss };
};
const blankLedger = (h) => ({ hospital: h, have: startOf(h), foundation: false, invested: [], prepared: [], closed: false, shockLoss: null, history: [] });
const ledgerOpts = (k) => (k >= 3 ? {} : { preSignal: true });

/* Board states: committed · complete (prepared, can finish) · available · prepare-only · out.
   Each blocked option explains which earlier decisions used the resource it needs. */
const boardFor = (ledger) => {
  const h = ledger.hospital;
  const start = startOf(h);
  const why = (limit, costAtStart) => {
    if (!limit) return null;
    if (!fits(start, costAtStart)) return 'Beyond this hospital’s starting capacity in this planning period.';
    const idx = RES_KEYS.indexOf(limit.key);
    const by = capNames([...ledger.invested, ...ledger.prepared].filter((id) => investCost(h.id, id)[idx] > 0));
    if (ledger.shockLoss && ledger.shockLoss[idx] > 0) by.push('the cyber incident');
    return by.length ? `Within reach at the start. ${listJoin(by)} used the ${limit.label} it needs.` : null;
  };
  return CAPABILITIES.map((c) => {
    if (ledger.invested.includes(c.id)) return { c, state: 'committed' };
    if (ledger.prepared.includes(c.id)) {
      const cost = completeCost(h.id, c.id, ledger.foundation);
      if (fits(ledger.have, cost)) return { c, state: 'complete', investCost: cost };
      const limit = limitingOf(ledger.have, cost);
      return { c, state: 'out', limit, investCost: cost, prepared: true, cause: why(limit, cost) };
    }
    const inv = investCost(h.id, c.id, ledger.foundation);
    const prep = prepareCost(h.id, c.id);
    if (fits(ledger.have, inv)) return { c, state: 'available', investCost: inv, prepareCost: prep };
    if (fits(ledger.have, prep)) {
      const limit = limitingOf(ledger.have, inv);
      return { c, state: 'prepare-only', investCost: inv, prepareCost: prep, limit, cause: why(limit, investCost(h.id, c.id)) };
    }
    const limit = limitingOf(ledger.have, prep);
    return { c, state: 'out', investCost: inv, prepareCost: prep, limit, cause: why(limit, prep) };
  });
};
const STATE_LABEL = { committed: 'COMMITTED', complete: 'PREPARED · CAN INVEST', available: 'AVAILABLE', 'prepare-only': 'PREPARE ONLY', out: 'OUT OF REACH' };
const STATE_RANK = { committed: 4, complete: 3, available: 3, 'prepare-only': 1, out: 0 };
const canActOn = (row) => ['complete', 'available', 'prepare-only'].includes(row.state);

/* What one decision changed on the board: options closed, opened or made cheaper. */
const diffBoards = (before, after, chosen) => {
  const b = Object.fromEntries(boardFor(before).map((x) => [x.c.id, x]));
  const blocked = [];
  const opened = [];
  const cheaper = [];
  boardFor(after).forEach((x) => {
    const y = b[x.c.id];
    if (!y || x.c.id === chosen || x.state === 'committed' || y.state === 'committed') return;
    const r0 = STATE_RANK[y.state];
    const r1 = STATE_RANK[x.state];
    if (r1 < r0) blocked.push({ c: x.c, to: x.state, limit: x.limit });
    else if (r1 > r0) opened.push({ c: x.c, to: x.state });
    else if (x.investCost && y.investCost && sumOf(x.investCost) < sumOf(y.investCost)) cheaper.push({ c: x.c, saved: sumOf(y.investCost) - sumOf(x.investCost) });
  });
  return { blocked, opened, cheaper };
};

const mainConstraint = (ledger) => {
  const start = startOf(ledger.hospital);
  const ratios = ledger.have.map((v, i) => v / start[i]);
  const low = Math.min(...ratios);
  return listJoin(RES_KEYS.filter((_, i) => ratios[i] === low).map((k) => RESOURCE_LABELS[k]));
};

const signalRow = (responses) => responsesOfType(responses, 'signal', 'room').sort(byTime).slice(-1)[0];
const currentSignal = (responses) => {
  const row = signalRow(responses);
  return row?.choice ? signalById(row.choice) : null;
};
const shockSignal = (responses) => {
  const s = currentSignal(responses);
  return s?.kind === 'shock' ? s : null;
};

/* How a table stands against the challenge. */
const signalStanding = (participants, responses, table, signal) => {
  if (!signal) return null;
  if (signal.kind === 'shock') {
    const before = ledgerFor(participants, responses, table, 2, { preSignal: true });
    const after = ledgerFor(participants, responses, table, 2);
    const id = signal.responds[0];
    const loss = sub(before.have, after.have);
    if (before.invested.includes(id)) return { kind: 'protected', label: 'Protected by the foundation', loss };
    if (before.prepared.includes(id)) return { kind: 'partly', label: 'Partly protected', loss };
    return { kind: 'hit', label: 'Hit by the incident', loss };
  }
  const before = ledgerFor(participants, responses, table, 2);
  const after = ledgerFor(participants, responses, table, 3);
  if (signal.responds.some((id) => before.invested.includes(id))) return { kind: 'in-place', label: 'Already in place', cap: signal.responds.find((id) => before.invested.includes(id)) };
  const responded = signal.responds.find((id) => after.invested.includes(id));
  if (responded) return { kind: 'responded', label: 'Responded in the final cycle', cap: responded };
  if (before.closed) return { kind: 'closed', label: 'Portfolio closed before the challenge' };
  const options = boardFor(before).filter((b) => signal.responds.includes(b.c.id) && (b.state === 'available' || b.state === 'complete'));
  if (options.length) return { kind: 'could', label: 'Could respond', cap: options[0].c.id, prepared: options[0].state === 'complete' };
  const blocked = boardFor(before).find((b) => signal.responds.includes(b.c.id) && b.state !== 'committed');
  return { kind: 'cannot', label: 'Could not respond', limit: blocked?.limit };
};
const lossText = (loss) => RES_KEYS.map((k, i) => (loss?.[i] ? `${loss[i]} ${RESOURCE_LABELS[k]}` : null)).filter(Boolean).join(' and ') || 'nothing';
const standingText = (s, final = false) => {
  if (!s) return { head: 'No challenge yet', detail: '' };
  const n = (id) => capabilityById(id)?.name;
  switch (s.kind) {
    case 'in-place': return { head: `Already in place: ${n(s.cap)}`, detail: 'An earlier commitment covered it.' };
    case 'responded': return { head: `Responded with ${n(s.cap)}`, detail: 'You had the capacity to act in the final cycle.' };
    case 'could': return final
      ? { head: `Could have responded with ${n(s.cap)}`, detail: 'The capacity was there. The table chose another path.' }
      : { head: `Can respond with ${n(s.cap)}${s.prepared ? ' (prepared)' : ''}`, detail: 'Decide in the final cycle.' };
    case 'closed': return { head: 'Portfolio closed before the challenge', detail: 'Your capacity is intact, and the table chose not to act.' };
    case 'cannot': return { head: final ? 'Could not respond' : 'Cannot respond this cycle', detail: s.limit ? `Short on ${s.limit.label}: has ${s.limit.have}, needs ${s.limit.need}.` : 'No responding capability fits the remaining resources.' };
    case 'protected': return { head: 'Protected by the foundation', detail: 'Common standards and a security baseline contained the incident.' };
    case 'partly': return { head: 'Partly protected', detail: `The prepared foundation limited the damage. Recovery cost ${lossText(s.loss)}.` };
    case 'hit': return { head: 'Hit by the incident', detail: `Recovery cost ${lossText(s.loss)}.` };
    default: return { head: s.label || '', detail: '' };
  }
};

/* ---------------------------------------------------------------------
   DEBRIEF ENGINE · outcomes, turning points, building commitments
   --------------------------------------------------------------------- */
const outcomeReport = (participants, responses, t, signal) => {
  const l = ledgerFor(participants, responses, t, 3);
  const h = l.hospital;
  const s = signalStanding(participants, responses, t, signal);
  const score = {}; const plus = {}; const minus = {};
  OUTCOME_DIMS.forEach(([id]) => { score[id] = 0; plus[id] = []; minus[id] = []; });
  l.invested.forEach((cid) => Object.entries(OUTCOME_VALUE[cid] || {}).forEach(([d, v]) => { score[d] += v; plus[d].push(capabilityById(cid).name); }));
  if (l.prepared.length) { score.adaptability += 1; plus.adaptability.push(`${listJoin(capNames(l.prepared))} (prepared)`); }
  if (Math.min(...l.have) >= 2) { score.adaptability += 1; plus.adaptability.push('capacity kept in every resource'); }
  const zero = RES_KEYS.filter((_, i) => l.have[i] === 0).map((k) => RESOURCE_LABELS[k]);
  if (zero.length) { score.resilience -= 1; minus.resilience.push(`${listJoin(zero)} spent to zero`); }
  if (s?.kind === 'hit') { score.resilience -= 1; minus.resilience.push('the cyber incident'); }
  const status = (v) => (v >= 3 ? 'moved' : v >= 1 ? 'partly' : v < 0 ? 'weakened' : 'unchanged');
  const dims = OUTCOME_DIMS.map(([id, label, desc]) => ({
    id, label, desc, status: status(score[id]), priority: HOSPITAL_PRIORITY[h.id].includes(id),
    why: [plus[id].length ? `Moved by ${listJoin(plus[id])}.` : '', minus[id].length ? `Held back by ${listJoin(minus[id])}.` : ''].filter(Boolean).join(' ') || 'No decision moved this.',
  }));
  const moved = dims.filter((d) => d.status === 'moved').map((d) => d.label.toLowerCase());
  const headline = moved.length ? `You moved ${listJoin(moved)}.` : 'Your hospital looks much as it did.';
  const unmet = dims.find((d) => d.priority && d.status !== 'moved');
  const priorityLine = unmet ? `${unmet.label} matters most to this hospital, and it is ${OUTCOME_STATUS[unmet.status].toLowerCase()}.` : 'You moved what matters most to this hospital.';
  return { l, h, dims, headline, priorityLine };
};

const stepsFor = (participants, responses, t) => {
  const steps = [];
  let prev = blankLedger(hospitalForTable(t));
  for (let k = 0; k <= 3; k += 1) {
    const L = ledgerFor(participants, responses, t, k, { preSignal: true });
    const src = k === 0 ? 'teach' : `cycle-${k}`;
    const ev = L.history.filter((x) => x.source === src).slice(-1)[0];
    if (ev && (ev.action === 'invest' || ev.action === 'prepare') && !ev.invalid) steps.push({ k, action: ev.action, cap: ev.cap, diff: diffBoards(prev, L, ev.cap) });
    prev = L;
  }
  return steps;
};
const describeStep = (st) => `${st.action === 'invest' ? 'invested in' : 'prepared'} ${capabilityById(st.cap)?.name} ${st.k === 0 ? 'in the teaching round' : `in cycle ${st.k}`}`;

const turningPoints = (participants, responses, t, signal) => {
  const steps = stepsFor(participants, responses, t);
  const out = [];
  const closer = [...steps].sort((a, b) => b.diff.blocked.length - a.diff.blocked.length)[0];
  if (closer && closer.diff.blocked.length) {
    const lim = [...new Set(closer.diff.blocked.map((x) => x.limit?.label).filter(Boolean))];
    out.push({ title: 'The decision that closed the most doors', text: `When you ${describeStep(closer)}, ${listJoin(closer.diff.blocked.map((x) => x.c.name))} became harder to reach${lim.length ? `, because ${listJoin(lim)} ran short` : ''}.` });
  } else {
    out.push({ title: 'No decision closed a door', text: 'Every option you left behind was still within reach. What you did not pursue was a choice, not a constraint.' });
  }
  const gain = (st) => st.diff.cheaper.length + st.diff.opened.length;
  const opener = [...steps].sort((a, b) => gain(b) - gain(a))[0];
  if (opener && gain(opener)) {
    out.push({ title: 'The decision that opened the most doors', text: `When you ${describeStep(opener)}, ${listJoin([...opener.diff.cheaper, ...opener.diff.opened].map((x) => x.c.name))} became cheaper or easier to reach.` });
  } else {
    out.push({ title: 'No decision opened a door', text: 'Every commitment used capacity. None made a later capability cheaper.' });
  }
  if (signal) {
    const st = standingText(signalStanding(participants, responses, t, signal), true);
    out.push({ title: `When the challenge arrived: ${signal.title}`, text: `${st.head}. ${st.detail}` });
  }
  const l = ledgerFor(participants, responses, t, 3);
  const zero = RES_KEYS.filter((_, i) => l.have[i] === 0).map((k) => RESOURCE_LABELS[k]);
  out.push({ title: 'What your remaining capacity means', text: zero.length
    ? `You spent ${listJoin(zero)} to zero. Anything new that needs ${zero.length > 1 ? 'them' : 'it'} must wait for the next planning period.`
    : `You kept at least ${Math.min(...l.have)} of every resource. That is your room to respond to what comes next.` });
  return out;
};

const lockReport = (l) => ({
  now: l.invested.map((id) => ({ name: capabilityById(id).name, text: capabilityById(id).early })),
  protect: l.prepared.map((id) => ({ name: capabilityById(id).name, text: capabilityById(id).prepare.pkg })),
  open: l.invested.map((id) => ({ name: capabilityById(id).name, text: capabilityById(id).open })),
});

const crossPrompt = (participants, responses) => {
  const L = activeTables(participants).map((t) => ({ t, l: ledgerFor(participants, responses, t, 3) }));
  for (const c of CAPABILITIES) {
    const byHospital = [...new Map(L.filter((x) => x.l.invested.includes(c.id)).map((x) => [x.l.hospital.id, x])).values()];
    if (byHospital.length >= 2) {
      const paid = (l) => sumOf(l.history.filter((e) => e.cap === c.id && !e.invalid && (e.action === 'invest' || e.action === 'prepare')).reduce((acc, e) => acc.map((v, i) => v + (e.cost?.[i] || 0)), [0, 0, 0, 0]));
      const costs = byHospital.map((x) => ({ x, cost: paid(x.l) })).sort((a, b) => a.cost - b.cost);
      const lo = costs[0]; const hi = costs[costs.length - 1];
      if (lo.cost !== hi.cost) return `Table ${lo.x.t} (${lo.x.l.hospital.name}) paid ${lo.cost} for ${c.name}. Table ${hi.x.t} (${hi.x.l.hospital.name}) paid ${hi.cost}. ${COST_REASON[hi.x.l.hospital.id]} What else made the same capability cost more?`;
    }
  }
  if (L.length >= 2) {
    const s = [...L].sort((a, b) => b.l.invested.length - a.l.invested.length);
    const a = s[0]; const z = s[s.length - 1];
    if (a.l.invested.length !== z.l.invested.length) return `Table ${a.t} committed to ${a.l.invested.length} capabilities. Table ${z.t} committed to ${z.l.invested.length}. Was that ambition, or starting point?`;
  }
  return 'Look at a table with a different hospital. What would your portfolio have looked like from their starting point?';
};

const rippleFor = (cap, choice) => {
  if (choice === 'invest') return cap.invest;
  if (choice === 'prepare') return { headline: 'The option is prepared, not yet committed.', unit: cap.prepare.notYet, facility: cap.prepare.pkg, system: cap.prepare.ready, flow: 'Care settings are unchanged for now.' };
  if (choice === 'hold') return { headline: 'Capacity is kept for what comes next.', unit: 'Current workflows continue.', facility: 'No change to the environment yet.', system: 'Resources remain available for later decisions.', flow: cap.exposure };
  return { headline: 'No table decision was recorded.', unit: 'No change applied.', facility: 'No change applied.', system: 'No change applied.', flow: 'No change applied.' };
};
const CLOSING_LINE = {
  invest: 'You chose a capability. You changed a care model. That changed the hospital.',
  prepare: 'You designed for a future you have not committed to yet.',
  hold: 'You kept your capacity. The need is still there, and so is capacity to respond, if it is the right kind.',
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
    return (data || []).filter((p) => p.persona !== 'facilitator');
  }
  return (loadLocal(c)?.participants || []).filter((p) => p.persona !== 'facilitator');
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
   JOURNEY NAVIGATION
   --------------------------------------------------------------------- */
const JOURNEY = [
  ['lobby', 'Join the room'], ['assignments', 'Hospital reveal'], ['context', 'Inherited reality'],
  ['tension', 'Strategic tension'], ['resources', 'Starting capacity'], ['discussion', 'Table discussion'],
  ['brief_reveal', 'Strategic brief'], ['brief_read', 'Read your lens'], ['brief_share', 'Share perspectives'],
  ['alignment', 'Align the table'], ['ready', 'Ready to decide'],
  ['cap_portfolio', 'Capability portfolio'], ['cap_nominate', 'Choose a teaching capability'], ['cap_results', 'Approve teaching capabilities'],
  ['t_reveal', 'Your capability'], ['t_instinct', 'First instinct'], ['t_cost', 'Resource cost'], ['t_mission', 'Mission fit'],
  ['t_change_vote', 'What is hard to change?'], ['t_design', 'Design consequence'], ['t_discuss', 'Reveal instincts'],
  ['t_decision', 'Table decision'], ['t_checkpoint', 'Teaching checkpoint'], ['t_scale_vote', 'Greatest consequence'],
  ['t_scale_reveal', 'Scale reveal'], ['t_continuum_vote', 'Where does care go?'], ['t_continuum_reveal', 'Continuum reveal'],
  ['t_ripple', 'Your hospital changed'],
  ['p_open', 'Portfolio board opens'], ['p1_board', 'Cycle 1 · board'], ['p1_decide', 'Cycle 1 · decide'],
  ['p2_board', 'Cycle 2 · board'], ['p2_decide', 'Cycle 2 · decide'], ['p_signal', 'The challenge'],
  ['p3_board', 'Cycle 3 · board'], ['p3_decide', 'Cycle 3 · decide'],
  ['f_future', 'Five years on'], ['f_turns', 'Turning points'], ['f_locks', 'What the building locks in'],
  ['f_compare', 'Side-by-side'], ['f_debrief', 'The conversation'],
];
const LEGACY_JOURNEY_PHASES = {
  cap_select: 'cap_results', cap_confirm: 'cap_results', cap_preview: 'cap_results', complete: 't_checkpoint',
  vc_reveal: 't_reveal', vc_instinct: 't_instinct', vc_cost: 't_cost', vc_mission: 't_mission', vc_design: 't_design',
  vc_discuss: 't_discuss', vc_table_decision: 't_decision', vc_portfolio: 't_checkpoint', vc_scale_vote: 't_scale_vote',
  vc_scale_reveal: 't_scale_reveal', vc_continuum_vote: 't_continuum_vote', vc_continuum_reveal: 't_continuum_reveal', vc_ripple: 't_ripple',
};
const phaseIndex = (phase) => JOURNEY.findIndex(([id]) => id === (LEGACY_JOURNEY_PHASES[phase] || phase));
const priorPhase = (phase) => { const i = phaseIndex(phase); return i > 0 ? JOURNEY[i - 1][0] : null; };
const nextPhase = (phase) => { const i = phaseIndex(phase); return i >= 0 && i < JOURNEY.length - 1 ? JOURNEY[i + 1][0] : null; };

const PULLBACK_LEVELS = [
  { id: 'unit', number: '01', title: 'UNIT', subtitle: 'Where care is delivered' },
  { id: 'facility', number: '02', title: 'FACILITY', subtitle: 'What this hospital must provide' },
  { id: 'system', number: '03', title: 'SYSTEM', subtitle: 'What can be shared across sites' },
];
const CONTINUUM = [['HOME', 'Monitoring, consultation and recovery'], ['COMMUNITY', 'Access points and local support'], ['AMBULATORY', 'Diagnosis, treatment and follow-up'], ['HOSPITAL', 'Acute and complex care'], ['POST-ACUTE', 'Transition, rehabilitation and continuity']];
const CONTINUUM_OPTIONS = [...CONTINUUM, ['STAYS', 'It does not move care']];

const EXTRA_CSS = `
.tcards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin:22px 0}
.tcard{background:#fff;border:1px solid rgba(10,34,44,.1);border-top:5px solid #00a6a6;padding:18px;min-width:0}
.tcard>img{width:calc(100% + 36px);margin:-18px -18px 14px;height:120px;object-fit:cover;display:block;max-width:none}
.tcard .tlabel{display:block;font-size:.7rem;font-weight:900;letter-spacing:.1em;color:#6f2c91;margin-bottom:4px}
.tcard h3{margin:2px 0 8px;font-size:1.15rem}.tcard p{margin:6px 0;font-size:.92rem;line-height:1.4}
.tcard dl{margin:8px 0 0;display:grid;gap:6px}.tcard dt{font-size:.68rem;font-weight:900;letter-spacing:.1em;opacity:.7}.tcard dd{margin:0 0 4px;font-size:.9rem;line-height:1.35}
.costline{display:inline-grid;grid-template-columns:repeat(4,auto);gap:4px 10px;font-weight:900}.costline i{font-style:normal;display:flex;flex-direction:column;align-items:flex-start}.costline small{font-size:.6rem;letter-spacing:.06em;opacity:.65;font-weight:700;text-transform:uppercase}
.cost-pair{display:grid;gap:8px;margin:10px 0}.cost-pair>div{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 12px;background:#f7f3ee}.cost-pair b{font-size:.75rem;letter-spacing:.08em}
.st{display:inline-flex;padding:4px 8px;border-radius:999px;font-size:.64rem;font-weight:900;letter-spacing:.08em;white-space:nowrap}
.st-committed{background:#0a222c;color:#fff}.st-complete{background:#efe4f4;color:#50226a}.st-available{background:#d9f2ef;color:#075b59}.st-prepare-only{background:#fff0c9;color:#654800}.st-out{background:#ece9e5;color:#5d5a56}
.board-list{display:grid;gap:6px;margin-top:10px}.board-list>div{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:.86rem;padding:6px 0;border-bottom:1px solid rgba(10,34,44,.07)}
.signal-tag{display:inline-flex;margin-left:6px;padding:3px 7px;border-radius:999px;background:#f0b323;color:#0a222c;font-size:.62rem;font-weight:900;letter-spacing:.06em}
.res-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:10px 0}.res-strip>div{background:#f7f3ee;padding:8px;text-align:center}.res-strip small{display:block;font-size:.6rem;letter-spacing:.06em;text-transform:uppercase;opacity:.7}.res-strip b{font-size:1.05rem}
.approve-chips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.approve-chips button{border:1px solid rgba(10,34,44,.18);background:#fff;border-radius:999px;padding:7px 11px;font:inherit;font-size:.8rem;font-weight:700;cursor:pointer;color:#0a222c}.approve-chips button.active{background:#49205d;color:#fff;border-color:#49205d}
.dup-note{padding:12px 14px;background:#fff0c9;color:#654800;font-weight:700;margin:10px 0}
.compare-table{width:100%;border-collapse:collapse;background:#fff;margin:20px 0;font-size:.9rem}.compare-table th{background:#0a222c;color:#fff;text-align:left;padding:10px;font-size:.72rem;letter-spacing:.08em}.compare-table td{padding:10px;border-bottom:1px solid rgba(10,34,44,.08);vertical-align:top}.compare-table tr.sel td{background:#f2eaf5}.compare-table tr{cursor:pointer}
.revised-tag{display:inline-flex;margin-left:6px;padding:2px 6px;background:#00a6a6;color:#fff;font-size:.6rem;font-weight:900;letter-spacing:.08em;border-radius:4px}
.signal-hero{background:#0a222c;color:#fff;padding:clamp(24px,4vw,48px);margin:20px 0}.signal-hero h1{color:#fff}.signal-hero p{font-size:clamp(1.05rem,1.8vw,1.35rem);max-width:760px}
.signal-pick{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin:20px 0}.signal-pick button{text-align:left;background:#fff;border:2px solid rgba(10,34,44,.12);padding:20px;font:inherit;cursor:pointer;color:#0a222c}.signal-pick button:hover{border-color:#6f2c91}.signal-pick b{display:block;font-size:1.15rem;margin-bottom:6px}
.pboard{display:grid;gap:10px;margin:14px 0}.pboard button{width:100%;text-align:left;background:#fff;border:2px solid rgba(10,34,44,.12);border-radius:10px;padding:12px 14px;font:inherit;color:#0a222c;cursor:pointer}.pboard button.selected{border-color:#6f2c91;background:#f7f1fa}.pboard button:disabled{cursor:default;opacity:.92}
.pboard .row1{display:flex;justify-content:space-between;align-items:center;gap:8px}.pboard b{font-size:1rem}.pboard p{margin:6px 0 0;font-size:.84rem;line-height:1.35}.pboard .limit{color:#762b38;font-weight:700}
.action-row{display:grid;gap:8px;margin-top:12px}
.status-card{padding:16px;background:#f7f3ee;border-left:5px solid #6f2c91;margin:12px 0}.status-card b{display:block;margin-bottom:4px}
.reflect textarea{width:100%;min-height:80px;margin-top:8px}
.challenge-picker{background:#fff;padding:16px 18px;margin:18px 0;border-left:5px solid #f0b323}.challenge-picker p{margin:6px 0}.small-note{font-size:.82rem;opacity:.75}
.dim-list{display:grid;gap:6px;margin-top:10px}.dim{display:grid;grid-template-columns:1fr auto;gap:2px 8px;padding:8px 10px;background:#f7f3ee;border-left:4px solid #c9c3bb}.dim span{font-weight:800;font-size:.88rem}.dim em{font-style:normal;margin-left:6px;font-size:.58rem;font-weight:900;letter-spacing:.08em;color:#6f2c91}.dim b{font-size:.64rem;letter-spacing:.08em;align-self:center}.dim small{grid-column:1/-1;font-size:.78rem;opacity:.8;line-height:1.35}.dim-moved{border-color:#00a6a6}.dim-partly{border-color:#f0b323}.dim-weakened{border-color:#b54a5a;background:#f6eaec}
.turn{padding:10px 12px;background:#f7f3ee;margin:8px 0;border-left:4px solid #6f2c91;font-size:.9rem;line-height:1.4}.turn b{display:block;font-size:.66rem;letter-spacing:.08em;margin-bottom:4px;color:#49205d}
.lock-block{margin:10px 0}.lock-block>b{display:block;font-size:.66rem;letter-spacing:.08em;color:#49205d;margin-bottom:4px}.lock-block p{margin:4px 0;font-size:.88rem;line-height:1.35}
.cause{font-size:.8rem;color:#762b38;line-height:1.35}
.pcard{background:#fff;border:2px solid rgba(10,34,44,.12);border-radius:10px;overflow:hidden}.pcard.selected{border-color:#6f2c91;background:#f7f1fa}.pboard .pcard>button{border:0;border-radius:0;background:transparent;margin:0}
.for-you{font-weight:700;color:#49205d;line-height:1.35}.pcost{opacity:.85}
.pcard details,.phone-details{padding:0 14px 10px;font-size:.84rem;line-height:1.4}.pcard summary,.phone-details summary{cursor:pointer;font-weight:900;font-size:.68rem;letter-spacing:.1em;color:#6f2c91;padding:6px 0}.phone-details{padding:10px 0 0}
.moment{font-size:1.02rem;line-height:1.45;font-style:italic;border-left:4px solid #f0b323;padding:6px 0 6px 12px;margin:10px 0}
.need-line{font-weight:700;color:#0a222c;background:#fff6dd;padding:8px 10px;border-radius:6px}
.role-lines p{margin:6px 0;font-size:.88rem;line-height:1.35}.role-lines b{display:block;font-size:.66rem;letter-spacing:.08em;color:#6f2c91}
.building-q{font-weight:800;font-size:1.05rem;color:#49205d;margin:8px 0 18px}
.room-actions.left{justify-content:flex-start}
.dim-lens{outline:2px solid #6f2c91}
.their-need{margin:8px 0 0;font-size:.82rem}.their-need b{display:block;font-size:.62rem;letter-spacing:.08em;color:#6f2c91}
@media(max-width:800px){.compare-table{display:block;overflow-x:auto}.res-strip{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;


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
        <style>{`
          ${EXTRA_CSS}
          /* ---- LAYOUT GUARDS (display only) ---- */
          html,body,#root{max-width:100%;overflow-x:hidden}*,*:before,*:after{box-sizing:border-box}.app{max-width:100%;overflow-x:hidden}.app img{max-width:100%}.room-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:12px;max-width:100%}.room-actions .button{max-width:100%;white-space:normal;text-align:center}.journey-nav{padding-left:clamp(12px,3vw,48px)!important;padding-right:clamp(12px,3vw,48px)!important;max-width:100%}.app h1{overflow-wrap:break-word}
          /* ---- 1.6.3 PHONE FIT (display only) ---- */
          .app.compact{width:100%;max-width:560px;margin:0 auto;min-width:0;padding-left:16px;padding-right:16px;padding-bottom:calc(24px + env(safe-area-inset-bottom))}
          .app.compact>header{gap:8px;min-width:0}.app.compact .build{font-size:.62rem;white-space:nowrap}
          .app.compact .phone-card{width:100%;min-width:0;padding:20px 16px;overflow:hidden}
          .app.compact .phone-card *{min-width:0;max-width:100%;overflow-wrap:anywhere;word-break:normal}
          .app.compact .eyebrow{font-size:.66rem;letter-spacing:.1em;line-height:1.4;white-space:normal}
          .app.compact h1{font-size:clamp(1.55rem,7vw,2.3rem)!important;line-height:1.08!important;margin:10px 0 12px!important;letter-spacing:-.01em}
          .app.compact h2{font-size:clamp(1.2rem,5.5vw,1.6rem)!important;line-height:1.15}
          .app.compact h3{font-size:.78rem;letter-spacing:.08em;margin:18px 0 6px}
          .app.compact p,.app.compact li,.app.compact blockquote{font-size:.95rem;line-height:1.45}
          .app.compact blockquote{margin:16px 0 0;padding:14px 16px;border-left:4px solid #f0b323;background:#f7f3ee}
          .app.compact .phone-hospital-image,.app.compact .vc-phone img{width:100%!important;height:auto!important;max-height:190px;aspect-ratio:16/9;object-fit:cover;display:block;margin:10px 0 14px}
          .app.compact .brief-question{padding:14px;margin-top:14px}
          .app.compact .phone-resources{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px;margin:14px 0}
          .app.compact .phone-resources>div{display:flex;flex-direction:column;gap:4px;padding:12px;background:#fff;border:1px solid rgba(10,34,44,.1)}
          .app.compact .phone-resources span{font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;opacity:.75}
          .app.compact .phone-resources b{font-size:1.1rem;white-space:nowrap}
          .app.compact .share-priorities{display:grid!important;grid-template-columns:1fr!important;gap:8px;margin:14px 0}
          .app.compact .share-priorities>span{display:block;padding:12px 14px;background:#fff;border:1px solid rgba(10,34,44,.1);font-size:.92rem;line-height:1.4}
          .app.compact .phone-choice-stack,.app.compact .phone-vote-grid{display:grid!important;grid-template-columns:1fr!important;gap:10px}
          .app.compact .phone-choice-stack button,.app.compact .phone-vote-grid button{width:100%;padding:14px 16px;text-align:left;white-space:normal}
          .app.compact .phone-choice-stack button b{display:block;font-size:1.05rem}.app.compact .phone-choice-stack button span{display:block;font-size:.88rem;margin-top:4px}
          .app.compact .phone-cap-grid button{width:100%;min-width:0}.app.compact .phone-cap-grid img{max-width:96px;height:auto;object-fit:cover}
          .app.compact .phone-scale-row{display:flex!important;align-items:center;gap:12px}.app.compact .phone-scale-thumb{width:64px!important;height:48px!important;flex:0 0 64px}
          .app.compact .submission-confirm,.app.compact .submitted-mark{display:flex;align-items:center;justify-content:center;gap:6px;text-align:center;font-size:.85rem;line-height:1.35;padding:12px;margin-top:14px}
          .app.compact .button{width:100%;justify-content:center;white-space:normal}
          .app.compact .alignment-badge,.app.compact .decision-tag{white-space:nowrap}
          .app.compact .toast{left:12px!important;right:12px!important;max-width:calc(100% - 24px)}
          @media(max-width:900px){.room-actions{justify-content:stretch}.room-actions .button{width:100%}}
          @media(max-width:560px){.journey-nav{gap:6px!important;padding-top:6px!important;padding-bottom:6px!important}.journey-nav button{padding:8px 10px!important;font-size:.82rem}.journey-nav .live-pill{font-size:.72rem}.player-review-note{font-size:.72rem;padding:8px 10px}.journey-panel{padding:16px}}
          .resource-actions{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px!important;align-items:stretch}.resource-actions>div{display:flex!important;flex-direction:column;gap:6px;padding:18px;min-width:0}.resource-actions b{display:block;white-space:normal;line-height:1}.resource-actions span{display:block;line-height:1.35;overflow-wrap:anywhere}
          .journey-nav{position:sticky;top:0;z-index:50;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;background:color-mix(in srgb,#f5f2ed 94%,transparent);backdrop-filter:blur(10px)}.journey-nav button{border:1px solid rgba(10,34,44,.18);background:#fff;color:#0a222c;border-radius:999px;padding:10px 14px;display:flex;align-items:center;gap:8px;font:inherit;font-weight:800;cursor:pointer}.journey-nav button:disabled{opacity:.35;cursor:not-allowed}.journey-nav .live-pill{color:#fff;background:#49205d;border-color:#49205d}
          .journey-scrim{position:fixed;inset:0;z-index:100;background:rgba(4,18,25,.56);display:flex;justify-content:flex-end}.journey-panel{width:min(440px,100%);height:100%;overflow:auto;background:#f7f4ef;padding:22px;box-shadow:-20px 0 60px rgba(0,0,0,.22)}.journey-panel header{display:flex;align-items:flex-start;justify-content:space-between}.journey-panel h2{margin:4px 0 6px}.journey-panel p{margin:0 0 20px}.journey-panel ol{list-style:none;margin:0;padding:0;display:grid;gap:8px}.journey-panel li button{width:100%;text-align:left;border:1px solid rgba(10,34,44,.13);background:#fff;padding:12px 14px;border-radius:12px;display:grid;grid-template-columns:34px 1fr;gap:10px;color:#0a222c;cursor:pointer}.journey-panel li button.current{color:#fff;background:#49205d}.journey-panel li button:disabled{opacity:.38;cursor:not-allowed}.journey-panel small{display:block;opacity:.7}.journey-close{border:0;background:transparent;cursor:pointer;padding:8px}
          .pullback-hero{padding:4vh 0}.pullback-hero h1{max-width:900px}.pullback-intro{font-size:clamp(1.05rem,1.7vw,1.4rem);max-width:900px}.scale-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin:34px 0}.scale-card{padding:24px;background:#fff;border-top:7px solid #f0b323;box-shadow:0 12px 34px rgba(17,32,40,.09)}.scale-card:nth-child(2){border-color:#00a6a6}.scale-card:nth-child(3){border-color:#49205d}.scale-card>span{font-weight:900;opacity:.5}.scale-card h2{margin:20px 0 4px}.scale-card h3{margin:0 0 16px;font-size:1rem}.scale-card p{margin:0}.continuum-band{margin:30px 0;padding:28px;background:#49205d;color:#fff}.continuum-track{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:2px;margin-top:20px}.continuum-step{padding:18px 14px;background:rgba(255,255,255,.1);position:relative}.continuum-step:not(:last-child):after{content:'→';position:absolute;right:-9px;top:50%;z-index:2;font-weight:900}.continuum-step b,.continuum-step span{display:block}.continuum-step span{font-size:.85rem;margin-top:7px;opacity:.82}.system-equation{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:24px;margin:24px 0}.system-equation>div{padding:24px;background:#fff}.system-equation strong{font-size:2rem;color:#f0b323}.ripple-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:28px 0}.ripple-card{padding:20px;background:#fff;border-left:5px solid #00a6a6}.ripple-card b{display:block;margin-bottom:10px}.ripple-table{margin:20px 0 36px;padding:22px;background:#eee8e1}.ripple-table h3{margin:0 0 4px}.player-review-note{padding:10px 14px;background:#f0b323;color:#0a222c;text-align:center;font-weight:800}

          .vote-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin:32px 0}.vote-card{border:2px solid rgba(10,34,44,.14);background:#fff;padding:24px;text-align:left;color:#0a222c;cursor:pointer;min-height:150px}.vote-card:hover,.vote-card.selected{border-color:#6f2c91;box-shadow:0 12px 30px rgba(73,32,93,.14)}.vote-card b,.vote-card span{display:block}.vote-card b{font-size:1.35rem}.vote-card span{margin-top:10px}.live-votes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:24px 0}.live-votes>div{background:#fff;padding:18px;border-bottom:6px solid #6f2c91}.live-votes strong{display:block;font-size:2rem}.reveal-stack{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin:28px 0}.reveal-stack article{background:#fff;padding:0 0 24px;border-top:7px solid #f0b323;overflow:hidden}.reveal-stack article>span,.reveal-stack article>h2,.reveal-stack article>h3,.reveal-stack article>p{margin-left:24px;margin-right:24px}.scale-thumb{width:100%;height:150px;object-fit:cover;display:block;margin:0 0 18px!important}.phone-scale-thumb{width:72px;height:54px;object-fit:cover;border-radius:8px;flex:0 0 auto}.phone-scale-row{display:flex!important;align-items:center;gap:12px}.phone-scale-row>span{display:block}.reveal-stack article:nth-child(2){border-color:#00a6a6}.reveal-stack article:nth-child(3){border-color:#49205d}.reveal-stack h2{margin:10px 0 4px}.aha-line{font-size:clamp(1.35rem,2.3vw,2.2rem);font-weight:900;line-height:1.15;padding:24px;border-left:8px solid #f0b323;background:#fff;margin:28px 0}.continuum-vote{grid-template-columns:repeat(5,minmax(0,1fr))}.hospital-changed{background:#092d3a;color:#fff;padding:clamp(24px,4vw,52px);margin:24px 0}.hospital-changed h2{color:#fff}.consequence-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:22px}.consequence-grid article{background:rgba(255,255,255,.1);padding:18px}.consequence-grid b{display:block;color:#f0b323;margin-bottom:8px}.phone-vote-grid{display:grid;gap:10px;margin:20px 0}.phone-vote-grid button{width:100%;padding:16px;text-align:left;border:2px solid rgba(10,34,44,.15);background:#fff;color:#0a222c;border-radius:10px;font:inherit}.phone-vote-grid button.selected{border-color:#6f2c91;background:#f2eaf5}.phone-vote-grid b,.phone-vote-grid span{display:block}.phone-vote-grid span{font-size:.88rem;margin-top:4px}.submitted-mark{padding:12px;background:#dff3ea;color:#174d3c;font-weight:800;text-align:center}

          .alignment-badge{display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;font-size:.72rem;font-weight:900;letter-spacing:.08em}.alignment-strong{background:#dff3ea;color:#174d3c}.alignment-mixed{background:#fff0c9;color:#654800}.alignment-split{background:#f3e6e8;color:#762b38}.visual-table-grid{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))!important}.visual-table-card img{height:150px!important}.multi-table-compact{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin:24px 0}.multi-table-compact>article{background:#fff;border:1px solid rgba(10,34,44,.12);overflow:hidden;display:grid;grid-template-columns:112px 1fr;min-height:112px}.multi-table-compact img{width:112px;height:100%;object-fit:cover}.multi-table-compact .compact-body{padding:14px;min-width:0}.multi-table-compact h3{margin:4px 0 8px;font-size:1rem}.multi-table-compact p{margin:5px 0;font-size:.88rem}.decision-tag{display:inline-flex;padding:4px 8px;border-radius:999px;font-size:.7rem;font-weight:900;letter-spacing:.08em}.decision-invest{background:#d9f2ef;color:#075b59}.decision-adapt{background:#efe4f4;color:#50226a}.decision-preserve{background:#fff0c9;color:#654800}.analysis-controls{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}.analysis-controls button{border:1px solid rgba(10,34,44,.16);background:#fff;color:#0a222c;border-radius:999px;padding:9px 14px;font:inherit;font-weight:800;cursor:pointer}.analysis-controls button.active{background:#49205d;color:#fff}.analysis-groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.analysis-group{background:#fff;padding:16px;border-top:5px solid #00a6a6}.analysis-group h3{margin:0 0 10px}.mini-bars{display:grid;gap:7px}.mini-bars div{display:grid;grid-template-columns:1fr auto;gap:8px;font-size:.86rem}.final-compare{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;margin:24px 0}.compare-card{background:#fff;border:2px solid transparent;padding:0;overflow:hidden;text-align:left;color:#0a222c;cursor:pointer;font:inherit}.compare-card.selected{border-color:#6f2c91;box-shadow:0 14px 34px rgba(73,32,93,.18)}.compare-card img{width:100%;height:130px;object-fit:cover}.compare-card-body{padding:16px}.compare-card h3{margin:5px 0}.compare-card p{font-size:.9rem}.compare-detail{background:#092d3a;color:#fff;padding:clamp(22px,4vw,46px);margin-top:20px}.compare-detail h2{color:#fff}.compare-detail .consequence-grid article{background:rgba(255,255,255,.1)}
          @media(max-width:800px){.resource-actions,.scale-grid,.ripple-grid,.vote-grid,.live-votes,.reveal-stack,.continuum-vote,.consequence-grid,.final-compare{grid-template-columns:1fr!important}.multi-table-compact>article{grid-template-columns:88px 1fr}.multi-table-compact img{width:88px}.continuum-track{grid-template-columns:1fr}.continuum-step:not(:last-child):after{content:'↓';right:18px;top:auto;bottom:-12px}.system-equation{grid-template-columns:1fr}.system-equation strong{text-align:center}.journey-nav{padding:8px 0}.journey-nav button{padding:9px 11px}.journey-nav .nav-label{display:none}}
        `}</style>
        <header>
          <Brand />
          <span className="build">{BUILD_LABEL}</span>
        </header>
        {children}
        <footer>Stantec Healthcare · Strategy before technology</footer>
      </main>
    );
  }
  function JourneyPanel({ phase, maxPhase, onGo, onClose, participant = false }) {
    const maxIndex = Math.max(0, phaseIndex(maxPhase));
    return (
      <div className="journey-scrim" role="presentation" onClick={onClose}>
        <aside className="journey-panel" role="dialog" aria-modal="true" aria-label="Journey navigation" onClick={(e) => e.stopPropagation()}>
          <header><div><div className="eyebrow">YOUR JOURNEY</div><h2>Return to any completed screen.</h2><p>{participant ? 'Reviewing does not move the room or change saved decisions.' : 'Returning does not erase decisions. Changing a response updates the live result.'}</p></div><button className="journey-close" type="button" onClick={onClose} aria-label="Close"><X /></button></header>
          <ol>{JOURNEY.map(([id,label],i)=><li key={id}><button type="button" className={id===phase?'current':''} disabled={i>maxIndex} onClick={()=>onGo(id)}><b>{String(i+1).padStart(2,'0')}</b><span>{label}<small>{id===phase?'CURRENT SCREEN':i<=maxIndex?'AVAILABLE':'NOT REACHED'}</small></span></button></li>)}</ol>
        </aside>
      </div>
    );
  }
  function JourneyNav({ phase, maxPhase = phase, onGo, participant = false, livePhase }) {
    const [open,setOpen]=useState(false); const back=priorPhase(phase);
    return <><nav className="journey-nav"><button type="button" disabled={!back} onClick={()=>back&&onGo(back)}><ArrowLeft size={17}/><span className="nav-label">Back</span></button><button type="button" onClick={()=>setOpen(true)}><Layers3 size={17}/><span>Journey</span><ChevronDown size={15}/></button>{participant&&phase!==livePhase?<button type="button" className="live-pill" onClick={()=>onGo(livePhase)}><RotateCcw size={16}/>Return live</button>:<span/>}</nav>{participant&&phase!==livePhase&&<div className="player-review-note">REVIEWING AN EARLIER SCREEN · THE ROOM IS CURRENTLY ON {JOURNEY.find(x=>x[0]===livePhase)?.[1]?.toUpperCase()||'ANOTHER STEP'}</div>}{open&&<JourneyPanel phase={phase} maxPhase={maxPhase} onGo={(id)=>{onGo(id);setOpen(false)}} onClose={()=>setOpen(false)} participant={participant}/>}</>;
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
              <img src={h.image} alt={h.name} onError={(e)=>imageFallback(e)} />
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

function Lobby({ session, participants, onAdvance, responses = [], facSave }) {
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
              <img src={g.h.image} alt={g.h.name} onError={(e)=>imageFallback(e)} />
              <div className="visual-card-copy">
                <span>TABLE {g.n}</span>
                <h3>{g.h.name}</h3>
                <b>{g.count} joined</b>
              </div>
            </article>
          ))}
        </section>
      )}
      <ChallengePicker responses={responses} facSave={facSave} />
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
              <img src={h.image} alt={h.name} onError={(e)=>imageFallback(e)} />
              <div><span>TABLE {n}</span><h2>{h.name}</h2><p>{NEED_LINE[h.id]}</p></div>
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
              <img src={h.image} alt={h.name} onError={(e)=>imageFallback(e)} />
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
            <div><b>PREPARE</b><span>Buy a defined enabling package. Keep the option open.</span></div>
            <div><b>HOLD</b><span>Keep capacity for what comes next.</span></div>
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
        <p>Next: six capabilities, limited capacity, and one capability your table explores in depth.</p>
        <Button onClick={() => onAdvance('cap_portfolio')}>OPEN THE CAPABILITY PORTFOLIO <ArrowRight size={18} /></Button>
      </section>
    </Shell>
  );
}

/* ---------------------------------------------------------------------
   SHARED PIECES FOR ROUND 2.0
   --------------------------------------------------------------------- */

function CostLine({ cost }) {
  return <span className="costline">{RES_KEYS.map((k, i) => <i key={k}><small>{RES_SHORT[i]}</small>{cost[i]}</i>)}</span>;
}
function ResStrip({ have, before }) {
  return (
    <div className="res-strip">
      {RES_KEYS.map((k, i) => (
        <div key={k}><small>{RES_SHORT[i]}</small><b>{before ? `${before[i]} → ${have[i]}` : have[i]}</b></div>
      ))}
    </div>
  );
}
function NextButton({ onAdvance, to, children, disabled = false }) {
  return <div className="room-actions"><Button disabled={disabled} onClick={() => onAdvance(to)}>{children} <ArrowRight size={18} /></Button></div>;
}
function TableCards({ tables, render }) {
  return <div className="tcards">{tables.map((t) => <article className="tcard" key={t}>{render(t)}</article>)}</div>;
}
const tableHead = (t, extra) => <span className="tlabel">TABLE {t} · {hospitalForTable(t).name}{extra ? ` · ${extra}` : ''}</span>;
const choiceLabel = (c) => (c ? c.toUpperCase() : 'NO DECISION');

const latestVotes = (responses, type, key = 'teach') => {
  const byPlayer = new Map();
  responses.filter((r) => r.response_type === type && r.capability_id === key).sort(byTime).forEach((r) => byPlayer.set(r.participant_id, r));
  return [...byPlayer.values()];
};
const PREDICTION_OPTIONS = {
  scale_prediction: ['unit', 'facility', 'system'],
  continuum_prediction: CONTINUUM_OPTIONS.map(([a]) => a.toLowerCase()),
  change_prediction: CHANGE_OPTIONS.map(([a]) => a),
};
const groupedPrediction = (participants, responses, type, mode) => {
  const votes = latestVotes(responses, type);
  const options = PREDICTION_OPTIONS[type];
  const tally = (rows) => Object.fromEntries(options.map((o) => [o, rows.filter((v) => v.choice === o).length]));
  if (mode === 'table') return activeTables(participants).map((t) => ({ name: `Table ${t} · ${capabilityById(teachCapFor(participants, responses, t)).name}`, counts: tally(votes.filter((v) => validTable(v.table_number) === t)) }));
  if (mode === 'persona') return PERSONAS.map((x) => ({ name: x.name, counts: tally(votes.filter((v) => v.persona === x.id)) }));
  return [{ name: 'Whole room', counts: tally(votes) }];
};
function PredictionAnalysis({ participants, responses, type, initial = 'room' }) {
  const [mode, setMode] = useState(initial);
  const groups = groupedPrediction(participants, responses, type, mode);
  return (
    <>
      <div className="analysis-controls">{[['room', 'Whole room'], ['table', 'By table'], ['persona', 'By perspective']].map(([id, label]) => <button type="button" key={id} className={mode === id ? 'active' : ''} onClick={() => setMode(id)}>{label}</button>)}</div>
      <div className="analysis-groups">{groups.map((g) => <article className="analysis-group" key={g.name}><h3>{g.name}</h3><div className="mini-bars">{Object.entries(g.counts).map(([k, v]) => <div key={k}><span>{k.toUpperCase()}</span><b>{v}</b></div>)}</div></article>)}</div>
    </>
  );
}
const alignmentFor = (members, responses) => {
  const votes = members.map((p) => myResponse(responses, p.id, 'first_instinct', 'teach')?.choice).filter(Boolean);
  const cover = `${votes.length} OF ${members.length} VOTED`;
  if (votes.length < Math.min(members.length, Math.max(2, Math.ceil(members.length * 0.6)))) return { label: `TOO EARLY · ${cover}`, cls: 'mixed' };
  const ratio = Math.max(...CHOICES.map((c) => votes.filter((v) => v === c).length)) / votes.length;
  return ratio >= 0.8 ? { label: `STRONG ALIGNMENT · ${cover}`, cls: 'strong' } : ratio >= 0.6 ? { label: `MIXED · ${cover}`, cls: 'mixed' } : { label: `SPLIT · ${cover}`, cls: 'split' };
};
function VoteProgress({ participants, responses, type, keyName = 'teach' }) {
  const total = latestVotes(responses, type, keyName).filter((r) => participants.some((p) => p.id === r.participant_id)).length;
  return <div className="aha-line">{total} of {participants.length} participants have responded.</div>;
}

/* ---------------------------------------------------------------------
   STEP 5 · CHOOSE THE TEACHING CAPABILITY (facilitator)
   --------------------------------------------------------------------- */

function CapabilityPortfolioRoom({ participants, onAdvance }) {
  const active = activeTables(participants);
  return (
    <Shell>
      <section className="cap-portfolio-room">
        <div className="cap-portfolio-head">
          <div>
            <div className="eyebrow">SIX POSSIBILITIES · LIMITED CAPACITY</div>
            <h1>Every table chooses where to go deep first.</h1>
          </div>
          <p>Each table explores one capability in full. The same capability costs each hospital something different, and every phone shows the price for its hospital.</p>
        </div>
        <div className="cap-grid">
          {CAPABILITIES.map((c, i) => (
            <article key={c.id}>
              <div className="cap-image"><img src={c.image} alt="" onError={(e) => imageFallback(e)} /><span>0{i + 1}</span></div>
              <div className="cap-card-copy">
                <h2>{c.name}</h2>
                <p>{c.promise}</p>
                <ul className="cap-fit-row">
                  {active.map((t) => <li key={t}><em>T{t}</em><FitChip level={fitFor(c.id, TABLE_MAP[t]).level} /></li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
        <NextButton onAdvance={onAdvance} to="cap_nominate">OPEN PRIVATE NOMINATIONS</NextButton>
      </section>
    </Shell>
  );
}

function CapabilityNominationRoom({ participants, responses, onAdvance }) {
  return (
    <Shell>
      <section className="cap-nom-room">
        <div className="eyebrow">PRIVATE NOMINATION</div>
        <h1>Which capability should your table explore in depth?</h1>
        <p>Each phone shows fit and cost for that hospital. This choice also becomes your table’s first decision, so cost matters. The room shows completion only.</p>
        <ProgressGrid participants={participants} responses={responses} type="capability_nomination" capabilityId="portfolio" doneLabel="ALL NOMINATIONS IN" partialLabel="NOMINATIONS SUBMITTED" />
        <NextButton onAdvance={onAdvance} to="cap_results">REVEAL NOMINATIONS</NextButton>
      </section>
    </Shell>
  );
}

function CapabilityResultsRoom({ participants, responses, onAdvance, facSave }) {
  const tables = activeTables(participants);
  const initial = Object.fromEntries(tables.map((t) => [t, teachCapFor(participants, responses, t)]));
  const [picked, setPicked] = useState(initial);
  const [saving, setSaving] = useState(false);
  const choiceOf = (t) => picked[t] || initial[t];
  const counts = {};
  tables.forEach((t) => { counts[choiceOf(t)] = (counts[choiceOf(t)] || 0) + 1; });
  const dups = Object.entries(counts).filter(([, n]) => n > 1).map(([id]) => capabilityById(id).name);
  const movesCare = tables.some((t) => choiceOf(t) === 'virtual-care');
  const approve = async () => {
    setSaving(true);
    try {
      for (const t of tables) await facSave('teach_assign', facKey('teach', t), t, choiceOf(t));
      onAdvance('t_reveal');
    } finally { setSaving(false); }
  };
  return (
    <Shell>
      <section className="cap-selection-room">
        <div className="eyebrow">APPROVE TEACHING CAPABILITIES</div>
        <h1>Different hospitals. Different first moves.</h1>
        <p>Each table’s leading nomination is selected. Approve all, or change a table’s capability after a quick conversation with them.</p>
        <TableCards tables={tables} render={(t) => {
          const ranked = nominationRanking(participants, responses, t).filter((x) => x.n > 0);
          const h = hospitalForTable(t);
          const cap = capabilityById(choiceOf(t));
          return (
            <>
              {tableHead(t)}
              <h3>{cap.name}</h3>
              <p>Nominations: {ranked.length ? ranked.map((x) => `${x.c.name} ${x.n}`).join(' · ') : 'none yet'}</p>
              <div className="approve-chips">{CAPABILITIES.map((c) => <button type="button" key={c.id} className={choiceOf(t) === c.id ? 'active' : ''} onClick={() => setPicked((p) => ({ ...p, [t]: c.id }))}>{c.name}</button>)}</div>
              <dl><dt>INVEST COST HERE</dt><dd><CostLine cost={investCost(h.id, cap.id)} /></dd></dl>
            </>
          );
        }} />
        {tables.length > 0 && !movesCare && <div className="dup-note">No table has chosen a capability that moves care out of the hospital. That works: the continuum reveal will show Virtual Care for contrast. Assign it to one table if you want the room to feel that shift directly.</div>}
        {dups.length > 0 && <div className="dup-note">More than one table chose {dups.join(', ')}. That works, and gives a same-capability comparison. Change one if you want more variety in the room.</div>}
        <div className="room-actions"><Button disabled={saving || !tables.length} onClick={approve}>{saving ? 'SAVING…' : 'APPROVE ALL AND BEGIN'} <ArrowRight size={18} /></Button></div>
      </section>
    </Shell>
  );
}

/* ---------------------------------------------------------------------
   STEP 6 · TEACHING ROUND (facilitator) · one capability per table
   --------------------------------------------------------------------- */

const capOfTable = (participants, responses, t) => capabilityById(teachCapFor(participants, responses, t));

function RoleReveal({ children, label = 'REVEAL ALL PERSPECTIVES' }) {
  const [open, setOpen] = useState(false);
  return open ? children : <div className="room-actions left"><Button secondary onClick={() => setOpen(true)}>{label}</Button></div>;
}
function RoleLines({ capId }) {
  return <div className="role-lines">{ROLE_ORDER.map((p) => <p key={p}><b>{briefFor(p).name}</b>{roleLine(capId, p)}</p>)}</div>;
}
function PerspectiveGrid({ capIds = CAPABILITIES.map((c) => c.id) }) {
  return <div className="tcards">{capIds.map((id) => <article className="tcard" key={id}><h3>{capabilityById(id).name}</h3><RoleLines capId={id} /></article>)}</div>;
}
const BuildingQ = () => <p className="building-q">{BUILDING_QUESTION}</p>;

function TRevealRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">TEACHING ROUND · START WITH THE CARE MOMENT</div>
        <h1>Every table goes deep on one decision.</h1>
        <p className="pullback-intro">Each phone shows what this moment means for that person’s role. Go around the table: each person explains their case before the room sees every perspective.</p>
        <TableCards tables={tables} render={(t) => {
          const c = capOfTable(participants, responses, t);
          const h = hospitalForTable(t);
          return (<><img src={c.image} alt="" onError={(e) => imageFallback(e)} />{tableHead(t)}<h3>{c.name}</h3><p className="moment">{careMoment(c.id)}</p><dl><dt>YOUR HOSPITAL’S NEED</dt><dd>{NEED_LINE[h.id]}</dd><dt>INVEST DELIVERS</dt><dd>{c.scope}</dd><dt>NOT INCLUDED</dt><dd>{c.excluded}</dd></dl></>);
        }} />
        <div className="aha-line">{DECISION_PROMPT}</div>
        <RoleReveal><TableCards tables={tables} render={(t) => { const c = capOfTable(participants, responses, t); return (<>{tableHead(t)}<h3>{c.name} · every perspective</h3><RoleLines capId={c.id} /></>); }} /></RoleReveal>
        <NextButton onAdvance={onAdvance} to="t_instinct">PRIVATE FIRST INSTINCT</NextButton>
      </section>
    </Shell>
  );
}

function TInstinctRoom({ participants, responses, onAdvance }) {
  return (
    <Shell>
      <section className="center-stage vc-instinct-room">
        <div className="eyebrow">PRIVATE FIRST INSTINCT</div>
        <h1>What would <em>you</em> do?</h1>
        <p>Invest, prepare or hold. Vote privately on your phone. The room shows completion only.</p>
        <ProgressGrid participants={participants} responses={responses} type="first_instinct" capabilityId="teach" doneLabel="ALL RESPONSES IN" partialLabel="RESPONSES SUBMITTED" />
        <Button onClick={() => onAdvance('t_cost')}>REVEAL THE COST <ArrowRight size={18} /></Button>
      </section>
    </Shell>
  );
}

function TCostRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">THE PRICE IS NOT JUST MONEY</div>
        <h1>Investment consumes capacity.</h1>
        <p className="pullback-intro">Every capability draws on capital, infrastructure, operational readiness and the organization’s ability to absorb change. Preparing costs less now; investing later costs the remainder.</p>
        <TableCards tables={tables} render={(t) => {
          const c = capOfTable(participants, responses, t);
          const h = hospitalForTable(t);
          return (<>{tableHead(t)}<h3>{c.name}</h3><div className="cost-pair"><div><b>INVEST</b><CostLine cost={investCost(h.id, c.id)} /></div><div><b>PREPARE</b><CostLine cost={prepareCost(h.id, c.id)} /></div><div><b>START</b><CostLine cost={startOf(h)} /></div></div><p>{COST_REASON[h.id]}</p></>);
        }} />
        <NextButton onAdvance={onAdvance} to="t_mission">CONNECT TO MISSION</NextButton>
      </section>
    </Shell>
  );
}

function TMissionRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">MISSION BEFORE TECHNOLOGY</div>
        <h1>Fit depends on who you are.</h1>
        <TableCards tables={tables} render={(t) => {
          const c = capOfTable(participants, responses, t);
          const h = hospitalForTable(t);
          const fit = fitFor(c.id, h.id);
          return (<>{tableHead(t)}<h3>{c.name}</h3><FitChip level={fit.level} /><dl><dt>WHY IT FITS</dt><dd>{fit.why}</dd><dt>THE TRADE-OFF</dt><dd>{c.tradeoff[h.id]}</dd></dl></>);
        }} />
        <NextButton onAdvance={onAdvance} to="t_change_vote">TRANSLATE TO DESIGN</NextButton>
      </section>
    </Shell>
  );
}

function TChangeVoteRoom({ participants, responses, onAdvance }) {
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">PRIVATE PREDICTION · DESIGN</div>
        <h1>Imagine the hospital has opened. What would be hardest to change?</h1>
        <p className="pullback-intro">The device or technology itself, where it sits in the building, or access to the infrastructure behind it?</p>
        <VoteProgress participants={participants} responses={responses} type="change_prediction" />
        <NextButton onAdvance={onAdvance} to="t_design">REVEAL WHAT THE BUILDING LOCKS IN</NextButton>
      </section>
    </Shell>
  );
}

function TDesignRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">DECIDE EARLY · KEEP CHANGEABLE</div>
        <h1>The device is the easiest thing to change.</h1>
        <PredictionAnalysis participants={participants} responses={responses} type="change_prediction" />
        <TableCards tables={tables} render={(t) => {
          const c = capOfTable(participants, responses, t);
          return (<>{tableHead(t)}<h3>{c.name}</h3><dl><dt>DECIDE EARLY</dt><dd>{c.early}</dd><dt>KEEP CHANGEABLE</dt><dd>{c.open}</dd><dt>THE ENVIRONMENT MUST SUPPORT</dt><dd>{c.support.map(([k, v]) => `${k}: ${v}`).join(' ')}</dd></dl></>);
        }} />
        <div className="aha-line">Where a capability lives, and the infrastructure behind it, is what the building locks in.</div>
        <NextButton onAdvance={onAdvance} to="t_discuss">REVEAL FIRST INSTINCTS</NextButton>
      </section>
    </Shell>
  );
}

function TDiscussRoom({ participants, responses, onAdvance }) {
  const votes = responsesOfType(responses, 'first_instinct', 'teach');
  return (
    <Shell>
      <section className="vc-discuss-room">
        <div className="eyebrow">REVEAL FIRST INSTINCTS</div>
        <h1>Now you can see where the tension lives.</h1>
        <p>Names stay private. Perspectives are visible because the leadership lens is part of the learning.</p>
        <div className="tally-table-grid">
          {activeTables(participants).map((t) => {
            const rows = membersOf(participants, t).map((p) => ({ p, r: myResponse(votes, p.id, 'first_instinct') }));
            const a = alignmentFor(membersOf(participants, t), responses);
            return (
              <article key={t}>
                <span>TABLE {t} · {capOfTable(participants, responses, t).name}</span>
                <span className={`alignment-badge alignment-${a.cls}`}>{a.label}</span>
                <div className="persona-votes">{rows.map(({ p, r }) => <div key={p.id}><b>{briefFor(p.persona).name}</b><strong className={r?.choice || 'waiting'}>{r?.choice?.toUpperCase() || 'WAITING'}</strong></div>)}</div>
                <div className="tally-bars">{CHOICES.map((c) => <div key={c}><span>{c}</span><b>{rows.filter((x) => x.r?.choice === c).length}</b></div>)}</div>
              </article>
            );
          })}
        </div>
        <div className="discussion-note"><b>60–90 SEC</b><span>What changed after seeing cost, fit and what the building locks in?</span></div>
        <NextButton onAdvance={onAdvance} to="t_decision">MAKE THE TABLE DECISION</NextButton>
      </section>
    </Shell>
  );
}

function TDecisionRoom({ participants, responses, onAdvance, facSave }) {
  const tables = teachTables(participants, responses);
  const states = tables.map((t) => ({ table: t, ...decisionForTable(responses, t, 'teach') }));
  const unresolved = states.filter((x) => x.status === 'waiting');
  const completed = states.filter((x) => x.status === 'decided');
  const resolved = tables.length > 0 && unresolved.length === 0;
  const continueCompleted = async () => {
    for (const row of unresolved) await facSave('table_no_decision', facKey('teach', row.table), row.table, 'no-decision');
    onAdvance('t_checkpoint');
  };
  return (
    <Shell>
      <section className="vc-decision-room">
        <div className="eyebrow">ONE TEAM · ONE DECISION</div>
        <h1>Resolve the trade-off together.</h1>
        <p>Invest, prepare or hold. Tables that took part in this round are included.</p>
        <div className="decision-status-grid">
          {states.map(({ table, status, choice, proposal }) => {
            const members = membersOf(participants, table);
            const acks = acknowledgersOf(responses, table, proposal, 'teach').length;
            return (
              <article key={table}>
                <span>TABLE {table} · {capOfTable(participants, responses, table).name}</span>
                <h2>{status === 'decided' ? choice.toUpperCase() : status === 'no-decision' ? 'NO DECISION' : 'DISCUSSING'}</h2>
                <p>{status === 'decided' ? `${members.length} at the table · ${acks} confirmed review` : status === 'no-decision' ? 'Excluded by facilitator' : 'Waiting for a table proposal'}</p>
              </article>
            );
          })}
        </div>
        <div className="aha-line">{completed.length} of {tables.length} participating tables have decided.</div>
        {unresolved.length > 0 && <p><b>Waiting for:</b> {unresolved.map((x) => `Table ${x.table}`).join(', ')}</p>}
        <div className="room-actions">
          <Button disabled={!resolved} onClick={() => onAdvance('t_checkpoint')}>{resolved ? 'APPLY DECISIONS' : 'WAITING FOR TABLE DECISIONS'} <ArrowRight size={18} /></Button>
          {completed.length > 0 && unresolved.length > 0 && <Button secondary onClick={continueCompleted}>CONTINUE WITH COMPLETED TABLES</Button>}
        </div>
      </section>
    </Shell>
  );
}

function TCheckpointRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">TEACHING ROUND CHECKPOINT</div>
        <h1>Your hospitals are beginning to take shape.</h1>
        <TableCards tables={tables} render={(t) => {
          const l = ledgerFor(participants, responses, t, 0);
          const h = l.hospital;
          const choice = decisionForTable(responses, t, 'teach').choice;
          return (<><img src={h.image} alt="" onError={(e) => imageFallback(e)} />{tableHead(t)}<h3>{capabilityById(l.teachCap).name} · {choiceLabel(choice)}</h3><ResStrip have={l.have} before={startOf(h)} /></>);
        }} />
        <NextButton onAdvance={onAdvance} to="t_scale_vote">PULL BACK · WHERE DOES IT LAND?</NextButton>
      </section>
    </Shell>
  );
}

function TScaleVoteRoom({ participants, responses, onAdvance }) {
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">PULL BACK · PRIVATE PREDICTION</div>
        <h1>Where does the greatest consequence of your decision fall, for your hospital?</h1>
        <p className="pullback-intro">The unit where care is delivered, the facility that must support it, or the system that connects every site?</p>
        <VoteProgress participants={participants} responses={responses} type="scale_prediction" />
        <NextButton onAdvance={onAdvance} to="t_scale_reveal">REVEAL THE PREDICTIONS</NextButton>
      </section>
    </Shell>
  );
}

function TScaleRevealRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">REVEAL · THE SCALES CONNECT</div>
        <h1>The biggest impact lands in one place. The consequences run through all three.</h1>
        <PredictionAnalysis participants={participants} responses={responses} type="scale_prediction" initial="table" />
        <TableCards tables={tables} render={(t) => {
          const c = capOfTable(participants, responses, t);
          return (<>{tableHead(t)}<h3>{c.name}</h3><dl><dt>UNIT</dt><dd>{c.scale.unit}</dd><dt>FACILITY</dt><dd>{c.scale.facility}</dd><dt>SYSTEM</dt><dd>{c.scale.system}</dd></dl></>);
        }} />
        <div className="aha-line">The architecture may be enterprise-wide even when the consequence is local.</div>
        <BuildingQ />
        <NextButton onAdvance={onAdvance} to="t_continuum_vote">SHIFT THE VIEW</NextButton>
      </section>
    </Shell>
  );
}

function TContinuumVoteRoom({ participants, responses, onAdvance }) {
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">SHIFT THE VIEW · PRIVATE PREDICTION</div>
        <h1>Where does care go because of your decision?</h1>
        <p className="pullback-intro">Choose the setting that changes most, or say that care does not move.</p>
        <VoteProgress participants={participants} responses={responses} type="continuum_prediction" />
        <NextButton onAdvance={onAdvance} to="t_continuum_reveal">REVEAL THE CONTINUUM</NextButton>
      </section>
    </Shell>
  );
}

function TContinuumRevealRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">REVEAL · DIFFERENT CAPABILITIES MOVE DIFFERENT THINGS</div>
        <h1>Some capabilities move care. Some move expertise. Some change the stay. Some move nothing on their own.</h1>
        <PredictionAnalysis participants={participants} responses={responses} type="continuum_prediction" initial="table" />
        <TableCards tables={tables} render={(t) => {
          const c = capOfTable(participants, responses, t);
          return (<>{tableHead(t)}<h3>{c.name}</h3><p>{c.continuum}</p><p><b>{c.revealLine}</b></p></>);
        }} />
        {(() => {
          const chosen = new Set(tables.map((t) => teachCapFor(participants, responses, t)));
          const others = CAPABILITIES.filter((c) => !chosen.has(c.id));
          return others.length > 0 && <div className="status-card"><b>FOR CONTRAST · CAPABILITIES NO TABLE CHOSE</b>{others.map((c) => <p key={c.id}><strong>{c.name}</strong> · {c.revealLine}</p>)}</div>;
        })()}
        <div className="aha-line">If care can move, what should remain fixed?</div>
        <BuildingQ />
        <NextButton onAdvance={onAdvance} to="t_ripple">COMPARE HOW THE HOSPITALS CHANGED</NextButton>
      </section>
    </Shell>
  );
}

function TRippleRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  const [selected, setSelected] = useState(null);
  const t = selected || tables[0];
  const detail = t ? (() => {
    const c = capOfTable(participants, responses, t);
    const choice = decisionForTable(responses, t, 'teach').choice;
    return { c, choice, x: rippleFor(c, choice), h: hospitalForTable(t) };
  })() : null;
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">DIFFERENT DECISIONS · DIFFERENT CONSEQUENCES</div>
        <h1>Compare how each hospital changed.</h1>
        <div className="final-compare">
          {tables.map((n) => {
            const hospital = hospitalForTable(n);
            const c = capOfTable(participants, responses, n);
            const ch = decisionForTable(responses, n, 'teach').choice;
            return (
              <button type="button" className={`compare-card ${n === t ? 'selected' : ''}`} key={n} onClick={() => setSelected(n)}>
                <img src={hospital.image} alt={hospital.name} onError={(e) => imageFallback(e)} />
                <div className="compare-card-body"><span>TABLE {n} · {c.name}</span><h3>{hospital.name}</h3><span className={`decision-tag decision-${ch === 'invest' ? 'invest' : ch === 'prepare' ? 'adapt' : 'preserve'}`}>{choiceLabel(ch)}</span><p>{rippleFor(c, ch).headline}</p></div>
              </button>
            );
          })}
        </div>
        {detail && (
          <article className="compare-detail">
            <span>TABLE {t} · {detail.h.name} · {detail.c.name}</span>
            <h2>{choiceLabel(detail.choice)} · {detail.x.headline}</h2>
            <div className="consequence-grid"><article><b>CLINICAL WORK</b>{detail.x.unit}</article><article><b>FACILITY</b>{detail.x.facility}</article><article><b>SYSTEM</b>{detail.x.system}</article><article><b>CARE FLOW</b>{detail.x.flow}</article></div>
            <p>{detail.c.context[detail.h.id]}</p>
            {detail.choice && <p><b>{CLOSING_LINE[detail.choice]}</b></p>}
          </article>
        )}
        <div className="aha-line">Technology strategy became operating strategy. Operating strategy changed capital strategy.</div>
        <BuildingQ />
        <NextButton onAdvance={onAdvance} to="p_open">OPEN THE PORTFOLIO BOARD</NextButton>
      </section>
    </Shell>
  );
}

/* ---------------------------------------------------------------------
   STEP 7 · PORTFOLIO CYCLES (facilitator)
   --------------------------------------------------------------------- */

function BoardSummary({ ledger, signal }) {
  return (
    <div className="board-list">
      {boardFor(ledger).map((b) => {
        const tag = signalTagFor(signal, b.c.id);
        return <div key={b.c.id}><span>{b.c.name}{tag && <span className="signal-tag">{tag}</span>}</span><span className={`st st-${b.state}`}>{STATE_LABEL[b.state]}</span></div>;
      })}
    </div>
  );
}

function POpenRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">THE PORTFOLIO BOARD OPENS</div>
        <h1>Earlier choices shape what is still possible.</h1>
        <p className="pullback-intro">Every capability is visible. Some are available, some can only be prepared, and some are out of reach within this planning period. Each table may revise its teaching decision once, now, with full resources returned.</p>
        <TableCards tables={tables} render={(t) => {
          const l = ledgerFor(participants, responses, t, 0);
          return (<>{tableHead(t)}<h3>{capabilityById(l.teachCap).name} · {choiceLabel(l.teach.choice)}{l.teach.revised && <span className="revised-tag">REVISED</span>}</h3><ResStrip have={l.have} /><BoardSummary ledger={l} /></>);
        }} />
        <NextButton onAdvance={onAdvance} to="p1_board">BEGIN CYCLE 1</NextButton>
      </section>
    </Shell>
  );
}

function makeBoardRoom(k) {
  return function PBoardRoom({ participants, responses, onAdvance }) {
    const tables = activeTables(participants);
    const signal = k === 3 ? currentSignal(responses) : null;
    return (
      <Shell>
        <section className="pullback-hero">
          <div className="eyebrow">PORTFOLIO · CYCLE {k} OF 3</div>
          <h1>{k === 3 ? 'The final cycle. Respond, or hold your ground.' : 'What does your hospital do next?'}</h1>
          <p className="pullback-intro">Phones show the board, costs and what each option leaves unresolved. Nominate privately, then decide as a table.{k < 3 ? ' A Future Signal arrives before the final cycle.' : ''}</p>
          <TableCards tables={tables} render={(t) => {
            const l = ledgerFor(participants, responses, t, k - 1);
            return (<>{tableHead(t)}<p className="need-line">{NEED_LINE[l.hospital.id]}</p>{l.closed ? <h3>Portfolio closed</h3> : <ResStrip have={l.have} />}<BoardSummary ledger={l} signal={signal} /></>);
          }} />
          <div className="aha-line">{DECISION_PROMPT}</div>
          <RoleReveal label="REVEAL ALL ROLE PERSPECTIVES"><PerspectiveGrid /></RoleReveal>
          <ProgressGrid participants={participants} responses={responses} type="cycle_nom" capabilityId={`cycle-${k}`} doneLabel="ALL NOMINATIONS IN" partialLabel="NOMINATIONS SUBMITTED" />
          <NextButton onAdvance={onAdvance} to={`p${k}_decide`}>MAKE THE TABLE DECISION</NextButton>
        </section>
      </Shell>
    );
  };
}

function ChallengePicker({ responses = [], facSave, compact = false }) {
  const row = signalRow(responses);
  const sig = row?.choice ? signalById(row.choice) : null;
  const hidden = row?.note === 'random';
  const [saving, setSaving] = useState(false);
  const pick = async (id, note = '') => {
    if (!facSave) return;
    setSaving(true);
    try { await facSave('signal', 'room', 1, id, note); } finally { setSaving(false); }
  };
  return (
    <section className="challenge-picker">
      <div className="eyebrow">CHALLENGE FOR THIS SESSION · HIDDEN FROM PLAYERS UNTIL THE REVEAL</div>
      <p>{sig ? (hidden ? 'A challenge was drawn at random. It stays hidden, even from you, until the reveal.' : `Selected: ${sig.title}${compact ? ' You can still change it.' : ''}`) : 'No challenge selected yet. You can also choose at the reveal.'}</p>
      <div className="approve-chips">
        {FUTURE_SIGNALS.map((s) => <button type="button" key={s.id} disabled={saving || !facSave} className={!hidden && sig?.id === s.id ? 'active' : ''} onClick={() => pick(s.id)}>{s.title}</button>)}
        <button type="button" disabled={saving || !facSave} className={hidden ? 'active' : ''} onClick={() => pick(FUTURE_SIGNALS[Math.floor(Math.random() * FUTURE_SIGNALS.length)].id, 'random')}>Draw at random</button>
      </div>
      {!compact && sig && !hidden && <p className="small-note">{sig.text}</p>}
    </section>
  );
}

function DimList({ dims, lens }) {
  return (
    <div className="dim-list">
      {dims.map((d) => (
        <div key={d.id} className={`dim dim-${d.status}${lens === d.id ? ' dim-lens' : ''}`}>
          <span>{d.label}{d.priority && <em>MATTERS MOST</em>}{lens === d.id && <em>YOUR LENS</em>}</span>
          <b>{OUTCOME_STATUS[d.status]}</b>
          <small>{d.why}</small>
        </div>
      ))}
    </div>
  );
}
const tableReflections = (responses, t) => responsesOfType(responses, 'reflection', 'final').filter((r) => validTable(r.table_number) === t && r.note).map((r) => r.note);

function TurnList({ items }) {
  return <div>{items.map((x, i) => <div className="turn" key={i}><b>{x.title.toUpperCase()}</b>{x.text}</div>)}</div>;
}
function LockList({ report }) {
  const block = (title, rows, empty) => (
    <div className="lock-block">
      <b>{title}</b>
      {rows.length ? rows.map((r) => <p key={r.name}><strong>{r.name}</strong> · {r.text}</p>) : <p className="small-note">{empty}</p>}
    </div>
  );
  return (
    <>
      {block('DECIDE NOW · COMMITTED', report.now, 'Nothing committed yet.')}
      {block('PROTECT WHILE DEFERRED · PREPARED', report.protect, 'No provisions protected.')}
      {block('KEEP CHANGEABLE', report.open, 'Nothing to keep open yet.')}
    </>
  );
}

function makeDecideRoom(k) {
  const next = k === 1 ? 'p2_board' : k === 2 ? 'p_signal' : 'f_future';
  return function PDecideRoom({ participants, responses, onAdvance, facSave }) {
    const tables = activeTables(participants);
    const opts = ledgerOpts(k);
    const rows = tables.map((t) => {
      const l = ledgerFor(participants, responses, t, k - 1, opts);
      const canAct = !l.closed && boardFor(l).some(canActOn);
      const row = activeProposal(responses, t, `cycle-${k}`);
      const parsed = parseCycleChoice(row?.choice);
      const diff = parsed && (parsed.action === 'invest' || parsed.action === 'prepare') ? diffBoards(l, ledgerFor(participants, responses, t, k, opts), parsed.cap) : null;
      return { t, l, canAct, parsed, diff };
    });
    const waiting = rows.filter((r) => r.canAct && !r.parsed);
    const describe = (r) => {
      if (r.l.closed) return ['CLOSED', 'Portfolio closed earlier.'];
      if (!r.canAct) return ['NO OPTION FITS', 'No remaining option fits the resources left in this planning period.'];
      if (!r.parsed) return ['DISCUSSING', 'Waiting for a table decision.'];
      if (r.parsed.action === 'hold') return ['HOLD', 'Capacity kept for the next cycle.'];
      if (r.parsed.action === 'close') return ['CLOSE', 'No further commitments this planning period.'];
      return [r.parsed.action.toUpperCase(), capabilityById(r.parsed.cap)?.name];
    };
    return (
      <Shell>
        <section className="vc-decision-room">
          <div className="eyebrow">PORTFOLIO · CYCLE {k} OF 3 · TABLE DECISIONS</div>
          <h1>One decision per table.</h1>
          <div className="decision-status-grid">
            {rows.map((r) => {
              const [a, b] = describe(r);
              return (
                <article key={r.t}>
                  <span>TABLE {r.t} · {r.l.hospital.name}</span><h2>{a}</h2><p>{b}</p>
                  {r.diff && (r.diff.blocked.length > 0 || r.diff.cheaper.length > 0) && (
                    <p className="cause">{[r.diff.blocked.length ? `Now harder to reach: ${listJoin(r.diff.blocked.map((x) => x.c.name))}.` : '', r.diff.cheaper.length ? `Now cheaper: ${listJoin(r.diff.cheaper.map((x) => x.c.name))}.` : ''].filter(Boolean).join(' ')}</p>
                  )}
                </article>
              );
            })}
          </div>
          <div className="aha-line">{rows.length - waiting.length} of {rows.length} tables are ready.</div>
          {waiting.length > 0 && <p><b>Waiting for:</b> {waiting.map((r) => `Table ${r.t}`).join(', ')}. Tables without a decision make no change this cycle.</p>}
          {k === 2 && <ChallengePicker compact responses={responses} facSave={facSave} />}
          <div className="room-actions">
            <Button disabled={waiting.length > 0} onClick={() => onAdvance(next)}>{waiting.length ? 'WAITING FOR TABLE DECISIONS' : k === 2 ? 'REVEAL THE CHALLENGE' : k === 3 ? 'SEE WHAT YOUR HOSPITALS BECAME' : 'BEGIN CYCLE 2'} <ArrowRight size={18} /></Button>
            {waiting.length > 0 && <Button secondary onClick={() => onAdvance(next)}>CONTINUE WITH READY TABLES</Button>}
          </div>
        </section>
      </Shell>
    );
  };
}

function PSignalRoom({ participants, responses, onAdvance, facSave }) {
  const signal = currentSignal(responses);
  const tables = activeTables(participants);
  if (!signal) {
    return (
      <Shell>
        <section className="pullback-hero">
          <div className="eyebrow">THE CHALLENGE · FACILITATOR CHOICE</div>
          <h1>Something changes before the final cycle.</h1>
          <p className="pullback-intro">No challenge was chosen at setup. Choose one now, or draw one at random. The room sees it once it is chosen.</p>
          <ChallengePicker responses={responses} facSave={facSave} />
        </section>
      </Shell>
    );
  }
  return (
    <Shell>
      <section>
        <div className="signal-hero">
          <div className="eyebrow">THE CHALLENGE</div>
          <h1>{signal.title}</h1>
          <p>{signal.text}</p>
          <p><b>{signal.kind === 'shock' ? 'What protects you:' : 'Capabilities that respond:'}</b> {listJoin(capNames(signal.responds))}</p>
        </div>
        <TableCards tables={tables} render={(t) => {
          const st = standingText(signalStanding(participants, responses, t, signal));
          const before = ledgerFor(participants, responses, t, 2, { preSignal: true });
          const l = ledgerFor(participants, responses, t, 2);
          return (<>{tableHead(t)}<h3>{st.head}</h3><p>{st.detail}</p><ResStrip have={l.have} before={signal.kind === 'shock' ? before.have : undefined} /></>);
        }} />
        <div className="aha-line">{signal.kind === 'shock' ? 'Foundations rarely look urgent until the day they are.' : 'The capacity you kept, and the options you prepared, decide how you can respond.'}</div>
        <NextButton onAdvance={onAdvance} to="p3_board">BEGIN THE FINAL CYCLE</NextButton>
      </section>
    </Shell>
  );
}

/* ---------------------------------------------------------------------
   STEP 8 · DEBRIEF · four reveals, then the side-by-side summary
   --------------------------------------------------------------------- */

const unresolvedNeed = (l) => {
  const open = CAPABILITIES.filter((c) => !l.invested.includes(c.id))
    .map((c) => ({ c, rank: fitRank(fitFor(c.id, l.hospital.id).level), prepared: l.prepared.includes(c.id) }))
    .sort((a, b) => b.rank - a.rank);
  return open[0] || null;
};

function FFutureRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  const signal = currentSignal(responses);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">REVEAL 1 OF 4 · FIVE YEARS ON</div>
        <h1>What did your choices make possible?</h1>
        <p className="pullback-intro">Each hospital is read against what matters most to it. Outcome values are a draft model for discussion, not a prediction.</p>
        <TableCards tables={tables} render={(t) => {
          const o = outcomeReport(participants, responses, t, signal);
          return (<><img src={o.h.image} alt="" onError={(e) => imageFallback(e)} />{tableHead(t)}<h3>{o.headline}</h3><p><b>{o.priorityLine}</b></p><DimList dims={o.dims} /></>);
        }} />
        <div className="aha-line">Same game. Different hospitals. Different definitions of success.</div>
        <BuildingQ />
        <NextButton onAdvance={onAdvance} to="f_turns">REVEAL THE TURNING POINTS</NextButton>
      </section>
    </Shell>
  );
}

function FTurnsRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  const signal = currentSignal(responses);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">REVEAL 2 OF 4 · TURNING POINTS</div>
        <h1>Which decisions shaped everything after them?</h1>
        <TableCards tables={tables} render={(t) => (<>{tableHead(t)}<TurnList items={turningPoints(participants, responses, t, signal)} /></>)} />
        <div className="aha-line">Earlier choices did not just cost something. They decided what came next.</div>
        <NextButton onAdvance={onAdvance} to="f_locks">REVEAL WHAT THE BUILDING LOCKS IN</NextButton>
      </section>
    </Shell>
  );
}

function FLocksRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">REVEAL 3 OF 4 · WHAT YOUR BUILDING NOW LOCKS IN</div>
        <h1>Your portfolio became a set of design commitments.</h1>
        <p className="pullback-intro">Committed capabilities fix decisions in the building now. Prepared ones protect a provision. Everything else should stay changeable.</p>
        <TableCards tables={tables} render={(t) => (<>{tableHead(t)}<LockList report={lockReport(ledgerFor(participants, responses, t, 3))} /></>)} />
        <div className="aha-line">Technology strategy became operating strategy. Operating strategy became design.</div>
        <NextButton onAdvance={onAdvance} to="f_compare">SEE ALL HOSPITALS SIDE BY SIDE</NextButton>
      </section>
    </Shell>
  );
}

function FCompareRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  const signal = currentSignal(responses);
  const [sel, setSel] = useState(null);
  const names = (ids) => (ids.length ? listJoin(capNames(ids)) : '—');
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">SUMMARY · SIDE BY SIDE</div>
        <h1>What each hospital enabled, prepared, kept and left unresolved.</h1>
        <table className="compare-table">
          <thead><tr><th>HOSPITAL</th><th>COMMITTED</th><th>PREPARED</th><th>CAPACITY KEPT</th><th>UNRESOLVED NEED</th><th>MAIN CONSTRAINT</th>{signal && <th>CHALLENGE</th>}</tr></thead>
          <tbody>
            {tables.map((t) => {
              const l = ledgerFor(participants, responses, t, 3);
              const need = unresolvedNeed(l);
              const s = signalStanding(participants, responses, t, signal);
              return (
                <tr key={t} className={sel === t ? 'sel' : ''} onClick={() => setSel(t)}>
                  <td><b>Table {t}</b><br />{l.hospital.name}{l.teach.revised && <span className="revised-tag">REVISED</span>}</td>
                  <td>{names(l.invested)}</td>
                  <td>{names(l.prepared)}</td>
                  <td><CostLine cost={l.have} /></td>
                  <td>{need ? <><b>{need.c.name}{need.prepared ? ' (prepared)' : ''}</b><br />{need.c.exposure}</> : 'None of the six'}{tableReflections(responses, t).length > 0 && <p className="their-need"><b>YOUR TABLE SAID</b>“{tableReflections(responses, t)[0]}”</p>}</td>
                  <td>{mainConstraint(l)}</td>
                  {signal && <td>{standingText(s, true).head}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
        {sel && (() => {
          const o = outcomeReport(participants, responses, sel, signal);
          return <div className="status-card"><b>Table {sel} · {o.h.name}</b>{o.headline} {o.priorityLine}</div>;
        })()}
        <div className="aha-line">Context and earlier choices shape what is possible.</div>
        <NextButton onAdvance={onAdvance} to="f_debrief">OPEN THE CONVERSATION</NextButton>
      </section>
    </Shell>
  );
}

function FDebriefRoom({ participants, responses }) {
  const tables = activeTables(participants);
  const dissent = tables.map((t) => {
    const choice = decisionForTable(responses, t, 'teach').choice;
    const differ = membersOf(participants, t).filter((p) => { const v = myResponse(responses, p.id, 'first_instinct', 'teach')?.choice; return v && choice && v !== choice; });
    return { t, choice, n: differ.length };
  }).filter((x) => x.n >= 2).sort((a, b) => b.n - a.n);
  const reflections = responsesOfType(responses, 'reflection', 'final').filter((r) => r.note);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">REVEAL 4 OF 4 · THE CONVERSATION</div>
        <h1>What did you enable, what did you leave unresolved, and what can you still change?</h1>
        {dissent.length > 0 && <div className="status-card"><b>Ask Table {dissent[0].t}</b>“Your table chose to {dissent[0].choice} even though {dissent[0].n} of you first preferred another direction. What persuaded you?”</div>}
        <div className="status-card"><b>Ask across tables</b>{crossPrompt(participants, responses)}</div>
        <ol className="mission-list">
          <li><span>01</span>What did your hospital enable, and was it what mattered most?</li>
          <li><span>02</span>Which turning point would you make differently, knowing what came next?</li>
          <li><span>03</span>Which design decisions must be made now, and which can still change?</li>
        </ol>
        {reflections.length > 0 && <TableCards tables={[...new Set(reflections.map((r) => validTable(r.table_number)).filter(Boolean))]} render={(t) => {
          const need = unresolvedNeed(ledgerFor(participants, responses, t, 3));
          return (<>{tableHead(t)}<h3>Biggest unresolved need</h3><dl><dt>YOUR TABLE SAID</dt>{reflections.filter((r) => validTable(r.table_number) === t).map((r) => <dd key={r.id}>“{r.note}”</dd>)}<dt>THE GAME’S READ</dt><dd>{need ? `${need.c.name}: ${need.c.exposure}` : 'None of the six'}</dd></dl><p><b>Who is right, and what does that tell you?</b></p></>);
        }} />}
        <div className="aha-line">A technology decision is never only a technology decision. It changes how care is delivered, where it happens, and what we build.</div>
      </section>
    </Shell>
  );
}

class RoomErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state={error:null}; }
  static getDerivedStateFromError(error){ return {error}; }
  componentDidCatch(error,info){ console.error('Facilitator screen error',error,info); }
  componentDidUpdate(prev){ if(prev.resetKey!==this.props.resetKey && this.state.error) this.setState({error:null}); }
  render(){
    if(!this.state.error) return this.props.children;
    return <Shell><section className="center-stage"><div className="eyebrow">SCREEN RECOVERY</div><h1>This screen could not render.</h1><p>The room and all responses are saved. Go back one step or reload; the session will resume.</p><pre style={{whiteSpace:'pre-wrap',fontSize:13,padding:14,background:'#f3eee8',textAlign:'left'}}>{String(this.state.error?.message||this.state.error)}</pre><div className="room-actions">{this.props.onBack&&<Button secondary onClick={this.props.onBack}>BACK ONE STEP</Button>}<Button onClick={()=>location.reload()}>RELOAD ROOM</Button></div></section></Shell>;
  }
}

/* ---------------------------------------------------------------------
   FACILITATOR CONTROLLER
   --------------------------------------------------------------------- */

const FACILITATOR_SCREENS = {
  assignments: AssignmentRoom, context: ContextRoom, tension: TensionRoom, resources: ResourcesRoom, discussion: DiscussionRoom,
  brief_reveal: BriefRevealRoom, brief_read: BriefReadRoom, brief_share: BriefShareRoom, alignment: AlignmentRoom, ready: ReadyRoom,
  cap_portfolio: CapabilityPortfolioRoom, cap_nominate: CapabilityNominationRoom, cap_results: CapabilityResultsRoom,
  t_reveal: TRevealRoom, t_instinct: TInstinctRoom, t_cost: TCostRoom, t_mission: TMissionRoom, t_change_vote: TChangeVoteRoom,
  t_design: TDesignRoom, t_discuss: TDiscussRoom, t_decision: TDecisionRoom, t_checkpoint: TCheckpointRoom,
  t_scale_vote: TScaleVoteRoom, t_scale_reveal: TScaleRevealRoom, t_continuum_vote: TContinuumVoteRoom,
  t_continuum_reveal: TContinuumRevealRoom, t_ripple: TRippleRoom,
  p_open: POpenRoom, p1_board: makeBoardRoom(1), p1_decide: makeDecideRoom(1), p2_board: makeBoardRoom(2), p2_decide: makeDecideRoom(2),
  p_signal: PSignalRoom, p3_board: makeBoardRoom(3), p3_decide: makeDecideRoom(3),
  f_future: FFutureRoom, f_turns: FTurnsRoom, f_locks: FLocksRoom, f_compare: FCompareRoom, f_debrief: FDebriefRoom,
};

/* Older builds used these phase names; route them safely. */
const LEGACY_PHASES = LEGACY_JOURNEY_PHASES;

function Facilitator({ onExit }) {
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [responses, setResponses] = useState([]);
  const [maxReached, setMaxReached] = useState('lobby');
  const busy = useRef(false);

  const create = async () => {
    const now = new Date().toISOString();
    const s = { id: uid(), code: makeCode(), phase: 'lobby', created_at: now, updated_at: now };
    await saveSession(s);
    sessionStorage.setItem('hybrid-facilitator-code', s.code);
    setSession(s);
  };

  useEffect(() => {
    const code = sessionStorage.getItem('hybrid-facilitator-code');
    if (!code || session) return;
    fetchSession(code).then((s) => { if (s) setSession(s); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!session) return undefined;
    const refresh = async () => {
      if (busy.current) return;
      busy.current = true;
      try {
        const s = await fetchSession(session.code);
        if (s) { setSession((x) => ({ ...x, ...s })); setMaxReached((m) => phaseIndex(s.phase) > phaseIndex(m) ? (LEGACY_PHASES[s.phase] || s.phase) : m); }
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

  const facReady = useRef(false);
  const facSave = async (type, capabilityId, table, choice, note = '') => {
    if (!facReady.current) {
      await addParticipant({ id: session.id, session_id: session.id, initials: 'FAC', persona: 'facilitator', table_number: 1, hospital_id: TABLE_MAP[1], created_at: session.created_at || new Date().toISOString() }, session.code);
      facReady.current = true;
    }
    const t = validTable(table) || 1;
    await saveResponse({ id: uid(), session_id: session.id, participant_id: session.id, table_number: t, hospital_id: TABLE_MAP[t], persona: 'facilitator', capability_id: capabilityId, response_type: type, choice, note, updated_at: new Date().toISOString() }, session.code);
    setResponses(await fetchResponses(session.id, session.code));
  };

  const advance = async (phase) => {
    const next = { ...session, phase, updated_at: new Date().toISOString() };
    await saveSession(next);
    setSession(next);
    setMaxReached((m) => phaseIndex(phase) > phaseIndex(m) ? phase : m);
  };

  if (!session) return <FacilitatorStart onCreate={create} onBack={() => { sessionStorage.removeItem('hybrid-facilitator-code'); onExit(); }} />;
  const phase = LEGACY_PHASES[session.phase] || session.phase;
  if (phase === 'lobby') return <><JourneyNav phase={phase} maxPhase={maxReached} onGo={advance}/><Lobby session={session} participants={participants} onAdvance={advance} responses={responses} facSave={facSave} /></>;
  const Screen = FACILITATOR_SCREENS[phase] || FDebriefRoom;
  const back = priorPhase(phase);
  return <><JourneyNav phase={phase} maxPhase={maxReached} onGo={advance}/><RoomErrorBoundary resetKey={phase} onBack={back ? () => advance(back) : null}><Screen session={session} participants={participants || []} responses={responses || []} onAdvance={advance} facSave={facSave} /></RoomErrorBoundary></>;
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

  const [err, setErr] = useState('');
  const submit = async () => {
    if (!choice) return;
    setErr('');
    try { await onSubmit('perspective', choice, note); setSaved(true); }
    catch (e) { setErr(e?.message || 'Could not be saved. Try again.'); }
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
        {err && <p className="error">{err}</p>}
      </section>
    </Shell>
  );
}

function useSaver(onSubmit) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const run = async (...args) => {
    if (saving) return false;
    setSaving(true); setErr('');
    try { await onSubmit(...args); return true; } catch (e) { setErr(e?.message || 'Could not be saved.'); return false; } finally { setSaving(false); }
  };
  return { saving, err, setErr, run };
}

function VotePhone({ player, responses, onSubmit, type, keyName = 'teach', eyebrow, title, text, options, savedLabel }) {
  const mine = myResponse(responses, player.id, type, keyName);
  const { saving, err, setErr, run } = useSaver(onSubmit);
  return (
    <Shell compact>
      <section className="phone-card">
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
        <div className="phone-vote-grid">
          {options.map(([id, label, sub]) => (
            <button type="button" disabled={saving} key={id} className={mine?.choice === id ? 'selected' : ''} onClick={() => run(type, id, '', keyName)}>
              <b>{label}</b>{sub && <span>{sub}</span>}
            </button>
          ))}
        </div>
        {saving && <div className="submission-confirm">SAVING…</div>}
        {mine && !saving && <div className="submitted-mark"><Check size={16} /> {savedLabel || 'RESPONSE SAVED'} · {String(mine.choice).toUpperCase()}</div>}
        {err && <div className="toast" onClick={() => setErr('')}>{err} · Tap to dismiss and try again.</div>}
      </section>
    </Shell>
  );
}

function CapabilityNominationPhone({ player, responses = [], onSubmit }) {
  const existing = myResponse(responses, player.id, 'capability_nomination', 'portfolio');
  const { saving, err, setErr, run } = useSaver(onSubmit);
  const hid = player.hospital_id;
  const sel = capabilityById(existing?.choice);
  return (
    <Shell compact>
      <section className="phone-card cap-phone">
        <div className="eyebrow">PRIVATE NOMINATION · {HOSPITALS[hid]?.name || 'YOUR HOSPITAL'}</div>
        <h1>Which capability should your table explore in depth?</h1>
        <p>It becomes your table’s first decision, so cost matters. You can change until the facilitator advances.</p>
        <div className="pboard">
          {CAPABILITIES.map((c) => (
            <button type="button" disabled={saving} key={c.id} className={existing?.choice === c.id ? 'selected' : ''} onClick={() => run('capability_nomination', c.id, '', 'portfolio')}>
              <div className="row1"><b>{c.name}</b><FitChip level={fitFor(c.id, hid).level} /></div>
              <p className="for-you">{roleLine(c.id, player.persona) || c.promise}</p>
              <p><CostLine cost={investCost(hid, c.id)} /></p>
            </button>
          ))}
        </div>
        {sel && <div className="brief-question"><b>YOUR LENS ON {sel.name.toUpperCase()}</b><p>{lensFor(sel.id, player.persona)}</p></div>}
        {saving && <div className="submission-confirm">SAVING NOMINATION…</div>}
        {err && <div className="toast" onClick={() => setErr('')}>{err} · Tap to dismiss and try again.</div>}
      </section>
    </Shell>
  );
}

function CapabilityResultsPhone({ player, participants, responses }) {
  const table = validTable(player.table_number);
  const top = nominationRanking(participants, responses, table)[0];
  const cap = top && top.n > 0 ? top.c : null;
  return (
    <Shell compact>
      <section className="phone-card">
        <div className="eyebrow">TABLE {table || '—'} · NOMINATIONS REVEALED</div>
        {cap && <img className="phone-hospital-image" src={cap.image} alt="" onError={(e) => imageFallback(e)} />}
        <h1>{cap ? `Your table leads with ${cap.name}.` : 'No nominations yet.'}</h1>
        <p>Your facilitator is confirming each table’s teaching capability. No resources have been committed yet.</p>
      </section>
    </Shell>
  );
}

function TableDecisionPhone({ player, participants, responses, onSubmit, keyName = 'teach', cap }) {
  const table = validTable(player.table_number);
  const proposal = activeProposal(responses, table, keyName);
  const acks = acknowledgersOf(responses, table, proposal, keyName);
  const myAck = acks.some((r) => r.participant_id === player.id);
  const members = membersOf(participants, table);
  const mine = proposal && proposal.participant_id === player.id;
  const { saving, run } = useSaver(onSubmit);
  return (
    <Shell compact>
      <section className="phone-card">
        <div className="eyebrow">TABLE {table || '—'} · SHARED DECISION · {cap?.name?.toUpperCase()}</div>
        <h1>{proposal ? `Decision: ${proposal.choice.toUpperCase()}` : 'One team. One direction.'}</h1>
        {!proposal ? (
          <>
            <p>Agree out loud first. Then one person records your table’s decision. This is separate from your private first instinct.</p>
            <div className="phone-choice-stack interactive">
              {CHOICES.map((c) => <button type="button" disabled={saving} key={c} onClick={() => run('table_decision', c, '', keyName)}><b>{c.toUpperCase()}</b><span>{DECISION_TEXT[c]}</span></button>)}
            </div>
          </>
        ) : (
          <>
            <div className="proposal-banner"><b>{mine ? 'YOU RECORDED THIS' : 'RECORDED BY YOUR TABLE'}</b><span>{acks.length} of {members.length || '—'} confirmed</span></div>
            <p>{DECISION_TEXT[proposal.choice]}</p>
            <Button disabled={myAck || saving} onClick={() => run('decision_ack', proposal.choice, '', keyName)}>{myAck ? 'CONFIRMED' : 'CONFIRM I HAVE SEEN THIS'}</Button>
            <Button secondary disabled={saving} onClick={() => run('table_decision', '', 'reopened', keyName)}>KEEP DISCUSSING</Button>
          </>
        )}
      </section>
    </Shell>
  );
}

function TeachRevisePhone({ player, participants, responses, onSubmit }) {
  const table = validTable(player.table_number);
  const l = ledgerFor(participants, responses, table, 0);
  const cap = capabilityById(l.teachCap);
  const { saving, run } = useSaver(onSubmit);
  return (
    <Shell compact>
      <section className="phone-card">
        <div className="eyebrow">THE BOARD OPENS · TABLE {table}</div>
        <h1>Now you can see the whole board.</h1>
        <p>Your teaching decision: <b>{cap.name} · {choiceLabel(l.teach.choice)}</b>{l.teach.revised && <span className="revised-tag">REVISED</span>}</p>
        <div className="res-strip">{RES_KEYS.map((k, i) => <div key={k}><small>{RES_SHORT[i]}</small><b>{l.have[i]}</b></div>)}</div>
        <div className="pboard">{boardFor(l).map((b) => <button type="button" disabled key={b.c.id}><div className="row1"><b>{b.c.name}</b><span className={`st st-${b.state}`}>{STATE_LABEL[b.state]}</span></div></button>)}</div>
        <h3>REVISE YOUR TEACHING DECISION ONCE?</h3>
        <p>All resources from the original decision are returned, then the new one is applied.</p>
        <div className="phone-choice-stack interactive">
          {CHOICES.map((c) => <button type="button" disabled={saving} key={c} className={l.teach.choice === c ? 'selected' : ''} onClick={() => run('teach_revise', c, '', 'teach')}><b>{c.toUpperCase()}</b><span>{DECISION_TEXT[c]}</span></button>)}
        </div>
      </section>
    </Shell>
  );
}

function BoardCard({ b, persona, signal, selected, onClick, disabled }) {
  const tag = signalTagFor(signal, b.c.id);
  return (
    <div className={`pcard ${selected ? 'selected' : ''}`}>
      <button type="button" disabled={disabled} onClick={onClick}>
        <div className="row1"><b>{b.c.name}{tag && <span className="signal-tag">{tag}</span>}</b><span className={`st st-${b.state}`}>{STATE_LABEL[b.state]}</span></div>
        {persona && b.state !== 'committed' && <p className="for-you">{roleLine(b.c.id, persona)}</p>}
        {b.state === 'available' && <p className="pcost">Invest <CostLine cost={b.investCost} /></p>}
        {b.state === 'prepare-only' && <p className="pcost">Prepare <CostLine cost={b.prepareCost} /></p>}
        {b.state === 'complete' && <p className="pcost">Finish <CostLine cost={b.investCost} /></p>}
        {b.state === 'out' && b.limit && <p className="limit">Short on {b.limit.label}: {b.limit.have} of {b.limit.need}.</p>}
      </button>
      {b.state !== 'committed' && (
        <details>
          <summary>MORE</summary>
          {persona && <p><b>Your question:</b> {lensFor(b.c.id, persona)}</p>}
          {b.state === 'available' && <p><b>Or prepare:</b> <CostLine cost={b.prepareCost} /></p>}
          {b.state === 'prepare-only' && b.limit && <p className="limit">Cannot fully invest: {b.limit.label} {b.limit.have} of {b.limit.need}.</p>}
          {b.cause && <p className="cause">{b.cause}</p>}
          <p><b>If you don’t act:</b> {b.c.exposure}</p>
        </details>
      )}
    </div>
  );
}

function BoardPhone({ k, player, participants, responses, onSubmit }) {
  const table = validTable(player.table_number);
  const l = ledgerFor(participants, responses, table, k - 1);
  const signal = k === 3 ? currentSignal(responses) : null;
  const key = `cycle-${k}`;
  const mine = myResponse(responses, player.id, 'cycle_nom', key);
  const { saving, run } = useSaver(onSubmit);
  if (l.closed) return <PhoneState kicker={`CYCLE ${k} · TABLE ${table}`} title="You chose to close your portfolio." text="Your remaining capacity is kept. Watch how the other hospitals decide." />;
  return (
    <Shell compact>
      <section className="phone-card">
          <div className="eyebrow">CYCLE {k} OF 3 · PRIVATE NOMINATION · {briefFor(player.persona).name.toUpperCase()}</div>
          <h1>{signal ? signal.title : 'What should your hospital do next?'}</h1>
          {signal ? <p>{signal.text}</p> : <p className="need-line">{NEED_LINE[l.hospital.id]}</p>}
        <div className="res-strip">{RES_KEYS.map((x, i) => <div key={x}><small>{RES_SHORT[i]}</small><b>{l.have[i]}</b></div>)}</div>
        <div className="pboard">
            {boardFor(l).map((b) => <BoardCard key={b.c.id} b={b} persona={player.persona} signal={signal} selected={mine?.choice === b.c.id} disabled={saving || !canActOn(b)} onClick={() => run('cycle_nom', b.c.id, '', key)} />)}
        </div>
        {mine && <div className="submitted-mark"><Check size={16} /> NOMINATED · {capabilityById(mine.choice)?.name}</div>}
      </section>
    </Shell>
  );
}

function ReflectionBox({ player, responses, onSubmit }) {
  const existing = myResponse(responses, player.id, 'reflection', 'final');
  const [note, setNote] = useState(existing?.note || '');
  const { saving, run } = useSaver(onSubmit);
  return (
    <div className="reflect status-card">
      <b>While other tables decide</b>
      Name the biggest need your hospital is leaving unresolved, and the capacity you kept to respond to it.
      <textarea maxLength={160} value={note} onChange={(e) => setNote(e.target.value)} />
      <Button disabled={saving || !note.trim()} onClick={() => run('reflection', 'note', note.trim(), 'final')}>{existing?.note === note.trim() ? 'SAVED' : 'SAVE'}</Button>
    </div>
  );
}

function CycleDecisionPhone({ k, player, participants, responses, onSubmit }) {
  const table = validTable(player.table_number);
  const key = `cycle-${k}`;
  const l = ledgerFor(participants, responses, table, k - 1, ledgerOpts(k));
  const signal = k === 3 ? currentSignal(responses) : null;
  const board = boardFor(l);
  const proposal = activeProposal(responses, table, key);
  const parsed = parseCycleChoice(proposal?.choice);
  const [cap, setCap] = useState(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const { saving, run } = useSaver(onSubmit);
  if (l.closed) {
    return <Shell compact><section className="phone-card"><div className="eyebrow">CYCLE {k} · TABLE {table}</div><h1>You chose to close your portfolio.</h1><p>Your remaining capacity is kept for what comes next.</p><ReflectionBox player={player} responses={responses} onSubmit={onSubmit} /></section></Shell>;
  }
  if (!board.some(canActOn)) {
    return <Shell compact><section className="phone-card"><div className="eyebrow">CYCLE {k} · TABLE {table}</div><h1>No remaining option fits your available resources.</h1><p>Within this planning period. Your main constraint is {mainConstraint(l)}.</p><ReflectionBox player={player} responses={responses} onSubmit={onSubmit} /></section></Shell>;
  }
  if (parsed) {
    const label = parsed.action === 'hold' ? 'HOLD THIS CYCLE' : parsed.action === 'close' ? 'CLOSE OUR PORTFOLIO' : `${parsed.action.toUpperCase()} · ${capabilityById(parsed.cap)?.name}`;
    const status = parsed.action === 'hold' ? 'You chose to hold capacity. Your resources are intact for what comes next.' : parsed.action === 'close' ? 'No further commitments this planning period.' : 'Here is what this decision changed.';
    const acted = parsed.action === 'invest' || parsed.action === 'prepare';
    const after = acted ? ledgerFor(participants, responses, table, k, ledgerOpts(k)) : null;
    const d = acted ? diffBoards(l, after, parsed.cap) : null;
    return (
      <Shell compact>
        <section className="phone-card">
          <div className="eyebrow">CYCLE {k} · TABLE {table} · DECISION RECORDED</div>
          <h1>{label}</h1>
          <p>{status}</p>
          {d && (
            <div className="status-card">
              <b>WHAT THIS DECISION CHANGED</b>
              <div className="res-strip">{RES_KEYS.map((x, i) => <div key={x}><small>{RES_SHORT[i]}</small><b>{l.have[i]} → {after.have[i]}</b></div>)}</div>
              {d.blocked.length > 0 && <p className="cause">Now harder to reach: {d.blocked.map((x) => `${x.c.name} (${STATE_LABEL[x.to].toLowerCase()}${x.limit ? `, short on ${x.limit.label}` : ''})`).join('; ')}.</p>}
              {d.cheaper.length > 0 && <p>Now cheaper: {listJoin(d.cheaper.map((x) => x.c.name))}.</p>}
              {d.opened.length > 0 && <p>Now easier to reach: {listJoin(d.opened.map((x) => x.c.name))}.</p>}
                {!d.blocked.length && !d.cheaper.length && !d.opened.length && <p>No other option changed. You still have room on the board.</p>}
                {parsed.action === 'invest' && <p><b>Decide early:</b> {capabilityById(parsed.cap)?.early}</p>}
              </div>
          )}
          <Button secondary disabled={saving} onClick={() => run('table_decision', '', 'reopened', key)}>CHANGE OUR DECISION</Button>
          {parsed.action !== 'invest' && parsed.action !== 'prepare' && <ReflectionBox player={player} responses={responses} onSubmit={onSubmit} />}
        </section>
      </Shell>
    );
  }
  const sel = board.find((b) => b.c.id === cap);
  const record = (action, id) => run('table_decision', id ? `${action}|${id}` : action, '', key);
  const noms = responsesOfType(responses, 'cycle_nom', key).filter((r) => validTable(r.table_number) === table);
  const tally = CAPABILITIES.map((c) => ({ c, n: new Set(noms.filter((r) => r.choice === c.id).map((r) => r.participant_id)).size })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  return (
    <Shell compact>
      <section className="phone-card">
        <div className="eyebrow">CYCLE {k} OF 3 · TABLE {table} · SHARED DECISION</div>
          <h1>One decision for your table.</h1>
          <p className="need-line">{DECISION_PROMPT}</p>
        {tally.length > 0 && <p>Nominations: {tally.map((x) => `${x.c.name} ${x.n}`).join(' · ')}</p>}
        <div className="pboard">
          {board.filter(canActOn).map((b) => <BoardCard key={b.c.id} b={b} persona={player.persona} signal={signal} selected={cap === b.c.id} disabled={saving} onClick={() => setCap(b.c.id)} />)}
        </div>
        {sel && (
          <div className="action-row">
            {(sel.state === 'available' || sel.state === 'complete') && <Button disabled={saving} onClick={() => record('invest', sel.c.id)}>INVEST · {sel.c.name.toUpperCase()}</Button>}
            {(sel.state === 'available' || sel.state === 'prepare-only') && <Button secondary disabled={saving} onClick={() => record('prepare', sel.c.id)}>PREPARE · {sel.c.name.toUpperCase()}</Button>}
          </div>
        )}
        <div className="action-row">
          {k < 3 && <Button secondary disabled={saving} onClick={() => record('hold')}>HOLD THIS CYCLE · A FUTURE SIGNAL IS COMING</Button>}
          {!confirmClose ? (
            <Button secondary disabled={saving} onClick={() => setConfirmClose(true)}>CLOSE OUR PORTFOLIO</Button>
          ) : (
            <div className="status-card"><b>Close for this planning period?</b>Your table will not act in the remaining cycles.<div className="action-row"><Button disabled={saving} onClick={() => record('close')}>CONFIRM CLOSE</Button><Button secondary onClick={() => setConfirmClose(false)}>KEEP DECIDING</Button></div></div>
          )}
        </div>
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
  const cap = capabilityById(teachCapFor(participants, responses, table)) || CAPABILITIES[0];
  switch (phase) {
    case 'lobby':
      return <PhoneState kicker={tableLabel} title={'You’re in.'} text={`${h.name}. Stay here. Your facilitator will reveal the challenge.`} />;

    case 'assignments':
      return (
        <Shell compact>
          <section className="phone-card hospital-card">
            <div className="eyebrow">YOU ARE {tableLabel}</div>
            <img className="phone-hospital-image" src={h.image} alt={h.name} onError={(e)=>imageFallback(e)} />
            <h1>{h.name}</h1>
            <h2>{NEED_LINE[h.id]}</h2>
            <p>{h.tagline}</p>
            <div className="wait-note">Your facilitator is guiding the room.</div>
          </section>
        </Shell>
      );

    case 'context':
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">{tableLabel} · YOUR CHALLENGE</div>
            <img className="phone-hospital-image compact-image" src={h.image} alt={h.name} onError={(e)=>imageFallback(e)} />
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
              <b>INVEST</b> commits capacity · <b>PREPARE</b> buys an option · <b>HOLD</b> keeps capacity
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
      return <PhoneState kicker={'SIX POSSIBILITIES · LIMITED CAPACITY'} title="Every table chooses where to go deep first." text="Your facilitator will open private nominations next. Costs differ by hospital." />;
    case 'cap_nominate':
      return <CapabilityNominationPhone player={player} responses={responses} onSubmit={onSubmit} />;
    case 'cap_results':
      return <CapabilityResultsPhone player={player} participants={participants} responses={responses} />;
    case 't_reveal':
      return (
        <Shell compact>
          <section className="phone-card vc-phone">
            <div className="eyebrow">TEACHING ROUND · {tableLabel}</div>
            <img className="phone-hospital-image" src={cap.image} alt="" onError={(e) => imageFallback(e)} />
            <h1>{cap.name}</h1>
            <p className="moment">{careMoment(cap.id)}</p>
            <div className="brief-question"><b>FOR YOU · {brief.name.toUpperCase()}</b><p>{roleLine(cap.id, player.persona)}</p></div>
            <p className="small-note">Make this case to your table before the room reveals every perspective.</p>
            <details className="phone-details">
              <summary>SCOPE AND YOUR QUESTION</summary>
              <p><b>Invest delivers:</b> {cap.scope}</p>
              <p><b>Not included:</b> {cap.excluded}</p>
              <p><b>Your question:</b> {lensFor(cap.id, player.persona)}</p>
            </details>
          </section>
        </Shell>
      );
    case 't_instinct':
      return <VotePhone player={player} responses={responses} onSubmit={onSubmit} type="first_instinct" eyebrow="PRIVATE FIRST INSTINCT" title={`What would you do about ${cap.name}?`} text={lensFor(cap.id, player.persona)} options={CHOICES.map((c) => [c, c.toUpperCase(), CHOICE_TEXT[c]])} savedLabel="FIRST INSTINCT SAVED · YOUR TABLE DECIDES LATER" />;
    case 't_cost':
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">THE PRICE · {h.name}</div>
            <h1>{cap.name} costs more than money.</h1>
            <h3>IF YOU INVEST</h3>
            <div className="res-strip">{RES_KEYS.map((k, i) => <div key={k}><small>{RES_SHORT[i]}</small><b>{startOf(h)[i]} → {startOf(h)[i] - investCost(h.id, cap.id)[i]}</b></div>)}</div>
            <h3>IF YOU PREPARE</h3>
            <p><CostLine cost={prepareCost(h.id, cap.id)} /></p>
            <p>{cap.prepare.pkg} Investing later costs the remainder.</p>
          </section>
        </Shell>
      );
    case 't_mission': {
      const fit = fitFor(cap.id, h.id);
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">MISSION FIT · {h.name}</div>
            <h1>Does {cap.name} advance your mission?</h1>
            <FitChip level={fit.level} />
            <h3>WHY IT FITS</h3><p>{fit.why}</p>
            <h3>THE TRADE-OFF</h3><p>{cap.tradeoff[h.id]}</p>
          </section>
        </Shell>
      );
    }
    case 't_change_vote':
      return <VotePhone player={player} responses={responses} onSubmit={onSubmit} type="change_prediction" eyebrow="PRIVATE PREDICTION · DESIGN" title="The hospital has opened. What would be hardest to change?" text={`Think about ${cap.name}.`} options={CHANGE_OPTIONS.map(([id, label]) => [id, label])} />;
    case 't_design': {
      const mine = myResponse(responses, player.id, 'change_prediction', 'teach');
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">DECIDE EARLY · KEEP CHANGEABLE</div>
            <h1>The device is the easiest thing to change.</h1>
            <p>Your prediction: <b>{CHANGE_OPTIONS.find(([id]) => id === mine?.choice)?.[1] || 'No vote'}</b></p>
            <div className="share-priorities">
              <span><b>DECIDE EARLY</b> · {cap.early}</span>
              <span><b>KEEP CHANGEABLE</b> · {cap.open}</span>
            </div>
            <blockquote>Where it lives, and the infrastructure behind it, is what the building locks in.</blockquote>
          </section>
        </Shell>
      );
    }
    case 't_discuss': {
      const vote = myResponse(responses, player.id, 'first_instinct', 'teach');
      return (
        <Shell compact>
          <section className="phone-card strategic-brief share-brief">
            <div className="eyebrow">DISCUSS AT YOUR TABLE</div>
            <h1>Explain your first instinct.</h1>
            <p>Your first instinct: <b>{vote?.choice?.toUpperCase() || 'NOT SUBMITTED'}</b></p>
            <div className="brief-question"><b>YOUR QUESTION</b><p>{lensFor(cap.id, player.persona)}</p></div>
          </section>
        </Shell>
      );
    }
    case 't_decision':
      return <TableDecisionPhone player={player} participants={participants} responses={responses} onSubmit={onSubmit} keyName="teach" cap={cap} />;
    case 't_checkpoint': {
      const l = ledgerFor(participants, responses, table, 0);
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">TEACHING CHECKPOINT · {tableLabel}</div>
            <h1>{cap.name}: {choiceLabel(l.teach.choice)}</h1>
            <div className="res-strip">{RES_KEYS.map((k, i) => <div key={k}><small>{RES_SHORT[i]}</small><b>{startOf(h)[i]} → {l.have[i]}</b></div>)}</div>
            <p>This is your remaining capacity for everything still ahead.</p>
          </section>
        </Shell>
      );
    }
    case 't_scale_vote':
      return <VotePhone player={player} responses={responses} onSubmit={onSubmit} type="scale_prediction" eyebrow="PRIVATE PREDICTION" title={`Where does the greatest consequence of ${cap.name} fall for your hospital?`} options={PULLBACK_LEVELS.map((x) => [x.id, x.title, x.subtitle])} />;
    case 't_scale_reveal': {
      const mine = myResponse(responses, player.id, 'scale_prediction', 'teach');
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">REVEAL</div>
            <h1>The scales connect.</h1>
            <p>Your prediction: <b>{mine?.choice?.toUpperCase() || 'NO VOTE'}</b></p>
            <div className="share-priorities">
              {PULLBACK_LEVELS.map((x) => <span className="phone-scale-row" key={x.id}><img className="phone-scale-thumb" src={SCALE_VISUALS[x.id]} alt="" onError={(e) => imageFallback(e)} /><span><b>{x.title}</b> · {cap.scale[x.id]}</span></span>)}
            </div>
            <blockquote>The architecture may be enterprise-wide even when the consequence is local.</blockquote>
          </section>
        </Shell>
      );
    }
    case 't_continuum_vote':
      return <VotePhone player={player} responses={responses} onSubmit={onSubmit} type="continuum_prediction" eyebrow="PRIVATE PREDICTION" title={`Where does care go because of ${cap.name}?`} text="Choose the setting that changes most." options={CONTINUUM_OPTIONS.map(([a, b]) => [a.toLowerCase(), a, b])} />;
    case 't_continuum_reveal':
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">REVEAL · {cap.name}</div>
            <h1>{cap.revealLine}</h1>
            <p>{cap.continuum}</p>
            <blockquote>If care can move, what should remain fixed?</blockquote>
          </section>
        </Shell>
      );
    case 't_ripple': {
      const choice = decisionForTable(responses, table, 'teach').choice;
      const x = rippleFor(cap, choice);
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">YOUR HOSPITAL CHANGED · {tableLabel}</div>
            <h1>{cap.name}: {choiceLabel(choice)}</h1>
            <p>{x.headline}</p>
            <div className="share-priorities">
              <span><b>CLINICAL WORK</b> · {x.unit}</span>
              <span><b>FACILITY</b> · {x.facility}</span>
              <span><b>SYSTEM</b> · {x.system}</span>
              <span><b>CARE FLOW</b> · {x.flow}</span>
            </div>
            <p>{cap.context[h.id]}</p>
            {choice && <blockquote>{CLOSING_LINE[choice]}</blockquote>}
          </section>
        </Shell>
      );
    }
    case 'p_open':
      return <TeachRevisePhone player={player} participants={participants} responses={responses} onSubmit={onSubmit} />;
    case 'p1_board': return <BoardPhone key="board-1" k={1} player={player} participants={participants} responses={responses} onSubmit={onSubmit} />;
    case 'p2_board': return <BoardPhone key="board-2" k={2} player={player} participants={participants} responses={responses} onSubmit={onSubmit} />;
    case 'p3_board': return <BoardPhone key="board-3" k={3} player={player} participants={participants} responses={responses} onSubmit={onSubmit} />;
    case 'p1_decide': return <CycleDecisionPhone key="decide-1" k={1} player={player} participants={participants} responses={responses} onSubmit={onSubmit} />;
    case 'p2_decide': return <CycleDecisionPhone key="decide-2" k={2} player={player} participants={participants} responses={responses} onSubmit={onSubmit} />;
    case 'p3_decide': return <CycleDecisionPhone key="decide-3" k={3} player={player} participants={participants} responses={responses} onSubmit={onSubmit} />;
    case 'p_signal': {
      const signal = currentSignal(responses);
      if (!signal) return <PhoneState kicker="THE CHALLENGE" title="Something is about to change." text="Your facilitator is revealing a challenge before the final cycle." />;
      const st = standingText(signalStanding(participants, responses, table, signal));
      const before = ledgerFor(participants, responses, table, 2, { preSignal: true });
      const l = ledgerFor(participants, responses, table, 2);
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">THE CHALLENGE</div>
            <h1>{signal.title}</h1>
            <p>{signal.text}</p>
            <div className="status-card"><b>{st.head}</b>{st.detail}</div>
            <div className="res-strip">{RES_KEYS.map((k, i) => <div key={k}><small>{RES_SHORT[i]}</small><b>{signal.kind === 'shock' ? `${before.have[i]} → ${l.have[i]}` : l.have[i]}</b></div>)}</div>
            <p>{signal.kind === 'shock' ? 'Protection' : 'Capabilities that respond'}: {listJoin(capNames(signal.responds))}</p>
          </section>
        </Shell>
      );
    }
    case 'f_future': {
      const o = outcomeReport(participants, responses, table, currentSignal(responses));
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">FIVE YEARS ON · {tableLabel}</div>
            <h1>{o.headline}</h1>
            <p><b>{o.priorityLine}</b></p>
            <DimList dims={o.dims} lens={ROLE_DIM[player.persona]} />
            {(() => { const d = o.dims.find((x) => x.id === ROLE_DIM[player.persona]); return d && <blockquote>As {brief.name}, you watch {d.label.toLowerCase()}: {OUTCOME_STATUS[d.status].toLowerCase()}.</blockquote>; })()}
            <p className="small-note">Draft outcome model, for discussion.</p>
          </section>
        </Shell>
      );
    }
    case 'f_turns':
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">TURNING POINTS · {tableLabel}</div>
            <h1>The decisions that shaped what came next.</h1>
            <TurnList items={turningPoints(participants, responses, table, currentSignal(responses))} />
          </section>
        </Shell>
      );
    case 'f_locks':
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">WHAT YOUR BUILDING LOCKS IN · {tableLabel}</div>
            <h1>Your portfolio became design commitments.</h1>
            <LockList report={lockReport(ledgerFor(participants, responses, table, 3))} />
          </section>
        </Shell>
      );
    case 'f_compare': {
      const l = ledgerFor(participants, responses, table, 3);
      const need = unresolvedNeed(l);
      const s = signalStanding(participants, responses, table, currentSignal(responses));
      const names = (ids) => (ids.length ? listJoin(capNames(ids)) : 'None');
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">YOUR HOSPITAL · {tableLabel}</div>
            <h1>{h.name}</h1>
            <div className="share-priorities">
              <span><b>COMMITTED</b> · {names(l.invested)}</span>
              <span><b>PREPARED</b> · {names(l.prepared)}</span>
              <span><b>UNRESOLVED NEED · THE GAME’S READ</b> · {need ? `${need.c.name}: ${need.c.exposure}` : 'None of the six'}</span>
              {tableReflections(responses, table).length > 0 && <span><b>UNRESOLVED NEED · YOUR TABLE SAID</b> · “{tableReflections(responses, table)[0]}”</span>}
              <span><b>MAIN CONSTRAINT</b> · {mainConstraint(l)}</span>
              {s && <span><b>CHALLENGE</b> · {standingText(s, true).head}</span>}
            </div>
            <div className="res-strip">{RES_KEYS.map((k, i) => <div key={k}><small>{RES_SHORT[i]}</small><b>{l.have[i]}</b></div>)}</div>
            <blockquote>Context and earlier choices shape what is possible.</blockquote>
          </section>
        </Shell>
      );
    }
    case 'f_debrief': {
      const td = teachDecisionFor(responses, table);
      return <PhoneState kicker="DEBRIEF" title="What did you enable, what did you leave unresolved, and what can you still change?" text={td.choice ? CLOSING_LINE[td.choice] : 'A technology decision is never only a technology decision.'} />;
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
  const [reviewPhase, setReviewPhase] = useState(null);
  const seq = useRef(0);
  const applied = useRef(0);
  const refreshRef = useRef(null);

  const join = async (c) => {
    const found = await fetchSession(c);
    if (!found) {
      setError('Session not found. Check the code and try again.');
      return;
    }
    setCodeValue(c);
    setSession(found);
    if (new URLSearchParams(location.search).get('join') !== c) history.replaceState({}, '', `${location.pathname}?join=${encodeURIComponent(c)}`);
    const saved = sessionStorage.getItem(`hybrid-player-${c}`);
    if (saved) setPlayer(JSON.parse(saved));
  };

  useEffect(() => {
    if (initialCode) join(initialCode);
  }, []);

  useEffect(() => {
    if (!session) return undefined;
    const refresh = async () => {
      const mine = ++seq.current;
      const [current, people, resp] = await Promise.all([
        fetchSession(session.code),
        fetchParticipants(session.id, session.code),
        fetchResponses(session.id, session.code),
      ]);
      if (mine <= applied.current) return;
      applied.current = mine;
      if (current) { setSession((prev) => ({ ...prev, ...current })); setReviewPhase((r) => r === current.phase ? null : r); }
      setParticipants(people);
      setResponses(resp);
    };
    refreshRef.current = refresh;
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

  const submit = async (type, choice, note = '', capabilityId = 'teach') => {
    if (!session || !player) throw new Error('You are not connected to a session.');
    const table = validTable(player.table_number);
    if (!table) {
      setError('A valid table assignment is required.');
      throw new Error('A valid table assignment is required.');
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
      if (refreshRef.current) await refreshRef.current();
    } catch (e) {
      setError(e.message || 'Response could not be saved.');
      throw e;
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
    const livePhase = LEGACY_PHASES[session.phase] || session.phase;
    const visiblePhase = reviewPhase || livePhase;
    const viewSession = { ...session, phase: visiblePhase };
    return (
      <>
        <JourneyNav phase={visiblePhase} maxPhase={livePhase} livePhase={livePhase} participant onGo={(id)=>setReviewPhase(id===livePhase?null:id)} />
        <PhoneErrorBoundary resetKey={visiblePhase}><PlayerView session={viewSession} player={player} participants={participants || []} responses={responses || []} onSubmit={submit} /></PhoneErrorBoundary>
        {error && <div className="toast" onClick={() => setError('')}>{error}</div>}
      </>
    );
}

class PhoneErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state={error:null}; }
  static getDerivedStateFromError(error){ return {error}; }
  componentDidCatch(error,info){ console.error('Participant screen error',error,info); }
  componentDidUpdate(prev){ if(prev.resetKey!==this.props.resetKey && this.state.error) this.setState({error:null}); }
  render(){
    if(!this.state.error) return this.props.children;
    return <Shell compact><section className="phone-card"><div className="eyebrow">SCREEN RECOVERY</div><h1>This screen could not render.</h1><p>Your response is not lost. Return to the live step or reload this phone.</p><pre style={{whiteSpace:'pre-wrap',fontSize:12,padding:12,background:'#f3eee8'}}>{String(this.state.error?.message||this.state.error)}</pre><Button onClick={()=>location.reload()}>RELOAD PHONE</Button></section></Shell>;
  }
}

/* ---------------------------------------------------------------------
   APP ROOT
   --------------------------------------------------------------------- */

export default function App() {
  const query = new URLSearchParams(location.search);
  const joinCode = query.get('join');
  const [mode, setMode] = useState(joinCode ? 'participant' : sessionStorage.getItem('hybrid-facilitator-code') ? 'facilitator' : 'landing');

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
