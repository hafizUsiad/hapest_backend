const db = require('../config');  // Import the DB connection

const usecasepoints = {
  UC: {
    Simple: 5,
    Average: 10,
    Complex: 15,
  },
};

function calculateuucp(inputCategory, complexity) {
  if (!usecasepoints[inputCategory] || !usecasepoints[inputCategory][complexity]) {
    throw new Error('Invalid input category or complexity');
  }
  return usecasepoints[inputCategory][complexity];
}

class usecase {
  async uc_calculate(project, res, estimation_id) {
    const project_id = project;
    const estimationid = estimation_id;

    try {
      // Fix: Corrected SQL syntax
      const [rows] = await db.execute(
        `SELECT input_category, complexity FROM inputs 
         WHERE project_id = ? AND estimation_id = ? 
         AND input_category NOT LIKE "%Question%" 
         AND input_category LIKE "%UC%"`,
        [project_id, estimationid]
      );

      if (rows.length === 0) {
        return null;
      }

      let totalUCP = 0;
      let TCF = 0;
      let ECF = 0;

      for (let i = 0; i < rows.length; i++) {
        const { input_category, complexity } = rows[i];

        if (!input_category || !complexity) {
          console.error(`Invalid data at index ${i}: input_category or complexity is missing.`);
          continue;
        }

        try {
          const ucp = calculateuucp(input_category, complexity);
          totalUCP += ucp;
        } catch (e) {
          console.error(`Skipping invalid input: ${input_category} - ${complexity}`);
          continue;
        }
      }

      // Check if FC estimation method is used
      const [project_check] = await db.execute(
        `SELECT * FROM estimations 
         WHERE estimation_id = ? AND estimation_method = "FC"`,
        [estimationid]
      );

      if (project_check.length > 0) {
        const [project_method] = await db.execute(
          `SELECT SUM(complexity) AS ucp 
           FROM inputs 
           WHERE project_id = ? AND estimation_id = ? 
           AND input_category NOT LIKE "%Question%"`,
          [project_id, estimationid]
        );

        totalUCP += parseFloat(project_method[0]["ucp"]) || 0;
      }

      const [project_method2] = await db.execute(
        `SELECT SUM(complexity) AS tcf 
         FROM inputs 
         WHERE project_id = ? AND estimation_id = ? 
         AND input_category LIKE "%Question%" 
         AND input_category LIKE "%TCF%"`,
        [project_id, estimationid]
      );

      const [project_method3] = await db.execute(
        `SELECT SUM(complexity) AS ecf 
         FROM inputs 
         WHERE project_id = ? AND estimation_id = ? 
         AND input_category LIKE "%Question%" 
         AND input_category LIKE "%ECF%"`,
        [project_id, estimationid]
      );

      TCF = parseFloat(project_method2[0]["tcf"]) || 0;
      ECF = parseFloat(project_method3[0]["ecf"]) || 0;

      const Final_TCF = 0.6 + (TCF / 100);
      const Final_ECF = 1.4 - (0.03 * ECF);

      const UC = totalUCP * Final_TCF * Final_ECF;

      const [avg_effort] = await db.execute(
        'SELECT AVG(Effort_person_month) AS avge FROM `fp_historical_data`'
      );

      const [team_members] = await db.execute(
        'SELECT COUNT(team_id) AS tt FROM team WHERE project_id = ?',
        [project_id]
      );

      const teamCount = parseInt(team_members[0]["tt"]) || 1;

      const Effort = 20 * UC;
      const Time = 20 / teamCount;
      const cost_per_fp = 45000 / (UC || 1);
      const cost = cost_per_fp * UC;

      if (UC) {
        await db.execute(
          `INSERT INTO project_estimation 
           (project_id, estimation_technique, effort, time, cost) 
           VALUES (?, ?, ?, ?, ?)`,
          [project_id, estimationid, Effort, Time, cost]
        );
      }

    } catch (error) {
      console.error('Database error:', error);
    }
  }
}

module.exports = new usecase();
