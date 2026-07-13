const Redis = require("ioredis");

const redis = new Redis({
    host: "127.0.0.1",
    port: 6379
});

(async () => {
    try {
        await redis.set("course", "Redis");
        const value = await redis.get("course");
        console.log("Value from Redis:", value);
    } catch (err) {
        console.error(err);
    } finally {
        redis.disconnect();
    }
})();