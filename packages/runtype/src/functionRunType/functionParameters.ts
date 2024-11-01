import {getJitErrorPath, memo, toLiteral} from '../utils';
import {ParameterRunType} from '../memberRunType/param';
import type {
    jitIsTypeCompileOperation,
    JitJsonDecodeCompileOperation,
    JitJsonEncodeCompileOperation,
    JitJsonStringifyCompileOperation,
    JitTypeErrorCompileOperation,
} from '../jitCompiler';
import {AnyFunction, DKwithRT, MockContext, RunType} from '../types';
import {TypeFunction} from '../_deepkit/src/reflection/type';
import {CollectionRunType} from '../baseRunTypes';

export class FunctionParametersRunType<CallType extends AnyFunction = TypeFunction> extends CollectionRunType<CallType> {
    src: CallType = null as any; // will be set after construction
    getName = (): string => 'fnParams';
    getChildRunTypes = (): RunType[] => {
        const childTypes = (this.src.parameters as DKwithRT[]) || []; // deepkit stores child types in the types property
        return childTypes.map((t) => t._rt);
    };
    getParameterTypes(): ParameterRunType[] {
        return this.getChildRunTypes() as ParameterRunType[];
    }
    getTotalParams(): number {
        return this.getParameterTypes().length;
    }
    hasOptionalParameters(): boolean {
        return this.getParameterTypes().some((p) => p.isOptional());
    }
    hasRestParameter(): boolean {
        return !!this.getParameterTypes().length && this.getParameterTypes()[this.getParameterTypes().length - 1].isRest();
    }
    paramsLiteral(): string {
        return toLiteral(
            `[${this.getParameterTypes()
                .map((p) => p.getName())
                .join(', ')}]`
        );
    }
    getTotalRequiredParams = memo((): number => {
        return this.getParameterTypes().filter((p) => !p.isOptional()).length;
    });
    // ####### params #######

    _compileIsType(cop: jitIsTypeCompileOperation) {
        if (this.getParameterTypes().length === 0) return `${cop.vλl}.length === 0`;
        const paramsCode = this.getParameterTypes()
            .map((p) => `(${p.compileIsType(cop)})`)
            .join(' && ');
        const maxLength = !this.hasRestParameter ? `&& ${cop.vλl}.length <= ${this.getParameterTypes().length}` : '';
        const checkLength = `${cop.vλl}.length >= ${this.getTotalRequiredParams()} ${maxLength}`;
        return `${checkLength} && ${paramsCode}`;
    }
    _compileTypeErrors(cop: JitTypeErrorCompileOperation) {
        const maxLength = !this.hasRestParameter ? `|| ${cop.vλl}.length > ${this.getParameterTypes().length}` : '';
        const checkLength = `(${cop.vλl}.length < ${this.getTotalRequiredParams()} ${maxLength})`;
        const paramsCode = this.getParameterTypes()
            .map((p) => p.compileTypeErrors(cop))
            .join(';');
        return (
            `if (!Array.isArray(${cop.vλl}) || ${checkLength}) ${cop.args.εrr}.push({path:${getJitErrorPath(cop)},expected:${this.paramsLiteral()}});` +
            `else {${paramsCode}}`
        );
    }
    _compileJsonEncode(cop: JitJsonEncodeCompileOperation) {
        return this.compileParamsJsonDE(cop, true);
    }
    _compileJsonDecode(cop: JitJsonDecodeCompileOperation) {
        return this.compileParamsJsonDE(cop, false);
    }
    _compileJsonStringify(cop: JitJsonStringifyCompileOperation) {
        const skip = this.getJitConstants().skipJit;
        if (skip) return '';
        if (this.getParameterTypes().length === 0) return `[]`;

        const paramsCode = this.getParameterTypes()
            .map((p) => p.compileJsonStringify(cop))
            .join('+');
        return `'['+${paramsCode}+']'`;
    }

    private compileParamsJsonDE(cop: JitDefaultOp, isEncode: boolean) {
        const skip = isEncode ? this.getJitConstants().skipJsonEncode : this.getJitConstants().skipJsonDecode;
        if (skip) return '';
        return this.getParameterTypes()
            .filter((p) => (isEncode ? p.compileJsonEncode : p.compileJsonDecode))
            .map((p) => (isEncode ? p.compileJsonEncode(cop) : p.compileJsonDecode(cop)))
            .join(';');
    }

    mock(ctx?: MockContext) {
        return this.getParameterTypes().map((p) => p.mock(ctx));
    }
}
