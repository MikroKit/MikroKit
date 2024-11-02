/* ########
 * 2024 mion
 * Author: Ma-jerez
 * License: MIT
 * The software is provided "as is", without warranty of any kind.
 * ######## */
import {runType} from '../runType';

describe('Array', () => {
    const rt = runType<string[]>();
    const rD = runType<Date[]>();

    it('validate string[]', () => {
        const validate = rt.jitFnIsType();
        expect(validate([])).toBe(true);
        expect(validate(['hello', 'world'])).toBe(true);
        expect(validate(['hello', 2])).toBe(false);
        expect(validate('hello')).toBe(false);
    });

    it('validate string[] + errors', () => {
        const valWithErrors = rt.jitFnTypeErrors();
        expect(valWithErrors(['hello', 'world'])).toEqual([]);
        expect(valWithErrors('hello')).toEqual([{path: [], expected: 'array'}]);
        expect(valWithErrors(['hello', 123])).toEqual([{path: [1], expected: 'string'}]);
    });

    it('encode to json', () => {
        const toJson = rt.jitFnJsonEncode();
        const typeValue = ['hello', 'world'];
        expect(toJson(typeValue)).toEqual(typeValue);
    });

    it('decode from json', () => {
        const fromJson = rt.jitFnJsonDecode();
        const typeValue = ['hello', 'world'];
        const json = JSON.parse(JSON.stringify(typeValue));
        expect(fromJson(json)).toEqual(typeValue);
    });

    it('encode to json date', () => {
        const toJson = rD.jitFnJsonEncode();
        const typeValue = [new Date(), new Date()];
        expect(toJson(typeValue)).toBe(typeValue);
    });

    it('decode from json date', () => {
        const fromJson = rD.jitFnJsonDecode();
        const typeValue = [new Date(), new Date()];
        const json = JSON.parse(JSON.stringify(typeValue));
        expect(fromJson(json)).toEqual(typeValue);
    });

    it('json stringify', () => {
        const jsonStringify = rt.jitFnJsonStringify();
        const fromJson = rt.jitFnJsonDecode();
        const typeValue = ['hello', 'world'];
        const roundTrip = fromJson(JSON.parse(jsonStringify(typeValue)));
        expect(roundTrip).toEqual(typeValue);

        const typeValue2 = [];
        const roundTrip2 = fromJson(JSON.parse(jsonStringify(typeValue2)));
        expect(roundTrip2).toEqual(typeValue2);
    });

    it('mock', () => {
        expect(rt.mock() instanceof Array).toBe(true);
        const validate = rt.jitFnIsType();
        expect(validate(rt.mock())).toBe(true);
    });
});

describe('Array with multiple dimensions', () => {
    const rt = runType<string[][]>();

    it('validate string[][]', () => {
        const validate = rt.jitFnIsType();
        expect(validate([])).toBe(true);
        expect(validate([[]])).toBe(true);
        expect(
            validate([
                ['hello', 'world'],
                ['a', 'b'],
            ])
        ).toBe(true);
        expect(validate([['hello', 2]])).toBe(false);
        expect(validate(['hello'])).toBe(false);
        expect(validate('hello')).toBe(false);
    });

    it('validate string[][] + errors', () => {
        const valWithErrors = rt.jitFnTypeErrors();
        expect(valWithErrors([])).toEqual([]);
        expect(valWithErrors([[]])).toEqual([]);
        expect(
            valWithErrors([
                ['hello', 'world'],
                ['a', 'b'],
            ])
        ).toEqual([]);
        expect(valWithErrors([['hello', 2]])).toEqual([{path: [0, 1], expected: 'string'}]);
        expect(valWithErrors(['hello'])).toEqual([{path: [0], expected: 'array'}]);
        expect(valWithErrors('hello')).toEqual([{path: [], expected: 'array'}]);
        expect(valWithErrors(['hello', 'world'])).toEqual([
            {path: [0], expected: 'array'},
            {path: [1], expected: 'array'},
        ]);
    });

    it('encode to json', () => {
        const toJson = rt.jitFnJsonEncode();
        const typeValue = [['hello', 'world'], ['a', 'b'], []];
        expect(toJson(typeValue)).toEqual(typeValue);
    });

    it('decode from json', () => {
        const fromJson = rt.jitFnJsonDecode();
        const typeValue = [['hello', 'world'], ['a', 'b'], []];
        const json = JSON.parse(JSON.stringify(typeValue));
        expect(fromJson(json)).toEqual(typeValue);
    });

    it('json stringify', () => {
        const jsonStringify = rt.jitFnJsonStringify();
        const fromJson = rt.jitFnJsonDecode();
        const typeValue = [['hello', 'world'], ['a', 'b'], []];
        const roundTrip = fromJson(JSON.parse(jsonStringify(typeValue)));
        expect(roundTrip).toEqual(typeValue);

        const typeValue2 = [];
        const roundTrip2 = fromJson(JSON.parse(jsonStringify(typeValue2)));
        expect(roundTrip2).toEqual(typeValue2);
    });

    it('mock', () => {
        const validate = rt.jitFnIsType();
        expect(rt.mock() instanceof Array).toBe(true);
        expect(validate(rt.mock())).toBe(true);
    });
});

describe('Array circular ref', () => {
    // this type is not really useful as only allows empty array
    // but it is the only valid test for circular references in the array runType
    // other more common circular array involves unions and are tested there i.e: types CS = (CS | string)[]
    type CircularArray = CircularArray[];

    it('validate CircularArray', () => {
        const rt = runType<CircularArray>();
        const validate = rt.jitFnIsType();
        const arr: CircularArray = [];
        arr.push([]);
        arr[0].push([]);
        arr[0][0].push([]);
        expect(validate(arr)).toBe(true);
    });

    it('validate CircularArray + errors', () => {
        const rt = runType<CircularArray>();
        const valWithErrors = rt.jitFnTypeErrors();
        const arr: CircularArray = [];
        arr.push([]);
        arr[0].push([]);
        arr[0][0].push([]);
        expect(valWithErrors(arr)).toEqual([]);

        arr.push('A' as any);
        arr[0].push('A' as any);
        expect(valWithErrors(arr)).toEqual([
            {path: [0, 1], expected: 'array'},
            {path: [1], expected: 'array'},
        ]);
    });

    it('encode CircularArray to json', () => {
        const rt = runType<CircularArray>();
        const toJson = rt.jitFnJsonEncode();
        const arr: CircularArray = [];
        arr.push([]);
        arr[0].push([]);
        arr[0][0].push([]);
        expect(toJson(arr)).toEqual(arr);
    });

    it('decode CircularArray from json', () => {
        const rt = runType<CircularArray>();
        const fromJson = rt.jitFnJsonDecode();
        const arr: CircularArray = [];
        arr.push([]);
        arr[0].push([]);
        arr[0][0].push([]);
        const json = JSON.parse(JSON.stringify(arr));
        expect(fromJson(json)).toEqual(arr);
    });

    it('json stringify CircularArray', () => {
        const rt = runType<CircularArray>();
        const jsonStringify = rt.jitFnJsonStringify();
        const fromJson = rt.jitFnJsonDecode();
        const arr: CircularArray = [];
        arr.push([]);
        arr[0].push([]);
        arr[0][0].push([]);
        const roundTrip = fromJson(JSON.parse(jsonStringify(arr)));
        expect(roundTrip).toEqual(arr);

        const arr2: CircularArray = [];
        const roundTrip2 = fromJson(JSON.parse(jsonStringify(arr2)));
        expect(roundTrip2).toEqual(arr2);
    });

    it('mock CircularArray', () => {
        const rt = runType<CircularArray>();
        const validate = rt.jitFnIsType();
        expect(rt.mock() instanceof Array).toBe(true);
        expect(validate(rt.mock())).toBe(true);
    });
});
