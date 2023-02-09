import Link from "next/link";
import BoardView from "../../components/BoardView";

const BoardPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] p-4">
      <Link legacyBehavior href="/">
        <a className="text-white">← Back to home</a>
      </Link>
      <BoardView />
    </div>
  );
};

export default BoardPage;
