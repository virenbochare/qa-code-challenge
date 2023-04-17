import { test, expect, type Page } from '@playwright/test';
import { checkNumberOfCompletedTodosInLocalStorage, checkNumberOfTodosInLocalStorage, checkTodosInLocalStorage } from '../src/todo-app';

test.beforeEach(async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');
});

const TODO_ITEMS = [
  'complete code challenge for reach',
  'ensure coverage for all items is automated',
  '   text with space   ',
  'Use the given classes and create your own to accomplish the following tasks. Please attempt at least three of the cases given below. Each case should have it’s own test description, and each description should have multiple tests.',
  '~!@#$%^&*()_+|}{":?><\][\';/.=-1234567890',
  '   ',
  'a'
];

test.describe('Create New Todo', () => {
  test('should be able to create new items on the page', async ({ page }) => {
    // create a new todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    // Create 1st todo.
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    // Make sure the list only has one todo item.
    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0]]);

    // Create 2nd todo.
    await newTodo.fill(TODO_ITEMS[1]);
    await newTodo.press('Enter');

    // Make sure the list now has two todo items.
    await expect(page.getByTestId('todo-title')).toHaveText([
      TODO_ITEMS[0],
      TODO_ITEMS[1]
    ]);

    //Verify Local Storage
    await checkNumberOfTodosInLocalStorage(page, 2);
  });

  test('should be able to clear input text when an item is added', async ({ page }) => {
    //Create a todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Enter text into input field
    await newTodo.fill(TODO_ITEMS[0]);

    //Clear texts from input field
    await newTodo.clear();

    //Create 1st todo.
    await newTodo.fill(TODO_ITEMS[1]);
    await newTodo.press('Enter');

    //Verify list has the added item.
    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[1]]);

    //Verify list does not have the item which was cleared from the input field.
    await expect(page.getByTestId('todo-title')).not.toContainText([TODO_ITEMS[0]]);

    //Verify Local Storage
    await checkTodosInLocalStorage(page, TODO_ITEMS[1]);
    await checkNumberOfTodosInLocalStorage(page, 1);
  });

  test('should trim entered text', async ({ page }) => {
    //Creae a todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create 1st todo with leading and trailing spaces
    await newTodo.fill(TODO_ITEMS[2]);
    await newTodo.press('Enter');
    
    //Verify the leading and traling spaces are not entered into the todo list
    await expect(page.getByTestId('todo-title')).toHaveText(['text with space']);

    //Verify Local Storage
    await checkTodosInLocalStorage(page, 'text with space');
  });

  test('should append new items to the bottom of the list', async ({ page }) => {
    //Create a todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');
    
    //Create 1st todo item
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    //Create 2nd todo item
    await newTodo.fill(TODO_ITEMS[1]);
    await newTodo.press('Enter');
    
    //Verify 2nd todo item comes after 1st todo item in the list
    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0],TODO_ITEMS[1]]);

    //Verify Local Storage
    await checkTodosInLocalStorage(page, TODO_ITEMS[0]);
    await checkTodosInLocalStorage(page, TODO_ITEMS[1]);
    await checkNumberOfTodosInLocalStorage(page, 2);
  });

  test('verify there is no max limit of the text', async ({ page }) => {
    //Create a todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create a todo item with long sentence
    await newTodo.fill(TODO_ITEMS[3]);
    await newTodo.press('Enter');

    //Verify the todo item with long sentense is added into the list
    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[3]]);

    //Verify Local Storage
    await checkTodosInLocalStorage(page, TODO_ITEMS[3]);
    await checkNumberOfTodosInLocalStorage(page, 1);
  });

  test('verify user can insert special characters', async ({ page }) => {
    //Create a todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create a todo item with speacial characters
    await newTodo.fill(TODO_ITEMS[4]);
    await newTodo.press('Enter');

    //Verify a todo item with special characters is entered into the list
    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[4]]);

    //Verify Local Storage
    await checkTodosInLocalStorage(page, TODO_ITEMS[4]);
    await checkNumberOfTodosInLocalStorage(page, 1);
  });
  
  //This fails because of an assumption that user should not be able to insert duplicate todo item [Looks like a bug]
  test('verify user cannot create duplicate todo item', async ({ page }) => {
    //Create a todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create 1st todo item
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    //Create duplicate of 1st todo item
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    //Verify there is only one todo item created
    await expect(page.getByTestId('todo-title'), 'Duplicate todo item is created.').toHaveText([TODO_ITEMS[0]]);

    //Verify Local Storage
    await checkTodosInLocalStorage(page, TODO_ITEMS[0]);
    await checkNumberOfTodosInLocalStorage(page, 1);
  });

  test('verify just white space is not added into Todo', async ({ page }) => {
    //Create a todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create a todo item with only spaces
    await newTodo.fill(TODO_ITEMS[5]);
    await newTodo.press('Enter');

    //Verify a todo item with spaces is not added into the list
    await expect(page.getByTestId('todo-title')).toHaveCount(0);
  });

  test('verify text with minimum length added to Todo', async ({ page }) => {
    //Create a todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create a todo item with single character
    await newTodo.fill(TODO_ITEMS[6]);
    await newTodo.press('Enter');

    //Verify the todo item with single character is added into the list
    await expect(page.getByTestId('todo-title')).toHaveText(TODO_ITEMS[6]);

    //Verify Local Storage
    await checkTodosInLocalStorage(page, TODO_ITEMS[6]);
  });

  test('verify item is not shown as completed after entering into Todo', async ({ page }) => {
    //Create a todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create a todo item
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    //Verify the created todo item is not shown as completed in the list
    await expect(page.locator('li.completed')).toHaveCount(0);
  });

  test('verify max number of todo list', async ({ page }) => {
    var values = new Array();
    
    //Create a todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create 50 todo items
    for (let i = 0; i < 50; i++) {
      await newTodo.fill(i.toString());
      await newTodo.press('Enter');
      values.push(i.toString());
    }

    //Verify 50 todo items are added into the list
    await expect(page.getByTestId('todo-title')).toContainText(values);

    //Verify Local Storage
    await checkNumberOfTodosInLocalStorage(page, 50);
  });

  test('verify todo count is updated as the item is added', async ({ page }) => {
    //Create a todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create 4 todo items and verify after adding each todo item the todo count is updated
    for (let i = 1; i < 5; i++) {
      await newTodo.fill(i.toString());
      await newTodo.press('Enter');
      var value = " items left";
      if (i == 1) {
        value = " item left";
      }
      await expect(page.getByTestId('todo-count')).toHaveText(i.toString() + value);
    }
  });
});

test.describe('Marking as completed', () => {
  test('should be able to mark all items as completed', async ({ page }) => {
    //Create a todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create 3 todo items
    for (let i = 0; i < 3; i++) {
      await newTodo.fill(TODO_ITEMS[i]);
      await newTodo.press('Enter');
    }

    //Mark all 3 todo items as completed
    for (const li of await page.locator('input.toggle').all()) {
      await li.check();
    }

    //Verify all 3 todo items are shown as completed
    await expect(page.locator('li.completed')).toHaveCount(3);

    //Verify Local Storage
    await checkNumberOfCompletedTodosInLocalStorage(page, 3);
    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test('should allow clearing the completed state back to incomplete', async ({ page }) => {
    //Create a todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create 3 todo items
    for (let i = 0; i < 3; i++) {
      await newTodo.fill(TODO_ITEMS[i]);
      await newTodo.press('Enter');
    }

    //Mark all 3 items as completed
    for (const li of await page.locator('input.toggle').all()) {
      await li.check();
    }

    //Mark 3rd item as active
    await page.locator('input.toggle').nth(2).uncheck();

    //Verify there are only two completed todo items
    await expect(page.locator('li.completed')).toHaveCount(2);
    
    //Verify Local Storage
    await checkNumberOfCompletedTodosInLocalStorage(page, 2);
    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test('should allow marking all as completed with the arrow next to the prompt', async ({ page }) => {
    //Create a todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create 3 todo items
    for (let i = 0; i < 3; i++) {
      await newTodo.fill(TODO_ITEMS[i]);
      await newTodo.press('Enter');
    }

    //Mark all items as completed by clicking arrow next to the prompt
    await page.locator('input#toggle-all').check();

    //Verify there are 3 completed todo items
    await expect(page.locator('li.completed')).toHaveCount(3);

    //Verify Local Storage
    await checkNumberOfCompletedTodosInLocalStorage(page, 3);
    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test('should allow marking all as active with the arrow next to the prompt', async ({ page }) => {
    //Create a todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create 3 todo items
    for (let i = 0; i < 3; i++) {
      await newTodo.fill(TODO_ITEMS[i]);
      await newTodo.press('Enter');
    }

    //Mark all items as completed by clicking arrow next to the prompt
    await page.locator('input#toggle-all').check();

    //Mark all items as Active by clicking arrow next to the prompt
    await page.locator('input#toggle-all').uncheck();

    //Verify there are 3 active todo items
    await expect(page.locator('li.completed')).toHaveCount(0);
    
    //Verify Local Storage
    await checkNumberOfCompletedTodosInLocalStorage(page, 0);
  });

  test('verify item is not set as Completed right after adding the item', async ({ page }) => {
    //Create a todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create 3 todo items
    for (let i = 0; i < 3; i++) {
      await newTodo.fill(TODO_ITEMS[i]);
      await newTodo.press('Enter');
    }

    //Verify items are not set as completed
    await expect(page.locator('li.completed')).toHaveCount(0);

    //Verify Local Storage
    await checkNumberOfCompletedTodosInLocalStorage(page, 0);
  });
});

test.describe('Editing existing todos', () => {
  test('should be able to edit a record', async ({ page }) => {
    //Create a todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create 1st todo item
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    //Create a todo item locator
    const item = page.getByTestId('todo-title');

    //Double click on todo item in the list
    await item.dblclick();

    //Clear texts from the todo item in the list
    await item.press('Control+a');
    await item.press('Backspace');

    //Rename todo item
    await item.type('Temp Item');
    await item.press('Enter');

    //Verify the old name of todo does not exist in the list
    await expect(page.getByTestId('todo-title')).not.toContainText([TODO_ITEMS[0]]);

    //Verify the new name of todo exists in the list
    await expect(page.getByTestId('todo-title')).toHaveText(['Temp Item']);

    //Verify there is only one todo item
    await expect(page.getByTestId('todo-title')).toHaveCount(1);
    
    //Verify Local Storage
    await checkTodosInLocalStorage(page, 'Temp Item');
  });

  test('should trim entered text', async ({ page }) => {
    //Create a todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create a todo item
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    //Create a todo item locator
    const item = page.getByTestId('todo-title');

    //Double click on todo item in the list to edit
    await item.dblclick();

    //Clear texts from todo item
    await item.press('Control+a');
    await item.press('Backspace');

    //Enter texts with leading and trailing spaces in the todo item
    await item.type('     Temp Item     ');
    await item.press('Enter');

    //Verify the old name of todo list does not exist
    await expect(page.getByTestId('todo-title')).not.toContainText([TODO_ITEMS[0]]);

    //Verify the new name of the todo list exits without leading and trailing spaces
    await expect(page.getByTestId('todo-title')).toHaveText(['Temp Item']);

    //Verify there is only one todo item created
    await expect(page.getByTestId('todo-title')).toHaveCount(1);
    
    //Verify Local Storage
    await checkTodosInLocalStorage(page, 'Temp Item');
  });

  test('should remove the item if the text is cleared', async ({ page }) => {
    //Create a todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create a todo item
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    //Get locator of a todo item
    const item = page.getByTestId('todo-title');

    //Double click on todo item in the list
    await item.dblclick();

    //Clear texts from a todo item and press Enter
    await item.press('Control+a');
    await item.press('Delete');
    await item.press('Enter');
    
    //Verify the old name of the todo item does not exits in the list
    await expect(page.getByTestId('todo-title')).not.toContainText([TODO_ITEMS[0]]);

    //Verify there is no todo list as the todo item should be deleted
    await expect(page.getByTestId('todo-title')).toHaveCount(0);
  });

  test('should cancel edits on escape', async ({ page }) => {
    //Get a todo placeholder locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create a todo item
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    //Get todo item locator
    const item = page.getByTestId('todo-title');

    //Double click on the todo item
    await item.dblclick();

    //Clear texts from the todo item in the list
    await item.press('Control+a');
    await item.press('Delete');

    //Rename todo item
    await item.type('Temp Item');

    //Press Escape key
    await item.press('Escape');

    //Verify the renamed texts of todo item do not exits in the list
    await expect(page.getByTestId('todo-title')).not.toHaveText(['Temp Item']);

    //Verify the old name of todo list exits as after pressing Escape button the edit should be cancelled
    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0]]);

    //Verify there is only one item in the todo list
    await expect(page.getByTestId('todo-title')).toHaveCount(1);
  });

  test('should delete the TODO item by clicking close button', async ({ page }) => {
    //Get a todo placeholder locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create 1st todo item
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    //Create 2nd todo item
    await newTodo.fill(TODO_ITEMS[1]);
    await newTodo.press('Enter');

    //Hover over 2nd todo item to make delete button visible
    await page.getByTestId('todo-title').nth(1).hover();

    //Click on delete button on the 2nd todo item
    await page.locator('button.destroy').nth(1).click();

    //Verify only 1st todo item exits
    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0]]);
    
    //Verify Local Storage
    await checkTodosInLocalStorage(page, TODO_ITEMS[0]);
    await checkNumberOfTodosInLocalStorage(page, 1);
  });

  test('should delete completed todo item by clicking close button', async ({ page }) => {
    //Get a todo placeholder locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create 1st todo item
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    //Create 2nd todo item
    await newTodo.fill(TODO_ITEMS[1]);
    await newTodo.press('Enter');

    //Check the checkbox of 2nd todo item to mark as completed
    await page.locator('input.toggle').nth(1).check();

    //Verify there is only one completed todo item in the list
    await expect(page.locator('li.completed')).toHaveCount(1);

    //Hover over the 2nd todo item which was marked as completed to make delete button visible
    await page.getByTestId('todo-title').nth(1).hover();

    //Click on delete button of 2nd todo item which was marked as completed
    await page.locator('button.destroy').nth(1).click();

    //Verify there is only 1st todo item in the list as the 2nd todo item should be deleted
    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0]]);
    
    //Verify Local Storage
    await checkTodosInLocalStorage(page, TODO_ITEMS[0]);
    await checkNumberOfCompletedTodosInLocalStorage(page, 0);
    await checkNumberOfTodosInLocalStorage(page, 1);
  });
});

test.describe('Other functions', () => {
  test('should disable buttons when editing an item', async ({ page }) => {
    //Get a todo placeholder locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create a todo item
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    //Get locator of a todo item
    const item = page.getByTestId('todo-title').nth(0);

    //Double click on the todo item
    await item.dblclick();

    //Verify the checkbox to mark completed is hidden since the todo item is being edited
    await expect(page.getByLabel('Toggle Todo').nth(0)).toBeHidden();
  });

  test('should filter the list on completion by the active filter', async ({ page }) => {
    //Get a todo placeholder locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create 1st todo item
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    //Create 2nd todo item
    await newTodo.fill(TODO_ITEMS[1]);
    await newTodo.press('Enter');

    //Create 3rd todo item
    await newTodo.fill(TODO_ITEMS[2]);
    await newTodo.press('Enter');

    //Mark 2nd todo item completed
    await page.getByLabel('Toggle Todo').nth(1).check();

    //Click on Active button
    await page.locator('a[href="#/active"]').click();

    //Verify there are only 1st and 3rd todo items active
    await expect(page.getByTestId('todo-title')).toHaveText([
      TODO_ITEMS[0],
      TODO_ITEMS[2]
    ]);
  });

  test('should filter the list on completion by the Completed filter', async ({ page }) => {
    //Get a todo placeholder locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create 1st todo item
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    //Create 2nd todo item
    await newTodo.fill(TODO_ITEMS[1]);
    await newTodo.press('Enter');
    
    //Create 3rd todo item
    await newTodo.fill(TODO_ITEMS[2]);
    await newTodo.press('Enter');

    //Mark 2nd todo item as completed
    await page.getByLabel('Toggle Todo').nth(1).check();

    //Click on Completed button
    await page.locator('a[href="#/completed"]').click();

    //Verify there is only 2nd todo item completed in the list
    await expect(page.getByTestId('todo-title')).toHaveCount(1);
    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[1]]);
  });

  test('should persist it’s data on browser refresh', async ({ page }) => {
    //Get a todo placeholder locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create 1st todo item
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    //Create 2nd todo item
    await newTodo.fill(TODO_ITEMS[1]);
    await newTodo.press('Enter');

    //Create 3rd todo item
    await newTodo.fill(TODO_ITEMS[2]);
    await newTodo.press('Enter');

    //Mark 2nd todo item as completed
    await page.getByLabel('Toggle Todo').nth(1).check();

    //Refresh the page
    await page.reload();

    //Verify all three todo items are shown in the list
    await expect(page.getByTestId('todo-title')).toHaveText([
      TODO_ITEMS[0],
      TODO_ITEMS[1],
      TODO_ITEMS[2]
    ]);

    //Verify Local Storage
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);
    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test('should filter the list on completion by the All filter', async ({ page }) => {
    //Get a todo placeholer locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create 1st todo item
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    //Create 2nd todo item
    await newTodo.fill(TODO_ITEMS[1]);
    await newTodo.press('Enter');

    //Create 3rd todo item
    await newTodo.fill(TODO_ITEMS[2]);
    await newTodo.press('Enter');

    //Mark 2nd todo item as completed
    await page.getByLabel('Toggle Todo').nth(1).check();

    //Click on Active button
    await page.locator('a[href="#/active"]').click();

    //Verify there are 1st and 3rd todo items are shown as Active todo
    await expect(page.getByTestId('todo-title')).toHaveText([
      TODO_ITEMS[0],
      TODO_ITEMS[2]
    ]);

    //Click on Completed button
    await page.locator('a[href="#/completed"]').click();

    //Verify there is only 3rd todo item is shown as completed
    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[1]]);

    //Click on All button
    await page.locator('a[href="#/"]').click();

    //Verify all three todo items are shown in the list
    await expect(page.getByTestId('todo-title')).toHaveText([
      TODO_ITEMS[0],
      TODO_ITEMS[1],
      TODO_ITEMS[2]
    ]);
  });

  test('verify the Clear completed button is shown only if there is any completed todo', async ({ page }) => {
    //Get a todo placeholder locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create 1st todo item
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    //Create 2nd todo item
    await newTodo.fill(TODO_ITEMS[1]);
    await newTodo.press('Enter');

    //Create 3rd todo item
    await newTodo.fill(TODO_ITEMS[2]);
    await newTodo.press('Enter');

    //Verify the Clear completed button is not visible
    await expect(page.locator('button.clear-completed')).not.toBeVisible();

    //Mark 2nd todo item as completed
    await page.getByLabel('Toggle Todo').nth(1).check();

    //Verify the Clear completed button is visible
    await expect(page.locator('button.clear-completed')).toBeVisible();
  });

  test('verify completed todos are clear after clicking on Clear completed button', async ({ page }) => {
    //Get a todo placeholder locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    //Create 1st todo item
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    //Create 2nd todo item
    await newTodo.fill(TODO_ITEMS[1]);
    await newTodo.press('Enter');

    //Create 3rd todo item
    await newTodo.fill(TODO_ITEMS[2]);
    await newTodo.press('Enter');

    //Mark 2nd todo item as completed
    await page.getByLabel('Toggle Todo').nth(1).check();

    //Mark 1st todo item as completed
    await page.getByLabel('Toggle Todo').nth(2).check();

    //Click on Clear completed button
    await page.locator('button.clear-completed').click();

    //Verify there is only 1st todo item is shown in the list as other two todo items should be deleted
    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0]]);

    //Verify Local Storage
    await checkTodosInLocalStorage(page, TODO_ITEMS[0]);
    await checkNumberOfTodosInLocalStorage(page, 1);
  });
});
