/* ########
 * 2024 mion
 * Author: Ma-jerez
 * License: MIT
 * The software is provided "as is", without warranty of any kind.
 * ######## */

import {TypeRegexp} from '@deepkit/type';
import {RunType, RunTypeVisitor, JitJsonEncoder} from '../types';
import {toLiteral} from '../utils';

export class RegexpRunType implements RunType<TypeRegexp> {
    public readonly name = 'regexp';
    public readonly shouldEncodeJson = true;
    public readonly shouldDecodeJson = true;
    constructor(
        public readonly src: TypeRegexp,
        public readonly visitor: RunTypeVisitor,
        public readonly nestLevel: number
    ) {}
    isTypeJIT(varName: string): string {
        return `(${varName} instanceof RegExp)`;
    }
    typeErrorsJIT(varName: string, errorsName: string, pathChain: string): string {
        return `if (!(${varName} instanceof RegExp)) ${errorsName}.push({path: ${pathChain}, expected: ${toLiteral(this.name)}})`;
    }
    jsonEncodeJIT(varName: string): string {
        return RegexpJitJsonEncoder.encodeToJson(varName);
    }
    jsonDecodeJIT(varName: string): string {
        return RegexpJitJsonEncoder.decodeFromJson(varName);
    }
    mockJIT(varName: string): string {
        const regExpList = `regExpList${this.nestLevel}`;
        return (
            `const ${regExpList} = [/example/, /abc/, /^a-zA-Z0-9/, /abc/i, /hello[0-9]/];` +
            `${varName} = ${regExpList}[Math.floor(Math.random() * ${regExpList}.length)]`
        );
    }
}

export const matchRegExp = /\/(.*)\/(.*)?/;
export const matchRegExpString = '/\\/(.*)\\/(.*)?/';

export const RegexpJitJsonEncoder: JitJsonEncoder = {
    decodeFromJson(varName: string): string {
        return `(function(){const parts = ${varName}.match(${matchRegExpString}) ;return new RegExp(parts[1], parts[2] || '')})()`;
    },
    encodeToJson(varName: string): string {
        return `(${varName}.toString())`;
    },
};