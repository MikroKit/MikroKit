/* ########
 * 2024 mion
 * Author: Ma-jerez
 * License: MIT
 * The software is provided "as is", without warranty of any kind.
 * ######## */

import {TypeVoid} from '@deepkit/type';
import {RunType, RunTypeVisitor} from '../types';

export class VoidRunType implements RunType<TypeVoid> {
    public readonly name = 'void';
    public readonly shouldEncodeJson = false;
    public readonly shouldDecodeJson = false;
    constructor(
        public readonly src: TypeVoid,
        public readonly visitor: RunTypeVisitor,
        public readonly nestLevel: number
    ) {}
    getValidateCode(varName: string): string {
        return `${varName} === undefined`;
    }
    getValidateCodeWithErrors(varName: string, errorsName: string, itemPath: string): string {
        return `if (${varName} !== undefined) ${errorsName}.push({path: ${itemPath}, message: 'Expected to be void'})`;
    }
    getJsonEncodeCode(): string {
        throw new Error('void can not be encoded to json.');
    }
    getJsonDecodeCode(): string {
        throw new Error('void can not be decoded from json.');
    }
    getMockCode(): string {
        return `void 0`;
    }
}
