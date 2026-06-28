import { useState } from "react";
import "./App.css";

function analyzeComplexity(code) {
  const lines = code.split("\n");
  let maxNesting = 0;
  let currentNesting = 0;
  let hasRecursion = false;
  let hasBinarySearch = false;
  let hasMergeSort = false;

  if (
    (code.includes("mid") || code.includes("middle")) &&
    (code.includes("left") || code.includes("low")) &&
    (code.includes("right") || code.includes("high"))
  ) {
    hasBinarySearch = true;
  }

  if (
    (code.includes("merge") || code.includes("mergeSort") || code.includes("merge_sort")) &&
    (code.includes("left") || code.includes("right") || code.includes("mid"))
  ) {
    hasMergeSort = true;
  }

  for (let line of lines) {
    const trimmed = line.trim().toLowerCase();

    const isLoop =
      trimmed.startsWith("for") ||
      trimmed.startsWith("while") ||
      trimmed.startsWith("do") ||
      trimmed.startsWith("foreach") ||
      trimmed.includes("for(") ||
      trimmed.includes("for (") ||
      trimmed.includes("while(") ||
      trimmed.includes("while (") ||
      trimmed.includes("for x in") ||
      trimmed.includes("for i in") ||
      trimmed.includes("for j in") ||
      trimmed.includes("for k in") ||
      trimmed.includes("for item in") ||
      trimmed.includes("for val in") ||
      trimmed.includes("for num in") ||
      trimmed.includes("for element in") ||
      trimmed.includes("foreach(") ||
      trimmed.includes("foreach (");

    if (isLoop) {
      currentNesting++;
      if (currentNesting > maxNesting) maxNesting = currentNesting;
    }

    if (
      trimmed === "}" ||
      trimmed === "})" ||
      trimmed === "};" ||
      trimmed.startsWith("end") ||
      trimmed.startsWith("done") ||
      trimmed.startsWith("endfor") ||
      trimmed.startsWith("endwhile")
    ) {
      currentNesting = Math.max(0, currentNesting - 1);
    }
  }

  const funcPatterns = [
    /function\s+(\w+)/,
    /def\s+(\w+)/,
    /void\s+(\w+)\s*\(/,
    /int\s+(\w+)\s*\(/,
    /string\s+(\w+)\s*\(/,
    /bool\s+(\w+)\s*\(/,
    /long\s+(\w+)\s*\(/,
    /double\s+(\w+)\s*\(/,
    /func\s+(\w+)/,
    /fn\s+(\w+)/,
    /fun\s+(\w+)/,
  ];

  for (let pattern of funcPatterns) {
    const match = code.match(pattern);
    if (match) {
      const funcName = match[1];
      const bodyWithoutDef = code.replace(match[0], "");
      if (bodyWithoutDef.includes(funcName + "(")) {
        hasRecursion = true;
        break;
      }
    }
  }

  if (hasMergeSort || (hasRecursion && maxNesting >= 1 && !hasBinarySearch)) {
    return {
      time: "O(n log n)",
      space: "O(n)",
      explanation: "Merge sort / divide and conquer pattern detected. Recursively splits and merges, giving O(n log n) time."
    };
  }

  if (hasRecursion) {
    return {
      time: "O(2^n)",
      space: "O(n)",
      explanation: "Recursive function detected. Each call branches into more calls, leading to exponential time complexity."
    };
  }

  if (hasBinarySearch) {
    return {
      time: "O(log n)",
      space: "O(1)",
      explanation: "Binary search pattern detected. The input is halved at each step, giving logarithmic complexity."
    };
  }

  if (maxNesting === 0) {
    return {
      time: "O(1)",
      space: "O(1)",
      explanation: "No loops or recursion found. The code runs in constant time regardless of input size."
    };
  }

  if (maxNesting === 1) {
    return {
      time: "O(n)",
      space: "O(1)",
      explanation: "Single loop detected. Time grows linearly with input size."
    };
  }

  if (maxNesting === 2) {
    return {
      time: "O(n²)",
      space: "O(1)",
      explanation: "Nested loops detected. Time grows quadratically. Common in bubble sort, selection sort."
    };
  }

  return {
    time: "O(n³)",
    space: "O(1)",
    explanation: "Triple nested loops detected. Time grows cubically — very slow for large inputs."
  };
}

function App() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!code.trim()) { alert("Please paste some code first!"); return; }
    
    try {
      const response = await fetch("https://complexity-backend-production.up.railway.app/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult(analyzeComplexity(code));
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Code Complexity Analyzer</h1>
        <p>Paste any code and instantly get Big O complexity analysis</p>
      </div>

      <div className="card">
        <label>Your Code</label>
        <textarea
          rows={15}
          placeholder="// Drop your code here...&#10;// Language doesn't matter. Complexity does. "
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button onClick={handleAnalyze}>⚡ Analyze Complexity</button>
      </div>

      {result && (
        <div className="result">
          <h2>Analysis Result</h2>
          <div className="result-grid">
            <div className="result-item">
              <span>Time Complexity</span>
              <strong>{result.time}</strong>
            </div>
            <div className="result-item">
              <span>Space Complexity</span>
              <strong>{result.space}</strong>
            </div>
          </div>
          <div className="explanation">{result.explanation}</div>
        </div>
      )}
    </div>
  );
}

export default App;