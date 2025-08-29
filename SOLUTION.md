# Solutions for tasks

### 1. Refactor blocking I/O

I refactor reading and writing file functions into a factory function createFileService reimplemented using fs.promises.readFile to avoid blocking I/O that can be reused through the routes and can easly maintained.

**Proposals for scalability**
Current implementation loads the entire JSON files into memory, which is not good for scale, we should mmoe to streaming for large sequential reads or adopt a lightweight JSON based db like (LowDB) or a file DB like SQLite/LevelDB to enable partial reads and efficient updates.

### 2. Cache Stats

I decied to implement a very simple singleton class to manage a Map for caching values, this solution fits for the current needs of the project (only caching the stats). Singleton ensure only one instance of Map to store key/value during the life of the app. The values are revalidated everytime new items are added. The solution could be reusable for caching other data. Also added unit testings for this.

**Additional**
Added simple request validation to addItem controller.

### 3. Unit Testing

Added unit tests for the items controller, I created happy path and corner case scenarios for each controller: getItem, getItemById, and addItem. Test is using Jest mocks for dependencies of items controller (fileService and Cache). Tests follows Prepare > Action > Assert flow.

### 4. Memory Leak in Item Component

Instead of using a flag, I decided to use the AbortController API to abort requests if the useEffect cleanup function.

### 5. Add Pagination logic

I added simple pagination logic in server side by introducing a page query param in items endpoint `GET api/items?q='Laptop'&limit=12&page=2``
Frontend was updated to fetch results on every query string change (debounded a few milisec to only send minimal num of request after user finished typing) and when paginating using prev and next buttons. I added a debounced. This component can be improved a lot by using a library like react query, and even state can be reduced.

### 6. Vistualization List
