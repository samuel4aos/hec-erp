require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const membersRoutes = require('./routes/members');
const eventsRoutes = require('./routes/events');
const prayersRoutes = require('./routes/prayers');
const givingRoutes = require('./routes/giving');
const communicationRoutes = require('./routes/communication');
const serviceCountsRoutes = require('./routes/serviceCounts');
const bookstoreRoutes = require('./routes/bookstore');
const branchesRoutes = require('./routes/branches');
const testimoniesRoutes = require('./routes/testimonies');
const cellGroupsRoutes = require('./routes/cellGroups');
const eventRegistrationsRoutes = require('./routes/eventRegistrations');
const firstTimersRoutes = require('./routes/firstTimers');
const attendanceRoutes = require('./routes/attendance');
const counsellingRoutes = require('./routes/counselling');
const soulWinningRoutes = require('./routes/soulWinning');
const prayerChainRoutes = require('./routes/prayerChain');
const exportRoutes = require('./routes/export');
const coursesRoutes = require('./routes/courses');
const expensesRoutes = require('./routes/expenses');
const cmsRoutes = require('./routes/cms');
const enrollmentsRoutes = require('./routes/enrollments');
const auditRoutes = require('./routes/audit');
const analyticsRoutes = require('./routes/analytics');
const remittancesRoutes = require('./routes/remittances');
const uploadsRoutes = require('./routes/uploads');
const preacherLogRoutes = require('./routes/preacherLog');
const { runMigrations } = require('./migrations');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'https://hec.vercel.app',
].filter(Boolean);
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Migrations (safe to run on every start)
runMigrations().catch(e => console.error('Migration error:', e));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.6.0' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/prayers', prayersRoutes);
app.use('/api/giving', givingRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/service-counts', serviceCountsRoutes);
app.use('/api/bookstore', bookstoreRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/testimonies', testimoniesRoutes);
app.use('/api/cell-groups', cellGroupsRoutes);
app.use('/api/event-registrations', eventRegistrationsRoutes);
app.use('/api/first-timers', firstTimersRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/counselling', counsellingRoutes);
app.use('/api/soul-winning', soulWinningRoutes);
app.use('/api/prayer-chain', prayerChainRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/remittances', remittancesRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/preacher-log', preacherLogRoutes);

// Serve built frontend
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

// Only listen when run directly (not on Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`HEC ERP Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
