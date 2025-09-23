import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';

describe('Petstore API Tests (Mock)', () => {
  const p = pactum;
  const baseUrl = 'https://petstore.swagger.io/v2';

  const fakePet = {
    id: 9999,
    name: 'TestPet',
    status: 'available'
  };

  beforeAll(() => {
    p.request.setDefaultTimeout(10000);
  });

  it('Should simulate pet creation', async () => {
    await p
      .spec()
      .post(`${baseUrl}/pet`)
      .withHeaders('Content-Type', 'application/json')
      .withJson(fakePet)
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({
        name: 'TestPet',
        status: 'available'
      });
  });

  it('Should get an existing pet (ID 1)', async () => {
    await p
      .spec()
      .get(`${baseUrl}/pet/1`)
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({
        id: 1
      });
  });

  it('Should simulate pet update', async () => {
    await p
      .spec()
      .put(`${baseUrl}/pet`)
      .withHeaders('Content-Type', 'application/json')
      .withJson({
        ...fakePet,
        name: 'UpdatedPet'
      })
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({
        name: 'UpdatedPet'
      });
  });

  it('Should get 404 when deleting non-existent pet', async () => {
    await p
      .spec()
      .delete(`${baseUrl}/pet/9999`)
      .expectStatus(StatusCodes.NOT_FOUND);
  });

  // ⚠️ Comentado porque a API mock da Petstore não persiste exclusões
  /*
  it('Should get 404 for non-existent pet', async () => {
    await p
      .spec()
      .get(`${baseUrl}/pet/9999`)
      .expectStatus(StatusCodes.NOT_FOUND);
  });
  */
});
