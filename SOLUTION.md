# Solutions for tasks

### Refactor blocking I/O

I refactor reading and writing file functions into a factory function createFileService reimplemented using fs.promises.readFile to avoid blocking I/O that can be reused through the routes and can easly maintained.

**Proposals for scalability**
Current implementation loads the entire JSON files into memory, which is not good for scale, we should mmoe to streaming for large sequential reads or adopt a lightweight JSON based db like (LowDB) or a file DB like SQLite/LevelDB to enable partial reads and efficient updates.
