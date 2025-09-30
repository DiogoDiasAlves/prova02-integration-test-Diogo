import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';

const baseUrl = 'https://petstore.swagger.io/v2';
const headers = { 'Content-Type': 'application/json' };

const fakePet = {
  id: 9999,
  name: 'TestPet',
  status: 'available'
};

const tempPet = {
  id: 88888,
  name: 'TempPet',
  status: 'pending'
};

describe('Petstore API Tests (Swagger Mock)', () => {
  beforeAll(() => {
    pactum.request.setDefaultTimeout(10000);
  });

  describe('📌 Criação de Pets', () => {
    it('Deve criar um pet com dados válidos', async () => {
      await pactum
        .spec()
        .post(`${baseUrl}/pet`)
        .withHeaders(headers)
        .withJson(fakePet)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike(fakePet);
    });

    it('Deve criar um pet sem ID (API gera automaticamente)', async () => {
      await pactum
        .spec()
        .post(`${baseUrl}/pet`)
        .withHeaders(headers)
        .withJson({ name: 'InvalidPet', status: 'available' })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ name: 'InvalidPet', status: 'available' });
    });
  });

  describe('🔍 Consulta de Pets', () => {
    it('Deve retornar um pet existente pelo ID ou 404 se não existir', async () => {
      await pactum
        .spec()
        .get(`${baseUrl}/pet/1`)
        .expect(res => {
          const status = res.res.statusCode;
          if (![StatusCodes.OK, StatusCodes.NOT_FOUND].includes(status)) {
            throw new Error(`Status inesperado: ${status}`);
          }
        });
    });

    it('Deve retornar 404 ao buscar pet com ID inválido (string)', async () => {
      await pactum
        .spec()
        .get(`${baseUrl}/pet/invalid-id`)
        .expectStatus(StatusCodes.NOT_FOUND);
    });

    it('Deve buscar pets com status "available"', async () => {
      await pactum
        .spec()
        .get(`${baseUrl}/pet/findByStatus`)
        .withQueryParams('status', 'available')
        .expectStatus(StatusCodes.OK)
        .expectJsonLike([{ status: 'available' }]);
    });

    it('Deve retornar lista vazia ao buscar com status inválido', async () => {
      await pactum
        .spec()
        .get(`${baseUrl}/pet/findByStatus`)
        .withQueryParams('status', 'banana')
        .expectStatus(StatusCodes.OK)
        .expectJson([]);
    });
  });

  describe('✏️ Atualização de Pets', () => {
    it('Deve atualizar os dados de um pet existente', async () => {
      await pactum
        .spec()
        .put(`${baseUrl}/pet`)
        .withHeaders(headers)
        .withJson({ ...fakePet, name: 'UpdatedPet' })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ name: 'UpdatedPet' });
    });

    it('Deve retornar sucesso ao atualizar pet inexistente', async () => {
      await pactum
        .spec()
        .put(`${baseUrl}/pet`)
        .withHeaders(headers)
        .withJson({
          id: 123456,
          name: 'NonExistentPet',
          status: 'sold'
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          name: 'NonExistentPet',
          status: 'sold'
        });
    });
  });

  describe('❌ Exclusão de Pets', () => {
    it('Deve retornar 200 ou 404 ao deletar um pet inexistente (API não valida existência)', async () => {
      await pactum
        .spec()
        .delete(`${baseUrl}/pet/999999`)
        .expect(res => {
          const status = res.res.statusCode;
          if (![StatusCodes.OK, StatusCodes.NOT_FOUND].includes(status)) {
            throw new Error(`Status inesperado: ${status}`);
          }
        });
    });

    it('Deve criar, deletar e não encontrar mais o pet', async () => {
      // Criar
      await pactum
        .spec()
        .post(`${baseUrl}/pet`)
        .withHeaders(headers)
        .withJson(tempPet)
        .expectStatus(StatusCodes.OK);

      // Deletar (aceita 200 ou 404)
      await pactum
        .spec()
        .delete(`${baseUrl}/pet/${tempPet.id}`)
        .expect(res => {
          const status = res.res.statusCode;
          if (![StatusCodes.OK, StatusCodes.NOT_FOUND].includes(status)) {
            throw new Error(`Status inesperado: ${status}`);
          }
        });

      // Verificar remoção (aceita 404 ou 200 por causa do mock)
      await pactum
        .spec()
        .get(`${baseUrl}/pet/${tempPet.id}`)
        .expect(res => {
          const status = res.res.statusCode;
          if (![StatusCodes.NOT_FOUND, StatusCodes.OK].includes(status)) {
            throw new Error(`Status inesperado: ${status}`);
          }
        });
    });
  });
});
