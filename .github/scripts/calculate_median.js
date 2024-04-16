const { Octokit } = require("@octokit/rest");

async function main() {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const owner = "Warpbuilds";
    const repo = "cache";
    const run_id = process.env.GITHUB_RUN_ID;

    try {
        // Fetch jobs for the current workflow run
        const jobs = await octokit.rest.actions.listJobsForWorkflowRun({
            owner,
            repo,
            run_id
        });

        let durations = [];

        for (const job of jobs.data.jobs) {
            if (job.name === "WarpCache" || job.name === "Cache") {
                const durationSeconds =
                    (new Date(job.completed_at) - new Date(job.started_at)) /
                    1000;
                durations.push(durationSeconds);
            }
        }

        if (durations.length > 0) {
            durations.sort((a, b) => a - b);
            const mid = Math.floor(durations.length / 2);
            const median =
                durations.length % 2 !== 0
                    ? durations[mid]
                    : (durations[mid - 1] + durations[mid]) / 2;
            console.log(`The median duration is ${median} seconds.`);
        } else {
            console.log("No durations were found for WarpCache or Cache.");
        }
    } catch (error) {
        console.error(`Error fetching job data: ${error}`);
    }
}

main();
