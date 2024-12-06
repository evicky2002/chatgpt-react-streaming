import { useEffect, useState, ChangeEvent, KeyboardEvent } from "react";

interface HistoryItem {
  prompt: string;
  result: string;
}

function App() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isPromptActive, setIsPromptActive] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [data, setData] = useState<string>("");

  const fetchStream = async () => {
    const response = await fetch("/text");
    const decoder = new TextDecoder("utf-8");
    const reader = response.body?.getReader();
    let accumulatedData = "";

    if (!reader) return;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      accumulatedData += decoder.decode(value, { stream: true });
      setData(accumulatedData);
    }

    accumulatedData += decoder.decode();
    setIsPromptActive(false);
    setHistory((prev) => [
      ...prev,
      { prompt: currentPrompt, result: accumulatedData },
    ]);
    setData("");
  };

  useEffect(() => {
    if (isPromptActive) {
      fetchStream();
    }
  }, [isPromptActive]);

  const onSubmitPrompt = (prompt: string) => {
    setIsPromptActive(true);
    setCurrentPrompt(prompt);
    setInputText("");
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputText.trim()) {
      onSubmitPrompt(inputText);
    }
  };

  return (
    <div className="h-screen bg-primary ">
      <div className="h-full flex flex-col justify-between p-4 gap-4 mx-auto w-2/3 overflow-hidden">
        <div className="text-white   h-full p-4 rounded-lg flex flex-col overflow-y-auto gap-8">
          {history.map((d) => (
            <Textbox prompt={d.prompt} result={d.result} />
          ))}
          {isPromptActive && <Textbox prompt={currentPrompt} result={data} />}
        </div>

        <div className="text-white   rounded-lg">
          <input
            type="text"
            className="w-full h-full focus:outline-none  p-4 border border-secondary bg-transparent"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Message"
          />
        </div>
      </div>
    </div>
  );
}

const Textbox = ({ prompt, result }: { prompt: string; result: string }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="self-end  bg-secondary p-4 px-8 ">
        <p className="w-fit">{prompt}</p>
      </div>
      <div className="w-fit bg-secondary p-4 px-8 ">{result}</div>
    </div>
  );
};

export default App;
