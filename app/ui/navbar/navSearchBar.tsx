"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SearchInput = () => {
  const searchParams = useSearchParams(); // Retrieve search parameters from the URL
  const pathname = usePathname(); // Get the current path from the Next.js router
  const { replace } = useRouter(); // Function to replace the current URL
  const router = useRouter(); // Next.js router instance

  // Function to handle search input and update the URL based on the search term
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set("title", term); // Set the search term if provided
    } else {
      params.delete("title"); // Remove search param if the term is empty
    }
    const newUrl =
      pathname + (params.toString() ? `?${params.toString()}` : "");
    replace(newUrl); // Update the URL without refreshing the page
  };
  const handlePush = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchUrl = `/search/jobs?title=${searchParams.get("title")}`;
    router.push(searchUrl);
  };
  return (
    <form onSubmit={handlePush} className="w-full max-w-[480px] min-w-0">
      <div className="relative">
        <label htmlFor="search"></label>
        <input
          type="search"
          name="search"
          placeholder="Find your next Wedding Gig"
          className="w-full border border-primary-300 block bg-white rounded-2xl py-[10px] pl-11 pr-4 outline-none text-success-600 placeholder:text-success-600/60 focus:ring-2 focus:ring-primary-400/70 focus:border-primary-500"
          onChange={(e) => {
            handleSearch(e.target.value); // Trigger search when input changes
          }}
          defaultValue={searchParams.get("query")?.toString() || ""} // Set default value if there's an existing query
        />
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-[20px] w-[20px] -translate-y-1/2 text-primary-700" />
      </div>
    </form>
  );
};

export default SearchInput;
