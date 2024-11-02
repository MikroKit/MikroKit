/* ########
 * 2024 mion
 * Author: Ma-jerez
 * License: MIT
 * The software is provided "as is", without warranty of any kind.
 * ######## */

import {ReflectionKind, TypeEnum} from '../_deepkit/src/reflection/type';
import type {MockContext, JitConstants} from '../types';
import {getJitErrorPath, getExpected, toLiteral} from '../utils';
import {random} from '../mock';
import {AtomicRunType} from '../baseRunTypes';
import type {JitCompiler, JitTypeErrorCompiler} from '../jitCompiler';

const jitConstants: JitConstants = {
    skipJit: false,
    skipJsonEncode: true,
    skipJsonDecode: true,
    jitId: ReflectionKind.enum,
};

export class EnumRunType extends AtomicRunType<TypeEnum> {
    src: TypeEnum = null as any; // will be set after construction
    getJitConstants = () => jitConstants;
    _compileIsType(cop: JitCompiler): string {
        return this.src.values.map((v) => `${cop.vλl} === ${toLiteral(v)}`).join(' || ');
    }
    _compileTypeErrors(cop: JitTypeErrorCompiler): string {
        return `if (!(${this._compileIsType(cop)})) ${cop.args.εrr}.push({path:${getJitErrorPath(cop)},expected:${getExpected(this)}})`;
    }
    _compileJsonEncode(cop: JitCompiler): string {
        return cop.vλl;
    }
    _compileJsonDecode(cop: JitCompiler): string {
        return cop.vλl;
    }
    _compileJsonStringify(cop: JitCompiler): string {
        if (this.src.indexType.kind === ReflectionKind.number) return cop.vλl;
        return `JSON.stringify(${cop.vλl})`;
    }
    mock(cop?: Pick<MockContext, 'enumIndex'>): string | number | undefined | null {
        const i = cop?.enumIndex || random(0, this.src.values.length - 1);
        return this.src.values[i];
    }
}
