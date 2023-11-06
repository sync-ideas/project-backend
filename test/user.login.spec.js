import supertest from 'supertest';
import { assert } from 'chai';
import app from '../build/app.js';

describe('----- USERS API LOGIN ------', () => {

  it('Debe retornar "result: true" y token al login exitoso. HTTP 200', async function() {
    this.timeout(10000); 
    const response = await supertest(app).post('/api/users/login').send({
      email: 'gustavo@fring.com',
      password: '123'
    });
    assert.equal(response.status, 200);
    assert.equal(response.body.result, true);
    assert.exists(response.body.token)
  });

  it('Debe retornar "result: false" y "message: Incorrect password", al password incorrecto. HTTP 401', async function() {
    this.timeout(10000);
    const response = await supertest(app).post('/api/users/login').send({
      email: 'gustavo@fring.com',
      password: '1234'
    })
    assert.equal(response.status, 401);
    assert.equal(response.body.result, false);
    assert.equal(response.body.message, 'Incorrect password');
  })
  
  it('Debe retornar "result: false" y "message: User not found", al ususario no encontrado. HTTP 404', async function() {
    this.timeout(10000);
    const response = await supertest(app).post('/api/users/login').send({
      email: 'gustavo@fring2.com',
      password: '1234'
    })
    assert.equal(response.status, 404);
    assert.equal(response.body.result, false);
    assert.equal(response.body.message, 'User not found');
  })

  it('Debe retornar "result: false" y "message: Email and password are required", cuando faltan datos. HTTP 400', async function() {
    this.timeout(10000);
    const response = await supertest(app).post('/api/users/login').send({
      password: '1234'
    })
    assert.equal(response.status, 400);
    assert.equal(response.body.result, false);
    assert.equal(response.body.message, 'Email and password are required');
  })
 
})