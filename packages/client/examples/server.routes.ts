import {RpcError} from '@mionkit/core';
import {Routes, registerRoutes} from '@mionkit/router';
import {clientRoutes} from '@mionkit/common';
import {initAwsLambdaRouter, lambdaHandler} from '@mionkit/serverless';
import {Logger} from 'Logger';

export type User = {id: string; name: string; surname: string};
export type Order = {id: string; date: Date; userId: string; totalUSD: number};

const routes = {
    auth: {
        headerName: 'authorization',
        headerHook: (ctx, token: string): void => {
            if (!token) throw new RpcError({statusCode: 401, message: 'Not Authorized', name: ' Not Authorized'});
        },
    },
    users: {
        getById: (ctx, id: string): User => ({id, name: 'John', surname: 'Smith'}),
        delete: (ctx, id: string): string => id,
        create: (ctx, user: Omit<User, 'id'>): User => ({id: 'USER-123', ...user}),
    },
    orders: {
        getById: (ctx, id: string): Order => ({id, date: new Date(), userId: 'USER-123', totalUSD: 120}),
        delete: (ctx, id: string): string => id,
        create: (ctx, order: Omit<Order, 'id'>): Order => ({id: 'ORDER-123', ...order}),
    },
    utils: {
        sum: (ctx, a: number, b: number): number => a + b,
        sayHello: (ctx, user: User): string => `Hello ${user.name} ${user.surname}`,
    },
    log: {
        forceRunOnError: true,
        hook: (ctx): any => {
            Logger.log(ctx.path, ctx.request.headers, ctx.request.body);
        },
    },
} satisfies Routes;

// init serverless router and export handler
initAwsLambdaRouter();
export const handler = lambdaHandler;
// use initHttpRouter(...); for regular nodejs server

// register routes and exporting the type of the Api to be used by client
const myApi = registerRoutes(routes);
export type MyApi = typeof myApi;

// register routes required by client
// these routes serve metadata required for validation and serialization on the client
registerRoutes(clientRoutes);