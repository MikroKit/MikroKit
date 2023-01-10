/* ########
 * 2022 MikroKit
 * Author: Ma-jerez
 * License: MIT
 * The software is provided "as is", without warranty of any kind.
 * ######## */

import {getGenerateClientOptions} from './clientGenerator';
import {ExecutableSourceCode, ClientData} from './types';

export const getTsSourceCodeForExecutable = (exec: ClientData, execPath?: ClientData[]): ExecutableSourceCode => {
    if (!exec.clientData) throw new Error('error generating client, missing clientData');

    const isRoute = exec.isRoute;
    const hasParams = exec.clientData.paramNames.length;
    const canReturn = exec.canReturnData;
    const camelCaseName = exec.clientData.camelCaseName;
    const fieldName = exec.fieldName;
    const handlerPointer = `` + exec.clientData.handlerLKeysPointer.map((key) => `['${key}']`).join('');
    const routesTypeName = getGenerateClientOptions().routesTypeName;
    const jsonFieldName = JSON.stringify(fieldName);

    const pointerName = `${routesTypeName}${handlerPointer}`;
    const remoteCallName = `${camelCaseName}RemoteCall`;
    const prefillName = `${camelCaseName}RemotePrefill`;
    const remoteParamsName = `${camelCaseName}RemoteParams`;
    const remoteReturnName = `${camelCaseName}RemoteReturn`;
    const requestName = `${camelCaseName}Request`;
    const responseName = `${camelCaseName}Response`;

    const remoteFunctionName = `${deCapitalize(camelCaseName)}RemoteCall`;
    const prefillFunctionName = getPrefillFunctionName(exec);

    const typeDefTemplateRemotePrefill = hasParams ? `type ${prefillName} = RemotePrefill<${pointerName}>\n` : '';
    const typeDefTemplateRemoteParams = hasParams ? `type ${remoteParamsName} = RemoteParams<${pointerName}>;\n` : '';
    const typeDefTemplateRemoteReturn = canReturn ? `type ${remoteReturnName} = RemoteReturn<${pointerName}>;\n` : '';
    const typeDefTemplateRemoteCall = isRoute
        ? `type ${remoteCallName} = RemoteHandler<${pointerName}, ${requestName}, ${responseName}>;\n`
        : '';

    deCapitalize;

    const typeDefTemplate =
        `// #### ${isRoute ? 'Route' : 'Hook'} ${camelCaseName} #### \n` +
        typeDefTemplateRemotePrefill +
        typeDefTemplateRemoteParams +
        typeDefTemplateRemoteReturn +
        typeDefTemplateRemoteCall;

    let requestTemplate = '';
    let responseTemplate = '';
    let remoteCallTemplate = '';
    if (isRoute) {
        if (!execPath) throw new Error('execPath must be defined when creating source code for a route');
        const reqRes = getFullRequestResponseTypes(exec, execPath);
        requestTemplate = reqRes.requestTemplate;
        responseTemplate = reqRes.responseTemplate;
        remoteCallTemplate = `const ${remoteFunctionName}: ${remoteCallName} = (...args) => MkClient.remote(${jsonFieldName}, ...args);`;
    }
    const prefillTemplate = hasParams
        ? `const ${prefillFunctionName}: ${prefillName} = (...args) => MkClient.prefillData(${jsonFieldName}, ...args);`
        : '';
    const sourceCode = typeDefTemplate + requestTemplate + responseTemplate + remoteCallTemplate + prefillTemplate + '\n';
    return {
        sourceCode,
        pointerName,
        remoteCallName,
        prefillName,
        remoteParamsName,
        remoteReturnName,
        requestName,
        responseName,
        remoteFunctionName,
        prefillFunctionName,
    };
};

const getFullRequestResponseTypes = (routeExec: ClientData, execPath: ClientData[]) => {
    if (!routeExec.clientData) throw new Error('error generating client, missing clientData');
    const camelCaseName = routeExec.clientData.camelCaseName;

    const requestFieldsDefinitions = execPath
        .filter((exec) => exec.clientData?.paramNames.length)
        .map((exec) => {
            const name = exec.isRoute ? JSON.stringify(exec.path) : JSON.stringify(exec.fieldName);
            return `${name}: ${exec.clientData.camelCaseName}RemoteParams`;
        })
        .join(';');
    const requestTemplate = `type ${camelCaseName}Request = {${requestFieldsDefinitions}};`;

    const responseFieldsDefinitions = execPath
        .filter((exec) => exec.canReturnData)
        .map((exec) => {
            const name = exec.isRoute ? JSON.stringify(exec.path) : JSON.stringify(exec.fieldName);
            return `${name}: ${exec.clientData.camelCaseName}RemoteReturn`;
        })
        .join(';');
    const responseTemplate = `type ${camelCaseName}Response = {${responseFieldsDefinitions}};`;

    return {requestTemplate, responseTemplate};
};

export const getRemoteExecutionPathSrcCode = (remoteExecutionPath: ClientData[], executablesObjectName: string) => {
    return '[' + remoteExecutionPath.map((exec) => `${executablesObjectName}.${exec.clientData.camelCaseName}`).join(',') + ']';
};

export const getPrefillFunctionName = (exec: ClientData) => {
    return `${deCapitalize(exec.clientData.camelCaseName)}Prefill`;
};

/**
 * Gets a json object representing and object with references to source code and returns the src code
 * Assumes any source code reference inside the json will be wrapped prefixed by 'ΔΔ#' and suffixed by '#ΔΔ',
 * i.e: we have a function in source code as follows:  const sum2 = (ctx, n:number) => n + 2;
 * and a json object that we want to reference routeA as follows: {"sum2": "ΔΔ#sum2#ΔΔ"}
 * This function will return : export api = {"sum2": sum2};
 *  */
export const getSourceCodeFromJson = (jsonObjectWithSrcCodeReferences: string, exportName: string, shouldReplace = true) => {
    const replaceSrcCodeReferences = shouldReplace
        ? jsonObjectWithSrcCodeReferences.replace(/"ΔΔ#([\w., [\]]*)#ΔΔ"/g, '$1')
        : jsonObjectWithSrcCodeReferences;
    return `

        // #### ${exportName} ####
        export const ${exportName} = ${replaceSrcCodeReferences};
    `;
};

const deCapitalize = (str: string) => `${str[0].toLowerCase()}${str.slice(1)}`;