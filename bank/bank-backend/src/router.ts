import Router from "@koa/router";
import { bankname, operon } from "./main";
import { BankAccountInfo } from "./workflows/accountinfo.workflows";
import { AccountInfo, TransactionHistory } from "@prisma/client";
import { depositWorkflow, listTxnForAccountFunc, withdrawWorkflow, internalTransferFunc } from "./workflows/txnhistory.workflows";

export const router = new Router();

export interface RouterResponse {
  body: string | AccountInfo[] | TransactionHistory[],
  status: number,
  message: string
}

// Helper functions to convert to the correct data types.
// Especially convert the bigint.
function convertTransactionHistory(data: TransactionHistory): TransactionHistory {
  return {
    txnId: BigInt(data.txnId ?? -1n),
    fromAccountId: BigInt(data.fromAccountId ?? -1n),
    fromLocation: data.fromLocation ?? undefined,
    toAccountId: BigInt(data.toAccountId ?? -1n),
    toLocation: data.toLocation ?? undefined,
    amount: data.amount ?? undefined,
    timestamp: data.timestamp ?? undefined
  }
}

function convertAccountInfo(data: AccountInfo): AccountInfo {
  return {
    accountId: BigInt(data.accountId ?? -1n),
    balance: BigInt(data.balance ?? -1n),
    type: data.type ?? undefined,
    ownerName: data.ownerName ?? undefined
  }
}

router.get("/api/greeting", async(ctx, next) => {
  ctx.body = {msg: `Hello from DBOS Operon ${bankname}!`};
  await next();
});

router.get("/api/admin_greeting", async(ctx, next) => {
  ctx.body = {msg: `Hello admin, from DBOS Operon ${bankname}!`};
  await next();
});

// List accounts.
router.get("/api/list_accounts/:ownerName", async(ctx, next) => {
  const name: string = ctx.params.ownerName;
  try {
    ctx.body = await operon.transaction(BankAccountInfo.listAccountsFunc, {}, name);
    ctx.status = 200;
  } catch (err) {
    console.error(err);
    const error = err as Error;
    ctx.body = error.message ?? "Error! cannot list accounts for: " + name;
    ctx.status = 500;
  }
  await next();
});

// Create account.
router.post("/api/create_account", async(ctx, next) => {
  const data = convertAccountInfo(ctx.request.body as AccountInfo);
  if ((data.balance === undefined) || !data.ownerName) {
    console.log("Invalid input: " + JSON.stringify(data));
    ctx.status = 500;
    ctx.message = "invalid input!";
    await next();
    return;
  }
  try {
    ctx.body = await operon.transaction(BankAccountInfo.createAccountFunc, {}, data);
    ctx.status = 201;
  } catch (err) {
    console.error(err);
    const error = err as Error;
    ctx.body = error.message ?? "Error! cannot create the account!";
    ctx.status = 500;
  }
  await next();
});

// Get transaction history
router.get("/api/transaction_history/:accountId",async (ctx, next) => {
  const acctId = BigInt(ctx.params.accountId);
  try {
    ctx.body = await operon.transaction(listTxnForAccountFunc, {}, acctId);
    ctx.status = 200;
  } catch (err) {
    console.error(err);
    const error = err as Error;
    ctx.body = error.message ?? "Error! cannot list transactions for account: " + acctId;
    ctx.status = 500;
  }
  await next();
});


// Deposit.
router.post("/api/deposit", async(ctx, next) => {
  const data = convertTransactionHistory(ctx.request.body as TransactionHistory);
  // TODO: implement auth.
  // const token = ctx.request.header["authorization"];
  if (!data.fromLocation) {
    console.error("fromLocation must not be empty!");
    ctx.status = 500;
    ctx.message = "fromLocation must not be empty!";
    await next();
    return;
  }

  if (!data.amount || data.amount <= 0) {
    console.error("Invalid amount! " + data.amount);
    ctx.status = 500;
    ctx.message = "Invalid amount!";
    await next();
    return;
  }

  // Must to local.
  data.toLocation = 'local';

  // Let it be -1 for cash.
  if (!data.fromAccountId) {
    data.fromAccountId = -1n;
  }
  
  // Invoke the workflow.
  let retResponse: RouterResponse;
  try {
    retResponse = await operon.workflow(depositWorkflow, {}, data).getResult();
    ctx.status = retResponse.status;
    ctx.body = retResponse.body;
    ctx.message = retResponse.message;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
    const error = err as Error;
    ctx.message = error.message ?? "Failed to deposit!";
  }

  await next();
  return;
});

// Withdraw.
router.post("/api/withdraw", async(ctx, next) => {
  const data = convertTransactionHistory(ctx.request.body as TransactionHistory);
  // TODO: implement auth.
  // const token = ctx.request.header["authorization"];
  // console.log("Retrieved token: " + token); // Should have Bearer prefix.
  if (!data.toLocation) {
    console.error("toLocation must not be empty!");
    ctx.status = 500;
    ctx.message = "toLocation must not be empty!";
    await next();
    return;
  }

  if (!data.amount || data.amount <= 0) {
    console.error("Invalid amount! " + data.amount);
    ctx.status = 500;
    ctx.message = "Invalid amount!";
    await next();
    return;
  }

  // Must from local.
  data.fromLocation = 'local';

  // Let it be -1 for cash.
  if (!data.toAccountId) {
    data.toAccountId = -1n;
  }
  
  // Invoke the workflow.
  let retResponse: RouterResponse;
  try {
    retResponse = await operon.workflow(withdrawWorkflow, {}, data).getResult();
    ctx.status = retResponse.status;
    ctx.body = retResponse.body;
    ctx.message = retResponse.message;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
    const error = err as Error;
    ctx.message = error.message ?? "Failed to withdraw!";
  }

  await next();
  return;
});

// Internal transfer
router.post("/api/transfer", async(ctx, next) => {
  const data = convertTransactionHistory(ctx.request.body as TransactionHistory);
  // Check the transaction is within the local database.
  if (((data.fromLocation !== undefined) && (data.fromLocation !== 'local'))
    || ((data.toLocation !== undefined) && (data.toLocation !== 'local'))) {
    console.error("Must be a local transaction! Instead: " + data.fromLocation + " -> " + data.toLocation);
    ctx.status = 500;
    ctx.message = "Must be a local transaction!";
    await next();
    return;
  }

  // Check valid input.
  if (!data.toLocation || !data.toAccountId || !data.amount || !data.fromAccountId || !data.fromLocation) {
    ctx.status = 500;
    ctx.message = "Invalid input!";
    await next();
    return;
  }

  if (data.amount <= 0.0) {
    ctx.status = 500;
    ctx.message = "Invalid amount!";
    await next();
    return;
  }

  // Invoke the transaction.
  try {
    const retResponse: RouterResponse = await operon.transaction(internalTransferFunc, {}, data);
    ctx.status = retResponse.status;
    ctx.body = retResponse.body;
    ctx.message = retResponse.message;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
    const error = err as Error;
    ctx.message = error.message ?? "Failed to transfer!";
  }

  await next();
  return;
});