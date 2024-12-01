/* ########
 * 2024 mion
 * Author: Ma-jerez
 * License: MIT
 * The software is provided "as is", without warranty of any kind.
 * ######## */
import {runType} from '../../runType';
import {JitFnIDs} from '../../constants';

const rt = runType<Date>();

it('validate Date', () => {
    const validate = rt.createJitFunction(JitFnIDs.isType);
    expect(validate(new Date())).toBe(true);
    expect(validate('hello')).toBe(false);
});

it('validate Date + errors', () => {
    const valWithErrors = rt.createJitFunction(JitFnIDs.typeErrors);
    expect(valWithErrors(new Date())).toEqual([]);
    expect(valWithErrors('hello')).toEqual([{path: [], expected: 'date'}]);
});

it('encode/decode to json', () => {
    const toJson = rt.createJitFunction(JitFnIDs.jsonEncode);
    const fromJson = rt.createJitFunction(JitFnIDs.jsonDecode);
    const typeValue = new Date();
    expect(fromJson(JSON.parse(JSON.stringify(toJson(typeValue))))).toEqual(typeValue);
});

it('json stringify', () => {
    const jsonStringify = rt.createJitFunction(JitFnIDs.jsonStringify);
    const fromJson = rt.createJitFunction(JitFnIDs.jsonDecode);
    const typeValue = new Date();
    const roundTrip = fromJson(JSON.parse(jsonStringify(typeValue)));
    expect(roundTrip).toEqual(typeValue);
});

it('mock', () => {
    expect(rt.mock() instanceof Date).toBe(true);
    const validate = rt.createJitFunction(JitFnIDs.isType);
    expect(validate(rt.mock())).toBe(true);
});