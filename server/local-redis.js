const redis = require("redis");

const redisClient = redis.createClient(6379, process.env.Redis_URI);

module.exports = redisClient;

//Exit Redis If Any Unexpected
process.on("exit", function () {
    console.log("exit");
    console.log("Exiting Redis Connections !");
    redisClient.quit();
});

process.on("SIGINT", function () {
    console.log("SIGINT");
    console.log("Exiting Redis Connections !");
    redisClient.quit();
});

process.on("SIGTERM", function () {
    console.log("SIGINTerm");
    console.log("Exiting Redis Connections !");
    redisClient.quit();
});

process.on("SIGUSR1", function () {
    console.log("SIGUSR1");
    console.log("Exiting Redis Connections !");
    redisClient.quit();
});

process.on("SIGUSR2", function () {
    console.log("SIGUSR2");
    console.log("Exiting Redis Connections !");
    redisClient.quit();
});

process.on("uncaughtException", function () {
    console.log("uncaughtException");
    console.log("Exiting Redis Connections !");
    redisClient.quit();
});
