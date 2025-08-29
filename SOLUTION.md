# Solutions for Tasks

### 1. Refactor Blocking I/O

I refactored the file reading and writing functions into a factory function called `createFileService`, reimplemented using `fs.promises.readFile` to avoid blocking I/O. This approach ensures reusability across routes and simplifies maintenance.

**Proposals for Scalability**  
The current implementation loads entire JSON files into memory, which is not scalable. We should consider moving to streaming for large sequential reads or adopting a lightweight JSON-based database like LowDB or a file-based database like SQLite/LevelDB. These options enable partial reads and efficient updates.

---

### 2. Cache Stats

I implemented a simple singleton class to manage a `Map` for caching values. This solution meets the current project requirements (caching stats). The singleton ensures only one instance of the `Map` exists during the app's lifecycle. Cached values are revalidated whenever new items are added. This solution is reusable for caching other data. Unit tests were also added for this implementation.

**Additional**  
I added basic request validation to the `addItem` controller.

---

### 3. Unit Testing

I added unit tests for the `items` controller, covering both happy path and edge case scenarios for the following methods: `getItem`, `getItemById`, and `addItem`. The tests use Jest mocks for the `fileService` and `Cache` dependencies. Each test follows the Prepare > Action > Assert flow.

---

### 4. Memory Leak in Item Component

To address the memory leak issue, I replaced the flag-based approach with the `AbortController` API. This ensures that requests are aborted when the `useEffect` cleanup function is triggered.

---

### 5. Add Pagination Logic

I implemented server-side pagination by introducing a `page` query parameter in the `items` endpoint:  
`GET api/items?q='Laptop'&limit=12&page=2`.

On the frontend, I updated the logic to fetch results whenever the query string changes. A debounce mechanism was added to minimize the number of requests sent while the user is typing. Pagination is handled using "Previous" and "Next" buttons. This component can be further improved by using a library like React Query, which would also help reduce state management complexity.

---

### 6. Virtualized List

I added basic virtualization using the `TanStack react-virtual` library. This ensures that only the items visible within the list container are rendered. This approach can be extended to implement infinite scrolling with optimized rendering, which could replace the current "Previous" and "Next" pagination approach.

---

### 7. Improve Styles

I added TailwindCSS via CDN for simplicity (not recommended for production or more complex applications). Basic styles were added to improve the UI components and ensure responsiveness.

## Final Notes

There are still opportunities to improve the code, but given the time constraints, I decided not to finish them. I’ve listed the main areas below:

- Searching: by the timing I focused in listed goals, and I couldn't fix the suboptimal search logic specifically this line in items.controller.js which cause memory usage to grow linerarly

  ```js
  results = results.filter((item) =>
    item.name.toLowerCase().includes(q.toLowerCase())
  );
  ```

  This could be fixed by creating an index upfront with the lower case search string and the filtering.
  or used a database with indexing and filtering capabilities instead of loading all records and doing it in memory.

- Items.js Component: The code could be cleaner by splitting UI components into separate files and keeping the fetching logic in a dedicated container, e.g., following a pattern like ItemsContainer.

- React Data Fetching: Fetching inside useEffect can become chaotic and hard to maintain. Moving the logic to React Query would improve readability, caching, and error handling.

- Styling: The layout could be improved by defining a more consistent design and configuring TailwindCSS locally for a fast and stable styling setup instead of relying on a CDN. Currently, the items container has a smaller height to showcase virtualization, but it should ideally extend to fill the full page.

- Testing: React components are missing proper tests. I would implement tests for user interactions, pagination, search functionality, and virtualization to ensure stability and maintainability.
