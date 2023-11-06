import supertest from 'supertest';
import { assert } from 'chai';
import app from '../build/app.js';
import { prisma } from "../build/config/prisma.client.js";

describe('----- SUBJECT API REGISTER ------', () =>  {

 let token

 // Login
 it('Debe iniciar sesion y obtener el token. HTTP 200', async function() {
    this.timeout(10000); 
    const response = await supertest(app).post('/api/users/login').send({
      email: 'gustavo@fring.com',
      password: '123'
    });
    assert.equal(response.status, 200);
    assert.equal(response.body.result, true);
    assert.exists(response.body.token)
    token = response.body.token
  });

  it('Debe retornar "result: false" al cuando faltan datos. HTTP 400', async function() {
    this.timeout(10000); 
    assert.isDefined(token)
    const response = await supertest(app)
      .post('/api/subjects/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
      name: 'Asignatura',
     });
    assert.equal(response.status, 400);
    assert.equal(response.body.result, false);
    assert.equal(response.body.message, 'All fields are required');
  });

  it('Debe retornar "result: true" al registrar el subject. HTTP 201', async function() {
    this.timeout(10000); 
    assert.isDefined(token)
    const response = await supertest(app)
      .post('/api/subjects/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
      name: 'Asignatura',
      level: '1'
    });
    assert.equal(response.status, 201);
    assert.equal(response.body.result, true);
    assert.exists(response.body.subject)
  });

  it('Debe retornar "result: false" al cuando ya existe el subject. HTTP 403', async function() {
    this.timeout(10000); 
    assert.isDefined(token)
    const response = await supertest(app)
      .post('/api/subjects/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
      name: 'Asignatura',
      level: '1'
     });
    assert.equal(response.status, 403);
    assert.equal(response.body.result, false);
    assert.equal(response.body.message, 'Subject already exists');

    // Eliminamos el subject creado anteriormente
    const deletedSubject = await prisma.subject.deleteMany({
      where: {
        name: 'Asignatura',
        level: '1'
      }
    });
    assert.equal(deletedSubject.count, 1)     
  });


 
})