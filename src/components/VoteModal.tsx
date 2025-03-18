import Button from "./ui/Button";
import Input from "./ui/Input";

interface VoteModalProps {
  isOpen: boolean;
  closeModal: () => void;
  voteQuestion: string;
  setVoteQuestion: React.Dispatch<React.SetStateAction<string>>;
  voteOptions: string[];
  setVoteOptions: React.Dispatch<React.SetStateAction<string[]>>;
  createVote: () => void;
}

const VoteModal: React.FC<VoteModalProps> = ({ 
  isOpen, 
  closeModal, 
  voteQuestion, 
  setVoteQuestion, 
  voteOptions, 
  setVoteOptions, 
  createVote 
}) => {
  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur">
      <div className="bg-white p-6 rounded-sm w-3/4 md:w-1/4">
        <h2 className="text-xl font-normal mb-4">投票を作成する</h2>
        <Input
          type="text"
          value={voteQuestion}
          onChange={(e) => setVoteQuestion(e.target.value)}
          placeholder="質問を入力"
          className="mb-4 w-full"
        />
        {voteOptions.map((option, index) => (
          <Input
            key={index}
            type="text"
            value={option}
            onChange={(e) => {
              const updatedOptions = [...voteOptions];
              updatedOptions[index] = e.target.value;
              setVoteOptions(updatedOptions);
            }}
            placeholder={`選択肢 ${index + 1}`}
            className="mb-2"
          />
        ))}
        <button onClick={() => setVoteOptions([...voteOptions, ""])} className="text-zinc-400 mb-4 text-sm p-0">
          選択肢を追加
        </button>
        <div className="flex justify-end">
          <Button onClick={closeModal} variant="secondary" className="mr-2">
            キャンセル
          </Button>
          <Button onClick={createVote}>
            作成
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoteModal;