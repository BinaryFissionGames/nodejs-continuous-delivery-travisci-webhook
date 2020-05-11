import {exec} from 'child_process';

/*
* Actual stuff to do
* */

async function gitFetch(gitPath: string) {
    return runCommand(gitPath, 'git fetch -a');
}

async function gitCheckout(gitPath: string, commit: string) {
    return runCommand(gitPath, `git checkout ${commit}`);
}

async function reloadPM2App(appName: string) {
    return runCommand(undefined, `pm2 reload ${appName}`);
}

async function runCommand(cwd: string, command: string) {
    return new Promise((resolve, reject) => {
        exec(command, {
            cwd: cwd,
        }, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export {gitCheckout, gitFetch, reloadPM2App, runCommand};
