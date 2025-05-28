const db = require('../config'); // Import the DB connection

class AgileEstimator {
    constructor(storyPointToHourRate, teamVelocity, monthlySalaries, teamSize, interruptedHoursPerDay, workingDaysPerSprint,projectId) {
        this.storyPointToHourRate = storyPointToHourRate;
        this.teamVelocity = teamVelocity;
        this.teamSize = teamSize;
        this.interruptedHoursPerDay = interruptedHoursPerDay;
        this.workingDaysPerSprint = workingDaysPerSprint;
        this.effectiveWorkingHoursPerDay = 8 - this.interruptedHoursPerDay;
        this.projectId = projectId;
        this.hourlyRate = this.calculateHourlyRate(monthlySalaries);
    }

    calculateHourlyRate(monthlySalaries) {
        let workingDaysPerMonth = 20;
        let workingHoursPerMonth = workingDaysPerMonth * this.effectiveWorkingHoursPerDay;
        let totalHourlyRate = monthlySalaries.reduce((sum, salary) => sum + (salary / workingHoursPerMonth), 0);
        return totalHourlyRate / this.teamSize; // Average hourly rate per developer
    }

    estimateEffort(userStories) {
        let totalStoryPoints = userStories.reduce((sum, story) => sum + story.storyPoints, 0);
        let totalEffort = totalStoryPoints * this.storyPointToHourRate;
        return { totalStoryPoints, totalEffort };
    }

    estimateTime(totalEffort) {
        let totalSprints = Math.ceil(totalEffort / (this.teamVelocity * this.storyPointToHourRate));
        let totalDays = totalSprints * this.workingDaysPerSprint;
        return { totalSprints, totalDays };
    }

    estimateCost(totalEffort) {
        return totalEffort * this.hourlyRate * this.teamSize;
    }

   async runEstimation(userStories) {
        let { totalStoryPoints, totalEffort } = this.estimateEffort(userStories);
        let { totalSprints, totalDays } = this.estimateTime(totalEffort);
        let totalCost = this.estimateCost(totalEffort);
        const [project_info] = await db.execute(
            `SELECT * FROM estimations WHERE project_id= ? ORDER BY estimation_id DESC LIMIT 1;`,
            [this.projectId]
        );
        const[ouput_chk] = await db.execute('Select * from project_estimation where estimation_technique = ?',
        [project_info[0].estimation_id]);
        var [verify_sprint] = await db.execute(
            'select * from sprint where estimation_id = ?  order by sprint_id DESC limit 1',
            [project_info[0]["estimation_id"]]
        );
        if(verify_sprint.length > 0)
        {
            const[ouput_update] = await db.execute('UPDATE `sprint` SET `effort` = ?, `time` = ?, `cost` = ? , status=? WHERE sprint_id = ? ',
            [totalEffort,this.workingDaysPerSprint,totalCost,"Completed",verify_sprint[0].sprint_id]);
            if(ouput_chk.length > 0)
            {
                await db.execute('UPDATE `project_estimation` SET `effort` = ?, `time` = ?, `cost` = ? WHERE estimation_technique = ? ',
                [totalEffort,totalDays,totalCost,project_info[0].estimation_id]);
            }
            else{
                const[ouput_save] = await db.execute('INSERT INTO `project_estimation`(`project_id`, `estimation_technique`, `effort`, `time`, `cost`) VALUES (?,?,?,?,?)',
                [this.projectId,project_info[0].estimation_id,totalEffort,totalDays,totalCost]);
            }

        }else{
            // const[ouput_save] = await db.execute('INSERT INTO `project_estimation`(`project_id`, `estimation_technique`, `effort`, `time`, `cost`) VALUES (?,?,?,?,?)',
            // [projectId,project_info[0].estimation_id,totalEffort,totalDays+"("+totalSprints+")",totalCost]);
        }
  

  
        return {
            totalStoryPoints,
            totalEffort,
            totalSprints,
            totalDays,
            totalCost
        };
    }
}

module.exports = AgileEstimator; // Export the class (not an instance)

