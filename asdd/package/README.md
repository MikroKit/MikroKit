<p align="center">
  <img alt="Typescript Serverless Apis at the speed of light" width="" src='../../assets/public/bannerx90.png?raw=true'>
</p>
<p align="center">
  <strong>MikroKit Serverless Router for quick Api development.
  </strong>
</p>
<p align=center>
  <img src="https://img.shields.io/travis/mikrokit/mikrokit.svg?style=flat-square&maxAge=86400" alt="Travis" style="max-width:100%;">
  <img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square&maxAge=99999999" alt="npm"  style="max-width:100%;">
  <img src="https://img.shields.io/badge/license-MIT-97ca00.svg?style=flat-square&maxAge=99999999" alt="npm"  style="max-width:100%;">
</p>

# `@mikrokit/serverless`

**_[MikroKit Router](../router/README.md) is an RPC like router oriented for quick Api development,_** &nbsp; it is agnostic about the server or serverless environment it is used on. It could be used on aws lambda, azure functions, Google cloud functions, or any event based environment.

This package contains a collection bindings for different serverless environments.

## `RPC like router`

MikroKit router uses a **Remote Procedure Call** style routing, unlike traditional routers it does not use `GET`, `PUT`, `POST` and `DELETE` methods, everything is transmitted using `HTTP POST` method and all data is sent/received in the request/response `body` and `headers`.

### Requests & Responses

- Requests are made using only `HTTP POST` method.
- Data is sent and received only in the `body` and `headers`.
- Data is sent and received only in `JSON` format.

## `Routing`

🚀 Lightweight router **_based in plain javascript objects_**.

Thanks to it's RPC style there is no need to parse parameters or regular expressions when finding a route. Just a simple [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) in memory containing all the routes.

`Route parameters` are passed as an array in the request body, in a field with the same name as the route. Elements in the array must have the same order as the function parameters.

`Route response` is send back in the body in a field with the same name as the route.

The reason for this weird naming is to future proof the router to be able to accept multiple routes on a single request. However this can be changed setting the `routeFieldName` in the router options.

### 📋 [Please read full router documentation here!](./packages/router/README.md)

```js
// ../router/examples/routes-definition.routes.ts

import {Route, Handler, Routes, MkRouter} from '@mikrokit/router';

const sayHello: Handler = (context, name: string): string => {
  return `Hello ${name}.`;
};

const sayHello2: Route = {
  route(context, name1: string, name2: string): string {
    return `Hello ${name1} and ${name2}.`;
  },
};

const routes: Routes = {
  sayHello, // api/sayHello
  sayHello2, // api/sayHello2
};

MkRouter.setRouterOptions({prefix: 'api/'});
MkRouter.addRoutes(routes);
```

<!--
## AWS Lambda

## Azure Functions

## Google Cloud Functions -->

---

_[MIT](../../LICENSE) LICENSE_