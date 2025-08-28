import React, { useEffect } from "react";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";

function Items() {
  const { items, fetchItems } = useData();

  useEffect(() => {
    const abortController = new AbortController();

    fetchItems(abortController.signal).catch((err) => {
      if (err !== "AbortError") console.error(err);
    });

    return () => {
      abortController.abort("component unmounted");
    };
  }, []);

  if (!items.length) return <p>Loading...</p>;

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
