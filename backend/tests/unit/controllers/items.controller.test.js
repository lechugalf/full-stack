const mockFileService = {
  readData: jest.fn(),
  writeData: jest.fn(),
};

const mockCache = { clear: jest.fn() };

jest.mock("../../../src/utils/fileService", () => ({
  createFileService: jest.fn(() => mockFileService),
}));

jest.mock("../../../src/utils/cache", () => mockCache);

const {
  getItems,
  getItemById,
  addItem,
} = require("../../../src/controllers/items.controller");

describe("Items Controller", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  const mockItems = [
    { id: 1, name: "Gamer Laptop", category: "Electronics", price: 999.99 },
    { id: 2, name: "Iron Pan", category: "Kitchen", price: 15.5 },
    { id: 3, name: "Smartphone", category: "Electronics", price: 699.99 },
  ];

  beforeEach(() => {
    // Setup mock request, response, and next
    mockReq = {
      query: {},
      params: {},
      body: {},
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe("getItems", () => {
    beforeEach(() => {
      mockFileService.readData.mockResolvedValue([...mockItems]);
    });

    it("should return all items when no query parameters are provided", async () => {
      await getItems(mockReq, mockRes, mockNext);

      expect(mockFileService.readData).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith(mockItems);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should filter items by query parameter (case insensitive)", async () => {
      mockReq.query.q = "laptop";

      await getItems(mockReq, mockRes, mockNext);

      const expectedResults = [mockItems[0]]; // "Gamer Laptop"
      expect(mockFileService.readData).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith(expectedResults);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should filter items by query parameter with different case", async () => {
      mockReq.query.q = "IRON";

      await getItems(mockReq, mockRes, mockNext);

      const expectedResults = [mockItems[1]]; // "Iron Pan"

      expect(mockFileService.readData).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith(expectedResults);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return empty array when no items match query", async () => {
      mockReq.query.q = "nonexistent";

      await getItems(mockReq, mockRes, mockNext);

      expect(mockFileService.readData).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith([]);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should limit results when limit parameter is provided", async () => {
      mockReq.query.limit = "2";

      await getItems(mockReq, mockRes, mockNext);

      const expectedResults = mockItems.slice(0, 2);

      expect(mockFileService.readData).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith(expectedResults);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should apply both query and limit parameters", async () => {
      mockReq.query.q = "e"; // Should match Gamer Laptop and Smartphone
      mockReq.query.limit = "1";

      await getItems(mockReq, mockRes, mockNext);

      // Should return first matching item only "Gamer Laptop"
      const expectedResults = [mockItems[0]];

      expect(mockFileService.readData).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith(expectedResults);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle limit parameter as string and convert to number", async () => {
      mockReq.query.limit = "1";

      await getItems(mockReq, mockRes, mockNext);

      const expectedResults = [mockItems[0]];
      expect(mockFileService.readData).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith(expectedResults);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle file service errors", async () => {
      const error = new Error("File read error");
      mockFileService.readData.mockRejectedValue(error);

      await getItems(mockReq, mockRes, mockNext);

      expect(mockFileService.readData).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe("getItems (with pagination)", () => {
    beforeEach(() => {
      mockFileService.readData.mockResolvedValue([...mockItems]);
    });

    it("should return all items when no query parameters are provided", async () => {
      await getItems(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(mockItems);
    });

    it("should apply limit only", async () => {
      mockReq.query.limit = "2";

      await getItems(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(mockItems.slice(0, 2));
    });

    it("should apply page and limit for pagination", async () => {
      mockReq.query.limit = "1";
      mockReq.query.page = "2"; // second page, 1 item per page

      await getItems(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith([mockItems[1]]);
    });

    it("should apply query and pagination together", async () => {
      mockReq.query.q = "e"; // matches "Gamer Laptop" and "Smartphone"
      mockReq.query.limit = "1";
      mockReq.query.page = "2"; // second matching item

      await getItems(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith([mockItems[2]]); // "Smartphone"
    });

    it("should default to page 1 when only limit is provided", async () => {
      mockReq.query.limit = "2";

      await getItems(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(mockItems.slice(0, 2));
    });

    it("should handle non-matching query", async () => {
      mockReq.query.q = "nonexistent";
      mockReq.query.limit = "2";
      mockReq.query.page = "1";

      await getItems(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it("should handle file service errors", async () => {
      const error = new Error("File read error");
      mockFileService.readData.mockRejectedValue(error);

      await getItems(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe("getItemById", () => {
    beforeEach(() => {
      mockFileService.readData.mockResolvedValue([...mockItems]);
    });

    it("should return item when valid id is provided", async () => {
      mockReq.params.id = "1";

      await getItemById(mockReq, mockRes, mockNext);

      expect(mockFileService.readData).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith(mockItems[0]);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 404 error when item is not found", async () => {
      mockReq.params.id = "999";

      await getItemById(mockReq, mockRes, mockNext);

      expect(mockFileService.readData).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Item not found",
          status: 404,
        })
      );
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("should handle string id parameter by converting to number", async () => {
      mockReq.params.id = "2";

      await getItemById(mockReq, mockRes, mockNext);

      expect(mockFileService.readData).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith(mockItems[1]);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle file service errors", async () => {
      const error = new Error("File read error");
      mockFileService.readData.mockRejectedValue(error);
      mockReq.params.id = "1";

      await getItemById(mockReq, mockRes, mockNext);

      expect(mockFileService.readData).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe("addItem", () => {
    const validItem = {
      name: "New Item",
      category: "Test Category",
      price: 29.99,
    };

    let dateNowSpy;

    beforeEach(() => {
      mockFileService.readData.mockResolvedValue([...mockItems]);
      mockFileService.writeData.mockResolvedValue();

      // Mock Date.now() to return consistent timestamp
      dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(123456789);
    });

    afterEach(() => {
      if (dateNowSpy) {
        dateNowSpy.mockRestore();
      }
    });

    it("should add valid item and return it with generated id", async () => {
      mockReq.body = { ...validItem };

      await addItem(mockReq, mockRes, mockNext);

      const expectedItem = { ...validItem, id: 123456789 };
      const expectedData = [...mockItems, expectedItem];

      expect(mockFileService.readData).toHaveBeenCalledTimes(1);
      expect(mockFileService.writeData).toHaveBeenCalledWith(expectedData);
      expect(mockCache.clear).toHaveBeenCalledWith("stats");
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expectedItem);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject item with missing name", async () => {
      mockReq.body = { category: "Test", price: 10 };

      await addItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid item 'name'",
          status: 400,
        })
      );
      expect(mockFileService.readData).not.toHaveBeenCalled();
      expect(mockFileService.writeData).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("should reject item with non string name", async () => {
      mockReq.body = { name: 123, category: "Test", price: 10 };

      await addItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid item 'name'",
          status: 400,
        })
      );
      expect(mockFileService.readData).not.toHaveBeenCalled();
      expect(mockFileService.writeData).not.toHaveBeenCalled();
    });

    it("should reject item with missing category", async () => {
      mockReq.body = { name: "Test Item", price: 10 };

      await addItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid item 'category'",
          status: 400,
        })
      );
      expect(mockFileService.readData).not.toHaveBeenCalled();
      expect(mockFileService.writeData).not.toHaveBeenCalled();
    });

    it("should reject item with non-string category", async () => {
      mockReq.body = { name: "Test Item", category: 123, price: 10 };

      await addItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid item 'category'",
          status: 400,
        })
      );
      expect(mockFileService.readData).not.toHaveBeenCalled();
      expect(mockFileService.writeData).not.toHaveBeenCalled();
    });

    it("should reject item with missing price", async () => {
      mockReq.body = { name: "Test Item", category: "Test" };

      await addItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid item 'price'",
          status: 400,
        })
      );
      expect(mockFileService.readData).not.toHaveBeenCalled();
      expect(mockFileService.writeData).not.toHaveBeenCalled();
    });

    it("should reject item with non numeric price", async () => {
      mockReq.body = { name: "Test Item", category: "Test", price: "invalid" };

      await addItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid item 'price'",
          status: 400,
        })
      );
      expect(mockFileService.readData).not.toHaveBeenCalled();
      expect(mockFileService.writeData).not.toHaveBeenCalled();
    });

    it("should reject item with negative price", async () => {
      mockReq.body = { name: "Test Item", category: "Test", price: -10 };

      await addItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid item 'price'",
          status: 400,
        })
      );
      expect(mockFileService.readData).not.toHaveBeenCalled();
      expect(mockFileService.writeData).not.toHaveBeenCalled();
    });

    it("should accept item with price of 0", async () => {
      mockReq.body = { name: "Free Item", category: "Test", price: 0 };

      await addItem(mockReq, mockRes, mockNext);

      const expectedItem = { ...mockReq.body, id: 123456789 };

      expect(mockFileService.readData).toHaveBeenCalledTimes(1);
      expect(mockFileService.writeData).toHaveBeenCalledTimes(1);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expectedItem);
    });

    it("should reject null or undefined item", async () => {
      mockReq.body = null;

      await addItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid item",
          status: 400,
        })
      );
      expect(mockFileService.readData).not.toHaveBeenCalled();
      expect(mockFileService.writeData).not.toHaveBeenCalled();
    });

    it("should reject non-object item", async () => {
      mockReq.body = "not an object";

      await addItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid item",
          status: 400,
        })
      );
      expect(mockFileService.readData).not.toHaveBeenCalled();
      expect(mockFileService.writeData).not.toHaveBeenCalled();
    });

    it("should handle file service read errors", async () => {
      const error = new Error("File read error");
      mockFileService.readData.mockRejectedValue(error);
      mockReq.body = { ...validItem };

      await addItem(mockReq, mockRes, mockNext);

      expect(mockFileService.readData).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockFileService.writeData).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("should handle file service write errors", async () => {
      const error = new Error("File write error");
      mockFileService.writeData.mockRejectedValue(error);
      mockReq.body = { ...validItem };

      await addItem(mockReq, mockRes, mockNext);

      expect(mockFileService.readData).toHaveBeenCalledTimes(1);
      expect(mockFileService.writeData).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("should clear stats cache after successful addition", async () => {
      mockReq.body = { ...validItem };

      await addItem(mockReq, mockRes, mockNext);

      expect(mockCache.clear).toHaveBeenCalledWith("stats");
    });

    it("should not clear cache if validation fails", async () => {
      mockReq.body = { name: "Invalid", category: "Test" }; // Missing price

      await addItem(mockReq, mockRes, mockNext);

      expect(mockCache.clear).not.toHaveBeenCalled();
    });

    it("should not clear cache if file operations fail", async () => {
      const error = new Error("File write error");
      mockFileService.writeData.mockRejectedValue(error);
      mockReq.body = { ...validItem };

      await addItem(mockReq, mockRes, mockNext);

      expect(mockCache.clear).not.toHaveBeenCalled();
    });
  });
});
