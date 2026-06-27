/**
 * seed/index.js
 * Populates the database with a realistic, self-consistent SkillSwap community
 * so the product looks alive when demoed to stakeholders.
 *
 * Usage:
 *   npm run seed              # wipe + seed (blocked in production)
 *   npm run seed -- --force   # allow seeding even when NODE_ENV=production
 *
 * Everything generated here is internally consistent:
 *   - credit balances equal the sum of each user's transaction history
 *   - a user's rating equals the average of their received reviews
 *   - swap/session/circle states and timestamps tell a coherent story
 *
 * Every seeded account shares the same password (see seed/data.js) so a
 * presenter can log in as anyone. The default is printed at the end.
 */
const mongoose = require('mongoose');
const { MONGO_URI, NODE_ENV } = require('../config/env');

const User = require('../models/User');
const Swipe = require('../models/Swipe');
const Swap = require('../models/Swap');
const Session = require('../models/Session');
const Review = require('../models/Review');
const Message = require('../models/Message');
const CreditTransaction = require('../models/CreditTransaction');
const LearningCircle = require('../models/LearningCircle');

const { calculateMatchScore } = require('../services/matchingService');
const { DEMO_PASSWORD, users: userData, circleTemplates } = require('./data');

/* ── Tiny deterministic RNG so demos are reproducible run-to-run ──────── */
let _seed = 1337;
const rand = () => {
  _seed = (_seed * 1103515245 + 12345) & 0x7fffffff;
  return _seed / 0x7fffffff;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

/* ── Time helpers ─────────────────────────────────────────────────────── */
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = () => new Date();
const daysAgo = (d) => new Date(Date.now() - d * DAY);
const daysFromNow = (d) => new Date(Date.now() + d * DAY);

/**
 * Mongoose `timestamps: true` overwrites createdAt/updatedAt on save, so to
 * give the demo a believable history we set them directly via the driver.
 */
const backdate = async (Model, id, date) => {
  await Model.collection.updateOne(
    { _id: id },
    { $set: { createdAt: date, updatedAt: date } },
  );
};

/**
 * Clear ONLY demo data, leaving real signups (and their swaps, matches, etc.)
 * intact. This makes re-seeding safe to run at any time without destroying
 * accounts people created.
 */
async function clearDatabase() {
  const demoIds = await User.find({ isDemo: true }).distinct('_id');
  const involvesDemo = (a, b) => ({ $or: [{ [a]: { $in: demoIds } }, { [b]: { $in: demoIds } }] });

  await Promise.all([
    User.deleteMany({ isDemo: true }),
    Swipe.deleteMany(involvesDemo('swiper', 'target')),
    Swap.deleteMany(involvesDemo('requester', 'receiver')),
    Session.deleteMany(involvesDemo('mentor', 'learner')),
    Review.deleteMany(involvesDemo('reviewer', 'reviewee')),
    LearningCircle.deleteMany({ host: { $in: demoIds } }),
    CreditTransaction.deleteMany({ user: { $in: demoIds } }),
    Message.deleteMany({ sender: { $in: demoIds } }),
  ]);
  console.log(`🧹  Cleared ${demoIds.length} demo accounts (real users preserved)`);
}

async function seedUsers() {
  const created = [];
  for (const u of userData) {
    // data.js stores `rating` as an average; the model stores a running sum.
    const ratingSum = Math.round((u.rating || 0) * (u.ratingCount || 0));
    const user = await User.create({
      ...u,
      // No stored photo → frontend renders a safe DiceBear avatar from the name.
      avatar: u.avatar || null,
      password: DEMO_PASSWORD,        // hashed by the model's pre-save hook
      isDemo: true,                   // seeded accounts live in the demo pool
      rating: ratingSum,
      isOnline: rand() < 0.4,
      lastSeen: daysAgo(rand() * 3),
      joinedAt: daysAgo(randInt(20, 200)),
    });
    await backdate(User, user._id, user.joinedAt);
    created.push(user);
  }
  console.log(`👥  Created ${created.length} users`);
  return created;
}

/** Find pairs whose skills genuinely overlap, for realistic swaps. */
function findSwapPairs(users) {
  const offers = (u) => u.skillsOffered.map((s) => s.name.toLowerCase());
  const wants = (u) => u.skillsWanted.map((s) => s.name.toLowerCase());
  const pairs = [];
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < users.length; j++) {
      if (i === j) continue;
      const a = users[i], b = users[j];
      const aOffer = offers(a).find((s) => wants(b).includes(s));
      const bOffer = offers(b).find((s) => wants(a).includes(s));
      if (aOffer && bOffer) {
        pairs.push({ requester: a, receiver: b, requesterSkill: aOffer, receiverSkill: bOffer });
      }
    }
  }
  return pairs;
}

const SWAP_MESSAGES = [
  "Hi! I'd love to swap — your skills are exactly what I'm looking for.",
  "Hey, saw we'd be a great match. Want to set something up this week?",
  "Hello! Happy to teach in exchange for some help on my side. Interested?",
  "Your profile is impressive — would you be up for a skill swap?",
];

async function seedSwaps(users) {
  const pairs = findSwapPairs(users).sort(() => rand() - 0.5);
  // Mix of states so every column on the Swaps page has content.
  const plan = [
    ...Array(8).fill('completed'),
    ...Array(4).fill('accepted'),
    ...Array(3).fill('in_progress'),
    ...Array(5).fill('pending'),
    ...Array(2).fill('rejected'),
    ...Array(1).fill('cancelled'),
  ];
  const swaps = [];
  for (let i = 0; i < plan.length && i < pairs.length; i++) {
    const p = pairs[i];
    const status = plan[i];
    const matchScore = calculateMatchScore(p.requester, p.receiver);
    const createdDays = randInt(2, 60);
    const swap = await Swap.create({
      requester: p.requester._id,
      receiver: p.receiver._id,
      requesterSkill: capitalize(p.requesterSkill),
      receiverSkill: capitalize(p.receiverSkill),
      status,
      matchScore,
      message: pick(SWAP_MESSAGES),
      scheduledAt: ['accepted', 'in_progress'].includes(status) ? daysFromNow(randInt(1, 7)) : null,
      completedAt: status === 'completed' ? daysAgo(randInt(1, createdDays - 1 || 1)) : null,
      requesterRated: status === 'completed',
      receiverRated: status === 'completed' && rand() < 0.8,
    });
    await backdate(Swap, swap._id, daysAgo(createdDays));
    swaps.push({ swap, ...p });
  }
  console.log(`🔄  Created ${swaps.length} swaps`);
  return swaps;
}

async function seedSessions(users) {
  const mentors = users.filter((u) => u.skillsOffered.length > 0);
  const sessions = [];
  const states = [
    ...Array(6).fill('open'),
    ...Array(2).fill('active'),
    ...Array(5).fill('completed'),
  ];
  for (const status of states) {
    const mentor = pick(mentors);
    const skill = pick(mentor.skillsOffered).name;
    const learner = status === 'open' ? null : pick(users.filter((u) => !u._id.equals(mentor._id)));
    const cost = pick([15, 20, 25, 30]);
    const createdDays = randInt(1, 30);
    const session = await Session.create({
      mentor: mentor._id,
      learner: learner ? learner._id : null,
      skill,
      type: pick(['instant', 'scheduled']),
      status,
      creditCost: cost,
      isDemo: true,
      duration: pick([15, 30, 45]),
      scheduledAt: status === 'open' ? daysFromNow(randInt(1, 10)) : null,
      startedAt: status !== 'open' ? daysAgo(randInt(1, createdDays)) : null,
      completedAt: status === 'completed' ? daysAgo(randInt(1, createdDays)) : null,
      description: `${skill} — ${pick([
        'a focused intro for beginners',
        'hands-on practice with real examples',
        'Q&A and code review',
        'fundamentals and best practices',
      ])}.`,
    });
    await backdate(Session, session._id, daysAgo(createdDays));
    sessions.push({ session, mentor, learner });
  }
  console.log(`🎓  Created ${sessions.length} sessions`);
  return sessions;
}

// Comments grouped by sentiment so a 3-star review doesn't read like a rave.
const POSITIVE_COMMENTS = [
  'Genuinely one of the best sessions I\'ve had here. Walked me through my own codebase line by line.',
  'Learned more in 30 minutes than in weeks on my own. Already booked a follow-up.',
  'Super patient with my dumb questions 😅 highly recommend.',
  'Knew the material cold and adapted to exactly what I needed. Thank you!',
  'Clear, practical, no fluff. Gave me three concrete things to try this week.',
  'Lovely person and a great teacher. We even went a few minutes over to finish a topic.',
];
const MIXED_COMMENTS = [
  'Helpful overall, though we spent a bit too long on setup.',
  'Knows their stuff, but the pacing was a little fast for a beginner like me.',
  'Good session. Would\'ve liked a few more hands-on examples.',
  'Solid intro. Audio cut out a couple times but we got through it.',
  'Decent — friendly and prepared, just not as in-depth as I\'d hoped.',
  'Fine session. Showed up a little late but made up the time.',
];
const REVIEW_TAGS = ['Knowledgeable', 'Patient', 'Punctual', 'Clear communicator', 'Well prepared', 'Friendly'];

/** Realistic rating spread: mostly 4-5, a real minority of 3s, the odd 2. */
const sampleRating = () => {
  const r = rand();
  if (r < 0.45) return 5;
  if (r < 0.78) return 4;
  if (r < 0.93) return 3;
  return 2;
};

async function seedReviews(swaps, sessions, userMap) {
  let count = 0;
  const addReview = async (reviewerId, revieweeId, refId, refModel, when) => {
    const rating = sampleRating();
    const positive = rating >= 4;
    const review = await Review.create({
      reviewer: reviewerId,
      reviewee: revieweeId,
      reference: refId,
      referenceModel: refModel,
      rating,
      // ~20% leave no written comment, like real users.
      comment: rand() < 0.2 ? '' : pick(positive ? POSITIVE_COMMENTS : MIXED_COMMENTS),
      tags: positive ? [pick(REVIEW_TAGS), pick(REVIEW_TAGS)].filter((v, i, a) => a.indexOf(v) === i) : [],
    });
    await backdate(Review, review._id, when);
    // Keep the reviewee's aggregate rating consistent with their reviews.
    const reviewee = userMap.get(revieweeId.toString());
    reviewee.rating += rating;
    reviewee.ratingCount += 1;
    count++;
  };

  for (const { swap } of swaps.filter((s) => s.swap.status === 'completed')) {
    await addReview(swap.requester, swap.receiver, swap._id, 'Swap', swap.completedAt || daysAgo(5));
    if (swap.receiverRated) {
      await addReview(swap.receiver, swap.requester, swap._id, 'Swap', swap.completedAt || daysAgo(5));
    }
  }
  for (const { session, learner } of sessions.filter((s) => s.session.status === 'completed' && s.learner)) {
    await addReview(learner._id, session.mentor, session._id, 'Session', session.completedAt || daysAgo(5));
  }

  // Persist updated aggregate ratings.
  await Promise.all([...userMap.values()].map((u) =>
    User.updateOne({ _id: u._id }, { $set: { rating: u.rating, ratingCount: u.ratingCount } })));

  console.log(`⭐  Created ${count} reviews`);
}

async function seedCircles(users, userMap) {
  const circles = [];
  for (const t of circleTemplates) {
    const host = users.find((u) => u.email === t.hostEmail);
    // Members: a believable subset of other users (host is implicitly involved).
    const others = users.filter((u) => !u._id.equals(host._id)).sort(() => rand() - 0.5);
    const memberCount = randInt(2, Math.min(t.maxMembers - 1, 7));
    const members = others.slice(0, memberCount).map((u) => u._id);
    const circle = await LearningCircle.create({
      host: host._id,
      title: t.title,
      description: t.description,
      skill: t.skill,
      maxMembers: t.maxMembers,
      members,
      status: t.status,
      creditCostPerMember: t.creditCostPerMember,
      scheduledAt: daysFromNow(t.daysFromNow),
      tags: t.tags,
      isDemo: true,
    });
    await backdate(LearningCircle, circle._id, daysAgo(randInt(1, 14)));
    circles.push(circle);
  }
  console.log(`⭕  Created ${circles.length} learning circles`);
  return circles;
}

const CHAT_SCRIPTS = [
  ['Hey! Excited to get started 🙌', 'Same here! What time works for you?',
   'How about Thursday evening?', 'Perfect, Thursday it is. I\'ll send a link.'],
  ['Hi, thanks for accepting!', 'Of course — looking forward to it.',
   'Any prep you\'d recommend before we meet?', 'Just bring questions, we\'ll go from there.'],
];

async function seedMessages(swaps, userMap) {
  // Add chat history to a few active/accepted swaps so the chat UI isn't empty.
  const chatty = swaps.filter((s) => ['accepted', 'in_progress', 'completed'].includes(s.swap.status)).slice(0, 4);
  let count = 0;
  for (const { swap, requester, receiver } of chatty) {
    const script = pick(CHAT_SCRIPTS);
    const speakers = [requester._id, receiver._id];
    for (let i = 0; i < script.length; i++) {
      const msg = await Message.create({
        room: swap.chatRoom,
        sender: speakers[i % 2],
        content: script[i],
        type: 'text',
        readBy: speakers,
      });
      await backdate(Message, msg._id, new Date(Date.now() - (script.length - i) * HOUR));
      count++;
    }
  }
  console.log(`💬  Created ${count} chat messages`);
}

/** Build a coherent credit-transaction history whose final balance is stored. */
async function seedCredits(users) {
  let count = 0;
  for (const user of users) {
    const txs = [];
    let balance = 0;
    const push = (type, amount, description, when) => {
      balance += (type === 'spend' || type === 'penalty') ? -amount : amount;
      balance = Math.max(0, balance);
      txs.push({ type, amount, description, balanceAfter: balance, when });
    };

    push('bonus', 100, 'Welcome bonus 🎉', user.joinedAt);
    // Earn for things they completed; spend on sessions they took.
    for (let i = 0; i < user.swapsCompleted; i++) {
      push('earn', randInt(10, 25), 'Completed a skill swap', daysAgo(randInt(1, 180)));
    }
    for (let i = 0; i < Math.floor(user.sessionsCompleted / 2); i++) {
      push('spend', randInt(15, 30), 'Joined a learning session', daysAgo(randInt(1, 180)));
    }
    for (let i = 0; i < Math.ceil(user.sessionsCompleted / 2); i++) {
      push('earn', randInt(15, 30), 'Mentored a session', daysAgo(randInt(1, 180)));
    }
    if (rand() < 0.3) push('bonus', 25, 'Skill verification bonus', daysAgo(randInt(5, 60)));

    txs.sort((a, b) => a.when - b.when);
    // Recompute running balance in chronological order.
    balance = 0;
    for (const t of txs) {
      balance += (t.type === 'spend' || t.type === 'penalty') ? -t.amount : t.amount;
      balance = Math.max(0, balance);
      t.balanceAfter = balance;
    }

    for (const t of txs) {
      const tx = await CreditTransaction.create({
        user: user._id, type: t.type, amount: t.amount,
        balanceAfter: t.balanceAfter, description: t.description,
      });
      await backdate(CreditTransaction, tx._id, t.when);
      count++;
    }
    // Store the final balance so the wallet matches the history exactly.
    await User.updateOne({ _id: user._id }, { $set: { creditBalance: balance } });
  }
  console.log(`💰  Created ${count} credit transactions`);
}

/**
 * Seed swipe history so the deck, matches, and live "It's a match!" all have
 * something to show. The demo user (users[0]) gets:
 *   - a few ready-made mutual matches (visible on /matches immediately)
 *   - several incoming likes (people who already liked them) so swiping right
 *     triggers an instant match during the demo
 *   - a couple of passes (kept out of the feed)
 * Everyone else gets believable random activity, with some mutual matches too.
 */
async function seedSwipes(users) {
  let count = 0;
  const seen = new Set();           // `${swiper}:${target}` guard against the unique index
  const swipe = async (a, b, action) => {
    const key = `${a._id}:${b._id}`;
    if (a._id.equals(b._id) || seen.has(key)) return;
    seen.add(key);
    await Swipe.create({ swiper: a._id, target: b._id, action });
    count++;
  };
  const like = (a, b) => swipe(a, b, 'like');
  const pass = (a, b) => swipe(a, b, 'pass');

  const me = users[0];
  const others = users.filter((u) => !u._id.equals(me._id)).sort(() => rand() - 0.5);

  const mutuals = others.slice(0, 4);     // full matches for the demo user
  for (const u of mutuals) { await like(me, u); await like(u, me); }

  const incoming = others.slice(4, 9);    // they liked me; I haven't decided → instant match on right-swipe
  for (const u of incoming) { await like(u, me); }

  const passed = others.slice(9, 11);     // I passed → stays out of my feed
  for (const u of passed) { await pass(me, u); }

  // Believable activity among everyone else (some of which forms mutual matches).
  for (const u of others) {
    const candidates = others
      .filter((o) => !o._id.equals(u._id))
      .sort(() => rand() - 0.5)
      .slice(0, randInt(2, 5));
    for (const c of candidates) {
      await (rand() < 0.6 ? like(u, c) : pass(u, c));
    }
  }
  console.log(`💘  Created ${count} swipes`);
}

function capitalize(s) {
  return s.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

async function run() {
  const force = process.argv.includes('--force');
  if (NODE_ENV === 'production' && !force) {
    console.error('🚫  Refusing to seed in production. Re-run with --force if you really mean it.');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log(`✅  Connected to MongoDB (${NODE_ENV})`);

  await clearDatabase();
  const users = await seedUsers();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const swaps = await seedSwaps(users);
  const sessions = await seedSessions(users);
  await seedReviews(swaps, sessions, userMap);
  await seedCircles(users, userMap);
  await seedMessages(swaps, userMap);
  await seedSwipes(users);
  await seedCredits(users);

  console.log('\n✨  Seed complete!');
  console.log('────────────────────────────────────────');
  console.log(`   ${users.length} users — log in as any of them:`);
  console.log(`   e.g.  ${userData[0].email}  /  ${DEMO_PASSWORD}`);
  console.log(`         ${userData[4].email}  /  ${DEMO_PASSWORD}`);
  console.log('────────────────────────────────────────');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
