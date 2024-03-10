/* ########
 * 2024 mion
 * Author: Ma-jerez
 * License: MIT
 * The software is provided "as is", without warranty of any kind.
 * ######## */

import {TypeLiteral} from '../_deepkit/src/reflection/type';
import {JitJsonEncoder, RunType, RunTypeOptions, RunTypeVisitor} from '../types';
import {SymbolJitJsonENcoder} from './symbol';
import {BigIntJitJsonENcoder} from './bigInt';
import {RegexpJitJsonEncoder} from './regexp';
import {toLiteral} from '../utils';

export class LiteralRunType implements RunType<TypeLiteral> {
    public readonly name: string;
    public readonly isJsonEncodeRequired: boolean;
    public readonly isJsonDecodeRequired: boolean;
    public readonly jitJsonEncoder: JitJsonEncoder;
    constructor(
        visitor: RunTypeVisitor,
        public readonly src: TypeLiteral,
        public readonly nestLevel: number,
        public readonly opts: RunTypeOptions
    ) {
        switch (true) {
            case typeof src.literal === 'bigint':
                this.jitJsonEncoder = BigIntJitJsonENcoder;
                this.isJsonEncodeRequired = true;
                this.isJsonDecodeRequired = true;
                break;
            case typeof src.literal === 'symbol':
                this.jitJsonEncoder = SymbolJitJsonENcoder;
                this.isJsonEncodeRequired = true;
                this.isJsonDecodeRequired = true;
                break;
            case typeof src.literal === 'string':
                this.jitJsonEncoder = noEncoder;
                this.isJsonEncodeRequired = false;
                this.isJsonDecodeRequired = false;
                break;
            case src.literal instanceof RegExp:
                this.jitJsonEncoder = RegexpJitJsonEncoder;
                this.isJsonEncodeRequired = true;
                this.isJsonDecodeRequired = true;
                break;
            default:
                this.jitJsonEncoder = noEncoder;
                this.isJsonEncodeRequired = false;
                this.isJsonDecodeRequired = false;
        }
        this.name = `literal<${toLiteral(src.literal)}>`;
    }
    isTypeJIT(varName: string): string {
        if (typeof this.src.literal === 'symbol') return validateSymbol(varName, this.src.literal);
        else if (this.src.literal instanceof RegExp) return validateRegExp(varName, this.src.literal);
        else if (typeof this.src.literal === 'bigint') return validateBigInt(varName, this.src.literal);
        else return validateLiteral(varName, this.src.literal);
    }
    typeErrorsJIT(varName: string, errorsName: string, pathChain: string): string {
        if (typeof this.src.literal === 'symbol')
            return validateSymbolWithErrors(varName, errorsName, pathChain, this.src.literal, this.name);
        else if (this.src.literal instanceof RegExp)
            return validateRegExpWithErrors(varName, errorsName, pathChain, this.src.literal, this.name);
        return validateLiteralWithErrors(varName, errorsName, pathChain, this.src.literal, this.name);
    }
    jsonEncodeJIT(varName: string): string {
        return this.jitJsonEncoder.encodeToJson(varName);
    }
    jsonStringifyJIT(varName: string): string {
        return this.jitJsonEncoder.stringify(varName);
    }
    jsonDecodeJIT(varName: string): string {
        return this.jitJsonEncoder.decodeFromJson(varName);
    }
    mock(): symbol | string | number | boolean | bigint | RegExp {
        return this.src.literal;
    }
}

const noEncoder: JitJsonEncoder = {
    decodeFromJson(varName: string) {
        return `${varName}`;
    },
    encodeToJson(varName: string) {
        return `${varName}`;
    },
    stringify(varName: string) {
        return `JSON.stringify(${varName})`;
    },
};

function validateBigInt(varName: string, lit: bigint): string {
    return `${varName} === ${toLiteral(lit)}`;
}

function validateSymbol(varName: string, sbl: symbol): string {
    return `typeof ${varName} === 'symbol' && ${varName}.description === ${toLiteral(sbl.description)}`;
}

function validateRegExp(varName: string, regexp: RegExp): string {
    return `String(${varName}) === String(${regexp})`;
}

function validateLiteral(varName: string, literal: Exclude<TypeLiteral['literal'], symbol>): string {
    return `${varName} === ${toLiteral(literal)}`;
}

function validateSymbolWithErrors(varName: string, errorsName: string, pathChain: string, sbl: symbol, name: string): string {
    return `if (typeof ${varName} !== 'symbol' || ${varName}.description !== ${toLiteral(sbl.description)}) {
        ${errorsName}.push({path: ${pathChain}, expected: ${toLiteral(name)}})
    }`;
}

function validateRegExpWithErrors(varName: string, errorsName: string, pathChain: string, regexp: RegExp, name: string): string {
    return `if (String(${varName}) !== String(${regexp})) ${errorsName}.push({path: ${pathChain}, expected: ${toLiteral(name)}})`;
}

function validateLiteralWithErrors(
    varName: string,
    errorsName: string,
    pathChain: string,
    literal: Exclude<TypeLiteral['literal'], symbol>,
    name: string
): string {
    return `if (${varName} !== ${toLiteral(literal)}) ${errorsName}.push({path: ${pathChain}, expected: ${toLiteral(name)}})`;
}
