import {awsLambdaHandler} from '@mionkit/serverless';
import {initRouter, registerRoutes, Routes} from '@mionkit/router';
import {authHook, authDataFactory} from './auth.routes.ts';
import {logHook} from './log.routes.ts';
import {userRoutes} from './user.routes.ts';

// initialize routes
const routes = {
    authHook,
    userRoutes,
    logHook,
} satisfies Routes;

// shared data factory
const sharedDataFactory = () => ({
    ...authDataFactory(),
});

// #### Init Http Server ####
const routerOptions = {sharedDataFactory, prefix: 'api/'};
initRouter(routerOptions);
registerRoutes(routes);

// export AWS Lambda Handler
export const handler = awsLambdaHandler;
