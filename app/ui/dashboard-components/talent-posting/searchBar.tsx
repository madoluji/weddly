"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useSearchParams, usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const SearchBar = () => {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const { replace } = useRouter();

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
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(26,44,35,0.06)]">
        <div className="relative">
        <label htmlFor="search"></label>
        <input
          type="search"
          name="search"
          placeholder="Search Wedding Planners/Coordinators"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-700 outline-none placeholder:text-slate-400 transition focus:border-primary-300 focus:bg-white"
          onChange={(e) => {
            handleSearch(e.target.value);
          }}
          defaultValue={searchParams.get("talentName")?.toString()}
        />
        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-[20px] w-[20px] -translate-y-1/2 text-primary-700" />
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
