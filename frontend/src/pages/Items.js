import React, { useEffect, useState } from "react";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";

const PAGE_LIMIT = 2;

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

  console.log(currPage, items.length);

  return (
    <ul>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
      />
      {loadingResults ? <p>Loading...</p> : <ItemList items={items} />}
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
