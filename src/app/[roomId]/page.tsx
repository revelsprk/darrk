"use client"
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp, doc, deleteDoc, getDocs, getDoc, updateDoc } from "firebase/firestore";
import { usePathname } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { FiPlus, FiTrash } from "react-icons/fi";
import Avatar from "@/components/ui/Avatar";
import { marked } from "marked";
import VoteModal from "@/components/VoteModal";
import Image from "next/image";
import { FaHeart, FaReply } from "react-icons/fa";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import CuisineRoulette from "@/components/CuisineRoulette";

interface Message {
  id: string;
  text: string;
  createdAt: Timestamp;
  username: string;
  likes: number;
  replyTo: string | null;
}

interface Vote {
  id: string;
  question: string;
  options: string[];
  createdAt: Timestamp;
  votes: number[];
}

const stamps = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export default function RoomPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const roomId = pathname.split("/").pop();
  const [roomName, setRoomName] = useState("");
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [voteQuestion, setVoteQuestion] = useState("");
  const [voteOptions, setVoteOptions] = useState<string[]>(["", ""]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isSmileDropdownOpen, setIsSmileDropdownOpen] = useState(false);
  const [selectedReplyMessageId, setSelectedReplyMessageId] = useState<string | null>(null);
  const [expandedVotes, setExpandedVotes] = useState<{ [key: string]: boolean }>({});
  const [selectedReplyMessage, setSelectedReplyMessage] = useState<Message | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const smileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        isDropdownOpen
      ) {
        setIsDropdownOpen(false);
      }
  
      if (
        smileDropdownRef.current &&
        !smileDropdownRef.current.contains(event.target as Node) &&
        isSmileDropdownOpen
      ) {
        setIsSmileDropdownOpen(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isSmileDropdownOpen]);

  useEffect(() => {
    if (!roomId) return;
    const votesQuery = query(
      collection(db, "rooms", roomId, "votes"),
      orderBy("createdAt")
    );
  
    onSnapshot(votesQuery, (querySnapshot) => {
      const voteList: Vote[] = querySnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() } as Vote;
      });      
      setVotes(voteList);
    });
  }, [roomId]);
  
  
  const handleVote = async (voteId: string, optionIndex: number) => {
    if (!roomId) {
      console.error("roomId is undefined");
      return;
    }
  
    const voteRef = doc(db, "rooms", roomId, "votes", voteId);
    const voteSnapshot = await getDoc(voteRef);
  
    if (voteSnapshot.exists()) {
      const updatedVotes = voteSnapshot.data().votes;
      updatedVotes[optionIndex] += 1;
  
      await updateDoc(voteRef, { votes: updatedVotes });
    }
  };  

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUsername(e.target.value);
  };

  useEffect(() => {
    const fetchMessages = () => {
      if (!roomId) return;
      const messagesQuery = query(
        collection(db, "rooms", roomId, "messages"),
        orderBy("createdAt")
      );

      onSnapshot(messagesQuery, (querySnapshot) => {
        const messageList: Message[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text,
            createdAt: data.createdAt,
            username: data.username,
            likes: data.likes || 0, 
            replyTo: data.replyTo || null,
          };
        });
        setMessages(messageList.reverse());
      });
    };

    if (roomId) {
      fetchMessages();
    }
  }, [roomId]);

  useEffect(() => {
    const fetchRoomName = async () => {
      if (!roomId) return;
      try {
        const roomRef = doc(db, "rooms", roomId);
        const roomSnapshot = await getDoc(roomRef);
        if (roomSnapshot.exists()) {
          setRoomName(roomSnapshot.data().name);
        }
      } catch (error) {
        console.error("Error fetching room name: ", error);
      }
    };
  
    if (roomId) {
      fetchRoomName();
    }
  }, [roomId]);

  const sendMessage = async () => {
    if (!message || !roomId || !username) return;
  
    try {
      const messageData: Message = {
        id: "",
        text: message,
        createdAt: Timestamp.fromDate(new Date()),
        username: username,
        likes: 0,
        replyTo: selectedReplyMessageId || null,
      };
  
      if (selectedReplyMessageId) {
        messageData.replyTo = selectedReplyMessageId;
      }
  
      await addDoc(collection(db, "rooms", roomId, "messages"), messageData);
      setMessage("");  // メッセージをクリア
      setSelectedReplyMessageId(null);  // 送信後、リプライ元をリセット
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };    

  const formatRelativeTime = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const deleteRoom = async () => {
    if (!roomId) return;

    const isConfirmed = window.confirm("本当にコミュニティを削除しますか？この操作は元に戻せません。");
    if (!isConfirmed) {
      return;
    }

    try {
      const messagesRef = collection(db, "rooms", roomId, "messages");
      const messageSnapshot = await getDocs(messagesRef);
      messageSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      await deleteDoc(doc(db, "rooms", roomId));
      console.log("Room deleted successfully");
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting room: ", error);
    }
  };

  const createVote = async () => {
    if (!voteQuestion || voteOptions.some((opt) => opt === "") || !roomId) return;  // Check if roomId is defined
  
    try {
      await addDoc(collection(db, "rooms", roomId, "votes"), {
        question: voteQuestion,
        options: voteOptions,
        createdAt: new Date(),
        votes: new Array(voteOptions.length).fill(0),  // Initial vote count for each option is 0
      });
  
      setVoteQuestion("");
      setVoteOptions(["", ""]);
      setIsVoteModalOpen(false);
    } catch (error) {
      console.error("Error creating vote: ", error);
    }
  };  

  const deleteVote = async (voteId: string) => {
    if (!roomId) return;
    const isConfirmed = window.confirm("本当に投票を削除しますか？この操作は元に戻せません。");
    if (!isConfirmed) {
      return;
    }
    try {
      const voteRef = doc(db, "rooms", roomId, "votes", voteId);
      await deleteDoc(voteRef);
      console.log("Vote deleted successfully");
    } catch (error) {
      console.error("Error deleting vote: ", error);
    }
  };

  const handleStampClick = (stamp: string) => {
    setMessage(`:stamp_${stamp}`);
  };

  const handleLike = async (messageId: string, currentLikes: number) => {
    if (!roomId) return;
  
    const messageRef = doc(db, "rooms", roomId, "messages", messageId);
  
    try {
      await updateDoc(messageRef, {
        likes: currentLikes + 1,
      });
    } catch (error) {
      console.error("Error updating likes: ", error);
    }
  };

  const handleReply = (messageId: string) => {
    setSelectedReplyMessageId(messageId);
  };  

  const toggleExpand = (voteId: string) => {
    setExpandedVotes((prevState) => ({
      ...prevState,
      [voteId]: !prevState[voteId],
    }));
  };

  return (
    <div>
      {/* Header */}
      <div className="px-8 flex items-center select-none h-16 bg-white z-50 border-b sticky top-0">
        <Link href="/"><h1 className="font-bold text-xl bg-gradient-to-r from-red-400 to-blue-400 text-transparent bg-clip-text font-bold text-3xl dot">江差家真.com</h1></Link>
      <div className="ml-auto relative z-10">
          <Button variant="outline" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>設定</Button>
          <div ref={dropdownRef} className={`absolute right-0 mt-2 w-64 bg-white rounded-md special-shadow p-2 transition-all duration-200 ease-in-out ${ isDropdownOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}>
            <Button onClick={() => setIsVoteModalOpen(true)} size="sm" variant="text" icon={<FiPlus />} className="rounded-none w-full font-normal">投票を作成する</Button>
            <Button onClick={deleteRoom} variant="text" size="sm" icon={<FiTrash />} className="rounded-none w-full font-normal">コミュニティを削除する</Button>
          </div>
        </div>
      </div>

    <CuisineRoulette />

      {votes.length > 0 && (<div className="space-y-4 mb-8 hidden md:block max-w-64 fixed w-full top-24 right-8">
              {votes.map((vote) => (
                <div key={vote.id} className="p-4 rounded-md bg-white shadow-sm border">
                  <div className="flex items-center mb-4">
                    <h3>{vote.question}</h3>
                    <div className="flex items-center ml-auto">
                      <Button  onClick={() => deleteVote(vote.id)} variant="danger" size="sm" className="mr-2">削除</Button>
                      </div>
                  </div>
                  <div className="space-y-4">
                    {vote.options.map((option: string, index: number) => {
                      const totalVotes = vote.votes.reduce((a, b) => a + b, 0);
                      const hasVotes = totalVotes > 0;
                      return (
                        <div key={index} className="space-y-2 select-none">
                          <div className="flex items-center">
                            <p>{option}</p>
                            <span className="ml-2 text-sm text-gray-400">{`(${vote.votes[index]})`}</span>
                          </div>
                          <button
                            onClick={() => handleVote(vote.id, index)}
                            className="w-full h-8 rounded-md relative overflow-hidden bg-gray-50 shadow-inner"
                          >
                            <div
                              className={`absolute inset-0 ${hasVotes ? 'bg-blue-400' : 'bg-gray-50'}`}
                              style={{
                                width: hasVotes
                                  ? `${Math.round((vote.votes[index] / totalVotes) * 100)}%`
                                  : '0%',
                              }}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>)}

      {/* Body */}
      <div className="py-4 md:py-8 px-4 md:px-0 md:max-w-md w-full mx-auto">
            {votes.length > 0 && (<div className="space-y-4 mb-8 md:hidden">
              {votes.map((vote) => (
                <div key={vote.id} className="p-4 rounded-md bg-white shadow-sm border border-zinc-200">
                  <div className="flex items-center">
                    <h3>{vote.question}</h3>
                    <div className="flex items-center ml-auto">
                      <Button  onClick={() => deleteVote(vote.id)} variant="danger" size="sm" className="mr-2">削除</Button>
                      <Button size="sm" variant="outline" onClick={() => toggleExpand(vote.id)}>{expandedVotes[vote.id] ? '縮小' : '拡大'}</Button>
                      </div>
                  </div>
                  {expandedVotes[vote.id] && (
                  <div className="space-y-4 mt-4">
                    {vote.options.map((option: string, index: number) => {
                      const totalVotes = vote.votes.reduce((a, b) => a + b, 0);
                      const hasVotes = totalVotes > 0;
                      return (
                        <div key={index} className="space-y-2 select-none">
                          <div className="flex items-center">
                            <p>{option}</p>
                            <span className="ml-2 text-sm text-gray-400">{`(${vote.votes[index]})`}</span>
                          </div>
                          <button
                            onClick={() => handleVote(vote.id, index)}
                            className="w-full h-8 rounded-md relative overflow-hidden bg-gray-50 shadow-inner"
                          >
                            <div
                              className={`absolute inset-0 ${hasVotes ? 'bg-blue-400' : 'bg-gray-50'}`}
                              style={{
                                width: hasVotes
                                  ? `${Math.round((vote.votes[index] / totalVotes) * 100)}%`
                                  : '0%',
                              }}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  )}
                </div>
              ))}
            </div>)}

          <div className="flex flex-col">
            {selectedReplyMessageId && (
              <div className="p-2 rounded-md shadow-sm border-l-4 border-blue-600 mb-4 flex items-center w-full bg-white">
                  <div className="flex w-fit">
                    <p className="text-sm text-zinc-600 mr-2 whitespace-nowrap">リプライ:</p>
                    {messages.find((m) => m.id === selectedReplyMessageId)?.text && (
                      <p className="text-sm text-zinc-600 mr-2 line-clamp-2">
                        {messages.find((m) => m.id === selectedReplyMessageId)?.text}
                      </p>
                    )}
                  </div>
                <Button className="ml-auto" variant="danger" size="sm" onClick={() => setSelectedReplyMessageId(null)}>解除</Button>
              </div>
            )}
            <div className="flex items-center w-full">
              <div className="w-full">
                <Input type="text" value={username} onChange={handleUsernameChange} placeholder="名無しさん@おーぶん" />
              </div>
              <div className="ml-auto flex items-center">
                <div className="relative mx-2">
                  <Button variant="outline" onClick={() => setIsSmileDropdownOpen(!isSmileDropdownOpen)}>スタンプ</Button>
                  <div ref={smileDropdownRef} className={`flex flex-wrap gap-2 absolute z-10 mt-2 right-0 w-64 bg-white rounded-md special-shadow p-2 transition-all duration-200 ease-in-out ${ isSmileDropdownOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}>
                    {stamps.map((stamp) => (<button key={stamp} onClick={() => handleStampClick(stamp)} className="w-10 h-10 aspect-square hover:bg-zinc-200 duration-200 bg-white flex items-center justify-center"><Image src={`/stamps/${stamp}.png`} alt={stamp} width={100} height={100} className="w-auto h-8" /></button>))}
                  </div>
                </div>
                <Button onClick={sendMessage}>送信</Button>
              </div>
            </div>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="mt-2 resize-none flex items-center p-4 overflow-hidden rounded-md border shadow-sm bg-white border-zinc-200 focus:ring-2 focus:border-blue-400 focus:ring-blue-50 duration-200 outline-none" placeholder="メッセージを入力してください" rows={2}/>
            </div>

            <h2 className="text-xl mt-8 mb-4">{roomName || "Loading..."}</h2>

        <div className="space-y-4 flex flex-col">
          {messages.length > 0 ? (
            messages.map((msg, index) => {
              const formattedText = msg.text.replace(/:stamp_([a-zA-Z0-9_]+)/g, (match, stamp) => {
                return `<div class="max-h-16"><img src="/stamps/${stamp}.png" alt="stamp" class="h-16" /></div>`;
              });

              return (
                <div key={index} className="p-4 bg-white shadow-sm border border-zinc-200 rounded-md flex flex-col">
                  <div className="flex items-center mb-2">
                    <Avatar name={msg.username} />
                    <p className="text-sm font-bold mx-2 line-clamp-1">{msg.username}</p>
                    <p className="text-sm text-zinc-400 whitespace-nowrap">{formatRelativeTime(msg.createdAt)}</p>
                  </div>

                  {msg.replyTo && (
                      <button className="p-2 rounded-sm shadow-sm border-l-4 border-blue-600 mb-2 flex bg-zinc-50" onClick={() => {
                        const replyMessage = messages.find((m) => m.id === msg.replyTo);
                        if (replyMessage) {
                          setSelectedReplyMessage(replyMessage);
                          setIsReplyModalOpen(true);
                        }
                      }}>
                        <p className="text-sm text-zinc-600 mr-2 whitespace-nowrap">リプライ:</p>
                        {messages.find((m) => m.id === msg.replyTo)?.text && (
                          <p className="text-sm text-zinc-600 text-left line-clamp-2">{messages.find((m) => m.id === msg.replyTo)?.text}</p>
                        )}
                      </button>
                    )}
                  <div
                    className="md flex flex-col whitespace-pre-wrap overflow-x-hidden"
                    dangerouslySetInnerHTML={{ __html: marked(formattedText) }}
                  />

                  <div className="mt-2 flex items-center">
                    <button onClick={() => handleLike(msg.id, msg.likes)} className="w-fit flex items-center text-sm text-zinc-200 hover:text-red-400 duration-200">
                      <FaHeart className="mr-0.5" />
                      <p>{msg.likes}</p>
                    </button>
                    {/* リプライ */}
                    <button className="ml-auto text-sm text-zinc-200 hover:text-blue-400 duration-200" onClick={() => handleReply(msg.id)}>
                      <FaReply  />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-zinc-400">
              <p>No messages available.</p>
            </div>
          )}
        </div>
        </div>

    {isReplyModalOpen && selectedReplyMessage && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur z-50">
        <div className="bg-white rounded-md p-4 md:w-1/4 w-3/4">
          <div>
            <div className="flex items-center mb-2">
              <Avatar name={selectedReplyMessage.username} />
              <p className="text-sm font-bold mx-2 line-clamp-1">{selectedReplyMessage.username}</p>
              <p className="text-sm text-zinc-400 whitespace-nowrap">{formatRelativeTime(selectedReplyMessage.createdAt)}</p>
            </div>
            <p className="my-4 text-sm text-zinc-600">{selectedReplyMessage.text}</p>
          </div>
          <Button className="ml-auto" onClick={() => setIsReplyModalOpen(false)} variant="secondary" size="sm">閉じる</Button>
        </div>
      </div>
    )}

      <VoteModal  isOpen={isVoteModalOpen}  closeModal={() => setIsVoteModalOpen(false)}  voteQuestion={voteQuestion}  setVoteQuestion={setVoteQuestion}  voteOptions={voteOptions}  setVoteOptions={setVoteOptions}  createVote={createVote} />
    </div>
  );
}