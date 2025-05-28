const db = require('../config');  // Import the DB connection
const IntermediateCostDrivers = {
  RELY: { VeryLow: 0.75, Low: 0.88, Nominal: 1.00, High: 1.15, VeryHigh: 1.40, ExtraHigh: 1.40 },
  DATA: { VeryLow: 0.94, Low: 0.94, Nominal: 1.00, High: 1.08, VeryHigh: 1.16, ExtraHigh: 1.16 },
  CPLX: { VeryLow: 0.70, Low: 0.85, Nominal: 1.00, High: 1.15, VeryHigh: 1.30, ExtraHigh: 1.65 },
  TIME: { VeryLow: 1.00, Low: 1.00, Nominal: 1.00, High: 1.11, VeryHigh: 1.30, ExtraHigh: 1.66 },
  STOR: { VeryLow: 1.00, Low: 1.00, Nominal: 1.00, High: 1.06, VeryHigh: 1.21, ExtraHigh: 1.56 },
  VIRT: { VeryLow: 0.87, Low: 0.87, Nominal: 1.00, High: 1.15, VeryHigh: 1.30, ExtraHigh: 1.30 },
  RUSE: { VeryLow: 0.87, Low: 0.87, Nominal: 1.00, High: 1.07, VeryHigh: 1.15, ExtraHigh: 1.15 },  // Fixed
  ACAP: { VeryLow: 1.46, Low: 1.19, Nominal: 1.00, High: 0.86, VeryHigh: 0.71, ExtraHigh: 0.71 },
  AEXP: { VeryLow: 1.29, Low: 1.13, Nominal: 1.00, High: 0.91, VeryHigh: 0.82, ExtraHigh: 0.82 },
  PCAP: { VeryLow: 1.42, Low: 1.17, Nominal: 1.00, High: 0.86, VeryHigh: 0.70, ExtraHigh: 0.70 },
  VEXP: { VeryLow: 1.21, Low: 1.10, Nominal: 1.00, High: 0.90, VeryHigh: 0.90, ExtraHigh: 0.90 },
  LEXP: { VeryLow: 1.14, Low: 1.07, Nominal: 1.00, High: 0.95, VeryHigh: 0.95, ExtraHigh: 0.95 },
  MODP: { VeryLow: 1.24, Low: 1.10, Nominal: 1.00, High: 0.91, VeryHigh: 0.82, ExtraHigh: 0.82 },
  TOOL: { VeryLow: 1.24, Low: 1.10, Nominal: 1.00, High: 0.91, VeryHigh: 0.83, ExtraHigh: 0.83 },
  SCED: { VeryLow: 1.23, Low: 1.08, Nominal: 1.00, High: 1.04, VeryHigh: 1.10, ExtraHigh: 1.10 },
};

const DetailedCocomoFactors = {
  PREC: { VeryLow: 6.20, Low: 4.96, Nominal: 3.72, High: 2.48, VeryHigh: 1.24, ExtraHigh: 1.24 },
  FLEX: { VeryLow: 5.07, Low: 4.05, Nominal: 3.04, High: 2.03, VeryHigh: 1.01, ExtraHigh: 1.01 },
  RESL: { VeryLow: 7.07, Low: 5.65, Nominal: 4.24, High: 2.83, VeryHigh: 1.41, ExtraHigh: 1.41 },
  TEAM: { VeryLow: 5.48, Low: 4.38, Nominal: 3.29, High: 2.19, VeryHigh: 1.10, ExtraHigh: 1.10 },
  PMAT: { VeryLow: 7.80, Low: 6.24, Nominal: 4.68, High: 3.12, VeryHigh: 1.56, ExtraHigh: 1.56 },
};


function Calculate_IntermediateCostDrivers(inputCategory, complexity) {
    // Check if the input category and complexity are valid
    if (!IntermediateCostDrivers[inputCategory] || !IntermediateCostDrivers[inputCategory][complexity]) {
      console.log(inputCategory,complexity);
      throw new Error('Invalid input category or complexity');
    }
    // Return the function points for the given category and complexity
    return IntermediateCostDrivers[inputCategory][complexity];
  }
  function Calculate_DetailedCostDrivers(inputCategory, complexity) {
    // Check if the input category and complexity are valid
    if (!DetailedCocomoFactors[inputCategory] || !DetailedCocomoFactors[inputCategory][complexity]) {
      console.log(inputCategory,complexity);
      throw new Error('Invalid input category or complexity');
    }
    // Return the function points for the given category and complexity
    return DetailedCocomoFactors[inputCategory][complexity];
  }
class cocomo1
{

    async basic_calculate(project_id) 
    {
       
        const [project_info] = await db.execute(
            `SELECT * FROM estimations WHERE project_id= ? order by estimation_id DESC limit 1;`,
             [project_id]);
        const estimationid = project_info[0].estimation_id;
        var FP = 1000;
        let projectType;
        let a, b, c, d;
        let KLOC = FP / 60;
        if (KLOC <= 50) {
            projectType = "Organic";
            a = 3.2; b = 1.05; c = 2.5; d = 0.38;
        } else if (KLOC > 50 && KLOC <= 300) {
            projectType = "Semi-Detached";
            a = 3.0; b = 1.12; c = 2.5; d = 0.35;
        } else {
            projectType = "Embedded";
            a = 2.8; b = 1.20; c = 2.5; d = 0.32;
        }
         // Step 5: Calculate Effort (Person-Months)
         let effort = a * Math.pow(KLOC, b);

         // Step 6: Calculate Development Time (Months)
         let time = c * Math.pow(effort, d);
 
         // Step 7: Calculate Team Size
         let teamSize = effort / time;

         if(effort)
        {
            const [save_ouput] = await db.execute('update `project_estimation` set  `effort` = ?, `time` = ?, `cost` = ? where estimation_technique = ? ',
            [effort,time,teamSize,estimationid]);
        }
    }

    async intermediate_calculate(project_id) {
        
        const [project_info] = await db.execute(
            `SELECT * FROM estimations WHERE project_id= ? ORDER BY estimation_id DESC LIMIT 1;`,
            [project_id]
        );
        const estimationid = project_info[0].estimation_id;
        
        var FP = 1000;
        let projectType;
        let a, b, c, d;
        let KLOC = FP / 60;
        
        if (KLOC <= 50) {
            projectType = "Organic";
            a = 3.2; b = 1.05; c = 2.5; d = 0.38;
        } else if (KLOC > 50 && KLOC <= 300) {
            projectType = "Semi-Detached";
            a = 3.0; b = 1.12; c = 2.5; d = 0.35;
        } else {
            projectType = "Embedded";
            a = 2.8; b = 1.20; c = 2.5; d = 0.32;
        }

        // Fetch Cost Drivers from DB
        const [rows] = await db.execute(
            'SELECT input_category, complexity FROM inputs WHERE project_id = ? AND input_category LIKE "%Question%" AND estimation_id = ?',
            [project_id,project_info[0].estimation_id]
          );
      
          if (rows.length === 0) {
            return null;
          }
          let effortMultiplier = 1.0;
          for (let i = 0; i < rows.length; i++) {
            var { input_category, complexity } = rows[i];
            var input_category = rows[i].input_category
            // Validate the input category and complexity
            if (!input_category || !complexity) {
              console.error(`Invalid data at index ${i}: input_category or complexity is missing.`);
              continue; // Skip invalid rows
            }
           
           
            else{
               // Calculate cost driver for this row
              
                var cost_driver = Calculate_IntermediateCostDrivers(input_category, complexity);
                // Add the UFP for this input to the total UFP
                effortMultiplier *= cost_driver;
               
            }

          }


        // Calculate Effort (Person-Months) with Cost Drivers
        let effort = a * Math.pow(KLOC, b) * effortMultiplier;

        // Calculate Development Time (Months)
        let time = c * Math.pow(effort, d);

        // Calculate Team Size
        let teamSize = effort / time;

        if (effort) {
            await db.execute(
                'UPDATE `project_estimation` SET `effort` = ?, `time` = ?, `cost` = ? WHERE estimation_technique = ? ',
                [effort, time, teamSize, estimationid]
            );
        }
    }

    async detailed_calculate(project_id) {
        
        const [project_info] = await db.execute(
            `SELECT * FROM estimations WHERE project_id= ? ORDER BY estimation_id DESC LIMIT 1;`,
            [project_id]
        );
        const estimationid = project_info[0].estimation_id;
        
        var FP = 1000;
        let projectType;
        let a, b, c, d;
        let KLOC = FP / 60;
        
        if (KLOC <= 50) {
            projectType = "Organic";
            a = 3.2; b = 1.05; c = 2.5; d = 0.38;
        } else if (KLOC > 50 && KLOC <= 300) {
            projectType = "Semi-Detached";
            a = 3.0; b = 1.12; c = 2.5; d = 0.35;
        } else {
            projectType = "Embedded";
            a = 2.8; b = 1.20; c = 2.5; d = 0.32;
        }

        // Fetch Cost Drivers from DB
        const [rows] = await db.execute(
            'SELECT input_category, complexity FROM inputs WHERE project_id = ? AND input_category LIKE "%Question%" AND estimation_id = ?',
            [project_id,project_info[0].estimation_id]
          );
      
          if (rows.length === 0) {
            return null;
          }
          let effortMultiplier = 1.0;
          for (let i = 0; i < 15; i++) {
            var { input_category, complexity } = rows[i];
            var input_category = rows[i].input_category
            // Validate the input category and complexity
            if (!input_category || !complexity) {
              console.error(`Invalid data at index ${i}: input_category or complexity is missing.`);
              continue; // Skip invalid rows
            }
           
           
            else{
               // Calculate cost driver for this row
              
                var cost_driver = Calculate_IntermediateCostDrivers(input_category, complexity);
                // Add the UFP for this input to the total UFP
                effortMultiplier *= cost_driver;
               
            }

          }
          let effortMultiplier2 = 1.0;

          for (let i = 15; i < rows.length; i++) {
            var { input_category, complexity } = rows[i];
            var input_category = rows[i].input_category
            // Validate the input category and complexity
            if (!input_category || !complexity) {
              console.error(`Invalid data at index ${i}: input_category or complexity is missing.`);
              continue; // Skip invalid rows
            }
           
           
            else{
               // Calculate cost driver for this row
              
                var cost_driver = Calculate_DetailedCostDrivers(input_category, complexity);
                // Add the UFP for this input to the total UFP
                effortMultiplier2 *= cost_driver;
               
            }

          }


        // Calculate Effort (Person-Months) with Cost Drivers
        let effort = a * Math.pow(KLOC, b) * effortMultiplier * effortMultiplier2;

        // Calculate Development Time (Months)
        let time = c * Math.pow(effort, d);

        // Calculate Team Size
        let teamSize = effort / time;

        if (effort) {
            await db.execute(
                'UPDATE `project_estimation` SET `effort` = ?, `time` = ?, `cost` = ? WHERE estimation_technique = ? ',
                [effort, time, teamSize, estimationid]
            );
        }
    }
}

module.exports = new cocomo1();