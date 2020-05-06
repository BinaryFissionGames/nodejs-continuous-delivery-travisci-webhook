import * as express from 'express';
import * as crypto from 'crypto';
import * as https from 'https';
import {gitCheckout, gitFetch, reloadPM2App, runTypescriptCompiler} from "./action";

const app = express();

app.use(express.urlencoded());

app.post("/travisci", (req, res) => {
    let payload = JSON.parse(req.body.payload);
    if (payload.status === 0 &&
        ((payload.status_message && payload.status_message.toLowerCase() === "passed") || (payload.result_message && payload.result_message.toLowerCase() === "passed")) &&
        (payload.type === "push") &&
        req.get("travis-repo-slug") === process.env.REPO_SLUG) {
        let https_req = https.request("https://api.travis-ci.org/config", {
            method: "GET",
            timeout: 10000
        }, (get_res) => {
            let msg = "";

            get_res.on('data', chunk => {
                msg += chunk;
            });

            get_res.on('end', () => {
                let sig = JSON.parse(msg)?.config?.notifications?.webhook?.public_key;
                console.log("Got travis-ci config: ");
                console.log(msg);

                if (!crypto.verify("sha1", req.body.payload, sig, Buffer.from(req.get("signature"), 'base64'))) {
                    console.error("Failed to verify signature for post request to travisci endpoint");
                } else {
                    console.log("Fetching code from git");
                    gitFetch(process.env.LOCAL_GIT_REPO).then(() => {
                        return gitCheckout(process.env.LOCAL_GIT_REPO, payload.commit);
                    }).then(() => {
                        return runTypescriptCompiler(process.env.LOCAL_GIT_REPO);
                    }).then(() => {
                        return reloadPM2App(process.env.APP_NAME);
                    }).then(() => {
                        console.log("Reloaded PM2 app");
                    }).catch((e) => {
                        console.error("Error while reloading PM2 - ");
                        console.error(e);
                    });
                }
            });
        });

        https_req.on("error", (e) => {
            console.error(e);
        });

        https_req.end();
    }
    res.end();
});

app.listen(process.env.PORT);

console.log(`Started on port ${process.env.PORT}`);