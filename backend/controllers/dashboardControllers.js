const pool = require('../config/db');

exports.getAdminStats = async (req, res) => {
  try {
    const rangeMonths = { '3M': 3, '6M': 6, '1Y': 12 }[req.query.range] || 3;
    const rangeFilter = `record_date >= DATE_SUB(CURDATE(), INTERVAL ${rangeMonths} MONTH)`;

    const [[{ totalChildren }]] = await pool.query(`SELECT COUNT(*) AS totalChildren FROM children WHERE status = 'active'`);

    const [[{ totalMothers }]] = await pool.query(`SELECT COUNT(*) AS totalMothers FROM mothers WHERE status = 'active'`);


    const [[{ totalBarangays }]] = await pool.query(`SELECT COUNT(DISTINCT barangay) AS totalBarangays FROM children where status = 'active' `);

    const [[{ totalUsers }]] = await pool.query(`SELECT COUNT(*) AS totalUsers FROM users WHERE role IN ('admin', 'bhw') AND status = 'active' `);

    const [trendRows] = await pool.query(
      `SELECT nr.overall_status, COUNT(*) AS count
       FROM nutrition_records nr
       INNER JOIN (
             SELECT child_id, MAX(record_date) AS latest_date
             FROM nutrition_records
             WHERE ${rangeFilter}
           GROUP BY child_id
           ) latest ON nr.child_id = latest.child_id AND nr.record_date = latest.latest_date
           WHERE ${rangeFilter}
       GROUP BY nr.overall_status`
    );

    const nutritionTrends = {normal: 0, MAM: 0, SAM: 0, overweight: 0, underweight: 0};

    trendRows.forEach(row => {
      if(nutritionTrends.hasOwnProperty(row.overall_status)) {
        nutritionTrends[row.overall_status] = row.count;
      }
    });

    let [malnutritionByBarangayRows] = await pool.query(
      `SELECT c.barangay, COUNT(*) AS cases
      FROM nutrition_records nr
      INNER JOIN (
            SELECT child_id, MAX(record_date) AS latest_date
            FROM nutrition_records
            WHERE ${rangeFilter}
          GROUP BY child_id
      ) latest ON nr.child_id = latest.child_id AND nr.record_date = latest.latest_date
      INNER JOIN children c ON c.child_id = nr.child_id
          WHERE ${rangeFilter}
          AND (nr.weight_status IN ('underweight', 'severly_underweight')
       OR nr.height_status IN ('stunted', 'severly_stunted') 
           OR nr.wasting_status IN ('wasted', 'severly_wasted'))
      GROUP BY c.barangay
      ORDER BY cases DESC`
    );
    let malnutritionOverviewFallback = false;

    if (malnutritionByBarangayRows.length === 0) {
      [malnutritionByBarangayRows] = await pool.query(
        `SELECT c.barangay, COUNT(*) AS cases
         FROM nutrition_records nr
         INNER JOIN (
           SELECT child_id, MAX(record_date) AS latest_date
           FROM nutrition_records
           GROUP BY child_id
         ) latest ON nr.child_id = latest.child_id AND nr.record_date = latest.latest_date
         INNER JOIN children c ON c.child_id = nr.child_id
         WHERE nr.weight_status IN ('underweight', 'severly_underweight')
            OR nr.height_status IN ('stunted', 'severly_stunted')
            OR nr.wasting_status IN ('wasted', 'severly_wasted')
         GROUP BY c.barangay
         ORDER BY cases DESC`
      );
      malnutritionOverviewFallback = malnutritionByBarangayRows.length > 0;
    }

    const [upcomingActivities] = await pool.query(
      `SELECT schedule_id, title, schedule_type, schedule_date, schedule_time, venue, barangay
      FROM schedules
      WHERE status = 'pending' AND schedule_date >= CURDATE()
      ORDER BY schedule_date ASC`
    );

    const [nineCategoryRows] = await pool.query(
      `SELECT weight_status, height_status, wasting_status
      FROM nutrition_records nr
      INNER JOIN (
          SELECT child_id, MAX(record_date) AS latest_date
          FROM nutrition_records
          GROUP BY child_id
        ) latest ON nr.child_id = latest.child_id AND nr.record_date = latest.latest_date
        `
    );

    const nineCategoryTrend = {
      normal: 0,
      underweight: 0,
      severly_underweight: 0,
      stunted: 0,
      wasted: 0,
      overweight: 0,
      severly_stunted: 0,
      severly_wasted: 0,
      obese: 0,
      
    };

    nineCategoryRows.forEach((row) => {
      if (row.weight_status === 'underweight') nineCategoryTrend.underweight++;
      else if (row.weight_status === 'severly_underweight') nineCategoryTrend.severly_underweight++;
      else if (row.weight_status === 'overweight') nineCategoryTrend.overweight++;
      else if (row.weight_status === 'obese') nineCategoryTrend.obese++;

      if (row.height_status === 'stunted') nineCategoryTrend.stunted++;
      else if (row.height_status === 'severly_stunted') nineCategoryTrend.severly_stunted++;

      if (row.wasting_status === 'wasted') nineCategoryTrend.wasted++;
      else if (row.wasting_status === 'severly_wasted') nineCategoryTrend.severly_wasted++;

      if (row.weight_status === 'normal' && row.height_status === 'normal' && row.wasting_status === 'normal') {
        nineCategoryTrend.normal++;
      }
    });

    return res.status(200).json({
      totalChildren,
      totalMothers,
      totalBarangays,
      totalUsers,
      nutritionTrends,
      nineCategoryTrend,
      malnutritionByBarangay: malnutritionByBarangayRows,
      malnutritionOverviewFallback,
      upcomingActivities,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later' });
  }
};