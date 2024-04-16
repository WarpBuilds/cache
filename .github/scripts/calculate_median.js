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

        let warpCacheDurations = [];
        let cacheDurations = [];

        for (const job of jobs.data.jobs) {
            console.log(job);
            const durationSeconds =
                (new Date(job.completed_at) - new Date(job.started_at)) / 1000;
            if (job.name === "WarpCache") {
                warpCacheDurations.push(durationSeconds);
            } else if (job.name === "Cache") {
                cacheDurations.push(durationSeconds);
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
            `The median duration for WarpCache is ${medianWarpCache} seconds.`
        );
        console.log(`The median duration for Cache is ${medianCache} seconds.`);
    } catch (error) {
        console.error(`Error fetching job data: ${error}`);
    }
}

main();
