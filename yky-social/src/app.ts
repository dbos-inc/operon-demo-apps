/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import "reflect-metadata";
import Koa from 'koa';
import { Context, Next } from 'koa';
import Router from "@koa/router";
import logger from "koa-logger";
import { bodyParser } from "@koa/bodyparser";

import { DataSource, EntityManager } from "typeorm";

import { MediaItem } from "./entity/Media";
import { Post } from "./entity/Post";
import { GraphType, SocialGraph } from "./entity/Graph";
import { RecvType, SendType, TimelineRecv, TimelineSend } from "./entity/Timeline";
import { UserLogin } from "./entity/UserLogin";
import { UserProfile } from "./entity/UserProfile";

import { Operations } from "./Operations";
import {
  Operon, Required, GetApi, RequiredRole,
  OperonContext, OperonTransaction, TransactionContext,
  ArgSource, ArgSources, LogMask, LogMasks, PostApi,
  OperonWorkflow, WorkflowContext,
  OperonHttpServer,
  OperonNotAuthorizedError,
  MiddlewareContext,
  DefaultRequiredRole,
} from "@dbos-inc/operon";


import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3ClientConfig = {
  region: process.env.AWS_REGION || 'us-east-2', // Replace with your AWS region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || 'x',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'x',
  }
};

const s3Client = new S3Client(s3ClientConfig);
export function getS3Client() {return s3Client;}

export const userDataSource = new DataSource({
  "type": "postgres",
  "host": process.env.POSTGRES_HOST,
  "port": Number(process.env.POSTGRES_PORT),
  "username": process.env.POSTGRES_USERNAME,
  "password": process.env.POSTGRES_PASSWORD,
  "database": process.env.POSTGRES_DBNAME,
  "synchronize": true,
  "logging": false,
  "entities": [
    MediaItem,
    Post,
    SocialGraph,
    UserLogin,
    UserProfile,
    TimelineSend,
    TimelineRecv,
  ],
  "migrations": [
     "./migration/**/*.ts"
  ],
  "subscribers": [
     "./subscriber/**/*.ts"
  ],
});

@DefaultRequiredRole(['user'])
export class YKY
{
  // eslint-disable-next-line @typescript-eslint/require-await
  @GetApi('/')
  @RequiredRole([])
  static async hello(_ctx: OperonContext) {
    return {message: "Welcome to YKY (Yakky not Yucky)!"};
  }
  static async helloctx(ctx:Context, next: Next) {
    ctx.body = {message: "Welcome to YKY (Yakky not Yucky)!"};
    return next();
  }

  @OperonTransaction({readOnly: true})
  @GetApi('/recvtimeline')
  static async receiveTimeline(ctx: TransactionContext) 
  {
    const manager = ctx.typeormEM as unknown as EntityManager;

    const rtl = await Operations.readRecvTimeline(manager, ctx.authenticatedUser, [RecvType.POST], true);  // TODO #4 - Integrate typeORM into transaction context
    const tl = rtl.map((tle) => {
      return {postId: tle.post_id, fromUserId:tle.from_user_id, unread:tle.unread, sendDate: tle.send_date, recvType:tle.recv_type,
          postText: tle.post?.text, postMentions: tle.post?.mentions};
    });

    return {message: "Read.", timeline:tl};
  }

  @OperonTransaction({readOnly: true})
  @GetApi('/sendtimeline')
  static async sendTimeline(ctx: TransactionContext)
  {
    // TODO: User id and modes
    const userid = ctx.authenticatedUser;
    const manager = ctx.typeormEM as unknown as EntityManager;

    const rtl = await Operations.readSendTimeline(manager, userid, userid, [SendType.PM, SendType.POST, SendType.REPOST], true);
    const tl = rtl.map((tle) => {
      return {postId: tle.post_id,  fromUserId:tle.user_id, sendDate: tle.send_date, sendType:tle.send_type,
          postText: tle.post?.text, postMentions: tle.post?.mentions};
    });

    return {message: "Read.", timeline: tl};
  }

  @OperonTransaction({readOnly: true})
  @GetApi('/finduser')
  static async findUser(ctx: TransactionContext, @Required findUserName: string) {
    const manager = ctx.typeormEM as unknown as EntityManager;
    const [user, _prof, _gsrc, _gdst] = await Operations.findUser(manager,
      ctx.authenticatedUser, findUserName, false, false);
    if (!user) {
      return {message: "No user by that name."};
    }
    else {
      return {message:"User Found.", uid : user.id, name : user.user_name};
    }
  }

  @OperonTransaction({readOnly: true})
  @GetApi("/post/:id")
  static async getPost(ctx: TransactionContext, @Required @ArgSource(ArgSources.URL) id: string) {
    // TODO Validate user permissions

    const manager = ctx.typeormEM as unknown as EntityManager;
    const post = await Operations.getPost(manager, ctx.authenticatedUser, id);
    if (post) {
      return { message: 'Retrieved.', post:post };
    } else {
      return { message: 'No such post.' };
    }
  }  

  @OperonTransaction({readOnly: true})
  @PostApi("/login")
  @RequiredRole([]) // Don't need any roles to log in
  static async doLogin(ctx: TransactionContext, @Required username: string, @Required @LogMask(LogMasks.HASH) password: string) {
    const manager = ctx.typeormEM as unknown as EntityManager;
    const user = await Operations.logInUser(manager, username, password);
    return { message: 'Successful login.', id:user.id };
  }

  // OK, so the thought here is a browser might call this
  //  and, there is a nonzero chance that it could get resubmit.
  // What do we do then?  It's trying to use a transaction to
  //  protect itself, but it will raise an error.  Should we just
  //  say hey, it's fine, if it all matches?
  // Can this be generalized?
  @PostApi("/register")
  @RequiredRole([]) // No role needed to register
  static async doRegister(ctx: OperonContext, @Required firstName: string, @Required lastName: string,
     @Required username: string, @Required @LogMask(LogMasks.HASH) password: string)
  {
    const user = await operon.transaction(Operations.createUser, {parentCtx: ctx},
       firstName, lastName, username, password);

    return { message: 'User created.', id:user.id };
  }

  @OperonTransaction()
  @PostApi("/follow")
  static async doFollow(ctx: TransactionContext, @Required followUid: string) {
    const manager = ctx.typeormEM as unknown as EntityManager;
    const curStatus = await Operations.getGraphStatus(manager, ctx.authenticatedUser, followUid);
    await Operations.setGraphStatus(manager, ctx.authenticatedUser, followUid, curStatus == GraphType.FRIEND ? GraphType.FOLLOW_FRIEND : GraphType.FOLLOW);
    // TODO: That UID wasn't validated - maybe the DB should validate it

    return {message: "Followed."};
  }

  @OperonWorkflow()
  @PostApi("/composepost")
  static async doCompose(ctx: WorkflowContext, @Required postText: string) {
    const post = await operon.transaction(Operations.makePost, {parentCtx: ctx}, postText);
    // This could be an asynchronous job
    await operon.transaction(Operations.distributePost, {parentCtx: ctx}, post);
    return {message: "Posted."};  
  }

  @GetApi("/getMediaUploadKey")
  @RequiredRole([])
  @OperonWorkflow()
  static async doKeyUpload(ctx: WorkflowContext, @Required filename: string) {
    const key = `photos/${filename}-${Date.now()}`;
    const bucket = process.env.S3_BUCKET_NAME || 'yky-social-photos';
    const postPresigned = await ctx.external(Operations.createS3UploadKey, key, bucket);

    return {message: "Signed URL", url: postPresigned.url, key: key, fields: postPresigned.fields};
  }

  @GetApi("/getMediaDownloadKey")
  @RequiredRole([])
  static async doKeyDownload(_ctx: OperonContext, @Required filekey: string) {
    const key = filekey;
    const bucket = process.env.S3_BUCKET_NAME || 'yky-social-photos';

    const getObjectCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
  
    const presignedUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600, });
    return { message: "Signed URL", url: presignedUrl, key: key };
  }
}

// Initialize Operon.
export const operon = new Operon({
  poolConfig: {
    user: process.env.POSTGRES_USERNAME,
    database: process.env.POSTGRES_DBNAME,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT),
    host: process.env.POSTGRES_HOST,
  },
  telemetryExporters: undefined,
  system_database: 'opsys',
  observability_database: undefined
});

export const kapp = new Koa();

// Start Koa server.
kapp.use(logger());
kapp.use(bodyParser());
//kapp.use(cors());

const router = new Router();

export function ykyInit()
{
  OperonHttpServer.registerDecoratedEndpoints(operon, router, {
  // eslint-disable-next-line @typescript-eslint/require-await
  auth: async (ctx: MiddlewareContext) => {
      if (ctx.requiredRole.length > 0) {
        // TODO: We really need to validate something, generally it would be a token
        //  Currently the backend is "taking the front-end's word for it"
        const { userid } = ctx.koaContext.request.query;
        const uid = userid?.toString();

        if (!uid) {
          const err = new OperonNotAuthorizedError("Not logged in.", 401);
          throw err;
        }
        return {
          authenticatedUser: uid,
          authenticatedRoles: ['user']
        };
      }
    }
  });
}

// Example of how to do a route directly in Koa
router.get("/koa", async (ctx, next) => {
  return YKY.helloctx(ctx, next);
});

kapp.use(router.routes()).use(router.allowedMethods());
