/* ########
 * 2024 mion
 * Author: Ma-jerez
 * License: MIT
 * The software is provided "as is", without warranty of any kind.
 * ######## */

import {TypeClass} from '@deepkit/type';
import {JitJsonEncoder, RunType, RunTypeVisitor} from '../types';

export class DateRunType implements RunType<TypeClass> {
    public readonly name = 'Date';
    public readonly shouldEncodeJson = false;
    public readonly shouldDecodeJson = true;
    constructor(
        public readonly src: TypeClass,
        public readonly visitor: RunTypeVisitor,
        public readonly nestLevel: number
    ) {}
    getValidateCode(varName: string): string {
        return `${varName} instanceof Date && !isNaN(${varName}.getTime())`;
    }
    getValidateCodeWithErrors(varName: string, errorsName: string, itemPath: string): string {
        return `if (!(${this.getValidateCode(varName)})) ${errorsName}.push({path: ${itemPath}, message: 'Expected to be a valid Date'})`;
    }
    getJsonEncodeCode(varName: string): string {
        return DateJitJsonENcoder.encodeToJson(varName);
    }
    getJsonDecodeCode(varName: string): string {
        return DateJitJsonENcoder.decodeFromJson(varName);
    }
    getMockCode(varName: string): string {
        return `${varName} = new Date(+(new Date()) - Math.floor(Math.random() * 10000000000))`;
    }
}

export const DateJitJsonENcoder: JitJsonEncoder = {
    decodeFromJson(varName: string): string {
        return `new Date(${varName})`;
    },
    encodeToJson(varName: string): string {
        return `${varName}`;
    },
};
