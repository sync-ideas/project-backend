import supertest from 'supertest';
import { fileURLToPath } from 'url'
import path from 'path';
import { assert } from 'chai';
import app from '../build/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 


describe('----- STUDENTS API IMPORT FROM EXCEL ------', () =>  {

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
      .post('/api/students/excel-import')
      .set('Authorization', `Bearer ${token}`)
      .send({
      fullname: 'Nombre',
     });
    assert.equal(response.status, 400);
    assert.equal(response.body.result, false);
    assert.equal(response.body.message, 'File and column names are required');
  });

  /*
  it('Debe retornar "result: true" al registrar los estudiantes. HTTP 201', async function() {
    this.timeout(10000); 
    assert.isDefined(token)
    console.log(path.resolve(__dirname, 'students.xls'))
    const response = await supertest(app)
      .post('/api/subjects/register')
      .set('Authorization', `Bearer ${token}`)
      .field('fullname', 'Nombre')
      .field('contact_phone', 'telefono')
      .attach('file', path.resolve(__dirname, 'students.xls'));
    assert.equal(response.status, 201);
    assert.equal(response.body.result, true);
    assert.exists(response.body.createdStudents)
  });
  */

})
 