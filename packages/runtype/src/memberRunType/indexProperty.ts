import {ReflectionKind, TypeIndexSignature} from '../_deepkit/src/reflection/type';
import {MemberRunType} from '../baseRunTypes';
import {JitFnID, MockContext} from '../types';
import {jitNames} from '../constants';
import type {
    jitIsTypeCompileOperation,
    JitJsonDecodeCompileOperation,
    JitJsonEncodeCompileOperation,
    JitJsonStringifyCompileOperation,
    JitTypeErrorCompileOperation,
} from '../jitCompiler';

/* ########
 * 2024 mion
 * Author: Ma-jerez
 * License: MIT
 * The software is provided "as is", without warranty of any kind.
 * ######## */

export class IndexSignatureRunType extends MemberRunType<TypeIndexSignature> {
    src: TypeIndexSignature = null as any; // will be set after construction
    isOptional(): boolean {
        return false;
    }
    getChildVarName(): string {
        return `prΦp${this.getNestLevel()}`;
    }
    getChildLiteral(): string {
        return this.getChildVarName();
    }
    useArrayAccessor(): true {
        return true;
    }
    jitFnHasReturn(copId: JitFnID): boolean {
        switch (copId) {
            case 'isType':
                return true;
            case 'jsonStringify':
                return true;
            default:
                return super.jitFnHasReturn(copId);
        }
    }
    // #### jit code ####
    _compileIsType(cop: jitIsTypeCompileOperation): string {
        const child = this.getJitChild();
        if (!child) return 'true';
        const varName = cop.vλl;
        const prop = this.getChildVarName();
        return `
            for (const ${prop} in ${varName}) {
                if (!(${child.compileIsType(cop)})) return false;
            }
            return true;
        `;
    }
    _compileTypeErrors(cop: JitTypeErrorCompileOperation): string {
        const child = this.getJitChild();
        if (!child) return '';
        const varName = cop.vλl;
        const prop = this.getChildVarName();
        return `
            for (const ${prop} in ${varName}) {
                ${child.compileTypeErrors(cop)}
            }
        `;
    }
    _compileJsonEncode(cop: JitJsonEncodeCompileOperation): string {
        const child = this.getJsonEncodeChild();
        if (!child) return '';
        const varName = cop.vλl;
        const prop = this.getChildVarName();
        return `
            for (const ${prop} in ${varName}) {
                ${child.compileJsonEncode(cop)}
            }
        `;
    }
    _compileJsonDecode(cop: JitJsonDecodeCompileOperation): string {
        const child = this.getJsonDecodeChild();
        if (!child) return '';
        const varName = cop.vλl;
        const prop = this.getChildVarName();
        return `
            for (const ${prop} in ${varName}) {
                ${child.compileJsonDecode(cop)}
            }
        `;
    }

    _compileJsonStringify(cop: JitJsonStringifyCompileOperation): string {
        const child = this.getJitChild();
        if (!child) return `''`;
        const varName = cop.vλl;
        const prop = this.getChildVarName();
        const arrName = `prΦpsλrr${cop.length}`;
        const jsonVal = child.compileJsonStringify(cop);
        return `
            const ${arrName} = [];
            for (const ${prop} in ${varName}) {
                if (${prop} !== undefined) ${arrName}.push(${jitNames.utils}.asJSONString(${prop}) + ':' + ${jsonVal});
            }
            return ${arrName}.join(',');
        `;
    }
    mock(ctx?: Pick<MockContext, 'parentObj'>): any {
        const length = Math.floor(Math.random() * 10);
        const parentObj = ctx?.parentObj || {};
        for (let i = 0; i < length; i++) {
            let propName: number | string | symbol;
            switch (true) {
                case !!(this.src.index.kind === ReflectionKind.number):
                    propName = i;
                    break;
                case !!(this.src.index.kind === ReflectionKind.string):
                    propName = `key${i}`;
                    break;
                case !!(this.src.index.kind === ReflectionKind.symbol):
                    propName = Symbol.for(`key${i}`);
                    break;
                default:
                    throw new Error('Invalid index signature type');
            }
            parentObj[propName] = this.getMemberType().mock(ctx);
        }
    }
}
