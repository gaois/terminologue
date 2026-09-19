const { createChallenge, randomInt, verifySolution, CappedMap } = require('altcha-lib');
const { deriveKey } = require('altcha-lib/algorithms/pbkdf2');
const HMAC_SECRET = 'your-secret-key';
const HMAC_KEY_SECRET = 'your-other-secret-key';

const challengeStore = new CappedMap({ maxSize: 10000 });

module.exports = function(app){

  app.get("/altcha/challenge.json", async function(req, res){
    const challenge = await createChallenge({
      algorithm: 'PBKDF2/SHA-256',
      cost: 500,
      counter: randomInt(5_000, 10_000),
      deriveKey,
      expiresAt: new Date(Date.now() + 600_000), // expires in 10 minutes
      hmacSignatureSecret: HMAC_SECRET,
      hmacKeySignatureSecret: HMAC_KEY_SECRET,
    });
    res.json(challenge);
  });

  app.verifyAltcha = async (req, res) => {
    let verified = false;
    try {
      const payload_base64 = req.cookies?.altcha;
      const payload = JSON.parse(Buffer.from(payload_base64, "base64").toString("utf8"));
      if(!challengeStore.has(payload.challenge.signature)){
        const result = await verifySolution({
          challenge: payload.challenge,
          solution: payload.solution,
          deriveKey,
          hmacSignatureSecret: HMAC_SECRET,
          hmacKeySignatureSecret: HMAC_KEY_SECRET,
        });
        verified = result.verified;
        challengeStore.set(payload.challenge.signature, true);
      }
    }
    catch(e){ }
    if(!verified){
      res.status(403).render("../altcha/view.ejs", {
        returnUrl: req.url,
      });
    }
    return verified;
  }

}