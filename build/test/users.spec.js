import supertest from 'supertest';
import { assert } from 'chai';
import app from '../src/app.js';
describe('Users api test', () => {
    it('Debe retornar datos de usuario y token al login', async () => {
        const response = await supertest(app).post('/api/user/login').send({
            email: 'gustavo@fring.com', password: '123'
        });
        assert.equal(response.status, 200);
        assert.equal(response.body.email, 'gustavo@fring.com');
    });
});
//# sourceMappingURL=users.spec.js.map