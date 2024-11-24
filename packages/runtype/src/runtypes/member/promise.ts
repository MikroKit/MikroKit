/* ########
 * 2024 mion
 * Author: Ma-jerez
 * License: MIT
 * The software is provided "as is", without warranty of any kind.
 * ######## */
import {ReflectionKind, type TypePromise} from '../../lib/_deepkit/src/reflection/type';
import type {MockOperation, JitConstants} from '../../types';
import {MemberRunType} from '../../lib/baseRunTypes';

const jitConstants: JitConstants = {
    skipJit: true,
    skipJsonEncode: true,
    skipJsonDecode: true,
    jitId: ReflectionKind.promise,
};

export class PromiseRunType extends MemberRunType<TypePromise> {
    src: TypePromise = null as any; // will be set after construction
    getJitConstants = () => jitConstants;
    isOptional(): boolean {
        throw new Error(`Jit compilation disabled for Promises.`);
    }
    getChildVarName(): string | number {
        throw new Error(`Jit compilation disabled for Promises.`);
    }
    getChildLiteral(): string | number {
        throw new Error(`Jit compilation disabled for Promises.`);
    }
    useArrayAccessor(): boolean {
        throw new Error(`Jit compilation disabled for Promises.`);
    }
    _compileIsType(): string {
        throw new Error(`Jit compilation disabled for Promises.`);
    }
    _compileTypeErrors(): string {
        throw new Error(`Jit compilation disabled for Promises.`);
    }
    _compileJsonEncode(): string {
        throw new Error(`Jit compilation disabled for Promises.`);
    }
    _compileJsonDecode(): string {
        throw new Error(`Jit compilation disabled for Promises.`);
    }
    _compileJsonStringify(): string {
        throw new Error(`Jit compilation disabled for Promises..`);
    }
    _mock(ctx: Pick<MockOperation, 'promiseReject' | 'promiseTimeOut'>): Promise<any> {
        const timeOut = ctx.promiseTimeOut || 1;
        return new Promise((resolve, reject) => {
            if (timeOut > 0) {
                setTimeout(() => {
                    if (ctx.promiseReject) reject(ctx.promiseReject);
                    else resolve(this.getMemberType().mock(ctx));
                }, timeOut);
                return;
            }
            if (ctx.promiseReject) reject(ctx.promiseReject);
            else resolve(this.getMemberType().mock(ctx));
        });
    }
}
