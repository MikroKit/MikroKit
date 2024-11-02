/* ########
 * 2024 mion
 * Author: Ma-jerez
 * License: MIT
 * The software is provided "as is", without warranty of any kind.
 * ######## */
import {runType} from '../runType';

enum Color {
    Red,
    Green = 'green',
    Blue = 2,
}

const rt = runType<Color>();

it('validate enum', () => {
    const validate = rt.jitFnIsType();
    expect(validate(Color.Red)).toBe(true);
    expect(validate(Color.Green)).toBe(true);
    expect(validate(Color.Blue)).toBe(true);
    expect(validate(0)).toBe(true);
    expect(validate('green')).toBe(true);
    expect(validate(2)).toBe(true);
    expect(validate('Red')).toBe(false);
    expect(validate('Green')).toBe(false);
    expect(validate('Blue')).toBe(false);
});

it('validate enum + errors', () => {
    const valWithErrors = rt.jitFnTypeErrors();
    expect(valWithErrors(Color.Red)).toEqual([]);
    expect(valWithErrors(Color.Green)).toEqual([]);
    expect(valWithErrors(Color.Blue)).toEqual([]);
    expect(valWithErrors(0)).toEqual([]);
    expect(valWithErrors('green')).toEqual([]);
    expect(valWithErrors(2)).toEqual([]);
    expect(valWithErrors('Red')).toEqual([{path: [], expected: 'enum'}]);
    expect(valWithErrors('Green')).toEqual([{path: [], expected: 'enum'}]);
    expect(valWithErrors('Blue')).toEqual([{path: [], expected: 'enum'}]);
});

it('encode/decode to json', () => {
    const toJson = rt.jitFnJsonEncode();
    const fromJson = rt.jitFnJsonDecode();
    const typeValue = Color.Red;
    expect(fromJson(JSON.parse(JSON.stringify(toJson(typeValue))))).toEqual(typeValue);
});

it('json stringify', () => {
    const jsonStringify = rt.jitFnJsonStringify();
    const fromJson = rt.jitFnJsonDecode();
    const typeValue = Color.Red;
    const roundTrip = fromJson(JSON.parse(jsonStringify(typeValue)));
    expect(roundTrip).toEqual(typeValue);

    const typeValueG = Color.Green;
    const roundTripG = fromJson(JSON.parse(jsonStringify(typeValueG)));
    expect(roundTripG).toEqual(typeValueG);
});

it('mock', () => {
    const mocked = rt.mock();
    expect(mocked === 0 || mocked === 'green' || mocked === 2).toBe(true);
    const validate = rt.jitFnIsType();
    expect(validate(rt.mock())).toBe(true);
});
