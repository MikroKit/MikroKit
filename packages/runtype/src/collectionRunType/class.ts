/* ########
 * 2024 mion
 * Author: Ma-jerez
 * License: MIT
 * The software is provided "as is", without warranty of any kind.
 * ######## */
import {TypeClass} from '../_deepkit/src/reflection/type';
import {MockContext} from '../types';
import {toLiteral} from '../utils';
import {InterfaceRunType, InterfaceMember} from './interface';
import {isConstructor} from '../guards';
import type {JitCompiler} from '../jitCompiler';

export class ClassRunType extends InterfaceRunType<TypeClass> {
    getClassName(): string {
        return this.src.classType.name;
    }
    canDeserialize(): boolean {
        const children = this.getChildRunTypes() as InterfaceMember[];
        return children.every((prop) => !isConstructor(prop) || prop.getParameters().getTotalParams() === 0);
    }
    _compileJsonDecode(cop: JitCompiler): string {
        checkSerializable(this.canDeserialize(), this.getClassName());
        const decodeParams = super.compileJsonDecode(cop);
        const decode = decodeParams ? `${decodeParams}; ` : '';
        const classVarname = `clλss${this.getNestLevel()}`;
        // todo create a new class
        return `
            ${decode};
            const ${classVarname} = µTils.getSerializableClass(${toLiteral(this.getClassName())});
            ${cop.vλl} = Object.assign(new ${classVarname}, ${cop.vλl});
        `;
    }
    mock(cop?: MockContext): Record<string | number, any> {
        checkSerializable(this.canDeserialize(), this.getClassName());
        const nextOp: MockContext = {...cop, parentObj: new this.src.classType()};
        return super.mock(nextOp);
    }
}

function checkSerializable(canDeserialize: boolean, className: string) {
    if (!canDeserialize)
        throw new Error(`Class ${className} can't be deserialized. Only classes with and empty constructor can be deserialized.`);
}
