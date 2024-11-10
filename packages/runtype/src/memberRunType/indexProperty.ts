import {ReflectionKind, TypeIndexSignature} from '../_deepkit/src/reflection/type';
import {BaseRunType, MemberRunType} from '../baseRunTypes';
import {JitConstants, JitFnID, MockContext, Mutable} from '../types';
import {JitFnIDs} from '../constants';
import type {JitCompiler, JitErrorsCompiler} from '../jitCompiler';
import {InterfaceRunType} from '../collectionRunType/interface';
import {isLastStringifyChildren} from '../utils';

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
        return `p${this.getNestLevel()}`;
    }
    getChildLiteral(): string {
        return this.getChildVarName();
    }
    useArrayAccessor(): true {
        return true;
    }
    getJitConstants(stack: BaseRunType[] = []): JitConstants {
        const jc = super.getJitConstants(stack) as Mutable<JitConstants>;
        const index = (this.src as TypeIndexSignature).index?.kind || undefined;
        if (index === ReflectionKind.symbol) {
            jc.skipJit = true;
            jc.skipJsonEncode = true;
            jc.skipJsonDecode = true;
        }
        return jc;
    }
    jitFnHasReturn(fnId: JitFnID): boolean {
        switch (fnId) {
            case JitFnIDs.isType:
                return true;
            case JitFnIDs.jsonStringify:
                return true;
            case JitFnIDs.hasUnknownKeys:
                return true;
            default:
                return super.jitFnHasReturn(fnId);
        }
    }
    // #### jit code ####
    _compileIsType(cop: JitCompiler): string {
        const child = this.getJitChild();
        if (!child) return 'true';
        const varName = cop.vλl;
        const prop = this.getChildVarName();
        return `for (const ${prop} in ${varName}){if (!(${child.compileIsType(cop)})) return false;}return true;`;
    }
    _compileTypeErrors(cop: JitErrorsCompiler): string {
        const child = this.getJitChild();
        if (!child) return '';
        const varName = cop.vλl;
        const prop = this.getChildVarName();
        return `for (const ${prop} in ${varName}) {${child.compileTypeErrors(cop)}}`;
    }

    private getSkipCode(prop: string): string {
        const namedChildren = (this.getParent() as InterfaceRunType).getNamedChildren();
        const skipNames = namedChildren.length
            ? namedChildren.map((child) => `${child.getChildLiteral()} === ${prop}`).join(' || ')
            : '';
        return namedChildren.length ? `if (${skipNames}) continue;` : '';
    }

    _compileJsonEncode(cop: JitCompiler): string {
        const child = this.getJsonEncodeChild();
        if (!child) return '';
        const varName = cop.vλl;
        const prop = this.getChildVarName();
        const skipCode = this.getSkipCode(prop);
        const childCode = child.compileJsonEncode(cop);
        const isExpression = this.childIsExpression(cop, JitFnIDs.jsonEncode, child);
        const code = isExpression ? `${cop.getChildVλl()} = ${childCode};` : childCode;
        return `for (const ${prop} in ${varName}){${skipCode} ${code}}`;
    }
    _compileJsonDecode(cop: JitCompiler): string {
        const child = this.getJsonDecodeChild();
        if (!child) return '';
        const varName = cop.vλl;
        const prop = this.getChildVarName();
        const skipCode = this.getSkipCode(prop);
        const childCode = child.compileJsonDecode(cop);
        const isExpression = this.childIsExpression(cop, JitFnIDs.jsonDecode, child);
        const code = isExpression ? `${cop.getChildVλl()} = ${childCode};` : childCode;
        return `for (const ${prop} in ${varName}){${skipCode} ${code}}`;
    }

    _compileJsonStringify(cop: JitCompiler): string {
        const child = this.getJitChild();
        if (!child) return `''`;
        const varName = cop.vλl;
        const prop = this.getChildVarName();
        const arrName = `ls${this.getNestLevel()}`;
        const jsonVal = child.compileJsonStringify(cop);
        const isLast = isLastStringifyChildren(this);
        const sep = isLast ? '' : '+","';
        const skipCode = this.getSkipCode(prop);
        return `
            const ${arrName} = [];
            for (const ${prop} in ${varName}) {
                ${skipCode}
                if (${prop} !== undefined) ${arrName}.push(µTils.asJSONString(${prop}) + ':' + ${jsonVal});
            }
            return ${arrName}.join(',')${sep};
        `;
    }

    _compileHasUnknownKeys(cop: JitCompiler): string {
        if (this.getMemberType().getFamily() === 'A') return '';
        const memberCode = this.getMemberType().compileHasUnknownKeys(cop);
        if (!memberCode) return '';
        const varName = cop.vλl;
        const prop = this.getChildVarName();
        const resultVal = `res${this.getNestLevel()}`;
        return `for (const ${prop} in ${varName}) {const ${resultVal} = ${memberCode};if (${resultVal}) return true;}return false;`;
    }
    _compileUnknownKeyErrors(cop: JitErrorsCompiler): string {
        if (this.getMemberType().getFamily() === 'A') return '';
        const memberCode = this.getMemberType().compileUnknownKeyErrors(cop);
        return this.traverseCode(cop, memberCode);
    }
    _compileStripUnknownKeys(cop: JitCompiler): string {
        if (this.getMemberType().getFamily() === 'A') return '';
        const memberCode = this.getMemberType().compileStripUnknownKeys(cop);
        return this.traverseCode(cop, memberCode);
    }
    _compileUnknownKeysToUndefined(cop: JitCompiler): string {
        if (this.getMemberType().getFamily() === 'A') return '';
        const memberCode = this.getMemberType().compileUnknownKeysToUndefined(cop);
        return this.traverseCode(cop, memberCode);
    }
    traverseCode(cop: JitCompiler, memberCode: string): string {
        if (!memberCode) return '';
        const prop = this.getChildVarName();
        return `for (const ${prop} in ${cop.vλl}) {${memberCode}}`;
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
