import request from 'supertest';
import app from '../routes/main.js';
import {afterAll, beforeAll, describe, expect, test} from '@jest/globals';
import pool from '../../database/connection.js';
import redisConnection from '../../database/redis.js';
import { emailQueue,postQueue } from '../queues/emailQueue.js';



beforeAll(async()=>{
    await pool.query(`delete from users`)
})


afterAll(async()=>{
    await pool.end(),
    await redisConnection.quit(),
    await emailQueue.close(),
    await postQueue.close()
})

describe('Auth Routes',()=>{

    describe('POST auth/signup',()=>{
        it('should create a new user and return 201 status',async()=>{
            const res = await request(app)
            .post('/auth/signup')
            .send({email:'misty@test.com',password:'Misty@test.com',confirmPassword:'Misty@test.com',userName:'Misty'})

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('message')
        });

        it(`should return 400 status for Invalid Input`,async()=>{
            const res = await request(app)
            .post('/auth/signup')
            .send({email:`Brockpkmn.com`,password:`Brock@pkmn.com`,confirmPassword:`Brock@pkmn.com`,userName:`Brock`})
            

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message')
        })
    })

    describe(`POST /auth/login`,()=>{
        it(`Should return 200 when the user is logged in`,async()=>{
            const res = await request(app)
            .post('/auth/login')
            .send({email:`misty@test.com`,password:`Misty@test.com`})

            expect(res.statusCode).toBe(200)
            expect(res.body).toHaveProperty('token')
        });

        it(`Should return 400 for failure in Input Validation`,async()=>{
            const res = await request(app)
            .post('/auth/login')
            .send({email:`mistytest.com`,password:`Misty@test.com`})

            expect(res.statusCode).toBe(400)
            expect(res.body).toHaveProperty('message')
        })

        it(`Should return 404 if user dont have an account yet!`,async()=>{
            const res = await request(app)
            .post('/auth/login')
            .send({email:`brock@test.com`,password:`Brock@test.com`})

            expect(res.statusCode).toBe(404)
            expect(res.body).toHaveProperty('message')
        })

        it(`Should return 400 if Password dont match!`,async()=>{
            const res = await request(app)
            .post('/auth/login')
            .send({email:`misty@test.com`,password:`Bisty@test.com`})

            expect(res.statusCode).toBe(400)
            expect(res.body).toHaveProperty('message')
        })
    })
})