const pool = require('../config/db');

exports.createReferral = async (req, res) => {
  const { child_id, severity, reason, referred_by } = req.body;

  if (!child_id || !reason || !referred_by) {
    return res.status(400).json({ message: 'Child, reason, and referring user are required.' });
  }

  try {
    const [[child]] = await pool.query(
      `SELECT c.first_name, c.last_name, c.barangay
       FROM children c
       WHERE c.child_id = ?`,
      [child_id]
    );
    if (!child) return res.status(404).json({ message: 'Child not found.' });

    const [[admin]] = await pool.query(
      `SELECT user_id FROM users
       WHERE role = 'admin' AND status = 'active' AND deleted_at IS NULL
       ORDER BY user_id ASC LIMIT 1`
    );
    if (!admin) return res.status(500).json({ message: 'No active administrator is available.' });

    const [result] = await pool.query(
      `INSERT INTO referrals (child_id, referred_by, referred_to, reason, severity, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [child_id, referred_by, admin.user_id, reason, severity || 'medium']
    );

    await pool.query(
      `INSERT INTO notifications (title, message, type, is_read, related_id, created_by)
       VALUES (?, ?, 'referral', FALSE, ?, ?)`,
      [
        'New Referral Submitted',
        `${child.first_name} ${child.last_name} from ${child.barangay || 'Unknown Barangay'} needs follow-up (${severity || 'medium'} severity).`,
        result.insertId,
        referred_by,
      ]
    );

    return res.status(201).json({ message: 'Referral submitted successfully.', referral_id: result.insertId });
  } catch (error) {
    console.error('Create referral error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getReferrals = async (req, res) => {
  const { barangay } = req.query;

  if (!barangay) {
    return res.status(400).json({ message: 'Barangay is required.' });
  }

  try {
    const [referrals] = await pool.query(
      `SELECT
         r.referral_id, r.reason, r.severity, r.status, r.referred_by, r.referred_to, r.created_at,
         c.child_id, c.first_name AS child_first_name, c.last_name AS child_last_name, c.guardian_name
       FROM referrals r
       LEFT JOIN children c ON c.child_id = r.child_id
       WHERE c.barangay = ?
       ORDER BY FIELD(r.status, 'pending', 'responded', 'closed'), r.created_at DESC`,
      [barangay]
    );
    return res.status(200).json(referrals);
  } catch (error) {
    console.error('Get referrals error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.updateReferralStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'responded', 'closed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    await pool.query('UPDATE referrals SET status = ? WHERE referral_id = ?', [status, id]);
    return res.status(200).json({ message: 'Referral status updated.' });
  } catch (error) {
    console.error('Update referral status error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};