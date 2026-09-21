const pool = require('../config/db');

exports.createChildService = async (req, res) => {
  const { child_id, service_date, service_type, provided_by } = req.body;
  const serviceLabels = {
    vitamin_a: 'Vitamin A',
    deworming: 'Deworming',
    feeding: 'Feeding',
    checkup: 'Checkup',
  };

  if (!child_id || !service_date || !serviceLabels[service_type] || !provided_by) {
    return res.status(400).json({ message: 'Child, date, service, and provider are required.' });
  }

  try {
    const [[child]] = await pool.query('SELECT child_id FROM children WHERE child_id = ?', [child_id]);
    if (!child) return res.status(404).json({ message: 'Child not found.' });

    const [result] = await pool.query(
      `INSERT INTO child_services (child_id, service_type, service_date, provided_by)
       VALUES (?, ?, ?, ?)`,
      [child_id, serviceLabels[service_type], service_date, provided_by]
    );

    return res.status(201).json({ message: 'Child service recorded.', service_id: result.insertId });
  } catch (error) {
    console.error('Create child service error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getNeedAttention = async (req, res) => {
  const { barangay } = req.query;

  if (!barangay) {
    return res.status(400).json({ message: 'Barangay is required.' });
  }

  try {
    const [children] = await pool.query(
      `SELECT
         c.child_id, c.first_name, c.last_name, c.sex, c.age_in_months,
         c.guardian_name, c.guardian_contact,
         nr.weight_kg, nr.height_cm, nr.weight_status, nr.height_status,
         nr.wasting_status, nr.overall_status, nr.record_date AS last_visit
       FROM children c
       INNER JOIN (
         SELECT nr1.*
         FROM nutrition_records nr1
         INNER JOIN (
           SELECT child_id, MAX(record_date) AS latest_date
           FROM nutrition_records
           GROUP BY child_id
         ) latest ON nr1.child_id = latest.child_id AND nr1.record_date = latest.latest_date
       ) nr ON nr.child_id = c.child_id
       WHERE c.barangay = ?
         AND c.status = 'active'
         AND (
           nr.overall_status IN ('MAM', 'SAM')
           OR nr.weight_status IN ('underweight', 'severely_underweight')
           OR nr.height_status IN ('stunted', 'severely_stunted')
           OR nr.wasting_status IN ('wasted', 'severely_wasted')
         )
       ORDER BY
         FIELD(nr.overall_status, 'SAM', 'MAM') ASC,
         nr.record_date ASC`,
      [barangay]
    );
    return res.status(200).json(children);
  } catch (error) {
    console.error('Get need attention error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};