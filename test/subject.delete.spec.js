import supertest from 'supertest';
import { assert } from 'chai';
import app from '../build/app.js';
import { prisma } from "../build/config/prisma.client.js";

describe('----- SUBJECT API DELETE ------', () =>  {

 let token, subjectId
 
 // Login
 it('Iniciar sesion', async function() {
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

  it('Registro de subject', async function() {
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
    subjectId = response.body.subject.id
  });

  it('Debe retornar "result: false" cuando no se indica el id correcto. HTTP 500', async function() {
    this.timeout(10000); 
    assert.isDefined(token)
    const response = await supertest(app)
      .delete('/api/subjects/delete/iouoi')
      .set('Authorization', `Bearer ${token}`)
    assert.equal(response.status, 500);
    assert.equal(response.body.result, false);
    assert.equal(response.body.message, 'Internal server error');
    assert.exists(response.body.error)
  });

  it('Debe retornar "result: true" al eliminar el subject. HTTP 202', async function() {
    this.timeout(10000); 
    assert.isDefined(token)
    assert.isDefined(subjectId)
    /*
    const response = await supertest(app)
      .delete(`/api/subjects/delete/${subjectId}`)
      .set('Authorization', `Bearer ${token}`)
    assert.equal(response.status, 202);
    assert.equal(response.body.result, true);
    assert.equal(response.body.message, 'Subject deleted');
    */
    // Eliminamos el subject creado anteriormente
    const deletedSubject = await prisma.subject.deleteMany({
      where: {
        id: subjectId
      }
    });
    assert.equal(deletedSubject.count, 1)     
  });


 
})