const { Octokit } = require("@octokit/rest");

async function main() {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const owner = "WarpBuilds";
    const repo = "cache";
    const run_id = process.env.GITHUB_RUN_ID;

    try {
        // Fetch all jobs for the current workflow run
        const jobs = await octokit.rest.actions.listJobsForWorkflowRun({
            owner,
            repo,
            run_id
        });

        let warpCacheDurations = [];
        let cacheDurations = [];

        for (const job of jobs.data.jobs) {
            for (const step of job.steps) {
                if (
                    step.name === "WarpCache" &&
                    step.conclusion === "success"
                ) {
                    const start = new Date(step.started_at).getTime();
                    const end = new Date(step.completed_at).getTime();
                    const durationSeconds = (end - start) / 1000;
                    warpCacheDurations.push(durationSeconds);
                } else if (
                    step.name === "Cache" &&
                    step.conclusion === "success"
                ) {
                    const start = new Date(step.started_at).getTime();
                    const end = new Date(step.completed_at).getTime();
                    const durationSeconds = (end - start) / 1000;
                    cacheDurations.push(durationSeconds);
                }
            }
        }

        function calculateMedian(durations) {
            if (durations.length === 0) return null;
            durations.sort((a, b) => a - b);
            const mid = Math.floor(durations.length / 2);
            return durations.length % 2 !== 0
                ? durations[mid]
                : (durations[mid - 1] + durations[mid]) / 2;
        }

        const medianWarpCache = calculateMedian(warpCacheDurations);
        const medianCache = calculateMedian(cacheDurations);

        console.log(
            `The median duration for WarpCache across all jobs is ${medianWarpCache} seconds.`
        );
        console.log(
            `The median duration for Cache across all jobs is ${medianCache} seconds.`
        );
    } catch (error) {
        console.error(`Error fetching job data: ${error}`);
    }
}

main();
