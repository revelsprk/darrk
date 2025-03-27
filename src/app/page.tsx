"use client"
import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import { FiPlus, FiSearch } from "react-icons/fi";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Room {
  id: string;
  name: string;
}

export default function Home() {
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "rooms"), (querySnapshot) => {
      const roomList: Room[] = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          name: doc.data().name,
        };
      });
      setRooms(roomList);
      setFilteredRooms(roomList); // Initially set filteredRooms to all rooms
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRooms(rooms); // If search query is empty, show all rooms
    } else {
      const filtered = rooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) || room.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRooms(filtered);
    }
  }, [searchQuery, rooms]);

  const createRoom = async () => {
    if (!roomName || !roomId) return;

    const validRoomId = /^[a-zA-Z0-9_.-]+$/.test(roomId);
    if (!validRoomId) {
      setErrorMessage("無効なルームIDです。使用できるのは、文字、数字、'-'、'_'、および '.' のみです。");
      return;
    }

    if (roomId.length > 10) {
      setErrorMessage("ルームIDは10文字を超えてはいけません。");
      return;
    }

    setErrorMessage("");

    try {
      const roomRef = doc(db, "rooms", roomId.toLowerCase());
      await setDoc(roomRef, { name: roomName });
      setRoomName("");
      setRoomId("");
      setShowModal(false);
    } catch (error) {
      console.error("Error creating room: ", error);
    }
  };

  return (
    <div>
      <div className="px-8 flex items-center justify-center select-none h-16 bg-white sticky top-0 z-50 shadow-md">
      <Link href="/"><div className="h-6"><Image src="/mediakit/logotype.svg" alt="Logo" width={100} height={100} className="h-6 w-fit" /></div></Link>
      </div>

      <div className="md:container mx-auto px-4 md:px-0 py-8">
          <Input placeholder="コミュニティを検索する" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon={<FiSearch />} />

        {/* Message when no communities found */}
        {filteredRooms.length === 0 && (
          <div className="mt-8 flex items-center justify-center">
            <p className="text-gray-400">コミュニティが見つかりませんでした。</p>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
          {filteredRooms.length > 0 && filteredRooms.map((room, index) => (
            <div key={index} className="flex flex-row md:flex-col rounded-md shadow-sm bg-white overflow-hidden hover:shadow-md duration-200 hover:translate-y-[-8px] h-16 md:h-auto">
              <img src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${room.id}&backgroundColor=e5e7eb&eyesColor=9ca3af&mouthColor=9ca3af&shapeColor=transparent`} className="md:h-32 h-16 md:w-full bg-gray-200 w-16" />
              <div className="flex items-center md:items-start w-full p-4">
                <p className="text-lg line-clamp-2 mr-4 font-bold">{room.name}</p>
                <div className="ml-auto">
                  <Link href={`/${room.id}`}><p className="px-4 py-2 rounded-md font-bold bg-gray-800 text-white whitespace-nowrap">参加</p></Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed right-8 bottom-8">
        <Button icon={<FiPlus />} onClick={() => setShowModal(true)} variant="secondary" className="shadow-md">コミュニティを新規作成</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur">
          <div className="bg-white p-6 rounded-md w-3/4 md:w-1/4">
            <h1 className="text-xl mb-4 font-bold">コミュニティを新規作成</h1>
            <Input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="mb-2 w-full"
              placeholder="ルームの名前"
            />
            <Input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toLowerCase())}
              className="mb-4 w-full"
              placeholder="識別ID"
            />

            {errorMessage && <p className="text-red-400 text-sm mb-4">{errorMessage}</p>}

            <div className="flex items-center justify-end">
              <Button onClick={() => setShowModal(false)} variant="secondary" className="mr-2">
                キャンセル
              </Button>
              <Button onClick={createRoom}>作成</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}