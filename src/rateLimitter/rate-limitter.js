import { rateLimit } from "express-rate-limit";

const generalLimitter = rateLimit({
  windowMs: 1*60 * 1000,
  limit: 15,
  message:{error:`Too many requests,Try again later!`},
  standardHeaders:true,
  legacyHeaders: false,
});

const authLimitter = rateLimit({
    windowMs:15*60*1000,
    limit:5,
    message:{error:`Too many login attempts,Wait and try again later!`},
    standardHeaders:true,
    legacyHeaders:false
})


const userPostLimitter = rateLimit({
    windowMs:15*60*1000,
    limit:20,
    message:{error:`Too many posts made,Try again shortly!`},
    standardHeaders:true,
    legacyHeaders:false
})

export {generalLimitter,authLimitter,userPostLimitter}

