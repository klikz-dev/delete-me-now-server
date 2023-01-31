const Zendesk = require("node-zendesk");

const username = process.env.ZENDESK_UNAME;
const token = process.env.ZENDESK_TOKEN;

exports.zendesk = Zendesk.createClient({
  username: username,
  token: token,
  remoteUri: "https://deletemenow.zendesk.com/api/v2",
});
