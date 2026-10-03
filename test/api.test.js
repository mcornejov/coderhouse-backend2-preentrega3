import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { iniciarBaseDePrueba, detenerBaseDePrueba } from './setup.js';

before(iniciarBaseDePrueba);
after(detenerBaseDePrueba);

describe('GET /api/health', () => {
  test('responde 200 con el estado del servidor', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: 'ok', message: 'Servidor activo' });
  });
});

describe('GET /api/events', () => {
  test('responde 200 con una lista vacía al inicio', async () => {
    const res = await request(app).get('/api/events');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: 'success', payload: [] });
  });

  test('responde 404 si el evento no existe', async () => {
    const res = await request(app).get('/api/events/inexistente');
    assert.equal(res.status, 404);
    assert.equal(res.body.status, 'error');
  });
});

describe('Manejo de errores', () => {
  test('responde 404 en rutas inexistentes', async () => {
    const res = await request(app).get('/api/no-existe');
    assert.equal(res.status, 404);
    assert.equal(res.body.status, 'error');
  });

  test('responde 400 si la URL tiene caracteres mal codificados', async () => {
    const res = await request(app).get('/api/events/%E0%A4%A');
    assert.equal(res.status, 400);
    assert.equal(res.body.status, 'error');
  });

  test('responde 400 si el body no es JSON válido', async () => {
    const res = await request(app)
      .post('/api/sessions/register')
      .set('Content-Type', 'application/json')
      .send('{"mal json"');
    assert.equal(res.status, 400);
    assert.equal(res.body.status, 'error');
  });
});
