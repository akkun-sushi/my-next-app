"use client";

import React, { useState } from "react";
import { Data, IsDeleting, IsEditing, SortType } from "@/app/types";
import Link from "next/link";
import AddWord from "@/app/components/CreateList/AddWords";
import SortWord from "@/app/components/CreateList/SortWord";
import EditWord from "@/app/components/CreateList/EditWord";
import DeleteWord from "@/app/components/CreateList/DeleteWord";
import WordCard from "@/app/components/CreateList/WordCard";

const CreateList = () => {
  const [data, setData] = useState<Data[]>([]);
  const [sortType, setSortType] = useState<SortType>("CREATION_ASC");
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<IsEditing>("NULL");
  const [isDeleting, setIsDeleting] = useState<IsDeleting>("NULL");

  const props = {
    data,
    setData,
    sortType,
    setSortType,
    isAdding,
    setIsAdding,
    isEditing,
    setIsEditing,
    isDeleting,
    setIsDeleting,
  };

  return (
    <main className="flex flex-col items-center min-h-screen w-screen bg-blue-200 py-8 overflow-x-hidden">
      <Link
        href="/"
        className="text-xl md:text-3xl w-full text-left font-bold text-black hover:text-red-500 ml-16 md:ml-72 -mt-4 -mb-4 md:-mb-6"
      >
        戻る
      </Link>
      <h1 className="text-4xl font-bold text-black">単語リスト</h1>
      <div className="bg-white w-3/4 max-w-6xl shadow-lg rounded-lg mt-5 px-4 py-4 md:mt-10 md:py-6">
        <AddWord {...props} />
      </div>
      <div className="bg-white w-3/4 max-w-6xl shadow-lg rounded-lg flex flex-col mt-5 py-4 md:mt-10 md:px-10 md:py-8">
        <SortWord {...props} />
        <div className="flex flex-row mx-4 md:mx-20 md: mt-5">
          <EditWord {...props} />
          <DeleteWord {...props} />
        </div>
      </div>
      <div className="bg-white w-3/4 max-w-6xl shadow-lg rounded-lg mt-5 pl-12 md:pl-14 py-4 md:mt-10">
        {data.length > 0 ? (
          <ol className="text-2xl list-decimal">
            {data.map((item) => (
              <li key={item.id} className="my-4">
                <WordCard {...item} {...props} />
              </li>
            ))}
          </ol>
        ) : (
          <h3 className="text-2xl mr-12 text-center">データがありません</h3>
        )}
      </div>
    </main>
  );
};

export default CreateList;
