import {exec} from 'child_process';

/*
* Actual stuff to do
* */

async function gitFetch(gitPath: string) {
    return new Promise((resolve, reject) => {
        exec('git fetch -a', {
            cwd: gitPath,
        }, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

async function gitCheckout(gitPath: string, commit: string) {
    return new Promise((resolve, reject) => {
        exec(`git checkout ${commit}`, {
            cwd: gitPath,
        }, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

async function reloadPM2App(appName: string) {
    return new Promise((resolve, reject) => {
        exec(`pm2 reload ${appName}`, {},
            (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
    });
}

export {gitCheckout, gitFetch, reloadPM2App};
