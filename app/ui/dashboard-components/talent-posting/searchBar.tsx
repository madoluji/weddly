"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useSearchParams, usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const SearchBar = () => {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const { replace } = useRouter();
  const router = useRouter();

  const handlePush = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchUrl = `/search/talent?talentName=${searchParams.get("talentName")}`;
    router.push(searchUrl);
  };

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set("talentName", term);
    } else {
      params.delete("talentName");
    }
    const newUrl =
      pathName + (params.toString() ? `?${params.toString()}` : "");
    replace(newUrl);
  };
  return (
    <form onSubmit={handlePush}>
      <div className="relative ">
        <label htmlFor="search"></label>
        <input
          type="search"
          name="search"
          placeholder="Search Wedding Planners/Coordinators"
          className="w-full border border-primary-300 block bg-white rounded-2xl py-3 pl-12 pr-4 outline-none text-success-600 placeholder:text-success-600/60 focus:ring-2 focus:ring-primary-400/70 focus:border-primary-500"
          onChange={(e) => {
            handleSearch(e.target.value);
          }}
          defaultValue={searchParams.get("query")?.toString()}
        />
        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-[20px] w-[20px] -translate-y-1/2 text-primary-700" />
      </div>
    </form>
  );
};

export default SearchBar;
