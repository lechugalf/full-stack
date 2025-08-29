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
    <ul>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className=""
      />
      {loadingResults ? (
        <p>Loading...</p>
      ) : (
        <div
          ref={parentRef}
          style={{
            height: "200px",
            overflow: "auto",
            border: "1px solid #ccc",
          }}
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
                >
                  <Link to={"/items/" + item.id}>{item.name}</Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <button onClick={() => currPage > 1 && setCurrPage(currPage - 1)}>
        Prev
      </button>
      <button
        onClick={() => items.length === PAGE_LIMIT && setCurrPage(currPage + 1)}
      >
        Next
      </button>
    </ul>
  );
}

function ItemList({ items = [] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <Link to={"/items/" + item.id}>{item.name}</Link>
        </li>
      ))}
    </ul>
  );
}

export default Items;
