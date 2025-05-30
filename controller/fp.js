const db = require('../config');

const functionPoints = {
  EI: { Low: 4, Medium: 5, High: 7 },
  EO: { Low: 5, Medium: 6, High: 7 },
  EQ: { Low: 3, Medium: 4, High: 5 },
  ILF: { Low: 7, Medium: 10, High: 15 },
  EIF: { Low: 5, Medium: 7, High: 10 },
};

function calculateUFP(inputCategory, complexity) {
  if (!functionPoints[inputCategory] || !functionPoints[inputCategory][complexity]) {
    console.log("Invalid UFP:", inputCategory, complexity);
    throw new Error('Invalid input category or complexity');
  }
  return functionPoints[inputCategory][complexity];
}

class fp {

  async updatecomplexity(req, res) {
    const { id, field, value, developer_id } = req.body;
    const query = `UPDATE fp_inputss SET ${field} = ? WHERE input_id = ? and developer_id = ?`;

    console.log("🛠 Updating:", query, value, id, developer_id);

    try {
      const [result] = await db.execute(query, [value, id, developer_id]);
      return res.status(200).json({ message: `${field} updated successfully` });
    } catch (err) {
      console.error('❌ Error updating field:', err);
      res.status(500).json({ message: 'Error updating field', error: err.message });
    }
  }

  async updatestatus(req, res) {
    const { developer_id, input_id } = req.body;
    const projectId = req.params.project_id;

    const query = `
      UPDATE fp_inputss AS f1
      JOIN inputs AS f2 ON f1.input_id = f2.input_id
      SET f1.status = 'Done'
      WHERE f2.project_id = ? AND f1.developer_id = ? AND f1.input_id = ?`;

    console.log("🔄 Updating status:", query, projectId, developer_id, input_id);

    try {
      const [result] = await db.execute(query, [projectId, developer_id, input_id]);
      return res.status(200).json({ message: `Status updated successfully` });
    } catch (err) {
      console.error('❌ Error updating status:', err);
      res.status(500).json({ message: 'Error updating field', error: err.message });
    }
  }

  async fpcalculate(project, res) {
    const project_id = project;
    console.log("📦 Calculating FP for Project ID:", project_id);

    try {
      const [project_info] = await db.execute(
        `SELECT * FROM estimations WHERE project_id = ? ORDER BY estimation_id DESC LIMIT 1`,
        [project_id]
      );

      if (!project_info.length) return;

      const estimation_id = project_info[0].estimation_id;
      console.log("📊 Estimation ID:", estimation_id);

      const [rows] = await db.execute(
        `SELECT input_category, complexity FROM inputs
         WHERE project_id = ? AND input_category NOT LIKE "%Question%" AND estimation_id = ?`,
        [project_id, estimation_id]
      );

      if (rows.length === 0) return null;

      let totalUFP = 0;
      let TF = 0;

      for (let i = 0; i < rows.length; i++) {
        const { input_category, complexity } = rows[i];

        if (!input_category || !complexity) {
          console.error(`⚠️ Invalid row at ${i}:`, rows[i]);
          continue;
        }

        if (project_info[0].estimation_method === "PP") {
          const ufp = calculateUFP(input_category, complexity);
          totalUFP += ufp;
        }
      }

      // If estimation method is FC, override UFP
      const [project_check] = await db.execute(
        `SELECT * FROM estimations WHERE estimation_id = ? AND estimation_method = "FC"`,
        [estimation_id]
      );

      if (project_check.length > 0) {
        const [project_method] = await db.execute(
          `SELECT SUM(complexity) as ufp FROM inputs WHERE project_id = ? AND estimation_id = ? AND input_category NOT LIKE "%Question%"`,
          [project_id, estimation_id]
        );
        totalUFP = project_method[0].ufp || 0;
      }

      const [project_method2] = await db.execute(
        `SELECT SUM(complexity) as tf FROM inputs WHERE project_id = ? AND estimation_id = ? AND input_category LIKE "%Question%"`,
        [project_id, estimation_id]
      );

      TF = project_method2[0].tf || 0;
      const CAF = 0.65 + (0.01 * TF);
      const FP = totalUFP * CAF;

      const [avg_effort] = await db.execute(`SELECT AVG(Effort_person_month) as avge FROM fp_historical_data`);
      const [team_members] = await db.execute(`SELECT COUNT(team_id) as tt FROM team WHERE project_id = ?`, [project_id]);
      const [avg_cost] = await db.execute(`SELECT AVG(cost) as avgc FROM fp_historical_data`);
      const [avg_fp] = await db.execute(`SELECT AVG(FP) as avgf FROM fp_historical_data`);

      const Effort = (avg_effort[0].avge || 0) * FP;
      const Time = Effort / (team_members[0].tt || 1);
      const cost_per_fp = (avg_cost[0].avgc || 0) / (avg_fp[0].avgf || 1);
      const cost = cost_per_fp * FP;

      console.log("📈 Final FP Estimation:", { Effort, Time, cost_per_fp, cost, FP });

      if (FP) {
        await db.execute(
          `INSERT INTO project_estimation (project_id, estimation_technique, effort, time, cost) VALUES (?, ?, ?, ?, ?)`,
          [project_id, estimation_id, Effort, Time, cost]
        );
      }

    } catch (error) {
      console.error('❌ Database error in FP calculation:', error);
    }
  }
}

module.exports = new fp();
