import { TestingRuntime, createTestingRuntime } from "@dbos-inc/dbos-sdk";
import { Shop, DisplayProduct } from "./operations";
import request from "supertest";

describe("operations", () => {

  let testRuntime: TestingRuntime;

  beforeAll(async () => {
    testRuntime = await createTestingRuntime([Shop], undefined);
    await testRuntime.queryUserDB<void>(`delete from users;`);
  });

  afterAll(async () => {
    await testRuntime.destroy();
  });


  test("register", async () => {
    const req = {
      username: 'shopper',
      password: 'shopperpass',
    };
    const resp1 = await request(testRuntime.getHandlersCallback())
      .post("/api/register")
      .send(req);
    expect(resp1.status).toBe(204);

    const resp2 = await request(testRuntime.getHandlersCallback())
      .post("/api/register")
      .send(req);
    expect(resp2.status).toBe(400);
  });

  test("login", async () => {
    const breq1 = {
      username: 'nosuchsshopper',
      password: 'shopperpass',
    };
    const bresp1 = await request(testRuntime.getHandlersCallback())
      .post("/api/login")
      .send(breq1);
    expect(bresp1.status).toBe(400);

    const breq2 = {
      username: 'nosuchsshopper',
      password: 'incorrectpass',
    };
    const bresp2 = await request(testRuntime.getHandlersCallback())
      .post("/api/login")
      .send(breq2);
    expect(bresp2.status).toBe(400);

    const req = {
      username: 'shopper',
      password: 'shopperpass',
    };
    const resp1 = await request(testRuntime.getHandlersCallback())
      .post("/api/login")
      .send(req);
    expect(resp1.status).toBe(204);
  });

  test("products", async () => {
    const presp = await request(testRuntime.getHandlersCallback())
      .get("/api/products");
    expect(presp.status).toBe(200);
    const prods = presp.body as DisplayProduct[];
    expect(prods.length).toBe(2);

    /*
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const session_id = resp1.body.session_id as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const url = new URL(resp1.body.url as string);
    expect(url.pathname).toBe(`/payment/${session_id}`);

    const resp2 = await request(testRuntime.getHandlersCallback())
      .get(`/api/session_info/${session_id}`);
    expect(resp2.status).toBe(200);

    expect(resp2.body).toBeDefined();
    const body = resp2.body as PaymentSessionInformation;
    expect(body.session_id).toBe(session_id);
    expect(body.success_url).toBe(req.success_url);
    expect(body.cancel_url).toBe(req.cancel_url);
    expect(body.status).toBeFalsy();
    expect(body.items.length).toBe(req.items.length);

    // send a payment_complete_topic message to complete the workflow
    await testRuntime.send(session_id, null, payment_complete_topic);
    await testRuntime.retrieveWorkflow(session_id).getResult();
   */
  });
});

