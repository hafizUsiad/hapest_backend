const db = require('../config'); // Import the DB connection

class Agile {
    async user_interruption(project_id) {

        const [project_info] = await db.execute(
        `SELECT * FROM estimations WHERE project_id= ? order by estimation_id DESC limit 1;`,
        [project_id]);
        const estimationid = project_info[0].estimation_id;
        const [sprint_info] = await db.execute(
        `SELECT * FROM sprint WHERE estimation_id= ? limit 1;`,
        [estimationid]);
        const sprintid = sprint_info[0].sprint_id;

        // Step 1: Get all members and their interruptions
       const [interruptions] = await db.execute(`
        SELECT 
            t.developer_id,
            i.interruption_type,
            i.interruption_time
        FROM team t
        JOIN project_estimation pe ON pe.project_id = t.project_id
        JOIN project_interruptions pi ON pi.estimation_id = pe.estimation_id
        JOIN interruptions i ON i.interruption_id = pi.interruption_id AND i.developer_id = t.developer_id
        WHERE t.project_id = ?;
    `, [project_id]);

        // Step 2: Process each member's interruptions
        const developerInterruptions = {};

        for (const row of interruptions) {
            const developerId = row.developer_id;
            const type = row.interruption_type;
            const time = row.interruption_time;

            // Convert to days
            let days = 0;
            if (type === 'week') {
                days = time / 5;
            } else if (type === 'sprint') {
                days = time / 10;
            } else {
                days = time;
            }

            // Sum per developer
            developerInterruptions[developerId] = (developerInterruptions[developerId] || 0) + days;
        }

        const [hourly_salary] = await db.execute(
                `SELECT 
                t.developer_id,
                e.employ_salary,
                (e.employ_salary / 22 / 8) AS per_hour_salary
                FROM team t
                JOIN employees e ON t.developer_id = e.login_id where t.project_id = ?`,
                [project_id]);

        const[inhouse_cost] = await db.execute(`SELECT e.login_id AS employee_id, t.task_id, i.complexity,i.input_id, (i.complexity * 4) AS effort_hours, tm.project_id FROM team tm JOIN employees e ON tm.developer_id = e.login_id JOIN task t ON t.developer_id = e.login_id JOIN inputs i ON t.input_id = i.input_id WHERE tm.project_id = ? -- optionally filter by project ORDER BY e.login_id, t.task_id;`,[project_id])
            // Output or use the interruption totals
            console.log(developerInterruptions);
            console.log(hourly_salary);
            console.log(inhouse_cost);

            // Step 1: Map developer hourly salaries
            const salaryMap = {};
            hourly_salary.forEach(dev => {
            salaryMap[dev.developer_id] = parseFloat(dev.per_hour_salary);
            });

            // Step 2: Group effort hours by developer
            const developerCosts = {};

            inhouse_cost.forEach(task => {
            const developerId = task.employee_id;
            const effortHours = parseFloat(task.effort_hours);
            const hourlyRate = salaryMap[developerId] || 0;
            const taskCost = effortHours * hourlyRate;

            if (!developerCosts[developerId]) {
                developerCosts[developerId] = {
                totalEffortHours: 0,
                totalCost: 0,
                tasks: [],
                };
            }

            developerCosts[developerId].totalEffortHours += effortHours;
            developerCosts[developerId].totalCost += taskCost;
            developerCosts[developerId].tasks.push({
                task_id: task.task_id,
                input_id: task.input_id,
                complexity: task.complexity,
                effort_hours: effortHours,
                task_cost: taskCost,
            });
            });

            // Step 3: Print / return result
            console.log("Developer-wise cost summary:");

            let totalEffortAll = 0;
            let totalCostAll = 0;

            for (const [developerId, data] of Object.entries(developerCosts)) {
                console.log(`Developer: ${developerId}`);
                console.log(`  Total Effort (hrs): ${data.totalEffortHours}`);
                console.log(`  Total Cost: $${data.totalCost.toFixed(2)}`);
                console.log("  Tasks:");
                
                data.tasks.forEach(task => {
                    console.log(`    Task ID: ${task.task_id}, Effort: ${task.effort_hours}, Cost: $${task.task_cost.toFixed(2)}`);
                });

                // Accumulate totals
                totalEffortAll += data.totalEffortHours;
                totalCostAll += data.totalCost;
            }

            console.log("\nOverall Summary:");
            console.log(`  Total Effort (All Developers): ${totalEffortAll} hrs`);
            console.log(`  Total Cost (All Developers): $${totalCostAll.toFixed(2)}`);

            const [save_output] = await db.execute(`
                INSERT INTO project_estimation (
                    project_id, estimation_technique, method, effort, time, cost
                )
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    effort = VALUES(effort),
                    time = VALUES(time),
                    cost = VALUES(cost)
            `, [project_id, estimationid, "agile", totalEffortAll, "", totalCostAll]);

            await db.execute("update sprint set status = ?,effort=?,cost=? where estimation_id = ?",["Completed",totalEffortAll,totalCostAll,estimationid])





    }
}
module.exports = new Agile();
