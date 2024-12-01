import type {TypeRest} from '../../lib/_deepkit/src/reflection/type';
import type {JitCompiler, JitErrorsCompiler} from '../../lib/jitCompiler';
import {MemberRunType} from '../../lib/baseRunTypes';
import {JitFnIDs} from '../../constants';
import {JitFnID, MockOperation} from '../../types';
import {childIsExpression} from '../../lib/utils';
import {ParameterRunType} from './param';
import {TupleMemberRunType} from './tupleMember';

/* ########
 * 2024 mion
 * Author: Ma-jerez
 * License: MIT
 * The software is provided "as is", without warranty of any kind.
 * ######## */

export class RestParamsRunType extends MemberRunType<TypeRest> {
    isOptional() {
        return true;
    }
    getChildVarName(): string {
        return `e${this.getNestLevel()}`;
    }
    getChildLiteral(): string {
        return this.getChildVarName();
    }
    getChildIndex(): number {
        const parent = this.getParent() as ParameterRunType | TupleMemberRunType;
        return parent.getChildIndex();
    }
    useArrayAccessor(): true {
        return true;
    }
    jitFnHasReturn(fnId: JitFnID): boolean {
        switch (fnId) {
            case JitFnIDs.isType:
            case JitFnIDs.jsonStringify:
                return true;
            default:
                return super.jitFnHasReturn(fnId);
        }
    }
    _compileIsType(comp: JitCompiler): string {
        const index = this.getChildVarName();
        const itemCode = this.getMemberType().compileIsType(comp);
        return `
            for (let ${index} = ${this.getChildIndex()}; ${index} < ${comp.vλl}.length; ${index}++) {
                if (!(${itemCode})) return false;
            }
            return true;
        `;
    }
    _compileTypeErrors(comp: JitErrorsCompiler): string {
        const index = this.getChildVarName();
        const itemCode = this.getMemberType().compileTypeErrors(comp);
        return `for (let ${index} = ${this.getChildIndex()}; ${index} < ${comp.vλl}.length; ${index}++) {${itemCode}}`;
    }
    _compileJsonEncode(comp: JitCompiler): string {
        const index = this.getChildVarName();
        const child = this.getJsonEncodeChild();
        if (!child) return '';
        const childCode = child.compileJsonEncode(comp);
        const isExpression = childIsExpression(JitFnIDs.jsonEncode, child);
        const code = isExpression ? `${comp.getChildVλl()} = ${childCode};` : childCode;
        return `for (let ${index} = ${this.getChildIndex()}; ${index} < ${comp.vλl}.length; ${index}++) {${code}}`;
    }
    _compileJsonDecode(comp: JitCompiler): string {
        const index = this.getChildVarName();
        const child = this.getJsonDecodeChild();
        if (!child) return '';
        const childCode = child.compileJsonDecode(comp);
        const isExpression = childIsExpression(JitFnIDs.jsonDecode, child);
        const code = isExpression ? `${comp.getChildVλl()} = ${childCode};` : childCode;
        return `for (let ${index} = ${this.getChildIndex()}; ${index} < ${comp.vλl}.length; ${index}++) {${code}}`;
    }
    _compileJsonStringify(comp: JitCompiler): string {
        const arrName = `res${this.getNestLevel()}`;
        const itemName = `its${this.getNestLevel()}`;
        const index = this.getChildVarName();
        const isFist = this.getChildIndex() === 0;
        const sep = isFist ? '' : `','+`;
        const itemCode = this.getMemberType().compileJsonStringify(comp);
        return `
            const ${arrName} = [];
            for (let ${index} = ${this.getChildIndex()}; ${index} < ${comp.vλl}.length; ${index}++) {
                const ${itemName} = ${itemCode};
                if(${itemName}) ${arrName}.push(${itemName});
            }
            if (!${arrName}.length) {return '';}
            else {return ${sep}${arrName}.join(',')}
        `;
    }
    _compileHasUnknownKeys(): string {
        return '';
    }
    _compileUnknownKeyErrors(): string {
        return '';
    }
    _compileStripUnknownKeys(): string {
        return '';
    }
    _compileUnknownKeysToUndefined(): string {
        return '';
    }
    _mock(ctx: MockOperation): string {
        return this.getMemberType().mock(ctx);
    }
}