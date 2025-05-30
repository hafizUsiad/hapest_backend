const db = require('../database');
const agilecheck = require('./agilecheck');
const { AgileEstimator } = require('./AgileEstimator');
const CocomoController = require('./cocomoController');

// Check if all developers have provided complexity for all inputs
const checkAllStatus = async (req, res) => {
  const projectId = req.params.projectId;

  try {
    // Get the latest estimation for the project
    const [project_info] = await db.execute(
      `SELECT * FROM estimations WHERE project_id = ? ORDER BY estimation_id DESC LIMIT 1`,
      [projectId]
    );

    if (!project_info || project_info.length === 0) {
      return res.status(404).json({ message: "No estimation record found for this project." });
    }

    const estimation_id = project_info[0]["estimation_id"];
    const estimation_type = project_info[0]["estimation_type"];

    // Get team size
    const [teamResult] = await db.execute(
      `SELECT developer_id FROM team WHERE project_id = ?`,
      [projectId]
    );

    // Get inputs associated with estimation
    const [inputsResult] = await db.execute(
      `SELECT input_id FROM estimation_inputs WHERE estimation_id = ?`,
      [estimation_id]
    );

    let allInputsCompleted = true;

    for (const input of inputsResult) {
      const inputId = input.input_id;

      const [statusResult] = await db.execute(
        `SELECT COUNT(DISTINCT developer_id) as cs FROM developer_complexity WHERE input_id = ?`,
        [inputId]
      );

      if (statusResult[0].cs !== teamResult.length) {
        allInputsCompleted = false;
        break;
      }
    }

    if (allInputsCompleted) {
      // Calculate final complexity for each input
      for (const input of inputsResult) {
        await finalvalue(input.input_id);
      }

      // Perform estimation based on type
      const cocomo1 = new CocomoController();

      switch (estimation_type) {
        case "agile":
          await agilecheck.finalvalue(projectId);
          break;
        case "cocomo1_basic":
          await cocomo1.basic_calculate(projectId);
          break;
        case "cocomo1_intermediate":
          await cocomo1.intermediate_calculate(projectId);
          break;
        case "cocomo1_detailed":
          await cocomo1.detailed_calculate(projectId);
          break;
        default:
          return res.status(400).json({ message: "Unknown estimation type." });
      }

      return res.json({ message: 'All inputs checked and estimation performed.' });
    } else {
      return res.json({ message: 'Not all inputs have been completed yet.' });
    }

  } catch (err) {
    console.error('Error checking status:', err.message);
    return res.status(500).json({ message: 'Error checking status', error: err.message });
  }
};

// Find most frequent complexity value and update it
const finalvalue = async (id) => {
  try {
    const [rows] = await db.execute(
      `SELECT complexity FROM developer_complexity WHERE input_id = ?`,
      [id]
    );

    const frequencyMap = {};
    let maxFreq = 0;
    let mostFrequentValue = null;

    rows.forEach(row => {
      const val = row.complexity;
      frequencyMap[val] = (frequencyMap[val] || 0) + 1;

      if (frequencyMap[val] > maxFreq) {
        maxFreq = frequencyMap[val];
        mostFrequentValue = val;
      }
    });

    // Update final agreed complexity
    await db.execute(
      `UPDATE estimation_inputs SET complexity = ? WHERE input_id = ?`,
      [mostFrequentValue, id]
    );

    // Log message
    const message = `The most agreed upon complexity value for input ID ${id} is ${mostFrequentValue}`;

    await db.execute(`
      INSERT INTO messages 
      (sender_id, project_id, message_text, message_type, timestamp, input_id) 
      VALUES (?, ?, ?, ?, NOW(), ?);
    `, [12, null, message, 'text', id]);

  } catch (err) {
    console.error('Error in finalvalue:', err.message);
  }
};

// Get distinct complexity values submitted by developers
const saveDeveloperComplexity = async (projectId, inputid) => {
  try {
    const [rows] = await db.execute(`
      SELECT DISTINCT complexity FROM developer_complexity WHERE project_id = ? AND input_id = ?
    `, [projectId, inputid]);

    return rows.map(row => row.complexity);
  } catch (err) {
    console.error('Error fetching developer complexities:', err.message);
    return [];
  }
};



module.exports = new ppController();
