// https://github.com/DevExpress/testcafe
// https://devexpress.github.io/testcafe/documentation/test-api/
import {Selector} from 'testcafe';

fixture`TestCafe UI tests`
  .page`http://localhost:8050/`;

test('Main application: Has name input', async (t) => {
  const nameInputSelector = Selector('input[name="name"]');
  await t.expect(
    nameInputSelector.exists
  ).ok();
});
