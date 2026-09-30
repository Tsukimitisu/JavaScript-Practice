# Todo list

Open [index.html](index.html). The markup defines the controls, [todo-list.js](todo-list.js) manages tasks and events, and [todo-list.css](todo-list.css) styles the page.

Add a task with a name of up to 100 characters, an optional due date, and a priority. Use the list controls to edit, complete, remove, or reorder tasks. Choose Manual sorting to enable the move buttons.

Try adding tasks with different dates and priorities, then combine search with the Show filter. Switch between due-date and priority sorting and reload to check the saved sort selection.

Press `/` outside a form field to focus search. Press Escape in search to clear it. Remove a task and use Undo remove to restore it; the undo state lasts only in the current page session and is replaced by another individual removal.

Practice: trace how filtering and sorting produce the visible list from the stored task array.

The reusable data rules live in [todo-data.js](todo-data.js). They normalize saved
tasks, reject impossible calendar dates, and treat missing or malformed dates as
undated during sorting. Run their focused tests from the repository root with:

```powershell
npm run test:todo
```

[Back to the exercise guide](../README.md)
