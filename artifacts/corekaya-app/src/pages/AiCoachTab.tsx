import { useState, useEffect } from "react";
import { Sparkles, Brain, Wand2 } from "lucide-react";
import { useAskAiCoach, useGenerateSessionPlan, useGetWellnessTip } from "@workspace/api-client-react";
import { Button } from "@/components/ui/Button";

// Utility to parse basic bold formatting
function parseInlineStyles(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-navy">{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

export function AiCoachTab() {
  const [mode, setMode] = useState<"concierge" | "instructor">("concierge");
  
  // Concierge state
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'ai', text: string}[]>([]);
  
  // Instructor mode state
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [intent, setIntent] = useState("Energy & Flow");
  const [considerations, setConsiderations] = useState("");
  const [planResult, setPlanResult] = useState<string | null>(null);

  // APIs
  const askAi = useAskAiCoach();
  const generatePlan = useGenerateSessionPlan();
  const wellnessTip = useGetWellnessTip();

  const [tipText, setTipText] = useState("Taking a deep breath before starting helps center your mind.");

  useEffect(() => {
    wellnessTip.mutate({ data: { mood: "Neutral", energy: "Medium" } }, {
      onSuccess: (res) => {
        if (res?.text) setTipText(res.text);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setChatHistory(prev => [...prev, { role: 'user', text: question }]);
    
    askAi.mutate({ data: { question } }, {
      onSuccess: (res) => {
        setChatHistory(prev => [...prev, { role: 'ai', text: res.text }]);
      }
    });
    setQuestion("");
  };

  const handleGeneratePlan = () => {
    generatePlan.mutate({
      data: {
        equipment: selectedEquipment.length > 0 ? selectedEquipment : ["Mat"],
        mood: intent,
        issues: [],
        customNote: considerations
      }
    }, {
      onSuccess: (res) => {
        setPlanResult(res.text);
      }
    });
  };

  const toggleEquipment = (eq: string) => {
    setSelectedEquipment(prev => 
      prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]
    );
  };

  const EQUIPMENT_OPTIONS = ["Reformer", "Mat", "Tower", "Chair", "Magic Circle", "Weights"];
  const INTENT_OPTIONS = ["Energy & Flow", "Deep Core", "Recovery & Stretch", "Full Body Burn"];

  return (
    <div className="pb-32 min-h-screen bg-sand">
      {/* Header */}
      <div className="pt-12 px-6 pb-6 bg-white sticky top-0 z-40 border-b border-gray-100">
        <h1 className="font-serif text-3xl font-bold text-navy mb-6 flex items-center">
          AI Coach <Sparkles className="ml-2 text-orange h-6 w-6" />
        </h1>

        {/* Mode Switcher */}
        <div className="flex p-1 bg-gray-100 rounded-lg">
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'concierge' ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-navy'}`}
            onClick={() => setMode('concierge')}
          >
            Concierge
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'instructor' ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-navy'}`}
            onClick={() => setMode('instructor')}
          >
            Instructor Mode
          </button>
        </div>
      </div>

      <div className="p-6">
        {mode === 'concierge' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Daily Insight */}
            <div className="bg-navy-dark rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange/20 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center mb-4">
                <Brain className="text-orange w-5 h-5 mr-2" />
                <h3 className="font-bold text-sm tracking-widest uppercase text-orange">Daily Insight</h3>
              </div>
              <p className="text-lg font-serif leading-snug">
                {wellnessTip.isPending ? "Generating your insight..." : tipText}
              </p>
            </div>

            {/* Chat History */}
            <div className="space-y-4 mb-4">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-white border border-gray-100 ml-8 rounded-tr-sm' : 'bg-navy/5 mr-8 rounded-tl-sm'}`}>
                  {msg.role === 'ai' ? <div className="whitespace-pre-wrap">{parseInlineStyles(msg.text)}</div> : msg.text}
                </div>
              ))}
              {askAi.isPending && (
                <div className="bg-navy/5 mr-8 rounded-tl-sm p-4 rounded-2xl text-sm animate-pulse">
                  Thinking...
                </div>
              )}
            </div>

            {/* Ask Form */}
            <form onSubmit={handleAsk} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-serif font-bold text-navy mb-3">Ask the Labs</h3>
              <textarea 
                className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-navy resize-none mb-3"
                rows={3}
                placeholder="What workout should I do for lower back pain?"
                value={question}
                onChange={e => setQuestion(e.target.value)}
              />
              <Button type="submit" variant="primary" fullWidth isLoading={askAi.isPending}>
                Ask Coach
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            {planResult ? (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-in slide-in-from-bottom-4">
                <h3 className="font-serif text-xl font-bold text-navy mb-4 border-b border-gray-100 pb-4">Your Custom Plan</h3>
                <div className="prose prose-sm text-gray-700 whitespace-pre-wrap mb-6">
                  {parseInlineStyles(planResult)}
                </div>
                <Button variant="outline" fullWidth onClick={() => setPlanResult(null)}>
                  Create Another Plan
                </Button>
              </div>
            ) : (
              <>
                <section>
                  <h3 className="font-serif text-xl font-bold text-navy mb-4">Available Equipment</h3>
                  <div className="flex flex-wrap gap-2">
                    {EQUIPMENT_OPTIONS.map(eq => (
                      <button
                        key={eq}
                        onClick={() => toggleEquipment(eq)}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                          selectedEquipment.includes(eq)
                            ? "bg-navy border-navy text-white"
                            : "bg-white border-gray-200 text-gray-600 hover:border-navy/30"
                        }`}
                      >
                        {eq}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="font-serif text-xl font-bold text-navy mb-4">Session Intent</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {INTENT_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setIntent(opt)}
                        className={`p-3 rounded-xl border text-sm font-medium text-left transition-colors ${
                          intent === opt
                            ? "bg-orange/10 border-orange text-orange"
                            : "bg-white border-gray-200 text-gray-600 hover:border-orange/30"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="font-serif text-xl font-bold text-navy mb-4">Considerations</h3>
                  <textarea 
                    className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-navy resize-none"
                    rows={3}
                    placeholder="E.g. tight shoulders, prefer mostly supine exercises..."
                    value={considerations}
                    onChange={e => setConsiderations(e.target.value)}
                  />
                </section>

                <Button 
                  variant="primary" 
                  size="lg" 
                  fullWidth 
                  onClick={handleGeneratePlan}
                  isLoading={generatePlan.isPending}
                >
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Custom Plan
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}