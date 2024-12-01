/* ########
 * 2024 mion
 * Author: Ma-jerez
 * License: MIT
 * The software is provided "as is", without warranty of any kind.
 * ######## */

import {ReflectionKind, type TypeSymbol} from '../../lib/_deepkit/src/reflection/type';
import type {JitJsonEncoder, MockOperation, JitConstants} from '../../types';

import {mockSymbol} from '../../lib/mock';
import {AtomicRunType} from '../../lib/baseRunTypes';
import type {JitCompiler, JitErrorsCompiler} from '../../lib/jitCompiler';

const jitConstants: JitConstants = {
    skipJit: true,
    skipJsonEncode: true,
    skipJsonDecode: true,
    jitId: ReflectionKind.symbol,
};

export class SymbolRunType extends AtomicRunType<TypeSymbol> {
    getJitConstants = () => jitConstants;
    _compileIsType(comp: JitCompiler): string {
        return `typeof ${comp.vλl} === 'symbol'`;
    }
    _compileTypeErrors(comp: JitErrorsCompiler): string {
        return `if (typeof ${comp.vλl} !== 'symbol') ${comp.callJitErr(this)}`;
    }
    _compileJsonEncode(comp: JitCompiler): string {
        return SymbolJitJsonEncoder.encodeToJson(comp.vλl);
    }
    _compileJsonDecode(comp: JitCompiler): string {
        return SymbolJitJsonEncoder.decodeFromJson(comp.vλl);
    }
    _compileJsonStringify(comp: JitCompiler): string {
        return SymbolJitJsonEncoder.stringify(comp.vλl);
    }
    _mock(ctx: MockOperation): symbol {
        return mockSymbol(ctx.symbolName, ctx.symbolLength, ctx.symbolCharSet);
    }
}

export const SymbolJitJsonEncoder: JitJsonEncoder = {
    decodeFromJson(vλl: string): string {
        return `Symbol(${vλl}.substring(7))`;
    },
    encodeToJson(vλl: string): string {
        return `'Symbol:' + (${vλl}.description || '')`;
    },
    stringify(vλl: string): string {
        return `JSON.stringify('Symbol:' + (${vλl}.description || ''))`;
    },
};