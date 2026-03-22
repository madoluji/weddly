const ChatListSkeleton = () => {
  const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return (
    <div className="  h-full relative  animate-pulse overflow-hidden rounded-2xl  shadow-[0_10px_20px_rgba(228,228,228,_0.7)]  border-r-2 ">
      {/* <!-- search compt --> */}

      <div className="border-b-2  py-4 px-2">
        <div className="py-2 h-12 bg-slate-200 px-2  border-gray-200 rounded-2xl w-full" />
      </div>
      {/* <!-- end search compt --> */}

      {/* <!-- user list --> */}
      <div className=" h-full  overflow-scroll">
        <div className=" flex flex-col">
          {array.map((user) => (
            <div
              key={user}
              className="flex flex-row py-2 px-2 justify-center hover:bg-gray-200 items-center border-b-2"
            >
              {" "}
              {/* Moved key prop here */}
              <div className="w-1/4">
                <div className="object-cover bg-slate-200 h-12 w-12 rounded-full" />
              </div>
              <div className="w-[80%] relative flex flex-col gap-2">
                <div className="text-lg font-semibold h-5 w-10 bg-slate-200 rounded-md" />
                <div className="text-sm w-[80%] h-2 bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* <!-- end user list --> */}
    </div>
  );
};

export default ChatListSkeleton;
