import  request  from "supertest";
import {describe,expect,it} from '@jest/globals';
import pool from '../../database/connection.js';
import redisConnection from "../../database/redis.js";;
import app from '../routes/main.js';
import { emailQueue,postQueue } from "../queues/emailQueue.js";
let accessToken;

beforeAll(async()=>{
    await pool.query(`delete from users`);
     await request(app)
     .post('/auth/signup')
     .send({email:'user@test.com',password:'User@test.com',confirmPassword:`User@test.com`,userName:`Test User`})

    const res =  await request(app)
     .post('/auth/login')
     .send({email:`user@test.com`,password:`User@test.com`})

     accessToken=res.body.token
})

afterAll(async()=>{
    await pool.end();
    await redisConnection.quit();
    await emailQueue.close();
    await postQueue.close();
})


describe(`POST routes`,()=>{

    describe(`POST post/content`,()=>{
        it(`Should return 400 for Invalid post content`,async()=>{
            const res = await request(app)
            .post('/post/content')
            .set('Authorization',`Bearer ${accessToken}`)
            .send({content:1223})

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty(`message`)
        });

        // it(`Should return 404 if user dont have an account yet`,async()=>{
        //     await pool.query(`delete from users`)
        //     const res = await request(app)
        //     .post('/post/content')
        //     .set('Authorization',`Bearer ${accessToken}`)
        //     .send({content:'122'})
        //     expect(res.statusCode).toBe(404)
        // });

        it(`Should return 201 if the user post is successfully made`,async()=>{
            
            const res = await request(app)
            .post('/post/content')
            .set('Authorization',`Bearer ${accessToken}`)
            .send({content:`1223`})

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty(`message`)
        });
    })
})