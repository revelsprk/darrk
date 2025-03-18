import { useState } from "react";
import Button from "./ui/Button";
import Image from "next/image";

export default function CuisineRoulette() {
    const foodImages = [
        "オニオンリング",
        "オムレツ",
        "ガパオライス",
        "カボチャスープ",
        "カルボナーラ",
        "キンパ",
        "グリーンアスパラガス",
        "コーンスープ",
        "ドリア",
        "トンカツ",
        "ナポリタン",
        "パンケーキ",
        "ペッパーランチ",
        "ペパロニピザ",
        "ペペロンチーノ",
        "ほうれん草とベーコンのパスタ",
        "ボロネーゼ",
        "ホワイトアスパラガス",
        "マカロニグラタン",
        "マルゲリータ",
        "ミートソースパスタ",
        "杏仁豆腐",
    ];

    const [selectedFood, setSelectedFood] = useState<string | null>(null);

    const getRandomFood = () => {
        const randomIndex = Math.floor(Math.random() * foodImages.length);
        const randomFood = foodImages[randomIndex];
        setSelectedFood(randomFood);
    };

    return (
        <div className="max-w-64 w-full fixed top-24 left-8 bg-white p-4 border border-zinc-200 shadow-sm hidden md:block">
            <p className="font-bold">おすすめ食べ物ルーレット</p>
            <p className="text-sm my-2 text-zinc-400">何を食べれば良いか分からない時に回してください。</p>
            <Button size="sm" onClick={getRandomFood}>回す</Button>
            {selectedFood && (
                <div className="mt-4 flex flex-col items-center">
                    <Image src={`/cuisine/${selectedFood}.svg`} alt={selectedFood} width={100} height={100} className="h-16 w-fit"/>
                    <p className="mt-2 text-sm text-zinc-400">{selectedFood}</p>
                </div>
            )}
        </div>
    );
}
