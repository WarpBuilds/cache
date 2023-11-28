import * as core from "@actions/core";

import saveImpl from "./saveImpl";
import { NullStateProvider } from "./stateProvider";

async function run(): Promise<void> {
    const cacheId = await saveImpl(new NullStateProvider());
    if (cacheId === "") {
        core.warning(`Cache save failed.`);
    }
}

run();

export default run;
