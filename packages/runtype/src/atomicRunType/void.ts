/* ########
 * 2024 mion
 * Author: Ma-jerez
 * License: MIT
 * The software is provided "as is", without warranty of any kind.
 * ######## */

import {ReflectionKind, type TypeVoid} from '../_deepkit/src/reflection/type';
import type {JitConstants} from '../types';
import {AtomicRunType} from '../baseRunTypes';
import {getJitErrorPath, getExpected} from '../utils';
import type {
    jitIsTypeCompileOperation,
    JitJsonDecodeCompileOperation,
    JitJsonEncodeCompileOperation,
    JitTypeErrorCompileOperation,
} from '../jitCompiler';

const jitConstants: JitConstants = {
    skipJit: false,
    skipJsonEncode: false,
    skipJsonDecode: false,
    jitId: ReflectionKind.void,
};

export class VoidRunType extends AtomicRunType<TypeVoid> {
    src: TypeVoid = null as any; // will be set after construction
    getJitConstants = () => jitConstants;
    _compileIsType(cop: jitIsTypeCompileOperation): string {
        return `${cop.vλl} === undefined`;
    }
    _compileTypeErrors(cop: JitTypeErrorCompileOperation): string {
        return `if (${cop.vλl} !== undefined) ${cop.args.εrr}.push({path:${getJitErrorPath(cop)},expected:${getExpected(this)}})`;
    }
    _compileJsonEncode(cop: JitJsonEncodeCompileOperation): string {
        return `${cop.vλl} = undefined`;
    }
    _compileJsonDecode(cop: JitJsonDecodeCompileOperation): string {
        return `${cop.vλl} = undefined`;
    }
    _compileJsonStringify(): string {
        return 'undefined';
    }
    mock(): void {}
}
