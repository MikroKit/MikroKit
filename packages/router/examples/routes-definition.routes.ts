import {setRouterOptions, registerRoutes} from '@mionkit/router';

const sayHello = (app, ctx, name: string): string => {
    return `Hello ${name}.`;
};

const sayHello2 = {
    route(app, ctx, name1: string, name2: string): string {
        return `Hello ${name1} and ${name2}.`;
    },
};

const routes = {
    sayHello, // api/sayHello
    sayHello2, // api/sayHello2
};

setRouterOptions({prefix: 'api/'});
export const apiSpec = registerRoutes(routes);
