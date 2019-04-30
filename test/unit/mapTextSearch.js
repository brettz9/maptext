/* eslint-env mocha */
import {expect} from 'chai';
import {getBeginAndEndIndexes} from '../../behaviors/mapTextSearch.js';

describe('getBeginAndEndIndexes', () => {
  it('getBeginAndEndIndexes (first)', () => {
    const [begin, end] = getBeginAndEndIndexes({
      formObjectInfo: [{alt: 'a bc'}, {alt: 'bc'}],
      value: 'a bc',
      isFirstMode: false
    });
    expect(begin).equals(0);
    expect(end).equals(0);
  });
  it('getBeginAndEndIndexes (first - in middle)', () => {
    const [begin, end] = getBeginAndEndIndexes({
      formObjectInfo: [{alt: 'def a bc def'}, {alt: 'bc'}],
      value: 'a bc',
      isFirstMode: false
    });
    expect(begin).equals(0);
    expect(end).equals(0);
  });
  it('getBeginAndEndIndexes (first - at end)', () => {
    const [begin, end] = getBeginAndEndIndexes({
      formObjectInfo: [{alt: 'def a bc'}, {alt: 'bc'}],
      value: 'a bc',
      isFirstMode: false
    });
    expect(begin).equals(0);
    expect(end).equals(0);
  });
  it('getBeginAndEndIndexes (first two)', () => {
    const [begin, end] = getBeginAndEndIndexes({
      formObjectInfo: [{alt: 'a'}, {alt: 'bc'}],
      value: 'a bc',
      isFirstMode: false
    });
    expect(begin).equals(0);
    expect(end).equals(1);
  });
  it('getBeginAndEndIndexes (last one)', () => {
    const [begin, end] = getBeginAndEndIndexes({
      formObjectInfo: [{alt: 'a'}, {alt: 'a'}, {alt: 'a bc'}],
      value: 'a bc',
      isFirstMode: false
    });
    expect(begin).equals(2);
    expect(end).equals(2);
  });
  it('getBeginAndEndIndexes (last one - middle)', () => {
    const [begin, end] = getBeginAndEndIndexes({
      formObjectInfo: [{alt: 'a'}, {alt: 'a'}, {alt: 'ddda bcz'}],
      value: 'a bc',
      isFirstMode: false
    });
    expect(begin).equals(2);
    expect(end).equals(2);
  });
  it('getBeginAndEndIndexes (last one - end)', () => {
    const [begin, end] = getBeginAndEndIndexes({
      formObjectInfo: [{alt: 'a'}, {alt: 'a'}, {alt: 'ddda bc'}],
      value: 'a bc',
      isFirstMode: false
    });
    expect(begin).equals(2);
    expect(end).equals(2);
  });
  it('getBeginAndEndIndexes (last two)', () => {
    const [begin, end] = getBeginAndEndIndexes({
      formObjectInfo: [{alt: 'a'}, {alt: 'a'}, {alt: 'bc'}],
      value: 'a bc',
      isFirstMode: false
    });
    expect(begin).equals(1);
    expect(end).equals(2);
  });
  it('getBeginAndEndIndexes (middle)', () => {
    const [begin, end] = getBeginAndEndIndexes({
      formObjectInfo: [
        {alt: 'a'}, {alt: 'a'}, {alt: 'a bc'}, {alt: 'dc'}, {alt: 'bca'}
      ],
      value: 'a bc',
      isFirstMode: false
    });
    expect(begin).equals(2);
    expect(end).equals(2);
  });
  it('getBeginAndEndIndexes (middle two)', () => {
    const [begin, end] = getBeginAndEndIndexes({
      formObjectInfo: [
        {alt: 'a'}, {alt: 'a'}, {alt: 'bc'}, {alt: 'dc'}, {alt: 'bca'}
      ],
      value: 'a bc',
      isFirstMode: false
    });
    expect(begin).equals(1);
    expect(end).equals(2);
  });
  it('getBeginAndEndIndexes (middle three)', () => {
    const [begin, end] = getBeginAndEndIndexes({
      formObjectInfo: [
        {alt: 'a'}, {alt: 'a'}, {alt: 'bc'}, {alt: 'dc'}, {alt: 'bca'}
      ],
      value: 'a bc d',
      isFirstMode: false
    });
    expect(begin).equals(1);
    expect(end).equals(3);
  });
  it('getBeginAndEndIndexes (not found)', () => {
    const [begin, end] = getBeginAndEndIndexes({
      formObjectInfo: [
        {alt: 'a'}, {alt: 'a'}, {alt: 'bc'}, {alt: 'dc'}, {alt: 'bca'}
      ],
      value: 'zz',
      isFirstMode: false
    });
    expect(begin).equals(undefined);
    expect(end).equals(undefined);
  });
});
