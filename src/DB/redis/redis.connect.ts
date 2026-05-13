
import { createClient } from 'redis';
import { REDIS_URI } from '../../config/config.service';

export const redisClient = createClient({ url: REDIS_URI! });

export const redisConnect = () => {
    redisClient.connect()
        .then(() => console.log("redis connected successfully"))
        .catch((err) => console.log(err, "fail to connect redis"));
}
