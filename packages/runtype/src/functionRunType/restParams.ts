import {TypeRest} from '../_deepkit/src/reflection/type';
import {BaseRunType} from '../baseRunTypes';
import {JitErrorPath, RunType, RunTypeOptions, RunTypeVisitor} from '../types';
import {addToPathChain, skipJsonDecode, skipJsonEncode} from '../utils';

/* ########
 * 2024 mion
 * Author: Ma-jerez
 * License: MIT
 * The software is provided "as is", without warranty of any kind.
 * ######## */

export class RestParamsRunType extends BaseRunType<TypeRest> {
    public readonly isJsonEncodeRequired: boolean;
    public readonly isJsonDecodeRequired: boolean;
    public readonly hasCircular: boolean;
    public readonly memberRunType: RunType;
    public readonly isOptional = true;
    public readonly isReadonly = false;
    public readonly paramName: string;
    public readonly default: any;

    constructor(
        visitor: RunTypeVisitor,
        public readonly src: TypeRest,
        public readonly parents: RunType[],
        public readonly opts: RunTypeOptions
    ) {
        super(visitor, src, parents, opts);
        this.memberRunType = visitor(src.type, [...parents, this], opts);
        this.isJsonEncodeRequired = this.memberRunType.isJsonEncodeRequired;
        this.isJsonDecodeRequired = this.memberRunType.isJsonDecodeRequired;
        this.hasCircular = this.memberRunType.hasCircular;
        this.paramName = (src as any).name || 'args';
    }

    getJitId(): string | number {
        // param name is irrelevant (not required) as only position matters
        return `${this.memberRunType.getJitId()}[]`;
    }

    compileIsType(varName: string, paramIndex = 0): string {
        const indexName = `pλrλm${this.nestLevel}`;
        const itemAccessor = `${varName}[${indexName}]`;
        const itemCode = this.memberRunType.compileIsType(itemAccessor);
        const forLoop = `for (let ${indexName} = ${paramIndex}; ${indexName} < ${varName}.length; ${indexName}++) {if (!(${itemCode})) return false;}`;
        return `(function() {${forLoop}return true})()`;
    }
    compileTypeErrors(varName: string, errorsName: string, pathChain: JitErrorPath, paramIndex = 0): string {
        const indexName = `pλrλm${this.nestLevel}`;
        const listItemPath = addToPathChain(pathChain, indexName, false);
        const itemAccessor = `${varName}[${indexName}]`;
        const itemCode = this.memberRunType.compileTypeErrors(itemAccessor, errorsName, listItemPath);
        return `for (let ${indexName} = ${paramIndex}; ${indexName} < ${varName}.length; ${indexName}++) {${itemCode}}`;
    }
    compileJsonEncode(varName: string, paramIndex = 0): string {
        if (skipJsonEncode(this)) return '';
        const indexName = `pλrλm${this.nestLevel}`;
        const itemAccessor = `${varName}[${indexName}]`;
        const itemCode = this.memberRunType.compileJsonEncode(itemAccessor);
        if (!itemCode) return '';
        return `for (let ${indexName} = ${paramIndex}; ${indexName} < ${varName}.length; ${indexName}++) {${itemCode}}`;
    }
    compileJsonDecode(varName: string, paramIndex = 0): string {
        if (skipJsonDecode(this)) return '';
        const indexName = `pλrλm${this.nestLevel}`;
        const itemAccessor = `${varName}[${indexName}]`;
        const itemCode = this.memberRunType.compileJsonDecode(itemAccessor);
        if (!itemCode) return '';
        return `for (let ${indexName} = ${paramIndex}; ${indexName} < ${varName}.length; ${indexName}++) {${itemCode}}`;
    }
    compileJsonStringify(varName: string, paramIndex = 0): string {
        const arrName = `rεsultλrr${this.nestLevel}`;
        const itemName = `itεm${this.nestLevel}`;
        const indexName = `indεx${this.nestLevel}`;
        const itemAccessor = `${varName}[${indexName}]`;
        const sep = paramIndex === 0 ? '' : `','+`;
        const itemCode = this.memberRunType.compileJsonStringify(itemAccessor);
        const forLoop = `const ${arrName} = []; for (let ${indexName} = ${paramIndex}; ${indexName} < ${varName}.length; ${indexName}++) {const ${itemName} = ${itemCode}; if(${itemName}) ${arrName}.push(${itemName})}`;
        return `(function(){${forLoop}; if (!${arrName}.length) {return '';} else {return ${sep}${arrName}.join(',')} })()`;
    }
    mock(...args: any[]): string {
        return this.memberRunType.mock(...args);
    }
}
