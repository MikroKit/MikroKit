/* ########
 * 2024 mion
 * Author: Ma-jerez
 * License: MIT
 * The software is provided "as is", without warranty of any kind.
 * ######## */

import {TypeNumber} from '../_deepkit/src/reflection/type';
import {toLiteral, pathChainToLiteral} from '../utils';
import {mockNumber} from '../mock';
import {SingleRunType} from '../baseRunTypes';
import {JitErrorPath} from '../types';

export class NumberRunType extends SingleRunType<TypeNumber> {
    public readonly isJsonEncodeRequired = false;
    public readonly isJsonDecodeRequired = false;

    compileIsType(varName: string): string {
        return `typeof ${varName} === 'number' && Number.isFinite(${varName})`;
    }
    compileTypeErrors(varName: string, errorsName: string, pathChain: JitErrorPath): string {
        return `if(!(${this.compileIsType(varName)})) ${errorsName}.push({path: ${pathChainToLiteral(pathChain)}, expected: ${toLiteral(this.getName())}})`;
    }
    compileJsonEncode(): string {
        return '';
    }
    compileJsonDecode(): string {
        return '';
    }
    compileJsonStringify(varName: string): string {
        return varName;
    }
    mock(min?: number, max?: number): number {
        return mockNumber(min, max);
    }
}
