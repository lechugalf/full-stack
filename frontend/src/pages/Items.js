import React, { useEffect, useState, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";

const PAGE_LIMIT = 10;

function Items() {
  const [loadingResults, setLoadingResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currPage, setCurrPage] = useState(1);

  const { items, fetchItems } = useData();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const abortController = new AbortController();

    setLoadingResults(true);

    fetchItems(debouncedQuery, currPage, PAGE_LIMIT, abortController.signal)
      .catch((err) => {
        if (err !== "AbortError") console.error(err);
      })
      .finally(() => {
        setLoadingResults(false);
      });

    return () => {
      abortController.abort("component unmounted");
    };
  }, [fetchItems, debouncedQuery, currPage]);

  const parentRef = useRef();

  // virtualizer setup
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // approximate height of each item
    overscan: 2,
  });

  return (
    <div className="max-w-xl mx-auto p-4">
      <input
        placeholder="Buscar"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 mb-4 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg"
      />
      {loadingResults ? (
        <p className="text-center text-blue-400">Loading...</p>
      ) : (
        <div
          ref={parentRef}
          style={{
            height: "200px",
            overflow: "auto",
          }}
          className="h-64 overflow-auto border border-blue-100 rounded-lg "
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = items[virtualRow.index];
              return (
                <div
                  key={item.id}
                  ref={virtualRow.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                    padding: "8px",
                    boxSizing: "border-box",
                    borderBottom: "1px solid #eee",
                  }}
                  className="px-3 py-2 border-b border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  <Link to={"/items/" + item.id}>{item.name}</Link>
                </div>
              );
            })}
            {items.length === 0 && (
              <p className="w-full text-center p-6 text-neutral-500">
                Not found results
              </p>
            )}
          </div>
        </div>
      )}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => currPage > 1 && setCurrPage(currPage - 1)}
          className="px-4 py-2 bg-blue-200 text-blue-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currPage === 1}
        >
          Previous
        </button>
        <button
          onClick={() =>
            items.length === PAGE_LIMIT && setCurrPage(currPage + 1)
          }
          className="px-4 py-2 bg-blue-200 text-blue-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={items.length < PAGE_LIMIT}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Items;
