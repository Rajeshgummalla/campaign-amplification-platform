import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

// ─── Configuration ────────────────────────────────────────────────────────────

const PORT = process.env.PORT ?? 3001;
const JWT_SECRET = process.env.JWT_SECRET ?? 'campaign-app-dev-secret-key-change-in-prod';

// ─── Database Setup ───────────────────────────────────────────────────────────

const dbDir = path.resolve(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.join(dbDir, 'campaigns.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'reviewer', 'creator')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    category_color TEXT DEFAULT '#4F46E5',
    creator_id TEXT NOT NULL,
    creator_name TEXT NOT NULL,
    creator_type TEXT DEFAULT 'individual',
    summary TEXT DEFAULT '',
    story TEXT DEFAULT '',
    cover_image TEXT DEFAULT '',
    ad_headline TEXT DEFAULT '',
    ad_description TEXT DEFAULT '',
    call_to_action TEXT DEFAULT 'Learn More',
    target_amount REAL DEFAULT 0,
    raised_amount REAL DEFAULT 0,
    backer_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft','submitted','under_review','changes_requested','approved','funding','goal_reached','preparing','promoting','completed','rejected','cancelled')),
    reach_estimate INTEGER DEFAULT 0,
    reach_per_dollar INTEGER DEFAULT 100,
    duration INTEGER DEFAULT 30,
    days_left INTEGER DEFAULT 30,
    target_locations TEXT DEFAULT '[]',
    target_audience TEXT DEFAULT '',
    channels TEXT DEFAULT '[]',
    sources TEXT DEFAULT '[]',
    tags TEXT DEFAULT '[]',
    platform_fee_percent REAL DEFAULT 8,
    processing_fee_percent REAL DEFAULT 3,
    featured INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    submitted_at DATETIME,
    approved_at DATETIME,
    FOREIGN KEY (creator_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS contributions (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    user_id TEXT,
    guest_email TEXT,
    amount REAL NOT NULL,
    fees REAL DEFAULT 0,
    total REAL NOT NULL,
    estimated_reach INTEGER DEFAULT 0,
    is_anonymous INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','failed','refunded','cancelled')),
    payment_method TEXT DEFAULT 'card',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    campaign_id TEXT,
    campaign_title TEXT,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS review_decisions (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    reviewer_id TEXT NOT NULL,
    decision TEXT NOT NULL CHECK(decision IN ('approved','rejected','changes_requested')),
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id)
  );
`);

// ─── Seed Data ────────────────────────────────────────────────────────────────

const adminHash = bcrypt.hashSync('Munni1314$', 10);
const demoHash = bcrypt.hashSync('backer123', 10);

// Ensure User and Admin roles exist in the database
db.prepare(`
  INSERT OR REPLACE INTO users (id, name, email, password_hash, role, avatar, bio)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(
  'admin-1',
  'Nani Gummalla',
  'nanigummalla418@gmail.com',
  adminHash,
  'admin',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
  'Platform Administrator & Content Reviewer. Ensuring accuracy, source credibility, and guideline compliance.'
);

db.prepare(`
  INSERT OR REPLACE INTO users (id, name, email, password_hash, role, avatar, bio)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(
  'demo-user-1',
  'Alex Rivera',
  'alex@example.com',
  demoHash,
  'user',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
  'Community advocate & active backer. Passionate about public health and environmental initiatives.'
);

const existingCampaign = db.prepare('SELECT id FROM campaigns LIMIT 1').get();
if (!existingCampaign) {
  console.log('Seeding demo campaigns...');
  const campaigns = [
    { title: 'Clean Air Initiative: Reduce Urban Pollution Now', category: 'Environment', color: '#10B981', creator: 'Clean Cities Coalition', ctype: 'nonprofit', summary: 'Help us spread the message about proven urban air quality improvements that cities can implement today to protect public health.', cover: 'https://images.unsplash.com/photo-1569163139394-de4e5f43e5e2?w=800&q=80', target: 25000, raised: 18750, backers: 342, status: 'funding', reach: 2500000, days: 14, featured: 1, locations: '["United States","Canada","United Kingdom"]', audience: 'Urban residents, environmental advocates', channels: '["Social Media","Search Ads","Display Network"]', tags: '["air quality","urban","environment"]', impressions: 1200000, clicks: 48000 },
    { title: 'Mental Health Awareness: Break the Silence in Schools', category: 'Health', color: '#EF4444', creator: 'Mind Matters Foundation', ctype: 'nonprofit', summary: 'One in four students struggles with mental health issues in silence.', cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80', target: 15000, raised: 15000, backers: 518, status: 'promoting', reach: 1500000, days: 0, featured: 1, locations: '["United States"]', audience: 'Parents, teachers, high school students', channels: '["Social Media","YouTube","Search Ads"]', tags: '["mental health","education","students"]', impressions: 890000, clicks: 42000 },
    { title: 'Protect Net Neutrality: Your Internet, Your Rights', category: 'Public Policy', color: '#8B5CF6', creator: 'Digital Rights Watch', ctype: 'advocacy', summary: 'ISPs should not be able to slow, block, or create paid fast lanes for internet traffic.', cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80', target: 30000, raised: 8400, backers: 189, status: 'funding', reach: 3000000, days: 31, featured: 0, locations: '["United States"]', audience: 'Registered voters, tech-savvy adults', channels: '["Social Media","Search Ads","News Sites"]', tags: '["net neutrality","internet","policy"]', impressions: 320000, clicks: 18000 },
    { title: 'STEM Education for Rural Students: Closing the Gap', category: 'Education', color: '#F59E0B', creator: 'Rural STEM Project', ctype: 'nonprofit', summary: 'Rural students have fewer STEM opportunities. This campaign raises awareness of free online resources.', cover: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80', target: 20000, raised: 12300, backers: 276, status: 'funding', reach: 2000000, days: 20, featured: 1, locations: '["United States"]', audience: 'Parents in rural areas, K-12 teachers', channels: '["Social Media","Search Ads","Education Platforms"]', tags: '["STEM","rural","education"]', impressions: 680000, clicks: 31000 },
  ];

  const insertCampaign = db.prepare(`
    INSERT INTO campaigns (id, title, category, category_color, creator_id, creator_name, creator_type, summary, cover_image, target_amount, raised_amount, backer_count, status, reach_estimate, duration, days_left, target_locations, target_audience, channels, tags, featured, impressions, clicks, created_at, approved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 30, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'), datetime('now', '-' || ? || ' days'))
  `);

  const demoId = 'demo-user-1';
  const creatorId = 'creator-1';

  campaigns.forEach((c, i) => {
    const cid = c.creator.includes('STEM') ? creatorId : demoId;
    insertCampaign.run(
      `c${i + 1}`, c.title, c.category, c.color, cid, c.creator, c.ctype,
      c.summary, c.cover, c.target, c.raised, c.backers, c.status, c.reach,
      c.days, c.locations, c.audience, c.channels, c.tags, c.featured,
      c.impressions, c.clicks, 30 - i * 5, 25 - i * 5
    );
  });

  console.log('Demo data seeded successfully.');
}

// ─── Express App ──────────────────────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json());

// ─── Auth Middleware ───────────────────────────────────────────────────────────

interface AuthRequest extends express.Request {
  userId?: string;
  userRole?: string;
}

function authMiddleware(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function optionalAuth(req: AuthRequest, _res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as any;
      req.userId = payload.userId;
      req.userRole = payload.role;
    } catch { /* guest */ }
  }
  next();
}

function adminOnly(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  if (req.userRole !== 'admin' && req.userRole !== 'reviewer') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// ─── Auth Routes ──────────────────────────────────────────────────────────────

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const id = uuidv4();
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)').run(id, name, email, hash);

  const token = jwt.sign({ userId: id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id, name, email, role: 'user' } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, bio: user.bio } });
});

app.get('/api/auth/me', authMiddleware as any, (req: AuthRequest, res) => {
  const user: any = db.prepare('SELECT id, name, email, role, avatar, bio, created_at FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// ─── Campaign Routes ──────────────────────────────────────────────────────────

app.get('/api/campaigns', optionalAuth as any, (req: AuthRequest, res) => {
  const { search, category, sort, status, featured } = req.query;
  let query = "SELECT * FROM campaigns WHERE status NOT IN ('draft')";
  const params: any[] = [];

  if (search) {
    query += ' AND (title LIKE ? OR summary LIKE ? OR creator_name LIKE ? OR tags LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }
  if (category && category !== 'all') {
    query += ' AND LOWER(category) = ?';
    params.push((category as string).toLowerCase().replace(/-/g, ' '));
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (featured === 'true') {
    query += ' AND featured = 1';
  }

  switch (sort) {
    case 'newest': query += ' ORDER BY created_at DESC'; break;
    case 'most_funded': query += ' ORDER BY raised_amount DESC'; break;
    case 'ending_soon': query += ' ORDER BY days_left ASC'; break;
    default: query += ' ORDER BY backer_count DESC';
  }

  const campaigns = db.prepare(query).all(...params);
  res.json({ campaigns: campaigns.map(parseCampaign) });
});

app.get('/api/campaigns/featured', (_req, res) => {
  const campaigns = db.prepare("SELECT * FROM campaigns WHERE featured = 1 AND status NOT IN ('draft') ORDER BY raised_amount DESC LIMIT 5").all();
  res.json({ campaigns: campaigns.map(parseCampaign) });
});

app.get('/api/campaigns/:id', (req, res) => {
  const campaign: any = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  res.json({ campaign: parseCampaign(campaign) });
});

app.post('/api/campaigns', authMiddleware as any, (req: AuthRequest, res) => {
  const id = uuidv4();
  const {
    title, category, creatorName, summary, story, coverImage,
    adHeadline, adDescription, callToAction, targetAmount,
    duration, targetLocations, targetAudience, channels, sources, tags,
  } = req.body;

  if (!title || !category) return res.status(400).json({ error: 'Title and category are required' });

  db.prepare(`
    INSERT INTO campaigns (id, title, category, creator_id, creator_name, summary, story, cover_image, ad_headline, ad_description, call_to_action, target_amount, duration, days_left, target_locations, target_audience, channels, sources, tags, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
  `).run(
    id, title, category, req.userId, creatorName ?? '', summary ?? '', story ?? '',
    coverImage ?? '', adHeadline ?? '', adDescription ?? '', callToAction ?? 'Learn More',
    targetAmount ?? 0, duration ?? 30, duration ?? 30,
    JSON.stringify(targetLocations ?? []), targetAudience ?? '',
    JSON.stringify(channels ?? []), JSON.stringify(sources ?? []), JSON.stringify(tags ?? [])
  );

  res.status(201).json({ id, status: 'draft' });
});

app.put('/api/campaigns/:id', authMiddleware as any, (req: AuthRequest, res) => {
  const campaign: any = db.prepare('SELECT * FROM campaigns WHERE id = ? AND creator_id = ?').get(req.params.id, req.userId);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  if (!['draft', 'changes_requested'].includes(campaign.status)) {
    return res.status(400).json({ error: 'Campaign cannot be edited in current status' });
  }

  const fields = req.body;
  const updates: string[] = [];
  const values: any[] = [];

  for (const [key, val] of Object.entries(fields)) {
    const col = key.replace(/[A-Z]/g, l => '_' + l.toLowerCase());
    if (['target_locations', 'channels', 'sources', 'tags'].includes(col)) {
      updates.push(`${col} = ?`);
      values.push(JSON.stringify(val));
    } else {
      updates.push(`${col} = ?`);
      values.push(val);
    }
  }

  if (updates.length > 0) {
    db.prepare(`UPDATE campaigns SET ${updates.join(', ')} WHERE id = ?`).run(...values, req.params.id);
  }
  res.json({ success: true });
});

app.post('/api/campaigns/:id/submit', authMiddleware as any, (req: AuthRequest, res) => {
  const campaign: any = db.prepare('SELECT * FROM campaigns WHERE id = ? AND creator_id = ?').get(req.params.id, req.userId);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  if (!['draft', 'changes_requested'].includes(campaign.status)) {
    return res.status(400).json({ error: 'Campaign cannot be submitted in current status' });
  }

  db.prepare('UPDATE campaigns SET status = ?, submitted_at = CURRENT_TIMESTAMP WHERE id = ?').run('submitted', req.params.id);

  // Create notification
  db.prepare('INSERT INTO notifications (id, user_id, type, title, message, campaign_id, campaign_title) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(uuidv4(), req.userId, 'campaign_submitted', 'Campaign submitted for review', `Your campaign "${campaign.title}" has been submitted and is now under review.`, req.params.id, campaign.title);

  res.json({ success: true, status: 'submitted' });
});

// ─── Contribution Routes ──────────────────────────────────────────────────────

app.post('/api/contributions', optionalAuth as any, (req: AuthRequest, res) => {
  const { campaignId, amount, isAnonymous, guestEmail, paymentMethod } = req.body;
  if (!campaignId || !amount || amount <= 0) return res.status(400).json({ error: 'Campaign ID and valid amount required' });

  const campaign: any = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  if (campaign.status !== 'funding') return res.status(400).json({ error: 'Campaign is not currently accepting contributions' });

  const fees = Math.round(amount * 0.11 * 100) / 100;
  const total = amount + fees;
  const estimatedReach = Math.round(amount * 0.89 * 100);

  const id = uuidv4();
  db.prepare(`
    INSERT INTO contributions (id, campaign_id, user_id, guest_email, amount, fees, total, estimated_reach, is_anonymous, status, payment_method)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)
  `).run(id, campaignId, req.userId ?? null, guestEmail ?? null, amount, fees, total, estimatedReach, isAnonymous ? 1 : 0, paymentMethod ?? 'card');

  // Update campaign
  db.prepare('UPDATE campaigns SET raised_amount = raised_amount + ?, backer_count = backer_count + 1 WHERE id = ?').run(amount, campaignId);

  // Check if goal reached
  const updated: any = db.prepare('SELECT raised_amount, target_amount, title FROM campaigns WHERE id = ?').get(campaignId);
  if (updated.raised_amount >= updated.target_amount) {
    db.prepare('UPDATE campaigns SET status = ? WHERE id = ? AND status = ?').run('goal_reached', campaignId, 'funding');
  }

  // Notification for user
  if (req.userId) {
    db.prepare('INSERT INTO notifications (id, user_id, type, title, message, campaign_id, campaign_title) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(uuidv4(), req.userId, 'contribution_confirmed', 'Contribution confirmed', `Your \$${amount} contribution to "${updated.title}" was successful.`, campaignId, updated.title);
  }

  res.status(201).json({
    id,
    status: 'confirmed',
    amount,
    fees,
    total,
    estimatedReach,
    campaignProgress: {
      raised: updated.raised_amount,
      target: updated.target_amount,
      percentage: Math.min(Math.round((updated.raised_amount / updated.target_amount) * 100), 100),
    },
  });
});

app.get('/api/contributions/mine', authMiddleware as any, (req: AuthRequest, res) => {
  const contributions = db.prepare(`
    SELECT c.*, cam.title as campaign_title, cam.cover_image as campaign_image
    FROM contributions c
    JOIN campaigns cam ON c.campaign_id = cam.id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
  `).all(req.userId);
  res.json({ contributions });
});

// ─── Notification Routes ──────────────────────────────────────────────────────

app.get('/api/notifications', authMiddleware as any, (req: AuthRequest, res) => {
  const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.userId);
  const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0').get(req.userId) as any;
  res.json({ notifications, unreadCount: unreadCount.count });
});

app.put('/api/notifications/:id/read', authMiddleware as any, (req: AuthRequest, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

app.put('/api/notifications/read-all', authMiddleware as any, (req: AuthRequest, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.userId);
  res.json({ success: true });
});

// ─── Admin / Review Routes ────────────────────────────────────────────────────

app.get('/api/admin/campaigns', authMiddleware as any, adminOnly as any, (_req: AuthRequest, res) => {
  const campaigns = db.prepare('SELECT * FROM campaigns ORDER BY created_at DESC').all();
  res.json({ campaigns: campaigns.map(parseCampaign) });
});

app.get('/api/admin/campaigns/pending', authMiddleware as any, adminOnly as any, (_req: AuthRequest, res) => {
  const campaigns = db.prepare("SELECT * FROM campaigns WHERE status = 'submitted' ORDER BY submitted_at ASC").all();
  res.json({ campaigns: campaigns.map(parseCampaign) });
});

app.post('/api/admin/campaigns/:id/review', authMiddleware as any, adminOnly as any, (req: AuthRequest, res) => {
  const { decision, notes } = req.body;
  if (!['approved', 'rejected', 'changes_requested'].includes(decision)) {
    return res.status(400).json({ error: 'Invalid decision' });
  }

  const campaign: any = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  let newStatus = decision;
  if (decision === 'approved') {
    newStatus = 'funding';
    db.prepare('UPDATE campaigns SET status = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStatus, req.params.id);
  } else {
    db.prepare('UPDATE campaigns SET status = ? WHERE id = ?').run(newStatus, req.params.id);
  }

  // Record decision
  db.prepare('INSERT INTO review_decisions (id, campaign_id, reviewer_id, decision, notes) VALUES (?, ?, ?, ?, ?)')
    .run(uuidv4(), req.params.id, req.userId, decision, notes ?? '');

  // Notify creator
  const notifType = decision === 'approved' ? 'campaign_approved' : decision === 'rejected' ? 'campaign_rejected' : 'campaign_changes_requested';
  const notifTitle = decision === 'approved' ? 'Campaign approved ✓' : decision === 'rejected' ? 'Campaign rejected' : 'Changes requested';
  const notifMsg = decision === 'approved'
    ? `Your campaign "${campaign.title}" has been approved and is now live for backing.`
    : decision === 'rejected'
    ? `Your campaign "${campaign.title}" has been rejected. ${notes || ''}`
    : `Your campaign "${campaign.title}" requires changes. ${notes || ''}`;

  db.prepare('INSERT INTO notifications (id, user_id, type, title, message, campaign_id, campaign_title) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(uuidv4(), campaign.creator_id, notifType, notifTitle, notifMsg, req.params.id, campaign.title);

  res.json({ success: true, status: newStatus });
});

app.get('/api/admin/stats', authMiddleware as any, adminOnly as any, (_req: AuthRequest, res) => {
  const totalCampaigns = (db.prepare('SELECT COUNT(*) as count FROM campaigns').get() as any).count;
  const activeCampaigns = (db.prepare("SELECT COUNT(*) as count FROM campaigns WHERE status IN ('funding','promoting')").get() as any).count;
  const pendingReview = (db.prepare("SELECT COUNT(*) as count FROM campaigns WHERE status = 'submitted'").get() as any).count;
  const totalRaised = (db.prepare('SELECT COALESCE(SUM(raised_amount), 0) as total FROM campaigns').get() as any).total;
  const totalContributions = (db.prepare("SELECT COUNT(*) as count FROM contributions WHERE status = 'confirmed'").get() as any).count;
  const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;

  res.json({ totalCampaigns, activeCampaigns, pendingReview, totalRaised, totalContributions, totalUsers });
});

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseCampaign(c: any) {
  return {
    ...c,
    targetLocations: tryParseJSON(c.target_locations),
    channels: tryParseJSON(c.channels),
    sources: tryParseJSON(c.sources),
    tags: tryParseJSON(c.tags),
    featured: !!c.featured,
    targetAmount: c.target_amount,
    raisedAmount: c.raised_amount,
    backerCount: c.backer_count,
    categoryColor: c.category_color,
    creatorName: c.creator_name,
    creatorType: c.creator_type,
    coverImage: c.cover_image,
    adHeadline: c.ad_headline,
    adDescription: c.ad_description,
    callToAction: c.call_to_action,
    reachEstimate: c.reach_estimate,
    reachPerDollar: c.reach_per_dollar,
    daysLeft: c.days_left,
    targetAudience: c.target_audience,
    platformFeePercent: c.platform_fee_percent,
    processingFeePercent: c.processing_fee_percent,
    createdAt: c.created_at,
    submittedAt: c.submitted_at,
    approvedAt: c.approved_at,
  };
}

function tryParseJSON(str: string): any[] {
  try { return JSON.parse(str ?? '[]'); } catch { return []; }
}

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Campaign API Server running at http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Campaigns: http://localhost:${PORT}/api/campaigns`);
  console.log(`\n   Admin login: nanigummalla418@gmail.com / Munni1314$`);
  console.log(`   User login: alex@example.com / backer123\n`);
});
