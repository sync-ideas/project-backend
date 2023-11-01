import supertest from 'supertest';
import { assert } from 'chai';
import app from '../../build/app.js';

describe('----- USERS API REGISTER ------', () => {

  it('Debe retornar "result: false" y "message: All fields are required", cuando faltan datos. HTTP 400', async function() {
    this.timeout(10000); 
    const response = await supertest(app).post('/api/users/register').send({
      email: 'gustavo@fring.com',
      password: '123',
      fullname: '',
    });
    assert.equal(response.status, 400);
    assert.equal(response.body.result, false);
    assert.exists(response.body.message, 'All fields are required');
  });

  it('Debe retornar "result: false" y "message: Email already exists", cuando el email ya existe. HTTP 401', async function() {
    this.timeout(10000); 
    const response = await supertest(app).post('/api/users/register').send({
      email: 'gustavo@fring.com',
      password: '123',
      fullname: 'Gustavo Fring',
    });
    assert.equal(response.status, 401);
    assert.equal(response.body.result, false);
    assert.exists(response.body.message, 'Email already exists');
  }); 

  it('Debe retornar "result: true" y "message: User created successfully. Please check your email to activate your account."", cuando el email ya existe. HTTP 401', async function() {
    this.timeout(10000); 
    const response = await supertest(app).post('/api/users/register').send({
      email: 'gustavo@fring2.com',
      password: '123',
      fullname: 'Gustavo Fring',
    });
    assert.equal(response.status, 201);
    assert.equal(response.body.result, true);
    assert.exists(response.body.message, 'User created successfully. Please check your email to activate your account.');
  }); 
 
 
})