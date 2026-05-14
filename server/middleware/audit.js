const { sql } = require('../db');

async function auditLog({ user_id, user_name, user_role, action, entity_type, entity_id, old_values, new_values, ip_address }) {
  try {
    await sql`
      INSERT INTO audit_logs (user_id, user_name, user_role, action, entity_type, entity_id, old_values, new_values, ip_address)
      VALUES (${user_id}, ${user_name}, ${user_role}, ${action}, ${entity_type}, ${entity_id}, ${old_values ? JSON.stringify(old_values) : null}, ${new_values ? JSON.stringify(new_values) : null}, ${ip_address || null})
    `;
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
}

// Express middleware for auto-audit on mutating routes
function auditMiddleware(entityType) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      const method = req.method;
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && res.statusCode < 400) {
        const action = method === 'POST' ? 'CREATE' : method === 'DELETE' ? 'DELETE' : 'UPDATE';
        const entityId = req.params.id || body?.id || null;
        auditLog({
          user_id: req.user?.id,
          user_name: req.user?.full_name,
          user_role: req.user?.role,
          action,
          entity_type: entityType,
          entity_id: entityId,
          old_values: req.oldRecord || null,
          new_values: method !== 'DELETE' ? body : null,
          ip_address: req.ip,
        });
      }
      return originalJson(body);
    };
    next();
  };
}

module.exports = { auditLog, auditMiddleware };
