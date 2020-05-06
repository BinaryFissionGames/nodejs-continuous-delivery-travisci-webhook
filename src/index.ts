import * as express from 'express';
import * as crypto from 'crypto';
import * as https from 'https';

const app = express();

app.use(express.urlencoded());

app.post("/travisci", (req, res) => {
    let payload = JSON.parse(req.body.payload);
    console.log(payload);
    console.log(req.rawHeaders);
    console.log(req.get("travis-repo-slug"));
    if (payload.status === 1 &&
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

                if (!crypto.verify("sha1", req.body.payload, sig, Buffer.from(req.get("signature"), 'base64'))) {
                    console.error("Failed to verify signature for post request to travisci endpoint");
                } else {
                    //TODO: Get up to date branch, do stuffs
                    console.log("Got valid notif!");
                }
                res.end();
            });

        });

        https_req.on("error", (e) => {
            console.error(e);
            res.end();
        });

    } else {
        res.end();
    }
});

app.listen(process.env.PORT);