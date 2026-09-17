const fs = require('fs');

const path = 'src/components/reports/BDMReportClient.tsx';
let code = fs.readFileSync(path, 'utf8');

const newButtons = `<div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Tell AI what to reply (e.g. 'say great job but ask about hw')"
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
                          value={aiPrompt[report.id] || ''}
                          onChange={e => setAiPrompt({...aiPrompt, [report.id]: e.target.value})}
                        />
                        <button 
                          onClick={() => handleAIGenerate(report)}
                          disabled={isGenerating[report.id]}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm flex items-center gap-1 disabled:opacity-50 min-w-max"
                        >
                          <Sparkles className="w-4 h-4" /> {isGenerating[report.id] ? 'Generating...' : 'AI Reply'}
                        </button>
                        <button 
                          onClick={() => handleAutoReply(report)}
                          disabled={isGenerating[report.id]}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm flex items-center gap-1 disabled:opacity-50 min-w-max"
                        >
                          <Bot className="w-4 h-4" /> Auto Reply
                        </button>
                      </div>`;

if (!code.includes('Auto Reply')) {
  // We'll replace the block manually.
  const oldButtonsStr = `<div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Tell AI what to reply (e.g. 'say great job but ask about hw')"
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
                          value={aiPrompt[report.id] || ''}
                          onChange={e => setAiPrompt({...aiPrompt, [report.id]: e.target.value})}
                        />
                        <button 
                          onClick={() => handleAIGenerate(report)}
                          disabled={isGenerating[report.id]}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm flex items-center gap-1 disabled:opacity-50"
                        >
                          <Sparkles className="w-4 h-4" /> {isGenerating[report.id] ? 'Generating...' : 'AI Reply'}
                        </button>
                      </div>`;
  
  if (code.includes(oldButtonsStr)) {
      code = code.replace(oldButtonsStr, newButtons);
  } else {
      // regex fallback
      const regex = /<div className="flex gap-2">[\s\S]*?<Sparkles[\s\S]*?<\/button>\s*<\/div>/;
      code = code.replace(regex, newButtons.trim());
  }
}

fs.writeFileSync(path, code);
