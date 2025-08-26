import { buildSearchCriteria } from './search.helpers';

interface TestItem {
  id: number;
  name: string;
  numberIds: number[];
}

const EXAMPLE_ITEM_VALID_1: TestItem = {
  id: 1,
  name: 'bob',
  numberIds: [0, 2],
};

const EXAMPLE_ITEM_VALID_2: TestItem = {
  id: 2,
  name: 'alice',
  numberIds: [1, 4],
};

const EXAMPLE_ITEM_INVALID_1: TestItem = {
  id: 3,
  name: 'alice',
  numberIds: [0, 99],
};

describe('search.helpers', () => {
  it('expect composed fn is valid', () => {
    const cri = buildSearchCriteria<TestItem>({
      $or: [
        //
        { name: { $match: 'bob' } },
        {
          $and: [
            //
            { name: { $match: 'alice' } },
            { numberIds: { $includes: 1 } },
          ],
        },
      ],
    });
    expect(cri(EXAMPLE_ITEM_VALID_1)).toBeTruthy();
    expect(cri(EXAMPLE_ITEM_VALID_2)).toBeTruthy();
    expect(cri(EXAMPLE_ITEM_INVALID_1)).toBeFalsy();
  });
});
